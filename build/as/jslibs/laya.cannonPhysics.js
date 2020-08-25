(function (exports, Laya) {
	'use strict';

	class CannonCollision {
	    constructor() {
	        this._lastUpdateFrame = -2147483648;
	        this._updateFrame = -2147483648;
	        this._isTrigger = false;
	        this.contacts = [];
	    }
	    _setUpdateFrame(farme) {
	        this._lastUpdateFrame = this._updateFrame;
	        this._updateFrame = farme;
	    }
	}

	class CannonContactPoint {
	    constructor() {
	        this._idCounter = 0;
	        this.colliderA = null;
	        this.colliderB = null;
	        this.distance = 0;
	        this.normal = new Laya.Vector3();
	        this.positionOnA = new Laya.Vector3();
	        this.positionOnB = new Laya.Vector3();
	        this._id = ++this._idCounter;
	    }
	}

	class CannonHitResult {
	    constructor() {
	        this.succeeded = false;
	        this.collider = null;
	        this.point = new Laya.Vector3();
	        this.normal = new Laya.Vector3();
	        this.hitFraction = 0;
	    }
	}

	class CannonCollisionTool {
	    constructor() {
	        this._hitResultsPoolIndex = 0;
	        this._hitResultsPool = [];
	        this._contactPonintsPoolIndex = 0;
	        this._contactPointsPool = [];
	        this._collisionsPool = [];
	        this._collisions = {};
	    }
	    getHitResult() {
	        var hitResult = this._hitResultsPool[this._hitResultsPoolIndex++];
	        if (!hitResult) {
	            hitResult = new CannonHitResult();
	            this._hitResultsPool.push(hitResult);
	        }
	        return hitResult;
	    }
	    recoverAllHitResultsPool() {
	        this._hitResultsPoolIndex = 0;
	    }
	    getContactPoints() {
	        var contactPoint = this._contactPointsPool[this._contactPonintsPoolIndex++];
	        if (!contactPoint) {
	            contactPoint = new CannonContactPoint();
	            this._contactPointsPool.push(contactPoint);
	        }
	        return contactPoint;
	    }
	    recoverAllContactPointsPool() {
	        this._contactPonintsPoolIndex = 0;
	    }
	    getCollision(physicComponentA, physicComponentB) {
	        var collision;
	        var idA = physicComponentA.id;
	        var idB = physicComponentB.id;
	        var subCollisionFirst = this._collisions[idA];
	        if (subCollisionFirst)
	            collision = subCollisionFirst[idB];
	        if (!collision) {
	            if (!subCollisionFirst) {
	                subCollisionFirst = {};
	                this._collisions[idA] = subCollisionFirst;
	            }
	            collision = this._collisionsPool.length === 0 ? new CannonCollision() : this._collisionsPool.pop();
	            collision._colliderA = physicComponentA;
	            collision._colliderB = physicComponentB;
	            subCollisionFirst[idB] = collision;
	        }
	        return collision;
	    }
	    recoverCollision(collision) {
	        var idA = collision._colliderA.id;
	        var idB = collision._colliderB.id;
	        this._collisions[idA][idB] = null;
	        this._collisionsPool.push(collision);
	    }
	    garbageCollection() {
	        this._hitResultsPoolIndex = 0;
	        this._hitResultsPool.length = 0;
	        this._contactPonintsPoolIndex = 0;
	        this._contactPointsPool.length = 0;
	        this._collisionsPool.length = 0;
	        for (var subCollisionsKey in this._collisionsPool) {
	            var subCollisions = this._collisionsPool[subCollisionsKey];
	            var wholeDelete = true;
	            for (var collisionKey in subCollisions) {
	                if (subCollisions[collisionKey])
	                    wholeDelete = false;
	                else
	                    delete subCollisions[collisionKey];
	            }
	            if (wholeDelete)
	                delete this._collisionsPool[subCollisionsKey];
	        }
	    }
	}

	class CannonColliderShape {
	    constructor() {
	        this._scale = new Laya.Vector3(1, 1, 1);
	        this._centerMatrix = new Laya.Matrix4x4();
	        this._attatched = false;
	        this._indexInCompound = -1;
	        this._compoundParent = null;
	        this._attatchedCollisionObject = null;
	        this._referenceCount = 0;
	        this._localOffset = new Laya.Vector3(0, 0, 0);
	        this._localRotation = new Laya.Quaternion(0, 0, 0, 1);
	        this.needsCustomCollisionCallback = false;
	    }
	    static __init__() {
	        CannonColliderShape._btScale = new CANNON.Vec3();
	        CannonColliderShape._btVector30 = new CANNON.Vec3();
	        CannonColliderShape._btQuaternion0 = new CANNON.Quaternion();
	    }
	    static _createAffineTransformation(trans, rot, outE) {
	        var x = rot.x, y = rot.y, z = rot.z, w = rot.w, x2 = x + x, y2 = y + y, z2 = z + z;
	        var xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2;
	        var wx = w * x2, wy = w * y2, wz = w * z2;
	        outE[0] = (1 - (yy + zz));
	        outE[1] = (xy + wz);
	        outE[2] = (xz - wy);
	        outE[3] = 0;
	        outE[4] = (xy - wz);
	        outE[5] = (1 - (xx + zz));
	        outE[6] = (yz + wx);
	        outE[7] = 0;
	        outE[8] = (xz + wy);
	        outE[9] = (yz - wx);
	        outE[10] = (1 - (xx + yy));
	        outE[11] = 0;
	        outE[12] = trans.x;
	        outE[13] = trans.y;
	        outE[14] = trans.z;
	        outE[15] = 1;
	    }
	    get type() {
	        return this._type;
	    }
	    get localOffset() {
	        return this._localOffset;
	    }
	    set localOffset(value) {
	        value.cloneTo(this._localOffset);
	    }
	    get localRotation() {
	        return this._localRotation;
	    }
	    set localRotation(value) {
	        this._localRotation = value;
	        if (this._compoundParent)
	            this._compoundParent._updateChildTransform(this);
	    }
	    _setScale(value) {
	    }
	    _addReference() {
	        this._referenceCount++;
	    }
	    _removeReference() {
	        this._referenceCount--;
	    }
	    updateLocalTransformations() {
	        if (this._compoundParent) {
	            var offset = CannonColliderShape._tempVector30;
	            Laya.Vector3.multiply(this.localOffset, this._scale, offset);
	            CannonColliderShape._createAffineTransformation(offset, this.localRotation, this._centerMatrix.elements);
	        }
	        else {
	            CannonColliderShape._createAffineTransformation(this.localOffset, this.localRotation, this._centerMatrix.elements);
	        }
	    }
	    cloneTo(destObject) {
	        var destColliderShape = destObject;
	        this._localOffset.cloneTo(destColliderShape.localOffset);
	        this._localRotation.cloneTo(destColliderShape.localRotation);
	        destColliderShape.localOffset = destColliderShape.localOffset;
	        destColliderShape.localRotation = destColliderShape.localRotation;
	    }
	    clone() {
	        return null;
	    }
	    destroy() {
	        if (this._btShape) {
	            this._btShape = null;
	        }
	    }
	}
	CannonColliderShape.SHAPEORIENTATION_UPX = 0;
	CannonColliderShape.SHAPEORIENTATION_UPY = 1;
	CannonColliderShape.SHAPEORIENTATION_UPZ = 2;
	CannonColliderShape.SHAPETYPES_BOX = 0;
	CannonColliderShape.SHAPETYPES_SPHERE = 1;
	CannonColliderShape.SHAPETYPES_CYLINDER = 2;
	CannonColliderShape.SHAPETYPES_CAPSULE = 3;
	CannonColliderShape.SHAPETYPES_CONVEXHULL = 4;
	CannonColliderShape.SHAPETYPES_COMPOUND = 5;
	CannonColliderShape.SHAPETYPES_STATICPLANE = 6;
	CannonColliderShape.SHAPETYPES_CONE = 7;
	CannonColliderShape._tempVector30 = new Laya.Vector3();

	class CannonBoxColliderShape extends CannonColliderShape {
	    constructor(sizeX = 1.0, sizeY = 1.0, sizeZ = 1.0) {
	        super();
	        this._sizeX = sizeX;
	        this._sizeY = sizeY;
	        this._sizeZ = sizeZ;
	        this._type = CannonColliderShape.SHAPETYPES_BOX;
	        var btsize = new CANNON.Vec3(sizeX / 2, sizeY / 2, sizeZ / 2);
	        this._btShape = new CANNON.Box(btsize);
	    }
	    static __init__() {
	        CannonBoxColliderShape._btSize = new CANNON.Vec3();
	    }
	    get sizeX() {
	        return this._sizeX;
	    }
	    get sizeY() {
	        return this._sizeY;
	    }
	    get sizeZ() {
	        return this._sizeZ;
	    }
	    _setScale(scale) {
	        this._scale.setValue(scale.x, scale.y, scale.z);
	        this._btShape.halfExtents.set(this.sizeX / 2 * scale.x, this.sizeY / 2 * scale.y, this.sizeZ / 2 * scale.z);
	        this._btShape.updateConvexPolyhedronRepresentation();
	        this._btShape.updateBoundingSphereRadius();
	    }
	    clone() {
	        var dest = new CannonBoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class CannonSphereColliderShape extends CannonColliderShape {
	    constructor(radius = 0.5) {
	        super();
	        this._radius = radius;
	        this._type = CannonColliderShape.SHAPETYPES_SPHERE;
	        this._btShape = new CANNON.Sphere(radius);
	    }
	    get radius() {
	        return this._radius;
	    }
	    _setScale(scale) {
	        var max = Math.max(scale.x, scale.y, scale.z);
	        this._scale.setValue(max, max, max);
	        this._btShape.radius = max * this.radius;
	        this._btShape.updateBoundingSphereRadius();
	    }
	    clone() {
	        var dest = new CannonSphereColliderShape(this._radius);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class CannonPhysicsComponent extends Laya.Component {
	    constructor(collisionGroup, canCollideWith) {
	        super();
	        this._restitution = 0.0;
	        this._friction = 0.5;
	        this._collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER;
	        this._canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER;
	        this._colliderShape = null;
	        this._transformFlag = 2147483647;
	        this._controlBySimulation = false;
	        this._enableProcessCollisions = true;
	        this._inPhysicUpdateListIndex = -1;
	        this.canScaleShape = true;
	        this._collisionGroup = collisionGroup;
	        this._canCollideWith = canCollideWith;
	        CannonPhysicsComponent._physicObjectsMap[this.id] = this;
	    }
	    static __init__() {
	        CannonPhysicsComponent._btVector30 = new CANNON.Vec3(0, 0, 0);
	        CannonPhysicsComponent._btQuaternion0 = new CANNON.Quaternion(0, 0, 0, 1);
	    }
	    static _creatShape(shapeData) {
	        var colliderShape;
	        switch (shapeData.type) {
	            case "BoxColliderShape":
	                var sizeData = shapeData.size;
	                colliderShape = sizeData ? new CannonBoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new CannonBoxColliderShape();
	                break;
	            case "SphereColliderShape":
	                colliderShape = new CannonSphereColliderShape(shapeData.radius);
	                break;
	            default:
	                throw "unknown shape type.";
	        }
	        if (shapeData.center) {
	            var localOffset = colliderShape.localOffset;
	            localOffset.fromArray(shapeData.center);
	            colliderShape.localOffset = localOffset;
	        }
	        return colliderShape;
	    }
	    static physicQuaternionMultiply(lx, ly, lz, lw, right, out) {
	        var rx = right.x;
	        var ry = right.y;
	        var rz = right.z;
	        var rw = right.w;
	        var a = (ly * rz - lz * ry);
	        var b = (lz * rx - lx * rz);
	        var c = (lx * ry - ly * rx);
	        var d = (lx * rx + ly * ry + lz * rz);
	        out.x = (lx * rw + rx * lw) + a;
	        out.y = (ly * rw + ry * lw) + b;
	        out.z = (lz * rw + rz * lw) + c;
	        out.w = lw * rw - d;
	    }
	    get restitution() {
	        return this._restitution;
	    }
	    set restitution(value) {
	        this._restitution = value;
	        this._btColliderObject && (this._btColliderObject.material.restitution = value);
	    }
	    get friction() {
	        return this._friction;
	    }
	    set friction(value) {
	        this._friction = value;
	        this._btColliderObject && (this._btColliderObject.material.friction = value);
	    }
	    get colliderShape() {
	        return this._colliderShape;
	    }
	    set colliderShape(value) {
	        var lastColliderShape = this._colliderShape;
	        if (lastColliderShape) {
	            lastColliderShape._attatched = false;
	            lastColliderShape._attatchedCollisionObject = null;
	        }
	        this._colliderShape = value;
	        if (value) {
	            if (value._attatched) {
	                throw "PhysicsComponent: this shape has attatched to other entity.";
	            }
	            else {
	                value._attatched = true;
	                value._attatchedCollisionObject = this;
	            }
	            if (this._btColliderObject) {
	                if (value.type != CannonColliderShape.SHAPETYPES_COMPOUND) {
	                    this._btColliderObject.shapes.length = 0;
	                    this._btColliderObject.shapeOffsets.length = 0;
	                    this._btColliderObject.shapeOrientations.length = 0;
	                    var localOffset = value.localOffset;
	                    var scale = value._scale;
	                    var vecs = new CANNON.Vec3(localOffset.x * scale.x, localOffset.y * scale.y, localOffset.z * scale.z);
	                    this._btColliderObject.addShape(this._colliderShape._btShape, vecs);
	                    this._btColliderObject.updateBoundingRadius();
	                }
	                else {
	                    value.bindRigidBody(this);
	                }
	                var canInSimulation = this._simulation && this._enabled;
	                (canInSimulation && lastColliderShape) && (this._removeFromSimulation());
	                this._onShapeChange(value);
	                if (canInSimulation) {
	                    this._derivePhysicsTransformation(true);
	                    this._addToSimulation();
	                }
	            }
	        }
	        else {
	            if (this._simulation && this._enabled)
	                lastColliderShape && this._removeFromSimulation();
	        }
	    }
	    get simulation() {
	        return this._simulation;
	    }
	    get collisionGroup() {
	        return this._collisionGroup;
	    }
	    set collisionGroup(value) {
	        if (this._collisionGroup !== value) {
	            this._collisionGroup = value;
	            this._btColliderObject.collisionFilterGroup = value;
	            if (this._simulation && this._colliderShape && this._enabled) {
	                this._removeFromSimulation();
	                this._addToSimulation();
	            }
	        }
	    }
	    get canCollideWith() {
	        return this._canCollideWith;
	    }
	    set canCollideWith(value) {
	        if (this._canCollideWith !== value) {
	            this._canCollideWith = value;
	            this._btColliderObject.collisionFilterMask = value;
	            if (this._simulation && this._colliderShape && this._enabled) {
	                this._removeFromSimulation();
	                this._addToSimulation();
	            }
	        }
	    }
	    _parseShape(shapesData) {
	        var shapeCount = shapesData.length;
	        if (shapeCount === 1) {
	            var shape = CannonPhysicsComponent._creatShape(shapesData[0]);
	            this.colliderShape = shape;
	        }
	    }
	    _onScaleChange(scale) {
	        this._colliderShape._setScale(scale);
	    }
	    _onEnable() {
	        this._simulation = this.owner._scene._cannonPhysicsSimulation;
	        if (this._colliderShape) {
	            this._derivePhysicsTransformation(true);
	            this._addToSimulation();
	        }
	    }
	    _onDisable() {
	        if (this._colliderShape) {
	            this._removeFromSimulation();
	            (this._inPhysicUpdateListIndex !== -1) && (this._simulation._physicsUpdateList.remove(this));
	        }
	        this._simulation = null;
	    }
	    _onDestroy() {
	        delete CannonPhysicsComponent._physicObjectsMap[this.id];
	        this._btColliderObject = null;
	        this._colliderShape.destroy();
	        super._onDestroy();
	        this._btColliderObject = null;
	        this._colliderShape = null;
	        this._simulation = null;
	        this.owner.transform.off(Laya.Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	    }
	    _isValid() {
	        return this._simulation && this._colliderShape && this._enabled;
	    }
	    _parse(data) {
	        (data.collisionGroup != null) && (this.collisionGroup = data.collisionGroup);
	        (data.canCollideWith != null) && (this.canCollideWith = data.canCollideWith);
	    }
	    _setTransformFlag(type, value) {
	        if (value)
	            this._transformFlag |= type;
	        else
	            this._transformFlag &= ~type;
	    }
	    _getTransformFlag(type) {
	        return (this._transformFlag & type) != 0;
	    }
	    _addToSimulation() {
	    }
	    _removeFromSimulation() {
	    }
	    _derivePhysicsTransformation(force) {
	        var btColliderObject = this._btColliderObject;
	        this._innerDerivePhysicsTransformation(btColliderObject, force);
	    }
	    _innerDerivePhysicsTransformation(physicTransformOut, force) {
	        var transform = this.owner._transform;
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
	            var shapeOffset = this._colliderShape.localOffset;
	            var position = transform.position;
	            var btPosition = CannonPhysicsComponent._btVector30;
	            if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
	                var physicPosition = CannonPhysicsComponent._tempVector30;
	                var worldMat = transform.worldMatrix;
	                Laya.Vector3.transformCoordinate(shapeOffset, worldMat, physicPosition);
	                btPosition.set(physicPosition.x, physicPosition.y, physicPosition.z);
	            }
	            else {
	                btPosition.set(position.x, position.y, position.z);
	            }
	            physicTransformOut.position.set(btPosition.x, btPosition.y, btPosition.z);
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION, false);
	        }
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
	            var shapeRotation = this._colliderShape.localRotation;
	            var btRotation = CannonPhysicsComponent._btQuaternion0;
	            var rotation = transform.rotation;
	            if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
	                var physicRotation = CannonPhysicsComponent._tempQuaternion0;
	                CannonPhysicsComponent.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
	                btRotation.set(physicRotation.x, physicRotation.y, physicRotation.z, physicRotation.w);
	            }
	            else {
	                btRotation.set(rotation.x, rotation.y, rotation.z, rotation.w);
	            }
	            physicTransformOut.quaternion.set(btRotation.x, btRotation.y, btRotation.z, btRotation.w);
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION, false);
	        }
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
	            this._onScaleChange(transform.getWorldLossyScale());
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE, false);
	        }
	    }
	    _updateTransformComponent(physicsTransform) {
	        var colliderShape = this._colliderShape;
	        var localOffset = colliderShape.localOffset;
	        var localRotation = colliderShape.localRotation;
	        var transform = this.owner._transform;
	        var position = transform.position;
	        var rotation = transform.rotation;
	        var btPosition = physicsTransform.position;
	        var btRotation = physicsTransform.quaternion;
	        var btRotX = btRotation.x;
	        var btRotY = btRotation.y;
	        var btRotZ = btRotation.z;
	        var btRotW = btRotation.w;
	        if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
	            var invertShapeRotaion = CannonPhysicsComponent._tempQuaternion0;
	            localRotation.invert(invertShapeRotaion);
	            CannonPhysicsComponent.physicQuaternionMultiply(btRotX, btRotY, btRotZ, btRotW, invertShapeRotaion, rotation);
	        }
	        else {
	            rotation.x = btRotX;
	            rotation.y = btRotY;
	            rotation.z = btRotZ;
	            rotation.w = btRotW;
	        }
	        transform.rotation = rotation;
	        if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
	            var rotShapePosition = CannonPhysicsComponent._tempVector30;
	            rotShapePosition.x = localOffset.x;
	            rotShapePosition.y = localOffset.y;
	            rotShapePosition.z = localOffset.z;
	            Laya.Vector3.transformQuat(rotShapePosition, rotation, rotShapePosition);
	            position.x = btPosition.x - rotShapePosition.x;
	            position.y = btPosition.y - rotShapePosition.z;
	            position.z = btPosition.z - rotShapePosition.y;
	        }
	        else {
	            position.x = btPosition.x;
	            position.y = btPosition.y;
	            position.z = btPosition.z;
	        }
	        transform.position = position;
	    }
	    _onShapeChange(colShape) {
	    }
	    _onAdded() {
	        this.enabled = this._enabled;
	        this.restitution = this._restitution;
	        this.friction = this._friction;
	        this.owner.transform.on(Laya.Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	    }
	    _onTransformChanged(flag) {
	        if (CannonPhysicsComponent._addUpdateList || !this._controlBySimulation) {
	            flag &= Laya.Transform3D.TRANSFORM_WORLDPOSITION | Laya.Transform3D.TRANSFORM_WORLDQUATERNION | Laya.Transform3D.TRANSFORM_WORLDSCALE;
	            if (flag) {
	                this._transformFlag |= flag;
	                if (this._isValid() && this._inPhysicUpdateListIndex === -1)
	                    this._simulation._physicsUpdateList.add(this);
	            }
	        }
	    }
	    _cloneTo(dest) {
	        var destPhysicsComponent = dest;
	        destPhysicsComponent.restitution = this._restitution;
	        destPhysicsComponent.friction = this._friction;
	        destPhysicsComponent.collisionGroup = this._collisionGroup;
	        destPhysicsComponent.canCollideWith = this._canCollideWith;
	        destPhysicsComponent.canScaleShape = this.canScaleShape;
	        (this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
	    }
	}
	CannonPhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG = 1;
	CannonPhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
	CannonPhysicsComponent.ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
	CannonPhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
	CannonPhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION = 5;
	CannonPhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT = 1;
	CannonPhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
	CannonPhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
	CannonPhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
	CannonPhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT = 16;
	CannonPhysicsComponent.COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
	CannonPhysicsComponent.COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;
	CannonPhysicsComponent._tempVector30 = new Laya.Vector3();
	CannonPhysicsComponent._tempQuaternion0 = new Laya.Quaternion();
	CannonPhysicsComponent._tempQuaternion1 = new Laya.Quaternion();
	CannonPhysicsComponent._tempMatrix4x40 = new Laya.Matrix4x4();
	CannonPhysicsComponent._physicObjectsMap = {};
	CannonPhysicsComponent._addUpdateList = true;

	class CannonPhysicsTriggerComponent extends CannonPhysicsComponent {
	    constructor(collisionGroup, canCollideWith) {
	        super(collisionGroup, canCollideWith);
	        this._isTrigger = false;
	    }
	    get isTrigger() {
	        return this._isTrigger;
	    }
	    set isTrigger(value) {
	        this._isTrigger = value;
	        if (this._btColliderObject) {
	            this._btColliderObject.isTrigger = value;
	            if (value) {
	                var flag = this._btColliderObject.type;
	                this._btColliderObject.collisionResponse = false;
	                if ((flag & CANNON.Body.STATIC) === 0)
	                    this._btColliderObject.type |= CANNON.Body.STATIC;
	            }
	            else {
	                this._btColliderObject.collisionResponse = true;
	                if ((flag & CANNON.Body.STATIC) !== 0)
	                    this._btColliderObject.type ^= CANNON.Body.STATIC;
	            }
	        }
	    }
	    _onAdded() {
	        super._onAdded();
	        this.isTrigger = this._isTrigger;
	    }
	    _cloneTo(dest) {
	        super._cloneTo(dest);
	        dest.isTrigger = this._isTrigger;
	    }
	}

	class CannonPhysicsCollider extends CannonPhysicsTriggerComponent {
	    constructor(collisionGroup = -1, canCollideWith = -1) {
	        super(collisionGroup, canCollideWith);
	        this._enableProcessCollisions = false;
	    }
	    _addToSimulation() {
	        this._simulation._addPhysicsCollider(this);
	    }
	    _removeFromSimulation() {
	        this._simulation._removePhysicsCollider(this);
	    }
	    _parse(data) {
	        (data.friction != null) && (this.friction = data.friction);
	        (data.restitution != null) && (this.restitution = data.restitution);
	        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
	        super._parse(data);
	        this._parseShape(data.shapes);
	    }
	    _onAdded() {
	        this._btColliderObject = new CANNON.Body();
	        this._btColliderObject.material = new CANNON.Material();
	        this._btColliderObject.layaID = this._id;
	        this._btColliderObject.type = CANNON.Body.STATIC;
	        this._btColliderObject.collisionFilterGroup = this._collisionGroup;
	        this._btColliderObject.collisionFilterMask = this._canCollideWith;
	        super._onAdded();
	    }
	}

	class CannonPhysicsSettings {
	    constructor() {
	        this.flags = 0;
	        this.maxSubSteps = 3;
	        this.fixedTimeStep = 1.0 / 60.0;
	        this.contactEquationRelaxation = 10;
	        this.contactEquationStiffness = 1e6;
	    }
	}

	class CannonPhysicsUpdateList extends Laya.SingletonList {
	    constructor() {
	        super();
	    }
	    add(element) {
	        var index = element._inPhysicUpdateListIndex;
	        if (index !== -1)
	            throw "PhysicsUpdateList:element has  in  PhysicsUpdateList.";
	        this._add(element);
	        element._inPhysicUpdateListIndex = this.length++;
	    }
	    remove(element) {
	        var index = element._inPhysicUpdateListIndex;
	        this.length--;
	        if (index !== this.length) {
	            var end = this.elements[this.length];
	            this.elements[index] = end;
	            end._inPhysicUpdateListIndex = index;
	        }
	        element._inPhysicUpdateListIndex = -1;
	    }
	}

	class CannonPhysicsSimulation {
	    constructor(configuration, flags = 0) {
	        this._gravity = new Laya.Vector3(0, -10, 0);
	        this._btClosestRayResultCallback = new CANNON.RaycastResult();
	        this._btRayoption = {};
	        this._collisionsUtils = new CannonCollisionTool();
	        this._previousFrameCollisions = [];
	        this._currentFrameCollisions = [];
	        this._physicsUpdateList = new CannonPhysicsUpdateList();
	        this._updatedRigidbodies = 0;
	        this.maxSubSteps = 1;
	        this.fixedTimeStep = 1.0 / 60.0;
	        this.maxSubSteps = configuration.maxSubSteps;
	        this.fixedTimeStep = configuration.fixedTimeStep;
	        this._btDiscreteDynamicsWorld = new CANNON.World();
	        this._btBroadphase = new CANNON.NaiveBroadphase();
	        this._btDiscreteDynamicsWorld.broadphase = this._btBroadphase;
	        this._btDiscreteDynamicsWorld.defaultContactMaterial.contactEquationRelaxation = configuration.contactEquationRelaxation;
	        this._btDiscreteDynamicsWorld.defaultContactMaterial.contactEquationStiffness = configuration.contactEquationStiffness;
	        this.gravity = this._gravity;
	    }
	    static __init__() {
	        CannonPhysicsSimulation._btTempVector30 = new CANNON.Vec3(0, 0, 0);
	        CannonPhysicsSimulation._btTempVector31 = new CANNON.Vec3(0, 0, 0);
	    }
	    static createConstraint() {
	    }
	    get continuousCollisionDetection() {
	        return false;
	    }
	    set continuousCollisionDetection(value) {
	        throw "Simulation:Cannon physical engine does not support this feature";
	    }
	    get gravity() {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        return this._gravity;
	    }
	    set gravity(value) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        this._gravity = value;
	        this._btDiscreteDynamicsWorld.gravity.set(value.x, value.y, value.z);
	    }
	    get solverIterations() {
	        if (!(this._btDiscreteDynamicsWorld && this._btDiscreteDynamicsWorld.solver))
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        return this._iterations;
	    }
	    set solverIterations(value) {
	        if (!(this._btDiscreteDynamicsWorld && this._btDiscreteDynamicsWorld.solver))
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        this._btDiscreteDynamicsWorld.solver.iterations = value;
	        this._iterations = value;
	    }
	    get speculativeContactRestitution() {
	        return false;
	    }
	    set speculativeContactRestitution(value) {
	    }
	    _simulate(deltaTime) {
	        this._updatedRigidbodies = 0;
	        if (this._btDiscreteDynamicsWorld) {
	            this._btDiscreteDynamicsWorld.callBackBody.length = 0;
	            this._btDiscreteDynamicsWorld.allContacts.length = 0;
	            this._btDiscreteDynamicsWorld.step(this.fixedTimeStep, deltaTime, this.maxSubSteps);
	        }
	        var callBackBody = this._btDiscreteDynamicsWorld.callBackBody;
	        for (var i = 0, n = callBackBody.length; i < n; i++) {
	            var cannonBody = callBackBody[i];
	            var rigidbody = CannonPhysicsComponent._physicObjectsMap[cannonBody.layaID];
	            rigidbody._simulation._updatedRigidbodies++;
	            rigidbody._updateTransformComponent(rigidbody._btColliderObject);
	        }
	    }
	    _destroy() {
	        this._btDiscreteDynamicsWorld = null;
	        this._btBroadphase = null;
	    }
	    _addPhysicsCollider(component) {
	        this._btDiscreteDynamicsWorld.addBody(component._btColliderObject);
	    }
	    _removePhysicsCollider(component) {
	        this._btDiscreteDynamicsWorld.removeBody(component._btColliderObject);
	    }
	    _addRigidBody(rigidBody) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        this._btDiscreteDynamicsWorld.addBody(rigidBody._btColliderObject);
	    }
	    _removeRigidBody(rigidBody) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        this._btDiscreteDynamicsWorld.removeBody(rigidBody._btColliderObject);
	    }
	    raycastFromTo(from, to, out = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var rayResultCall = this._btClosestRayResultCallback;
	        rayResultCall.hasHit = false;
	        var rayOptions = this._btRayoption;
	        var rayFrom = CannonPhysicsSimulation._btTempVector30;
	        var rayTo = CannonPhysicsSimulation._btTempVector31;
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
	                var point = out.point;
	                var normal = out.normal;
	                var resultPoint = rayResultCall.hitPointWorld;
	                var resultNormal = rayResultCall.hitNormalWorld;
	                point.setValue(resultPoint.x, resultPoint.y, resultPoint.z);
	                normal.setValue(resultNormal.x, resultNormal.y, resultNormal.z);
	            }
	            return true;
	        }
	        else {
	            out.succeeded = false;
	        }
	        return false;
	    }
	    raycastAllFromTo(from, to, out, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var rayOptions = this._btRayoption;
	        var rayFrom = CannonPhysicsSimulation._btTempVector30;
	        var rayTo = CannonPhysicsSimulation._btTempVector31;
	        rayFrom.set(from.x, from.y, from.z);
	        rayTo.set(to.x, to.y, to.z);
	        rayOptions.skipBackfaces = true;
	        rayOptions.collisionFilterMask = collisionMask;
	        rayOptions.collisionFilterGroup = collisonGroup;
	        out.length = 0;
	        this._btDiscreteDynamicsWorld.raycastAll(rayFrom, rayTo, rayOptions, function (result) {
	            var hitResult = this._collisionsUtils.getHitResult();
	            out.push(hitResult);
	            hitResult.succeeded = true;
	            hitResult.collider = CannonPhysicsComponent._physicObjectsMap[result.body.layaID];
	            var point = hitResult.point;
	            var normal = hitResult.normal;
	            var resultPoint = result.hitPointWorld;
	            var resultNormal = result.hitNormalWorld;
	            point.setValue(resultPoint.x, resultPoint.y, resultPoint.z);
	            normal.setValue(resultNormal.x, resultNormal.y, resultNormal.z);
	        });
	        if (out.length != 0)
	            return true;
	        else
	            return false;
	    }
	    rayCast(ray, outHitResult = null, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var from = ray.origin;
	        var to = CannonPhysicsSimulation._tempVector30;
	        Laya.Vector3.normalize(ray.direction, to);
	        Laya.Vector3.scale(to, distance, to);
	        Laya.Vector3.add(from, to, to);
	        return this.raycastFromTo(from, to, outHitResult, collisonGroup, collisionMask);
	    }
	    rayCastAll(ray, out, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var from = ray.origin;
	        var to = CannonPhysicsSimulation._tempVector30;
	        Laya.Vector3.normalize(ray.direction, to);
	        Laya.Vector3.scale(to, distance, to);
	        Laya.Vector3.add(from, to, to);
	        return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
	    }
	    _updatePhysicsTransformFromRender() {
	        var elements = this._physicsUpdateList.elements;
	        for (var i = 0, n = this._physicsUpdateList.length; i < n; i++) {
	            var physicCollider = elements[i];
	            physicCollider._derivePhysicsTransformation(false);
	            physicCollider._inPhysicUpdateListIndex = -1;
	        }
	        this._physicsUpdateList.length = 0;
	    }
	    _updateCollisions() {
	        this._collisionsUtils.recoverAllContactPointsPool();
	        var previous = this._currentFrameCollisions;
	        this._currentFrameCollisions = this._previousFrameCollisions;
	        this._currentFrameCollisions.length = 0;
	        this._previousFrameCollisions = previous;
	        var loopCount = Laya.Stat.loopCount;
	        var allContacts = this._btDiscreteDynamicsWorld.allContacts;
	        var numManifolds = allContacts.length;
	        for (var i = 0; i < numManifolds; i++) {
	            var contactEquation = allContacts[i];
	            var componentA = CannonPhysicsComponent._physicObjectsMap[contactEquation.bi.layaID];
	            var componentB = CannonPhysicsComponent._physicObjectsMap[contactEquation.bj.layaID];
	            var collision = null;
	            var isFirstCollision;
	            var contacts = null;
	            var isTrigger = componentA.isTrigger || componentB.isTrigger;
	            if (isTrigger && (componentA.owner._needProcessTriggers || componentB.owner._needProcessTriggers)) {
	                collision = this._collisionsUtils.getCollision(componentA, componentB);
	                contacts = collision.contacts;
	                isFirstCollision = collision._updateFrame !== loopCount;
	                if (isFirstCollision) {
	                    collision._isTrigger = true;
	                    contacts.length = 0;
	                }
	            }
	            else if (componentA.owner._needProcessCollisions || componentB.owner._needProcessCollisions) {
	                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {
	                    var contactPoint = this._collisionsUtils.getContactPoints();
	                    contactPoint.colliderA = componentA;
	                    contactPoint.colliderB = componentB;
	                    var normal = contactPoint.normal;
	                    var positionOnA = contactPoint.positionOnA;
	                    var positionOnB = contactPoint.positionOnB;
	                    var connectNormal = contactEquation.ni;
	                    var connectOnA = contactEquation.ri;
	                    var connectOnB = contactEquation.rj;
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
	    _eventScripts() {
	        var loopCount = Laya.Stat.loopCount;
	        for (var i = 0, n = this._currentFrameCollisions.length; i < n; i++) {
	            var curFrameCol = this._currentFrameCollisions[i];
	            var colliderA = curFrameCol._colliderA;
	            var colliderB = curFrameCol._colliderB;
	            if (colliderA.destroyed || colliderB.destroyed)
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
	                this._collisionsUtils.recoverCollision(preFrameCol);
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
	    clearForces() {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
	    }
	}
	CannonPhysicsSimulation.PHYSICSENGINEFLAGS_NONE = 0x0;
	CannonPhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
	CannonPhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
	CannonPhysicsSimulation.PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
	CannonPhysicsSimulation.PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;
	CannonPhysicsSimulation.SOLVERMODE_RANDMIZE_ORDER = 1;
	CannonPhysicsSimulation.SOLVERMODE_FRICTION_SEPARATE = 2;
	CannonPhysicsSimulation.SOLVERMODE_USE_WARMSTARTING = 4;
	CannonPhysicsSimulation.SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
	CannonPhysicsSimulation.SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
	CannonPhysicsSimulation.SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
	CannonPhysicsSimulation.SOLVERMODE_CACHE_FRIENDLY = 128;
	CannonPhysicsSimulation.SOLVERMODE_SIMD = 256;
	CannonPhysicsSimulation.SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
	CannonPhysicsSimulation.SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
	CannonPhysicsSimulation._tempVector30 = new Laya.Vector3();
	CannonPhysicsSimulation.disableSimulation = false;

	class CannonRigidbody3D extends CannonPhysicsCollider {
	    constructor(collisionGroup = -1, canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        super(collisionGroup, canCollideWith);
	        this._isKinematic = false;
	        this._mass = 1.0;
	        this._gravity = new Laya.Vector3(0, -10, 0);
	        this._angularDamping = 0.0;
	        this._linearDamping = 0.0;
	        this._totalTorque = new Laya.Vector3(0, 0, 0);
	        this._totalForce = new Laya.Vector3(0, 0, 0);
	        this._linearVelocity = new Laya.Vector3();
	        this._angularVelocity = new Laya.Vector3();
	        this._controlBySimulation = true;
	    }
	    static __init__() {
	        CannonRigidbody3D._btTempVector30 = new CANNON.Vec3();
	        CannonRigidbody3D._btTempVector31 = new CANNON.Vec3();
	    }
	    get mass() {
	        return this._mass;
	    }
	    set mass(value) {
	        value = Math.max(value, 1e-07);
	        this._mass = value;
	        (this._isKinematic) || (this._updateMass(value));
	    }
	    get isKinematic() {
	        return this._isKinematic;
	    }
	    set isKinematic(value) {
	        this._isKinematic = value;
	        this._controlBySimulation = !value;
	        var canInSimulation = !!(this._simulation && this._enabled && this._colliderShape);
	        canInSimulation && this._removeFromSimulation();
	        var natColObj = this._btColliderObject;
	        var flags = natColObj.type;
	        if (value) {
	            flags = flags | CANNON.Body.KINEMATIC;
	            natColObj.type = flags;
	            this._enableProcessCollisions = false;
	            this._updateMass(0);
	        }
	        else {
	            if ((flags & CANNON.Body.KINEMATIC) > 0)
	                flags = flags ^ CANNON.Body.KINEMATIC;
	            natColObj.allowSleep = true;
	            natColObj.type = flags;
	            this._enableProcessCollisions = true;
	            this._updateMass(this._mass);
	        }
	        natColObj.velocity.set(0.0, 0.0, 0.0);
	        natColObj.angularVelocity.set(0.0, 0.0, 0.0);
	        canInSimulation && this._addToSimulation();
	    }
	    get linearDamping() {
	        return this._linearDamping;
	    }
	    set linearDamping(value) {
	        this._linearDamping = value;
	        if (this._btColliderObject)
	            this._btColliderObject.linearDamping = value;
	    }
	    get angularDamping() {
	        return this._angularDamping;
	    }
	    set angularDamping(value) {
	        this._angularDamping = value;
	        if (this._btColliderObject)
	            this._btColliderObject.angularDamping = value;
	    }
	    get totalForce() {
	        if (this._btColliderObject) {
	            var btTotalForce = this.btColliderObject.force;
	            this.totalForce.setValue(btTotalForce.x, btTotalForce.y, btTotalForce.z);
	            return this._totalForce;
	        }
	        return null;
	    }
	    get linearVelocity() {
	        if (this._btColliderObject) {
	            var phylinear = this.btColliderObject.velocity;
	            this._linearVelocity.setValue(phylinear.x, phylinear.y, phylinear.z);
	        }
	        return this._linearVelocity;
	    }
	    set linearVelocity(value) {
	        this._linearVelocity = value;
	        if (this._btColliderObject) {
	            var btValue = this.btColliderObject.velocity;
	            (this.isSleeping) && (this.wakeUp());
	            btValue.set(value.x, value.y, value.z);
	            this.btColliderObject.velocity = btValue;
	        }
	    }
	    get angularVelocity() {
	        if (this._btColliderObject) {
	            var phtqua = this._btColliderObject.angularVelocity;
	            this.angularVelocity.setValue(phtqua.x, phtqua.y, phtqua.z);
	        }
	        return this._angularVelocity;
	    }
	    set angularVelocity(value) {
	        this._angularVelocity = value;
	        if (this._btColliderObject) {
	            var btValue = this.btColliderObject.angularVelocity;
	            (this.isSleeping) && (this.wakeUp());
	            btValue.set(value.x, value.y, value.z);
	            this.btColliderObject.velocity = btValue;
	        }
	    }
	    get totalTorque() {
	        if (this._btColliderObject) {
	            var btTotalTorque = this._btColliderObject.torque;
	            this._totalTorque.setValue(btTotalTorque.x, btTotalTorque.y, btTotalTorque.z);
	            return this._totalTorque;
	        }
	        return null;
	    }
	    get isSleeping() {
	        if (this._btColliderObject)
	            return this._btColliderObject.sleepState != CANNON.Body.AWAKE;
	        return false;
	    }
	    get sleepLinearVelocity() {
	        return this._btColliderObject.sleepSpeedLimit;
	    }
	    set sleepLinearVelocity(value) {
	        this._btColliderObject.sleepSpeedLimit = value;
	    }
	    get btColliderObject() {
	        return this._btColliderObject;
	    }
	    _updateMass(mass) {
	        if (this._btColliderObject && this._colliderShape) {
	            this._btColliderObject.mass = mass;
	            this._btColliderObject.updateMassProperties();
	            this._btColliderObject.updateSolveMassProperties();
	        }
	    }
	    _onScaleChange(scale) {
	        super._onScaleChange(scale);
	        this._updateMass(this._isKinematic ? 0 : this._mass);
	    }
	    _derivePhysicsTransformation(force) {
	        this._innerDerivePhysicsTransformation(this.btColliderObject, force);
	    }
	    _onAdded() {
	        var btRigid = new CANNON.Body();
	        btRigid.material = new CANNON.Material();
	        btRigid.layaID = this.id;
	        btRigid.collisionFilterGroup = this.collisionGroup;
	        btRigid.collisionFilterMask = this._canCollideWith;
	        this._btColliderObject = btRigid;
	        super._onAdded();
	        this.mass = this._mass;
	        this.linearDamping = this._linearDamping;
	        this.angularDamping = this._angularDamping;
	        this.isKinematic = this._isKinematic;
	        if (!this.isKinematic)
	            this._btColliderObject.type = CANNON.Body.DYNAMIC;
	        else
	            this._btColliderObject.type = CANNON.Body.KINEMATIC;
	    }
	    _onShapeChange(colShape) {
	        super._onShapeChange(colShape);
	        if (this._isKinematic) {
	            this._updateMass(0);
	        }
	        else {
	            this._updateMass(this._mass);
	        }
	    }
	    _parse(data) {
	        (data.friction != null) && (this.friction = data.friction);
	        (data.restitution != null) && (this.restitution = data.restitution);
	        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
	        (data.mass != null) && (this.mass = data.mass);
	        (data.isKinematic != null) && (this.isKinematic = data.isKinematic);
	        (data.linearDamping != null) && (this.linearDamping = data.linearDamping);
	        (data.angularDamping != null) && (this.angularDamping = data.angularDamping);
	        super._parse(data);
	        this._parseShape(data.shapes);
	    }
	    _onDestroy() {
	        super._onDestroy();
	        this._gravity = null;
	        this._totalTorque = null;
	        this._linearVelocity = null;
	        this._angularVelocity = null;
	    }
	    _addToSimulation() {
	        this._simulation._addRigidBody(this);
	    }
	    _removeFromSimulation() {
	        this._simulation._removeRigidBody(this);
	    }
	    _cloneTo(dest) {
	        super._cloneTo(dest);
	        var destRigidbody3D = dest;
	        destRigidbody3D.isKinematic = this._isKinematic;
	        destRigidbody3D.mass = this._mass;
	        destRigidbody3D.angularDamping = this._angularDamping;
	        destRigidbody3D.linearDamping = this._linearDamping;
	        destRigidbody3D.linearVelocity = this._linearVelocity;
	        destRigidbody3D.angularVelocity = this._angularVelocity;
	    }
	    applyForce(force, localOffset = null) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var btForce = CannonRigidbody3D._btTempVector30;
	        btForce.set(force.x, force.y, force.z);
	        var btOffset = CannonRigidbody3D._btTempVector31;
	        if (localOffset)
	            btOffset.set(localOffset.x, localOffset.y, localOffset.z);
	        else
	            btOffset.set(0.0, 0.0, 0.0);
	        this.btColliderObject.applyLocalForce(btForce, btOffset);
	    }
	    applyTorque(torque) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var btTorque = CannonRigidbody3D._btTempVector30;
	        btTorque.set(torque.x, torque.y, torque.z);
	        var oriTorque = this.btColliderObject.torque;
	        oriTorque.set(oriTorque.x + btTorque.x, oriTorque.y + btTorque.y, oriTorque.z + btTorque.z);
	        this.btColliderObject.torque = oriTorque;
	    }
	    applyImpulse(impulse, localOffset = null) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var btForce = CannonRigidbody3D._btTempVector30;
	        btForce.set(impulse.x, impulse.y, impulse.z);
	        var btOffset = CannonRigidbody3D._btTempVector31;
	        if (localOffset)
	            btOffset.set(localOffset.x, localOffset.y, localOffset.z);
	        else
	            btOffset.set(0.0, 0.0, 0.0);
	        this.btColliderObject.applyImpulse(btForce, btOffset);
	    }
	    wakeUp() {
	        this._btColliderObject && this._btColliderObject.wakeUp();
	    }
	    clearForces() {
	        var rigidBody = this._btColliderObject;
	        if (rigidBody == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        rigidBody.velocity.set(0.0, 0.0, 0.0);
	        rigidBody.velocity = rigidBody.velocity;
	        rigidBody.angularVelocity.set(0.0, 0.0, 0.0);
	        rigidBody.angularVelocity = rigidBody.angularVelocity;
	    }
	}
	CannonRigidbody3D.TYPE_STATIC = 0;
	CannonRigidbody3D.TYPE_DYNAMIC = 1;
	CannonRigidbody3D.TYPE_KINEMATIC = 2;
	CannonRigidbody3D._BT_DISABLE_WORLD_GRAVITY = 1;
	CannonRigidbody3D._BT_ENABLE_GYROPSCOPIC_FORCE = 2;

	class CannonCompoundColliderShape extends CannonColliderShape {
	    constructor() {
	        super();
	        this._childColliderShapes = [];
	        this._type = CannonColliderShape.SHAPETYPES_COMPOUND;
	    }
	    static __init__() {
	    }
	    _clearChildShape(shape) {
	        shape._attatched = false;
	        shape._compoundParent = null;
	        shape._indexInCompound = -1;
	    }
	    _addReference() {
	        this._referenceCount++;
	    }
	    _removeReference() {
	        this._referenceCount--;
	    }
	    addChildShape(shape, localOffset = null) {
	        if (shape._attatched)
	            throw "CompoundColliderShape: this shape has attatched to other entity.";
	        shape._attatched = true;
	        shape._compoundParent = this;
	        shape._indexInCompound = this._childColliderShapes.length;
	        this._childColliderShapes.push(shape);
	        shape.localOffset = localOffset;
	        if (this.physicColliderObject) {
	            CannonCompoundColliderShape._tempCannonQue.set(0, 0, 0, 1);
	            CannonCompoundColliderShape._tempCannonVec.set(localOffset.x * this._scale.x, localOffset.y * this._scale.y, localOffset.z * this._scale.z);
	            this.physicColliderObject._btColliderObject.addShape(shape._btShape, CannonCompoundColliderShape._tempCannonVec, CANNON.Vec3.ZERO);
	        }
	    }
	    removeChildShape(shape) {
	        if (shape._compoundParent === this) {
	            var index = shape._indexInCompound;
	            this._clearChildShape(shape);
	            var endShape = this._childColliderShapes[this._childColliderShapes.length - 1];
	            endShape._indexInCompound = index;
	            this._childColliderShapes[index] = endShape;
	            this._childColliderShapes.pop();
	            if (this.physicColliderObject)
	                this.bindRigidBody(this.physicColliderObject);
	        }
	    }
	    bindRigidBody(rigidbody) {
	        this.physicColliderObject = rigidbody;
	        var body = rigidbody._btColliderObject;
	        body.shapes.length = 0;
	        body.shapeOffsets.length = 0;
	        body.shapeOrientations.length = 0;
	        var origoffset;
	        for (var i = 0, n = this._childColliderShapes.length; i != n; i++) {
	            var shape = this._childColliderShapes[i];
	            body.shapes.push(shape._btShape);
	            origoffset = shape.localOffset;
	            body.shapeOffsets.push(new CANNON.Vec3(origoffset.x * this._scale.x, origoffset.y * this._scale.y, origoffset.z * this._scale.z));
	            body.shapeOrientations.push(CannonCompoundColliderShape._tempCannonQue);
	        }
	        body.updateMassProperties();
	        body.updateBoundingRadius();
	        body.aabbNeedsUpdate = true;
	    }
	    _setScale(scale) {
	        this._scale.setValue(scale.x, scale.y, scale.z);
	        var body = this.physicColliderObject._btColliderObject;
	        var length = this.getChildShapeCount();
	        var shapeoffsets = body.shapeOffsets;
	        for (var i = 0; i < length; i++) {
	            var offset = shapeoffsets[i];
	            var shape = this._childColliderShapes[i];
	            shape._setScale(scale);
	            var orioffset = shape.localOffset;
	            offset.set(orioffset.x * scale.x, orioffset.y * scale.y, orioffset.z * scale.z);
	        }
	        body.updateMassProperties();
	        body.updateBoundingRadius();
	        body.aabbNeedsUpdate = true;
	    }
	    getChildShapeCount() {
	        return this._childColliderShapes.length;
	    }
	    cloneTo(destObject) {
	        var destCompoundColliderShape = destObject;
	        for (var i = 0, n = this._childColliderShapes.length; i < n; i++)
	            destCompoundColliderShape.addChildShape(this._childColliderShapes[i].clone());
	    }
	    clone() {
	        var dest = new CannonCompoundColliderShape();
	        this.cloneTo(dest);
	        return dest;
	    }
	    destroy() {
	        super.destroy();
	        for (var i = 0, n = this._childColliderShapes.length; i < n; i++) {
	            var childShape = this._childColliderShapes[i];
	            if (childShape._referenceCount === 0)
	                childShape.destroy();
	        }
	    }
	}
	CannonCompoundColliderShape._tempCannonQue = new CANNON.Quaternion(0, 0, 0, 1);
	CannonCompoundColliderShape._tempCannonVec = new CANNON.Vec3(0, 0, 0);

	exports.CannonBoxColliderShape = CannonBoxColliderShape;
	exports.CannonColliderShape = CannonColliderShape;
	exports.CannonCollision = CannonCollision;
	exports.CannonCollisionTool = CannonCollisionTool;
	exports.CannonCompoundColliderShape = CannonCompoundColliderShape;
	exports.CannonContactPoint = CannonContactPoint;
	exports.CannonHitResult = CannonHitResult;
	exports.CannonPhysicsCollider = CannonPhysicsCollider;
	exports.CannonPhysicsComponent = CannonPhysicsComponent;
	exports.CannonPhysicsSettings = CannonPhysicsSettings;
	exports.CannonPhysicsSimulation = CannonPhysicsSimulation;
	exports.CannonPhysicsTriggerComponent = CannonPhysicsTriggerComponent;
	exports.CannonPhysicsUpdateList = CannonPhysicsUpdateList;
	exports.CannonRigidbody3D = CannonRigidbody3D;
	exports.CannonSphereColliderShape = CannonSphereColliderShape;

}(window.Laya = window.Laya || {}, Laya));
