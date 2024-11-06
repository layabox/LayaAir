import { ColliderBase } from "./ColliderBase";
import { Physics2D } from "../Physics2D";
import { Sprite } from "../../display/Sprite";
import { PhysicsShape } from "../IPhysiscs2DFactory";

/**
 * @en 2D chain collider
 * @zh 2D 链形碰撞体
 */
export class ChainCollider extends ColliderBase {

    /**
     * @internal
     * @deprecated
     * 用逗号隔开的点的集合，格式：x,y,x,y ...
     */
    private _points: string = "0,0,100,0";

    /**@internal 顶点数据*/
    private _datas: number[] = [];

    /**@internal 是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作*/
    private _loop: boolean = false;

    /**
    * @deprecated
    * @en A collection of points separated by commas, format: x, y, x, y, ...
    * @zh 用逗号隔开的点的集合，格式：x,y,x,y ...
    */
    get points(): string {
        return this._points;
    }

    set points(value: string) {
        if (!value) throw "ChainCollider points cannot be empty";
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
     * @en Vertex data x,y,x,y ...
     * @zh 顶点数据 x,y,x,y ...
     */
    get datas(): number[] {
        return this._datas;
    }

    set datas(value: number[]) {
        if (!value) throw "ChainCollider datas cannot be empty";
        this._datas = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @en Whether it is a closed loop. Ensure there are no self-intersecting link shapes, as they may not function properly.
     * @zh 是否是闭环，注意不要有自相交的链接形状，否则它可能不能正常工作
     */
    get loop(): boolean {
        return this._loop;
    }

    set loop(value: boolean) {
        if (this._loop == value) return;
        this._loop = value;
        this._needupdataShapeAttribute();
    }

    constructor() {
        super();
        this._physicShape = PhysicsShape.ChainShape;
    }

    /**
     * @internal
     * @override
     */
    protected _setShapeData(shape: any): void {
        var len: number = this._datas.length;
        if (len % 2 == 1) throw "ChainCollider datas lenth must a multiplier of 2";
        Physics2D.I._factory.set_ChainShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this._loop, this.scaleX, this.scaleY);
    }

    /**
     * @en Called after being added to the node, different from Awake, onAdded will be called even if the node is not active.
     * @zh 被添加到节点后调用，和 Awake 不同的是即使节点未激活 onAdded 也会调用。
     */
    onAdded() {
        super.onAdded();
        if(this._datas.length == 0){
            let sp = this.owner as Sprite;
            this._datas.push(0, 0, sp.width, 0, 0, sp.height, sp.width, sp.height);
        }
    }


}