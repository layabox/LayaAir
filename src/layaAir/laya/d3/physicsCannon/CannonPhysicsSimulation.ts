import { Sprite3D } from "../core/Sprite3D";
import { Ray } from "../math/Ray";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { CannonPhysicsUpdateList } from "./CannonPhysicsUpdateList";
import { CannonCollision } from "./CannonCollision";
import { CannonCollisionTool } from "./CannonCollisionTool";
import { CannonContactPoint } from "./CannonContactPoint";
import { CannonHitResult } from "./CannonHitResult";
import { CannonPhysicsCollider } from "./CannonPhysicsCollider";
import { CannonPhysicsComponent } from "./CannonPhysicsComponent";
import { CannonPhysicsSettings } from "./CannonPhysicsSettings";
import { CannonRigidbody3D } from "./CannonRigidbody3D";
import { Event } from "../../events/Event";
import { NodeFlags } from "../../Const";

/**
 * <code>Simulation</code> 类用于创建物理模拟器。
 */
export class CannonPhysicsSimulation {
    /** @internal */
    static PHYSICSENGINEFLAGS_NONE: number = 0x0;
    /** @internal */
    static PHYSICSENGINEFLAGS_COLLISIONSONLY: number = 0x1;
    /** @internal */
    static PHYSICSENGINEFLAGS_SOFTBODYSUPPORT: number = 0x2;
    /** @internal */
    static PHYSICSENGINEFLAGS_MULTITHREADED: number = 0x4;
    /** @internal */
    static PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE: number = 0x8;

    /** @internal */
    static SOLVERMODE_RANDMIZE_ORDER: number = 1;
    /** @internal */
    static SOLVERMODE_FRICTION_SEPARATE: number = 2;
    /** @internal */
    static SOLVERMODE_USE_WARMSTARTING: number = 4;
    /** @internal */
    static SOLVERMODE_USE_2_FRICTION_DIRECTIONS: number = 16;
    /** @internal */
    static SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING: number = 32;
    /** @internal */
    static SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION: number = 64;
    /** @internal */
    static SOLVERMODE_CACHE_FRIENDLY: number = 128;
    /** @internal */
    static SOLVERMODE_SIMD: number = 256;
    /** @internal */
    static SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS: number = 512;
    /** @internal */
    static SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS: number = 1024;

    /** @internal */
    private static _btTempVector30: CANNON.Vec3;
    /** @internal */
    private static _btTempVector31: CANNON.Vec3;
    /** @internal */
    private static _tempVector30: Vector3 = new Vector3();

    private static _cannonPhysicsSimulation: CannonPhysicsSimulation;

    /*是否禁用所有模拟器。*/
    static disableSimulation: boolean = false;

    private _updateCount = 0;

    /**
    * @internal
    */
    static __init__(): void {
        CannonPhysicsSimulation._btTempVector30 = new CANNON.Vec3(0, 0, 0);
        CannonPhysicsSimulation._btTempVector31 = new CANNON.Vec3(0, 0, 0);;
    }

    /**
     * 创建限制刚体运动的约束条件。
     */
    static createConstraint(): void {//TODO: 两种重载函数
        //TODO:
    }

    /** @internal */
    private _btDiscreteDynamicsWorld: CANNON.World;
    /** @internal */
    private _btBroadphase: CANNON.NaiveBroadphase;
    /** @internal */
    private _gravity: Vector3 = new Vector3(0, -10, 0);
    /** @internal */
    private _iterations: number;
    /** @internal */
    private _btClosestRayResultCallback: CANNON.RaycastResult = new CANNON.RaycastResult();
    /** @internal */
    private _btRayoption: any = {};

    /** @internal */
    private _collisionsUtils: CannonCollisionTool = new CannonCollisionTool();
    /** @internal */
    private _previousFrameCollisions: CannonCollision[] = [];
    /** @internal */
    private _currentFrameCollisions: CannonCollision[] = [];
    /** @internal */
    _physicsUpdateList: CannonPhysicsUpdateList = new CannonPhysicsUpdateList();
    // /**@internal	*/
    // _characters: CharacterController[] = [];
    /**@internal	*/
    _updatedRigidbodies: number = 0;

    /**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
    maxSubSteps: number = 1;
    /**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
    fixedTimeStep: number = 1.0 / 60.0;

    // /**
    //  * 是否进行连续碰撞检测。CCD
    //  */
    // get continuousCollisionDetection(): boolean {
    // 	//有没有这个东西
    // 	return false
    // }

    // set continuousCollisionDetection(value: boolean) {
    // 	//TODO
    // 	throw "Simulation:Cannon physical engine does not support this feature";
    // }

    /**
     * 获取重力。
     */
    get gravity(): Vector3 {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._gravity;
    }

    set gravity(value: Vector3) {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._gravity = value;
        this._btDiscreteDynamicsWorld.gravity.set(value.x, value.y, value.z);
    }

    /**
     * 获取重力。
     */
    get solverIterations(): number {
        if (!(this._btDiscreteDynamicsWorld && this._btDiscreteDynamicsWorld.solver))
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._iterations;
    }

    set solverIterations(value: number) {
        if (!(this._btDiscreteDynamicsWorld && this._btDiscreteDynamicsWorld.solver))
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        (<CANNON.GSSolver>this._btDiscreteDynamicsWorld.solver).iterations = value;
        this._iterations = value;
    }

    // /**
    //  * @internal
    //  */
    // get speculativeContactRestitution(): boolean {
    // 	//TODO:miner
    // 	return false;
    // }

    // /**
    //  * @internal
    //  */
    // set speculativeContactRestitution(value: boolean) {
    // 	//TODO:miner
    // }


    /**
     * @internal
     * 创建一个 <code>Simulation</code> 实例。
     */
    constructor(configuration: CannonPhysicsSettings) {
        this.maxSubSteps = configuration.maxSubSteps;
        this.fixedTimeStep = configuration.fixedTimeStep;

        this._btDiscreteDynamicsWorld = new CANNON.World();
        this._btBroadphase = new CANNON.NaiveBroadphase();
        this._btDiscreteDynamicsWorld.broadphase = this._btBroadphase;

        this._btDiscreteDynamicsWorld.defaultContactMaterial.contactEquationRelaxation = configuration.contactEquationRelaxation;
        this._btDiscreteDynamicsWorld.defaultContactMaterial.contactEquationStiffness = configuration.contactEquationStiffness;
        this.gravity = this._gravity;
        CannonPhysicsSimulation._cannonPhysicsSimulation = this;
    }

    /**
     * @internal
     */
    _simulate(deltaTime: number): void {
        this._updatedRigidbodies = 0;
        if (this._btDiscreteDynamicsWorld) {
            this._btDiscreteDynamicsWorld.callBackBody.length = 0;
            this._btDiscreteDynamicsWorld.allContacts.length = 0;
            this._btDiscreteDynamicsWorld.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
        }
        var callBackBody: CANNON.Body[] = this._btDiscreteDynamicsWorld.callBackBody;

        for (var i: number = 0, n = callBackBody.length; i < n; i++) {
            var cannonBody: CANNON.Body = callBackBody[i];
            var rigidbody: CannonRigidbody3D = CannonPhysicsComponent._physicObjectsMap[cannonBody.layaID];
            rigidbody._simulation._updatedRigidbodies++;
            rigidbody._updateTransformComponent(rigidbody._btColliderObject);
        }

        this._updateCount++;
    }

    /**
     * @internal
     */
    _destroy(): void {
        //TODO:移除调所有的RigidBody
        this._btDiscreteDynamicsWorld = null;
        this._btBroadphase = null;
    }

    /**
     * @internal
     */
    _addPhysicsCollider(component: CannonPhysicsCollider): void {
        this._btDiscreteDynamicsWorld.addBody(component._btColliderObject);
    }

    /**
     * @internal
     */
    _removePhysicsCollider(component: CannonPhysicsCollider): void {
        this._btDiscreteDynamicsWorld.removeBody(component._btColliderObject);
    }

    /**
     * @internal
     */
    _addRigidBody(rigidBody: CannonRigidbody3D): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._btDiscreteDynamicsWorld.addBody(rigidBody._btColliderObject);
    }

    /**
     * @internal
     */
    _removeRigidBody(rigidBody: CannonRigidbody3D): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._btDiscreteDynamicsWorld.removeBody(rigidBody._btColliderObject);
    }
    /**
     * 射线检测第一个碰撞物体。
     * @param	from 起始位置。
     * @param	to 结束位置。
     * @param	out 碰撞结果。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    raycastFromTo(from: Vector3, to: Vector3, out: CannonHitResult = null, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var rayResultCall: CANNON.RaycastResult = this._btClosestRayResultCallback;
        rayResultCall.hasHit = false;
        var rayOptions: any = this._btRayoption;
        var rayFrom: CANNON.Vec3 = CannonPhysicsSimulation._btTempVector30;
        var rayTo: CANNON.Vec3 = CannonPhysicsSimulation._btTempVector31;
        rayFrom.set(from.x, from.y, from.z);
        rayTo.set(to.x, to.y, to.z);
        rayOptions.skipBackfaces = true;
        rayOptions.collisionFilterMask = collisionMask;
        rayOptions.collisionFilterGroup = collisonGroup;
        rayOptions.result = rayResultCall;
        this._btDiscreteDynamicsWorld.raycastClosest(rayFrom, rayTo, rayOptions, rayResultCall);
        if (rayResultCall.hasHit) {
            if (out) {
                out.succeeded = true;
                out.collider = CannonPhysicsComponent._physicObjectsMap[rayResultCall.body.layaID];
                var point: Vector3 = out.point;
                var normal: Vector3 = out.normal;
                var resultPoint: CANNON.Vec3 = rayResultCall.hitPointWorld;
                var resultNormal: CANNON.Vec3 = rayResultCall.hitNormalWorld;
                point.setValue(resultPoint.x, resultPoint.y, resultPoint.z);
                normal.setValue(resultNormal.x, resultNormal.y, resultNormal.z)
            }
            return true
        } else {
            out.succeeded = false;
        }
        return false;
    }

    /**
     * 射线检测所有碰撞的物体。
     * @param	from 起始位置。
     * @param	to 结束位置。
     * @param	out 碰撞结果[数组元素会被回收]。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    raycastAllFromTo(from: Vector3, to: Vector3, out: CannonHitResult[], collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var rayOptions: any = this._btRayoption;
        var rayFrom: CANNON.Vec3 = CannonPhysicsSimulation._btTempVector30;
        var rayTo: CANNON.Vec3 = CannonPhysicsSimulation._btTempVector31;
        rayFrom.set(from.x, from.y, from.z);
        rayTo.set(to.x, to.y, to.z);
        rayOptions.skipBackfaces = true;
        rayOptions.collisionFilterMask = collisionMask;
        rayOptions.collisionFilterGroup = collisonGroup;
        out.length = 0;
        this._btDiscreteDynamicsWorld.raycastAll(rayFrom, rayTo, rayOptions, function (result: CANNON.RaycastResult) {
            var hitResult: CannonHitResult = CannonPhysicsSimulation._cannonPhysicsSimulation._collisionsUtils.getHitResult();
            out.push(hitResult);
            hitResult.succeeded = true
            hitResult.collider = CannonPhysicsComponent._physicObjectsMap[result.body.layaID];
            //TODO:out.hitFraction
            var point: Vector3 = hitResult.point;
            var normal: Vector3 = hitResult.normal;
            var resultPoint: CANNON.Vec3 = result.hitPointWorld;
            var resultNormal: CANNON.Vec3 = result.hitNormalWorld;
            point.setValue(resultPoint.x, resultPoint.y, resultPoint.z);
            normal.setValue(resultNormal.x, resultNormal.y, resultNormal.z);
        });
        if (out.length != 0)
            return true;
        else
            return false;
    }

    /**
     *  射线检测第一个碰撞物体。
     * @param  	ray        射线
     * @param  	outHitInfo 与该射线发生碰撞的第一个碰撞器的碰撞信息
     * @param  	distance   射线长度,默认为最大值
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否检测成功。
     */
    rayCast(ray: Ray, outHitResult: CannonHitResult = null, distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var from: Vector3 = ray.origin;
        var to: Vector3 = CannonPhysicsSimulation._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        return this.raycastFromTo(from, to, outHitResult, collisonGroup, collisionMask);
    }

    /**
     * 射线检测所有碰撞的物体。
     * @param  	ray        射线
     * @param  	out 碰撞结果[数组元素会被回收]。
     * @param  	distance   射线长度,默认为最大值
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否检测成功。
     */
    rayCastAll(ray: Ray, out: CannonHitResult[], distance: number = 2147483647/*Int.MAX_VALUE*/, collisonGroup: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask: number = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER): boolean {
        var from: Vector3 = ray.origin;
        var to: Vector3 = CannonPhysicsSimulation._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
    }


    /**
     * 添加刚体运动的约束条件。
     * @param constraint 约束。
     * @param disableCollisionsBetweenLinkedBodies 是否禁用
     */
    // addConstraint(constraint: CannonConstraintComponent, disableCollisionsBetweenLinkedBodies: boolean = false): void {
    // 	if (!this._btDiscreteDynamicsWorld)
    // 		throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
    // 	// this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
    // 	// Physics3D._bullet.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld,constraint._btConstraint,disableCollisionsBetweenLinkedBodies);
    // 	// this._currentConstraint[constraint.id] = constraint;
    // 	//TODO:还没做
    // 	this._btDiscreteDynamicsWorld.addConstraint(constraint._btConstraint);
    // 	this._currentConstraint[constraint.id] = constraint;
    // }

    /**
     * 移除刚体运动的约束条件。
     */
    // removeConstraint(constraint: CannonConstraintComponent): void {
    // 	if (!this._btDiscreteDynamicsWorld)
    // 		throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
    // 	// this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
    // 	// Physics3D._bullet.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, constraint._btConstraint);
    // 	// delete this._currentConstraint[constraint.id];
    // 	//TODO:还没做
    // 	this._btDiscreteDynamicsWorld.removeConstraint(constraint._btConstraint);
    // 	delete this._currentConstraint[constraint.id];
    // }

    /**
     * @internal
     */
    _updatePhysicsTransformFromRender(): void {
        var elements: any = this._physicsUpdateList.elements;
        for (var i: number = 0, n: number = this._physicsUpdateList.length; i < n; i++) {
            var physicCollider: CannonPhysicsComponent = elements[i];
            physicCollider._derivePhysicsTransformation(false);
            physicCollider._inPhysicUpdateListIndex = -1;//置空索引
        }
        this._physicsUpdateList.length = 0;//清空物理更新队列
    }

    /**
     * @internal
     */
    _updateCollisions(): void {
        this._collisionsUtils.recoverAllContactPointsPool();
        var previous: CannonCollision[] = this._currentFrameCollisions;
        this._currentFrameCollisions = this._previousFrameCollisions;
        this._currentFrameCollisions.length = 0;
        this._previousFrameCollisions = previous;

        var loopCount = this._updateCount;
        var allContacts: CANNON.ContactEquation[] = this._btDiscreteDynamicsWorld.allContacts;
        var numManifolds: number = allContacts.length;
        for (var i: number = 0; i < numManifolds; i++) {
            var contactEquation: CANNON.ContactEquation = allContacts[i];
            var componentA = CannonPhysicsComponent._physicObjectsMap[contactEquation.bi.layaID];
            var componentB = CannonPhysicsComponent._physicObjectsMap[contactEquation.bj.layaID];
            var collision: CannonCollision = null;
            var isFirstCollision: boolean;//可能同时返回A和B多次,需要过滤
            var contacts: CannonContactPoint[] = null;
            var isTrigger: boolean = componentA.isTrigger || componentB.isTrigger;
            if (isTrigger) {
                if (componentA.owner._getBit(NodeFlags.PROCESS_TRIGGERS) || componentB.owner._getBit(NodeFlags.PROCESS_TRIGGERS)) {
                    collision = this._collisionsUtils.getCollision(componentA, componentB);
                    contacts = collision.contacts;
                    isFirstCollision = collision._updateFrame !== loopCount;
                    if (isFirstCollision) {
                        collision._isTrigger = true;
                        contacts.length = 0;
                    }
                }
            } else if (componentA.owner._getBit(NodeFlags.PROCESS_COLLISIONS) || componentB.owner._getBit(NodeFlags.PROCESS_COLLISIONS)) {
                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {//例：A和B均为运动刚体或PhysicCollider

                    var contactPoint: CannonContactPoint = this._collisionsUtils.getContactPoints();
                    contactPoint.colliderA = componentA;
                    contactPoint.colliderB = componentB;
                    var normal: Vector3 = contactPoint.normal;
                    var positionOnA: Vector3 = contactPoint.positionOnA;
                    var positionOnB: Vector3 = contactPoint.positionOnB;
                    var connectNormal: CANNON.Vec3 = contactEquation.ni;
                    var connectOnA: CANNON.Vec3 = contactEquation.ri;
                    var connectOnB: CANNON.Vec3 = contactEquation.rj;

                    normal.setValue(connectNormal.x, connectNormal.y, connectNormal.z);
                    positionOnA.setValue(connectOnA.x, connectOnA.y, connectOnA.z);
                    positionOnB.setValue(connectOnB.x, connectOnB.y, -connectOnB.z);
                    collision = this._collisionsUtils.getCollision(componentA, componentB);
                    contacts = collision.contacts;
                    isFirstCollision = collision._updateFrame !== loopCount;
                    if (isFirstCollision) {
                        collision._isTrigger = false;
                        contacts.length = 0;
                    }
                    contacts.push(contactPoint);
                }
            }
            if (collision && isFirstCollision) {
                this._currentFrameCollisions.push(collision);
                collision._setUpdateFrame(loopCount);
            }
        }
    }

    /**
      * 这个只是给对象发送事件，不会挨个组件调用碰撞函数
      * 组件要响应碰撞的话，要通过监听事件
      */
    dispatchCollideEvent(): void {
        let loopCount = this._updateCount;
        for (let i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
            let curFrameCol = this._currentFrameCollisions[i];
            let colliderA = curFrameCol._colliderA;
            let colliderB = curFrameCol._colliderB;
            if (colliderA.destroyed || colliderB.destroyed)//前一个循环可能会销毁后面循环的同一物理组件
                continue;
            // TODO 下面是否正确。现在这个_enableProcessCollisions是kinematic的话，就是false，所以先改成&&
            //if(!colliderA._enableProcessCollisions && colliderB._enableProcessCollisions) return;	// 这个会导致角色和kinematic地板的碰撞不处理
            let ownerA = colliderA.owner;
            let ownerB = colliderB.owner;
            if (loopCount - curFrameCol._lastUpdateFrame === 1) {// 上一帧有，这一帧还有,则是stay
                if (curFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_STAY, colliderB);
                    ownerB.event(Event.TRIGGER_STAY, colliderA);
                } else {
                    curFrameCol.other = colliderB;
                    ownerA.event(Event.COLLISION_STAY, curFrameCol);
                    curFrameCol.other = colliderA;
                    ownerB.event(Event.COLLISION_STAY, curFrameCol);
                }
            } else {
                if (curFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_ENTER, colliderB);
                    ownerB.event(Event.TRIGGER_ENTER, colliderA);
                } else {
                    curFrameCol.other = colliderB;
                    ownerA.event(Event.COLLISION_ENTER, curFrameCol);
                    curFrameCol.other = colliderA;
                    ownerB.event(Event.COLLISION_ENTER, curFrameCol);
                }
            }
        }

        for (let i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
            let preFrameCol = this._previousFrameCollisions[i];
            let preColliderA = preFrameCol._colliderA;
            let preColliderB = preFrameCol._colliderB;
            if (preColliderA.destroyed || preColliderB.destroyed)
                continue;
            let ownerA = preColliderA.owner;
            let ownerB = preColliderB.owner;

            if (loopCount - preFrameCol._updateFrame === 1) {
                this._collisionsUtils.recoverCollision(preFrameCol);//回收collision对象
                if (preFrameCol._isTrigger) {
                    ownerA.event(Event.TRIGGER_EXIT, preColliderB);
                    ownerB.event(Event.TRIGGER_EXIT, preColliderA);
                } else {
                    preFrameCol.other = preColliderB;
                    ownerA.event(Event.COLLISION_EXIT, preFrameCol);
                    preFrameCol.other = preColliderA;
                    ownerB.event(Event.COLLISION_EXIT, preFrameCol);
                }
            }
        }

        // for (let id in this._currentConstraint) {
        //     // 检查所有的约束
        //     let constraintObj = this._currentConstraint[id];
        //     // TODO 这个只要发一次就行
        //     if (constraintObj.enabled && constraintObj._isBreakConstrained()) {
        //         let bodya = constraintObj.ownBody.owner;
        //         let bodyb = constraintObj.connectedBody.owner;
        //         bodya.event(Event.JOINT_BREAK);
        //         bodyb.event(Event.JOINT_BREAK);
        //     }
        // }
    }

    /**
     * 清除力。
     */
    clearForces(): void {
        if (!this._btDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
    }

}


