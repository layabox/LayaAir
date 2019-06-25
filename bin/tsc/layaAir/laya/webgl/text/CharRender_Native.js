import { ICharRender } from "./ICharRender";
import { ColorUtils } from "../../utils/ColorUtils";
export class CharRender_Native extends ICharRender {
    //TODO:coverage
    constructor() {
        super();
        this.lastFont = '';
    }
    //TODO:coverage
    /*override*/ getWidth(font, str) {
        if (!window.conchTextCanvas)
            return 0;
        //TODO 先取消判断，保证字体信息一致
        //if (lastFont != font) { 
        window.conchTextCanvas.font = font;
        this.lastFont = font;
        //console.log('use font ' + font);
        //}					
        //getTextBitmapData
        return window.conchTextCanvas.measureText(str).width;
    }
    /*override*/ scale(sx, sy) {
    }
    /**
     *TODO stroke
     * @param	char
     * @param	font
     * @param	size  返回宽高
     * @return
     */
    //TODO:coverage
    /*override*/ getCharBmp(char, font, lineWidth, colStr, strokeColStr, size, margin_left, margin_top, margin_right, margin_bottom, rect = null) {
        if (!window.conchTextCanvas)
            return null;
        //window.conchTextCanvas.getTextBitmapData();
        //TODO 先取消判断，保证字体信息一致
        //if(lastFont!=font){
        window.conchTextCanvas.font = font;
        this.lastFont = font;
        //}						
        var w = size.width = window.conchTextCanvas.measureText(char).width;
        var h = size.height;
        w += (margin_left + margin_right);
        h += (margin_top + margin_bottom);
        var c1 = ColorUtils.create(strokeColStr);
        var nStrokeColor = c1.numColor;
        var c2 = ColorUtils.create(colStr);
        var nTextColor = c2.numColor;
        var textInfo = window.conchTextCanvas.getTextBitmapData(char, nTextColor, lineWidth > 2 ? 2 : lineWidth, nStrokeColor);
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
