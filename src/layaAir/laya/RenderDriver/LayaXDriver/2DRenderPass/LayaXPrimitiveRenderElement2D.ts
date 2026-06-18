import { IPrimitiveRenderElement2D } from "../../DriverDesign/2DRenderPass/IRenderElement2D";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { LayaXShaderData } from "../RenderDevice/LayaXShaderData";
import { LayaXRenderElement2D } from "./LayaXRenderElement2D";

export class LayaXPrimitiveRenderElement2D extends LayaXRenderElement2D
    implements IPrimitiveRenderElement2D {

    protected init(): void {
        this._nativeObj = new (window as any).conchLayaXPrimitiveRenderElement2D();
    }


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
