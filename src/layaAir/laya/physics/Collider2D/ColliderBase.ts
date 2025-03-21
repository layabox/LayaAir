import { Component } from "../../components/Component";
import { Physics2D } from "../Physics2D";
import { Sprite } from "../../display/Sprite";
import { Box2DShapeDef, EPhysics2DShape, RigidBody2DInfo, RigidBody2DType } from "../factory/IPhysics2DFactory";
import { IV2, Vector2 } from "../../maths/Vector2";
import { Physics2DWorldManager } from "../Physics2DWorldManager";
import { RigidBody } from "../RigidBody";
import { Point } from "../../maths/Point";
import { Utils } from "../../utils/Utils";

/**
 * @en Collider base class
 * @zh 碰撞体基类
 */
export class ColliderBase extends Component {

    /**
     * @internal
     * @zh 碰撞体根据自定义的质量、质心、惯性张量计算质量（只在未开启自动质量计算的时候才使用）
     */
    protected _massData: any;

    /**
     * @internal
     * @zh 是否在激活状态
     */
    protected _isAwake: boolean = true;

    /**
     * @en The type of rigidbody, supports three types: dynamic and kinematic, default is dynamic.
     * dynamic: Dynamic type, affected by gravity.
     * kinematic: Kinematic type, not affected by gravity, can be moved by applying acceleration or force.
     * @zh 刚体类型，支持两种类型：dynamic 和 kinematic，默认为 dynamic 类型。
     * dynamic：动态类型，受重力影响。
     * kinematic：运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动。
     */
    protected _type: RigidBody2DType;

    /**
     * @internal
     * @en Is the rigid body mass calculated based on the collider
     * @zh 是否根据碰撞体计算刚体质量
     */
    protected _useAutoMass: boolean = true;

    /**
     * @internal
     * @en The rigid body mass. (Only valid when not using automatic mass calculation)
     * @zh 刚体质量（只在未开启自动质量计算时才有效）
     */
    protected _mass: number = 1;

    /**
     * @en The rigid body inertia tensor. (Only valid when not using automatic mass calculation)
     * @zh 刚体惯性张量（只在未开启自动质量计算时才有效）
    */
    protected _inertia: number = 10;

    /**
     * @en The center of mass of the rigid body. (Only valid when not using automatic mass calculation)
     * @zh 刚体质心位置（只在未开启自动质量计算时才有效）
     */
    protected _centerOfMass: Vector2 = new Vector2(0.5, 0.5);

    /**
     * @internal
     * @zh 当前碰撞体所属场景的2D物理管理器
     */
    protected _physics2DManager: Physics2DWorldManager;

    /**
     * @internal
     * @zh 碰撞体的结构定义
     */
    protected _bodyDef: RigidBody2DInfo = new RigidBody2DInfo();

    /**
     * @internal
     * @zh 碰撞体box2D的结构定义
     */
    private _box2DBodyDef: any;

    /**
     * @internal
     * @zh 碰撞体box2D的对象
     */
    protected _box2DBody: any;

    /**@internal 相对节点的x轴偏移*/
    private _x: number = 0;

    /**@internal 相对节点的y轴偏移*/
    private _y: number = 0;

    /**
     * @en label
     * @zh 标签
     */
    label: string;

    declare owner: Sprite;

    /**
     * @en The Rigidbody's resistance to changes in angular velocity (rotation).(Only valid when not using automatic mass calculation)
     * @zh 刚体惯性张量（只在未开启自动质量计算时才有效）
     */
    public get inertia(): number {
        let inertia;
        if (this._useAutoMass) {
            inertia = this.getInertia();
        } else {
            inertia = this._inertia;
        }
        this._bodyDef
        return inertia;
    }

    public set inertia(value: number) {
        this._inertia = value;
        if (!this._useAutoMass) {
            this._box2DBody && Physics2D.I._factory.set_rigidBody_Mass(this._box2DBody, this._mass, this._centerOfMass, this._inertia, this._massData);
        }
    }

    /**
     * @en The center of mass of the rigid body. (Only valid when not using automatic mass calculation)
     * @zh 刚体质心（只在未开启自动质量计算时才有效）
     */
    public get centerOfMass(): IV2 | Vector2 {
        let center;
        if (this._useAutoMass && this._box2DBody) {
            center = Physics2D.I._factory.get_rigidBody_Center(this._box2DBody);
            this._centerOfMass.x = center.x;
            this._centerOfMass.y = center.y;
        } else {
            center = this._centerOfMass;
        }
        return center;
    }
    public set centerOfMass(value: IV2 | Vector2) {
        if (value instanceof Vector2) {
            this._centerOfMass = value;
        } else {
            this._centerOfMass.x = value.x;
            this._centerOfMass.y = value.y;
        }
        if (!this._useAutoMass) {
            this._box2DBody && Physics2D.I._factory.set_rigidBody_Mass(this._box2DBody, this._mass, this._centerOfMass, this._inertia, this._massData);
        }
    }

    /**
     * @en The rigid body mass. (Only valid when not using automatic mass calculation)
     * @zh 刚体质量（只在未开启自动质量计算时才有效）
     */
    public get mass(): number {
        let mass;
        if (this._useAutoMass && this._box2DBody) {
            mass = Physics2D.I._factory.get_rigidBody_Mass(this._box2DBody);
        } else {
            mass = this._mass;
        }
        return mass;
    }
    public set mass(value: number) {
        this._mass = value;
        if (!this._useAutoMass) {
            this._box2DBody && Physics2D.I._factory.set_rigidBody_Mass(this._box2DBody, this._mass, this._centerOfMass, this._inertia, this._massData);
        }
    }

    /**
     * @en Is the rigid body mass calculated based on the collider
     * @zh 是否根据碰撞体计算刚体质量 
     */
    public get useAutoMass(): boolean {
        return this._useAutoMass;
    }
    public set useAutoMass(value: boolean) {
        this._useAutoMass = value;
        this._box2DBody && Physics2D.I._factory.set_rigidBody_Mass(this._box2DBody, this._mass, this._centerOfMass, this._inertia, this._massData);
    }

    /**
     * @zh 当前碰撞体在物理世界中是否在激活状态
     */
    public get isAwake(): boolean {
        if (this._box2DBody) {
            this._isAwake = Physics2D.I._factory.get_rigidBody_IsAwake(this._box2DBody);
        }
        return this.isAwake;
    }
    public set isAwake(value: boolean) {
        this._isAwake = value;
        this._box2DBody && Physics2D.I._factory.set_rigidBody_Awake(this._box2DBody, value);
    }

    /**
     * @internal
     * 获得节点的全局缩放X
     */
    protected get scaleX(): number {
        return this.owner.globalTrans.scaleX;
    }

    /**
     * @internal
     * 获得节点的全局缩放Y
     */
    protected get scaleY(): number {
        return this.owner.globalTrans.scaleY;
    }

    /**@internal 创建获得相对于描点x的偏移 */
    protected get pivotoffx(): number {
        return this._x - this.owner.pivotX;
    }

    /**@internal 创建获得相对于描点y的偏移 */
    protected get pivotoffy(): number {
        return this._y - this.owner.pivotY;
    }

    /**
     * @en The x-axis offset relative to the node.
     * @zh 相对于节点的 x 轴偏移。
     */
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        if (this._x == value) return;
        this._x = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @en The y-axis offset relative to the node.
     * @zh 相对于节点的 y 轴偏移。
     */
    get y(): number {
        return this._y;
    }

    set y(value: number) {
        if (this._y == value) return;
        this._y = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @en constructor method
     * @zh 构造方法
     */
    constructor() {
        super();
        this._singleton = false;
    }

    /**
     * @zh 获取对应box2D的碰撞体
     * @returns 
     */
    getBox2DBody(): any {
        if (this._box2DBody) {
            return this._box2DBody;
        }
    }

    /**
     * @en Get the inertia of the rigid body.
     * @zh 获得刚体的惯性张量。
     * @returns 
     */
    getInertia(): number {
        if (!this._box2DBody) this._onAwake();
        return Physics2D.I._factory.get_rigidBody_Inertia(this._box2DBody);
    }

    /**@internal*/
    protected _onEnable(): void {
        this._getPhysicsManager();
        this._box2DBodyDef = Physics2D.I._factory.createBodyDef(this._physics2DManager.box2DWorld, this._bodyDef);
        this._box2DBody = Physics2D.I._factory.createBody(this._physics2DManager.box2DWorld, this._box2DBodyDef);
    }

    protected _getPhysicsManager(): void {
        this._physics2DManager = this.owner?.scene?.getComponentElementManager(Physics2DWorldManager.__managerName) as Physics2DWorldManager;
    }

    /**
     * @en Get the world coordinates relative to the body.
     * @param x The x-coordinate in pixels.
     * @param y The y-coordinate in pixels.
     * @zh 获得相对于 body 的世界坐标。
     * @param x 像素坐标的 x 值。
     * @param y 像素坐标的 y 值。
     */
    getWorldPoint(x: number, y: number): Readonly<Point> {
        return this.owner.globalTrans.localToGlobal(x, y);
    }


    /**
     * @internal
     * @en Refresh the physics world collision information after the collision body parameters change.
     * @zh 碰撞体参数发生变化后，刷新物理世界碰撞信息
     */
    _refresh(): void {
    }

    /**@internal*/
    protected _onDisable(): void {
        this._box2DBody && Physics2D.I._factory.removeBody(this._physics2DManager.box2DWorld, this._box2DBody);
        this._box2DBody = null;
        this._box2DBodyDef = null;
    }

    protected _onDestroy(): void {
        this._box2DBody && Physics2D.I._factory.removeBody(this._physics2DManager.box2DWorld, this._box2DBody);
        this._box2DBodyDef && Physics2D.I._factory.destroyData(this._box2DBodyDef);
        this._box2DBody = null;
        this._box2DBodyDef = null;
    }

    // -----------------------  已废弃 deprecated ------------------------


    /**@deprecated 兼容参数  */
    protected _box2DFilter: any;
    /**@deprecated 兼容参数 */
    protected _box2DShapeDef: any;
    /**@deprecated 兼容参数 */
    protected _shapeDef: Box2DShapeDef = new Box2DShapeDef();
    /**@deprecated 兼容参数 */
    protected _box2DShape: any;

    /**@internal @deprecated shape类型标记*/
    protected _shapeType: EPhysics2DShape;

    /**@deprecated 兼容参数 */
    protected _rigidbody: RigidBody;

    /**@internal @deprecated 已废弃，是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应*/
    private _isSensor: boolean = false;

    /**@internal @deprecated 已废弃，密度值，值可以为零或者是正数，建议使用相似的密度，这样做可以改善堆叠稳定性，默认值为10*/
    private _density: number = 10;

    /**@internal @deprecated 已废弃，摩擦力，取值范围0-1，值越大，摩擦越大，默认值为0.2*/
    private _friction: number = 0.2;

    /**@internal @deprecated 已废弃，弹性系数，取值范围0-1，值越大，弹性越大，默认值为0*/
    private _restitution: number = 0;

    /**
     * @deprecated This is only for compatibility. In subsequent versions, you can set whether the shape is a sensor.
     * @en Whether the object is a sensor. A sensor can trigger collision events but does not produce collision responses.
     * @deprecated 这个只做兼容，后续版本在shape中设置是否为传感器
     * @zh 是否是传感器，传感器能够触发碰撞事件，但不会产生碰撞反应
     */
    get isSensor(): boolean {
        return this._isSensor;
    }

    set isSensor(value: boolean) {
        if (this._isSensor == value) return;
        this._isSensor = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @deprecated This is only for compatibility, and subsequent versions will set the density value in shape.
     * @en The density value. The value can be zero or a positive number. It is recommended to use similar densities to improve stacking stability. The default value is 10.
     * @deprecated 这个只做兼容，后续版本在shape中设置密度值大小.
     * @zh 密度值。值可以为零或者是正数，建议使用相似的密度以改善堆叠稳定性。默认值为 10。
     */
    get density(): number {
        return this._density;
    }

    set density(value: number) {
        if (this._density == value) return;
        this._density = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @deprecated This is only for compatibility, and subsequent versions will set friction in the shape.
     * @en The friction coefficient. The value ranges from 0 to 1, the larger the value, the greater the friction. The default value is 0.2.
     * @deprecated 这个只做兼容,后续版本在shape中设置摩擦力.
     * @zh 摩擦力。取值范围0-1，值越大，摩擦越大。默认值为0.2。
     */
    get friction(): number {
        return this._friction;
    }

    set friction(value: number) {
        if (this._friction == value) return;
        this._friction = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @deprecated 
     * @en The restitution coefficient. The value ranges from 0 to 1, the larger the value, the greater the elasticity. The default value is 0.
     * @deprecated 
     * @zh 弹性系数。取值范围0-1，值越大，弹性越大。默认值为0。
     */
    get restitution(): number {
        return this._restitution;
    }

    set restitution(value: number) {
        if (this._restitution == value) return;
        this._restitution = value;
        this._needupdataShapeAttribute();
    }

    /**
     * @deprecated 兼容方法
     */
    createShape(collider: ColliderBase) {
    }

    /**
     * @deprecated 兼容方法，根据刚体的数据设置def
     * @param collider 
     */
    protected _setRigidbodyValue(collider: RigidBody): void {
    }

    /**@internal @deprecated 通知rigidBody 更新shape 属性值 */
    protected _needupdataShapeAttribute(): void {
        //兼容模式下使用，设置类似BoxCollider的偏移方式
        if (this._rigidbody && this._rigidbody.applyOwnerColliderComponent) {
            this.createShape(this._rigidbody);
        }
        //非dynamic类型下可以直接设置位置
        if (this._type != "dynamic") {
            var sp: Sprite = this.owner;
            this._box2DBody && Physics2D.I._factory.set_RigibBody_Transform(this._box2DBody, sp.globalTrans.x, sp.globalTrans.y, Utils.toRadian(this.owner.globalTrans.rotation));
        }
    }

    // -----------------------  已废弃 deprecated ------------------------
}
