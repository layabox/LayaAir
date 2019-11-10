import { CharRenderInfo } from "./CharRenderInfo";
import { ICharRender } from "./ICharRender"
import { ColorUtils } from "../../utils/ColorUtils"
export class CharRender_Native extends ICharRender {
	private lastFont: string = '';
	private lastScaleX: number = 1.0;
	private lastScaleY: number = 1.0;

	//TODO:coverage
	constructor() {
		super();

	}

	/**
	 * 
	 * @param font 
	 * @param str 
	 * @override
	 */
	 getWidth(font: string, str: string): number {
		if (!(window as any).conchTextCanvas) return 0;
		//TODO 先取消判断，保证字体信息一致
		//if (lastFont != font) { 
		(window as any).conchTextCanvas.font = font;
		this.lastFont = font;
		//console.log('use font ' + font);
		//}					
		//getTextBitmapData
		return (window as any).conchTextCanvas.measureText(str).width;
	}

	/**
	 * 
	 * @param sx 
	 * @param sy 
	 * @override
	 */
	scale(sx: number, sy: number): void {
		this.lastScaleX = sx;
		this.lastScaleY = sy;
	}
	/**
	 *TODO stroke 
	 * @param	char
	 * @param	font
	 * @param	size  返回宽高
	 * @return
	 * @override
	 */
	getCharBmp(char: string, font: string, lineWidth: number, colStr: string, strokeColStr: string, size: CharRenderInfo,
		margin_left: number, margin_top: number, margin_right: number, margin_bottom: number, rect: any[] | null = null): ImageData|null {

		if (!(window as any).conchTextCanvas) return null;
		//window.conchTextCanvas.getTextBitmapData();

		//TODO 先取消判断，保证字体信息一致
		//if(lastFont!=font){
		(window as any).conchTextCanvas.font = font;
		this.lastFont = font;
		//}						
		var w: number = size.width = (window as any).conchTextCanvas.measureText(char).width;
		var h: number = size.height;
		w += (margin_left + margin_right);
		h += (margin_top + margin_bottom);

		(window as any).conchTextCanvas.scale && (window as any).conchTextCanvas.scale(this.lastScaleX, this.lastScaleY);

		var c1: ColorUtils = ColorUtils.create(strokeColStr);
		var nStrokeColor: number = c1.numColor;
		var c2: ColorUtils = ColorUtils.create(colStr);
		var nTextColor: number = c2.numColor;
		var textInfo: any = (window as any).conchTextCanvas.getTextBitmapData(char, nTextColor, lineWidth > 2 ? 2 : lineWidth, nStrokeColor);
		//window.Laya.LayaGL.instance.texSubImage2D(1,2,0,0,textInfo.width,textInfo.height,0,0,textInfo.bitmapData);
		//var ret = new ImageData();
		size.bmpWidth = textInfo.width;
		size.bmpHeight = textInfo.height;
		return textInfo;
        /*
        ctx.clearRect(0,0, w, h);
        //ctx.textAlign = "end";
        ctx.textBaseline = "top";
        if (lineWidth > 0) { 
            ctx.strokeStyle = colStr;
            ctx.lineWidth = lineWidth;
            ctx.strokeText(char, margin_left, margin_top);
        } else {
            ctx.fillStyle = colStr;
            ctx.fillText(char, margin_left, margin_top);
        }
        if ( CharBook.debug) {
            ctx.strokeStyle = '#ff0000';
            ctx.strokeRect(0, 0, w, h);
            ctx.strokeStyle = '#00ff00';
            ctx.strokeRect(margin_left, margin_top, size.width, size.height);
        }
        //ctx.restore();
        return ctx.getImageData( 0,0, w, h );
        */
	}
}

