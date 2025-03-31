import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

/**
 * @en 2Dphysics chain shape
 * @zh 2D物理链形碰撞形状
 */
export class ChainShape2D extends Physics2DShapeBase {

    /**@internal 顶点数据*/
    private _datas: number[] = [0, 0, 100, 0];

    /**@internal 是否是闭环，注意不要有自相交的链接形状，它可能不能正常工作*/
    private _loop: boolean = false;

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
        this._updateShapeData();

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
        this._updateShapeData();
    }

    /**
    * @en Constructor method
    * @zh 构造方法
    */
    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.ChainShape;
    }

    /**
     * @internal
     * @override
     */
    protected _createShape(): void {
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, EPhysics2DShape.ChainShape, this._box2DShapeDef);
        this._updateShapeData();
    }

    /**
     * @internal
     * @override
     */
    protected _updateShapeData(): void {
        if (!LayaEnv.isPlaying || !this._body) return;
        var len: number = this._datas.length;
        if (len % 2 == 1) throw "ChainCollider datas lenth must a multiplier of 2";
        let shape: any = this._box2DShape ? Physics2D.I._factory.getShape(this._box2DShape, this._shapeDef.shapeType) : Physics2D.I._factory.getShapeByDef(this._box2DShapeDef, this._shapeDef.shapeType);
        Physics2D.I._factory.set_ChainShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this._loop, this.scaleX, this.scaleY);
    }

    clone(): ChainShape2D {
        let dest: ChainShape2D = new ChainShape2D();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: ChainShape2D): void {
        super.cloneTo(destObject);
        destObject.datas = this.datas;
        destObject.loop = this.loop;
    }

}