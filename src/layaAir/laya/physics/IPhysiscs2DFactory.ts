import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point";
import { IV2, Vector2 } from "../maths/Vector2";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { FixtureBox2DDef } from "./Collider2D/ColliderStructInfo";
import { Physics2DOption } from "./Physics2DOption";
import { Physics2DDebugDraw } from "./Physics2DDebugDraw";
import { RigidBody2DInfo } from "./RigidBody2DInfo";
import { physics2D_DistancJointDef, physics2D_GearJointDef, physics2D_MotorJointDef, physics2D_MouseJointJointDef, physics2D_PrismaticJointDef, physics2D_PulleyJointDef, physics2D_RevoluteJointDef, physics2D_WeldJointDef, physics2D_WheelJointDef } from "./joint/JointDefStructInfo";

export interface IPhysiscs2DFactory {
    /** 
     * @internal
     */
    get drawFlags_none(): number;

    /** 
     * @internal
     */
    get drawFlags_shapeBit(): number;

    /** 
     * @internal
     */
    get drawFlags_jointBit(): number;

    /** 
     * @internal
     */
    get drawFlags_aabbBit(): number;

    /** 
     * @internal
     */
    get drawFlags_pairBit(): number;

    /** 
     * @internal
     */
    get drawFlags_centerOfMassBit(): number;

    /** 
     * @internal
     */
    get drawFlags_all(): number;

    /** 
     * @internal
     */
    get box2d(): any;

    /** 
     * @internal
     */
    get world(): any;

    /** 
     * @internal
     */
    get debugDraw(): Physics2DDebugDraw;

    /** 
     * @internal
     */
    get PIXEL_RATIO(): number;

    /** 
     * @internal
     */
    get velocityIterations(): number;

    /** 
     * @internal
     */
    get positionIterations(): number;

    /** 
     * @internal
     */
    get gravity(): any;

    /** 
     * @internal
     */
    set gravity(value: Vector2);

    /** 
     * @internal
     */
    get allowSleeping(): boolean;

    /** 
     * @internal
     */
    set allowSleeping(value: boolean);

    /** 
     * @internal
     */
    get bodyCount(): number;

    /** 
     * @internal
     */
    get contactCount(): number;

    /** 
     * @internal
     */
    get jointCount(): number;

    /**
     * @internal
     * 渲染系统数据转换为物理系统数据 
     */
    layaToPhyValue(value: number): number;

    /**
     * @internal
     * 物理系统数据转换为渲染系统数据 
     */
    phyToLayaValue(value: number): number;

    /** 
     * @internal
     * 获得节点相对于物理根节点的坐标
     * @param node 节点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     * @param localToGlobal true :本地转全局 falsle：全局转本地
     */
    getLayaPosition(node: Sprite, x: number, y: number, localToGlobal?: boolean): Point;

    /** 
     * @internal
     * 创建物理系统的Vec2
     * @param x (单位： 米)
     * @param y (单位： 米)
     */
    createPhyVec2(x: number, y: number): any;

    /** 
     * @internal
     * 创建物理系统的Vec2
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    createPhyFromLayaVec2(x: number, y: number): any;

    /** 
     * @internal
     * 初始化系统
     */
    initialize(): Promise<void>;

    /** 
     * @internal
     * 创建物理场景
     */
    start(options: Physics2DOption): void;

    /**
    * @internal
    * 销毁物理场景
    * @param options 
    */
    destroyWorld(): void;

    /** 
     * @internal
     * 更新物理
     */
    update(delta: number): void;

    /** 
     * @internal
     */
    sendEvent(type: number, contact: any): void;

    /** 
     * @internal
     * 创建物理绘制
     */
    createDebugDraw(flags: number): void;

    /** 
     * @internal
     * 删除物理绘制
     */
    removeDebugDraw(): void;

    /** 
     * @internal
     * 更新显示数据
     */
    setDebugFlag(flags: number): void;

    /** 
     * @internal
     * 显示标记
     */
    appendFlags(flags: number): void;

    /** 
     * @internal
     * 清除标记
     */
    clearFlags(flags: number): void

    /** 
     * @internal
     * 移动世界中心点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    shiftOrigin(x: number, y: number): void;

    /** 
     * @internal
     */
    createBody(def: any): any;

    /** 
     * @internal
     */
    removeBody(body: any): void;

    //---------------- Joint -------------------

    /** 
     * @internal
     */
    createJoint(def: any, cls?: any): any;

    /** 
     * @internal
     */
    removeJoint(joint: any): void;

    /** 
     * @internal
     */
    getJoint_userData(joint: any): any;

    /** 
     * @internal
     */
    getJoint_userData_destroy(joint: any): boolean;

    /** 
     * @internal
     */
    set_Joint_EnableMotor(joint: any, enableMotor: boolean): void;

    /** 
     * @internal
     */
    set_Joint_SetMotorSpeed(joint: any, motorSpeed: number): void;

    /** 
     * @internal
     */
    set_Joint_SetMaxMotorTorque(joint: any, maxTorque: number): void;

    /** 
     * @internal
     */
    set_Joint_EnableLimit(joint: any, enableLimit: boolean): void;

    /** 
     * @internal
     */
    set_Joint_SetLimits(joint: any, lowerAngle: number, upperAngle: number): void;

    /** 
     * @internal
     */
    set_Joint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void;

    /** 
     * @internal
     */
    createDistanceJoint(defStruct: physics2D_DistancJointDef): any;

    /** 
     * @internal
     */
    set_DistanceJoint_length(joint: any, length: number): void;

    /** 
     * @internal
     */
    set_DistanceJoint_MaxLength(joint: any, length: number): void;

    /** 
     * @internal
     */
    set_DistanceJoint_MinLength(joint: any, length: number): void;

    /** 
     * @internal
     */
    set_DistanceJointStiffnessDamping(joint: any, steffness: number, damping: number): void;

    /** 
     * @internal
     */
    create_GearJoint(def: physics2D_GearJointDef): void;

    /** 
     * @internal
     */
    set_GearJoint_SetRatio(joint: any, radio: number): void;

    /** 
     * @internal
     */
    create_PulleyJoint(defStruct: physics2D_PulleyJointDef): void;

    /** 
     * @internal
     */
    create_WheelJoint(defStruct: physics2D_WheelJointDef): void;

    /** 
     * @internal
     */
    create_WeldJoint(defStruct: physics2D_WeldJointDef): void;

    /** 
     * @internal
     */
    create_MouseJoint(def: physics2D_MouseJointJointDef): any;

    /** 
     * @internal
     */
    set_MouseJoint_target(joint: any, x: number, y: number): void;

    /** 
     * @internal
     */
    set_MouseJoint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number): void;

    /** 
     * @internal
     */
    create_RevoluteJoint(def: physics2D_RevoluteJointDef): any;

    /** 
     * @internal
     */
    create_MotorJoint(def: physics2D_MotorJointDef): any;

    /** 
     * @internal
     */
    set_MotorJoint_linearOffset(join: any, x: number, y: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetAngularOffset(join: any, angular: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetMaxForce(join: any, maxForce: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetMaxTorque(joint: any, maxTorque: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetCorrectionFactor(joint: any, correctionFactor: number): void;

    /** 
     * @internal
     */
    create_PrismaticJoint(def: physics2D_PrismaticJointDef): any;

    //----------------Collider-------------------

    /** 
     * @internal
     */
    create_boxColliderShape(): any;

    /** 
     * @internal
     */
    set_collider_SetAsBox(shape: any, x: number, y: number, pos: IV2): any

    /** 
     * @internal
     */
    create_ChainShape(): any;

    /** 
     * @internal
     */
    set_ChainShape_data(shape: any, x: number, y: number, arr: any[], loop: boolean): any;

    /** 
     * @internal
     */
    create_CircleShape(): any;

    /** 
     * @internal
     */
    set_CircleShape_radius(shape: any, radius: number): void;

    /** 
     * @internal
     */
    set_CircleShape_pos(shape: any, x: number, y: number): void;

    /** 
     * @internal
     */
    create_EdgeShape(): any;

    /** 
     * @internal
     */
    set_EdgeShape_data(shape: any, x: number, y: number, arr: any[]): any;

    /** 
     * @internal
     */
    create_PolygonShape(): any;

    /** 
     * @internal
     */
    set_PolygonShape_data(shape: any, x: number, y: number, arr: any[]): any;

    //----------------fixture-------------------

    /** 
     * @internal
     */
    createFixtureDef(fixtureDef: FixtureBox2DDef): any;

    /** 
     * @internal
     */
    set_fixtureDef_GroupIndex(def: any, groupIndex: number): void;

    /** 
     * @internal
     */
    set_fixtureDef_CategoryBits(def: any, categoryBits: number): void;

    /** 
     * @internal
     */
    set_fixtureDef_maskBits(def: any, maskbits: number): void;

    /** 
     * @internal
     */
    createfixture(body: any, def: any): void;

    /** 
     * @internal
     */
    set_fixture_collider(fixture: any, instance: ColliderBase): void

    /** 
     * @internal
     */
    get_fixture_body(fixture: any): any;

    /** 
     * @internal
     */
    destroy_fixture(fixture: any): any;

    //----------------RigidBody-------------------   

    /** 
     * @internal
     */
    rigidBody_DestroyFixture(body: any, fixture: any): any;

    /** 
     * @internal
     */
    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any;

    /** 
     * @internal
     */
    get_RigidBody_Position(body: any, v2: Vector2): void;

    /** 
     * @internal
     */
    get_RigidBody_Angle(body: any): number;

    /** 
     * @internal
     */
    set_RigibBody_Transform(body: any, x: number, y: number, angle: number): void;

    /** 
     * @internal
     */
    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2;

    /** 
     * @internal
     */
    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2;

    /** 
     * @internal
     */
    rigidBody_applyForce(body: any, force: IV2, position: IV2): void;

    /** 
     * @internal
     */
    rigidBody_applyForceToCenter(body: any, force: IV2): void;

    /** 
     * @internal
     */
    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2): void;

    /** 
     * @internal
     */
    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2): void;

    /** 
     * @internal
     */
    rigidbody_applyTorque(body: any, torque: number): void;

    /** 
     * @internal
     */
    set_rigidbody_Velocity(body: any, velocity: IV2): void;

    /** 
     * @internal
     */
    set_rigidbody_Awake(body: any, awake: boolean): void;

    /** 
     * @internal
     */
    get_rigidbody_Mass(body: any): number;

    /** 
     * @internal
     */
    get_rigidBody_Center(body: any): IV2;

    /** 
     * @internal
     */
    get_rigidBody_IsAwake(body: any): boolean;

    /** 
     * @internal
     */
    get_rigidBody_WorldCenter(body: any): IV2;

    /** 
     * @internal
     */
    set_rigidBody_type(body: any, value: string): void;

    /** 
     * @internal
     */
    set_rigidBody_gravityScale(body: any, value: number): void;

    /** 
     * @internal
     */
    set_rigidBody_allowRotation(body: any, value: boolean): void;

    /** 
     * @internal
     */
    set_rigidBody_allowSleep(body: any, value: boolean): void;

    /** 
     * @internal
     */
    set_rigidBody_angularDamping(body: any, value: number): void;

    /** 
     * @internal
     */
    get_rigidBody_angularVelocity(body: any): number;

    /** 
     * @internal
     */
    set_rigidBody_angularVelocity(body: any, value: number): void;

    /** 
     * @internal
     */
    set_rigidBody_linearDamping(body: any, value: number): void;

    /** 
     * @internal
     */
    get_rigidBody_linearVelocity(body: any): IV2;

    /** 
     * @internal
     */
    set_rigidBody_linearVelocity(body: any, value: IV2): void;

    /** 
     * @internal
     */
    set_rigidBody_bullet(body: any, value: boolean): void;

}