import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { PBRStandardMaterial } from "laya/d3/core/material/PBRStandardMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Texture2D } from "laya/resource/Texture2D";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Utils } from "laya/utils/Utils";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author ...
 */
export class MaterialDemo {
	private sphere: MeshSprite3D;
	private pbrStandardMaterial: PBRStandardMaterial;
	private pbrTexture: Texture2D;
	private billinMaterial: BlinnPhongMaterial;
	private changeActionButton: Button;
	private index: number = 0;

	/**实例类型*/
	private btype:any = "MaterialDemo";
	/**场景内按钮类型*/
	private stype:any = 0;

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
		//为相机添加视角控制组件(脚本)
		camera.addComponent(CameraMoveScript);
		//获取球型精灵
		this.sphere = (<MeshSprite3D>scene.getChildByName("Sphere"));
		//获取球型精灵自带的BlinnPhong材质
		this.billinMaterial = (<BlinnPhongMaterial>this.sphere.meshRenderer.material);
		//创建一个新的PBRStandard材质
		this.pbrStandardMaterial = new PBRStandardMaterial();
		//获取新的纹理
		this.pbrTexture = Loader.getTexture2D("res/threeDimen/texture/earth.png");
		//为PBRStandard材质设置漫反射贴图
		this.pbrStandardMaterial.albedoTexture = this.pbrTexture;
		//加载UI
		this.loadUI();
	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换材质")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);

			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(index:number = 0): void {
		this.index++;
		if (this.index % 2 === 1) {
			//切换至PBRStandard材质
			this.sphere.meshRenderer.material = this.pbrStandardMaterial;
		} else {
			//切换至BlinnPhong材质
			this.sphere.meshRenderer.material = this.billinMaterial;
		}
		index = this.index;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:index});		
	}
}


