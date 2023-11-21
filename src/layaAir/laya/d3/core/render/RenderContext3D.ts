import { RenderElement } from "./RenderElement";
import { Scene3D } from "../scene/Scene3D"
import { Viewport } from "../../math/Viewport"
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { Camera } from "../Camera";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { IRenderContext3D, PipelineMode } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D";
import { IRenderTarget } from "../../../RenderEngine/RenderInterface/IRenderTarget";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector4 } from "../../../maths/Vector4";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderDefine } from "../../../RenderEngine/RenderShader/ShaderDefine";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";

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
    /** @internal */
    renderElement: RenderElement;

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
    get destTarget(): IRenderTarget {
        return this._contextOBJ.destTarget;
    }

    /**@internal */
    set destTarget(value: IRenderTarget) {
        this._contextOBJ.destTarget = value;

        // todo ohter color gamut
        // let sRGBGammaOut = false;
        // if (value) {
        //     // todo 
        //     if (value._renderTarget._textures[0].gammaCorrection == 2.2) {
        //         sRGBGammaOut = true;
        //     }
        // }
        // else {
        //     // 直接输出到屏幕, 默认srgb gamma 2.2
        //     sRGBGammaOut = true;
        // }

        // if (sRGBGammaOut) {
        //     this._contextOBJ.configShaderData.addDefine(RenderContext3D.GammaCorrect);
        // }
        // else {
        //     this._contextOBJ.configShaderData.removeDefine(RenderContext3D.GammaCorrect);
        // }
    }

    /** @internal */
    get viewport(): Viewport {
        return this._contextOBJ.viewPort;
    }

    set viewport(value: Viewport) {
        value.cloneTo(this._contextOBJ.viewPort);
    }
    /** @internal */
    get scissor(): Vector4 {
        return this._contextOBJ.scissor;
    }

    set scissor(value: Vector4) {
        value.cloneTo(this._contextOBJ.scissor);
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
        return this._contextOBJ.cameraShaderData;
    }

    set cameraShaderValue(value: ShaderData) {
        this._contextOBJ.cameraShaderData = value;
    }

    /** @internal */
    set scene(value: Scene3D) {
        if (value) {
            this._contextOBJ.sceneID = value._id;
            this._contextOBJ.sceneShaderData = value._shaderValues;
            this._scene = value;
        } else {
            this._contextOBJ.sceneID = -1;
            this._contextOBJ.sceneShaderData = null;
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
        this._contextOBJ.applyContext(cameraUpdateMark);
    }

    /**
     * 渲染一个
     * @param renderelemt 
     */
    drawRenderElement(renderelemt: RenderElement): void {
        renderelemt.material && renderelemt._convertSubShader(this.customShader, this.replaceTag);
        if (!renderelemt.renderSubShader)
            return;
        renderelemt._renderUpdatePre(this);
        this._contextOBJ.drawRenderElement(renderelemt._renderElementOBJ);
    }
    /**
     * 创建一个 <code>RenderContext3D</code> 实例。
     */
    constructor() {
        this._contextOBJ = Laya3DRender.renderOBJCreate.createRenderContext3D();
    }

}


