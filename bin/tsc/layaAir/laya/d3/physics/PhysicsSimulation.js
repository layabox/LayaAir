import { Stat } from "../../utils/Stat";
import { Vector3 } from "../math/Vector3";
import { Physics3DUtils } from "../utils/Physics3DUtils";
import { PhysicsUpdateList } from "./PhysicsUpdateList";
import { CollisionTool } from "./CollisionTool";
import { PhysicsComponent } from "./PhysicsComponent";
import { Physics3D } from "./Physics3D";
/**
 * <code>Simulation</code> 类用于创建物理模拟器。
 */
export class PhysicsSimulation {
    /**
     * @internal
     * 创建一个 <code>Simulation</code> 实例。
     */
    constructor(configuration, flags = 0) {
        /**@internal	*/
        this._gravity = new Vector3(0, -10, 0);
        /** @internal */
        this._nativeVector3Zero = new Physics3D._physics3D.btVector3(0, 0, 0);
        /** @internal */
        this._nativeDefaultQuaternion = new Physics3D._physics3D.btQuaternion(0, 0, 0, -1);
        /**@internal	*/
        this._collisionsUtils = new CollisionTool();
        /**@internal	*/
        this._previousFrameCollisions = [];
        /**@internal	*/
        this._currentFrameCollisions = [];
        /**@internal	*/
        this._physicsUpdateList = new PhysicsUpdateList();
        /**@internal	*/
        this._characters = [];
        /**@internal	*/
        this._updatedRigidbodies = 0;
        /**物理引擎在一帧中用于补偿减速的最大次数：模拟器每帧允许的最大模拟次数，如果引擎运行缓慢,可能需要增加该次数，否则模拟器会丢失“时间",引擎间隔时间小于maxSubSteps*fixedTimeStep非常重要。*/
        this.maxSubSteps = 1;
        /**物理模拟器帧的间隔时间:通过减少fixedTimeStep可增加模拟精度，默认是1.0 / 60.0。*/
        this.fixedTimeStep = 1.0 / 60.0;
        this.maxSubSteps = configuration.maxSubSteps;
        this.fixedTimeStep = configuration.fixedTimeStep;
        var physics3D = Physics3D._physics3D;
        this._nativeCollisionConfiguration = new physics3D.btDefaultCollisionConfiguration();
        this._nativeDispatcher = new physics3D.btCollisionDispatcher(this._nativeCollisionConfiguration);
        this._nativeBroadphase = new physics3D.btDbvtBroadphase();
        this._nativeBroadphase.getOverlappingPairCache().setInternalGhostPairCallback(new physics3D.btGhostPairCallback()); //this allows characters to have proper physics behavior
        var conFlags = configuration.flags;
        if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
            this._nativeCollisionWorld = new physics3D.btCollisionWorld(this._nativeDispatcher, this._nativeBroadphase, this._nativeCollisionConfiguration);
        }
        else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
            throw "PhysicsSimulation:SoftBody processing is not yet available";
        }
        else {
            var solver = new physics3D.btSequentialImpulseConstraintSolver();
            this._nativeDiscreteDynamicsWorld = new physics3D.btDiscreteDynamicsWorld(this._nativeDispatcher, this._nativeBroadphase, solver, this._nativeCollisionConfiguration);
            this._nativeCollisionWorld = this._nativeDiscreteDynamicsWorld;
        }
        if (this._nativeDiscreteDynamicsWorld) {
            this._nativeSolverInfo = this._nativeDiscreteDynamicsWorld.getSolverInfo(); //we are required to keep this reference, or the GC will mess up
            this._nativeDispatchInfo = this._nativeDiscreteDynamicsWorld.getDispatchInfo();
        }
        this._nativeClosestRayResultCallback = new physics3D.ClosestRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeAllHitsRayResultCallback = new physics3D.AllHitsRayResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeClosestConvexResultCallback = new physics3D.ClosestConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero);
        this._nativeAllConvexResultCallback = new physics3D.AllConvexResultCallback(this._nativeVector3Zero, this._nativeVector3Zero); //是否TODO:优化C++
        physics3D._btGImpactCollisionAlgorithm_RegisterAlgorithm(this._nativeDispatcher.a); //注册算法
    }
    /**
    * @internal
    */
    static __init__() {
        PhysicsSimulation._nativeTempVector30 = new Physics3D._physics3D.btVector3(0, 0, 0);
        PhysicsSimulation._nativeTempVector31 = new Physics3D._physics3D.btVector3(0, 0, 0);
        PhysicsSimulation._nativeTempQuaternion0 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        PhysicsSimulation._nativeTempQuaternion1 = new Physics3D._physics3D.btQuaternion(0, 0, 0, 1);
        PhysicsSimulation._nativeTempTransform0 = new Physics3D._physics3D.btTransform();
        PhysicsSimulation._nativeTempTransform1 = new Physics3D._physics3D.btTransform();
    }
    /**
     * 创建限制刚体运动的约束条件。
     */
    static createConstraint() {
        //TODO:
    }
    /**
     * 获取是否进行连续碰撞检测。
     * @return  是否进行连续碰撞检测。
     */
    get continuousCollisionDetection() {
        return this._nativeDispatchInfo.get_m_useContinuous();
    }
    /**
     * 设置是否进行连续碰撞检测。
     * @param value 是否进行连续碰撞检测。
     */
    set continuousCollisionDetection(value) {
        this._nativeDispatchInfo.set_m_useContinuous(value);
    }
    /**
     * 获取重力。
     */
    get gravity() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._gravity;
    }
    /**
     * 设置重力。
     */
    set gravity(value) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._gravity = value;
        var nativeGravity = PhysicsSimulation._nativeTempVector30;
        nativeGravity.setValue(-value.x, value.y, value.z); //TODO:是否先get省一个变量
        this._nativeDiscreteDynamicsWorld.setGravity(nativeGravity);
    }
    /**
     * @internal
     */
    get speculativeContactRestitution() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        return this._nativeDiscreteDynamicsWorld.getApplySpeculativeContactRestitution();
    }
    /**
     * @internal
     */
    set speculativeContactRestitution(value) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.setApplySpeculativeContactRestitution(value);
    }
    /**
     * @internal
     */
    _simulate(deltaTime) {
        this._updatedRigidbodies = 0;
        if (this._nativeDiscreteDynamicsWorld)
            this._nativeDiscreteDynamicsWorld.stepSimulation(deltaTime, this.maxSubSteps, this.fixedTimeStep);
        else
            this._nativeCollisionWorld.PerformDiscreteCollisionDetection();
    }
    /**
     * @internal
     */
    _destroy() {
        var physics3D = Physics3D._physics3D;
        if (this._nativeDiscreteDynamicsWorld) {
            physics3D.destroy(this._nativeDiscreteDynamicsWorld);
            this._nativeDiscreteDynamicsWorld = null;
        }
        else {
            physics3D.destroy(this._nativeCollisionWorld);
            this._nativeCollisionWorld = null;
        }
        physics3D.destroy(this._nativeBroadphase);
        this._nativeBroadphase = null;
        physics3D.destroy(this._nativeDispatcher);
        this._nativeDispatcher = null;
        physics3D.destroy(this._nativeCollisionConfiguration);
        this._nativeCollisionConfiguration = null;
    }
    /**
     * @internal
     */
    _addPhysicsCollider(component, group, mask) {
        this._nativeCollisionWorld.addCollisionObject(component._nativeColliderObject, group, mask);
    }
    /**
     * @internal
     */
    _removePhysicsCollider(component) {
        this._nativeCollisionWorld.removeCollisionObject(component._nativeColliderObject);
    }
    /**
     * @internal
     */
    _addRigidBody(rigidBody, group, mask) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.addRigidBody(rigidBody._nativeColliderObject, group, mask);
    }
    /**
     * @internal
     */
    _removeRigidBody(rigidBody) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.removeRigidBody(rigidBody._nativeColliderObject);
    }
    /**
     * @internal
     */
    _addCharacter(character, group, mask) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.addCollisionObject(character._nativeColliderObject, group, mask);
        this._nativeCollisionWorld.addAction(character._nativeKinematicCharacter);
    }
    /**
     * @internal
     */
    _removeCharacter(character) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeCollisionWorld.removeCollisionObject(character._nativeColliderObject);
        this._nativeCollisionWorld.removeAction(character._nativeKinematicCharacter);
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
    raycastFromTo(from, to, out = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var rayResultCall = this._nativeClosestRayResultCallback;
        var rayFrom = PhysicsSimulation._nativeTempVector30;
        var rayTo = PhysicsSimulation._nativeTempVector31;
        rayFrom.setValue(-from.x, from.y, from.z);
        rayTo.setValue(-to.x, to.y, to.z);
        rayResultCall.set_m_rayFromWorld(rayFrom);
        rayResultCall.set_m_rayToWorld(rayTo);
        rayResultCall.set_m_collisionFilterGroup(collisonGroup);
        rayResultCall.set_m_collisionFilterMask(collisionMask);
        rayResultCall.set_m_collisionObject(null); //还原默认值
        rayResultCall.set_m_closestHitFraction(1); //还原默认值
        this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall); //TODO:out为空可优化,bullet内
        if (rayResultCall.hasHit()) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[rayResultCall.get_m_collisionObject().getUserIndex()];
                out.hitFraction = rayResultCall.get_m_closestHitFraction();
                var nativePoint = rayResultCall.get_m_hitPointWorld();
                var point = out.point;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                var nativeNormal = rayResultCall.get_m_hitNormalWorld();
                var normal = out.normal;
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            if (out)
                out.succeeded = false;
            return false;
        }
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
    raycastAllFromTo(from, to, out, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var rayResultCall = this._nativeAllHitsRayResultCallback;
        var rayFrom = PhysicsSimulation._nativeTempVector30;
        var rayTo = PhysicsSimulation._nativeTempVector31;
        out.length = 0;
        rayFrom.setValue(-from.x, from.y, from.z);
        rayTo.setValue(-to.x, to.y, to.z);
        rayResultCall.set_m_rayFromWorld(rayFrom);
        rayResultCall.set_m_rayToWorld(rayTo);
        rayResultCall.set_m_collisionFilterGroup(collisonGroup);
        rayResultCall.set_m_collisionFilterMask(collisionMask);
        //rayResultCall.set_m_collisionObject(null);//还原默认值
        //rayResultCall.set_m_closestHitFraction(1);//还原默认值
        var collisionObjects = rayResultCall.get_m_collisionObjects();
        var nativePoints = rayResultCall.get_m_hitPointWorld();
        var nativeNormals = rayResultCall.get_m_hitNormalWorld();
        var nativeFractions = rayResultCall.get_m_hitFractions();
        collisionObjects.clear(); //清空检测队列
        nativePoints.clear();
        nativeNormals.clear();
        nativeFractions.clear();
        this._nativeCollisionWorld.rayTest(rayFrom, rayTo, rayResultCall);
        var count = collisionObjects.size();
        if (count > 0) {
            this._collisionsUtils.recoverAllHitResultsPool();
            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
                hitResult.hitFraction = nativeFractions.at(i);
                var nativePoint = nativePoints.at(i); //取出后需要立即赋值,防止取出法线时被覆盖
                var pointE = hitResult.point;
                pointE.x = -nativePoint.x();
                pointE.y = nativePoint.y();
                pointE.z = nativePoint.z();
                var nativeNormal = nativeNormals.at(i);
                var normalE = hitResult.normal;
                normalE.x = -nativeNormal.x();
                normalE.y = nativeNormal.y();
                normalE.z = nativeNormal.z();
            }
            return true;
        }
        else {
            return false;
        }
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
    rayCast(ray, outHitResult = null, distance = 2147483647 /*Int.MAX_VALUE*/, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
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
    rayCastAll(ray, out, distance = 2147483647 /*Int.MAX_VALUE*/, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
        var from = ray.origin;
        var to = PhysicsSimulation._tempVector30;
        Vector3.normalize(ray.direction, to);
        Vector3.scale(to, distance, to);
        Vector3.add(from, to, to);
        return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
    }
    /**
     * 形状检测第一个碰撞的物体。
     * @param   shape 形状。
     * @param	fromPosition 世界空间起始位置。
     * @param	toPosition 世界空间结束位置。
     * @param	out 碰撞结果。
     * @param	fromRotation 起始旋转。
     * @param	toRotation 结束旋转。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    shapeCast(shape, fromPosition, toPosition, out = null, fromRotation = null, toRotation = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
        var convexResultCall = this._nativeClosestConvexResultCallback;
        var convexPosFrom = PhysicsSimulation._nativeTempVector30;
        var convexPosTo = PhysicsSimulation._nativeTempVector31;
        var convexRotFrom = PhysicsSimulation._nativeTempQuaternion0;
        var convexRotTo = PhysicsSimulation._nativeTempQuaternion1;
        var convexTransform = PhysicsSimulation._nativeTempTransform0;
        var convexTransTo = PhysicsSimulation._nativeTempTransform1;
        var sweepShape = shape._nativeShape;
        convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
        convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);
        //convexResultCall.set_m_convexFromWorld(convexPosFrom);
        //convexResultCall.set_m_convexToWorld(convexPosTo);
        convexResultCall.set_m_collisionFilterGroup(collisonGroup);
        convexResultCall.set_m_collisionFilterMask(collisionMask);
        convexTransform.setOrigin(convexPosFrom);
        convexTransTo.setOrigin(convexPosTo);
        if (fromRotation) {
            convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            convexTransform.setRotation(convexRotFrom);
        }
        else {
            convexTransform.setRotation(this._nativeDefaultQuaternion);
        }
        if (toRotation) {
            convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
            convexTransTo.setRotation(convexRotTo);
        }
        else {
            convexTransTo.setRotation(this._nativeDefaultQuaternion);
        }
        convexResultCall.set_m_hitCollisionObject(null); //还原默认值
        convexResultCall.set_m_closestHitFraction(1); //还原默认值
        this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        if (convexResultCall.hasHit()) {
            if (out) {
                out.succeeded = true;
                out.collider = PhysicsComponent._physicObjectsMap[convexResultCall.get_m_hitCollisionObject().getUserIndex()];
                out.hitFraction = convexResultCall.get_m_closestHitFraction();
                var nativePoint = convexResultCall.get_m_hitPointWorld();
                var nativeNormal = convexResultCall.get_m_hitNormalWorld();
                var point = out.point;
                var normal = out.normal;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            if (out)
                out.succeeded = false;
            return false;
        }
    }
    /**
     * 形状检测所有碰撞的物体。
     * @param   shape 形状。
     * @param	fromPosition 世界空间起始位置。
     * @param	toPosition 世界空间结束位置。
     * @param	out 碰撞结果[数组元素会被回收]。
     * @param	fromRotation 起始旋转。
     * @param	toRotation 结束旋转。
     * @param   collisonGroup 射线所属碰撞组。
     * @param   collisionMask 与射线可产生碰撞的组。
     * @return 	是否成功。
     */
    shapeCastAll(shape, fromPosition, toPosition, out, fromRotation = null, toRotation = null, collisonGroup = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
        var convexResultCall = this._nativeAllConvexResultCallback;
        var convexPosFrom = PhysicsSimulation._nativeTempVector30;
        var convexPosTo = PhysicsSimulation._nativeTempVector31;
        var convexRotFrom = PhysicsSimulation._nativeTempQuaternion0;
        var convexRotTo = PhysicsSimulation._nativeTempQuaternion1;
        var convexTransform = PhysicsSimulation._nativeTempTransform0;
        var convexTransTo = PhysicsSimulation._nativeTempTransform1;
        var sweepShape = shape._nativeShape;
        out.length = 0;
        convexPosFrom.setValue(-fromPosition.x, fromPosition.y, fromPosition.z);
        convexPosTo.setValue(-toPosition.x, toPosition.y, toPosition.z);
        //convexResultCall.set_m_convexFromWorld(convexPosFrom);
        //convexResultCall.set_m_convexToWorld(convexPosTo);
        convexResultCall.set_m_collisionFilterGroup(collisonGroup);
        convexResultCall.set_m_collisionFilterMask(collisionMask);
        convexTransform.setOrigin(convexPosFrom);
        convexTransTo.setOrigin(convexPosTo);
        if (fromRotation) {
            convexRotFrom.setValue(-fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
            convexTransform.setRotation(convexRotFrom);
        }
        else {
            convexTransform.setRotation(this._nativeDefaultQuaternion);
        }
        if (toRotation) {
            convexRotTo.setValue(-toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
            convexTransTo.setRotation(convexRotTo);
        }
        else {
            convexTransTo.setRotation(this._nativeDefaultQuaternion);
        }
        var collisionObjects = convexResultCall.get_m_collisionObjects();
        collisionObjects.clear(); //清空检测队列
        this._nativeCollisionWorld.convexSweepTest(sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
        var count = collisionObjects.size();
        if (count > 0) {
            var nativePoints = convexResultCall.get_m_hitPointWorld();
            var nativeNormals = convexResultCall.get_m_hitNormalWorld();
            var nativeFractions = convexResultCall.get_m_hitFractions();
            for (var i = 0; i < count; i++) {
                var hitResult = this._collisionsUtils.getHitResult();
                out.push(hitResult);
                hitResult.succeeded = true;
                hitResult.collider = PhysicsComponent._physicObjectsMap[collisionObjects.at(i).getUserIndex()];
                hitResult.hitFraction = nativeFractions.at(i);
                var nativePoint = nativePoints.at(i);
                var point = hitResult.point;
                point.x = -nativePoint.x();
                point.y = nativePoint.y();
                point.z = nativePoint.z();
                var nativeNormal = nativeNormals.at(i);
                var normal = hitResult.normal;
                normal.x = -nativeNormal.x();
                normal.y = nativeNormal.y();
                normal.z = nativeNormal.z();
            }
            return true;
        }
        else {
            return false;
        }
    }
    /**
     * 添加刚体运动的约束条件。
     * @param constraint 约束。
     * @param disableCollisionsBetweenLinkedBodies 是否禁用
     */
    addConstraint(constraint, disableCollisionsBetweenLinkedBodies = false) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.addConstraint(constraint._nativeConstraint, disableCollisionsBetweenLinkedBodies);
        constraint._simulation = this;
    }
    /**
     * 移除刚体运动的约束条件。
     */
    removeConstraint(constraint) {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.removeConstraint(constraint._nativeConstraint);
    }
    /**
     * @internal
     */
    _updatePhysicsTransformFromRender() {
        var elements = this._physicsUpdateList.elements;
        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
            var physicCollider = elements[i];
            physicCollider._derivePhysicsTransformation(false);
            physicCollider._inPhysicUpdateListIndex = -1; //置空索引
        }
        this._physicsUpdateList.length = 0; //清空物理更新队列
    }
    /**
     * @internal
     */
    _updateCharacters() {
        for (var i = 0, n = this._characters.length; i < n; i++) {
            var character = this._characters[i];
            character._updateTransformComponent(character._nativeColliderObject.getWorldTransform());
        }
    }
    /**
     * @internal
     */
    _updateCollisions() {
        this._collisionsUtils.recoverAllContactPointsPool();
        var previous = this._currentFrameCollisions;
        this._currentFrameCollisions = this._previousFrameCollisions;
        this._currentFrameCollisions.length = 0;
        this._previousFrameCollisions = previous;
        var loopCount = Stat.loopCount;
        var numManifolds = this._nativeDispatcher.getNumManifolds();
        for (var i = 0; i < numManifolds; i++) {
            var contactManifold = this._nativeDispatcher.getManifoldByIndexInternal(i); //1.可能同时返回A和B、B和A 2.可能同时返回A和B多次(可能和CCD有关)
            var componentA = PhysicsComponent._physicObjectsMap[contactManifold.getBody0().getUserIndex()];
            var componentB = PhysicsComponent._physicObjectsMap[contactManifold.getBody1().getUserIndex()];
            var collision = null;
            var isFirstCollision; //可能同时返回A和B多次,需要过滤
            var contacts = null;
            var isTrigger = componentA.isTrigger || componentB.isTrigger;
            if (isTrigger && (componentA.owner._needProcessTriggers || componentB.owner._needProcessTriggers)) {
                var numContacts = contactManifold.getNumContacts();
                for (var j = 0; j < numContacts; j++) {
                    var pt = contactManifold.getContactPoint(j);
                    var distance = pt.getDistance();
                    if (distance <= 0) {
                        collision = this._collisionsUtils.getCollision(componentA, componentB);
                        contacts = collision.contacts;
                        isFirstCollision = collision._updateFrame !== loopCount;
                        if (isFirstCollision) {
                            collision._isTrigger = true;
                            contacts.length = 0;
                        }
                        break;
                    }
                }
            }
            else if (componentA.owner._needProcessCollisions || componentB.owner._needProcessCollisions) {
                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) { //例：运动刚体需跳过
                    numContacts = contactManifold.getNumContacts();
                    for (j = 0; j < numContacts; j++) {
                        pt = contactManifold.getContactPoint(j);
                        distance = pt.getDistance();
                        if (distance <= 0) {
                            var contactPoint = this._collisionsUtils.getContactPoints();
                            contactPoint.colliderA = componentA;
                            contactPoint.colliderB = componentB;
                            contactPoint.distance = distance;
                            var nativeNormal = pt.get_m_normalWorldOnB();
                            var normal = contactPoint.normal;
                            normal.x = -nativeNormal.x();
                            normal.y = nativeNormal.y();
                            normal.z = nativeNormal.z();
                            var nativePostionA = pt.get_m_positionWorldOnA();
                            var positionOnA = contactPoint.positionOnA;
                            positionOnA.x = -nativePostionA.x();
                            positionOnA.y = nativePostionA.y();
                            positionOnA.z = nativePostionA.z();
                            var nativePostionB = pt.get_m_positionWorldOnB();
                            var positionOnB = contactPoint.positionOnB;
                            positionOnB.x = -nativePostionB.x();
                            positionOnB.y = nativePostionB.y();
                            positionOnB.z = nativePostionB.z();
                            if (!collision) {
                                collision = this._collisionsUtils.getCollision(componentA, componentB);
                                contacts = collision.contacts;
                                isFirstCollision = collision._updateFrame !== loopCount;
                                if (isFirstCollision) {
                                    collision._isTrigger = false;
                                    contacts.length = 0;
                                }
                            }
                            contacts.push(contactPoint);
                        }
                    }
                }
            }
            if (collision && isFirstCollision) {
                this._currentFrameCollisions.push(collision);
                collision._setUpdateFrame(loopCount);
            }
        }
    }
    /**
     * @internal
     */
    _eventScripts() {
        var loopCount = Stat.loopCount;
        for (var i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
            var curFrameCol = this._currentFrameCollisions[i];
            var colliderA = curFrameCol._colliderA;
            var colliderB = curFrameCol._colliderB;
            if (colliderA.destroyed || colliderB.destroyed) //前一个循环可能会销毁后面循环的同一物理组件
                continue;
            if (loopCount - curFrameCol._lastUpdateFrame === 1) {
                var ownerA = colliderA.owner;
                var scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (curFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (var j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerStay(colliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                curFrameCol.other = colliderB;
                                scriptsA[j].onCollisionStay(curFrameCol);
                            }
                        }
                    }
                }
                var ownerB = colliderB.owner;
                var scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (curFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerStay(colliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                curFrameCol.other = colliderA;
                                scriptsB[j].onCollisionStay(curFrameCol);
                            }
                        }
                    }
                }
            }
            else {
                ownerA = colliderA.owner;
                scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (curFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerEnter(colliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                curFrameCol.other = colliderB;
                                scriptsA[j].onCollisionEnter(curFrameCol);
                            }
                        }
                    }
                }
                ownerB = colliderB.owner;
                scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (curFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerEnter(colliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                curFrameCol.other = colliderA;
                                scriptsB[j].onCollisionEnter(curFrameCol);
                            }
                        }
                    }
                }
            }
        }
        for (i = 0, n = this._previousFrameCollisions.length; i < n; i++) {
            var preFrameCol = this._previousFrameCollisions[i];
            var preColliderA = preFrameCol._colliderA;
            var preColliderB = preFrameCol._colliderB;
            if (preColliderA.destroyed || preColliderB.destroyed)
                continue;
            if (loopCount - preFrameCol._updateFrame === 1) {
                this._collisionsUtils.recoverCollision(preFrameCol); //回收collision对象
                ownerA = preColliderA.owner;
                scriptsA = ownerA._scripts;
                if (scriptsA) {
                    if (preFrameCol._isTrigger) {
                        if (ownerA._needProcessTriggers) {
                            for (j = 0, m = scriptsA.length; j < m; j++)
                                scriptsA[j].onTriggerExit(preColliderB);
                        }
                    }
                    else {
                        if (ownerA._needProcessCollisions) {
                            for (j = 0, m = scriptsA.length; j < m; j++) {
                                preFrameCol.other = preColliderB;
                                scriptsA[j].onCollisionExit(preFrameCol);
                            }
                        }
                    }
                }
                ownerB = preColliderB.owner;
                scriptsB = ownerB._scripts;
                if (scriptsB) {
                    if (preFrameCol._isTrigger) {
                        if (ownerB._needProcessTriggers) {
                            for (j = 0, m = scriptsB.length; j < m; j++)
                                scriptsB[j].onTriggerExit(preColliderA);
                        }
                    }
                    else {
                        if (ownerB._needProcessCollisions) {
                            for (j = 0, m = scriptsB.length; j < m; j++) {
                                preFrameCol.other = preColliderA;
                                scriptsB[j].onCollisionExit(preFrameCol);
                            }
                        }
                    }
                }
            }
        }
    }
    /**
     * 清除力。
     */
    clearForces() {
        if (!this._nativeDiscreteDynamicsWorld)
            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
        this._nativeDiscreteDynamicsWorld.clearForces();
    }
}
/** @internal */
PhysicsSimulation.PHYSICSENGINEFLAGS_NONE = 0x0;
/** @internal */
PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
/** @internal */
PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
/** @internal */
PhysicsSimulation.PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
/** @internal */
PhysicsSimulation.PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;
/** @internal */
PhysicsSimulation.SOLVERMODE_RANDMIZE_ORDER = 1;
/** @internal */
PhysicsSimulation.SOLVERMODE_FRICTION_SEPARATE = 2;
/** @internal */
PhysicsSimulation.SOLVERMODE_USE_WARMSTARTING = 4;
/** @internal */
PhysicsSimulation.SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
/** @internal */
PhysicsSimulation.SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
/** @internal */
PhysicsSimulation.SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
/** @internal */
PhysicsSimulation.SOLVERMODE_CACHE_FRIENDLY = 128;
/** @internal */
PhysicsSimulation.SOLVERMODE_SIMD = 256;
/** @internal */
PhysicsSimulation.SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
/** @internal */
PhysicsSimulation.SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
/**@internal */
PhysicsSimulation._tempVector30 = new Vector3();
/*是否禁用所有模拟器。*/
PhysicsSimulation.disableSimulation = false;
