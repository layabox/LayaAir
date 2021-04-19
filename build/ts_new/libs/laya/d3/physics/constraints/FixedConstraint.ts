import { ConstraintComponent } from "./ConstraintComponent";
import { Scene3D } from "../../core/scene/Scene3D";
import { Sprite3D } from "../../core/Sprite3D";
import { Rigidbody3D } from "../Rigidbody3D";
import { Physics3D } from "../../Physics3D";

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
		if(this.ownBody&&this.ownBody._simulation&&this.connectedBody&&this.connectedBody._simulation){
			var bt = Physics3D._bullet;
			this._btConstraint = bt.btFixedConstraint_create(this.ownBody.btColliderObject, this._btframATrans, this.connectedBody.btColliderObject, this._btframBTrans)
			this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);	
			bt.btTypedConstraint_setJointFeedback(this._btConstraint,this._btJointFeedBackObj);
			this._simulation = ((<Scene3D>this.owner._scene)).physicsSimulation;
			this._addToSimulation();
			Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint,true);
		}
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
		if(!this._btConstraint)
			return;
		super._onEnable();
		if(this._btConstraint)
		Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint,true);
	}

	_onDisable():void{
		super._onDisable();
		if(!this.connectedBody)
			this._removeFromSimulation();
		if(this._btConstraint)
		Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint,false);
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
	 * @internal
	 * @override
	 */
	_parse(data: any,interactMap:any = null): void {
		super._parse(data);
		if(data.rigidbodyID!=-1&&data.connectRigidbodyID!=-1){
			interactMap.component.push(this);
			interactMap.data.push(data);
		}
		(data.breakForce != undefined) && (this.breakForce = data.breakForce);
		(data.breakTorque != undefined) && (this.breakTorque = data.breakTorque);
	}
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_parseInteractive(data:any = null,spriteMap:any = null){
		var rigidBodySprite:Sprite3D = spriteMap[data.rigidbodyID];
		var rigidBody: Rigidbody3D = rigidBodySprite.getComponent(Rigidbody3D);
		var connectSprite: Sprite3D = spriteMap[data.connectRigidbodyID];
		var connectRigidbody: Rigidbody3D = connectSprite.getComponent(Rigidbody3D);
		this.ownBody = rigidBody;
		this.connectedBody = connectRigidbody;

	}


}