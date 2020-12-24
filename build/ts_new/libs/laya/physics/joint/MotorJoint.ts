import { JointBase } from "./JointBase";
import { Physics } from "../Physics"
import { RigidBody } from "../RigidBody"
import { ClassUtils } from "../../utils/ClassUtils";

/**
 * 马达关节：用来限制两个刚体，使其相对位置和角度保持不变
 */
export class MotorJoint extends JointBase {
    /**@private */
    private static _temp: any;
    /**[首次设置有效]关节的自身刚体*/
    selfBody: RigidBody;
    /**[首次设置有效]关节的连接刚体*/
    otherBody: RigidBody;
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;

    /**基于otherBody坐标位置的偏移量，也是selfBody的目标位置*/
    private _linearOffset: any[] = [0, 0];
    /**基于otherBody的角度偏移量，也是selfBody的目标角度*/
    private _angularOffset: number = 0;
    /**当selfBody偏离目标位置时，为使其恢复到目标位置，马达关节所施加的最大作用力*/
    private _maxForce: number = 1000;
    /**当selfBody角度与目标角度不同时，为使其达到目标角度，马达关节施加的最大扭力*/
    private _maxTorque: number = 1000;
    /**selfBody向目标位置移动时的缓动因子，取值0~1，值越大速度越快*/
    private _correctionFactor: number = 0.3;
    /**
     * @override
     * 
     */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.otherBody) throw "otherBody can not be empty";
            this.selfBody = this.selfBody || this.owner.getComponent(RigidBody);
            if (!this.selfBody) throw "selfBody can not be empty";

            var box2d: any = (<any>window).box2d;
            var def: any = MotorJoint._temp || (MotorJoint._temp = new box2d.b2MotorJointDef());
            def.Initialize(this.otherBody.getBody(), this.selfBody.getBody());
            def.linearOffset = new box2d.b2Vec2(this._linearOffset[0] / Physics.PIXEL_RATIO, this._linearOffset[1] / Physics.PIXEL_RATIO);
            def.angularOffset = this._angularOffset;
            def.maxForce = this._maxForce;
            def.maxTorque = this._maxTorque;
            def.correctionFactor = this._correctionFactor;
            def.collideConnected = this.collideConnected;

            this._joint = Physics.I._createJoint(def);
        }
    }

    /**基于otherBody坐标位置的偏移量，也是selfBody的目标位置*/
    get linearOffset(): any[] {
        return this._linearOffset;
    }

    set linearOffset(value: any[]) {
        this._linearOffset = value;
        if (this._joint) this._joint.SetLinearOffset(new (<any>window).box2d.b2Vec2(value[0] / Physics.PIXEL_RATIO, value[1] / Physics.PIXEL_RATIO));
    }

    /**基于otherBody的角度偏移量，也是selfBody的目标角度*/
    get angularOffset(): number {
        return this._angularOffset;
    }

    set angularOffset(value: number) {
        this._angularOffset = value;
        if (this._joint) this._joint.SetAngularOffset(value);
    }

    /**当selfBody偏离目标位置时，为使其恢复到目标位置，马达关节所施加的最大作用力*/
    get maxForce(): number {
        return this._maxForce;
    }

    set maxForce(value: number) {
        this._maxForce = value;
        if (this._joint) this._joint.SetMaxForce(value);
    }

    /**当selfBody角度与目标角度不同时，为使其达到目标角度，马达关节施加的最大扭力*/
    get maxTorque(): number {
        return this._maxTorque;
    }

    set maxTorque(value: number) {
        this._maxTorque = value;
        if (this._joint) this._joint.SetMaxTorque(value);
    }

    /**selfBody向目标位置移动时的缓动因子，取值0~1，值越大速度越快*/
    get correctionFactor(): number {
        return this._correctionFactor;
    }

    set correctionFactor(value: number) {
        this._correctionFactor = value;
        if (this._joint) this._joint.SetCorrectionFactor(value);
    }
}

ClassUtils.regClass("laya.physics.joint.MotorJoint", MotorJoint);
ClassUtils.regClass("Laya.MotorJoint", MotorJoint);