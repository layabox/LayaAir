import { Sprite } from "../display/Sprite";
import { Point } from "../maths/Point";
import { IV2, Vector2 } from "../maths/Vector2";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { FixtureBox2DDef } from "./Collider2D/ColliderStructInfo";
import { Physics2DOption } from "./Physics2DOption";
import { RigidBody2DInfo } from "./RigidBody2DInfo";
import { physics2D_DistancJointDef, physics2D_GearJointDef, physics2D_MotorJointDef, physics2D_MouseJointJointDef, physics2D_PrismaticJointDef, physics2D_PulleyJointDef, physics2D_RevoluteJointDef, physics2D_WeldJointDef, physics2D_WheelJointDef } from "./joint/JointDefStructInfo";

export interface IPhysiscs2DFactory {

    /** 
     * @private
     */
    get box2d(): any;

    /** 
     * @private
     */
    get world(): any;

    /** 
     * @private
     */
    get debugDraw(): Sprite;

    /** 
     * @private
     */
    get PIXEL_RATIO(): number;

    /** 
     * @private
     */
    get velocityIterations(): number;

    /** 
     * @private
     */
    get positionIterations(): number;

    /** 
     * @private
     */
    get gravity(): any;

    /** 
     * @private
     */
    set gravity(value: Vector2);

    /** 
     * @private
     */
    get allowSleeping(): boolean;

    /** 
     * @private
     */
    set allowSleeping(value: boolean);

    /** 
     * @private
     */
    get bodyCount(): number;

    /** 
     * @private
     */
    get contactCount(): number;

    /** 
     * @private
     */
    get jointCount(): number;

    /**
     * @private
     * 渲染系统数据转换为物理系统数据 
     */
    layaToPhyValue(value: number): number;

    /**
     * @private
     * 物理系统数据转换为渲染系统数据 
     */
    phyToLayaValue(value: number): number;

    /** 
     * @private
     * 获得节点相对于物理根节点的坐标
     * @param node 节点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     * @param localToGlobal true :本地转全局 falsle：全局转本地
     */
    getLayaPosition(node: Sprite, x: number, y: number, localToGlobal?: boolean): Point;

    /** 
     * @private
     * 创建物理系统的Vec2
     * @param x (单位： 米)
     * @param y (单位： 米)
     */
    createPhyVec2(x: number, y: number): any;

    /** 
     * @private
     * 创建物理系统的Vec2
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    createPhyFromLayaVec2(x: number, y: number): any;

    /** 
     * @private
     * 初始化系统
     */
    initialize(): Promise<void>;

    /** 
     * @private
     * 创建物理场景
     */
    start(options: Physics2DOption): void;

    /** 
     * @private
     * 更新物理
     */
    update(delta: number): void;

    /** 
     * @private
     */
    sendEvent(type: number, contact: any): void;

    /** 
     * @private
     * 创建物理绘制
     */
    createDebugDraw(flags?: number): void;

    /** 
     * @private
     * 删除物理绘制
     */
    removeDebugDraw(): void;

    /** 
     * @private
     * 更新显示数据
     */
    updataDebugFlag(flags:number):void;

    /** 
     * @private
     * 移动世界中心点
     * @param x (单位： 像素)
     * @param y (单位： 像素)
     */
    shiftOrigin(x: number, y: number): void;

    /** 
     * @private
     */
    createBody(def: any): any;

    /** 
     * @private
     */
    removeBody(body: any): void;

    //---------------- Joint -------------------

    /** 
     * @private
     */
    createJoint(def: any, cls?: any): any;

    /** 
     * @private
     */
    removeJoint(joint: any): void;

    /** 
     * @private
     */
    getJoint_userData(joint: any): any;

    /** 
     * @private
     */
    getJoint_userData_destroy(joint: any): boolean;

    /** 
     * @private
     */
    set_Joint_EnableMotor(joint: any, enableMotor: boolean): void;

    /** 
     * @private
     */
    set_Joint_SetMotorSpeed(joint: any, motorSpeed: number): void;

    /** 
     * @private
     */
    set_Joint_SetMaxMotorTorque(joint: any, maxTorque: number): void;

    /** 
     * @private
     */
    set_Joint_EnableLimit(joint: any, enableLimit: boolean): void;

    /** 
     * @private
     */
    set_Joint_SetLimits(joint: any, lowerAngle: number, upperAngle: number): void;

    /** 
     * @private
     */
    set_Joint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void;

    /** 
     * @private
     */
    createDistanceJoint(defStruct: physics2D_DistancJointDef): any;

    /** 
     * @private
     */
    set_DistanceJoint_length(joint: any, length: number): void;

    /** 
     * @private
     */
    set_DistanceJoint_MaxLength(joint: any, length: number): void;

    /** 
     * @private
     */
    set_DistanceJoint_MinLength(joint: any, length: number): void;

    /** 
     * @private
     */
    set_DistanceJointStiffnessDamping(joint: any, steffness: number, damping: number): void;

    /** 
     * @private
     */
    create_GearJoint(def: physics2D_GearJointDef): void;

    /** 
     * @private
     */
    set_GearJoint_SetRatio(joint: any, radio: number): void;

    /** 
     * @private
     */
    create_PulleyJoint(defStruct: physics2D_PulleyJointDef): void;

    /** 
     * @private
     */
    create_WheelJoint(defStruct: physics2D_WheelJointDef): void;

    /** 
     * @private
     */
    create_WeldJoint(defStruct: physics2D_WeldJointDef): void;

    /** 
     * @private
     */
    create_MouseJoint(def: physics2D_MouseJointJointDef): any;

    /** 
     * @private
     */
    set_MouseJoint_target(joint: any, x: number, y: number): void;

    /** 
     * @private
     */
    set_MouseJoint_frequencyAndDampingRatio(Joint: any, frequency: number, dampingRatio: number): void;

    /** 
     * @private
     */
    create_RevoluteJoint(def: physics2D_RevoluteJointDef): any;

    /** 
     * @private
     */
    create_MotorJoint(def: physics2D_MotorJointDef): any;

    /** 
     * @private
     */
    set_MotorJoint_linearOffset(join: any, x: number, y: number): void;

    /** 
     * @private
     */
    set_MotorJoint_SetAngularOffset(join: any, angular: number): void;

    /** 
     * @private
     */
    set_MotorJoint_SetMaxForce(join: any, maxForce: number): void;

    /** 
     * @private
     */
    set_MotorJoint_SetMaxTorque(joint: any, maxTorque: number): void;

    /** 
     * @private
     */
    set_MotorJoint_SetCorrectionFactor(joint: any, correctionFactor: number): void;

    /** 
     * @private
     */
    create_PrismaticJoint(def: physics2D_PrismaticJointDef): any;

    //----------------Collider-------------------

    /** 
     * @private
     */
    create_boxColliderShape(): any;

    /** 
     * @private
     */
    set_collider_SetAsBox(shape: any, x: number, y: number, pos: IV2): any

    /** 
     * @private
     */
    create_ChainShape(): any;

    /** 
     * @private
     */
    set_ChainShape_data(shape: any, x: number, y: number, arr: any[], loop: boolean): any;

    /** 
     * @private
     */
    create_CircleShape(): any;

    /** 
     * @private
     */
    set_CircleShape_radius(shape: any, radius: number): void;

    /** 
     * @private
     */
    set_CircleShape_pos(shape: any, x: number, y: number): void;

    /** 
     * @private
     */
    create_EdgeShape(): any;

    /** 
     * @private
     */
    set_EdgeShape_data(shape: any, x: number, y: number, arr: any[]): any;

    /** 
     * @private
     */
    create_PolygonShape(): any;

    /** 
     * @private
     */
    set_PolygonShape_data(shape: any, x: number, y: number, arr: any[]): any;

    //----------------fixture-------------------

    /** 
     * @private
     */
    createFixtureDef(fixtureDef: FixtureBox2DDef): any;

    /** 
     * @private
     */
    set_fixtureDef_GroupIndex(def: any, groupIndex: number): void;

    /** 
     * @private
     */
    set_fixtureDef_CategoryBits(def: any, categoryBits: number): void;

    /** 
     * @private
     */
    set_fixtureDef_maskBits(def: any, maskbits: number): void;

    /** 
     * @private
     */
    createfixture(body: any, def: any): void;

    /** 
     * @private
     */
    set_fixture_collider(fixture: any, instance: ColliderBase): void

    /** 
     * @private
     */
    get_fixture_body(fixture: any): any;

    /** 
     * @private
     */
    destroy_fixture(fixture: any): any;

    //----------------RigidBody-------------------   

    /** 
     * @private
     */
    rigidBody_DestroyFixture(body: any, fixture: any): any;

    /** 
     * @private
     */
    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any;

    /** 
     * @private
     */
    get_RigidBody_Position(body: any, v2: Vector2): void;

    /** 
     * @private
     */
    get_RigidBody_Angle(body: any): number;

    /** 
     * @private
     */
    set_RigibBody_Transform(body: any, x: number, y: number, angle: number): void;

    /** 
     * @private
     */
    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2;

    /** 
     * @private
     */
    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2;

    /** 
     * @private
     */
    rigidBody_applyForce(body: any, force: IV2, position: IV2): void;

    /** 
     * @private
     */
    rigidBody_applyForceToCenter(body: any, force: IV2): void;

    /** 
     * @private
     */
    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2): void;

    /** 
     * @private
     */
    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2): void;

    /** 
     * @private
     */
    rigidbody_applyTorque(body: any, torque: number): void;

    /** 
     * @private
     */
    set_rigidbody_Velocity(body: any, velocity: IV2): void;

    /** 
     * @private
     */
    set_rigidbody_Awake(body: any, awake: boolean): void;

    /** 
     * @private
     */
    get_rigidbody_Mass(body: any): number;

    /** 
     * @private
     */
    get_rigidBody_Center(body: any): IV2;

    /** 
     * @private
     */
    get_rigidBody_IsAwake(body: any): boolean;

    /** 
     * @private
     */
    get_rigidBody_WorldCenter(body: any): IV2;

    /** 
     * @private
     */
    set_rigidBody_type(body: any, value: string): void;

    /** 
     * @private
     */
    set_rigidBody_gravityScale(body: any, value: number): void;

    /** 
     * @private
     */
    set_rigidBody_allowRotation(body: any, value: boolean): void;

    /** 
     * @private
     */
    set_rigidBody_allowSleep(body: any, value: boolean): void;

    /** 
     * @private
     */
    set_rigidBody_angularDamping(body: any, value: number): void;

    /** 
     * @private
     */
    get_rigidBody_angularVelocity(body: any): number;

    /** 
     * @private
     */
    set_rigidBody_angularVelocity(body: any, value: number): void;

    /** 
     * @private
     */
    set_rigidBody_linearDamping(body: any, value: number): void;

    /** 
     * @private
     */
    get_rigidBody_linearVelocity(body: any): IV2;

    /** 
     * @private
     */
    set_rigidBody_linearVelocity(body: any, value: IV2): void;

    /** 
     * @private
     */
    set_rigidBody_bullet(body: any, value: boolean): void;

}