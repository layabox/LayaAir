import { Scene3D } from "../scene/Scene3D"
import { Viewport } from "../../math/Viewport"
import { Camera } from "../Camera";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { IRenderTarget } from "../../../RenderEngine/RenderInterface/IRenderTarget";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { IRenderContext3D, PipelineMode } from "../../RenderDriverLayer/IRenderContext3D";
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { ShaderData } from "../../../RenderEngine/RenderInterface/ShaderData";

/**
 * <code>RenderContext3D</code> 类用于实现渲染状态。
 */
export class RenderContext3D {
    static _instance: RenderContext3D;

    /**渲染区宽度。*/
    static clientWidth: number;
    /**渲染区高度。*/
    static clientHeight: number;

    /** @internal */
    static GammaCorrect: ShaderDefine;

    /**@internal */
    static __init__() {
        RenderContext3D._instance = new RenderContext3D();

        this.GammaCorrect = Shader3D.getDefineByName("GAMMACORRECT");
    }

    /** @internal */
    viewMatrix: Matrix4x4;
    /**@internal */
    customShader: Shader3D;
    /**@internal */
    replaceTag: string;

    /** @internal */
    projectionMatrix: Matrix4x4;
    /** @internal */
    projectionViewMatrix: Matrix4x4;

    camera: Camera;
    /**@internal */
    _scene: Scene3D;
    /** @internal */
    shader: ShaderInstance;
    /**设置渲染管线 */
    configPipeLineMode: PipelineMode = "Forward";
    /**@internal contextOBJ*/
    _contextOBJ: IRenderContext3D;


    /**@internal */
    set destTarget(value: IRenderTarget) {
        this._contextOBJ.setRenderTarget(value ? value._renderTarget : null);
    }



    set viewport(value: Viewport) {
        this._contextOBJ.setViewPort(value);
    }

    set scissor(value: Vector4) {
        this._contextOBJ.setScissor(value);
    }

    /** @internal */
    get invertY(): boolean {
        return this._contextOBJ.invertY;
    }

    set invertY(value: boolean) {
        this._contextOBJ.invertY = value;
    }

    /** @internal */
    get pipelineMode(): PipelineMode {
        return this._contextOBJ.pipelineMode;
    }

    set pipelineMode(value: PipelineMode) {
        this._contextOBJ.pipelineMode = value;
    }
    //Camera Shader Data
    get cameraShaderValue(): ShaderData {
        return this._contextOBJ.cameraData;
    }

    set cameraShaderValue(value: ShaderData) {
        this._contextOBJ.cameraData = value;
    }

    /** @internal */
    set scene(value: Scene3D) {
        if (value) {
            //this._contextOBJ.sceneModuleData = value._scenemoduleData; TODO miner
            this._contextOBJ.sceneData = value._shaderValues;
            this._scene = value;
            this._contextOBJ.sceneModuleData = value._sceneModuleData;
        } else {
            this._contextOBJ.sceneModuleData = null;
            this._contextOBJ.sceneData = null;
            this._scene = null;
        }

    }

    get scene(): Scene3D {
        return this._scene;
    }

    changeViewport(x: number, y: number, width: number, height: number) {
        Viewport._tempViewport.set(x, y, width, height);
        this.viewport = Viewport._tempViewport;
    }

    changeScissor(x: number, y: number, width: number, height: number) {
        Vector4.tempVec4.setValue(x, y, width, height);
        this.scissor = Vector4.tempVec4;
    }

    applyContext(cameraUpdateMark: number) {
        this._contextOBJ.cameraUpdateMask = cameraUpdateMark;
    }

    /**
     * 渲染一个
     * @param renderelemt 
     */
    drawRenderElement(renderelemt: IRenderElement): void {
        this._contextOBJ.drawRenderElementOne(renderelemt);
    }
    /**
     * 创建一个 <code>RenderContext3D</code> 实例。
     */
    constructor() {
        this._contextOBJ = Laya3DRender.renderOBJCreate.createRenderContext3D();
    }

}


