import { JointBase } from "./JointBase";
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"

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
    /**约束的最小长度，-1表示使用默认值*/
    private _maxLength: number = -1;
    /**约束的最大长度，-1表示使用默认值*/
    private _minLength: number = -1;

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 1;
    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0;

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
            box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
            // def.stiffness = this._stiffness;
            // def.damping = this._damping;
            def.collideConnected = this.collideConnected;
            var p1: any = def.bodyA.GetWorldPoint(def.localAnchorA, new box2d.b2Vec2());
            var p2: any = def.bodyB.GetWorldPoint(def.localAnchorB, new box2d.b2Vec2());
            def.length = this._length / Physics.PIXEL_RATIO || box2d.b2Vec2.SubVV(p2, p1, new box2d.b2Vec2()).Length();
            
            def.maxLength = box2d.b2_maxFloat;
            def.minLength = 0;
            if (this._maxLength >= 0)
                def.maxLength = this._maxLength / Physics.PIXEL_RATIO;
            if (this._minLength >= 0)
                def.minLength = this._minLength / Physics.PIXEL_RATIO;
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

    /**约束的最小长度*/
    get minLength(): number {
        return this._minLength;
    }

    set minLength(value: number) {
        this._minLength = value;
        if (this._joint) this._joint.SetMinLength(value / Physics.PIXEL_RATIO);
    }

    /**约束的最大长度*/
    get maxLength(): number {
        return this._maxLength;
    }

    set maxLength(value: number) {
        this._maxLength = value;
        if (this._joint) this._joint.SetMaxLength(value / Physics.PIXEL_RATIO);
    }

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            let out: any = {};
            let box2d: any = (<any>window).box2d;
            let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            let bodyB = this.selfBody.getBody();
            box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);

            this._joint.SetStiffness(out.stiffness);
            this._joint.SetDamping(out.damping);
        }
    }

    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            let out: any = {};
            let box2d: any = (<any>window).box2d;
            let bodyA = this.otherBody ? this.otherBody.getBody() : Physics.I._emptyBody;
            let bodyB = this.selfBody.getBody();
            box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);

            // this._joint.SetStiffness(out.stiffness); // 修改 dampingRatio 最终只影响 damping
            this._joint.SetDamping(out.damping);
        }
    }
}