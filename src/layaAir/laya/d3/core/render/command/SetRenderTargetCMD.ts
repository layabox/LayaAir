import { Command } from "./Command";
import { RenderTexture } from "../../../../resource/RenderTexture";
import { CommandBuffer } from "./CommandBuffer";
import { Color } from "../../../../maths/Color";
import { Laya3DRender } from "../../../RenderObjs/Laya3DRender";
import { SetRenderTargetCMD } from "../../../../RenderDriver/DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Pool } from "../../../../utils/Pool";
import { IRenderTarget } from "../../../../RenderDriver/DriverDesign/RenderDevice/IRenderTarget";

/**
 * @internal
 * @en SetRTCMD used to create a command to set the render target.
 * @zh SetRTCMD 类用于创建设置渲染目标指令。
 */
export class SetRTCMD extends Command {
    private static readonly _pool = Pool.createPool(SetRTCMD);

    /**
     * @internal
     * @en Creates a SetRTCMD instance.
     * @param renderTexture The render texture to set.
     * @param clearColor Whether to clear the color buffer.
     * @param clearDepth Whether to clear the depth buffer.
     * @param clearStencil Whether to clear the stencil buffer.
     * @param backgroundColor One clear color for all attachments, or one color per attachment.
     * @param depth The depth value to clear with. Default is 1.
     * @param stencil The stencil value to clear with. Default is 0.
     * @param commandBuffer The command buffer to which this command will be added.
     * @zh 创建一个 SetRTCMD 实例。
     * @param renderTexture 要设置的渲染纹理。
     * @param clearColor 是否清除颜色缓冲区。
     * @param clearDepth 是否清除深度缓冲区。
     * @param clearStencil 是否清除模板缓冲区。
     * @param backgroundColor 统一清屏颜色，或按附件顺序提供的清屏颜色数组。
     * @param depth 用于清除的深度值。默认为1。
     * @param stencil 用于清除的模板值。默认为0。
     * @param commandBuffer 将添加此命令的命令缓冲区。
     */
    static create(renderTexture: RenderTexture, clearColor: boolean, clearDepth: boolean, clearStencil: boolean, backgroundColor: Color | readonly Color[], depth: number = 1, stencil: number = 0, commandBuffer: CommandBuffer): SetRTCMD {
        if (!renderTexture || renderTexture.destroyed)
            throw new Error("SetRenderTarget requires a live RenderTexture.");
        let color = backgroundColor as Color;
        let colorValues: readonly Color[] = null;
        if (clearColor && Array.isArray(backgroundColor)) {
            const count = (renderTexture as IRenderTarget).colorAttachmentCount ?? 1;
            if (backgroundColor.length !== count)
                throw new RangeError("Clear color count must match the render target color attachment count.");
            for (let i = 0; i < count; i++) {
                if (!(backgroundColor[i] instanceof Color))
                    throw new TypeError("Clear colors must contain a Color for every attachment.");
            }
            color = backgroundColor[0];
            // A single attachment uses the existing path, including WebGL1 and Native.
            if (count > 1) colorValues = backgroundColor;
        }
        let cmd = SetRTCMD._pool.take();
        cmd._setRenderTargetCMD.clearColorValues = null;
        if (clearColor) {
            cmd._setRenderTargetCMD.clearColorValue = color;
            cmd._setRenderTargetCMD.clearColorValues = colorValues;
        }
        cmd.renderTexture = renderTexture;
        cmd._commandBuffer = commandBuffer;
        let clearflag = 0;
        if (clearColor) {
            clearflag |= RenderClearFlag.Color;
        }
        if (clearDepth) {
            clearflag |= RenderClearFlag.Depth;
            cmd._setRenderTargetCMD.clearDepthValue = depth;
        }
        if (clearStencil) {
            clearflag |= RenderClearFlag.Stencil;
            cmd._setRenderTargetCMD.clearStencilValue = stencil;
        }
        cmd._setRenderTargetCMD.clearFlag = clearflag;
        return cmd;
    }

    /**@internal */
    private _renderTexture: RenderTexture = null;

    /**@internal */
    _setRenderTargetCMD: SetRenderTargetCMD;

    /**
     * @en The render texture.
     * @zh 渲染纹理。
     */
    public get renderTexture(): RenderTexture {
        return this._renderTexture;
    }
    public set renderTexture(value: RenderTexture) {
        if (value === this._renderTexture) return;
        if (value && value.destroyed)
            throw new Error("Cannot record a destroyed render target.");
        const colors = this._setRenderTargetCMD.clearColorValues;
        if (value && colors && colors.length !== ((value as IRenderTarget).colorAttachmentCount ?? 1))
            throw new RangeError("Clear color count must match the render target color attachment count.");
        const previous = this._renderTexture;
        this._setRenderTargetCMD.rt = value ? value._renderTarget : null;
        value && value._addReference();
        this._renderTexture = value;
        previous && previous._removeReference();
    }

    constructor() {
        super();
        this._setRenderTargetCMD = Laya3DRender.Render3DPassFactory.createSetRenderTargetCMD();
    }

    /**
     * @override
     * @internal
     * @en Retrieves the render command.
     * @zh 获取渲染命令。
     */
    getRenderCMD(): SetRenderTargetCMD {
        return this._setRenderTargetCMD;
    }

    run(): void {
        if (!this._renderTexture || this._renderTexture.destroyed)
            throw new Error("Cannot execute a command with a destroyed render target.");
    }

    /**
     * @inheritDoc
     * @override
     * @en Recycles the command object for later use.
     * @zh 回收命令以便复用。
     */
    recover(): void {
        this.renderTexture = null;
        this._setRenderTargetCMD.clearColorValues = null;
        super.recover();
        SetRTCMD._pool.recover(this);
    }

    destroy(): void {
        this.renderTexture = null;
        this._setRenderTargetCMD.clearColorValues = null;
        super.destroy();
    }
}


