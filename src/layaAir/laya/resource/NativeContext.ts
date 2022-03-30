import { ILaya } from "../../ILaya";
import { ColorUtils } from "../utils/ColorUtils";
import { NativeWebGLCacheAsNormalCanvas } from "../webgl/canvas/NativeWebGLCacheAsNormalCanvas";

export class NativeContext {
    static ENUM_TEXTALIGN_DEFAULT: number = 0;
	static ENUM_TEXTALIGN_CENTER: number = 1;
	static ENUM_TEXTALIGN_RIGHT: number = 2;
    _nativeObj: any;
    sprite: any = null;
    static __init__(): void {
	}
    constructor()
    {
        this._nativeObj = new (window as any)._conchContext();
    }
    	/**@private */
	get lineJoin(): string {
		return '';
	}

	/**@private */
	set lineJoin(value: string) {
	}

	/**@private */
	get lineCap(): string {
		return '';
	}

	/**@private */
	set lineCap(value: string) {
	}

	/**@private */
	get miterLimit(): string {
		return '';
	}

	/**@private */
	set miterLimit(value: string) {
	}
    set isMain(value: boolean) {
        this._nativeObj.isMain = value;
    }
    get isMain() {
        return this._nativeObj.isMain;
    }
    alpha(value: number): void {
        this._nativeObj.globalAlpha *= value;
    }
    flush(): void {
        //this._nativeObj.flush(this._buffer);
        this._nativeObj.flush();
    }
    clear(): void {
        this._nativeObj.clear();
    }
    static set2DRenderConfig(): void {
        (window as any).set2DRenderConfig();
    }
    save(): void {
        this._nativeObj.save();
    }
    restore(): void { 
        this._nativeObj.restore();
    }
    saveTransform(matrix: any/*Matrix*/): void {
		this._nativeObj.save();
	}
    transformByMatrix(matrix: any/*Matrix*/, tx: number, ty: number): void {
        this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
    }
    restoreTransform(matrix: any/*Matrix*/): void {
		this._nativeObj.restore();
	}
    clipRect(x: number, y: number, width: number, height: number): void {
        this._nativeObj.clipRect(x, y, width, height);
    }
    transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
		this._nativeObj.transform(a, b, c, d, tx, ty);
	}
    drawTexture(tex: any/*Texture*/, x: number, y: number, width: number, height: number): void {
        if (!this.checkTexture(tex)) {
            return;
        }
        this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width, height, (tex as any).uv);
	}
    drawTextureWithTransform(tex: any/*Texture*/, x: number, y: number, width: number, height: number, transform: any/*Matrix*/|null, tx: number, ty: number, alpha: number, blendMode: string|null, colorfilter: any/*ColorFilter*/|null = null, uv?: number[]): void {
		if (!this.checkTexture(tex)) {
            return;
        }
        this._nativeObj.save();
        this._nativeObj.globalAlpha = alpha;
        if (transform) {
            this._nativeObj.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + tx, transform.ty + ty);
            this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width || tex.width, height|| tex.height, uv || (tex as any).uv);
        }
        else {
            this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x + tx, y + ty, width || tex.width, height|| tex.height, uv || (tex as any).uv);
        }
        this._nativeObj.restore();
    }

    drawTextureWithSizeGrid(tex: any/*Texture*/, tx: number, ty: number, width: number, height: number, sizeGrid: any[], gx: number, gy: number): void {
		if (!this.checkTexture(tex)) {
            return;
        }

        var uv = tex.uv, w: number = tex.bitmap.width, h: number = tex.bitmap.height;

		var top: number = sizeGrid[0];
		var left: number = sizeGrid[3];
		var right: number = sizeGrid[1];
		var bottom: number = sizeGrid[2];
		var repeat: boolean = sizeGrid[4];

        this._nativeObj.drawTextureWithSizeGrid((tex as any).bitmap._texture.id, tx, ty, width, height, top, right, bottom, left, repeat, gx, gy, uv[0]
            ,uv[1]
            ,uv[2]
            ,uv[3]
            ,uv[4]
            ,uv[5]
            ,uv[6]
            ,uv[7]);
    }
    _drawTextureM(tex: any/*Texture*/, x: number, y: number, width: number, height: number, transform: any/*Matrix*/, alpha: number, uv: any[]|null): void {
       
		if (!this.checkTexture(tex)) {
            return;
        }
        this._nativeObj.save();
        this._nativeObj.globalAlpha = alpha;
        transform && this._nativeObj.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width || tex.width, height || tex.height, uv || (tex as any).uv);
        this._nativeObj.restore();  
    }
    translate(x: number, y: number): void {
        this._nativeObj.translate(x, y);
    }
    _transform(mat: any/*Matrix*/, pivotX: number, pivotY: number): void {
		this._nativeObj.translate(pivotX, pivotY);
		this._nativeObj.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
		this._nativeObj.translate(-pivotX, -pivotY);
	}
	_rotate(angle: number, pivotX: number, pivotY: number): void {
		this._nativeObj.translate(pivotX, pivotY);
		this._nativeObj.rotate(angle);
		this._nativeObj.translate(-pivotX, -pivotY);
	}
	_scale(scaleX: number, scaleY: number, pivotX: number, pivotY: number): void {
		this._nativeObj.translate(pivotX, pivotY);
		this._nativeObj.scale(scaleX, scaleY);
		this._nativeObj.translate(-pivotX, -pivotY);
	}
    _drawLine(x: number, y: number, fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(lineColor);
		this._nativeObj._drawLine(x, y, fromX, fromY, toX, toY, c1.numColor, lineWidth);
	}
    _drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(lineColor);
        this._nativeObj._drawLines(x, y, new Float32Array(points), c1.numColor, lineWidth);
    }
    _drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        this._nativeObj._drawCircle(x, y, radius, fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth);//TODO
    }
    _drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        this._nativeObj._drawPie(x, y, radius, startAngle, endAngle, fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth);//TODO
    }
    _drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        this._nativeObj._drawPoly(x, y, new Float32Array(points), fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth, isConvexPolygon);//TODO
    }
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {

        if (fillColor != null) {
            var c1: ColorUtils = ColorUtils.create(fillColor);
   
            this._nativeObj.save(); 
            this._nativeObj.fillStyle = c1.numColor;
            this._nativeObj.fillRect(x, y, width, height);
            this._nativeObj.restore();
        }
        if (lineColor != null) {         
            var c2: ColorUtils = ColorUtils.create(lineColor);
            this._nativeObj.save(); 
            this._nativeObj.strokeStyle = c2.numColor;
            this._nativeObj.lineWidth = lineWidth;//lineColor
            this._nativeObj.strokeRect(x, y, width, height);
            this._nativeObj.restore();
        }
    }
    _drawPath(x: number, y: number, paths: any[], brush: any, pen: any): void {
		//形成路径
		this._nativeObj.beginPath(false);
		//x += args[0], y += args[1];

		//var paths:Array = args[2];
		for (var i: number = 0, n: number = paths.length; i < n; i++) {

			var path: any[] = paths[i];
			switch (path[0]) {
				case "moveTo":
					this._nativeObj.moveTo(x + path[1], y + path[2]);
					break;
				case "lineTo":
					this._nativeObj.lineTo(x + path[1], y + path[2]);
					break;
				case "arcTo":
					this._nativeObj.arcTo(x + path[1], y + path[2], x + path[3], y + path[4], path[5]);
					break;
				case "closePath":
					this._nativeObj.closePath();
					break;
			}
		}

		//var brush:Object = args[3];
		if (brush != null) {
            var c1: ColorUtils = ColorUtils.create(brush.fillStyle);
			this._nativeObj.fillStyle = c1.numColor;
			this._nativeObj.fill();
		}

		//var pen:Object = args[4];
		if (pen != null) {
            var c2: ColorUtils = ColorUtils.create(pen.strokeStyle);
			this._nativeObj.strokeStyle = c2.numColor;
			this._nativeObj.lineWidth = pen.lineWidth || 1;
			this._nativeObj.lineJoin = pen.lineJoin;
			this._nativeObj.lineCap = pen.lineCap;
			this._nativeObj.miterLimit = pen.miterLimit;
			this._nativeObj.stroke();
		}
	}
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void {

        var c1: ColorUtils = ColorUtils.create(lineColor);

		this._nativeObj.beginPath(false);
		this._nativeObj.strokeStyle = c1.numColor;
		this._nativeObj.lineWidth = lineWidth;
		//var points:Array = args[2];
		//x += args[0], y += args[1];
		this._nativeObj.moveTo(x + points[0], y + points[1]);
		var i: number = 2, n: number = points.length;
		while (i < n) {
			this._nativeObj.quadraticCurveTo(x + points[i++], y + points[i++], x + points[i++], y + points[i++]);
		}
		this._nativeObj.stroke();
	}
    drawCanvas(canvas: any/*HTMLCanvas*/, x: number, y: number, width: number, height: number): void {
		if (!canvas) return;
        if (canvas instanceof(NativeWebGLCacheAsNormalCanvas)) {
            this._nativeObj.drawCanvasNormal(canvas._nativeObj.id, x, y, width, height);
        }
        else {
            this._nativeObj.drawCanvasBitmap(canvas.context._nativeObj.id, x, y, width, height);
        }
    }
    fillText(txt: any/*string | WordText*/, x: number, y: number, fontStr: string, color: string, align: string, lineWidth: number = 0, borderColor: string = ""): void {
		//Context._textRender!.filltext(this, txt, x, y, fontStr, color, borderColor, lineWidth, align);
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        if (typeof (txt) === 'string') {
            this._nativeObj.fillWords(txt, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
        else {
            this._nativeObj.fillWordText(txt._nativeObj.id, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
	}
	// 与fillText的区别是没有border信息
	drawText(text: any/*string | WordText*/, x: number, y: number, font: string, color: string, align: string): void {
		//Context._textRender!.filltext(this, text, x, y, font, color, null, 0, textAlign);
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        if (typeof (text) === 'string') {
            this._nativeObj.fillWords(text, x, y, font, c1.numColor, c2.numColor, 0, nTextAlign);
        }
        else {
            this._nativeObj.fillWordText(text._nativeObj.id, x, y, font, c1.numColor, c2.numColor, 0, nTextAlign);
        }
	}
	fillWords(words: any/*HTMLChar[]*/, x: number, y: number, fontStr: string, color: string): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        var length = words.length;
        for (var i = 0; i < length; i++) {
            this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, fontStr, c1.numColor, c2.numColor, 0, 0);
        }
		//Context._textRender!.fillWords(this, words, x, y, fontStr, color, null, 0);
	}
	strokeWord(text: any/*string | WordText*/, x: number, y: number, font: string, color: string, lineWidth: number, align: string): void {
		//Context._textRender!.filltext(this, text, x, y, font, null, color, lineWidth, textAlign);
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        if (typeof (text) === 'string') {
            this._nativeObj.fillWords(text, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
        else {
            this._nativeObj.fillWordText(text._nativeObj.id, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
	}
	fillBorderText(txt: any/*string | WordText*/, x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number, align: string): void {
		//Context._textRender!.filltext(this, txt, x, y, font, color, borderColor, lineWidth, textAlign);
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        if (typeof (txt) === 'string') {
            this._nativeObj.fillWords(txt, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
        else {
            this._nativeObj.fillWordText(txt._nativeObj.id, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
	}
	fillBorderWords(words: any/*HTMLChar[]*/, x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number): void {
		//Context._textRender!.fillWords(this, words, x, y, font, color, borderColor, lineWidth);
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        var length = words.length;
        for (var i = 0; i < length; i++) {
            this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, font, c1.numColor, c2.numColor, lineWidth, 0);
        }
	}
	fillWords11(words: any/*HTMLChar[]*/, x: number, y: number, fontStr: any/*FontInfo*/, color: string, strokeColor: string|null, lineWidth: number): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);
        var font = typeof (fontStr) === 'string' ? fontStr : (fontStr as any)._font;
        var length = words.length;
        for (var i = 0; i < length; i++) {
            this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, font, c1.numColor, c2.numColor, lineWidth, 0);
        }
		//Context._textRender!.fillWords(this, data, x, y, fontStr, color, strokeColor, lineWidth);
	}

	filltext11(data: any/*string | WordText*/, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, align: string): void {
		//Context._textRender!.filltext(this, data, x, y, fontStr, color, strokeColor, lineWidth, textAlign);
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = ILaya.Context.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);
        if (typeof (data) === 'string') {
            this._nativeObj.fillWords(data, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
        else {
            this._nativeObj.fillWordText(data._nativeObj.id, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
        }
	}

	/**@internal */
	_fast_filltext(data: any/*string | WordText*/, x: number, y: number, fontObj: any, color: string, strokeColor: string|null, lineWidth: number, textAlign: number, underLine: number = 0): void {
		//Context._textRender!._fast_filltext(this, data, null, x, y, (<FontInfo>fontObj), color, strokeColor, lineWidth, textAlign, underLine);

        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);
        
        if (typeof (data) === 'string') {
            this._nativeObj.fillWords(data, x, y, (fontObj as any)._font, c1.numColor, c2.numColor, lineWidth, textAlign);
        }
        else {
            this._nativeObj.fillWordText(data._nativeObj.id, x, y, (fontObj as any)._font, c1.numColor, c2.numColor, lineWidth, textAlign);
        }
	}
    drawTriangles(tex: any/*Texture*/, 
        x: number, y: number, 
        vertices: Float32Array, 
        uvs : Float32Array, 
        indices : Uint16Array, 
        matrix : any/*Matrix*/, alpha: number/*, color: ColorFilter*/, blendMode: string, colorNum: number = 0xffffffff): void {
		
            if (!this.checkTexture(tex)) {
                return;
            }
            if (blendMode != null) {
                this._nativeObj.save(); 
                this._nativeObj.glo = 16776961;//fillColor
                this._nativeObj.drawTriangles((tex as any).bitmap._texture.id, 
                    x, y, 
                    vertices, 
                    uvs, 
                    indices, 
                    matrix.a, matrix.b,matrix.c,matrix.d,matrix.tx,matrix.ty, alpha/*, color: ColorFilter*/, 0xffffffff);
                this._nativeObj.restore();
            }
            else {
                this._nativeObj.drawTriangles((tex as any).bitmap._texture.id, 
                x, y, 
                vertices, 
                uvs, 
                indices, 
                matrix.a, matrix.b,matrix.c,matrix.d,matrix.tx,matrix.ty, alpha/*, color: ColorFilter*/, 0xffffffff)
            }
        }
    drawMask(w: number, h: number): void {
        this._nativeObj.drawMask(w, h);
    }
    drawMasked(x: number, y: number, w: number, h: number): void {
        this._nativeObj.drawMasked(x, y, w, h);
    }
    drawMaskComposite(x: number, y: number, w: number, h: number): void {
        this._nativeObj.drawMaskComposite(x, y, w, h);
    }
    set asBitmap(value: boolean) {
        this._nativeObj.setAsBitmap(value);
    }
    size(w: number, h: number): void {
        this._nativeObj.size(w, h);
    }
    protected checkTexture(tex: any/*Texture*/): boolean {
        // 注意sprite要保存，因为后面会被冲掉
        var cs = this.sprite;
        if (!tex._getSource(function (): void {
            if (cs) {
                cs.repaint();	// 原来是calllater，callater对于cacheas normal是没有机会执行的
            }
        })) { //source内调用tex.active();
            return false;
        }
        return true;
    }
} 