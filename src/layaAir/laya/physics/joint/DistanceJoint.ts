import { JointBase } from "./JointBase";
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { physics2D_DistancJointDef } from "./JointDefStructInfo";
import { Sprite } from "../../display/Sprite";

/**
 * @en Distance Joint: A joint that maintains a fixed distance between two points on two bodies.
 * @zh 距离关节描述了两个刚体锚点之间的距离，并且最终会保持着这个约束的距离。
 */
export class DistanceJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_DistancJointDef;

    /**@internal 约束的目标静止长度*/
    private _length: number = 0;

    /**@internal 约束的最小长度，-1表示使用默认值*/
    private _maxLength: number = -1;

    /**@internal 约束的最大长度，-1表示使用默认值*/
    private _minLength: number = -1;

    /**@internal 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 1;

    /**@internal 刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0;

    /**
     * @en The joint's own rigid body, effective only on the first setting.
     * @zh [首次设置有效]关节的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The joint's connected rigid body, which can be unspecified and defaults to an empty rigid body at the top left corner, effective only on the first setting.
     * @zh [首次设置有效]关节的连接刚体，可不设置，默认为左上角空刚体。
     */
    otherBody: RigidBody;

    /**
     * @en The self body's anchor point, which is the offset relative to the top left corner of the own rigid body, effective only on the first setting.
     * @zh [首次设置有效]自身刚体链接点，是相对于自身刚体的左上角位置偏移。
     */
    selfAnchor: any[] = [0, 0];

    /**
     * @en The connected body's anchor point, which is the offset relative to the top left corner of the other body, effective only on the first setting.
     * @zh [首次设置有效]链接刚体链接点，是相对于otherBody的左上角位置偏移。
     */
    otherAnchor: any[] = [0, 0];

    /**
     * @en Whether the two rigid bodies can collide with each other, default is false, effective only on the first setting.
     * @zh [首次设置有效]两个刚体是否可以发生碰撞，默认为false。
     */
    collideConnected: boolean = false;


    /**
     * @en The target rest length of the constraint.
     * @zh 约束的目标静止长度。
     */
    get length(): number {
        return this._length;
    }

    set length(value: number) {
        this._length = value;
        if (this._joint) this._factory.set_DistanceJoint_length(this._joint, value);
    }

    /**
     * @en The minimum length of the constraint.
     * @zh 约束的最小长度。
     */

    get minLength(): number {
        return this._minLength;
    }

    set minLength(value: number) {
        this._minLength = value;
        if (this._joint) this._factory.set_DistanceJoint_MinLength(this._joint, value);
    }

    /**
     * @en The maximum length of the constraint.
     * @zh 约束的最大长度。
     */
    get maxLength(): number {
        return this._maxLength;
    }

    set maxLength(value: number) {
        this._maxLength = value;
        if (this._joint) this._factory.set_DistanceJoint_MaxLength(this._joint, value);
    }

    /**
     * @en The vibration frequency of a spring system indicates how quickly it completes one oscillation cycle. A higher value signifies a higher frequency, meaning it completes one oscillation cycle in a shorter time. Consequently, the oscillation amplitude is relatively smaller, and the oscillation speed is faster. Conversely, a lower frequency results in a larger oscillation amplitude and slower oscillation speed.
     * @zh 弹簧系统的振动频率，值越大表示振动频率越高，意味着在更短的时间内完成一个振动周期，所以，振动幅度相对较小，振动速度更快。反之，振动幅度相对较大，振动速度更慢。
     */
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**
     * @en The damping ratio of the body when returning to the node, which is recommended to be between 0 and 1.
     * @zh 刚体在回归到节点过程中受到的阻尼比，建议取值在 0 到 1 之间。
     */
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**
     * @en The current length of the joint.
     * @zh 关节的当前长度。
     */
    get jointLength(): number {
        if (this._joint) {
            return this._factory.phyToLayaValue(this.joint.GetLength())
        } else {
            return 0;
        }

    }

    /**
     * @internal
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            let node = <Sprite>this.owner;
            this.selfBody = this.selfBody || node.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";
            let point = this.getBodyAnchor(this.selfBody, this.selfAnchor[0], this.selfAnchor[1]);
            var def = DistanceJoint._temp || (DistanceJoint._temp = new physics2D_DistancJointDef());
            def.bodyB = this.selfBody.getBody();
            def.localAnchorB.setValue(point.x, point.y);
            this.selfBody.owner.on("shapeChange", this, this._refeahJoint);
            if (this.otherBody) {
                def.bodyA = this.otherBody.getBody();
                point = this.getBodyAnchor(this.otherBody, this.otherAnchor[0], this.otherAnchor[1]);
                def.localAnchorA.setValue(point.x, point.y);
                this.otherBody.owner.on("shapeChange", this, this._refeahJoint);
            } else {
                def.bodyA = Physics2D.I._emptyBody;
                def.localAnchorA.setValue(this.otherAnchor[0], this.otherAnchor[1]);
            }

            def.dampingRatio = this._dampingRatio;
            def.frequency = this._frequency;
            def.collideConnected = this.collideConnected;
            def.length = this._length;
            def.maxLength = this._maxLength;
            def.minLength = this._minLength;
            this._joint = this._factory.createDistanceJoint(def);

        }
    }

    /**@internal */
    _refeahJoint(): void {
        if (this._joint) {
            this._factory.set_DistanceJointStiffnessDamping(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**
     * @en Called when the object is being destroyed. This method removes event listeners to prevent memory leaks.
     * @zh 在对象被销毁时调用。此方法移除事件监听器以防止内存泄漏。
     */
    onDestroy(): void {
        super.onDestroy();
        this.selfBody.owner.off("shapeChange", this._refeahJoint);
        if (this.otherBody) this.otherBody.owner.off("shapeChange", this._refeahJoint);
    }

}
