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
		var st:string; 

		if (Browser.onAndroid)
			// URL.basePath = "https://star.layabox.com/Laya1.0.0/res/Android/";
			st = "res/Android/scene.ls";
		else if (Browser.onIOS)
			// URL.basePath = "https://star.layabox.com/Laya1.0.0/res/IOS/";
			st = "res/IOS/scene.ls";
		else
			// URL.basePath = "https://star.layabox.com/Laya1.0.0/res/Conventional/";
			st = "res/Conventional/scene.ls";


		Scene3D.load(st, Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));
			var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));
			camera.addComponent(CameraMoveScript);
			console.log(camera.clearColor);
		}));

	}

}


