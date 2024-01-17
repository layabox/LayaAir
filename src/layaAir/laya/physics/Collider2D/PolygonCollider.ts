import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";
import { PhysicsShape } from "./ColliderStructInfo";
import { Sprite } from "../../display/Sprite";

/**
 * 2D多边形碰撞体，暂时不支持凹多边形，如果是凹多边形，先手动拆分为多个凸多边形
 * 节点个数最多是b2_maxPolygonVertices，这数值默认是8，所以点的数量不建议超过8个，也不能小于3个
 */
export class PolygonCollider extends ColliderBase {

    /**
     * @deprecated
     * 用逗号隔开的点的集合，格式：x,y,x,y ...
     */
    private _points: string = "50,0,100,100,0,100";

    /**顶点数据*/
    private _datas: number[] = [];

    constructor() {
        super();
        this._physicShape = PhysicsShape.PolygonShape;
    }
    onAdded() {
        let sp = this.owner as Sprite;
        this._datas.push(0, 0, sp.width, sp.height * 0.5, 0, sp.height);
    }

    /**
    * @override
    */
    protected _setShapeData(shape: any): void {
        var len: number = this.datas.length;
        if (len < 6) throw "PolygonCollider points must be greater than 3";
        if (len % 2 == 1) throw "PolygonCollider points lenth must a multiplier of 2";
        Physics2D.I._factory.set_PolygonShape_data(shape, this.pivotoffx, this.pivotoffy, this.datas, this.scaleX, this.scaleY);
    }

    /**
     * @deprecated
     * 用逗号隔开的点的集合，格式：x,y,x,y ...
     */
    get points(): string {
        return this._points;
    }

    set points(value: string) {
        if (!value) throw "PolygonCollider points cannot be empty";
        this._points = value;
        var arr: any[] = this._points.split(",");
        let length = arr.length;
        this._datas = [];
        for (var i: number = 0, n: number = length; i < n; i++) {
            this._datas.push(parseInt(arr[i]))
        }
        this._needupdataShapeAttribute();
    }

    /**顶点数据 x,y,x,y ...*/
    get datas(): number[] {
        return this._datas;
    }

    set datas(value: number[]) {
        if (!value) throw "PolygonCollider points cannot be empty";
        this._datas = value;
        this._needupdataShapeAttribute();
    }
}