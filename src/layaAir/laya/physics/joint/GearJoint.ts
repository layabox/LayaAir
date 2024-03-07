import { JointBase } from "./JointBase";
import { RigidBody } from "../RigidBody"
import { RevoluteJoint } from "./RevoluteJoint";
import { PrismaticJoint } from "./PrismaticJoint";
import { physics2D_GearJointDef } from "./JointDefStructInfo";

/**
 * 齿轮关节：用来模拟两个齿轮间的约束关系，齿轮旋转时，产生的动量有两种输出方式，一种是齿轮本身的角速度，另一种是齿轮表面的线速度
 */
export class GearJoint extends JointBase {
    /**@private */
    private static _temp: physics2D_GearJointDef;
    /**[首次设置有效]要绑定的第1个关节，类型可以是RevoluteJoint或者PrismaticJoint*/
    joint1: RevoluteJoint | PrismaticJoint;
    /**[首次设置有效]要绑定的第2个关节，类型可以是RevoluteJoint或者PrismaticJoint*/
    joint2: RevoluteJoint | PrismaticJoint;
    /**[首次设置有效]两个刚体是否可以发生碰撞，默认为false*/
    collideConnected: boolean = false;

    /**两个齿轮角速度比例，默认1*/
    private _ratio: number = 1;
    /**
     * @override
     * 
     */
    protected _createJoint(): void {
        if (!this._joint) {
            if (!this.joint1) throw "Joint1 can not be empty";
            if (!this.joint2) throw "Joint2 can not be empty";

            var def: physics2D_GearJointDef = GearJoint._temp || (GearJoint._temp = new physics2D_GearJointDef());
            def.bodyA = this.joint1.owner.getComponent(RigidBody).getBody();
            def.bodyB = this.joint2.owner.getComponent(RigidBody).getBody();
            def.joint1 = this.joint1.joint;
            def.joint2 = this.joint2.joint;
            def.ratio = -this._ratio;
            def.collideConnected = this.collideConnected;
            this._joint = this._factory.create_GearJoint(def);
        }
    }

    /**两个齿轮角速度比例，默认1*/
    get ratio(): number {
        return this._ratio;
    }

    set ratio(value: number) {
        this._ratio = value;
        if (this._joint) this._factory.set_GearJoint_SetRatio(this._joint, value);
    }
}