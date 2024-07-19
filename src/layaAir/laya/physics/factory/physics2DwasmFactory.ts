
import { ILaya } from "../../../ILaya";
import { IV2, Vector2 } from "../../maths/Vector2";
import { ColliderBase } from "../Collider2D/ColliderBase";
import { FixtureBox2DDef, PhysicsShape } from "../Collider2D/ColliderStructInfo";
import { IPhysiscs2DFactory } from "../IPhysiscs2DFactory";
import { Physics2D } from "../Physics2D";
import { Physics2DOption } from "../Physics2DOption";
import { Physics2DDebugDraw } from "../Physics2DDebugDraw";
import { RigidBody2DInfo } from "../RigidBody2DInfo";
import { physics2D_DistancJointDef, physics2D_GearJointDef, physics2D_MotorJointDef, physics2D_MouseJointJointDef, physics2D_PrismaticJointDef, physics2D_PulleyJointDef, physics2D_RevoluteJointDef, physics2D_WeldJointDef, physics2D_WheelJointDef } from "../joint/JointDefStructInfo"
import { Browser } from "../../utils/Browser";

const b2_maxFloat = 1E+37;

/**
 * @en Implements Box2D c++ version 2.4.1
 * @zh 实现Box2D c++ 2.4.1 版本
 */
export class physics2DwasmFactory implements IPhysiscs2DFactory {
    private _tempVe21: any;
    private _tempVe22: any;

    /**@internal box2D Engine */
    _box2d: any;

    /**@internal box2D world */
    _world: any;

    /**@internal  */
    _debugDraw: Physics2DDebugDraw;

    /**@internal  */
    private _jsDraw: any;

    /**
     * @internal
     * @en Velocity iterations, increasing the number will improve accuracy but reduce performance.
     * @zh 速度迭代次数，增大数字会提高精度，但是会降低性能。
     */
    _velocityIterations: number = 8;

    /**
     * @internal
     * @en Position iterations, increasing the number will improve accuracy but reduce performance.
     * @zh 位置迭代次数，增大数字会提高精度，但是会降低性能。
     */
    _positionIterations: number = 3;

    /**
     * @internal
     * @en Conversion ratio from pixels to meters
     * @zh 像素转换米的转换比率
     */
    _PIXEL_RATIO: number;

    /**
     * @internal
     * @en Conversion ratio from meters to pixels
     * @zh 米转换像素的转换比率
     */
    _Re_PIXEL_RATIO: number;


    /**@internal  */
    protected _tempDistanceJointDef: any;

    /**@internal  */
    protected _tempGearJoinDef: any;

    /**@internal  */
    protected _tempPulleyJointDef: any;

    /**@internal  */
    protected _tempWheelJointDef: any;

    /**@internal  */
    protected _tempWeldJointDef: any;

    /**@internal  */
    protected _tempMouseJointDef: any;

    /**@internal  */
    protected _tempRevoluteJointDef: any;

    /**@internal  */
    protected _tempMotorJointDef: any;

    /**@internal  */
    protected _tempPrismaticJointDef: any;

    /**@internal  */
    protected _tempPolygonShape: any;
    /**@internal  */
    protected _tempChainShape: any;
    /**@internal  */
    protected _tempCircleShape: any;
    /**@internal  */
    protected _tempEdgeShape: any;
    /**@internal  */
    protected _tempWorldManifold: any;



    /** 
     * @internal
     * @en The flag for drawing nothing.
     * @zh 不绘制任何内容的标志。
     */
    get drawFlags_none(): number {
        return 0;
    }

    /** 
     * @internal
     * @en The flag for drawing shapes.
     * @zh 绘制形状的标志。
     */
    get drawFlags_shapeBit(): number {
        return this._box2d.b2Draw.e_shapeBit;
    }

    /** 
     * @internal
     * @en The flag for drawing joints.
     * @zh 绘制关节的标志。
     */
    get drawFlags_jointBit(): number {
        return this._box2d.b2Draw.e_jointBit;
    }

    /** 
     * @internal
     * @en The flag for drawing AABBs.
     * @zh 绘制包围盒的标志。
     */
    get drawFlags_aabbBit(): number {
        return this._box2d.b2Draw.e_aabbBit;
    }

    /** 
     * @internal
     * @en The flag for drawing pairs.
     * @zh 绘制碰撞对的标志。
     */
    get drawFlags_pairBit(): number {
        return this._box2d.b2Draw.e_pairBit;
    }

    /** 
     * @internal
     * @en The flag for drawing the center of mass.
     * @zh 绘制质心的标志。
     */
    get drawFlags_centerOfMassBit(): number {
        return this._box2d.b2Draw.e_centerOfMassBit;
    }

    /** 
     * @internal
     * @en The flag for drawing all debug information.
     * @zh 绘制所有调试信息的标志。
     */
    get drawFlags_all(): number {
        return 63;
    }

    /** 
     * @internal
     * @en The box2d engine instance.
     * @zh box2d引擎实例。
     */
    get box2d(): any {
        return this._box2d;
    }

    /** 
     * @internal
     * @en The box2d world instance.
     * @zh box2d世界实例。
     */
    get world(): any {
        return this._world;
    }

    /** 
     * @internal
     * @en The debug draw instance.
     * @zh 调试绘制实例。
     */
    get debugDraw(): Physics2DDebugDraw {
        return this._debugDraw;
    }

    /** 
     * @internal
     * @en The ratio for converting physical length to pixel length.
     * @zh 物理长度转换为像素长度的比率。
     */
    get PIXEL_RATIO(): number {
        return this._PIXEL_RATIO;
    }

    /** 
     * @internal
     * @en The velocity iterations.
     * @zh 速度迭代次数。
     */
    get velocityIterations(): number {
        return this._velocityIterations;
    }

    /** 
     * @internal
     * @en The position iterations.
     * @zh 位置迭代次数。
     */
    get positionIterations(): number {
        return this._positionIterations;
    }

    /** 
     * @internal
     * @en The gravity environment of the physical world, default value is {x:0, y:1}.
     * If you modify the gravity direction to be upward on the y-axis, you can directly set gravity.y = -1.
     * @zh 物理世界重力环境，默认值为{x:0, y:1}。
     * 如果修改y方向重力方向向上，可以直接设置gravity.y = -1。
     */
    get gravity(): any {
        return this.world.GetGravity();
    }

    set gravity(value: Vector2) {
        var gravity: any = this.createPhyVec2(value.x, value.y);//TODO 全局设置，不必New
        this.world.SetGravity(gravity);
    }

    /**
     * @internal
     * @en Whether to allow sleeping. Sleeping can improve stability and performance, but usually sacrifices accuracy.
     * @zh 是否允许休眠。休眠可以提高稳定性和性能，但通常会牺牲准确性。
     */
    get allowSleeping(): boolean {
        return this.world.GetAllowSleeping();
    }

    set allowSleeping(value: boolean) {
        this.world.SetAllowSleeping(value);
    }


    /**
     * @internal
     * @en The total number of rigid bodies.
     * @zh 刚体总数量。
     */
    get bodyCount(): number {
        return this.world.GetBodyCount();
    }

    /**
     * @internal
     * @en The total number of contacts.
     * @zh 碰撞总数量。
     */
    get contactCount(): number {
        return this.world.GetContactCount();
    }

    /**
     * @internal
     * @en The total number of joints.
     * @zh 关节总数量。
     */
    get jointCount(): number {
        return this.world.GetJointCount();
    }


    /**
     * @internal
     * @en Convert render system data to physical system data.
     * @param value The value to convert (unit: pixels).
     * @returns The converted value (unit: meters).
     * @zh 渲染系统数据转换为物理系统数据。
     * @param value 要转换的值（单位：像素）。
     * @returns 转换后的值（单位：米）。
     */
    layaToPhyValue(value: number): number {
        return value * this._Re_PIXEL_RATIO;
    }

    /**
     * @internal
     * @en Convert physical system data to render system data.
     * @param value The value to convert (unit: meters).
     * @returns The converted value (unit: pixels).
     * @zh 物理系统数据转换为渲染系统数据。
     * @param value 要转换的值（单位：米）。
     * @returns 转换后的值（单位：像素）。
     */
    phyToLayaValue(value: number): number {
        return value * this.PIXEL_RATIO;
    }

    /** 
     * @internal
     * @en Create a Vec2 object in the physical system.
     * @param x The x-coordinate (unit: meters).
     * @param y The y-coordinate (unit: meters).
     * @zh 创建物理系统的Vec2对象。
     * @param x x坐标（单位：米）。
     * @param y y坐标（单位：米）。
     */
    createPhyVec2(x: number, y: number): any {
        return new this.box2d.b2Vec2(x, y);
    }

    /** 
     * @internal
     * @en Create a Vec2 object in the physical system from Laya coordinates.
     * @param x The x-coordinate (unit: pixels).
     * @param y The y-coordinate (unit: pixels).
     * @zh 从Laya坐标创建物理系统的Vec2对象。
     * @param x x坐标（单位：像素）。
     * @param y y坐标（单位：像素）。
     */
    createPhyFromLayaVec2(x: number, y: number): any {
        return new this.box2d.b2Vec2(this.layaToPhyValue(x), this.layaToPhyValue(y));
    }

    /**
     * @en Initialize the Box2D physics engine.
     * @returns A promise that resolves when the initialization is complete.
     * @zh 初始化Box2D物理引擎。
     * @returns 初始化完成时解析的promise。
     */
    initialize(): Promise<void> {
        return (window as any).Box2D().then((box2d: any) => {
            this._box2d = box2d;
            this._box2d.b2LinearStiffness = this.b2LinearStiffness;
            return Promise.resolve();
        });
    }

    /**
     * @en Create the Box2D world.
     * @zh 创建Box2D世界。
     */
    start() {
        this._PIXEL_RATIO = Physics2DOption.pixelRatio * Browser.pixelRatio;;
        this._Re_PIXEL_RATIO = 1 / this._PIXEL_RATIO;
        var gravity: any = this.createPhyVec2(Physics2DOption.gravity.x, Physics2DOption.gravity.y);
        this._world = new this.box2d.b2World(gravity);
        this._world.destroyed = false;

        this._tempVe21 = new this.box2d.b2Vec2();
        this._tempVe22 = new this.box2d.b2Vec2();

        this._tempPolygonShape = new this.box2d.b2PolygonShape();
        this._tempChainShape = new this.box2d.b2ChainShape();
        this._tempCircleShape = new this.box2d.b2CircleShape();
        this._tempEdgeShape = new this.box2d.b2EdgeShape();

        this._tempDistanceJointDef = new this.box2d.b2DistanceJointDef();
        this._tempGearJoinDef = new this.box2d.b2GearJointDef();
        this._tempPulleyJointDef = new this.box2d.b2PulleyJointDef();
        this._tempWheelJointDef = new this.box2d.b2WheelJointDef();
        this._tempWeldJointDef = new this.box2d.b2WeldJointDef();
        this._tempMouseJointDef = new this.box2d.b2MouseJointDef();
        this._tempRevoluteJointDef = new this.box2d.b2RevoluteJointDef();
        this._tempMotorJointDef = new this.box2d.b2MotorJointDef();
        this._tempPrismaticJointDef = new this.box2d.b2PrismaticJointDef();
        this._tempWorldManifold = new this.box2d.b2WorldManifold();

        this.world.SetDestructionListener(this.getDestructionListener());
        this.world.SetContactListener(this.getContactListener());
        this.allowSleeping = Physics2DOption.allowSleeping == null ? true : Physics2DOption.allowSleeping;
        this._velocityIterations = Physics2DOption.velocityIterations;
        this._positionIterations = Physics2DOption.positionIterations;
    }

    /**
     * @internal
     * @en Destroy the Box2D world.
     * @zh 销毁Box2D世界。
     */
    destroyWorld() {
        if (this._tempVe21) {
            this.destory(this._tempVe21);
            this._tempVe21 = null;
        }
        if (this._tempVe22) {
            this.destory(this._tempVe22);
            this._tempVe22 = null;
        }

        if (this._tempPolygonShape) {
            this.destory(this._tempPolygonShape);
            this._tempPolygonShape = null;
        }
        if (this._tempChainShape) {
            this.destory(this._tempChainShape);
            this._tempChainShape = null;
        }
        if (this._tempCircleShape) {
            this.destory(this._tempCircleShape);
            this._tempCircleShape = null;
        }
        if (this._tempEdgeShape) {
            this.destory(this._tempEdgeShape);
            this._tempEdgeShape = null;
        }

        if (this._tempDistanceJointDef) {
            this.destory(this._tempDistanceJointDef);
            this._tempDistanceJointDef = null;
        }
        if (this._tempGearJoinDef) {
            this.destory(this._tempGearJoinDef);
            this._tempGearJoinDef = null;
        }
        if (this._tempPulleyJointDef) {
            this.destory(this._tempPulleyJointDef);
            this._tempPulleyJointDef = null;
        }
        if (this._tempWheelJointDef) {
            this.destory(this._tempWheelJointDef);
            this._tempWheelJointDef = null;
        }
        if (this._tempWeldJointDef) {
            this.destory(this._tempWeldJointDef);
            this._tempWeldJointDef = null;
        }
        if (this._tempMouseJointDef) {
            this.destory(this._tempMouseJointDef);
            this._tempMouseJointDef = null;
        }
        if (this._tempRevoluteJointDef) {
            this.destory(this._tempRevoluteJointDef);
            this._tempRevoluteJointDef = null;
        }
        if (this._tempMotorJointDef) {
            this.destory(this._tempMotorJointDef);
            this._tempMotorJointDef = null;
        }
        if (this._tempPrismaticJointDef) {
            this.destory(this._tempPrismaticJointDef);
            this._tempPrismaticJointDef = null;
        }

        if (this._tempWorldManifold) {
            this.destory(this._tempWorldManifold);
            this._tempWorldManifold = null;
        }

        if (this._world) {
            this.box2d.destroy(this._world)
            this._world.destroyed = true;
            this._world = null;
        }
        this._jsDraw = null;
        if (this._debugDraw) {
            this._debugDraw.removeSelf()
            this._debugDraw = null
        }
    }

    /**
     * @en Update the physics world.
     * @param delta The time step.
     * @zh 更新物理世界。
     * @param delta 时间步长。
     */
    update(delta: number): void {

        //set Physics Position from Engine TODO
        this._world & this._world.Step(delta, this.velocityIterations, this.positionIterations, 3);

        //set engine Position from Phyiscs TODO
    }

    /**
     * @en Send physics event.
     * @param type The event type.
     * @param contact The contact object.
     * @zh 发送物理事件。
     * @param type 事件类型。
     * @param contact 碰撞对象。
     */
    sendEvent(type: string, contact: any): void {
        if (contact.GetFixtureA() == null || contact.GetFixtureB() == null) {
            return;
        }
        let colliderA: any = contact.GetFixtureA().collider;
        let colliderB: any = contact.GetFixtureB().collider;
        if (colliderA == null || colliderB == null) {
            return;
        }
        if (colliderA.destroyed || colliderB.destroyed) {
            return;
        }
        let ownerA: any = colliderA.owner;
        let ownerB: any = colliderB.owner;
        let __this = this;
        contact.getHitInfo = function (): any {
            var manifold: any = __this._tempWorldManifold;
            this.GetWorldManifold(manifold);
            //第一点？
            let p: any = manifold.points;
            p.x = __this.phyToLayaValue(p.x);
            p.y = __this.phyToLayaValue(p.y);
            return manifold;
        }
        if (ownerA) {
            var args: any[] = [colliderB, colliderA, contact];
            ownerA.event(type, args);
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            ownerB.event(type, args);
        }
    }

    /**
     * @internal
     * @en Create physics draw.
     * @zh 创建物理绘制。
     */
    createDebugDraw(flags: number) {
        if (this._debugDraw) return;
        this._debugDraw = new Physics2DDebugDraw(this);
        ILaya.stage.addChild(this._debugDraw);
        this._debugDraw.zOrder = 1000;

        if (this._jsDraw == null) {
            var jsDraw = this._jsDraw = new this.box2d.JSDraw();
            jsDraw.SetFlags(flags);
            jsDraw.DrawSegment = this.DrawSegment.bind(this);
            jsDraw.DrawPolygon = this.DrawPolygon.bind(this);
            jsDraw.DrawSolidPolygon = this.DrawSolidPolygon.bind(this);
            jsDraw.DrawCircle = this.DrawCircle.bind(this);
            jsDraw.DrawSolidCircle = this.DrawSolidCircle.bind(this);
            jsDraw.DrawTransform = this.DrawTransform.bind(this);
            jsDraw.DrawPoint = this.DrawPoint.bind(this);
            jsDraw.DrawAABB = this.DrawAABB.bind(this);
        }

        this.world.SetDebugDraw(this._jsDraw);
    }

    /**
     * @internal
     * @en Remove physics debug draw.
     * @zh 删除物理绘制。
     */
    removeDebugDraw() {
        if (!this._debugDraw) return;
        this.world.SetDebugDraw(null);
        this._debugDraw.removeSelf()
        this._debugDraw.destroy()
        this._debugDraw = null;
    }

    /**
     * @internal
     * @en Update display data.
     * @zh 更新显示数据。
     */
    setDebugFlag(flags: number): void {
        if (this._jsDraw) this._jsDraw.SetFlags(flags);
    }

    /**
     * @internal
     * @en Show marks
     * @zh 显示标记
     */
    appendFlags(flags: number): void {
        if (this._jsDraw) this._jsDraw.AppendFlags(flags);
    }

    /**
     * @internal
     * @en Clear marks
     * @zh 清除标记
     */
    clearFlags(flags: number): void {
        if (this._jsDraw) this._jsDraw.ClearFlags(flags);
    }

    /**
     * @internal
     * @en Shift the physics world origin.
     * @param x The x-coordinate shift (unit: pixels).
     * @param y The y-coordinate shift (unit: pixels).
     * @zh 移动物理世界原点。
     * @param x x轴偏移量（单位：像素）。
     * @param y y轴偏移量（单位：像素）。
     */
    shiftOrigin(x: number, y: number) {
        this._world & this.world.ShiftOrigin({ x: x, y: y });
    }

    /**
     * @en Create a Box2D body.
     * @param def The body definition.
     * @returns The created Box2D body.
     * @zh 创建一个Box2D刚体。
     * @param def 刚体定义。
     * @returns 创建的Box2D刚体。
     */
    createBody(def: any) {
        if (!def) {
            def = new this.box2d.b2BodyDef()
        }
        def.userData = { pointer: 0 };
        if (this.world) {
            let body = this.world.CreateBody(def);
            body.world = this.world;
            return body;
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * @en Remove a Box2D body.
     * @param body The Box2D body to remove.
     * @zh 移除一个Box2D刚体。
     * @param body 要移除的Box2D刚体。
     */
    removeBody(body: any): void {
        let world = body.world;
        if (!world.destroyed) world.DestroyBody(body);
    }

    /**
     * @en Create a Box2D joint.
     * @param def The joint definition.
     * @param cls The joint class (optional).
     * @returns The created Box2D joint.
     * @zh 创建一个Box2D关节。
     * @param def 关节定义。
     * @param cls 关节类（可选）。
     * @returns 创建的Box2D关节。
     */
    createJoint(def: any, cls: any = null): any {
        if (this.world) {
            let joint = this.world.CreateJoint(def);
            if (cls != null) {
                joint = this.castObject(joint, cls)
            }
            joint.m_userData = {};
            joint.world = this._world;
            return joint;
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * @en Remove a Box2D joint.
     * @param joint The Box2D joint to remove.
     * @zh 移除一个Box2D关节。
     * @param joint 要移除的Box2D关节。
     */
    removeJoint(joint: any): void {
        if (joint && joint.world && !joint.world.destroyed)
            joint.world.DestroyJoint(joint);
    }

    /**
     * @en Get the user data of a joint.
     * @param joint The joint.
     * @returns The user data of the joint.
     * @zh 获取关节的用户数据。
     * @param joint 关节。
     * @returns 关节的用户数据。
     */
    getJoint_userData(joint: any) {
        return joint.GetUserData();
    }

    /**
     * @en Check if the user data of a joint is marked as destroyed.
     * @param joint The joint.
     * @returns True if the user data is marked as destroyed, false otherwise.
     * @zh 检查关节的用户数据是否被标记为已销毁。
     * @param joint 关节。
     * @returns 用户数据是否已被标记为已销毁。
     */
    getJoint_userData_destroy(joint: any): boolean {
        return joint.GetUserData().pointer == -1;
    }

    /**
     * @en Enable or disable the motor of a joint.
     * @param joint The joint.
     * @param enableMotor True to enable the motor, false to disable it.
     * @zh 启用或禁用关节的马达。
     * @param joint 关节。
     * @param enableMotor 是否启用马达。
     */
    set_Joint_EnableMotor(joint: any, enableMotor: boolean): void {
        joint.EnableMotor(enableMotor);
    }

    /**
     * @en Set the motor speed of a joint.
     * @param joint The joint.
     * @param motorSpeed The motor speed.
     * @zh 设置关节的马达速度。
     * @param joint 关节。
     * @param motorSpeed 马达速度。
     */
    set_Joint_SetMotorSpeed(joint: any, motorSpeed: number): void {
        joint.SetMotorSpeed(motorSpeed);
    }

    /**
     * @en Set the maximum motor torque of a joint.
     * @param joint The joint.
     * @param maxTorque The maximum motor torque.
     * @zh 设置关节的最大马达扭矩。
     * @param joint 关节。
     * @param maxTorque 最大马达扭矩。
     */
    set_Joint_SetMaxMotorTorque(joint: any, maxTorque: number): void {
        joint.SetMaxMotorTorque(maxTorque);
    }

    /**
     * @en Enable or disable the limit of a joint.
     * @param joint The joint.
     * @param enableLimit True to enable the limit, false to disable it.
     * @zh 启用或禁用关节的限制。
     * @param joint 关节。
     * @param enableLimit 是否启用限制。
     */
    set_Joint_EnableLimit(joint: any, enableLimit: boolean): void {
        joint.EnableLimit(enableLimit);
    }

    /**
     * @en Set the limits of a joint.
     * @param joint The joint.
     * @param lowerAngle The lower angle limit.
     * @param upperAngle The upper angle limit.
     * @zh 设置关节的限制。
     * @param joint 关节。
     * @param lowerAngle 底角限制。
     * @param upperAngle 顶角限制。
     */
    set_Joint_SetLimits(joint: any, lowerAngle: number, upperAngle: number): void {
        joint.SetLimits(lowerAngle, upperAngle);
    }

    /**
     * @en Set the frequency and damping ratio of a joint.
     * @param joint The joint.
     * @param frequency The frequency.
     * @param dampingRatio The damping ratio.
     * @param isdamping True to apply damping, false otherwise.
     * @zh 设置关节的频率和阻尼比。
     * @param joint 关节。
     * @param frequency 频率。
     * @param dampingRatio 阻尼比。
     * @param isdamping 是否应用阻尼。
     */
    set_Joint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void {
        let out: any = {}
        this.box2d.b2AngularStiffness(out, frequency, dampingRatio, Joint.GetBodyA(), Joint.GetBodyB());
        if (!isdamping) {
            Joint.SetStiffness(out.stiffness);
        }
        Joint.SetDamping(out.damping);
    }

    /**
     * @en Create a distance joint.
     * @param defStruct The distance joint definition.
     * @returns The created distance joint.
     * @zh 创建一个距离关节。
     * @param defStruct 距离关节定义。
     * @returns 创建的距离关节。
     */
    createDistanceJoint(defStruct: physics2D_DistancJointDef) {
        const def = this._tempDistanceJointDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.localAnchorA.Set(this.layaToPhyValue(defStruct.localAnchorA.x), this.layaToPhyValue(defStruct.localAnchorA.y));
        def.localAnchorB.Set(this.layaToPhyValue(defStruct.localAnchorB.x), this.layaToPhyValue(defStruct.localAnchorB.y));

        this.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, def.bodyA, def.bodyB);
        def.set_collideConnected(defStruct.collideConnected);

        if (defStruct.length > 0) {
            def.length = this.layaToPhyValue(defStruct.length);
        } else {
            var p1: any = def.bodyA.GetWorldPoint(def.localAnchorA);
            let data = { x: p1.x, y: p1.y };
            var p2: any = def.bodyB.GetWorldPoint(def.localAnchorB);
            def.length = this.getVec2Length(data, p2);
        }

        if (defStruct.maxLength > 0)
            def.maxLength = this.layaToPhyValue(defStruct.maxLength);
        else
            def.maxLength = b2_maxFloat;

        if (defStruct.minLength > 0)
            def.minLength = this.layaToPhyValue(defStruct.minLength);
        else
            def.minLength = 0;

        return this.createJoint(def, this.box2d.b2DistanceJoint);
    }

    /**
     * @en Set the length of a distance joint.
     * @param joint The distance joint.
     * @param length The length.
     * @zh 设置距离关节的长度。
     * @param joint 距离关节。
     * @param length 长度。
     */
    set_DistanceJoint_length(joint: any, length: number) {
        joint.SetLength(this.layaToPhyValue(length));
    }

    /**
     * @en Set the maximum length of a distance joint.
     * @param joint The distance joint.
     * @param length The maximum length.
     * @zh 设置距离关节的最大长度。
     * @param joint 距离关节。
     * @param length 最大长度。
     */
    set_DistanceJoint_MaxLength(joint: any, length: number) {
        joint.SetMaxLength(this.layaToPhyValue(length));
    }

    /**
     * @en Set the minimum length of a distance joint.
     * @param joint The distance joint.
     * @param length The minimum length.
     * @zh 设置距离关节的最小长度。
     * @param joint 距离关节。
     * @param length 最小长度。
     */
    set_DistanceJoint_MinLength(joint: any, length: number) {
        joint.SetMinLength(this.layaToPhyValue(length));
    }

    /**
     * @en Set the stiffness and damping of a distance joint.
     * @param joint The distance joint.
     * @param stiffness The stiffness.
     * @param damping The damping.
     * @zh 设置距离关节的刚度和阻尼。
     * @param joint 距离关节。
     * @param stiffness 刚度。
     * @param damping 阻尼。
     */
    set_DistanceJointStiffnessDamping(joint: any, steffness: number, damping: number) {
        let out: any = {};
        let bodyA = joint.GetBodyA();
        let bodyB = joint.GetBodyB();
        this.box2d.b2LinearStiffness(out, steffness, damping, bodyA, bodyB);
        joint.SetStiffness(out.stiffness);
        joint.SetDamping(out.damping);
    }

    /** 
     * @en Create a gear joint.
     * @param defStruct The definition of the gear joint.
     * @returns The created gear joint.
     * @zh 创建齿轮关节。
     * @param defStruct 齿轮关节定义。
     * @returns 创建的齿轮关节。
     */
    create_GearJoint(defStruct: physics2D_GearJointDef): void {
        let def = this._tempGearJoinDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.joint1 = defStruct.joint1;
        def.joint2 = defStruct.joint2;
        def.ratio = defStruct.ratio;
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2GearJoint);
    }

    /** 
     * @en Set the ratio of a gear joint.
     * @param joint The gear joint.
     * @param radio The ratio to set.
     * @zh 设置齿轮关节的比率。
     * @param joint 齿轮关节。
     * @param radio 要设置的比率。
     */
    set_GearJoint_SetRatio(joint: any, radio: number): void {
        joint.SetRatio(radio);
    }

    /** 
     * @en Create a pulley joint.
     * @param defStruct The definition of the pulley joint.
     * @returns The created pulley joint.
     * @zh 创建滑轮关节。
     * @param defStruct 滑轮关节定义。
     * @returns 创建的滑轮关节。
     */
    create_PulleyJoint(defStruct: physics2D_PulleyJointDef): void {
        let def = this._tempPulleyJointDef;
        let groundVecA = this.createPhyFromLayaVec2(defStruct.groundAnchorA.x, defStruct.groundAnchorA.y);
        let groundVecB = this.createPhyFromLayaVec2(defStruct.groundAnchorB.x, defStruct.groundAnchorB.y);
        let anchorVecA = this.createPhyFromLayaVec2(defStruct.localAnchorA.x, defStruct.localAnchorA.y);
        let anchorVecB = this.createPhyFromLayaVec2(defStruct.localAnchorB.x, defStruct.localAnchorB.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, groundVecA, groundVecB, anchorVecA, anchorVecB, defStruct.ratio);
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2PulleyJoint);
    }

    /** 
     * @en Create a wheel joint.
     * @param defStruct The definition of the wheel joint.
     * @returns The created wheel joint.
     * @zh 创建轮子关节。
     * @param defStruct 轮子关节定义。
     * @returns 创建的轮子关节。
     */
    create_WheelJoint(defStruct: physics2D_WheelJointDef) {
        let def = this._tempWheelJointDef;
        let anchorVec = this.createPhyFromLayaVec2(defStruct.anchor.x, defStruct.anchor.y);
        let axis = this.createPhyVec2(defStruct.axis.x, defStruct.axis.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, anchorVec, axis);
        def.enableMotor = defStruct.enableMotor;
        def.motorSpeed = defStruct.motorSpeed;
        def.maxMotorTorque = defStruct.maxMotorTorque;
        this.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, def.bodyA, def.bodyB);
        def.collideConnected = defStruct.collideConnected;
        def.enableLimit = defStruct.enableLimit;
        def.lowerTranslation = this.layaToPhyValue(defStruct.lowerTranslation);
        def.upperTranslation = this.layaToPhyValue(defStruct.upperTranslation);
        return this.createJoint(def, this.box2d.b2WheelJoint);
    }

    /** 
     * @en Create a weld joint.
     * @param defStruct The definition of the weld joint.
     * @returns The created weld joint.
     * @zh 创建焊接关节。
     * @param defStruct 焊接关节定义。
     * @returns 创建的焊接关节。
     */
    create_WeldJoint(defStruct: physics2D_WeldJointDef) {
        let def = this._tempWeldJointDef;
        let anchorVec = this.createPhyFromLayaVec2(defStruct.anchor.x, defStruct.anchor.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, anchorVec);
        this.b2AngularStiffness(def, defStruct.frequency, defStruct.dampingRatio, defStruct.bodyA, defStruct.bodyB);
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2WeldJoint);
    }

    /** 
     * @en Create a mouse joint.
     * @param defStruct The definition of the mouse joint.
     * @returns The created mouse joint.
     * @zh 创建鼠标关节。
     * @param defStruct 鼠标关节定义。
     * @returns 创建的鼠标关节。
     */
    create_MouseJoint(defStruct: physics2D_MouseJointJointDef): any {
        let def = this._tempMouseJointDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.target = this.createPhyFromLayaVec2(defStruct.target.x, defStruct.target.y);
        def.maxForce = defStruct.maxForce * defStruct.bodyB.GetMass();
        def.collideConnected = true;
        this.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, defStruct.bodyA, defStruct.bodyB)
        return this.createJoint(def, this.box2d.b2MouseJoint);
    }

    /** 
     * @en Set the target position of a mouse joint.
     * @param joint The mouse joint.
     * @param x The x-coordinate of the target position.
     * @param y The y-coordinate of the target position.
     * @zh 设置鼠标关节的目标位置。
     * @param joint 鼠标关节。
     * @param x 目标位置的x坐标。
     * @param y 目标位置的y坐标。
     */
    set_MouseJoint_target(joint: any, x: number, y: number) {
        this._tempVe21.x = this.layaToPhyValue(x);
        this._tempVe21.y = this.layaToPhyValue(y);
        joint.SetTarget(this._tempVe21)
    }

    /** 
     * @en Set the frequency and damping ratio of a mouse joint.
     * @param Joint The mouse joint.
     * @param frequency The frequency.
     * @param dampingRatio The damping ratio.
     * @zh 设置鼠标关节的频率和阻尼比。
     * @param Joint 鼠标关节。
     * @param frequency 频率。
     * @param dampingRatio 阻尼比。
     */
    set_MouseJoint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number) {
        this.set_DistanceJointStiffnessDamping(Joint, frequency, dampingRatio);
    }

    /** 
     * @en Create a revolute joint.
     * @param defStruct The definition of the revolute joint.
     * @returns The created revolute joint.
     * @zh 创建旋转关节。
     * @param defStruct 旋转关节定义。
     * @returns 创建的旋转关节。
     */
    create_RevoluteJoint(defStruct: physics2D_RevoluteJointDef): any {
        let def = this._tempRevoluteJointDef;
        var anchorVec = this.createPhyFromLayaVec2(defStruct.anchor.x, defStruct.anchor.y);
        def.Initialize(defStruct.bodyA, defStruct.bodyB, anchorVec);
        def.enableMotor = defStruct.enableMotor;
        def.motorSpeed = defStruct.motorSpeed;
        def.maxMotorTorque = defStruct.maxMotorTorque;
        def.enableLimit = defStruct.enableLimit;
        def.lowerAngle = defStruct.lowerAngle;
        def.upperAngle = defStruct.upperAngle;
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2RevoluteJoint);
    }

    /** 
     * @en Create a motor joint.
     * @param defStruct The definition of the motor joint.
     * @returns The created motor joint.
     * @zh 创建马达关节。
     * @param defStruct 马达关节定义。
     * @returns 创建的马达关节。
     */
    create_MotorJoint(defStruct: physics2D_MotorJointDef): any {
        let def = this._tempMotorJointDef;
        def.Initialize(defStruct.bodyA, defStruct.bodyB);
        def.linearOffset = this.createPhyFromLayaVec2(defStruct.linearOffset.x, defStruct.linearOffset.y);
        def.angularOffset = defStruct.angularOffset;
        def.maxForce = defStruct.maxForce;
        def.maxTorque = defStruct.maxTorque;
        def.correctionFactor = defStruct.correctionFactor;
        def.collideConnected = defStruct.collideConnected;
        return this.createJoint(def, this.box2d.b2MotorJoint);
    }

    /** 
     * @en Set the linear offset of a motor joint.
     * @param joint The motor joint.
     * @param x The x-coordinate of the linear offset.
     * @param y The y-coordinate of the linear offset.
     * @zh 设置马达关节的线性偏移量。
     * @param joint 马达关节。
     * @param x 线性偏移量的x坐标。
     * @param y 线性偏移量的y坐标。
     */
    set_MotorJoint_linearOffset(joint: any, x: number, y: number): void {
        joint.SetLinearOffset(this.createPhyFromLayaVec2(x, y));
    }

    /** 
     * @en Set the angular offset of a motor joint.
     * @param joint The motor joint.
     * @param angular The angular offset.
     * @zh 设置马达关节的角度偏移量。
     * @param joint 马达关节。
     * @param angular 角度偏移量。
     */
    set_MotorJoint_SetAngularOffset(joint: any, angular: number): void {
        joint.SetAngularOffset(angular);
    }

    /** 
     * @en Set the maximum force of a motor joint.
     * @param joint The motor joint.
     * @param maxForce The maximum force.
     * @zh 设置马达关节的最大力。
     * @param joint 马达关节。
     * @param maxForce 最大力。
     */
    set_MotorJoint_SetMaxForce(joint: any, maxForce: number): void {
        joint.SetMaxForce(maxForce);
    }

    /** 
     * @en Set the maximum torque of a motor joint.
     * @param joint The motor joint.
     * @param maxTorque The maximum torque.
     * @zh 设置马达关节的最大扭矩。
     * @param joint 马达关节。
     * @param maxTorque 最大扭矩。
     */
    set_MotorJoint_SetMaxTorque(joint: any, maxTorque: number): void {
        joint.SetMaxTorque(maxTorque);
    }

    /** 
     * @en Set the correction factor of a motor joint.
     * @param joint The motor joint.
     * @param correctionFactor The correction factor.
     * @zh 设置马达关节的校正因子。
     * @param joint 马达关节。
     * @param correctionFactor 校正因子。
     */
    set_MotorJoint_SetCorrectionFactor(joint: any, correctionFactor: number): void {
        joint.SetCorrectionFactor(correctionFactor);
    }

    /** 
     * @en Create a prismatic joint.
     * @param def The definition of the prismatic joint.
     * @returns The created prismatic joint.
     * @zh 创建平移关节。
     * @param def 平移关节定义。
     * @returns 创建的平移关节。
     */
    create_PrismaticJoint(def: physics2D_PrismaticJointDef): any {
        let tdef = this._tempPrismaticJointDef;
        let anchorVec = this.createPhyFromLayaVec2(def.anchor.x, def.anchor.y);
        let axis = this.createPhyVec2(def.axis.x, def.axis.y);
        tdef.Initialize(def.bodyA, def.bodyB, anchorVec, axis);
        tdef.enableMotor = def.enableMotor;
        tdef.motorSpeed = def.motorSpeed;
        tdef.maxMotorForce = def.maxMotorForce;
        tdef.enableLimit = def.enableLimit;
        tdef.lowerTranslation = this.layaToPhyValue(def.lowerTranslation);
        tdef.upperTranslation = this.layaToPhyValue(def.upperTranslation);
        tdef.collideConnected = def.collideConnected;
        return this.createJoint(tdef, this.box2d.b2PrismaticJoint);
    }

    /** 
     * @en Create a box collider shape.
     * @returns The created box collider shape.
     * @zh 创建盒子碰撞器形状。
     * @returns 创建的盒子碰撞器形状。
     */
    create_boxColliderShape() {
        return this._tempPolygonShape;
    }

    /** 
     * @en Set the shape of a box collider as a box.
     * @param shape The box collider shape.
     * @param width The width of the box.
     * @param height The height of the box.
     * @param pos The position of the box.
     * @param scaleX The horizontal scale of the box.
     * @param scaleY The vertical scale of the box.
     * @zh 将盒子碰撞器的形状设置为盒子。
     * @param shape 盒子碰撞器形状。
     * @param width 盒子的宽度。
     * @param height 盒子的高度。
     * @param pos 盒子的位置。
     * @param scaleX 盒子的水平缩放。
     * @param scaleY 盒子的垂直缩放。
     */
    set_collider_SetAsBox(shape: any, width: number, height: number, pos: IV2, scaleX: number, scaleY: number) {
        width = this.layaToPhyValue(width * scaleX);
        height = this.layaToPhyValue(height * scaleY);
        let centroid = shape.m_centroid;
        centroid.x = this.layaToPhyValue(pos.x * scaleX);
        centroid.y = this.layaToPhyValue(pos.y * scaleY);
        shape.SetAsBox(width, height, centroid, 0);
    }

    /**
     * @en Create a chain shape.
     * @returns The created chain shape.
     * @zh 创建链条形状。
     * @returns 创建的链条形状。
     */
    create_ChainShape() {
        return this._tempChainShape;
    }

    /**
     * @en Set the data of a chain shape.
     * @param shape The chain shape.
     * @param x The x-coordinate of the chain shape's position.
     * @param y The y-coordinate of the chain shape's position.
     * @param arr The vertex array of the chain shape.
     * @param loop Whether the chain shape is a loop.
     * @param scaleX The horizontal scale of the chain shape.
     * @param scaleY The vertical scale of the chain shape.
     * @zh 设置链条形状的数据。
     * @param shape 链条形状。
     * @param x 链条形状的位置的x坐标。
     * @param y 链条形状的位置的y坐标。
     * @param arr 链条形状的顶点数组。
     * @param loop 链条形状是否为循环。
     * @param scaleX 链条形状的水平缩放。
     * @param scaleY 链条形状的垂直缩放。
     */
    set_ChainShape_data(shape: any, x: number, y: number, arr: number[], loop: boolean, scaleX: number, scaleY: number) {
        let len = arr.length;
        shape.Clear();
        var ptr_wrapped = this.createVec2Pointer(arr, x, y, scaleX, scaleY);
        if (loop) {
            shape.CreateLoop(ptr_wrapped, len >> 1);
        } else {
            shape.CreateChain(ptr_wrapped, len >> 1);
        }
        this._box2d._free(ptr_wrapped.ptr);
    }

    /**
     * @en Create a circle shape.
     * @returns The created circle shape.
     * @zh 创建圆形形状。
     * @returns 创建的圆形形状。
     */
    create_CircleShape() {
        return this._tempCircleShape;
    }


    /**
     * @en Set the radius of a circle shape.
     * @param shape The circle shape.
     * @param radius The radius of the circle shape.
     * @param scale The scale of the circle shape.
     * @zh 设置圆形形状的半径。
     * @param shape 圆形形状。
     * @param radius 圆形形状的半径。
     * @param scale 圆形形状的缩放。
     */
    set_CircleShape_radius(shape: any, radius: number, scale: number) {
        shape.m_radius = this.layaToPhyValue(radius * scale);
    }

    /**
     * @en Set the position of a circle shape.
     * @param shape The circle shape.
     * @param x The x-coordinate of the circle shape's position.
     * @param y The y-coordinate of the circle shape's position.
     * @param scale The scale of the circle shape.
     * @zh 设置圆形形状的位置。
     * @param shape 圆形形状。
     * @param x 圆形形状的位置的x坐标。
     * @param y 圆形形状的位置的y坐标。
     * @param scale 圆形形状的缩放。
     */
    set_CircleShape_pos(shape: any, x: number, y: number, scale: number) {
        shape.m_p.Set(this.layaToPhyValue(x * scale), this.layaToPhyValue(y * scale));
    }

    /**
     * @en Create an edge shape.
     * @returns The created edge shape.
     * @zh 创建边缘形状。
     * @returns 创建的边缘形状。
     */
    create_EdgeShape() {
        return this._tempEdgeShape;
    }

    /**
     * @en Set the data of an edge shape.
     * @param shape The edge shape.
     * @param x The x-coordinate of the edge shape's position.
     * @param y The y-coordinate of the edge shape's position.
     * @param arr The vertex array of the edge shape.
     * @param scaleX The horizontal scale of the edge shape.
     * @param scaleY The vertical scale of the edge shape.
     * @zh 设置边缘形状的数据。
     * @param shape 边缘形状。
     * @param x 边缘形状的位置的x坐标。
     * @param y 边缘形状的位置的y坐标。
     * @param arr 边缘形状的顶点数组。
     * @param scaleX 边缘形状的水平缩放。
     * @param scaleY 边缘形状的垂直缩放。
     */
    set_EdgeShape_data(shape: any, x: number, y: number, arr: number[], scaleX: number, scaleY: number) {
        let len = arr.length;
        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(this.createPhyFromLayaVec2((x + arr[i]) * scaleX, (y + arr[i + 1]) * scaleX));
        }
        shape.SetTwoSided(ps[0], ps[1])
    }

    /**
     * @en Create a polygon shape.
     * @returns The created polygon shape.
     * @zh 创建多边形形状。
     * @returns 创建的多边形形状。
     */
    create_PolygonShape() {
        return this._tempPolygonShape;
    }


    /**
     * @en Set the data of a polygon shape.
     * @param shape The polygon shape.
     * @param x The x-coordinate of the polygon shape's position.
     * @param y The y-coordinate of the polygon shape's position.
     * @param arr The vertex array of the polygon shape.
     * @param scaleX The horizontal scale of the polygon shape.
     * @param scaleY The vertical scale of the polygon shape.
     * @zh 设置多边形形状的数据。
     * @param shape 多边形形状。
     * @param x 多边形形状的位置的x坐标。
     * @param y 多边形形状的位置的y坐标。
     * @param arr 多边形形状的顶点数组。
     * @param scaleX 多边形形状的水平缩放。
     * @param scaleY 多边形形状的垂直缩放。
     */
    set_PolygonShape_data(shape: any, x: number, y: number, arr: number[], scaleX: number, scaleY: number) {
        let ptr_wrapped = this.createVec2Pointer(arr, x, y, scaleX, scaleY);
        shape.Set(ptr_wrapped, arr.length / 2);
        this._box2d._free(ptr_wrapped.ptr);
    }

    /**
     * @en Create a fixture definition.
     * @param fixtureDef The fixture definition.
     * @returns The created fixture definition.
     * @zh 创建夹具定义。
     * @param fixtureDef 夹具定义。
     * @returns 创建的夹具定义。
     */
    createFixtureDef(fixtureDef: FixtureBox2DDef) {
        var def: any = new this.box2d.b2FixtureDef();
        def.density = fixtureDef.density;
        def.friction = fixtureDef.friction;
        def.isSensor = fixtureDef.isSensor;
        def.restitution = fixtureDef.restitution;
        switch (fixtureDef.shape) {
            case PhysicsShape.BoxShape:
            case PhysicsShape.PolygonShape:
                def.set_shape(this._tempPolygonShape);
                break;
            case PhysicsShape.ChainShape:
                def.set_shape(this._tempChainShape);
                break;
            case PhysicsShape.CircleShape:
                def.set_shape(this._tempCircleShape)
                break;
            case PhysicsShape.EdgeShape:
                def.set_shape(this._tempEdgeShape);
                break;
        }
        def.world = this._world;
        def.shapeType = fixtureDef.shape;
        def._shape = this.get_fixtureshape(def.shape, fixtureDef.shape);
        return def;
    }

    /**
     * @en Set the group index of a fixture definition.
     * @param def The fixture definition.
     * @param groupIndex The group index.
     * @zh 设置夹具定义的组索引。
     * @param def 夹具定义。
     * @param groupIndex 组索引。
     */
    set_fixtureDef_GroupIndex(def: any, groupIndex: number) {
        def.filter.groupIndex = groupIndex;
    }

    /**
     * @en Set the category bits of a fixture definition.
     * @param def The fixture definition.
     * @param categoryBits The category bits.
     * @zh 设置夹具定义的类别位。
     * @param def 夹具定义。
     * @param categoryBits 类别位。
     */
    set_fixtureDef_CategoryBits(def: any, categoryBits: number) {
        def.filter.categoryBits = categoryBits;
    }

    /**
     * @en Set the mask bits of a fixture definition.
     * @param def The fixture definition.
     * @param maskbits The mask bits.
     * @zh 设置夹具定义的掩码位。
     * @param def 夹具定义。
     * @param maskbits 掩码位。
     */
    set_fixtureDef_maskBits(def: any, maskbits: number) {
        def.filter.maskBits = maskbits;
    }

    /**
     * @en Create a fixture by body and definition.
     * @param body The body.
     * @param fixtureDef The fixture definition.
     * @zh 通过物体和定义创建夹具。
     * @param body 物体。
     * @param fixtureDef 夹具定义。
     */
    createfixture(body: any, fixtureDef: any) {
        let data = body.CreateFixture(fixtureDef);
        data.world = this._world;
        data.shape = this.get_fixtureshape(data.GetShape(), fixtureDef.shapeType);
        data.filter = data.GetFilterData();
        return data;
    }

    /**
     * @internal
     * @en Reset the fixture data.
     * @param fixture The fixture.
     * @param fixtureDef The fixture definition.
     * @zh 重置夹具数据。
     * @param fixture 夹具。
     * @param fixtureDef 夹具定义。
     */
    resetFixtureData(fixture: any, fixtureDef: FixtureBox2DDef): void {
        fixture.SetDensity(fixtureDef.density);
        fixture.SetFriction(fixtureDef.friction);
        fixture.SetSensor(fixtureDef.isSensor);
        fixture.SetRestitution(fixtureDef.restitution);
    }

    /**
     * @en Set the collider of a fixture.
     * @param fixture The fixture.
     * @param instance The collider instance.
     * @zh 设置夹具的碰撞器。
     * @param fixture 夹具。
     * @param instance 碰撞器实例。
     */
    set_fixture_collider(fixture: any, instance: ColliderBase) {
        fixture.collider = instance;
    }

    /**
     * @en Get the body of a fixture.
     * @param fixture The fixture.
     * @returns The body of the fixture.
     * @zh 获取夹具的物体。
     * @param fixture 夹具。
     * @returns 夹具的物体。
     */
    get_fixture_body(fixture: any): any {
        return fixture.GetBody()
    }


    /**
     * @en Destroy a fixture of a rigid body.
     * @param body The rigid body.
     * @param fixture The fixture to destroy.
     * @zh 销毁刚体的一个夹具。
     * @param body 刚体。
     * @param fixture 要销毁的夹具。
     */
    rigidBody_DestroyFixture(body: any, fixture: any) {
        if (body.world && !body.world.destroyed) body.DestroyFixture(fixture);
    }

    /**
     * @en Create a rigid body definition.
     * @param rigidbodyDef The rigid body definition.
     * @returns The created rigid body.
     * @zh 创建刚体定义。
     * @param rigidbodyDef 刚体定义。
     * @returns 创建的刚体。
     */
    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any {
        var def: any = new this.box2d.b2BodyDef();
        def.position.Set(this.layaToPhyValue(rigidbodyDef.position.x), this.layaToPhyValue(rigidbodyDef.position.y));
        def.angle = rigidbodyDef.angle;
        def.allowSleep = rigidbodyDef.allowSleep;
        def.angularDamping = rigidbodyDef.angularDamping;
        def.angularVelocity = rigidbodyDef.angularVelocity;
        def.bullet = rigidbodyDef.bullet;
        def.fixedRotation = rigidbodyDef.fixedRotation;
        def.gravityScale = rigidbodyDef.gravityScale;
        def.linearDamping = rigidbodyDef.linearDamping;
        def.linearVelocity = new this.box2d.b2Vec2(this.layaToPhyValue(rigidbodyDef.linearVelocity.x), this.layaToPhyValue(rigidbodyDef.linearVelocity.y));
        def.type = this.getbodyType(rigidbodyDef.type);
        return this.createBody(def);
    }

    /**
     * @en Get the position of a rigid body.
     * @param body The rigid body.
     * @param v2 The vector to store the position.
     * @zh 获取刚体的位置。
     * @param body 刚体。
     * @param v2 用于存储位置的向量。
     */
    get_RigidBody_Position(body: any, v2: Vector2) {
        var pos: any = body.GetPosition();
        v2.setValue(this.phyToLayaValue(pos.x), this.phyToLayaValue(pos.y));
    }


    /**
     * @en Get the angle of a rigid body.
     * @param body The rigid body.
     * @returns The angle of the rigid body.
     * @zh 获取刚体的角度。
     * @param body 刚体。
     * @returns 刚体的角度。
     */
    get_RigidBody_Angle(body: any): number {
        return body.GetAngle();
    }

    /**
     * @en Set the transform of a rigid body.
     * @param body The rigid body.
     * @param x The x-coordinate of the position.
     * @param y The y-coordinate of the position.
     * @param angle The angle of the rigid body.
     * @zh 设置刚体的变换。
     * @param body 刚体。
     * @param x 位置的x坐标。
     * @param y 位置的y坐标。
     * @param angle 刚体的角度。
     */
    set_RigibBody_Transform(body: any, x: number, y: number, angle: any) {
        let pos = body.GetPosition();
        pos.x = this.layaToPhyValue(x);
        pos.y = this.layaToPhyValue(y);
        body.SetTransform(pos, angle);
    }

    /**
     * @en Get the world point of a rigid body.
     * @param body The rigid body.
     * @param x The x-coordinate of the local point.
     * @param y The y-coordinate of the local point.
     * @returns The world point.
     * @zh 获取刚体的世界坐标点。
     * @param body 刚体。
     * @param x 局部坐标的x坐标。
     * @param y 局部坐标的y坐标。
     * @returns 世界坐标点。
     */
    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2 {
        let data = body.GetWorldPoint(this.createPhyFromLayaVec2(x, y))
        return {
            x: this.phyToLayaValue(data.x),
            y: this.phyToLayaValue(data.y)
        };
    }

    /**
     * @en Get the local point of a rigid body.
     * @param body The rigid body.
     * @param x The x-coordinate of the world point.
     * @param y The y-coordinate of the world point.
     * @returns The local point.
     * @zh 获取刚体的本地坐标点。
     * @param body 刚体。
     * @param x 世界坐标的x坐标。
     * @param y 世界坐标的y坐标。
     * @returns 本地坐标点。
     */
    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2 {
        let data = body.GetLocalPoint(this.createPhyFromLayaVec2(x, y))

        return {
            x: this.phyToLayaValue(data.x),
            y: this.phyToLayaValue(data.y)
        };
    }

    /**
     * @en Apply a force to a rigid body.
     * @param body The rigid body.
     * @param force The force to apply.
     * @param position The position to apply the force.
     * @zh 对刚体施加力。
     * @param body 刚体。
     * @param force 施加的力。
     * @param position 施加力的位置。
     */
    rigidBody_applyForce(body: any, force: IV2, position: IV2) {
        this._tempVe21.x = this.layaToPhyValue(position.x);
        this._tempVe21.y = this.layaToPhyValue(position.y);
        this._tempVe22.x = force.x;
        this._tempVe22.y = force.y;
        body.ApplyForce(this._tempVe22, this._tempVe21, false);
    }

    /**
     * @en Apply a force to the center of a rigid body.
     * @param body The rigid body.
     * @param force The force to apply.
     * @zh 对刚体的中心施加力。
     * @param body 刚体。
     * @param force 施加的力。
     */
    rigidBody_applyForceToCenter(body: any, force: IV2) {
        this._tempVe21.x = force.x;
        this._tempVe21.y = force.y;
        body.ApplyForceToCenter(this._tempVe21);
    }


    /**
     * @en Apply a linear impulse to a rigid body.
     * @param body The rigid body.
     * @param impulse The linear impulse to apply.
     * @param position The position to apply the impulse.
     * @zh 对刚体施加线性冲量。
     * @param body 刚体。
     * @param impulse 施加的线性冲量。
     * @param position 施加线性冲量的位置。
     */
    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2) {
        this._tempVe21.x = impulse.x;
        this._tempVe21.y = impulse.y;
        this._tempVe22.x = this.layaToPhyValue(position.x);
        this._tempVe22.y = this.layaToPhyValue(position.y);
        body.ApplyLinearImpulse(this._tempVe21, this._tempVe22);
    }

    /**
     * @en Apply a linear impulse to the center of a rigid body.
     * @param body The rigid body.
     * @param impulse The linear impulse to apply.
     * @zh 对刚体的中心施加线性冲量。
     * @param body 刚体。
     * @param impulse 施加的线性冲量。
     */
    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2) {
        this._tempVe21.x = impulse.x;
        this._tempVe21.y = impulse.y;
        body.ApplyLinearImpulseToCenter(this._tempVe21);
    }


    /**
     * @en Apply torque to a rigid body to make it rotate.
     * @param body The rigid body.
     * @param torque The torque to apply.
     * @zh 对刚体施加扭矩，使其旋转。
     * @param body 刚体。
     * @param torque 施加的扭矩。
     */
    rigidbody_applyTorque(body: any, torque: number): void {
        body.ApplyTorque(torque);
    }

    /**
     * @en The velocity to set, e.g., {x: 10, y: 10}.
     * @param body The rigid body.
     * @param velocity The velocity to set.
     * @zh 设置速度，比如{x:10,y:10}
     * @param body 刚体。
     * @param velocity 速度。
     */
    set_rigidbody_Velocity(body: any, velocity: IV2): void {
        this._tempVe21.x = velocity.x;
        this._tempVe21.y = velocity.y;
        body.SetLinearVelocity(this._tempVe21);
    }

    /**
     * @en Set the awake state of a rigid body.
     * @param body The rigid body.
     * @param awake The awake state.
     * @zh 设置刚体的唤醒状态。
     * @param body 刚体。
     * @param awake 唤醒状态。
     */
    set_rigidbody_Awake(body: any, awake: boolean): void {
        body.SetAwake(awake);
    }

    /**
     * @en Get the mass of a rigid body.
     * @param body The rigid body.
     * @returns The mass of the rigid body.
     * @zh 获取刚体的质量。
     * @param body 刚体。
     * @returns 刚体的质量。
     */
    get_rigidbody_Mass(body: any): number {
        return body.GetMass();
    }

    /**
     * @en Get the offset of the center of mass relative to the node (0, 0) point.
     * @param body The rigid body.
     * @returns The offset of the center of mass.
     * @zh 获取质心相对于节点 (0, 0) 点的位置偏移。
     * @param body 刚体。
     * @returns 质心相对于节点 (0, 0) 点的位置偏移。
     */
    get_rigidBody_Center(body: any): IV2 {
        let value = body.GetLocalCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(value.x);
        point.y = this.phyToLayaValue(value.y);
        return point;
    }

    /**
     * @en Check if a rigid body is awake.
     * @param body The rigid body.
     * @returns True if the rigid body is awake, false otherwise.
     * @zh 检查刚体是否处于唤醒状态。
     * @param body 刚体。
     * @returns 若刚体处于唤醒状态，则返回true，否则返回false。
     */
    get_rigidBody_IsAwake(body: any) {
        return body.IsAwake();
    }

    /**
     * @en Get the world coordinates of the center of mass relative to the Physics.I.worldRoot node.
     * @param body The rigid body.
     * @returns The world coordinates of the center of mass.
     * @zh 获取质心相对于 Physics.I.worldRoot 节点的世界坐标。
     * @param body 刚体。
     * @returns 质心相对于 Physics.I.worldRoot 节点的世界坐标。
     */
    get_rigidBody_WorldCenter(body: any): IV2 {
        let value = body.GetWorldCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.phyToLayaValue(value.x);
        point.y = this.phyToLayaValue(value.y);
        return point;
    }

    /**
     * @en Set the type of a rigid body.
     * @param body The rigid body.
     * @param value The type of the rigid body.
     * @zh 设置刚体的类型。
     * @param body 刚体。
     * @param value 刚体的类型。
     */
    set_rigidBody_type(body: any, value: string) {
        body.SetType(this.getbodyType(value));
    }

    /**
     * @en Set the gravity scale of a rigid body.
     * @param body The rigid body.
     * @param value The gravity scale.
     * @zh 设置刚体的重力缩放因子。
     * @param body 刚体。
     * @param value 重力缩放因子。
     */
    set_rigidBody_gravityScale(body: any, value: number) {
        body.SetGravityScale(value);
    }

    /**
     * @en Set whether a rigid body allows rotation.
     * @param body The rigid body.
     * @param value True if the rigid body allows rotation, false otherwise.
     * @zh 设置刚体是否允许旋转。
     * @param body 刚体。
     * @param value 若为true，则刚体允许旋转；若为false，则刚体不允许旋转。
     */
    set_rigidBody_allowRotation(body: any, value: boolean) {
        body.SetFixedRotation(!value);
    }

    /**
     * @en Set whether a rigid body allows sleeping.
     * @param body The rigid body.
     * @param value True if the rigid body allows sleeping, false otherwise.
     * @zh 设置刚体是否允许休眠。
     * @param body 刚体。
     * @param value 若为true，则刚体允许休眠；若为false，则刚体不允许休眠。
     */
    set_rigidBody_allowSleep(body: any, value: boolean) {
        body.SetSleepingAllowed(value);
    }

    /**
     * @en Set the angular damping of a rigid body.
     * @param body The rigid body.
     * @param value The angular damping.
     * @zh 设置刚体的角阻尼。
     * @param body 刚体。
     * @param value 角阻尼。
     */
    set_rigidBody_angularDamping(body: any, value: number) {
        body.SetAngularDamping(value);
    }

    /**
     * @en Get the angular velocity of a rigid body.
     * @param body The rigid body.
     * @returns The angular velocity.
     * @zh 获取刚体的角速度。
     * @param body 刚体。
     * @returns 角速度。
     */
    get_rigidBody_angularVelocity(body: any): number {
        return body.GetAngularVelocity();
    }

    /**
     * @en Set the angular velocity of a rigid body.
     * @param body The rigid body.
     * @param value The angular velocity.
     * @zh 设置刚体的角速度。
     * @param body 刚体。
     * @param value 角速度。
     */
    set_rigidBody_angularVelocity(body: any, value: number) {
        body.SetAngularVelocity(value);
    }

    /**
     * @en Set the linear damping of a rigid body.
     * @param body The rigid body.
     * @param value The linear damping.
     * @zh 设置刚体的线性阻尼。
     * @param body 刚体。
     * @param value 线性阻尼。
     */
    set_rigidBody_linearDamping(body: any, value: number) {
        body.SetLinearDamping(value);
    }

    /**
     * @en Get the linear velocity of a rigid body.
     * @param body The rigid body.
     * @returns The linear velocity.
     * @zh 获取刚体的线性速度。
     * @param body 刚体。
     * @returns 线性速度。
     */
    get_rigidBody_linearVelocity(body: any): IV2 {
        return body.GetLinearVelocity();
    }

    /**
     * @en Set the linear velocity of a rigid body.
     * @param body The rigid body.
     * @param value The linear velocity.
     * @zh 设置刚体的线性速度。
     * @param body 刚体。
     * @param value 线性速度。
     */
    set_rigidBody_linearVelocity(body: any, value: IV2) {
        this._tempVe21.x = value.x;
        this._tempVe21.y = value.y;
        body.SetLinearVelocity(this._tempVe21);
    }

    /**
     * @en Set whether a rigid body is a bullet.
     * @param body The rigid body.
     * @param value True if the rigid body is a bullet, false otherwise.
     * @zh 设置刚体是否为子弹。
     * @param body 刚体。
     * @param value 若为true，则刚体为子弹；若为false，则刚体不是子弹。
     */
    set_rigidBody_bullet(body: any, value: boolean) {
        body.SetBullet(value);
    }

    /**
     * @en Reset the mass data of a rigid body.
     * @param body The rigid body.
     * @zh 重置刚体的质量数据。
     * @param body 刚体。
     */
    retSet_rigidBody_MassData(body: any) {
        body.ResetMassData()
    }

    /**
     * @internal
     * @en Get the body type based on the string representation.
     * @param type The string representation of the body type.
     * @returns The body type.
     * @zh 根据字符串表示获取刚体类型。
     * @param type 刚体类型字符串。
     * @returns 刚体类型。
     */
    getbodyType(type: string): any {
        if (type == "dynamic") {
            return this.box2d.b2_dynamicBody;
        } else if (type == "static") {
            return this.box2d.b2_staticBody;
        } else if (type == "kinematic") {
            return this.box2d.b2_kinematicBody;
        }
    }

    /**
     * @internal
     * @en Create a style string for drawing.
     * @param color The color.
     * @param alpha The alpha value. Default is -1.
     * @returns The style string.
     * @zh 创建用于绘制的样式字符串。
     * @param color 颜色。
     * @param alpha 透明度。默认值为-1。
     * @returns 样式字符串。
     */
    makeStyleString(color: any, alpha: number = -1) {
        let colorData = this.box2d.wrapPointer(color, this.box2d.b2Color);
        let r = (colorData.r * 255).toFixed(1);
        let g = (colorData.g * 255).toFixed(1);
        let b = (colorData.b * 255).toFixed(1);

        let cv: string;
        if (alpha > 0) {
            cv = `rgba(${r},${g},${b},${alpha})`;
        }
        else {
            cv = `rgb(${r},${g},${b})`;
        }
        return cv;
    }

    /**@internal */
    private getBox2DPoints(vertices: any, vertexCount: any) {
        let i: number, len: number;
        len = vertices.length;
        let points: any[] = [];
        for (i = 0; i < vertexCount; i++) {
            let vert = this.box2d.wrapPointer(vertices + (i * 8), this.box2d.b2Vec2);
            points.push(vert.get_x(), vert.get_y());
        }
        return points;
    }

    /**
     * @internal
     * @en Draw a polygon.
     * @param vertices The vertices.
     * @param vertexCount The vertex count.
     * @param color The color.
     * @zh 绘制多边形。
     * @param vertices 顶点数组。
     * @param vertexCount 顶点数量。
     * @param color 颜色。
     */
    DrawPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = this.getBox2DPoints(vertices, vertexCount);
        this._debugDraw.mG.drawPoly(0, 0, points, null, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**
     * @internal
     * @en Draw a solid polygon.
     * @param vertices The vertices.
     * @param vertexCount The vertex count.
     * @param color The color.
     * @zh 绘制实心多边形。
     * @param vertices 顶点数组。
     * @param vertexCount 顶点数量。
     * @param color 颜色。
     */
    DrawSolidPolygon(vertices: any, vertexCount: any, color: any): void {
        let points: any[] = this.getBox2DPoints(vertices, vertexCount);
        this._debugDraw.mG.drawPoly(0, 0, points, this.makeStyleString(color, 0.5), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**
     * @internal
     * @en Draw a circle.
     * @param center The center point.
     * @param radius The radius.
     * @param color The color.
     * @zh 绘制圆形。
     * @param center 圆心。
     * @param radius 半径。
     * @param color 颜色。
     */
    DrawCircle(center: any, radius: any, color: any): void {
        let centerV = this.box2d.wrapPointer(center, this.box2d.b2Vec2);
        this._debugDraw.mG.drawCircle(centerV.x, centerV.y, radius, null, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**
     * @internal
     * @en Draw a solid circle.
     * @param center The center point.
     * @param radius The radius.
     * @param axis The axis.
     * @param color The color.
     * @zh 绘制实心圆形。
     * @param center 圆心。
     * @param radius 半径。
     * @param axis 轴。
     * @param color 颜色。
     */
    DrawSolidCircle(center: any, radius: any, axis: any, color: any): void {
        center = this.box2d.wrapPointer(center, this.box2d.b2Vec2);
        axis = this.box2d.wrapPointer(axis, this.box2d.b2Vec2);
        let cx: any = center.x;
        let cy: any = center.y;
        this._debugDraw.mG.drawCircle(cx, cy, radius, this.makeStyleString(color, 0.5), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(cx, cy, (cx + axis.x * radius), (cy + axis.y * radius), this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**
     * @internal
     * @en Draw a segment.
     * @param p1 The start point.
     * @param p2 The end point.
     * @param color The color.
     * @zh 绘制线段。
     * @param p1 起点。
     * @param p2 终点。
     * @param color 颜色。
     */
    DrawSegment(p1: any, p2: any, color: any): void {
        p1 = this.box2d.wrapPointer(p1, this.box2d.b2Vec2);
        p2 = this.box2d.wrapPointer(p2, this.box2d.b2Vec2);
        this._debugDraw.mG.drawLine(p1.x, p1.y, p2.x, p2.y, this.makeStyleString(color, 1), this._debugDraw.lineWidth);
    }

    /**
     * @internal
     * @en Draw a transform.
     * @param xf The transform.
     * @zh 绘制变换。
     * @param xf 变换。
     */
    DrawTransform(xf: any): void {
        xf = this.box2d.wrapPointer(xf, this.box2d.b2Transform);
        this._debugDraw.PushTransform(xf.p.x, xf.p.y, xf.q.GetAngle());
        const length = 1 / Browser.pixelRatio;
        this._debugDraw.mG.drawLine(0, 0, length, 0, this._debugDraw.Red, this._debugDraw.lineWidth);
        this._debugDraw.mG.drawLine(0, 0, 0, length, this._debugDraw.Green, this._debugDraw.lineWidth);
        this._debugDraw.PopTransform();
    }

    /**
     * @internal
     * @en Draw a point.
     * @param p The point.
     * @param size The size.
     * @param color The color.
     * @zh 绘制点。
     * @param p 点。
     * @param size 大小。
     * @param color 颜色。
     */
    DrawPoint(p: any, size: any, color: any): void {
        p = this.box2d.wrapPointer(p, this.box2d.b2Vec2);
        size *= this._debugDraw.camera.m_zoom;
        size /= this._debugDraw.camera.m_extent;
        size /= Browser.pixelRatio;
        var hsize: any = size / 2;
        this._debugDraw.mG.drawRect(p.x - hsize, p.y - hsize, size, size, this.makeStyleString(color, 1), null);
    }

    /**
     * @internal
     * @en Draw a string.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param message The message.
     * @zh 绘制字符串。
     * @param x x坐标。
     * @param y y坐标。
     * @param message 字符串。
     */
    DrawString(x: any, y: any, message: any): void {
        this._debugDraw.textG.fillText(message, x, y, "15px DroidSans", this._debugDraw.DrawString_color, "left");
    }

    /**
     * @internal
     * @en Draw a string in the world coordinate system.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param message The message.
     * @zh 在世界坐标系中绘制字符串。
     * @param x x坐标。
     * @param y y坐标。
     * @param message 字符串。
     */
    DrawStringWorld(x: any, y: any, message: any): void {
        this.DrawString(x, y, message);
    }

    /**
     * @internal
     * @en Draw an AABB (axis-aligned bounding box).
     * @param min The minimum point.
     * @param max The maximum point.
     * @param color The color.
     * @zh 绘制 AABB（轴对齐包围盒）。
     * @param min 最小点。
     * @param max 最大点。
     * @param color 颜色。
     */
    DrawAABB(min: any, max: any, color: any): void {
        min = this.box2d.wrapPointer(min, this.box2d.b2Vec2);
        max = this.box2d.wrapPointer(max, this.box2d.b2Vec2);
        var cx: number = (max.x + min.x) * 0.5;
        var cy: number = (max.y + min.y) * 0.5;
        var hw: number = (max.x - min.x) * 0.5;
        var hh: number = (max.y - min.y) * 0.5;
        const cs: string = this.makeStyleString(color, 1);
        const linew: number = this._debugDraw.lineWidth;
        this._debugDraw.mG.drawLine(cx - hw, cy - hh, cx + hw, cy - hh, cs, linew);
        this._debugDraw.mG.drawLine(cx - hw, cy + hh, cx + hw, cy + hh, cs, linew);
        this._debugDraw.mG.drawLine(cx - hw, cy - hh, cx - hw, cy + hh, cs, linew);
        this._debugDraw.mG.drawLine(cx + hw, cy - hh, cx + hw, cy + hh, cs, linew);
    }

    /**
     * @internal
     * @en Get the contact listener.
     * @returns The contact listener.
     * @zh 获取接触监听器。
     * @returns 接触监听器。
     */
    getContactListener() {
        let box2d = this.box2d;
        let _this = this;
        var listner = new this.box2d.JSContactListener();
        listner.BeginContact = function (contact: any): void {
            Physics2D.I._eventList.push("triggerenter", box2d.wrapPointer(contact, box2d.b2Contact));
        }

        listner.EndContact = function (contact: any): void {
            Physics2D.I._eventList.push("triggerexit", box2d.wrapPointer(contact, box2d.b2Contact));
        }

        listner.PreSolve = function (contact: any, oldManifold: any): void {
            Physics2D.I._eventList.push("triggerstay", box2d.wrapPointer(contact, box2d.b2Contact));
        }

        listner.PostSolve = function (contact: any, impulse: any): void {
            //console.log("PostSolve", contact);
        }
        return listner;
    }

    /**
     * @internal
     * @en Destruction listener.
     * @zh 销毁监听器。
     */
    getDestructionListener() {
        var listner = new this.box2d.JSDestructionListener();
        let box2d = this.box2d;
        listner.SayGoodbyeJoint = function (joint: any): void {
            joint = box2d.wrapPointer(joint, box2d.b2Joint);
            joint.GetUserData().pointer = -1;
        }
        listner.SayGoodbyeFixture = function (fixture: any): void {
            fixture = box2d.wrapPointer(fixture, box2d.b2Fixture);
            fixture.GetUserData().pointer = -1;
        }
        return listner;
    }

    /**
     * @internal
     * @en Cast an object to a specific class.
     * @param pointer The pointer.
     * @param cls The class.
     * @returns The casted object.
     * @zh 将对象转换为特定类。
     * @param pointer 指针。
     * @param cls 类。
     * @returns 转换后的对象。
     */
    castObject(pointer: any, cls: any) {
        return this.box2d.castObject(pointer, cls)
    }

    /**
     * @internal
     * @en Create a wrapped pointer from points.
     * @param points The points.
     * @returns The wrapped pointer.
     * @zh 从点创建包装的指针。
     * @param points 点。
     * @returns 包装的指针。
     */
    createWrapPointer(points: number[]): any {
        var len: number = points.length;
        var buffer = this.box2d._malloc(len * 4);
        var offset = 0;
        for (var i: number = 0; i < len; i++) {
            this.box2d.HEAPF32[buffer + offset >> 2] = this.layaToPhyValue(points[i]);
            offset += 4;
        }
        return buffer;
    }

    /**
     * @internal
     * @en Create a Vec2 pointer from points.
     * @param points The points.
     * @param x The x-coordinate.
     * @param y The y-coordinate.
     * @param scaleX The horizontal scale.
     * @param scaleY The vertical scale.
     * @returns The Vec2 pointer.
     * @zh 从点创建 Vec2 指针。
     * @param points 点。
     * @param x x坐标。
     * @param y y坐标。
     * @param scaleX 水平缩放。
     * @param scaleY 垂直缩放。
     * @returns Vec2 指针。
     */
    createVec2Pointer(points: number[], x: number, y: number, scaleX: number, scaleY: number): any {
        var len: number = points.length >> 1;
        var buffer = this.box2d._malloc(len * 8);
        var offset = 0;
        for (var i = 0; i < len; i++) {
            this.box2d.HEAPF32[buffer + offset >> 2] = this.layaToPhyValue((points[2 * i] + x) * scaleX);
            this.box2d.HEAPF32[buffer + (offset + 4) >> 2] = this.layaToPhyValue((points[2 * i + 1] + y) * scaleY);
            offset += 8;
        }
        return this.box2d.wrapPointer(buffer, this.box2d.b2Vec2);
    }

    /**
     * @internal
     * @en Calculate linear stiffness.
     * @param def The definition.
     * @param frequencyHertz The frequency in Hertz.
     * @param dampingRatio The damping ratio.
     * @param bodyA The first body.
     * @param bodyB The second body.
     * @zh 计算线性刚度。
     * @param def 定义。
     * @param frequencyHertz 频率（赫兹）。
     * @param dampingRatio 阻尼比。
     * @param bodyA 第一个刚体。
     * @param bodyB 第二个刚体。
     */
    b2LinearStiffness(def: any, frequencyHertz: number, dampingRatio: number, bodyA: any, bodyB: any) {
        if (bodyA == undefined || bodyB == undefined) {
            def.stiffness = 0;
            def.damping = 0;
            return;
        }
        const massA = bodyA.GetMass();
        const massB = bodyB.GetMass();
        let mass;
        if (massA > 0.0 && massB > 0.0) {
            mass = massA * massB / (massA + massB);
        }
        else if (massA > 0.0) {
            mass = massA;
        }
        else {
            mass = massB;
        }
        const omega = 2.0 * Math.PI * frequencyHertz;
        def.stiffness = mass * omega * omega;
        def.damping = 2.0 * mass * dampingRatio * omega;
    }

    /**
     * @internal
     * @en Utility to compute rotational stiffness values frequency and damping ratio.
     * @param def The definition.
     * @param frequencyHertz The frequency in Hertz.
     * @param dampingRatio The damping ratio.
     * @param bodyA The first body.
     * @param bodyB The second body.
     * @zh 用于计算旋转刚度值频率和阻尼比的实用程序。
     * @param def 定义。
     * @param frequencyHertz 频率（赫兹）。
     * @param dampingRatio 阻尼比。
     * @param bodyA 第一个刚体。
     * @param bodyB 第二个刚体。
     */
    b2AngularStiffness(def: any, frequencyHertz: number, dampingRatio: number, bodyA: any, bodyB: any) {
        const IA = bodyA.GetInertia();
        const IB = bodyB.GetInertia();
        let I;
        if (IA > 0.0 && IB > 0.0) {
            I = IA * IB / (IA + IB);
        }
        else if (IA > 0.0) {
            I = IA;
        }
        else {
            I = IB;
        }
        const omega = 2.0 * Math.PI * frequencyHertz;
        def.stiffness = I * omega * omega;
        def.damping = 2.0 * I * dampingRatio * omega;
    }

    /**
     * @internal
     * @en Get the length between two vectors.
     * @param p1 The first vector.
     * @param p2 The second vector.
     * @returns The length between the two vectors.
     * @zh 获取两个向量之间的长度。
     * @param p1 第一个向量。
     * @param p2 第二个向量。
     * @returns 两个向量之间的长度。
     */
    getVec2Length(p1: any, p2: any) {
        return Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2))
    }

    /**
     * @internal
     * @en Check if the data is null.
     * @param data The data to check.
     * @returns True if the data is null, false otherwise.
     * @zh 检查数据是否为空。
     * @param data 要检查的数据。
     * @returns 数据是否为空，如果为空则返回 true，否则返回 false。
     */
    isNullData(data: any) {
        return this.box2d.compare(data, this.box2d.NULL)
    }

    /**
     * @internal
     * @en Destroy the data.
     * @param data The data to destroy.
     * @zh 销毁数据。
     * @param data 要销毁的数据。
     */
    destory(data: any) {
        data.__destroy__();
    }

    /**
     * @internal
     * @en Get the fixture shape based on the physics shape.
     * @param shape The shape.
     * @param physicShape The physics shape.
     * @returns The fixture shape.
     * @zh 根据物理形状获取夹具形状。
     * @param shape 形状。
     * @param physicShape 物理形状。
     * @returns 夹具形状。
     */
    get_fixtureshape(shape: any, physicShape: PhysicsShape): any {
        switch (physicShape) {
            case PhysicsShape.BoxShape:
            case PhysicsShape.PolygonShape:
                return this.castObject(shape, this.box2d.b2PolygonShape);
                break;
            case PhysicsShape.ChainShape:
                return this.castObject(shape, this.box2d.b2ChainShape);
                break;
            case PhysicsShape.CircleShape:
                return this.castObject(shape, this.box2d.b2CircleShape);
                break;
            case PhysicsShape.EdgeShape:
                return this.castObject(shape, this.box2d.b2EdgeShape);
                break;
        }
    }
}

Physics2D.I._factory = new physics2DwasmFactory()