import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { IInstanceRenderBatch, IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { BlitQuadCMDData, DrawElementCMDData, DrawNodeCMDData, SetRenderTargetCMD, SetViewportCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebSceneRenderManager } from "../../RenderModuleData/WebModuleData/3D/WebScene3DRenderManager";
import { WebGPUSetRenderData } from "../RenderDevice/WebGPUSetRenderData";
import { WebGPUSetShaderDefine } from "../RenderDevice/WebGPUSetShaderDefine";
import { WebGPU3DRenderPass } from "./WebGPU3DRenderPass";
import { WebGPUInstanceRenderBatch } from "./WebGPUInstanceRenderBatch";
import { WebGPUInstanceRenderElement3D } from "./WebGPUInstanceRenderElement3D";
import { WebGPUBlitQuadCMDData } from "./WebGPURenderCMD/WebGPUBlitQuadCMDData";
import { WebGPUDrawElementCMDData } from "./WebGPURenderCMD/WebGPUDrawElementCMDData";
import { WebGPUDrawNodeCMDData } from "./WebGPURenderCMD/WebGPUDrawNodeCMDData";
import { WebGPUSetRenderTargetCMD } from "./WebGPURenderCMD/WebGPUSetRenderTargetCMD";
import { WebGPUSetViewportCMD } from "./WebGPURenderCMD/WebGPUSetViewportCMD";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";
import { WebGPUSkinRenderElement3D } from "./WebGPUSkinRenderElement3D";


/**
 * WebGPU渲染工厂类
 */
export class WebGPU3DRenderPassFactory implements I3DRenderPassFactory {
    // getBaseRender3DNodeBindGroup(node: WebBaseRenderNode, context: WebGPURenderContext3D, shaderInstance: WebGPUShaderInstance): WebGPUBindGroup1 {//一帧调用一次
    //     let cacheData = node._driverCacheData as WebGPUDriverRenderNodeCacheData;
    //     let recreateBindGroup: boolean = false;
    //     if (!cacheData) {
    //         cacheData = node._driverCacheData = new WebGPUDriverRenderNodeCacheData();
    //     }
    //     let bindgroup = cacheData.bindGroup.get(shaderInstance._id);
    //     let shaderInstanceID = shaderInstance._id;
    //     //处理BindGroup
    //     //判断是否要重新创建BindGroup
    //     if (!bindgroup) {
    //         recreateBindGroup = true;
    //     } else if (bindgroup.isNeedCreate(node._additionalUpdateMask)) {
    //         let strArray = cacheData.commandUniformMapArray;
    //         strArray = [];
    //         strArray = cacheData.commandUniformMapArray = strArray.concat(node._commonUniformMap, node._additionShaderDataKeys);
    //         recreateBindGroup = true;
    //     } else {
    //         for (var com of node._commonUniformMap) {
    //             if (bindgroup.isNeedCreate((node.shaderData as WebGPUShaderData)._getBindGroupLastUpdateMask(`${com}_${shaderInstanceID}`))) {
    //                 recreateBindGroup = true;
    //                 break;
    //             }
    //         }
    //         //判断AdditionalShaderData 是否要更新BindGroup
    //         if (!recreateBindGroup) {
    //             for (var addition of node._additionShaderDataKeys) {
    //                 if (bindgroup.isNeedCreate((node.additionShaderData.get(addition) as WebGPUShaderData)._getBindGroupLastUpdateMask(`${com}_${shaderInstanceID}`))) {
    //                     recreateBindGroup = true;
    //                     break;
    //                 }
    //             }
    //         }
    //     }

    //     if (recreateBindGroup) {//创建BindGroup
    //         //creat BindGroup
    //         let bindGroupArray = shaderInstance.uniformSetMap.get(2);


    //         //填充bindgroupEntriys
    //         let shaderData = node.shaderData as WebGPUShaderData;
    //         let bindgroupEntriys: GPUBindGroupEntry[] = [];
    //         for (var com of node._commonUniformMap) {
    //             shaderData.createSubUniformBuffer(com, com, ((LayaGL.renderDeviceFactory.createGlobalUniformMap(com) as WebGPUCommandUniformMap)._idata));
    //             shaderData.fillBindGroupEntry(com, `${com}_${shaderInstanceID}`, bindgroupEntriys, bindGroupArray);
    //         }
    //         for (var addition of node._additionShaderDataKeys) {
    //             let shaderdata = (node.additionShaderData.get(addition) as WebGPUShaderData);
    //             shaderdata.createSubUniformBuffer(addition, addition, ((LayaGL.renderDeviceFactory.createGlobalUniformMap(addition) as WebGPUCommandUniformMap)._idata));
    //             shaderdata.fillBindGroupEntry(addition, `${com}_${shaderInstanceID}`, bindgroupEntriys, bindGroupArray);
    //         }
    //         let groupLayout: GPUBindGroupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(bindGroupArray);
    //         let bindGroupDescriptor: GPUBindGroupDescriptor = {
    //             label: "GPUBindGroupDescriptor",
    //             layout: groupLayout,
    //             entries: bindgroupEntriys
    //         };
    //         let bindGroupgpu = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);
    //         bindgroup = new WebGPUBindGroup1();
    //         bindgroup.gpuRS = bindGroupgpu;
    //         bindgroup.createMask = Stat.loopCount;
    //         cacheData.bindGroup.set(shaderInstanceID, bindgroup);
    //     }
    //     return bindgroup;
    // }

    createInstanceBatch(): IInstanceRenderBatch {
        return new WebGPUInstanceRenderBatch();
    }
    createRender3DProcess(): IRender3DProcess {
        return new WebGPU3DRenderPass();
    }
    createRenderContext3D(): IRenderContext3D {
        return new WebGPURenderContext3D();
    }
    createRenderElement3D(): IRenderElement3D {
        return new WebGPURenderElement3D();
    }

    createInstanceRenderElement3D(): WebGPUInstanceRenderElement3D {
        return WebGPUInstanceRenderElement3D.create();
    }

    createSkinRenderElement(): ISkinRenderElement3D {
        return new WebGPUSkinRenderElement3D();
    }
    createSceneRenderManager(): ISceneRenderManager {
        return new WebSceneRenderManager();
    }
    createDrawNodeCMDData(): DrawNodeCMDData {
        return new WebGPUDrawNodeCMDData();
    }
    createBlitQuadCMDData(): BlitQuadCMDData {
        return new WebGPUBlitQuadCMDData();
    }
    createDrawElementCMDData(): DrawElementCMDData {
        return new WebGPUDrawElementCMDData();
    }
    createSetViewportCMD(): SetViewportCMD {
        return new WebGPUSetViewportCMD();
    }
    createSetRenderTargetCMD(): SetRenderTargetCMD {
        return new WebGPUSetRenderTargetCMD();
    }
    createSetRenderDataCMD(): SetRenderDataCMD {
        return new WebGPUSetRenderData();
    }
    createSetShaderDefineCMD(): SetShaderDefineCMD {
        return new WebGPUSetShaderDefine();
    }
}

Laya.addBeforeInitCallback(() => {
    if (!Laya3DRender.Render3DPassFactory)
        Laya3DRender.Render3DPassFactory = new WebGPU3DRenderPassFactory();
});