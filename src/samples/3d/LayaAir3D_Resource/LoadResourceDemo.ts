import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Material } from "laya/resource/Material";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Vector3 } from "laya/maths/Vector3";
import { Color } from "laya/maths/Color";
import { Quaternion } from "laya/maths/Quaternion";
import { Event } from "laya/events/Event";
import { Resource } from "laya/resource/Resource";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { Scene } from "laya/display/Scene";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

/**
 * ...
 * @author ...
 */
export class LoadResourceDemo {

	private _scene: Scene3D;
	private pangzi: Sprite3D;

	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			Shader3D.debugMode = true;
			//批量预加载方式
			this.PreloadingRes();

			Laya.stage.on(Event.CLICK, this, () => {
				Resource.destroyUnusedResources();
			})
		});
	}

	//批量预加载方式
	PreloadingRes() {
		//预加载所有资源
		var resource: any[] = [
			"res/VRscene/Conventional/SampleScene.ls",
			"res/threeDimen/scene/LayaScene_city01/Conventional/Assets/Sky.lmat",
			"res/threeDimen/texture/earth.png",
			"res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm",
			"res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh",
			"res/threeDimen/skinModel/BoneLinkScene/PangZi.lh",
			"res/threeDimen/skinModel/BoneLinkScene/Assets/Model3D/PangZi-Take 001.lani"];
		Laya.loader.load(resource, Handler.create(this, this.onPreLoadFinish));
	}

	onPreLoadFinish() {
		//初始化3D场景
		this._scene = Laya.stage.addChild((Loader.createNodes("res/VRscene/Conventional/SampleScene.ls") as Scene).scene3D);
		//添加相机
		var camera: Camera = new Camera();
		this._scene.addChild(camera);
		//设置相机清楚标记，使用天空
		camera.clearFlag = CameraClearFlags.Sky;
		//调整相机的位置
		camera.transform.translate(new Vector3(3, 20, 47));
		//相机视角控制组件(脚本)
		camera.addComponent(CameraMoveScript);

		//添加光照
		var directionLight: Sprite3D = (<Sprite3D>this._scene.addChild(new Sprite3D()));
		var directionLightCom: DirectionLightCom = directionLight.addComponent(DirectionLightCom);
		//光照颜色
		directionLightCom.color = new Color(1, 1, 1, 1);
		directionLight.transform.rotate(new Vector3(-3.14 / 3, 0, 0));

		//使用材质
		var skyboxMaterial: Material = <Material>Loader.getRes("res/threeDimen/scene/LayaScene_city01/Conventional/Assets/Sky.lmat");
		var skyRenderer: SkyRenderer = this._scene.skyRenderer;
		skyRenderer.mesh = SkyDome.instance;
		skyRenderer.material = skyboxMaterial;

		//使用纹理
		var earth1: MeshSprite3D = (<MeshSprite3D>this._scene.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(5, 32, 32))));
		earth1.transform.translate(new Vector3(17, 20, 0));

		var earthMat: BlinnPhongMaterial = new BlinnPhongMaterial();
		earthMat.albedoTexture = Loader.getTexture2D("res/threeDimen/texture/earth.png");
		earthMat.albedoIntensity = 1;
		earth1.meshRenderer.material = earthMat;

		//获取Mesh资源
		var mesh: Mesh = (<Mesh>Loader.getRes("res/threeDimen/skinModel/LayaMonkey/Assets/LayaMonkey/LayaMonkey-LayaMonkey.lm"));
		//为精灵设置Mesh资源
		var layaMonkey: MeshSprite3D = (<MeshSprite3D>this._scene.addChild(new MeshSprite3D(mesh)));
		var layaMonkeyTrans = layaMonkey.transform;
		var layaMonkeyScale: Vector3 = layaMonkeyTrans.localScale;
		var mat: BlinnPhongMaterial = new BlinnPhongMaterial();
		layaMonkey.meshRenderer.sharedMaterial = mat;
		layaMonkeyScale.setValue(4, 4, 4);
		layaMonkeyTrans.localScale = layaMonkeyScale;
		layaMonkeyTrans.rotation = new Quaternion(0.7071068, 0, 0, -0.7071067);
		layaMonkeyTrans.translate(new Vector3(5, 3, 13));

		//使用精灵
		var sp: Sprite3D = (<Sprite3D>Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh"));
		var layaMonkey2: Sprite3D = (<Sprite3D>this._scene.addChild(sp));
		var layaMonkey2Trans = layaMonkey2.transform;
		var layaMonkey2Scale: Vector3 = layaMonkey2Trans.localScale;
		layaMonkey2Scale.setValue(32, 32, 32);
		layaMonkey2Trans.localScale = layaMonkey2Scale;
		layaMonkey2Trans.translate(new Vector3(-10, 13, 0));

		//使用精灵
		this.pangzi = (<Sprite3D>Loader.createNodes("res/threeDimen/skinModel/BoneLinkScene/PangZi.lh"));
		this.pangzi = (<Sprite3D>this._scene.addChild(this.pangzi));
		var pangziTrans = this.pangzi.transform;
		var pangziScale: Vector3 = pangziTrans.localScale;
		pangziScale.setValue(4, 4, 4);
		pangziTrans.localScale = pangziScale;
		pangziTrans.translate(new Vector3(-20, 13, 0));
	}

}


