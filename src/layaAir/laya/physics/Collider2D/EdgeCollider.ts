import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";
import { PhysicsShape } from "./ColliderStructInfo";

/**
 * @en 2D edge collider.
 * @zh 2D边缘碰撞体。
 */
export class EdgeCollider extends ColliderBase {
    /**
     * @internal
     * @deprecated
     * 用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y
     */
    private _points: string = "0,0,100,0";

    /**@internal 顶点数据*/
    private _datas: number[] = [0, 0, 100, 0];

    /**
     * @deprecated
     * 用逗号隔开的点的集合，注意只有两个点，格式：x,y,x,y*/
    get points(): string {
        return this._points;
    }

    set points(value: string) {
        if (!value) throw "EdgeCollider points cannot be empty";
        this._points = value;
        var arr: any[] = this._points.split(",");
        let length = arr.length;
        this._datas = [];
        for (var i: number = 0, n: number = length; i < n; i++) {
            this._datas.push(parseInt(arr[i]));
        }
        this._needupdataShapeAttribute();
    }

    /**
     * @en Vertex data in the format of x,y,x,y ...
     * @zh 顶点数据，格式为 x,y,x,y ...
     */
    get datas(): number[] {
        return this._datas;
    }

    set datas(value: number[]) {
        if (!value) throw "EdgeCollider points cannot be empty";
        this._datas = value;
        this._needupdataShapeAttribute();
    }

    constructor() {
        super();
        this._physicShape = PhysicsShape.EdgeShape;
    }

    /**
     * @internal
     * @override
     */
    protected _setShapeData(shape: any): void {
        var len: number = this._datas.length;
        if (len % 2 == 1) throw "EdgeCollider points lenth must a multiplier of 2";
        Physics2D.I._factory.set_EdgeShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this.scaleX, this.scaleY);
    }
}