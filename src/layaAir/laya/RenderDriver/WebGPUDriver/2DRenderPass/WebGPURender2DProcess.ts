import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { WebGPURenderContext2D } from "./WebGPURenderContext2D";
import { WebGPURenderElement2D } from "./WebGPURenderElement2D";

export class WebGPURender2DProcess implements I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D {
        return new WebGPURenderElement2D();
    }
    createRenderContext2D(): IRenderContext2D {
        return new WebGPURenderContext2D();
    }
}