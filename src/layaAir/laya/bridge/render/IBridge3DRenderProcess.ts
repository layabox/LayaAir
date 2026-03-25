
import { Camera } from "../../d3/core/Camera";
import { IRenderContext2D } from "../../RenderDriver/DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderContext3D } from "../../RenderDriver/DriverDesign/3DRenderPass/I3DRenderPass";
import { ISceneRenderManager } from "../../RenderDriver/DriverDesign/3DRenderPass/ISceneRenderManager";
import { IBridgeRenderElement } from "../Bridge3DSprite";

/**
 * IBridge3DRenderProcess - Bridge3D统一渲染流程接口
 *
 * 遵循 Scene3D 的 IRender3DProcess 模式：
 *   fowardRender (场景级：context准备 + 阴影渲染)
 *   render (元素级：前向渲染，由每个 element 的 _render 调用)
 *
 * Web 实现: WebBridge3DRenderProcess (纯TS逻辑)
 * Native 实现: RTBridge3DRenderProcess (委托C++ conchGLESBridge3DRenderProcess)
 */
export interface IBridge3DRenderProcess {

    /** 场景渲染管理器（与 IRender3DProcess.render3DManager 对称） */
    render3DManager: ISceneRenderManager;

    /**
     * 注册 Bridge3D 渲染元素（在 Bridge3DSprite 注册到 scene 时调用）
     */
    addBridgeElement(element: IBridgeRenderElement): void;

    /**
     * 移除 Bridge3D 渲染元素（在 Bridge3DSprite 从 scene 移除时调用）
     */
    removeBridgeElement(element: IBridgeRenderElement): void;

    /**
     * 场景级渲染入口（对标 IRender3DProcess.fowardRender）
     * 由 Bridge3DCamera.render() 调用，内部编排：
     *   1. Bridge3D context 准备
     *   2. 阴影渲染（条件）
     */
    fowardRender(context3d: IRenderContext3D, camera: Camera): void;

    /**
     * 元素级前向渲染（由每个 element 的 _render 调用）
     * 内部执行：initBridge3DRenderPass → prepareProjectionCorrection → renderBridge3DForward
     */
    render(element: IBridgeRenderElement, context2d: IRenderContext2D, context3d: IRenderContext3D): void;

    destroy(): void;
}
