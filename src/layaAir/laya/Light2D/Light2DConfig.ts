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
     * @en ambient light color
     * @zh 环境光颜色
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