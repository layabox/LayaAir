import { RenderClearFlag } from "../../../../RenderEngine/RenderEnum/RenderClearFlag";
import { Color } from "../../../../maths/Color";
import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { RenderCMDType, SetRenderTargetCMD } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebGPUInternalRT } from "../../RenderDevice/WebGPUInternalRT";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";

const viewport = new Viewport();
const scissor = new Vector4();

export class WebGPUSetRenderTargetCMD extends SetRenderTargetCMD {
    type: RenderCMDType;
    protected _rt: WebGPUInternalRT;
    protected _clearFlag: number;
    protected _clearColorValue: Color;
    protected _clearDepthValue: number;
    protected _clearStencilValue: number;

    get rt(): WebGPUInternalRT {
        return this._rt;
    }

    set rt(value: WebGPUInternalRT) {
        this._rt = value;
    }

    get clearFlag(): number {
        return this._clearFlag;
    }
    set clearFlag(value: number) {
        this._clearFlag = value;
    }

    get clearColorValue(): Color {
        return this._clearColorValue;
    }

    set clearColorValue(value: Color) {
        value.cloneTo(this._clearColorValue);
    }

    get clearDepthValue(): number {
        return this._clearDepthValue;
    }

    set clearDepthValue(value: number) {
        this._clearDepthValue = value;
    }

    get clearStencilValue(): number {
        return this._clearStencilValue;
    }

    set clearStencilValue(value: number) {
        this._clearStencilValue = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeRenderTarget;
        this._clearColorValue = new Color();
    }

    apply(context: WebGPURenderContext3D): void {
        context.setRenderTarget(this.rt, RenderClearFlag.Nothing);
        context.setClearData(this.clearFlag, this.clearColorValue, this.clearDepthValue, this.clearStencilValue);

        if (this.rt) {
            viewport.set(0, 0, this.rt._textures[0].width, this.rt._textures[0].height);
            scissor.setValue(0, 0, this.rt._textures[0].width, this.rt._textures[0].height);
            context.setViewPort(viewport);
            context.setScissor(scissor);
        }
    }
}