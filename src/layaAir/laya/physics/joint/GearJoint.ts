import { JointBase } from "./JointBase";
import { PrismaticJoint } from "./PrismaticJoint";
import { RevoluteJoint } from "./RevoluteJoint";
import { EPhysics2DJoint, physics2D_GearJointDef } from "../factory/IPhysics2DFactory";
import { Physics2D } from "../Physics2D";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { Physics2DWorldManager } from "../Physics2DWorldManager";

/**
 * @en Gear joint: used to simulate the constraint relationship between two gears. When a gear rotates, the momentum generated has two output modes: one is the angular velocity of the gear itself, and the other is the linear velocity on the gear surface
 * @zh 齿轮关节：用来模拟两个齿轮间的约束关系，齿轮旋转时，产生的动量有两种输出方式，一种是齿轮本身的角速度，另一种是齿轮表面的线速度
 */
export class GearJoint extends JointBase {

    /**@internal */
    private static _temp: physics2D_GearJointDef;

    /**@internal 两个齿轮角速度比例，默认1*/
    private _ratio: number = 1;

    /**
     * @en The first joint to be connected, which can be a RevoluteJoint or a PrismaticJoint, effective only on the first setting.
     * @zh [首次设置有效]要绑定的第一个关节，类型可以是旋转关节（RevoluteJoint）或者棱形关节（PrismaticJoint）。
     */
    joint1: RevoluteJoint | PrismaticJoint;

    /**
     * @en The second joint to be connected, which can be a RevoluteJoint or a PrismaticJoint, effective only on the first setting.
     * @zh [首次设置有效]要绑定的第二个关节，类型可以是旋转关节（RevoluteJoint）或者棱形关节（PrismaticJoint）。
     */
    joint2: RevoluteJoint | PrismaticJoint;

    /**
     * @en Specifies whether the two connected bodies should collide with each other. Default is false, effective only on the first setting.
     * @zh [首次设置有效]两个刚体是否可以发生碰撞，默认为 false。
     */
    collideConnected: boolean = false;

    /**
     * @en The ratio of the angular velocities of the two gears.
     * @zh 两个齿轮的角速度比例。
     */
    get ratio(): number {
        return this._ratio;
    }

    set ratio(value: number) {
        this._ratio = value;
        if (this._joint) this._factory.set_GearJoint_SetRatio(this._joint, value);
    }

    /**
     * @internal
     * @override
     */
    protected _createJoint(): void {
        this._physics2DManager = this.owner?.scene?.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
        if (!this._joint) {
            if (!this.joint1) throw "Joint1 can not be empty";
            if (!this.joint2) throw "Joint2 can not be empty";

            var def: physics2D_GearJointDef = GearJoint._temp || (GearJoint._temp = new physics2D_GearJointDef());
            def.bodyA = this.joint1.owner.getComponent(ColliderBase).getBox2DBody();
            if (!def.bodyA) {
                this.joint1.owner.getComponent(ColliderBase).isConnectedJoint = true;
                this.joint1.owner.on("bodyCreated", this, this._createJoint);
                return;
            }
            def.bodyB = this.joint2.owner.getComponent(ColliderBase).getBox2DBody();
            if (!def.bodyB) {
                this.joint2.owner.getComponent(ColliderBase).isConnectedJoint = true;
                this.joint2.owner.on("bodyCreated", this, this._createJoint);
                return;
            }
            def.joint1 = this.joint1.joint;
            def.joint2 = this.joint2.joint;
            def.ratio = -this._ratio;
            def.collideConnected = this.collideConnected;
            this._box2DJointDef = Physics2D.I._factory.createJointDef(this._physics2DManager.box2DWorld, EPhysics2DJoint.GearJoint, def);
            this._joint = this._factory.createJoint(this._physics2DManager.box2DWorld, EPhysics2DJoint.GearJoint, this._box2DJointDef);
            this.joint1.owner.off("bodyCreated", this, this._createJoint);
            this.joint2.owner.off("bodyCreated", this, this._createJoint);
        }
    }

}