import { Event } from "../events/Event";
import { SpineSkeleton } from "./SpineSkeleton";
import { SpineGLTexture } from "./SpineGLTexture";
import { Texture2D } from "../resource/Texture2D";
import { BaseTexture } from "../resource/BaseTexture";
import { Resource } from "../resource/Resource";
import SharedAssetManager = spine.SharedAssetManager;
import TextureAtlas = spine.TextureAtlas;
import AtlasAttachmentLoader = spine.AtlasAttachmentLoader;
import SkeletonJson = spine.SkeletonJson;
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
export class SpineTemplet extends Resource {
    private clientId: string;
	private assetManager: SharedAssetManager;
	public skeletonData: spine.SkeletonData;
	private skeletonJson: SkeletonJson;
	private atlasUrl: string;
	private jsonUrl: string;
	private _textureUrlList: any[];
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

    loadAni(jsonUrl: string, textureUrlList: Array<string> = null) {
		let splitIndex = jsonUrl.lastIndexOf("/") + 1;
		let clientId = jsonUrl.slice(0, splitIndex);
		jsonUrl = jsonUrl.slice(splitIndex);
		let atlasUrl = jsonUrl.replace(".json", ".atlas");
		if (!textureUrlList) {
			textureUrlList = [jsonUrl.replace(".json", ".png")];
		}

		this._textureDic.root = clientId;
		this._textureUrlList = textureUrlList;

		this.clientId = clientId;
		this.atlasUrl = atlasUrl;
		this.jsonUrl = jsonUrl;

		this.assetManager = new SharedAssetManager(clientId);
		this.assetManager.loadJson(clientId, jsonUrl);
        this.assetManager.loadText(clientId, atlasUrl);
		for (var i = 0, len = textureUrlList.length, texture; i < len; i++) {
			texture = textureUrlList[i];
			this.assetManager.loadTexture(clientId, this.textureLoader.bind(this), texture);
		}
		
		window.requestAnimationFrame(this.loop.bind(this));
	}

	private textureLoader(tex: Texture):SpineGLTexture {
		var src = tex.url;
		var 
			tTextureName, 
			item,
			textureUrlList = this._textureUrlList;
		for(var i = 0, len = textureUrlList.length; i < len; i++) {
			item = textureUrlList[i];
			if (src.endsWith(`/${item}`)) {
				tTextureName = item;
				break;
			}
		}
		var tTexture = this._textureDic[tTextureName] = new SpineGLTexture(tex.bitmap as Texture2D);
		return tTexture;
	}

	private loop() {
		if (this.assetManager.isLoadingComplete(this.clientId)) {
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
		var _this = this;
		var atlas = new TextureAtlas(this.assetManager.get(this.clientId, this.atlasUrl), function (path) {
            return _this.assetManager.get(_this.clientId, path);
		});
        var atlasLoader = new AtlasAttachmentLoader(atlas);
        // 读取数据，从JSON中加载SkeletonData
        this.skeletonJson = new SkeletonJson(atlasLoader);
		this.skeletonData =  this.skeletonJson.readSkeletonData(this.assetManager.get(this.clientId, this.jsonUrl));
		
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
		var tAni: any = this.skeletonData.animations[index];
		if (tAni) return tAni.name;
		return null;
	}

	/**
	 * 通过皮肤名字得到皮肤索引
	 * @param	skinName 皮肤名称
	 * @return
	 */
	getSkinIndexByName(skinName: string): number {
		var skins =  this.skeletonData.skins;
		var tSkinData: spine.Skin;
		for (var i: number = 0, n: number = skins.length; i < n; i++) {
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
		var tTexture: any;
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
