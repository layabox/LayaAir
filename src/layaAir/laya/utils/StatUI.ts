import { IStatRender } from "./IStatRender";
import { Browser } from "./Browser";
//import { Laya } from "./../../Laya";
import { Sprite } from "../display/Sprite"
import { Text } from "../display/Text"
import { Render } from "../renders/Render"
import { Context } from "../resource/Context"
import { HTMLCanvas } from "../resource/HTMLCanvas"
import { Resource } from "../resource/Resource"
import { Stat } from "./Stat";
import { ILaya } from "../../ILaya";
/**
 * 显示Stat的结果。由于stat会引入很多的循环引用，所以把显示部分拆开
 * @author laya
 */
export class StatUI extends IStatRender {
	private static _fontSize: number = 12;
	private _txt: Text;
	private _leftText: Text;
	/**@internal */
	_sp: Sprite;
	/**@internal */
	_titleSp: Sprite;
	/**@internal */
	_bgSp: Sprite;
	/**@internal */
	_show: boolean = false;
	/**@internal */
	_useCanvas: boolean = false;
	private _canvas: HTMLCanvas;
	private _ctx: Context;
	private _first: boolean;
	private _vx: number;
	private _width: number;
	private _height: number = 100;
	private _view: any[] = [];


	/**
	 * @override
	 * 显示性能统计信息。
	 * @param	x X轴显示位置。
	 * @param	y Y轴显示位置。
	 */
	show(x: number = 0, y: number = 0): void {
		var dt: any = Stat;
		if (!Browser._isMiniGame && !ILaya.Render.isConchApp) this._useCanvas = true;
		this._show = true;
		Stat._fpsData.length = 60;
		this._view[0] = { title: "FPS(WebGL)", value: "_fpsStr", color: "yellow", units: "int" };
		this._view[1] = { title: "Sprite", value: "_spriteStr", color: "white", units: "int" };
		this._view[2] = { title: "RenderBatches", value: "renderBatches", color: "white", units: "int" };
		this._view[3] = { title: "SavedRenderBatches", value: "savedRenderBatches", color: "white", units: "int" };
		this._view[4] = { title: "CPUMemory", value: "cpuMemory", color: "yellow", units: "M" };
		this._view[5] = { title: "GPUMemory", value: "gpuMemory", color: "yellow", units: "M" };
		this._view[6] = { title: "Shader", value: "shaderCall", color: "white", units: "int" };
		this._view[7] = { title: "Canvas", value: "_canvasStr", color: "white", units: "int" };
		if (Render.is3DMode) {
				this._view[0].title = "FPS(3D)";
				this._view[8] = { title: "TriFaces", value: "trianglesFaces", color: "white", units: "int" };
				this._view[9] = { title: "FrustumCulling", value: "frustumCulling", color: "white", units: "int" };
				this._view[10] = { title: "OctreeNodeCulling", value: "octreeNodeCulling", color: "white", units: "int" };
			}
			if (this._useCanvas) {
				this.createUIPre(x, y);
			} else
				this.createUI(x, y);

			this.enable();
		}

	private createUIPre(x: number, y: number): void {
		var pixel: number = Browser.pixelRatio;
		this._width = pixel * 180;
		this._vx = pixel * 120;
		this._height = pixel * (this._view.length * 12 + 3 * pixel) + 4;
		StatUI._fontSize = 12 * pixel;
		for (var i: number = 0; i < this._view.length; i++) {
			this._view[i].x = 4;
			this._view[i].y = i * StatUI._fontSize + 2 * pixel;
		}
		if (!this._canvas) {
			this._canvas = new HTMLCanvas(true);
			this._canvas.size(this._width, this._height);
			this._ctx = this._canvas.getContext('2d') as Context;
			this._ctx.textBaseline = "top";
			this._ctx.font = StatUI._fontSize + "px Arial";

			this._canvas.source.style.cssText = "pointer-events:none;background:rgba(150,150,150,0.8);z-index:100000;position: absolute;direction:ltr;left:" + x + "px;top:" + y + "px;width:" + (this._width / pixel) + "px;height:" + (this._height / pixel) + "px;";
		}
		if (!Browser.onKGMiniGame) {
			Browser.container.appendChild(this._canvas.source);
		}

		this._first = true;
		this.loop();
		this._first = false;
	}

	private createUI(x: number, y: number): void {
		var stat: Sprite = this._sp;
		var pixel: number = Browser.pixelRatio;
		if (!stat) {
			stat = new Sprite();
			this._leftText = new Text();
			this._leftText.pos(5, 5);
			this._leftText.color = "#ffffff";
			stat.addChild(this._leftText);

			this._txt = new Text();
			this._txt.pos(130 * pixel, 5);
			this._txt.color = "#ffffff";
			stat.addChild(this._txt);
			this._sp = stat;
		}

		stat.pos(x, y);

		var text: string = "";
		for (var i: number = 0; i < this._view.length; i++) {
			var one: any = this._view[i];
			text += one.title + "\n";
		}
		this._leftText.text = text;

		//调整为合适大小和字体			
		var width: number = pixel * 138;
		var height: number = pixel * (this._view.length * 12 + 3 * pixel) + 4;
		this._txt.fontSize = StatUI._fontSize * pixel;
		this._leftText.fontSize = StatUI._fontSize * pixel;

		stat.size(width, height);
		stat.graphics.clear();
		stat.graphics.alpha(0.5);
		stat.graphics.drawRect(0, 0, width + 110, height + 30, "#999999");
		stat.graphics.alpha(2);
		this.loop();
	}

	/**
	 * @override
	 * 激活性能统计
	 * */
	enable(): void {
		ILaya.systemTimer.frameLoop(1, this, this.loop);
	}

	/**
	 * @override
	 * 隐藏性能统计信息。
	 */
	hide(): void {
		this._show = false;
		ILaya.systemTimer.clear(this, this.loop);
		if (this._canvas) {
			Browser.removeElement(this._canvas.source);
		}
	}

	/**
	 * @override
	 * 点击性能统计显示区域的处理函数。
	 */
	set_onclick(fn: (this: GlobalEventHandlers, ev: MouseEvent) => any): void {
		if (this._sp) {
			this._sp.on("click", this._sp, fn);
		}
		if (this._canvas) {
			this._canvas.source.onclick = fn;
			this._canvas.source.style.pointerEvents = '';
		}
	}

	/**
	 * @private
	 * 性能统计参数计算循环处理函数。
	 */
	loop(): void {
		Stat._count++;
		var timer: number = Browser.now();
		if (timer - Stat._timer < 1000) return;

		var count: number = Stat._count;
		//计算更精确的FPS值
		Stat.FPS = Math.round((count * 1000) / (timer - Stat._timer));
		if (this._show) {
			//计算平均值
			Stat.trianglesFaces = Math.round(Stat.trianglesFaces / count);

			if (!this._useCanvas) {
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

			var delay: string = Stat.FPS > 0 ? Math.floor(1000 / Stat.FPS).toString() : " ";
			Stat._fpsStr = Stat.FPS + (Stat.renderSlow ? " slow" : "") + " " + delay;

			// if (this._useCanvas)
			// Stat._spriteStr = (Stat.spriteCount - 1) + (Stat.spriteRenderUseCacheCount ? ("/" + Stat.spriteRenderUseCacheCount) : '');
			// else
			Stat._spriteStr = Stat.spriteCount + (Stat.spriteRenderUseCacheCount ? ("/" + Stat.spriteRenderUseCacheCount) : '');

			Stat._canvasStr = Stat.canvasReCache + "/" + Stat.canvasNormal + "/" + Stat.canvasBitmap;
			Stat.cpuMemory = Resource.cpuMemory;
			Stat.gpuMemory = Resource.gpuMemory;
			if (this._useCanvas) {
				this.renderInfoPre();
			} else
				this.renderInfo();
			Stat.clear();
		}

		Stat._count = 0;
		Stat._timer = timer;
	}

	private renderInfoPre(): void {
		var i: number = 0;
		var one: any;
		var value: any;
		if (this._canvas) {
			var ctx: any = this._ctx;
			ctx.clearRect(this._first ? 0 : this._vx, 0, this._width, this._height);
			for (i = 0; i < this._view.length; i++) {
				one = this._view[i];
				//只有第一次才渲染标题文字，减少文字渲染次数
				if (this._first) {
					ctx.fillStyle = "white";
					ctx.fillText(one.title, one.x, one.y);
				}
				ctx.fillStyle = one.color;
				value = (Stat as any)[one.value];
				(one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
				ctx.fillText(value + "", one.x + this._vx, one.y);
			}
		}
	}

	private renderInfo(): void {
		var text: string = "";
		for (var i: number = 0; i < this._view.length; i++) {
			var one: any = this._view[i];
			var value: any = (Stat as any)[one.value];
			(one.units == "M") && (value = Math.floor(value / (1024 * 1024) * 100) / 100 + " M");
			(one.units == "K") && (value = Math.floor(value / (1024) * 100) / 100 + " K");
			text += value + "\n";
		}
		this._txt.text = text;
	}

	/**
	 * @override
	 */
	isCanvasRender(): boolean {
		return this._useCanvas;
	}

	/**
	 * @override
	 * 非canvas模式的渲染
	 * */
	renderNotCanvas(ctx: any, x: number, y: number) {
		this._show && this._sp && this._sp.render(ctx, 0, 0);
	}

}

