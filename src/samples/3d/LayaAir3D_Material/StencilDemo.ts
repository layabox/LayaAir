import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Material } from "laya/d3/core/material/Material";
import { RenderState } from "laya/d3/core/material/RenderState";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Event } from "laya/events/Event";
import { Button } from "laya/ui/Button";
import Client from "../../Client";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Color } from "laya/d3/math/Color";
/**
 * 模板测试示例
 * @author miner
 */
export class StencilDemo {
	stencilMat: Material;
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//显示性能面板
		Stat.show();
		//预加载所有资源
		var resource: any[] = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls", "res/threeDimen/texture/earth.png"];
		Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));

	}

	onPreLoadFinish() {
		//初始化3D场景
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(Loader.createNodes("res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls")));
		//获取相机
		var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
		camera.depthTextureFormat = RenderTargetFormat.DEPTHSTENCIL_24_8;
		//为相机添加视角控制组件(脚本)
		camera.addComponent(CameraMoveScript);
		//获取球型精灵
		let sphere = (<MeshSprite3D>scene.getChildByName("Sphere"));
		let sphereClone: MeshSprite3D = sphere.clone() as MeshSprite3D;
		scene.addChild(sphereClone)
		let matW = sphere.getComponent(MeshRenderer).sharedMaterial;
		//打开材质模板写入
		matW.stencilRef = 2;
		matW.stencilWrite = true;
		matW.stencilTest = RenderState.STENCILTEST_ALWAYS;
		matW.renderQueue = Material.RENDERQUEUE_OPAQUE;



		let tempVector3 = new Vector3();
		Vector3.scale(sphereClone.transform.localScale, 1.5, tempVector3);
		sphereClone.transform.localScale = tempVector3;

		let mat: UnlitMaterial = new UnlitMaterial();
		mat.albedoColor = new Color(0.8, 0.5, 0.1);
		sphereClone.getComponent(MeshRenderer).sharedMaterial = mat;
		mat.stencilRef = 0;
		mat.stencilWrite = false;
		mat.stencilTest = RenderState.STENCILTEST_GEQUAL;
		mat.renderQueue = Material.RENDERQUEUE_OPAQUE + 1;
		this.stencilMat = mat;
		this.loadUI();
	}

	private curStateIndex: number = 0;
	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "Stencil开启"));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}


	private changeActionButton: Button;
	isMaster: any;
	/**实例类型*/
	private btype: any = "StencilDemo";
	stypeFun0(label: string = "Stencil开启"): void {
		if (++this.curStateIndex % 2 == 1) {
			this.changeActionButton.label = "Stencil开启";
			this.stencilMat.stencilTest = RenderState.STENCILTEST_OFF;
		} else {

			this.changeActionButton.label = "Stencil关闭";
			this.stencilMat.stencilTest = RenderState.STENCILTEST_GEQUAL;
		}
		label = this.changeActionButton.label;

		Client.instance.send({ type: "next", btype: this.btype, stype: 0, value: label });
	}
}

