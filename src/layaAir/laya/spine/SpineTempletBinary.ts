import { Event } from "../events/Event";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineGLTexture } from "./SpineGLTexture";
import { Texture2D } from "../resource/Texture2D";
import { BaseTexture } from "../resource/BaseTexture";
import { Resource } from "../resource/Resource";
import AssetManager = spine.AssetManager;
import AtlasAttachmentLoader = spine.AtlasAttachmentLoader;
import SkeletonBinary = spine.SkeletonBinary;
import { Texture } from "../resource/Texture";
import { Laya } from "../../Laya";

/**数据解析完成后的调度。
 * @eventType Event.COMPLETE
 * */
/*[Event(name = "complete", type = "laya.events.Event.COMPLETE", desc = "数据解析完成后的调度")]*/
/**数据解析错误后的调度。
 * @eventType Event.ERROR
 * */
/*[Event(name = "error", type = "laya.events.Event.ERROR", desc = "数据解析错误后的调度")]*/
/**
 * spine动画模板类
 */
export class SpineTempletBinary extends Resource {
    private pathPrefix: string;
	private assetManager: AssetManager;
	public skeletonData: spine.SkeletonData;
	private skeletonBinary: SkeletonBinary;
	private skelUrl: string;
	private atlasUrl: string;
	private textureUrlList: any[];
	/**@internal */
	public _textureDic: any = {};
	/**@internal */
	private _isDestroyed: boolean = false;
	private _layaPremultipliedAlpha: boolean;
	public _spinePremultipliedAlpha: boolean;

	constructor(layaPremultipliedAlpha:boolean = true, spinePremultipliedAlpha:boolean = false) {
		super();
		this._layaPremultipliedAlpha = layaPremultipliedAlpha;
		this._spinePremultipliedAlpha = spinePremultipliedAlpha;
	}

    loadAni(skelUrl: string, textureUrlList: Array<string> = null) {
		let splitIndex = skelUrl.lastIndexOf("/") + 1;
		let pathPrefix = skelUrl.slice(0, splitIndex);
		skelUrl = skelUrl.slice(splitIndex);
		this.skelUrl = skelUrl;
		skelUrl = skelUrl.replace(".json", ".skel"); // 兼容.json后缀的情况
		let atlasUrl = skelUrl.replace(".skel", ".atlas");
		if (!textureUrlList) {
			textureUrlList = [skelUrl.replace(".skel", ".png")];
		}

		this._textureDic.root = pathPrefix;
		this.pathPrefix = pathPrefix;
		this.atlasUrl = atlasUrl;
		this.textureUrlList = textureUrlList;

		this.assetManager = new AssetManager(this.textureLoader.bind(this), pathPrefix);
		this.assetManager.loadBinary(this.skelUrl);
        this.assetManager.loadTextureAtlas(atlasUrl);

		Laya.timer.frameOnce(1, this, this.loop);
	}

	private textureLoader(tex: Texture):SpineGLTexture {
		let src = tex.url;
		let 
			tTextureName, 
			item,
			textureUrlList = this.textureUrlList;
		for(let i = 0, len = textureUrlList.length; i < len; i++) {
			item = textureUrlList[i];
			if (src.endsWith(item)) {
				tTextureName = item;
				break;
			}
		}
		let tTexture = this._textureDic[tTextureName] = new SpineGLTexture(tex.bitmap as Texture2D);
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
		window.requestAnimationFrame(this.loop.bind(this));
	}

	private parseSpineAni() {
		if (this._isDestroyed) {
			this.destroy();
			return;
		}
		let atlas = this.assetManager.get(this.atlasUrl);
        let atlasLoader = new AtlasAttachmentLoader(atlas);
        // 读取数据，从JSON中加载SkeletonData
        this.skeletonBinary = new SkeletonBinary(atlasLoader);
		this.skeletonData =  this.skeletonBinary.readSkeletonData(this.assetManager.get(this.skelUrl));
		
		this.event(Event.COMPLETE, this);
    }
	
	/**
	 * 创建动画
	 * @return
	 */
    buildArmature(): SpineSkeleton {
		return new SpineSkeleton(this);
	}

	/**
	 * 通过索引得动画名称
	 * @param	index
	 * @return
	 */
	getAniNameByIndex(index: number): string {
		let tAni: any = this.skeletonData.animations[index];
		if (tAni) return tAni.name;
		return null;
	}

	/**
	 * 通过皮肤名字得到皮肤索引
	 * @param	skinName 皮肤名称
	 * @return
	 */
	getSkinIndexByName(skinName: string): number {
		let skins =  this.skeletonData.skins;
		let tSkinData: spine.Skin;
		for (let i: number = 0, n: number = skins.length; i < n; i++) {
			tSkinData = skins[i];
			if (tSkinData.name == skinName) {
				return i;
			}
		}
		return -1;
	}

	/**
	 * 释放纹理
	 * @override
	 */
	destroy(): void {
		this._isDestroyed = true;
		let tTexture: any;
		for (tTexture in this._textureDic) {
			if (tTexture == "root") 
				continue;
			if (tTexture) {
				this._textureDic[tTexture].destroy();
			}
		}
		super.destroy();
	}
}
