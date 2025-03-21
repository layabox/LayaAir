import { IV2, Vector2 } from "../../maths/Vector2";
import { Physics2D } from "../Physics2D";
import { Laya } from "../../../Laya";
import { Physics2DWorldManager } from "../Physics2DWorldManager";
import { Box2DShapeDef, box2DWorldDef, Ebox2DType, EPhysics2DJoint, EPhysics2DShape, FilterData, IPhysics2DFactory, physics2D_BaseJointDef, physics2D_DistancJointDef, physics2D_GearJointDef, physics2D_MotorJointDef, physics2D_MouseJointJointDef, physics2D_PrismaticJointDef, physics2D_PulleyJointDef, physics2D_RevoluteJointDef, physics2D_WeldJointDef, physics2D_WheelJointDef, RigidBody2DInfo } from "./IPhysics2DFactory";

const b2_maxFloat = 1E+37;

/**
 * @en Implements Box2D c++ version 2.4.1
 * @zh 实现Box2D c++ 2.4.1 版本
 */
export class physics2DwasmFactory implements IPhysics2DFactory {
    worldMap: Map<number, Physics2DWorldManager> = new Map();
    worldCount: number = 0;
    private _tempVe21: any;
    private _tempVe22: any;

    /**@internal box2D Engine */
    _box2d: any;

    /** 
     * @internal
     * @en The box2d engine instance.
     * @zh box2d引擎实例。
     */
    get box2d(): any {
        return this._box2d;
    }

    /** 
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

    createPhyFromLayaVec2(world: any, x: number, y: number): any {
        return new this.box2d.b2Vec2(this.convertLayaValueToPhysics(world, x), this.convertLayaValueToPhysics(world, y));
    }

    convertLayaValueToPhysics(world: any, value: number): number {
        let _rePixelRatio: number = 1 / world._pixelRatio;
        value = value * _rePixelRatio;
        return value;
    }

    convertPhysicsValueToLaya(world: any, value: number): number {
        let _pixelRatio: number = world._pixelRatio;
        value = value * _pixelRatio;
        return value;
    }

    createBox2DDraw(world: any, flag: number): any {
        let jsDraw = new this.box2d.JSDraw();
        jsDraw.SetFlags(flag);
        world.SetDebugDraw(jsDraw);
        return jsDraw;
    }

    shiftOrigin(world: any, newOrigin: Vector2): void {
        if (!world) console.warn("shiftOrigin world is null");
        world.ShiftOrigin({ x: newOrigin.x, y: newOrigin.y });
    }

    appendFlags(jsDraw: any, flags: number): void {
        if (jsDraw) jsDraw.AppendFlags(flags);
    }

    clearFlags(jsDraw: any, flags: number): void {
        if (jsDraw) jsDraw.ClearFlags(flags);
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
            this._tempVe21 = new this.box2d.b2Vec2();
            this._tempVe22 = new this.box2d.b2Vec2();
            return Promise.resolve();
        });
    }

    createWorld(worldDef: box2DWorldDef): any {
        let gravity = this.createPhyVec2(worldDef.gravity.x, worldDef.gravity.y)
        let world: any = new this._box2d.b2World(gravity);
        world.destroyed = false;
        return world;
    }

    allowWorldSleep(world: any, allowSleep: boolean): void {
        world.SetAllowSleeping(allowSleep);
    }

    clearForces(world: any): void {
        world.ClearForces();
    }

    QueryAABB(world: any, jsquerycallback: any, bounds: any): void {
        world.QueryAABB(jsquerycallback, bounds);
    }

    RayCast(world: any, jsraycastcallback: any, startPoint: Vector2, endPoint: Vector2): void {
        this._tempVe21.x = this.convertLayaValueToPhysics(world, startPoint.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, startPoint.y);

        this._tempVe22.x = this.convertLayaValueToPhysics(world, endPoint.x);
        this._tempVe22.x = this.convertLayaValueToPhysics(world, endPoint.x);
        world.RayCast(jsraycastcallback, this._tempVe21, this._tempVe22);

    }

    shapeCast(): void {
        //TODO
    }

    getBodyList(world: any): any[] {
        let bodyList: any = world.GetBodyList();
        return bodyList;
    }

    getBodyCount(world: any): number {
        return world.GetBodyCount();
    }

    getJointList(world: any): any[] {
        let jointList: any = world.GetJointList();
        return jointList;
    }

    getJointCount(world: any): number {
        return world.GetJointCount();
    }

    getContactList(world: any): any[] {
        let contactList: any = world.GetContactList();
        return contactList;
    }

    getContactCount(world: any): number {
        return world.GetContactCount();
    }

    /**
     * @en Create the Box2D world.
     * @zh 创建Box2D世界。
     */
    start() {
    }

    destroyWorld(world: any) {
        if (world) {
            if (this.getBodyCount(world) != 0) {
                console.warn("There's still have body in box2DWorld, can not destroy");
                return;
            }
            if (this.getJointCount(world) != 0) {
                console.warn("There's still have joint in box2DWorld, can not destroy");
                return;
            }
            this.box2d.destroy(world);
            world.destroyed = true;
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
        for (let i = 0; i <= Physics2D.I._factory.worldCount; i++) {
            let world = this.worldMap.get(i);
            if (!world) continue;
            let bodyCount = this.getBodyCount(world.box2DWorld);
            if (bodyCount <= 0) continue;
            let velocityIterations = world.getVelocityIterations();
            let positionIterations = world.getPositionIterations();
            // preStep 处理

            //2.4
            world.box2DWorld.Step(delta, velocityIterations, positionIterations);

            // afterStep 处理
            world.sendEvent();

        }
        // this._world & this._world.Step(delta, this.velocityIterations, this.positionIterations, 3);
        //set engine Position from Phyiscs TODO
    }


    createJointDef(world: any, type: EPhysics2DJoint, def: physics2D_BaseJointDef): any {
        if (!world) console.warn("createJointDef world is null");
        var jointDef: any;
        switch (type) {
            case EPhysics2DJoint.DistanceJoint:
                jointDef = new this.box2d.b2DistanceJointDef();
                jointDef.bodyA = def.bodyA;
                jointDef.bodyB = def.bodyB;
                jointDef.localAnchorA.Set(this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).localAnchorA.x), this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).localAnchorA.y));
                jointDef.localAnchorB.Set(this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).localAnchorB.x), this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).localAnchorB.y));

                this.b2LinearStiffness(jointDef, (def as physics2D_DistancJointDef).frequency, (def as physics2D_DistancJointDef).dampingRatio, jointDef.bodyA, jointDef.bodyB);
                jointDef.set_collideConnected((def as physics2D_DistancJointDef).collideConnected);

                if ((def as physics2D_DistancJointDef).length > 0) {
                    jointDef.length = this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).length);
                } else {
                    var p1: any = jointDef.bodyA.GetWorldPoint(jointDef.localAnchorA);
                    let data = { x: p1.x, y: p1.y };
                    var p2: any = jointDef.bodyB.GetWorldPoint(jointDef.localAnchorB);
                    jointDef.length = this.getVec2Length(data, p2);
                }

                if ((def as physics2D_DistancJointDef).maxLength > 0)
                    jointDef.maxLength = this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).maxLength);
                else
                    jointDef.maxLength = b2_maxFloat;

                if ((def as physics2D_DistancJointDef).minLength > 0)
                    jointDef.minLength = this.convertLayaValueToPhysics(world, (def as physics2D_DistancJointDef).minLength);
                else
                    jointDef.minLength = 0;

                break;
            case EPhysics2DJoint.RevoluteJoint:
                jointDef = new this.box2d.b2RevoluteJointDef();
                let revoluteAnchorVec = this.createPhyFromLayaVec2(world, (def as physics2D_RevoluteJointDef).anchor.x, (def as physics2D_RevoluteJointDef).anchor.y);
                jointDef.Initialize((def as physics2D_RevoluteJointDef).bodyA, (def as physics2D_RevoluteJointDef).bodyB, revoluteAnchorVec);
                jointDef.enableMotor = (def as physics2D_RevoluteJointDef).enableMotor;
                jointDef.motorSpeed = (def as physics2D_RevoluteJointDef).motorSpeed;
                jointDef.maxMotorTorque = (def as physics2D_RevoluteJointDef).maxMotorTorque;
                jointDef.enableLimit = (def as physics2D_RevoluteJointDef).enableLimit;
                jointDef.lowerAngle = (def as physics2D_RevoluteJointDef).lowerAngle;
                jointDef.upperAngle = (def as physics2D_RevoluteJointDef).upperAngle;
                jointDef.collideConnected = (def as physics2D_RevoluteJointDef).collideConnected;
                break;
            case EPhysics2DJoint.GearJoint:
                jointDef = new this.box2d.b2GearJointDef();
                jointDef.bodyA = (def as physics2D_GearJointDef).bodyA;
                jointDef.bodyB = (def as physics2D_GearJointDef).bodyB;
                jointDef.joint1 = (def as physics2D_GearJointDef).joint1;
                jointDef.joint2 = (def as physics2D_GearJointDef).joint2;
                jointDef.ratio = (def as physics2D_GearJointDef).ratio;
                jointDef.collideConnected = (def as physics2D_GearJointDef).collideConnected;
                break;

            case EPhysics2DJoint.PulleyJoint:
                jointDef = new this.box2d.b2PulleyJointDef();
                let groundVecA = this.createPhyFromLayaVec2(world, (def as physics2D_PulleyJointDef).groundAnchorA.x, (def as physics2D_PulleyJointDef).groundAnchorA.y);
                let groundVecB = this.createPhyFromLayaVec2(world, (def as physics2D_PulleyJointDef).groundAnchorB.x, (def as physics2D_PulleyJointDef).groundAnchorB.y);
                let anchorVecA = this.createPhyFromLayaVec2(world, (def as physics2D_PulleyJointDef).localAnchorA.x, (def as physics2D_PulleyJointDef).localAnchorA.y);
                let anchorVecB = this.createPhyFromLayaVec2(world, (def as physics2D_PulleyJointDef).localAnchorB.x, (def as physics2D_PulleyJointDef).localAnchorB.y);
                jointDef.Initialize((def as physics2D_PulleyJointDef).bodyA, (def as physics2D_PulleyJointDef).bodyB, groundVecA, groundVecB, anchorVecA, anchorVecB, (def as physics2D_PulleyJointDef).ratio);
                jointDef.collideConnected = (def as physics2D_PulleyJointDef).collideConnected;
                break;

            case EPhysics2DJoint.WheelJoint:
                jointDef = new this.box2d.b2WheelJointDef();
                let anchorVec = this.createPhyFromLayaVec2(world, (def as physics2D_WheelJointDef).anchor.x, (def as physics2D_WheelJointDef).anchor.y);
                let wheelAxis = this.createPhyVec2((def as physics2D_WheelJointDef).axis.x, (def as physics2D_WheelJointDef).axis.y);
                jointDef.Initialize((def as physics2D_WheelJointDef).bodyA, (def as physics2D_WheelJointDef).bodyB, anchorVec, wheelAxis);
                jointDef.enableMotor = (def as physics2D_WheelJointDef).enableMotor;
                jointDef.motorSpeed = (def as physics2D_WheelJointDef).motorSpeed;
                jointDef.maxMotorTorque = (def as physics2D_WheelJointDef).maxMotorTorque;
                this.b2LinearStiffness(jointDef, (def as physics2D_WheelJointDef).frequency, (def as physics2D_WheelJointDef).dampingRatio, jointDef.bodyA, jointDef.bodyB);
                jointDef.collideConnected = (def as physics2D_WheelJointDef).collideConnected;
                jointDef.enableLimit = (def as physics2D_WheelJointDef).enableLimit;
                jointDef.lowerTranslation = this.convertLayaValueToPhysics(world, (def as physics2D_WheelJointDef).lowerTranslation);
                jointDef.upperTranslation = this.convertLayaValueToPhysics(world, (def as physics2D_WheelJointDef).upperTranslation);
                break;

            case EPhysics2DJoint.WeldJoint:
                jointDef = new this.box2d.b2WeldJointDef();
                let weldAnchorVec = this.createPhyFromLayaVec2(world, (def as physics2D_WeldJointDef).anchor.x, (def as physics2D_WeldJointDef).anchor.y);
                jointDef.Initialize((def as physics2D_WeldJointDef).bodyA, (def as physics2D_WeldJointDef).bodyB, weldAnchorVec);
                this.b2AngularStiffness(jointDef, (def as physics2D_WeldJointDef).frequency, (def as physics2D_WeldJointDef).dampingRatio, (def as physics2D_WeldJointDef).bodyA, (def as physics2D_WeldJointDef).bodyB);
                jointDef.collideConnected = (def as physics2D_WeldJointDef).collideConnected;
                break;

            case EPhysics2DJoint.MouseJoint:
                jointDef = new this.box2d.b2MouseJointDef();
                jointDef.bodyA = (def as physics2D_MouseJointJointDef).bodyA;
                jointDef.bodyB = (def as physics2D_MouseJointJointDef).bodyB;
                jointDef.target = this.createPhyFromLayaVec2(world, (def as physics2D_MouseJointJointDef).target.x, (def as physics2D_MouseJointJointDef).target.y);
                jointDef.maxForce = (def as physics2D_MouseJointJointDef).maxForce * (def as physics2D_MouseJointJointDef).bodyB.GetMass();
                jointDef.collideConnected = true;
                this.b2LinearStiffness(jointDef, (def as physics2D_MouseJointJointDef).frequency, (def as physics2D_MouseJointJointDef).dampingRatio, (def as physics2D_MouseJointJointDef).bodyA, (def as physics2D_MouseJointJointDef).bodyB)
                break;

            case EPhysics2DJoint.MotorJoint:
                jointDef = new this.box2d.b2MotorJointDef();
                jointDef.Initialize((def as physics2D_MotorJointDef).bodyA, (def as physics2D_MotorJointDef).bodyB);
                jointDef.linearOffset = this.createPhyFromLayaVec2(world, (def as physics2D_MotorJointDef).linearOffset.x, (def as physics2D_MotorJointDef).linearOffset.y);
                jointDef.angularOffset = (def as physics2D_MotorJointDef).angularOffset;
                jointDef.maxForce = (def as physics2D_MotorJointDef).maxForce;
                jointDef.maxTorque = (def as physics2D_MotorJointDef).maxTorque;
                jointDef.correctionFactor = (def as physics2D_MotorJointDef).correctionFactor;
                jointDef.collideConnected = (def as physics2D_MotorJointDef).collideConnected;
                break;

            case EPhysics2DJoint.PrismaticJoint:
                jointDef = new this.box2d.b2PrismaticJointDef();
                let prismaticAnchorVec = this.createPhyFromLayaVec2(world, (def as physics2D_PrismaticJointDef).anchor.x, (def as physics2D_PrismaticJointDef).anchor.y);
                let axis = this.createPhyVec2((def as physics2D_PrismaticJointDef).axis.x, (def as physics2D_PrismaticJointDef).axis.y);
                jointDef.Initialize((def as physics2D_PrismaticJointDef).bodyA, (def as physics2D_PrismaticJointDef).bodyB, prismaticAnchorVec, axis);
                jointDef.enableMotor = (def as physics2D_PrismaticJointDef).enableMotor;
                jointDef.motorSpeed = (def as physics2D_PrismaticJointDef).motorSpeed;
                jointDef.maxMotorForce = (def as physics2D_PrismaticJointDef).maxMotorForce;
                jointDef.enableLimit = (def as physics2D_PrismaticJointDef).enableLimit;
                jointDef.lowerTranslation = this.convertLayaValueToPhysics(world, (def as physics2D_PrismaticJointDef).lowerTranslation);
                jointDef.upperTranslation = this.convertLayaValueToPhysics(world, (def as physics2D_PrismaticJointDef).upperTranslation);
                jointDef.collideConnected = (def as physics2D_PrismaticJointDef).collideConnected;
                break;
            default:
                break;
        }

        return jointDef;
    }

    createJoint(world: any, type: EPhysics2DJoint, def: any): any {
        if (!world) console.warn("createJoint world is null");
        let joint: any;
        switch (type) {
            case EPhysics2DJoint.DistanceJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2DistanceJoint);
                break;

            case EPhysics2DJoint.RevoluteJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2RevoluteJoint);
                break;

            case EPhysics2DJoint.GearJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2GearJoint);
                break;

            case EPhysics2DJoint.PulleyJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2PulleyJoint);
                break;

            case EPhysics2DJoint.WheelJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2WheelJoint);
                break;

            case EPhysics2DJoint.WeldJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2WeldJoint);
                break;

            case EPhysics2DJoint.MouseJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2MouseJoint);
                break;

            case EPhysics2DJoint.MotorJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2MotorJoint);
                break;

            case EPhysics2DJoint.PrismaticJoint:
                joint = this._createBox2DJoint(world, def, this._box2d.b2PrismaticJoint);
                break;

            default:
                break;
        }
        joint.bodyA = def.bodyA;
        joint.bodyB = def.bodyB;
        return joint;
    }

    removeJoint(world: any, joint: any): void {
        if (joint && world && !world.destroyed && !joint.bodyA.destroyed && !joint.bodyB.destroyed)
            world.DestroyJoint(joint);
    }

    _createBox2DJoint(world: any, def: any, cls: any): any {
        if (!world) console.warn("createJoint world is null");
        let joint = world.CreateJoint(def);
        if (cls != null) {
            joint = this.castObject(joint, cls);
        }
        joint.m_userData = {};
        joint.world = world;
        return joint;
    }

    setJoint_userData(joint: any, data: any): void {

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
    set_Joint_frequencyAndDampingRatio(joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void {
        let out: any = {}
        this.box2d.b2AngularStiffness(out, frequency, dampingRatio, joint.GetBodyA(), joint.GetBodyB());
        if (!isdamping) {
            joint.SetStiffness(out.stiffness);
        }
        joint.SetDamping(out.damping);
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
        let world: any = joint.world;
        joint.SetLength(this.convertLayaValueToPhysics(world, (length)));
    }

    get_DistanceJoint_length(joint: any): number {
        let world: any = joint.world;
        let len = joint.GetLength();
        this.convertPhysicsValueToLaya(world, len);
        return len;
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
        let world: any = joint.world;
        joint.SetMaxLength(this.convertLayaValueToPhysics(world, (length)));
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
        let world: any = joint.world;
        joint.SetMinLength(this.convertLayaValueToPhysics(world, length));
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
    set_DistanceJointStiffnessDamping(joint: any, stiffness: number, damping: number) {
        let out: any = {};
        let bodyA = joint.GetBodyA();
        let bodyB = joint.GetBodyB();
        this.box2d.b2LinearStiffness(out, stiffness, damping, bodyA, bodyB);
        joint.SetStiffness(out.stiffness);
        joint.SetDamping(out.damping);
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
        let world: any = joint.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, y);
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
        let world: any = joint.world;
        joint.SetLinearOffset(this.createPhyFromLayaVec2(world, x, y));
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


    get_joint_recationForce(joint: any): any {
        let force: any = joint.GetReactionForce(60);
        return force;
    }
    get_joint_reactionTorque(joint: any): number {
        let torque: number = joint.GetReactionTorque(60);
        return torque;
    }
    isValidJoint(joint: any): boolean {
        let isConnected: boolean = joint.GetCollideConnected();
        return isConnected;
    }

    createShapeDef(world: any, shapeDef: Box2DShapeDef, filter: any) {
        let def: any = new this.box2d.b2FixtureDef();
        def.density = shapeDef.density;
        def.friction = shapeDef.friction;
        def.isSensor = shapeDef.isSensor;
        def.restitution = shapeDef.restitution;
        def.restitutionThreshold = shapeDef.restitutionThreshold;
        filter.groupIndex = shapeDef.filter.group;
        filter.categoryBits = shapeDef.filter.category;
        filter.maskBits = shapeDef.filter.mask;
        def.filter = filter;
        switch (shapeDef.shapeType) {
            case EPhysics2DShape.BoxShape:
            case EPhysics2DShape.PolygonShape:
                let polygonShape: any = new this.box2d.b2PolygonShape();
                def.set_shape(polygonShape);
                break;
            case EPhysics2DShape.ChainShape:
                let chainShape: any = new this.box2d.b2ChainShape();
                def.set_shape(chainShape);
                break;
            case EPhysics2DShape.CircleShape:
                let circleShape: any = new this.box2d.b2CircleShape();
                def.set_shape(circleShape);
                break;
            case EPhysics2DShape.EdgeShape:
                let edgeShape: any = new this.box2d.b2EdgeShape();
                def.set_shape(edgeShape);
                break;
        }
        // 这里是要根据夹具形状转换到对应的形状指针
        def._shape = this.get_fixtureshape(def.shape, shapeDef.shapeType);
        def._shape.world = world;
        def.world = world;
        return def;
    }

    getShapeByDef(shapeDef: any, shapeType: EPhysics2DShape): any {
        let world: any = shapeDef.world;
        let shape = this.get_fixtureshape(shapeDef.shape, shapeType);
        shape.world = world;
        return shape;
    }

    createFilter() {
        return new this._box2d.b2Filter();
    }

    createShape(world: any, body: any, shapeType: EPhysics2DShape, shapdeDef: any) {
        let data = body.CreateFixture(shapdeDef);
        shapdeDef.world = world;
        shapdeDef.shapeType = shapeType;
        data = this.castObject(data, this.box2d.b2Fixture);
        data.world = world;
        data.shape = this.get_fixtureshape(shapdeDef.shape, shapeType);
        data.filter = data.GetFilterData();
        return data;
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
        let world: any = shape.world;
        width = this.convertLayaValueToPhysics(world, width * scaleX);
        height = this.convertLayaValueToPhysics(world, height * scaleY);
        let centroid = shape.m_centroid;
        centroid.x = this.convertLayaValueToPhysics(world, pos.x * scaleX);
        centroid.y = this.convertLayaValueToPhysics(world, pos.y * scaleY);
        shape.SetAsBox(width, height, centroid, 0);
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
        let world: any = shape.world;
        let len = arr.length;
        shape.Clear();
        var ptr_wrapped = this.createVec2Pointer(world, arr, x, y, scaleX, scaleY);
        if (loop) {
            shape.CreateLoop(ptr_wrapped, len >> 1);
        } else {
            shape.CreateChain(ptr_wrapped, len >> 1);
        }
        this._box2d._free(ptr_wrapped.ptr);
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
        let world: any = shape.world;
        shape.m_radius = this.convertLayaValueToPhysics(world, radius * scale);
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
        let world: any = shape.world;
        shape.m_p.Set(this.convertLayaValueToPhysics(world, x * scale), this.convertLayaValueToPhysics(world, y * scale));
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
        let world: any = shape.world;
        let len = arr.length;
        var ps: any[] = [];
        for (var i: number = 0, n: number = len; i < n; i += 2) {
            ps.push(this.createPhyFromLayaVec2(world, (x + arr[i]) * scaleX, (y + arr[i + 1]) * scaleY));
        }
        shape.SetTwoSided(ps[0], ps[1])
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
        let world: any = shape.world;
        let ptr_wrapped = this.createVec2Pointer(world, arr, x, y, scaleX, scaleY);
        shape.Set(ptr_wrapped, arr.length / 2);
        this._box2d._free(ptr_wrapped.ptr);
    }

    destroyShape(world: any, body: any, shape: any): void {
        if (!world) console.warn("destroyShape: world is null");
        body.DestroyFixture(shape);
    }

    set_shapeDef_GroupIndex(def: any, groupIndex: number) {
        def.filter.groupIndex = groupIndex;
    }

    set_shapeDef_CategoryBits(def: any, categoryBits: number) {
        def.filter.categoryBits = categoryBits;
    }

    set_shapeDef_maskBits(def: any, maskbits: number) {
        def.filter.maskBits = maskbits;
    }

    resetShapeData(shape: any, shapeDef: any): void {
        shape.SetDensity(shapeDef.density);
        shape.SetFriction(shapeDef.friction);
        shape.SetSensor(shapeDef.isSensor);
        shape.SetRestitution(shapeDef.restitution);
    }

    set_shape_collider(shape: any, instance: any) {
        shape.collider = instance;
    }

    get_shape_body(shape: any): any {
        return shape.GetBody();
    }

    set_shape_isSensor(shape: any, sensor: boolean): void {
        shape.SetSensor(sensor);
    }
    get_shape_isSensor(shape: any): boolean {
        let isSensor: boolean = shape.IsSensor();
        return isSensor;
    }
    /**
     * @zh 获取夹具fixture的shape，这里为了兼容
     * @param shape 夹具
     * @returns 夹具的形状
     * @en get fixture's shape, for compatibility
     * @param shape fixture
     * @returns shape
     */
    getShape(shape: any): any {
        let fixtureShape: any = shape.GetShape();
        return fixtureShape;
    }

    setfilterData(shape: any, filterData: any): void {
        shape.SetFilterData(filterData);
    }

    getfilterData(shape: any): FilterData {
        let shapeFilterData: any = shape.GetFilterData();
        return shapeFilterData;
    }


    set_shape_reFilter(shape: any): void {
        shape.Refilter();
    }
    shape_rayCast(shape: any, output: any, input: any, childIndex: number): boolean {
        //TODO
        return false;
    }
    get_shape_massData(shape: any, massData: any) {
        massData = shape.GetMassData(massData);
        return massData;
    }
    set_shape_density(shape: any, density: number): void {
        shape.SetDensity(density);
    }
    set_shape_friction(shape: any, friction: number): void {
        shape.SetFriction(friction);
    }
    set_shape_restitution(shape: any, restitution: number): void {
        shape.SetRestitution(restitution);
    }
    set_shape_restitutionThreshold(shape: any, restitutionThreshold: number): void {
        shape.SetRestitutionThreshold(restitutionThreshold);
    }
    get_shape_AABB(shape: any) {
        let AABB: any = shape.GetAABB(0);
        return AABB;
    }

    createMassData(): any {
        let massData = new this.box2d.b2MassData();
        return massData;
    }
    createBody(world: any, def: any) {
        if (!def) {
            def = new this.box2d.b2BodyDef();
        }
        if (!world) return;
        def.userData = { pointer: 0 };
        let body: any = world.CreateBody(def);
        body.world = world;
        body.destroyed = false;
        return body;
    }

    removeBody(world: any, body: any): void {
        if (!body || !world) return;
        if (!world.destroyed) world.DestroyBody(body);
        body.destroyed = true;
    }

    rigidBody_DestroyShape(body: any, shape: any) {
        if (body.world && !body.world.destroyed) body.DestroyFixture(shape);
    }

    createBodyDef(world: any, rigidbodyDef: RigidBody2DInfo): any {
        var def: any = new this.box2d.b2BodyDef();
        def.position.Set(this.convertLayaValueToPhysics(world, rigidbodyDef.position.x), this.convertLayaValueToPhysics(world, rigidbodyDef.position.y));
        def.angle = rigidbodyDef.angle;
        def.allowSleep = rigidbodyDef.allowSleep;
        def.angularDamping = rigidbodyDef.angularDamping;
        def.angularVelocity = rigidbodyDef.angularVelocity;
        def.bullet = rigidbodyDef.bullet;
        def.fixedRotation = rigidbodyDef.fixedRotation;
        def.gravityScale = rigidbodyDef.gravityScale;
        def.linearDamping = rigidbodyDef.linearDamping;
        def.linearVelocity = new this.box2d.b2Vec2(this.convertLayaValueToPhysics(world, rigidbodyDef.linearVelocity.x), this.convertLayaValueToPhysics(world, rigidbodyDef.linearVelocity.y));
        def.type = this.getbodyType(rigidbodyDef.type);
        return def;
    }

    get_RigidBody_Position(body: any, v2: Vector2) {
        let world: any = body.world;
        var pos: any = body.GetPosition();
        v2.setValue(this.convertPhysicsValueToLaya(world, pos.x), this.convertPhysicsValueToLaya(world, pos.y));
    }

    get_RigidBody_Angle(body: any): number {
        return body.GetAngle();
    }

    set_RigibBody_Enable(body: any, enable: boolean): void {
        body.SetEnabled(enable);
    }

    set_RigibBody_Transform(body: any, x: number, y: number, angle: any) {
        let pos = body.GetPosition();
        let world: any = body.world;
        pos.x = this.convertLayaValueToPhysics(world, x);
        pos.y = this.convertLayaValueToPhysics(world, y);
        body.SetTransform(pos, angle);
    }

    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2 {
        let world: any = body.world;
        let data = body.GetWorldPoint(this.createPhyFromLayaVec2(world, x, y));
        return {
            x: this.convertPhysicsValueToLaya(world, data.x),
            y: this.convertPhysicsValueToLaya(world, data.y)
        };
    }

    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2 {
        let world: any = body.world;
        let data = body.GetLocalPoint(this.createPhyFromLayaVec2(world, x, y));
        return {
            x: this.convertPhysicsValueToLaya(world, data.x),
            y: this.convertPhysicsValueToLaya(world, data.y)
        };
    }

    rigidBody_applyForce(body: any, force: IV2, position: IV2) {
        let world: any = body.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, position.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, position.y);
        this._tempVe22.x = force.x;
        this._tempVe22.y = force.y;
        body.ApplyForce(this._tempVe22, this._tempVe21, false);
    }

    rigidBody_applyForceToCenter(body: any, force: IV2) {
        this._tempVe21.x = force.x;
        this._tempVe21.y = force.y;
        body.ApplyForceToCenter(this._tempVe21);
    }


    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2) {
        let world: any = body.world;
        this._tempVe21.x = impulse.x;
        this._tempVe21.y = impulse.y;
        this._tempVe22.x = this.convertLayaValueToPhysics(world, position.x);
        this._tempVe22.y = this.convertLayaValueToPhysics(world, position.y);
        body.ApplyLinearImpulse(this._tempVe21, this._tempVe22);
    }

    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2) {
        this._tempVe21.x = impulse.x;
        this._tempVe21.y = impulse.y;
        body.ApplyLinearImpulseToCenter(this._tempVe21);
    }

    rigidbody_applyTorque(body: any, torque: number): void {
        body.ApplyTorque(torque);
    }

    set_rigidbody_Velocity(body: any, velocity: IV2): void {
        let world: any = body.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, velocity.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, velocity.y);
        body.SetLinearVelocity(this._tempVe21);
    }

    set_rigidbody_Awake(body: any, awake: boolean): void {
        body.SetAwake(awake);
    }

    get_rigidbody_Mass(body: any): number {
        return body.GetMass();
    }

    /**
     * @en Set the mass of a rigid body.
     * @param body The rigid body.
     * @param mass The mass to set.
     * @param centerofMass The center of mass to set.
     * @param inertia The inertia to set.
     * @zh 设置刚体的质量。
     * @param body 刚体。
     * @param mass 要设置的质量。
     * @param centerofMass 要设置的质心。
     * @param inertia 要设置的惯性张量。
     */
    set_rigidBody_Mass(body: any, massValue: number, centerofMass: IV2, inertiaValue: number, massData: any): void {
        massData.mass = massValue;
        massData.center.x = centerofMass.x;
        massData.center.y = centerofMass.y;
        massData.I = inertiaValue;
        body.SetMassData(massData);
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
        let world: any = body.world;
        let value = body.GetLocalCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.convertPhysicsValueToLaya(world, value.x);
        point.y = this.convertPhysicsValueToLaya(world, value.y);
        return point;
    }

    /**
     * @en Get the inertia tensor of the rigid body.
     * @param body The rigid body.
     * @returns The inertia tensor of the rigid body.
     * @zh 获取刚体的转动张量
     * @param body 刚体。
     * @returns 刚体的转动张量。 
     */
    get_rigidbody_Inertia(body: any): number {
        return body.GetInertia();
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
        let world: any = body.world;
        let value = body.GetWorldCenter();
        let point: IV2 = { x: 0, y: 0 }
        point.x = this.convertPhysicsValueToLaya(world, value.x);
        point.y = this.convertPhysicsValueToLaya(world, value.y);
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
        let world: any = body.world;
        let value: IV2 = body.GetLinearVelocity();
        this._tempVe21.x = this.convertPhysicsValueToLaya(world, value.x);
        this._tempVe21.y = this.convertPhysicsValueToLaya(world, value.y);
        return this._tempVe21;
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
        let world: any = body.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, value.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, value.y);
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


    get_rigidBody_isEnable(body: any): boolean {
        let isBodyEnable: boolean = body.IsEnabled();
        return isBodyEnable;
    }
    get_rigidBody_fixedRotation(body: any): boolean {
        let isFixedRotation: boolean = body.IsFixedRotation();
        return isFixedRotation;
    }
    get_rigidBody_next(body: any) {
        return body.GetNext();
    }

    set_rigidBody_userData(body: any, data: any): void {

    }

    get_rigidBody_userData(body: any) {
        return body.GetUserData();
    }
    get_RigibBody_Transform(body: any) {
        return body.GetTransform();
    }
    get_rigidBody_WorldVector(body: any, value: Vector2): Vector2 {
        return body.GetWorldVector(value);
    }
    get_rigidBody_LocalVector(body: any, value: Vector2): Vector2 {
        return body.GetLocalVector(value);
    }
    rigidbody_ApplyAngularImpulse(body: any, impulse: number): void {
        body.ApplyAngularImpulse(impulse, true);
    }

    set_rigidBody_Awake(body: any, awake: boolean): void {
        body.SetAwake(awake);
    }
    get_rigidBody_Mass(body: any): number {
        return body.GetMass();
    }
    get_rigidBody_Inertia(body: any): number {
        return body.GetInertia();
    }
    get_rigidBody_type(body: any): string {
        let type: string = body.GetType();
        switch (type) {
            case "b2_staticBody":
                type = "static";
                break;
            case "b2_kinematicBody":
                type = "kinematic";
                break;
            case "b2_dynamicBody":
                type = "dynamic";
                break;
            default:
                break;
        }
        return type;
    }
    get_rigidBody_gravityScale(body: any): number {
        return body.GetGravityScale();
    }
    get_rigidBody_allowSleep(body: any): boolean {
        return body.IsSleepingAllowed();
    }
    get_rigidBody_angularDamping(body: any): number {
        return body.GetAngularDamping();
    }
    get_rigidBody_linearDamping(body: any): number {
        return body.GetLinearDamping();
    }
    get_rigidBody_linearVelocityFromWorldPoint(body: any, worldPoint: Vector2): Vector2 {
        let world: any = body.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, worldPoint.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, worldPoint.y);
        let velocity = body.GetLinearVelocityFromWorldPoint(worldPoint);
        velocity.x = this.convertPhysicsValueToLaya(world, velocity.x);
        velocity.y = this.convertPhysicsValueToLaya(world, velocity.y);
        return velocity;
    }

    get_rigidBody_linearVelocityFromLocalPoint(body: any, localPoint: Vector2): Vector2 {
        let world: any = body.world;
        this._tempVe21.x = this.convertLayaValueToPhysics(world, localPoint.x);
        this._tempVe21.y = this.convertLayaValueToPhysics(world, localPoint.y);
        let velocity = body.GetLinearVelocityFromLocalPoint(localPoint);
        velocity.x = this.convertPhysicsValueToLaya(world, velocity.x);
        velocity.y = this.convertPhysicsValueToLaya(world, velocity.y);
        return velocity;
    }
    get_rigidBody_bullet(body: any): boolean {
        return body.IsBullet();
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

    setDestructionListener(world: any, destroyFun: Function): void {
        // TODO
    }
    setContactListener(world: any, listener: Function): void {
        if (!world) console.warn("setContactListener world is null");
        world.SetContactListener(listener);
    }

    warpPoint(ins: any, type: Ebox2DType): any {
        let res: any;
        switch (type) {
            case Ebox2DType.b2Color:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Color);
                break;

            case Ebox2DType.b2Contact:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Contact);
                break;

            case Ebox2DType.b2Fixture:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Fixture);
                break;

            case Ebox2DType.b2Joint:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Joint);
                break;

            case Ebox2DType.b2Transform:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Transform);
                res.x = res.p.x;
                res.y = res.p.y;
                res.angle = res.q.GetAngle();
                break;

            case Ebox2DType.b2Vec2:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Vec2);
                res.x = res.get_x();
                res.y = res.get_y();
                break;

            case Ebox2DType.b2Filter:
                res = this._box2d.wrapPointer(ins, this._box2d.b2Filter);
                break;

            default:
                break;
        }
        return res;
    }

    getContactShapeA(contact: any): any {
        return contact.GetFixtureA();
    }

    getContactShapeB(contact: any) {
        return contact.GetFixtureB();
    }

    createContactListener(): any {
        let listener: any = new this._box2d.JSContactListener();
        return listener;
    }

    createJSQueryCallback() {
        let jsQuerycallback: any = new this._box2d.JSQueryCallback();
        return jsQuerycallback;
    }

    createJSRayCastCallback() {
        let jsRayCastcallback: any = new this._box2d.JSRayCastCallback();
        return jsRayCastcallback;
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
    castObject(pointer: any, cls: any): any {
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
    createWrapPointer(world: any, points: number[]): any {
        var len: number = points.length;
        var buffer = this.box2d._malloc(len * 4);
        var offset = 0;
        for (var i: number = 0; i < len; i++) {
            //TODO value convert
            this.box2d.HEAPF32[buffer + offset >> 2] = this.convertLayaValueToPhysics(world, points[i]);
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
    createVec2Pointer(world: any, points: number[], x: number, y: number, scaleX: number, scaleY: number): any {
        var len: number = points.length >> 1;
        var buffer = this.box2d._malloc(len * 8);
        var offset = 0;
        for (var i = 0; i < len; i++) {
            this.box2d.HEAPF32[buffer + offset >> 2] = this.convertLayaValueToPhysics(world, (points[2 * i] + x) * scaleX);
            this.box2d.HEAPF32[buffer + (offset + 4) >> 2] = this.convertLayaValueToPhysics(world, (points[2 * i + 1] + y) * scaleY);
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
     * @en Destroy the data.
     * @param data The data to destroy.
     * @zh 销毁数据。
     * @param data 要销毁的数据。
     */
    destroyData(data: any): void {
        data && data.__destroy__();
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
    get_fixtureshape(shape: any, physicShape: EPhysics2DShape): any {
        let obj: any;
        switch (physicShape) {
            case EPhysics2DShape.BoxShape:
            case EPhysics2DShape.PolygonShape:
                obj = this.castObject(shape, this.box2d.b2PolygonShape);
                break;
            case EPhysics2DShape.ChainShape:
                obj = this.castObject(shape, this.box2d.b2ChainShape);
                break;
            case EPhysics2DShape.CircleShape:
                obj = this.castObject(shape, this.box2d.b2CircleShape);
                break;
            case EPhysics2DShape.EdgeShape:
                obj = this.castObject(shape, this.box2d.b2EdgeShape);
                break;
            default:
                obj = null;
                break;
        }
        return obj;
    }
}

Physics2D.I._factory = Laya.physics2D = new physics2DwasmFactory()