import { Color } from "../maths/Color";
import { Vector3 } from "../maths/Vector3";

/**
 * 2D灯光全局配置参数
 */
export class Light2DConfig {
    /**
     * 配置变更计数器，用于检测配置是否发生变化
     */
    changeCount: number = 0;

    notifyChange(): void {
        this.changeCount++;
    }

    private _lightDirection: Vector3 = new Vector3(-1, 0, 1);
    /**
     * @en Light direction vector (affects normal effect)
     * @zh 灯光方向矢量（影响法线效果）
     */
    get lightDirection(): Vector3 {
        return this._lightDirection;
    }
    set lightDirection(value: Vector3) {
        if (this._lightDirection !== value) {
            this._lightDirection = value;
            this.notifyChange();
        }
    }

    private _ambientColor: Color = new Color(0.2, 0.2, 0.2, 0);
    /**
     * @en ambient light color，provide basic lighting without direction and shadow, when there is no light, set the color can ensure the lowest visibility, when there is light, it can be superimposed to enhance the brightness and darkness, and at the same time, through the adjustment of color and intensity to unify the scene tone and create different atmosphere effects.
     * @zh 环境光颜色，提供无方向、无阴影的基础照明，没有灯光时设置颜色可保证最低可见度，存在灯光时与其叠加以增强明暗层次，同时通过调整颜色和强度来统一场景色调并营造不同的氛围效果。
     */
    get ambientColor(): Color {
        return this._ambientColor;
    }
    set ambientColor(value: Color) {
        if (this._ambientColor !== value) {
            this._ambientColor = value;
        }
        this.notifyChange();
    }

    private _ambientLayerMask: number = -1;
    /**
     * @en Layers affected by ambient light (affects all layers by default)
     * @zh 环境光影响的层（默认影响所有层）
     */
    get ambientLayerMask(): number {
        return this._ambientLayerMask;
    }
    set ambientLayerMask(value: number) {
        if (this._ambientLayerMask !== value) {
            this._ambientLayerMask = value;
            this.notifyChange();
        }
    }

    private _multiSamples: number = 4;
    /**
     * @en Light and shadow map multisampling number (1 or 4, affects jagged shadow edges)
     * @zh 光影图多重采样数（1或4，影响阴影边缘锯齿）
     */
    get multiSamples(): number {
        return this._multiSamples;
    }
    set multiSamples(value: number) {
        if (this._multiSamples !== value) {
            this._multiSamples = value;
            this.notifyChange();
        }
    }
}