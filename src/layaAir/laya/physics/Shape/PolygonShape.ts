import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../Factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

export class PolygonShape extends Physics2DShapeBase {

    /**@internal 顶点数据*/
    private _datas: number[] = [50, 0, 100, 100, 0, 100];

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
        this._updateShapeData();
    }

    constructor() {
        super();
        this._shapeDef.shapeType = EPhysics2DShape.PolygonShape;
    }

    protected _createShape(): void {
        this._box2DShape = Physics2D.I._factory.createShape(this._physics2DManager.box2DWorld, this._box2DBody, EPhysics2DShape.PolygonShape, this._box2DShapeDef);
        this._updateShapeData();
    }

    protected _updateShapeData(): void {
        if (!LayaEnv.isPlaying || !this._body) return;

        var len: number = this.datas.length;
        if (len < 6) throw "PolygonCollider points must be greater than 3";
        if (len % 2 == 1) throw "PolygonCollider points lenth must a multiplier of 2";
        let shape: any = Physics2D.I._factory.getShapeByDef(this._box2DShapeDef, this._shapeDef.shapeType);
        Physics2D.I._factory.set_PolygonShape_data(shape, this.pivotoffx, this.pivotoffy, this.datas, this.scaleX, this.scaleY);
    }

    clone(): PolygonShape {
        let dest: PolygonShape = new PolygonShape();
        this.cloneTo(dest);
        return dest;
    }
    
    cloneTo(destObject: PolygonShape): void {
        super.cloneTo(destObject);
        destObject.datas = this.datas;
    }
    
}