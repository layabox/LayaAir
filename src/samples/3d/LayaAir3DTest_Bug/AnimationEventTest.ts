import { Laya } from "Laya";
import { Script } from "laya/components/Script";
import { Animator } from "laya/d3/component/Animator";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Color } from "laya/d3/math/Color";
import { Vector3 } from "laya/d3/math/Vector3";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class AnimationEventTest {
	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();

		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		scene.ambientColor = new Color(1, 1, 1);

		var camera: Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)));
		camera.transform.translate(new Vector3(0, 0.5, 3));
		camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		camera.addComponent(CameraMoveScript);

		Sprite3D.load("Test/res3d/Conventional/Character.lh", Handler.create(null, function (sprite: Sprite3D): void {
			scene.addChild(sprite);
			var sp: Sprite3D = <Sprite3D>sprite.getChildAt(0).getChildAt(1).getChildAt(0);
			var ani: Animator = sp.getComponent(Animator);
			sp.addComponent(SceneScript);
			ani.play("idle01_01_ani");
		}));
	}
}




class SceneScript extends Script {
	constructor() {
		super();


	}

	//对应unity添加的AnimationEvent的动画事件函数，名字是可以对应上的
	switch_ani(): void {
		console.log("TTTTTTT");
	}
}
