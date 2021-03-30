import { Component } from "../../../components/Component";
import { Rigidbody3D } from "../Rigidbody3D";
import { PhysicsSimulation } from "../PhysicsSimulation";
import { Vector3 } from "../../math/Vector3";
import { Physics3D } from "../../Physics3D";

/**
 * <code>ConstraintComponent</code> 类用于创建约束的父类。
 */
export class ConstraintComponent extends Component {
	/** @internal TODO*/
	static CONSTRAINT_POINT2POINT_CONSTRAINT_TYPE:number = 3;
	/** @internal TODO*/
	static CONSTRAINT_HINGE_CONSTRAINT_TYPE:number = 4;
	/** @internal TODO*/
	static CONSTRAINT_CONETWIST_CONSTRAINT_TYPE:number = 5;
	/** @internal TODO*/
	static CONSTRAINT_D6_CONSTRAINT_TYPE:number = 6;
	/** @internal TODO*/
	static CONSTRAINT_SLIDER_CONSTRAINT_TYPE:number = 7;
	/** @internal TODO*/
	static CONSTRAINT_CONTACT_CONSTRAINT_TYPE:number = 8;
	/** @internal TODO*/
	static CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE:number = 9;
	/** @internal TODO*/
	static CONSTRAINT_GEAR_CONSTRAINT_TYPE:number = 10;
	/** @internal */
	static CONSTRAINT_FIXED_CONSTRAINT_TYPE:number = 11;
	/** @internal TODO*/
	static CONSTRAINT_MAX_CONSTRAINT_TYPE:number = 12;
	/** @internal error reduction parameter (ERP)*/
	static CONSTRAINT_CONSTRAINT_ERP:number = 1;
	/** @internal*/
	static CONSTRAINT_CONSTRAINT_STOP_ERP:number = 2;
	/** @internal constraint force mixing（CFM）*/
	static CONSTRAINT_CONSTRAINT_CFM:number = 3;
	/** @internal*/
	static CONSTRAINT_CONSTRAINT_STOP_CFM:number = 4;
	/** @internal */
	static tempForceV3:Vector3 = new Vector3();
	/**@internal */
	_btConstraint: any;
	/** @internal */
	_simulation: PhysicsSimulation;
	/**@internal 回调参数*/
	_btJointFeedBackObj:number; 
	/** @internal */
	_anchor:Vector3 = new Vector3();
	/** @internal */
	_connectAnchor:Vector3 = new Vector3();
	/** @internal */
	_btframAPos:number;
	/** @internal */
	_btframBPos:number;
	/** @internal */
	_btframATrans:number;
	/** @internal */
	_btframBTrans:number;
	/**@internal */
	_constraintType:number;
	/**@internal */
	private _connectedBody: Rigidbody3D;
	/**@internal */
	private _ownBody:Rigidbody3D;
	/**@internal */
	private _feedbackEnabled: boolean = false;
	/**@internal */
	private _getJointFeedBack:boolean = false;
	/**@internal */
	private _currentForce:Vector3 = new Vector3();
	/**@internal */
	private _currentTorque:Vector3 = new Vector3();
	/**@internal */
	private _breakForce:number;
	/**@internal */
	private _breakTorque:number;
	
	/**
	 * @inheritDoc
	 * @override
	 */
	get enabled(): boolean {
		return super.enabled;
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	set enabled(value: boolean) {
		super.enabled = value;
	}

	/**
	 * 获取应用的冲力。
	 */
	get appliedImpulse(): number {
		if (!this._feedbackEnabled) {
			this._btConstraint.EnableFeedback(true);
			this._feedbackEnabled = true;
		}
		return this._btConstraint.AppliedImpulse;
	}

	/**@internal */
	set connectedBody(value:Rigidbody3D){
		this._connectedBody = value;
		value && (value.constaintRigidbodyB = this);
	}

	/**
	 * 获取连接的刚体B。
	 * @return 已连接刚体B。
	 */
	get connectedBody(): Rigidbody3D {
		return this._connectedBody;
	}


	/**
	 * 获取连接的刚体A。
	 * @return 已连接刚体A。
	 */
	get ownBody():Rigidbody3D{
		return this._ownBody;
	}

	/**@internal */
	set ownBody(value:Rigidbody3D){
		this._ownBody = value;
		value.constaintRigidbodyA = this;
	}
	/**
	 * 获得收到的总力
	 */
	get currentForce():Vector3{
		if(!this._getJointFeedBack)
			this._getFeedBackInfo();
		return this._currentForce;
	}

	/**
	 * 获取的总力矩
	 */
	get currentTorque():Vector3{
		if(!this._getJointFeedBack)
			this._getFeedBackInfo();
		return this._currentTorque;
	}

	/**
	 * 设置最大承受力
	 * @param value 最大承受力
	 */
	get breakForce():number{
        return this._breakForce;
    }
    set breakForce(value:number){
        this._breakForce = value;
	}
	
	/**
	 * 设置最大承受力矩
	 * @param value 最大承受力矩
	 */
	get breakTorque():number{
        return this._breakTorque;
    }
    set breakTorque(value:number){
        this._breakTorque = value;
	}

	/**
	 * 设置锚点
	 */
	set anchor(value:Vector3){
		value.cloneTo(this._anchor);
		this.setFrames();
	}

	get anchor(){
		return this._anchor;
	}

	/**
	 * 设置链接锚点
	 */
	set connectAnchor(value:Vector3){
		value.cloneTo(this._connectAnchor);
		this.setFrames();
	}

	get connectAnchor():Vector3{
		return this._connectAnchor;
	}

	/**
	 * 创建一个 <code>ConstraintComponent</code> 实例。
	 */
	constructor(constraintType:number) {
		super();
		this._constraintType = constraintType;
		var bt = Physics3D._bullet;
		this._btframATrans = bt.btTransform_create();
		this._btframBTrans = bt.btTransform_create();
		bt.btTransform_setIdentity(this._btframATrans);
		bt.btTransform_setIdentity(this._btframBTrans);
		this._btframAPos = bt.btVector3_create(0, 0, 0);
		this._btframBPos= bt.btVector3_create(0, 0, 0);
		bt.btTransform_setOrigin(this._btframATrans,  this._btframAPos);
		bt.btTransform_setOrigin(this._btframBTrans,  this._btframBPos);
		this._breakForce = -1;
		this._breakTorque = -1;
	}

	/**
	 * 设置迭代的次数，次数越高，越精确
	 * @param overideNumIterations 
	 */
	setOverrideNumSolverIterations(overideNumIterations:number): void {
		var bt = Physics3D._bullet;
		bt.btTypedConstraint_setOverrideNumSolverIterations(this._btConstraint, overideNumIterations);
	}

	/**
	 * 设置约束是否可用
	 * @param enable 
	 */
	setConstraintEnabled(enable:boolean): void {
		var bt = Physics3D._bullet;
		bt.btTypedConstraint_setEnabled(this._btConstraint, enable);
	}

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_onEnable():void{
		super._onEnable();
		this.enabled = true;
	}

	_onDisable():void{
		super._onDisable();
		this.enabled = false;
	}
	/**
	 * @override
	 * @internal
	 */
	setFrames(){
		var bt = Physics3D._bullet;
		bt.btVector3_setValue(this._btframAPos,-this._anchor.x,this.anchor.y,this.anchor.z);
		bt.btVector3_setValue(this._btframBPos,-this._connectAnchor.x,this._connectAnchor.y,this._connectAnchor.z);
		bt.btTransform_setOrigin(this._btframATrans,this._btframAPos);
		bt.btTransform_setOrigin(this._btframBTrans,this._btframBPos);
	}
	/**
	 * @internal
	 */
	_addToSimulation(): void {
	}

	/**
	 * @internal
	 */
	_removeFromSimulation(): void {
	}

	/**
	 * @internal
	 */
	_createConstraint():void{
	}

	/**
	 * 设置约束刚体
	 * @param ownerRigid 
	 * @param connectRigidBody 
	 * @override
	 */
	setConnectRigidBody(ownerRigid:Rigidbody3D,connectRigidBody:Rigidbody3D){
		var ownerCanInSimulation:Boolean = (ownerRigid)&&(!!(ownerRigid._simulation && ownerRigid._enabled && ownerRigid.colliderShape));
		var connectCanInSimulation:Boolean = (connectRigidBody)&&(!!(connectRigidBody._simulation && connectRigidBody._enabled && connectRigidBody.colliderShape));
		if(!(ownerCanInSimulation&&connectCanInSimulation))
			throw "ownerRigid or connectRigidBody is not in Simulation";
		if(ownerRigid!=this._ownBody||connectRigidBody!=this._connectedBody){
			var canInSimulation = !!(this.enabled&&this._simulation);
			canInSimulation && this._removeFromSimulation();
			this._ownBody = ownerRigid;
			this._connectedBody = connectRigidBody;
			this._ownBody.constaintRigidbodyA = this;
			this._connectedBody.constaintRigidbodyB = this;
			this._createConstraint();
		}
	}
	
	

	/**
	 * 获得当前力
	 * @param out 
	 */
	getcurrentForce(out:Vector3){
		if(!this._btJointFeedBackObj)
		throw "this Constraint is not simulation";
		var bt = Physics3D._bullet;
		var applyForce:number =bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
		out.setValue(bt.btVector3_x(applyForce),bt.btVector3_y(applyForce),bt.btVector3_z(applyForce));
		return;
    }

	/**
	 * 获得当前力矩
	 * @param out 
	 */
    getcurrentTorque(out:Vector3){
		if(!this._btJointFeedBackObj)
		throw "this Constraint is not simulation";
		var bt = Physics3D._bullet;
		var applyTorque:number =bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
		out.setValue(bt.btVector3_x(applyTorque),bt.btVector3_y(applyTorque),bt.btVector3_z(applyTorque));
		return;
	}
	
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		var physics3D: any = Physics3D._bullet;
		this._simulation&&this._removeFromSimulation();
		if(this._btConstraint&&this._btJointFeedBackObj&&this._simulation){
			physics3D.btTypedConstraint_destroy(this._btConstraint);
			physics3D.btJointFeedback_destroy(this._btJointFeedBackObj);
			this._btJointFeedBackObj = null;
			this._btConstraint = null;
		}
		super._onDisable();
	}

	/**
	 * @internal
	 */
	_isBreakConstrained():Boolean{
		this._getJointFeedBack = false;
		if(this.breakForce==-1&&this.breakTorque==-1)
			return false;
		this._getFeedBackInfo();	
		var isBreakForce:Boolean = this._breakForce!=-1&&(Vector3.scalarLength(this._currentForce)>this._breakForce);
		var isBreakTorque:Boolean = this._breakTorque!=-1&&(Vector3.scalarLength(this._currentTorque)>this._breakTorque);
		if(isBreakForce||isBreakTorque){
			this._breakConstrained();
			return true;
		}
		return false;
	}


	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_parse(data: any): void {
		this._anchor.fromArray(data.anchor);
		this._connectAnchor.fromArray(data.connectAnchor);
		this.setFrames();
	}
	/**
	 * @internal
	 */
	private _getFeedBackInfo(){
		var bt = Physics3D._bullet;
		var applyForce:number =bt.btJointFeedback_getAppliedForceBodyA(this._btJointFeedBackObj);
		var applyTorque:number = bt.btJointFeedback_getAppliedTorqueBodyA(this._btJointFeedBackObj);
		this._currentTorque.setValue(bt.btVector3_x(applyTorque),bt.btVector3_y(applyTorque),bt.btVector3_z(applyTorque));
		this._currentForce.setValue(bt.btVector3_x(applyForce),bt.btVector3_y(applyForce),bt.btVector3_z(applyForce));
		this._getJointFeedBack = true;
	}

	/**
	 * @internal
	 */
	_breakConstrained():void{
		this.ownBody.constaintRigidbodyA=null;
		this.connectedBody && (this.connectedBody.constaintRigidbodyB=null);
		this.destroy();
	}
	
}

