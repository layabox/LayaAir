import { Rectangle } from "../maths/Rectangle";
import { Vector2 } from "../maths/Vector2";
import { BaseLight2D, Light2DType } from "./BaseLight2D";
import { Light2DManager } from "./Light2DManager";

/**
 * 线性灯光
 */
export class DirectionLight2D extends BaseLight2D {
    private _directionAngle: number = 0; //灯光角度
    private _directionVector: Vector2 = new Vector2(1, 0); //灯光角度矢量
    private _shadowDistance: number = 500; //能够产生阴影的最远距离（遮光器距离屏幕超过该值将不产生阴影）
    private _shadowRange: Rectangle = new Rectangle(); //能够产生阴影的范围

    /**@ignore */
    constructor(directionAngle: number = 0) {
        super();
        this._type = Light2DType.Direction;
        this.directionAngle = directionAngle;
        this._calcLocalRange();
    }

    /**
     * @en Get direction light angle
     * @zh 获取灯光角度
     */
    get directionAngle() {
        return this._directionAngle;
    }

    /**
     * @en Set direction light angle
     * @param value Angle value
     * @zh 设置灯光角度
     * @param value 角度值
     */
    set directionAngle(value: number) {
        value %= 360;
        if (this._directionAngle !== value) {
            this._directionAngle = value;
            this._directionVector.x = Math.cos(this._directionAngle * Math.PI / 180);
            this._directionVector.y = Math.sin(this._directionAngle * Math.PI / 180);
            this._needUpdateLightAndShadow = true;
        }
    }

    /**
     * @en Get direction light vector
     * @zh 获取灯光角度矢量
     */
    get directionVector() {
        return this._directionVector;
    }

    /**
     * @en Set direction light vector
     * @param value Direction value
     * @zh 设置灯光角度矢量
     * @param value 方向矢量
     */
    set directionVector(value: Vector2) {
        const len = Vector2.scalarLength(value);
        if (len > 0) {
            const x = value.x / len;
            const y = value.y / len;
            if (value === this._directionVector
                || this._directionVector.x !== x || this._directionVector.y !== y) {
                this._directionAngle = Math.atan2(y, x) * 180 / Math.PI;
                this._directionVector.x = x;
                this._directionVector.y = y;
                this._needUpdateLightAndShadow = true;
            }
        }
    }

    /**
     * @en Direction light max shadow distance
     * @zh 阴影最远距离
     */
    get shadowDistance() {
        return this._shadowDistance;
    }

    /**
     * @en Direction light max shadow distance
     * @param value Distance value
     * @zh 阴影最远距离
     * @param value 距离值
     */
    set shadowDistance(value: number) {
        if (this._shadowDistance !== value) {
            this._shadowDistance = value;
            this._needUpdateLightAndShadow = true;
            (this.owner?.scene?._light2DManager as Light2DManager)?.needCollectOccluderInLight(this.layerMask);
        }
    }

    /**
     * @internal
     * @param screen 屏幕位置和尺寸
     */
    _getWorldRange(screen?: Rectangle) {
        if (screen && !this._screenCache.equals(screen)) {
            screen.cloneTo(this._screenCache);
            this._calcWorldRange(screen);
        }
        return this._worldRange;
    }

    /**
     * 计算灯光范围（局部坐标）
     */
    protected _calcLocalRange() {
        super._calcLocalRange();

        this._localRange.x = -Light2DManager.DIRECTION_LIGHT_SIZE / 2;
        this._localRange.y = -Light2DManager.DIRECTION_LIGHT_SIZE / 2;
        this._localRange.width = Light2DManager.DIRECTION_LIGHT_SIZE;
        this._localRange.height = Light2DManager.DIRECTION_LIGHT_SIZE;
    }

    /**
     * 计算灯光范围（世界坐标）
     * @param screen 屏幕位置和尺寸
     */
    protected _calcWorldRange(screen?: Rectangle) {
        super._calcWorldRange(screen);

        this._worldRange.x = this._localRange.x + (screen ? (screen.x | 0) : 0);
        this._worldRange.y = this._localRange.y + (screen ? (screen.y | 0) : 0);
        this._worldRange.width = this._localRange.width;
        this._worldRange.height = this._localRange.height;
        this._lightRange.x = this._worldRange.x;
        this._lightRange.y = this._worldRange.x;
        this._lightRange.width = this._worldRange.width;
        this._lightRange.height = this._worldRange.height;
    }

    /**
     * @internal
     * 获取阴影范围（世界坐标）
     * @param screen 屏幕位置和尺寸
     */
    _getShadowRange(screen?: Rectangle) {
        this._shadowRange.x = -this._shadowDistance / 2 + (screen ? (screen.x | 0) : 0);
        this._shadowRange.y = -this._shadowDistance / 2 + (screen ? (screen.y | 0) : 0);
        this._shadowRange.width = Light2DManager.DIRECTION_LIGHT_SIZE;
        this._shadowRange.height = Light2DManager.DIRECTION_LIGHT_SIZE;
        return this._shadowRange;
    }

    /**
     * @internal
     * 灯光是否在指定范围内
     */
    _isInRange(range: Rectangle) {
        return true; //总是在指定范围内
    }

    /**
     * @internal
     * 灯光是否在屏幕内
     * @param screen 屏幕位置和尺寸
     */
    _isInScreen(screen: Rectangle) {
        return true; //总是在屏幕内
    }
}