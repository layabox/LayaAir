import { BaseTexture } from "./BaseTexture";
import { LayaGL } from "../layagl/LayaGL";
import { WarpMode } from "./WrapMode";
import { FilterMode } from "./FilterMode";
import { WebGLContext } from "../webgl/WebGLContext";
import { Laya } from "../../Laya";


/**
 * <code>VideoTexture</code> 多媒体纹理
 */
export class VideoTexture extends BaseTexture {
	/**videoTexture对象池*/
	public static _videoTexturePool:Array<VideoTexture> = new Array<VideoTexture>();
	/**
	 * @internal 会在场景中更新video文件
	 */
	static _update(): void {
		var pool: Array<VideoTexture> = VideoTexture._videoTexturePool;
		for (var i: number = 0, n: number = pool.length; i < n; i++) {
			var videoElement = pool[i] ;
			(videoElement)&&videoElement._updateVideoData();
		}
	}
	
	
	private _video:any;
	private _needUpdate:Boolean;
	/**
	 * 创建VideoTexture对象，
	 */
	constructor(){
		var gl: WebGLRenderingContext = LayaGL.instance;
		super(gl.RGB,false);
		this._glTextureType = gl.TEXTURE_2D;
		this._width = 1;
		this._height = 1;
		this._wrapModeU = this._wrapModeV = WarpMode.Clamp;
		this._filterMode = FilterMode.Bilinear;
		this._setWarpMode(gl.TEXTURE_WRAP_S, this._wrapModeU);
		this._setWarpMode(gl.TEXTURE_WRAP_T, this._wrapModeV);
		this._setFilterMode(this._filterMode);
		this._needUpdate = false;
		this._readyed = true;
		VideoTexture._videoTexturePool.push(this);
	}

	/**
	 * 获得绑定的资源Video
	 * return HTMLVideoElement
	 */
	get video():any{
		return this._video;
	}
	/**
	 * @value
	 * 输入Video资源
	 */
	set video(value:any){
		if(!value||!(value instanceof HTMLVideoElement))
			return;
		this._video = value;
		if (Laya.Browser.onMobile) {
			//miner 
			this._video["x5-playsInline"]=true;
			this._video["x5-playsinline"]=true;
			this._video.x5PlaysInline=true;
			this._video.playsInline=true;
			this._video["webkit-playsInline"]=true;
			this._video["webkit-playsinline"]=true;
			this._video.webkitPlaysInline=true;
			this._video.playsinline=true;
			this._video.style.playsInline=true;
			this._video.crossOrigin="anonymous";
			this._video.setAttribute('crossorigin', "anonymous");
			this._video.setAttribute('playsinline', 'true');
			this._video.setAttribute('x5-playsinline', 'true');
			this._video.setAttribute('webkit-playsinline', 'true');
			this._video.autoplay=true;
		}
	}

	/**
	 * @internal
	 */
	_updateVideoData(){
		if(!this._video||!this._needUpdate)
			return;
		var gl: WebGLRenderingContext = LayaGL.instance;
		WebGLContext.bindTexture(gl, this._glTextureType, this._glTexture);
		gl.texImage2D(this._glTextureType,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this._video);
	}

	/**
	 * 开始播放视频
	 */
	videoPlay(){
		this._video.play();
		this._needUpdate = true;
		
	}

	/**
	 * 暂停播放视频
	 */
	videoPause(){
		this._video.pause();
		this._needUpdate = false;
	}

	destroy(){
		super.destroy();
		this._video = null;
	}
}

