import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator";
import { AnimatorState } from "laya/d3/component/AnimatorState";
import { Camera } from "laya/d3/core/Camera";
import { SpotLight } from "laya/d3/core/light/SpotLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { Quaternion } from "laya/d3/math/Quaternion";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

/**
 * ...
 * @author ...
 */
export class SpotLightDemo {

	private _quaternion: Quaternion = new Quaternion();
	private _direction: Vector3 = new Vector3();

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
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
		var spotLight: SpotLight = (<SpotLight>scene.addChild(new SpotLight()));
		//设置聚光灯颜色
		spotLight.color = new Color(1, 1, 0, 1);
		spotLight.transform.position = new Vector3(0.0, 1.2, 0.0);
		//设置聚光灯的方向
		var mat: Matrix4x4 = spotLight.transform.worldMatrix;
		mat.setForward(new Vector3(0.15, -1.0, 0.0));
		spotLight.transform.worldMatrix = mat;
		//设置聚光灯范围
		spotLight.range = 1.6;
		spotLight.intensity=8.0;
		//设置聚光灯锥形角度
		spotLight.spotAngle = 32;

		Sprite3D.load("res/threeDimen/staticModel/grid/plane.lh", Handler.create(this, function (sprite: Sprite3D): void {
			(<Sprite3D>scene.addChild(sprite));
			Sprite3D.load("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", Handler.create(this, function (layaMonkey: Sprite3D): void {
				(<Sprite3D>scene.addChild(layaMonkey));
				var aniSprite3d: Sprite3D = (<Sprite3D>layaMonkey.getChildAt(0));
				var animator: Animator = (<Animator>aniSprite3d.getComponent(Animator));

				//获取猴子精灵的动画组件
				var animator: Animator = (<Animator>aniSprite3d.getComponent(Animator));
				//创建动作状态
				var state: AnimatorState = new AnimatorState();
				//动作名称
				state.name = "happy";
				//动作播放起始时间
				state.clipStart = 115 / 150;
				//动作播放结束时间
				state.clipEnd = 150 / 150;
				//设置动作
				state.clip = animator.getDefaultState().clip;
				//为动画组件添加一个动作状态
				animator.getControllerLayer(0).addState(state);
				//播放动作
				animator.play("happy");
				//设置时钟定时执行
				Laya.timer.frameLoop(1, this, function (): void {
					//从欧拉角生成四元数（顺序为Yaw、Pitch、Roll）
					Quaternion.createFromYawPitchRoll(0.025, 0, 0, this._quaternion);
					spotLight.transform.worldMatrix.getForward(this._direction);
					//根据四元数旋转三维向量
					Vector3.transformQuat(this._direction, this._quaternion, this._direction);
					var mat: Matrix4x4 = spotLight.transform.worldMatrix;
					mat.setForward(this._direction);
					spotLight.transform.worldMatrix = mat;
				});
			}));

		}));

	}
}

