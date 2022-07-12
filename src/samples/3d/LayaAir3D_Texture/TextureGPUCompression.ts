import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { URL } from "laya/net/URL";
import { Browser } from "laya/utils/Browser";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { CameraMoveScript } from "../common/CameraMoveScript";

export class TextureGPUCompression {
	constructor() {
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;

		var path = "";
		if (Browser.onAndroid)
			path += "res/Android/";
		else if (Browser.onIOS)
			path += "res/IOS/";
		else
			path += "res/Conventional/";


		Scene3D.load(path +"scene.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
			camera.addComponent(CameraMoveScript);
		}));
	}
}



