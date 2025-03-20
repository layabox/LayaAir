import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

export class EdgeShape extends Physics2DShapeBase {

    /**@internal 顶点数据*/
    private _datas: number[] = [0, 0, 100, 0];

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
        this._updateShapeData();
    }

    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.EdgeShape;
    }

    protected _createShape(): void {
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, EPhysics2DShape.EdgeShape, this._box2DShapeDef);
        this._updateShapeData();
    }

    protected _updateShapeData(): void {
        if (!LayaEnv.isPlaying || !this._body) return;

        var len: number = this._datas.length;
        if (len % 2 == 1) throw "EdgeCollider points lenth must a multiplier of 2";
        let shape: any = Physics2D.I._factory.getShapeByDef(this._box2DShapeDef, this._shapeDef.shapeType);
        Physics2D.I._factory.set_EdgeShape_data(shape, this.pivotoffx, this.pivotoffy, this._datas, this.scaleX, this.scaleY);
    }

    clone(): EdgeShape {
        let dest: EdgeShape = new EdgeShape();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: EdgeShape): void {
        super.cloneTo(destObject);
        destObject.datas = this.datas;
    }

}