import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { BaseLight2D, Light2DType } from "./BaseLight2D";

/**
 * 线性灯光
 */
export class DirectionLight2D extends BaseLight2D {
    private _directionAngle: number = 0; //灯光角度
    private _directionVector: Vector2 = new Vector2(1, 0); //灯光角度矢量

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
            if (this._directionVector.x !== x || this._directionVector.y !== y) {
                this._directionAngle = Math.atan2(y, x);
                this._directionVector.x = x;
                this._directionVector.y = y;
                this._needUpdateLightAndShadow = true;
            }
        }
    }

    /**
     * @en Get light pos
     * @zh 获取灯光位置
     */
    get lightPos() {
        this._lightPos.x = -this.directionVector.x * 1.0e5;
        this._lightPos.y = -this.directionVector.y * 1.0e5;
        return this._lightPos;
    }

    /**
     * @internal
     * @param screen 屏幕位置和尺寸
     */
    _getRange(screen?: Rectangle) {
        if (screen && !this._screenCache.equals(screen)) {
            screen.cloneTo(this._screenCache);
            this._calcWorldRange(screen);
        }
        return this._worldRange;
    }

    /**
     * @internal
     * 计算灯光范围（局部坐标）
     */
    protected _calcLocalRange() {
        super._calcLocalRange();
        this._localRange.x = -1.0e4;
        this._localRange.y = -1.0e4;
        this._localRange.width = 2.0e4;
        this._localRange.height = 2.0e4;
    }

    /**
     * @internal
     * 计算灯光范围（世界坐标）
     * @param screen 屏幕位置和尺寸
     */
    protected _calcWorldRange(screen?: Rectangle) {
        super._calcWorldRange(screen);
        this._localRange.cloneTo(this._worldRange);
        if (screen) {
            this._worldRange.x += screen.x;
            this._worldRange.y += screen.y;
        }
    }

    /**
     * @en Is light inside the screen
     * @param screen Screen position and size
     * @zh 是否在屏幕内
     * @param screen 屏幕位置和尺寸
     */
    isInScreen(screen: Rectangle) {
        return true; //总是在屏幕内
    }
}