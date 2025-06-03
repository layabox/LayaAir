import { CullingMode, IQXBVHCell, PerResData, QXLodLevel, QXRenderMask } from "./HybridSystemTemp/HyBridUtil";
import { SingletonList } from "laya/utils/SingletonList";
import { ShadowCullInfo } from "laya/d3/shadowMap/ShadowSliceData";
import { RenderListQueue } from "laya/RenderDriver/DriverCommon/RenderListQueue";
import { Camera } from "laya/d3/core/Camera";
import { FrustumCulling } from "laya/d3/graphics/FrustumCulling";
import { GCA_Config } from "./GCA_Config";
import { GCA_BatchInfoManager } from "./GCA_BatchInfoManager";

export enum GCA_BatchType {
    LittleCount = GCA_Config.MaxBatchCountLittle,
    SomeCount = GCA_Config.MaxBatchCountSome,
    QuitCount = GCA_Config.MaxBatchCountQuit,
    LargeCount = GCA_Config.MaxBatchCountLarge,
}

export enum batchInfoChangeType {
    Add = 0,
    Remove = 1,
    Update = 2
}

//规则：
//1、Ins中有两个模式 一个lodHight 一个LodLower
//2、在LodHight中，一个Ins会对应多个渲染Batch概念，在LodLower中，只会有一个Batch
//3、一个GCA_InstanceBatchRenderElement中，自带GPUComputeCull,每个GCA_InstanceBatchRenderElement中,可以一次性裁剪1024个包围盒，一次性可以裁剪多个batch
//4、GCA_InstanceBatchRenderElement中，数据是分段的 比如小于五个的batch会被放在一个GCA_InstanceBatchRenderElement中,一次性裁剪，如果batch的渲染大于5，将重新找个合适的GCA_InstanceBatchRenderElement
//5、GCA_InstanceBatchRenderElement中，裁剪结果自动绑定到IndirectBuffer中
//6、变化不大的时候，把所有的GCA_InstanceBatchRenderElement合并到GCA_BundleRenderElement中，组成渲染束
export class GCA_InsBatchAgent {

    private _loadedResID: number[] = [];
    /**未加载完成的渲染节点 */
    private _unLoadInsArray: IQXBVHCell[] = [];
    /**已加载完成的渲染节点 */
    private _forwardManager: GCA_BatchInfoManager = new GCA_BatchInfoManager();

    private _dirShadowManager: GCA_BatchInfoManager = new GCA_BatchInfoManager();
    //private _spotShadowManager: BatchInfoManager = new BatchInfoManager(); TODO

    private _lodChangeMap: Map<number, QXLodLevel> = new Map();//key为insId,value为lod等级,如果变化了需要组织batch数据的新增和删除

    private _cameraCullSingleList: SingletonList<IQXBVHCell> = new SingletonList<IQXBVHCell>();

    private _dirShadowCullSingleList: SingletonList<IQXBVHCell> = new SingletonList<IQXBVHCell>();

    //是否处理阴影
    private _hasDirShadow: boolean = false;

    constructor(hasDirShadow: boolean = true) {
        this._hasDirShadow = hasDirShadow;
        if (hasDirShadow) {
            this._dirShadowCullSingleList = new SingletonList<IQXBVHCell>();
        }
    }

    private _getNormalBatchID(ins: IQXBVHCell, elemntIdx: number, lodInfo: QXLodLevel): number {
        let batchID = ins.resId * 10000000 + ins.lightmapIndex * 100000 + (ins.flipped ? 1 : 2) * 10000 +
            ((ins.renderMask & QXRenderMask.ReceiveShadow) ? 1 : 2) * 1000 + elemntIdx * 10 + lodInfo;
        if (!PerResData._batchIDMap.has(batchID)) {
            PerResData._batchIDMap.set(batchID,
                {
                    res: PerResData.getResDataById(ins.resId),
                    islower: lodInfo,
                    elementIndex: elemntIdx,
                    isReceiveShadow: (ins.renderMask & QXRenderMask.ReceiveShadow) != 0,
                    lightmapIndex: ins.lightmapIndex,
                    flipped: ins.flipped
                });
        }
        return batchID;
    }

    private _getDirShadowBatchID(ins: IQXBVHCell, elemntIdx: number, lodInfo: QXLodLevel): number {
        let batchID = ins.resId * 10000 + (ins.flipped ? 1 : 2) * 1000 + elemntIdx * 10 + lodInfo;
        if (!PerResData._batchIDMap.has(batchID)) {
            PerResData._batchIDMap.set(batchID,
                {
                    res: PerResData.getResDataById(ins.resId),
                    islower: lodInfo,
                    elementIndex: elemntIdx,
                    isReceiveShadow: false,
                    lightmapIndex: 0,
                    flipped: ins.flipped
                });
        }
        return batchID;
    }

    /**
     * 往实际的渲染节点中塞入数据
     */
    private _addOneRenderIns(ins: IQXBVHCell, elemntIdx: number, lodInfo: QXLodLevel) {
        //塞入正常渲染
        let batchID = this._getNormalBatchID(ins, elemntIdx, lodInfo);
        this._forwardManager.addIns(ins, batchID, batchInfoChangeType.Add);

        //塞入阴影pass渲染
        if (this._hasDirShadow && (ins.renderMask & QXRenderMask.CastShadow)) {
            let batchID = this._getDirShadowBatchID(ins, elemntIdx, lodInfo);
            this._dirShadowManager.addIns(ins, batchID, batchInfoChangeType.Add);
        }
    }

    /**
     * 从实际的渲染节点中移除数据
     */
    private _removeOneRenderIns(ins: IQXBVHCell, elemntIdx: number, lodInfo: QXLodLevel) {
        //移除正常渲染
        let batchID = this._getNormalBatchID(ins, elemntIdx, lodInfo);
        this._forwardManager.addIns(ins, batchID, batchInfoChangeType.Remove);

        //移除阴影pass渲染
        if (this._hasDirShadow && (ins.renderMask & QXRenderMask.CastShadow)) {
            let batchID = this._getDirShadowBatchID(ins, elemntIdx, lodInfo);
            this._dirShadowManager.addIns(ins, batchID, batchInfoChangeType.Remove);
        }
    }

    private _updateOneRenderIns(ins: IQXBVHCell, elemntIdx: number, lodInfo: QXLodLevel) {
        //更新正常渲染
        let batchID = this._getNormalBatchID(ins, elemntIdx, lodInfo);
        this._forwardManager.addIns(ins, batchID, batchInfoChangeType.Update);

        //更新阴影pass渲染
        if (this._hasDirShadow && (ins.renderMask & QXRenderMask.CastShadow)) {
            let batchID = this._getDirShadowBatchID(ins, elemntIdx, lodInfo);
            this._dirShadowManager.addIns(ins, batchID, batchInfoChangeType.Update);
        }
    }

    /**
     * 添加一个渲染节点
     * @param insData 
     */
    private _addOneIns(insData: IQXBVHCell) {
        let lodLevel = this._lodChangeMap.get(insData.id);
        if (!lodLevel) {//判断有没有指定LodLod
            lodLevel = QXLodLevel.High;//默认高模
            this._lodChangeMap.set(insData.id, lodLevel);
        }
        if (lodLevel == QXLodLevel.High) {
            let res = PerResData.getResDataById(insData.resId);
            for (let j = 0; j < res.batchElements.length; j++) {
                this._addOneRenderIns(insData, j, QXLodLevel.High);
            }
        }
        else {
            this._addOneRenderIns(insData, 0, QXLodLevel.Lower);
        }
    }

    /**
     * 移除一个渲染节点
     * @param insData 
     */
    private _removeOneIns(insData: IQXBVHCell) {
        if (!this._lodChangeMap.has(insData.id)) {
            console.log("没有找到对应的Ins");
            return;
        }
        let lodLevel = this._lodChangeMap.get(insData.id);

        if (lodLevel == QXLodLevel.High) {
            let res = PerResData.getResDataById(insData.resId);
            for (let j = 0; j < res.batchElements.length; j++) {
                this._removeOneRenderIns(insData, j, QXLodLevel.High);
            }
        }
        else {
            this._removeOneRenderIns(insData, 0, QXLodLevel.Lower);
        }
    }

    private _updateOneIns(insData: IQXBVHCell) {
        if (!this._lodChangeMap.has(insData.id)) {
            console.log("没有找到对应的Ins");
            return;
        }

        let lodLevel = this._lodChangeMap.get(insData.id);
        if (lodLevel == QXLodLevel.High) {
            let res = PerResData.getResDataById(insData.resId);
            for (let j = 0; j < res.batchElements.length; j++) {
                this._updateOneRenderIns(insData, j, QXLodLevel.High);
            }
        }
        else {
            this._updateOneRenderIns(insData, 0, QXLodLevel.Lower);
        }
    }

    /**
     * 设置insId与lod等级的映射关系
     * @param map 
     */
    setChangeInsId2LevelList(map: Map<number, QXLodLevel>): void {
        for (let [key, value] of map) {
            if (this._lodChangeMap.has(key) && this._lodChangeMap.get(key) != value) {
                this._removeOneIns(IQXBVHCell.getInsDataById(key));
                this._lodChangeMap.set(key, value);
                this._addOneIns(IQXBVHCell.getInsDataById(key));
            }
        }
    }

    /**
     * 添加一个渲染节点
     * @param ins 
     */
    addIns(ins: IQXBVHCell): void {
        if (this._loadedResID.indexOf(ins.resId) != -1) {
            this._addOneIns(ins);
        }
        else {
            this._unLoadInsArray.push(ins);
        }
    }

    /**
     * 移除一个渲染节点
     * @param ins 
     */
    removeIns(ins: IQXBVHCell): void {
        if (this._loadedResID.indexOf(ins.resId) != -1) {
            this._removeOneIns(ins);
        }
        else {
            this._unLoadInsArray.splice(this._unLoadInsArray.indexOf(ins), 1);
        }
    }

    /**
     * 更新一个渲染节点
     * @param ins 
     */
    updateIns(ins: IQXBVHCell): void {
        if (this._loadedResID.indexOf(ins.resId) != -1) {
            this._updateOneIns(ins);
        }
    }

    /**
     * 设置裁剪相机，进行初始化裁剪
     * @param camera 
     * @returns 
     */
    setCullingCamera(camera: Camera): SingletonList<IQXBVHCell> {
        //准备所有的渲染节点
        this._cameraCullSingleList.length = 0;
        let boundFrustum = camera.boundFrustum;
        for (let i = 0; i < this._unLoadInsArray.length; i++) {
            let ins = this._unLoadInsArray[i];
            if (boundFrustum.intersects(ins.bounds)) {
                this._cameraCullSingleList.add(ins);
            }
        }
        //TODO
        //set cull Plane to GPU 
        this._forwardManager.applyChage();
        return this._cameraCullSingleList;
    }

    /**
     * 设置裁剪方向光，进行初始化裁剪
     * @param dirLight 
     * @param cullInfo 
     * @returns 
     */
    setCullingDir(cullInfo: ShadowCullInfo): SingletonList<IQXBVHCell> {
        this._dirShadowCullSingleList.length = 0;
        for (let i = 0; i < this._unLoadInsArray.length; i++) {
            let ins = this._unLoadInsArray[i];
            if ((ins.renderMask & QXRenderMask.CastShadow) && FrustumCulling.cullingRenderBounds(ins.bounds, cullInfo)) {
                this._dirShadowCullSingleList.add(ins);
            }
        }
        //TODO
        //set cull Plane to GPU 
        this._dirShadowManager.applyChage();
        return this._dirShadowCullSingleList;
    }

    /**
     * 加载完资源的接口 外部调用
     * @param resId 
     * @returns 
     */
    completeLoadRes(resId: number): void {
        //根据resId的值，找到所有的Ins
        if (this._loadedResID.indexOf(resId) != -1) {
            throw "传入了重复的资源"
        }
        this._loadedResID.push(resId);
        let insList: IQXBVHCell[] = [];
        for (let i = 0; i < this._unLoadInsArray.length; i++) {//新增渲染
            if (this._unLoadInsArray[i].resId == resId) {
                let insData = this._unLoadInsArray[i];
                this._addOneIns(insData);
            } else {
                insList.push(this._unLoadInsArray[i]);
            }
        }
        this._unLoadInsArray = insList;
    }


    /**
     * 释放资源接口 外部调用
     * @param resId 
     * @returns 
     */
    releaseRes(resId: number) {
        if (this._loadedResID.indexOf(resId) != -1) {
            this._loadedResID.splice(this._loadedResID.indexOf(resId), 1);
        }
        //TODO 释放Ins?? 按道理  逻辑层应该删除了Ins
        return;
    }

    /**
     * 将系统的渲染节点塞入渲染队列
     * @param cullMode 
     * @param opaque 
     * @param alphaTest 
     * @param transparent 
     * @param transparentAfter 
     */
    appendBatch(cullMode: CullingMode, opaque: RenderListQueue, alphaTest: RenderListQueue, transparent?: RenderListQueue, transparentAfter?: RenderListQueue) {
        //进行Gpu Cull
        //数据更新
        //
    }
}

