import { Sprite } from "../display/Sprite";
import { ColorFilter } from "../filters/ColorFilter";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { Shader } from "../webgl/shader/Shader";
import { ISubmit } from "../webgl/submit/ISubmit";
import { IndexBuffer2D } from "../webgl/utils/IndexBuffer2D";
import { VertexBuffer2D } from "../webgl/utils/VertexBuffer2D";
import { Texture } from "./Texture";
import { HTMLCanvas } from "./HTMLCanvas";
import { RenderTexture2D } from "./RenderTexture2D";
/**
 * @private
 * Context扩展类
 */
export declare class Context {
    static ENUM_TEXTALIGN_DEFAULT: number;
    static ENUM_TEXTALIGN_CENTER: number;
    static ENUM_TEXTALIGN_RIGHT: number;
    static _SUBMITVBSIZE: number;
    static _MAXSIZE: number;
    private static _MAXVERTNUM;
    static MAXCLIPRECT: Rectangle;
    static _COUNT: number;
    private static SEGNUM;
    private static _contextcount;
    private _drawTexToDrawTri_Vert;
    private _drawTexToDrawTri_Index;
    private _tempUV;
    private _drawTriUseAbsMatrix;
    static __init__(): void;
    /**@private */
    drawImage(...args: any[]): void;
    /**@private */
    getImageData(...args: any[]): any;
    /**@private */
    measureText(text: string): any;
    /**@private */
    setTransform(...args: any[]): void;
    /**@private */
    $transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
    /**@private */
    /**@private */
    lineJoin: string;
    /**@private */
    /**@private */
    lineCap: string;
    /**@private */
    /**@private */
    miterLimit: string;
    /**@private */
    clearRect(x: number, y: number, width: number, height: number): void;
    /**@private */
    /**@private */
    drawTexture2(x: number, y: number, pivotX: number, pivotY: number, m: Matrix, args2: any[]): void;
    transformByMatrix(matrix: Matrix, tx: number, ty: number): void;
    saveTransform(matrix: Matrix): void;
    restoreTransform(matrix: Matrix): void;
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number): void;
    alpha(value: number): void;
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number): void;
    private _fillAndStroke;
    /**Math.PI*2的结果缓存 */
    static PI2: number;
    static set2DRenderConfig(): void;
    private _other;
    private _renderNextSubmitIndex;
    private _path;
    private _primitiveValue2D;
    private _width;
    private _height;
    private _renderCount;
    private _isConvexCmd;
    meshlist: any[];
    private _transedPoints;
    private _temp4Points;
    private _clipID_Gen;
    private _lastMat_a;
    private _lastMat_b;
    private _lastMat_c;
    private _lastMat_d;
    /**
     * 所cacheAs精灵
     * 对于cacheas bitmap的情况，如果图片还没准备好，需要有机会重画，所以要保存sprite。例如在图片
     * 加载完成后，调用repaint
     */
    sprite: Sprite;
    private static _textRender;
    private _fillColor;
    private _flushCnt;
    private defTexture;
    drawTexAlign: boolean;
    isMain: boolean;
    constructor();
    clearBG(r: number, g: number, b: number, a: number): void;
    /**
     * 释放占用内存
     * @param	keepRT  是否保留rendertarget
     */
    private _releaseMem;
    /**
     * 释放所有资源
     * @param	keepRT  是否保留rendertarget
     */
    destroy(keepRT?: boolean): void;
    clear(): void;
    /**
     * 设置ctx的size，这个不允许直接设置，必须是canvas调过来的。所以这个函数里也不用考虑canvas相关的东西
     * @param	w
     * @param	h
     */
    size(w: number, h: number): void;
    /**
     * 当前canvas请求保存渲染结果。
     * 实现：
     * 如果value==true，就要给_target赋值
     * @param value {Boolean}
     */
    asBitmap: boolean;
    /**
     * 获得当前矩阵的缩放值
     * 避免每次都计算getScaleX
     * @return
     */
    getMatScaleX(): number;
    getMatScaleY(): number;
    setFillColor(color: number): void;
    getFillColor(): number;
    fillStyle: any;
    globalAlpha: number;
    textAlign: string;
    textBaseline: string;
    globalCompositeOperation: string;
    strokeStyle: any;
    translate(x: number, y: number): void;
    lineWidth: number;
    save(): void;
    restore(): void;
    font: string;
    fillText(txt: string, x: number, y: number, fontStr: string, color: string, align: string): void;
    /**
     *
     * @param	txt
     * @param	words		HTMLChar 数组，是已经在外面排好版的一个数组
     * @param	x
     * @param	y
     * @param	fontStr
     * @param	color
     * @param	strokeColor
     * @param	lineWidth
     * @param	textAlign
     * @param	underLine
     */
    private _fillText;
    fillWords(words: any[], x: number, y: number, fontStr: string, color: string): void;
    fillBorderWords(words: any[], x: number, y: number, font: string, color: string, borderColor: string, lineWidth: number): void;
    drawText(text: any, x: number, y: number, font: string, color: string, textAlign: string): void;
    /**
     * 只画边框
     * @param	text
     * @param	x
     * @param	y
     * @param	font
     * @param	color
     * @param	lineWidth
     * @param	textAlign
     */
    strokeWord(text: any, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): void;
    /**
     * 即画文字又画边框
     * @param	txt
     * @param	x
     * @param	y
     * @param	fontStr
     * @param	fillColor
     * @param	borderColor
     * @param	lineWidth
     * @param	textAlign
     */
    fillBorderText(txt: any, x: number, y: number, fontStr: string, fillColor: string, borderColor: string, lineWidth: number, textAlign: string): void;
    private _fillBorderText;
    private _fillRect;
    fillRect(x: number, y: number, width: number, height: number, fillStyle: any): void;
    fillTexture(texture: Texture, x: number, y: number, width: number, height: number, type: string, offset: Point, other: any): void;
    /**
     * 反正只支持一种filter，就不要叫setFilter了，直接叫setColorFilter
     * @param	value
     */
    setColorFilter(filter: ColorFilter): void;
    drawTexture(tex: Texture, x: number, y: number, width: number, height: number): void;
    drawTextures(tex: Texture, pos: any[], tx: number, ty: number): void;
    /**
     * 为drawTexture添加一个新的submit。类型是 SubmitTexture
     * @param	vbSize
     * @param	alpha
     * @param	webGLImg
     * @param	tex
     */
    private _drawTextureAddSubmit;
    submitDebugger(): void;
    private isSameClipInfo;
    drawCallOptimize(enbale: boolean): boolean;
    /**
     * 转换4个顶点。为了效率这个不做任何检查。需要调用者的配合。
     * @param	a		输入。8个元素表示4个点
     * @param	out		输出
     */
    transform4Points(a: any[], m: Matrix, out: any[]): void;
    /**
     * pt所描述的多边形完全在clip外边，整个被裁掉了
     * @param	pt
     * @return
     */
    clipedOff(pt: any[]): boolean;
    /**
     * 应用当前矩阵。把转换后的位置放到输出数组中。
     * @param	x
     * @param	y
     * @param	w
     * @param	h
     * @param   italicDeg 倾斜角度，单位是度。0度无，目前是下面不动。以后要做成可调的
     */
    transformQuad(x: number, y: number, w: number, h: number, italicDeg: number, m: Matrix, out: any[]): void;
    pushRT(): void;
    popRT(): void;
    useRT(rt: RenderTexture2D): void;
    /**
     * 异步执行rt的restore函数
     * @param	rt
     */
    RTRestore(rt: RenderTexture2D): void;
    /**
     * 强制拒绝submit合并
     * 例如切换rt的时候
     */
    breakNextMerge(): void;
    private _repaintSprite;
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
    drawTextureWithTransform(tex: Texture, x: number, y: number, width: number, height: number, transform: Matrix, tx: number, ty: number, alpha: number, blendMode: string, colorfilter?: ColorFilter, uv?: number[]): void;
    /**
     * * 把ctx中的submits提交。结果渲染到target上
     * @param	ctx
     * @param	target
     */
    private _flushToTarget;
    drawCanvas(canvas: HTMLCanvas, x: number, y: number, width: number, height: number): void;
    drawTarget(rt: RenderTexture2D, x: number, y: number, width: number, height: number, m: Matrix, shaderValue: Value2D, uv?: ArrayLike<number>, blend?: number): boolean;
    drawTriangles(tex: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix, alpha: number, color: ColorFilter, blendMode: string): void;
    transform(a: number, b: number, c: number, d: number, tx: number, ty: number): void;
    setTransformByMatrix(value: Matrix): void;
    rotate(angle: number): void;
    scale(scaleX: number, scaleY: number): void;
    clipRect(x: number, y: number, width: number, height: number): void;
    /**
     * 从setIBVB改为drawMesh
     * type 参数不知道是干什么的，先删掉。offset好像跟attribute有关，删掉
     * @param	x
     * @param	y
     * @param	ib
     * @param	vb
     * @param	numElement
     * @param	mat
     * @param	shader
     * @param	shaderValues
     * @param	startIndex
     * @param	offset
     */
    drawMesh(x: number, y: number, ib: IndexBuffer2D, vb: VertexBuffer2D, numElement: number, mat: Matrix, shader: Shader, shaderValues: Value2D, startIndex?: number): void;
    addRenderObject(o: ISubmit): void;
    /**
     *
     * @param	start
     * @param	end
     */
    submitElement(start: number, end: number): number;
    flush(): number;
    /*******************************************start矢量绘制***************************************************/
    beginPath(convex?: boolean): void;
    closePath(): void;
    /**
     * 添加一个path。
     * @param	points [x,y,x,y....]	这个会被保存下来，所以调用者需要注意复制。
     * @param	close	是否闭合
     * @param   convex 是否是凸多边形。convex的优先级是这个最大。fill的时候的次之。其实fill的时候不应该指定convex，因为可以多个path
     * @param	dx  需要添加的平移。这个需要在应用矩阵之前应用。
     * @param	dy
     */
    addPath(points: any[], close: boolean, convex: boolean, dx: number, dy: number): void;
    fill(): void;
    private addVGSubmit;
    stroke(): void;
    moveTo(x: number, y: number): void;
    /**
     *
     * @param	x
     * @param	y
     * @param	b 是否应用矩阵
     */
    lineTo(x: number, y: number): void;
    arcTo(x1: number, y1: number, x2: number, y2: number, r: number): void;
    arc(cx: number, cy: number, r: number, startAngle: number, endAngle: number, counterclockwise?: boolean, b?: boolean): void;
    quadraticCurveTo(cpx: number, cpy: number, x: number, y: number): void;
    /**
     * 把颜色跟当前设置的alpha混合
     * @return
     */
    mixRGBandAlpha(color: number): number;
    strokeRect(x: number, y: number, width: number, height: number, parameterLineWidth: number): void;
    clip(): void;
    /*******************************************end矢量绘制***************************************************/
    drawParticle(x: number, y: number, pt: any): void;
    private _getPath;
    /**获取canvas*/
    readonly canvas: HTMLCanvas;
    private static tmpuv1;
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
    private _fillTexture_h;
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
    private _fillTexture_v;
    private static tmpUV;
    private static tmpUVRect;
    drawTextureWithSizeGrid(tex: Texture, tx: number, ty: number, width: number, height: number, sizeGrid: any[], gx: number, gy: number): void;
}
