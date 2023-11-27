import { Component } from "../../components/Component"
import { Sprite } from "../../display/Sprite";
import { Point } from "../../maths/Point";
import { IPhysiscs2DFactory } from "../IPhysiscs2DFactory";
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody";

/**
 * 关节基类
 */
export class JointBase extends Component {
    /**原生关节对象*/
    protected _joint: any;

    protected _factory: IPhysiscs2DFactory;
    constructor() {
        super();
        this._factory = Physics2D.I._factory;
        this._singleton = false;
    }

    protected getBodyAnchor(body: RigidBody, anchorx: number, anchory: number): Point {
        Point.TEMP.setTo(anchorx, anchory)
        let node = <Sprite>body.owner;
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

    /**[只读]原生关节对象*/
    get joint(): any {
        if (!this._joint) this._createJoint();
        return this._joint;
    }

    protected _onEnable(): void {
        this._createJoint();
    }

    protected _onAwake(): void {
        this._createJoint();
    }

    protected _createJoint(): void {
    }

    protected _onDisable(): void {
        if (this._joint && this._factory.getJoint_userData(this._joint) && !this._factory.getJoint_userData_destroy(this._joint)) {
            Physics2D.I._factory.removeJoint(this._joint);
        }
        this._joint = null;
    }
}
