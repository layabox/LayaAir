import { BaseTexture } from "./BaseTexture";
import { LayaGL } from "../layagl/LayaGL";
import { Laya } from "../../Laya";
import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { TextureDimension } from "../RenderEngine/RenderEnum/TextureDimension";
import { WarpMode } from "../RenderEngine/RenderEnum/WrapMode";
import { FilterMode } from "../RenderEngine/RenderEnum/FilterMode";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";


/**
 * <code>VideoTexture</code> 多媒体纹理
 */
export class VideoTexture extends BaseTexture {
	/**videoTexture对象池*/
	public static _videoTexturePool: Array<VideoTexture> = new Array<VideoTexture>();
	/**
	 * @internal 会在场景中更新video文件
	 */
	static _update(): void {
		var pool: Array<VideoTexture> = VideoTexture._videoTexturePool;
		for (var i: number = 0, n: number = pool.length; i < n; i++) {
			var videoElement = pool[i];
			(videoElement) && videoElement._updateVideoData();
		}
	}


	private _video: any;
	private _needUpdate: Boolean;
	/**
	 * 创建VideoTexture对象，
	 */
	constructor(video: HTMLVideoElement) {
		super(video.videoWidth, video.videoHeight, RenderTargetFormat.R8G8B8);
		this._needUpdate = false;
		this._dimension = TextureDimension.Tex2D;
		// todo  video format mipmap, srgb 设置
		this._texture = LayaGL.textureContext.createTextureInternal(this._dimension, video.videoWidth, video.videoHeight, TextureFormat.R8G8B8, false, false);

		this.setVidoe(video);

		this.wrapModeU = WarpMode.Clamp;
		this.wrapModeV = WarpMode.Clamp;
		this.filterMode = FilterMode.Bilinear;

		VideoTexture._videoTexturePool.push(this);

	}

	/**
	 * 获得绑定的资源Video
	 * return HTMLVideoElement
	 */
	get video(): any {
		return this._video;
	}
	// /**
	//  * @value
	//  * 输入Video资源
	//  */
	// set video(value: any) {
	// 	if (!value || !(value instanceof HTMLVideoElement))
	// 		return;
	// 	this._video = value;
	// 	if (Laya.Browser.onMobile) {
	// 		//miner 
	// 		this._video["x5-playsInline"] = true;
	// 		this._video["x5-playsinline"] = true;
	// 		this._video.x5PlaysInline = true;
	// 		this._video.playsInline = true;
	// 		this._video["webkit-playsInline"] = true;
	// 		this._video["webkit-playsinline"] = true;
	// 		this._video.webkitPlaysInline = true;
	// 		this._video.playsinline = true;
	// 		this._video.style.playsInline = true;
	// 		this._video.crossOrigin = "anonymous";
	// 		this._video.setAttribute('crossorigin', "anonymous");
	// 		this._video.setAttribute('playsinline', 'true');
	// 		this._video.setAttribute('x5-playsinline', 'true');
	// 		this._video.setAttribute('webkit-playsinline', 'true');
	// 		this._video.autoplay = true;
	// 	}
	// }

	setVidoe(video: HTMLVideoElement) {
		this._video = video;
		// todo 初始化
		LayaGL.textureContext.setTexturePixelsData(this._texture, null, false, false);
		if (Laya.Browser.onMobile) {
			//miner 
			this._video["x5-playsInline"] = true;
			this._video["x5-playsinline"] = true;
			this._video.x5PlaysInline = true;
			this._video.playsInline = true;
			this._video["webkit-playsInline"] = true;
			this._video["webkit-playsinline"] = true;
			this._video.webkitPlaysInline = true;
			this._video.playsinline = true;
			this._video.style.playsInline = true;
			this._video.crossOrigin = "anonymous";
			this._video.setAttribute('crossorigin', "anonymous");
			this._video.setAttribute('playsinline', 'true');
			this._video.setAttribute('x5-playsinline', 'true');
			this._video.setAttribute('webkit-playsinline', 'true');
			this._video.autoplay = true;
		}
	}

	/**
	 * @internal
	 */
	_updateVideoData() {
		if (!this._video || !this._needUpdate)
			return;
		// var gl: WebGLRenderingContext = LayaGL.instance;
		// WebGLContext.bindTexture(gl, gl.TEXTURE_2D, this._texture.resource);
		// gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this._video);

		LayaGL.textureContext.updateVideoTexture(this._texture, this.video, false, false);
	}

	/**
	 * 开始播放视频
	 */
	videoPlay() {
		this._video.play();
		this._needUpdate = true;

	}

	/**
	 * 暂停播放视频
	 */
	videoPause() {
		this._video.pause();
		this._needUpdate = false;
	}

	destroy() {
		super.destroy();
		this._video = null;
	}
}

