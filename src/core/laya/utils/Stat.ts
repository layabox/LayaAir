import { Browser } from "././Browser";
import { Laya } from "./../../Laya";
import { Sprite } from "../display/Sprite"
	import { Text } from "../display/Text"
	import { Render } from "../renders/Render"
	import { Context } from "../resource/Context"
	import { HTMLCanvas } from "../resource/HTMLCanvas"
	import { Resource } from "../resource/Resource"
	
	/**
	 * <p> <code>Stat</code> 是一个性能统计面板，可以实时更新相关的性能参数。</p>
	 * <p>参与统计的性能参数如下（所有参数都是每大约1秒进行更新）：<br/>
	 * FPS(Canvas)/FPS(WebGL)：Canvas 模式或者 WebGL 模式下的帧频，也就是每秒显示的帧数，值越高、越稳定，感觉越流畅；<br/>
	 * Sprite：统计所有渲染节点（包括容器）数量，它的大小会影响引擎进行节点遍历、数据组织和渲染的效率。其值越小，游戏运行效率越高；<br/>
	 * DrawCall：此值是决定性能的重要指标，其值越小，游戏运行效率越高。Canvas模式下表示每大约1秒的图像绘制次数；WebGL模式下表示每大约1秒的渲染提交批次，每次准备数据并通知GPU渲染绘制的过程称为1次DrawCall，在每次DrawCall中除了在通知GPU的渲染上比较耗时之外，切换材质与shader也是非常耗时的操作；<br/>
	 * CurMem：Canvas模式下，表示内存占用大小，值越小越好，过高会导致游戏闪退；WebGL模式下，表示内存与显存的占用，值越小越好；<br/>
	 * Shader：是 WebGL 模式独有的性能指标，表示每大约1秒 Shader 提交次数，值越小越好；<br/>
	 * Canvas：由三个数值组成，只有设置 CacheAs 后才会有值，默认为0/0/0。从左到右数值的意义分别为：每帧重绘的画布数量 / 缓存类型为"normal"类型的画布数量 / 缓存类型为"bitmap"类型的画布数量。</p>
	 */
	export class Stat {
		/** 每秒帧数。*/
		 static FPS:number = 0;
		/**主舞台 <code>Stage</code> 渲染次数计数。 */
		 static loopCount:number = 0;
		/** 着色器请求次数。*/
		 static shaderCall:number = 0;
		/** 渲染批次。*/
		 static renderBatches:number = 0;
		/** 节省的渲染批次。*/
		 static savedRenderBatches:number = 0;
		/** 三角形面数。*/
		 static trianglesFaces:number = 0;
		/** 精灵<code>Sprite</code> 的数量。*/
		 static spriteCount:number = 0;
		/** 精灵渲染使用缓存<code>Sprite</code> 的数量。*/
		 static spriteRenderUseCacheCount:number = 0;
		/** 视锥剔除次数。*/
		 static frustumCulling:number = 0;
		/**	八叉树节点剔除次数。*/
		 static octreeNodeCulling:number = 0;
		
		/** 画布 canvas 使用标准渲染的次数。*/
		 static canvasNormal:number = 0;
		/** 画布 canvas 使用位图渲染的次数。*/
		 static canvasBitmap:number = 0;
		/** 画布 canvas 缓冲区重绘次数。*/
		 static canvasReCache:number = 0;
		/** 表示当前使用的是否为慢渲染模式。*/
		 static renderSlow:boolean = false;
		/** 资源管理器所管理资源的累计内存,以字节为单位。*/
		 static gpuMemory:number;
		 static cpuMemory:number;
		
		private static _fpsStr:string;
		private static _canvasStr:string;
		private static _spriteStr:string;
		private static _fpsData:any[] = [];
		private static _timer:number = 0;
		private static _count:number = 0;
		private static _view:any[] = [];
		private static _fontSize:number = 12;
		private static _txt:Text;
		private static _leftText:Text;
		/**@private */
		 static _sp:Sprite;
		/**@private */
		 static _titleSp:Sprite;
		/**@private */
		 static _bgSp:Sprite;
		/**@private */
		 static _show:boolean = false;
		
		 static _useCanvas:boolean = false;
		private static _canvas:HTMLCanvas;
		private static _ctx:Context;
		private static _first:boolean;
		private static _vx:number;
		private static _width:number;
		private static _height:number = 100;
		
		/**
		 * 显示性能统计信息。
		 * @param	x X轴显示位置。
		 * @param	y Y轴显示位置。
		 */
		 static show(x:number = 0, y:number = 0):void {
			if (!Browser.onMiniGame && !Browser.onLimixiu && !Render.isConchApp && !Browser.onBDMiniGame && !Browser.onKGMiniGame && !Browser.onQGMiniGame) Stat._useCanvas = true;
			Stat._show = true;
			Stat._fpsData.length = 60;
			Stat._view[0] = {title: "FPS(Canvas)", value: "_fpsStr", color: "yellow", units: "int"};
			Stat._view[1] = {title: "Sprite", value: "_spriteStr", color: "white", units: "int"};
			Stat._view[2] = {title: "RenderBatches", value: "renderBatches", color: "white", units: "int"};
			Stat._view[3] = {title: "SavedRenderBatches", value: "savedRenderBatches", color: "white", units: "int"};
			Stat._view[4] = {title: "CPUMemory", value: "cpuMemory", color: "yellow", units: "M"};
			Stat._view[5] = {title: "GPUMemory", value: "gpuMemory", color: "yellow", units: "M"};
			Stat._view[6] = {title: "Shader", value: "shaderCall", color: "white", units: "int"};
			if (!Render.is3DMode) {
				Stat._view[0].title = "FPS(WebGL)";
				Stat._view[7] = {title: "Canvas", value: "_canvasStr", color: "white", units: "int"};
			} else {
				Stat._view[0].title = "FPS(3D)";
				Stat._view[7] = {title: "TriFaces", value: "trianglesFaces", color: "white", units: "int"};
				Stat._view[8] = {title: "FrustumCulling", value: "frustumCulling", color: "white", units: "int"};
				Stat._view[9] = {title: "OctreeNodeCulling", value: "octreeNodeCulling", color: "white", units: "int"};
			}
			if (Stat._useCanvas) {
				Stat.createUIPre(x, y);
			} else
				Stat.createUI(x, y);
			
			Stat.enable();
		}
		
		private static createUIPre(x:number, y:number):void {
			var pixel:number = Browser.pixelRatio;
			Stat._width = pixel * 180;
			Stat._vx = pixel * 120;
			Stat._height = pixel * (Stat._view.length * 12 + 3 * pixel) + 4;
			Stat._fontSize = 12 * pixel;
			for (var i:number = 0; i < Stat._view.length; i++) {
				Stat._view[i].x = 4;
				Stat._view[i].y = i * Stat._fontSize + 2 * pixel;
			}
			if (!Stat._canvas) {
				Stat._canvas = new HTMLCanvas(true);
				Stat._canvas.size(Stat._width, Stat._height);
				Stat._ctx = Stat._canvas.getContext('2d');
				Stat._ctx.textBaseline = "top";
				Stat._ctx.font = Stat._fontSize + "px Arial";
				
				Stat._canvas.source.style.cssText = "pointer-events:none;background:rgba(150,150,150,0.8);z-index:100000;position: absolute;direction:ltr;left:" + x + "px;top:" + y + "px;width:" + (Stat._width / pixel) + "px;height:" + (Stat._height / pixel) + "px;";
			}
			if(!Browser.onKGMiniGame)
			{
				Browser.container.appendChild(Stat._canvas.source);
			}
			
			Stat._first = true;
			Stat.loop();
			Stat._first = false;
		}
		
		private static createUI(x:number, y:number):void {
			var stat:Sprite = Stat._sp;
			var pixel:number = Browser.pixelRatio;
			if (!stat) {
				stat = new Sprite();
				Stat._leftText = new Text();
				Stat._leftText.pos(5, 5);
				Stat._leftText.color = "#ffffff";
				stat.addChild(Stat._leftText);
				
				Stat._txt = new Text();
				Stat._txt.pos(80 * pixel, 5);
				Stat._txt.color = "#ffffff";
				stat.addChild(Stat._txt);
				Stat._sp = stat;
			}
			
			stat.pos(x, y);
			
			var text:string = "";
			for (var i:number = 0; i < Stat._view.length; i++) {
				var one:any = Stat._view[i];
				text += one.title + "\n";
			}
			Stat._leftText.text = text;
			
			//调整为合适大小和字体			
			var width:number = pixel * 138;
			var height:number = pixel * (Stat._view.length * 12 + 3 * pixel) + 4;
			Stat._txt.fontSize = Stat._fontSize * pixel;
			Stat._leftText.fontSize = Stat._fontSize * pixel;
			
			stat.size(width, height);
			stat.graphics.clear();
			stat.graphics.alpha(0.5);
			stat.graphics.drawRect(0, 0, width, height, "#999999");
			stat.graphics.alpha(2);
			Stat.loop();
		}
		
		/**激活性能统计*/
		 static enable():void {
			Laya.systemTimer.frameLoop(1, Stat, Stat.loop);
		}
		
		/**
		 * 隐藏性能统计信息。
		 */
		 static hide():void {
			Stat._show = false;
			Laya.systemTimer.clear(Stat, Stat.loop);
			if (Stat._canvas) {
				Browser.removeElement(Stat._canvas.source);
			}
		}
		
		/**
		 * @private
		 * 清零性能统计计算相关的数据。
		 */
		 static clear():void {
			Stat.trianglesFaces = Stat.renderBatches = Stat.savedRenderBatches = Stat.shaderCall = Stat.spriteRenderUseCacheCount = Stat.frustumCulling = Stat.octreeNodeCulling = Stat.canvasNormal = Stat.canvasBitmap = Stat.canvasReCache = 0;
		}
		
		/**
		 * 点击性能统计显示区域的处理函数。
		 */
		 static set onclick(fn:Function) {
			if (Stat._sp) {
				Stat._sp.on("click", Stat._sp, fn);
			}
			if (Stat._canvas) {
				Stat._canvas.source.onclick = fn;
				Stat._canvas.source.style.pointerEvents = '';
			}
		}
		
		/**
		 * @private
		 * 性能统计参数计算循环处理函数。
		 */
		 static loop():void {
			Stat._count++;
			var timer:number = Browser.now();
			if (timer - Stat._timer < 1000) return;
			
			var count:number = Stat._count;
			//计算更精确的FPS值
			Stat.FPS = Math.round((count * 1000) / (timer - Stat._timer));
			if (Stat._show) {
				//计算平均值
				Stat.trianglesFaces = Math.round(Stat.trianglesFaces / count);
				
				if (!Stat._useCanvas) {
					Stat.renderBatches = Math.round(Stat.renderBatches / count) - 1;
				} else {
					Stat.renderBatches = Math.round(Stat.renderBatches / count);
				}
				Stat.savedRenderBatches = Math.round(Stat.savedRenderBatches / count);
				Stat.shaderCall = Math.round(Stat.shaderCall / count);
				Stat.spriteRenderUseCacheCount = Math.round(Stat.spriteRenderUseCacheCount / count);
				Stat.canvasNormal = Math.round(Stat.canvasNormal / count);
				Stat.canvasBitmap = Math.round(Stat.canvasBitmap / count);
				Stat.canvasReCache = Math.ceil(Stat.canvasReCache / count);
				Stat.frustumCulling = Math.round(Stat.frustumCulling / count);
				Stat.octreeNodeCulling = Math.round(Stat.octreeNodeCulling / count);
				
				var delay:string = Stat.FPS > 0 ? Math.floor(1000 / Stat.FPS).toString() : " ";
				Stat._fpsStr = Stat.FPS + (Stat.renderSlow ? " slow" : "") + " " + delay;
				
				if (Stat._useCanvas)
					Stat._spriteStr = (Stat.spriteCount - 1) + (Stat.spriteRenderUseCacheCount ? ("/" + Stat.spriteRenderUseCacheCount) : '');
				else
					Stat._spriteStr = (Stat.spriteCount - 4) + (Stat.spriteRenderUseCacheCount ? ("/" + Stat.spriteRenderUseCacheCount) : '');
				
				Stat._canvasStr = Stat.canvasReCache + "/" + Stat.canvasNormal + "/" + Stat.canvasBitmap;
				Stat.cpuMemory = Resource.cpuMemory;
				Stat.gpuMemory = Resource.gpuMemory;
				if (Stat._useCanvas) {
					Stat.renderInfoPre();
				} else
					Stat.renderInfo();
				Stat.clear();
			}
			
			Stat._count = 0;
			Stat._timer = timer;
		}
		
		private static renderInfoPre():void {
			var i:number = 0;
			var one:any;
			var value:any;
			if (Stat._canvas) {
				var ctx:any = Stat._ctx;
				ctx.clearRect(Stat._first ? 0 : Stat._vx, 0, Stat._width, Stat._height);
				for (i = 0; i < Stat._view.length; i++) {
					one = Stat._view[i];
					//只有第一次才渲染标题文字，减少文字渲染次数
					if (Stat._first) {
						ctx.fillStyle = "white";
						ctx.fillText(one.title, one.x, one.y);
					}
					ctx.fillStyle = one.color;
					value = Stat[one.value];
					(one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
					ctx.fillText(value + "", one.x + Stat._vx, one.y);
				}
			}
		}
		
		private static renderInfo():void {
			var text:string = "";
			for (var i:number = 0; i < Stat._view.length; i++) {
				var one:any = Stat._view[i];
				var value:any = Stat[one.value];
				(one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
				(one.units == "K") && (value = Math.floor(value / (1024) * 100) / 100 + " K");
				text += value + "\n";
			}
			Stat._txt.text = text;
		}
	}

