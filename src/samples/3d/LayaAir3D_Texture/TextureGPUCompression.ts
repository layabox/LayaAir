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
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;

			//此场景中res\CompressTexture\Assets\layabox.jpg 在3.0IDE中已经配置了Android和iOS的纹理压缩并导出，
			//在发布后时会自动生成不同平台的纹理压缩文件，用手机访问示例时会自动识别机型下载相应的压缩文件
			Scene3D.load("res/CompressTexture/scene.ls", Handler.create(this, (scene: Scene3D)=> {
				Laya.stage.addChild(scene);
			}));
		});
	}
}



