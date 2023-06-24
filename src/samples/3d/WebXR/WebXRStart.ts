import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { WebXRExperienceHelper, WebXRCameraInfo } from "laya/d3/WebXR/core/WebXRExperienceHelper";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";


export class WebXRStart {
	public camera: Camera;
	public scene: Scene3D;
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			this.PreloadingRes();
		});
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
		this.scene = scene;
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
	}
}