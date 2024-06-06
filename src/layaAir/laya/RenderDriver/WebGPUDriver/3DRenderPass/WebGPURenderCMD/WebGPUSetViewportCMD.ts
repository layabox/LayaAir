import { Vector4 } from "../../../../maths/Vector4";
import { Viewport } from "../../../../maths/Viewport";
import { SetViewportCMD, RenderCMDType } from "../../../DriverDesign/3DRenderPass/IRendderCMD";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";

export class WebGPUSetViewportCMD extends SetViewportCMD {
    type: RenderCMDType;
    protected _viewport: Viewport;
    protected _scissor: Vector4;

    get viewport(): Viewport {
        return this._viewport;
    }

    set viewport(value: Viewport) {
        this._viewport = value;
    }

    get scissor(): Vector4 {
        return this._scissor;
    }

    set scissor(value: Vector4) {
        this._scissor = value;
    }

    constructor() {
        super();
        this.type = RenderCMDType.ChangeViewPort;
        this.scissor = new Vector4();
        this.viewport = new Viewport();
    }

    apply(context: WebGPURenderContext3D): void {
        context.setViewPort(this.viewport);
        context.setScissor(this.scissor);
    }
}