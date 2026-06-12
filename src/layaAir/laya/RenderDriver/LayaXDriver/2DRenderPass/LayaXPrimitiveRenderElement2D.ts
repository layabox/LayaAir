import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXShaderData } from "../RenderDevice/LayaXShaderData";
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";

export class LayaXPrimitiveRenderElement2D extends LayaXRenderElement2D
    implements IPrimitiveRenderElement2D {
    private _typeKey:number;
    private _textureKey:number;
    
    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXPrimitiveRenderElement2D();
    }

    
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

    // Web primitive 第 1 层选择：!material && primitive → primitive sd
    protected _pickMaterialSD(): LayaXShaderData | null {
        return this._materialShaderData ?? this._primitiveShaderData ?? null;
    }

    private _primitiveShaderData: LayaXShaderData;
    get primitiveShaderData(): ShaderData { return this._primitiveShaderData; }
    set primitiveShaderData(data: ShaderData) {
        if (this._primitiveShaderData) this._primitiveShaderData._removeRenderStateListener(this);
        this._primitiveShaderData = data as LayaXShaderData;
        this._nativeObj.setPrimitiveShaderData(data ? (data as any)._nativeObj : null);
        if (this._primitiveShaderData) {
            this._primitiveShaderData._addRenderStateListener(this);
            this._onRenderStateChanged();
        }
    }

    destroy(): void {
        if (this._primitiveShaderData) this._primitiveShaderData._removeRenderStateListener(this);
        super.destroy();
    }
}
