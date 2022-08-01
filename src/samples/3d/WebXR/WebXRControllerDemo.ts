import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Event } from "laya/events/Event";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";
import { Vector2 } from "laya/d3/math/Vector2";
import { WebXRCameraInfo, WebXRExperienceHelper } from "laya/d3/WebXR/core/WebXRExperienceHelper";
import { WebXRInputManager } from "laya/d3/WebXR/core/WebXRInputManager";
import { WebXRInput } from "laya/d3/WebXR/core/WebXRInput";
import { AxiGamepad, ButtonGamepad } from "laya/d3/WebXR/core/WebXRGamepad";
import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { HitResult } from "laya/d3/physics/HitResult";
import { Color } from "laya/d3/math/Color";

export class WebXRControllerDemo {
	public camera: Camera;
	public scene: Scene3D;
	// 是否选中物体中
	public isLeftSelectTarget: boolean = false;
	public isRightSelectTarget: boolean = false;
	// 选中的物体
	public leftTarget: Sprite3D;
	public rightTarget: Sprite3D;
	// 旋转力度 0 ~ 1
	public rotateStrength: number = 0;
	// target距离
	public leftTargetDistance: number = 3;
	public rightTargetDistance: number = 3;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		this.PreloadingRes();
	}

	//批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		var resource: any[] = ["res/VRscene/Conventional/SampleScene.ls",
			"res/OculusController/controller-left.gltf",
			"res/OculusController/controller.gltf"]
		Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish() {
		let scene: Scene3D = Loader.createNodes("res/VRscene/Conventional/SampleScene.ls");
		(<Scene3D>Laya.stage.addChild(scene));
		//获取场景中的相机
		this.camera = (<Camera>scene.getChildByName("Main Camera"));
		//旋转摄像机角度
		this.camera.transform.rotate(new Vector3(0, 0, 0), true, false);
		//设置摄像机视野范围（角度）
		this.camera.fieldOfView = 60;
		//设置背景颜色
		this.camera.clearColor = new Color(0.7, 0.8, 0.9, 0);
		this.camera.nearPlane = 0.01;
		//加入摄像机移动控制脚本
		this.camera.addComponent(CameraMoveScript);
		this.loadUI();
	}

	private loadUI() {
		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, async function () {
			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正常模式"));
			this.changeActionButton.size(160, 40);
			(this.changeActionButton as Button).active = await WebXRExperienceHelper.supportXR("immersive-vr");
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun);
		}));
	}
	stypeFun() {
		this.initXR();
	}
	async initXR() {
		let caInfo: WebXRCameraInfo = new WebXRCameraInfo();
		caInfo.depthFar = this.camera.farPlane;
		caInfo.depthNear = this.camera.nearPlane;
		let webXRSessionManager = await WebXRExperienceHelper.enterXRAsync("immersive-vr", "local", caInfo);
		let webXRCameraManager = WebXRExperienceHelper.setWebXRCamera(this.camera, webXRSessionManager);
		let WebXRInput = WebXRExperienceHelper.setWebXRInput(webXRSessionManager, webXRCameraManager);
		this.bindMeshRender(WebXRInput);
	}

	bindMeshRender(webXRInput: WebXRInputManager) {
		let rightControl = Laya.loader.getRes("res/OculusController/controller.gltf") as Sprite3D;
		let leftControl = Laya.loader.getRes("res/OculusController/controller-left.gltf") as Sprite3D;
		let pixelright = new PixelLineSprite3D(20, "right");
		let pixelleft = new PixelLineSprite3D(20, "left");
		this.scene.addChild(rightControl);
		this.scene.addChild(leftControl);
		this.scene.addChild(pixelright);
		this.scene.addChild(pixelleft);

		webXRInput.bindMeshNode(leftControl, WebXRInput.HANDNESS_LEFT);
		webXRInput.bindMeshNode(rightControl, WebXRInput.HANDNESS_RIGHT);
		webXRInput.bindRayNode(pixelleft, WebXRInput.HANDNESS_LEFT);
		webXRInput.bindRayNode(pixelright, WebXRInput.HANDNESS_RIGHT);

		//获得xrInput的帧循环方案
		webXRInput.getController(WebXRInput.HANDNESS_RIGHT).on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, this, this.getRightInput);
		webXRInput.getController(WebXRInput.HANDNESS_LEFT).on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT, this, this.getLeftInput);
		/**
		 * 0	扳机
		 * 1	侧扳机
		 * 3 	摇杆按下
		 * 4	X、A键
		 * 5	Y、B键
		 */
		// 左控制器监听
		let leftXRInput = webXRInput.getController(WebXRInput.HANDNESS_LEFT);
		// 左控制器的按钮事件监听
		leftXRInput.addButtonEvent(0, ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent0);
		// 注意同一按钮的不同触发
		leftXRInput.addButtonEvent(1, ButtonGamepad.EVENT_TOUCH_STAY, this, this.LeftbuttonEvent1);
		leftXRInput.addButtonEvent(1, ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent1_1);
		leftXRInput.addButtonEvent(3, ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent3);
		leftXRInput.addButtonEvent(4, ButtonGamepad.EVENT_TOUCH_ENTER, this, this.LeftbuttonEvent4);
		leftXRInput.addButtonEvent(5, ButtonGamepad.EVENT_TOUCH_OUT, this, this.LeftbuttonEvent5);
		// 左控制器的摇杆事件监听
		leftXRInput.addAxisEvent(1, AxiGamepad.EVENT_OUTPUT, this, this.LeftAxisEvent);

		// 右控制器监听
		let rightXRInput = webXRInput.getController(WebXRInput.HANDNESS_RIGHT);
		// 右控制器的按钮事件监听
		rightXRInput.addButtonEvent(0, ButtonGamepad.EVENT_PRESS_ENTER, this, this.RightbuttonEvent0);
		rightXRInput.addButtonEvent(0, ButtonGamepad.EVENT_PRESS_VALUE, this, this.rightTriggerOn);
		// 注意同一按钮的不同触发
		rightXRInput.addButtonEvent(1, ButtonGamepad.EVENT_PRESS_STAY, this, this.RightbuttonEvent1);
		rightXRInput.addButtonEvent(1, ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent1_1);
		rightXRInput.addButtonEvent(3, ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent3);
		rightXRInput.addButtonEvent(4, ButtonGamepad.EVENT_PRESS_ENTER, this, this.RightbuttonEvent4);
		rightXRInput.addButtonEvent(5, ButtonGamepad.EVENT_PRESS_OUT, this, this.RightbuttonEvent5);
		// 右控制器的摇杆事件监听
		rightXRInput.addAxisEvent(1, AxiGamepad.EVENT_OUTPUT, this, this.RightAxisEvent);
	}
	// 右输入帧循环
	getRightInput(rightInput: WebXRInput) {
		// 方向的模
		var directionMod = Math.sqrt(Math.pow(rightInput.ray.direction.x, 2) + Math.pow(rightInput.ray.direction.y, 2) + Math.pow(rightInput.ray.direction.z, 2));
		var endPos = new Vector3(
			// 射线方向坐标计算
			rightInput.ray.origin.x + Vector3.dot(rightInput.ray.direction, new Vector3(1, 0, 0)) / directionMod * this.rightTargetDistance,
			rightInput.ray.origin.y + Vector3.dot(rightInput.ray.direction, new Vector3(0, 1, 0)) / directionMod * this.rightTargetDistance,
			rightInput.ray.origin.z + Vector3.dot(rightInput.ray.direction, new Vector3(0, 0, 1)) / directionMod * this.rightTargetDistance
		);
		// 碰撞结果
		var hitRes: HitResult = new HitResult();
		this.scene.physicsSimulation.rayCast(rightInput.ray, hitRes);
		if (hitRes.succeeded) {
			if (!this.isRightSelectTarget) {
				// 非选中状态下才能更换
				// 更换选取物体为碰撞物体
				this.rightTarget = hitRes.collider.owner as Sprite3D;
			}
		}
		// 移动物体
		if (this.isRightSelectTarget && this.rightTarget) {
			this.rightTarget.transform.position = endPos;
			this.rightTarget.transform.rotate(new Vector3(0, 15 * this.rotateStrength, 0), false, false);
		}
	}

	// 左输入帧循环
	getLeftInput(leftInput: WebXRInput) {
		// 方向的模
		var directionMod = Math.sqrt(Math.pow(leftInput.ray.direction.x, 2) + Math.pow(leftInput.ray.direction.y, 2) + Math.pow(leftInput.ray.direction.z, 2));
		var endPos = new Vector3(
			// 射线方向坐标计算
			leftInput.ray.origin.x + Vector3.dot(leftInput.ray.direction, new Vector3(1, 0, 0)) / directionMod * this.leftTargetDistance,
			leftInput.ray.origin.y + Vector3.dot(leftInput.ray.direction, new Vector3(0, 1, 0)) / directionMod * this.leftTargetDistance,
			leftInput.ray.origin.z + Vector3.dot(leftInput.ray.direction, new Vector3(0, 0, 1)) / directionMod * this.leftTargetDistance
		);
		// 碰撞结果
		var hitRes: HitResult = new HitResult();
		this.scene.physicsSimulation.rayCast(leftInput.ray, hitRes);
		if (hitRes.succeeded) {
			if (!this.isLeftSelectTarget) {
				// 非选中状态下才能更换
				// 更换选取物体为碰撞物体
				this.leftTarget = hitRes.collider.owner as Sprite3D;
			}
		}
		// 移动物体
		if (this.isLeftSelectTarget && this.leftTarget) {
			this.leftTarget.transform.position = endPos;
			this.leftTarget.transform.rotate(new Vector3(0, 15 * this.rotateStrength, 0), false, false);
		}
	}

	LeftbuttonEvent0() {
		console.log("left trigger");
		this.rotateStrength = 0.1;
	}
	LeftbuttonEvent1() {
		console.log("left side trigger");
		this.isLeftSelectTarget = true;
	}
	LeftbuttonEvent1_1() {
		this.isLeftSelectTarget = false;
	}
	LeftbuttonEvent3() {
		console.log("left stickPress");
	}
	LeftbuttonEvent4() {
		console.log("left key X");
		// 减小检测距离
		this.leftTargetDistance -= 0.5;
	}
	LeftbuttonEvent5() {
		console.log("left key Y");
		// 增加检测距离
		this.leftTargetDistance += 0.5;
	}
	leftTriggerOn(value: number) {
		// 监听事件携带按钮的触发值
		// trigger的value作为旋转强度
		this.rotateStrength = value;
	}
	LeftAxisEvent(value: Vector2) {
		console.log("left Axis MOUSE_EVENT", value);
		if (this.leftTarget) {
			this.leftTarget.transform.localRotationEulerX += value.y;
			this.leftTarget.transform.localRotationEulerY += value.x;
		}
	}

	// 右控制器监听
	RightbuttonEvent0() {
		console.log("right trigger");
	}
	RightbuttonEvent1() {
		console.log("right side trigger");
		this.isRightSelectTarget = true;
	}
	RightbuttonEvent1_1() {
		console.log("right side trigger");
		this.isRightSelectTarget = false;
	}

	RightbuttonEvent3() {
		console.log("right stickPress");
		// 抬起时才能重置为cube对象
		this.rightTarget = this.scene.getChildByName("Cube") as Sprite3D;
	}
	RightbuttonEvent4() {
		console.log("right key X");
		// 减小检测距离
		this.rightTargetDistance -= 0.5;
	}
	RightbuttonEvent5() {
		console.log("right key Y");
		// 增加检测距离
		this.rightTargetDistance += 0.5;
	}
	rightTriggerOn(value: number) {
		// 监听事件携带按钮的触发值
		// trigger的value作为旋转强度
		this.rotateStrength = value;
	}
	RightAxisEvent(value: Vector2) {
		// 右控制器摇杆 sphere旋转
		if (this.rightTarget) {
			this.rightTarget.transform.localRotationEulerX += value.y;
			this.rightTarget.transform.localRotationEulerY += value.x;
		}
	}
}