import { RenderTargetFormat } from "../RenderEngine/RenderEnum/RenderTargetFormat";
import { Const } from "../Const";
import { ColorFilter } from "../filters/ColorFilter";
import { LayaGL } from "../layagl/LayaGL";
import { Matrix } from "../maths/Matrix";
import { BlendEquationSeparate } from "../RenderEngine/RenderEnum/BlendEquationSeparate";
import { BlendFactor } from "../RenderEngine/RenderEnum/BlendFactor";
import { CullMode } from "../RenderEngine/RenderEnum/CullMode";
import { RenderStateType } from "../RenderEngine/RenderEnum/RenderStateType";
import { RenderStateCommand } from "../RenderEngine/RenderStateCommand";
import { ColorUtils } from "../utils/ColorUtils";
import { FontInfo } from "../utils/FontInfo";
import { HTMLChar } from "../utils/HTMLChar";
import { WordText } from "../utils/WordText";
import { BlendMode } from "../webgl/canvas/BlendMode";
import { NativeWebGLCacheAsNormalCanvas } from "../webgl/canvas/NativeWebGLCacheAsNormalCanvas";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { ISubmit } from "../webgl/submit/ISubmit";
import { HTMLCanvas } from "./HTMLCanvas";
import { RenderTexture2D } from "./RenderTexture2D";
import { Texture } from "./Texture";
import { BufferState } from "../webgl/utils/BufferState";
import { RenderTexture } from "./RenderTexture";

enum CONTEXT2D_FUNCTION_ID {
    SIZE = 0,
    CLEAR,
    SAVE,
    TRANSFORM,
    ALPHA,
    RESTORE,
    FILL_STYLE,
    FILL_RECT,
    STROKE_STYLE,
    LINE_WIDTH,
    STROKE_RECT,
    FILL_WORD_TEXT,
    DRAW_TEXTURE_SIZE_GRID,
    DRAW_TEXTURE,
    CLIP_RECT,
    DRAW_LINE,
    DRAW_LINES,
    SCALE,
    TRANSLATE,
    ROTATE,
    DRAW_CIRCLE,
    DRAW_PIE,
    DRAW_POLY,
    DRAW_CURVES,
    BEGIN_PATH,
    MOVE_TO,
    LINE_TO,
    ARC_TO,
    CLOSE_PATH,
    FILL,
    STROKE,
    SET_AS_BITMAP,
    DRAW_MASKED,
    DRAW_TRANGLES,
    SET_GLOBAL_COMPOSITE_OPERTAION,
    FILL_WORDS,
}

export class NativeContext {
    public static readonly ARRAY_BUFFER_TYPE_DATA = 0;          //创建ArrayBuffer时的类型为Data
    public static readonly ARRAY_BUFFER_TYPE_CMD = 1;           //创建ArrayBuffer时的类型为Command
    public static readonly ARRAY_BUFFER_REF_REFERENCE = 0;          //创建ArrayBuffer时的类型为引用
    public static readonly ARRAY_BUFFER_REF_COPY = 1;               //创建ArrayBuffer时的类型为拷贝

    public _idata: Int32Array;
    public _fdata: Float32Array;
    public _byteArray: Uint8Array;
    public _buffer: ArrayBuffer;
    private _byteLen: number = 0;


    static ENUM_TEXTALIGN_DEFAULT: number = 0;
    static ENUM_TEXTALIGN_CENTER: number = 1;
    static ENUM_TEXTALIGN_RIGHT: number = 2;
    private _nativeObj: any;
    private _tempRenderTexture2D: any;
    sprite: any = null;
    private _renderObject3DList: any[] = [];
    /**@internal */
    _tmpMatrix: Matrix = new Matrix();
    static __init__(): void {
    }
    constructor() {
        this._nativeObj = new (window as any)._conchContext((LayaGL.renderEngine as any)._nativeObj);
        this._byteLen = 1024 * 512;
        this._tempRenderTexture2D = new RenderTexture2D(0, 0, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None);
        this._init(false);
    }
    _init(isSyncToRenderThread: boolean): void {
        this._buffer = new ArrayBuffer(this._byteLen);
        this._idata = new Int32Array(this._buffer);
        this._fdata = new Float32Array(this._buffer);
        this._byteArray = new Uint8Array(this._buffer);

        var bufferConchRef: any = (window as any).webglPlus.createArrayBufferRef(this._buffer, NativeContext.ARRAY_BUFFER_TYPE_CMD, isSyncToRenderThread, NativeContext.ARRAY_BUFFER_REF_REFERENCE);
        this._nativeObj.setSharedCommandBuffer(bufferConchRef);
        //this._layagl.createArrayBufferRef(this._buffer, NativeCommandEncoder.ARRAY_BUFFER_TYPE_CMD, isSyncToRenderThread);
        this._idata[0] = 1;
    }
    _need(sz: number): void {
        if ((this._byteLen - (this._idata[0] << 2)) >= sz) return;
        this._nativeObj.flushCommand();
        if (sz > this._byteLen) {
            throw "too big";
        }
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

    /**@private */
    clearRect(x: number, y: number, width: number, height: number): void {
    }

    set isMain(value: boolean) {
        this._nativeObj.flushCommand();
        this._nativeObj.isMain = value;
    }
    get isMain() {
        this._nativeObj.flushCommand();
        return this._nativeObj.isMain;
    }
    set _targets(target: RenderTexture2D) {
        throw new Error("Method not implemented.");
    }
    get _targets(): RenderTexture2D {
        this._nativeObj.flushCommand();
        let target = this._nativeObj._target;
        //if (target && !this._tempRenderTexture2D._renderTarget) {
        if (target) {
            this._tempRenderTexture2D.width = this._nativeObj.width;
            this._tempRenderTexture2D.height = this._nativeObj.height;
            this._tempRenderTexture2D._nativeObj = target;
            this._tempRenderTexture2D._renderTarget = target._renderTarget;
            this._tempRenderTexture2D._texture = target._renderTarget._textures[0];
            return this._tempRenderTexture2D;
        }
        return null;
    }
    alpha(value: number): void {
        //this._nativeObj.globalAlpha *= value;
        //this.add_if(CONTEXT2D_FUNCTION_ID.ALPHA, value);
        this.globalAlpha *= value;
    }
    flush(): void {
        BufferState._curBindedBufferState && BufferState._curBindedBufferState.unBind();
        //this._nativeObj.flush();
        this._nativeObj.flushCommand();
        this._nativeObj.flush();

    }
    clear(): void {
        //this._nativeObj.clear();
        this.add_i(CONTEXT2D_FUNCTION_ID.CLEAR);
        this._nativeObj.flushCommand();
        this._renderObject3DList.length = 0;
    }
    /**
     * 释放所有资源
     * @param	keepRT  是否保留rendertarget
     */
     destroy(keepRT: boolean = false): void {
        this._nativeObj.flushCommand();
        if (this._tempRenderTexture2D._nativeObj) {
            this._tempRenderTexture2D._nativeObj._deleteRT = keepRT;
        }
        this._nativeObj.destroy(keepRT);
    }
    
    static const2DRenderCMD: RenderStateCommand;
    static set2DRenderConfig(): void {
       
        if (!NativeContext.const2DRenderCMD) {
            const cmd = NativeContext.const2DRenderCMD = LayaGL.renderEngine.createRenderStateComand();
            cmd.addCMD(RenderStateType.BlendType, true);
            //WebGLContext.setBlendEquation(gl, gl.FUNC_ADD);
            cmd.addCMD(RenderStateType.BlendEquation, BlendEquationSeparate.ADD);
            BlendMode.activeBlendFunction = null;// 防止submit不设置blend
            //WebGLContext.setBlendFunc(gl, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            cmd.addCMD(RenderStateType.BlendFunc, [BlendFactor.One, BlendFactor.OneMinusSourceAlpha]);
            //WebGLContext.setDepthTest(gl, false);
            cmd.addCMD(RenderStateType.DepthTest, false);
            //WebGLContext.setDepthMask(gl, true);
            cmd.addCMD(RenderStateType.DepthMask, true);
            //WebGLContext.setCullFace(gl, false);
            cmd.addCMD(RenderStateType.CullFace, false);
            //WebGLContext.setFrontFace(gl, gl.CCW);
            cmd.addCMD(RenderStateType.FrontFace, CullMode.Front);
        }
        NativeContext.const2DRenderCMD.applyCMD();
        RenderTexture.currentActive && RenderTexture.currentActive._end();
        (window as any).set2DRenderConfig();
        BufferState._curBindedBufferState && BufferState._curBindedBufferState.unBind();
    }
    set globalCompositeOperation(value: string) {
        //this._nativeObj.globalCompositeOperation = value;
        this.add_i_String(CONTEXT2D_FUNCTION_ID.SET_GLOBAL_COMPOSITE_OPERTAION, value);
    }

    get globalCompositeOperation(): string {
        this._nativeObj.flushCommand();
        return this._nativeObj.globalCompositeOperation;
    }
    set fillStyle(value: any) {
        var c: ColorUtils = ColorUtils.create(value);
        this.add_ii(CONTEXT2D_FUNCTION_ID.FILL_STYLE, c.numColor);
    }

    get fillStyle(): any {
        this._nativeObj.flushCommand();
        return this._nativeObj.fillStyle;
    }
    set globalAlpha(value: number) {
        this.add_if(CONTEXT2D_FUNCTION_ID.ALPHA, value);
    }

    get globalAlpha(): number {
        this._nativeObj.flushCommand();
        return this._nativeObj.globalAlpha;
    }
    save(): void {
        //this._nativeObj.save();
        this.add_i(CONTEXT2D_FUNCTION_ID.SAVE);
    }
    restore(): void {
        //this._nativeObj.restore();
        this.add_i(CONTEXT2D_FUNCTION_ID.RESTORE);
    }
    saveTransform(matrix: Matrix): void {
        //this._nativeObj.save();
        this.add_i(CONTEXT2D_FUNCTION_ID.SAVE);
    }
    transformByMatrix(matrix: Matrix, tx: number, ty: number): void {
        //this.transform(matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
        this.add_iffffff(CONTEXT2D_FUNCTION_ID.TRANSFORM, matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx + tx, matrix.ty + ty);
    }
    restoreTransform(matrix: Matrix): void {
        //this._nativeObj.restore();
        this.add_i(CONTEXT2D_FUNCTION_ID.RESTORE);
    }
    clipRect(x: number, y: number, width: number, height: number): void {
        //this._nativeObj.clipRect(x, y, width, height);
        this.add_iffff(CONTEXT2D_FUNCTION_ID.CLIP_RECT, x, y, width, height);
    }
    transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void {
        //this._nativeObj.transform(a, b, c, d, tx, ty);
        this.add_iffffff(CONTEXT2D_FUNCTION_ID.TRANSFORM, a, b, c, d, tx, ty);
    }
    scale(scaleX: number, scaleY: number): void {
        this.add_iff(CONTEXT2D_FUNCTION_ID.SCALE, scaleX, scaleY);
    }

    drawTexture(tex: Texture, x: number, y: number, width: number, height: number): void {
        if (!this.checkTexture(tex)) {
            return;
        }
        //this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width, height, (tex as any).uv);
        this.add_iiffffffffffff(CONTEXT2D_FUNCTION_ID.DRAW_TEXTURE, (tex as any).bitmap._texture.id, x, y, width, height
            , (tex as any).uv[0]
            , (tex as any).uv[1]
            , (tex as any).uv[2]
            , (tex as any).uv[3]
            , (tex as any).uv[4]
            , (tex as any).uv[5]
            , (tex as any).uv[6]
            , (tex as any).uv[7]);
    }
    drawTextureWithTransform(tex: Texture, x: number, y: number, width: number, height: number, transform: Matrix | null, tx: number, ty: number, alpha: number, blendMode: string | null, colorfilter: any/*ColorFilter*/ | null = null, uv?: number[]): void {
        if (!this.checkTexture(tex)) {
            return;
        }
        /*this._nativeObj.save();
        this._nativeObj.globalAlpha = alpha;
        if (transform) {
            this._nativeObj.transform(transform.a, transform.b, transform.c, transform.d, transform.tx + tx, transform.ty + ty);
            this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width || tex.width, height|| tex.height, uv || (tex as any).uv);
        }
        else {
            this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x + tx, y + ty, width || tex.width, height|| tex.height, uv || (tex as any).uv);
        }
        this._nativeObj.restore();*/
        this.save();
        this.alpha(alpha);
        var uvs: any = uv || (tex as any).uv;
        if (transform) {
            this.add_iffffff(CONTEXT2D_FUNCTION_ID.TRANSFORM, transform.a, transform.b, transform.c, transform.d, transform.tx + tx, transform.ty + ty);
            this.add_iiffffffffffff(CONTEXT2D_FUNCTION_ID.DRAW_TEXTURE, (tex as any).bitmap._texture.id, x, y, width || tex.width, height || tex.height
                , uvs[0]
                , uvs[1]
                , uvs[2]
                , uvs[3]
                , uvs[4]
                , uvs[5]
                , uvs[6]
                , uvs[7]);
        }
        else {
            this.add_iiffffffffffff(CONTEXT2D_FUNCTION_ID.DRAW_TEXTURE, (tex as any).bitmap._texture.id, x + tx, y + ty, width || tex.width, height || tex.height
                , uvs[0]
                , uvs[1]
                , uvs[2]
                , uvs[3]
                , uvs[4]
                , uvs[5]
                , uvs[6]
                , uvs[7]);
        }
        this.restore();
    }

    drawTextureWithSizeGrid(tex: Texture, tx: number, ty: number, width: number, height: number, sizeGrid: any[], gx: number, gy: number): void {
        if (!this.checkTexture(tex)) {
            return;
        }

        var uv = tex.uv, w: number = tex.bitmap.width, h: number = tex.bitmap.height;

        var top: number = sizeGrid[0];
        var left: number = sizeGrid[3];
        var right: number = sizeGrid[1];
        var bottom: number = sizeGrid[2];
        var repeat: boolean = sizeGrid[4];

        /*this._nativeObj.drawTextureWithSizeGrid((tex as any).bitmap._texture.id, tx, ty, width, height, top, right, bottom, left, repeat, gx, gy, uv[0]
            ,uv[1]
            ,uv[2]
            ,uv[3]
            ,uv[4]
            ,uv[5]
            ,uv[6]
            ,uv[7]);*/
        this.add_iiffffffffiffffffffff(
            CONTEXT2D_FUNCTION_ID.DRAW_TEXTURE_SIZE_GRID,
            (tex as any).bitmap._texture.id, tx, ty, width, height, top, right, bottom, left, repeat ? 1 : 0, gx, gy
            , uv[0]
            , uv[1]
            , uv[2]
            , uv[3]
            , uv[4]
            , uv[5]
            , uv[6]
            , uv[7]);
    }
    _drawTextureM(tex: Texture, x: number, y: number, width: number, height: number, transform: Matrix, alpha: number, uv: any[] | null): void {
        if (!this.checkTexture(tex)) {
            return;
        }
        /*this._nativeObj.save();
        this._nativeObj.globalAlpha = alpha;
        transform && this._nativeObj.transform(transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        this._nativeObj.drawTexture((tex as any).bitmap._texture.id, x, y, width || tex.width, height || tex.height, uv || (tex as any).uv);
        this._nativeObj.restore();*/

        this.save();
        this.alpha(alpha);
        if (transform) {
            this.add_iffffff(CONTEXT2D_FUNCTION_ID.TRANSFORM, transform.a, transform.b, transform.c, transform.d, transform.tx, transform.ty);
        }
        var uvs: any = uv || (tex as any).uv;
        this.add_iiffffffffffff(CONTEXT2D_FUNCTION_ID.DRAW_TEXTURE, (tex as any).bitmap._texture.id, x, y, width || tex.width, height || tex.height
            , uvs[0]
            , uvs[1]
            , uvs[2]
            , uvs[3]
            , uvs[4]
            , uvs[5]
            , uvs[6]
            , uvs[7]);
            this.restore();

    }
    translate(x: number, y: number): void {
        //this._nativeObj.translate(x, y);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, x, y);
    }
    _transform(mat: any/*Matrix*/, pivotX: number, pivotY: number): void {
        //this._nativeObj.translate(pivotX, pivotY);
        //this._nativeObj.transform(mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
        //this._nativeObj.translate(-pivotX, -pivotY);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, pivotX, pivotY);
        this.add_iffffff(CONTEXT2D_FUNCTION_ID.TRANSFORM, mat.a, mat.b, mat.c, mat.d, mat.tx, mat.ty);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, -pivotX, -pivotY);
    }
    _rotate(angle: number, pivotX: number, pivotY: number): void {
        //this._nativeObj.translate(pivotX, pivotY);
        //this._nativeObj.rotate(angle);
        //this._nativeObj.translate(-pivotX, -pivotY);

        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, pivotX, pivotY);
        this.add_if(CONTEXT2D_FUNCTION_ID.ROTATE, angle);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, -pivotX, -pivotY);
    }
    _scale(scaleX: number, scaleY: number, pivotX: number, pivotY: number): void {
        //this._nativeObj.translate(pivotX, pivotY);
        //this._nativeObj.scale(scaleX, scaleY);
        //this._nativeObj.translate(-pivotX, -pivotY);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, pivotX, pivotY);
        this.add_iff(CONTEXT2D_FUNCTION_ID.SCALE, scaleX, scaleY);
        this.add_iff(CONTEXT2D_FUNCTION_ID.TRANSLATE, -pivotX, -pivotY);
    }
    _drawLine(x: number, y: number, fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(lineColor);
        //this._nativeObj._drawLine(x, y, fromX, fromY, toX, toY, c1.numColor, lineWidth);
        this.add_iffffffif(CONTEXT2D_FUNCTION_ID.DRAW_LINE, x, y, fromX, fromY, toX, toY, c1.numColor, lineWidth);
    }
    _drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(lineColor);
        //this._nativeObj._drawLines(x, y, new Float32Array(points), c1.numColor, lineWidth);
        this.add_iffif_ab(CONTEXT2D_FUNCTION_ID.DRAW_LINES, x, y, c1.numColor, lineWidth, new Float32Array(points));
    }
    _drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        //this._nativeObj._drawCircle(x, y, radius, fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth);
        this.add_ifffiiiif(CONTEXT2D_FUNCTION_ID.DRAW_CIRCLE, x, y, radius, fillColor ? 1 : 0, c1.numColor, lineColor ? 1 : 0, c2.numColor, lineWidth);
    }
    _drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any, lineWidth: number, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        //this._nativeObj._drawPie(x, y, radius, startAngle, endAngle, fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth);
        this.add_ifffffiiiif(CONTEXT2D_FUNCTION_ID.DRAW_PIE, x, y, radius, startAngle, endAngle, fillColor ? 1 : 0, c1.numColor, lineColor ? 1 : 0, c2.numColor, lineWidth);
    }
    _drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any, lineWidth: number, isConvexPolygon: boolean, vid: number): void {
        var c1: ColorUtils = ColorUtils.create(fillColor);
        var c2: ColorUtils = ColorUtils.create(lineColor);
        //this._nativeObj._drawPoly(x, y, new Float32Array(points), fillColor ? true : false, c1.numColor, lineColor ? true : false, c2.numColor, lineWidth, isConvexPolygon);
        this.add_iffiiiifi_ab(CONTEXT2D_FUNCTION_ID.DRAW_POLY, x, y, fillColor ? 1 : 0, c1.numColor, lineColor ? 1 : 0, c2.numColor, lineWidth, isConvexPolygon ? 1 : 0, new Float32Array(points));
    }
    fillRect(x: number, y: number, width: number, height: number, fillColor: any) {
        if (fillColor != null) {
            var c: ColorUtils = ColorUtils.create(fillColor);
            this.add_ii(CONTEXT2D_FUNCTION_ID.FILL_STYLE, c.numColor);
        }
        this.add_i(CONTEXT2D_FUNCTION_ID.SAVE);
        this.add_iffff(CONTEXT2D_FUNCTION_ID.FILL_RECT, x, y, width, height);
        this.add_i(CONTEXT2D_FUNCTION_ID.RESTORE);
    }
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void {

        /*if (fillColor != null) {
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
        }*/

        if (fillColor != null) {
            var c1: ColorUtils = ColorUtils.create(fillColor);

            this.add_i(CONTEXT2D_FUNCTION_ID.SAVE);
            this.add_ii(CONTEXT2D_FUNCTION_ID.FILL_STYLE, c1.numColor);
            this.add_iffff(CONTEXT2D_FUNCTION_ID.FILL_RECT, x, y, width, height);
            this.add_i(CONTEXT2D_FUNCTION_ID.RESTORE);
        }
        if (lineColor != null) {
            var c2: ColorUtils = ColorUtils.create(lineColor);
            this.add_i(CONTEXT2D_FUNCTION_ID.SAVE);
            this.add_ii(CONTEXT2D_FUNCTION_ID.STROKE_STYLE, c2.numColor);
            this.add_if(CONTEXT2D_FUNCTION_ID.LINE_WIDTH, lineWidth);
            this.add_iffff(CONTEXT2D_FUNCTION_ID.STROKE_RECT, x, y, width, height);
            this.add_i(CONTEXT2D_FUNCTION_ID.RESTORE);
        }
    }
    _drawPath(x: number, y: number, paths: any[], brush: any, pen: any): void {
        //形成路径
        /*this._nativeObj.beginPath(false);
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
        }*/
        this.add_ii(CONTEXT2D_FUNCTION_ID.BEGIN_PATH, 0);

        for (var i: number = 0, n: number = paths.length; i < n; i++) {

            var path: any[] = paths[i];
            switch (path[0]) {
                case "moveTo":
                    this.add_iff(CONTEXT2D_FUNCTION_ID.MOVE_TO, x + path[1], y + path[2]);
                    break;
                case "lineTo":
                    this.add_iff(CONTEXT2D_FUNCTION_ID.LINE_TO, x + path[1], y + path[2]);
                    break;
                case "arcTo":
                    this.add_ifffff(CONTEXT2D_FUNCTION_ID.ARC_TO, x + path[1], y + path[2], x + path[3], y + path[4], path[5]);
                    break;
                case "closePath":
                    this.add_i(CONTEXT2D_FUNCTION_ID.CLOSE_PATH);
                    break;
            }
        }

        //var brush:Object = args[3];
        if (brush != null) {
            var c1: ColorUtils = ColorUtils.create(brush.fillStyle);
            this.add_ii(CONTEXT2D_FUNCTION_ID.FILL_STYLE, c1.numColor);
            this.add_i(CONTEXT2D_FUNCTION_ID.FILL);
        }

        //var pen:Object = args[4];
        if (pen != null) {
            var c2: ColorUtils = ColorUtils.create(pen.strokeStyle);
            this.add_ii(CONTEXT2D_FUNCTION_ID.STROKE_STYLE, c2.numColor);
            this.add_if(CONTEXT2D_FUNCTION_ID.LINE_WIDTH, pen.lineWidth || 1);
            //this._nativeObj.lineJoin = pen.lineJoin;
            //this._nativeObj.lineCap = pen.lineCap;
            //this._nativeObj.miterLimit = pen.miterLimit;
            this.add_i(CONTEXT2D_FUNCTION_ID.STROKE);
        }
    }
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void {
        var c1: ColorUtils = ColorUtils.create(lineColor);

        /*this._nativeObj.beginPath(false);
        this._nativeObj.strokeStyle = c1.numColor;
        this._nativeObj.lineWidth = lineWidth;
        //var points:Array = args[2];
        //x += args[0], y += args[1];
        this._nativeObj.moveTo(x + points[0], y + points[1]);
        var i: number = 2, n: number = points.length;
        while (i < n) {
            this._nativeObj.quadraticCurveTo(x + points[i++], y + points[i++], x + points[i++], y + points[i++]);
        }
        this._nativeObj.stroke();*/
        this.add_iffif_ab(CONTEXT2D_FUNCTION_ID.DRAW_CURVES, x, y, c1.numColor, lineWidth, new Float32Array(points));
    }
    drawCanvas(canvas: HTMLCanvas, x: number, y: number, width: number, height: number): void {
        if (!canvas) return;
        this._nativeObj.flushCommand();
        if (canvas instanceof (NativeWebGLCacheAsNormalCanvas)) {
            this._nativeObj.drawCanvasNormal(canvas._nativeObj, x, y, width, height);
            //this.add_iiffff(CONTEXT2D_FUNCTION_ID.DRAW_CANVAS_NORMAL, canvas._nativeObj.id, x, y, width, height);
        }
        else {
            this._nativeObj.drawCanvasBitmap((canvas.context as any)._nativeObj, x, y, width, height);
            //this.add_iiffff(CONTEXT2D_FUNCTION_ID.DRAW_CANVAS_BITMAP, (canvas.context as any)._nativeObj.id, x, y, width, height);
        }
    }
    fillText(txt: string | WordText, x: number, y: number, fontStr: string, color: string, align: string, lineWidth: number = 0, borderColor: string = ""): void {
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        if (typeof (txt) === 'string') {
            //this._nativeObj.fillWords(txt, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, nTextAlign, x, y, lineWidth, txt, fontStr)
        }
        else {
            //this._nativeObj.fillWordText((txt as any)._nativeObj.id, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (txt as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, lineWidth, nTextAlign, fontStr);
        }
    }
    // 与fillText的区别是没有border信息
    drawText(text: string | WordText, x: number, y: number, font: string, color: string, align: string): void {
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        if (typeof (text) === 'string') {
            //this._nativeObj.fillWords(text, x, y, font, c1.numColor, c2.numColor, 0, nTextAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, nTextAlign, x, y, 0, text, font)
        }
        else {
            //this._nativeObj.fillWordText((text as any)._nativeObj.id, x, y, font, c1.numColor, c2.numColor, 0, nTextAlign);
            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (text as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, 0, nTextAlign, font);
        }
    }
    fillWords(words: HTMLChar[], x: number, y: number, fontStr: string, color: string): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        var length = words.length;
        for (var i = 0; i < length; i++) {
            //this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, fontStr, c1.numColor, c2.numColor, 0, 0);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, 0, words[i].x + x, words[i].y + y, 0, words[i].char, fontStr);
        }
    }
    strokeWord(text: string | WordText, x: number, y: number, font: string, color: string, lineWidth: number, align: string): void {
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(null);
        if (typeof (text) === 'string') {
            //this._nativeObj.fillWords(text, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, nTextAlign, x, y, lineWidth, text, font);
        }
        else {
            //this._nativeObj.fillWordText((text as any)._nativeObj.id, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (text as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, lineWidth, nTextAlign, font);
        }
    }
    fillBorderText(txt: string | WordText, x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number, align: string): void {
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        if (typeof (txt) === 'string') {
            //this._nativeObj.fillWords(txt, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, nTextAlign, x, y, lineWidth, txt, font);
        }
        else {
            //this._nativeObj.fillWordText((txt as any)._nativeObj.id, x, y, font, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (txt as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, lineWidth, nTextAlign, font);
        }
    }
    fillBorderWords(words: HTMLChar[], x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(borderColor);
        var length = words.length;
        for (var i = 0; i < length; i++) {
            //this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, font, c1.numColor, c2.numColor, lineWidth, 0);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, 0, words[i].x + x, words[i].y + y, lineWidth, words[i].char, font);
        }
    }
    fillWords11(words: HTMLChar[], x: number, y: number, fontStr: FontInfo, color: string, strokeColor: string | null, lineWidth: number): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);
        var font = typeof (fontStr) === 'string' ? fontStr : (fontStr as any)._font;
        var length = words.length;
        for (var i = 0; i < length; i++) {
            //this._nativeObj.fillWords(words[i].char, words[i].x + x,  words[i].y + y, font, c1.numColor, c2.numColor, lineWidth, 0);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, 0, words[i].x + x, words[i].y + y, lineWidth, words[i].char, font);
        }
    }

    filltext11(data: string | WordText, x: number, y: number, fontStr: string, color: string, strokeColor: string, lineWidth: number, align: string): void {
        var nTextAlign = 0;
        switch (align) {
            case 'center':
                nTextAlign = Const.ENUM_TEXTALIGN_CENTER;
                break;
            case 'right':
                nTextAlign = Const.ENUM_TEXTALIGN_RIGHT;
                break;
        }
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);
        if (typeof (data) === 'string') {
            //this._nativeObj.fillWords(data, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, nTextAlign, x, y, lineWidth, data, fontStr)
        }
        else {
            //this._nativeObj.fillWordText((data as any)._nativeObj.id, x, y, fontStr, c1.numColor, c2.numColor, lineWidth, nTextAlign);
            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (data as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, lineWidth, nTextAlign, fontStr);
        }
    }

    /**@internal */
    _fast_filltext(data: string | WordText, x: number, y: number, fontObj: any, color: string, strokeColor: string | null, lineWidth: number, textAlign: number, underLine: number = 0): void {
        var c1: ColorUtils = ColorUtils.create(color);
        var c2: ColorUtils = ColorUtils.create(strokeColor);

        if (typeof (data) === 'string') {
            //this._nativeObj.fillWords(data, x, y, (fontObj as any)._font, c1.numColor, c2.numColor, lineWidth, textAlign);
            this.add_iiiifff_String_String(CONTEXT2D_FUNCTION_ID.FILL_WORDS, c1.numColor, c2.numColor, textAlign, x, y, lineWidth, data, (fontObj as any)._font)
        }
        else {

            this.add_iiffiifi_String(CONTEXT2D_FUNCTION_ID.FILL_WORD_TEXT, (data as any)._nativeObj.id, x, y, c1.numColor, c2.numColor, lineWidth, textAlign, (fontObj as any)._font);
            //this._nativeObj.fillWordText(data._nativeObj.id, x, y, (fontObj as any)._font, c1.numColor, c2.numColor, lineWidth, textAlign);
        }
    }
    drawTriangles(tex: Texture,
        x: number, y: number,
        vertices: Float32Array,
        uvs: Float32Array,
        indices: Uint16Array,
        matrix: Matrix, alpha: number, color: ColorFilter, blendMode: string, colorNum: number = 0xffffffff): void {
        if (!this.checkTexture(tex)) {
            return;
        } 
        var m: Matrix = matrix ? matrix : this._tmpMatrix;
        /*if (blendMode != null || color != null) {
            this._nativeObj.save(); 
            //to do ColorFilter
            this._nativeObj.globalCompositeOperation = blendMode;
            this._nativeObj.drawTriangles((tex as any).bitmap._texture.id, 
                x, y, 
                vertices, 
                uvs, 
                indices, 
                m.a, m.b,m.c,m.d,m.tx,m.ty, alpha, colorNum);
            this._nativeObj.restore();
        }
        else {
            this._nativeObj.drawTriangles((tex as any).bitmap._texture.id, 
            x, y, 
            vertices, 
            uvs, 
            indices, 
            m.a, m.b,m.c,m.d,m.tx,m.ty, alpha, colorNum)
        }*/

       
        if (blendMode != null || color != null) {
            this._nativeObj.save();
            //to do ColorFilter 
            this.add_i_String(CONTEXT2D_FUNCTION_ID.SET_GLOBAL_COMPOSITE_OPERTAION, blendMode);
            this._nativeObj.drawTriangles((tex as any).bitmap._texture.id,
                x, y,
                vertices,
                uvs,
                indices,
                m.a, m.b, m.c, m.d, m.tx, m.ty, alpha, colorNum);
            this._nativeObj.restore();
        }
        else {
            this._nativeObj.drawTriangles((tex as any).bitmap._texture.id,
                x, y,
                vertices,
                uvs,
                indices,
                m.a, m.b, m.c, m.d, m.tx, m.ty, alpha, colorNum)

            this.add_iiifffffffff_ab_ab_ab(CONTEXT2D_FUNCTION_ID.DRAW_TRANGLES, (tex as any).bitmap._texture.id, colorNum
                , x
                , y
                , alpha
                , m.a, m.b, m.c, m.d, m.tx, m.ty
                , vertices
                , uvs
                , indices
            );
        }
    }
    drawMask(w: number, h: number): any {
        //return this._nativeObj.drawMask(w, h);
        this._nativeObj.flushCommand();
        return this._nativeObj.drawMask(w, h);
    }
    drawMasked(x: number, y: number, w: number, h: number): void {
        //this._nativeObj.drawMasked(x, y, w, h);
        this.add_iffff(CONTEXT2D_FUNCTION_ID.DRAW_MASKED, x, y, w, h);
    }
    drawMaskComposite(rt: any, x: number, y: number, w: number, h: number): void {
        //this._nativeObj.drawMaskComposite(rt, x, y, w, h);
        this._nativeObj.flushCommand();
        this._nativeObj.drawMaskComposite(rt, x, y, w, h);
    }
    set asBitmap(value: boolean) {
        //this._nativeObj.setAsBitmap(value);
        this.add_ii(CONTEXT2D_FUNCTION_ID.SET_AS_BITMAP, value ? 1 : 0);
    }
    size(w: number, h: number): void {
        //this._nativeObj.size(w, h);
        this.add_iii(CONTEXT2D_FUNCTION_ID.SIZE, w, h);
    }
    setColorFilter(filter: ColorFilter): void {
        /*if (filter) {
            this._nativeObj.setColorFilter(true, filter._alpha, filter._mat);
        }
        else {
            this._nativeObj.setColorFilter(false, null, null);
        }*/
        this._nativeObj.flushCommand();
        if (filter) {
            this._nativeObj.setColorFilter(true, filter._alpha, filter._mat);
        }
        else {
            this._nativeObj.setColorFilter(false, null, null);
        }
    }
    drawTarget(rt: RenderTexture2D, x: number, y: number, width: number, height: number, matrix: Matrix, shaderValue: Value2D, uv: ArrayLike<number> | null = null, blend: number = -1): boolean {
        //return this._nativeObj.drawTarget(rt, x, y, width, height, matrix.a, matrix.b,matrix.c,matrix.d,matrix.tx,matrix.ty, blend);
        this._nativeObj.flushCommand();
        return this._nativeObj.drawTarget(rt, x, y, width, height, matrix.a, matrix.b, matrix.c, matrix.d, matrix.tx, matrix.ty, blend);
    }
    drawTargetBlurFilter(rt: RenderTexture2D, x: number, y: number, width: number, height: number, strength: number): void {
        //this._nativeObj.drawTargetBlurFilter(rt, x, y, width, height, strength);
        this._nativeObj.flushCommand();
        this._nativeObj.drawTargetBlurFilter(rt, x, y, width, height, strength);
    }
    get _curMat(): Matrix {
        /*var data: any = this._nativeObj._curMat;
        var mat: Matrix = Matrix.create();
        mat.a = data[0];
        mat.b = data[1];
        mat.c = data[2];
        mat.d = data[3];
        mat.tx = data[4];
        mat.ty = data[5];*/

        this._nativeObj.flushCommand();

        var data: any = this._nativeObj._curMat;
        var mat: Matrix = Matrix.create();
        mat.a = data[0];
        mat.b = data[1];
        mat.c = data[2];
        mat.d = data[3];
        mat.tx = data[4];
        mat.ty = data[5];

        return mat;
    }
    addRenderObject3D(scene3D: ISubmit): void {
        //this._nativeObj.addRenderObject3D((scene3D as any)._nativeObj);
        this._renderObject3DList.push(scene3D);
        this._nativeObj.flushCommand();
        this._nativeObj.addRenderObject3D((scene3D as any)._nativeObj);
    }
    pushRT(): void {
        //this._nativeObj.pushRT();

        this._nativeObj.flushCommand();
        this._nativeObj.pushRT();
    }
    popRT(): void {
        //this._nativeObj.popRT();

        this._nativeObj.flushCommand();
        this._nativeObj.popRT();
    }
    useRT(rt: RenderTexture2D): void {
        //this._nativeObj.useRT(rt);

        this._nativeObj.flushCommand();
        this._nativeObj.useRT(rt);
    }
    drawFilter(out: RenderTexture2D, src: RenderTexture2D, x: number, y: number, width: number, height: number): void {
        //this._nativeObj.drawFilter(out, src, x, y, width, height);

        this._nativeObj.flushCommand();
        this._nativeObj.drawFilter(out, src, x, y, width, height);
    }
    protected checkTexture(tex: Texture): boolean {
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
    add_i(i: number): void {
        this._need(4);
        this._idata[this._idata[0]++] = i;
    }
    add_ii(a: number, b: number): void {
        this._need(8);
        var i: number = this._idata[0];
        this._idata[i++] = a;
        this._idata[i++] = b;
        this._idata[0] = i;
    }
    add_if(a: number, b: number): void {
        this._need(8);
        var i: number = this._idata[0];
        this._idata[i++] = a;
        this._fdata[i++] = b;
        this._idata[0] = i;
    }
    add_iff(a: number, b: number, c: number): void {
        this._need(12);
        var i: number = this._idata[0];
        this._idata[i++] = a;
        this._fdata[i++] = b;
        this._fdata[i++] = c;
        this._idata[0] = i;
    }

    add_iffif(a: number, b: number, c: number, d: number, e: number) {
        this._need(20);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        this._idata[i++] = d;
        fdata[i++] = e;
        this._idata[0] = i;
    }

    add_iffff(a: number, b: number, c: number, d: number, e: number): void {
        this._need(20);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        this._idata[0] = i;
    }
    add_iii(a: number, b: number, c: number): void {
        this._need(12);
        var idata: Int32Array = this._idata;
        var i: number = this._idata[0];
        idata[i++] = a;
        idata[i++] = b;
        idata[i++] = c;
        this._idata[0] = i;
    }
    add_iiffff(a: number, b: number, c: number, d: number, e: number, f: number) {
        this._need(24);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        this._idata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        this._idata[0] = i;
    }
    add_ifffff(a: number, b: number, c: number, d: number, e: number, f: number) {
        this._need(24);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        this._idata[0] = i;
    }
    add_iffffff(a: number, b: number, c: number, d: number, e: number, f: number, g: number): void {
        this._need(28);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        this._idata[0] = i;
    }
    add_ifffiiiif(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number): void {
        this._need(36);
        var idata: Int32Array = this._idata;
        var i: number = idata[0];
        var fdata: Float32Array = this._fdata;
        idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        idata[i++] = e;
        idata[i++] = f;
        idata[i++] = g;
        idata[i++] = h;
        fdata[i++] = ii;
        idata[0] = i;
    }
    add_ifffffiiiif(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, j: number, k: number): void {
        this._need(44);
        var idata: Int32Array = this._idata;
        var i: number = idata[0];
        var fdata: Float32Array = this._fdata;
        idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        idata[i++] = g;
        idata[i++] = h;
        idata[i++] = ii;
        idata[i++] = j;
        fdata[i++] = k;
        idata[0] = i;
    }
    add_iffffffif(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number): void {
        this._need(36);
        var idata: Int32Array = this._idata;
        var i: number = idata[0];
        var fdata: Float32Array = this._fdata;
        idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        idata[i++] = h;
        fdata[i++] = ii;
        idata[0] = i;
    }
    add_String(ab: ArrayBuffer): void {
        var len: number = ab.byteLength;
        this._need(len + 4);
        this._idata[this._idata[0]++] = len;
        if (len == 0) return;
        var uint8array: Uint8Array = new Uint8Array(ab);
        this._byteArray.set(uint8array, this._idata[0] * 4);
        this._idata[0] += len / 4;
    }
    add_iffiiiifi(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number) {
        this._need(45);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        fdata[i++] = b;
        fdata[i++] = c;
        this._idata[i++] = d;
        this._idata[i++] = e;
        this._idata[i++] = f;
        this._idata[i++] = g;
        fdata[i++] = h;
        this._idata[i++] = ii;
        this._idata[0] = i;
    }
    add_iiffiifi(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number) {
        this._need(32);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        this._idata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        this._idata[i++] = e;
        this._idata[i++] = f;
        fdata[i++] = g;
        this._idata[i++] = h;
        this._idata[0] = i;
    }
    add_i_String(a: number, str: string): void {
        var ab: ArrayBuffer = (window as any).conch.strTobufer(str);
        this._need(4 + ab.byteLength + 4);
        this.add_i(a);
        this.add_String(ab);
    }
    add_iiiifff(a: number, b: number, c: number, d: number, e: number, f: number, g: number) {
        this._need(28);
        var i: number = this._idata[0];
        var fdata: Float32Array = this._fdata;
        this._idata[i++] = a;
        this._idata[i++] = b;
        this._idata[i++] = c;
        this._idata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        this._idata[0] = i;
    }
    add_iiffiifi_String(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, str: string): void {
        var ab: ArrayBuffer = (window as any).conch.strTobufer(str);
        this._need(32 + ab.byteLength + 4);
        this.add_iiffiifi(a, b, c, d, e, f, g, h);
        this.add_String(ab);
    }
    add_iiiifff_String_String(a: number, b: number, c: number, d: number, e: number, f: number, g: number, str0: string, str1: string): void {
        var ab0: ArrayBuffer = (window as any).conch.strTobufer(str0);
        var ab1: ArrayBuffer = (window as any).conch.strTobufer(str1);
        this._need(28 + (ab0.byteLength + 4) + (ab1.byteLength + 4));

        this.add_iiiifff(a, b, c, d, e, f, g);
        this.add_String(ab0);
        this.add_String(ab1);
    }
    add_iiffffffffffff(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, j: number, k: number, l: number, m: number, n: number) {
        this._need(56);
        var idata: Int32Array = this._idata;
        var i: number = idata[0];
        var fdata: Float32Array = this._fdata;
        idata[i++] = a;
        idata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        fdata[i++] = h;
        fdata[i++] = ii;
        fdata[i++] = j;
        fdata[i++] = k;
        fdata[i++] = l;
        fdata[i++] = m;
        fdata[i++] = n;
        idata[0] = i;
    }
    add_iiffffffffiffffffffff(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, j: number
        , k: number, l: number, m: number, n: number, o: number, p: number, q: number, r: number, s: number, t: number
        , u: number) {
        this._need(84);
        var idata: Int32Array = this._idata;
        var fdata: Float32Array = this._fdata;
        var i: number = idata[0];
        idata[i++] = a;
        idata[i++] = b;
        fdata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        fdata[i++] = h;
        fdata[i++] = ii;
        fdata[i++] = j;
        idata[i++] = k;
        fdata[i++] = l;
        fdata[i++] = m;
        fdata[i++] = n;
        fdata[i++] = o;
        fdata[i++] = p;
        fdata[i++] = q;
        fdata[i++] = r;
        fdata[i++] = s;
        fdata[i++] = t;
        fdata[i++] = u;
        idata[0] = i;
    }
    add_iiifffffffff(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, j: number
        , k: number, l: number) {
        this._need(48);
        var idata: Int32Array = this._idata;
        var fdata: Float32Array = this._fdata;
        var i: number = idata[0];
        idata[i++] = a;
        idata[i++] = b;
        idata[i++] = c;
        fdata[i++] = d;
        fdata[i++] = e;
        fdata[i++] = f;
        fdata[i++] = g;
        fdata[i++] = h;
        fdata[i++] = ii;
        fdata[i++] = j;
        fdata[i++] = k;
        fdata[i++] = l;
        idata[0] = i;
    }
    add_iiifffffffff_ab_ab_ab(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, j: number
        , k: number, l: number, arraybuffer0: any, arraybuffer1: any, arraybuffer2: any) {

        var nAlignLength0 = this.getAlignLength(arraybuffer0);
        var nAlignLength1 = this.getAlignLength(arraybuffer1);
        var nAlignLength2 = this.getAlignLength(arraybuffer2);
        d
        this._need(48 + (nAlignLength0 + 4) + (nAlignLength1 + 4) + (nAlignLength2 + 4));

        this.add_iiifffffffff(a, b, c, d, e, f, g, h, ii, j, k, l);
        this.wab(arraybuffer0, arraybuffer0.byteLength, nAlignLength0, 0);
        this.wab(arraybuffer1, arraybuffer1.byteLength, nAlignLength1, 0);
        this.wab(arraybuffer2, arraybuffer2.byteLength, nAlignLength2, 0);

    }
    wab(arraybuffer: any, length: number, nAlignLength: number, offset?: number): void {
        offset = offset ? offset : 0;
        this._need(nAlignLength + 4);
        //写入长度
        this._idata[this._idata[0]++] = length;
        //写入数据
        var uint8array: Uint8Array = null;
        if (arraybuffer instanceof Float32Array && offset == 0) {
            this._fdata.set(arraybuffer, this._idata[0]);
        }
        else {
            if (arraybuffer instanceof ArrayBuffer) {
                uint8array = new Uint8Array(arraybuffer, offset, length);
            }
            else if (arraybuffer.buffer) {
                uint8array = new Uint8Array(arraybuffer.buffer, offset + arraybuffer.byteOffset, length);
            }
            else {
                console.log("not arraybuffer/dataview");
                return;
            }
            this._byteArray.set(uint8array, this._idata[0] * 4);
        }
        this._idata[0] += nAlignLength / 4;
    }
    getAlignLength(data: any): number {
        var byteLength = data.byteLength;
        return (byteLength + 3) & 0xfffffffc;
    }
    add_iif_ab(a: number, b: number, c: number, arraybuffer: any) {
        var nAlignLength = this.getAlignLength(arraybuffer);
        this._need(12 + nAlignLength + 4);
        this.add_iff(a, b, c);
        this.wab(arraybuffer, arraybuffer.byteLength, nAlignLength, 0);
    }
    add_iffif_ab(a: number, b: number, c: number, d: number, e: number, arraybuffer: any) {
        var nAlignLength = this.getAlignLength(arraybuffer);
        this._need(20 + nAlignLength + 4);
        this.add_iffif(a, b, c, d, e);
        this.wab(arraybuffer, arraybuffer.byteLength, nAlignLength, 0);
    }
    add_iffiiiifi_ab(a: number, b: number, c: number, d: number, e: number, f: number, g: number, h: number, ii: number, arraybuffer: any) {
        var nAlignLength = this.getAlignLength(arraybuffer);
        this._need(45 + nAlignLength + 4);
        this.add_iffiiiifi(a, b, c, d, e, f, g, h, ii);
        this.wab(arraybuffer, arraybuffer.byteLength, nAlignLength, 0);
    }
} 
