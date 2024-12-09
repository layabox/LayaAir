import { Rectangle } from "../../../maths/Rectangle";
import { Texture2D } from "../../../resource/Texture2D";
import { Browser } from "../../../utils/Browser";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { BaseLight2D, Light2DType } from "../Light2D/BaseLight2D";
import { Light2DManager } from "./Light2DManager";

/**
 * 精灵灯光
 */
export class SpriteLight2D extends BaseLight2D {
    declare owner: Sprite;

    /**
     * @ignore
     */
    constructor() {
        super();
        this._type = Light2DType.Sprite;
    }

    /**
     * @en Set the sprite texture
     * @param value Texture object
     * @zh 设置精灵贴图
     * @param value 贴图对象
     */
    set spriteTexture(value: Texture2D) {
        if (this._texLight === value)
            return;
        if (this._texLight)
            this._texLight._removeReference(1);
        this._texLight = value;
        if (value)
            this._texLight._addReference(1);
        this._needUpdateLight = true;
        this._needUpdateLightLocalRange = true;
        this._needUpdateLightWorldRange = true;
        super._clearScreenCache();
    }

    /**
     * @en Get the sprite texture
     * @zh 获取精灵贴图
     */
    get spriteTexture() {
        return this._texLight as Texture2D;
    }

    /**
     * @internal
     * 计算灯光范围（局部坐标）
     */
    protected _calcLocalRange() {
        super._calcLocalRange();

        const w = (this._texLight ? this._texLight.width : 100) * Browser.pixelRatio | 0;
        const h = (this._texLight ? this._texLight.height : 100) * Browser.pixelRatio | 0;
        this._localRange.x = -w / 2;
        this._localRange.y = -h / 2;
        this._localRange.width = w;
        this._localRange.height = h;
    }

    /**
     * @internal
     * 计算灯光范围（世界坐标）
     * @param screen 屏幕位置和尺寸
     */
    protected _calcWorldRange(screen?: Rectangle) {
        super._calcWorldRange(screen);
        this._lightScaleAndRotation();

        const x = this._localRange.x;
        const y = this._localRange.y;
        const w = this._localRange.width;
        const h = this._localRange.height;
        const sx = Math.abs(this.owner.globalScaleX);
        const sy = Math.abs(this.owner.globalScaleY);
        const px = this.owner.globalPosX * Browser.pixelRatio;
        const py = this.owner.globalPosY * Browser.pixelRatio;
        const m = Math.max(w * sx, h * sy) | 0;
        this._worldRange.x = (px - m / 2) | 0;
        this._worldRange.y = (py - m / 2) | 0;
        this._worldRange.width = m;
        this._worldRange.height = m;
        this._lightRange.x = (px + x) | 0;
        this._lightRange.y = (py + y) | 0;
        this._lightRange.width = w;
        this._lightRange.height = h;
    }

    /**
     * @en Render light texture
     * @param scene Scene object
     * @zh 渲染灯光贴图
     * @param scene 场景对象
     */
    renderLightTexture(scene: Scene) {
        super.renderLightTexture(scene);
        if (this._needUpdateLight) {
            this._needUpdateLight = false;
            this._needUpdateLightAndShadow = true;

            if (Light2DManager.DEBUG)
                console.log('update sprite light texture');
        }
    }

    /**
     * @internal
     * 销毁
     */
    protected _onDestroy() {
        super._onDestroy();
        if (this._texLight) {
            this._texLight._removeReference(1);
            this._texLight = null;
        }
    }
}