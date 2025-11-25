import { TextRenderConfig } from "./TextRenderConfig";

/**
 * 这是测算字体绘制大小和偏移的逻辑
 * @internal
 */
export function measureFont(ctx: CanvasRenderingContext2D, font: string, bold: boolean) {
    let size = TextRenderConfig.standardFontSize;
    ctx.font = (bold ? 'bold ' : '') + size + 'px ' + font;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.textBaseline = "middle";
    ctx.lineWidth = 0;
    ctx.fillStyle = "red";

    let margin = 16;

    // bbx初始大小
    const pixelBBX = [0, 0, 0, 0];
    pixelBBX[0] = size / 2; // 16;
    pixelBBX[1] = size / 2; // 16;
    pixelBBX[2] = size; // 32;
    pixelBBX[3] = size; // 32;

    drawTestChar(ctx, 'g', size, margin, pixelBBX);
    drawTestChar(ctx, '有', size, margin, pixelBBX);// '有'比'国'大
    drawTestChar(ctx, '🤡', size, margin, pixelBBX, true);

    // 原点在 16,16
    let xoff = Math.max(margin - pixelBBX[0], 0);
    let yoff = Math.max(margin - pixelBBX[1], 0);
    let bbxw = pixelBBX[2] - pixelBBX[0];
    let bbxh = pixelBBX[3] - pixelBBX[1];
    return { xoff, yoff, bbxw, bbxh };
}

function drawTestChar(ctx: CanvasRenderingContext2D, char: string, fontSize: number, margin: number, pixelBBX: number[], onlyH?: boolean): void {
    let charWidth = ctx.measureText(char).width;
    let width = charWidth + margin * 2;
    let height = fontSize + margin * 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillText(char, margin, margin + fontSize / 2);

    let bmp = ctx.getImageData(0, 0, width, height);
    updateBbx(bmp, pixelBBX, onlyH);
}

function updateBbx(data: ImageData, curbbx: number[], onlyH: boolean): void {
    let bmpData32 = new Uint32Array(data.data.buffer);

    function checkBmpLine(data: ImageData, l: number, sx: number, ex: number): boolean {
        let stpos = data.width * l + sx;
        for (let x = sx; x < ex; x++) {
            if (bmpData32[stpos++] !== 0)
                return true;
        }
        return false;
    }

    let w = data.width;
    let h = data.height;
    let x = 0;
    // top
    let sy = curbbx[1];	//从t到0 sy表示有数据的行
    let ey = 0;
    let y = sy;
    if (checkBmpLine(data, sy, 0, w)) {
        // 如果当前行有数据，就要往上找
        while (true) {
            y = (sy + ey) / 2 | 0; // 必须是int
            if (y + 1 >= sy) {// 
                // 找到了。严格来说还不知道这个是否有像素，不过这里要求不严格，可以认为有
                curbbx[1] = y;
                break;
            }
            if (checkBmpLine(data, y, 0, w)) {
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
        if (checkBmpLine(data, sy, 0, w)) {
            while (true) {
                y = (sy + ey) / 2 | 0;
                if (y - 1 <= sy) {
                    curbbx[3] = y;
                    break;
                }
                if (checkBmpLine(data, y, 0, w)) {
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
    let minx = curbbx[0];
    let stpos = w * curbbx[1]; //w*cy+0
    for (y = curbbx[1]; y < curbbx[3]; y++) {
        for (x = 0; x < minx; x++) {
            if (bmpData32[stpos + x] !== 0) {
                minx = x;
                break;
            }
        }
        stpos += w;
    }
    curbbx[0] = minx;
    // 右半部分
    let maxx = curbbx[2];
    stpos = w * curbbx[1]; //w*cy
    for (y = curbbx[1]; y < curbbx[3]; y++) {
        for (x = maxx; x < w; x++) {
            if (bmpData32[stpos + x] !== 0) {
                maxx = x;
                break;
            }
        }
        stpos += w;
    }
    curbbx[2] = maxx;
}