import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { ResourceVersion } from "laya/net/ResourceVersion";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";
export class ResourceVersionDemo {

	constructor() {
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		//激活资源版本控制，version.json由IDE发布功能自动生成，如果没有也不影响后续流程
		ResourceVersion.enable("res/LayaScene_dudeScene/Conventional/version.json", Handler.create(this, this.onVersionLoaded), ResourceVersion.FILENAME_VERSION);

	}
	onVersionLoaded(): void {
		Scene3D.load("res/LayaScene_dudeScene/Conventional/dudeScene.ls", Handler.create(null, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			var camera: Camera = (<Camera>scene.getChildByName("Camera"));
			camera.addComponent(CameraMoveScript);
		}));
	}

}


