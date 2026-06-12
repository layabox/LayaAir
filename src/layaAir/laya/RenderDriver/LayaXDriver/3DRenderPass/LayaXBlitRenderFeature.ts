import { Vector4 } from "../../../maths/Vector4";
import { Viewport } from "../../../maths/Viewport";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXRenderElement3D } from "./LayaXRenderElement3D";

/**
 * LayaX Blit RenderFeature — TS 层封装。
 *
 * 当 destRT == null（渲染到 swapchain）时，由外部调用 dispatch()，
 * 传入 RenderElement3D + 上下文数据，Rust 端 BlitRenderFeature 直接录制渲染。
 *
 * 对应 C++ conchLayaXBlitFeature → Rust BlitRenderFeature。
 */
export class LayaXBlitRenderFeature {

    /** C++ 原生对象（conchLayaXBlitFeature），惰性创建 */
    private _nativeObj: any;

    private _ensureNative(): any {
        if (!this._nativeObj) {
            this._nativeObj = new (window as any).conchLayaXBlitFeature();
        }
        return this._nativeObj;
    }

    /**
     * 配置并调度一次 Blit 渲染。
     *
     * @param element     要渲染的 RenderElement3D（全屏 quad）
     * @param destRT      目标 RT，null 表示 swapchain
     * @param globalSD    全局 ShaderData
     * @param sceneSD     场景 ShaderData
     * @param cameraSD    相机 ShaderData
     * @param viewport    视口
     * @param scissor     裁剪矩形 (x, y, w, h)
     * @param offsetScale UV offset + scale (ox, oy, sx, sy)
     */
    dispatch(
        element: LayaXRenderElement3D,
        destRT: InternalRenderTarget | null,
        globalSD: ShaderData | null,
        sceneSD: ShaderData | null,
        cameraSD: ShaderData | null,
        viewport: Viewport,
        scissor: Vector4,
        offsetScale: Vector4
    ): void {
        let bf = this._ensureNative();

        bf.setElement(element ? element._nativeObj : null);
        bf.setDestRT(destRT ? (destRT as any)._nativeObj : null);

        bf.setShaderData(
            globalSD ? (globalSD as any)._nativeObj : null,
            sceneSD ? (sceneSD as any)._nativeObj : null,
            cameraSD ? (cameraSD as any)._nativeObj : null
        );

        bf.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
        bf.setScissor(scissor.x, scissor.y, scissor.z, scissor.w);
        bf.setOffsetScale(offsetScale.x, offsetScale.y, offsetScale.z, offsetScale.w);

        bf.execute();
    }

    destroy(): void {
        this._nativeObj = null;
    }
}
