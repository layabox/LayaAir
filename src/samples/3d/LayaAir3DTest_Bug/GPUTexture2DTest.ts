import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Texture } from "laya/resource/Texture";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "Config3D";

export class GPUTexture2DTest {
	constructor() {
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;

			Laya.loader.load("Test/LayaScene_layaScene/Android/Assets/rr.ktx", Handler.create(null, function (tex: Texture): void {
				var sprite: Sprite = <Sprite>Laya.stage.addChild(new Sprite());
				sprite.texture = tex;
			}))
		});
	}
}

