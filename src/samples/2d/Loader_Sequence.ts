import { Laya } from "Laya";
import { Texture } from "laya/resource/Texture";
import { Handler } from "laya/utils/Handler";

export class Loader_Sequence {
	private numLoaded: number = 0;
	private resAmount: number = 3;

	constructor() {
		Laya.init(500, 400).then(() => {
			// 按序列加载 monkey2.png - monkey1.png - monkey0.png
			// 不开启缓存
			// 关闭并发加载
			Laya.loader.maxLoader = 1;
			Laya.loader.load("res/apes/monkey2.png", Handler.create(this, this.onAssetLoaded), null, null, 0, false);
			Laya.loader.load("res/apes/monkey1.png", Handler.create(this, this.onAssetLoaded), null, null, 1, false);
			Laya.loader.load("res/apes/monkey0.png", Handler.create(this, this.onAssetLoaded), null, null, 2, false);
		});

	}

	private onAssetLoaded(texture: Texture): void {
		//console.log(texture.source);

		// 恢复默认并发加载个数。
		if (++this.numLoaded == 3) {
			Laya.loader.maxLoader = 5;
			console.log("All done.");
		}
	}
}

