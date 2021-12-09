import { Laya, loader } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { LayaGL } from "laya/layagl/LayaGL";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

import { Event } from "laya/events/Event";

import { Sprite3D } from "laya/d3/core/Sprite3D";

import { glTFLoader } from "laya/gltf/glTFLoader";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D";

import { Vector2 } from "laya/d3/math/Vector2";
import { WebXRCameraInfo, WebXRExperienceHelper } from "laya/d3/WebXR/core/WebXRExperienceHelper";
import { WebXRInputManager } from "laya/d3/WebXR/core/WebXRInputManager";
import { WebXRInput } from "laya/d3/WebXR/core/WebXRInput";
import { AxiGamepad, ButtonGamepad } from "laya/d3/WebXR/core/WebXRGamepad";

export class testInitXR{
    public camera:Camera;
	public scene:Scene3D;
    constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		// 初始化 glTFLoader
        glTFLoader.init();
		this.PreloadingRes();
	}

	//批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		var resource: any[] = ["res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls",
			"res/OculusController/left.gltf",
			"res/OculusController/right.gltf"]
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish() {

		let scene = loader.getRes("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls");
		(<Scene3D>Laya.stage.addChild(scene));
		this.scene = scene;
		//获取场景中的相机
		this.camera = (<Camera>scene.getChildByName("Camera"));
		//移动摄像机位置
		this.camera.transform.position = new Vector3(0, 0,0);
		//旋转摄像机角度
		this.camera.transform.rotate(new Vector3(0, 0, 0), true, false);
		//设置摄像机视野范围（角度）
		this.camera.fieldOfView = 60;
		//设置背景颜色
		this.camera.clearColor = new Vector4(0, 0, 0.6, 1);
		this.camera.nearPlane = 0.01;
		//加入摄像机移动控制脚本
		this.camera.addComponent(CameraMoveScript);
		this.loadUI();
	}

	private loadUI(){

		 Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this,async function () {

			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正常模式"));
			this.changeActionButton.size(160, 40);
			(this.changeActionButton as Button).active = await WebXRExperienceHelper.supportXR("immersive-vr");
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun);
			Promise.resolve(true);
		}));
	}
	stypeFun(){
		this.initXR();
	}
    async initXR(){
		let caInfo:WebXRCameraInfo = new WebXRCameraInfo();
		caInfo.depthFar =this.camera.farPlane;
		caInfo.depthNear =this.camera.nearPlane;
        let webXRSessionManager = await WebXRExperienceHelper.enterXRAsync("immersive-vr","local",caInfo);
		let webXRCameraManager = WebXRExperienceHelper.setWebXRCamera(this.camera,webXRSessionManager);
		let WebXRInput = WebXRExperienceHelper.setWebXRInput(webXRSessionManager,webXRCameraManager);
		this.bindMeshRender(WebXRInput);
		
    }

	bindMeshRender(webXRInput:WebXRInputManager){
		let rightControl =new MeshSprite3D(PrimitiveMesh.createBox(0.05,0.05,0.05)) ;
		//let leftControl = loader.getRes("res/OculusController/right.gltf") as Sprite3D;
		let leftControl =new MeshSprite3D(PrimitiveMesh.createBox(0.05,0.05,0.05));
		let pixelright = new PixelLineSprite3D(20,"right");
		let pixelleft = new PixelLineSprite3D(20,"left");
		this.scene.addChild(rightControl);
		this.scene.addChild(leftControl);
		this.scene.addChild(pixelright);
		this.scene.addChild(pixelleft);

		webXRInput.bindMeshNode(leftControl,WebXRInput.HANDNESS_LEFT);
		webXRInput.bindMeshNode(rightControl,WebXRInput.HANDNESS_RIGHT);
		webXRInput.bindRayNode(pixelleft,WebXRInput.HANDNESS_LEFT);
		webXRInput.bindRayNode(pixelright,WebXRInput.HANDNESS_RIGHT);

		//获得xrInput的帧循环方案
		webXRInput.getController(WebXRInput.HANDNESS_RIGHT).on(WebXRInput.EVENT_FRAMEUPDATA_WEBXRINPUT,this,this.getRightInput);

		let xrInput = webXRInput.getController(WebXRInput.HANDNESS_LEFT);

		xrInput.addButtonEvent(0,ButtonGamepad.EVENT_PRESS_ENTER,this,this.buttonEvent );
		xrInput.addAxisEvent(1,AxiGamepad.EVENT_OUTPUT,this,this.axisEvent );
	}

	
	getRightInput(rightInput:WebXRInput){
		//test good
		//console.log(rightInput.position.x);

	}

	buttonEvent(){
		console.log("pressButton");
	}

	axisEvent(value:Vector2){
		//console.log(value.x);
	}
}