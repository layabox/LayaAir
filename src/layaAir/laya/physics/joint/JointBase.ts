import { Component } from "../../components/Component"
import { Sprite } from "../../display/Sprite";
import { Point } from "../../maths/Point";
import { Vector2 } from "../../maths/Vector2";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { IPhysics2DFactory } from "../Factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D"
import { Physics2DWorldManager } from "../Physics2DWorldManager";

const _tempV0: Vector2 = new Vector2();

/**
 * @en Joint base class
 * @zh 关节基类
 */
export class JointBase extends Component {

    /**@internal 原生关节对象*/
    protected _joint: any;

    /**@internal */
    protected _factory: IPhysics2DFactory;

    declare owner: Sprite;

    protected _physics2DManager: Physics2DWorldManager;

    protected _box2DJointDef: any;

    /**
     * @readonly
     * @en [read-only] Native joint object.
     * @zh [只读]原生关节对象。
     */
    get joint(): any {
        if (!this._joint) this._createJoint();
        return this._joint;
    }

    constructor() {
        super();
        this._factory = Physics2D.I._factory;
        this._singleton = false;
    }

    getJointRecationForce(): Vector2 {
        let force: any;
        if (this._joint) {
            force = Physics2D.I._factory.get_joint_recationForce(this._joint);
        }
        _tempV0.x = force.x;
        _tempV0.y = force.y;
        return _tempV0;
    }

    getJointRecationTorque(): number {
        let torque: number;
        if (this._joint) {
            torque = Physics2D.I._factory.get_joint_reactionTorque(this._joint);
        }
        return torque;
    }

    isValid(): boolean {
        let isvalid: boolean = false;
        if (this._joint) {
            isvalid = Physics2D.I._factory.isValidJoint(this._joint);
        }
        return isvalid;
    }

    /**@internal */
    protected getBodyAnchor(body: ColliderBase, anchorx: number, anchory: number): Point {
        Point.TEMP.setTo(anchorx, anchory)
        let node = body.owner;
        if (node) {
            if (node.transform) {
                node.transform.transformPointN(Point.TEMP)
            } else {
                Point.TEMP.x *= node.scaleX;
                Point.TEMP.y *= node.scaleY;
            }
        }
        return Point.TEMP;
    }

    protected _onAdded(): void {
    }

    /**@internal */
    protected _onEnable(): void {
        this._physics2DManager = this.owner?.scene?.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        this._createJoint();
    }

    /**@internal */
    protected _onAwake(): void {
        this._physics2DManager = this.owner?.scene?.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        this._createJoint();
    }

    /**@internal */
    protected _createJoint(): void {
    }

    /**@internal */
    protected _onDisable(): void {
        if (this._joint && this._factory.getJoint_userData(this._joint) && !this._factory.getJoint_userData_destroy(this._joint)) {
            Physics2D.I._factory.removeJoint(this._physics2DManager.box2DWorld, this._joint);
        }
        this._joint = null;
    }
}
