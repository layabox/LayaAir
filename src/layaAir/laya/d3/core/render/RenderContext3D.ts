import { Scene3D } from "../scene/Scene3D"
import { Camera } from "../Camera";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Vector4 } from "../../../maths/Vector4";
import { PipelineMode, IRenderContext3D, IRenderElement3D } from "../../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";
import { IRenderTarget } from "../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";
import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Viewport } from "../../../maths/Viewport";

/**
 * @en Used to implement rendering states.
 * @zh 用于实现渲染状态。
 */
export class RenderContext3D {
    /**
     * @en The singleton instance of the RenderContext3D.
     * @zh RenderContext3D的单例实例。
     */
    static _instance: RenderContext3D;


    /**
     * @en The width of the rendering area.
     * @zh 渲染区域的宽度。
     */
    static clientWidth: number;
    /**
     * @en The height of the rendering area.
     * @zh 渲染区域的高度。
     */
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
    /**
     * @en The rendering pipeline mode.
     * @zh 渲染管线模式
     */
    configPipeLineMode: PipelineMode = "Forward";
    /**@internal contextOBJ*/
    _contextOBJ: IRenderContext3D;


    /**
     * @internal
     * @en The destination render target.
     * @zh 目标渲染目标。
     */
    set destTarget(value: IRenderTarget) {
        this._contextOBJ.setRenderTarget(value ? value._renderTarget : null, RenderClearFlag.Nothing);
    }
    /**
     * @en The viewport for rendering.
     * @zh 渲染视口。
     */
    set viewport(value: Viewport) {
        this._contextOBJ.setViewPort(value);
    }

    /**
     * @en The scissor rectangle for rendering.
     * @zh 渲染裁剪矩形。
     */
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
    /**
     * @en The camera shader data.
     * @zh 相机着色器数据。
     */
    get cameraShaderValue(): ShaderData {
        return this._contextOBJ.cameraData;
    }

    set cameraShaderValue(value: ShaderData) {
        this._contextOBJ.cameraData = value;
    }

    /**
     * @internal
     * @en The current scene.
     * @zh 当前场景。
     */
    get scene(): Scene3D {
        return this._scene;
    }
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

    /**
     * @en Changes the viewport.
     * @param x The x-coordinate of the viewport.
     * @param y The y-coordinate of the viewport.
     * @param width The width of the viewport.
     * @param height The height of the viewport.
     * @zh 更改视口。
     * @param x 视口 x 坐标。
     * @param y 视口 y 坐标。
     * @param width 视口的宽度。
     * @param height 视口的高度。
     */
    changeViewport(x: number, y: number, width: number, height: number) {
        Viewport._tempViewport.set(x, y, width, height);
        this.viewport = Viewport._tempViewport;
    }

    /**
     * @en Changes the scissor rectangle.
     * @param x The x-coordinate of the scissor rectangle.
     * @param y The y-coordinate of the scissor rectangle.
     * @param width The width of the scissor rectangle.
     * @param height The height of the scissor rectangle.
     * @zh 更改裁剪矩形。
     * @param x 裁剪矩形的 x 坐标。
     * @param y 裁剪矩形的 y 坐标。
     * @param width 裁剪矩形的宽度。
     * @param height 裁剪矩形的高度。
     */
    changeScissor(x: number, y: number, width: number, height: number) {
        Vector4.tempVec4.setValue(x, y, width, height);
        this.scissor = Vector4.tempVec4;
    }

    /**
     * @en Applies the context with the given camera update mark.
     * @param cameraUpdateMark The camera update mark.
     * @zh 应用具有给定相机更新标记的上下文。
     * @param cameraUpdateMark 相机更新标记。
     */
    applyContext(cameraUpdateMark: number) {
        this._contextOBJ.cameraUpdateMask = cameraUpdateMark;
    }

    /**
     * @en Draws a single render element.
     * @param renderelemt The render element to draw.
     * @zh 渲染单个渲染元素。
     * @param renderelemt 要绘制的渲染元素。
     */
    drawRenderElement(renderelemt: IRenderElement3D): void {
        this._contextOBJ.drawRenderElementOne(renderelemt);
    }
    
    /**@ignore */
    constructor() {
        this._contextOBJ = Laya3DRender.Render3DPassFactory.createRenderContext3D();
    }

}


