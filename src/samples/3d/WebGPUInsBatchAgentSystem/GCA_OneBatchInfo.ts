import { batchInfoChangeType, GCA_BatchType } from "./GCA_InsBatchAgent";
import { GCA_BatchRenderElement } from "./GCA_BatchRenderElement";
import { GCA_InstanceRenderElementCollect } from "./GCA_InstanceRenderElementCollect";
import { batchIDInfo, IGCABVHCell, IGCAMaterialData, GCAResData, GCARenderGeometrtElement } from "./HybridSystemTemp/HyBridUtil";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { SingletonList } from "laya/utils/SingletonList";
import { LayaGL } from "laya/layagl/LayaGL";
import { WebGPUShaderData } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUShaderData";
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D";
import { MeshTopology } from "laya/RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "laya/RenderEngine/RenderEnum/DrawType";
import { ShaderDefine } from "laya/RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { WebGPURenderGeometry } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPURenderGeometry";
import { WebGPUBufferState } from "laya/RenderDriver/WebGPUDriver/RenderDevice/WebGPUBufferState";
import { Vector4 } from "laya/maths/Vector4";
import { GCA_Config } from "./GCA_Config";

//根据渲染批次ID,记录这个批次的渲染信息
//功能块
//1、dataBlock 数据更新  根据Ins的数据和改动，更新到Collect中，并且在Collect中上传GPU
//2、根据ins的数据，判断是否需要更换Collect  包括ins的add remove update 有个潜规则是永远先remove 再add和update，逻辑在batchmanager中
//3、一个BatchInfo会生成一个InstanceRenderElement，提交给GPU渲染
export class GCA_OneBatchInfo {
    static GCA_StorageBuffer: ShaderDefine;
    static customdataStridMap: Map<string, number> = new Map();
    static customDataWholeStride: number = 0;
    static setCustomCommandmap(customAttributeData: Map<string, [number, ShaderDataType]>) {
        GCA_OneBatchInfo.customDataWholeStride = 0;
        let offset = 0;
        for (var [key, value] of customAttributeData) {
            switch (value[1]) {
                case ShaderDataType.Vector2:
                    this.customdataStridMap.set(key, offset);
                    offset += 2;
                    break;
                case ShaderDataType.Vector3:
                    this.customdataStridMap.set(key, offset);
                    offset += 3;
                    break;
                case ShaderDataType.Vector4:
                    this.customdataStridMap.set(key, offset);
                    offset += 4;
                    break;
                case ShaderDataType.Matrix4x4:
                    this.customdataStridMap.set(key, offset);
                    offset += 16;
                    break;
                case ShaderDataType.Float:
                    this.customdataStridMap.set(key, offset);
                    offset += 1;
                    break;
                case ShaderDataType.Int:
                    this.customdataStridMap.set(key, offset);
                    offset += 1;
                    break;
                case ShaderDataType.Color:
                    this.customdataStridMap.set(key, offset);
                    offset += 4;
                    break;
                default:
                    break;
            }
        }
        GCA_OneBatchInfo.customDataWholeStride = offset;
    }

    //当前的owner
    _owner: GCA_InstanceRenderElementCollect;

    private _forwardType: GCA_BatchType;//前一个批次类型

    private _aabbDataView: Float32Array;

    private _worldMatrixDataView: Float32Array;

    private _customDataView: Float32Array;

    // _inDirectDrawGeometry: IRenderGeometryElement;

    private _customStride: number;//自定义数据步长

    private _holeIndex: Array<number> = [];//空的ins索引数组,index从大到小 用来记录空洞的Ins

    private _insArray: Map<number, IGCABVHCell> = new Map<number, IGCABVHCell>();//存储实例对象 key是第几个，value是实例

    private _curNeedCull: number = 0;//最大的裁剪区域，和目前有多少个insCount并不完全一致，因为数据会有空的
    //会先收集remove  再收集add 和update，所以更新数据不会有问题
    private _chagneIndexList: SingletonList<{ index: number, type: batchInfoChangeType }> = new SingletonList();

    //需要更新所有数据到Collect
    private _isNeedUpdateAll: boolean = false;

    renderElement: GCA_BatchRenderElement;

    renderGeometry: WebGPURenderGeometry;

    private _ibCount: number = 0;
    private _ibOffset: number = 0;

    spriteShaderData3D: WebGPUShaderData;

    blockIndexInOwner: number = -1;
    //当前的ins数量
    curInsCount: number = 0;
    //最大容纳的ins数量
    maxBlockCount: GCA_BatchType;

    batchID: number;

    constructor(batchID: number) {
        this.batchID = batchID;
        this._createRenderElement();
        this.curInsCount = 0;
        this._customStride = GCA_OneBatchInfo.customDataWholeStride;
    }

    //=====================buffer Block start==========================
    //初始化数据视图，绑定到collect数据中的某个位置
    private _initDataViews() {
        if (this._owner) {
            const startIndex = this.blockIndexInOwner * this.maxBlockCount;

            // AABB数据视图 (每个实例6个float: min.xyz, max.xyz)
            this._aabbDataView = new Float32Array(this._owner.wholeAABBBuffer.buffer,
                startIndex * 8 * 4, this.maxBlockCount * 8);

            // 世界矩阵数据视图 (每个实例16个float)
            this._worldMatrixDataView = new Float32Array(this._owner.wholeWorldMatrixBuffer.buffer,
                startIndex * 16 * 4, this.maxBlockCount * 16);

            // 自定义数据视图
            if (this._customStride > 0) {
                this._customDataView = new Float32Array(this._owner.wholeCustomBuffer.buffer,
                    startIndex * this._customStride * 4, this.maxBlockCount * this._customStride);
            }
        }
    }

    //更新一个ins的aabb数据
    private _updateAABBData(index: number, isRemove: boolean, insData?: IGCABVHCell) {
        let aabbindex = index * 8;
        if (isRemove) {
            this._aabbDataView[aabbindex + 3] = 1;
        } else {
            let ins = insData ? insData : this._insArray.get(index);
            let min = ins.bounds.getMin();
            let max = ins.bounds.getMax();
            this._aabbDataView[aabbindex] = min.x;
            this._aabbDataView[aabbindex + 1] = min.y;
            this._aabbDataView[aabbindex + 2] = min.z;
            this._aabbDataView[aabbindex + 3] = ins.loadMaskRange.x;
            this._aabbDataView[aabbindex + 4] = max.x;
            this._aabbDataView[aabbindex + 5] = max.y;
            this._aabbDataView[aabbindex + 6] = max.z;
            this._aabbDataView[aabbindex + 7] = ins.loadMaskRange.y;
        }
        let ownerOffset = this.blockIndexInOwner * this.maxBlockCount * 8;
        this._owner.aabbUpdateRange.x = Math.min(this._owner.aabbUpdateRange.x, ownerOffset + aabbindex);
        this._owner.aabbUpdateRange.y = Math.max(this._owner.aabbUpdateRange.y, ownerOffset + aabbindex + 8);
    }

    //更新一个ins的世界矩阵数据
    private _updateWorldMatrixData(index: number, insData?: IGCABVHCell) {
        let worldMatrixindex = index * 16;
        let ins = insData ? insData : this._insArray.get(index);
        this._worldMatrixDataView.set(ins.worldMatrix.elements, worldMatrixindex);

        let ownerOffset = this.blockIndexInOwner * this.maxBlockCount * 16;
        this._owner.worldMatrixUpdateRange.x = Math.min(this._owner.worldMatrixUpdateRange.x, ownerOffset + worldMatrixindex);
        this._owner.worldMatrixUpdateRange.y = Math.max(this._owner.worldMatrixUpdateRange.y, ownerOffset + worldMatrixindex + 16);
    }

    //更新一个ins的自定义数据
    protected _updateCustomData(index: number, insData?: IGCABVHCell) {
        let ins = insData ? insData : this._insArray.get(index);
        let customDataindex = index * this._customStride;
        this._customDataView.set(ins.customData.customDataArray, customDataindex);

        let ownerOffset = this.blockIndexInOwner * this.maxBlockCount * this._customStride;
        this._owner.customUpdateRange.x = Math.min(this._owner.customUpdateRange.x, ownerOffset + customDataindex);
        this._owner.customUpdateRange.y = Math.max(this._owner.customUpdateRange.y, ownerOffset + customDataindex + this._customStride);
    }

    //更新这个Onebatch对应的渲染节点的indexcount和indexoffset
    private _updateIndirectDrawGeometry() {
        this._owner.wholeIndirectDrawGeometryBuffer[this.blockIndexInOwner * 5] = this._ibCount;//indexCount
        this._owner.wholeIndirectDrawGeometryBuffer[this.blockIndexInOwner * 5 + 2] = this._ibOffset;//indexOffset
        this._owner.indirectUpdateRange.x = Math.min(this._owner.indirectUpdateRange.x, this.blockIndexInOwner * 5);
        this._owner.indirectUpdateRange.y = Math.max(this._owner.indirectUpdateRange.y, this.blockIndexInOwner * 5 + 5);
    }

    //处理一个ins增加的数据
    private _insAddDataHandle(index: number) {
        //更新aabb
        this._updateAABBData(index, false);
        //更新worldMatrix
        this._updateWorldMatrixData(index);
        //更新customData
        this._updateCustomData(index);
    }

    //处理一个ins删除的数据
    private _insRemoveDataHandle(index: number) {
        //更新aabb的数据第四位为1  不进行裁剪判断
        this._updateAABBData(index, true);

    }

    //处理一个ins更新的数据
    private _insUpdateDataHandle(index: number) {
        //更新aabb
        this._updateAABBData(index, false);
        //更新worldMatrix
        this._updateWorldMatrixData(index);//是否需要更新
        //更新customData
        this._updateCustomData(index);//是否需要更新
    }

    //数据处理的总入口，会在collect中调起
    updateDataViews() {
        if (!this._isNeedUpdateAll && this._chagneIndexList.length == 0) {
            return;
        }

        if (this._isNeedUpdateAll) {
            //更新所有数据
            for (var [key, value] of this._insArray) {
                this._insAddDataHandle(key);

            }
            this._updateIndirectDrawGeometry();
            this._isNeedUpdateAll = false;
            //更新cullInsData

        } else {
            //更新部分数据
            for (let i = 0; i < this._chagneIndexList.length; i++) {
                let change = this._chagneIndexList.elements[i];
                switch (change.type) {
                    case batchInfoChangeType.Add:
                        this._insAddDataHandle(change.index);
                        break;
                    case batchInfoChangeType.Remove:
                        this._insRemoveDataHandle(change.index);
                        break;
                    case batchInfoChangeType.Update:
                        this._insUpdateDataHandle(change.index);
                        break;
                }
            }
        }
        this._chagneIndexList.length = 0;
        this._owner.setOneBlockCullCurIns(this.blockIndexInOwner, this._curNeedCull + 1);//index的最大值
    }
    //=====================buffer Block end==========================

    //=====================render Element start 关于渲染的操作==========================
    private _bindOwnerRenderData() {
        //this.spriteShaderData3D.setDeviceBuffer
        this.renderGeometry.clearRenderParams();
        this.renderGeometry.setIndirectDrawBuffer(this._owner.indirectDeviceBuffer, this.blockIndexInOwner * 5 * 4);
        this._updateIndirectDrawGeometry();
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("instances"), this._owner.worldMatrixDeviceBuffer);
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("customDatas"), this._owner.customDeviceBuffer);
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("insIndexs"), this._owner.instanceIndexDeviceBuffer);
        Vector4.TEMP.setValue(this.maxBlockCount, this.blockIndexInOwner, 0, 0);
        this.spriteShaderData3D.setVector(Shader3D.propertyNameToID("u_cullBlockData"), Vector4.TEMP);
    }

    private _unbindOwnerRenderData() {
        //TODO  移除渲染资源绑定等
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("instances"), null);
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("customDatas"), null);
        this.spriteShaderData3D.setDeviceBuffer(Shader3D.propertyNameToID("insIndexs"), null);
        this.renderGeometry.clearRenderParams();
    }

    private _createRenderElement() {
        this.renderElement = GCA_Config.factory.create_GCA_BatchRenderELement();
        let batchInfo = GCAResData._batchIDMap.get(this.batchID);
        this.spriteShaderData3D = LayaGL.renderDeviceFactory.createShaderData() as WebGPUShaderData;
        this.renderElement.renderShaderData = this.spriteShaderData3D;
        this._initShaderDataValue(batchInfo);
        this._initRenderElement(batchInfo);
    }

    protected _initRenderElement(data: batchIDInfo) {
        let preRes = data.res;
        let material: IGCAMaterialData;
        let meshGeometry: GCARenderGeometrtElement;
        if (data.islower) {
            material = preRes.lowermat;
            meshGeometry = preRes.lowerMeshGeometry;
        } else {
            let elementIndex = data.elementIndex;
            let BatchElement = preRes.batchElements[elementIndex];
            material = preRes.materials[BatchElement.matIdx];
            meshGeometry = preRes.mesh[BatchElement.subMeshIdx];
        }
        //mat bind
        this.renderElement.materialShaderData = material.shaderData as WebGPUShaderData;
        this.renderElement.subShader = material.subShader;
        this.renderElement.cullMode = material.cull;
        this.renderElement.materialRenderQueue = material.renderQueue;
        //geometry bind
        let geometry = this.renderGeometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElementIndirect) as WebGPURenderGeometry;
        geometry.bufferState = meshGeometry.bufferState as WebGPUBufferState;
        geometry.indexFormat = meshGeometry.indexFormat;
        this._ibCount = meshGeometry.indexCount;
        this._ibOffset = meshGeometry.indexOffset;
        this.renderElement.geometry = geometry as WebGPURenderGeometry;
    }

    /**
     * 继承来实现不同Sprite基于Data的数据初始化
     * @param data 
     */
    protected _initShaderDataValue(data: batchIDInfo) {
        if (data.isReceiveShadow) {
            this.spriteShaderData3D.addDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
        } else {
            this.spriteShaderData3D.removeDefine(RenderableSprite3D.SHADERDEFINE_RECEIVE_SHADOW);
        }

        this.spriteShaderData3D.addDefine(GCA_OneBatchInfo.GCA_StorageBuffer);
        //if(data.lightmapIndex) TODO
    }

    private _destroyRenderElement() {
        this.spriteShaderData3D.destroy();
        this.renderGeometry.destroy();
        this.renderElement.destroy();
    }
    //=====================render Element end==========================

    //===========add remove update以及批次分配处理 start===========

    //是否需要迁移到更小的批次
    private _needChangeLittle(): boolean {
        //判断为0
        if (this.maxBlockCount == GCA_BatchType.LittleCount) {
            return false;
        }
        if (this.curInsCount < this._forwardType) {
            return true;
        }
        return false;
    }

    //是否需要迁移到更大的批次
    private _needChangeLarger(): boolean {
        if (this.maxBlockCount == GCA_BatchType.LargeCount) {
            return false;
        }
        if (this.curInsCount > this.maxBlockCount) {
            return true;
        }
        return false;
    }

    //是否需要更换owner
    needChangeOwner() {
        return this._needChangeLittle() || this._needChangeLarger();
    }
    //更新Batch类型
    updateBatchType() {
        if (this.curInsCount <= GCA_BatchType.LittleCount) {
            this.maxBlockCount = GCA_BatchType.LittleCount;
        } else if (this.curInsCount <= GCA_BatchType.SomeCount) {
            this._forwardType = GCA_BatchType.LittleCount;
            this.maxBlockCount = GCA_BatchType.SomeCount;

        } else if (this.curInsCount <= GCA_BatchType.QuitCount) {
            this._forwardType = GCA_BatchType.SomeCount;
            this.maxBlockCount = GCA_BatchType.QuitCount;

        } else {
            this._forwardType = GCA_BatchType.QuitCount;
            this.maxBlockCount = GCA_BatchType.LargeCount;
        }
    }

    //批次中添加一个ins
    addOneIns(ins: IGCABVHCell) {
        let insertIndex = 0;
        if (this._holeIndex.length == 0) {//如果没有空洞，就插入最后，这种大概率是要换批次
            insertIndex = this.curInsCount;
            this._insArray.set(insertIndex, ins);
            this.curInsCount++;
        } else {
            insertIndex = this._holeIndex.pop();
            this._insArray.set(insertIndex, ins);
            this.curInsCount++;
        }
        this._curNeedCull = Math.max(this._curNeedCull, insertIndex);
        this._chagneIndexList.add({ index: insertIndex, type: batchInfoChangeType.Add });
    }

    //批次中删除一个ins
    removeOneIns(ins: IGCABVHCell) {
        for (var [key, value] of this._insArray) {
            if (value == ins) {
                this._chagneIndexList.add({ index: key, type: batchInfoChangeType.Remove });
                this._insArray.delete(key);
                for (let i = this._holeIndex.length - 1; i > 0; i--) {
                    if (this._holeIndex[i] > key) {
                        this._holeIndex.splice(i + 1, 0, key);//保持从大到小的数组
                    }
                }
                this.curInsCount--;
            }
        }
    }

    //更新一个ins的数据
    updateOneIns(ins: IGCABVHCell) {
        for (var [key, value] of this._insArray) {
            if (value == ins) {
                this._chagneIndexList.add({ index: key, type: batchInfoChangeType.Update });
            }
        }
    }

    //从collect中移除的操作
    removeSelfFromOwner(): void {
        if (this._owner && this.blockIndexInOwner !== -1) {
            this._owner.releaseOneBatchInfo(this);
            this._unbindOwnerRenderData();
            this._owner = null;
            this._aabbDataView = null;
            this._worldMatrixDataView = null;
            this._customDataView = null;
            this.blockIndexInOwner = -1;

        }
    }

    //添加到Collect的时候的操作
    setOwner(owner: GCA_InstanceRenderElementCollect, index: number) {
        if (this._owner)
            return;
        this._owner = owner;
        this.blockIndexInOwner = index;
        this._initDataViews();
        this._isNeedUpdateAll = true;
        this._bindOwnerRenderData();//更新渲染数据
    }

    //销毁
    destroy() {
        this._owner = null;
        this._insArray.clear();
        this._holeIndex.length = 0;
        this._chagneIndexList.clean();
        this._aabbDataView = null;
        this._worldMatrixDataView = null;
        this._customDataView = null;
        this._unbindOwnerRenderData();//移除collect的渲染数据绑定
        this._destroyRenderElement();
    }
    //===========add remove update以及批次分配处理 end===========
}
