import { HtmlVideo } from "./HtmlVideo"
import { WebGLContext } from "../../webgl/WebGLContext";
import { ILaya } from "../../../ILaya";


	/**
	 * @internal
	 */
	export class WebGLVideo extends HtmlVideo
	{
		private gl:WebGLRenderingContext;
		
		private static curBindSource:any;
		
		constructor(){
			super();
			
			if(!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
				return;
			this.gl = ILaya.Render.isConchApp ? (window as any).LayaGLContext.instance : WebGLContext.mainContext;
			this._source = this.gl.createTexture();
			
			//preTarget = WebGLContext.curBindTexTarget; 
			//preTexture = WebGLContext.curBindTexValue;
			
			WebGLContext.bindTexture(this.gl, WebGLRenderingContext.TEXTURE_2D, this._source);
			
			this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_S, WebGLRenderingContext.CLAMP_TO_EDGE);
			this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_WRAP_T, WebGLRenderingContext.CLAMP_TO_EDGE);
			this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MAG_FILTER, WebGLRenderingContext.LINEAR);
			this.gl.texParameteri(WebGLRenderingContext.TEXTURE_2D, WebGLRenderingContext.TEXTURE_MIN_FILTER, WebGLRenderingContext.LINEAR);
			
			WebGLContext.bindTexture(this.gl, WebGLRenderingContext.TEXTURE_2D, null);

			//(preTarget && preTexture) && (WebGLContext.bindTexture(gl, preTarget, preTexture));
		}
		
		 updateTexture():void
		{
			if(!ILaya.Render.isConchApp && ILaya.Browser.onIPhone)
				return;
			
 			WebGLContext.bindTexture(this.gl, WebGLRenderingContext.TEXTURE_2D, this._source);
			
			this.gl.texImage2D(WebGLRenderingContext.TEXTURE_2D, 0, WebGLRenderingContext.RGB, WebGLRenderingContext.RGB, WebGLRenderingContext.UNSIGNED_BYTE, this.video);
			
			WebGLVideo.curBindSource = this._source;
		}
		
		 get _glTexture():any
		{
			return this._source;
		}
		
		 /*override*/ destroy():void {
			if (this._source)
			{
				this.gl = ILaya.Render.isConchApp ? (window as any).LayaGLContext.instance : WebGLContext.mainContext;
				
				if (WebGLVideo.curBindSource == this._source)
				{
					WebGLContext.bindTexture(this.gl, WebGLRenderingContext.TEXTURE_2D, null);
					WebGLVideo.curBindSource = null;
				}

				this.gl.deleteTexture(this._source);
			}

			super.destroy();
		}

	}

