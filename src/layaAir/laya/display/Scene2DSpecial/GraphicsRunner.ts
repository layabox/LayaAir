import { Bezier } from "../../maths/Bezier";
import { Matrix } from "../../maths/Matrix";
import { Point } from "../../maths/Point";
import { Vector4 } from "../../maths/Vector4";
import { BaseTexture } from "../../resource/BaseTexture";
import { Texture } from "../../resource/Texture";
import { Texture2D } from "../../resource/Texture2D";
import { BlendMode } from "../../webgl/canvas/BlendMode";
import { DrawStyle } from "../../webgl/canvas/DrawStyle";
import { Path } from "../../webgl/canvas/Path";
import { ISaveData } from "../../webgl/canvas/save/ISaveData";
import { SaveBase } from "../../webgl/canvas/save/SaveBase";
import { SaveStyle } from "../../webgl/canvas/save/SaveStyle";
import { SaveMark } from "../../webgl/canvas/save/SaveMark";
import { SaveTransform } from "../../webgl/canvas/save/SaveTransform";
import { SaveTranslate } from "../../webgl/canvas/save/SaveTranslate";
import { BasePoly } from "../../webgl/shapes/BasePoly";
import { Earcut } from "../../webgl/shapes/Earcut";
import { SubmitBase } from "../../webgl/submit/SubmitBase";
import { TextRender } from "../../webgl/text/TextRender";
import { Sprite } from "../Sprite";
import { IRenderGeometryElement } from "../../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { LayaGL } from "../../layagl/LayaGL";
import { MeshTopology } from "../../RenderEngine/RenderEnum/RenderPologyMode";
import { DrawType } from "../../RenderEngine/RenderEnum/DrawType";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { Texture2DArray } from "../../resource/Texture2DArray";
import { TextureArrayRegistry2D } from "../../webgl/utils/TextureArrayRegistry2D";
import { ITextureProcessor, EmptyTextureProcessor } from "../../large/ITextureProcessor";
import { GraphicsDefines } from "../../webgl/shader/d2/GraphicsDefines";

//const tmpuv1: number[] = [0, 0, 0, 0, 0, 0, 0, 0];
const tmpMat = new Matrix();
//var _clipResult = new Vector2();
let _drawTexToQuad_Index: Uint16Array | Uint32Array;
function getDrawTexToQuadIndex(): Uint16Array | Uint32Array {
    let arrayType = GraphicsDefines.GRAPHICS_INDEX_ARRAY_TYPE;
    if (!_drawTexToQuad_Index || (_drawTexToQuad_Index as any).constructor !== arrayType)
        _drawTexToQuad_Index = new arrayType([0, 2, 1, 0, 3, 2]);
    return _drawTexToQuad_Index;
}
//const tmpUVRect: number[] = [0, 0, 0, 0];

/** @ignore @blueprintIgnore */
export class GraphicsRunner {
	private _alpha = 1.0;

    private _fillStyle: DrawStyle = DrawStyle.DEFAULT;
    private _strokeStyle: DrawStyle = DrawStyle.DEFAULT;

    private static SEGNUM = 32;

    private _tempUV = new Float32Array(8);
    private _drawTriUseAbsMatrix = false;	// drawTriangles uses an absolute matrix; keep legacy patch behavior.

	private _other: ContextParams | null = null;

	private _path: Path | null = null;
	private _fillPathScratch: number[] = [];
	private _fillIndexScratch: number[] = [];
	private _drawState: SubmitBase = new SubmitBase();
	private _transedPoints: number[] = new Array(8);
	private _temp4Points: number[] = new Array(8);

	_textureProcessor: ITextureProcessor = new EmptyTextureProcessor();
    _matrixChanged = false;	//矩阵是否改变??
    _curMat: Matrix;
    _matBuffer: Float32Array = new Float32Array(6);

    //计算矩阵缩放的缓存
    _lastMatScaleX = 1.0;
    _lastMatScaleY = 1.0;
    private _lastMat_a = 1.0;
    private _lastMat_b = 0.0;
    private _lastMat_c = 0.0;
    private _lastMat_d = 1.0;
    _nBlendType = BlendMode.normal;
    _save: ISaveData[] & { _length?: number } = null;
    _saveMark: SaveMark | null = null;
    // private _shader2D = new Shader2D();	//

    /**
     * 所cacheAs精灵
     * 对于cacheas bitmap的情况，如果图片还没准备好，需要有机会重画，所以要保存sprite。例如在图片
     * 加载完成后，调用repaint
     */
    sprite: Sprite | null = null;

    _textRender: TextRender;
    _lastTex: Texture | null = null; //上次使用的texture。主要是给fillrect用，假装自己也是一个drawtexture

    _defTexture: Texture | null = null;	//给fillrect用

    constructor() {
        //_ib = IndexBuffer2D.QuadrangleIB;
        this._defTexture = new Texture(Texture2D.whiteTexture);
        // this._lastTex = this._defTexture;
        this._textRender = new TextRender(this);
        this._other = ContextParams.DEFAULT;
        this._curMat = Matrix.create();
        // this._charSubmitCache = new CharSubmitCache(this);
        //_vb = _vbs[0] = VertexBuffer2D.create( -1);
        // this._mesh = this._meshQuatTex;
        // this._mesh.clearMesh();
        this._save = [SaveMark.Create(this)];
        this._save.length = 10;
        this.clear();
        this.initDefalutMesh();
        // this._render2DManager = new RenderManager2D();
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

    transformByMatrix(matrix: Matrix, tx: number, ty: number): void {
        this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
    }

    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {
        var runner = this;

        //填充矩形
        if (fillColor != null) {
            runner.fillStyle = fillColor;
            runner.fillRect(x, y, width, height);
        }

        //绘制矩形边框
        if (lineColor != null) {
            runner.strokeStyle = lineColor;
            runner.lineWidth = lineWidth;
            runner.strokeRect(x, y, width, height);
        }
    }

    alpha(value: number): void {
        this.globalAlpha *= value;
    }

    /**@internal */
    _transform(mat: Matrix, pivotX: number, pivotY: number): void {
        this.translate(pivotX, pivotY);
        this.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
        this.translate(-pivotX, -pivotY);
    }

    /**@internal */
    _rotate(angle: number, pivotX: number, pivotY: number): void {
        this.translate(pivotX, pivotY);
        this.rotate(angle);
        this.translate(-pivotX, -pivotY);
    }

    /**@internal */
    _scale(scaleX: number, scaleY: number, pivotX: number, pivotY: number): void {
        this.translate(pivotX, pivotY);
        this.scale(scaleX, scaleY);
        this.translate(-pivotX, -pivotY);
    }

    /**@internal */
    _drawLine(x: number, y: number, fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): void {
        this.beginPath();
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        this.moveTo(x + fromX, y + fromY);
        this.lineTo(x + toX, y + toY);
        this.stroke();
    }

    /**@internal */
    _drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): void {
        this.beginPath();
        //x += args[0], y += args[1];
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        //var points:Array = args[2];
        this.addPath(points, false, false, x, y);
        this.stroke();
    }

    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void {
        this.beginPath();
        this.strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        //var points:Array = args[2];
        //x += args[0], y += args[1];
        this.moveTo(x + points[0], y + points[1]);
        var i = 2, n = points.length;
        while (i < n) {
            this.quadraticCurveTo(x + points[i++], y + points[i++], x + points[i++], y + points[i++]);
        }
        this.stroke();
    }

    private _fillAndStroke(fillColor: string, strokeColor: string, lineWidth: number, isConvexPolygon = false): void {
        //绘制填充区域
        if (fillColor != null) {
            this.fillStyle = fillColor;
            this.fill();
        }

        //绘制边框
        if (strokeColor != null && lineWidth > 0) {
            this.strokeStyle = strokeColor;
            this.lineWidth = lineWidth;
            this.stroke();
        }
    }
    /**@internal */
    _drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        this.beginPath(true);
        this.arc(x, y, radius, radius, 0, 2 * Math.PI, false, true, 40);
        this.closePath();
        //绘制
        this._fillAndStroke(fillColor, lineColor, lineWidth);
    }
    /**@internal */
    _drawEllipse(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number) {
        this.beginPath(true);
        this.arc(x, y, width, height, 0, 2 * Math.PI, false, true, 40);
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth);
    }
    /**@internal */
    _drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any, lineWidth: number, minNum = 20, segPixel = 5) {
        if (width <= 0) return;
        if (height <= 0) return;
        //当宽高小于一定程度的时候,面积就是0了,这里不好判断什么时候是0,直接采用下面的当起始角度>终止角度时不画就行.
        this.beginPath(true);
        var tPath = this._getPath();
        if (0 >= lt) {
            tPath.addPoint(x, y);
        } else {
            //左上角
            let st = Math.PI;
            let ed = 1.5 * Math.PI;
            if (width < lt + rt) {
                //需要裁剪
                //根据比例分配裁剪
                let dxlt = lt * (lt + rt - width) / (lt + rt);
                //计算交点,统一在第一象限算
                let hity = Math.sqrt(lt * lt - dxlt * dxlt);
                //根据交点计算角度
                let ang = Math.atan2(hity, dxlt);
                let dAng = 0.5 * Math.PI - ang;
                ed -= dAng;
            }
            if (height < lt + lb) {
                //需要裁剪
                let dylt = lt * (lt + lb - height) / (lt + lb);
                let hitx = Math.sqrt(lt * lt - dylt * dylt);
                let ang = Math.atan2(dylt, hitx);
                st += ang;
            }
            if (st > ed) {
                //tPath.addPoint(x, y);
            } else {
                this.arc(x + lt, y + lt, lt, lt, st, ed, false, true, minNum, segPixel);
            }
        }
        let startX = x + width - rt;
        if (0 >= rt) {
            tPath.addPoint(startX, y);
        } else {
            //右上角
            let st = 1.5 * Math.PI;
            let ed = 2 * Math.PI;
            if (width < lt + rt) {
                //需要裁剪
                //根据比例分配裁剪
                let dxlt = rt * (lt + rt - width) / (lt + rt);
                //计算交点,统一在第一象限算
                let hity = Math.sqrt(lt * lt - dxlt * dxlt);
                //根据交点计算角度
                let ang = Math.atan2(hity, dxlt);
                let dAng = 0.5 * Math.PI - ang;
                st += dAng;
            }
            if (height < rt + rb) {
                //需要裁剪
                let dyrt = rt * (rt + rb - height) / (rt + rb);
                let hitx = Math.sqrt(rt * rt - dyrt * dyrt);
                let ang = Math.atan2(dyrt, hitx);
                ed -= ang;
            }
            if (st > ed) {
                //tPath.addPoint(startX, y);
            } else {
                this.arc(startX, y + rt, rt, rt, st, ed, false, true, minNum, segPixel);
            }
        }
        startX = x + width - rb;
        let startY = y + height - rb;
        if (0 >= rb) {
            tPath.addPoint(startX, startY);
        } else {
            //右下角
            let st = 0;
            let ed = 0.5 * Math.PI;
            if (width < lb + rb) {
                //需要裁剪
                //根据比例分配裁剪
                let dxlb = rb * (lb + rb - width) / (lb + rb);
                //计算交点,统一在第一象限算
                let hity = Math.sqrt(lb * lb - dxlb * dxlb);
                //根据交点计算角度
                let ang = Math.atan2(hity, dxlb);
                let dAng = 0.5 * Math.PI - ang;
                ed -= dAng;
            }
            if (height < rt + rb) {
                //需要裁剪
                let dyrt = rb * (rt + rb - height) / (rt + rb);
                let hitx = Math.sqrt(rb * rb - dyrt * dyrt);
                let ang = Math.atan2(dyrt, hitx);
                st += ang;
            }
            if (st > ed) {
                //tPath.addPoint(startX, startY);
            } else {
                this.arc(startX, startY, rb, rb, st, ed, false, true, minNum, segPixel);
            }
        }
        startX = x + lb;
        startY = y + height - lb;
        if (0 >= lb) {
            tPath.addPoint(startX, startY);
        } else {
            let st = 0.5 * Math.PI;
            let ed = Math.PI;
            if (width < lb + rb) {
                //需要裁剪
                //根据比例分配裁剪
                let dxlb = rb * (lb + rb - width) / (lb + rb);
                //计算交点,统一在第一象限算
                let hity = Math.sqrt(lb * lb - dxlb * dxlb);
                //根据交点计算角度
                let ang = Math.atan2(hity, dxlb);
                let dAng = 0.5 * Math.PI - ang;
                st += dAng;
            }
            if (height < lt + lb) {
                //需要裁剪
                let dylt = lb * (lt + lb - height) / (lt + lb);
                let hitx = Math.sqrt(lb * lb - dylt * dylt);
                let ang = Math.atan2(dylt, hitx);
                ed -= ang;
            }
            if (st > ed) {
                //tPath.addPoint(startX, startY);
            } else {
                this.arc(startX, startY, lb, lb, st, ed, false, true, minNum, segPixel);
            }
        }
        //tPath.addPoint(x, y + lt);  这个是干什么的,不要了
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth);
    }

    //矢量方法	
    /**@internal */
    _drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        //移动中心点
        //ctx.translate(x + args[0], y + args[1]);
        //形成路径
        this.beginPath();
        this.moveTo(x, y);
        this.arc(x, y, radius, radius, startAngle, endAngle);
        this.closePath();
        //绘制
        this._fillAndStroke(fillColor, lineColor, lineWidth);
        //恢复中心点
        //ctx.translate(-x - args[0], -y - args[1]);
    }

    /**@internal */
    _drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): void {
        //var points:Array = args[2];
        this.beginPath();
        //poly一定是close的
        this.addPath(points, true, isConvexPolygon, x, y);
        this.closePath();
        this._fillAndStroke(fillColor, lineColor, lineWidth, isConvexPolygon);
    }

    /**@internal */
    _drawPath(x: number, y: number, paths: any[], brush: any, pen: any): void {
        //形成路径
        this.beginPath();
        //x += args[0], y += args[1];

        //var paths:Array = args[2];
        for (var i = 0, n = paths.length; i < n; i++) {

            var path: any[] = paths[i];
            switch (path[0]) {
                case "moveTo":
                    this.moveTo(x + path[1], y + path[2]);
                    break;
                case "lineTo":
                    this.lineTo(x + path[1], y + path[2]);
                    break;
                case "arcTo":
                    this.arcTo(x + path[1], y + path[2], x + path[3], y + path[4], path[5]);
                    break;
                case "closePath":
                    this.closePath();
                    break;
            }
        }

        //var brush:Object = args[3];
        if (brush != null) {
            this.fillStyle = brush.fillStyle;
            this.fill();
        }

        //var pen:Object = args[4];
        if (pen != null) {
            this.strokeStyle = pen.strokeStyle;
            this.lineWidth = pen.lineWidth || 1;
            this.lineJoin = pen.lineJoin;
            this.lineCap = pen.lineCap;
            this.miterLimit = pen.miterLimit;
            this.stroke();
        }
    }

    // /**
    //  * 释放占用内存
    //  */
    // private _releaseMem(): void {
    //     this._curMat && this._curMat.destroy();
    //     this._curMat = null;
    //     this._shader2D.destroy();
    //     this._shader2D = null;
    //     // this._charSubmitCache.clear();
    //     this._path = null;
    //     this._save = null;
    //     this.sprite = null;
    // }

    /**
     * 释放所有资源
     */
    destroy(): void {
        this.sprite = null;
        this._path = null;
        this._save = null;
    }

	clear(): void {
		this._drawState.clear();
		this._curMat.identity();
		this._matrixChanged = false;
		this._other = ContextParams.DEFAULT;
		this._other.clear();
        this._alpha = 1.0;
        this._nBlendType = BlendMode.normal;
        this._fillStyle = this._strokeStyle = DrawStyle.DEFAULT;
        this._lastTex = null;
        this._saveMark = <SaveMark>this._save[0];
        this._save._length = 1;
    }

    /**
     * @zh 获取当前的 X 方向缩放
     * @returns 当前的 X 方向缩放
     * @en Get the current X-axis scaling
     * @returns The current X-axis scaling
     */
    getCurrentScaleX(): number {
        let scaleX = this.getMatScaleX();
        if (this.sprite && this.sprite.globalTrans) {
            const matrix = this.sprite.globalTrans.getMatrix();
            // 列向量长度，使用矩阵第一列向量的模长 sqrt(a² + b²)，避免旋转影响
            scaleX *= Math.hypot(matrix.a, matrix.b);
        }
        return Math.abs(scaleX);  // 取绝对值，防止负缩放导致错误
    }
    /**
     * @zh 获取当前的 Y 方向缩放
     * @returns 当前的 Y 方向缩放
     * @en Get the current Y-axis scaling
     * @returns The current Y-axis scaling
     */
    getCurrentScaleY(): number {
        let scaleY = this.getMatScaleY();
        if (this.sprite && this.sprite.globalTrans) {
            const matrix = this.sprite.globalTrans.getMatrix();
            // 列向量长度，使用矩阵第二列向量的模长 sqrt(c² + d²)，避免旋转影响
            scaleY *= Math.hypot(matrix.c, matrix.d);
        }
        return Math.abs(scaleY);
    }

    /**
     * 获得当前矩阵的缩放值
     * 避免每次都计算getScaleX
     * @return
     */
    getMatScaleX(): number {
        if (this._lastMat_a === this._curMat.a && this._lastMat_b === this._curMat.b)
            return this._lastMatScaleX;
        this._lastMatScaleX = this._curMat.getScaleX();
        this._lastMat_a = this._curMat.a;
        this._lastMat_b = this._curMat.b;
        return this._lastMatScaleX;
    }

    getMatScaleY(): number {
        if (this._lastMat_c === this._curMat.c && this._lastMat_d === this._curMat.d)
            return this._lastMatScaleY;
        this._lastMatScaleY = this._curMat.getScaleY();
        this._lastMat_c = this._curMat.c;
        this._lastMat_d = this._curMat.d;
        return this._lastMatScaleY;
    }

	set fillStyle(value: any) {
		if (!this._fillStyle.equal(value)) {
			SaveStyle.save(this, "fillStyle");
			this._fillStyle = DrawStyle.create(value);
		}
	}

    get fillStyle(): any {
        return this._fillStyle;
    }

    set globalAlpha(value: number) {
        value = Math.floor(value * 1000) / 1000;
        if (value != this._alpha) {
            SaveBase.save(this, SaveBase.TYPE_ALPHA, this, false);
            this._alpha = value;
        }
    }

    get globalAlpha(): number {
        return this._alpha;
    }

    set textAlign(value: string) {
        (this._other.textAlign === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTALIGN, this._other, false), this._other.textAlign = value);
    }

    get textAlign(): string {
        return this._other.textAlign;
    }

    set textBaseline(value: string) {
        (this._other.textBaseline === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_TEXTBASELINE, this._other, false), this._other.textBaseline = value);
    }

    get textBaseline(): string {
        return this._other.textBaseline;
    }

	set globalCompositeOperation(value: BlendMode) {
		value == null || (this._nBlendType === value) || (SaveBase.save(this, SaveBase.TYPE_GLOBALCOMPOSITEOPERATION, this, true), this._drawState.clear(), this._nBlendType = value /*, _shader2D.ALPHA = 1*/);
	}

    get globalCompositeOperation(): BlendMode {
        return this._nBlendType;
    }

	set strokeStyle(value: any) {
		this._strokeStyle.equal(value) || (SaveStyle.save(this, "strokeStyle"), this._strokeStyle = DrawStyle.create(value));
	}

    get strokeStyle(): any {
        return this._strokeStyle;
    }

    translate(x: number, y: number): void {
        if (x !== 0 || y !== 0) {
            SaveTranslate.save(this);
            if (this._curMat._bTransform) {
                SaveTransform.save(this);
                //translate的话，相当于在当前坐标系下移动x,y，所以直接修改_curMat,然后x,y就消失了。
                this._curMat.tx += (x * this._curMat.a + y * this._curMat.c);
                this._curMat.ty += (x * this._curMat.b + y * this._curMat.d);
            } else {
                this._curMat.tx = x;
                this._curMat.ty = y;
            }
            this._matrixChanged = true;
        }
    }

    set lineWidth(value: number) {
        (this._other.lineWidth === value) || (this._other = this._other.make(), SaveBase.save(this, SaveBase.TYPE_LINEWIDTH, this._other, false), this._other.lineWidth = value);
    }

    get lineWidth(): number {
        return this._other.lineWidth;
    }

    save(): void {
        this._save[this._save._length++] = SaveMark.Create(this);
    }

    restore(): void {
        var sz = this._save._length;
        var lastBlend = this._nBlendType;
        if (sz < 1)
            return;
        for (var i = sz - 1; i >= 0; i--) {
            var o: ISaveData = this._save[i];
            o.restore(this);
            if (o.isSaveMark()) {
                this._save._length = i;
                return;
            }
        }
        if (lastBlend != this._nBlendType) {
            //阻止合并
            // this.stopMerge = true;
            this.breakNextMerge();
        }
    }

	private _fillRect(x: number, y: number, width: number, height: number, rgba: number): void {
		this.transformQuad(x, y, width, height, 0, this._curMat, this._transedPoints);
		if (!this.clipedOff(this._transedPoints)) {
			let submit = this._resetDrawState();
			submit._key.other = -1;
		}
	}

    fillRect(x: number, y: number, width: number, height: number, fillStyle: any = null): void {
        var drawstyle: DrawStyle = fillStyle ? DrawStyle.create(fillStyle) : this._fillStyle;
        //var rgb = drawstyle.toInt() ;
        //由于显卡的格式是 rgba，所以需要处理一??
        //var rgba:uint = ((rgb & 0xff0000) >> 16) | (rgb & 0x00ff00) | ((rgb & 0xff) << 16) | (_shader2D.ALPHA * 255) << 24;
        var rgba = this.mixRGBandAlpha(drawstyle._color.numColor);
        this._fillRect(x, y, width, height, rgba);
    }

    fillTexture(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: number): void {
        if (!this._getImageSource(texture)) {
            return;
        }
        this._fillTexture(texture, texture.width, texture.height, texture.uvrect, x, y, width, height, type, offset.x, offset.y, color);
    }

	/**@internal */
	private _fillTexture(texture: Texture, texw: number, texh: number, texuvRect: number[], x: number, y: number, width: number, height: number, type: string, offsetx: number, offsety: number, color: number): void {
		var repeatx = true;
        var repeaty = true;
        switch (type) {
            case "repeat": break;
            case "repeat-x": repeaty = false; break;
            case "repeat-y": repeatx = false; break;
            case "no-repeat": repeatx = repeaty = false; break;
            default: break;
        }
        //用 _temp4Points 来存计算出来的顶点的uv。这里的uv用0到1表示纹理的uv区域。这样便于计算，直到shader中才真的转成了实际uv
        var uv: any[] = this._temp4Points;
        var stu = 0; //uv起点
        var stv = 0;
        var stx = 0, sty = 0, edx = 0, edy = 0;
        if (offsetx < 0) {
            stx = x;
            stu = (-offsetx % texw) / texw;//有偏移的情况下的u不是从头开始
        } else {
            stx = x + offsetx;
        }
        if (offsety < 0) {
            sty = y;
            stv = (-offsety % texh) / texh;//有偏移的情况下的v不是从头开始
        } else {
            sty = y + offsety;
        }

        edx = x + width;
        edy = y + height;
        (!repeatx) && (edx = Math.min(edx, x + offsetx + texw));//x不重复的话，最多只画一个
        (!repeaty) && (edy = Math.min(edy, y + offsety + texh));//y不重复的话，最多只画一个
        if (edx < x || edy < y)
            return;
        if (stx > edx || sty > edy)
            return;


        //计算最大uv
        var edu = (edx - x - offsetx) / texw;
        var edv = (edy - y - offsety) / texh;

        this.transformQuad(stx, sty, edx - stx, edy - sty, 0, this._curMat, this._transedPoints);

        //四个点对应的uv。必须在transformQuad后面，因为共用了_temp4Points
		uv[0] = stu; uv[1] = stv; uv[2] = edu; uv[3] = stv; uv[4] = edu; uv[5] = edv; uv[6] = stu; uv[7] = edv;
		if (!this.clipedOff(this._transedPoints)) {
            //不依赖于wrapmode了，都走filltexture流程，自己修改纹理坐标
            //tex2d.wrapModeU = BaseTexture.WRAPMODE_REPEAT;	//这里会有重复判断
            //tex2d.wrapModeV = BaseTexture.WRAPMODE_REPEAT;
            //var rgba:int = mixRGBandAlpha(0xffffffff);
            //rgba = _mixRGBandAlpha(rgba, alpha);	这个函数有问题，不能连续调用，输出作为输入
			let submit = this._resetDrawState();
			let material = submit;
            // var sv = Value2D.create(RenderSpriteData.Texture2D) as TextureSV;
            //这个优化先不要了，因为没太弄明白wrapmode的设置，总是不起作用。
            //if(texture.uvrect[2]<1.0||texture.uvrect[3]<1.0)//这表示是大图集中的一部分，只有这时候才用特殊shader
            material.fillTexture = true;
            Vector4.TEMP.setValue(texuvRect[0], texuvRect[1], texuvRect[2], texuvRect[3]);
            material.u_TexRange = Vector4.TEMP;

			submit.textureHost = texture;
			// this._curSubmit._numEle += 6;
		}
		this.breakNextMerge();
	}

	private _resetDrawState(): SubmitBase {
		let submit = this._drawState;
		submit.clear();
		submit.update(this);
		return submit;
	}

    drawTexture(tex: Texture, x: number, y: number, width: number, height: number, color = 0xffffffff): void {
        this._drawTextureM(tex, x, y, width, height, null, 1, null, color);
    }

    drawTextures(tex: Texture, pos: ArrayLike<number>, tx: number, ty: number, colors: number[]): void {
        if (!this._getImageSource(tex)) { //source内调用tex.active();
            return;
        }

        //TODO 还没实现
        var n = pos.length / 2;
        var ipos = 0;
        var bmpid = (tex.bitmap as Texture2D).id;
        for (var i = 0; i < n; i++) {
            const color = typeof colors[i] === 'number' ? colors[i] : 0xffffffff;
            this._inner_drawTexture(tex, bmpid, pos[ipos++] + tx, pos[ipos++] + ty, 0, 0, null, null, 1.0, color);
        }
    }

    /**@internal */
    _drawTextureM(tex: Texture, x: number, y: number, width: number, height: number, m: Matrix, alpha: number, uv: any[] | null, color: number): boolean {
        // 注意sprite要保存，因为后面会被冲掉
        if (!this._getImageSource(tex)) { //source内调用tex.active();
            return false;
        }
        return this._inner_drawTexture(tex, (tex.bitmap as Texture2D).id, x, y, width, height, m, uv, alpha, color);
    }

    /**
     * @internal
     * @param tex {Texture | RenderTexture }
     * @param  imgid 图片id用来比较合并的
     * @param x
     * @param y
     * @param width
     * @param height
     * @param m
     * @param alpha
     * @param uv
     * @return
     */
    _inner_drawTexture(tex: Texture | BaseTexture, imgid: number, x: number, y: number, width: number, height: number, m: Matrix | null, uv: ArrayLike<number> | null, alpha: number, color: number,
        italicDeg?: number, pixelSnap?: boolean): boolean {
		width = width || tex.width;
		height = height || tex.height;
        if (width <= 0 || height <= 0) {
            return false;
        }
        if (italicDeg == null)
            italicDeg = 0;
		var submit = this._drawState;
		var preKey = submit._key;
        uv = uv || (tex as Texture)._uv
		// Rotated, skewed, italic, or snapped quads still need the generic geometry path.
		// var ops: any[] = lastRender ? this._charSubmitCache.getPos() : this._transedPoints;
        var ops = this._transedPoints;

        //凡是这个都是在_mesh上操作，不用考虑samekey
        this.transformQuad(x, y, width, height, italicDeg, m || this._curMat, ops);

        if (pixelSnap) {
            var round: Function = Math.round;
            ops[0] = round(ops[0]);//  (ops[0] + 0.5) | 0;	// 这么计算负的时候会有问题
            ops[1] = round(ops[1]);
            ops[2] = round(ops[2]);
            ops[3] = round(ops[3]);
            ops[4] = round(ops[4]);
            ops[5] = round(ops[5]);
            ops[6] = round(ops[6]);
            ops[7] = round(ops[7]);
        }

        //lastRender = false;
        // if (lastRender) {
        //     this._charSubmitCache.add(this, tex as Texture, imgid, ops, uv, rgba);
        //     return true;
        // }

		//this._drawCount++;
		let sameKey = (
			imgid >= 0
			// && preKey.submitType === SubmitBase.KEY_DRAWTEXTURE
			&& preKey.other === imgid
			&& preKey.blendShader === this._nBlendType
		)
		// && this._curSubmit.material == this._material

        // if (mesh.vertexNum + 4 > GraphicsRunner._MAXVERTNUM) {
        //     // this._drawToRender2D(this._curSubmit);
        //     mesh = this._graphicsData.createMesh("quat") as MeshQuadTexture;
        //     sameKey = false;
        // }

        this._lastTex = tex as Texture;

        if (!sameKey) {
            // todo
			submit = this._resetDrawState();
            let material = submit;
            // let shaderValue = Value2D.create(RenderSpriteData.Texture2D);
            // 如果外部已注册到数组纹理，替换材质与合批键，并设置层索引
            let reg = TextureArrayRegistry2D.resolve(tex);
            if (reg && reg.array instanceof Texture2DArray) {
                material.textureHost = reg.array;
                // 记录层索引，用于 a_attribFlags.b
                material.texArrayLayer = reg.layer | 0;
                // 使用数组纹理的 id 作为合批键，避免与原单纹理冲突
                // @ts-ignore
                submit._key.other = reg.array.id;
            } else {
                material.textureHost = tex;
                submit._key.other = imgid;
            }
        }
		// submit._numEle += 6;
		return true;
	}

    // private fillShaderValue(material: SubmitBase) {
    //     // shaderValue.size = new Vector2(this._width, this._height);
    // }
    /**
     * pt所描述的多边形完全在clip外边，整个被裁掉了
     * @param pt
     * @return
     */
    private clipedOff(pt: any[]): boolean {
        return false;
    }

    /**
     * 应用当前矩阵。把转换后的位置放到输出数组中。 
     * @param x
     * @param y
     * @param w
     * @param h
     * @param   italicDeg 倾斜角度，单位是度。0度无，目前是下面不动。以后要做成可调的
     */
    private transformQuad(x: number, y: number, w: number, h: number, italicDeg: number, m: Matrix, out: number[]): void {
        var xoff = 0;
        if (italicDeg != 0) {
            xoff = Math.tan(italicDeg * Math.PI / 180) * h;
        }
        var maxx = x + w; var maxy = y + h;

        var tx = m.tx;
        var ty = m.ty;
        var ma = m.a;
        var mb = m.b;
        var mc = m.c;
        var md = m.d;
        var a0 = x + xoff;
        var a1 = y;
        var a2 = maxx + xoff;
        var a3 = y;
        var a4 = maxx;
        var a5 = maxy;
        var a6 = x;
        var a7 = maxy;

        if (
            m !== this._curMat
            || this._matrixChanged
        ) {
            if (m._bTransform) {
                out[0] = a0 * ma + a1 * mc + tx; out[1] = a0 * mb + a1 * md + ty;
                out[2] = a2 * ma + a3 * mc + tx; out[3] = a2 * mb + a3 * md + ty;
                out[4] = a4 * ma + a5 * mc + tx; out[5] = a4 * mb + a5 * md + ty;
                out[6] = a6 * ma + a7 * mc + tx; out[7] = a6 * mb + a7 * md + ty;
            } else {
                out[0] = a0 + tx; out[1] = a1 + ty;
                out[2] = a2 + tx; out[3] = a3 + ty;
                out[4] = a4 + tx; out[5] = a5 + ty;
                out[6] = a6 + tx; out[7] = a7 + ty;
            }
            /* 旋转的情况下这个是错的。TODO
            let dx = out[2] - out[0];
            let minw = 1;	// 限制最小宽度为1，防止细线在缩小的情况下消失。
            if (dx < minw) {
                dx = minw - dx;
                out[2] += dx;
            }
            dx = out[4] - out[6];
            if (dx < minw) {
                dx = minw - dx;
                out[4] += dx;
            }
            */
        } else {
            out[0] = a0; out[1] = a1;
            out[2] = a2; out[3] = a3;
            out[4] = a4; out[5] = a5;
            out[6] = a6; out[7] = a7;
        }
    }

    /**
     * 强制拒绝submit合并
     * 例如切换rt的时候
     */
	breakNextMerge(): void {
		// this.stopMerge = true;
		this._drawState.clear();
	}

	_getSubmitKeyOther(): number {
		return this._drawState._key.other;
	}

	_setSubmitKeyOther(value: number): void {
		this._drawState._key.other = value;
	}

    drawTextureWithTransform(tex: Texture, x: number, y: number, width: number, height: number, transform: Matrix | null, tx: number, ty: number, alpha: number, blendMode: BlendMode | string | null, uv?: number[], color = 0xffffffff): void {
        var oldcomp: BlendMode;
        var curMat = this._curMat;
        if (blendMode != null) {
            if (typeof blendMode == "string")
                blendMode = BlendMode[blendMode as keyof typeof BlendMode] ?? (blendMode === "destination-out" ? BlendMode.destinationOut : 0);
            oldcomp = this.globalCompositeOperation;
            this.globalCompositeOperation = blendMode as BlendMode;
        }

        if (!transform) {
            this._drawTextureM(tex, x + tx, y + ty, width, height, curMat, alpha, uv, color);
            if (blendMode != null)
                this.globalCompositeOperation = oldcomp;
            return;
        }

        //克隆transform,因为要应用tx，ty，这里不能修改原始的transform
        tmpMat.a = transform.a; tmpMat.b = transform.b; tmpMat.c = transform.c; tmpMat.d = transform.d; tmpMat.tx = transform.tx + tx; tmpMat.ty = transform.ty + ty;
        tmpMat._checkTransform();

        if (transform && curMat._bTransform) {
            // 如果当前矩阵不是只有平移，则只能用mul的方式
            Matrix.mul(tmpMat, curMat, tmpMat);
            tmpMat._checkTransform();
            transform = tmpMat;
        } else {
            //如果curmat没有旋转。
            tmpMat.tx += curMat.tx;
            tmpMat.ty += curMat.ty;
            transform = tmpMat;
        }
        this._drawTextureM(tex, x, y, width, height, transform, alpha, uv, color);
        if (blendMode != null)
            this.globalCompositeOperation = oldcomp;
    }

    drawTriangles(tex: Texture | BaseTexture,
        x: number, y: number,
        vertices: Float32Array,
        uvs: Float32Array,
        indices: ArrayLike<number>,
        matrix?: Matrix, alpha?: number,
        blendMode?: BlendMode | string,
        colorNum?: number,
        colors?: Float32Array,
        uvRange?: ArrayLike<number>): void {

        if (tex) {
            if (!this._getImageSource(tex)) { //source内调用tex.active();
                return;
            }
        }

        if (alpha == null) alpha = 1.0;
        if (colorNum == null) colorNum = 0xffffffff;

        let oldcomp: BlendMode | null = null;
        if (blendMode != null) {
            if (typeof blendMode == "string")
                blendMode = BlendMode[blendMode as keyof typeof BlendMode] ?? (blendMode === "destination-out" ? BlendMode.destinationOut : 0);
            oldcomp = this.globalCompositeOperation;
            this.globalCompositeOperation = blendMode as BlendMode;
        }

        let vertexCount = vertices.length / 2;
        if (vertexCount <= 0 || indices.length <= 0) {
            if (blendMode != null)
                this.globalCompositeOperation = oldcomp!;
            return;
        }

        var webGLImg = tex instanceof Texture ? tex.bitmap : tex;
        let submit = this._drawState;
        var preKey = submit._key;
        var sameKey = (!webGLImg || preKey.other === webGLImg.id)
            && preKey.blendShader === this._nBlendType;

        if (!sameKey) {
            submit = this._resetDrawState();
            let reg = TextureArrayRegistry2D.resolve(tex);
            if (reg && reg.array instanceof Texture2DArray) {
                submit.textureHost = reg.array;
                submit.texArrayLayer = reg.layer | 0;
            } else {
                submit.textureHost = tex;
            }
            submit._key.other = reg ? reg.array.id : (webGLImg?.id ?? -1);
        }

        var rgba = this._mixRGBandAlpha(colorNum, this._alpha * alpha);
        if (!this._drawTriUseAbsMatrix) {
            if (!matrix) {
                tmpMat.a = 1; tmpMat.b = 0; tmpMat.c = 0; tmpMat.d = 1; tmpMat.tx = x; tmpMat.ty = y;
            } else {
                tmpMat.a = matrix.a; tmpMat.b = matrix.b; tmpMat.c = matrix.c; tmpMat.d = matrix.d; tmpMat.tx = matrix.tx + x; tmpMat.ty = matrix.ty + y;
            }
            Matrix.mul(tmpMat, this._curMat, tmpMat);
            tmpMat._checkTransform();
        }
        else {
            let m = this._curMat == matrix ? (this._matrixChanged ? this._curMat : null) : matrix;
        }

        if (blendMode != null)
            this.globalCompositeOperation = oldcomp!;
    }

    transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
        SaveTransform.save(this);
        Matrix.mul(Matrix.TEMP.setTo(a, b, c, d, tx, ty), this._curMat, this._curMat);	//TODO 这里会有效率问题。一堆的set
        this._curMat._checkTransform();
        this._matrixChanged = true;
    }

    rotate(angle: number): void {
        SaveTransform.save(this);
        this._curMat.rotateEx(angle);
        this._matrixChanged = true;
    }

    scale(scaleX: number, scaleY: number): void {
        SaveTransform.save(this);
        this._curMat.scaleEx(scaleX, scaleY);
        this._matrixChanged = true;
    }

    beginPath(convex = false): void {
        this._getPath().beginPath(convex);
    }

    closePath(): void {
        this._path.closePath();
    }

    /**
     * 添加一个path??
     * @param points [x,y,x,y....]	这个会被保存下来，所以调用者需要注意复制。
     * @param close	是否闭合
     * @param   convex 是否是凸多边形。convex的优先级是这个最大。fill的时候的次之。其实fill的时候不应该指定convex，因为可以多个path
     * @param dx  需要添加的平移。这个需要在应用矩阵之前应用。
     * @param dy
     */
	addPath(points: ArrayLike<number>, close: boolean, convex: boolean, dx: number, dy: number): void {
		let sz = points.length;
		let owned = new Array<number>(sz + ((close && sz > 5 && (points[sz - 2] != points[0] || points[sz - 1] != points[1])) ? 2 : 0));
		for (let i = 0; i < sz - 1; i += 2) {
			owned[i] = points[i] + dx;
			owned[i + 1] = points[i + 1] + dy;
		}
		if (owned.length > sz) {
			owned[sz] = owned[0];
			owned[sz + 1] = owned[1];
		}
		this._getPath().pushOwned(owned, convex);
	}

    fill(): void {
        var tPath = this._getPath();
        var submit = this._resetDrawState();

        var rgba = this.mixRGBandAlpha(this._fillStyle._color.numColor);
        var idx: any[];
        let m = this._curMat;

        for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
            var p = tPath.paths[i];
            var vertNum = p.path.length / 2;
            if (vertNum < 3 || (vertNum === 3 && !p.convex))
                continue;

            let sourcePath: number[] = p.path;
            let cpath = this._fillPathScratch;
            cpath.length = sourcePath.length;

            let xp: number, yp: number;
            let _x: number, _y: number;
            if (this._matrixChanged) {
                if (m._bTransform) {
                    for (let pi = 0; pi < vertNum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        _x = sourcePath[xp];
                        _y = sourcePath[yp];
                        cpath[xp] = m.a * _x + m.c * _y + m.tx;
                        cpath[yp] = m.b * _x + m.d * _y + m.ty;
                    }
                } else {
                    for (let pi = 0; pi < vertNum; pi++) {
                        xp = pi << 1;
                        yp = xp + 1;
                        cpath[xp] = sourcePath[xp] + m.tx;
                        cpath[yp] = sourcePath[yp] + m.ty;
                    }
                }
            } else {
                for (let pi = 0; pi < sourcePath.length; pi++)
                    cpath[pi] = sourcePath[pi];
            }

            if (p.convex) {
                var faceNum = vertNum - 2;
                idx = this._fillIndexScratch;
                idx.length = faceNum * 3;
                var idxpos = 0;
                for (var fi = 0; fi < faceNum; fi++) {
                    idx[idxpos++] = 0;
                    idx[idxpos++] = fi + 1;
                    idx[idxpos++] = fi + 2;
                }
            }
            else {
                idx = Earcut.earcut(cpath, null, 2);
            }
        }
    }
    stroke(): void {
        if (this.lineWidth <= 0)
            return;
        var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
        var tPath = this._getPath();
        var submit = this._resetDrawState();
        let matrix = this._matrixChanged ? this._curMat : null;

        for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
            var p: any = tPath.paths[i];
            if (p.path.length <= 0)
                continue;
            let lineGeometry = BasePoly.createLine2Geometry(p.path, this.lineWidth, p.loop);
            if (!lineGeometry)
                continue;
        }
    }
    moveTo(x: number, y: number): void {
        var tPath: Path = this._getPath();
        tPath.newPath();
        tPath._lastOriX = x;
        tPath._lastOriY = y;
        tPath.addPoint(x, y);
    }

    /**
     * 
     * @param x
     * @param y
     */
    lineTo(x: number, y: number): void {
        var tPath: Path = this._getPath();
        if (Math.abs(x - tPath._lastOriX) < 1e-3 && Math.abs(y - tPath._lastOriY) < 1e-3)// skip tiny line segment updates
            return;
        tPath._lastOriX = x;
        tPath._lastOriY = y;
        tPath.addPoint(x, y);
    }
    /*
    public function drawCurves(x:Number, y:Number,points:Array, lineColor:*, lineWidth:Number = 1):void {
        //setPathId(-1);
        beginPath();
        strokeStyle = lineColor;
        this.lineWidth = lineWidth;
        var points:Array = points;
        //movePath(x, y); TODO 这个被去掉了
        moveTo(points[0], points[1]);
        var i:int = 2, n:int = points.length;
        while (i < n) {
            quadraticCurveTo(points[i++], points[i++], points[i++], points[i++]);
        }
        stroke();
    }
    */

    arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void {
        /*
        if (mId != -1) {
            if (mHaveKey) {
                return;
            }
        }
        */
        var i = 0;
        var x = 0, y = 0;
        var dx = this._path._lastOriX - x1;
        var dy = this._path._lastOriY - y1;
        var len1 = Math.sqrt(dx * dx + dy * dy);
        if (len1 <= 0.000001) {
            return;
        }
        var ndx = dx / len1;
        var ndy = dy / len1;
        var dx2 = x2 - x1;
        var dy2 = y2 - y1;
        var len22 = dx2 * dx2 + dy2 * dy2;
        var len2 = Math.sqrt(len22);
        if (len2 <= 0.000001) {
            return;
        }
        var ndx2 = dx2 / len2;
        var ndy2 = dy2 / len2;
        var odx = ndx + ndx2;
        var ody = ndy + ndy2;
        var olen = Math.sqrt(odx * odx + ody * ody);
        if (olen <= 0.000001) {
            return;
        }

        var nOdx = odx / olen;
        var nOdy = ody / olen;

        var alpha = Math.acos(nOdx * ndx + nOdy * ndy);
        var halfAng = Math.PI / 2 - alpha;

        len1 = r * Math.tan(halfAng);
        var ptx1 = len1 * ndx + x1;
        var pty1 = len1 * ndy + y1;

        var orilen = Math.sqrt(len1 * len1 + r * r);
        //圆心
        var orix = x1 + nOdx * orilen;
        var oriy = y1 + nOdy * orilen;

        var ptx2 = len1 * ndx2 + x1;
        var pty2 = len1 * ndy2 + y1;

        var dir = ndx * ndy2 - ndy * ndx2;

        var fChgAng = 0;
        var sinx = 0.0;
        var cosx = 0.0;
        if (dir >= 0) {
            fChgAng = halfAng * 2;
            var fda = fChgAng / GraphicsRunner.SEGNUM;
            sinx = Math.sin(fda);
            cosx = Math.cos(fda);
        }
        else {
            fChgAng = -halfAng * 2;
            fda = fChgAng / GraphicsRunner.SEGNUM;
            sinx = Math.sin(fda);
            cosx = Math.cos(fda);
        }

        //x = _curMat.a * ptx1 + _curMat.c * pty1 /*+ _curMat.tx*/;
        //y = _curMat.b * ptx1 + _curMat.d * pty1 /*+ _curMat.ty*/;
        var lastx = this._path._lastOriX, lasty = this._path._lastOriY;	//没有矩阵转换的上一个点
        var _x1 = ptx1, _y1 = pty1;
        if (Math.abs(_x1 - this._path._lastOriX) > 0.1 || Math.abs(_y1 - this._path._lastOriY) > 0.1) {
            x = _x1;// _curMat.a * _x1 + _curMat.c * _y1 + _curMat.tx;
            y = _y1;//_curMat.b * _x1 + _curMat.d * _y1 + _curMat.ty;
            lastx = _x1;
            lasty = _y1;
            this._path._lastOriX = x;
            this._path._lastOriY = y;
            this._path.addPoint(x, y);
        }
        var cvx = ptx1 - orix;
        var cvy = pty1 - oriy;
        var tx = 0.0;
        var ty = 0.0;
        for (i = 0; i < GraphicsRunner.SEGNUM; i++) {
            var cx = cvx * cosx + cvy * sinx;
            var cy = -cvx * sinx + cvy * cosx;
            x = cx + orix;
            y = cy + oriy;

            //x1 = _curMat.a * x + _curMat.c * y /*+ _curMat.tx*/;
            //y1 = _curMat.b * x + _curMat.d * y /*+ _curMat.ty*/;
            //x = x1;
            //y = y1;
            if (Math.abs(lastx - x) > 0.1 || Math.abs(lasty - y) > 0.1) {
                //var _tx1:Number = x, _ty1:Number = y;
                //x = _curMat.a * _tx1 + _curMat.c * _ty1 + _curMat.tx;
                //y = _curMat.b * _tx1 + _curMat.d * _ty1 + _curMat.ty;
                this._path._lastOriX = x;
                this._path._lastOriY = y;
                this._path.addPoint(x, y);
                lastx = x;
                lasty = y;
            }
            cvx = cx;
            cvy = cy;
        }
    }

    arc(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, counterclockwise = false, b = true, minNum = 20, segPixel = 5): void {
        // Clamp angles
        if (startAngle > endAngle) {
            [startAngle, endAngle] = [endAngle, startAngle];
        }
        let da = endAngle - startAngle;
        if (!counterclockwise) {
            if (Math.abs(da) >= Math.PI * 2) {
                da = Math.PI * 2;
            } else {
                while (da < 0.0) {
                    da += Math.PI * 2;
                }
            }
        } else {
            if (Math.abs(da) >= Math.PI * 2) {
                da = -Math.PI * 2;
            } else {
                while (da > 0.0) {
                    da -= Math.PI * 2;
                }
            }
        }
        var sx = this.getCurrentScaleX();
        var sy = this.getCurrentScaleY();
        var sr = rx * (sx > sy ? sx : sy);
        var cl = 2 * Math.PI * sr;
        let ndivs = (Math.max(cl / segPixel, minNum)) | 0;
        let stepAng = Math.PI * 2 / ndivs;

        var tPath = this._getPath();

        let x = cx + Math.cos(startAngle) * rx;
        let y = cy + Math.sin(startAngle) * ry;
        if (x != this._path._lastOriX || y != this._path._lastOriY) {
            tPath.addPoint(x, y);
        }
        //增加关键支撑点，这些点要在固定位置
        let curAng = Math.ceil(startAngle / stepAng) * stepAng;
        while (endAngle - curAng >= stepAng) {
            x = cx + Math.cos(curAng) * rx;
            y = cy + Math.sin(curAng) * ry;
            tPath.addPoint(x, y);
            curAng += stepAng;
        }
        x = cx + Math.cos(endAngle) * rx;
        y = cy + Math.sin(endAngle) * ry;
        if (x != this._path._lastOriX || y != this._path._lastOriY) {
            tPath.addPoint(x, y);
        }
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        var tArray: any[] = Bezier.getPoints([this._path._lastOriX, this._path._lastOriY, cpx, cpy, x, y], 30, 2);
        for (var i = 0, n = tArray.length / 2; i < n; i++) {
            this.lineTo(tArray[i * 2], tArray[i * 2 + 1]);
        }
        this.lineTo(x, y);
    }


    /**
     * 把颜色跟当前设置的alpha混合
     * @return
     */
    mixRGBandAlpha(color: number): number {
        return this._mixRGBandAlpha(color, this._alpha);
    }
    /**@internal */
    _mixRGBandAlpha(color: number, alpha: number): number {
        if (alpha >= 1) {
            return color;
        }
        var a = ((color & 0xff000000) >>> 24);
        //TODO 这里容易出问题，例如颜色的alpha部分虽然为0，但是他的意义就是0，不能假设是没有设置alpha。例如级联多个alpha就会生成这种结果
        if (a != 0) {
            a *= alpha;
        } else {
            a = alpha * 255;
        }
        return (color & 0x00ffffff) | (a << 24);
    }

    strokeRect(x: number, y: number, width: number, height: number, parameterLineWidth: number = 0): void {
        var tW = parameterLineWidth * 0.5;
        //line(x - tW, y, x + width + tW, y, parameterLineWidth, _curMat);
        //line(x + width, y, x + width, y + height, parameterLineWidth, _curMat);
        //line(x, y, x, y + height, parameterLineWidth, _curMat);
        //line(x - tW, y + height, x + width + tW, y + height, parameterLineWidth, _curMat);
        /**
         * p1-------------------------------p2
         * |  x,y                      x+w,y|
         * |     p4--------------------p3   |
         * |     |                     |    |
         * |     p6--------------------p7   |
         * |  x,y+h                  x+w,y+h|
         * p5-------------------------------p8
         * 
         * 不用了
         * 这个其实用4个fillrect拼起来更好，能与fillrect合并。虽然多了几个点。
         */
        //TODO 这里能不能与下面的stroke合并一下
        if (this.lineWidth > 0) {
            var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
            var hw = this.lineWidth / 2;
            this._fillRect(x - hw, y - hw, width + this.lineWidth, this.lineWidth, rgba);				//上
            this._fillRect(x - hw, y - hw + height, width + this.lineWidth, this.lineWidth, rgba);		//下
            this._fillRect(x - hw, y + hw, this.lineWidth, height - this.lineWidth, rgba);					//左
            this._fillRect(x - hw + width, y + hw, this.lineWidth, height - this.lineWidth, rgba);			//右
        }
    }

    /*******************************************end矢量绘制***************************************************/
    //TODO:coverage
    drawParticle(x: number, y: number, pt: any): void {
    }

    private _getPath(): Path {
        return this._path || (this._path = new Path());
    }

    // /**
    //  * 专用函数。通过循环创建来水平填充
    //  * @param tex
    //  * @param bmpid
    //  * @param uv		希望循环的部分的uv
    //  * @param oriw
    //  * @param orih
    //  * @param x
    //  * @param y
    //  * @param w
    //  */
    // private _fillTexture_h(tex: Texture, imgid: number, uv: ArrayLike<number>, oriw: number, orih: number, x: number, y: number, w: number, color: number): void {
    //     if (oriw <= 0)
    //         return;//console.error('_fillTexture_h error: oriw must>0');

    //     var stx = x;
    //     var num = Math.floor(w / oriw);
    //     var left = w % oriw;
    //     for (var i = 0; i < num; i++) {
    //         this._inner_drawTexture(tex, imgid, stx, y, oriw, orih, this._curMat, uv, 1, false, color);
    //         stx += oriw;
    //     }
    //     // 最后剩下的
    //     if (left > 0) {
    //         var du = uv[2] - uv[0];
    //         var uvr = uv[0] + du * (left / oriw);
    //         var tuv: any[] = tmpuv1;
    //         tuv[0] = uv[0]; tuv[1] = uv[1]; tuv[2] = uvr; tuv[3] = uv[3];
    //         tuv[4] = uvr; tuv[5] = uv[5]; tuv[6] = uv[6]; tuv[7] = uv[7];
    //         this._inner_drawTexture(tex, imgid, stx, y, left, orih, this._curMat, tuv, 1, false, color);
    //     }
    // }

    // /**
    //  * 专用函数。通过循环创建来垂直填充
    //  * @param tex
    //  * @param imgid
    //  * @param uv
    //  * @param oriw
    //  * @param orih
    //  * @param x
    //  * @param y
    //  * @param h
    //  */
    // private _fillTexture_v(tex: Texture, imgid: number, uv: ArrayLike<number>, oriw: number, orih: number, x: number, y: number, h: number, color: number): void {
    //     if (orih <= 0)
    //         return; //console.error('_fillTexture_v error: orih must>0');
    //     var sty = y;
    //     var num = Math.floor(h / orih);
    //     var left = h % orih;
    //     for (var i = 0; i < num; i++) {
    //         this._inner_drawTexture(tex, imgid, x, sty, oriw, orih, this._curMat, uv, 1, false, color);
    //         sty += orih;
    //     }
    //     // 最后剩下的
    //     if (left > 0) {
    //         var dv = uv[7] - uv[1];
    //         var uvb = uv[1] + dv * (left / orih);
    //         var tuv: any[] = tmpuv1;
    //         tuv[0] = uv[0]; tuv[1] = uv[1]; tuv[2] = uv[2]; tuv[3] = uv[3];
    //         tuv[4] = uv[4]; tuv[5] = uvb; tuv[6] = uv[6]; tuv[7] = uvb;
    //         this._inner_drawTexture(tex, imgid, x, sty, oriw, left, this._curMat, tuv, 1, false, color);
    //     }
    // }

    // private _gridCut(left: number, right: number, width: number, out: Vector2) {
    //     let c = (left + right) / 2;
    //     let d = (left + right - width) / 2;
    //     let ll = 0, lr = left;
    //     let rl = left, rr = left + right;
    //     let cl = c - d, cr = c + d;
    //     //扣掉的部分与左右两部分相交
    //     let hl = Math.max(ll, cl);
    //     let hr = Math.min(lr, cr);
    //     if (hr > hl) {
    //         left -= (hr - hl);
    //     }
    //     hl = Math.max(rl, cl);
    //     hr = Math.min(rr, cr);
    //     if (hr > hl) {
    //         right -= (hr - hl);
    //     }
    //     out.x = left;
    //     out.y = right;
    // }

    // drawTextureWithSizeGrid(tex: Texture, tx: number, ty: number, width: number, height: number, sizeGrid: number[], gx: number, gy: number, color: number): void {
    //     if (!this._getImageSource(tex))
    //         return;

    //     tx += gx;
    //     ty += gy;

    //     var uv = tex.uv, w = tex.bitmap.width, h = tex.bitmap.height;

    //     var top = sizeGrid[0];
    //     var left = sizeGrid[3];
    //     var right = sizeGrid[1];
    //     var bottom = sizeGrid[2];
    //     var repeat = sizeGrid[4];

    //     if (width === tex.width) {
    //         left = right = 0;
    //     }
    //     if (height === tex.height) {
    //         top = bottom = 0;
    //     }

    //     var imgid = (tex.bitmap as Texture2D).id;
    //     var mat: Matrix = this._curMat;
    //     var tuv = this._tempUV;

    //     //当width过小的情况
    //     let hasmidx = true;
    //     if (left + right > width) {
    //         hasmidx = false;
    //         //有时候用户会把左右切割的大小不一致,如果平分裁剪,会导致左右的半圆对不上,假设用户的图片左右两边的半圆是相同的
    //         //那么更好的方法是优先裁剪长的那一段
    //         this._gridCut(left, right, width, _clipResult);
    //         left = _clipResult.x;
    //         right = _clipResult.y;
    //     }

    //     let hasmidy = true;
    //     if (top + bottom > height) {
    //         hasmidy = false;
    //         this._gridCut(top, bottom, height, _clipResult);
    //         top = _clipResult.x;
    //         bottom = _clipResult.y;
    //     }

    //     var d_top = top / h;
    //     var d_left = left / w;
    //     var d_right = right / w;
    //     var d_bottom = bottom / h;



    //     // 整图的uv
    //     // 一定是方的，所以uv只要左上右下就行
    //     var uvl = uv[0];
    //     var uvt = uv[1];
    //     var uvr = uv[4];
    //     var uvb = uv[5];

    //     // 小图的uv
    //     var uvl_ = uvl;
    //     var uvt_ = uvt;
    //     var uvr_ = uvr;
    //     var uvb_ = uvb;

    //     //绘制四个角
    //     // 构造uv
    //     if (left && top) {
    //         uvr_ = uvl + d_left;
    //         uvb_ = uvt + d_top;
    //         tuv[0] = uvl, tuv[1] = uvt, tuv[2] = uvr_, tuv[3] = uvt,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl, tuv[7] = uvb_;
    //         this._inner_drawTexture(tex, imgid, tx, ty, left, top, mat, tuv, 1, false, color);
    //     }
    //     if (right && top) {
    //         uvl_ = uvr - d_right; uvt_ = uvt;
    //         uvr_ = uvr; uvb_ = uvt + d_top;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         this._inner_drawTexture(tex, imgid, width - right + tx, 0 + ty, right, top, mat, tuv, 1, false, color);
    //     }
    //     if (left && bottom) {
    //         uvl_ = uvl; uvt_ = uvb - d_bottom;
    //         uvr_ = uvl + d_left; uvb_ = uvb;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         this._inner_drawTexture(tex, imgid, 0 + tx, height - bottom + ty, left, bottom, mat, tuv, 1, false, color);
    //     }
    //     if (right && bottom) {
    //         uvl_ = uvr - d_right; uvt_ = uvb - d_bottom;
    //         uvr_ = uvr; uvb_ = uvb;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         this._inner_drawTexture(tex, imgid, width - right + tx, height - bottom + ty, right, bottom, mat, tuv, 1, false, color);
    //     }
    //     //绘制上下两个边
    //     if (top && hasmidx) {
    //         uvl_ = uvl + d_left; uvt_ = uvt;
    //         uvr_ = uvr - d_right; uvb_ = uvt + d_top;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         if (repeat) {
    //             this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, top, left + tx, ty, width - left - right, color);
    //         } else {
    //             this._inner_drawTexture(tex, imgid, left + tx, ty, width - left - right, top, mat, tuv, 1, false, color);
    //         }

    //     }
    //     if (bottom && hasmidx) {
    //         uvl_ = uvl + d_left; uvt_ = uvb - d_bottom;
    //         uvr_ = uvr - d_right; uvb_ = uvb;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         if (repeat) {
    //             this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, bottom, left + tx, height - bottom + ty, width - left - right, color);
    //         } else {
    //             this._inner_drawTexture(tex, imgid, left + tx, height - bottom + ty, width - left - right, bottom, mat, tuv, 1, false, color);
    //         }
    //     }
    //     //绘制左右两边
    //     if (left && hasmidy) {
    //         uvl_ = uvl; uvt_ = uvt + d_top;
    //         uvr_ = uvl + d_left; uvb_ = uvb - d_bottom;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         if (repeat) {
    //             this._fillTexture_v(tex, imgid, tuv, left, tex.height - top - bottom, tx, top + ty, height - top - bottom, color);
    //         } else {
    //             this._inner_drawTexture(tex, imgid, tx, top + ty, left, height - top - bottom, mat, tuv, 1, false, color);
    //         }
    //     }
    //     if (right && hasmidy) {
    //         uvl_ = uvr - d_right; uvt_ = uvt + d_top;
    //         uvr_ = uvr; uvb_ = uvb - d_bottom;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         if (repeat) {
    //             this._fillTexture_v(tex, imgid, tuv, right, tex.height - top - bottom, width - right + tx, top + ty, height - top - bottom, color);
    //         } else {
    //             this._inner_drawTexture(tex, imgid, width - right + tx, top + ty, right, height - top - bottom, mat, tuv, 1, false, color);
    //         }
    //     }
    //     //绘制中间
    //     if (hasmidx && hasmidy) {
    //         uvl_ = uvl + d_left; uvt_ = uvt + d_top;
    //         uvr_ = uvr - d_right; uvb_ = uvb - d_bottom;
    //         tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
    //             tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
    //         if (repeat) {
    //             let tuvr = tmpUVRect;
    //             tuvr[0] = uvl_; tuvr[1] = uvt_;
    //             tuvr[2] = uvr_ - uvl_; tuvr[3] = uvb_ - uvt_;
        //filltexture相关逻辑。计算rect大小以及对应的uv
    //             this._fillTexture(tex, tex.width - left - right, tex.height - top - bottom, tuvr, left + tx, top + ty, width - left - right, height - top - bottom, 'repeat', 0, 0, color);
    //         } else {
    //             this._inner_drawTexture(tex, imgid, left + tx, top + ty, width - left - right, height - top - bottom, mat, tuv, 1, false, color);
    //         }
    //     }
    // }

    private _getImageSource(texture: Texture | BaseTexture) {
        let cs = this.sprite;
        return texture._getSource(function (): void {
            if (cs) {
                if (cs._graphics)
                    cs._graphics.repaint(); //隐含了cs.repaint
                else
                    cs.repaint();	// callLater does not run for cacheAs normal in this path
            }
        });

    }

    /**
     * @en Default geometry
     * @zh 默认的geometry
     */
    def_geometry: IRenderGeometryElement;

    /**
     * @en Inverse geometry
     * @zh 逆向的geometry
     */
    inv_geometry: IRenderGeometryElement;

    initDefalutMesh() {
        if (!this.def_geometry) {
            let length = 4 * GraphicsDefines.stride;
            let def_vertices = new Float32Array(length);
            let inv_vertices = new Float32Array(length);
            let def_uv = Texture.DEF_UV;
            let inv_uv = Texture.INV_UV;
            let positions = [0, 0, 1, 0, 1, 1, 0, 1];

            let offset = 0;
            for (let i = 0; i < 4; i++) {
                let index = i * GraphicsDefines.stride;
                //pos
                inv_vertices[index] = def_vertices[index] = positions[offset];
                inv_vertices[index + 1] = def_vertices[index + 1] = positions[offset + 1];
                //defalut uv
                def_vertices[index + 2] = def_uv[offset];
                def_vertices[index + 3] = def_uv[offset + 1];
                //invert uv
                inv_vertices[index + 2] = inv_uv[offset];
                inv_vertices[index + 3] = inv_uv[offset + 1];
                //color
                inv_vertices[index + 4] = def_vertices[index + 4] = 1;
                inv_vertices[index + 5] = def_vertices[index + 5] = 1;
                inv_vertices[index + 6] = def_vertices[index + 6] = 1;
                inv_vertices[index + 7] = def_vertices[index + 7] = 1;
                //a_flag
                inv_vertices[index + 8] = def_vertices[index + 8] = 0xff;

                offset += 2;
            }

            let indices = getDrawTexToQuadIndex();
            let indexBuffer = LayaGL.renderDeviceFactory.createIndexBuffer(BufferUsage.Static);
            indexBuffer.indexType = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
            indexBuffer.indexCount = indices.length;
            indexBuffer._setIndexDataLength(indices.byteLength);
            indexBuffer._setIndexData(indices, 0);

            let defaultBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Static);
            defaultBuffer.vertexDeclaration = GraphicsDefines.vertexDeclarition;
            defaultBuffer.setDataLength(def_vertices.byteLength);
            defaultBuffer.setData(def_vertices.buffer, 0, 0, def_vertices.byteLength);

            let invertBuffer = LayaGL.renderDeviceFactory.createVertexBuffer(BufferUsage.Static);
            invertBuffer.vertexDeclaration = GraphicsDefines.vertexDeclarition;
            invertBuffer.setDataLength(inv_vertices.byteLength);
            invertBuffer.setData(inv_vertices.buffer, 0, 0, inv_vertices.byteLength);

            this.def_geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            let defaultState = LayaGL.renderDeviceFactory.createBufferState();
            defaultState.applyState([defaultBuffer], indexBuffer);
            this.def_geometry.bufferState = defaultState;
            this.def_geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
            this.def_geometry.setDrawElemenParams(6, 0);

            this.inv_geometry = LayaGL.renderDeviceFactory.createRenderGeometryElement(MeshTopology.Triangles, DrawType.DrawElement);
            let invertState = LayaGL.renderDeviceFactory.createBufferState();
            invertState.applyState([invertBuffer], indexBuffer);
            this.inv_geometry.bufferState = invertState;
            this.inv_geometry.indexFormat = GraphicsDefines.GRAPHICS_INDEX_FORMAT;
            this.inv_geometry.setDrawElemenParams(6, 0);
        }
    }

}


/** @internal */
class ContextParams {
    static readonly DEFAULT: Readonly<ContextParams> = new ContextParams();

    lineWidth = 1;
    textAlign: string;
    textBaseline: string;

    clear(): void {
        this.lineWidth = 1;
        this.textAlign = this.textBaseline = null;
    }

    make(): ContextParams {
        return this === ContextParams.DEFAULT ? new ContextParams() : this;
    }
}
