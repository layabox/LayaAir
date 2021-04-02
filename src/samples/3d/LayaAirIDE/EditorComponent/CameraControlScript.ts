import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { BaseCamera } from "laya/d3/core/BaseCamera";
import { Camera } from "laya/d3/core/Camera";
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
/**
 * 相机观测方向
 */
export enum IDE_RotateDirectFlags{
	Front,
	Right,
	Left,
	Back,
	Up,
	Down
}

/**
 * 类用来控制Editor中Camera的操作
 * @author miner
 */
export class CameraControlScript extends Script3D {

	//2*PI
    public static PI2 = Math.PI*2;
	// PI/2
    public static PIHALF = Math.PI/2;

	public static FRONTROTATE:Vector3 = new Vector3(0,CameraControlScript.PIHALF,0);
	public static RIGHTROTATE:Vector3 = new Vector3(CameraControlScript.PIHALF,CameraControlScript.PIHALF,0);
	public static BACKROTATE:Vector3 = new Vector3(Math.PI,CameraControlScript.PIHALF,0);
	public static LEFTROTATE:Vector3 = new Vector3(Math.PI+CameraControlScript.PIHALF,CameraControlScript.PIHALF,0);
	public static UPROTATE:Vector3 = new Vector3(0,0,0);
	public static DOWNROTATE:Vector3 = new Vector3(0,Math.PI,0);

	/**@private */
	private static tempVec3 = new Vector3();
	private static animatorTempVec3 = new Vector3();
	/**@private */
	private _lastMouseX: number;
	/**@private */
	private _lastMouseY: number;
	private _isMouseDown: boolean;
	private _camera: BaseCamera;
	private _rotateXDir:number = 1;

	//旋转中心点
	private _rotateTarget:Vector3 = new Vector3(0,0,0);
	//旋转角度
    private _currentRotate:Vector3 = new Vector3(0,CameraControlScript.PIHALF,0);
	//camera的位置
    private _currentPosition:Vector3 = new Vector3(0,0,0);
	//旋转半径
	private _radius:number = 0;
	//旋转动画长度，总帧数
	private _animatorSize = 10;
	//目前执行到动画的帧数
	private _animatorDo = 0;
	//动画步进值
	private _animatorStepX = 0;
	private _animatorStepY = 0;


	rotateSpeed:number = 1;
	wheelSpeed:number = 1;
	stepRadius:number = 5;
	LowWheelSpeed:number = 0.2;

	constructor() {
		super();

	}


	/**
	 * 同步相机位置通过Target radius currentRotate
	 */
	public static calByIcoXYZ(targetVec:Vector3,currentPosition:Vector3,radius:number,currentRotate:Vector3,camera:BaseCamera){
		currentRotate.x = (currentRotate.x+CameraControlScript.PI2)%(CameraControlScript.PI2);
		currentRotate.y = (currentRotate.y<-Math.PI)?currentRotate.y+CameraControlScript.PI2:(currentRotate.y>Math.PI?currentRotate.y-CameraControlScript.PI2:currentRotate.y);
		var xoyLength:number = Math.sin(currentRotate.y);
		currentPosition.setValue(Math.sin(currentRotate.x)*xoyLength,Math.cos(currentRotate.y),Math.cos(currentRotate.x)*xoyLength);
		Vector3.normalize(currentPosition,currentPosition);
		Vector3.scale(currentPosition,radius,currentPosition); 
		Vector3.add(currentPosition,targetVec,currentPosition);
		camera.transform.position =currentPosition;
		CameraControlScript.tempVec3.setValue(0,1,0);
		camera.transform.lookAt(targetVec,CameraControlScript.tempVec3,true);
		camera.transform.rotationEuler.z =currentRotate.y>0?0:180;
		camera.transform.rotationEuler = camera.transform.rotationEuler;
		camera.transform.worldMatrix = camera.transform.worldMatrix;
	}

	/**
	 * 根据位置计算观察角度
	 */
	private _caculateRotate(){
		Vector3.subtract(this._camera.transform.position,this._rotateTarget,CameraControlScript.tempVec3); 
		Vector3.normalize(CameraControlScript.tempVec3,CameraControlScript.tempVec3);
		this._currentRotate.y = Math.acos(CameraControlScript.tempVec3.y);
		this._currentRotate.y = (this._currentRotate.y<-Math.PI)?this._currentRotate.y+CameraControlScript.PI2:(this._currentRotate.y>Math.PI?this._currentRotate.y-CameraControlScript.PI2:this._currentRotate.y);
		this._currentRotate.x = Math.atan(CameraControlScript.tempVec3.x/CameraControlScript.tempVec3.z);	
		this._currentRotate.x = (this._currentRotate.x+CameraControlScript.PI2)%(CameraControlScript.PI2);
		this._camera.transform.rotationEuler.cloneTo(this._currentPosition);
		this._updateRotation(0,0,0);
	}

	//设置观测中点
	set currentTarget(value:Vector3){
		this._rotateTarget = value;
		this._caculateRotate();
	}

	get currentTarget():Vector3{
		return this._rotateTarget;
	}

	get currentRotate():Vector3{
		return this._currentRotate;
	}

	/**
	 * 无死角旋转方法
	 * 
	 * @private
	 */
	private _updateRotation(offsetX:number,offsetY:number,elapsedTime:number): void {
		offsetX = offsetX/Laya.stage.width*CameraControlScript.PI2*this.rotateSpeed;
		offsetY = offsetY/Laya.stage.height*CameraControlScript.PI2*this.rotateSpeed;
		//上半球下半球x的旋转相反
		//计算
		// if(this._currentRotate.y<0)
		// 	this._currentRotate.x +=offsetX;
		// else
			this._currentRotate.x -=offsetX*this._rotateXDir;
		
		this._currentRotate.y -=offsetY;
		this._updateCameraByRotateValue()
	}

	//根据角度旋转相机，修改相机位置
	private _updateCameraByRotateValue(){
		CameraControlScript.calByIcoXYZ(this._rotateTarget,this._currentPosition,this.radius,this._currentRotate,this._camera);
	}

	/**
	 * 旋转动画
	 */
	doRotateAnimator(directEnum:IDE_RotateDirectFlags){
		var targetRotate:Vector3;
		switch(directEnum){
			case IDE_RotateDirectFlags.Front:
				targetRotate = CameraControlScript.FRONTROTATE;
				break;
			case IDE_RotateDirectFlags.Right:
				targetRotate = CameraControlScript.RIGHTROTATE;
				break;
			case IDE_RotateDirectFlags.Back:
				targetRotate = CameraControlScript.BACKROTATE;
				break;
			case IDE_RotateDirectFlags.Left:
				targetRotate = CameraControlScript.LEFTROTATE;
				break;
			case IDE_RotateDirectFlags.Up:
				targetRotate = CameraControlScript.UPROTATE;
				break;
			case IDE_RotateDirectFlags.Down:
				targetRotate = CameraControlScript.DOWNROTATE;
				break;
		}
		this._animatorStepX = (targetRotate.x-this._currentRotate.x)/this._animatorSize;
		this._animatorStepY = (targetRotate.y-this._currentRotate.y)/this._animatorSize;
		this._animatorDo = 0;
		Laya.timer.frameLoop(1,this,this.doRotatetwoon);
		

	}

	//旋转动画
	private doRotatetwoon(){
		if(this._animatorDo==this._animatorSize){
			Laya.timer.clear(this,this.doRotatetwoon);
			return;
		}
		this._currentRotate.x+=this._animatorStepX;
		this._currentRotate.y+=this._animatorStepY;
		this._updateCameraByRotateValue();
		this._animatorDo++;
	}


	/**
	 * @inheritDoc
	 */
	/*override*/  onAwake(): void {
		Laya.stage.on(Event.RIGHT_MOUSE_DOWN, this, this._mouseDown);
		Laya.stage.on(Event.RIGHT_MOUSE_UP, this, this._mouseUp);
		Laya.stage.on(Event.MOUSE_OUT, this, this._mouseUp);
		Laya.stage.on(Event.MOUSE_WHEEL,this,this._mouseWheel);
		this._camera = (<Camera>this.owner);
		CameraControlScript.tempVec3.setValue(0,0,0);
		this._radius = Vector3.distance( this._camera.transform.position,CameraControlScript.tempVec3);
		this._camera.transform.lookAt(this._rotateTarget,CameraControlScript.tempVec3,true);
		this._caculateRotate();
    }
	

	/**
	 * @inheritDoc
	 */
	/*override*/  onUpdate(): void {
		var elapsedTime: number = Laya.timer.delta;
		var offsetX: number = Laya.stage.mouseX - this._lastMouseX;
		var offsetY: number = Laya.stage.mouseY - this._lastMouseY;

		//是否满足旋转条件
		if (!isNaN(this._lastMouseX) && !isNaN(this._lastMouseY) && this._isMouseDown) {	
			this._updateRotation(offsetX,offsetY,elapsedTime);
		}
		this._lastMouseX = Laya.stage.mouseX;
		this._lastMouseY = Laya.stage.mouseY;
	}

		/**
		 * @inheritDoc
		 */
		/*override*/  onDestroy(): void {
		Laya.stage.off(Event.RIGHT_MOUSE_DOWN, this, this._mouseDown);
		Laya.stage.off(Event.RIGHT_MOUSE_UP, this, this._mouseUp);
		Laya.stage.off(Event.MOUSE_OUT, this, this._mouseUp);
	}

	private _mouseDown(e: Event): void {
		this._lastMouseX = Laya.stage.mouseX;
		this._lastMouseY = Laya.stage.mouseY;
		this._isMouseDown = true;
		if(this._currentRotate.y<0)
			this._rotateXDir =-1;
		else
			this._rotateXDir =1;
	}

	private _mouseUp(e: Event): void {
		this._isMouseDown = false;
	}

	private _mouseWheel(e: Event) {
		
		if(this.radius<this.stepRadius)
		this.radius = this.radius - e.delta*this.LowWheelSpeed;
		else
		this.radius = this.radius - e.delta*this.wheelSpeed;
	}

	get radius(): number {
		return  this._radius;
	}

	set radius(value: number) {
		this._radius = Math.max(0.5, Math.min(500, value));
		this._updateRotation(0,0,0);
	}


	setRotateTarget(target:Vector3):void{
		
	}


	/**
	 * 向前移动。
	 * @param distance 移动距离。
	 */
	moveForward(distance: number): void {
	}

	/**
	 * 向右移动。
	 * @param distance 移动距离。
	 */
	moveRight(distance: number): void {
	}

	/**
	 * 向上移动。
	 * @param distance 移动距离。
	 */
	moveVertical(distance: number): void {
	}

}


