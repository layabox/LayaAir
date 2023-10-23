import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";

/**
 * 2D边框碰撞体
 */
export class EdgeCollider extends ColliderBase {
    /**相对节点的x轴偏移*/
    private _x: number = 0;
    /**相对节点的y轴偏移*/
    private _y: number = 0;
    /**用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y*/
    private _points: string = "0,0,100,0";
    /**
     * @override
     */
    protected getDef(): any {
        if (!this._shape) {
            this._shape = Physics2D.I._factory.create_EdgeShape()
            this._setShape(false);
        }
        this.label = (this.label || "EdgeCollider");
        return super.getDef();
    }

    private _setShape(re: boolean = true): void {
        var arr: any[] = this._points.split(",");
        var len: number = arr.length;
        if (len % 2 == 1) throw "EdgeCollider points lenth must a multiplier of 2";


        Physics2D.I._factory.set_EdgeShape_data(this._shape, this._x, this._y, arr);
        if (re) this.refresh();
    }

    /**相对节点的x轴偏移*/
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
        if (this._shape) this._setShape();
    }

    /**相对节点的y轴偏移*/
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
        if (this._shape) this._setShape();
    }

    /**用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y*/
    get points(): string {
        return this._points;
    }

    set points(value: string) {
        if (!value) throw "EdgeCollider points cannot be empty";
        this._points = value;
        if (this._shape) this._setShape();
    }
}