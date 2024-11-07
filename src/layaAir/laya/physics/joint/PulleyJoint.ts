import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point"
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { physics2D_PulleyJointDef } from "../IPhysiscs2DFactory";

/**
 * @en PulleyJoint class, which connects two bodies to the ground and to each other, when one body rises, the other descends, simulating the behavior of a pulley system.
 * @zh 滑轮关节：它将两个物体接地(ground)并彼此连接，当一个物体上升，另一个物体就会下降
 */
export class PulleyJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_PulleyJointDef;

    /**
     * @en The rigid body that is attached to the joint. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节相连的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connected rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]连接到关节的另一个刚体。
     */
    otherBody: RigidBody;

    /**
     * @en The anchor point of the rigid body relative to its top-left corner. This setting is effective only on the first assignment.
     * @zh [首次设置有效]自身刚体的链接点，是相对于自身刚体左上角位置的偏移。
     */
    selfAnchor: any[] = [0, 0];

    /**
     * @en The anchor point of the connected body relative to its top-left corner. This setting is effective only on the first assignment.
     * @zh [首次设置有效]连接刚体的链接点，是相对于otherBody左上角位置的偏移。
     */
    otherAnchor: any[] = [0, 0];

    /**
     * @en The point on the pulley connected to the self anchor, relative to the top-left corner of the rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]滑轮上与自身刚体的 selfAnchor 相连的点，是相对于自身刚体左上角位置的偏移。
     */
    selfGroundPoint: any[] = [0, -100];

    /**
     * @en The point on the pulley connected to the other anchor, relative to the top-left corner of the connected body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]滑轮上与连接刚体的 otherAnchor 相连的点，是相对于对方刚体左上角位置的偏移。
     */
    otherGroundPoint: any[] = [0, -100];

    /**
     * @en The ratio of movement distances between the two connected rigid bodies. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个刚体的移动距离比率。
     */
    ratio: number = 1;

    /**
     * @en Specifies whether the two connected rigid bodies can collide with each other. Default is false. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个连接的刚体是否可以相互碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**@internal */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_PulleyJointDef = PulleyJoint._temp || (PulleyJoint._temp = new physics2D_PulleyJointDef);
            def.bodyA = this.otherBody.getBody();
            def.bodyB = this.selfBody.getBody();
            var posA: Point = this.otherBody.getWorldPoint(this.otherAnchor[0], this.otherAnchor[1]);
            def.localAnchorA.setValue(posA.x, posA.y);
            var posB: Point = this.selfBody.getWorldPoint(this.selfAnchor[0], this.selfAnchor[1]);
            def.localAnchorB.setValue(posB.x, posB.y);
            var groundA: Point = this.otherBody.getWorldPoint(this.otherGroundPoint[0], this.otherGroundPoint[1]);
            def.groundAnchorA.setValue(groundA.x, groundA.y);
            var groundB: Point = this.selfBody.getWorldPoint(this.selfGroundPoint[0], this.selfGroundPoint[1]);
            def.groundAnchorB.setValue(groundB.x, groundB.y);
            def.ratio = this.ratio;
            def.collideConnected = this.collideConnected;
            this._joint = Physics2D.I._factory.create_PulleyJoint(def);
        }
    }
}