import { IV2, Vector2 } from "../maths/Vector2";
import { ColliderBase } from "./Collider2D/ColliderBase";
import { FixtureBox2DDef } from "./Collider2D/ColliderStructInfo";
import { Physics2DOption } from "./Physics2DOption";
import { RigidBody2DInfo } from "./RigidBody2DInfo";
import { physics2D_DistancJointDef } from "./joint/JointDefStructInfo";

export interface IPhysiscs2DFactory {
    box2d: any;
    world: any;
    velocityIterations: number;
    positionIterations: number;
    get gravity(): any;
    set gravity(value: Vector2);
    get allowSleeping(): boolean;
    set allowSleeping(value: boolean);
    get bodyCount(): number;
    get contactCount(): number;
    get jointCount(): number;
    initialize(): Promise<void>;
    start(options: Physics2DOption): void;
    update(delta: number): void;
    sendEvent(type: number, contact: any): void;
    createBody(def: any): any;
    removeBody(body: any): void;
    createJoint(def: any): any;
    removeJoint(joint: any): void;
    shiftOrigin(x: number, y: number): void;
    setDebugDraw(debugDraw: any): void;
    getJoint_userData(joint: any): any;
    getJoint_userData_destroy(joint: any): boolean;
    createDistanceJoint(defStruct: physics2D_DistancJointDef): any;
    set_DistanceJoint_length(joint: any, length: number): void;
    set_DistanceJoint_MaxLength(joint: any, length: number): void;
    set_DistanceJoint_MinLength(joint: any, length: number): void;
    set_DistanceJointStiffnessDamping(joint: any, bodyA: any, bodyB: any, steffness: number, damping: number): void;
    //GrerJoint TODO
    //MotorJoint TODO
    //MouseJoint TODO
    //PrismaticJoint TODO
    //PulleyJoint TODO
    //RevoluteJoint TODO
    //WeldJoint TODO
    //----------------Collider-------------------
    //BoxCollider
    create_boxColliderShape(): any;
    set_collider_SetAsBox(shape: any, x: number, y: number, pos: IV2): any
    //ChainCollider TODO
    //CircleCollider TODO
    //EdgeCollider TODO
    //PhysicsPolygonCollider TODO
    //----------------fixture-------------------
    createFixtureDef(fixtureDef: FixtureBox2DDef): any;
    set_fixtureDef_GroupIndex(def: any, groupIndex: number): void;
    set_fixtureDef_CategoryBits(def: any, categoryBits: number): void;
    set_fixtureDef_maskBits(def: any, maskbits: number): void;
    createfixture(body: any, def: any): void;
    set_fixture_collider(fixture: any, instance: ColliderBase): void
    get_fixture_body(fixture: any): any;
    destroy_fixture(fixture: any): any;
    //----------------RigidBody-------------------   
    rigidBody_DestroyFixture(body: any, fixture: any): any;
    rigidBodyDef_Create(rigidbodyDef: RigidBody2DInfo): any;
    get_RigidBody_Position(body: any, v2: Vector2): void;
    get_RigidBody_Angle(body: any): number;
    set_RigidBody_Angle(body: any, angle: any): void;
    set_RigidBody_PositionXY(body: any, x: number, y: number): void;
    rigidBody_applyForce(body: any, force: IV2, position: IV2): void;
    rigidBody_applyForceToCenter(body: any, force: IV2): void;
    rigidbody_ApplyLinearImpulse(body: any, impulse: IV2, position: IV2): void;
    rigidbody_ApplyLinearImpulseToCenter(body: any, impulse: IV2): void;
    rigidbody_applyTorque(body: any, torque: number): void;
    set_rigidbody_Velocity(body: any, velocity: IV2): void;
    set_rigidbody_Awake(body: any, awake: boolean): void;
    get_rigidbody_Mass(body: any): number;
    get_rigidBody_Center(body: any): IV2;
    get_rigidBody_IsAwake(body: any): boolean;
    get_rigidBody_WorldCenter(body: any): IV2;
    set_rigidBody_type(body: any, value: string): void;
    set_rigidBody_gravityScale(body: any, value: number): void;
    set_rigidBody_allowRotation(body: any, value: boolean): void;
    set_rigidBody_allowSleep(body: any, value: boolean): void;
    set_rigidBody_angularDamping(body: any, value: number): void;
    get_rigidBody_angularVelocity(body: any): number;
    set_rigidBody_angularVelocity(body: any, value: number): void;
    set_rigidBody_linearDamping(body: any, value: number): void;
    get_rigidBody_linearVelocity(body: any): IV2;
    set_rigidBody_linearVelocity(body: any, value: IV2): void;
    set_rigidBody_bullet(body: any, value: boolean): void;

}