import { ColliderBase } from "./Collider2D/ColliderBase";
import { Component } from "../components/Component"
import { Sprite } from "..//display/Sprite"
import { Point } from "../maths/Point"
import { Utils } from "../utils/Utils"
import { Physics2D } from "./Physics2D";
import { IV2, Vector2 } from "../maths/Vector2";
import { RigidBody2DInfo } from "./IPhysiscs2DFactory";

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
export class RigidBody extends Component {

    /**@internal 用于判断节点属性更改时更新物理属性*/
    private static changeFlag: number = Sprite.Sprite_GlobalDeltaFlage_Position_X | Sprite.Sprite_GlobalDeltaFlage_Position_Y | Sprite.Sprite_GlobalDeltaFlage_Rotation | Sprite.Sprite_GlobalDeltaFlage_Scale_X | Sprite.Sprite_GlobalDeltaFlage_Scale_Y

    /**
     * @internal
     * @en The type of rigidbody, supports three types: static, dynamic and kinematic, default is dynamic.
     * static: Static type, motionless, not affected by gravity, mass is infinitely large, can be controlled by node movement, rotation, and scaling.
     * dynamic: Dynamic type, affected by gravity.
     * kinematic: Kinematic type, not affected by gravity, can be moved by applying acceleration or force.
     * @zh 刚体类型，支持三种类型：static，dynamic 和 kinematic，默认为 dynamic 类型。
     * static：静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动，旋转，缩放进行控制。
     * dynamic：动态类型，受重力影响。
     * kinematic：运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动。
     */
    protected _type: string = "dynamic";

    /**@internal 是否允许休眠，允许休眠能提高性能*/
    protected _allowSleep: boolean = true;

    /**@internal 角速度，设置会导致旋转*/
    protected _angularVelocity: number = 0;

    /**@internal 旋转速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _angularDamping: number = 0;

    /**@internal 线性运动速度，比如{x:10,y:10}*/
    protected _linearVelocity: any = { x: 0, y: 0 };

    /**@internal 线性速度阻尼系数，范围可以在0到无穷大之间，0表示没有阻尼，无穷大表示满阻尼，通常阻尼的值应该在0到0.1之间*/
    protected _linearDamping: number = 0;

    /**@internal 是否高速移动的物体，设置为true，可以防止高速穿透*/
    protected _bullet: boolean = false;

    /**@internal 是否允许旋转，如果不希望刚体旋转，这设置为false*/
    protected _allowRotation: boolean = true;

    /**@internal 重力缩放系数，设置为0为没有重力*/
    protected _gravityScale: number = 1;

    /**@internal 原始刚体*/
    protected _body: any;

    /**
     * @en [Read-only] Specifies the collision group to which the body belongs, default is 0, the collision rules are as follows:
     * 1. If the group values of two objects are equal:
     *    - If the group value is greater than zero, they will always collide.
     *    - If the group value is less than zero, they will never collide.
     *    - If the group value is equal to 0, then rule 3 is used.
     * 2. If the group values are not equal, then rule 3 is used.
     * 3. Each rigidbody has a category, this property receives a bit field, the range is the power of 2 in the range of [1,2^31].
     * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
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
     * @en [Read-only] Collision category, specified using powers of 2, with 32 different collision categories available.
     * @zh [只读] 碰撞类别，使用2的幂次方值指定，有32种不同的碰撞类别可用。
     */
    category: number = 1;

    /**
     * @en [Read-only] Specifies the category of collision bit mask, the result of category bitwise operation.
     * Each rigidbody also has a mask category, which specifies the sum of the category values it collides with (the value is the result of bitwise AND of all categories).
     * @zh [只读] 指定冲突位掩码碰撞的类别，category 位操作的结果。
     * 每个刚体也都有一个 mask 类别，指定与其碰撞的类别值之和（值是所有 category 按位 AND 的值）。
     */
    mask: number = -1;

    /**
     * @en [Read-only] Custom label.
     * @zh [只读] 自定义标签。
     */
    label: string = "RigidBody";

    /**
     * @en The original body object.
     * @zh 原始body对象。
     */
    get body(): any {
        if (!this._body) this._onAwake();
        return this._body;
    }

    /**
     * @en The type of the rigid body. Supports three types: static, dynamic, and kinematic.
     * - static: Static type, stays still, not affected by gravity, has infinite mass, can be controlled by moving, rotating, and scaling the node.
     * - dynamic: Dynamic type, affected by gravity.
     * - kinematic: Kinematic type, not affected by gravity, can be moved by applying velocity or force.
     * @zh 刚体类型，支持三种类型：static、dynamic 和 kinematic。
     * - static：静态类型，静止不动，不受重力影响，质量无限大，可以通过节点移动、旋转、缩放进行控制。
     * - dynamic：动态类型，受重力影响。
     * - kinematic：运动类型，不受重力影响，可以通过施加速度或者力的方式使其运动。
     */
    get type(): string {
        return this._type;
    }

    set type(value: string) {
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
        if (this._body) Physics2D.I._factory.set_rigidBody_gravityScale(this._body, value);
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
        if (this._body) Physics2D.I._factory.set_rigidBody_allowRotation(this._body, !value);
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
        if (this._body) Physics2D.I._factory.set_rigidBody_allowSleep(this._body, value);
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
        if (this._body) Physics2D.I._factory.set_rigidBody_angularDamping(this._body, value);
    }

    /**
     * @en The angular velocity. Setting it will cause rotation.
     * @zh 角速度，设置会导致旋转。
     */
    get angularVelocity(): number {
        if (this._body) return Physics2D.I._factory.get_rigidBody_angularVelocity(this._body);
        return this._angularVelocity;
    }

    set angularVelocity(value: number) {
        this._angularVelocity = value;
        if (this._type == "static") {
            return;
        }
        if (this._body) Physics2D.I._factory.set_rigidBody_angularVelocity(this.body, value);
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
        if (this._body) Physics2D.I._factory.set_rigidBody_linearDamping(this._body, value);
    }

    /**
     * @en The linear velocity, such as {x: 5, y: 5}.
     * @zh 线性运动速度，例如 {x: 5, y: 5}。
     */
    get linearVelocity(): IV2 {
        if (this._body) {
            var vec: IV2 = Physics2D.I._factory.get_rigidBody_linearVelocity(this._body);
            return { x: vec.x, y: vec.y };
        }
        return this._linearVelocity;
    }

    set linearVelocity(value: any) {
        if (!value) return;
        if (value instanceof Array) {
            value = { x: value[0], y: value[1] };
        }
        this._linearVelocity = value;
        if (this._type == "static") {
            return;
        }
        if (this._body) Physics2D.I._factory.set_rigidBody_linearVelocity(this._body, value);
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
        if (this._body) Physics2D.I._factory.set_rigidBody_bullet(this._body, value);
    }

    /**@internal*/
    _createBody(): void {
        if (this._body || !this.owner) return;
        let factory = Physics2D.I._factory;
        var sp: Sprite = (<Sprite>this.owner);
        var defRigidBodyDef = new RigidBody2DInfo();
        defRigidBodyDef.position.setValue(sp.globalPosX, sp.globalPosY);
        defRigidBodyDef.angle = Utils.toRadian(sp.globalRotation);
        defRigidBodyDef.allowSleep = this._allowSleep;
        defRigidBodyDef.angularDamping = this._angularDamping;

        defRigidBodyDef.bullet = this._bullet;
        defRigidBodyDef.fixedRotation = !this._allowRotation;
        defRigidBodyDef.gravityScale = this._gravityScale;
        defRigidBodyDef.linearDamping = this._linearDamping;
        defRigidBodyDef.group = this.group;
        var obj: any = this._linearVelocity;
        defRigidBodyDef.type = this._type;
        if (this._type == "static") {
            defRigidBodyDef.angularVelocity = 0;
            defRigidBodyDef.linearVelocity.setValue(0, 0);
        } else {
            defRigidBodyDef.angularVelocity = this._angularVelocity;
            if (obj && obj.x != 0 || obj.y != 0) {
                defRigidBodyDef.linearVelocity.setValue(obj.x, obj.y);
            }
        }

        this._body = factory.rigidBodyDef_Create(defRigidBodyDef);
        this._needrefeshShape();
        this._updateBodyType()
    }

    /**
     * @internal
     * @en Synchronize the body type.
     * @zh 同步刚体类型。
     */
    _updateBodyType() {
        if (!this._body) return;
        Physics2D.I._factory.set_rigidBody_type(this.body, this._type)
        if (this.type == "static") {
            Physics2D.I._removeRigidBody(this)
        } else {
            Physics2D.I._addRigidBody(this)
        }
    }


    /** @internal */
    _globalChangeHandler(flag: number) {
        if (flag & RigidBody.changeFlag) this._needrefeshShape();
    }

    /** @internal */
    _onEnable(): void {
        (<Sprite>this.owner).cacheGlobal = true;
        this._createBody();
        Physics2D.I._factory.set_RigibBody_Enable(this._body, true);
        this.owner.on("GlobaChange", this, this._globalChangeHandler);
    }

    /**
     * @internal
     * @en Notify that the object attributes need to be updated in the next frame.
     * @zh 通知需要更新对象属性；下一帧执行。
     */
    _needrefeshShape() {
        Physics2D.I._updataRigidBodyAttribute(this);
    }

    /**
     * @internal
     * @en Synchronize node coordinates and rotation to the physics world. Called by the system.
     * @zh 同步节点坐标及旋转到物理世界，由系统调用。
     */
    _updatePhysicsAttribute(): void {
        var factory = Physics2D.I._factory;
        var sp: Sprite = (<Sprite>this.owner);
        factory.set_RigibBody_Transform(this._body, sp.globalPosX, sp.globalPosY, Utils.toRadian((<Sprite>this.owner).globalRotation));
        var comps: any[] = this.owner.getComponents(ColliderBase);
        if (comps) {
            for (var i: number = 0, n: number = comps.length; i < n; i++) {
                var collider: ColliderBase = comps[i];
                collider.rigidBody = this;
                collider._refresh();
            }
            factory.retSet_rigidBody_MassData(this._body);
            factory.set_rigidbody_Awake(this._body, true);
            this.owner.event("shapeChange");
        }
        
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
        if (Physics2D.I._factory.get_rigidBody_IsAwake(this._body)) {
            var pos = Vector2.TempVector2;
            factory.get_RigidBody_Position(this.body, pos);
            var sp: Sprite = (<Sprite>this.owner);
            sp.setGlobalPos(pos.x, pos.y);
            sp.globalRotation = Utils.toAngle(factory.get_RigidBody_Angle(this.body));
        }
    }

    /**@internal */
    _onDisable(): void {
        Physics2D.I._removeRigidBody(this);
        Physics2D.I._removeRigidBodyAttribute(this);
        this.owner.off("GlobaChange", this, this._globalChangeHandler)
        //添加到物理世界
        Physics2D.I._factory.set_RigibBody_Enable(this._body, false);
    }

    /**@internal */
    _onDestroy(): void {
        Physics2D.I._removeRigidBody(this);
        Physics2D.I._removeRigidBodyAttribute(this);
        this.owner.off("GlobaChange", this, this._globalChangeHandler)
        //添加到物理世界
        this._body && Physics2D.I._factory.removeBody(this._body);
        this._body = null;
    }

    /**@internal */
    _getOriBody(): any {
        return this._body;
    }

    /**
     * @en Get the original body object.
     * @zh 获得原始 body 对象。
     */
    getBody(): any {
        if (!this._body) this._onAwake();
        return this._body;
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
        if (!this._body) this._onAwake();
        Physics2D.I._factory.rigidBody_applyForce(this._body, force, position);
    }

    /**
     * @en Apply force to the center of the rigid body to prevent object rotation.
     * @param force The force to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 从中心点对刚体施加力，防止对象旋转。
     * @param force 施加的力，如 {x: 0.1, y: 0.1}。
     */
    applyForceToCenter(force: IV2): void {
        if (!this._body) this._onAwake();
        Physics2D.I._factory.rigidBody_applyForceToCenter(this._body, force);
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
        if (!this._body) this._onAwake();
        Physics2D.I._factory.rigidbody_ApplyLinearImpulse(this._body, impulse, position);
    }

    /**
     * @en Apply linear impulse to the center. The added velocity impulse will be combined with the rigid body's original velocity to produce a new velocity.
     * @param impulse The velocity impulse to be applied, such as {x: 0.1, y: 0.1}.
     * @zh 施加速度冲量，添加的速度冲量会与刚体原有的速度叠加，产生新的速度。
     * @param impulse 施加的速度冲量，如 {x: 0.1, y: 0.1}。
     */
    applyLinearImpulseToCenter(impulse: IV2): void {
        if (!this._body) this._onAwake();
        Physics2D.I._factory.rigidbody_ApplyLinearImpulseToCenter(this._body, impulse);
    }

    /**
     * @en Apply torque to the rigid body to make it rotate.
     * @param torque The torque to be applied.
     * @zh 对刚体施加扭矩，使其旋转。
     * @param torque 施加的扭矩。
     */
    applyTorque(torque: number): void {
        if (!this._body) this._onAwake();
        Physics2D.I._factory.rigidbody_applyTorque(this._body, torque);
    }

    /**
     * @en Set the velocity, such as {x: 10, y: 10}.
     * @param velocity The velocity to be set.
     * @zh 设置速度，例如 {x: 10, y: 10}。
     * @param velocity 要设置的速度。
     */
    setVelocity(velocity: IV2): void {
        if (!this._body) this._onAwake();
        Physics2D.I._factory.set_rigidBody_linearVelocity(this._body, velocity);
    }

    /**
     * @en Set the angle.
     * @param value The angle value in degrees.
     * @zh 设置角度。
     * @param value 角度值，单位为度。
     */
    setAngle(value: any): void {
        if (!this._body) this._onAwake();
        var factory = Physics2D.I._factory;
        var sp: Sprite = (<Sprite>this.owner);
        factory.set_RigibBody_Transform(this._body, sp.globalPosX, sp.globalPosY, value);
        factory.set_rigidbody_Awake(this._body, true);
    }

    /**
     * @en Get the mass of the rigid body.
     * @zh 获得刚体质量。
     */
    getMass(): number {
        return this._body ? Physics2D.I._factory.get_rigidbody_Mass(this._body) : 0;
    }

    /**
     * @en Get the offset of the center of mass relative to the node's (0, 0) point.
     * @zh 获得质心相对于节点 (0, 0) 点的位置偏移。
     */
    getCenter(): IV2 {
        if (!this._body) this._onAwake();
        return Physics2D.I._factory.get_rigidBody_Center(this._body);
    }

    /**
     * @en Get the world coordinates of the center of mass, relative to the Physics2D.I.worldRoot node.
     * @zh 获得质心的世界坐标，相对于 Physics2D.I.worldRoot 节点。
     */
    getWorldCenter(): IV2 {
        if (!this._body) this._onAwake();
        return Physics2D.I._factory.get_rigidBody_WorldCenter(this._body);
    }

    /**
     * @en Get the world coordinates relative to the body.
     * @param x The x-coordinate in pixels.
     * @param y The y-coordinate in pixels.
     * @zh 获得相对于 body 的世界坐标。
     * @param x 像素坐标的 x 值。
     * @param y 像素坐标的 y 值。
     */
    getWorldPoint(x: number, y: number): Point {
        return (<Sprite>this.owner)._getGlobalCacheLocalToGlobal(x, y);
    }

    /**
     * @en Get the local coordinates relative to the body.
     * @param x The x-coordinate in pixels.
     * @param y The y-coordinate in pixels.
     * @zh 获得相对于 body 的本地坐标。
     * @param x 像素坐标的 x 值。
     * @param y 像素坐标的 y 值。
     */
    getLocalPoint(x: number, y: number): Point {
        return (<Sprite>this.owner)._getGlobalCacheGlobalToLocal(x, y);
    }
}