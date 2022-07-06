import { Laya } from "../../Laya";
import { Event } from "../events/Event";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { SpineGLTexture } from "./SpineGLTexture";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineTempletBase } from "./SpineTempletBase";
import AssetManager = spine.AssetManager;
import AtlasAttachmentLoader = spine.AtlasAttachmentLoader;
import SkeletonJson = spine.SkeletonJson;
import SkeletonBinary = spine.SkeletonBinary;

/**
 * spine动画模板类
 * - 3.7、3.8版本的JSON导出文件均使用该类进行加载
 * @internal
 */
export class SpineTemplet_3_x extends SpineTempletBase {
    private clientId: string;
	private assetManager: AssetManager;
	public skeletonData: spine.SkeletonData;
	private skeletonJson: SkeletonJson;
	private skeletonBinary: SkeletonBinary;
	private atlasUrl: string;
	private jsonOrSkelUrl: string;
	// private _textureUrlList: any[];
	/**@internal */
	public _textureDic: any = {};

	constructor() {
		super();
	}

    loadAni(jsonOrSkelUrl: string) {
		let splitIndex = jsonOrSkelUrl.lastIndexOf("/") + 1;
		let clientId = jsonOrSkelUrl.slice(0, splitIndex);
		jsonOrSkelUrl = jsonOrSkelUrl.slice(splitIndex);
		let atlasUrl = jsonOrSkelUrl.replace(".json", ".atlas").replace(".skel", ".atlas");
		this._textureDic.root = clientId;

		this.clientId = clientId;
		this.atlasUrl = atlasUrl;
		this.jsonOrSkelUrl = jsonOrSkelUrl;

		this.assetManager = new AssetManager(this._textureLoader.bind(this), clientId);
		this.assetManager.loadTextureAtlas(atlasUrl);
		if (jsonOrSkelUrl.endsWith(".skel")) {
			// @ts-ignore
			this.assetManager.loadBinary(jsonOrSkelUrl);
		} else {
			this.assetManager.loadText(jsonOrSkelUrl);
		}
		Laya.timer.frameOnce(1, this, this.loop);
	}

	private _textureLoader(tex: Texture):SpineGLTexture {
		let src = tex.url;
		let tTextureName = src.replace(this.clientId, "");
		let tTexture = this._textureDic[tTextureName] = new SpineGLTexture(tex.bitmap);
		return tTexture;
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
