import { JointBase } from "./JointBase";
import { Laya } from "../../../Laya";
import { Sprite } from "../../display/Sprite"
import { Event } from "../../events/Event"
import { Point } from "../../maths/Point"
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

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
    /**弹簧系统的震动频率，可以视为弹簧的弹性系数*/
    private _frequency: number = 5;
    /**刚体在回归到节点过程中受到的阻尼，取值0~1*/
    private _damping: number = 0.7;
    /**
     * @override
     * @internal
     */
    _onEnable(): void {
        //super._onEnable();
        (<Sprite>this.owner).on(Event.MOUSE_DOWN, this, this.onMouseDown);
    }
    /**
     * @override
     * @internal
     */
    _onAwake(): void {
    }

    private onMouseDown(): void {
        this._createJoint();
        Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.once(Event.MOUSE_UP, this, this.onStageMouseUp);
        Laya.stage.once(Event.MOUSE_OUT, this, this.onStageMouseUp);
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
                anchorPos = Physics.I.worldRoot.globalToLocal(Point.TEMP.setTo(Laya.stage.mouseX, Laya.stage.mouseY));
            }
            var anchorVec: any = new box2d.b2Vec2(anchorPos.x / Physics.PIXEL_RATIO, anchorPos.y / Physics.PIXEL_RATIO);
            def.bodyA = Physics.I._emptyBody;
            def.bodyB = this.selfBody.getBody();
            def.target = anchorVec;
            def.frequencyHz = this._frequency;
            def.damping = this._damping;
            def.maxForce = this._maxForce;
            this._joint = Physics.I._createJoint(def);
        }
    }

    private onStageMouseUp(): void {
        Laya.stage.off(Event.MOUSE_MOVE, this, this.onMouseMove);
        Laya.stage.off(Event.MOUSE_UP, this, this.onStageMouseUp);
        Laya.stage.off(Event.MOUSE_OUT, this, this.onStageMouseUp);
        super._onDisable();
    }

    private onMouseMove(): void {
        this._joint.SetTarget(new (<any>window).box2d.b2Vec2(Physics.I.worldRoot.mouseX / Physics.PIXEL_RATIO, Physics.I.worldRoot.mouseY / Physics.PIXEL_RATIO));
    }
    /**
     * @override
     * @internal
     */
    protected _onDisable(): void {
        (<Sprite>this.owner).off(Event.MOUSE_DOWN, this, this.onMouseDown);
        super._onDisable();
    }

    /**鼠标关节在拖曳刚体bodyB时施加的最大作用力*/
    get maxForce(): number {
        return this._maxForce;
    }

    set maxForce(value: number) {
        this._maxForce = value;
        if (this._joint) this._joint.SetMaxForce(value);
    }

    /**弹簧系统的震动频率，可以视为弹簧的弹性系数*/
    get frequency(): number {
        return this._frequency;
    }

    set frequency(value: number) {
        this._frequency = value;
        if (this._joint) this._joint.SetFrequency(value);
    }

    /**刚体在回归到节点过程中受到的阻尼，取值0~1*/
    get damping(): number {
        return this._damping;
    }

    set damping(value: number) {
        this._damping = value;
        if (this._joint) this._joint.SetDampingRatio(value);
    }
}

ClassUtils.regClass("laya.physics.joint.MouseJoint", MouseJoint);
ClassUtils.regClass("Laya.MouseJoint", MouseJoint);
