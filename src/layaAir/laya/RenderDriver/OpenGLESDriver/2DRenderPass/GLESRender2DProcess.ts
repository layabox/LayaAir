import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { GLESREnderContext2D } from "./GLESRenderContext2D";
import { GLESREnderElement2D } from "./GLESRenderElement2D";

export class GLESRender2DProcess implements I2DRenderPassFactory {
    createRenderElement2D(): GLESREnderElement2D {
        return new GLESREnderElement2D();
    }
    createRenderContext2D(): GLESREnderContext2D {
        return new GLESREnderContext2D();
    }

}   