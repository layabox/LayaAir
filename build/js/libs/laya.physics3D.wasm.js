window.Physics3D = function (initialMemory, interactive) {
  return new Promise((resolve) => {
    var mem = new WebAssembly.Memory({ initial: initialMemory });
    fetch("laya.physics3D.wasm.wasm").then((response) => {
      response.arrayBuffer().then((buffer) => {
        WebAssembly.instantiate(buffer, {
          LayaAirInteractive: interactive,
          wasi_unstable: {
            fd_close: () => { console.log('fd_close'); },
            fd_seek: () => { console.log('fd_seek'); },
            fd_write: () => { console.log('fd_write'); }
          },
          env: {
            memory: mem,
          }
        }).then((physics3D) => {
          window.Physics3D = physics3D.instance.exports;
          resolve();
        });
      });
    });
  });
};

(function (exports, Laya) {
	'use strict';

	class ColliderShape {
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
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        ColliderShape._btScale = bt.btVector3_create(1, 1, 1);
	        ColliderShape._btVector30 = bt.btVector3_create(0, 0, 0);
	        ColliderShape._btQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
	        ColliderShape._btTransform0 = bt.btTransform_create();
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
	        this._localOffset = value;
	        if (this._compoundParent)
	            this._compoundParent._updateChildTransform(this);
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
	        if (this._compoundParent) {
	            this.updateLocalTransformations();
	        }
	        else {
	            var bt = Laya.ILaya3D.Physics3D._bullet;
	            bt.btVector3_setValue(ColliderShape._btScale, value.x, value.y, value.z);
	            bt.btCollisionShape_setLocalScaling(this._btShape, ColliderShape._btScale);
	        }
	    }
	    _addReference() {
	        this._referenceCount++;
	    }
	    _removeReference() {
	        this._referenceCount--;
	    }
	    updateLocalTransformations() {
	        if (this._compoundParent) {
	            var offset = ColliderShape._tempVector30;
	            Laya.Vector3.multiply(this.localOffset, this._scale, offset);
	            ColliderShape._createAffineTransformation(offset, this.localRotation, this._centerMatrix.elements);
	        }
	        else {
	            ColliderShape._createAffineTransformation(this.localOffset, this.localRotation, this._centerMatrix.elements);
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
	            Laya.ILaya3D.Physics3D._bullet.btCollisionShape_destroy(this._btShape);
	            this._btShape = null;
	        }
	    }
	}
	ColliderShape.SHAPEORIENTATION_UPX = 0;
	ColliderShape.SHAPEORIENTATION_UPY = 1;
	ColliderShape.SHAPEORIENTATION_UPZ = 2;
	ColliderShape.SHAPETYPES_BOX = 0;
	ColliderShape.SHAPETYPES_SPHERE = 1;
	ColliderShape.SHAPETYPES_CYLINDER = 2;
	ColliderShape.SHAPETYPES_CAPSULE = 3;
	ColliderShape.SHAPETYPES_CONVEXHULL = 4;
	ColliderShape.SHAPETYPES_COMPOUND = 5;
	ColliderShape.SHAPETYPES_STATICPLANE = 6;
	ColliderShape.SHAPETYPES_CONE = 7;
	ColliderShape._tempVector30 = new Laya.Vector3();

	class BoxColliderShape extends ColliderShape {
	    constructor(sizeX = 1.0, sizeY = 1.0, sizeZ = 1.0) {
	        super();
	        this._sizeX = sizeX;
	        this._sizeY = sizeY;
	        this._sizeZ = sizeZ;
	        this._type = ColliderShape.SHAPETYPES_BOX;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(BoxColliderShape._btSize, sizeX / 2, sizeY / 2, sizeZ / 2);
	        this._btShape = bt.btBoxShape_create(BoxColliderShape._btSize);
	    }
	    static __init__() {
	        BoxColliderShape._btSize = Laya.ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
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
	    clone() {
	        var dest = new BoxColliderShape(this._sizeX, this._sizeY, this._sizeZ);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class CapsuleColliderShape extends ColliderShape {
	    constructor(radius = 0.5, length = 1.25, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
	        super();
	        this._radius = radius;
	        this._length = length;
	        this._orientation = orientation;
	        this._type = ColliderShape.SHAPETYPES_CAPSULE;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        switch (orientation) {
	            case ColliderShape.SHAPEORIENTATION_UPX:
	                this._btShape = bt.btCapsuleShapeX_create(radius, length - radius * 2);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPY:
	                this._btShape = bt.btCapsuleShape_create(radius, length - radius * 2);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPZ:
	                this._btShape = bt.btCapsuleShapeZ_create(radius, length - radius * 2);
	                break;
	            default:
	                throw "CapsuleColliderShape:unknown orientation.";
	        }
	    }
	    get radius() {
	        return this._radius;
	    }
	    get length() {
	        return this._length;
	    }
	    get orientation() {
	        return this._orientation;
	    }
	    _setScale(value) {
	        var fixScale = CapsuleColliderShape._tempVector30;
	        switch (this.orientation) {
	            case ColliderShape.SHAPEORIENTATION_UPX:
	                fixScale.x = value.x;
	                fixScale.y = fixScale.z = Math.max(value.y, value.z);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPY:
	                fixScale.y = value.y;
	                fixScale.x = fixScale.z = Math.max(value.x, value.z);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPZ:
	                fixScale.z = value.z;
	                fixScale.x = fixScale.y = Math.max(value.x, value.y);
	                break;
	            default:
	                throw "CapsuleColliderShape:unknown orientation.";
	        }
	        super._setScale(fixScale);
	    }
	    clone() {
	        var dest = new CapsuleColliderShape(this._radius, this._length, this._orientation);
	        this.cloneTo(dest);
	        return dest;
	    }
	}
	CapsuleColliderShape._tempVector30 = new Laya.Vector3();

	class CompoundColliderShape extends ColliderShape {
	    constructor() {
	        super();
	        this._childColliderShapes = [];
	        this._type = ColliderShape.SHAPETYPES_COMPOUND;
	        this._btShape = Laya.ILaya3D.Physics3D._bullet.btCompoundShape_create();
	    }
	    static __init__() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        CompoundColliderShape._btVector3One = bt.btVector3_create(1, 1, 1);
	        CompoundColliderShape._btTransform = bt.btTransform_create();
	        CompoundColliderShape._btOffset = bt.btVector3_create(0, 0, 0);
	        CompoundColliderShape._btRotation = bt.btQuaternion_create(0, 0, 0, 1);
	    }
	    _clearChildShape(shape) {
	        shape._attatched = false;
	        shape._compoundParent = null;
	        shape._indexInCompound = -1;
	    }
	    _addReference() {
	    }
	    _removeReference() {
	    }
	    _updateChildTransform(shape) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var offset = shape.localOffset;
	        var rotation = shape.localRotation;
	        var btOffset = ColliderShape._btVector30;
	        var btQuaternion = ColliderShape._btQuaternion0;
	        var btTransform = ColliderShape._btTransform0;
	        bt.btVector3_setValue(btOffset, -offset.x, offset.y, offset.z);
	        bt.btQuaternion_setValue(btQuaternion, -rotation.x, rotation.y, rotation.z, -rotation.w);
	        bt.btTransform_setOrigin(btTransform, btOffset);
	        bt.btTransform_setRotation(btTransform, btQuaternion);
	        bt.btCompoundShape_updateChildTransform(this._btShape, shape._indexInCompound, btTransform, true);
	    }
	    addChildShape(shape) {
	        if (shape._attatched)
	            throw "CompoundColliderShape: this shape has attatched to other entity.";
	        shape._attatched = true;
	        shape._compoundParent = this;
	        shape._indexInCompound = this._childColliderShapes.length;
	        this._childColliderShapes.push(shape);
	        var offset = shape.localOffset;
	        var rotation = shape.localRotation;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(CompoundColliderShape._btOffset, -offset.x, offset.y, offset.z);
	        bt.btQuaternion_setValue(CompoundColliderShape._btRotation, -rotation.x, rotation.y, rotation.z, -rotation.w);
	        bt.btTransform_setOrigin(CompoundColliderShape._btTransform, CompoundColliderShape._btOffset);
	        bt.btTransform_setRotation(CompoundColliderShape._btTransform, CompoundColliderShape._btRotation);
	        var btScale = bt.btCollisionShape_getLocalScaling(this._btShape);
	        bt.btCollisionShape_setLocalScaling(this._btShape, CompoundColliderShape._btVector3One);
	        bt.btCompoundShape_addChildShape(this._btShape, CompoundColliderShape._btTransform, shape._btShape);
	        bt.btCollisionShape_setLocalScaling(this._btShape, btScale);
	        (this._attatchedCollisionObject) && (this._attatchedCollisionObject.colliderShape = this);
	    }
	    removeChildShape(shape) {
	        if (shape._compoundParent === this) {
	            var index = shape._indexInCompound;
	            this._clearChildShape(shape);
	            var endShape = this._childColliderShapes[this._childColliderShapes.length - 1];
	            endShape._indexInCompound = index;
	            this._childColliderShapes[index] = endShape;
	            this._childColliderShapes.pop();
	            Laya.ILaya3D.Physics3D._bullet.btCompoundShape_removeChildShapeByIndex(this._btShape, index);
	        }
	    }
	    clearChildShape() {
	        for (var i = 0, n = this._childColliderShapes.length; i < n; i++) {
	            this._clearChildShape(this._childColliderShapes[i]);
	            Laya.ILaya3D.Physics3D._bullet.btCompoundShape_removeChildShapeByIndex(this._btShape, 0);
	        }
	        this._childColliderShapes.length = 0;
	    }
	    getChildShapeCount() {
	        return this._childColliderShapes.length;
	    }
	    cloneTo(destObject) {
	        var destCompoundColliderShape = destObject;
	        destCompoundColliderShape.clearChildShape();
	        for (var i = 0, n = this._childColliderShapes.length; i < n; i++)
	            destCompoundColliderShape.addChildShape(this._childColliderShapes[i].clone());
	    }
	    clone() {
	        var dest = new CompoundColliderShape();
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

	class ConeColliderShape extends ColliderShape {
	    constructor(radius = 0.5, height = 1.0, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
	        super();
	        this._radius = 1;
	        this._height = 0.5;
	        this._radius = radius;
	        this._height = height;
	        this._orientation = orientation;
	        this._type = ColliderShape.SHAPETYPES_CYLINDER;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        switch (orientation) {
	            case ColliderShape.SHAPEORIENTATION_UPX:
	                this._btShape = bt.btConeShapeX_create(radius, height);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPY:
	                this._btShape = bt.btConeShape_create(radius, height);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPZ:
	                this._btShape = bt.btConeShapeZ_create(radius, height);
	                break;
	            default:
	                throw "ConeColliderShape:unknown orientation.";
	        }
	    }
	    get radius() {
	        return this._radius;
	    }
	    get height() {
	        return this._height;
	    }
	    get orientation() {
	        return this._orientation;
	    }
	    clone() {
	        var dest = new ConeColliderShape(this._radius, this._height, this._orientation);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class CylinderColliderShape extends ColliderShape {
	    constructor(radius = 0.5, height = 1.0, orientation = ColliderShape.SHAPEORIENTATION_UPY) {
	        super();
	        this._radius = 1;
	        this._height = 0.5;
	        this._radius = radius;
	        this._height = height;
	        this._orientation = orientation;
	        this._type = ColliderShape.SHAPETYPES_CYLINDER;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        switch (orientation) {
	            case ColliderShape.SHAPEORIENTATION_UPX:
	                bt.btVector3_setValue(CylinderColliderShape._btSize, height / 2, radius, radius);
	                this._btShape = bt.btCylinderShapeX_create(CylinderColliderShape._btSize);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPY:
	                bt.btVector3_setValue(CylinderColliderShape._btSize, radius, height / 2, radius);
	                this._btShape = bt.btCylinderShape_create(CylinderColliderShape._btSize);
	                break;
	            case ColliderShape.SHAPEORIENTATION_UPZ:
	                bt.btVector3_setValue(CylinderColliderShape._btSize, radius, radius, height / 2);
	                this._btShape = bt.btCylinderShapeZ_create(CylinderColliderShape._btSize);
	                break;
	            default:
	                throw "CapsuleColliderShape:unknown orientation.";
	        }
	    }
	    static __init__() {
	        CylinderColliderShape._btSize = Laya.ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	    }
	    get radius() {
	        return this._radius;
	    }
	    get height() {
	        return this._height;
	    }
	    get orientation() {
	        return this._orientation;
	    }
	    clone() {
	        var dest = new CylinderColliderShape(this._radius, this._height, this._orientation);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class MeshColliderShape extends ColliderShape {
	    constructor() {
	        super();
	        this._mesh = null;
	        this._convex = false;
	    }
	    get mesh() {
	        return this._mesh;
	    }
	    set mesh(value) {
	        if (this._mesh !== value) {
	            var bt = Laya.ILaya3D.Physics3D._bullet;
	            if (this._mesh) {
	                bt.btCollisionShape_destroy(this._btShape);
	            }
	            if (value) {
	                this._btShape = bt.btGImpactMeshShape_create(value._getPhysicMesh());
	                bt.btGImpactShapeInterface_updateBound(this._btShape);
	            }
	            this._mesh = value;
	        }
	    }
	    get convex() {
	        return this._convex;
	    }
	    set convex(value) {
	        this._convex = value;
	    }
	    _setScale(value) {
	        if (this._compoundParent) {
	            this.updateLocalTransformations();
	        }
	        else {
	            var bt = Laya.ILaya3D.Physics3D._bullet;
	            bt.btVector3_setValue(ColliderShape._btScale, value.x, value.y, value.z);
	            bt.btCollisionShape_setLocalScaling(this._btShape, ColliderShape._btScale);
	            bt.btGImpactShapeInterface_updateBound(this._btShape);
	        }
	    }
	    cloneTo(destObject) {
	        var destMeshCollider = destObject;
	        destMeshCollider.convex = this._convex;
	        destMeshCollider.mesh = this._mesh;
	        super.cloneTo(destObject);
	    }
	    clone() {
	        var dest = new MeshColliderShape();
	        this.cloneTo(dest);
	        return dest;
	    }
	    destroy() {
	        if (this._btShape) {
	            Laya.ILaya3D.Physics3D._bullet.btCollisionShape_destroy(this._btShape);
	            this._btShape = null;
	        }
	    }
	}

	class SphereColliderShape extends ColliderShape {
	    constructor(radius = 0.5) {
	        super();
	        this._radius = radius;
	        this._type = ColliderShape.SHAPETYPES_SPHERE;
	        this._btShape = Laya.ILaya3D.Physics3D._bullet.btSphereShape_create(radius);
	    }
	    get radius() {
	        return this._radius;
	    }
	    clone() {
	        var dest = new SphereColliderShape(this._radius);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	class PhysicsComponent extends Laya.Component {
	    constructor(collisionGroup, canCollideWith) {
	        super();
	        this._restitution = 0.0;
	        this._friction = 0.5;
	        this._rollingFriction = 0.0;
	        this._ccdMotionThreshold = 0.0;
	        this._ccdSweptSphereRadius = 0.0;
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
	        PhysicsComponent._physicObjectsMap[this.id] = this;
	    }
	    static __init__() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        PhysicsComponent._btVector30 = bt.btVector3_create(0, 0, 0);
	        PhysicsComponent._btQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
	    }
	    static _createAffineTransformationArray(tranX, tranY, tranZ, rotX, rotY, rotZ, rotW, scale, outE) {
	        var x2 = rotX + rotX, y2 = rotY + rotY, z2 = rotZ + rotZ;
	        var xx = rotX * x2, xy = rotX * y2, xz = rotX * z2, yy = rotY * y2, yz = rotY * z2, zz = rotZ * z2;
	        var wx = rotW * x2, wy = rotW * y2, wz = rotW * z2, sx = scale[0], sy = scale[1], sz = scale[2];
	        outE[0] = (1 - (yy + zz)) * sx;
	        outE[1] = (xy + wz) * sx;
	        outE[2] = (xz - wy) * sx;
	        outE[3] = 0;
	        outE[4] = (xy - wz) * sy;
	        outE[5] = (1 - (xx + zz)) * sy;
	        outE[6] = (yz + wx) * sy;
	        outE[7] = 0;
	        outE[8] = (xz + wy) * sz;
	        outE[9] = (yz - wx) * sz;
	        outE[10] = (1 - (xx + yy)) * sz;
	        outE[11] = 0;
	        outE[12] = tranX;
	        outE[13] = tranY;
	        outE[14] = tranZ;
	        outE[15] = 1;
	    }
	    static _creatShape(shapeData) {
	        var colliderShape;
	        switch (shapeData.type) {
	            case "BoxColliderShape":
	                var sizeData = shapeData.size;
	                colliderShape = sizeData ? new BoxColliderShape(sizeData[0], sizeData[1], sizeData[2]) : new BoxColliderShape();
	                break;
	            case "SphereColliderShape":
	                colliderShape = new SphereColliderShape(shapeData.radius);
	                break;
	            case "CapsuleColliderShape":
	                colliderShape = new CapsuleColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
	                break;
	            case "MeshColliderShape":
	                var meshCollider = new MeshColliderShape();
	                shapeData.mesh && (meshCollider.mesh = Laya.Loader.getRes(shapeData.mesh));
	                colliderShape = meshCollider;
	                break;
	            case "ConeColliderShape":
	                colliderShape = new ConeColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
	                break;
	            case "CylinderColliderShape":
	                colliderShape = new CylinderColliderShape(shapeData.radius, shapeData.height, shapeData.orientation);
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
	    static physicVector3TransformQuat(source, qx, qy, qz, qw, out) {
	        var x = source.x, y = source.y, z = source.z, ix = qw * x + qy * z - qz * y, iy = qw * y + qz * x - qx * z, iz = qw * z + qx * y - qy * x, iw = -qx * x - qy * y - qz * z;
	        out.x = ix * qw + iw * -qx + iy * -qz - iz * -qy;
	        out.y = iy * qw + iw * -qy + iz * -qx - ix * -qz;
	        out.z = iz * qw + iw * -qz + ix * -qy - iy * -qx;
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
	        this._btColliderObject && Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setRestitution(this._btColliderObject, value);
	    }
	    get friction() {
	        return this._friction;
	    }
	    set friction(value) {
	        this._friction = value;
	        this._btColliderObject && Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setFriction(this._btColliderObject, value);
	    }
	    get rollingFriction() {
	        return this._rollingFriction;
	    }
	    set rollingFriction(value) {
	        this._rollingFriction = value;
	        this._btColliderObject && Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setRollingFriction(this._btColliderObject, value);
	    }
	    get ccdMotionThreshold() {
	        return this._ccdMotionThreshold;
	    }
	    set ccdMotionThreshold(value) {
	        this._ccdMotionThreshold = value;
	        this._btColliderObject && Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setCcdMotionThreshold(this._btColliderObject, value);
	    }
	    get ccdSweptSphereRadius() {
	        return this._ccdSweptSphereRadius;
	    }
	    set ccdSweptSphereRadius(value) {
	        this._ccdSweptSphereRadius = value;
	        this._btColliderObject && Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setCcdSweptSphereRadius(this._btColliderObject, value);
	    }
	    get isActive() {
	        return this._btColliderObject ? Laya.ILaya3D.Physics3D._bullet.btCollisionObject_isActive(this._btColliderObject) : false;
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
	                Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setCollisionShape(this._btColliderObject, value._btShape);
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
	            if (this._simulation && this._colliderShape && this._enabled) {
	                this._removeFromSimulation();
	                this._addToSimulation();
	            }
	        }
	    }
	    _parseShape(shapesData) {
	        var shapeCount = shapesData.length;
	        if (shapeCount === 1) {
	            var shape = PhysicsComponent._creatShape(shapesData[0]);
	            this.colliderShape = shape;
	        }
	        else {
	            var compoundShape = new CompoundColliderShape();
	            for (var i = 0; i < shapeCount; i++) {
	                shape = PhysicsComponent._creatShape(shapesData[i]);
	                compoundShape.addChildShape(shape);
	            }
	            this.colliderShape = compoundShape;
	        }
	    }
	    _onScaleChange(scale) {
	        this._colliderShape._setScale(scale);
	    }
	    _onEnable() {
	        this._simulation = this.owner._scene.physicsSimulation;
	        Laya.ILaya3D.Physics3D._bullet.btCollisionObject_setContactProcessingThreshold(this._btColliderObject, 0);
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
	        delete PhysicsComponent._physicObjectsMap[this.id];
	        Laya.ILaya3D.Physics3D._bullet.btCollisionObject_destroy(this._btColliderObject);
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
	        (data.ccdMotionThreshold != null) && (this.ccdMotionThreshold = data.ccdMotionThreshold);
	        (data.ccdSweptSphereRadius != null) && (this.ccdSweptSphereRadius = data.ccdSweptSphereRadius);
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
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btColliderObject = this._btColliderObject;
	        var btTransform = bt.btCollisionObject_getWorldTransform(btColliderObject);
	        this._innerDerivePhysicsTransformation(btTransform, force);
	        bt.btCollisionObject_setWorldTransform(btColliderObject, btTransform);
	    }
	    _innerDerivePhysicsTransformation(physicTransformOut, force) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var transform = this.owner._transform;
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION)) {
	            var shapeOffset = this._colliderShape.localOffset;
	            var position = transform.position;
	            var btPosition = PhysicsComponent._btVector30;
	            if (shapeOffset.x !== 0 || shapeOffset.y !== 0 || shapeOffset.z !== 0) {
	                var physicPosition = PhysicsComponent._tempVector30;
	                var worldMat = transform.worldMatrix;
	                Laya.Vector3.transformCoordinate(shapeOffset, worldMat, physicPosition);
	                bt.btVector3_setValue(btPosition, -physicPosition.x, physicPosition.y, physicPosition.z);
	            }
	            else {
	                bt.btVector3_setValue(btPosition, -position.x, position.y, position.z);
	            }
	            bt.btTransform_setOrigin(physicTransformOut, btPosition);
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDPOSITION, false);
	        }
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION)) {
	            var shapeRotation = this._colliderShape.localRotation;
	            var btRotation = PhysicsComponent._btQuaternion0;
	            var rotation = transform.rotation;
	            if (shapeRotation.x !== 0 || shapeRotation.y !== 0 || shapeRotation.z !== 0 || shapeRotation.w !== 1) {
	                var physicRotation = PhysicsComponent._tempQuaternion0;
	                PhysicsComponent.physicQuaternionMultiply(rotation.x, rotation.y, rotation.z, rotation.w, shapeRotation, physicRotation);
	                bt.btQuaternion_setValue(btRotation, -physicRotation.x, physicRotation.y, physicRotation.z, -physicRotation.w);
	            }
	            else {
	                bt.btQuaternion_setValue(btRotation, -rotation.x, rotation.y, rotation.z, -rotation.w);
	            }
	            bt.btTransform_setRotation(physicTransformOut, btRotation);
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDQUATERNION, false);
	        }
	        if (force || this._getTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE)) {
	            this._onScaleChange(transform.getWorldLossyScale());
	            this._setTransformFlag(Laya.Transform3D.TRANSFORM_WORLDSCALE, false);
	        }
	    }
	    _updateTransformComponent(physicsTransform) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var colliderShape = this._colliderShape;
	        var localOffset = colliderShape.localOffset;
	        var localRotation = colliderShape.localRotation;
	        var transform = this.owner._transform;
	        var position = transform.position;
	        var rotation = transform.rotation;
	        var btPosition = bt.btTransform_getOrigin(physicsTransform);
	        var btRotation = bt.btTransform_getRotation(physicsTransform);
	        var btRotX = -bt.btQuaternion_x(btRotation);
	        var btRotY = bt.btQuaternion_y(btRotation);
	        var btRotZ = bt.btQuaternion_z(btRotation);
	        var btRotW = -bt.btQuaternion_w(btRotation);
	        if (localRotation.x !== 0 || localRotation.y !== 0 || localRotation.z !== 0 || localRotation.w !== 1) {
	            var invertShapeRotaion = PhysicsComponent._tempQuaternion0;
	            localRotation.invert(invertShapeRotaion);
	            PhysicsComponent.physicQuaternionMultiply(btRotX, btRotY, btRotZ, btRotW, invertShapeRotaion, rotation);
	        }
	        else {
	            rotation.x = btRotX;
	            rotation.y = btRotY;
	            rotation.z = btRotZ;
	            rotation.w = btRotW;
	        }
	        transform.rotation = rotation;
	        if (localOffset.x !== 0 || localOffset.y !== 0 || localOffset.z !== 0) {
	            var btScale = bt.btCollisionShape_getLocalScaling(colliderShape._btShape);
	            var rotShapePosition = PhysicsComponent._tempVector30;
	            rotShapePosition.x = localOffset.x * bt.btVector3_x(btScale);
	            rotShapePosition.y = localOffset.y * bt.btVector3_y(btScale);
	            rotShapePosition.z = localOffset.z * bt.btVector3_z(btScale);
	            Laya.Vector3.transformQuat(rotShapePosition, rotation, rotShapePosition);
	            position.x = -bt.btVector3_x(btPosition) - rotShapePosition.x;
	            position.y = bt.btVector3_y(btPosition) - rotShapePosition.y;
	            position.z = bt.btVector3_z(btPosition) - rotShapePosition.z;
	        }
	        else {
	            position.x = -bt.btVector3_x(btPosition);
	            position.y = bt.btVector3_y(btPosition);
	            position.z = bt.btVector3_z(btPosition);
	        }
	        transform.position = position;
	    }
	    _onShapeChange(colShape) {
	        var btColObj = this._btColliderObject;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var flags = bt.btCollisionObject_getCollisionFlags(btColObj);
	        if (colShape.needsCustomCollisionCallback) {
	            if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) === 0)
	                bt.btCollisionObject_setCollisionFlags(btColObj, flags | PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
	        }
	        else {
	            if ((flags & PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK) > 0)
	                bt.btCollisionObject_setCollisionFlags(btColObj, flags ^ PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK);
	        }
	    }
	    _onAdded() {
	        this.enabled = this._enabled;
	        this.restitution = this._restitution;
	        this.friction = this._friction;
	        this.rollingFriction = this._rollingFriction;
	        this.ccdMotionThreshold = this._ccdMotionThreshold;
	        this.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
	        this.owner.transform.on(Laya.Event.TRANSFORM_CHANGED, this, this._onTransformChanged);
	    }
	    _onTransformChanged(flag) {
	        if (PhysicsComponent._addUpdateList || !this._controlBySimulation) {
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
	        destPhysicsComponent.rollingFriction = this._rollingFriction;
	        destPhysicsComponent.ccdMotionThreshold = this._ccdMotionThreshold;
	        destPhysicsComponent.ccdSweptSphereRadius = this._ccdSweptSphereRadius;
	        destPhysicsComponent.collisionGroup = this._collisionGroup;
	        destPhysicsComponent.canCollideWith = this._canCollideWith;
	        destPhysicsComponent.canScaleShape = this.canScaleShape;
	        (this._colliderShape) && (destPhysicsComponent.colliderShape = this._colliderShape.clone());
	    }
	}
	PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG = 1;
	PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING = 2;
	PhysicsComponent.ACTIVATIONSTATE_WANTS_DEACTIVATION = 3;
	PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION = 4;
	PhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION = 5;
	PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT = 1;
	PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT = 2;
	PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE = 4;
	PhysicsComponent.COLLISIONFLAGS_CUSTOM_MATERIAL_CALLBACK = 8;
	PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT = 16;
	PhysicsComponent.COLLISIONFLAGS_DISABLE_VISUALIZE_OBJECT = 32;
	PhysicsComponent.COLLISIONFLAGS_DISABLE_SPU_COLLISION_PROCESSING = 64;
	PhysicsComponent._tempVector30 = new Laya.Vector3();
	PhysicsComponent._tempQuaternion0 = new Laya.Quaternion();
	PhysicsComponent._tempQuaternion1 = new Laya.Quaternion();
	PhysicsComponent._tempMatrix4x40 = new Laya.Matrix4x4();
	PhysicsComponent._physicObjectsMap = {};
	PhysicsComponent._addUpdateList = true;

	class BulletInteractive {
	}
	BulletInteractive._interactive = {
	    "getWorldTransform": (rigidBodyID, worldTransPointer) => {
	    },
	    "setWorldTransform": (rigidBodyID, worldTransPointer) => {
	        var rigidBody = PhysicsComponent._physicObjectsMap[rigidBodyID];
	        rigidBody._simulation._updatedRigidbodies++;
	        rigidBody._updateTransformComponent(worldTransPointer);
	    }
	};

	class CharacterController extends PhysicsComponent {
	    constructor(stepheight = 0.1, upAxis = null, collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        super(collisionGroup, canCollideWith);
	        this._upAxis = new Laya.Vector3(0, 1, 0);
	        this._maxSlope = 45.0;
	        this._jumpSpeed = 10.0;
	        this._fallSpeed = 55.0;
	        this._gravity = new Laya.Vector3(0, -9.8 * 3, 0);
	        this._btKinematicCharacter = null;
	        this._stepHeight = stepheight;
	        (upAxis) && (this._upAxis = upAxis);
	        this._controlBySimulation = true;
	    }
	    static __init__() {
	        CharacterController._btTempVector30 = Laya.ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	    }
	    get fallSpeed() {
	        return this._fallSpeed;
	    }
	    set fallSpeed(value) {
	        this._fallSpeed = value;
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_setFallSpeed(this._btKinematicCharacter, value);
	    }
	    get jumpSpeed() {
	        return this._jumpSpeed;
	    }
	    set jumpSpeed(value) {
	        this._jumpSpeed = value;
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_setJumpSpeed(this._btKinematicCharacter, value);
	    }
	    get gravity() {
	        return this._gravity;
	    }
	    set gravity(value) {
	        this._gravity = value;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btGravity = CharacterController._btTempVector30;
	        bt.btVector3_setValue(btGravity, -value.x, value.y, value.z);
	        bt.btKinematicCharacterController_setGravity(this._btKinematicCharacter, btGravity);
	    }
	    get maxSlope() {
	        return this._maxSlope;
	    }
	    set maxSlope(value) {
	        this._maxSlope = value;
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_setMaxSlope(this._btKinematicCharacter, (value / 180) * Math.PI);
	    }
	    get isGrounded() {
	        return Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_onGround(this._btKinematicCharacter);
	    }
	    get stepHeight() {
	        return this._stepHeight;
	    }
	    set stepHeight(value) {
	        this._stepHeight = value;
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_setStepHeight(this._btKinematicCharacter, value);
	    }
	    get upAxis() {
	        return this._upAxis;
	    }
	    set upAxis(value) {
	        this._upAxis = value;
	        var btUpAxis = CharacterController._btTempVector30;
	        Laya.Utils3D._convertToBulletVec3(value, btUpAxis, false);
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_setUp(this._btKinematicCharacter, btUpAxis);
	    }
	    _constructCharacter() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        if (this._btKinematicCharacter)
	            bt.btKinematicCharacterController_destroy(this._btKinematicCharacter);
	        var btUpAxis = CharacterController._btTempVector30;
	        bt.btVector3_setValue(btUpAxis, this._upAxis.x, this._upAxis.y, this._upAxis.z);
	        this._btKinematicCharacter = bt.btKinematicCharacterController_create(this._btColliderObject, this._colliderShape._btShape, this._stepHeight, btUpAxis);
	        this.fallSpeed = this._fallSpeed;
	        this.maxSlope = this._maxSlope;
	        this.jumpSpeed = this._jumpSpeed;
	        this.gravity = this._gravity;
	    }
	    _onShapeChange(colShape) {
	        super._onShapeChange(colShape);
	        this._constructCharacter();
	    }
	    _onAdded() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var ghostObject = bt.btPairCachingGhostObject_create();
	        bt.btCollisionObject_setUserIndex(ghostObject, this.id);
	        bt.btCollisionObject_setCollisionFlags(ghostObject, PhysicsComponent.COLLISIONFLAGS_CHARACTER_OBJECT);
	        this._btColliderObject = ghostObject;
	        (this._colliderShape) && (this._constructCharacter());
	        super._onAdded();
	    }
	    _addToSimulation() {
	        this._simulation._characters.push(this);
	        this._simulation._addCharacter(this, this._collisionGroup, this._canCollideWith);
	    }
	    _removeFromSimulation() {
	        this._simulation._removeCharacter(this);
	        var characters = this._simulation._characters;
	        characters.splice(characters.indexOf(this), 1);
	    }
	    _cloneTo(dest) {
	        super._cloneTo(dest);
	        var destCharacterController = dest;
	        destCharacterController.stepHeight = this._stepHeight;
	        destCharacterController.upAxis = this._upAxis;
	        destCharacterController.maxSlope = this._maxSlope;
	        destCharacterController.jumpSpeed = this._jumpSpeed;
	        destCharacterController.fallSpeed = this._fallSpeed;
	        destCharacterController.gravity = this._gravity;
	    }
	    _onDestroy() {
	        Laya.ILaya3D.Physics3D._bullet.btKinematicCharacterController_destroy(this._btKinematicCharacter);
	        super._onDestroy();
	        this._btKinematicCharacter = null;
	    }
	    move(movement) {
	        var btMovement = CharacterController._btVector30;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(btMovement, -movement.x, movement.y, movement.z);
	        bt.btKinematicCharacterController_setWalkDirection(this._btKinematicCharacter, btMovement);
	    }
	    jump(velocity = null) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btVelocity = CharacterController._btVector30;
	        if (velocity) {
	            Laya.Utils3D._convertToBulletVec3(velocity, btVelocity, true);
	            bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
	        }
	        else {
	            bt.btVector3_setValue(btVelocity, 0, 0, 0);
	            bt.btKinematicCharacterController_jump(this._btKinematicCharacter, btVelocity);
	        }
	    }
	}
	CharacterController.UPAXIS_X = 0;
	CharacterController.UPAXIS_Y = 1;
	CharacterController.UPAXIS_Z = 2;

	class Collision {
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

	class ContactPoint {
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

	class HitResult {
	    constructor() {
	        this.succeeded = false;
	        this.collider = null;
	        this.point = new Laya.Vector3();
	        this.normal = new Laya.Vector3();
	        this.hitFraction = 0;
	    }
	}

	class CollisionTool {
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
	            hitResult = new HitResult();
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
	            contactPoint = new ContactPoint();
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
	            collision = this._collisionsPool.length === 0 ? new Collision() : this._collisionsPool.pop();
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

	class Constraint3D {
	    constructor() {
	    }
	}

	class PhysicsTriggerComponent extends PhysicsComponent {
	    constructor(collisionGroup, canCollideWith) {
	        super(collisionGroup, canCollideWith);
	        this._isTrigger = false;
	    }
	    get isTrigger() {
	        return this._isTrigger;
	    }
	    set isTrigger(value) {
	        this._isTrigger = value;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        if (this._btColliderObject) {
	            var flags = bt.btCollisionObject_getCollisionFlags(this._btColliderObject);
	            if (value) {
	                if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) === 0)
	                    bt.btCollisionObject_setCollisionFlags(this._btColliderObject, flags | PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
	            }
	            else {
	                if ((flags & PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE) !== 0)
	                    bt.btCollisionObject_setCollisionFlags(this._btColliderObject, flags ^ PhysicsComponent.COLLISIONFLAGS_NO_CONTACT_RESPONSE);
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

	class PhysicsCollider extends PhysicsTriggerComponent {
	    constructor(collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        super(collisionGroup, canCollideWith);
	        this._enableProcessCollisions = false;
	    }
	    _addToSimulation() {
	        this._simulation._addPhysicsCollider(this, this._collisionGroup, this._canCollideWith);
	    }
	    _removeFromSimulation() {
	        this._simulation._removePhysicsCollider(this);
	    }
	    _parse(data) {
	        (data.friction != null) && (this.friction = data.friction);
	        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
	        (data.restitution != null) && (this.restitution = data.restitution);
	        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
	        super._parse(data);
	        this._parseShape(data.shapes);
	    }
	    _onAdded() {
	        var bt = Laya.Physics3D._bullet;
	        var btColObj = bt.btCollisionObject_create();
	        bt.btCollisionObject_setUserIndex(btColObj, this.id);
	        bt.btCollisionObject_forceActivationState(btColObj, PhysicsComponent.ACTIVATIONSTATE_DISABLE_SIMULATION);
	        var flags = bt.btCollisionObject_getCollisionFlags(btColObj);
	        if (this.owner.isStatic) {
	            if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
	                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
	            flags = flags | PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
	        }
	        else {
	            if ((flags & PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT) > 0)
	                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_STATIC_OBJECT;
	            flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
	        }
	        bt.btCollisionObject_setCollisionFlags(btColObj, flags);
	        this._btColliderObject = btColObj;
	        super._onAdded();
	    }
	}

	class PhysicsSettings {
	    constructor() {
	        this.flags = 0;
	        this.maxSubSteps = 1;
	        this.fixedTimeStep = 1.0 / 60.0;
	    }
	}

	class PhysicsUpdateList extends Laya.SingletonList {
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

	class PhysicsSimulation {
	    constructor(configuration) {
	        this._gravity = new Laya.Vector3(0, -10, 0);
	        this._btVector3Zero = Laya.ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	        this._btDefaultQuaternion = Laya.ILaya3D.Physics3D._bullet.btQuaternion_create(0, 0, 0, -1);
	        this._collisionsUtils = new CollisionTool();
	        this._previousFrameCollisions = [];
	        this._currentFrameCollisions = [];
	        this._currentConstraint = {};
	        this._physicsUpdateList = new PhysicsUpdateList();
	        this._characters = [];
	        this._updatedRigidbodies = 0;
	        this.maxSubSteps = 1;
	        this.fixedTimeStep = 1.0 / 60.0;
	        this.maxSubSteps = configuration.maxSubSteps;
	        this.fixedTimeStep = configuration.fixedTimeStep;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        this._btCollisionConfiguration = bt.btDefaultCollisionConfiguration_create();
	        this._btDispatcher = bt.btCollisionDispatcher_create(this._btCollisionConfiguration);
	        this._btBroadphase = bt.btDbvtBroadphase_create();
	        bt.btOverlappingPairCache_setInternalGhostPairCallback(bt.btDbvtBroadphase_getOverlappingPairCache(this._btBroadphase), bt.btGhostPairCallback_create());
	        var conFlags = configuration.flags;
	        if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY) {
	            this._btCollisionWorld = new bt.btCollisionWorld(this._btDispatcher, this._btBroadphase, this._btCollisionConfiguration);
	        }
	        else if (conFlags & PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT) {
	            throw "PhysicsSimulation:SoftBody processing is not yet available";
	        }
	        else {
	            var solver = bt.btSequentialImpulseConstraintSolver_create();
	            this._btDiscreteDynamicsWorld = bt.btDiscreteDynamicsWorld_create(this._btDispatcher, this._btBroadphase, solver, this._btCollisionConfiguration);
	            this._btCollisionWorld = this._btDiscreteDynamicsWorld;
	        }
	        if (this._btDiscreteDynamicsWorld) {
	            this._btSolverInfo = bt.btDynamicsWorld_getSolverInfo(this._btDiscreteDynamicsWorld);
	            this._btDispatchInfo = bt.btCollisionWorld_getDispatchInfo(this._btDiscreteDynamicsWorld);
	        }
	        this._btClosestRayResultCallback = bt.ClosestRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
	        this._btAllHitsRayResultCallback = bt.AllHitsRayResultCallback_create(this._btVector3Zero, this._btVector3Zero);
	        this._btClosestConvexResultCallback = bt.ClosestConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
	        this._btAllConvexResultCallback = bt.AllConvexResultCallback_create(this._btVector3Zero, this._btVector3Zero);
	        this.setHitsRayResultCallbackFlag();
	        bt.btGImpactCollisionAlgorithm_RegisterAlgorithm(this._btDispatcher);
	    }
	    static __init__() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        PhysicsSimulation._btTempVector30 = bt.btVector3_create(0, 0, 0);
	        PhysicsSimulation._btTempVector31 = bt.btVector3_create(0, 0, 0);
	        PhysicsSimulation._btTempQuaternion0 = bt.btQuaternion_create(0, 0, 0, 1);
	        PhysicsSimulation._btTempQuaternion1 = bt.btQuaternion_create(0, 0, 0, 1);
	        PhysicsSimulation._btTempTransform0 = bt.btTransform_create();
	        PhysicsSimulation._btTempTransform1 = bt.btTransform_create();
	    }
	    static createConstraint() {
	    }
	    get continuousCollisionDetection() {
	        return Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_get_m_useContinuous(this._btDispatchInfo);
	    }
	    set continuousCollisionDetection(value) {
	        Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_set_m_useContinuous(this._btDispatchInfo, value);
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
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btGravity = PhysicsSimulation._btTempVector30;
	        bt.btVector3_setValue(btGravity, -value.x, value.y, value.z);
	        bt.btDiscreteDynamicsWorld_setGravity(this._btDiscreteDynamicsWorld, btGravity);
	    }
	    get speculativeContactRestitution() {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
	        return Laya.ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_getApplySpeculativeContactRestitution(this._btDiscreteDynamicsWorld);
	    }
	    set speculativeContactRestitution(value) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_setApplySpeculativeContactRestitution(this._btDiscreteDynamicsWorld, value);
	    }
	    _simulate(deltaTime) {
	        this._updatedRigidbodies = 0;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        if (this._btDiscreteDynamicsWorld)
	            bt.btDiscreteDynamicsWorld_stepSimulation(this._btDiscreteDynamicsWorld, deltaTime, this.maxSubSteps, this.fixedTimeStep);
	        else
	            bt.PerformDiscreteCollisionDetection(this._btCollisionWorld);
	    }
	    _destroy() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        if (this._btDiscreteDynamicsWorld) {
	            bt.btCollisionWorld_destroy(this._btDiscreteDynamicsWorld);
	            this._btDiscreteDynamicsWorld = null;
	        }
	        else {
	            bt.btCollisionWorld_destroy(this._btCollisionWorld);
	            this._btCollisionWorld = null;
	        }
	        bt.btDbvtBroadphase_destroy(this._btBroadphase);
	        this._btBroadphase = null;
	        bt.btCollisionDispatcher_destroy(this._btDispatcher);
	        this._btDispatcher = null;
	        bt.btDefaultCollisionConfiguration_destroy(this._btCollisionConfiguration);
	        this._btCollisionConfiguration = null;
	    }
	    _addPhysicsCollider(component, group, mask) {
	        Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_addCollisionObject(this._btCollisionWorld, component._btColliderObject, group, mask);
	    }
	    _removePhysicsCollider(component) {
	        Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, component._btColliderObject);
	    }
	    _addRigidBody(rigidBody, group, mask) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_addRigidBody(this._btCollisionWorld, rigidBody._btColliderObject, group, mask);
	    }
	    _removeRigidBody(rigidBody) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_removeRigidBody(this._btCollisionWorld, rigidBody._btColliderObject);
	    }
	    _addCharacter(character, group, mask) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btCollisionWorld_addCollisionObject(this._btCollisionWorld, character._btColliderObject, group, mask);
	        bt.btDynamicsWorld_addAction(this._btCollisionWorld, character._btKinematicCharacter);
	    }
	    _removeCharacter(character) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Simulation:Cannot perform this action when the physics engine is set to CollisionsOnly";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btCollisionWorld_removeCollisionObject(this._btCollisionWorld, character._btColliderObject);
	        bt.btDynamicsWorld_removeAction(this._btCollisionWorld, character._btKinematicCharacter);
	    }
	    raycastFromTo(from, to, out = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var rayResultCall = this._btClosestRayResultCallback;
	        var rayFrom = PhysicsSimulation._btTempVector30;
	        var rayTo = PhysicsSimulation._btTempVector31;
	        bt.btVector3_setValue(rayFrom, -from.x, from.y, from.z);
	        bt.btVector3_setValue(rayTo, -to.x, to.y, to.z);
	        bt.ClosestRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
	        bt.ClosestRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
	        bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
	        bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);
	        bt.RayResultCallback_set_m_collisionObject(rayResultCall, null);
	        bt.RayResultCallback_set_m_closestHitFraction(rayResultCall, 1);
	        bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);
	        if (bt.RayResultCallback_hasHit(rayResultCall)) {
	            if (out) {
	                out.succeeded = true;
	                out.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.RayResultCallback_get_m_collisionObject(rayResultCall))];
	                out.hitFraction = bt.RayResultCallback_get_m_closestHitFraction(rayResultCall);
	                var btPoint = bt.ClosestRayResultCallback_get_m_hitPointWorld(rayResultCall);
	                var point = out.point;
	                point.x = -bt.btVector3_x(btPoint);
	                point.y = bt.btVector3_y(btPoint);
	                point.z = bt.btVector3_z(btPoint);
	                var btNormal = bt.ClosestRayResultCallback_get_m_hitNormalWorld(rayResultCall);
	                var normal = out.normal;
	                normal.x = -bt.btVector3_x(btNormal);
	                normal.y = bt.btVector3_y(btNormal);
	                normal.z = bt.btVector3_z(btNormal);
	            }
	            return true;
	        }
	        else {
	            if (out)
	                out.succeeded = false;
	            return false;
	        }
	    }
	    raycastAllFromTo(from, to, out, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var rayResultCall = this._btAllHitsRayResultCallback;
	        var rayFrom = PhysicsSimulation._btTempVector30;
	        var rayTo = PhysicsSimulation._btTempVector31;
	        out.length = 0;
	        bt.btVector3_setValue(rayFrom, -from.x, from.y, from.z);
	        bt.btVector3_setValue(rayTo, -to.x, to.y, to.z);
	        bt.AllHitsRayResultCallback_set_m_rayFromWorld(rayResultCall, rayFrom);
	        bt.AllHitsRayResultCallback_set_m_rayToWorld(rayResultCall, rayTo);
	        bt.RayResultCallback_set_m_collisionFilterGroup(rayResultCall, collisonGroup);
	        bt.RayResultCallback_set_m_collisionFilterMask(rayResultCall, collisionMask);
	        var collisionObjects = bt.AllHitsRayResultCallback_get_m_collisionObjects(rayResultCall);
	        var btPoints = bt.AllHitsRayResultCallback_get_m_hitPointWorld(rayResultCall);
	        var btNormals = bt.AllHitsRayResultCallback_get_m_hitNormalWorld(rayResultCall);
	        var btFractions = bt.AllHitsRayResultCallback_get_m_hitFractions(rayResultCall);
	        bt.tBtCollisionObjectArray_clear(collisionObjects);
	        bt.tVector3Array_clear(btPoints);
	        bt.tVector3Array_clear(btNormals);
	        bt.tScalarArray_clear(btFractions);
	        bt.btCollisionWorld_rayTest(this._btCollisionWorld, rayFrom, rayTo, rayResultCall);
	        var count = bt.tBtCollisionObjectArray_size(collisionObjects);
	        if (count > 0) {
	            this._collisionsUtils.recoverAllHitResultsPool();
	            for (var i = 0; i < count; i++) {
	                var hitResult = this._collisionsUtils.getHitResult();
	                out.push(hitResult);
	                hitResult.succeeded = true;
	                hitResult.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
	                hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
	                var btPoint = bt.tVector3Array_at(btPoints, i);
	                var pointE = hitResult.point;
	                pointE.x = -bt.btVector3_x(btPoint);
	                pointE.y = bt.btVector3_y(btPoint);
	                pointE.z = bt.btVector3_z(btPoint);
	                var btNormal = bt.tVector3Array_at(btNormals, i);
	                var normal = hitResult.normal;
	                normal.x = -bt.btVector3_x(btNormal);
	                normal.y = bt.btVector3_y(btNormal);
	                normal.z = bt.btVector3_z(btNormal);
	            }
	            return true;
	        }
	        else {
	            return false;
	        }
	    }
	    rayCast(ray, outHitResult = null, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var from = ray.origin;
	        var to = PhysicsSimulation._tempVector30;
	        Laya.Vector3.normalize(ray.direction, to);
	        Laya.Vector3.scale(to, distance, to);
	        Laya.Vector3.add(from, to, to);
	        return this.raycastFromTo(from, to, outHitResult, collisonGroup, collisionMask);
	    }
	    rayCastAll(ray, out, distance = 2147483647, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        var from = ray.origin;
	        var to = PhysicsSimulation._tempVector30;
	        Laya.Vector3.normalize(ray.direction, to);
	        Laya.Vector3.scale(to, distance, to);
	        Laya.Vector3.add(from, to, to);
	        return this.raycastAllFromTo(from, to, out, collisonGroup, collisionMask);
	    }
	    shapeCast(shape, fromPosition, toPosition, out = null, fromRotation = null, toRotation = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var convexResultCall = this._btClosestConvexResultCallback;
	        var convexPosFrom = PhysicsSimulation._btTempVector30;
	        var convexPosTo = PhysicsSimulation._btTempVector31;
	        var convexRotFrom = PhysicsSimulation._btTempQuaternion0;
	        var convexRotTo = PhysicsSimulation._btTempQuaternion1;
	        var convexTransform = PhysicsSimulation._btTempTransform0;
	        var convexTransTo = PhysicsSimulation._btTempTransform1;
	        var sweepShape = shape._btShape;
	        bt.btVector3_setValue(convexPosFrom, -fromPosition.x, fromPosition.y, fromPosition.z);
	        bt.btVector3_setValue(convexPosTo, -toPosition.x, toPosition.y, toPosition.z);
	        bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
	        bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);
	        bt.btTransform_setOrigin(convexTransform, convexPosFrom);
	        bt.btTransform_setOrigin(convexTransTo, convexPosTo);
	        if (fromRotation) {
	            bt.btQuaternion_setValue(convexRotFrom, -fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
	            bt.btTransform_setRotation(convexTransform, convexRotFrom);
	        }
	        else {
	            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
	        }
	        if (toRotation) {
	            bt.btQuaternion_setValue(convexRotTo, -toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
	            bt.btTransform_setRotation(convexTransTo, convexRotTo);
	        }
	        else {
	            bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
	        }
	        bt.ClosestConvexResultCallback_set_m_hitCollisionObject(convexResultCall, null);
	        bt.ConvexResultCallback_set_m_closestHitFraction(convexResultCall, 1);
	        bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
	        if (bt.ConvexResultCallback_hasHit(convexResultCall)) {
	            if (out) {
	                out.succeeded = true;
	                out.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.ClosestConvexResultCallback_get_m_hitCollisionObject(convexResultCall))];
	                out.hitFraction = bt.ConvexResultCallback_get_m_closestHitFraction(convexResultCall);
	                var btPoint = bt.ClosestConvexResultCallback_get_m_hitPointWorld(convexResultCall);
	                var btNormal = bt.ClosestConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
	                var point = out.point;
	                var normal = out.normal;
	                point.x = -bt.btVector3_x(btPoint);
	                point.y = bt.btVector3_y(btPoint);
	                point.z = bt.btVector3_z(btPoint);
	                normal.x = -bt.btVector3_x(btNormal);
	                normal.y = bt.btVector3_y(btNormal);
	                normal.z = bt.btVector3_z(btNormal);
	            }
	            return true;
	        }
	        else {
	            if (out)
	                out.succeeded = false;
	            return false;
	        }
	    }
	    shapeCastAll(shape, fromPosition, toPosition, out, fromRotation = null, toRotation = null, collisonGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, collisionMask = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER, allowedCcdPenetration = 0.0) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var convexResultCall = this._btAllConvexResultCallback;
	        var convexPosFrom = PhysicsSimulation._btTempVector30;
	        var convexPosTo = PhysicsSimulation._btTempVector31;
	        var convexRotFrom = PhysicsSimulation._btTempQuaternion0;
	        var convexRotTo = PhysicsSimulation._btTempQuaternion1;
	        var convexTransform = PhysicsSimulation._btTempTransform0;
	        var convexTransTo = PhysicsSimulation._btTempTransform1;
	        var sweepShape = shape._btShape;
	        out.length = 0;
	        bt.btVector3_setValue(convexPosFrom, -fromPosition.x, fromPosition.y, fromPosition.z);
	        bt.btVector3_setValue(convexPosTo, -toPosition.x, toPosition.y, toPosition.z);
	        bt.ConvexResultCallback_set_m_collisionFilterGroup(convexResultCall, collisonGroup);
	        bt.ConvexResultCallback_set_m_collisionFilterMask(convexResultCall, collisionMask);
	        bt.btTransform_setOrigin(convexTransform, convexPosFrom);
	        bt.btTransform_setOrigin(convexTransTo, convexPosTo);
	        if (fromRotation) {
	            bt.btQuaternion_setValue(convexRotFrom, -fromRotation.x, fromRotation.y, fromRotation.z, -fromRotation.w);
	            bt.btTransform_setRotation(convexTransform, convexRotFrom);
	        }
	        else {
	            bt.btTransform_setRotation(convexTransform, this._btDefaultQuaternion);
	        }
	        if (toRotation) {
	            bt.btQuaternion_setValue(convexRotTo, -toRotation.x, toRotation.y, toRotation.z, -toRotation.w);
	            bt.btTransform_setRotation(convexTransTo, convexRotTo);
	        }
	        else {
	            bt.btTransform_setRotation(convexTransTo, this._btDefaultQuaternion);
	        }
	        var collisionObjects = bt.AllConvexResultCallback_get_m_collisionObjects(convexResultCall);
	        var btPoints = bt.AllConvexResultCallback_get_m_hitPointWorld(convexResultCall);
	        var btNormals = bt.AllConvexResultCallback_get_m_hitNormalWorld(convexResultCall);
	        var btFractions = bt.AllConvexResultCallback_get_m_hitFractions(convexResultCall);
	        bt.tVector3Array_clear(btPoints);
	        bt.tVector3Array_clear(btNormals);
	        bt.tScalarArray_clear(btFractions);
	        bt.tBtCollisionObjectArray_clear(collisionObjects);
	        bt.btCollisionWorld_convexSweepTest(this._btCollisionWorld, sweepShape, convexTransform, convexTransTo, convexResultCall, allowedCcdPenetration);
	        var count = bt.tBtCollisionObjectArray_size(collisionObjects);
	        if (count > 0) {
	            this._collisionsUtils.recoverAllHitResultsPool();
	            for (var i = 0; i < count; i++) {
	                var hitResult = this._collisionsUtils.getHitResult();
	                out.push(hitResult);
	                hitResult.succeeded = true;
	                hitResult.collider = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.tBtCollisionObjectArray_at(collisionObjects, i))];
	                hitResult.hitFraction = bt.tScalarArray_at(btFractions, i);
	                var btPoint = bt.tVector3Array_at(btPoints, i);
	                var point = hitResult.point;
	                point.x = -bt.btVector3_x(btPoint);
	                point.y = bt.btVector3_y(btPoint);
	                point.z = bt.btVector3_z(btPoint);
	                var btNormal = bt.tVector3Array_at(btNormals, i);
	                var normal = hitResult.normal;
	                normal.x = -bt.btVector3_x(btNormal);
	                normal.y = bt.btVector3_y(btNormal);
	                normal.z = bt.btVector3_z(btNormal);
	            }
	            return true;
	        }
	        else {
	            return false;
	        }
	    }
	    addConstraint(constraint, disableCollisionsBetweenLinkedBodies = false) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_addConstraint(this._btDiscreteDynamicsWorld, constraint._btConstraint, disableCollisionsBetweenLinkedBodies);
	        this._currentConstraint[constraint.id] = constraint;
	    }
	    removeConstraint(constraint) {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btCollisionWorld_removeConstraint(this._btDiscreteDynamicsWorld, constraint._btConstraint);
	        delete this._currentConstraint[constraint.id];
	    }
	    setHitsRayResultCallbackFlag(flag = 1) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.RayResultCallback_set_m_flags(this._btAllHitsRayResultCallback, flag);
	        bt.RayResultCallback_set_m_flags(this._btClosestRayResultCallback, flag);
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
	    _updateCharacters() {
	        for (var i = 0, n = this._characters.length; i < n; i++) {
	            var character = this._characters[i];
	            character._updateTransformComponent(Laya.ILaya3D.Physics3D._bullet.btCollisionObject_getWorldTransform(character._btColliderObject));
	        }
	    }
	    _updateCollisions() {
	        this._collisionsUtils.recoverAllContactPointsPool();
	        var previous = this._currentFrameCollisions;
	        this._currentFrameCollisions = this._previousFrameCollisions;
	        this._currentFrameCollisions.length = 0;
	        this._previousFrameCollisions = previous;
	        var loopCount = Laya.Stat.loopCount;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var numManifolds = bt.btDispatcher_getNumManifolds(this._btDispatcher);
	        for (var i = 0; i < numManifolds; i++) {
	            var contactManifold = bt.btDispatcher_getManifoldByIndexInternal(this._btDispatcher, i);
	            var componentA = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody0(contactManifold))];
	            var componentB = PhysicsComponent._physicObjectsMap[bt.btCollisionObject_getUserIndex(bt.btPersistentManifold_getBody1(contactManifold))];
	            var collision = null;
	            var isFirstCollision;
	            var contacts = null;
	            var isTrigger = componentA.isTrigger || componentB.isTrigger;
	            if (isTrigger && (componentA.owner._needProcessTriggers || componentB.owner._needProcessTriggers)) {
	                var numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
	                for (var j = 0; j < numContacts; j++) {
	                    var pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
	                    var distance = bt.btManifoldPoint_getDistance(pt);
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
	                if (componentA._enableProcessCollisions || componentB._enableProcessCollisions) {
	                    numContacts = bt.btPersistentManifold_getNumContacts(contactManifold);
	                    for (j = 0; j < numContacts; j++) {
	                        pt = bt.btPersistentManifold_getContactPoint(contactManifold, j);
	                        distance = bt.btManifoldPoint_getDistance(pt);
	                        if (distance <= 0) {
	                            var contactPoint = this._collisionsUtils.getContactPoints();
	                            contactPoint.colliderA = componentA;
	                            contactPoint.colliderB = componentB;
	                            contactPoint.distance = distance;
	                            var btNormal = bt.btManifoldPoint_get_m_normalWorldOnB(pt);
	                            var normal = contactPoint.normal;
	                            normal.x = -bt.btVector3_x(btNormal);
	                            normal.y = bt.btVector3_y(btNormal);
	                            normal.z = bt.btVector3_z(btNormal);
	                            var btPostionA = bt.btManifoldPoint_get_m_positionWorldOnA(pt);
	                            var positionOnA = contactPoint.positionOnA;
	                            positionOnA.x = -bt.btVector3_x(btPostionA);
	                            positionOnA.y = bt.btVector3_y(btPostionA);
	                            positionOnA.z = bt.btVector3_z(btPostionA);
	                            var btPostionB = bt.btManifoldPoint_get_m_positionWorldOnB(pt);
	                            var positionOnB = contactPoint.positionOnB;
	                            positionOnB.x = -bt.btVector3_x(btPostionB);
	                            positionOnB.y = bt.btVector3_y(btPostionB);
	                            positionOnB.z = bt.btVector3_z(btPostionB);
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
	        for (var id in this._currentConstraint) {
	            var constraintObj = this._currentConstraint[id];
	            var scripts = constraintObj.owner._scripts;
	            if (constraintObj.enabled && constraintObj._isBreakConstrained() && (!!scripts)) {
	                if (scripts.length != 0) {
	                    for (i = 0, n = scripts.length; i < n; i++) {
	                        scripts[i].onJointBreak();
	                    }
	                }
	            }
	        }
	    }
	    clearForces() {
	        if (!this._btDiscreteDynamicsWorld)
	            throw "Cannot perform this action when the physics engine is set to CollisionsOnly";
	        Laya.ILaya3D.Physics3D._bullet.btDiscreteDynamicsWorld_clearForces(this._btDiscreteDynamicsWorld);
	    }
	}
	PhysicsSimulation.PHYSICSENGINEFLAGS_NONE = 0x0;
	PhysicsSimulation.PHYSICSENGINEFLAGS_COLLISIONSONLY = 0x1;
	PhysicsSimulation.PHYSICSENGINEFLAGS_SOFTBODYSUPPORT = 0x2;
	PhysicsSimulation.PHYSICSENGINEFLAGS_MULTITHREADED = 0x4;
	PhysicsSimulation.PHYSICSENGINEFLAGS_USEHARDWAREWHENPOSSIBLE = 0x8;
	PhysicsSimulation.SOLVERMODE_RANDMIZE_ORDER = 1;
	PhysicsSimulation.SOLVERMODE_FRICTION_SEPARATE = 2;
	PhysicsSimulation.SOLVERMODE_USE_WARMSTARTING = 4;
	PhysicsSimulation.SOLVERMODE_USE_2_FRICTION_DIRECTIONS = 16;
	PhysicsSimulation.SOLVERMODE_ENABLE_FRICTION_DIRECTION_CACHING = 32;
	PhysicsSimulation.SOLVERMODE_DISABLE_VELOCITY_DEPENDENT_FRICTION_DIRECTION = 64;
	PhysicsSimulation.SOLVERMODE_CACHE_FRIENDLY = 128;
	PhysicsSimulation.SOLVERMODE_SIMD = 256;
	PhysicsSimulation.SOLVERMODE_INTERLEAVE_CONTACT_AND_FRICTION_CONSTRAINTS = 512;
	PhysicsSimulation.SOLVERMODE_ALLOW_ZERO_LENGTH_FRICTION_DIRECTIONS = 1024;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_NONE = 0;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_FILTERBACKFACESS = 1;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_KEEPUNFILIPPEDNORMAL = 2;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_USESUBSIMPLEXCONVEXCASTRAYTEST = 4;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_USEGJKCONVEXCASTRAYTEST = 8;
	PhysicsSimulation.HITSRAYRESULTCALLBACK_FLAG_TERMINATOR = 0xffffffff;
	PhysicsSimulation._tempVector30 = new Laya.Vector3();
	PhysicsSimulation.disableSimulation = false;

	class Rigidbody3D extends PhysicsTriggerComponent {
	    constructor(collisionGroup = Laya.Physics3DUtils.COLLISIONFILTERGROUP_DEFAULTFILTER, canCollideWith = Laya.Physics3DUtils.COLLISIONFILTERGROUP_ALLFILTER) {
	        super(collisionGroup, canCollideWith);
	        this._isKinematic = false;
	        this._mass = 1.0;
	        this._gravity = new Laya.Vector3(0, -10, 0);
	        this._angularDamping = 0.0;
	        this._linearDamping = 0.0;
	        this._overrideGravity = false;
	        this._totalTorque = new Laya.Vector3(0, 0, 0);
	        this._totalForce = new Laya.Vector3(0, 0, 0);
	        this._linearVelocity = new Laya.Vector3();
	        this._angularVelocity = new Laya.Vector3();
	        this._linearFactor = new Laya.Vector3(1, 1, 1);
	        this._angularFactor = new Laya.Vector3(1, 1, 1);
	        this._detectCollisions = true;
	        this._controlBySimulation = true;
	    }
	    static __init__() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        Rigidbody3D._btTempVector30 = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btTempVector31 = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btVector3Zero = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btInertia = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btImpulse = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btImpulseOffset = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btGravity = bt.btVector3_create(0, 0, 0);
	        Rigidbody3D._btTransform0 = bt.btTransform_create();
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
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var canInSimulation = !!(this._simulation && this._enabled && this._colliderShape);
	        canInSimulation && this._removeFromSimulation();
	        var natColObj = this._btColliderObject;
	        var flags = bt.btCollisionObject_getCollisionFlags(natColObj);
	        if (value) {
	            flags = flags | PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
	            bt.btCollisionObject_setCollisionFlags(natColObj, flags);
	            bt.btCollisionObject_forceActivationState(this._btColliderObject, PhysicsComponent.ACTIVATIONSTATE_DISABLE_DEACTIVATION);
	            this._enableProcessCollisions = false;
	            this._updateMass(0);
	        }
	        else {
	            if ((flags & PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT) > 0)
	                flags = flags ^ PhysicsComponent.COLLISIONFLAGS_KINEMATIC_OBJECT;
	            bt.btCollisionObject_setCollisionFlags(natColObj, flags);
	            bt.btCollisionObject_setActivationState(this._btColliderObject, PhysicsComponent.ACTIVATIONSTATE_ACTIVE_TAG);
	            this._enableProcessCollisions = true;
	            this._updateMass(this._mass);
	        }
	        var btZero = Rigidbody3D._btVector3Zero;
	        bt.btCollisionObject_setInterpolationLinearVelocity(natColObj, btZero);
	        bt.btRigidBody_setLinearVelocity(natColObj, btZero);
	        bt.btCollisionObject_setInterpolationAngularVelocity(natColObj, btZero);
	        bt.btRigidBody_setAngularVelocity(natColObj, btZero);
	        canInSimulation && this._addToSimulation();
	    }
	    get linearDamping() {
	        return this._linearDamping;
	    }
	    set linearDamping(value) {
	        this._linearDamping = value;
	        if (this._btColliderObject)
	            Laya.ILaya3D.Physics3D._bullet.btRigidBody_setDamping(this._btColliderObject, value, this._angularDamping);
	    }
	    get angularDamping() {
	        return this._angularDamping;
	    }
	    set angularDamping(value) {
	        this._angularDamping = value;
	        if (this._btColliderObject)
	            Laya.ILaya3D.Physics3D._bullet.btRigidBody_setDamping(this._btColliderObject, this._linearDamping, value);
	    }
	    get overrideGravity() {
	        return this._overrideGravity;
	    }
	    set overrideGravity(value) {
	        this._overrideGravity = value;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        if (this._btColliderObject) {
	            var flag = bt.btRigidBody_getFlags(this._btColliderObject);
	            if (value) {
	                if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) === 0)
	                    bt.btRigidBody_setFlags(this._btColliderObject, flag | Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
	            }
	            else {
	                if ((flag & Rigidbody3D._BT_DISABLE_WORLD_GRAVITY) > 0)
	                    bt.btRigidBody_setFlags(this._btColliderObject, flag ^ Rigidbody3D._BT_DISABLE_WORLD_GRAVITY);
	            }
	        }
	    }
	    get gravity() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        Rigidbody3D._btGravity = bt.btRigidBody_getGravity(this._btColliderObject);
	        Laya.Utils3D._convertToLayaVec3(Rigidbody3D._btGravity, this._gravity, true);
	        return this._gravity;
	    }
	    set gravity(value) {
	        this._gravity = value;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(Rigidbody3D._btGravity, -value.x, value.y, value.z);
	        bt.btRigidBody_setGravity(this._btColliderObject, Rigidbody3D._btGravity);
	    }
	    get totalForce() {
	        if (this._btColliderObject) {
	            var btTotalForce = Laya.ILaya3D.Physics3D._bullet.btRigidBody_getTotalForce(this._btColliderObject);
	            Laya.Utils3D._convertToLayaVec3(btTotalForce, this._totalForce, true);
	            return this._totalForce;
	        }
	        return null;
	    }
	    get linearFactor() {
	        return this._linearFactor;
	    }
	    set linearFactor(value) {
	        this._linearFactor = value;
	        var btValue = Rigidbody3D._btTempVector30;
	        Laya.Utils3D._convertToBulletVec3(value, btValue, false);
	        Laya.ILaya3D.Physics3D._bullet.btRigidBody_setLinearFactor(this._btColliderObject, btValue);
	    }
	    get linearVelocity() {
	        if (this._btColliderObject)
	            Laya.Utils3D._convertToLayaVec3(Laya.ILaya3D.Physics3D._bullet.btRigidBody_getLinearVelocity(this._btColliderObject), this._linearVelocity, true);
	        return this._linearVelocity;
	    }
	    set linearVelocity(value) {
	        this._linearVelocity = value;
	        if (this._btColliderObject) {
	            var btValue = Rigidbody3D._btTempVector30;
	            Laya.Utils3D._convertToBulletVec3(value, btValue, true);
	            (this.isSleeping) && (this.wakeUp());
	            Laya.ILaya3D.Physics3D._bullet.btRigidBody_setLinearVelocity(this._btColliderObject, btValue);
	        }
	    }
	    get angularFactor() {
	        return this._angularFactor;
	    }
	    set angularFactor(value) {
	        this._angularFactor = value;
	        var btValue = Rigidbody3D._btTempVector30;
	        Laya.Utils3D._convertToBulletVec3(value, btValue, false);
	        Laya.ILaya3D.Physics3D._bullet.btRigidBody_setAngularFactor(this._btColliderObject, btValue);
	    }
	    get angularVelocity() {
	        if (this._btColliderObject)
	            Laya.Utils3D._convertToLayaVec3(Laya.ILaya3D.Physics3D._bullet.btRigidBody_getAngularVelocity(this._btColliderObject), this._angularVelocity, true);
	        return this._angularVelocity;
	    }
	    set angularVelocity(value) {
	        this._angularVelocity = value;
	        if (this._btColliderObject) {
	            var btValue = Rigidbody3D._btTempVector30;
	            Laya.Utils3D._convertToBulletVec3(value, btValue, true);
	            (this.isSleeping) && (this.wakeUp());
	            Laya.ILaya3D.Physics3D._bullet.btRigidBody_setAngularVelocity(this._btColliderObject, btValue);
	        }
	    }
	    get totalTorque() {
	        if (this._btColliderObject) {
	            var btTotalTorque = Laya.ILaya3D.Physics3D._bullet.btRigidBody_getTotalTorque(this._btColliderObject);
	            Laya.Utils3D._convertToLayaVec3(btTotalTorque, this._totalTorque, true);
	            return this._totalTorque;
	        }
	        return null;
	    }
	    get detectCollisions() {
	        return this._detectCollisions;
	    }
	    set detectCollisions(value) {
	        if (this._detectCollisions !== value) {
	            this._detectCollisions = value;
	            if (this._colliderShape && this._enabled && this._simulation) {
	                this._simulation._removeRigidBody(this);
	                this._simulation._addRigidBody(this, this._collisionGroup, value ? this._canCollideWith : 0);
	            }
	        }
	    }
	    get isSleeping() {
	        if (this._btColliderObject)
	            return Laya.ILaya3D.Physics3D._bullet.btCollisionObject_getActivationState(this._btColliderObject) === PhysicsComponent.ACTIVATIONSTATE_ISLAND_SLEEPING;
	        return false;
	    }
	    get sleepLinearVelocity() {
	        return Laya.ILaya3D.Physics3D._bullet.btRigidBody_getLinearSleepingThreshold(this._btColliderObject);
	    }
	    set sleepLinearVelocity(value) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btRigidBody_setSleepingThresholds(this._btColliderObject, value, bt.btRigidBody_getAngularSleepingThreshold(this._btColliderObject));
	    }
	    get sleepAngularVelocity() {
	        return Laya.ILaya3D.Physics3D._bullet.btRigidBody_getAngularSleepingThreshold(this._btColliderObject);
	    }
	    set sleepAngularVelocity(value) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btRigidBody_setSleepingThresholds(this._btColliderObject, bt.btRigidBody_getLinearSleepingThreshold(this._btColliderObject), value);
	    }
	    get btColliderObject() {
	        return this._btColliderObject;
	    }
	    set constaintRigidbodyA(value) {
	        this._constaintRigidbodyA = value;
	    }
	    get constaintRigidbodyA() {
	        return this._constaintRigidbodyA;
	    }
	    set constaintRigidbodyB(value) {
	        this._constaintRigidbodyB = value;
	    }
	    get constaintRigidbodyB() {
	        return this._constaintRigidbodyB;
	    }
	    _updateMass(mass) {
	        if (this._btColliderObject && this._colliderShape) {
	            var bt = Laya.ILaya3D.Physics3D._bullet;
	            bt.btCollisionShape_calculateLocalInertia(this._colliderShape._btShape, mass, Rigidbody3D._btInertia);
	            bt.btRigidBody_setMassProps(this._btColliderObject, mass, Rigidbody3D._btInertia);
	            bt.btRigidBody_updateInertiaTensor(this._btColliderObject);
	        }
	    }
	    _onScaleChange(scale) {
	        super._onScaleChange(scale);
	        this._updateMass(this._isKinematic ? 0 : this._mass);
	    }
	    _derivePhysicsTransformation(force) {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btColliderObject = this._btColliderObject;
	        var oriTransform = bt.btCollisionObject_getWorldTransform(btColliderObject);
	        var transform = Rigidbody3D._btTransform0;
	        bt.btTransform_equal(transform, oriTransform);
	        this._innerDerivePhysicsTransformation(transform, force);
	        bt.btRigidBody_setCenterOfMassTransform(btColliderObject, transform);
	    }
	    _onAdded() {
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var motionState = bt.layaMotionState_create();
	        bt.layaMotionState_set_rigidBodyID(motionState, this._id);
	        this._btLayaMotionState = motionState;
	        var constructInfo = bt.btRigidBodyConstructionInfo_create(0.0, motionState, null, Rigidbody3D._btVector3Zero);
	        var btRigid = bt.btRigidBody_create(constructInfo);
	        bt.btCollisionObject_setUserIndex(btRigid, this.id);
	        this._btColliderObject = btRigid;
	        super._onAdded();
	        this.mass = this._mass;
	        this.linearFactor = this._linearFactor;
	        this.angularFactor = this._angularFactor;
	        this.linearDamping = this._linearDamping;
	        this.angularDamping = this._angularDamping;
	        this.overrideGravity = this._overrideGravity;
	        this.gravity = this._gravity;
	        this.isKinematic = this._isKinematic;
	        bt.btRigidBodyConstructionInfo_destroy(constructInfo);
	    }
	    _onEnable() {
	        super._onEnable();
	        if (this._constaintRigidbodyA) {
	            if (this._constaintRigidbodyA.connectedBody._simulation) {
	                this._constaintRigidbodyA._createConstraint();
	                this._constaintRigidbodyA._onEnable();
	            }
	        }
	        if (this._constaintRigidbodyB) {
	            if (this._constaintRigidbodyB.ownBody._simulation) {
	                this._constaintRigidbodyB._createConstraint();
	                this._constaintRigidbodyB._onEnable();
	            }
	        }
	    }
	    _onShapeChange(colShape) {
	        super._onShapeChange(colShape);
	        if (this._isKinematic) {
	            this._updateMass(0);
	        }
	        else {
	            var bt = Laya.ILaya3D.Physics3D._bullet;
	            bt.btRigidBody_setCenterOfMassTransform(this._btColliderObject, bt.btCollisionObject_getWorldTransform(this._btColliderObject));
	            this._updateMass(this._mass);
	        }
	    }
	    _parse(data) {
	        (data.friction != null) && (this.friction = data.friction);
	        (data.rollingFriction != null) && (this.rollingFriction = data.rollingFriction);
	        (data.restitution != null) && (this.restitution = data.restitution);
	        (data.isTrigger != null) && (this.isTrigger = data.isTrigger);
	        (data.mass != null) && (this.mass = data.mass);
	        (data.linearDamping != null) && (this.linearDamping = data.linearDamping);
	        (data.angularDamping != null) && (this.angularDamping = data.angularDamping);
	        (data.overrideGravity != null) && (this.overrideGravity = data.overrideGravity);
	        if (data.linearFactor != null) {
	            var linFac = this.linearFactor;
	            linFac.fromArray(data.linearFactor);
	            this.linearFactor = linFac;
	        }
	        if (data.angularFactor != null) {
	            var angFac = this.angularFactor;
	            angFac.fromArray(data.angularFactor);
	            this.angularFactor = angFac;
	        }
	        if (data.gravity) {
	            this.gravity.fromArray(data.gravity);
	            this.gravity = this.gravity;
	        }
	        super._parse(data);
	        this._parseShape(data.shapes);
	        (data.isKinematic != null) && (this.isKinematic = data.isKinematic);
	    }
	    _onDestroy() {
	        Laya.ILaya3D.Physics3D._bullet.btMotionState_destroy(this._btLayaMotionState);
	        super._onDestroy();
	        this._btLayaMotionState = null;
	        this._gravity = null;
	        this._totalTorque = null;
	        this._linearVelocity = null;
	        this._angularVelocity = null;
	        this._linearFactor = null;
	        this._angularFactor = null;
	        if (this.constaintRigidbodyA)
	            this.constaintRigidbodyA._breakConstrained();
	        if (this.constaintRigidbodyB) {
	            this.constaintRigidbodyB.connectedBody = null;
	            this.constaintRigidbodyB._onDisable();
	        }
	    }
	    _addToSimulation() {
	        this._simulation._addRigidBody(this, this._collisionGroup, this._detectCollisions ? this._canCollideWith : 0);
	    }
	    _removeFromSimulation() {
	        this._simulation._removeRigidBody(this);
	    }
	    _cloneTo(dest) {
	        super._cloneTo(dest);
	        var destRigidbody3D = dest;
	        destRigidbody3D.isKinematic = this._isKinematic;
	        destRigidbody3D.mass = this._mass;
	        destRigidbody3D.gravity = this._gravity;
	        destRigidbody3D.angularDamping = this._angularDamping;
	        destRigidbody3D.linearDamping = this._linearDamping;
	        destRigidbody3D.overrideGravity = this._overrideGravity;
	        destRigidbody3D.linearVelocity = this._linearVelocity;
	        destRigidbody3D.angularVelocity = this._angularVelocity;
	        destRigidbody3D.linearFactor = this._linearFactor;
	        destRigidbody3D.angularFactor = this._angularFactor;
	        destRigidbody3D.detectCollisions = this._detectCollisions;
	    }
	    applyForce(force, localOffset = null) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btForce = Rigidbody3D._btTempVector30;
	        bt.btVector3_setValue(btForce, -force.x, force.y, force.z);
	        if (localOffset) {
	            var btOffset = Rigidbody3D._btTempVector31;
	            bt.btVector3_setValue(btOffset, -localOffset.x, localOffset.y, localOffset.z);
	            bt.btRigidBody_applyForce(this._btColliderObject, btForce, btOffset);
	        }
	        else {
	            bt.btRigidBody_applyCentralForce(this._btColliderObject, btForce);
	        }
	    }
	    applyTorque(torque) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var bullet = Laya.ILaya3D.Physics3D._bullet;
	        var btTorque = Rigidbody3D._btTempVector30;
	        bullet.btVector3_setValue(btTorque, -torque.x, torque.y, torque.z);
	        bullet.btRigidBody_applyTorque(this._btColliderObject, btTorque);
	    }
	    applyImpulse(impulse, localOffset = null) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(Rigidbody3D._btImpulse, -impulse.x, impulse.y, impulse.z);
	        if (localOffset) {
	            bt.btVector3_setValue(Rigidbody3D._btImpulseOffset, -localOffset.x, localOffset.y, localOffset.z);
	            bt.btRigidBody_applyImpulse(this._btColliderObject, Rigidbody3D._btImpulse, Rigidbody3D._btImpulseOffset);
	        }
	        else {
	            bt.btRigidBody_applyCentralImpulse(this._btColliderObject, Rigidbody3D._btImpulse);
	        }
	    }
	    applyTorqueImpulse(torqueImpulse) {
	        if (this._btColliderObject == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        var btTorqueImpulse = Rigidbody3D._btTempVector30;
	        bt.btVector3_setValue(btTorqueImpulse, -torqueImpulse.x, torqueImpulse.y, torqueImpulse.z);
	        bt.btRigidBody_applyTorqueImpulse(this._btColliderObject, btTorqueImpulse);
	    }
	    wakeUp() {
	        this._btColliderObject && (Laya.ILaya3D.Physics3D._bullet.btCollisionObject_activate(this._btColliderObject, false));
	    }
	    clearForces() {
	        var rigidBody = this._btColliderObject;
	        if (rigidBody == null)
	            throw "Attempted to call a Physics function that is avaliable only when the Entity has been already added to the Scene.";
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btRigidBody_clearForces(rigidBody);
	        var btZero = Rigidbody3D._btVector3Zero;
	        bt.btCollisionObject_setInterpolationLinearVelocity(rigidBody, btZero);
	        bt.btRigidBody_setLinearVelocity(rigidBody, btZero);
	        bt.btCollisionObject_setInterpolationAngularVelocity(rigidBody, btZero);
	        bt.btRigidBody_setAngularVelocity(rigidBody, btZero);
	    }
	}
	Rigidbody3D.TYPE_STATIC = 0;
	Rigidbody3D.TYPE_DYNAMIC = 1;
	Rigidbody3D.TYPE_KINEMATIC = 2;
	Rigidbody3D._BT_DISABLE_WORLD_GRAVITY = 1;
	Rigidbody3D._BT_ENABLE_GYROPSCOPIC_FORCE = 2;

	class ConstraintComponent extends Laya.Component {
	    constructor(constraintType) {
	        super();
	        this._anchor = new Laya.Vector3();
	        this._connectAnchor = new Laya.Vector3();
	        this._feedbackEnabled = false;
	        this._getJointFeedBack = false;
	        this._currentForce = new Laya.Vector3();
	        this._currentTorque = new Laya.Vector3();
	        this._constraintType = constraintType;
	        var bt = Laya.Physics3D._bullet;
	        this._btframATrans = bt.btTransform_create();
	        this._btframBTrans = bt.btTransform_create();
	        bt.btTransform_setIdentity(this._btframATrans);
	        bt.btTransform_setIdentity(this._btframBTrans);
	        this._btframAPos = bt.btVector3_create(0, 0, 0);
	        this._btframBPos = bt.btVector3_create(0, 0, 0);
	        bt.btTransform_setOrigin(this._btframATrans, this._btframAPos);
	        bt.btTransform_setOrigin(this._btframBTrans, this._btframBPos);
	        this._breakForce = -1;
	        this._breakTorque = -1;
	    }
	    get enabled() {
	        return super.enabled;
	    }
	    set enabled(value) {
	        super.enabled = value;
	    }
	    get appliedImpulse() {
	        if (!this._feedbackEnabled) {
	            this._btConstraint.EnableFeedback(true);
	            this._feedbackEnabled = true;
	        }
	        return this._btConstraint.AppliedImpulse;
	    }
	    set connectedBody(value) {
	        this._connectedBody = value;
	        value && (value.constaintRigidbodyB = this);
	    }
	    get connectedBody() {
	        return this._connectedBody;
	    }
	    get ownBody() {
	        return this._ownBody;
	    }
	    set ownBody(value) {
	        this._ownBody = value;
	        value.constaintRigidbodyA = this;
	    }
	    get currentForce() {
	        if (!this._getJointFeedBack)
	            this._getFeedBackInfo();
	        return this._currentForce;
	    }
	    get currentTorque() {
	        if (!this._getJointFeedBack)
	            this._getFeedBackInfo();
	        return this._currentTorque;
	    }
	    get breakForce() {
	        return this._breakForce;
	    }
	    set breakForce(value) {
	        this._breakForce = value;
	    }
	    get breakTorque() {
	        return this._breakTorque;
	    }
	    set breakTorque(value) {
	        this._breakTorque = value;
	    }
	    set anchor(value) {
	        value.cloneTo(this._anchor);
	        this.setFrames();
	    }
	    get anchor() {
	        return this._anchor;
	    }
	    set connectAnchor(value) {
	        value.cloneTo(this._connectAnchor);
	        this.setFrames();
	    }
	    get connectAnchor() {
	        return this._connectAnchor;
	    }
	    setOverrideNumSolverIterations(overideNumIterations) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btTypedConstraint_setOverrideNumSolverIterations(this._btConstraint, overideNumIterations);
	    }
	    setConstraintEnabled(enable) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btTypedConstraint_setEnabled(this._btConstraint, enable);
	    }
	    _onEnable() {
	        super._onEnable();
	        this.enabled = true;
	    }
	    _onDisable() {
	        super._onDisable();
	        this.enabled = false;
	    }
	    setFrames() {
	        var bt = Laya.Physics3D._bullet;
	        bt.btVector3_setValue(this._btframAPos, -this._anchor.x, this.anchor.y, this.anchor.z);
	        bt.btVector3_setValue(this._btframBPos, -this._connectAnchor.x, this._connectAnchor.y, this._connectAnchor.z);
	        bt.btTransform_setOrigin(this._btframATrans, this._btframAPos);
	        bt.btTransform_setOrigin(this._btframBTrans, this._btframBPos);
	    }
	    _addToSimulation() {
	    }
	    _removeFromSimulation() {
	    }
	    _createConstraint() {
	    }
	    setConnectRigidBody(ownerRigid, connectRigidBody) {
	        var ownerCanInSimulation = (ownerRigid) && (!!(ownerRigid._simulation && ownerRigid._enabled && ownerRigid.colliderShape));
	        var connectCanInSimulation = (connectRigidBody) && (!!(connectRigidBody._simulation && connectRigidBody._enabled && connectRigidBody.colliderShape));
	        if (!(ownerCanInSimulation && connectCanInSimulation))
	            throw "ownerRigid or connectRigidBody is not in Simulation";
	        if (ownerRigid != this._ownBody || connectRigidBody != this._connectedBody) {
	            var canInSimulation = !!(this.enabled && this._simulation);
	            canInSimulation && this._removeFromSimulation();
	            this._ownBody = ownerRigid;
	            this._connectedBody = connectRigidBody;
	            this._ownBody.constaintRigidbodyA = this;
	            this._connectedBody.constaintRigidbodyB = this;
	            this._createConstraint();
	        }
	    }
	    getcurrentForce(out) {
	        if (!this._btJointFeedBackObj)
	            throw "this Constraint is not simulation";
	        var bt = Laya.Physics3D._bullet;
	        var applyForce = bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
	        out.setValue(bt.btVector3_x(applyForce), bt.btVector3_y(applyForce), bt.btVector3_z(applyForce));
	        return;
	    }
	    getcurrentTorque(out) {
	        if (!this._btJointFeedBackObj)
	            throw "this Constraint is not simulation";
	        var bt = Laya.Physics3D._bullet;
	        var applyTorque = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
	        out.setValue(bt.btVector3_x(applyTorque), bt.btVector3_y(applyTorque), bt.btVector3_z(applyTorque));
	        return;
	    }
	    _onDestroy() {
	        var physics3D = Laya.Physics3D._bullet;
	        this._simulation && this._removeFromSimulation();
	        if (this._btConstraint && this._btJointFeedBackObj && this._simulation) {
	            physics3D.btTypedConstraint_destroy(this._btConstraint);
	            physics3D.btJointFeedback_destroy(this._btJointFeedBackObj);
	            this._btJointFeedBackObj = null;
	            this._btConstraint = null;
	        }
	        super._onDisable();
	    }
	    _isBreakConstrained() {
	        this._getJointFeedBack = false;
	        if (this.breakForce == -1 && this.breakTorque == -1)
	            return false;
	        this._getFeedBackInfo();
	        var isBreakForce = this._breakForce != -1 && (Laya.Vector3.scalarLength(this._currentForce) > this._breakForce);
	        var isBreakTorque = this._breakTorque != -1 && (Laya.Vector3.scalarLength(this._currentTorque) > this._breakTorque);
	        if (isBreakForce || isBreakTorque) {
	            this._breakConstrained();
	            return true;
	        }
	        return false;
	    }
	    _parse(data) {
	        this._anchor.fromArray(data.anchor);
	        this._connectAnchor.fromArray(data.connectAnchor);
	        this.setFrames();
	    }
	    _getFeedBackInfo() {
	        var bt = Laya.Physics3D._bullet;
	        var applyForce = bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
	        var applyTorque = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
	        this._currentTorque.setValue(bt.btVector3_x(applyTorque), bt.btVector3_y(applyTorque), bt.btVector3_z(applyTorque));
	        this._currentForce.setValue(bt.btVector3_x(applyForce), bt.btVector3_y(applyForce), bt.btVector3_z(applyForce));
	        this._getJointFeedBack = true;
	    }
	    _breakConstrained() {
	        this.ownBody.constaintRigidbodyA = null;
	        this.connectedBody && (this.connectedBody.constaintRigidbodyB = null);
	        this.destroy();
	    }
	}
	ConstraintComponent.CONSTRAINT_POINT2POINT_CONSTRAINT_TYPE = 3;
	ConstraintComponent.CONSTRAINT_HINGE_CONSTRAINT_TYPE = 4;
	ConstraintComponent.CONSTRAINT_CONETWIST_CONSTRAINT_TYPE = 5;
	ConstraintComponent.CONSTRAINT_D6_CONSTRAINT_TYPE = 6;
	ConstraintComponent.CONSTRAINT_SLIDER_CONSTRAINT_TYPE = 7;
	ConstraintComponent.CONSTRAINT_CONTACT_CONSTRAINT_TYPE = 8;
	ConstraintComponent.CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE = 9;
	ConstraintComponent.CONSTRAINT_GEAR_CONSTRAINT_TYPE = 10;
	ConstraintComponent.CONSTRAINT_FIXED_CONSTRAINT_TYPE = 11;
	ConstraintComponent.CONSTRAINT_MAX_CONSTRAINT_TYPE = 12;
	ConstraintComponent.CONSTRAINT_CONSTRAINT_ERP = 1;
	ConstraintComponent.CONSTRAINT_CONSTRAINT_STOP_ERP = 2;
	ConstraintComponent.CONSTRAINT_CONSTRAINT_CFM = 3;
	ConstraintComponent.CONSTRAINT_CONSTRAINT_STOP_CFM = 4;
	ConstraintComponent.tempForceV3 = new Laya.Vector3();

	class ConfigurableConstraint extends ConstraintComponent {
	    constructor() {
	        super(ConstraintComponent.CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE);
	        this._axis = new Laya.Vector3();
	        this._secondaryAxis = new Laya.Vector3();
	        this._minLinearLimit = new Laya.Vector3();
	        this._maxLinearLimit = new Laya.Vector3();
	        this._minAngularLimit = new Laya.Vector3();
	        this._maxAngularLimit = new Laya.Vector3();
	        this._linearLimitSpring = new Laya.Vector3();
	        this._angularLimitSpring = new Laya.Vector3();
	        this._linearBounce = new Laya.Vector3();
	        this._angularBounce = new Laya.Vector3();
	        this._linearDamp = new Laya.Vector3();
	        this._angularDamp = new Laya.Vector3();
	        this._xMotion = 0;
	        this._yMotion = 0;
	        this._zMotion = 0;
	        this._angularXMotion = 0;
	        this._angularYMotion = 0;
	        this._angularZMotion = 0;
	        var bt = Laya.Physics3D._bullet;
	        this._btAxis = bt.btVector3_create(-1.0, 0.0, 0.0);
	        this._btSecondaryAxis = bt.btVector3_create(0.0, 1.0, 0.0);
	    }
	    get axis() {
	        return this._axis;
	    }
	    get secondaryAxis() {
	        return this._secondaryAxis;
	    }
	    set maxAngularLimit(value) {
	        value.cloneTo(this._maxAngularLimit);
	    }
	    set minAngularLimit(value) {
	        value.cloneTo(this._minAngularLimit);
	    }
	    get maxAngularLimit() {
	        return this._maxAngularLimit;
	    }
	    get minAngularLimit() {
	        return this._minAngularLimit;
	    }
	    set maxLinearLimit(value) {
	        value.cloneTo(this._maxLinearLimit);
	    }
	    set minLinearLimit(value) {
	        value.cloneTo(this._minLinearLimit);
	    }
	    get maxLinearLimit() {
	        return this._maxLinearLimit;
	    }
	    get minLinearLimit() {
	        return this._minLinearLimit;
	    }
	    set XMotion(value) {
	        if (this._xMotion != value) {
	            this._xMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, value, -this._maxLinearLimit.x, -this._minLinearLimit.x);
	        }
	    }
	    get XMotion() {
	        return this._xMotion;
	    }
	    set YMotion(value) {
	        if (this._yMotion != value) {
	            this._yMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, value, this._minLinearLimit.y, this._maxLinearLimit.y);
	        }
	    }
	    get YMotion() {
	        return this._yMotion;
	    }
	    set ZMotion(value) {
	        if (this._zMotion != value) {
	            this._zMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, value, this._minLinearLimit.z, this._maxLinearLimit.z);
	        }
	    }
	    get ZMotion() {
	        return this._zMotion;
	    }
	    set angularXMotion(value) {
	        if (this._angularXMotion != value) {
	            this._angularXMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, value, -this._maxAngularLimit.x, -this._minAngularLimit.x);
	        }
	    }
	    get angularXMotion() {
	        return this._angularXMotion;
	    }
	    set angularYMotion(value) {
	        if (this._angularYMotion != value) {
	            this._angularYMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, value, this._minAngularLimit.y, this._maxAngularLimit.y);
	        }
	    }
	    get angularYMotion() {
	        return this._angularYMotion;
	    }
	    set angularZMotion(value) {
	        if (this._angularZMotion != value) {
	            this._angularZMotion = value;
	            this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, value, this._minAngularLimit.z, this._maxAngularLimit.z);
	        }
	    }
	    get angularZMotion() {
	        return this._angularZMotion;
	    }
	    set linearLimitSpring(value) {
	        if (!Laya.Vector3.equals(this._linearLimitSpring, value)) {
	            value.cloneTo(this._linearLimitSpring);
	            this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, value.x);
	            this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, value.y);
	            this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, value.z);
	        }
	    }
	    get linearLimitSpring() {
	        return this._linearLimitSpring;
	    }
	    set angularLimitSpring(value) {
	        if (!Laya.Vector3.equals(this._angularLimitSpring, value)) {
	            value.cloneTo(this._angularLimitSpring);
	            this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, value.x);
	            this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, value.y);
	            this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, value.z);
	        }
	    }
	    get angularLimitSpring() {
	        return this._angularLimitSpring;
	    }
	    set linearBounce(value) {
	        if (!Laya.Vector3.equals(this._linearBounce, value)) {
	            value.cloneTo(this._linearBounce);
	            this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, value.x);
	            this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, value.y);
	            this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, value.z);
	        }
	    }
	    get linearBounce() {
	        return this._linearBounce;
	    }
	    set angularBounce(value) {
	        if (!Laya.Vector3.equals(this._angularBounce, value)) {
	            value.cloneTo(this._angularBounce);
	            this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, value.x);
	            this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, value.y);
	            this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, value.z);
	        }
	    }
	    get angularBounce() {
	        return this._angularBounce;
	    }
	    set linearDamp(value) {
	        if (!Laya.Vector3.equals(this._linearDamp, value)) {
	            value.cloneTo(this._linearDamp);
	            this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, value.x);
	            this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, value.y);
	            this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, value.z);
	        }
	    }
	    get linearDamp() {
	        return this._linearDamp;
	    }
	    set angularDamp(value) {
	        if (!Laya.Vector3.equals(this._angularDamp, value)) {
	            value.cloneTo(this._angularDamp);
	            this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, value.x);
	            this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, value.y);
	            this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, value.z);
	        }
	    }
	    get angularDamp() {
	        return this._angularDamp;
	    }
	    set anchor(value) {
	        value.cloneTo(this._anchor);
	        this.setFrames();
	    }
	    get anchor() {
	        return this._anchor;
	    }
	    set connectAnchor(value) {
	        value.cloneTo(this._connectAnchor);
	        this.setFrames();
	    }
	    get connectAnchor() {
	        return this._connectAnchor;
	    }
	    setAxis(axis, secondaryAxis) {
	        if (!this._btConstraint)
	            return;
	        var bt = Laya.Physics3D._bullet;
	        this._axis.setValue(axis.x, axis.y, axis.y);
	        this._secondaryAxis.setValue(secondaryAxis.x, secondaryAxis.y, secondaryAxis.z);
	        this._btAxis = bt.btVector3_setValue(-axis.x, axis.y, axis.z);
	        this._btSecondaryAxis = bt.btVector3_setValue(-secondaryAxis.x, secondaryAxis.y, secondaryAxis.z);
	        bt.btGeneric6DofSpring2Constraint_setAxis(this._btConstraint, this._btAxis, this._btSecondaryAxis);
	    }
	    setLimit(axis, motionType, low, high) {
	        if (!this._btConstraint)
	            return;
	        var bt = Laya.Physics3D._bullet;
	        switch (motionType) {
	            case ConfigurableConstraint.CONFIG_MOTION_TYPE_LOCKED:
	                bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 0, 0);
	                break;
	            case ConfigurableConstraint.CONFIG_MOTION_TYPE_LIMITED:
	                if (low < high)
	                    bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, low, high);
	                break;
	            case ConfigurableConstraint.CONFIG_MOTION_TYPE_FREE:
	                bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 1, 0);
	                break;
	            default:
	                throw "No Type of Axis Motion";
	        }
	    }
	    setSpring(axis, springValue, limitIfNeeded = true) {
	        if (!this._btConstraint)
	            return;
	        var bt = Laya.Physics3D._bullet;
	        var enableSpring = springValue > 0;
	        bt.btGeneric6DofSpring2Constraint_enableSpring(this._btConstraint, axis, enableSpring);
	        if (enableSpring)
	            bt.btGeneric6DofSpring2Constraint_setStiffness(this._btConstraint, axis, springValue, limitIfNeeded);
	    }
	    setBounce(axis, bounce) {
	        if (!this._btConstraint)
	            return;
	        var bt = Laya.Physics3D._bullet;
	        bounce = bounce <= 0 ? 0 : bounce;
	        bt.btGeneric6DofSpring2Constraint_setBounce(this._btConstraint, axis, bounce);
	    }
	    setDamping(axis, damp, limitIfNeeded = true) {
	        if (!this._btConstraint)
	            return;
	        var bt = Laya.Physics3D._bullet;
	        damp = damp <= 0 ? 0 : damp;
	        bt.btGeneric6DofSpring2Constraint_setDamping(this._btConstraint, axis, damp, limitIfNeeded);
	    }
	    setEquilibriumPoint(axis, equilibriumPoint) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btConstraint, axis, equilibriumPoint);
	    }
	    enableMotor(axis, isEnableMotor) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_enableMotor(this._btConstraint, axis, isEnableMotor);
	    }
	    setServo(axis, onOff) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_setServo(this._btConstraint, axis, onOff);
	    }
	    setTargetVelocity(axis, velocity) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btConstraint, axis, velocity);
	    }
	    setTargetPosition(axis, target) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_setServoTarget(this._btConstraint, axis, target);
	    }
	    setMaxMotorForce(axis, force) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btGeneric6DofSpring2Constraint_setMaxMotorForce(this._btConstraint, axis, force);
	    }
	    setParam(axis, constraintParams, value) {
	        var bt = Laya.Physics3D._bullet;
	        bt.btTypedConstraint_setParam(this._btConstraint, axis, constraintParams, value);
	    }
	    setFrames() {
	        super.setFrames();
	        var bt = Laya.Physics3D._bullet;
	        if (!this._btConstraint)
	            return;
	        bt.btGeneric6DofSpring2Constraint_setFrames(this._btConstraint, this._btframATrans, this._btframBTrans);
	    }
	    _addToSimulation() {
	        this._simulation && this._simulation.addConstraint(this, this.enabled);
	    }
	    _removeFromSimulation() {
	        this._simulation.removeConstraint(this);
	        this._simulation = null;
	    }
	    _createConstraint() {
	        var bt = Laya.Physics3D._bullet;
	        this._btConstraint = bt.btGeneric6DofSpring2Constraint_create(this.ownBody.btColliderObject, this._btframAPos, this.connectedBody.btColliderObject, this._btframBPos, ConfigurableConstraint.RO_XYZ);
	        this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);
	        bt.btTypedConstraint_setJointFeedback(this._btConstraint, this._btJointFeedBackObj);
	        this._simulation = this.owner._scene.physicsSimulation;
	        this._initAllConstraintInfo();
	        this._addToSimulation();
	        Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, true);
	    }
	    _initAllConstraintInfo() {
	        this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, this._xMotion, -this._maxLinearLimit.x, -this._minLinearLimit.x);
	        this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, this._yMotion, this._minLinearLimit.y, this._maxLinearLimit.y);
	        this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, this._zMotion, this._minLinearLimit.z, this._maxLinearLimit.z);
	        this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, this._angularXMotion, -this._maxAngularLimit.x, -this._minAngularLimit.x);
	        this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, this._angularYMotion, this._minAngularLimit.y, this._maxAngularLimit.y);
	        this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, this._angularZMotion, this._minAngularLimit.z, this._maxAngularLimit.z);
	        this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, this._linearLimitSpring.x);
	        this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, this._linearLimitSpring.y);
	        this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, this._linearLimitSpring.z);
	        this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, this._angularLimitSpring.x);
	        this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, this._angularLimitSpring.y);
	        this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, this._angularLimitSpring.z);
	        this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, this._linearBounce.x);
	        this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, this._linearBounce.y);
	        this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, this._linearBounce.z);
	        this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, this._angularBounce.x);
	        this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, this._angularBounce.y);
	        this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, this._angularBounce.z);
	        this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_X, this._linearDamp.x);
	        this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y, this._linearDamp.y);
	        this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z, this._linearDamp.z);
	        this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X, this._angularDamp.x);
	        this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y, this._angularDamp.y);
	        this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z, this._angularDamp.z);
	        this.setFrames();
	        this.setEquilibriumPoint(0, 0);
	    }
	    _onAdded() {
	        super._onAdded();
	    }
	    _onEnable() {
	        if (!this._btConstraint)
	            return;
	        super._onEnable();
	        if (this._btConstraint)
	            Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, true);
	    }
	    _onDisable() {
	        super._onDisable();
	        if (!this.connectedBody && this._simulation)
	            this._removeFromSimulation();
	        if (this._btConstraint)
	            Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, false);
	    }
	    _parse(data, interactMap = null) {
	        super._parse(data);
	        this._axis.fromArray(data.axis);
	        this._secondaryAxis.fromArray(data.secondaryAxis);
	        var limitlimit = data.linearLimit;
	        this._minLinearLimit.setValue(-limitlimit, -limitlimit, -limitlimit);
	        this._maxLinearLimit.setValue(limitlimit, limitlimit, limitlimit);
	        var limitSpring = data.linearLimitSpring;
	        this._linearLimitSpring.setValue(limitSpring, limitSpring, limitSpring);
	        var limitDamp = data.linearLimitDamper;
	        this._linearDamp.setValue(limitDamp, limitDamp, limitDamp);
	        var limitBounciness = data.linearLimitBounciness;
	        this._linearBounce.setValue(limitBounciness, limitBounciness, limitBounciness);
	        var xlowAngularLimit = data.lowAngularXLimit;
	        var xhighAngularLimit = data.highAngularXLimit;
	        var yAngularLimit = data.angularYLimit;
	        var zAngularLimit = data.angularZLimit;
	        this._minAngularLimit.setValue(xlowAngularLimit, -yAngularLimit, -zAngularLimit);
	        this._maxAngularLimit.setValue(xhighAngularLimit, yAngularLimit, zAngularLimit);
	        var xhighAngularBounciness = data.highAngularXLimitBounciness;
	        var ybounciness = data.angularYLimitBounciness;
	        var zbounciness = data.angularZLimitBounciness;
	        this._angularBounce.setValue(xhighAngularBounciness, ybounciness, zbounciness);
	        var xAngularSpring = data.angularXLimitSpring;
	        var yzAngularSpriny = data.angularYZLimitSpring;
	        this._angularLimitSpring.setValue(xAngularSpring, yzAngularSpriny, yzAngularSpriny);
	        var xAngularDamper = data.angularXLimitDamper;
	        var yzAngularDamper = data.angularYZLimitDamper;
	        this._angularDamp.setValue(xAngularDamper, yzAngularDamper, yzAngularDamper);
	        this.XMotion = data.xMotion;
	        this.YMotion = data.yMotion;
	        this.ZMotion = data.zMotion;
	        this.angularXMotion = data.angularXMotion;
	        this.angularYMotion = data.angularYMotion;
	        this.angularZMotion = data.angularZMotion;
	        if (data.rigidbodyID != -1 && data.connectRigidbodyID != -1) {
	            interactMap.component.push(this);
	            interactMap.data.push(data);
	        }
	        (data.breakForce != undefined) && (this.breakForce = data.breakForce);
	        (data.breakTorque != undefined) && (this.breakTorque = data.breakTorque);
	    }
	    _parseInteractive(data = null, spriteMap = null) {
	        var rigidBodySprite = spriteMap[data.rigidbodyID];
	        var rigidBody = rigidBodySprite.getComponent(Rigidbody3D);
	        var connectSprite = spriteMap[data.connectRigidbodyID];
	        var connectRigidbody = connectSprite.getComponent(Rigidbody3D);
	        this.ownBody = rigidBody;
	        this.connectedBody = connectRigidbody;
	    }
	    _onDestroy() {
	        super._onDestroy();
	    }
	}
	ConfigurableConstraint.CONFIG_MOTION_TYPE_LOCKED = 0;
	ConfigurableConstraint.CONFIG_MOTION_TYPE_LIMITED = 1;
	ConfigurableConstraint.CONFIG_MOTION_TYPE_FREE = 2;
	ConfigurableConstraint.MOTION_LINEAR_INDEX_X = 0;
	ConfigurableConstraint.MOTION_LINEAR_INDEX_Y = 1;
	ConfigurableConstraint.MOTION_LINEAR_INDEX_Z = 2;
	ConfigurableConstraint.MOTION_ANGULAR_INDEX_X = 3;
	ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y = 4;
	ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z = 5;
	ConfigurableConstraint.RO_XYZ = 0;
	ConfigurableConstraint.RO_XZY = 1;
	ConfigurableConstraint.RO_YXZ = 2;
	ConfigurableConstraint.RO_YZX = 3;
	ConfigurableConstraint.RO_ZXY = 4;
	ConfigurableConstraint.RO_ZYX = 5;

	class FixedConstraint extends ConstraintComponent {
	    constructor() {
	        super(ConstraintComponent.CONSTRAINT_FIXED_CONSTRAINT_TYPE);
	        this.breakForce = -1;
	        this.breakTorque = -1;
	    }
	    _addToSimulation() {
	        this._simulation && this._simulation.addConstraint(this, this.enabled);
	    }
	    _removeFromSimulation() {
	        this._simulation.removeConstraint(this);
	        this._simulation = null;
	    }
	    _createConstraint() {
	        if (this.ownBody && this.ownBody._simulation && this.connectedBody && this.connectedBody._simulation) {
	            var bt = Laya.Physics3D._bullet;
	            this._btConstraint = bt.btFixedConstraint_create(this.ownBody.btColliderObject, this._btframATrans, this.connectedBody.btColliderObject, this._btframBTrans);
	            this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);
	            bt.btTypedConstraint_setJointFeedback(this._btConstraint, this._btJointFeedBackObj);
	            this._simulation = this.owner._scene.physicsSimulation;
	            this._addToSimulation();
	            Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, true);
	        }
	    }
	    _onAdded() {
	        super._onAdded();
	    }
	    _onEnable() {
	        if (!this._btConstraint)
	            return;
	        super._onEnable();
	        if (this._btConstraint)
	            Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, true);
	    }
	    _onDisable() {
	        super._onDisable();
	        if (!this.connectedBody)
	            this._removeFromSimulation();
	        if (this._btConstraint)
	            Laya.Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint, false);
	    }
	    _onDestroy() {
	        super._onDestroy();
	    }
	    _parse(data, interactMap = null) {
	        super._parse(data);
	        if (data.rigidbodyID != -1 && data.connectRigidbodyID != -1) {
	            interactMap.component.push(this);
	            interactMap.data.push(data);
	        }
	        (data.breakForce != undefined) && (this.breakForce = data.breakForce);
	        (data.breakTorque != undefined) && (this.breakTorque = data.breakTorque);
	    }
	    _parseInteractive(data = null, spriteMap = null) {
	        var rigidBodySprite = spriteMap[data.rigidbodyID];
	        var rigidBody = rigidBodySprite.getComponent(Rigidbody3D);
	        var connectSprite = spriteMap[data.connectRigidbodyID];
	        var connectRigidbody = connectSprite.getComponent(Rigidbody3D);
	        this.ownBody = rigidBody;
	        this.connectedBody = connectRigidbody;
	    }
	}

	class StaticPlaneColliderShape extends ColliderShape {
	    constructor(normal, offset) {
	        super();
	        this._normal = normal;
	        this._offset = offset;
	        this._type = ColliderShape.SHAPETYPES_STATICPLANE;
	        var bt = Laya.ILaya3D.Physics3D._bullet;
	        bt.btVector3_setValue(StaticPlaneColliderShape._btNormal, -normal.x, normal.y, normal.z);
	        this._btShape = bt.btStaticPlaneShape_create(StaticPlaneColliderShape._btNormal, offset);
	    }
	    static __init__() {
	        StaticPlaneColliderShape._btNormal = Laya.ILaya3D.Physics3D._bullet.btVector3_create(0, 0, 0);
	    }
	    clone() {
	        var dest = new StaticPlaneColliderShape(this._normal, this._offset);
	        this.cloneTo(dest);
	        return dest;
	    }
	}

	exports.BoxColliderShape = BoxColliderShape;
	exports.BulletInteractive = BulletInteractive;
	exports.CapsuleColliderShape = CapsuleColliderShape;
	exports.CharacterController = CharacterController;
	exports.ColliderShape = ColliderShape;
	exports.Collision = Collision;
	exports.CollisionTool = CollisionTool;
	exports.CompoundColliderShape = CompoundColliderShape;
	exports.ConeColliderShape = ConeColliderShape;
	exports.ConfigurableConstraint = ConfigurableConstraint;
	exports.Constraint3D = Constraint3D;
	exports.ConstraintComponent = ConstraintComponent;
	exports.ContactPoint = ContactPoint;
	exports.CylinderColliderShape = CylinderColliderShape;
	exports.FixedConstraint = FixedConstraint;
	exports.HitResult = HitResult;
	exports.MeshColliderShape = MeshColliderShape;
	exports.PhysicsCollider = PhysicsCollider;
	exports.PhysicsComponent = PhysicsComponent;
	exports.PhysicsSettings = PhysicsSettings;
	exports.PhysicsSimulation = PhysicsSimulation;
	exports.PhysicsTriggerComponent = PhysicsTriggerComponent;
	exports.PhysicsUpdateList = PhysicsUpdateList;
	exports.Rigidbody3D = Rigidbody3D;
	exports.SphereColliderShape = SphereColliderShape;
	exports.StaticPlaneColliderShape = StaticPlaneColliderShape;

}(window.Laya = window.Laya || {}, Laya));
