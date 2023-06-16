
import { Config } from "../../../../Config";
import { LayaGL } from "../../../layagl/LayaGL";
import { Vector3 } from "../../../maths/Vector3";
import { CommandUniformMap } from "../../../RenderEngine/CommandUniformMap";
import { WebGLMode } from "../../../RenderEngine/RenderEngine/WebGLEngine/GLEnum/WebGLMode";
import { WebGlConfig } from "../../../RenderEngine/RenderEngine/WebGLEngine/WebGLConfig";
import { WebGLEngine } from "../../../RenderEngine/RenderEngine/WebGLEngine/WebGLEngine";
import { BufferUsage } from "../../../RenderEngine/RenderEnum/BufferTargetType";
import { DrawType } from "../../../RenderEngine/RenderEnum/DrawType";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { IRenderOBJCreate } from "../../../RenderEngine/RenderInterface/IRenderOBJCreate";
import { IBaseRenderNode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IBaseRenderNode";
import { ICameraCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICameraCullInfo";
import { ICullPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ICullPass";
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISceneRenderManager } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISceneRenderManager";
import { IShadowCullInfo } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IShadowCullInfo";
import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { RenderStateCommand } from "../../../RenderEngine/RenderStateCommand";
import { UniformBufferObject } from "../../../RenderEngine/UniformBufferObject";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { Sprite3D } from "../../core/Sprite3D";
import { Transform3D } from "../../core/Transform3D";
import { IndexBuffer3D } from "../../graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../graphics/VertexBuffer3D";
import { BoundsImpl } from "../../math/BoundsImpl";
import { BaseRenderNode } from "./BaseRenderNode";
import { BaseRenderQueue } from "./BaseRenderQueue";
import { CameraCullInfo } from "./CameraCullInfo";
import { CullPassBase } from "./CullPass";
import { InstanceRenderElementOBJ } from "./InstanceRenderElementOBJ";
import { QuickSort } from "./QuickSort";
import { RenderContext3DOBJ } from "./RenderContext3DOBJ";
import { RenderElementOBJ } from "./RenderElementOBJ";
import { RenderGeometryElementOBJ } from "./RenderGeometryElementOBJ";
import { SceneRenderManagerOBJ } from "./SceneRenderManagerOBJ";
import { ShadowCullInfo } from "./ShadowCullInfo";
import { SkinRenderElementOBJ } from "./SkinRenderElementOBJ";

export class RenderOBJCreateUtil implements IRenderOBJCreate {

    /**@internal */
    private globalBlockMap: any = {};


    createTransform(owner: Sprite3D): Transform3D {
        return new Transform3D(owner);
    }

    createBounds(min: Vector3, max: Vector3): any {
        return new BoundsImpl(min, max);
    }

    createShaderData(): ShaderData {
        return new ShaderData();
    }

    createRenderElement(): IRenderElement {
        return new RenderElementOBJ();
    }
    createSkinRenderElement(): IRenderElement {
        return new SkinRenderElementOBJ();
    }
    createInstanceRenderElement() {
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

    createShaderInstance(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase): ShaderInstance {
        return new ShaderInstance(shaderProcessInfo, shaderPass);
    }

    createBaseRenderNode(): IBaseRenderNode {
        return new BaseRenderNode();
    }

    createRenderContext3D(): IRenderContext3D {
        return new RenderContext3DOBJ();
    }

    createSceneRenderManager(): ISceneRenderManager {
        return new SceneRenderManagerOBJ();
    }

    createCullPass(): ICullPass {
        return new CullPassBase();
    }

    createSortPass(): ISortPass {
        return new QuickSort();
    }

    createShadowCullInfo(): IShadowCullInfo {
        return new ShadowCullInfo();
    }

    createCameraCullInfo(): ICameraCullInfo {
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

    createEngine(config: any, canvas: any): Promise<void> {
        let engine: WebGLEngine;
        let glConfig: WebGlConfig = { stencil: Config.isStencil, alpha: Config.isAlpha, antialias: Config.isAntialias, premultipliedAlpha: Config.premultipliedAlpha, preserveDrawingBuffer: Config.preserveDrawingBuffer, depth: Config.isDepth, failIfMajorPerformanceCaveat: Config.isfailIfMajorPerformanceCaveat, powerPreference: Config.powerPreference };

        //TODO  other engine
        const webglMode: WebGLMode = Config.useWebGL2 ? WebGLMode.Auto : WebGLMode.WebGL1;
        engine = new WebGLEngine(glConfig, webglMode);
        engine.initRenderEngine(canvas._source);
        var gl: WebGLRenderingContext = engine._context;//TODO 优化
        if (Config.printWebglOrder)
            this._replaceWebglcall(gl);

        if (gl) {
            new LayaGL();
        }
        LayaGL.renderEngine = engine;
        LayaGL.textureContext = engine.getTextureContext();
        LayaGL.renderDrawContext = engine.getDrawContext();
        LayaGL.render2DContext = engine.get2DRenderContext();
        return Promise.resolve();
    }

    /**@private test function*/
    private _replaceWebglcall(gl: any) {
        var tempgl: { [key: string]: any } = {};
        for (const key in gl) {
            if (typeof gl[key] == "function" && key != "getError" && key != "__SPECTOR_Origin_getError" && key != "__proto__") {
                tempgl[key] = gl[key];
                gl[key] = function () {
                    let arr: IArguments[] = [];
                    for (let i = 0; i < arguments.length; i++) {
                        arr.push(arguments[i]);
                    }
                    let result = tempgl[key].apply(gl, arr);

                    //console.log(RenderInfo.loopCount + ":gl." + key + ":" + arr);
                    let err = gl.getError();
                    if (err) {
                        //console.log(err);
                        debugger;
                    }
                    return result;
                }
            }
        }
    }
}