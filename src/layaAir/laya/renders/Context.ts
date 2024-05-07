import { ILaya } from "../../ILaya";
import { Laya } from "../../Laya";
import { Const } from "../Const";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { RenderState } from "../RenderDriver/RenderModuleData/Design/RenderState";
import { TextureFormat } from "../RenderEngine/RenderEnum/TextureFormat";
import { Shader3D } from "../RenderEngine/RenderShader/Shader3D";
import { Sprite } from "../display/Sprite";
import { ColorFilter } from "../filters/ColorFilter";
import { LayaGL } from "../layagl/LayaGL";
import { Bezier } from "../maths/Bezier";
import { Color } from "../maths/Color";
import { Matrix } from "../maths/Matrix";
import { Matrix4x4 } from "../maths/Matrix4x4";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Vector2 } from "../maths/Vector2";
import { Vector4 } from "../maths/Vector4";
import { BaseTexture } from "../resource/BaseTexture";
import { HTMLCanvas } from "../resource/HTMLCanvas";
import { Material } from "../resource/Material";
import { RenderTexture } from "../resource/RenderTexture";
import { RenderTexture2D } from "../resource/RenderTexture2D";
import { Texture } from "../resource/Texture";
import { Texture2D } from "../resource/Texture2D";
import { FontInfo } from "../utils/FontInfo";
import { WordText } from "../utils/WordText";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { DrawStyle } from "../webgl/canvas/DrawStyle";
import { Path } from "../webgl/canvas/Path";
import { ISaveData } from "../webgl/canvas/save/ISaveData";
import { SaveBase } from "../webgl/canvas/save/SaveBase";
import { SaveClipRect } from "../webgl/canvas/save/SaveClipRect";
import { SaveMark } from "../webgl/canvas/save/SaveMark";
import { SaveTransform } from "../webgl/canvas/save/SaveTransform";
import { SaveTranslate } from "../webgl/canvas/save/SaveTranslate";
import { Shader2D } from "../webgl/shader/d2/Shader2D";
import { ShaderDefines2D } from "../webgl/shader/d2/ShaderDefines2D";
import { TextureSV } from "../webgl/shader/d2/value/TextureSV";
import { RenderSpriteData, Value2D } from "../webgl/shader/d2/value/Value2D";
import { BasePoly } from "../webgl/shapes/BasePoly";
import { Earcut } from "../webgl/shapes/Earcut";
import { SubmitBase } from "../webgl/submit/SubmitBase";
import { SubmitKey } from "../webgl/submit/SubmitKey";
import { CharSubmitCache } from "../webgl/text/CharSubmitCache";
import { MeasureFont } from "../webgl/text/MeasureFont";
import { TextRender } from "../webgl/text/TextRender";
import { Mesh2D } from "../webgl/utils/Mesh2D";
import { MeshQuadTexture } from "../webgl/utils/MeshQuadTexture";
import { MeshTexture } from "../webgl/utils/MeshTexture";
import { MeshVG } from "../webgl/utils/MeshVG";
import { RenderState2D } from "../webgl/utils/RenderState2D";
import { Render2D, Render2DSimple } from "./Render2D";
import { IAutoExpiringResource } from "./ResNeedTouch";

const defaultClipMatrix = new Matrix(Const.MAX_CLIP_SIZE, 0, 0, Const.MAX_CLIP_SIZE, 0, 0);

/**
 * @private
 */
export class Context {
    private static tmpuv1: any[] = [0, 0, 0, 0, 0, 0, 0, 0];

    /**@internal */
    private _canvas: HTMLCanvas;

    private static _MAXVERTNUM = 65535;

    static MAXCLIPRECT: Rectangle = null;

    private _alpha = 1.0;

    private _material: Material = null;

    /**@internal */
    private _fillStyle = DrawStyle.DEFAULT;
    /**@internal */
    private _strokeStyle = DrawStyle.DEFAULT;

    /**@internal */
    private _tmpMatrix = new Matrix();		// chrome下静态的访问比从this访问要慢

    private static SEGNUM = 32;
    private static _contextcount = 0;

    private _drawTexToDrawTri_Vert = new Float32Array(8);		// 从速度考虑，不做成static了
    private _drawTexToDrawTri_Index = new Uint16Array([0, 1, 2, 0, 2, 3]);
    private _tempUV = new Float32Array(8);
    private _drawTriUseAbsMatrix = false;	//drawTriange函数的矩阵是全局的，不用再乘以当前矩阵了。这是一个补丁。

    private _other: ContextParams | null = null;

    private _path: Path | null = null;
    /**@internal */
    _drawCount = 1;
    private _width = Const.MAX_CLIP_SIZE;
    private _height = Const.MAX_CLIP_SIZE;
    private _renderCount = 0;
    /**@internal */
    stopMerge = true;     //如果用设置_curSubmit的方法，可能导致渲染错误，因为_curSubmit保存上次的信息，不能任意改
    /**@internal */
    _curSubmit = SubmitBase.RENDERBASE;
    /**@internal */
    _submitKey = new SubmitKey();	//当前将要使用的设置。用来跟上一次的_curSubmit比较

    /**@internal */
    private _mesh: Mesh2D;			//用Mesh2D代替_vb,_ib. 当前使用的mesh
    private _meshQuatTex = new MeshQuadTexture();
    private _meshVG = new MeshVG();
    private _meshTex = new MeshTexture();

    //public var _vbs:Array = [];	//双buffer管理。TODO 临时删掉，需要mesh中加上
    private _transedPoints: any[] = new Array(8);	//临时的数组，用来计算4个顶点的转换后的位置。
    private _temp4Points: any[] = new Array(8);		//临时数组。用来保存4个顶点的位置。

    /**@internal */
    _clipRect = Context.MAXCLIPRECT;
    /**@internal */
    _globalClipMatrix = defaultClipMatrix.clone();	//用矩阵描述的clip信息。最终的点投影到这个矩阵上，在0~1之间就可见。
    /**@internal */
    _clipInfoID = 0;					//用来区分是不是clipinfo已经改变了
    private _clipID_Gen = 0;			//生成clipid的，原来是  _clipInfoID=++_clipInfoID 这样会有问题，导致兄弟clip的id都相同
    /**@internal */
    _curMat: Matrix;
    /**@internal */
    _matBuffer: Float32Array = new Float32Array(6);

    //计算矩阵缩放的缓存
    /**@internal */
    _lastMatScaleX = 1.0;
    /**@internal */
    _lastMatScaleY = 1.0;
    private _lastMat_a = 1.0;
    private _lastMat_b = 0.0;
    private _lastMat_c = 0.0;
    private _lastMat_d = 1.0;
    /**@internal */
    _nBlendType = 0;
    /**@internal */
    _save: ISaveData[] & { _length?: number } = null;
    /**@internal */
    _charSubmitCache: CharSubmitCache | null = null;
    /**@internal */
    _saveMark: SaveMark | null = null;
    /**@internal */
    private _shader2D = new Shader2D();	//

    /**
     * 所cacheAs精灵
     * 对于cacheas bitmap的情况，如果图片还没准备好，需要有机会重画，所以要保存sprite。例如在图片
     * 加载完成后，调用repaint
     */
    sprite: Sprite | null = null;

    /**@internal */
    private static _textRender: TextRender | null = null;// new TextRender();
    /**@internal */
    _italicDeg = 0;//文字的倾斜角度
    /**@internal */
    _lastTex: Texture | null = null; //上次使用的texture。主要是给fillrect用，假装自己也是一个drawtexture

    private _fillColor = 0;
    private _flushCnt = 0;

    private defTexture: Texture | null = null;	//给fillrect用
    /**@internal */
    _colorFiler: ColorFilter | null = null;

    drawTexAlign = false;		// 按照像素对齐
    /**@internal */
    _incache = false;			// 正处在cacheas normal过程中

    private _isMain = false;				// 是否是主context

    private _render2D: Render2D = null;

    private _clearColor = new Color(0,0,0,0);
    private _clear=false;

    //temp
    //batchManager:RenderBatchManager2D=null;

    static __init__(): void {
        Context.MAXCLIPRECT = new Rectangle(0, 0, Const.MAX_CLIP_SIZE, Const.MAX_CLIP_SIZE);
        ContextParams.DEFAULT = new ContextParams();
        if(!Context._textRender){
            let textRender = Context._textRender = new TextRender();
            textRender.fontMeasure = new MeasureFont(textRender.charRender);
        }
    }

    constructor() {
        //默认值。可以外面设置
        this.render2D = new Render2DSimple();
        Context._contextcount++;
        //_ib = IndexBuffer2D.QuadrangleIB;
        if (!this.defTexture) {
            var defTex2d = new Texture2D(2, 2, TextureFormat.R8G8B8A8, true, false, false);
            defTex2d.setPixelsData(new Uint8Array(16), false, false);
            defTex2d.lock = true;
            this.defTexture = new Texture(defTex2d);
        }
        this._lastTex = this.defTexture;
        this._other = ContextParams.DEFAULT;
        this._curMat = Matrix.create();
        this._charSubmitCache = new CharSubmitCache();
        //_vb = _vbs[0] = VertexBuffer2D.create( -1);
        this._mesh = this._meshQuatTex;
        this._mesh.clearMesh();
        this._save = [SaveMark.Create(this)];
        this._save.length = 10;
        this.clear();
    }

    //从ctx继承渲染参数
    copyState(ctx: Context) {
        ///TODO
    }

    set isMain(v: boolean) {
        this._isMain = v;
        if (v) {
            //TODO 分配mesh
        }
    }

    get isMain() {
        return this._isMain;
    }

    set render2D(render: Render2D) {
        this._render2D = render;
    }

    get render2D() {
        return this._render2D;
    }

    set material(value: Material) {
        this._material = value;
    }

    get material() {
        return this._material;
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

    /**
     * 添加需要touch的资源
     * @param res 
     */
    touchRes(res:IAutoExpiringResource){
        res.touch();
    }

    transformByMatrix(matrix: Matrix, tx: number, ty: number): void {
        this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
    }

    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {
        var ctx: any = this;

        //填充矩形
        if (fillColor != null) {
            ctx.fillStyle = fillColor;
            ctx.fillRect(x, y, width, height);
        }

        //绘制矩形边框
        if (lineColor != null) {
            ctx.strokeStyle = lineColor;
            ctx.lineWidth = lineWidth;
            ctx.strokeRect(x, y, width, height);
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
        this.addPath(points.slice(), false, false, x, y);
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
    _drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any, lineWidth: number) {
        this.beginPath(true);
        var tPath = this._getPath();
        if (0 >= lt) {
            tPath.addPoint(x, y);
        } else {
            this.arc(x + lt, y + lt, lt, lt, Math.PI, Math.PI + 0.5 * Math.PI);
        }
        let startX = x + width - rt;
        if (0 >= rt) {
            tPath.addPoint(startX, y);
        } else {
            this.arc(startX, y + rt, rt, rt, Math.PI + 0.5 * Math.PI, 2 * Math.PI);
        }
        startX = x + width - rb;
        let startY = y + height - rb;
        if (0 >= rb) {
            tPath.addPoint(startX, startY);
        } else {
            this.arc(startX, startY, rb, rb, 0, 0.5 * Math.PI);
        }
        startX = x + lb;
        startY = y + height - lb;
        if (0 >= lb) {
            tPath.addPoint(startX, startY);
        } else {
            this.arc(startX, startY, lb, lb, Math.PI - 0.5 * Math.PI, Math.PI);
        }
        tPath.addPoint(x, y + lt);
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
        this.addPath(points.slice(), true, isConvexPolygon, x, y);
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

    //  static const2DRenderCMD: RenderStateCommand;
    static set2DRenderConfig(): void {

        //  RenderTexture2D.currentActive && RenderTexture2D.currentActive.end();
        //@ts-ignore
        // LayaGL.renderEngine.viewport(0, 0, RenderState2D.width, RenderState2D.height);//还原2D视口
        // LayaGL.renderEngine.scissorTest(true);
        //@ts-ignore
        // LayaGL.renderEngine.scissor(0, 0, RenderState2D.width, RenderState2D.height);
    }

    clearBG(r: number, g: number, b: number, a: number): void {
        // var gl: WebGLRenderingContext = RenderStateContext.mainContext;
        if(r==null || r==undefined){
            this._clear=false;
        }else{
            this._clearColor.setValue(r,g,b,a);
            this._clear=true;
        }
     //   LayaGL.renderEngine.clearRenderTexture(RenderClearFlag.Color, this.clearColor, 1, 0);
    }

    /**
     * 释放占用内存
     */
    private _releaseMem(): void {
        this._curMat && this._curMat.destroy();
        this._curMat = null;
        this._shader2D.destroy();
        this._shader2D = null;
        this._charSubmitCache.clear();
        this._path = null;
        this._save = null;
        this.sprite = null;
    }

    /**
     * 释放所有资源
     */
    destroy(): void {
        --Context._contextcount;
        this.sprite = null;
        this._charSubmitCache && this._charSubmitCache.destroy();
        if (this.defTexture) {
            this.defTexture.bitmap && this.defTexture.bitmap.destroy();
            this.defTexture.destroy();
        }
    }

    clear(): void {
        this._submitKey.clear();
        this._drawCount = 1;
        this._other = ContextParams.DEFAULT;
        this._alpha = 1.0;
        this._nBlendType = 0;
        this._clipRect = Context.MAXCLIPRECT;
        this._fillStyle = this._strokeStyle = DrawStyle.DEFAULT;

        this._curMat.identity();
        this._other.clear();

        this._saveMark = <SaveMark>this._save[0];
        this._save._length = 1;
    }

    /**
     * 设置ctx的size，这个不允许直接设置，必须是canvas调过来的。所以这个函数里也不用考虑canvas相关的东西
     * @param	w
     * @param	h
     */
    size(w: number, h: number): void {
        if (this._width != w || this._height != h) {
            this._width = w;
            this._height = h;
            //如果是主画布，要记录窗口大小
            //如果不是 TODO
            if (this.isMain) {
                //@ts-ignore
                LayaGL.renderEngine.viewport(0, 0, w, h);
                //@ts-ignore
                LayaGL.renderEngine.scissor(0, 0, w, h);
                RenderState2D.width = w;
                RenderState2D.height = h;
            }
        }
        if (w === 0 && h === 0) this._releaseMem();
    }

    get width(){
        return this._width;
    }
    set width(w:number){
        this.size(w,this._height);
    }
    get height(){
        return this._height;
    }
    set height(h:number){
        this.size(this._width,h);
    }

    /**
     * 获得当前矩阵的缩放值
     * 避免每次都计算getScaleX
     * @return
     */
    getMatScaleX(): number {
        if (this._lastMat_a == this._curMat.a && this._lastMat_b == this._curMat.b)
            return this._lastMatScaleX;
        this._lastMatScaleX = this._curMat.getScaleX();
        this._lastMat_a = this._curMat.a;
        this._lastMat_b = this._curMat.b;
        return this._lastMatScaleX;
    }

    getMatScaleY(): number {
        if (this._lastMat_c == this._curMat.c && this._lastMat_d == this._curMat.d)
            return this._lastMatScaleY;
        this._lastMatScaleY = this._curMat.getScaleY();
        this._lastMat_c = this._curMat.c;
        this._lastMat_d = this._curMat.d;
        return this._lastMatScaleY;
    }

    getFillColor(): number {
        return this._fillColor;
    }

    set fillStyle(value: any) {
        if (!this._fillStyle.equal(value)) {
            SaveBase.save(this, SaveBase.TYPE_FILESTYLE, this._shader2D, false);
            this._fillStyle = DrawStyle.create(value);
            this._submitKey.other = -this._fillStyle.toInt();
        }
    }

    get fillStyle(): any {
        return this._fillStyle;
    }

    set globalAlpha(value: number) {
        value = Math.floor(value * 1000) / 1000;
        if (value != this._alpha) {
            SaveBase.save(this, SaveBase.TYPE_ALPHA, this._shader2D, false);
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

    set globalCompositeOperation(value: string) {
        this._drawToRender2D(this._curSubmit);
        var n = BlendMode.TOINT[value];
        n == null || (this._nBlendType === n) || (SaveBase.save(this, SaveBase.TYPE_GLOBALCOMPOSITEOPERATION, this, true), this._curSubmit = SubmitBase.RENDERBASE, this._nBlendType = n /*, _shader2D.ALPHA = 1*/);
    }

    get globalCompositeOperation(): string {
        return BlendMode.NAMES[this._nBlendType];
    }

    set strokeStyle(value: any) {
        this._strokeStyle.equal(value) || (SaveBase.save(this, SaveBase.TYPE_STROKESTYLE, this._shader2D, false), this._strokeStyle = DrawStyle.create(value), this._submitKey.other = -this._strokeStyle.toInt());
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
            this.stopMerge = true;
        }
    }

    fillText(txt: string | WordText, x: number, y: number, fontStr: string, color: string, align: string, lineWidth = 0, borderColor: string = ""): void {
        Context._textRender!.filltext(this, txt, x, y, fontStr, color, borderColor, lineWidth, align);
    }
    // 与fillText的区别是没有border信息
    drawText(text: string | WordText, x: number, y: number, font: string, color: string, textAlign: string): void {
        Context._textRender!.filltext(this, text, x, y, font, color, null, 0, textAlign);
    }
    strokeWord(text: string | WordText, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): void {
        Context._textRender!.filltext(this, text, x, y, font, null, color, lineWidth, textAlign);
    }
    fillBorderText(txt: string | WordText, x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number, textAlign: string): void {
        Context._textRender!.filltext(this, txt, x, y, font, color, borderColor, lineWidth, textAlign);
    }

    /**@internal */
    _fast_filltext(data: string | WordText, x: number, y: number, fontObj: FontInfo, color: string, strokeColor: string | null, lineWidth: number, textAlign: number): void {
        Context._textRender!._fast_filltext(this, data, x, y, fontObj, color, strokeColor, lineWidth, textAlign);
    }

    private _fillRect(x: number, y: number, width: number, height: number, rgba: number): void {
        var submit = this._curSubmit;
        var sameKey =
            this._mesh.vertexNum + 4 < Context._MAXVERTNUM &&
            submit && (
                submit._key.submitType === SubmitBase.KEY_DRAWTEXTURE &&
                submit._key.blendShader === this._nBlendType &&
                !this.isStopMerge(submit)) &&
            this._curSubmit.material == this.material

        if (!sameKey) {
            this._drawToRender2D(this._curSubmit);
            this._mesh = this._meshQuatTex;
        }

        let mesh = this._mesh as MeshQuadTexture;

        this.transformQuad(x, y, width, height, 0, this._curMat, this._transedPoints);
        if (!this.clipedOff(this._transedPoints)) {
            //if (GlUtils.fillRectImgVb(_mesh._vb, _clipRect, x, y, width, height, Texture.DEF_UV, _curMat, rgba,this)){
            if (!sameKey) {
                submit = this._curSubmit = SubmitBase.create(this, mesh, Value2D.create(RenderSpriteData.Texture2D));
                this.fillShaderValue(submit.shaderValue);
                this._copyClipInfo(submit.shaderValue);
                submit.clipInfoID = this._clipInfoID;
                if (!this._lastTex || this._lastTex.destroyed) {
                    submit.shaderValue.textureHost = this.defTexture;
                } else {
                    submit.shaderValue.textureHost = this._lastTex;
                }
                //这里有一个问题。例如 clip1, drawTex(tex1), clip2, fillRect, drawTex(tex2)	会被分成3个submit，
                //submit._key.copyFrom2(_submitKey, SubmitBase.KEY_DRAWTEXTURE, (_lastTex && _lastTex.bitmap)?_lastTex.bitmap.id: -1);
                submit._key.other = (this._lastTex && this._lastTex.bitmap) ? (this._lastTex.bitmap as Texture2D).id : -1
            }
            mesh.addQuad(this._transedPoints, Texture.NO_UV, rgba, false);
            this._curSubmit._numEle += 6;
        }
    }

    fillRect(x: number, y: number, width: number, height: number, fillStyle: any): void {
        var drawstyle: DrawStyle = fillStyle ? DrawStyle.create(fillStyle) : this._fillStyle;
        //var rgb = drawstyle.toInt() ;
        //由于显卡的格式是 rgba，所以需要处理一下
        //var rgba:uint = ((rgb & 0xff0000) >> 16) | (rgb & 0x00ff00) | ((rgb & 0xff) << 16) | (_shader2D.ALPHA * 255) << 24;
        var rgba = this.mixRGBandAlpha(drawstyle.toInt());
        this._fillRect(x, y, width, height, rgba);
    }

    fillTexture(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, color: number): void {
        if (!texture._getSource()) {
            this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
            return;
        }
        this._fillTexture(texture, texture.width, texture.height, texture.uvrect, x, y, width, height, type, offset.x, offset.y, color);
    }

    /**@internal */
    private _fillTexture(texture: Texture, texw: number, texh: number, texuvRect: number[], x: number, y: number, width: number, height: number, type: string, offsetx: number, offsety: number, color: number): void {
        var submit = this._curSubmit;
        //这个不合并，直接渲染
        this._drawToRender2D(this._curSubmit);
        this._mesh = this._meshQuatTex;

        //filltexture相关逻辑。计算rect大小以及对应的uv
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
            var rgba = this._mixRGBandAlpha(color, this._alpha);

            (this._mesh as MeshQuadTexture).addQuad(this._transedPoints, uv, rgba, true);

            var sv = Value2D.create(RenderSpriteData.Texture2D) as TextureSV;
            //这个优化先不要了，因为没太弄明白wrapmode的设置，总是不起作用。
            //if(texture.uvrect[2]<1.0||texture.uvrect[3]<1.0)//这表示是大图集中的一部分，只有这时候才用特殊shader
            sv.shaderData.addDefine(ShaderDefines2D.FILLTEXTURE);
            var arry = texuvRect.concat();
            Vector4.tempVec4.setValue(arry[0], arry[1], arry[2], arry[3]);
            sv.u_TexRange = Vector4.tempVec4;
            submit = this._curSubmit = SubmitBase.create(this, this._mesh, sv);
            this.fillShaderValue(sv);
            submit.clipInfoID = this._clipInfoID;
            submit.shaderValue.textureHost = texture;
            this._curSubmit._numEle += 6;
        }
        this.breakNextMerge();	//暂不合并
    }


    /**
     * 反正只支持一种filter，就不要叫setFilter了，直接叫setColorFilter
     * @param	value
     */
    setColorFilter(filter: ColorFilter): void {
        SaveBase.save(this, SaveBase.TYPE_COLORFILTER, this, true);
        //_shader2D.filters = value;
        this._colorFiler = filter;
        this.stopMerge = true;
        //_reCalculateBlendShader();
    }

    drawTexture(tex: Texture, x: number, y: number, width: number, height: number, color = 0xffffffff): void {
        this._drawTextureM(tex, x, y, width, height, null, 1, null, color);
    }

    drawTextures(tex: Texture, pos: ArrayLike<number>, tx: number, ty: number, colors: number[]): void {
        if (!tex._getSource()) //source内调用tex.active();
        {
            this.sprite && ILaya.systemTimer.callLater(this, this._repaintSprite);
            return;
        }

        //TODO 还没实现
        var n = pos.length / 2;
        var ipos = 0;
        var bmpid = (tex.bitmap as Texture2D).id;
        for (var i = 0; i < n; i++) {
            const color = typeof colors[i] === 'number' ? colors[i] : 0xffffffff;
            this._inner_drawTexture(tex, bmpid, pos[ipos++] + tx, pos[ipos++] + ty, 0, 0, null, null, 1.0, false, color);
        }
    }

    /**@internal */
    _drawTextureM(tex: Texture, x: number, y: number, width: number, height: number, m: Matrix, alpha: number, uv: any[] | null, color: number): boolean {
        // 注意sprite要保存，因为后面会被冲掉
        var cs = this.sprite;
        if (!tex._getSource(function (): void {
            if (cs) {
                cs.repaint();	// 原来是calllater，callater对于cacheas normal是没有机会执行的
            }
        })) { //source内调用tex.active();
            return false;
        }
        return this._inner_drawTexture(tex, (tex.bitmap as Texture2D).id, x, y, width, height, m, uv, alpha, false, color);
    }

    /**@internal */
    _drawRenderTexture(tex: RenderTexture2D, x: number, y: number, width: number, height: number, m: Matrix, alpha: number, uv: any[], color = 0xffffffff): boolean {
        return this._inner_drawTexture(tex, -1, x, y, width, height, m, uv, alpha, false, color);
    }

    /**@internal */
    _copyClipInfo(shaderValue: Value2D): void {
        let clipInfo = this._globalClipMatrix;
        this._globalClipMatrix.copyTo(shaderValue.localClipMatrix);
        var cm = shaderValue.clipMatDir;
        cm.x = clipInfo.a; cm.y = clipInfo.b; cm.z = clipInfo.c; cm.w = clipInfo.d;
        shaderValue.clipMatDir = cm;
        var cmp = shaderValue.clipMatPos;
        cmp.x = clipInfo.tx; cmp.y = clipInfo.ty;
        shaderValue.clipMatPos = cmp;
    }

    //通用的部分的比较
    private isStopMerge(submit: SubmitBase) {
        return this.stopMerge || (submit.clipInfoID !== this._clipInfoID);
    }

    drawCallOptimize(enable: boolean): boolean {
        this._charSubmitCache.enable(enable, this);
        return enable;
    }

    private _drawToRender2D(submit: SubmitBase) {
        let mesh = this._mesh;
        if (mesh.indexNum <= 0)
            return;
        let shaderValue = submit.shaderValue;
        let shaderdata = shaderValue.shaderData;
        switch (submit._key.blendShader) {
            case 1://add
            case 3://screen
            case 5://light
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE);
                break;
            case 2://BlendMultiply
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_DST_COLOR);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
                break;
            case 6://mask
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ZERO);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_SRC_ALPHA);
                break;
            case 7://destination
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ZERO);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ZERO);
                break;
            case 9:// not premul alpha
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_SRC_ALPHA);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
                break;
            default:// premul alpha
                shaderdata.setInt(Shader3D.BLEND_SRC, RenderState.BLENDPARAM_ONE);
                shaderdata.setInt(Shader3D.BLEND_DST, RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA);
        }

        if (submit._colorFiler) {
            var ft = submit._colorFiler;
            shaderValue.setFilter(ft);
            Matrix4x4.TEMPMatrix0.cloneByArray(ft._mat);
            shaderdata.setMatrix4x4(ShaderDefines2D.UNIFORM_COLORMAT, Matrix4x4.TEMPMatrix0);
            Vector4.tempVec4.setValue(ft._alpha[0], ft._alpha[1], ft._alpha[2], ft._alpha[3]);
            shaderdata.setVector(ShaderDefines2D.UNIFORM_COLORALPHA, Vector4.tempVec4);
        }
        
        this._drawMesh(mesh, 0, mesh.vertexNum, submit._startIdx, mesh.indexNum, submit.shaderValue);
        this.stopMerge=false;
    }

    //TODO 目前是为了方便，从设计上这样是不是不太好
    private _drawMesh(mesh: Mesh2D, vboff: number, vertNum: number, iboff: number, indexNum: number, shaderValue: Value2D) {
        if (mesh.indexNum) {
            let render2D = this._render2D;
            render2D.draw(
                mesh,
                vboff, vertNum * mesh.vertexDeclarition.vertexStride,
                iboff, indexNum * 2,
                shaderValue
            );
        }
        mesh.clearMesh();
    }

    /**
     * @internal
     * @param	tex {Texture | RenderTexture }
     * @param  imgid 图片id用来比较合并的
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @param	m
     * @param	alpha
     * @param	uv
     * @return
     */
    _inner_drawTexture(tex: Texture | BaseTexture, imgid: number, x: number, y: number, width: number, height: number, m: Matrix | null, uv: ArrayLike<number> | null, alpha: number, lastRender: boolean, color: number): boolean {
        if (width <= 0 || height <= 0) {
            return false;
        }
        var preKey = this._curSubmit._key;
        uv = uv || (tex as Texture)._uv
        //为了优化，如果上次是画三角形，并且贴图相同，会认为他们是一组的，把这个也转成三角形，以便合并。
        //因为好多动画是drawTexture和drawTriangle混用的
        if (preKey.submitType === SubmitBase.KEY_TRIANGLES && preKey.other === imgid) {
            var tv = this._drawTexToDrawTri_Vert;
            tv[0] = x; tv[1] = y; tv[2] = x + width, tv[3] = y, tv[4] = x + width, tv[5] = y + height, tv[6] = x, tv[7] = y + height;
            this._drawTriUseAbsMatrix = true;
            var tuv = this._tempUV;
            tuv[0] = uv[0]; tuv[1] = uv[1]; tuv[2] = uv[2]; tuv[3] = uv[3]; tuv[4] = uv[4]; tuv[5] = uv[5]; tuv[6] = uv[6]; tuv[7] = uv[7];
            this.drawTriangles(tex as Texture, 0, 0, tv, tuv, this._drawTexToDrawTri_Index, m || this._curMat, alpha, null, null);//用tuv而不是uv会提高效率
            this._drawTriUseAbsMatrix = false;
            return true;
        }

        var submit = this._curSubmit;
        var ops: any[] = lastRender ? this._charSubmitCache.getPos() : this._transedPoints;

        //凡是这个都是在_mesh上操作，不用考虑samekey
        this.transformQuad(x, y, width || tex.width, height || tex.height, this._italicDeg, m || this._curMat, ops);

        if (this.drawTexAlign) {
            var round: Function = Math.round;
            ops[0] = round(ops[0]);//  (ops[0] + 0.5) | 0;	// 这么计算负的时候会有问题
            ops[1] = round(ops[1]);
            ops[2] = round(ops[2]);
            ops[3] = round(ops[3]);
            ops[4] = round(ops[4]);
            ops[5] = round(ops[5]);
            ops[6] = round(ops[6]);
            ops[7] = round(ops[7]);
            this.drawTexAlign = false;	//一次性的
        }

        var rgba = this._mixRGBandAlpha(color, this._alpha * alpha);

        //lastRender = false;
        if (lastRender) {
            this._charSubmitCache.add(this, tex as Texture, imgid, ops, uv, rgba);
            return true;
        }

        this._drawCount++;

        var sameKey = (imgid >= 0 && preKey.submitType === SubmitBase.KEY_DRAWTEXTURE && preKey.other === imgid) &&
            !this.isStopMerge(this._curSubmit) &&
            this._mesh.vertexNum + 4 < Context._MAXVERTNUM &&
            this._curSubmit.material == this.material

        if (!sameKey) {
            this._drawToRender2D(this._curSubmit);
            this._mesh = this._meshQuatTex;
        }
        this._lastTex = tex as Texture;

        if (!sameKey) {
            let shaderValue = Value2D.create(RenderSpriteData.Texture2D);
            this.fillShaderValue(shaderValue);
            shaderValue.textureHost = tex;
            this._curSubmit = submit = SubmitBase.create(this, this._mesh, shaderValue);
            submit._key.other = imgid;
            this._copyClipInfo(submit.shaderValue);
            submit.clipInfoID = this._clipInfoID;
        }
        (this._mesh as MeshQuadTexture).addQuad(ops, uv, rgba, true);
        submit._numEle += 6;
        return true;
    }

    private fillShaderValue(shaderValue: Value2D) {
        shaderValue.size = new Vector2(this._width, this._height);
        this._copyClipInfo(shaderValue);
    }
    /**
     * pt所描述的多边形完全在clip外边，整个被裁掉了
     * @param	pt
     * @return
     */
    private clipedOff(pt: any[]): boolean {
        //TODO
        if (this._clipRect.width <= 0 || this._clipRect.height <= 0)
            return true;
        return false;
    }

    /**
     * 应用当前矩阵。把转换后的位置放到输出数组中。 
     * @param	x
     * @param	y
     * @param	w
     * @param	h
     * @param   italicDeg 倾斜角度，单位是度。0度无，目前是下面不动。以后要做成可调的
     */
    private transformQuad(x: number, y: number, w: number, h: number, italicDeg: number, m: Matrix, out: any[]): void {
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
        if (m._bTransform) {
            out[0] = a0 * ma + a1 * mc + tx; out[1] = a0 * mb + a1 * md + ty;
            out[2] = a2 * ma + a3 * mc + tx; out[3] = a2 * mb + a3 * md + ty;
            out[4] = a4 * ma + a5 * mc + tx; out[5] = a4 * mb + a5 * md + ty;
            out[6] = a6 * ma + a7 * mc + tx; out[7] = a6 * mb + a7 * md + ty;
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
            out[0] = a0 + tx; out[1] = a1 + ty;
            out[2] = a2 + tx; out[3] = a3 + ty;
            out[4] = a4 + tx; out[5] = a5 + ty;
            out[6] = a6 + tx; out[7] = a7 + ty;
        }
    }

    /**
     * 强制拒绝submit合并
     * 例如切换rt的时候
     */
    breakNextMerge(): void {
        this.stopMerge = true;
    }

    private _repaintSprite(): void {
        this.sprite && this.sprite.repaint();
    }

    /**
     * 
     * @param	tex
     * @param	x			
     * @param	y
     * @param	width
     * @param	height
     * @param	transform	图片本身希望的矩阵
     * @param	tx			节点的位置
     * @param	ty
     * @param	alpha
     */
    drawTextureWithTransform(tex: Texture, x: number, y: number, width: number, height: number, transform: Matrix | null, tx: number, ty: number, alpha: number, blendMode: string | null, uv?: number[], color = 0xffffffff): void {
        var oldcomp: string;
        var curMat = this._curMat;
        if (blendMode) {
            oldcomp = this.globalCompositeOperation;
            this.globalCompositeOperation = blendMode;
        }

        if (!transform) {
            this._drawTextureM(tex, x + tx, y + ty, width, height, curMat, alpha, uv, color);
            if (blendMode) {
                this.globalCompositeOperation = oldcomp;
            }
            return;
        }
        var tmpMat = this._tmpMatrix;
        //克隆transform,因为要应用tx，ty，这里不能修改原始的transform
        tmpMat.a = transform.a; tmpMat.b = transform.b; tmpMat.c = transform.c; tmpMat.d = transform.d; tmpMat.tx = transform.tx + tx; tmpMat.ty = transform.ty + ty;
        tmpMat._bTransform = transform._bTransform;

        if (transform && curMat._bTransform) {
            // 如果当前矩阵不是只有平移，则只能用mul的方式
            Matrix.mul(tmpMat, curMat, tmpMat);
            transform = tmpMat;
            transform._bTransform = true;
        } else {
            //如果curmat没有旋转。
            tmpMat.tx += curMat.tx;
            tmpMat.ty += curMat.ty;
            transform = tmpMat;
        }
        this._drawTextureM(tex, x, y, width, height, transform, alpha, uv, color);
        if (blendMode)
            this.globalCompositeOperation = oldcomp;
    }

    drawGeo(geo: IRenderGeometryElement, material: Material, x: number, y: number) {
        let mat = this._curMat;
        let buffer = this._matBuffer;
        buffer[0] = mat.a;
        buffer[1] = mat.b;
        buffer[2] = mat.tx + mat.a * x + mat.c * y;
        buffer[3] = mat.c;
        buffer[4] = mat.d;
        buffer[5] = mat.ty + mat.b * x + mat.d * y;
        material.setBuffer("u_NMatrix", buffer);
        material.setVector2("u_size",new Vector2(this._width,this._height));//TODO LAOGUO
        this._render2D.drawMesh(geo, material);
    }

    drawGeos(geo: IRenderGeometryElement,elements:[Material,number,number][], x: number, y: number) {
        let mat = this._curMat;
        let buffer = this._matBuffer;
        buffer[0] = mat.a;
        buffer[1] = mat.b;
        buffer[2] = mat.tx + mat.a * x + mat.c * y;
        buffer[3] = mat.c;
        buffer[4] = mat.d;
        buffer[5] = mat.ty + mat.b * x + mat.d * y;
        for(let i = 0,n = elements.length;i < n;i++){
            let material = elements[i][0];
            material.setBuffer("u_NMatrix", buffer);
            material.setVector2("u_size",new Vector2(this._width,this._height));//TODO LAOGUO
            geo.clearRenderParams();
            geo.setDrawElemenParams(elements[i][1],elements[i][2]);
            this._render2D.drawMesh(geo, material);
        }
    }

    drawTriangles(tex: Texture,
        x: number, y: number,
        vertices: Float32Array,
        uvs: Float32Array,
        indices: Uint16Array,
        matrix: Matrix, alpha: number|null, blendMode: string, colorNum = 0xffffffff): void {

        if(alpha==null) alpha=1.0;
        
        if (!tex._getSource()) { //source内调用tex.active();
            if (this.sprite) {
                ILaya.systemTimer.callLater(this, this._repaintSprite);
            }
            return;
        }
        var oldcomp: string | null = null;
        if (blendMode) {
            oldcomp = this.globalCompositeOperation;
            this.globalCompositeOperation = blendMode;
        }
        this._drawCount++;

        // 为了提高效率，把一些变量放到这里
        var tmpMat = this._tmpMatrix;
        var webGLImg = tex.bitmap;
        var preKey: SubmitKey = this._curSubmit._key;
        var sameKey = preKey.submitType === SubmitBase.KEY_TRIANGLES &&
            preKey.other === webGLImg.id &&
            preKey.blendShader == this._nBlendType &&
            this._mesh.vertexNum + vertices.length / 2 < Context._MAXVERTNUM &&
            this._curSubmit.material == this.material;

        if (!sameKey) {
            this._drawToRender2D(this._curSubmit);
            this._mesh = this._meshTex;
        }
        //var rgba:int = mixRGBandAlpha(0xffffffff);
        //rgba = _mixRGBandAlpha(rgba, alpha);	这个函数有问题，不能连续调用，输出作为输入
        if (!sameKey) {
            //添加一个新的submit
            var submit = this._curSubmit = SubmitBase.create(this, this._mesh, 
                Value2D.create(RenderSpriteData.Texture2D));
            submit.shaderValue.textureHost = tex;
            this.fillShaderValue(submit.shaderValue);
            submit._key.submitType = SubmitBase.KEY_TRIANGLES;
            submit._key.other = webGLImg.id;
            this._copyClipInfo(submit.shaderValue);
            submit.clipInfoID = this._clipInfoID;
        }

        var rgba = this._mixRGBandAlpha(colorNum, this._alpha * alpha);
        if (!this._drawTriUseAbsMatrix) {
            if (!matrix) {
                tmpMat.a = 1; tmpMat.b = 0; tmpMat.c = 0; tmpMat.d = 1; tmpMat.tx = x; tmpMat.ty = y;
            } else {
                tmpMat.a = matrix.a; tmpMat.b = matrix.b; tmpMat.c = matrix.c; tmpMat.d = matrix.d; tmpMat.tx = matrix.tx + x; tmpMat.ty = matrix.ty + y;
            }
            Matrix.mul(tmpMat, this._curMat, tmpMat);
            //由于2d动画部分的uvs是绝对的（例如图集的话就是相对图集的）所以最后不传uvrect了。
            (this._mesh as MeshTexture).addData(vertices, uvs, indices, tmpMat || this._curMat, rgba,null);
        } else {
            // 这种情况是drawtexture转成的drawTriangle，直接使用matrix就行，传入的xy都是0
            (this._mesh as MeshTexture).addData(vertices, uvs, indices, matrix, rgba,null);
        }
        this._curSubmit._numEle += indices.length;

        if (blendMode) {
            this.globalCompositeOperation = oldcomp!;
        }
        //return true;
    }

    transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
        SaveTransform.save(this);
        Matrix.mul(Matrix.TEMP.setTo(a, b, c, d, tx, ty), this._curMat, this._curMat);	//TODO 这里会有效率问题。一堆的set
        this._curMat._checkTransform();
    }

    rotate(angle: number): void {
        SaveTransform.save(this);
        this._curMat.rotateEx(angle);
    }

    scale(scaleX: number, scaleY: number): void {
        SaveTransform.save(this);
        this._curMat.scaleEx(scaleX, scaleY);
    }

    clipRect(x: number, y: number, width: number, height: number, escape?: boolean): void {
        SaveClipRect.save(this);
        if (this._clipRect == Context.MAXCLIPRECT) {
            this._clipRect = new Rectangle(x, y, width, height);
        } else {
            this._clipRect.width = width;
            this._clipRect.height = height;

            //把xy转换到当前矩阵空间。宽高不用转换，这样在shader中计算的时候就不用把方向normalize了
            this._clipRect.x = x;
            this._clipRect.y = y;
        }
        this._clipID_Gen++;
        this._clipID_Gen %= 10000;
        this._clipInfoID = this._clipID_Gen;

        if (escape) {
            defaultClipMatrix.copyTo(this._globalClipMatrix);
            return;
        }

        var cm: Matrix = this._globalClipMatrix;
        //TEMP 处理clip交集问题，这里有点问题，无法处理旋转，翻转
        var minx = cm.tx;
        var miny = cm.ty;
        var maxx = minx + cm.a;
        var maxy = miny + cm.d;
        //TEMP end

        if (this._clipRect.width >= Const.MAX_CLIP_SIZE) {
            cm.a = cm.d = Const.MAX_CLIP_SIZE;
            cm.b = cm.c = cm.tx = cm.ty = 0;
        } else {
            //其实就是矩阵相乘
            if (this._curMat._bTransform) {
                cm.tx = this._clipRect.x * this._curMat.a + this._clipRect.y * this._curMat.c + this._curMat.tx;
                cm.ty = this._clipRect.x * this._curMat.b + this._clipRect.y * this._curMat.d + this._curMat.ty;
                cm.a = this._clipRect.width * this._curMat.a;
                cm.b = this._clipRect.width * this._curMat.b;
                cm.c = this._clipRect.height * this._curMat.c;
                cm.d = this._clipRect.height * this._curMat.d;
            } else {
                cm.tx = this._clipRect.x + this._curMat.tx;
                cm.ty = this._clipRect.y + this._curMat.ty;
                cm.a = this._clipRect.width;
                cm.b = cm.c = 0;
                cm.d = this._clipRect.height;
            }
        }

        //TEMP 处理clip交集问题，这里有点问题，无法处理旋转,翻转
        if (cm.a > 0 && cm.d > 0) {
            var cmaxx = cm.tx + cm.a;
            var cmaxy = cm.ty + cm.d;
            if (cmaxx <= minx || cmaxy <= miny || cm.tx >= maxx || cm.ty >= maxy) {
                //超出范围了
                cm.a = -0.1; cm.d = -0.1;
            } else {
                if (cm.tx < minx) {
                    cm.a -= (minx - cm.tx);
                    cm.tx = minx;
                }
                if (cmaxx > maxx) {
                    cm.a -= (cmaxx - maxx);
                }
                if (cm.ty < miny) {
                    cm.d -= (miny - cm.ty);
                    cm.ty = miny;
                }
                if (cmaxy > maxy) {
                    cm.d -= (cmaxy - maxy);
                }
                if (cm.a <= 0) cm.a = -0.1;
                if (cm.d <= 0) cm.d = -0.1;
            }
        }
        //TEMP end
    }

    startRender() {
        this._render2D.renderStart(this._clear, this._clearColor);
        this.clear();
    }

    endRender() {
        this.flush();
        this._render2D.renderEnd();
        this._curSubmit = SubmitBase.RENDERBASE;
    }

    //合并mesh之后，最后一点数据还没有渲染，这里强制渲染
    drawLeftData() {
        //剩下的
        this._drawToRender2D(this._curSubmit);
    }

    flush() {
        this.drawLeftData();
        this._clipID_Gen = 0;
        this._path && this._path.reset();
        this._curSubmit = SubmitBase.RENDERBASE;
        this._flushCnt++;
        //charbook gc
        if (this._flushCnt % 60 == 0 && this.isMain) {
            if (TextRender.textRenderInst) {
                TextRender.textRenderInst.GC();
            }
        }
    }

    beginPath(convex = false): void {
        this._getPath().beginPath(convex);
    }

    closePath(): void {
        this._path.closePath();
    }

    /**
     * 添加一个path。
     * @param	points [x,y,x,y....]	这个会被保存下来，所以调用者需要注意复制。
     * @param	close	是否闭合
     * @param   convex 是否是凸多边形。convex的优先级是这个最大。fill的时候的次之。其实fill的时候不应该指定convex，因为可以多个path
     * @param	dx  需要添加的平移。这个需要在应用矩阵之前应用。
     * @param	dy
     */
    addPath(points: any[], close: boolean, convex: boolean, dx: number, dy: number): void {
        let sz = points.length;
        for (let i = 0; i < sz - 1; i += 2) {
            points[i] += dx;
            points[i + 1] += dy;
        }
        if (close && sz > 5 && (points[sz - 2] != points[0] || points[sz - 1] != points[1])) {
            points.push(points[0], points[1]);
        }
        this._getPath().push(points, convex);
    }

    fill(): void {
        var m = this._curMat;
        var tPath = this._getPath();
        var submit = this._curSubmit;
        var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType) &&
            !this.isStopMerge(submit) &&
            this._curSubmit.material == this.material;

        if (!sameKey) {
            this._drawToRender2D(submit);
            this._mesh = this._meshVG;
            this._curSubmit = this.addVGSubmit(this._mesh);
            this.fillShaderValue(this._curSubmit.shaderValue);
        }
        var rgba = this.mixRGBandAlpha(this.fillStyle.toInt());
        var curEleNum = 0;
        var idx: any[];
        //如果有多个path的话，要一起填充mesh，使用相同的颜色和alpha
        for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
            var p = tPath.paths[i];
            var vertNum = p.path.length / 2;
            if (vertNum < 3 || (vertNum == 3 && !p.convex))
                continue;
            var cpath: any[] = p.path.concat();
            // 应用矩阵转换顶点
            var pi = 0;
            var xp: number, yp: number;
            var _x: number, _y: number;
            if (m._bTransform) {
                for (pi = 0; pi < vertNum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = cpath[xp];
                    _y = cpath[yp];

                    cpath[xp] = m.a * _x + m.c * _y + m.tx;
                    cpath[yp] = m.b * _x + m.d * _y + m.ty;
                }
            } else {
                for (pi = 0; pi < vertNum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = cpath[xp];
                    _y = cpath[yp];
                    cpath[xp] = _x + m.tx;
                    cpath[yp] = _y + m.ty;
                }
            }

            if (this._mesh.vertexNum + vertNum > Context._MAXVERTNUM) {
                //;
                //顶点数超了，要先提交一次
                this._curSubmit._numEle += curEleNum;
                curEleNum = 0;
                //然后用新的mesh，和新的submit。
                this._mesh = new MeshVG();// MeshVG.getAMesh(this.isMain);
                this._curSubmit = this.addVGSubmit(this._mesh);
                this.fillShaderValue(this._curSubmit.shaderValue);
            }

            var curvert = this._mesh.vertexNum;
            //生成 ib
            if (p.convex) { //convex的ib比较容易
                var faceNum = vertNum - 2;
                idx = new Array(faceNum * 3);
                var idxpos = 0;
                for (var fi = 0; fi < faceNum; fi++) {
                    idx[idxpos++] = curvert;
                    idx[idxpos++] = fi + 1 + curvert;
                    idx[idxpos++] = fi + 2 + curvert;
                }
            }
            else {
                idx = Earcut.earcut(cpath, null, 2);	//返回索引
                if (curvert > 0) {
                    //修改ib
                    for (var ii = 0; ii < idx.length; ii++) {
                        idx[ii] += curvert;
                    }
                }
            }
            //填充mesh
            (this._mesh as MeshVG).addVertAndIBToMesh(cpath, rgba, idx);
            curEleNum += idx.length;
        }
        this._curSubmit._numEle += curEleNum;
    }

    private addVGSubmit(mesh: Mesh2D): SubmitBase {
        //elenum设为0，后面再加
        var submit: SubmitBase = SubmitBase.create(this, mesh, Value2D.create(RenderSpriteData.Primitive));
        this.fillShaderValue(submit.shaderValue);
        //submit._key.clear();
        //submit._key.blendShader = _submitKey.blendShader;	//TODO 这个在哪里赋值的啊
        submit._key.submitType = SubmitBase.KEY_VG;
        this._copyClipInfo(submit.shaderValue);
        submit.clipInfoID = this._clipInfoID;
        return submit;
    }

    stroke(): void {
        if (this.lineWidth <= 0)
            return;
        var rgba = this.mixRGBandAlpha(this.strokeStyle._color.numColor);
        var tPath = this._getPath();
        var submit = this._curSubmit;
        var sameKey = (submit._key.submitType === SubmitBase.KEY_VG && submit._key.blendShader === this._nBlendType) &&
            !this.isStopMerge(submit) &&
            this._curSubmit.material == this.material

        if (!sameKey) {
            this._drawToRender2D(this._curSubmit);
            this._mesh = this._meshVG;
            this._curSubmit = this.addVGSubmit(this._mesh);
            this.fillShaderValue(this._curSubmit.shaderValue);
        }
        var curEleNum = 0;
        //如果有多个path的话，要一起填充mesh，使用相同的颜色和alpha
        for (var i = 0, sz = tPath.paths.length; i < sz; i++) {
            var p: any = tPath.paths[i];
            if (p.path.length <= 0)
                continue;
            var idx: any[] = [];
            var vertex: any[] = [];//x,y
            //p.path.loop;
            //填充vbib
            var maxVertexNum = p.path.length * 2;	//最大可能产生的顶点数。这个需要考虑考虑
            if (maxVertexNum < 2)
                continue;
            if (this._mesh.vertexNum + maxVertexNum > Context._MAXVERTNUM) {
                //顶点数超了，要先提交一次
                this._curSubmit._numEle += curEleNum;
                curEleNum = 0;
                this._drawToRender2D(this._curSubmit);
                //然后用新的mesh，和新的submit。
                this._mesh = new MeshVG();// MeshVG.getAMesh(this.isMain);
                this._curSubmit = this.addVGSubmit(this._mesh);
                this.fillShaderValue(this._curSubmit.shaderValue);
            }
            //这个需要放在创建新的mesh的后面，因为需要mesh.vertNum,否则如果先调用这个，再创建mesh，那么ib就不对了
            BasePoly.createLine2(p.path, idx, this.lineWidth, this._mesh.vertexNum, vertex, p.loop);	//_pathMesh.vertNum 是要加到生成的ib上的
            // 变换所有的点
            var ptnum = vertex.length / 2;
            var m: Matrix = this._curMat;
            var pi = 0;
            var xp: number, yp: number;
            var _x: number, _y: number;
            if (m._bTransform) {
                for (pi = 0; pi < ptnum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = vertex[xp];
                    _y = vertex[yp];

                    vertex[xp] = m.a * _x + m.c * _y + m.tx;
                    vertex[yp] = m.b * _x + m.d * _y + m.ty;
                }
            } else {
                for (pi = 0; pi < ptnum; pi++) {
                    xp = pi << 1;
                    yp = xp + 1;
                    _x = vertex[xp];
                    _y = vertex[yp];
                    vertex[xp] = _x + m.tx;
                    vertex[yp] = _y + m.ty;
                }
            }

            //this.drawPoly(0, 0, p.path, fillStyle._color.numColor, 0, 0, p.convex);
            //填充mesh
            (this._mesh as MeshVG).addVertAndIBToMesh(vertex, rgba, idx);
            curEleNum += idx.length;
        }
        this._curSubmit._numEle += curEleNum;
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
     * @param	x
     * @param	y
     * @param	b 是否应用矩阵
     */
    lineTo(x: number, y: number): void {
        var tPath: Path = this._getPath();
        if (Math.abs(x - tPath._lastOriX) < 1e-3 && Math.abs(y - tPath._lastOriY) < 1e-3)//不判断的话，下面的画线算法受不了
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

        len1 = r / Math.tan(halfAng);
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
            var fda = fChgAng / Context.SEGNUM;
            sinx = Math.sin(fda);
            cosx = Math.cos(fda);
        }
        else {
            fChgAng = -halfAng * 2;
            fda = fChgAng / Context.SEGNUM;
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
        for (i = 0; i < Context.SEGNUM; i++) {
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

    arc(cx: number, cy: number, rx: number, ry: number, startAngle: number, endAngle: number, counterclockwise = false, b = true, minNum = 10): void {
        /* TODO 缓存还没想好
        if (mId != -1) {
            var tShape:IShape = VectorGraphManager.getInstance().shapeDic[this.mId];
            if (tShape) {
                if (mHaveKey && !tShape.needUpdate(_curMat))
                    return;
            }
            cx = 0;
            cy = 0;
        }
        */
        var a = 0, da = 0, hda = 0, kappa = 0;
        var dx = 0, dy = 0, x = 0, y = 0, tanx = 0, tany = 0;
        var i: number, ndivs: number, nvals: number;

        // Clamp angles
        da = endAngle - startAngle;
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
        var sx = this.getMatScaleX();
        var sy = this.getMatScaleY();
        var sr = rx * (sx > sy ? sx : sy);
        var cl = 2 * Math.PI * sr;
        ndivs = (Math.max(cl / minNum, minNum)) | 0;

        hda = (da / ndivs) / 2.0;
        kappa = Math.abs(4 / 3 * (1 - Math.cos(hda)) / Math.sin(hda));
        if (counterclockwise)
            kappa = -kappa;

        nvals = 0;
        var tPath: Path = this._getPath();
        for (i = 0; i <= ndivs; i++) {
            a = startAngle + da * (i / ndivs);
            dx = Math.cos(a);
            dy = Math.sin(a);
            x = cx + dx * rx;
            y = cy + dy * ry;
            if (x != this._path._lastOriX || y != this._path._lastOriY) {
                //var _tx1:Number = x, _ty1:Number = y;
                //x = _curMat.a * _tx1 + _curMat.c * _ty1 + _curMat.tx;
                //y = _curMat.b * _tx1 + _curMat.d * _ty1 + _curMat.ty;
                tPath.addPoint(x, y);
            }
        }
        dx = Math.cos(endAngle);
        dy = Math.sin(endAngle);
        x = cx + dx * rx;
        y = cy + dy * ry;
        if (x != this._path._lastOriX || y != this._path._lastOriY) {
            //var _x2:Number = x, _y2:Number = y;
            //x = _curMat.a * _x2 + _curMat.c * _y2 + _curMat.tx;
            //y = _curMat.b * _x2 + _curMat.d * _y2 + _curMat.ty;
            tPath.addPoint(x, y);
        }
    }

    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void {
        var tBezier: Bezier = Bezier.I;
        var tResultArray: any[] = [];
        //var _x1:Number = x, _y1:Number = y;
        //x = _curMat.a * _x1 + _curMat.c * _y1 ;// + _curMat.tx;
        //y = _curMat.b * _x1 + _curMat.d * _y1;// + _curMat.ty;
        //_x1 = cpx, _y1 = cpy;
        //cpx = _curMat.a * _x1 + _curMat.c * _y1;// + _curMat.tx;
        //cpy = _curMat.b * _x1 + _curMat.d * _y1;// + _curMat.ty;
        var tArray: any[] = tBezier.getBezierPoints([this._path._lastOriX, this._path._lastOriY, cpx, cpy, x, y], 30, 2);
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

    strokeRect(x: number, y: number, width: number, height: number, parameterLineWidth: number): void {
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

    /**获取canvas*/
    //注意这个是对外接口
    get canvas(): HTMLCanvas {
        return this._canvas;
    }

    /**
     * 专用函数。通过循环创建来水平填充
     * @param	tex
     * @param	bmpid
     * @param	uv		希望循环的部分的uv
     * @param	oriw
     * @param	orih
     * @param	x
     * @param	y
     * @param	w
     */
    private _fillTexture_h(tex: Texture, imgid: number, uv: ArrayLike<number>, oriw: number, orih: number, x: number, y: number, w: number, color: number): void {
        if (oriw <= 0)
            console.error('_fillTexture_h error: oriw must>0');

        var stx = x;
        var num = Math.floor(w / oriw);
        var left = w % oriw;
        for (var i = 0; i < num; i++) {
            this._inner_drawTexture(tex, imgid, stx, y, oriw, orih, this._curMat, uv, 1, false, color);
            stx += oriw;
        }
        // 最后剩下的
        if (left > 0) {
            var du = uv[2] - uv[0];
            var uvr = uv[0] + du * (left / oriw);
            var tuv: any[] = Context.tmpuv1;
            tuv[0] = uv[0]; tuv[1] = uv[1]; tuv[2] = uvr; tuv[3] = uv[3];
            tuv[4] = uvr; tuv[5] = uv[5]; tuv[6] = uv[6]; tuv[7] = uv[7];
            this._inner_drawTexture(tex, imgid, stx, y, left, orih, this._curMat, tuv, 1, false, color);
        }
    }

    /**
     * 专用函数。通过循环创建来垂直填充
     * @param	tex
     * @param	imgid
     * @param	uv
     * @param	oriw
     * @param	orih
     * @param	x
     * @param	y
     * @param	h
     */
    private _fillTexture_v(tex: Texture, imgid: number, uv: ArrayLike<number>, oriw: number, orih: number, x: number, y: number, h: number, color: number): void {
        if (orih <= 0)
            console.error('_fillTexture_v error: orih must>0');
        var sty = y;
        var num = Math.floor(h / orih);
        var left = h % orih;
        for (var i = 0; i < num; i++) {
            this._inner_drawTexture(tex, imgid, x, sty, oriw, orih, this._curMat, uv, 1, false, color);
            sty += orih;
        }
        // 最后剩下的
        if (left > 0) {
            var dv = uv[7] - uv[1];
            var uvb = uv[1] + dv * (left / orih);
            var tuv: any[] = Context.tmpuv1;
            tuv[0] = uv[0]; tuv[1] = uv[1]; tuv[2] = uv[2]; tuv[3] = uv[3];
            tuv[4] = uv[4]; tuv[5] = uvb; tuv[6] = uv[6]; tuv[7] = uvb;
            this._inner_drawTexture(tex, imgid, x, sty, oriw, left, this._curMat, tuv, 1, false, color);
        }
    }

    private static tmpUVRect: any[] = [0, 0, 0, 0];
    drawTextureWithSizeGrid(tex: Texture, tx: number, ty: number, width: number, height: number, sizeGrid: any[], gx: number, gy: number, color: number): void {
        if (!tex._getSource())
            return;
        tx += gx;
        ty += gy;

        var uv = tex.uv, w = tex.bitmap.width, h = tex.bitmap.height;

        var top = sizeGrid[0];
        var left = sizeGrid[3];
        var right = sizeGrid[1];
        var bottom = sizeGrid[2];
        var repeat = sizeGrid[4];
        var needClip = false;

        if (width == tex.width) {
            left = right = 0;
        }
        if (height == tex.height) {
            top = bottom = 0;
        }

        var d_top = top / h;
        var d_left = left / w;
        var d_right = right / w;
        var d_bottom = bottom / h;

        //处理进度条不好看的问题
        // if (left + right > width) {
        // 	var clipWidth = width;
        // 	needClip = true;
        // 	width = left + right;
        // 	this.save();
        // 	this.clipRect(0 + tx, 0 + ty, clipWidth, height);
        // }

        var imgid = (tex.bitmap as Texture2D).id;
        var mat: Matrix = this._curMat;
        var tuv = this._tempUV;

        //解决九宫格设置left+right或top+bottom的累加值超过宽或高导致九宫格显示错乱的bug
        var scale_x = 1;
        var scale_y = 1;
        if (left + right > width) scale_x = width / (left + right);
        if (top + bottom > height) scale_y = height / (top + bottom);
        left *= scale_x;
        right *= scale_x;
        top *= scale_y;
        bottom *= scale_y;

        // 整图的uv
        // 一定是方的，所以uv只要左上右下就行
        var uvl = uv[0];
        var uvt = uv[1];
        var uvr = uv[4];
        var uvb = uv[5];

        // 小图的uv
        var uvl_ = uvl;
        var uvt_ = uvt;
        var uvr_ = uvr;
        var uvb_ = uvb;

        //绘制四个角
        // 构造uv
        if (left && top) {
            uvr_ = uvl + d_left;
            uvb_ = uvt + d_top;
            tuv[0] = uvl, tuv[1] = uvt, tuv[2] = uvr_, tuv[3] = uvt,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, tx, ty, left, top, mat, tuv, 1, false, color);
        }
        if (right && top) {
            uvl_ = uvr - d_right; uvt_ = uvt;
            uvr_ = uvr; uvb_ = uvt + d_top;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, width - right + tx, 0 + ty, right, top, mat, tuv, 1, false, color);
        }
        if (left && bottom) {
            uvl_ = uvl; uvt_ = uvb - d_bottom;
            uvr_ = uvl + d_left; uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, 0 + tx, height - bottom + ty, left, bottom, mat, tuv, 1, false, color);
        }
        if (right && bottom) {
            uvl_ = uvr - d_right; uvt_ = uvb - d_bottom;
            uvr_ = uvr; uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            this._inner_drawTexture(tex, imgid, width - right + tx, height - bottom + ty, right, bottom, mat, tuv, 1, false, color);
        }
        //绘制上下两个边
        if (top) {
            uvl_ = uvl + d_left; uvt_ = uvt;
            uvr_ = uvr - d_right; uvb_ = uvt + d_top;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, top, left + tx, ty, width - left - right, color);
            } else {
                this._inner_drawTexture(tex, imgid, left + tx, ty, width - left - right, top, mat, tuv, 1, false, color);
            }

        }
        if (bottom) {
            uvl_ = uvl + d_left; uvt_ = uvb - d_bottom;
            uvr_ = uvr - d_right; uvb_ = uvb;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_h(tex, imgid, tuv, tex.width - left - right, bottom, left + tx, height - bottom + ty, width - left - right, color);
            } else {
                this._inner_drawTexture(tex, imgid, left + tx, height - bottom + ty, width - left - right, bottom, mat, tuv, 1, false, color);
            }
        }
        //绘制左右两边
        if (left) {
            uvl_ = uvl; uvt_ = uvt + d_top;
            uvr_ = uvl + d_left; uvb_ = uvb - d_bottom;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_v(tex, imgid, tuv, left, tex.height - top - bottom, tx, top + ty, height - top - bottom, color);
            } else {
                this._inner_drawTexture(tex, imgid, tx, top + ty, left, height - top - bottom, mat, tuv, 1, false, color);
            }
        }
        if (right) {
            uvl_ = uvr - d_right; uvt_ = uvt + d_top;
            uvr_ = uvr; uvb_ = uvb - d_bottom;
            tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
                tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
            if (repeat) {
                this._fillTexture_v(tex, imgid, tuv, right, tex.height - top - bottom, width - right + tx, top + ty, height - top - bottom, color);
            } else {
                this._inner_drawTexture(tex, imgid, width - right + tx, top + ty, right, height - top - bottom, mat, tuv, 1, false, color);
            }
        }
        //绘制中间
        uvl_ = uvl + d_left; uvt_ = uvt + d_top;
        uvr_ = uvr - d_right; uvb_ = uvb - d_bottom;
        tuv[0] = uvl_, tuv[1] = uvt_, tuv[2] = uvr_, tuv[3] = uvt_,
            tuv[4] = uvr_, tuv[5] = uvb_, tuv[6] = uvl_, tuv[7] = uvb_;
        if (repeat) {
            var tuvr: any[] = Context.tmpUVRect;
            tuvr[0] = uvl_; tuvr[1] = uvt_;
            tuvr[2] = uvr_ - uvl_; tuvr[3] = uvb_ - uvt_;
            // 这个如果用重复的可能比较多，所以采用filltexture的方法，注意这样会打断合并
            this._fillTexture(tex, tex.width - left - right, tex.height - top - bottom, tuvr, left + tx, top + ty, width - left - right, height - top - bottom, 'repeat', 0, 0, color);
        } else {
            this._inner_drawTexture(tex, imgid, left + tx, top + ty, width - left - right, height - top - bottom, mat, tuv, 1, false, color);
        }

        if (needClip) this.restore();
    }
}


/** @internal */
class ContextParams {
    static DEFAULT: ContextParams;

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

