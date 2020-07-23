import { BaseTexture } from "./BaseTexture";
import { WebGLVideo } from "../device/media/WebGLVideo";
import { LayaGL } from "../layagl/LayaGL";
import { WarpMode } from "./WrapMode";
import { FilterMode } from "./FilterMode";
import { Video } from "../device/media/Video";
import { WebGLContext } from "../webgl/WebGLContext";
import { SingletonList } from "../d3/component/SingletonList";
import { SimpleSingletonList } from "../d3/component/SimpleSingletonList";
import { Laya } from "../../Laya";


/**
 * <code>VideoTexture</code> 多媒体纹理
 */
export class VideoTexture extends BaseTexture {
	/**videoTexture对象池*/
	public static _videoTexturePool:SingletonList<VideoTexture> = new SingletonList<VideoTexture>();
	/**
	 * @internal 会在场景中更新video文件
	 */
	static _update(): void {
		var pool: SingletonList<VideoTexture> = VideoTexture._videoTexturePool;
		var elements = pool.elements;
		for (var i: number = 0, n: number = pool.length; i < n; i++) {
			var videoElement = elements[i] ;
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
		VideoTexture._videoTexturePool.add(this);
	}

	get video():any{
		return this._video;
	}
	set video(value:any){
		if(!value)
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
			this._video.setAttribute('playsinline', 'true')
			this._video.setAttribute('x5-playsinline', 'true')
			this._video.setAttribute('webkit-playsinline', 'true')
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

	
	videoPlay(){
		this._video.play();
		this._needUpdate = true;
		
	}

	videoPause(){
		this._video.pause();
		this._needUpdate = false;
	}

	destroy(){
		super.destroy();
		this._video = null;
	}
}

