import { CharRenderInfo } from "./CharRenderInfo";
import { ICharRender } from "./ICharRender";

export interface IFontMeasure {
    getFontSizeInfo(font: string, size: number): number;
}

var pixelBBX = [0, 0, 0, 0];
const tmpRI = new CharRenderInfo();

export class MeasureFont implements IFontMeasure {
    private bmpData32: Uint32Array;

    private charRender: ICharRender;
    constructor(charRender: ICharRender) {
        this.charRender = charRender;
    }

    getFontSizeInfo(font: string, size: number): number {
        let fontstr = 'bold ' + size + 'px ' + font;
        // bbx初始大小
        pixelBBX[0] = size / 2;// 16;
        pixelBBX[1] = size / 2;// 16;
        pixelBBX[2] = size;// 32;
        pixelBBX[3] = size;// 32;

        var orix = 16;		// 左边留白，也就是x原点的位置
        var oriy = 16;
        var marginr = 16;
        var marginb = 16;
        this.charRender.scale(1, 1);
        tmpRI.height = size;
        this.charRender.fontsz = size;
        var bmpdt = this.charRender.getCharBmp('g', fontstr, 0, 'red', null, tmpRI, orix, oriy, marginr, marginb);
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        //测量宽度是 tmpRI.width
        this.updateBbx(bmpdt, pixelBBX, false);
        bmpdt = this.charRender.getCharBmp('有', fontstr, 0, 'red', null, tmpRI, oriy, oriy, marginr, marginb);// '有'比'国'大
        this.bmpData32 = new Uint32Array(bmpdt.data.buffer);
        // 国字的宽度就用系统测量的，不再用像素检测
        if (pixelBBX[2] < orix + tmpRI.width)
            pixelBBX[2] = orix + tmpRI.width;
        this.updateBbx(bmpdt, pixelBBX, false);//TODO 改成 true
        // 原点在 16,16
        var xoff = Math.max(orix - pixelBBX[0], 0);
        var yoff = Math.max(oriy - pixelBBX[1], 0);
        var bbxw = pixelBBX[2] - pixelBBX[0];
        var bbxh = pixelBBX[3] - pixelBBX[1];
        var sizeinfo = xoff << 24 | yoff << 16 | bbxw << 8 | bbxh;
        return sizeinfo;
    }

    /**
     * 检查当前线是否存在数据
     * @param	data
     * @param	l
     * @param	sx
     * @param	ex
     * @return
     */
    private checkBmpLine(data: ImageData, l: number, sx: number, ex: number): boolean {
        if (this.bmpData32.buffer != data.data.buffer) {
            this.bmpData32 = new Uint32Array(data.data.buffer);
        }
        var stpos = data.width * l + sx;
        for (var x = sx; x < ex; x++) {
            if (this.bmpData32[stpos++] != 0) return true;
        }
        return false;
    }

    /**
     * 根据bmp数据和当前的包围盒，更新包围盒
     * 由于选择的文字是连续的，所以可以用二分法
     * @param	data
     * @param	curbbx 	[l,t,r,b]
     * @param   onlyH 不检查左右
     */
    private updateBbx(data: ImageData, curbbx: number[], onlyH: boolean = false): void {
        var w = data.width;
        var h = data.height;
        var x = 0;
        // top
        var sy = curbbx[1];	//从t到0 sy表示有数据的行
        var ey = 0;
        var y = sy;
        if (this.checkBmpLine(data, sy, 0, w)) {
            // 如果当前行有数据，就要往上找
            while (true) {
                y = (sy + ey) / 2 | 0;	// 必须是int
                if (y + 1 >= sy) {// 
                    // 找到了。严格来说还不知道这个是否有像素，不过这里要求不严格，可以认为有
                    curbbx[1] = y;
                    break;
                }
                if (this.checkBmpLine(data, y, 0, w)) {
                    //中间线有数据，搜索上半部分
                    sy = y;
                } else {
                    //中间线没有有数据，搜索下半部分
                    ey = y;
                }
            }
        }
        // 下半部分
        if (curbbx[3] > h) curbbx[3] = h;
        else {
            y = sy = curbbx[3];
            ey = h;
            if (this.checkBmpLine(data, sy, 0, w)) {
                while (true) {
                    y = (sy + ey) / 2 | 0;
                    if (y - 1 <= sy) {
                        curbbx[3] = y;
                        break;
                    }
                    if (this.checkBmpLine(data, y, 0, w)) {
                        sy = y;
                    } else {
                        ey = y;
                    }
                }
            }
        }

        if (onlyH)
            return;

        // 左半部分
        var minx = curbbx[0];
        var stpos = w * curbbx[1]; //w*cy+0
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = 0; x < minx; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    minx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[0] = minx;
        // 右半部分
        var maxx = curbbx[2];
        stpos = w * curbbx[1]; //w*cy
        for (y = curbbx[1]; y < curbbx[3]; y++) {
            for (x = maxx; x < w; x++) {
                if (this.bmpData32[stpos + x] != 0) {
                    maxx = x;
                    break;
                }
            }
            stpos += w;
        }
        curbbx[2] = maxx;
    }
}