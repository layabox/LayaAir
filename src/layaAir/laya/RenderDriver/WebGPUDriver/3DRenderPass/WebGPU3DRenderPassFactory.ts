import { Laya } from "../../../../Laya";
import { Laya3DRender } from "../../../d3/RenderObjs/Laya3DRender";
import { SceneRenderManagerOBJ } from "../../../d3/core/scene/SceneRenderManagerOBJ";
import { WebGPUInstanceRenderBatch } from "./WebGPUInstanceRenderBatch";
import { IInstanceRenderBatch, IRender3DProcess, IRenderContext3D, IRenderElement3D, ISkinRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { I3DRenderPassFactory } from "../../DriverDesign/3DRenderPass/I3DRenderPassFactory";
import { DrawNodeCMDData, BlitQuadCMDData, DrawElementCMDData, SetViewportCMD, SetRenderTargetCMD } from "../../DriverDesign/3DRenderPass/IRender3DCMD";
import { ISceneRenderManager } from "../../DriverDesign/3DRenderPass/ISceneRenderManager";
import { WebGPU3DRenderPass } from "./WebGPU3DRenderPass";
import { WebGPUInstanceRenderElement3D } from "./WebGPUInstanceRenderElement3D";
import { WebGPUBlitQuadCMDData } from "./WebGPURenderCMD/WebGPUBlitQuadCMDData";
import { WebGPUDrawElementCMDData } from "./WebGPURenderCMD/WebGPUDrawElementCMDData";
import { WebGPUDrawNodeCMDData } from "./WebGPURenderCMD/WebGPUDrawNodeCMDData";
import { WebGPUSetRenderData } from "../RenderDevice/WebGPUSetRenderData";
import { WebGPUSetRenderTargetCMD } from "./WebGPURenderCMD/WebGPUSetRenderTargetCMD";
import { WebGPUSetShaderDefine } from "../RenderDevice/WebGPUSetShaderDefine";
import { WebGPUSetViewportCMD } from "./WebGPURenderCMD/WebGPUSetViewportCMD";
import { WebGPURenderContext3D } from "./WebGPURenderContext3D";
import { WebGPURenderElement3D } from "./WebGPURenderElement3D";
import { WebGPUSkinRenderElement3D } from "./WebGPUSkinRenderElement3D";
import { SetRenderDataCMD, SetShaderDefineCMD } from "../../DriverDesign/RenderDevice/IRenderCMD";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebGPUBindGroup, WebGPUBindGroupHelper } from "../RenderDevice/WebGPUBindGroupHelper";
import { WebGPUShaderData } from "../RenderDevice/WebGPUShaderData";
import { WebGPURenderEngine } from "../RenderDevice/WebGPURenderEngine";
import { Stat } from "../../../utils/Stat";
import { LayaGL } from "../../../layagl/LayaGL";
import { WebGPUCommandUniformMap } from "../RenderDevice/WebGPUCommandUniformMap";

export class WebGPUDriverRenderNodeCacheData {
    bindGroup: WebGPUBindGroup;
    commandUniformMapArray: string[] = [];
}

/**
 * WebGPU渲染工厂类
 */
export class WebGPU3DRenderPassFactory implements I3DRenderPassFactory {
    updateRenderNode(node: WebBaseRenderNode, context: WebGPURenderContext3D): void {//一帧调用一次
        let cacheData = node._driverCacheData as WebGPUDriverRenderNodeCacheData;
        let recreateBindGroup: boolean = false;
        if (!cacheData) {
            cacheData = node._driverCacheData = new WebGPUDriverRenderNodeCacheData();
        }
        //处理BindGroup
        //判断是否要重新创建BindGroup
        if (!cacheData.bindGroup || cacheData.bindGroup.isNeedCreate(node._additionalUpdateMask)) {//Additional 是否改变 即ShaderData是否改变了

            let strArray = cacheData.commandUniformMapArray;
            strArray = [];
            strArray = cacheData.commandUniformMapArray = strArray.concat(node._commonUniformMap, node._additionShaderDataKeys);
            recreateBindGroup = true;
        } else {//ShaderData中的纹理资源是否改变了
            //判断SpriteShaderData
            for (var com of node._commonUniformMap) {
                if (cacheData.bindGroup.isNeedCreate((node.shaderData as WebGPUShaderData)._getBindGroupLastUpdateMask(com))) {
                    recreateBindGroup = true;
                    break;
                }
            }
            //判断AdditionalShaderData 是否要更新BindGroup
            if (!recreateBindGroup) {
                for (var addition of node._additionShaderDataKeys) {
                    if (cacheData.bindGroup.isNeedCreate((node.additionShaderData.get(addition) as WebGPUShaderData)._getBindGroupLastUpdateMask(addition))) {
                        recreateBindGroup = true;
                        break;
                    }
                }
            }
        }

        if (recreateBindGroup) {//创建BindGroup
            //creat BindGroup
            let bindGroupArray = WebGPUBindGroupHelper.createBindPropertyInfoArrayByCommandMap(2, cacheData.commandUniformMapArray);
            let groupLayout: GPUBindGroupLayout = WebGPUBindGroupHelper.createBindGroupEntryLayout(bindGroupArray)
            let bindgroupEntriys: GPUBindGroupEntry[] = [];
            let bindGroupDescriptor: GPUBindGroupDescriptor = {
                label: "GPUBindGroupDescriptor",
                layout: groupLayout,
                entries: bindgroupEntriys
            };
            //填充bindgroupEntriys
            let shaderData = node.shaderData as WebGPUShaderData;
            for (var com of node._commonUniformMap) {
                shaderData.createSubUniformBuffer(com, com, ((LayaGL.renderDeviceFactory.createGlobalUniformMap(com) as WebGPUCommandUniformMap)._idata));
                shaderData.fillBindGroupEntry(com, bindgroupEntriys, bindGroupArray);
            }
            for (var addition of node._additionShaderDataKeys) {
                let shaderdata = (node.additionShaderData.get(addition) as WebGPUShaderData);
                shaderdata.createSubUniformBuffer(addition, addition, ((LayaGL.renderDeviceFactory.createGlobalUniformMap(addition) as WebGPUCommandUniformMap)._idata));
                shaderdata.fillBindGroupEntry(addition, bindgroupEntriys, bindGroupArray);
            }
            console.log(bindGroupDescriptor);
            let bindGroup = WebGPURenderEngine._instance.getDevice().createBindGroup(bindGroupDescriptor);
            let returns = new WebGPUBindGroup();
            returns.gpuRS = bindGroup;
            returns.createMask = Stat.loopCount;
            cacheData.bindGroup = returns;
        }
    }

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
        return new SceneRenderManagerOBJ();
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