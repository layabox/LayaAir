import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";

export class LayaXPrimitiveRenderElement2D extends LayaXRenderElement2D
    implements IPrimitiveRenderElement2D {

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXPrimitiveRenderElement2D();
    }

    /**
     * @en Type key proxied to native object's type field.
     * @zh 类型键代理到原生对象的 type 字段。
     */
    set typeKey(value: number) {
        this._nativeObj.type = value;
    }

    get typeKey(): number {
        return this._nativeObj.type;
    }

    /**
     * @en Texture key encoding shader define bits + texture ID. Proxied to native.
     * @zh 纹理键编码着色器宏定义位和纹理ID。代理到原生对象。
     */
    set textureKey(value: number) {
        this._nativeObj.textureKey = value;
    }

    get textureKey(): number {
        return this._nativeObj.textureKey;
    }

    private _primitiveShaderData: ShaderData;
    get primitiveShaderData(): ShaderData { return this._primitiveShaderData; }
    set primitiveShaderData(data: ShaderData) {
        this._primitiveShaderData = data;
        this._nativeObj.setPrimitiveShaderData(data ? (data as any)._nativeObj : null);
    }
}
