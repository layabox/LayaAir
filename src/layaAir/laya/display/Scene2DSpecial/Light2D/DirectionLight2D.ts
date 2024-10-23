import { MathUtils3D } from "../../../maths/MathUtils3D";
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
        this.calcLocalRange();
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
     * @zh 设置灯光角度
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
     * @zh 设置灯光角度矢量
     */
    set directionVector(value: Vector2) {
        const len = Vector2.scalarLength(value);
        if (len > Number.EPSILON) {
            const x = value.x / len;
            const y = value.y / len;
            if (!MathUtils3D.nearEqual(this._directionVector.x, x) || !MathUtils3D.nearEqual(this._directionVector.y, y)) {
                this._directionAngle = Math.atan2(y, x);
                this._directionVector.x = x;
                this._directionVector.y = y;
                this._needUpdateLightAndShadow = true;
            }
        }
    }

    /**
     * @internal
     * @param screen 
     */
    _getRange(screen?: Rectangle) {
        if (!this._worldRange)
            this._worldRange = new Rectangle();
        this.calcWorldRange(screen);
        return this._worldRange;
    }

    /**
     * @en Calculate light range（local）
     * @zh 计算灯光范围（局部坐标）
     */
    protected calcLocalRange() {
        this._localRange.x = -10000;
        this._localRange.y = -10000;
        this._localRange.width = 20000;
        this._localRange.height = 20000;
    }

    /**
     * @en Calculate light range（world）
     * @zh 计算灯光范围（世界坐标）
     * @param screen 
     */
    protected calcWorldRange(screen?: Rectangle) {
        super.calcWorldRange(screen);
        this._localRange.cloneTo(this._worldRange);
        if (screen) {
            this._worldRange.x += screen.x;
            this._worldRange.y += screen.y;
        }
    }

    /**
     * @en Is light inside the screen
     * @zh 是否在屏幕内
     * @param screen 
     */
    isInScreen(screen: Rectangle) {
        return true; //总是在屏幕内
    }
}