import { Laya } from "Laya";
import { Camera, CameraClearFlags } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { DirectionLightCom } from "laya/d3/core/light/DirectionLightCom";

export class TrailRender {
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			//加载场景
			var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

			//加载相机
			var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
			camera.transform.translate(new Vector3(0, 8, 10));
			camera.transform.rotate(new Vector3(-45, 0, 0), true, false);
			//设置相机清除标识为固定颜色
			camera.clearFlag = CameraClearFlags.Sky;
			camera.addComponent(CameraMoveScript);
			//创建平行光

			let directlightSprite = new Sprite3D();
			let dircom = directlightSprite.addComponent(DirectionLightCom);
			scene.addChild(directlightSprite);
			//设置平行光颜色
			dircom.color = new Color(1, 1, 1, 1);
			directlightSprite.transform.rotate(new Vector3(-Math.PI / 3, 0, 0));

			Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Handler.create(this, function (plane: Sprite3D): void {
				scene.addChild(plane);
			}));

			Sprite3D.load("res/threeDimen/trail/Cube.lh", Handler.create(this, function (sprite: Sprite3D): void {
				scene.addChild(sprite);
			}));
		});
	}

}

