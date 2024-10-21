import { Rectangle } from "../../../maths/Rectangle";
import { Texture2D } from "../../../resource/Texture2D";
import { Browser } from "../../../utils/Browser";
import { Scene } from "../../Scene";
import { Sprite } from "../../Sprite";
import { BaseLight2D, Light2DType } from "../Light2D/BaseLight2D"
import { Light2DManager } from "./Light2DManager";
import { ShowRenderTarget } from "./ShowRenderTarget";

/**
 * 精灵灯光
 */
export class SpriteLight2D extends BaseLight2D {
    /**
     * @ignore
     */
    constructor() {
        super();
        this._type = Light2DType.Sprite;
    }

    /**
     * @en Set the sprite texture
     * @zh 设置精灵贴图
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
        this._needUpdateLightWorldRange = true;
        this.calcLocalRange();
    }

    /**
     * @en Get the sprite texture
     * @zh 获取精灵贴图
     */
    get spriteTexture() {
        return this._texLight as Texture2D;
    }

    /**
     * @en Calculate light range（local）
     * @zh 计算灯光范围（局部坐标）
     */
    protected calcLocalRange() {
        const w = (this._texLight ? this._texLight.width : 100) * Browser.pixelRatio | 0;
        const h = (this._texLight ? this._texLight.height : 100) * Browser.pixelRatio | 0;
        this._localRange.x = (-0.5 * w) | 0;
        this._localRange.y = (-0.5 * h) | 0;
        this._localRange.width = w;
        this._localRange.height = h;
    }

    /**
     * @en Calculate light range（world）
     * @zh 计算灯光范围（世界坐标）
     * @param screen 
     */
    protected calcWorldRange(screen?: Rectangle) {
        super.calcWorldRange(screen);
        const w = (this._texLight ? this._texLight.width : 100) * (this.owner as Sprite).globalScaleX * Browser.pixelRatio | 0;
        const h = (this._texLight ? this._texLight.height : 100) * (this.owner as Sprite).globalScaleY * Browser.pixelRatio | 0;
        this._worldRange.x = (-0.5 * w + (this.owner as Sprite).globalPosX * Browser.pixelRatio) | 0;
        this._worldRange.y = (-0.5 * h + (this.owner as Sprite).globalPosY * Browser.pixelRatio) | 0;
        this._worldRange.width = w;
        this._worldRange.height = h;
        (this.owner?.scene as Scene)?._light2DManager?.needUpdateLightRange();
    }

    /**
     * @en Render light texture
     * @zh 渲染灯光贴图
     * @param scene 
     */
    renderLightTexture(scene: Scene) {
        super.renderLightTexture(scene);
        if (this._needUpdateLight) {
            this._needUpdateLight = false;
            this.updateMark++;
            this._needUpdateLightAndShadow = true;
            if (this.showLightTexture) {
                if (!this.showRenderTarget)
                    this.showRenderTarget = new ShowRenderTarget(scene, this._texLight, 0, 0, 300, 300);
                else this.showRenderTarget.setRenderTarget(this._texLight);
            }
            if (Light2DManager.DEBUG)
                console.log('update sprite light texture');
        }
    }

    /**
     * @en Destroy
     * @zh 销毁
     */
    protected _onDestroy() {
        super._onDestroy();
        if (this._texLight) {
            this._texLight._removeReference(1);
            this._texLight = null;
        }
    }
}