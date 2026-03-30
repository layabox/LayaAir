import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";

export class LayaXPrimitiveRenderElement2D extends LayaXRenderElement2D
    implements IPrimitiveRenderElement2D {

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXPrimitiveRenderElement2D();
    }

    private _primitiveShaderData: ShaderData;
    get primitiveShaderData(): ShaderData { return this._primitiveShaderData; }
    set primitiveShaderData(data: ShaderData) {
        this._primitiveShaderData = data;
        this._nativeObj.setPrimitiveShaderData(data ? (data as any)._nativeObj : null);
    }
}
