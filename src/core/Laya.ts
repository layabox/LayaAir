import { Input } from "./laya/display/Input"
	import { Sprite } from "./laya/display/Sprite"
	import { Stage } from "./laya/display/Stage"
	import { KeyBoardManager } from "./laya/events/KeyBoardManager"
	import { MouseManager } from "./laya/events/MouseManager"
	import { SoundManager } from "./laya/media/SoundManager"
	import { LoaderManager } from "./laya/net/LoaderManager"
	import { URL } from "./laya/net/URL"
	import { Render } from "./laya/renders/Render"
	import { RenderSprite } from "./laya/renders/RenderSprite"
	import { Texture2D } from "./laya/resource/Texture2D"
	import { Browser } from "./laya/utils/Browser"
	import { CacheManger } from "./laya/utils/CacheManger"
	import { RunDriver } from "./laya/utils/RunDriver"
	import { Timer } from "./laya/utils/Timer"
	import { WebGL } from "./laya/webgl/WebGL"
import { Node } from "./laya/display/Node";
import { Text } from "./laya/display/Text";
import { Event } from "./laya/events/Event";
import { WeakObject } from "./laya/utils/WeakObject";
import { Texture } from "./laya/resource/Texture";
import { HTMLCanvas } from "./laya/resource/HTMLCanvas";
import { RenderTexture2D } from "./laya/resource/RenderTexture2D";
import { LayaGLRunner } from "./laya/layagl/LayaGLRunner";
import { WebGLContext } from "./laya/webgl/WebGLContext";
import { Shader } from "./laya/webgl/shader/Shader";
import { RenderState2D } from "./laya/webgl/utils/RenderState2D";
import { Context } from "./laya/resource/Context";
import { ColorUtils } from "./laya/utils/ColorUtils";
import { LayaGL } from "./laya/layagl/LayaGL";
import { Utils } from "./laya/utils/Utils";
	
	/**
	 * <code>Laya</code> 是全局对象的引用入口集。
	 * Laya类引用了一些常用的全局对象，比如Laya.stage：舞台，Laya.timer：时间管理器，Laya.loader：加载管理器，使用时注意大小写。
	 */
	export class Laya {
		/*[COMPILER OPTIONS:normal]*/
		/** 舞台对象的引用。*/
		 static stage:Stage = null;
		/**@private 系统时钟管理器，引擎内部使用*/
		 static systemTimer:Timer = null;
		/**@private 组件的start时钟管理器*/
		 static startTimer:Timer = null;
		/**@private 组件的物理时钟管理器*/
		 static physicsTimer:Timer = null;
		/**@private 组件的update时钟管理器*/
		 static updateTimer:Timer = null;
		/**@private 组件的lateUpdate时钟管理器*/
		 static lateTimer:Timer = null;
		/**游戏主时针，同时也是管理场景，动画，缓动等效果时钟，通过控制本时针缩放，达到快进慢播效果*/
		 static timer:Timer = null;
		/** 加载管理器的引用。*/
		 static loader:LoaderManager = null;
		/** 当前引擎版本。*/
		 static version:string = "2.1.0beta";
		/**@private Render 类的引用。*/
		 static render:Render;
		/**@private */
		 static _currentStage:Sprite;
		/**@private */
		private static _isinit:boolean = false;
		/**是否是微信小游戏子域，默认为false**/
		 static isWXOpenDataContext:boolean = false;
		/**微信小游戏是否需要在主域中自动将加载的文本数据自动传递到子域，默认 false**/
		 static isWXPosMsg:boolean = false;
		
		/**
		 * 初始化引擎。使用引擎需要先初始化引擎，否则可能会报错。
		 * @param	width 初始化的游戏窗口宽度，又称设计宽度。
		 * @param	height	初始化的游戏窗口高度，又称设计高度。
		 * @param	plugins 插件列表，比如 WebGL（使用WebGL方式渲染）。
		 * @return	返回原生canvas引用，方便对canvas属性进行修改
		 */
		 static init(width:number, height:number, ... plugins):any {
			if (Laya._isinit) return;
			Laya._isinit = true;
			ArrayBuffer.prototype.slice || (ArrayBuffer.prototype.slice = Laya._arrayBufferSlice);
			
			//初始化引擎库
			var libs:any[] =(window as any)._layalibs;
			if (libs) {
				libs.sort(function(a:any, b:any):number {
					return a.i - b.i;
				});
				for (var j:number = 0; j < libs.length; j++) {
					libs[j].f(window, window.document, Laya);
				}
			}
			
			Browser.gLaya = Laya;
			Browser.__init__();
			
			Laya.systemTimer = new Timer(false);
			Laya.startTimer = new Timer(false);
			Laya.physicsTimer = new Timer(false);
			Laya.updateTimer = new Timer(false);
			Laya.lateTimer = new Timer(false);
			Laya.timer = new Timer(false);
			
			Laya.loader = new LoaderManager();
			Texture2D.gLoader =  Laya.loader;
			Context.gSysTimer = Laya.systemTimer;
			Input.gSysTimer = Laya.systemTimer;
			
			WeakObject.__init__();
			WebGL.inner_enable();
			for (var i:number = 0, n:number = plugins.length; i < n; i++) {
				if (plugins[i] && plugins[i].enable) {
					plugins[i].enable();
				}
			}
			if (Render.isConchApp) {
				Laya.enableNative();
			}
			
			CacheManger.beginCheck();
			Laya._currentStage = Laya.stage = new Stage();
			Browser.gStage = Laya.stage;
			Utils.gStage = Laya.stage;
			Input.gStage = Laya.stage;
			URL.rootPath = URL._basePath = URL._getUrlPath();
			Laya.render = new Render(0, 0, Browser.mainCanvas);
			Laya.stage.size(width, height);
			((<any>window )).stage = Laya.stage;
			
			// 给其他对象赋全局值
			Node.gTimer = Laya.timer;
			Node.gStage = Laya.stage;
			Text.gSysTimer = Laya.systemTimer;
			Event.gStage = Laya.stage;
			Texture.gLoader = Laya.loader;
			
			RenderSprite.__init__();
			KeyBoardManager.__init__();
			MouseManager.instance.__init__(Laya.stage, Render.canvas);
			Input.__init__();
			SoundManager.autoStopMusic = true;
			return Render.canvas;
		}
		
		/**@private */
		private static _arrayBufferSlice(start:number, end:number):ArrayBuffer {
			var arr:any = this;
			var arrU8List:Uint8Array = new Uint8Array(arr, start, end - start);
			var newU8List:Uint8Array = new Uint8Array(arrU8List.length);
			newU8List.set(arrU8List);
			return newU8List.buffer;
		}
		
		/**
		 * 表示是否捕获全局错误并弹出提示。默认为false。
		 * 适用于移动设备等不方便调试的时候，设置为true后，如有未知错误，可以弹窗抛出详细错误堆栈。
		 */
		 static set alertGlobalError(value:boolean) {
			var erralert:number = 0;
			if (value) {
				Browser.window.onerror = function(msg:string, url:string, line:string, column:string, detail:any):void {
					if (erralert++ < 5 && detail)
						this.alert("出错啦，请把此信息截图给研发商\n" + msg + "\n" + detail.stack);
				}
			} else {
				Browser.window.onerror = null;
			}
		}
		
		private static _evcode:string = "eva" + "l";
		
		/**@private */
		 static _runScript(script:string):any {
			return Browser.window[Laya._evcode](script);
		}
		
		/**
		 * 开启DebugPanel
		 * @param	debugJsPath laya.debugtool.js文件路径
		 */
		 static enableDebugPanel(debugJsPath:string = "libs/laya.debugtool.js"):void {
			if (!Laya["DebugPanel"]) {
				var script:any = Browser.createElement("script");
				script.onload = function():void {
					Laya["DebugPanel"].enable();
				}
				script.src = debugJsPath;
				Browser.document.body.appendChild(script);
			} else {
				Laya["DebugPanel"].enable();
			}
		}
		
		private static isNativeRender_enable:boolean = false;
		/**@private */
		private static enableNative():void {
			if (Laya.isNativeRender_enable)
				return;
			Laya.isNativeRender_enable = true;

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
			
			Stage.clear = function(color:string):void {
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
			//RenderTexture2D.prototype._uv = RenderTexture2D.flipyuv;
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
			
			if (Render.supportWebGLPlusRendering) {
				((<any>LayaGLRunner )).uploadShaderUniforms = LayaGLRunner.uploadShaderUniformsForNative;
                //替换buffer的函数
				(window as any).CommandEncoder = (window as any).GLCommandEncoder ;
				(window as any).LayaGL = (window as any).LayaGLContext;
			}
			
		}		
	}




