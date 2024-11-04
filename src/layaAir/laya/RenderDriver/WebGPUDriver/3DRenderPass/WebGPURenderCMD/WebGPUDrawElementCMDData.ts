import { DrawElementCMDData } from "../../../DriverDesign/3DRenderPass/IRender3DCMD";
import { RenderCMDType } from "../../../DriverDesign/RenderDevice/IRenderCMD";
import { WebGPURenderContext3D } from "../WebGPURenderContext3D";
import { WebGPURenderElement3D } from "../WebGPURenderElement3D";

export class WebGPUDrawElementCMDData extends DrawElementCMDData {
    type: RenderCMDType;
    private _elemets: WebGPURenderElement3D[];

    constructor() {
        super();
        this.type = RenderCMDType.DrawElement;
    }

    setRenderelements(value: WebGPURenderElement3D[]): void {
        this._elemets = value;
    }

    apply(context: WebGPURenderContext3D): void {
        if (this._elemets.length == 1) {
            context.drawRenderElementOne(this._elemets[0]);
        } else {
            this._elemets.forEach(element => {
                context.drawRenderElementOne(element);
            });
        }
    }
}