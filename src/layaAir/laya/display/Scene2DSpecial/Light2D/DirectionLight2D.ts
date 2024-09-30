import { MathUtils3D } from "../../../maths/MathUtils3D";
import { Rectangle } from "../../../maths/Rectangle";
import { Vector2 } from "../../../maths/Vector2";
import { BaseLight2D, Light2DType } from "./BaseLight2D";

/**
 * 线性灯光
 */
export class DirectionLight2D extends BaseLight2D {
    private _directionAngle: number = 0;
    private _directionVector: Vector2 = new Vector2(1, 0);

    constructor(directionAngle: number = 0) {
        super();
        this._type = Light2DType.Direction;
        this.directionAngle = directionAngle;
    }

    get directionAngle() {
        return this._directionAngle;
    }
    set directionAngle(value: number) {
        value %= 360;
        if (this._directionAngle !== value) {
            this._directionAngle = value;
            this._directionVector.x = Math.cos(this._directionAngle * Math.PI / 180);
            this._directionVector.y = Math.sin(this._directionAngle * Math.PI / 180);
            this._needUpdateLight = true;
        }
    }

    get directionVector() {
        return this._directionVector;
    }
    set directionVector(value: Vector2) {
        const len = Vector2.scalarLength(value);
        if (len > Number.EPSILON) {
            const x = value.x / len;
            const y = value.y / len;
            if (!MathUtils3D.nearEqual(this._directionVector.x, x) || !MathUtils3D.nearEqual(this._directionVector.y, y)) {
                this._directionAngle = Math.atan2(y, x);
                this._directionVector.x = x;
                this._directionVector.y = y;
                this._needUpdateLight = true;
            }
        }
    }

    /**
     * 获取灯光范围
     * @param screen 
     */
    getLightRange(screen?: Rectangle) {
        this._range.x = -10000;
        this._range.y = -10000;
        this._range.width = 20000;
        this._range.height = 20000;
        if (screen) {
            this._range.x += screen.x;
            this._range.y += screen.y;
            this._range.width += screen.width;
            this._range.height += screen.height;
        }
        return this._range;
    }

    /**
     * 是否在屏幕内
     * @param screen 
     */
    isInScreen(screen: Rectangle) {
        return true; //总是在屏幕内
    }
}