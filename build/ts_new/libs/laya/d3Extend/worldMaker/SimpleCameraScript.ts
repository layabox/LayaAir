import { Laya } from "Laya";
import { Script3D } from "laya/d3/component/Script3D";
import { Camera } from "laya/d3/core/Camera";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Event } from "laya/events/Event";
import { Keyboard } from "laya/events/Keyboard";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Handler } from "laya/utils/Handler";
import { ArcBall } from "./ArcBall";
	
	/**
	 * TODO 自己测试用。只要效果，不顾效率
	 * 摄像机世界坐标的z轴的反向表示看的方向
	 */
	export class SimpleCameraScript extends Script3D {
		/** @private */
		protected lastMouseX:number;
		protected lastMouseY:number;
		protected isMouseDown:boolean;
		protected isRightDown:boolean = false;
		protected camera:Camera;
		protected isWheel:number;
		protected isMove:boolean;
		
		
		 saveCameraInfoHandler:Handler;
		 updateWorldCentreDistance:Handler;
		 worldCentreDistance:number;
		
		 target:Vector3 = new Vector3();	// 摄像机的目标
		//public var pos:Vector3 = new Vector3();		// 摄像机的位置
		 dist:number = 10;				// 到目标的距离
		 camWorldMatrix:Matrix4x4 = new Matrix4x4(); // 计算出来的摄像机的世界矩阵
		 outMatrix:Matrix4x4 = new Matrix4x4();		// 最终给摄像机的矩阵。主要是加了target的影响
		
		 arcball:ArcBall = new ArcBall();
		private isInitArcball:boolean = false;
		private quatArcBallResult:Quaternion = new Quaternion();
		
		private movVel:number = 0.5;				// 移动速度，用来计算vMovVel的
		private vMovVel:Vector3 = new Vector3();	// 向量移动速度。实际使用的。
		private ctrlDown:boolean = false;
		
		constructor(posx:number, posy:number, posz:number, targetx:number, targety:number, targetz:number){
			super();
this.target.x = targetx;
			this.target.y = targety;
			this.target.z = targetz;
			var dx:number = targetx - posx;
			var dy:number = targety - posy;
			var dz:number = targetz - posz;
			this.dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
			var mat1:Matrix4x4 = new Matrix4x4();
			Matrix4x4.createLookAt(new Vector3(posx,posy,posz), this.target, new Vector3(0, 1, 0), mat1);
			mat1.invert(this.camWorldMatrix);
		
		}
		
		/*override*/  _onAdded():void {
			Laya.stage.on(Event.MOUSE_DOWN, this, this.mouseDown);
			Laya.stage.on(Event.MOUSE_UP, this, this.mouseUp);
			Laya.stage.on(Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
			Laya.stage.on(Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
			Laya.stage.on(Event.MOUSE_MOVE, this, this.mouseMov);
			Laya.stage.on(Event.MOUSE_WHEEL, this, this.mouseWheel);
			this.camera = (<Camera>this.owner );
			this.camera.transform.worldMatrix = this.camWorldMatrix;
		}
		
		/*override*/ protected _onDestroy():void {
			super._onDestroy();
			Laya.stage.off(Event.MOUSE_DOWN, this, this.mouseDown);
			Laya.stage.off(Event.MOUSE_UP, this, this.mouseUp);
			Laya.stage.off(Event.RIGHT_MOUSE_DOWN, this, this.rightMouseDown);
			Laya.stage.off(Event.RIGHT_MOUSE_UP, this, this.rightMouseUp);
			Laya.stage.off(Event.MOUSE_WHEEL, this, this.mouseWheel);
		}
		
		/*override*/  onUpdate():void {
			super.onUpdate();
			//移动的处理
			var mov:boolean = false;
			var vel:Vector3=  this.vMovVel;
			vel.x = vel.y = vel.z = 0;
			var cammat:Float32Array = this.camWorldMatrix.elements;
			var v:number = this.movVel;
			if(KeyBoardManager.hasKeyDown(Keyboard.A)){
				vel.x -= cammat[0] * v;
				vel.y -= cammat[1] * v;
				vel.z -= cammat[2] * v;
				mov = true;
			}
			if (KeyBoardManager.hasKeyDown(Keyboard.D)) {
				vel.x += cammat[0] * v;
				vel.y += cammat[1] * v;
				vel.z += cammat[2] * v;
				mov = true;
			}
			if (KeyBoardManager.hasKeyDown(Keyboard.S)) {
				vel.x += cammat[8] * v;
				vel.y += cammat[9] * v;
				vel.z += cammat[10] * v;
				mov = true;
			}
			if (KeyBoardManager.hasKeyDown(Keyboard.W)) {
				vel.x -= cammat[8] * v;
				vel.y -= cammat[9] * v;
				vel.z -= cammat[10] * v;
				mov = true;
			}
			
			if (mov) {
				// 平移相当于同时修改摄像机位置和target位置。摄像机与target的距离不变
				this.target.x += vel.x;
				this.target.y += vel.y;
				this.target.z += vel.z;
				
				// 加上target影响
				this.camera.transform.worldMatrix.cloneTo(this.outMatrix);
				this.outMatrix.elements[12] += vel.x;
				this.outMatrix.elements[13] += vel.y;
				this.outMatrix.elements[14] += vel.z;
				
				this.camera.transform.worldMatrix = this.outMatrix;
			}
			
			if (!this.isInitArcball && Laya.stage.width > 0) {
				this.arcball.init(Laya.stage.width, Laya.stage.height);
				this.isInitArcball = true;
			}
			this.updateCamera(Laya.timer.delta);
		}
		
		 frontView():void {
			this.camWorldMatrix.identity();
			var mat:Float32Array = this.camWorldMatrix.elements;
			mat[12] = this.target.x;
			mat[13] = this.target.y;
			mat[14] = this.target.z + this.dist;
			this.camera.transform.worldMatrix = this.camWorldMatrix;
		}
		
		 leftView():void {
			this.camWorldMatrix.identity();
			var mat:Float32Array = this.camWorldMatrix.elements;
			mat[0] = 0; mat[1] = 0; mat[2] = -1;	//x 轴转到了-z上
			// y不变
			mat[8] = 1; mat[9] = 0;  mat[10] = 0;	 	// z轴转到 x上
			mat[12] = this.target.x + this.dist;
			mat[13] = this.target.y;
			mat[14] = this.target.z ;
			this.camera.transform.worldMatrix = this.camWorldMatrix;
		}
		
		 topView():void {
			this.camWorldMatrix.identity();
			var mat:Float32Array = this.camWorldMatrix.elements;
			mat[4] = 0; mat[5] = 0; mat[6] = -1;
			mat[8] = 0; mat[9] = 1, mat[10] =0;
			mat[12] = this.target.x;
			mat[13] = this.target.y + this.dist;
			mat[14] = this.target.z;
			this.camera.transform.worldMatrix = this.camWorldMatrix;
		}
		
		/**
		 * 看向这个目标，但是不改变距离
		 * @param	px
		 * @param	py
		 * @param	pz
		 * @param	size
		 */
		 setTarget(px:number, py:number, pz:number, size:number):void {
			this.target.x = px;
			this.target.y = py;
			this.target.z = pz;
			// 更新摄像机位置
			if (!this.camera) return;
			this.camera.transform.worldMatrix.cloneTo(this.outMatrix);
			var camm:Float32Array = this.outMatrix.elements;
			camm[12] = this.target.x + camm[8] * this.dist;
			camm[13] = this.target.y + camm[9] * this.dist;
			camm[14] = this.target.z + camm[10] * this.dist;
			this.camera.transform.worldMatrix = this.outMatrix;
		}
		
		/*override*/  onKeyDown(e:Event):void {
			var mat:Float32Array = this.camera.transform.worldMatrix.elements;
			switch (e.keyCode) {
			case Keyboard.NUMPAD_1:
				this.frontView();
				break;
			case Keyboard.NUMPAD_3:
				this.leftView();
				break;
			case Keyboard.NUMPAD_7:
				this.topView();
				break;
			case Keyboard.A: {
				this.target.x += 0.1;
			}	
				break;
			case Keyboard.S:
				break;
			case Keyboard.D: {
				this.target.x -= 0.1;
			}
				break;
			case Keyboard.W:
				break;
				
			case Keyboard.CONTROL:
				this.ctrlDown = true;
				break;				
			default:
				break;
			}
		}
		
		/*override*/  onKeyUp(e:Event):void {
			switch (e.keyCode) {
				case Keyboard.CONTROL:
					this.ctrlDown = false;
				break;
			case Keyboard.A: {
			}	
				break;
			case Keyboard.S:
				break;
			case Keyboard.D: {
			}
				break;
			case Keyboard.W:
				break;
				default:
			}
		}
		
		protected rightMouseDown(e:Event):void {
			this.lastMouseX = e.stageX;
			this.lastMouseY = e.stageY;
			this.isRightDown = true;
			this.arcball.startDrag(e.stageX, e.stageY, this.camera.transform.worldMatrix);
		}
		
		protected rightMouseUp(e:Event):void {
			this.isRightDown = false;
		}
		
		protected mouseMov(e:Event):void {
			if (this.isRightDown) {
				var dragQuat:Quaternion = this.arcball.dragTo(e.stageX, e.stageY);	// 相对值
				//DEBUG
				//arcball.startDrag(Laya.stage.width / 2, Laya.stage.height / 2);
				//dragQuat = arcball.dragTo(Laya.stage.width / 2+2, Laya.stage.height / 2);
				//DEBUG
				dragQuat.invert(this.quatArcBallResult);	// 取逆表示不转物体，转摄像机对象
				//DEBUG
				//Quaternion.createFromAxisAngle(new Vector3(1, 0, 0), 0.1, quatArcBallResult);
				//DEBUG
				var dragMat:Matrix4x4 = new Matrix4x4();
				Matrix4x4.createFromQuaternion(this.quatArcBallResult, dragMat);
				var cammate:Float32Array = this.camWorldMatrix.elements;
				var oldx:number = cammate[12];  cammate[12] = 0;
				var oldy:number = cammate[13];  cammate[13] = 0;
				var oldz:number = cammate[14];	cammate[14] = 0;
				Matrix4x4.multiply(dragMat, this.camWorldMatrix, this.camWorldMatrix);
				
				// 加上target影响
				this.camWorldMatrix.cloneTo(this.outMatrix);
				this.outMatrix.elements[12] = this.target.x + cammate[8] * this.dist;
				this.outMatrix.elements[13] = this.target.y + cammate[9] * this.dist;
				this.outMatrix.elements[14] = this.target.z + cammate[10] * this.dist;
				
				this.camera.transform.worldMatrix = this.outMatrix;
				//camera.transform.worldMatrix = arcball.getResultMatrix();
			}
		}
		
		private mouseDown(e:Event):void{
			this.isMouseDown = true;
		}
		
		private mouseUp(e:Event):void {
			this.isMouseDown = false;
			this.isRightDown = false;
			this.arcball.stopDrag();
		}
		
		protected mouseWheel(e:Event):void {
			//滚轮是改变距离的
			this.isWheel = e.delta;
			this.camera.transform.worldMatrix.cloneTo(this.outMatrix);			
			
			var wmat:Float32Array = this.outMatrix.elements;
			var px:number = wmat[12];
			var py:number = wmat[13];
			var pz:number = wmat[14];
			var dx:number = this.target.x - px;
			var dy:number = this.target.y - py;
			var dz:number = this.target.z - pz;
			var d:number = Math.sqrt(dx * dx + dy * dy + dz * dz);
			var vel:number = 0.1*d;
			if (e.delta > 0) {
				//前进
				wmat[12] -= wmat[8] * vel;
				wmat[13] -= wmat[9] * vel;
				wmat[14] -= wmat[10] * vel;
				this.dist -= vel;
			}else if (e.delta < 0) {
				//后退
				wmat[12] += wmat[8] * vel;
				wmat[13] += wmat[9] * vel;
				wmat[14] += wmat[10] * vel;
				this.dist += vel;
			}
			
			this.camera.transform.worldMatrix = this.outMatrix;
		}
		
		/**
		 * 向前移动。
		 * @param distance 移动距离。
		 */
		 moveForward(distance:number):void {
		}
		
		protected updateCamera(elapsedTime:number):void {
			this.lastMouseX = Laya.stage.mouseX;
			this.lastMouseY = Laya.stage.mouseY;
		}
	}

