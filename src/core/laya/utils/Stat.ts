import { StatData } from "././StatData";
import { Laya } from "./../../Laya";
import { Browser } from "././Browser";
import { Sprite } from "../display/Sprite"
	import { Text } from "../display/Text"
	import { Render } from "../renders/Render"
	import { Context } from "../resource/Context"
	import { HTMLCanvas } from "../resource/HTMLCanvas"
	import { Resource } from "../resource/Resource"	
	/**
	 * 为了避免循环引用，把stat的数据和渲染分开
	 * @author laya
	 */
	export class Stat extends StatData{
		
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
		
		/**激活性能统计*/
		 static enable():void {
			Laya.systemTimer.frameLoop(1, Stat, Stat.loop);
		}
		
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
			StatData.FPS = Math.round((count * 1000) / (timer - Stat._timer));
			if (Stat._show) {
				//计算平均值
				StatData.trianglesFaces = Math.round(StatData.trianglesFaces / count);
				
				if (!Stat._useCanvas) {
					StatData.renderBatches = Math.round(StatData.renderBatches / count) - 1;
				} else {
					StatData.renderBatches = Math.round(StatData.renderBatches / count);
				}
				StatData.savedRenderBatches = Math.round(StatData.savedRenderBatches / count);
				StatData.shaderCall = Math.round(StatData.shaderCall / count);
				StatData.spriteRenderUseCacheCount = Math.round(StatData.spriteRenderUseCacheCount / count);
				StatData.canvasNormal = Math.round(StatData.canvasNormal / count);
				StatData.canvasBitmap = Math.round(StatData.canvasBitmap / count);
				StatData.canvasReCache = Math.ceil(StatData.canvasReCache / count);
				StatData.frustumCulling = Math.round(StatData.frustumCulling / count);
				StatData.octreeNodeCulling = Math.round(StatData.octreeNodeCulling / count);
				
				var delay:string = StatData.FPS > 0 ? Math.floor(1000 / StatData.FPS).toString() : " ";
				Stat._fpsStr = StatData.FPS + (StatData.renderSlow ? " slow" : "") + " " + delay;
				
				if (Stat._useCanvas)
					Stat._spriteStr = (StatData.spriteCount - 1) + (StatData.spriteRenderUseCacheCount ? ("/" + StatData.spriteRenderUseCacheCount) : '');
				else
					Stat._spriteStr = (StatData.spriteCount - 4) + (StatData.spriteRenderUseCacheCount ? ("/" + StatData.spriteRenderUseCacheCount) : '');
				
				Stat._canvasStr = StatData.canvasReCache + "/" + StatData.canvasNormal + "/" + StatData.canvasBitmap;
				StatData.cpuMemory = Resource.cpuMemory;
				StatData.gpuMemory = Resource.gpuMemory;
				if (Stat._useCanvas) {
					Stat.renderInfoPre();
				} else
					Stat.renderInfo();
				this.clear();
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
		
	}


