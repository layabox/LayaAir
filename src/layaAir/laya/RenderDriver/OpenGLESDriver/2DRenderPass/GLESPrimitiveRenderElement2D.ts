import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RTShaderPass } from "../../RenderModuleData/RuntimeModuleData/RTShaderPass";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESRenderElement2D } from "./GLESRenderElement2D";

export class GLESPrimitiveRenderElement2D extends GLESRenderElement2D implements IPrimitiveRenderElement2D {
    /**
     * @en Type key. Written directly into the shared Elem2DProps block (slot 1).
     * @zh 类型键。直写共享 Elem2DProps 块（槽 1），零跨界。
     */
    set typeKey(value: number) {
        this._elem2dI32[1] = value;
    }

    get typeKey(): number {
        return this._elem2dI32[1];
    }

    /**
     * @en Texture key encoding shader define bits + texture ID. Shared block slot 2.
     * @zh 纹理键编码着色器宏定义位和纹理ID。直写共享 Elem2DProps 块（槽 2）。
     */
    set textureKey(value: number) {
        this._elem2dI32[2] = value;
    }

    get textureKey(): number {
        return this._elem2dI32[2];
    }

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