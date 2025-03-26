import { LayaEnv } from "../../../LayaEnv";
import { EPhysics2DShape } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DShapeBase } from "./Physics2DShapeBase";

/**
 * @en 2Dphysics polygon collider. Concave polygons are currently not supported. If it is a concave polygon, manually split it into multiple convex polygons first.
 * The maximum number of vertices is `b2_maxPolygonVertices`, which defaults to 8. So it is not recommended to exceed 8 points, and it cannot be less than 3.
 * @zh 2D物理多边形碰撞体，暂时不支持凹多边形，如果是凹多边形，先手动拆分为多个凸多边形。
 * 节点个数最多是 `b2_maxPolygonVertices`，这数值默认是8，所以点的数量不建议超过8个，也不能小于3个。
 */
export class PolygonShape2D extends Physics2DShapeBase {

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
        let shape: any = this._box2DShape ? this._box2DShape.shape : Physics2D.I._factory.getShapeByDef(this._box2DShapeDef, this._shapeDef.shapeType);
        Physics2D.I._factory.set_PolygonShape_data(shape, this.pivotoffx, this.pivotoffy, this.datas, this.scaleX, this.scaleY);
    }

    clone(): PolygonShape2D {
        let dest: PolygonShape2D = new PolygonShape2D();
        this.cloneTo(dest);
        return dest;
    }

    cloneTo(destObject: PolygonShape2D): void {
        super.cloneTo(destObject);
        destObject.datas = this.datas;
    }

}