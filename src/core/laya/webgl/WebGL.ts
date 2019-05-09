import { WebGLContext } from "././WebGLContext";
import { Sprite } from "../display/Sprite"
	import { Stage } from "../display/Stage"
	import { ColorFilter } from "../filters/ColorFilter"
	import { Filter } from "../filters/Filter"
	import { CommandEncoder } from "../layagl/CommandEncoder"
	import { LayaGL } from "../layagl/LayaGL"
	import { LayaGLRunner } from "../layagl/LayaGLRunner"
	import { Matrix } from "../maths/Matrix"
	import { Point } from "../maths/Point"
	import { Rectangle } from "../maths/Rectangle"
	import { Render } from "../renders/Render"
	import { RenderSprite } from "../renders/RenderSprite"
	import { Bitmap } from "../resource/Bitmap"
	import { Context } from "../resource/Context"
	import { HTMLCanvas } from "../resource/HTMLCanvas"
	import { Texture } from "../resource/Texture"
	import { System } from "../system/System"
	import { Browser } from "../utils/Browser"
	import { ColorUtils } from "../utils/ColorUtils"
	import { RunDriver } from "../utils/RunDriver"
	import { BlendMode } from "./canvas/BlendMode"
	import { BaseTexture } from "../resource/BaseTexture"
	import { RenderTexture2D } from "../resource/RenderTexture2D"
	import { Texture2D } from "../resource/Texture2D"
	import { WebGLRTMgr } from "../resource/WebGLRTMgr"
	import { Shader2D } from "./shader/d2/Shader2D"
	import { ShaderDefines2D } from "./shader/d2/ShaderDefines2D"
	import { Value2D } from "./shader/d2/value/Value2D"
	import { Shader } from "./shader/Shader"
	import { Submit } from "./submit/Submit"
	import { SubmitCMD } from "./submit/SubmitCMD"
	import { Buffer2D } from "./utils/Buffer2D"
	import { RenderState2D } from "./utils/RenderState2D"
	
	/**
	 * @private
	 */
	export class WebGL {
		 static mainContext:WebGLContext;
		 static shaderHighPrecision:boolean;
		 static _isWebGL2:boolean = false;
		 static isNativeRender_enable:boolean = false;
		
		//TODO:coverage
		private static _uint8ArraySlice():Uint8Array {
			var _this:any = this;
			var sz:number = _this.length;
			var dec:Uint8Array = new Uint8Array(_this.length);
			for (var i:number = 0; i < sz; i++) dec[i] = _this[i];
			return dec;
		}
		
		//TODO:coverage
		private static _float32ArraySlice():Float32Array {
			var _this:any = this;
			var sz:number = _this.length;
			var dec:Float32Array = new Float32Array(_this.length);
			for (var i:number = 0; i < sz; i++) dec[i] = _this[i];
			return dec;
		}
		
		//TODO:coverage
		private static _uint16ArraySlice(... arg):Uint16Array {
			var _this:any = this;
			var sz:number;
			var dec:Uint16Array;
			var i:number;
			if (arg.length === 0) {
				sz = _this.length;
				dec = new Uint16Array(sz);
				for (i = 0; i < sz; i++)
					dec[i] = _this[i];
				
			} else if (arg.length === 2) {
				var start:number = arg[0];
				var end:number = arg[1];
				
				if (end > start) {
					sz = end - start;
					dec = new Uint16Array(sz);
					for (i = start; i < end; i++)
						dec[i - start] = _this[i];
				} else {
					dec = new Uint16Array(0);
				}
			}
			return dec;
		}
		
		 static _nativeRender_enable():void {
			if (WebGL.isNativeRender_enable)
				return;
			WebGL.isNativeRender_enable = true;

			WebGLContext.__init_native();
			Shader.prototype.uploadTexture2D = function(value:any):void {
				var CTX:any = WebGLContext;
				CTX.bindTexture(WebGL.mainContext, CTX.TEXTURE_2D, value);
			}
			RenderState2D.width = Browser.window.innerWidth;
			RenderState2D.height = Browser.window.innerHeight;
			RunDriver.measureText = function(txt:string, font:string):any {
				window["conchTextCanvas"].font = font;
				return window["conchTextCanvas"].measureText(txt);
			}
			RunDriver.enableNative = function():void {
				if (Render.supportWebGLPlusRendering) {
					((<any>LayaGLRunner )).uploadShaderUniforms = LayaGLRunner.uploadShaderUniformsForNative;
					//替换buffer的函数
					CommandEncoder = window.GLCommandEncoder;
					LayaGL = window.LayaGLContext;
				}
				var stage:any = Stage;
				stage.prototype.render = stage.prototype.renderToNative;
			}
			RunDriver.clear = function(color:string):void {
				Context.set2DRenderConfig();//渲染2D前要还原2D状态,否则可能受3D影响
				var c:any[] = ColorUtils.create(color).arrColor;
				var gl:any = LayaGL.instance;
				if (c) gl.clearColor(c[0], c[1], c[2], c[3]);
				gl.clear(WebGLContext.COLOR_BUFFER_BIT | WebGLContext.DEPTH_BUFFER_BIT | WebGLContext.STENCIL_BUFFER_BIT);
				RenderState2D.clear();
			}
			RunDriver.drawToCanvas = RunDriver.drawToTexture =  function(sprite:Sprite, _renderType:number, canvasWidth:number, canvasHeight:number, offsetX:number, offsetY:number):any {
				offsetX -= sprite.x;
				offsetY -= sprite.y;
				offsetX |= 0;
				offsetY |= 0;
				canvasWidth |= 0;
				canvasHeight |= 0;
				
				var canv:HTMLCanvas = new HTMLCanvas(false);
				var ctx:Context = canv.getContext('2d');
				canv.size(canvasWidth, canvasHeight);
				
				ctx.asBitmap = true;
				ctx._targets.start();
				RenderSprite.renders[_renderType]._fun(sprite, ctx, offsetX, offsetY);
				ctx.flush();
				ctx._targets.end();
				ctx._targets.restore();
				return canv;
			}
			RenderTexture2D.prototype._uv = RenderTexture2D.flipyuv;
			Object["defineProperty"](RenderTexture2D.prototype, "uv", {
					"get":function():any {
						return this._uv;
					},
					"set":function(v:any):void {
							this._uv = v;
					}
				}
			);
			HTMLCanvas.prototype.getTexture = function():Texture {
				if (!this._texture) {
					this._texture = this.context._targets;
					this._texture.uv = RenderTexture2D.flipyuv;
					this._texture.bitmap = this._texture;
				}
				return this._texture;
			}
		}
		
		//使用webgl渲染器
		 static enable():boolean {
			return true;
		}
		
		 static inner_enable():boolean {
			Float32Array.prototype.slice || (Float32Array.prototype.slice = WebGL._float32ArraySlice);
			Uint16Array.prototype.slice || (Uint16Array.prototype.slice = WebGL._uint16ArraySlice);
			Uint8Array.prototype.slice || (Uint8Array.prototype.slice = WebGL._uint8ArraySlice);
				
			if (Render.isConchApp){
				WebGL._nativeRender_enable();
			}
			return true;
		}
		
		 static onStageResize(width:number, height:number):void {
			if (WebGL.mainContext == null) return;
			WebGL.mainContext.viewport(0, 0, width, height);
			RenderState2D.width = width;
			RenderState2D.height = height;
		}
	}



