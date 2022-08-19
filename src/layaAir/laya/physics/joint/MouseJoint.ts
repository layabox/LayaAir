import { JointBase } from "./JointBase";
import { Sprite } from "../../display/Sprite"
import { Event } from "../../events/Event"
import { Point } from "../../maths/Point"
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ILaya } from "../../../ILaya";

/**
 * 鼠标关节：鼠标关节用于通过鼠标来操控物体。它试图将物体拖向当前鼠标光标的位置。而在旋转方面就没有限制。
 */
export class MouseJoint extends JointBase {
    /**@private */
    private static _temp: any;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的链接点，是相对于自身刚体的左上角位置偏移，如果不设置，则根据鼠标点击点作为连接点*/
    anchor: any[];

    /**鼠标关节在拖曳刚体bodyB时施加的最大作用力*/
    private _maxForce: number = 10000;
    /**弹簧系统的震动频率，可以视为弹簧的弹性系数，通常频率应该小于时间步长频率的一半*/
    private _frequency: number = 5;
    /**刚体在回归到节点过程中受到的阻尼比，建议取值0~1*/
    private _dampingRatio: number = 0.7;

    protected _onEnable(): void {
        super._onEnable();
        this.owner.on(Event.MOUSE_DOWN, this, this.onMouseDown);
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

            var box2d: any = (<any>window).box2d;
            var def: any = MouseJoint._temp || (MouseJoint._temp = new box2d.b2MouseJointDef());
            if (this.anchor) {
                var anchorPos: Point = (<Sprite>this.selfBody.owner).localToGlobal(Point.TEMP.setTo(this.anchor[0], this.anchor[1]), false, Physics.I.worldRoot);
            } else {
                anchorPos = Physics.I.worldRoot.globalToLocal(Point.TEMP.setTo(ILaya.stage.mouseX, ILaya.stage.mouseY));
            }
            var anchorVec: any = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.bodyA = Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.target = anchorVec;
            box2d.b2LinearStiffness(def, this._frequency, this._dampingRatio, def.bodyA, def.bodyB);
            // def.stiffness = this._stiffness;
            // def.damping = this._damping;
            def.maxForce = this._maxForce;
            this._joint = Physics.I._createJoint(def);
        }
    }

    private onStageMouseUp(): void {
        ILaya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        ILaya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
        ILaya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);

        super._onDisable();
    }

    private onMouseMove(): void {
        this._joint.SetTarget(new (<any>window).box2d.b2Vec2(Physics.I.worldRoot.mouseX / Physics.PIXEL_RATIO, Physics.I.worldRoot.mouseY / Physics.PIXEL_RATIO));
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
        if (this._joint) this._joint.SetMaxForce(value);
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
            let bodyA = Physics.I._emptyBody;
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
            let bodyA = Physics.I._emptyBody;
            let bodyB = this.selfBody.getBody();
            box2d.b2LinearStiffness(out, this._frequency, this._dampingRatio, bodyA, bodyB);

            // this._joint.SetStiffness(out.stiffness); // 修改 dampingRatio 最终只影响 damping
            this._joint.SetDamping(out.damping);
        }
    }
}
