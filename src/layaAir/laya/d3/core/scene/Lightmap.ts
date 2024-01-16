import { Texture2D } from "../../../resource/Texture2D";
import { ILightMapData } from "../../RenderDriverLayer/RenderModuleData/ILightMapData";
import { Laya3DRender } from "../../RenderObjs/Laya3DRender";

/**
 * 光照贴图。
 */
export class Lightmap {
    static ApplyLightmapEvent: string = "ApplyLightmap";

    /**@internal */
    _dataModule: ILightMapData;

    /** 光照贴图颜色。 */
    private _lightmapColor: Texture2D;

    public get lightmapColor(): Texture2D {
        return this._lightmapColor;
    }

    public set lightmapColor(value: Texture2D) {
        if (this._lightmapColor == value)
            return
        this._lightmapColor && this._lightmapColor._removeReference();
        this._lightmapColor = value;
        if (value) {
            value._addReference();
            this._dataModule.lightmapColor = value._texture;
        } else {
            this._dataModule.lightmapColor = null;
        }


    }

    /** 光照贴图方向。 */
    private _lightmapDirection: Texture2D;

    public get lightmapDirection(): Texture2D {
        return this._lightmapDirection;
    }

    public set lightmapDirection(value: Texture2D) {
        if (this._lightmapDirection == value)
            return
        this._lightmapDirection && this._lightmapDirection._removeReference();
        this._lightmapDirection = value;
        if (value) {
            value._addReference();
            this._dataModule.lightmapDirection = value._texture;
        } else {
            this._dataModule.lightmapDirection = null;
        }
    }

    /**
     * @internal
     */
    constructor() {
        this._dataModule = Laya3DRender.renderOBJCreate.createLightmapData();
    }
}