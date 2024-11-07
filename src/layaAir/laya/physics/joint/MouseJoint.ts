import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Event } from "../../events/Event"
import { Point } from "../../maths/Point"
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { ILaya } from "../../../ILaya";
import { physics2D_MouseJointJointDef } from "../IPhysiscs2DFactory";

/**
 * @en Mouse joint: A physics constraint used to simulate the user dragging an object with the mouse. It typically allows a rigid body to follow the mouse cursor's movement while also being influenced by other physics effects such as collisions and gravity.
 * @zh 鼠标关节:一种用来模拟用户用鼠标拖拽物体的物理约束。它通常会使得一个刚体可以跟随鼠标移动，但同时也能受到其他物理效果如碰撞、重力等的影响。
 */
export class MouseJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_MouseJointJointDef;

    /**@internal 鼠标关节在拖曳刚体bodyB时施加的最大作用力*/
    private _maxForce: number = 1000;

    /**@internal 弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 5;

    /**@internal 刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    /**
     * @en The self rigid body of a joint, effective only on the first setting.
     * @zh [首次设置有效]关节的自身刚体。
     */
    selfBody: RigidBody;

    /**
     * @en The connection point of a joint is offset from the position of the upper left corner of its own rigid body. If not set, it is used as the connection point based on the mouse click point. Effective only on the first setting.
     * @zh [首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移，如果不设置，则根据鼠标点击点作为连接点。
     */
    anchor: any[];

    /**
     * @en Used to limit the maximum force that the mouse joint can apply when attempting to move an object towards the mouse position, preventing excessive force that could lead to abnormal behavior or unnatural effects.
     * @zh 用于限制鼠标关节试图将物体移向鼠标位置时所能施加的最大力量，避免力过大导致的异常行为或不自然的效果。
     */
    get maxForce(): number {
        return this._maxForce;
    }

    set maxForce(value: number) {
        this._maxForce = value;
        if (this._joint) this._factory.set_MotorJoint_SetMaxForce(this._joint, value);
    }

    /**
     * @en The vibration frequency of the spring system, which can be considered as the spring's elasticity coefficient. The frequency should typically be less than half the time step frequency.
     * @zh 弹簧系统的振动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半。
     */
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**
     * @en The damping ratio of the body when returning to the anchor, with a recommended value between 0 and 1.
     * @zh 刚体在回归到节点过程中受到的阻尼比，建议取值在 0 到 1 之间。
     */
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**@internal */
    protected _onEnable(): void {
        (<Sprite>this.owner).mouseEnabled = true;
        this.owner.on(Event.MOUSE_DOWN, this, this._onMouseDown);
    }

    /**@internal */
    protected _createJoint(): void {
        if (!this._joint) {
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var def: physics2D_MouseJointJointDef = MouseJoint._temp || (MouseJoint._temp = new physics2D_MouseJointJointDef());
            if (this.anchor) {
                var anchorPos: Point = (<Sprite>this.selfBody.owner).localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics2D.I.worldRoot);
            } else {
                anchorPos = Physics2D.I.worldRoot.globalToLocal(Point.TEMP.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
            }

            def.bodyA = Physics2D.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.target.setValue(anchorPos.x, anchorPos.y);
            def.maxForce = this._maxForce;
            def.dampingRatio = this._dampingRatio;
            def.frequency = this._frequency;
            this._factory.set_rigidbody_Awake(def.bodyB, true);
            this._joint = this._factory.create_MouseJoint(def);
        }
    }

    /**@internal */
    private _onMouseDown(): void {
        this._createJoint();
        ILaya.stage.on(Event.MOUSE_MOVE, this, this._onMouseMove);
        ILaya.stage.once(Event.MOUSE_UP, this, this._onStageMouseUp);
        ILaya.stage.once(Event.MOUSE_OUT, this, this._onStageMouseUp);
    }

    /**@internal */
    private _onStageMouseUp(): void {
        ILaya.stage.off(Event.MOUSE_MOVE, this, this._onMouseMove);
        ILaya.stage.off(Event.MOUSE_UP, this, this._onStageMouseUp);
        ILaya.stage.off(Event.MOUSE_OUT, this, this._onStageMouseUp);
        this._factory.removeJoint(this._joint);
        this._joint = null;
    }

    /**@internal */
    private _onMouseMove(): void {
        if (this._joint) this._factory.set_MouseJoint_target(this._joint, Physics2D.I.worldRoot.mouseX, Physics2D.I.worldRoot.mouseY)
    }

    /**@internal */
    protected _onDisable(): void {
        super._onDisable();
        this.owner.off(Event.MOUSE_DOWN, this, this._onMouseDown);
    }


}
