import { ISphereColliderShape } from "../../interface/Shape/ISphereColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";

export class btSphereColliderShape extends btColliderShape implements ISphereColliderShape {
    /**@internal */
    private _radius: number = -1;

    constructor() {
        super();
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_SPHERE;
    }

    protected _createShape() {
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        this._btShape = bt.btSphereShape_create(this._radius);
    }

    setRadius(radius: number): void {
        if (this._radius == radius)
            return;
        this._radius = radius;
        this._createShape();
    }
}