import { IRenderContext2D } from "./IRenderContext2D";
import { IRenderElement2D } from "./IRenderElement2D";

export interface I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D;

    createREnderContext2D(): IRenderContext2D;
}