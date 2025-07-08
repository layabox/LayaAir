import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RTShaderPass } from "../../RenderModuleData/RuntimeModuleData/RTShaderPass";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESRenderElement2D } from "./GLESRenderElement2D";

export class GLESPrimitiveRenderElement2D extends GLESRenderElement2D implements IPrimitiveRenderElement2D {

    protected init(): void {
        this._nativeObj = new (window as any).conchGLESPrimitiveRenderElement2D();
        (window as any).conchGLESRenderElement2D.setCompileDefine(RTShaderPass.getGlobalCompileDefine()._nativeObj);
    }

    private _primitiveShaderData: GLESShaderData;
    public get primitiveShaderData(): GLESShaderData {
        return this._primitiveShaderData;
    }
    public set primitiveShaderData(data: GLESShaderData) {
        this._primitiveShaderData = data;
        this._nativeObj.setPrimitiveShaderData(data ? (data as any)._nativeObj : null);
    }
}