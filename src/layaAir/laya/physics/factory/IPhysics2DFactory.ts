import { IV2, Vector2 } from "../../maths/Vector2";
import { Physics2DWorldManager } from "../Physics2DWorldManager";

export type RigidBody2DType = "static" | "dynamic" | "kinematic";

/**
 * @zh 绘制物理2D信息枚举
 * @en Physics2D Blit Enum
 */
export enum EPhycis2DBlit {
    /**
     * @zh 不绘制任何信息
     * @en do not draw any information
     */
    None = 0,

    /**
     * @zh 绘制刚体信息
     * @en draw RigidBody information
     */
    Shape = 1,

    /**
     * @zh 绘制关节信息
     * @en draw Joint information
     */
    Joint = 2,

    /**
     * @zh 绘制AABB信息
     * @en draw AABB information
     */
    AABB = 4,

    /**
     * @zh 绘制碰撞对
     * @en draw collision pair
     */
    Pair = 8,

    /**
     * @zh 绘制刚体的质心
     * @en draw RigidBody center of mass
     */
    CenterOfMass = 16,

    /**
     * @zh 绘制刚体的速度
     * @en draw RigidBody velocity
     */
    All = 31
}

/**
 * @zh 2D物理约束枚举
 * @en Physics2D Constraint Enum
 */
export enum EPhysics2DJoint {
    /**
     * @zh 距离关节
     * @en DistanceJoint
     */
    DistanceJoint,

    /**
     * @zh 旋转关节
     * @en RevoluteJoint
     */
    RevoluteJoint,

    /**
     * @zh 齿轮关节
     * @en GearJoint
     */
    GearJoint,

    /**
     * @zh 轮子关节
     * @en PulleyJoint
     */
    PulleyJoint,

    /**
     * @zh 轮子关节
     * @en WheelJoint
     */
    WheelJoint,

    /**
     * @zh 焊接关节
     * @en WeldJoint
     */
    WeldJoint,

    /**
     * @zh 鼠标关节
     * @en MouseJoint
     */
    MouseJoint,

    /**
     * @zh 电机关节
     * @en MotorJoint
     */
    MotorJoint,

    /**
     * @zh 刚体关节
     * @en PrismaticJoint
     */
    PrismaticJoint,
}

/**
 * @zh 2D物理形状枚举
 * @en Physics2D Shape Enum
 */
export enum EPhysics2DShape {
    /**
     * @zh 矩形
     * @en BoxShape
     */
    BoxShape,

    /**
     * @zh 圆形
     * @en CircleShape
     */
    CircleShape,

    /**
     * @zh 多边形
     * @en PolygonShape
     */
    PolygonShape,

    /**
     * @zh 链状
     * @en ChainShape
     */
    ChainShape,

    /**
     * @zh 边
     * @en EdgeShape
     */
    EdgeShape,
}

/**
 * @zh 碰撞过滤数据
 * @en Collision filtering data
 */
export class FilterData {
    /**
     * @zh 碰撞组
     * @en Collision group
     */
    group: number = 0;

    /**
     * @zh 碰撞类别
     * @en Collision category
     */
    category: number = 1;

    /**
     * @zh 碰撞掩码
     * @en Collision mask
     */
    mask: number = -1;
}

/**
 * @zh 形状定义
 * @en Shape definition
 */
export class Box2DShapeDef {
    /**
     * @zh 密度
     * @en Density
     */
    density: number = 1;

    /**
     * @zh 摩擦力
     * @en Friction
     */
    friction: number = 0.2;

    /**
     * @zh 是否为传感器
     * @en Whether it is a sensor
     */
    isSensor: boolean = false;

    /**
     * @zh 弹力
     * @en Restitution
     */
    restitution: number = 0;

    /**
     * @zh 恢复速度阈值（米/秒），高于此速度的碰撞将应用恢复即反弹
     */
    restitutionThreshold: number = 1.0;

    /**
     * @zh 形状
     * @en Shape
     */
    shapeType: EPhysics2DShape;//Box2D Shape  为了兼容2.4.1的fixture

    /**
     * @zh 碰撞过滤数据
     * @en Collision filtering data
     */
    filter: FilterData = new FilterData();
}

/**
 * @zh 刚体2D定义
 * @en The information of the rigid body in 2D physics.
 */
export class RigidBody2DInfo {
    /**
     * @zh 位置
     * @en Position
     */
    position: Vector2 = new Vector2();

    /**
     * @zh 角度
     * @en Angle
     */
    angle: number;

    /**
     * @zh 允许睡眠
     * @en Whether to allow sleeping
     */
    allowSleep: boolean;

    /**
     * @zh 角速度阻尼
     * @en Angular velocity damping
     */
    angularDamping: number;

    /**
     * @zh 角速度
     * @en Angular velocity
     */
    angularVelocity: number;

    /**
     * @zh 是否bullet高速运动类型
     * @en Whether it is a bullet high speed motion type
     */
    bullet: boolean;

    /**
     * @zh 是否固定旋转
     * @en Whether to fix rotation
     */
    fixedRotation: boolean;

    /**
     * @zh 重力缩放
     * @en Gravity scale
     */
    gravityScale: number;

    /**
     * @zh 线性阻尼
     * @en Linear damping
     */
    linearDamping: number;

    /**
     * @zh 线性速度
     * @en Linear velocity
     */
    linearVelocity: Vector2 = new Vector2();

    type: string = "static";

    /**
     * @deprecated 碰撞分组，作为兼容使用
     */
    group: number;
}

/**
 * @zh 2D物理joint定义
 * @en 2D physics joint definition
 */
export class physics2D_BaseJointDef {
    /**
     * @zh 刚体A
     * @en Body A
     */
    bodyA: any;

    /**
     * @zh 刚体B
     * @en Body B
     */
    bodyB: any;

    /**
     * @zh 刚体之间是否可以互相碰撞
     */
    collideConnected: boolean;
}

/**
 * @zh Box2D 距离关节定义结构
 * @en Box2D distance Joint def Struct
 */
export class physics2D_DistancJointDef extends physics2D_BaseJointDef {
    localAnchorA: Vector2 = new Vector2();
    localAnchorB: Vector2 = new Vector2();
    frequency: number;
    dampingRatio: number;
    length: number;
    maxLength: number;
    minLength: number;
    isLocalAnchor: boolean
}

export class physics2D_GearJointDef extends physics2D_BaseJointDef {
    joint1: any;
    joint2: any;
    ratio: number;
}


export class physics2D_MotorJointDef extends physics2D_BaseJointDef {
    linearOffset: Vector2 = new Vector2();
    angularOffset: number;
    maxForce: number;
    maxTorque: number;
    correctionFactor: number;
}

export class physics2D_MouseJointJointDef extends physics2D_BaseJointDef {
    maxForce: number;
    frequency: number;
    dampingRatio: number;
    target: Vector2 = new Vector2();
}

export class physics2D_PrismaticJointDef extends physics2D_BaseJointDef {
    anchor: Vector2 = new Vector2();
    axis: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorForce: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
}

export class physics2D_PulleyJointDef extends physics2D_BaseJointDef {
    groundAnchorA: Vector2 = new Vector2();
    groundAnchorB: Vector2 = new Vector2();
    localAnchorA: Vector2 = new Vector2();
    localAnchorB: Vector2 = new Vector2();
    ratio: number;
}

export class physics2D_RevoluteJointDef extends physics2D_BaseJointDef {
    anchor: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    enableLimit: boolean;
    lowerAngle: number;
    upperAngle: number;
}

export class physics2D_WeldJointDef extends physics2D_BaseJointDef {
    anchor: Vector2 = new Vector2();
    frequency: number;
    dampingRatio: number;
}

export class physics2D_WheelJointDef extends physics2D_BaseJointDef {
    anchor: Vector2 = new Vector2();
    axis: Vector2 = new Vector2();
    enableMotor: boolean;
    motorSpeed: number;
    maxMotorTorque: number;
    enableLimit: boolean;
    lowerTranslation: number;
    upperTranslation: number;
    frequency: number;
    dampingRatio: number;
}


export class box2DWorldDef {
    gravity: Vector2 = new Vector2(0, -9.8);
    pixelRatio: number = 50;
    subStep: number = 1;
    velocityIterations: number = 8;
    positionIterations: number = 3;
}

export enum Ebox2DType {
    b2Color,
    b2Vec2,
    b2Transform,
    b2Contact,
    b2Joint,
    b2Fixture,
    b2Filter,
    b2QueryCallback,
    b2RayCastCallback
}


export interface IPhysics2DFactory {
    worldCount: number;

    worldMap: Map<number, Physics2DWorldManager>;

    //---------------- world -------------------
    createWorld(worldDef: box2DWorldDef): any;

    allowWorldSleep(world: any, allowSleep: boolean): void;

    destroyWorld(world: any): void;

    destroyData(data: any): void;

    // TODO
    setDestructionListener(world: any, destroyFun: Function): void;

    setContactListener(world: any, listener: Function): void;

    warpPoint(ins: any, type: Ebox2DType): any;

    getContactShapeA(contact: any): any;

    getContactShapeB(contact: any): any;

    createContactListener(): any;

    createJSQueryCallback(): any;

    createJSRayCastCallback(): any;

    clearForces(world: any): void;

    QueryAABB(world: any, jsquerycallback: any, bounds: any): void;   // inside 设置contact的filter

    RayCast(world: any, jsraycastcallback: any, startPoint: Vector2, endPoint: Vector2): void;

    shapeCast(): void;

    getBodyList(world: any): any[];

    getBodyCount(world: any): number;

    getJointList(world: any): any[];

    getJointCount(world: any): number;

    getContactList(world: any): any[];

    getContactCount(world: any): number;

    createPhyVec2(x: number, y: number): any;

    createBox2DDraw(world: any, flag: number): any;

    shiftOrigin(world: any, newOrigin: Vector2): void;

    appendFlags(jsDraw: any, flags: number): void;

    clearFlags(jsDraw: any, flags: number): void

    /** 
     * @internal
     * 初始化系统
     */
    initialize(): Promise<void>;

    /** 
     * @internal
     * 更新物理
     */
    update(delta: number): void;


    //---------------- Joint -------------------
    createJointDef(world: any, type: EPhysics2DJoint, def: physics2D_BaseJointDef): any;

    /** 
     * @internal
     */
    createJoint(world: any, type: EPhysics2DJoint, def: any): any;

    /** 
     * @internal
     */
    removeJoint(world: any, joint: any): void;

    /**
     * 当前约束的反作用力(也就是为了维持约束对刚体施加的力)
     * @param world 
     * @param joint 
     */
    get_joint_recationForce(joint: any): any;

    /**
     * 当前约束的反扭距(为了维持约束对刚体施加的扭矩)
     * @param world 
     * @param joint 
     */
    get_joint_reactionTorque(joint: any): number;

    isValidJoint(joint: any): boolean;

    setJoint_userData(joint: any, data: any): void;

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
    set_Joint_frequencyAndDampingRatio(joint: any, frequency: number, dampingRatio: number, isdamping: boolean): void;

    /** 
     * @internal
     */
    set_DistanceJoint_length(joint: any, length: number): void;

    get_DistanceJoint_length(joint: any): number;

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
    set_GearJoint_SetRatio(joint: any, radio: number): void;

    /** 
     * @internal
     */
    set_MouseJoint_target(joint: any, x: number, y: number): void;

    /** 
     * @internal
     */
    set_MouseJoint_frequencyAndDampingRatio(joint: any, frequency: number, dampingRatio: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_linearOffset(joint: any, x: number, y: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetAngularOffset(joint: any, angular: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetMaxForce(joint: any, maxForce: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetMaxTorque(joint: any, maxTorque: number): void;

    /** 
     * @internal
     */
    set_MotorJoint_SetCorrectionFactor(joint: any, correctionFactor: number): void;

    //----------------Collider-------------------

    /** 
     * @internal
     */
    set_collider_SetAsBox(shape: any, x: number, y: number, pos: IV2, scaleX: number, scaleY: number): any

    /** 
     * @internal
     */
    set_ChainShape_data(shape: any, x: number, y: number, arr: number[], loop: boolean, scaleX: number, scaleY: number): any;

    /** 
     * @internal
     */
    set_CircleShape_radius(shape: any, radius: number, scale: number): void;

    /** 
     * @internal
     */
    set_CircleShape_pos(shape: any, x: number, y: number, scale: number): void;

    /** 
     * @internal
     */
    set_EdgeShape_data(shape: any, x: number, y: number, arr: number[], scaleX: number, scaleY: number): any;

    /** 
     * @internal
     */
    set_PolygonShape_data(shape: any, x: number, y: number, arr: number[], scaleX: number, scaleY: number): any;

    //---------------- shape -------------------
    createShapeDef(world: any, shapeDef: Box2DShapeDef, filter: any): any;

    getShapeByDef(shapeDef: any, shapeType: EPhysics2DShape): any;

    createFilter(): any;

    createShape(world: any, body: any, shapeType: EPhysics2DShape, shapdeDef: any): any;

    destroyShape(world: any, body: any, shape: any): void;

    /** 
     * @internal
     */
    set_shapeDef_GroupIndex(def: any, groupIndex: number): void;

    /** 
     * @internal
     */
    set_shapeDef_CategoryBits(def: any, categoryBits: number): void;

    /** 
     * @internal
     */
    set_shapeDef_maskBits(def: any, maskbits: number): void;

    /** 
    * @internal
    */
    resetShapeData(shape: any, shapeDef: any): void;

    /** 
     * @internal
     */
    set_shape_collider(shape: any, instance: any): void

    /** 
     * @internal
     */
    get_shape_body(shape: any): any;

    set_shape_isSensor(shape: any, sensor: boolean): void;

    get_shape_isSensor(shape: any): boolean;

    getShape(shape: any): any;

    setfilterData(shape: any, filterData: any): void;

    getfilterData(shape: any): any;

    set_shape_reFilter(shape: any): void;   // 内部调用就好了

    shape_rayCast(shape: any, output: any, input: any, childIndex: number): boolean;    // 改成shape的名字

    get_shape_massData(shape: any, massData: any): any;

    set_shape_density(shape: any, density: number): void;

    set_shape_friction(shape: any, friction: number): void;

    set_shape_restitution(shape: any, restitution: number): void;

    set_shape_restitutionThreshold(shape: any, restitutionThreshold: number): void;

    get_shape_AABB(shape: any): any;

    //----------------RigidBody-------------------   
    createMassData(): any;
    /** 
     * @internal
     */
    createBody(world: any, def: any): any;

    /** 
     * @internal
     */
    removeBody(world: any, body: any): void;

    get_rigidBody_isEnable(body: any): boolean;

    get_rigidBody_fixedRotation(body: any): boolean;

    get_rigidBody_next(body: any): any;  //TODO

    set_rigidBody_userData(body: any, data: any): void;

    get_rigidBody_userData(body: any): any;

    /** 
     * @internal
     */
    rigidBody_DestroyShape(body: any, shape: any): any;

    /** 
     * @internal
     */
    createBodyDef(world: any, rigidbodyDef: RigidBody2DInfo): any;

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
    set_RigibBody_Enable(body: any, enable: boolean): void;

    /** 
     * @internal
     */
    set_RigibBody_Transform(body: any, x: number, y: number, angle: number): void;

    get_RigibBody_Transform(body: any): any;

    /** 
     * @internal
     */
    get_rigidBody_WorldPoint(body: any, x: number, y: number): IV2;

    get_rigidBody_WorldVector(body: any, value: Vector2): Vector2;

    /** 
     * @internal
     */
    get_rigidBody_LocalPoint(body: any, x: number, y: number): IV2;

    get_rigidBody_LocalVector(body: any, value: Vector2): Vector2;

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

    rigidbody_ApplyAngularImpulse(body: any, impulse: number): void;

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
    set_rigidBody_Awake(body: any, awake: boolean): void;

    /** 
     * @internal
     */
    get_rigidBody_Mass(body: any): number;

    /** 
     * @internal
     */
    set_rigidBody_Mass(body: any, massValue: number, centerOfMass: IV2, inertia: number, massData: any): void;

    /** 
     * @internal
     */
    get_rigidBody_Center(body: any): IV2;

    /**
     * @internal
     */
    get_rigidBody_Inertia(body: any): number;

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

    get_rigidBody_type(body: any): string;

    /** 
     * @internal
     */
    set_rigidBody_gravityScale(body: any, value: number): void;

    get_rigidBody_gravityScale(body: any): number;

    /** 
     * @internal
     */
    set_rigidBody_allowRotation(body: any, value: boolean): void;

    /** 
     * @internal
     */
    set_rigidBody_allowSleep(body: any, value: boolean): void;

    get_rigidBody_allowSleep(body: any): boolean;

    /** 
     * @internal
     */
    set_rigidBody_angularDamping(body: any, value: number): void;

    get_rigidBody_angularDamping(body: any): number;


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

    get_rigidBody_linearDamping(body: any): number;

    /** 
     * @internal
     */
    get_rigidBody_linearVelocity(body: any): IV2;

    /** 
     * @internal
     */
    set_rigidBody_linearVelocity(body: any, value: IV2): void;

    get_rigidBody_linearVelocityFromWorldPoint(body: any, worldPoint: Vector2): Vector2;

    get_rigidBody_linearVelocityFromLocalPoint(body: any, localPoint: Vector2): Vector2;

    /** 
     * @internal
     */
    set_rigidBody_bullet(body: any, value: boolean): void;

    get_rigidBody_bullet(body: any): boolean;

    /** 
    * @internal
    */
    retSet_rigidBody_MassData(body: any): void;

}