import { CharRenderInfo } from "./CharRenderInfo"
import { ICharRender } from "./ICharRender"
import { Browser } from "../../utils/Browser";
export class CharRender_Canvas extends ICharRender {
	private static canvas: any = null;// HTMLCanvasElement;
	private ctx: any = null;
	private lastScaleX = 1.0;
	private lastScaleY = 1.0;
	//private needResetScale: boolean = false;
	private maxTexW = 0;
	private maxTexH = 0;
	private scaleFontSize = true;
	private showDbgInfo = false;
	private supportImageData = true;
	constructor(maxw: number, maxh: number, scalefont: boolean = true, useImageData: boolean = true, showdbg: boolean = false) {
		super();
		this.maxTexW = maxw;
		this.maxTexH = maxh;
		this.scaleFontSize = scalefont;
		this.supportImageData = useImageData;
		this.showDbgInfo = showdbg;
		if (!CharRender_Canvas.canvas) {
			CharRender_Canvas.canvas = Browser.createElement('canvas');
			CharRender_Canvas.canvas.width = 1024;
			CharRender_Canvas.canvas.height = 512;
			//这个canvas是用来获取字体渲染结果的。由于不可见canvas的字体不能小于12，所以要加到body上
			//为了避免被发现，设一个在屏幕外的绝对位置。
			CharRender_Canvas.canvas.style.left = "-10000px";
			CharRender_Canvas.canvas.style.position = "absolute";
			document.body.appendChild(CharRender_Canvas.canvas);;
			this.ctx = CharRender_Canvas.canvas.getContext('2d');
		}
	}
    /**
     * @override
     */
	get canvasWidth(): number {
		return CharRender_Canvas.canvas.width;
	}

    /**
     * @override
     */
	set canvasWidth(w: number) {
		if (CharRender_Canvas.canvas.width == w)
			return;
		CharRender_Canvas.canvas.width = w;
		if (w > 2048) {
			console.warn("画文字设置的宽度太大，超过2048了");
		}
		// 重新恢复一下缩放
		this.ctx.setTransform(1, 0, 0, 1, 0, 0);	// 强制清理缩放			
		this.ctx.scale(this.lastScaleX, this.lastScaleY);
	}

	/**
	 * 
	 * @param font 
	 * @param str 
	 * @override
	 */
	getWidth(font: string, str: string): number {
		if (!this.ctx) return 0;
		//由于大家公用一个canvas，所以需要在选中的时候做一些配置。
		if (this.ctx._lastFont != font) {
			this.ctx.font = font;
			this.ctx._lastFont = font;
			//console.log('use font ' + font);
		}
		return this.ctx.measureText(str).width;
	}

	/**
	 * 
	 * @param sx 
	 * @param sy 
	 * @override
	 */
	scale(sx: number, sy: number): void {
		if (!this.supportImageData) {// supportImageData==false表示用 getCharCanvas，这个自己管理缩放
			this.lastScaleX = sx;
			this.lastScaleY = sy;
			return;
		}

		if (this.lastScaleX != sx || this.lastScaleY != sy) {
			this.ctx.setTransform(sx, 0, 0, sy, 0, 0);	// 强制清理缩放			
			this.lastScaleX = sx;
			this.lastScaleY = sy;
		}
	}

	/**
	 *TODO stroke 
	 * @param	char
	 * @param	font
	 * @param	cri  修改里面的width。
	 * @return
	 * @override
	 */
	getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, cri: CharRenderInfo,
		margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect: any[] | null = null): ImageData|null {
		if (!this.supportImageData)
			return this.getCharCanvas(char, font, lineWidth, colStr, strokeColStr, cri, margin_left, margin_top, margin_right, margin_bottom);
		var ctx: any = this.ctx;

		var sz = this.fontsz;
		//ctx.save();
		//由于大家公用一个canvas，所以需要在选中的时候做一些配置。
		//跟_lastFont比较容易出错，所以比较ctx.font
		if (ctx.font != font) {// ctx._lastFont != font) {	问题：ctx.font=xx 然后ctx==xx可能返回false，例如可能会给自己加"",当字体有空格的时候
			ctx.font = font;
			ctx._lastFont = font;
			//console.log('use font ' + font);
		}

		cri.width = ctx.measureText(char).width;//排版用的width是没有缩放的。后面会用矩阵缩放
		var w: number = cri.width * this.lastScaleX;//w h 只是clear用的。所以要缩放
		var h: number = cri.height * this.lastScaleY;
		w += (margin_left + margin_right) * this.lastScaleX;
		h += (margin_top + margin_bottom) * this.lastScaleY;
		w = Math.ceil(w);
		h = Math.ceil(h);
		w = Math.min(w, CharRender_Canvas.canvas.width);
		h = Math.min(h, CharRender_Canvas.canvas.height);

		var clearW: number = w + lineWidth * 2 + 1;
		var clearH: number = h + lineWidth * 2 + 1;
		if (rect) {// measureText可能会小于请求的区域。 rect[2]可能为-1
			clearW = Math.max(clearW, rect[0] + rect[2] + 1);
			clearH = Math.max(clearH, rect[1] + rect[3] + 1);
		}
		ctx.clearRect(0, 0, clearW/this.lastScaleX+1, clearH/this.lastScaleY+1);
		ctx.save();
		//ctx.textAlign = "end";
		ctx.textBaseline = "middle";
		//ctx.translate(CborderSize, CborderSize);
		//ctx.scale(xs, ys);
		if (lineWidth > 0) {
			ctx.strokeStyle = strokeColStr;
			ctx.lineWidth = lineWidth;
			ctx.strokeText(char, margin_left, margin_top + sz / 2);
		}
		if (colStr) {
			ctx.fillStyle = colStr;
			ctx.fillText(char, margin_left, margin_top + sz / 2);
		}

		if (this.showDbgInfo) {
			ctx.strokeStyle = '#ff0000';
			ctx.strokeRect(1, 1, w - 2, h - 2);
			ctx.strokeStyle = '#00ff00';
			ctx.strokeRect(margin_left, margin_top, cri.width, cri.height);//原始大小，没有缩放的
		}
		//ctx.restore();
		if (rect) {
			if (rect[2] == -1) rect[2] = Math.ceil((cri.width + lineWidth * 2) * this.lastScaleX); // 这个没有考虑左右margin
			if(rect[2]<=0) rect[2]=1;	// 有的字体在处理不存在文字的时候，测量宽度为0，会导致getImageData出错
		}
		var imgdt: ImageData = rect ? (ctx.getImageData(rect[0], rect[1], rect[2], rect[3]+1)) : (ctx.getImageData(0, 0, w, h+1));
		ctx.restore();
		cri.bmpWidth = imgdt.width;
		cri.bmpHeight = imgdt.height;
		return imgdt;
	}

	getCharCanvas(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, cri: CharRenderInfo, margin_left: number, margin_top: number, margin_right: number, margin_bottom: number): ImageData {
		var ctx: any = this.ctx;

		//ctx.save();
		//由于大家公用一个canvas，所以需要在选中的时候做一些配置。
		//跟_lastFont比较容易出错，所以比较ctx.font
		if (ctx.font != font) {// ctx._lastFont != font) {	问题：ctx.font=xx 然后ctx==xx可能返回false，例如可能会给自己加"",当字体有空格的时候
			ctx.font = font;
			ctx._lastFont = font;
			//console.log('use font ' + font);
		}

		cri.width = ctx.measureText(char).width;//排版用的width是没有缩放的。后面会用矩阵缩放
		var w: number = cri.width * this.lastScaleX;//w h 只是clear用的。所以要缩放
		var h: number = cri.height * this.lastScaleY;
		w += (margin_left + margin_right) * this.lastScaleX;
		h += ((margin_top + margin_bottom) * this.lastScaleY + 1);	// 这个+1只是为了让测试能通过。确实应该加点高度，否则会被裁掉一部分，但是加多少还没找到方法。
		w = Math.min(w, this.maxTexW);
		h = Math.min(h, this.maxTexH);

		//if (canvas.width != (w + 1) || canvas.height != (h + 1)) {
		CharRender_Canvas.canvas.width = Math.min(w + 1, this.maxTexW);
		CharRender_Canvas.canvas.height = Math.min(h + 1, this.maxTexH);
		ctx.font = font;
		//}
		ctx.clearRect(0, 0, w + 1 + lineWidth, h + 1 + lineWidth);
		ctx.setTransform(1, 0, 0, 1, 0, 0);	// 强制清理缩放
		ctx.save();
		if (this.scaleFontSize) {
			//这里的缩放会导致与上面的缩放同时起作用。所以上面保护
			ctx.scale(this.lastScaleX, this.lastScaleY);
		}
		ctx.translate(margin_left, margin_top);
		ctx.textAlign = "left";

		var sz = this.fontsz;
		ctx.textBaseline = "middle";
		//ctx.translate(CborderSize, CborderSize);
		//ctx.scale(xs, ys);
		if (lineWidth > 0) {
			ctx.strokeStyle = strokeColStr;
			ctx.fillStyle = colStr;
			ctx.lineWidth = lineWidth;
			//ctx.strokeText(char, margin_left, margin_top);
			if (ctx.fillAndStrokeText) {
				ctx.fillAndStrokeText(char, 0, sz / 2);
			} else {
				ctx.strokeText(char, 0, sz / 2);
				ctx.fillText(char, 0, sz / 2);
			}
		} else if (colStr) {
			ctx.fillStyle = colStr;
			ctx.fillText(char, 0, sz / 2);
		}
		if (this.showDbgInfo) {
			ctx.strokeStyle = '#ff0000';
			ctx.strokeRect(0, 0, w, h);
			ctx.strokeStyle = '#00ff00';
			ctx.strokeRect(0, 0, cri.width, cri.height);//原始大小，没有缩放的
		}
		ctx.restore();
		cri.bmpWidth = CharRender_Canvas.canvas.width;
		cri.bmpHeight = CharRender_Canvas.canvas.height;
		return CharRender_Canvas.canvas;
	}
}

