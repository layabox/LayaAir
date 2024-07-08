import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { SingletonList } from "../../../utils/SingletonList";
import { I2DRenderPassFactory } from "../../DriverDesign/2DRenderPass/I2DRenderPassFactory";
import { IRenderContext2D } from "../../DriverDesign/2DRenderPass/IRenderContext2D";
import { IRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { IRenderGeometryElement } from "../../DriverDesign/RenderDevice/IRenderGeometryElement";
import { InternalRenderTarget } from "../../DriverDesign/RenderDevice/InternalRenderTarget";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";


export class NoRender2DProcess implements I2DRenderPassFactory {
    createRenderElement2D(): IRenderElement2D {
        return new NoRenderElement2D()
    }
    createRenderContext2D(): IRenderContext2D {
        return new NoRenderContext2D();
    }

}

export class NoRenderElement2D implements IRenderElement2D{
    geometry: IRenderGeometryElement;
    materialShaderData: ShaderData;
    value2DShaderData: ShaderData;
    subShader: SubShader;
    renderStateIsBySprite: boolean;
    destroy(): void {
        
    }
    
}

export class NoRenderContext2D implements IRenderContext2D{
    invertY: boolean;
    pipelineMode: string;
    setRenderTarget(value: InternalRenderTarget, clear: boolean, clearColor: Color): void {
       
    }
    setOffscreenView(width: number, height: number): void {
 
    }
    drawRenderElementOne(node: IRenderElement2D): void {

    }
    drawRenderElementList(list: SingletonList<IRenderElement2D>): number {
        return 0;
    }
    
}
