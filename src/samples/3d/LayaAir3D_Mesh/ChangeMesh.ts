import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Loader } from "laya/net/Loader";
import { Button } from "laya/ui/Button";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import Client from "../../Client";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author ...
 */
export class ChangeMesh {
	private sphere: MeshSprite3D;
	private changeActionButton: Button;
	private index: number = 0;
	private sphereMesh: Mesh;
	private box: Mesh;
	private capsule: Mesh;
	private cylinder: Mesh;
	private cone: Mesh;

	/**实例类型*/
	private btype:any = "ChangeMesh";
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
		var resource: any[] = ["res/threeDimen/scene/ChangeMaterialDemo/Conventional/scene.ls"];
		Laya.loader.create(resource, Handler.create(this, this.onPreLoadFinish));
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
		//获取精灵的mesh
		this.sphereMesh = this.sphere.meshFilter.sharedMesh;
		//新建四个mesh
		this.box = PrimitiveMesh.createBox(0.5, 0.5, 0.5);
		this.capsule = PrimitiveMesh.createCapsule(0.25, 1, 10, 20);
		this.cylinder = PrimitiveMesh.createCylinder(0.25, 1, 20);
		this.cone = PrimitiveMesh.createCone(0.25, 0.75);
		//加载UI
		this.loadUI();

	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			this.changeActionButton = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换Mesh")));
			this.changeActionButton.size(160, 40);
			this.changeActionButton.labelBold = true;
			this.changeActionButton.labelSize = 30;
			this.changeActionButton.sizeGrid = "4,4,4,4";
			this.changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			this.changeActionButton.pos(Laya.stage.width / 2 - this.changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);

			this.changeActionButton.on(Event.CLICK, this, this.stypeFun0);
		}));
	}

	stypeFun0(index: number = 0): void {
		this.index++;
		if (this.index % 5 === 1) {
			//切换mesh
			this.sphere.meshFilter.sharedMesh = this.box;
		} else if (this.index % 5 === 2) {
			//切换mesh
			this.sphere.meshFilter.sharedMesh = this.capsule;
		} else if (this.index % 5 === 3) {
			//切换mesh
			this.sphere.meshFilter.sharedMesh = this.cylinder;
		} else if (this.index % 5 === 3) {
			//切换mesh
			this.sphere.meshFilter.sharedMesh = this.cone;
		} else {
			//切换mesh
			this.sphere.meshFilter.sharedMesh = this.sphereMesh;
		}
		index = this.index;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:index});
	}

}


