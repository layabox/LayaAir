import { JointBase } from "./JointBase";
import { Point } from "../../maths/Point"
import { RigidBody } from "../RigidBody"
import { physics2D_WeldJointDef } from "./JointDefStructInfo";

/**
 * @en WeldJoint class, used to constrain two bodies together so they cannot move relative to each other. The relative position and angle between the two bodies are fixed, making them appear as a single rigid body.
 * @zh 焊接关节：焊接关节的用途是使两个物体不能相对运动，受到关节的限制，两个刚体的相对位置和角度都保持不变，看上去像一个整体
 */
export class WeldJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_WeldJointDef;

    /**@internal 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 5;

    /**@internal 刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    /**
     * @en The rigid body that is locally attached to the joint. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节直接相连的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connected rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]与关节连接的另一个刚体。
     */
    otherBody: RigidBody;

    /**
     * @en Link points of joints, it is offset from the position of the upper left corner of its own rigid body. This setting is effective only on the first assignment.
     * @zh [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移。
     */
    anchor: any[] = [0, 0];

    /**
     * @en Specifies whether the two connected rigid bodies can collide with each other. Default is false. This setting is effective only on the first assignment.
     * @zh [首次设置有效]两个连接的刚体是否可以相互碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @en The vibration frequency of the spring system, which can be considered as the spring's elasticity coefficient.The frequency should typically be less than half the time step frequency.
     * @zh 弹簧系统的振动频率，可以视为弹簧的弹性系数。通常频率应该小于时间步长频率的一半。
     */
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, false);
        }
    }

    /**
     * @en The damping ratio of the body when returning to the anchor point, with a recommended value range of 0 to 1.
     * @zh 刚体在回归到节点过程中受到的阻尼比，建议取值0~1。
     */
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            this._factory.set_Joint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio, true);
        }
    }

    /**@internal */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_WeldJointDef = WeldJoint._temp || (WeldJoint._temp = new physics2D_WeldJointDef());
            var anchorPos: Point = this.selfBody.getWorldPoint(this.anchor[0], this.anchor[1]);
            def.bodyA = this.otherBody.getBody();
            def.bodyB = this.selfBody.getBody();
            def.anchor.setValue(anchorPos.x, anchorPos.y);
            def.frequency = this._frequency;
            def.dampingRatio = this._dampingRatio;
            def.collideConnected = this.collideConnected;
            this._joint = this._factory.create_WeldJoint(def);
        }
    }
}