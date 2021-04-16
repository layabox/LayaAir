import { Vector3 } from "../../math/Vector3";
import { CannonColliderShape } from "./CannonColliderShape";
import { CannonPhysicsComponent } from "../CannonPhysicsComponent";

/**
 * <code>CompoundColliderShape</code> 类用于创建盒子形状碰撞器。
 */
export class CannonCompoundColliderShape extends CannonColliderShape {
    
    private static _tempCannonQue:CANNON.Quaternion = new CANNON.Quaternion(0,0,0,1);
    private static _tempCannonVec:CANNON.Vec3 = new CANNON.Vec3(0,0,0);
	/**
	 * @internal
	 */
	static __init__(): void {
	}

	/**@internal */
    private _childColliderShapes: CannonColliderShape[] = [];
    private physicColliderObject:CannonPhysicsComponent;
	/**
	 * 创建一个新的 <code>CompoundColliderShape</code> 实例。
	 */
	constructor() {
		super();
        this._type = CannonColliderShape.SHAPETYPES_COMPOUND;
	}

	/**
	 * @internal
	 */
	private _clearChildShape(shape: CannonColliderShape): void {
		shape._attatched = false;
		shape._compoundParent = null;
		shape._indexInCompound = -1;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addReference(): void {
		this._referenceCount++;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_removeReference(): void {
		this._referenceCount--;
	}

	addChildShape(shape: CannonColliderShape,localOffset:Vector3 = null): void {
		if (shape._attatched)
			throw "CompoundColliderShape: this shape has attatched to other entity.";

		shape._attatched = true;
        shape._compoundParent = this;
        //id
		shape._indexInCompound = this._childColliderShapes.length;
		this._childColliderShapes.push(shape);
        shape.localOffset = localOffset;
        if(this.physicColliderObject)
        {
            CannonCompoundColliderShape._tempCannonQue.set(0,0,0,1);
            CannonCompoundColliderShape._tempCannonVec.set(localOffset.x*this._scale.x,localOffset.y*this._scale.y,localOffset.z*this._scale.z);
            this.physicColliderObject._btColliderObject.addShape(shape._btShape,CannonCompoundColliderShape._tempCannonVec,CANNON.Vec3.ZERO);
        }
	}

	/**
	 * 移除子碰撞器形状。
	 * @param	shape 子碰撞器形状。
	 */
	removeChildShape(shape: CannonColliderShape): void {
		if (shape._compoundParent === this) {
			var index: number = shape._indexInCompound;
			this._clearChildShape(shape);
			var endShape: CannonColliderShape = this._childColliderShapes[this._childColliderShapes.length - 1];
			endShape._indexInCompound = index;
			this._childColliderShapes[index] = endShape;
			this._childColliderShapes.pop();
            if(this.physicColliderObject)
                this.bindRigidBody(this.physicColliderObject);
		}
	}

    bindRigidBody(rigidbody:CannonPhysicsComponent){
        this.physicColliderObject = rigidbody;
        var body:CANNON.Body = rigidbody._btColliderObject;
        body.shapes.length = 0;
        body.shapeOffsets.length = 0;
        body.shapeOrientations.length = 0;
        var origoffset:Vector3;
        for(var i = 0,n = this._childColliderShapes.length;i!=n;i++){
            var shape:CannonColliderShape = this._childColliderShapes[i];
            body.shapes.push(shape._btShape);
            origoffset = shape.localOffset;
            body.shapeOffsets.push(new CANNON.Vec3(origoffset.x*this._scale.x,origoffset.y*this._scale.y,origoffset.z*this._scale.z));
            body.shapeOrientations.push(CannonCompoundColliderShape._tempCannonQue);
        }
        body.updateMassProperties();
        body.updateBoundingRadius();
        body.aabbNeedsUpdate = true;
    }
    /**
	 * @inheritDoc
	 * @override
	 */
	_setScale(scale:Vector3){
		this._scale.setValue(scale.x,scale.y,scale.z);
        var body:CANNON.Body = this.physicColliderObject._btColliderObject;
        var length = this.getChildShapeCount();
        var shapeoffsets:CANNON.Vec3[] = body.shapeOffsets;
        for(var i:number = 0;i<length;i++){
           var offset:CANNON.Vec3 = shapeoffsets[i];
           var shape:CannonColliderShape = this._childColliderShapes[i];
           shape._setScale(scale);
           var orioffset:Vector3 = shape.localOffset;
           offset.set(orioffset.x*scale.x,orioffset.y*scale.y,orioffset.z*scale.z);
            
        }
        body.updateMassProperties();
        body.updateBoundingRadius();
        body.aabbNeedsUpdate = true;
	}
	/**
	 * 获取子形状数量。
	 * @return
	 */
	getChildShapeCount(): number {
		return this._childColliderShapes.length;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	cloneTo(destObject: any): void {
		var destCompoundColliderShape: CannonCompoundColliderShape = (<CannonCompoundColliderShape>destObject);
		//destCompoundColliderShape.clearChildShape();
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++)
			destCompoundColliderShape.addChildShape(this._childColliderShapes[i].clone());
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	clone(): any {
		var dest: CannonCompoundColliderShape = new CannonCompoundColliderShape();
		this.cloneTo(dest);
		return dest;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	destroy(): void {
		super.destroy();
		for (var i: number = 0, n: number = this._childColliderShapes.length; i < n; i++) {
			var childShape: CannonColliderShape = this._childColliderShapes[i];
			if (childShape._referenceCount === 0)
				childShape.destroy();
		}
	}

}


