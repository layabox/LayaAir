import { Vector2 } from "laya/maths/Vector2";
import { SingletonList } from "laya/utils/SingletonList";
import { GCA_Config } from "./GCA_Config";
import { GCA_BatchType, batchInfoChangeType } from "./GCA_InsBatchAgent";
import { IQXBVHCell } from "./HybridSystemTemp/HyBridUtil";
import { GCA_InstanceRenderElementCollect } from "./GCA_InstanceRenderElementCollect";
import { GCA_OneBatchInfo } from "./GCA_OneBatchInfo";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { ShaderData } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
export type batchInfoChangeInfo = {
    ins: IQXBVHCell,
    batchID: number,
    changeType: batchInfoChangeType
}

//渲染批次管理器
export class GCA_BatchInfoManager {

    _batchInfoMaps: Map<number, GCA_OneBatchInfo> = new Map();//key为batchID，value为batch渲染对应的数据

    _cacheInsIdBatchID: Map<number, number> = new Map();//key为insId,value为batchID;

    _removeList: SingletonList<batchInfoChangeInfo> = new SingletonList<batchInfoChangeInfo>();
    _changeList: SingletonList<batchInfoChangeInfo> = new SingletonList<batchInfoChangeInfo>();

    _littleHoleData: Vector2 = new Vector2(0, 0);
    _littleElementCollects: GCA_InstanceRenderElementCollect[] = [];

    _someHoleData: Vector2 = new Vector2(0, 0);
    _someElementCollects: GCA_InstanceRenderElementCollect[] = [];

    _quitHoleData: Vector2 = new Vector2(0, 0);
    _quitCountElementCollects: GCA_InstanceRenderElementCollect[] = [];

    _largeElementCollects: GCA_InstanceRenderElementCollect[] = [];

    _computeCommandBuffer: ComputeCommandBuffer;
    _cullShaderData: ShaderData;

    constructor() {
        this._computeCommandBuffer = new ComputeCommandBuffer();
        this._cullShaderData = new ShaderData();
    }

    //查找是否可以插入一个批次信息
    private _findCollect(collectArray: GCA_InstanceRenderElementCollect[], oneBatchInfo: GCA_OneBatchInfo): boolean {
        for (var i = 0; i < collectArray.length; i++) {
            let collect = collectArray[i];
            if (collect.canInsertOneBatchInfo()) {
                collect.insertOneBatchInfo(oneBatchInfo);
                return true;
            }
        }
        return false;
    }

    //分配OneBatchInfo
    private _patchCollect(oneBatchInfo: GCA_OneBatchInfo) {
        if (oneBatchInfo.maxBlockCount == GCA_BatchType.LittleCount) {
            if (this._findCollect(this._littleElementCollects, oneBatchInfo)) {
                let collect = new GCA_InstanceRenderElementCollect(GCA_BatchType.LittleCount);
                collect.setCullShaderData(this._cullShaderData);
                collect.insertOneBatchInfo(oneBatchInfo);
                this._littleElementCollects.push(collect);
                this._littleHoleData.y += (GCA_Config.MaxBatchComputeCount / GCA_BatchType.LittleCount) | 0;
            } else {
                this._littleHoleData.x++;
            }
        }
        else if (oneBatchInfo.maxBlockCount == GCA_BatchType.SomeCount) {
            if (this._findCollect(this._someElementCollects, oneBatchInfo)) {
                let collect = new GCA_InstanceRenderElementCollect(GCA_BatchType.SomeCount);
                collect.setCullShaderData(this._cullShaderData);
                collect.insertOneBatchInfo(oneBatchInfo);
                this._someElementCollects.push(collect);
                this._someHoleData.y += (GCA_Config.MaxBatchComputeCount / GCA_BatchType.SomeCount) | 0;
            } else {
                this._someHoleData.x++;
            }
        }
        else if (oneBatchInfo.maxBlockCount == GCA_BatchType.QuitCount) {
            if (this._findCollect(this._quitCountElementCollects, oneBatchInfo)) {
                let collect = new GCA_InstanceRenderElementCollect(GCA_BatchType.QuitCount);
                collect.insertOneBatchInfo(oneBatchInfo);
                this._quitCountElementCollects.push(collect);
                this._quitHoleData.y += (GCA_Config.MaxBatchComputeCount / GCA_BatchType.QuitCount) | 0
            } else {
                this._quitHoleData.x++;
            }
        }
        else {
            let collect = new GCA_InstanceRenderElementCollect(GCA_BatchType.LargeCount);
            collect.insertOneBatchInfo(oneBatchInfo);
            this._largeElementCollects.push(collect);
        } ``
    }

    //type 1 新增 ，-1 删除 2 更新
    addIns(ins: IQXBVHCell, batchID: number, changeType: batchInfoChangeType) {
        if (changeType == batchInfoChangeType.Remove) {
            this._removeList.add({ ins, batchID, changeType });
        }
        else {
            this._changeList.add({ ins, batchID, changeType });
        }
    }

    setCullPlanes(cullDatas: Float32Array) {
        this._cullShaderData.setBuffer(Shader3D.propertyNameToID("cullPlanes"), cullDatas);
    }

    //这里发起所有数据的改动
    applyChage() {
        //最后清理所有的数据
        let changeOneBatchInfo: GCA_OneBatchInfo[] = [];
        let newOneBatchInfo: GCA_OneBatchInfo[] = [];

        //先处理删除
        for (let i = 0; i < this._removeList.length; i++) {
            let changeInfo = this._removeList.elements[i];
            let batchInfo = this._batchInfoMaps.get(changeInfo.batchID);
            if (batchInfo) {
                if (changeOneBatchInfo.indexOf(batchInfo) == -1) {
                    changeOneBatchInfo.push(batchInfo);
                }
                batchInfo.removeOneIns(changeInfo.ins);
            }
        }
        //再处理add 和update
        for (let i = 0; i < this._changeList.length; i++) {
            let changeInfo = this._changeList.elements[i];
            let batchInfo = this._batchInfoMaps.get(changeInfo.batchID);
            if (batchInfo) {
                if (changeOneBatchInfo.indexOf(batchInfo) == -1 || newOneBatchInfo.indexOf(batchInfo) != -1) {
                    changeOneBatchInfo.push(batchInfo);
                }
                switch (changeInfo.changeType) {
                    case batchInfoChangeType.Add:
                        batchInfo.addOneIns(changeInfo.ins);
                        break;
                    case batchInfoChangeType.Update:
                        batchInfo.updateOneIns(changeInfo.ins);
                        break;
                }
            }
            else {
                batchInfo = new GCA_OneBatchInfo(changeInfo.batchID);
                newOneBatchInfo.push(batchInfo);
                this._batchInfoMaps.set(changeInfo.batchID, batchInfo);
                if (changeInfo.changeType == batchInfoChangeType.Add) {
                    batchInfo.addOneIns(changeInfo.ins);
                }
            }
        }
        this._changeList.length = 0;

        //处理数量变化的OneBatchInfo
        for (let i = 0; i < changeOneBatchInfo.length; i++) {
            let oneBatchInfo = changeOneBatchInfo[i];
            if (oneBatchInfo.needChangeOwner()) {//
                switch (oneBatchInfo.maxBlockCount) {
                    case GCA_BatchType.LittleCount:
                        this._littleHoleData.x--;
                        break;
                    case GCA_BatchType.SomeCount:
                        this._someHoleData.x--;
                        break;
                    case GCA_BatchType.QuitCount:
                        this._quitHoleData.x--;
                        break;
                }
                if (oneBatchInfo.maxBlockCount != GCA_BatchType.LargeCount) {
                    oneBatchInfo.removeSelfFromOwner();
                } else {
                    throw "还没处理 一下把几千个一起删掉的情况"
                }


                if (oneBatchInfo.curInsCount > 0) {
                    newOneBatchInfo.push(oneBatchInfo)
                }
            }
        }

        //重新需要分配的OneBatchInfo
        for (let i = 0; i < newOneBatchInfo.length; i++) {
            let oneBatchInfo = newOneBatchInfo[i];
            if (oneBatchInfo.curInsCount > 0) {
                oneBatchInfo.updateBatchType();
                this._patchCollect(oneBatchInfo);
            }
        }

        //TODO 根据不同type的填充比  进行压缩数据
        if (this._littleHoleData.x / this._littleHoleData.y < GCA_Config.LittleGCValue) {
            //根据changeList中的数据，进行批次的更新
            //GC Little TODO
        }
        else if (this._someHoleData.x / this._someHoleData.y < GCA_Config.SomeGCValue) {
            //GC Some TODO
        }
        else if (this._quitHoleData.x / this._quitHoleData.y < GCA_Config.QuitGCValue) {
            //GC Quit TODO
        }


        //dispatch compute Shader
        this._computeCommandBuffer.clearCMDs();
        for (let i = 0; i < this._largeElementCollects.length; i++) {
            let collect = this._largeElementCollects[i];
            collect.uploadDataToGPU();
            collect.insertComputeCommand(this._computeCommandBuffer);
        }
        for (let i = 0; i < this._quitCountElementCollects.length; i++) {
            let collect = this._quitCountElementCollects[i];
            collect.uploadDataToGPU();
            collect.insertComputeCommand(this._computeCommandBuffer);
        }
        for (let i = 0; i < this._someElementCollects.length; i++) {
            let collect = this._someElementCollects[i];
            collect.uploadDataToGPU();
            collect.insertComputeCommand(this._computeCommandBuffer);
        }

        for (let i = 0; i < this._littleElementCollects.length; i++) {
            let collect = this._littleElementCollects[i];
            collect.uploadDataToGPU();
            collect.insertComputeCommand(this._computeCommandBuffer);
        }
        this._computeCommandBuffer.executeCMDs();
    }

    appendBatch() {
        //add Render List
    }
}
