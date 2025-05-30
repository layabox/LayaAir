import { CharRenderInfo } from "./CharRenderInfo"
import { Browser } from "../../utils/Browser";
import { TextRenderConfig } from "./TextRenderConfig";

export class CharRender_Canvas {
    fontsz = 16;
    canvas: HTMLCanvasElement;

    private ctx: CanvasRenderingContext2D;
    private lastScaleX = 1.0;
    private lastScaleY = 1.0;
    private maxTexW = 0;
    private maxTexH = 0;
    private lastFont: string;

    constructor(maxw: number, maxh: number) {
        this.maxTexW = maxw;
        this.maxTexH = maxh;

        let canvas = <HTMLCanvasElement>Browser.createElement("canvas");
        this.canvas = canvas;
        canvas.width = 1024;
        canvas.height = 512;
        if (Browser.isDomSupported) {
            //这个canvas是用来获取字体渲染结果的。由于不可见canvas的字体不能小于12，所以要加到body上
            //为了避免被发现，设一个在屏幕外的绝对位置。
            canvas.style.left = "-10000px";
            canvas.style.position = "absolute";
            Browser.document.body.appendChild(canvas);
        }
        this.ctx = canvas.getContext('2d', { willReadFrequently: true });
    }
    /**
     * @override
     */
    get canvasWidth(): number {
        return this.canvas.width;
    }

    /**
     * @override
     */
    set canvasWidth(w: number) {
        if (this.canvas.width == w)
            return;
        this.canvas.width = w;
        // if (w > 2048) {
        // 	console.warn("画文字设置的宽度太大，超过2048了");
        // }
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
        //由于大家公用一个canvas，所以需要在选中的时候做一些配置。
        if (this.lastFont != font) {
            this.ctx.font = font;
            this.lastFont = font;
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
        if (!TextRenderConfig.useImageData) { // useImageData==false表示用 getCharCanvas，这个自己管理缩放
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
     * @param char
     * @param font
     * @param cri  修改里面的width。
     * @return
     * @override
     */
    getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, cri: CharRenderInfo,
        margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect?: number[]): ImageData | null {
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
        w = Math.min(w, this.canvas.width);
        h = Math.min(h, this.canvas.height);

        var clearW: number = w + lineWidth * 2 + 1;
        var clearH: number = h + lineWidth * 2 + 1;
        if (rect) {// measureText可能会小于请求的区域。 rect[2]可能为-1
            clearW = Math.max(clearW, rect[0] + rect[2] + 1);
            clearH = Math.max(clearH, rect[1] + rect[3] + 1);
        }
        ctx.clearRect(0, 0, clearW / this.lastScaleX + 1, clearH / this.lastScaleY + 1);
        ctx.save();
        //ctx.textAlign = "end";
        ctx.textBaseline = "middle";
        //ctx.translate(CborderSize, CborderSize);
        //ctx.scale(xs, ys);
        if (lineWidth > 0) {
            //设置文本描边为圆角模式，默认值miter会导致在某些字体的转角字符出现尖刺现象。
            ctx.lineJoin = "round";
            ctx.strokeStyle = strokeColStr;
            ctx.lineWidth = lineWidth;
            ctx.strokeText(char, margin_left, margin_top + sz / 2);
        }
        if (colStr) {
            ctx.fillStyle = colStr;
            ctx.fillText(char, margin_left, margin_top + sz / 2);
        }

        if (TextRenderConfig.debugCharCanvas) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(1, 1, w - 2, h - 2);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(margin_left, margin_top, cri.width, cri.height);//原始大小，没有缩放的
        }
        //ctx.restore();
        if (rect) {
            if (rect[2] <= 0)//<=0表示原点的x偏移，例如原点在2，则这里就是-2， 这时候测量的宽度是从原点开始的，所以要加上偏移。否则会有右边被裁剪的情况
                rect[2] = Math.ceil(-rect[2] + (cri.width + lineWidth * 2) * this.lastScaleX);
            //if (rect[2] == -1) rect[2] = Math.ceil((cri.width + lineWidth * 2) * this.lastScaleX); // 这个没有考虑左右margin
            if (rect[2] <= 0) rect[2] = 1;	// 有的字体在处理不存在文字的时候，测量宽度为0，会导致getImageData出错
        }
        var imgdt: ImageData = rect ? (ctx.getImageData(rect[0], rect[1], rect[2], rect[3] + 1)) : (ctx.getImageData(0, 0, w, h + 1));
        ctx.restore();
        cri.bmpWidth = imgdt.width;
        cri.bmpHeight = imgdt.height;
        return imgdt;
    }

    getCharCanvas(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, cri: CharRenderInfo,
        margin_left: number, margin_top: number, margin_right: number, margin_bottom: number): HTMLCanvasElement {
        var ctx: any = this.ctx;

        //ctx.save();
        //由于大家公用一个canvas，所以需要在选中的时候做一些配置。
        //跟_lastFont比较容易出错，所以比较ctx.font
        if (ctx.font != font) {// ctx._lastFont != font) {	问题：ctx.font=xx 然后ctx==xx可能返回false，例如可能会给自己加"",当字体有空格的时候
            ctx.font = font;
            ctx._lastFont = font;
            //console.log('use font ' + font);
        }
        if (Browser.isIOSHighPerformanceModePlus) {
            // 临时处理,微信高性能+模式下文本会出现裁剪问题,这里强制设置font解决
            ctx.font = font;
        }

        cri.width = ctx.measureText(char).width;//排版用的width是没有缩放的。后面会用矩阵缩放
        var w: number = cri.width * this.lastScaleX;//w h 只是clear用的。所以要缩放
        var h: number = cri.height * this.lastScaleY;
        w += (margin_left + margin_right) * this.lastScaleX;
        h += ((margin_top + margin_bottom) * this.lastScaleY + 1);	// 这个+1只是为了让测试能通过。确实应该加点高度，否则会被裁掉一部分，但是加多少还没找到方法。
        w = Math.min(Math.ceil(w), this.maxTexW);
        h = Math.min(Math.ceil(h), this.maxTexH);

        //if (canvas.width != (w + 1) || canvas.height != (h + 1)) {
        this.canvas.width = Math.min(w + 1, this.maxTexW);
        this.canvas.height = Math.min(h + 1, this.maxTexH);
        ctx.font = font;
        //}
        ctx.clearRect(0, 0, w + 1 + lineWidth, h + 1 + lineWidth);
        ctx.setTransform(1, 0, 0, 1, 0, 0);	// 强制清理缩放
        ctx.save();
        if (TextRenderConfig.scaleFontWithCtx) {
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
            ctx.lineJoin = "round";
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
        if (TextRenderConfig.debugCharCanvas) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0, 0, w, h);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(0, 0, cri.width, cri.height);//原始大小，没有缩放的
        }
        ctx.restore();
        cri.bmpWidth = this.canvas.width;
        cri.bmpHeight = this.canvas.height;


        return this.canvas;
    }
}

