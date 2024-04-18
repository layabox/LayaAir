import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebglRenderContext2D } from "./WebGLRenderContext2D";
import { WebGLRenderelement2D } from "./WebGLRenderElement2D";

export class WebGLRender2DProcess implements I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D {
        return new WebGLRenderelement2D();
    }
    createRenderContext2D(): IRenderContext2D {
        return new WebglRenderContext2D();
    }

}