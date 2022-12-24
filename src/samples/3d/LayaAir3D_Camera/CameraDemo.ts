import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { Material } from "laya/d3/core/material/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { SkyBox } from "laya/d3/resource/models/SkyBox";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Event } from "laya/events/Event";
import { Vector3 } from "laya/maths/Vector3";
import { Vector4 } from "laya/maths/Vector4";
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
export class CameraDemo {
	private index: number = 0;
	private index2: number = 0;
	private camera: Camera;
	private _translate: Vector3 = new Vector3(0, 0.7, 5);
	private _rotation: Vector3 = new Vector3(-15, 0, 0);
	private _rotation2: Vector3 = new Vector3(-3.14 / 3, 0, 0);
	private _rotation3: Vector3 = new Vector3(0, 45, 0);
	private _clearColor: Vector4 = new Vector4(0, 0.2, 0.6, 1);

	/**实例类型*/
	private btype:any = "CameraDemo";
	/**场景内按钮类型*/
	private stype:any = 0;

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//开启统计信息
		Stat.show();
		//预加载所有资源
		var resource: any[] = ["res/threeDimen/texture/layabox.png", "res/threeDimen/skyBox/skyBox2/skyBox2.lmat"];
		Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
	}

	private onPreLoadFinish(): void {
		//创建场景
		var scene: Scene3D = new Scene3D();
		Laya.stage.addChild(scene);

		//创建相机，构造函数的三个参数为相机横纵比，近距裁剪，远距裁剪
		this.camera = new Camera(0, 0.1, 100);
		this.camera.transform.translate(this._translate);
		this.camera.transform.rotate(this._rotation, true, false);
		this.camera.useOcclusionCulling = false;
		//相机设置清楚标记,使用固定颜色
		this.camera.clearFlag = CameraClearFlags.SolidColor;
		//使用默认颜色
		//camera.clearColor = _clearColor;
		//设置摄像机视野范围（角度）
		this.camera.fieldOfView = 60;
		//为相机添加视角控制组件(脚本)
		this.camera.addComponent(CameraMoveScript);
		scene.addChild(this.camera);

		//添加平行光
		var directionLight: DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()));
		//设置平行光颜色
		directionLight.color.setValue(1, 1, 1, 1);
		directionLight.transform.rotate(this._rotation2);

		var sprite: Sprite3D = new Sprite3D;
		scene.addChild(sprite);

		//正方体
		var box: MeshSprite3D = (<MeshSprite3D>sprite.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))));
		box.transform.position.setValue(0.0, 0.0, 2);
		box.transform.rotate(this._rotation3, false, false);

		//创建linnPhong材质
		var materialBill: BlinnPhongMaterial = new BlinnPhongMaterial;
		box.meshRenderer.material = materialBill;
		//为材质加载纹理
		var tex = Loader.getTexture2D("res/threeDimen/texture/layabox.png");
		//设置反照率贴图
		materialBill.albedoTexture = tex;

		this.loadUI();
	}

	private loadUI(): void {

		Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function (): void {

			var changeActionButton: Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正透切换")));
			changeActionButton.size(160, 40);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = 30;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2 - 100, Laya.stage.height - 100 * Browser.pixelRatio);

			changeActionButton.on(Event.CLICK, this, this.stypeFun0);

			var changeActionButton2: Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "切换背景")));
			changeActionButton2.size(160, 40);
			changeActionButton2.labelBold = true;
			changeActionButton2.labelSize = 30;
			changeActionButton2.sizeGrid = "4,4,4,4";
			changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton2.pos(Laya.stage.width / 2 - changeActionButton2.width * Browser.pixelRatio / 2 + 100, Laya.stage.height - 100 * Browser.pixelRatio);

			changeActionButton2.on(Event.CLICK, this, this.stypeFun1);
		}));
	}

	stypeFun0(index:number = 0) {
		this.index++;
		if (this.index % 2 === 1) {
			//正交投影属性设置
			this.camera.orthographic = true;
			//正交垂直矩阵距离,控制3D物体远近与显示大小
			this.camera.orthographicVerticalSize = 7;
		} else {
			//正交投影属性设置,关闭
			this.camera.orthographic = false;
		}
		index = this.index;
		Client.instance.send({type:"next",btype:this.btype,stype:0,value:index});
	}

	stypeFun1(index2:number = 0): void {
		this.index2++;
		if (this.index2 % 2 === 1) {
			//设置相机的清除标识为天空盒
			this.camera.clearFlag = CameraClearFlags.Sky;
			//使用加载天空盒材质
			var skyboxMaterial: Material = (<Material>Loader.getRes("res/threeDimen/skyBox/skyBox2/skyBox2.lmat"));
			//获取相机的天空渲染器
			var skyRenderer: SkyRenderer = this.camera.skyRenderer;
			//设置相机的天空渲染器的mesh
			skyRenderer.mesh = SkyBox.instance;
			//设置相机的天空渲染器的material
			skyRenderer.material = skyboxMaterial;
		} else {
			//设置相机的清除标识为为固定颜色
			this.camera.clearFlag = CameraClearFlags.SolidColor;
		}
		index2 = this.index2;
		Client.instance.send({type:"next",btype:this.btype,stype:1,value:index2});
	}

}


