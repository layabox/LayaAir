import { ColliderBase } from "./ColliderBase";
import { Physics } from "./Physics";
import { ClassUtils } from "../utils/ClassUtils";
/**
	 * 2D多边形碰撞体，暂时不支持凹多边形，如果是凹多边形，先手动拆分为多个凸多边形
	 * 节点个数最多是b2_maxPolygonVertices，这数值默认是8，所以点的数量不建议超过8个，也不能小于3个
	 */
export class PolygonCollider extends ColliderBase {
    /**相对节点的x轴偏移*/
    private _x: number = 0;
    /**相对节点的y轴偏移*/
    private _y: number = 0;
    /**用逗号隔开的点的集合，格式：x,y,x,y ...*/
    private _points: string = "50,0,100,100,0,100";
    /**
     * @override
     */
    protected getDef(): any {
        if (!this._shape) {
            this._shape = new (<any>window).box2d.b2PolygonShape();
            this._setShape(false);
        }
        this.label = (this.label || "PolygonCollider");
        return super.getDef();
    }

    private _setShape(re: boolean = true): void {
        var arr: any[] = this._points.split(",");
        var len: number = arr.length;
        if (len < 6) throw "PolygonCollider points must be greater than 3";
        if (len % 2 == 1) throw "PolygonCollider points lenth must a multiplier of 2";

        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(new (<any>window).box2d.b2Vec2((this._x + parseInt(arr[i])) / Physics.PIXEL_RATIO, (this._y + parseInt(arr[i + 1])) / Physics.PIXEL_RATIO));
        }

        this._shape.Set(ps, len / 2);
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
        if (!value) throw "PolygonCollider points cannot be empty";
        this._points = value;
        if (this._shape) this._setShape();
    }
}

ClassUtils.regClass("laya.physics.PolygonCollider", PolygonCollider);
ClassUtils.regClass("Laya.PolygonCollider", PolygonCollider);