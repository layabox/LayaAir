import { IV2, Vector2 } from "../maths/Vector2";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { FixtureBox2DDef } from "./Collider2D/ColliderStructInfo";
import { IPhysiscs2DFactory } from "./IPhysiscs2DFactory";
import { Physics } from "./Physics";
import { Physics2DOption } from "./Physics2DOption";
import { RigidBody2DInfo } from "./RigidBody2DInfo";
import { physics2D_DistancJointDef } from "./joint/JointDefStructInfo"

export class physics2DJSFactory implements IPhysiscs2DFactory {

    /**box2D Engine */
    box2d: any;

    /**box2D world */
    world: any;

    /**旋转迭代次数，增大数字会提高精度，但是会降低性能*/
    velocityIterations: number = 8;

    /**位置迭代次数，增大数字会提高精度，但是会降低性能*/
    positionIterations: number = 3;

    /**
     * 物理世界重力环境，默认值为{x:0,y:1}
     * 如果修改y方向重力方向向上，可以直接设置gravity.y=-1;
     */
    get gravity(): any {
        return this.world.GetGravity();
    }

    set gravity(value: Vector2) {
        var gravity: any = new this.box2d.b2Vec2(value.x, value.y);//TODO 全局设置，不必New
        this.world.SetGravity(gravity);
    }

    /**
     * 设置是否允许休眠，休眠可以提高稳定性和性能，但通常会牺牲准确性
     */
    get allowSleeping(): boolean {
        return this.world.GetAllowSleeping();
    }

    set allowSleeping(value: boolean) {
        this.world.SetAllowSleeping(value);
    }


    /**获得刚体总数量*/
    get bodyCount(): number {
        return this.world.GetBodyCount();
    }

    /**获得碰撞总数量*/
    get contactCount(): number {
        return this.world.GetContactCount();
    }

    /**获得关节总数量*/
    get jointCount(): number {
        return this.world.GetJointCount();
    }

    /**
     * initial box2D physics Engine
     * @returns 
     */
    initialize(): Promise<void> {
        this.box2d = (<any>window).box2d;
        Physics.I._factory = this;
        return Promise.resolve();
    }

    /**
     * create Box2D world
     * @param options 
     */
    start(options: Physics2DOption) {
        var gravity: any = new this.box2d.b2Vec2(options.gravity.x, options.gravity.y);
        this.world = new this.box2d.b2World(gravity);
        this.world.SetDestructionListener(new DestructionListener());
        this.world.SetContactListener(new ContactListener());
        options.allowSleeping == null ? true : options.allowSleeping;
        this.velocityIterations = options.velocityIterations;
        this.positionIterations = options.positionIterations;
    }

    /**
     * update Frame
     * @param delta 
     */
    update(delta: number): void {

        //set Physics Position from Engine TODO

        this.world.Step(delta, this.velocityIterations, this.positionIterations, 3);

        //set engine Position from Phyiscs TODO
    }

    /**
     * set Event CallBack
     * @param type 
     * @param contact 
     */
    sendEvent(type: number, contact: any): void {
        var colliderA: any = contact.GetFixtureA().collider;
        var colliderB: any = contact.GetFixtureB().collider;
        var ownerA: any = colliderA.owner;
        var ownerB: any = colliderB.owner;
        contact.getHitInfo = function (): any {
            var manifold: any = new this.box2d.b2WorldManifold();
            this.GetWorldManifold(manifold);
            //第一点？
            var p: any = manifold.points[0];
            p.x *= Physics.PIXEL_RATIO;
            p.y *= Physics.PIXEL_RATIO;
            return manifold;
        }
        if (ownerA) {
            var args: any[] = [colliderB, colliderA, contact];
            if (type === 0) {
                ownerA.event("triggerenter", args);
                if (!ownerA["_triggered"]) {
                    ownerA["_triggered"] = true;
                } else {
                    ownerA.event("triggerstay", args);
                }
            } else {
                ownerA["_triggered"] = false;
                ownerA.event("triggerexit", args);
            }
        }
        if (ownerB) {
            args = [colliderA, colliderB, contact];
            if (type === 0) {
                ownerB.event("triggerenter", args);
                if (!ownerB["_triggered"]) {
                    ownerB["_triggered"] = true;
                } else {
                    ownerB.event("triggerstay", args);
                }
            } else {
                ownerB["_triggered"] = false;
                ownerB.event("triggerexit", args);
            }
        }
    }

    /**
     * create Box2D Body
     * @param def 
     * @returns 
     */
    createBody(def: any) {
        if (!def) {
            //creat null RigidBody
            new (<any>window).box2d.b2BodyDef()
        }
        if (this.world) {
            return this.world.CreateBody(def);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * remove Box2D Body
     * @param body 
     */
    removeBody(body: any): void {
        if (this.world) {
            this.world.DestroyBody(body);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }

    /**
     * create Box2D Joint
     * @param def 
     * @returns 
     */
    createJoint(def: any): any {
        if (this.world) {
            let joint = this.world.CreateJoint(def);
            joint.m_userData = {};
            joint.m_userData.isDestroy = false;
            return joint;
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
            return null;
        }
    }

    /**
     * Remove Box2D Joint
     * @param joint 
     */
    removeJoint(joint: any): void {
        if (this.world) {
            this.world.DestroyJoint(joint);
        } else {
            console.error('The physical engine should be initialized first.use "Physics.enable()"');
        }
    }

    /**
     * move center of world
     * @param x 
     * @param y 
     */
    shiftOrigin(x: number, y: number) {
        this.world.ShiftOrigin({ x: x, y: y });
    }

    setDebugDraw(debugDraw: any) {
        debugDraw.world = this.world;
        this.world.setDebugDraw(debugDraw);
    }

    //Joint Function
    getJoint_userData(joint: any) {
        return joint.m_userData;
    }

    getJoint_userData_destroy(joint: any): boolean {
        return joint.m_userData.isDestroy;
    }

    //DistanceJoint
    private _tempDistanceJointDef: any;
    /**
     * create Distance Joint
     * @param defStruct 
     */
    createDistanceJoint(defStruct: physics2D_DistancJointDef) {
        this._tempDistanceJointDef || (this._tempDistanceJointDef = new this.box2d.b2DistanceJointDef());
        var def = this._tempDistanceJointDef;
        def.bodyA = defStruct.bodyA;
        def.bodyB = defStruct.bodyB;
        def.localAnchorA.Set(defStruct.localAnchorA.x, defStruct.localAnchorA.y);
        def.localAnchorB.Set(defStruct.localAnchorB.x, defStruct.localAnchorB.y);
        this.box2d.b2LinearStiffness(def, defStruct.frequency, defStruct.dampingRatio, def.bodyA, def.bodyB);
        def.collideConnected = defStruct.collideConnected;
        var p1: any = def.bodyA.GetWorldPoint(def.localAnchorA, new this.box2d.b2Vec2());
        var p2: any = def.bodyB.GetWorldPoint(def.localAnchorB, new this.box2d.b2Vec2());
        def.length = defStruct.length || this.box2d.b2Vec2.SubVV(p2, p1, new this.box2d.b2Vec2()).Length();
        def.maxLength = this.box2d.b2_maxFloat;
        def.minLength = 0;
        if (defStruct.maxLength >= 0)
            def.maxLength = defStruct.maxLength;
        if (defStruct.minLength >= 0)
            def.minLength = defStruct.minLength;
        return this.createJoint(def);
    }

    set_DistanceJoint_length(joint: any, length: number) {
        joint.SetLength(length);
    }

    set_DistanceJoint_MaxLength(joint: any, length: number) {
        joint.SetMaxLength(length);
    }

    set_DistanceJoint_MinLength(joint: any, length: number) {
        joint.SetMinLength(length);
    }

    set_DistanceJointStiffnessDamping(joint: any, bodyA: any, bodyB: any, steffness: number, damping: number) {
        let out: any = {};
        this.box2d.b2LinearStiffness(out, steffness, damping, bodyA, bodyB);
        joint.SetStiffness(out.stiffness);
        joint.SetDamping(out.damping);
    }

    //GrerJoint TODO
    //MotorJoint TODO
    //MouseJoint TODO
    //PrismaticJoint TODO
    //PulleyJoint TODO
    //RevoluteJoint TODO
    //WeldJoint TODO

    //----------------Collider-------------------
    //BoxCollider
    create_boxColliderShape() {
        return new this.box2d.b2PolygonShape();
    }

    set_collider_SetAsBox(shape: any, x: number, y: number, pos: IV2) {
        shape.SetAsBox(x, y, pos);
    }

    //ChainCollider TODO
    //CircleCollider TODO
    //EdgeCollider TODO
    //PhysicsPolygonCollider TODO

    //----------------fixture-------------------
    /**
     * create fixture descript
     * @param fixtureDef 
     * @returns 
     */
    createFixtureDef(fixtureDef: FixtureBox2DDef) {
        var def: any = new (<any>window).box2d.b2FixtureDef();
        def.density = fixtureDef.density;
        def.friction = fixtureDef.friction;
        def.isSensor = fixtureDef.isSensor;
        def.restitution = fixtureDef.restitution;
        def.shape = fixtureDef.shape;
        return def
    }

    set_fixtureDef_GroupIndex(def: any, groupIndex: number) {
        def.filter.groupIndex = groupIndex;
    }

    set_fixtureDef_CategoryBits(def: any, categoryBits: number) {
        def.filter.categoryBits = categoryBits;
    }

    set_fixtureDef_maskBits(def: any, maskbits: number) {
        def.filter.maskBits = maskbits;
    }

    /**
     * create fixture by body and def
     * @param body 
     * @param def 
     */
    createfixture(body: any, def: any) {
        body.CreateFixture(def);
    }

    set_fixture_collider(fixture: any, instance: ColliderBase) {
        fixture.collider = instance;
    }

    get_fixture_body(fixture: any): any {
        return fixture.GetBody()
    }

    destroy_fixture(fixture: any) {
        fixture.Destroy();
    }

    //----------------RigidBody-------------------
    rigidBody_DestroyFixture(body: any, fixture: any) {
        body.DestroyFixture(fixture);
    }

    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any {
        var def: any = new this.box2d.b2BodyDef();
        def.position.Set(rigidbodyDef.position.x, rigidbodyDef.position.y);
        def.angle = rigidbodyDef.angle;
        def.allowSleep = rigidbodyDef.allowSleep;
        def.angularDamping = rigidbodyDef.angularDamping;
        def.angularVelocity = rigidbodyDef.angularVelocity;
        def.bullet = rigidbodyDef.bullet;
        def.fixedRotation = rigidbodyDef.fixedRotation;
        def.gravityScale = rigidbodyDef.gravityScale;
        def.linearDamping = rigidbodyDef.linearDamping;
        def.linearVelocity = new this.box2d.b2Vec2(rigidbodyDef.linearVelocity.x, rigidbodyDef.linearVelocity.y);
        def.type = this.box2d.b2BodyType["b2_" + rigidbodyDef.type + "Body"];
        return this.createBody(def);
    }

    get_RigidBody_Position(body: any, v2: Vector2) {
        var pos: any = body.GetPosition();
        v2.setValue(pos.x, pos.y);
    }

    get_RigidBody_Angle(body: any) {
        return body.GetAngle();
    }

    set_RigidBody_Angle(body: any, angle: any) {
        body.SetAngle(angle);
    }

    set_RigidBody_PositionXY(body: any, x: number, y: number) {
        body.SetPositionXY(x, y);
    }

    rigidBody_applyForce(body: any, force: IV2, position: IV2) {
        body.ApplyForce(force, position);
    }

    rigidBody_applyForceToCenter(body: any, force: IV2) {
        body.ApplyForceToCenter(force);
    }

    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2) {
        body.ApplyLinearImpulse(impulse, position);
    }

    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2) {
        body.ApplyLinearImpulseToCenter(impulse);
    }

    /**
    * 对刚体施加扭矩，使其旋转
    * @param	torque	施加的扭矩
    */
    rigidbody_applyTorque(body: any, torque: number): void {
        body.ApplyTorque(torque);
    }

    /**
     * 设置速度，比如{x:10,y:10}
     * @param	velocity
     */
    set_rigidbody_Velocity(body: any, velocity: IV2): void {
        body.SetLinearVelocity(velocity);
    }

    /**
     * 设置角度
     * @param	value 单位为弧度
     */
    set_rigidbody_Awake(body: any, awake: boolean): void {
        body.SetAwake(awake);
    }

    /**获得刚体质量*/
    get_rigidbody_Mass(body: any): number {
        return body.GetMass();
    }

    /**
     * 获得质心的相对节点0,0点的位置偏移
     */
    get_rigidBody_Center(body: any): IV2 {
        return body.GetLocalCenter();
    }

    get_rigidBody_IsAwake(body: any) {
        return body.IsAwake();
    }

    /**
     * 获得质心的世界坐标，相对于Physics.I.worldRoot节点
     */
    get_rigidBody_WorldCenter(body: any): IV2 {
        return body.GetWorldCenter();
    }

    set_rigidBody_type(body: any, value: string) {

        body.SetType(this.box2d.b2BodyType["b2_" + value + "Body"]);
    }

    set_rigidBody_gravityScale(body: any, value: number) {
        body.SetGravityScale(value);
    }

    set_rigidBody_allowRotation(body: any, value: boolean) {
        body.SetFixedRotation(!value);
    }

    set_rigidBody_allowSleep(body: any, value: boolean) {
        body.SetSleepingAllowed(value);
    }

    set_rigidBody_angularDamping(body: any, value: number) {
        body.SetAngularDamping(value);
    }

    get_rigidBody_angularVelocity(body: any): number {
        return body.GetAngularVelocity();
    }

    set_rigidBody_angularVelocity(body: any, value: number) {
        body.SetAngularVelocity(value);
    }

    set_rigidBody_linearDamping(body: any, value: number) {
        body.SetLinearDamping(value);
    }

    /**线性运动速度，比如{x:5,y:5}*/
    get_rigidBody_linearVelocity(body: any): IV2 {
        return body.GetLinearVelocity();
    }

    set_rigidBody_linearVelocity(body: any, value: IV2) {
        body.SetLinearVelocity(new (<any>window).box2d.b2Vec2(value.x, value.y));
    }

    set_rigidBody_bullet(body: any, value: boolean) {
        body.SetBullet(value);
    }
}

/**@private */
class ContactListener {
    BeginContact(contact: any): void {
        Physics.I._eventList.push(0, contact);
        //console.log("BeginContact", contact);	
    }

    EndContact(contact: any): void {
        Physics.I._eventList.push(1, contact);
        //console.log("EndContact", contact);
    }

    PreSolve(contact: any, oldManifold: any): void {
        //console.log("PreSolve", contact);
    }

    PostSolve(contact: any, impulse: any): void {
        //console.log("PostSolve", contact);
    }
}


/** 
 * JS实现Box2D SayGoodbyeParticle
 * 相关类型对象被隐性移除时触发对应的SayGoodBye方法
 */
export class DestructionListener {
    /**
     * Joint被隐性移除时触发
     * @param params box2d的Joint相关对象
     */
    public SayGoodbyeJoint(params: any): void {
        params.m_userData && (params.m_userData.isDestroy = true);
    }
    /**
     * Fixtures被隐性移除时触发
     * @param params box2d的Fixtures相关对象
     */
    public SayGoodbyeFixture(params: any): void {

    }
    /**
     * ParticleGroup被隐性移除时触发
     * @param params box2d的ParticleGroup相关对象
     */
    public SayGoodbyeParticleGroup(params: any): void {

    }
    /**
     * Particle被隐性移除时触发
     * @param params box2d的Particle相关对象
     */
    public SayGoodbyeParticle(params: any): void {

    }
}
