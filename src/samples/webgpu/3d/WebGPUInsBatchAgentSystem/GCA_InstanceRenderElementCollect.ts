import { WebGPUDeviceBuffer } from "laya/RenderDriver/WebGPUDriver/RenderDevice/compute/WebGPUStorageBuffer";
import { GCA_BatchType } from "./GCA_InsBatchAgent";
import { GCA_OneBatchInfo } from "./GCA_OneBatchInfo";
import { Vector2 } from "laya/maths/Vector2";
import { GCA_Config } from "./GCA_Config";
import { EDeviceBufferUsage } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
import { LayaGL } from "laya/layagl/LayaGL";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderData } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { IDefineDatas } from "laya/RenderDriver/RenderModuleData/Design/IDefineDatas";
import { Vector3 } from "laya/maths/Vector3";
import { GCA_CullComputeShader } from "./GCA_CullComputeShader";
import { GCA_BatchBundleElement } from "./GCA_BundleRenderElement";
const LargeData: number = 100000000;

export class GCA_InstanceRenderElementCollect {

    //=============== 对象池系统 start ===============
    // 不同批次类型的对象池
    static _poolMap: Map<GCA_BatchType, GCA_InstanceRenderElementCollect[]> = new Map();

    /**
     * 从对象池获取实例
     * @param blockCount 批次类型
     * @returns GCA_InstanceRenderElementCollect实例
     */
    static getFromPool(blockCount: GCA_BatchType): GCA_InstanceRenderElementCollect {
        let pool = GCA_InstanceRenderElementCollect._poolMap.get(blockCount);
        if (!pool) {
            pool = [];
            GCA_InstanceRenderElementCollect._poolMap.set(blockCount, pool);
        }

        if (pool.length > 0) {
            const instance = pool.pop()!;
            // 重置实例状态
            instance._resetForReuse();
            return instance;
        }

        // 池为空时创建新实例
        return new GCA_InstanceRenderElementCollect(blockCount);
    }

    /**
     * 将实例归还到对象池
     * @param instance 要归还的实例
     */
    static releaseToPool(instance: GCA_InstanceRenderElementCollect): void {
        if (!instance) return;

        const pool = GCA_InstanceRenderElementCollect._poolMap.get(instance.blockCount);
        if (!pool) return;


        pool.push(instance);
    }

    /**
     * 重置实例状态以供复用
     */
    private _resetForReuse(): void {
        this.curBlockCount = 0;
        this.renderElementArray.clear();

        // 重置更新范围
        this.clearBufferUpdateRange.setValue(LargeData, -LargeData);
        this.aabbUpdateRange.setValue(LargeData, -LargeData);
        this.instanceIndexUpdateRange.setValue(LargeData, -LargeData);
        this.indirectUpdateRange.setValue(LargeData, -LargeData);
        this.worldMatrixUpdateRange.setValue(LargeData, -LargeData);
        this.customUpdateRange.setValue(LargeData, -LargeData);

        // 重置空洞索引数组
        this._holeIndex.length = 0;
        for (let i = 0; i < this.maxBlockCount; i++) {
            this._holeIndex[i] = this.maxBlockCount - i - 1;
        }
    }

    //=============== 对象池系统 end ===============

    private _clearBufferShader: ComputeShader;

    private _holeIndex: Array<number> = [];//空的Block索引数组,index从大到小

    blockCount: GCA_BatchType;//一个数据块里面能容纳的ins数量

    maxBlockCount: number;//最大容纳的Block数量

    curBlockCount: number = 0;//当前Block数量

    //=========== GPUBuffer Start 属性=============
    //clear Buffer
    private cullCurInsNumberData: Uint32Array;
    clearBufferDeviceBuffer: WebGPUDeviceBuffer;
    clearBufferUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);

    //裁剪AABB的包围盒 --只用来裁剪用
    // struct AABB {
    //     min: vec4<f32>,//最后一位是1的化 直接判定为裁剪false
    //     max: vec4<f32>,
    // }
    wholeAABBBuffer: Float32Array;
    aabbDeviceBuffer: WebGPUDeviceBuffer;
    aabbUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);


    //InstanceIndexBuffer --裁剪和渲染使用  
    // 分给OneBatch来填写
    // struct CulledInstances {
    //       indirectIndex: u32,
    //       curInsCount:u32,//当前组内实例数量,必须小于splitCount
    //       instancesIndexArray: array<u32>,//裁剪通过的id放入这里
    // }
    wholeInstanceIndexBuffer: Uint32Array;
    instanceIndexDeviceBuffer: WebGPUDeviceBuffer;
    instanceIndexUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);

    //IndirectDraw Geometry Buffer 裁剪和drawGeometry的时候使用 
    // 分给OneBatch来填写
    // struct IndirectArgs {
    //   drawCount: u32,
    //   instanceCount: atomic<u32>,//instance渲染几个
    //   reserved0: u32,
    //   reserved1: u32,
    //   reserved2: u32,
    // }
    wholeIndirectDrawGeometryBuffer: Uint32Array;
    indirectDeviceBuffer: WebGPUDeviceBuffer;
    indirectUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);

    //WorldMatrixBuffer --渲染使用
    // 分给OneBatch来填写
    wholeWorldMatrixBuffer: Float32Array;
    worldMatrixDeviceBuffer: WebGPUDeviceBuffer;
    worldMatrixUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);

    //CustomBuffer --渲染使用
    // 分给OneBatch来填写
    wholeCustomBuffer: Float32Array;
    customDeviceBuffer: WebGPUDeviceBuffer;
    customUpdateRange: Vector2 = new Vector2(LargeData, -LargeData);

    //=========== GPUBuffer 属性 End=============

    //===========Compute Cull 属性 start==========
    private _shaderList: ShaderData[] = [];
    private _deviceBuffer: ShaderData;

    private _computeShader: ComputeShader;

    private _shaderDefine: IDefineDatas;

    private _dispartchParams: Vector3 = new Vector3();
    private _clearBufferDispartchParams: Vector3 = new Vector3();

    private _cullShaderData: ShaderData;
    //=============compute Cull 属性 End =========

    renderElementArray: Map<number, GCA_OneBatchInfo> = new Map();//GCA_InstanceRenderElementCollect

    opaqueRenderBundleElement: GCA_BatchBundleElement;
    alphaTestRenderBundleElement: GCA_BatchBundleElement;

    constructor(blockCount: GCA_BatchType) {
        this.blockCount = blockCount;
        this.curBlockCount = 0;
        this.maxBlockCount = (GCA_Config.MaxBatchComputeCount / blockCount) | 0;
        this._holeIndex = new Array(this.maxBlockCount);
        for (let i = 0; i < this.maxBlockCount; i++) {
            this._holeIndex[i] = this.maxBlockCount - i - 1;
        }
        this._createBufferAndData();
        if (!this._clearBufferShader) {
            this._clearBufferShader = GCA_CullComputeShader.clearBufferComputeShaderInit(this.blockCount);
        }
        this.initComputeCommand();
        this._dispartchParams = new Vector3((GCA_Config.MaxBatchComputeCount / GCA_Config.CULLING_WORKGROUP_SIZE) | 0, 1, 1);
        this._clearBufferDispartchParams = new Vector3(this.maxBlockCount, 1, 1);
        if (GCA_Config.EnableRenderBundle && blockCount != GCA_BatchType.LargeCount) {
            this.opaqueRenderBundleElement = GCA_Config.factory.create_GCA_BundleRenderElement();
            this.opaqueRenderBundleElement.materialRenderQueue = 2000;
            this.alphaTestRenderBundleElement = GCA_Config.factory.create_GCA_BundleRenderElement();
            this.alphaTestRenderBundleElement.materialRenderQueue = 2500;
        }
    }
    //=========== OneBatchInfo 操作 start =============
    //是否可以插入一个裁剪批次
    canInsertOneBatchInfo(): boolean {
        return this._holeIndex.length > 0;
    }

    //插入一个裁剪批次
    insertOneBatchInfo(oneBatchInfo: GCA_OneBatchInfo): void {
        //更新CPU数据
        let insertIndex = this._holeIndex.pop();
        oneBatchInfo.setOwner(this, insertIndex);//更新数据到collect
        this.renderElementArray.set(insertIndex, oneBatchInfo);
        if (oneBatchInfo.renderElement.materialRenderQueue < 2500 && this.opaqueRenderBundleElement) {
            this.opaqueRenderBundleElement.addrenderElement(oneBatchInfo.renderElement);
        } else if (this.alphaTestRenderBundleElement) {
            this.alphaTestRenderBundleElement.addrenderElement(oneBatchInfo.renderElement);
        }
    }

    //释放一个裁剪批次
    releaseOneBatchInfo(oneBatchInfo: GCA_OneBatchInfo): void {
        let bockIndex = oneBatchInfo.blockIndexInOwner;
        if (this._holeIndex.length == 0 || this._holeIndex[this._holeIndex.length - 1] > bockIndex) {
            this._holeIndex.push(bockIndex);
        } else {
            for (let i = this._holeIndex.length - 1; i >= 0; i--) {
                if (this._holeIndex[i] > bockIndex) {
                    this._holeIndex.splice(i + 1, 0, bockIndex);//保持从大到小的数组
                    break;
                }
                if (i == 0) {
                    this._holeIndex.splice(0, 0, bockIndex);
                }
            }
        }


        this.renderElementArray.delete(bockIndex);
        if (oneBatchInfo.renderElement.materialRenderQueue < 2500 && this.opaqueRenderBundleElement) {
            this.opaqueRenderBundleElement.removerenderElement(oneBatchInfo.renderElement);
        } else if (this.alphaTestRenderBundleElement) {
            this.alphaTestRenderBundleElement.removerenderElement(oneBatchInfo.renderElement);
        }
        this.setOneBlockCullCurIns(bockIndex, 0);
    }

    //设置一个BatchInfo的cull数量，超过自认为没有裁剪成功
    setOneBlockCullCurIns(blockIndex: number, value: number) {

        this.cullCurInsNumberData[blockIndex] = value;
        if (blockIndex < this.clearBufferUpdateRange.x) {
            this.clearBufferUpdateRange.x = blockIndex;
        }
        if (blockIndex > this.clearBufferUpdateRange.y) {
            this.clearBufferUpdateRange.y = blockIndex;
        }
    }
    //=========== OneBatchInfo 操作 end =============

    //=========== compute 操作 Start =============
    //设置compute cull所需的资源 BatchManager中设置
    setCullShaderData(data: ShaderData) {
        this._cullShaderData = data;
        this._shaderList[0] = this._cullShaderData;
    }

    //初始化computeShader
    initComputeCommand() {
        this._shaderList.length = 2;

        this._computeShader = GCA_CullComputeShader.computeshaderCodeInit(this.blockCount);

        let shaderData1 = this._deviceBuffer = LayaGL.renderDeviceFactory.createShaderData();
        {
            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("aabbs"), this.aabbDeviceBuffer);
            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("culled"), this.instanceIndexDeviceBuffer);
            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("indirectArgs"), this.indirectDeviceBuffer);
            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("clearBuffer"), this.clearBufferDeviceBuffer);
        }
        this._shaderList[1] = this._deviceBuffer;
        this._shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
    }

    //将Compute命令加入到ComputeCommandBuffer中，最后apply变可生效结果
    insertComputeCommand(compute: ComputeCommandBuffer) {
        // clear Buffer 的操作TODO
        compute.addDispatchCommand(this._clearBufferShader, "computeMain", this._shaderDefine, [this._deviceBuffer], this._clearBufferDispartchParams)
        compute.addDispatchCommand(this._computeShader, "computeMain", this._shaderDefine, this._shaderList, this._dispartchParams);
    }
    //=========== compute 操作 end =============

    //=========== GPUBuffer 操作 Start =============
    //初始化 Buffer数据以及GPU Device数据
    private _createBufferAndData() {
        this.cullCurInsNumberData = new Uint32Array(this.maxBlockCount);
        this.clearBufferDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC) as WebGPUDeviceBuffer;
        this.clearBufferDeviceBuffer.setDataLength(this.maxBlockCount * 4);

        //aabb
        this.aabbDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC) as WebGPUDeviceBuffer;
        this.aabbDeviceBuffer.setDataLength((GCA_Config.MaxBatchComputeCount * 8) * 4);
        this.wholeAABBBuffer = new Float32Array((GCA_Config.MaxBatchComputeCount * 8));

        //instanceIndex
        this.instanceIndexDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC) as WebGPUDeviceBuffer;
        this.instanceIndexDeviceBuffer.setDataLength((this.maxBlockCount * (this.blockCount + 2)) * 4);
        this.wholeInstanceIndexBuffer = new Uint32Array((this.maxBlockCount * (this.blockCount + 2)));
        for (var i = 0; i < this.maxBlockCount; i++) {
            this.wholeInstanceIndexBuffer[i * (this.blockCount + 2)] = i;
        }
        this.instanceIndexDeviceBuffer.setData(this.wholeInstanceIndexBuffer, 0, 0, this.wholeInstanceIndexBuffer.byteLength)


        //indirectDrawGeometry
        this.indirectDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.INDIRECT | EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST) as WebGPUDeviceBuffer;
        this.indirectDeviceBuffer.setDataLength(this.maxBlockCount * 5 * 4);
        this.wholeIndirectDrawGeometryBuffer = new Uint32Array(this.maxBlockCount * 5);

        //worldMatrix
        this.worldMatrixDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST) as WebGPUDeviceBuffer;
        this.worldMatrixDeviceBuffer.setDataLength(GCA_Config.MaxBatchComputeCount * 16 * 4);
        this.wholeWorldMatrixBuffer = new Float32Array(GCA_Config.MaxBatchComputeCount * 16);

        //customBuffer
        this.customDeviceBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC) as WebGPUDeviceBuffer;
        this.customDeviceBuffer.setDataLength(GCA_Config.MaxBatchComputeCount * GCA_OneBatchInfo.customDataWholeStride * 4);
        this.wholeCustomBuffer = new Float32Array(GCA_Config.MaxBatchComputeCount * GCA_OneBatchInfo.customDataWholeStride);
    }

    //根据 batchInfo的改动  更新DeviceBuffer数据  这些数据用来Cull 和Draw
    uploadDataToGPU() {
        for (var [key, value] of this.renderElementArray) {
            value.updateDataViews();
        }
        //更新所有的
        if (this.clearBufferUpdateRange.x <= this.clearBufferUpdateRange.y) {
            this.clearBufferDeviceBuffer.setData(this.cullCurInsNumberData, 0, 0, this.maxBlockCount * 4);
            this.clearBufferUpdateRange.x = LargeData;
            this.clearBufferUpdateRange.y = -LargeData;
        }
        //上传数据到GPU
        if (this.aabbUpdateRange.x < this.aabbUpdateRange.y) {
            this.aabbDeviceBuffer.setData(
                this.wholeAABBBuffer,
                this.aabbUpdateRange.x * 4,
                this.aabbUpdateRange.x * 4,
                (this.aabbUpdateRange.y - this.aabbUpdateRange.x) * 4
            );
            this.aabbUpdateRange.x = LargeData;
            this.aabbUpdateRange.y = -LargeData;
        }

        // //indirectBuffer update 有些是在Computeshader中更新的
        // if (this.instanceIndexUpdateRange.x < this.instanceIndexUpdateRange.y) {
        //     this.instanceIndexDeviceBuffer.setData(
        //         this.wholeInstanceIndexBuffer,
        //         this.instanceIndexUpdateRange.x * 4,
        //         this.instanceIndexUpdateRange.x * 4,
        //         (this.instanceIndexUpdateRange.y - this.instanceIndexUpdateRange.x) * 4
        //     );
        //     this.instanceIndexUpdateRange.x = LargeData;
        //     this.instanceIndexUpdateRange.y = -LargeData;
        // }

        //indirectBuffer update 有些是在Computeshader中更新的
        if (this.indirectUpdateRange.x < this.indirectUpdateRange.y) {
            this.indirectDeviceBuffer.setData(
                this.wholeIndirectDrawGeometryBuffer,
                this.indirectUpdateRange.x * 4,
                this.indirectUpdateRange.x * 4,
                (this.indirectUpdateRange.y - this.indirectUpdateRange.x) * 4
            );
            this.indirectUpdateRange.x = LargeData;
            this.indirectUpdateRange.y = -LargeData;
        }

        if (this.worldMatrixUpdateRange.x < this.worldMatrixUpdateRange.y) {
            this.worldMatrixDeviceBuffer.setData(
                this.wholeWorldMatrixBuffer,
                this.worldMatrixUpdateRange.x * 4,
                this.worldMatrixUpdateRange.x * 4,
                (this.worldMatrixUpdateRange.y - this.worldMatrixUpdateRange.x) * 4
            );
            this.worldMatrixUpdateRange.x = LargeData;
            this.worldMatrixUpdateRange.y = -LargeData;
        }
        if (this.customUpdateRange.x < this.customUpdateRange.y) {
            this.customDeviceBuffer.setData(
                this.wholeCustomBuffer,
                this.customUpdateRange.x * 4,
                this.customUpdateRange.x * 4,
                (this.customUpdateRange.y - this.customUpdateRange.x) * 4
            );
            this.customUpdateRange.x = LargeData;
            this.customUpdateRange.y = -LargeData;
        }
    }

    destroy() {

        this.clearBufferUpdateRange = null
        this.clearBufferDeviceBuffer.destroy();
        this.cullCurInsNumberData = null

        this.wholeAABBBuffer = null;
        this.aabbDeviceBuffer.destroy();
        this.aabbUpdateRange = null;

        this.wholeInstanceIndexBuffer = null;
        this.instanceIndexDeviceBuffer.destroy();
        this.instanceIndexUpdateRange = null;

        this.wholeIndirectDrawGeometryBuffer = null;
        this.indirectDeviceBuffer.destroy();
        this.indirectUpdateRange = null;

        this.wholeWorldMatrixBuffer = null;
        this.worldMatrixDeviceBuffer.destroy()
        this.worldMatrixUpdateRange = null;

        this.wholeCustomBuffer = null;
        this.customDeviceBuffer.destroy();
        this.customUpdateRange = null;

        this.renderElementArray.clear();
        this.renderElementArray = null;

        this.opaqueRenderBundleElement && this.opaqueRenderBundleElement.destroy();
        this.alphaTestRenderBundleElement && this.alphaTestRenderBundleElement.destroy();
    }
    //=========== GPUBuffer 操作 end =============
}