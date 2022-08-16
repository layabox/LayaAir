import { Laya } from "Laya";
import { Script } from "laya/components/Script";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Stage } from "laya/display/Stage";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";

/**
 * ...
 * @author ...
 */
export class AnimationEventByUnity {

	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		//加载场景
		Scene3D.load("res/threeDimen/scene/LayaScene_AnimationEvent/Conventional/layaScene.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			var cube: Sprite3D = scene.getChildByName("Cube") as Sprite3D;
			//添加组件(脚本)
			cube.addComponent(SceneScript);
		}));
	}

}




class SceneScript extends Script {
	constructor() {
		super();


	}

	//对应unity添加的AnimationEvent的动画事件函数，名字是可以对应上的
	ShowMsg(): void {
		console.log("TTTTTTT");
	}
}

