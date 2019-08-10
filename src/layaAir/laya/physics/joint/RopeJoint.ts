import { JointBase } from "./JointBase";
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * 绳索关节：限制了两个点之间的最大距离。它能够阻止连接的物体之间的拉伸，即使在很大的负载下
 */
export class RopeJoint extends JointBase {
    /**@private */
    private static _temp: any;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的连接刚体，可不设置，默认为左上角空刚体*/
    otherBody: RigidBody;
    /**[首次设置有效]自身刚体链接点，是相对于自身刚体的左上角位置偏移*/
    selfAnchor: any[] = [0, 0];
    /**[首次设置有效]链接刚体链接点，是相对于otherBody的左上角位置偏移*/
    otherAnchor: any[] = [0, 0];
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;

    /**selfAnchor和otherAnchor之间的最大距离*/
    private _maxLength: number = 1;
    /**
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            //if (!otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var box2d: any = (<any>window).box2d;
            var def: any = RopeJoint._temp || (RopeJoint._temp = new box2d.b2RopeJointDef());
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.localAnchorA.Set(this.otherAnchor[0] / Physics.PIXEL_RATIO, this.otherAnchor[1] / Physics.PIXEL_RATIO);
            def.localAnchorB.Set(this.selfAnchor[0] / Physics.PIXEL_RATIO, this.selfAnchor[1] / Physics.PIXEL_RATIO);
            def.maxLength = this._maxLength / Physics.PIXEL_RATIO;
            def.collideConnected = this.collideConnected;

            this._joint = Physics.I._createJoint(def);
        }
    }

    /**selfAnchor和otherAnchor之间的最大距离*/
    get maxLength(): number {
        return this._maxLength;
    }

    set maxLength(value: number) {
        this._maxLength = value;
        if (this._joint) this._joint.SetMaxLength(value / Physics.PIXEL_RATIO);
    }
}

ClassUtils.regClass("laya.physics.joint.RopeJoint", RopeJoint);
ClassUtils.regClass("Laya.RopeJoint", RopeJoint);