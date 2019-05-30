import { HtmlVideo } from "./HtmlVideo"
	import { Browser } from "../../../../../../core/src/laya/utils/Browser"
	import { WebGL } from "../../../../../../core/src/laya/webgl/WebGL"
	import { WebGLContext } from "../../../../../../core/src/laya/webgl/WebGLContext"
	import { Render } from "../../../../../../core/src/laya/renders/Render"
	
	import { LayaGL } from "../../../../../../core/src/laya/layagl/LayaGL"

	/**
	 * @private
	 */
	export class WebGLVideo extends HtmlVideo
	{
		private gl:WebGLContext;
		private preTarget:any;
		private preTexture:any;
		
		private static curBindSource:any;
		
		constructor(){
			super();
			
			if(!Render.isConchApp && Browser.onIPhone)
				return;
			
			this.gl = Render.isConchApp ? LayaGLContext.instance : WebGL.mainContext;
			this._source = this.gl.createTexture();
			
			//preTarget = WebGLContext.curBindTexTarget; 
			//preTexture = WebGLContext.curBindTexValue;
			
			WebGLContext.bindTexture(this.gl, WebGLContext.TEXTURE_2D, this._source);
			
			this.gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_WRAP_S, WebGLContext.CLAMP_TO_EDGE);
			this.gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_WRAP_T, WebGLContext.CLAMP_TO_EDGE);
			this.gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_MAG_FILTER, WebGLContext.LINEAR);
			this.gl.texParameteri(WebGLContext.TEXTURE_2D, WebGLContext.TEXTURE_MIN_FILTER, WebGLContext.LINEAR);
			
			WebGLContext.bindTexture(this.gl, WebGLContext.TEXTURE_2D, null);

			//(preTarget && preTexture) && (WebGLContext.bindTexture(gl, preTarget, preTexture));
		}
		
		 updateTexture():void
		{
			if(!Render.isConchApp && Browser.onIPhone)
				return;
			
 			WebGLContext.bindTexture(this.gl, WebGLContext.TEXTURE_2D, this._source);
			
			this.gl.texImage2D(WebGLContext.TEXTURE_2D, 0, WebGLContext.RGB, WebGLContext.RGB, WebGLContext.UNSIGNED_BYTE, this.video);
			
			WebGLVideo.curBindSource = this._source;
		}
		
		 get _glTexture():any
		{
			return this._source;
		}
		
		 /*override*/ destroy():void {
			if (this._source)
			{
				this.gl = Render.isConchApp ? LayaGLContext.instance : WebGL.mainContext;
				
				if (WebGLVideo.curBindSource == this._source)
				{
					WebGLContext.bindTexture(this.gl, WebGLContext.TEXTURE_2D, null);
					WebGLVideo.curBindSource = null;
				}

				this.gl.deleteTexture(this._source);
			}

			super.destroy();
		}

	}

