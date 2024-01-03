import { Vector3 } from "../../../maths/Vector3";
import { IBoxColliderShape } from "../../interface/Shape/IBoxColliderShape";
import { btPhysicsCreateUtil } from "../btPhysicsCreateUtil";
import { btColliderShape } from "./btColliderShape";

export class btBoxColliderShape extends btColliderShape implements IBoxColliderShape {
    /** @internal */
    private _btSize: number;
    /** @internal */
    private _size: Vector3;

    constructor() {
        super();
        let bt = btPhysicsCreateUtil._bt;
        this._size = new Vector3(0.5, 0.5, 0.5);
        this._btSize = bt.btVector3_create(0, 0, 0);
    }

    private changeBoxShape() {
        let bt = btPhysicsCreateUtil._bt;
        if (this._btShape) {
            bt.btCollisionShape_destroy(this._btShape);
        }
        this._createShape();
    }

    protected _createShape() {
        let bt = btPhysicsCreateUtil._bt;
        bt.btVector3_setValue(this._btSize, this._size.x / 2, this._size.y / 2, this._size.z / 2);
        this._btShape = bt.btBoxShape_create(this._btSize);
    }

    protected _getType(): number {
        return this._type = btColliderShape.SHAPETYPES_BOX;
    }

    setSize(size: Vector3): void {
        if (this._btShape && size.equal(this._size)) {
            return;
        }
        this._size.setValue(size.x, size.y, size.z);
        this.changeBoxShape();
    }

    destroy(): void {
        super.destroy();
        //destroy _btsize
        this._size = null;
        this._btSize = null;
    }

}