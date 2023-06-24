import { Config } from "../../../../Config";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { WebGPUConfig } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUConfig";
import { WebGPUEngine } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUEngine";
import { WebGPUShaderInstance } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUShaderInstance";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderEngine } from "../../../RenderEngine/RenderInterface/IRenderEngine";
import { IRenderOBJCreate } from "../../../RenderEngine/RenderInterface/IRenderOBJCreate";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { RenderStateCommand } from "../../../RenderEngine/RenderStateCommand";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { BoundsImpl } from "../../math/BoundsImpl";
import { BaseRenderNode } from "../RenderObj/BaseRenderNode";
import { BaseRenderQueue } from "../RenderObj/BaseRenderQueue";
import { CameraCullInfo } from "../RenderObj/CameraCullInfo";
import { CullPassBase } from "../RenderObj/CullPass";
import { InstanceRenderElementOBJ } from "../RenderObj/InstanceRenderElementOBJ";
import { QuickSort } from "../RenderObj/QuickSort";
import { RenderGeometryElementOBJ } from "../RenderObj/RenderGeometryElementOBJ";
import { SceneRenderManagerOBJ } from "../RenderObj/SceneRenderManagerOBJ";
import { ShadowCullInfo } from "../RenderObj/ShadowCullInfo";
import { SkinRenderElementOBJ } from "../RenderObj/SkinRenderElementOBJ";
import { WGPURenderContext3D } from "./WGPURenderContext3D";
import { WGPURenderElementObJ } from "./WGPURenderElementObJ";
import { WGPURenderPipelineInstance } from "./WGPURenderPipelineInstance";
import { WGPUShaderData } from "./WGPUShaderData";

export class WGPURenderOBJCreateUtil implements IRenderOBJCreate {
    /**@internal */
    private globalBlockMap: any = {};
    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createShaderData(): WGPUShaderData {
        return new WGPUShaderData();
    }

    createRenderElement(): WGPURenderElementObJ {
        return new WGPURenderElementObJ();
    }
    createSkinRenderElement(): SkinRenderElementOBJ {//TODO
        return new SkinRenderElementOBJ();
    }
    createInstanceRenderElement() {//TODO
        return new InstanceRenderElementOBJ();
    }

    createBaseRenderQueue(isTransparent: boolean): IRenderQueue {
        var queue: BaseRenderQueue = new BaseRenderQueue(isTransparent);
        queue.sortPass = this.createSortPass();
        return queue;
    }

    createRenderGeometry(mode: MeshTopology, drayType: DrawType): IRenderGeometryElement {
        return new RenderGeometryElementOBJ(mode, drayType);
    }

    createVertexBuffer3D(byteLength: number, bufferUsage: BufferUsage, canRead: boolean = false) {
        return new VertexBuffer3D(byteLength, bufferUsage, canRead);
    }

    createIndexBuffer3D(indexType: IndexFormat, indexCount: number, bufferUsage: BufferUsage = BufferUsage.Static, canRead: boolean = false): IndexBuffer3D {
        return new IndexBuffer3D(indexType, indexCount, bufferUsage, canRead);
    }

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): WGPURenderPipelineInstance {
        return new WGPURenderPipelineInstance(shaderProcessInfo, shaderPass);
    }

    createBaseRenderNode(): BaseRenderNode {
        return new BaseRenderNode();
    }

    createRenderContext3D(): WGPURenderContext3D {
        return new WGPURenderContext3D();
    }

    createSceneRenderManager(): SceneRenderManagerOBJ {
        return new SceneRenderManagerOBJ();
    }

    createCullPass(): CullPassBase {
        return new CullPassBase();
    }

    createSortPass(): QuickSort {
        return new QuickSort();
    }

    createShadowCullInfo(): ShadowCullInfo {
        return new ShadowCullInfo();
    }

    createCameraCullInfo(): CameraCullInfo {
        return new CameraCullInfo();
    }

    createRenderStateComand(): RenderStateCommand {
        return new RenderStateCommand();
    }

    createRenderState(): RenderState {
        return new RenderState();
    }

    createUniformBufferObject(glPointer: number, name: string, bufferUsage: BufferUsage, byteLength: number, isSingle: boolean): UniformBufferObject {
        return new UniformBufferObject(glPointer, name, bufferUsage, byteLength, isSingle);
    }

    createGlobalUniformMap(blockName: string): CommandUniformMap {
        let comMap = this.globalBlockMap[blockName];
        if (!comMap)
            comMap = this.globalBlockMap[blockName] = new CommandUniformMap(blockName);;
        return comMap;
    }

    async createEngine(config: any, canvas: any){
        let gpuConfig = new WebGPUConfig();
        gpuConfig.alphaMode = Config.premultipliedAlpha ? "premultiplied" : "opaque";
        gpuConfig.colorSpace = "srgb";//TODO 这里感觉会出问题
        switch (Config.powerPreference) {
            case "default":
                gpuConfig.powerPreference = undefined;
                break;
            default:
                gpuConfig.powerPreference = Config.powerPreference;
                break;
        }
        let engine = new WebGPUEngine(gpuConfig,canvas._source);
        LayaGL.renderEngine = engine;
        await engine.initRenderEngine();
        LayaGL.textureContext = engine.getTextureContext();
        return Promise.resolve() as any;
    }
}