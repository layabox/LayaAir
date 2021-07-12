import { Laya } from "../../Laya";
import { Event } from "../events/Event";
import { SpineAssetManager } from "./SpineAssetManager";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTempletBase } from "./SpineTempletBase";
import AtlasAttachmentLoader = spine.AtlasAttachmentLoader;
import SkeletonJson = spine.SkeletonJson;
import SkeletonBinary = spine.SkeletonBinary;

/**
 * spine动画模板类
 * - 4.0版本的JSON导出文件使用该类进行加载
 * @internal
 */
export class SpineTemplet_4_0 extends SpineTempletBase {
    private pathPrefix: string;
	private assetManager: SpineAssetManager;
	public skeletonData: spine.SkeletonData;
	private skeletonJson: SkeletonJson;
	private skeletonBinary: SkeletonBinary;
	private atlasUrl: string;
	private jsonOrSkelUrl: string;
	/**@internal */
	public _textureDic: any = {};

    constructor() {
        super();
    }

    loadAni(jsonOrSkelUrl: string) {
		let splitIndex = jsonOrSkelUrl.lastIndexOf("/") + 1;
		let pathPrefix = jsonOrSkelUrl.slice(0, splitIndex);
		jsonOrSkelUrl = jsonOrSkelUrl.slice(splitIndex);
		let atlasUrl = jsonOrSkelUrl.replace(".json", ".atlas").replace(".skel", ".atlas");
		this._textureDic.root = pathPrefix;

		this.pathPrefix = pathPrefix;
		this.atlasUrl = atlasUrl;
		this.jsonOrSkelUrl = jsonOrSkelUrl;

		this.assetManager = new SpineAssetManager(pathPrefix, new spine.Downloader(), this._textureDic);
        this.assetManager.loadTextureAtlas(atlasUrl);
		if (jsonOrSkelUrl.endsWith(".skel")) {
			// @ts-ignore
			this.assetManager.loadBinary(jsonOrSkelUrl);
		} else {
			// @ts-ignore
			this.assetManager.loadJson(jsonOrSkelUrl);
		}
		Laya.timer.frameOnce(1, this, this.loop);
	}

	private loop() {
		if (this.assetManager.isLoadingComplete()) {
			this.parseSpineAni();
			return;
		}
		if (this.assetManager.hasErrors()) {
			this.event(Event.ERROR, "load failed:" + this.assetManager.getErrors());
			return;
		}
		Laya.timer.frameOnce(1, this, this.loop);
	}

	private parseSpineAni() {
		if (this.isDestroyed) {
			this.destroy();
			return;
		}
		let atlas = this.assetManager.get(this.atlasUrl);
        let atlasLoader = new AtlasAttachmentLoader(atlas);
		if (this.jsonOrSkelUrl.endsWith(".skel")) {
			this.skeletonBinary = new SkeletonBinary(atlasLoader);
			this.skeletonData =  this.skeletonBinary.readSkeletonData(this.assetManager.get(this.jsonOrSkelUrl));
		} else {
			this.skeletonJson = new SkeletonJson(atlasLoader);
			this.skeletonData =  this.skeletonJson.readSkeletonData(this.assetManager.get(this.jsonOrSkelUrl));
		}
		this.event(Event.COMPLETE, this);
    }

    /**
	 * 创建动画
	 * @return
	 */
	buildArmature(): SpineSkeleton {
		return super.buildArmature();
	}

	/**
	 * 通过索引得动画名称
	 * @param	index
	 * @return
	 */
	getAniNameByIndex(index: number): string {
		return super.getAniNameByIndex(index);
	}

	/**
	 * 通过皮肤名字得到皮肤索引
	 * @param	skinName 皮肤名称
	 * @return
	 */
	getSkinIndexByName(skinName: string): number {
		return super.getSkinIndexByName(skinName);
	}

	/**
	 * 释放纹理
	 * @override
	 */
	destroy(): void {
		super.destroy();
	}
}