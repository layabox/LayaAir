import { Laya } from "Laya";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";

export class Loader_MultipleType {
	private ROBOT_DATA_PATH: string = "res/skeleton/robot/robot.bin";
	private ROBOT_TEXTURE_PATH: string = "res/skeleton/robot/texture.png";

	constructor() {

		Laya.init(100, 100).then(() => {
			var assets: any[] = [];
			assets.push({ "url": this.ROBOT_DATA_PATH, "type": Loader.BUFFER });
			assets.push({ "url": this.ROBOT_TEXTURE_PATH, "type": Loader.IMAGE });

			Laya.loader.load(assets, Handler.create(this, this.onAssetsLoaded));
		});

	}

	private onAssetsLoaded(e: any = null): void {
		var robotData: any = Loader.getRes(this.ROBOT_DATA_PATH);
		var robotTexture: any = Loader.getRes(this.ROBOT_TEXTURE_PATH);
		// 使用资源
	}
}

