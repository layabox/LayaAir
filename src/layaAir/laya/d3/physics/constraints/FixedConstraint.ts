import { ConstraintComponent } from "./ConstraintComponent";
import { Component } from "../../../components/Component";
import { Physics3D } from "../Physics3D";
import { Scene3D } from "../../core/scene/Scene3D";

export class FixedConstraint extends ConstraintComponent{
	/**
	 * 创建一个<code>FixedConstraint</code>实例
	 */
	constructor(){
		super(ConstraintComponent.CONSTRAINT_FIXED_CONSTRAINT_TYPE);
		this.breakForce = -1;
		this.breakTorque = -1;
		
		
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation && this._simulation.addConstraint(this,this.enabled);
    }
    
     /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
    _removeFromSimulation():void{
		this._simulation.removeConstraint(this);
		this._simulation = null;
	}

	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_createConstraint():void{
		var bt = Physics3D._bullet;
		var physicsTransform = bt.btCollisionObject_getWorldTransform(this.ownBody.btColliderObject);
		var origin = bt.btTransform_getOrigin(physicsTransform);
		this._btConstraint = bt.btFixedConstraint_create(this.ownBody.btColliderObject,this.connectedBody.btColliderObject,origin);
		this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);
		bt.btFixedConstraint_setJointFeedback(this._btConstraint,this._btJointFeedBackObj);
		this._simulation = ((<Scene3D>this.owner._scene)).physicsSimulation
	}

	
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onAdded(): void {
		super._onAdded();
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_onEnable():void{
		super._onEnable();
		if(this._btConstraint)
		Physics3D._bullet.btFixedConstraint_setEnabled(this._btConstraint,true);
	}

	_onDisable():void{
		super._onDisable();
		if(!this.connectedBody)
			this._removeFromSimulation();
		if(this._btConstraint)
		Physics3D._bullet.btFixedConstraint_setEnabled(this._btConstraint,false);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		super._onDestroy();
	}


	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		
	}
}