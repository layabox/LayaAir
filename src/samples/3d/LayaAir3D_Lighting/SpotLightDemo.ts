import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Matrix4x4 } from "laya/maths/Matrix4x4";
import { Quaternion } from "laya/maths/Quaternion";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { SpotLightCom } from "laya/d3/core/light/SpotLightCom";

/**
 * ...
 * @author ...
 */
export class SpotLightDemo {

	private _quaternion: Quaternion = new Quaternion();
	private _direction: Vector3 = new Vector3();

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
			var camera: Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))));
			camera.transform.translate(new Vector3(0, 0.7, 1.3));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);

			//聚光灯
			let spotlightSprite = new Sprite3D();
			let spotcom = spotlightSprite.addComponent(SpotLightCom);
			scene.addChild(spotlightSprite);


			//设置聚光灯颜色
			spotcom.color = new Color(1, 1, 0, 1);
			spotlightSprite.transform.position = new Vector3(0.0, 1.2, 0.0);
			//设置聚光灯的方向
			var mat: Matrix4x4 = spotlightSprite.transform.worldMatrix;
			mat.setForward(new Vector3(0.15, -1.0, 0.0));
			spotlightSprite.transform.worldMatrix = mat;
			//设置聚光灯范围
			spotcom.range = 1.6;
			spotcom.intensity = 8.0;
			//设置聚光灯锥形角度
			spotcom.spotAngle = 32;

			Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Handler.create(this, function (sprite: Sprite3D): void {
				(<Sprite3D>scene.addChild(sprite));
				Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
					(<Sprite3D>scene.addChild(layaMonkey));
					//设置时钟定时执行
					Laya.timer.frameLoop(1, this, function (): void {
						//从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
						Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
						spotlightSprite.transform.worldMatrix.getForward(this._direction);
						//根据四元数旋转三维向量
						Vector3.transformQuat(this._direction, this._quaternion, this._direction);
						var mat: Matrix4x4 = spotlightSprite.transform.worldMatrix;
						mat.setForward(this._direction);
						spotlightSprite.transform.worldMatrix = mat;
					});
				}));

			}));
		});

	}
}

