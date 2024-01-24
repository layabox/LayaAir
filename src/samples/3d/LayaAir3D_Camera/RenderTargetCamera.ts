import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Loader } from "laya/net/Loader";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { RenderTexture } from "laya/resource/RenderTexture";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";

export class RenderTargetCamera {

	/**实例类型*/
	private btype: any = "RenderTargetCamera";
	/**场景内按钮类型*/
	private stype: any = 0;
	private scene: Scene3D;
	private mat: UnlitMaterial;
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();

			//预加载资源
			Laya.loader.load(["res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls"], Handler.create(this, this.onComplete));
		});
	}

	private onComplete(): void {
		//加载场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(Loader.createNodes("res/threeDimen/scene/LayaScene_city01/Conventional/city01.ls")));
		//添加相机
		var camera: Camera = <Camera>scene.getChildByName("Main Camera");
		//相机添加视角控制组件(脚本)
		camera.addComponent(CameraMoveScript);

		//正方体
		var box: MeshSprite3D = <MeshSprite3D>scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6)));
		box.transform.position = new Vector3(-28.8, 8, -65);
		box.transform.rotate(new Vector3(90, 0, 0), true, false);
		var mat: UnlitMaterial = new UnlitMaterial();
		mat.albedoColor = new Color(1.0, 1.0, 1.0, 1.0);
		mat.cull = RenderState.CULL_NONE;
		box.meshRenderer.sharedMaterial = mat;

		//增加个小猴
		Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
			scene.addChild(layaMonkey);
			layaMonkey.transform.localScale = new Vector3(6, 6, 6);
			layaMonkey.transform.rotate(new Vector3(0, 180, 0), true, false);
			layaMonkey.transform.position = new Vector3(-28.8, 5, -53);
		}));


		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {
			var changeActionButton: Button = <Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "渲染目标"));
			changeActionButton.size(160, 40);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = 30;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
		this.scene = scene;
		this.mat = mat
	}
	stypeFun0(): void {
		Client.instance.send({ type: "next", btype: this.btype, stype: 0 });
		//渲染到纹理的相机
		var renderTargetCamera: Camera = <Camera>this.scene.addChild(new Camera(0, 0.3, 1000));
		renderTargetCamera.transform.position = new Vector3(-28.8, 8, -60);
		renderTargetCamera.transform.rotate(new Vector3(0, 180, 0), true, false);
		//选择渲染目标为纹理
		renderTargetCamera.renderTarget = RenderTexture.createFromPool(512, 512, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.DEPTH_16, false, 1);
		//渲染顺序
		renderTargetCamera.renderingOrder = -1;
		//清除标记
		renderTargetCamera.clearFlag = CameraClearFlags.Sky;
		//设置网格精灵的纹理
		this.mat.albedoTexture = renderTargetCamera.renderTarget;
	}
}

