import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Event } from "../../events/Event"
import { Point } from "../../maths/Point"
import { Physics2D } from "../Physics2D"
import { RigidBody } from "../RigidBody"
import { ILaya } from "../../../ILaya";
import { physics2D_MouseJointJointDef } from "./JointDefStructInfo";

/**
 * 鼠标关节：鼠标关节用于通过鼠标来操控物体。它试图将物体拖向当前鼠标光标的位置。而在旋转方面就没有限制。
 */
export class MouseJoint extends JointBase {
    /**@private */
    private static _temp: physics2D_MouseJointJointDef;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移，如果不设置，则根据鼠标点击点作为连接点*/
    anchor: any[];

    /**鼠标关节在拖曳刚体bodyB时施加的最大作用力*/
    private _maxForce: number = 1000;
    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 5;
    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    protected _onEnable(): void {
        (<Sprite>this.owner).mouseEnabled = true;
        this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    protected _onAwake(): void {

    }

    private onMouseDown(): void {
        this._createJoint();
        ILaya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        ILaya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp);
        ILaya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp);
    }
    /**
     * @override
     * 
     */
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

    private onStageMouseUp(): void {
        ILaya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
        ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
        this._factory.removeJoint(this._joint);
        this._joint = null;
    }

    private onMouseMove(): void {
        if (this._joint) this._factory.set_MouseJoint_target(this._joint, Physics2D.I.worldRoot.mouseX, Physics2D.I.worldRoot.mouseY)
    }

    protected _onDisable(): void {
        super._onDisable();
        this.owner.off(Event.MOUSE_DOWN, this, this.onMouseDown);
    }

    /**鼠标关节在拖曳刚体bodyB时施加的最大作用力*/
    get maxForce(): number {
        return this._maxForce;
    }

    set maxForce(value: number) {
        this._maxForce = value;
        if (this._joint) this._factory.set_MotorJoint_SetMaxForce(this._joint, value);
    }

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) {
            this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
        }
    }

    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    get damping(): number {
        return this._dampingRatio;
    }

    set damping(value: number) {
        this._dampingRatio = value;
        if (this._joint) {
            this._factory.set_MouseJoint_frequencyAndDampingRatio(this._joint, this._frequency, this._dampingRatio);
        }
    }
}
