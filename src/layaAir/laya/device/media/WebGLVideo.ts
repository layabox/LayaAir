import { HtmlVideo } from "./HtmlVideo";
import { VideoTexture } from "../../resource/VideoTexture";


/**
 * @internal
 */
export class WebGLVideo extends HtmlVideo {
	private gl: WebGLRenderingContext;
	private source:VideoTexture;
	constructor() {
		super();
		this.source = new VideoTexture(this.video);
		VideoTexture._videoTexturePool.pop();
		// var gl: WebGLRenderingContext = RenderStateContext.mainContext;
		// // if (!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
		// // 	return;
		// this.gl = ILaya.Render.isConchApp ? (window as any).LayaGLContext.instance : RenderStateContext.mainContext;
		// this._source = this.gl.createTexture();

		// //preTarget = WebGLContext.curBindTexTarget; 
		// //preTexture = WebGLContext.curBindTexValue;
		// this._render2DContext = LayaGL.render2DContext;
		// this._render2DContext.bindTexture(gl.TEXTURE_2D, this._source);

		// this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		// this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		// this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		// this.gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);

		// this._render2DContext.bindTexture(gl.TEXTURE_2D, null);

		//(preTarget && preTexture) && (WebGLContext.bindTexture(gl, preTarget, preTexture));
	}

	updateTexture(): void {
		this.source._updateVideoData();
		//LayaGL.textureContext.updateVideoTexture()
		// if (!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
		// 	return;
		// var gl: WebGLRenderingContext = RenderStateContext.mainContext;
		// this._render2DContext.bindTexture(gl.TEXTURE_2D, this._source);

		// //yung: 加个预乘，bug：在ios10下，播放视频会导致整个游戏渲染卡在不动，后续无法操作
		// this.gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
		// this.gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.video);
		// this.gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	}

	get _glTexture(): any {
		return this._source;
	}

	setSource(url: string, extension: number): void {
		
	}

	/**
	 * @override
	 */
	destroy(): void {
		if (this._source) {
			this.source.destroy();
		}

		super.destroy();
	}

}

