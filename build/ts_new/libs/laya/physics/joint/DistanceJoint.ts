import { JointBase } from "./JointBase";
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * 距离关节：两个物体上面各自有一点，两点之间的距离固定不变
 */
export class DistanceJoint extends JointBase {
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

    /**约束的目标静止长度*/
    private _length: number = 0;
    /**弹簧系统的震动频率，可以视为弹簧的弹性系数*/
    private _frequency: number = 0;
    /**刚体在回归到节点过程中受到的阻尼，建议取值0~1*/
    private _damping: number = 0;

    /**
     * @override
     */
    protected _createJoint(): void {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var box2d: any = (<any>window).box2d;
            var def: any = DistanceJoint._temp || (DistanceJoint._temp = new box2d.b2DistanceJointDef());
            def.bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.localAnchorA.Set(this.otherAnchor[0] / Physics.PIXEL_RATIO, this.otherAnchor[1] / Physics.PIXEL_RATIO);
            def.localAnchorB.Set(this.selfAnchor[0] / Physics.PIXEL_RATIO, this.selfAnchor[1] / Physics.PIXEL_RATIO);
            def.frequencyHz = this._frequency;
            def.dampingRatio = this._damping;
            def.collideConnected = this.collideConnected;
            var p1: any = def.bodyA.GetWorldPoint(def.localAnchorA, new box2d.b2Vec2());
            var p2: any = def.bodyB.GetWorldPoint(def.localAnchorB, new box2d.b2Vec2());
            def.length = this._length / Physics.PIXEL_RATIO || box2d.b2Vec2.SubVV(p2, p1, new box2d.b2Vec2()).Length();

            this._joint = Physics.I._createJoint(def);
        }
    }

    /**约束的目标静止长度*/
    get length(): number {
        return this._length;
    }

    set length(value: number) {
        this._length = value;
        if (this._joint) this._joint.SetLength(value / Physics.PIXEL_RATIO);
    }

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数*/
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) this._joint.SetFrequency(value);
    }

    /**刚体在回归到节点过程中受到的阻尼，建议取值0~1*/
    get damping(): number {
        return this._damping;
    }

    set damping(value: number) {
        this._damping = value;
        if (this._joint) this._joint.SetDampingRatio(value);
    }
}

ClassUtils.regClass("laya.physics.joint.DistanceJoint", DistanceJoint);
ClassUtils.regClass("Laya.DistanceJoint", DistanceJoint);