import { ColliderBase } from "./Collider2D/ColliderBase";
import { Sprite } from "..//display/Sprite"
import { Point } from "../maths/Point"
import { Utils } from "../utils/Utils"
import { Physics2D } from "./Physics2D";
import { IV2, Vector2 } from "../maths/Vector2";
import { RigidBody2DType } from "./factory/IPhysics2DFactory";
import { SpriteGlobalTransform } from "../display/SpriteGlobaTransform";
import { Physics2DShapeBase } from "./Shape/Physics2DShapeBase";

const _tempV0: Vector2 = new Vector2();

/**
 * @en 2D rigidbody, display objects are bound to the physics world through RigidBody to keep the positions of physics and display objects synchronized.
 * Changes in the position of the physics world will be automatically synchronized to the display object, and the displacement and rotation of the display object itself (displacement of the parent object is invalid) will also be automatically synchronized to the physics world.
 * If you want to move the physics world as a whole, you can set Physics2D.I.worldRoot = scene, and then move the scene.
 * You can enable the display of physics auxiliary lines by enabling "Project Settings" - "2D Physics" - "Enable 2D Physics Drawing" in the IDE, or through the code Physics2D.I.enableDebugDraw = true.
 * @zh 2D刚体，显示对象通过RigidBody和物理世界进行绑定，保持物理和显示对象之间的位置同步。
 * 物理世界的位置变化会自动同步到显示对象，显示对象本身的位移，旋转（父对象位移无效）也会自动同步到物理世界。
 * 如果想整体位移物理世界，可以设置 Physics2D.I.worldRoot = 场景，然后移动场景即可。
 * 可以通过IDE-"项目设置"-"2D物理"-"是否开启2D物理绘制" 开启物理辅助线显示，或者通过代码 Physics2D.I.enableDebugDraw = true。
 */
export class RigidBody extends ColliderBase {

    /** 是否允许休眠，允许休眠能提高性能*/
    protected _allowSleep: boolean = true;

    /** 角速度，设置会导致旋转*/
    protected _angularVelocity: number = 0;

    /** 旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _angularDamping: number = 0;

    /** 线性运动速度，比如{x:10,y:10}*/
    protected _linearVelocity: IV2 = { x: 0, y: 0 };

    /** 线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _linearDamping: number = 0;

    /** 是否高速移动的物体，设置为true，可以防止高速穿透*/
    protected _bullet: boolean = false;

    /** 是否允许旋转，如果不希望刚体旋转，这设置为false*/
    protected _allowRotation: boolean = true;

    /** 重力缩放系数，设置为0为没有重力*/
    protected _gravityScale: number = 1;

    /**@deprecated 兼容模式下获取owner的其他collider碰撞形状 */
    private _colliders: ColliderBase[] = [];

    /**
     * @deprecated is deprecated, use shape's filter instead.
     * @en [Read-only] Specifies the collision group to which the body belongs, default is 0, the collision rules are as follows:
     * 1. If the group values of two objects are equal:
     *    - If the group value is greater than zero, they will always collide.
     *    - If the group value is less than zero, they will never collide.
     *    - If the group value is equal to 0, then rule 3 is used.
     * 2. If the group values are not equal, then rule 3 is used.
     * 3. Each rigidbody has a category, this property receives a bit field, the range is the power of 2 in the range of [1,2^31].
     * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
     * @deprecated 已废弃，通过设置刚体shape的filter来设置这个参数.
     * @zh [只读] 指定了该主体所属的碰撞组，默认为0，碰撞规则如下：
     * 1. 如果两个对象 group 相等：
     *    - group 值大于零，它们将始终发生碰撞。
     *    - group 值小于零，它们将永远不会发生碰撞。
     *    - group 值等于0，则使用规则3。
     * 2. 如果 group 值不相等，则使用规则3。
     * 3. 每个刚体都有一个 category 类别，此属性接收位字段，范围为 [1,2^31] 范围内的2的幂。
     * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
     */
    group: number = 0;

    /**
     * @deprecated is deprecated, please use shape's catalogy instead.
     * @en [Read-only] Collision category, specified using powers of 2, with 32 different collision categories available.
     * @deprecated 已废弃，通过设置刚体shape的filter来设置
     * @zh [只读] 碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用。
     */
    category: number = 1;

    /**
     * @deprecated is deprecated, use shape's filter instead.
     * @en [Read-only] Specifies the category of collision bit mask, the result of category bitwise operation.
     * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
     * @deprecated 已废弃，通过设置刚体shape的filter来设置
     * @zh [只读] 指定冲突位掩码碰撞的类别，category 位操作的结果。
     * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
     */
    mask: number = -1;

    /**
     * @en [Read-only] Custom label.
     * @zh [只读] 自定义标签。
     */
    label: string = "RigidBody";

    declare owner: Sprite;

    /**
     * @zh 碰撞形状，可以是多个
     */
    private _shapes: Physics2DShapeBase[];

    /**
     * @zh 是否兼容Collider组件的方式
     */
    private _applyOwnerColliderComponent: boolean = true;

    /**
     * @en The original body object.
     * @zh 原始body对象。
     */
    get body(): any {
        return this._box2DBody;
    }

    /**
     * @en The type of the rigid body. Supports two types: dynamic, and kinematic.
     * - dynamic: Dynamic type, affected by gravity.
     * - kinematic: Kinematic type, not affected by gravity, can be moved by applying velocity or force.
     * @zh 刚体类型，支持两种类型：dynamic 和 kinematic。
     * - dynamic：动态类型，受重力影响。
     * - kinematic：运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动。
     */
    get type(): RigidBody2DType {
        return this._type;
    }

    set type(value: RigidBody2DType) {
        if (value !== "dynamic" && value !== "kinematic") {
            console.warn("Rigidbody only can set as dynamic or kinematic.");
        }
        this._type = value;
        this._updateBodyType()
    }

    /**
     * @en The gravity scale factor. Set it to 0 for no gravity.
     * @zh 重力缩放系数，设置为 0 表示没有重力。
     */
    get gravityScale(): number {
        return this._gravityScale;
    }

    set gravityScale(value: number) {
        this._gravityScale = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_gravityScale(this._box2DBody, value);
    }

    /**
     * @en Allowing rotation means that when a force or impact is applied to the rigid body, it will naturally rotate according to physical rules. If you do not want the rigid body to rotate, set this to false.
     * @zh 允许旋转是指当力或者冲击作用于该刚体时，它会按照物理规则进行自然旋转，如果不希望刚体旋转，请设置为 false。
     */
    get allowRotation(): boolean {
        return this._allowRotation;
    }

    set allowRotation(value: boolean) {
        this._allowRotation = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_allowRotation(this._box2DBody, !value);
    }

    /**
     * @en Whether to allow sleeping. Allowing sleeping can improve performance but may result in the inability to respond immediately.
     * @zh 是否允许休眠，允许休眠能提高性能，但会导致无法即时响应。
     */
    get allowSleep(): boolean {
        return this._allowSleep;
    }

    set allowSleep(value: boolean) {
        this._allowSleep = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_allowSleep(this._box2DBody, value);
    }

    /**
     * @en The angular damping coefficient. It can range from 0 to infinity, where 0 means no damping and infinity means full damping. Normally, the damping value should be between 0 and 0.1.
     * @zh 旋转速度阻尼系数，范围可以在 0 到无穷大之间，0 表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在 0 到 0.1 之间。
     */
    get angularDamping(): number {
        return this._angularDamping;
    }

    set angularDamping(value: number) {
        this._angularDamping = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_angularDamping(this._box2DBody, value);
    }

    /**
     * @en The angular velocity. Setting it will cause rotation.
     * @zh 角速度，设置会导致旋转。
     */
    get angularVelocity(): number {
        if (this._box2DBody) return Physics2D.I._factory.get_rigidBody_angularVelocity(this._box2DBody);
        return this._angularVelocity;
    }

    set angularVelocity(value: number) {
        this._angularVelocity = value;
        if (this._type == "static") {
            return;
        }
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_angularVelocity(this._box2DBody, value);
    }

    /**
     * @en The linear damping coefficient. It can range from 0 to infinity, where 0 means no damping and infinity means full damping. Normally, the damping value should be between 0 and 0.1.
     * @zh 线性速度阻尼系数，范围可以在 0 到无穷大之间，0 表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在 0 到 0.1 之间。
     */
    get linearDamping(): number {
        return this._linearDamping;
    }

    set linearDamping(value: number) {
        this._linearDamping = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_linearDamping(this._box2DBody, value);
    }

    /**
     * @en The linear velocity, such as {x: 5, y: 5}.
     * @zh 线性运动速度，例如 {x: 5, y: 5}。
     */
    get linearVelocity(): IV2 {
        if (this._box2DBody) {
            var vec: IV2 = Physics2D.I._factory.get_rigidBody_linearVelocity(this._box2DBody);
            vec.x = vec.x;
            vec.y = vec.y;
            return { x: vec.x, y: vec.y };
        }
        return this._linearVelocity;
    }

    set linearVelocity(value: IV2) {
        if (!value) return;
        if (value instanceof Array) {
            throw new Error('set linearVelocity: value is not implement IV2');
        }
        this._linearVelocity = value;
        if (this._type == "static") {
            return;
        }
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_linearVelocity(this._box2DBody, value);
    }

    /**
     * @en Whether it is a high-speed moving object. Setting it to true can prevent high-speed penetration.
     * @zh 是否为高速移动的物体，设置为 true 可以防止高速穿透。
     */
    get bullet(): boolean {
        return this._bullet;
    }

    set bullet(value: boolean) {
        this._bullet = value;
        if (this._box2DBody) Physics2D.I._factory.set_rigidBody_bullet(this._box2DBody, value);
    }

    /**
     * @zh 刚体的碰撞形状
     * @en Collision shape of the rigid body
     */
    public get shapes(): Physics2DShapeBase[] {
        return this._shapes;
    }

    public set shapes(shapes: Physics2DShapeBase[]) {
        if (!shapes || shapes.length == 0) return;
        this._shapes = shapes;
        shapes.forEach((shape) => {
            shape.setCollider(this);
        });
        if (this._useAutoMass) {
            // 根据shape自动计算质量
            this._box2DBody && Physics2D.I._factory.retSet_rigidBody_MassData(this._box2DBody);
        } else {
            this._box2DBody && Physics2D.I._factory.set_rigidBody_Mass(this._box2DBody, this._mass, this._centerOfMass, this._inertia, this._massData);
        }
    }

    /**
     * @zh 是否应用旧版的Collider组件的兼容方式
     * @en Whether to use the old version of the Collider component compatibility method
     */
    public get applyOwnerColliderComponent(): boolean {
        return this._applyOwnerColliderComponent;
    }
    public set applyOwnerColliderComponent(value: boolean) {
        this._applyOwnerColliderComponent = value;
    }

    /**
     * @zh 强制设置刚体的位置
     * @en Enforce the position of a rigid body
     */
    set position(pos: Point) {
        if (!this._box2DBody) return;
        var factory = Physics2D.I._factory;
        let rotateValue = Utils.toAngle(factory.get_RigidBody_Angle(this._box2DBody));
        factory.set_RigibBody_Transform(this._box2DBody, pos.x, pos.y, rotateValue);//重新给个setPos的接口
        factory.set_rigidBody_Awake(this._box2DBody, true);
        Physics2D.I._addRigidBody(this);
    }

    /**
     * @zh 强制设置刚体的旋转（弧度）
     * @en Force the rotation of the rigidbody (in radians)
     */
    set rotation(number: number) {
        if (!this._box2DBody) return;
        var factory = Physics2D.I._factory;
        var pos = Vector2.TEMP;
        factory.get_RigidBody_Position(this._box2DBody, pos);
        pos.setValue(pos.x, pos.y);
        factory.set_RigibBody_Transform(this._box2DBody, pos.x, pos.y, number);//重新给个setPos的接口
        factory.set_rigidBody_Awake(this._box2DBody, true);
        //}
        Physics2D.I._addRigidBody(this);
    }

    constructor() {
        super();
        this._type = "dynamic";
        this._massData = Physics2D.I._factory.createMassData();
    }

    /**
     * @internal
     * @en Synchronize the body type.
     * @zh 同步刚体类型。
     */
    _updateBodyType() {
        if (!this._box2DBody) return;
        Physics2D.I._factory.set_rigidBody_type(this._box2DBody, this._type)
        if (this.type == "static") {
            Physics2D.I._removeRigidBody(this);
        } else {
            Physics2D.I._addRigidBody(this);
        }
    }

    /** @internal */
    _globalChangeHandler(flag: number) {
        this._updatePhysicsTransformToRender();
    }

    protected _onAwake(): void {
        this.owner.globalTrans.cache = true;
    }

    /**
     * @zh 更新刚体结构体的数据
     * @returns 
     */
    private _setBodyDefValue(): void {
        // 兼容模式
        if (this._type == "static") {
            // 静态刚体这样设置
            let owner: Sprite = this.owner;
            this._bodyDef.position.setValue(owner.globalTrans.x, owner.globalTrans.y);
            this._bodyDef.angle = Utils.toRadian(owner.globalTrans.rotation);
            this._bodyDef.allowSleep = false;
            this._bodyDef.angularVelocity = 0;
            this._bodyDef.angularDamping = 0;
            this._bodyDef.linearDamping = 0;
            this._bodyDef.linearVelocity.setValue(0, 0);

            this._bodyDef.bullet = false;
            this._bodyDef.fixedRotation = false;
            this._bodyDef.gravityScale = 0;
            return;
        }

        let owner: Sprite = this.owner;
        this._bodyDef.position.setValue(owner.globalTrans.x, owner.globalTrans.y);
        this._bodyDef.angle = Utils.toRadian(owner.globalTrans.rotation);
        this._bodyDef.fixedRotation = !this._allowRotation;
        this._bodyDef.allowSleep = this._allowSleep;
        this._bodyDef.angularVelocity = this._angularVelocity;
        this._bodyDef.angularDamping = this._angularDamping;
        this._bodyDef.linearDamping = this._linearDamping;
        if (this._linearVelocity.x != 0 || this._linearVelocity.y != 0) {
            this._bodyDef.linearVelocity.setValue(this._linearVelocity.x, this._linearVelocity.y);
        }
        this._bodyDef.type = this._type;
        this._bodyDef.bullet = this._bullet;
        this._bodyDef.gravityScale = this._gravityScale;
        this._bodyDef.group = this.group;
    }

    /** @internal */
    _onEnable(): void {
        this.owner.globalTrans.cache = true;
        this._setBodyDefValue();
        super._onEnable();
        this._updateBodyType();
        if (this.applyOwnerColliderComponent) {
            this._colliders = this.owner.getComponents(ColliderBase) as ColliderBase[];
            this._colliders.forEach((collider) => {
                collider.createShape(this);
            });
        } else {
            //更新shapes
            this.shapes = this._shapes;
        }
        if (this.isConnectedJoint) {
            this.owner.event("bodyCreated");
            this.isConnectedJoint = false;
        }
    }

    /**
     * @en Get the box2DBody of the rigid body 
     * @returns box2DBody
     * @zh 获取刚体的box2DBody
     * @returns box2DBody
     */
    getBody() {
        if (!this._box2DBody) this._onAwake();
        return this._box2DBody;
    }

    /**
     * @internal
     * @en Synchronize physics coordinates to game coordinates. Called by the system.
     * @zh 同步物理坐标到游戏坐标，由系统调用。
     */
    _updatePhysicsTransformToRender(): void {
        if (this.type == "static") {
            return;
        }
        var factory = Physics2D.I._factory;
        if (Physics2D.I._factory.get_rigidBody_IsAwake(this._box2DBody)) {
            var pos = Vector2.TEMP;
            factory.get_RigidBody_Position(this._box2DBody, pos);
            pos.setValue(pos.x, pos.y);
            this.owner.globalTrans.setPos(pos.x, pos.y);
            this.owner.globalTrans.rotation = Utils.toAngle(factory.get_RigidBody_Angle(this._box2DBody));
        }
    }

    /**@internal */
    _onDisable(): void {
        //添加到物理世界
        Physics2D.I._removeRigidBody(this);
        super._onDisable();
    }

    /**@internal */
    _onDestroy(): void {
        Physics2D.I._removeRigidBody(this);
        //添加到物理世界
        this._box2DBody && Physics2D.I._factory.removeBody(this._physics2DManager.box2DWorld, this._box2DBody);
        super._onDestroy();
        Physics2D.I._factory.destroyData(this._massData);
        this._massData = null;
        this.owner.off(SpriteGlobalTransform.CHANGED, this, this._globalChangeHandler)
    }

    /**
     * @zh 获取刚体的自定义数据
     * @returns 自定义数据
     * @en Get custom data of rigid body
     * @returns custom data
     */
    getUserData(): any {
        if (!this._box2DBody) return;
        return Physics2D.I._factory.get_rigidBody_userData(this._box2DBody);
    }

    /**
     * @zh 获取刚体在世界坐标下某一点的线速度，比如刚体边缘的线速度(考虑旋转的影响)
     * @returns 线速度
     * @en Get the linear velocity of a rigid body at a certain point in the world coordinate system, such as the linear velocity of the edge of the rigid body (considering the influence of rotation)
     * @returns linearVelocity
     */
    getLinearVelocityFromWorldPoint(worldPoint: Vector2): Vector2 {
        if (!this._box2DBody) return _tempV0;
        let velocity: any = Physics2D.I._factory.get_rigidBody_linearVelocityFromWorldPoint(this._box2DBody, worldPoint);
        _tempV0.x = velocity.x;
        _tempV0.y = velocity.y;
        return _tempV0;
    }

    /**
     * @zh 获取刚体在局部坐标下某一点的线速度，比如刚体边缘的线速度(考虑旋转的影响)
     * @returns 线速度
     * @en Get the linear velocity of a point on a rigid body in local coordinates, such as the linear velocity of the edge of the rigid body (considering the influence of rotation)
     * @returns linearVelocity
     */
    getLinearVelocityFromLocalPoint(localPoint: Vector2): Vector2 {
        if (!this._box2DBody) return _tempV0;
        let velocity: any = Physics2D.I._factory.get_rigidBody_linearVelocityFromLocalPoint(this._box2DBody, localPoint);
        _tempV0.x = velocity.x;
        _tempV0.y = velocity.y;
        return _tempV0;
    }

    /**
     * @en Apply force to the rigid body.
     * @param position The point where the force is applied, such as {x: 100, y: 100}, in global coordinates.
     * @param force The force to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 对刚体施加力。
     * @param position 施加力的点，如 {x: 100, y: 100}，全局坐标。
     * @param force 施加的力，如 {x: 0.1, y: 0.1}。
     */
    applyForce(position: IV2, force: IV2): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidBody_applyForce(this._box2DBody, force, position);
    }

    /**
     * @en Apply force to the center of the rigid body to prevent object rotation.
     * @param force The force to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 从中心点对刚体施加力，防止对象旋转。
     * @param force 施加的力，如 {x: 0.1, y: 0.1}。
     */
    applyForceToCenter(force: IV2): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidBody_applyForceToCenter(this._box2DBody, force);
    }

    /**
     * @en Apply linear impulse. The added velocity impulse will be combined with the rigid body's original velocity to produce a new velocity.
     * @param position The point where the impulse is applied, such as {x: 100, y: 100}, in global coordinates.
     * @param impulse The velocity impulse to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度。
     * @param position 施加力的点，如 {x: 100, y: 100}，全局坐标。
     * @param impulse 施加的速度冲量，如 {x: 0.1, y: 0.1}。
     */
    applyLinearImpulse(position: IV2, impulse: IV2): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidbody_ApplyLinearImpulse(this._box2DBody, impulse, position);
    }

    /**
     * @en Apply linear impulse to the center. The added velocity impulse will be combined with the rigid body's original velocity to produce a new velocity.
     * @param impulse The velocity impulse to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度。
     * @param impulse 施加的速度冲量，如 {x: 0.1, y: 0.1}。
     */
    applyLinearImpulseToCenter(impulse: IV2): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidbody_ApplyLinearImpulseToCenter(this._box2DBody, impulse);
    }

    /**
     * @zh 施加角速度冲量
     * @param impulse 角速度冲量
     * @en Apply angular velocity impulse
     * @param impulse angular impulse
     */
    applyAngularImpulse(impulse: number): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidbody_ApplyAngularImpulse(this._box2DBody, impulse);
    }

    /**
     * @en Apply torque to the rigid body to make it rotate.
     * @param torque The torque to be applied.
     * @zh 对刚体施加扭矩，使其旋转。
     * @param torque 施加的扭矩。
     */
    applyTorque(torque: number): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.rigidbody_applyTorque(this._box2DBody, torque);
    }

    /**
     * @en Set the velocity, such as {x: 10, y: 10}.
     * @param velocity The velocity to be set.
     * @zh 设置速度，例如 {x: 10, y: 10}。
     * @param velocity 要设置的速度。
     */
    setVelocity(velocity: IV2): void {
        if (!this._box2DBody) return;
        Physics2D.I._factory.set_rigidBody_linearVelocity(this._box2DBody, velocity);
    }

    /**
     * @en Set the angle.
     * @param value The angle value in degrees.
     * @zh 设置角度。
     * @param value 角度值，单位为度。
     */
    setAngle(value: number): void {
        if (!this._box2DBody) return;
        var factory = Physics2D.I._factory;
        factory.set_RigibBody_Transform(this._box2DBody, this.owner.globalTrans.x, this.owner.globalTrans.y, value);
        factory.set_rigidBody_Awake(this._box2DBody, true);
    }

    /**
     * @en Get the mass of the rigid body.
     * @zh 获得刚体质量。
     */
    getMass(): number {
        return this._box2DBody ? Physics2D.I._factory.get_rigidBody_Mass(this._box2DBody) : 0;
    }

    /**
     * @en Get the offset of the center of mass relative to the node's (0, 0) point.
     * @zh 获得质心相对于节点 (0, 0) 点的位置偏移。
     */
    getCenter(): IV2 {
        let center = this._box2DBody ? Physics2D.I._factory.get_rigidBody_Center(this._box2DBody) : null;
        center.x = center.x;
        center.y = center.y;
        return center;
    }

    /**
     * @en Get the inertia of the rigid body.
     * @zh 获得刚体的惯性张量。
     * @returns 
     */
    getInertia(): number {
        if (!this._box2DBody) return this._inertia;
        return Physics2D.I._factory.get_rigidBody_Inertia(this._box2DBody);
    }

    /**
     * @en Get the world coordinates of the center of mass, relative to the Physics2D.I.worldRoot node.
     * @zh 获得质心的世界坐标，相对于 Physics2D.I.worldRoot 节点。
     */
    getWorldCenter(): IV2 {
        let center = this._box2DBody ? Physics2D.I._factory.get_rigidBody_WorldCenter(this._box2DBody) : null;
        center.x = center.x;
        center.y = center.y;
        return center;
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
     * @en Get the local coordinates relative to the body.
     * @param x The x-coordinate in pixels.
     * @param y The y-coordinate in pixels.
     * @zh 获得相对于 body 的本地坐标。
     * @param x 像素坐标的 x 值。
     * @param y 像素坐标的 y 值。
     */
    getLocalPoint(x: number, y: number): Readonly<Point> {
        return this.owner.globalTrans.globalToLocal(x, y);
    }
}