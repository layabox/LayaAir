import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { RTShaderPass } from "../../RenderModuleData/RuntimeModuleData/RTShaderPass";
import { GLESShaderData } from "../RenderDevice/GLESShaderData";
import { GLESRenderElement2D } from "./GLESRenderElement2D";

export class GLESPrimitiveRenderElement2D extends GLESRenderElement2D implements IPrimitiveRenderElement2D {
    private _typeKey:number;
    private _textureKey:number;
    /**
     * @en Type key proxied to native object's type field.
     * @zh 类型键代理到原生对象的 type 字段。
     */
    set typeKey(value: number) {
        this._nativeObj.typeKey = value;
        this._typeKey = value
    }

    get typeKey(): number {
        return this._typeKey;
    }

    /**
     * @en Texture key encoding shader define bits + texture ID. Proxied to native.
     * @zh 纹理键编码着色器宏定义位和纹理ID。代理到原生对象。
     */
    set textureKey(value: number) {
        this._nativeObj.textureKey = value;
        this._textureKey = value
    }

    get textureKey(): number {
        return this._textureKey;
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