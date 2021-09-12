import { ConstraintComponent } from "./ConstraintComponent";
import { Scene3D } from "../../core/scene/Scene3D";
import { Vector3 } from "../../math/Vector3";
import { Rigidbody3D } from "../Rigidbody3D";
import { Sprite3D } from "../../core/Sprite3D";
import { Physics3D } from "../../Physics3D";

/**
 * <code>ConfigurableConstraint</code>类用于可设置的约束组件
 */
export class ConfigurableConstraint extends ConstraintComponent{
	/** 约束限制模式  完全限制 */
	static CONFIG_MOTION_TYPE_LOCKED:number = 0;
	/** 约束限制模式  范围限制 */
	static CONFIG_MOTION_TYPE_LIMITED:number = 1;
	/** 约束限制模式  不限制 */
	static CONFIG_MOTION_TYPE_FREE:number = 2;
	/** @internal 线性x轴*/
	static MOTION_LINEAR_INDEX_X:number = 0;
	/** @internal 线性Y轴*/
	static MOTION_LINEAR_INDEX_Y:number = 1;
	/** @internal 线性Z轴*/
	static MOTION_LINEAR_INDEX_Z:number = 2;
	/** @internal 旋转X轴*/
	static MOTION_ANGULAR_INDEX_X:number = 3;
	/** @internal 旋转Y轴*/
	static MOTION_ANGULAR_INDEX_Y:number = 4;
	/** @internal 旋转Z轴*/
	static MOTION_ANGULAR_INDEX_Z:number = 5;
	/** @internal */
	static RO_XYZ:number = 0;
	/** @internal */
	static RO_XZY:number = 1;
	/** @internal */
	static RO_YXZ:number = 2;
	/** @internal */
	static RO_YZX:number = 3;
	/** @internal */
	static RO_ZXY:number = 4;
	/** @internal */
	static RO_ZYX:number = 5;
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
	private _linearDamp:Vector3 = new Vector3();
	/** @internal */
	private _angularDamp:Vector3 = new Vector3();
	/** @internal */
	private _xMotion:number = 0;
	/** @internal */
	private _yMotion:number = 0;
	/** @internal */
	private _zMotion:number = 0;
	/** @internal */
	private _angularXMotion:number = 0;
	/** @internal */
	private _angularYMotion:number = 0;
	/** @internal */
	private _angularZMotion:number = 0;
	/**
	 * 创建一个<code>ConfigurableConstraint</code>实例	可设置的约束组件
	 */
	constructor(){
		super(ConstraintComponent.CONSTRAINT_D6_SPRING_CONSTRAINT_TYPE);
		var bt = Physics3D._bullet;
		this._btAxis =bt.btVector3_create(-1.0,0.0,0.0);
		this._btSecondaryAxis = bt.btVector3_create(0.0,1.0,0.0);
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
	 * 旋转角度最大值
	 */
	set maxAngularLimit(value:Vector3){
		value.cloneTo(this._maxAngularLimit);
	}

	/**
	 * 旋转角度最小值
	 */
	set minAngularLimit(value:Vector3){
		value.cloneTo(this._minAngularLimit);
	}

	get maxAngularLimit():Vector3{
		return this._maxAngularLimit;
	}

	get minAngularLimit():Vector3{
		return this._minAngularLimit;
	}

	/**
	 * 最大线性位置
	 */
	set maxLinearLimit(value:Vector3){
		value.cloneTo(this._maxLinearLimit);
	}

	/**
	 * 最小线性位置
	 */
	set minLinearLimit(value:Vector3){
		value.cloneTo(this._minLinearLimit);
	}


	get maxLinearLimit():Vector3{
		return this._maxLinearLimit;
	}

	get minLinearLimit():Vector3{
		return this._minLinearLimit;
	}
	/**
	 * X轴线性约束模式
	 */
	set XMotion(value:number){
		//坐标系转换
		if(this._xMotion!=value){
			this._xMotion = value;
			this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,value, -this._maxLinearLimit.x,-this._minLinearLimit.x);
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
			this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,value,this._minLinearLimit.y,this._maxLinearLimit.y);
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
			this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,value,this._minLinearLimit.z,this._maxLinearLimit.z);
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
			this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,value,-this._maxAngularLimit.x,-this._minAngularLimit.x);
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
			this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,value,this._minAngularLimit.y,this._maxAngularLimit.y);
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
			this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,value,this._minAngularLimit.z,this._maxAngularLimit.z);
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
			this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,value.x);
			this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,value.y);
			this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,value.z);
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
			this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,value.x);
			this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,value.y);
			this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,value.z);
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
			this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,value.x);
			this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,value.y);
			this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,value.z);
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
			this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,value.x);
			this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,value.y);
			this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,value.z);
		}
	}

	get angularBounce():Vector3{
		return this._angularBounce;
	}

	/**
	 * 线性阻力
	 */
	set linearDamp(value:Vector3){
		if(!Vector3.equals(this._linearDamp,value)){
			value.cloneTo(this._linearDamp);
			this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,value.x);
			this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,value.y);
			this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,value.z);
		}
	}

	get linearDamp():Vector3{
		return this._linearDamp;
	}

	/**
	 * 角度阻力
	 */
	set angularDamp(value:Vector3){
		if(!Vector3.equals(this._angularDamp,value)){
			value.cloneTo(this._angularDamp);
			this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,value.x);
			this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,value.y);
			this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,value.z);
		}
	}

	get angularDamp():Vector3{
		return this._angularDamp;
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
	 * 设置对象自然旋转的局部轴主轴，axis2为副轴
	 * @param axis1 
	 * @param axis2 
	 */
	setAxis(axis:Vector3, secondaryAxis:Vector3): void {
		if(!this._btConstraint)
			return;
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
		if(!this._btConstraint)
			return;
		var bt = Physics3D._bullet;
		switch(motionType)
		{
			case ConfigurableConstraint.CONFIG_MOTION_TYPE_LOCKED:
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 0, 0);
				 break;
			case ConfigurableConstraint.CONFIG_MOTION_TYPE_LIMITED:
				if(low<high)
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, low, high);
				break;
			case ConfigurableConstraint.CONFIG_MOTION_TYPE_FREE:
				bt.btGeneric6DofSpring2Constraint_setLimit(this._btConstraint, axis, 1, 0);
				break;
			default:
				throw "No Type of Axis Motion";	 
		} 
	}
	/**
	 * @internal
	 */
	setSpring(axis:number, springValue:number, limitIfNeeded:boolean = true): void {
		if(!this._btConstraint)
			return;
		var bt = Physics3D._bullet;
		var enableSpring:Boolean = springValue>0;
		bt.btGeneric6DofSpring2Constraint_enableSpring(this._btConstraint, axis, enableSpring);
		if(enableSpring)
		bt.btGeneric6DofSpring2Constraint_setStiffness(this._btConstraint, axis, springValue, limitIfNeeded);
	}
	/**
	 * @internal
	 */
	setBounce(axis:number, bounce:number): void {
		if(!this._btConstraint)
			return;
		var bt = Physics3D._bullet;
		bounce = bounce<=0?0:bounce;
		bt.btGeneric6DofSpring2Constraint_setBounce(this._btConstraint, axis, bounce);
	}

	/**
	 * @internal
	 */
	setDamping(axis:number, damp:number, limitIfNeeded:boolean = true): void {
		if(!this._btConstraint)
			return;
		var bt = Physics3D._bullet;
		damp = damp<=0?0:damp;
		bt.btGeneric6DofSpring2Constraint_setDamping(this._btConstraint, axis, damp, limitIfNeeded);
	} 
	/**
	 * TODO
	 * @internal
	 */
	setEquilibriumPoint(axis:number, equilibriumPoint:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setEquilibriumPoint(this._btConstraint, axis, equilibriumPoint);
	}
	/**
	 * @internal
	 */
	enableMotor(axis:number, isEnableMotor:boolean): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_enableMotor(this._btConstraint, axis, isEnableMotor);
	}
	/**
	 * TODO
	 * @internal
	 */
	setServo(axis:number, onOff:boolean): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setServo(this._btConstraint, axis, onOff);
	}
	/**
	 * TODO
	 * @internal
	 */
	setTargetVelocity(axis:number, velocity:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setTargetVelocity(this._btConstraint, axis, velocity);
	}
	/**
	 * TODO
	 * @internal
	 */
	setTargetPosition(axis:number, target:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setServoTarget(this._btConstraint, axis, target);
	}
	/**
	 * TODO
	 * @internal
	 */
	setMaxMotorForce(axis:number, force:number): void {
		var bt = Physics3D._bullet;
		bt.btGeneric6DofSpring2Constraint_setMaxMotorForce(this._btConstraint, axis, force);
	}	
	/**
	 * TODO
	 * @internal
	 */
	setParam(axis:number, constraintParams:number, value:number): void {
		var bt = Physics3D._bullet;
		bt.btTypedConstraint_setParam(this._btConstraint, axis, constraintParams, value);
	}
	/**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	setFrames(): void {
		super.setFrames();
		var bt = Physics3D._bullet;
		if(!this._btConstraint)
			return;
		bt.btGeneric6DofSpring2Constraint_setFrames(this._btConstraint, this._btframATrans, this._btframBTrans);
	}
	
	/**
	 * @internal
	 */
	_addToSimulation(): void {
		this._simulation && this._simulation.addConstraint(this,this.enabled);
    }
    
     /**
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
		this._btConstraint = bt.btGeneric6DofSpring2Constraint_create(this.ownBody.btColliderObject, this._btframAPos, this.connectedBody.btColliderObject, this._btframBPos, ConfigurableConstraint.RO_XYZ);
		this._btJointFeedBackObj = bt.btJointFeedback_create(this._btConstraint);
		bt.btTypedConstraint_setJointFeedback(this._btConstraint,this._btJointFeedBackObj);
		this._simulation = ((<Scene3D>this.owner._scene)).physicsSimulation;
		this._initAllConstraintInfo();
		this._addToSimulation();
		Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint,true);
	}

	_initAllConstraintInfo():void{
		//MotionMode
		this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,this._xMotion, -this._maxLinearLimit.x,-this._minLinearLimit.x);
		this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,this._yMotion,this._minLinearLimit.y,this._maxLinearLimit.y);
		this.setLimit(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,this._zMotion,this._minLinearLimit.z,this._maxLinearLimit.z);
		this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,this._angularXMotion,-this._maxAngularLimit.x,-this._minAngularLimit.x);
		this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,this._angularYMotion,this._minAngularLimit.y,this._maxAngularLimit.y);
		this.setLimit(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,this._angularZMotion,this._minAngularLimit.z,this._maxAngularLimit.z);
		this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,this._linearLimitSpring.x);
		this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,this._linearLimitSpring.y);
		this.setSpring(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,this._linearLimitSpring.z);
		this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,this._angularLimitSpring.x);
		this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,this._angularLimitSpring.y);
		this.setSpring(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,this._angularLimitSpring.z);
		this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,this._linearBounce.x);
		this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,this._linearBounce.y);
		this.setBounce(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,this._linearBounce.z);
		this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,this._angularBounce.x);
		this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,this._angularBounce.y);
		this.setBounce(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,this._angularBounce.z);
		this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_X,this._linearDamp.x);
		this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Y,this._linearDamp.y);
		this.setDamping(ConfigurableConstraint.MOTION_LINEAR_INDEX_Z,this._linearDamp.z);
		this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_X,this._angularDamp.x);
		this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Y,this._angularDamp.y);
		this.setDamping(ConfigurableConstraint.MOTION_ANGULAR_INDEX_Z,this._angularDamp.z);
		this.setFrames();
		this.setEquilibriumPoint(0,0);
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
		if(!this.connectedBody&&this._simulation)
			this._removeFromSimulation();
		if(this._btConstraint)
		Physics3D._bullet.btTypedConstraint_setEnabled(this._btConstraint,false);
	}
	
	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	_parse(data: any,interactMap:any = null): void {
		super._parse(data);
		this._axis.fromArray(data.axis);
		this._secondaryAxis.fromArray(data.secondaryAxis);
		var limitlimit:number = data.linearLimit;
		this._minLinearLimit.setValue(-limitlimit,-limitlimit,-limitlimit);
		this._maxLinearLimit.setValue(limitlimit,limitlimit,limitlimit);
		var limitSpring:number = data.linearLimitSpring;
		this._linearLimitSpring.setValue(limitSpring,limitSpring,limitSpring);
		var limitDamp:number = data.linearLimitDamper;
		this._linearDamp.setValue(limitDamp,limitDamp,limitDamp);
		var limitBounciness:number = data.linearLimitBounciness;
		this._linearBounce.setValue(limitBounciness,limitBounciness,limitBounciness);
		var xlowAngularLimit:number = data.lowAngularXLimit;
		var xhighAngularLimit:number = data.highAngularXLimit;
		var yAngularLimit:number = data.angularYLimit;
		var zAngularLimit:number = data.angularZLimit;
		this._minAngularLimit.setValue(xlowAngularLimit,-yAngularLimit,-zAngularLimit);
		this._maxAngularLimit.setValue(xhighAngularLimit,yAngularLimit,zAngularLimit);
		var xhighAngularBounciness:number = data.highAngularXLimitBounciness;
		var ybounciness:number = data.angularYLimitBounciness;
		var zbounciness:number = data.angularZLimitBounciness;
		this._angularBounce.setValue(xhighAngularBounciness,ybounciness,zbounciness);
		var xAngularSpring:number = data.angularXLimitSpring;
		var yzAngularSpriny:number = data.angularYZLimitSpring;
		this._angularLimitSpring.setValue(xAngularSpring,yzAngularSpriny,yzAngularSpriny);
		var xAngularDamper:number = data.angularXLimitDamper;
		var yzAngularDamper:number = data.angularYZLimitDamper;
		this._angularDamp.setValue(xAngularDamper,yzAngularDamper,yzAngularDamper);

		this.XMotion = data.xMotion;
		this.YMotion = data.yMotion;
		this.ZMotion = data.zMotion;
		this.angularXMotion = data.angularXMotion;
		this.angularYMotion = data.angularYMotion;
		this.angularZMotion = data.angularZMotion;	
		
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

	/**
	 * @inheritDoc
	 * @internal
	 * @override
	 */
	protected _onDestroy(): void {
		super._onDestroy();
	}




}