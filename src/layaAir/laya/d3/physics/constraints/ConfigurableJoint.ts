import { ConstraintComponent } from "./ConstraintComponent";
import { Component } from "../../../components/Component";
import { Physics3D } from "../Physics3D";
import { Scene3D } from "../../core/scene/Scene3D";
import { Vector3 } from "../../math/Vector3";

export class ConfigurableJoint extends ConstraintComponent{
	/** @internal */
	static CONFIG_MOTION_TYPE_LOCKED:number = 0;
	/** @internal */
	static CONFIG_MOTION_TYPE_LIMITED:number = 1;
	/** @internal */
	static CONFIG_MOTION_TYPE_FREE:number = 2;
	/** @internal */
	static MOTION_LINEAR_INDEX_X:number = 0;
	/** @internal */
	static MOTION_LINEAR_INDEX_Y:number = 1;
	/** @internal */
	static MOTION_LINEAR_INDEX_Z:number = 2;
	/** @internal */
	static MOTION_ANGULAR_INDEX_X:number = 3;
	/** @internal */
	static MOTION_ANGULAR_INDEX_Y:number = 4;
	/** @internal */
	static MOTION_ANGULAR_INDEX_Z:number = 5;

	/** @internal */
	private _btAxis:number;
	/** @internal */
	private _btSecondaryAxis:number;
	/** @internal */
	private _axis:Vector3 = new Vector3();
	/** @internal */
	private _secondaryAxis:Vector3 = new Vector3();
	/** @internal */
	private _minLinearLimit:Vector3 = new Vector3();
	/** @internal */
	private _maxLinearLimit:Vector3 = new Vector3();
	/** @internal */
	private _minAngularLimit:Vector3 = new Vector3();
	/** @internal */
	private _maxAngularLimit:Vector3 = new Vector3();
	/** @internal */
	private _linearLimitSpring:Vector3 = new Vector3();
	/** @internal */
	private _angularLimitSpring:Vector3 = new Vector3();
	/** @internal */
	private _linearBounce:Vector3 = new Vector3();
	/** @internal */
	private _angularBounce:Vector3 = new Vector3();
	/** @internal */
	private _xMotion:number;
	/** @internal */
	private _yMotion:number;
	/** @internal */
	private _zMotion:number;
	/** @internal */
	private _angularXMotion:number;
	/** @internal */
	private _angularYMotion:number;
	/** @internal */
	private _angularZMotion:number;
	/**
	 * 创建一个<code>Generic6DofSpring2Constraint</code>实例
	 */
	constructor(){
		super(ConstraintComponent.CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE);
		var bt = Physics3D._bullet;
		this._btAxis =bt.btVector3_create(-1.0,0.0,0.0);
		this._btSecondaryAxis = bt.btVector3_create(0.0,1.0,0.0);
		this.breakForce = -1;
		this.breakTorque = -1;	
	}

	/**
	 * 主轴
	 */
	get axis():Vector3{
		return this._axis;
	}

	/**
	 * 副轴
	 */
	get secondaryAxis():Vector3{
		return this._secondaryAxis;
	}

	/**
	 * X轴线性约束模式
	 */
	set XMotion(value:number){
		//坐标系转换
		if(this._xMotion!=value){
			this._xMotion = value;
			var min = -this._maxLinearLimit.x;
			var max = -this._minLinearLimit.x;
			this.setLimit(ConfigurableJoint.MOTION_LINEAR_INDEX_X,value,min,max);
		}
	}

	get XMotion():number{
		return this._xMotion;
	}

	/**
	 * Y轴线性约束模式
	 */
	set YMotion(value:number){
		if(this._yMotion!=value){
			this._yMotion = value;
			this.setLimit(ConfigurableJoint.MOTION_LINEAR_INDEX_Y,value,this._minLinearLimit.y,this._maxLinearLimit.y);
		}
			
	}

	get YMotion():number{
		return this._yMotion;
	}

	/**
	 * Z轴线性约束模式
	 */
	set ZMotion(value:number){
		if(this._zMotion!=value){
			this._zMotion = value;
			this.setLimit(ConfigurableJoint.MOTION_LINEAR_INDEX_Z,value,this._minLinearLimit.z,this._maxLinearLimit.z);
		}
	}

	get ZMotion():number{
		return this._zMotion;
	}

	/**
	 * X轴旋转约束模式
	 */
	set angularXMotion(value:number){
		//坐标系转换
		if(this._angularXMotion!=value){
			this._angularXMotion = value;
			var min = -this._maxAngularLimit.x;
			var max = -this._minAngularLimit.x;
			this.setLimit(ConfigurableJoint.MOTION_ANGULAR_INDEX_X,value,min,max);
		}
	}

	get angularXMotion():number{
		return this._angularXMotion;
	}

	/**
	 * Y轴旋转约束模式
	 */
	set angularYMotion(value:number){
		if(this._angularYMotion!=value){
			this._angularYMotion = value;
			this.setLimit(ConfigurableJoint.MOTION_ANGULAR_INDEX_Y,value,this._minAngularLimit.y,this._maxAngularLimit.y);
		}
			
	}

	get angularYMotion():number{
		return this._angularYMotion;
	}

	/**
	 * Z轴旋转约束模式
	 */
	set angularZMotion(value:number){
		if(this._angularZMotion!=value){
			this._angularZMotion = value;
			this.setLimit(ConfigurableJoint.MOTION_ANGULAR_INDEX_Z,value,this._minAngularLimit.z,this._maxAngularLimit.z);
		}
	}

	get angularZMotion():number{
		return this._angularZMotion;
	}

	/**
	 * 线性弹簧
	 */
	set linearLimitSpring(value:Vector3){
		if(!Vector3.equals(this._linearLimitSpring,value)){
			value.cloneTo(this._linearLimitSpring);
			this.setSpring(ConfigurableJoint.MOTION_LINEAR_INDEX_X,value.x);
			this.setSpring(ConfigurableJoint.MOTION_LINEAR_INDEX_Y,value.y);
			this.setSpring(ConfigurableJoint.MOTION_LINEAR_INDEX_Z,value.z);
		}
	}

	get linearLimitSpring():Vector3{
		return this._linearLimitSpring;
	}

	/**
	 * 角度弹簧
	 */
	set angularLimitSpring(value:Vector3){
		if(!Vector3.equals(this._angularLimitSpring,value)){
			value.cloneTo(this._angularLimitSpring);
			this.setSpring(ConfigurableJoint.MOTION_ANGULAR_INDEX_X,value.x);
			this.setSpring(ConfigurableJoint.MOTION_ANGULAR_INDEX_Y,value.y);
			this.setSpring(ConfigurableJoint.MOTION_ANGULAR_INDEX_Z,value.z);
		}
	}

	get angularLimitSpring():Vector3{
		return this._angularLimitSpring;
	}

	/**
	 * 线性弹力
	 */
	set linearBounce(value:Vector3){
		if(!Vector3.equals(this._linearBounce,value)){
			value.cloneTo(this._linearBounce);
			this.setBounce(ConfigurableJoint.MOTION_LINEAR_INDEX_X,value.x);
			this.setBounce(ConfigurableJoint.MOTION_LINEAR_INDEX_Y,value.y);
			this.setBounce(ConfigurableJoint.MOTION_LINEAR_INDEX_Z,value.z);
		}
	}

	get linearBounce():Vector3{
		return this._linearBounce;
	}

	/**
	 * 角度弹力
	 */
	set angularBounce(value:Vector3){
		if(!Vector3.equals(this._angularBounce,value)){
			value.cloneTo(this._angularBounce);
			this.setBounce(ConfigurableJoint.MOTION_ANGULAR_INDEX_X,value.x);
			this.setBounce(ConfigurableJoint.MOTION_ANGULAR_INDEX_Y,value.y);
			this.setBounce(ConfigurableJoint.MOTION_ANGULAR_INDEX_Z,value.z);
		}
	}

	get angularBounce():Vector3{
		return this._angularBounce;
	}

	/**
	 * 设置对象自然旋转的局部轴主轴，axis2为副轴
	 * @param axis1 
	 * @param axis2 
	 */
	setAxis(axis:Vector3, secondaryAxis:Vector3): void {
		var bt = Physics3D._bullet;
		this._axis.setValue(axis.x,axis.y,axis.y);
		this._secondaryAxis.setValue(secondaryAxis.x,secondaryAxis.y,secondaryAxis.z);
		this._btAxis = bt.btVector3_setValue(-axis.x, axis.y, axis.z);
		this._btSecondaryAxis = bt.btVector3_setValue(-secondaryAxis.x, secondaryAxis.y, secondaryAxis.z);
		bt.btGeneric6DofSpring2Constraint_setAxis(this._btConstraint, this._btAxis, this._btSecondaryAxis);
	}

	/**
	 * @internal 
	 */
	setLimit(axis:number,motionType:number,low:number, high:number): void {
		var bt = Physics3D._bullet;
		switch(motionType)
		{
			case ConfigurableJoint.CONFIG_MOTION_TYPE_LOCKED:
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 0, 0);
				 break;
			case ConfigurableJoint.CONFIG_MOTION_TYPE_LIMITED:
				if(low<high)
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, low, high);
				break;
			case ConfigurableJoint.CONFIG_MOTION_TYPE_FREE:
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 1, 0);
				break;
			default:
				throw "No Type of Axis Motion";	 
		} 
	}
	/**
	 * @internal
	 */
	setSpring(axis:number, springValue:number): void {
		var bt = Physics3D._bullet;
		var enableSpring:Boolean = springValue>0;
		bt.btGeneric6DofSpring2Constraint_enableSpring(this._btConstraint, axis, enableSpring);
		if(enableSpring)
		bt.btGeneric6DofSpring2Constraint_setStiffness(this._btConstraint, axis, springValue);
	}
	/**
	 * @internal
	 */
	setBounce(axis:number, bounce:number): void {
		var bt = Physics3D._bullet;
		bounce = bounce<=0?0:bounce;
		bt.btGeneric6DofSpring2Constraint_setBounce(this._btConstraint, axis, bounce);
	}

	/**
	 * @internal
	 */
	setDamping(axis:number, damp:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setDamping(this._btConstraint, axis, damp);
	} 
	// /**
	//  * 设置平衡点
	//  * @param axis 
	//  * @param equilibriumPoint 
	//  */
	// setEquilibriumPoint(axis:number, equilibriumPoint:number): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btConstraint, axis, equilibriumPoint);
	// }
	// /**
	//  * 是否开启驱动力，主动施加驱动力以使对象运动。 以达到“目标位置”和“目标角速度”
	//  * @param axis 
	//  * @param isEnableMotor 
	//  */
	// enableMotor(axis:number, isEnableMotor:boolean): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_enableMotor(this._btConstraint, axis, isEnableMotor);
	// }
	// /**
	//  * 是否开启Servo，需要达到“目标位置”时需要开启
	//  * @param axis 
	//  * @param onOff 
	//  */
	// setServo(axis:number, onOff:boolean): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_setServo(this._btConstraint, axis, onOff);
	// }
	// /**
	//  * 设置达到的目标速度
	//  * @param axis 
	//  * @param velocity 
	//  */
	// setTargetVelocity(axis:number, velocity:number): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btConstraint, axis, velocity);
	// }
	// /**
	//  * 设置达到的目标位置
	//  * @param axis 
	//  * @param target 
	//  */
	// setTargetPosition(axis:number, target:number): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_setServoTarget(this._btConstraint, axis, target);
	// }
	// /**
	//  * 设置驱动力的最大值
	//  * @param axis 
	//  * @param force 
	//  */
	// setMaxMotorForce(axis:number, force:number): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btGeneric6DofSpring2Constraint_setMaxMotorForce(this._btConstraint, axis, force);
	// }	
	// /**
	//  * 设置约束的参数
	//  * @param axis 
	//  * @param constraintParams 
	//  * @param value 
	//  */
	// setParam(axis:number, constraintParams:number, value:number): void {
	// 	var bt = Physics3D._bullet;
	// 	bt.btTypedConstraint_setParam(this._btConstraint, axis, constraintParams, value);
	// }
	/**
	 * 设置TODO
	 * @param frameA 
	 * @param frameB 
	 */
	setFrames(frameA:number, frameB:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setFrames(this._btConstraint, frameA, frameB);
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
		var connectTransform = bt.btCollisionObject_getWorldTransform(this.connectedBody.btColliderObject);
		var physicsTransform = bt.btCollisionObject_getWorldTransform(this.ownBody.btColliderObject);
		this._btConstraint = bt.btGeneric6DofSpring2Constraint_create(this.connectedBody.btColliderObject, connectTransform, this.ownBody.btColliderObject, physicsTransform);
		this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);
		bt.btTypedConstraint_setJointFeedback(this._btConstraint,this._btJointFeedBackObj);
		bt.btTypedConstraint_setParam(this._btConstraint, 0, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 0, 4, 0.0);

		bt.btTypedConstraint_setParam(this._btConstraint, 1, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 1, 4, 0.0);

		bt.btTypedConstraint_setParam(this._btConstraint, 2, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 2, 4, 0.0);

		bt.btTypedConstraint_setParam(this._btConstraint, 3, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 3, 4, 0.0);

		bt.btTypedConstraint_setParam(this._btConstraint, 4, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 4, 4, 0.0);
		
		bt.btTypedConstraint_setParam(this._btConstraint, 5, 2, 0.04);
		bt.btTypedConstraint_setParam(this._btConstraint, 5, 4, 0.0);
		this._simulation = ((<Scene3D>this.owner._scene)).physicsSimulation;
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
	 * @override
	 * @internal
	 */
	_cloneTo(dest: Component): void {
		
	}
}