import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";
import { PhysicsShape } from "../IPhysiscs2DFactory";

/**
 * @en 2D polygon collider. Concave polygons are currently not supported. If it is a concave polygon, manually split it into multiple convex polygons first.
 * The maximum number of vertices is `b2_maxPolygonVertices`, which defaults to 8. So it is not recommended to exceed 8 points, and it cannot be less than 3.
 * @zh 2D多边形碰撞体，暂时不支持凹多边形，如果是凹多边形，先手动拆分为多个凸多边形。
 * 节点个数最多是 `b2_maxPolygonVertices`，这数值默认是8，所以点的数量不建议超过8个，也不能小于3个。
 */
export class PolygonCollider extends ColliderBase {

    /**
     * @internal
     * @deprecated
     * 用逗号隔开的点的集合，格式：x,y,x,y ...
     */
    private _points: string = "50,0,100,100,0,100";

    /**@internal 顶点数据*/
    private _datas: number[] = [50, 0, 100, 100, 0, 100];

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

    /**
     * @en Vertex data in the format: x,y,x,y ...
     * @zh 顶点数据，格式：x,y,x,y ...
     */
    get datas(): number[] {
        return this._datas;
    }

    set datas(value: number[]) {
        if (!value) throw "PolygonCollider points cannot be empty";
        this._datas = value;
        this._needupdataShapeAttribute();
    }

    constructor() {
        super();
        this._physicShape = PhysicsShape.PolygonShape;
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
}