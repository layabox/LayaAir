import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { SkyBoxMaterial } from "laya/d3/core/material/SkyBoxMaterial";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { SkyRenderer } from "laya/d3/resource/models/SkyRenderer";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Material } from "laya/resource/Material";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { SkyDome } from "laya/d3/resource/models/SkyDome";
import { Vector3 } from "laya/maths/Vector3";
export class Sky_SkyBox {
	public camerad: Camera;
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//创建场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//创建相机
			var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
			camera.transform.rotate(new Vector3(10, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			//设置相机的清除标识为天空盒(这个参数必须设置为CLEARFLAG_SKY，否则无法使用天空盒)
			camera.clearFlag = CameraClearFlags.Sky;
			this.camerad = camera;
			//天空盒
			Material.load("res/threeDimen/skyBox/DawnDusk/SkyBox.lmat", Handler.create(this, function (mat: SkyBoxMaterial): void {
				//获取相机的天空渲染器
				var skyRenderer: SkyRenderer = camera.scene.skyRenderer;
				//创建天空盒的mesh
				skyRenderer.mesh = SkyDome.instance;
				// 设置曝光值
				var exposureNumber: number = 1.0;
				mat.exposure = exposureNumber;
				//设置天空盒材质
				skyRenderer.material = mat;
			}));
		});
	}
}

