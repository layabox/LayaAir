import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";

/**
 * 2D线形碰撞体
 */
export class ChainCollider extends ColliderBase {
    /**相对节点的x轴偏移*/
    private _x: number = 0;
    /**相对节点的y轴偏移*/
    private _y: number = 0;
    /**用逗号隔开的点的集合，格式：x,y,x,y ...*/
    private _points: string = "0,0,100,0";
    /**是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作*/
    private _loop: boolean = false;
    /**
     * @override
     */
    protected getDef(): any {
        if (!this._shape) {
            this._shape = Physics2D.I._factory.create_ChainShape();
            this._setShape(false);
        }
        this.label = (this.label || "ChainCollider");
        return super.getDef();
    }

    private _setShape(re: boolean = true): void {
        var arr: any[] = this._points.split(",");
        var len: number = arr.length;
        if (len % 2 == 1) throw "ChainCollider points lenth must a multiplier of 2";

        Physics2D.I._factory.set_ChainShape_data(this._shape, this._x, this._y, arr, this._loop)


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

    /**用逗号隔开的点的集合，格式：x,y,x,y ...*/
    get points(): string {
        return this._points;
    }

    set points(value: string) {
        if (!value) throw "ChainCollider points cannot be empty";
        this._points = value;
        if (this._shape) this._setShape();
    }

    /**是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作*/
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        this._loop = value;
        if (this._shape) this._setShape();
    }
}