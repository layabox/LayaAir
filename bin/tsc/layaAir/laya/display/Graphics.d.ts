import { Sprite } from "././Sprite";
import { AlphaCmd } from "./cmd/AlphaCmd";
import { ClipRectCmd } from "./cmd/ClipRectCmd";
import { DrawCircleCmd } from "./cmd/DrawCircleCmd";
import { DrawCurvesCmd } from "./cmd/DrawCurvesCmd";
import { DrawImageCmd } from "./cmd/DrawImageCmd";
import { DrawLineCmd } from "./cmd/DrawLineCmd";
import { DrawLinesCmd } from "./cmd/DrawLinesCmd";
import { DrawPathCmd } from "./cmd/DrawPathCmd";
import { DrawPieCmd } from "./cmd/DrawPieCmd";
import { DrawPolyCmd } from "./cmd/DrawPolyCmd";
import { DrawRectCmd } from "./cmd/DrawRectCmd";
import { DrawTextureCmd } from "./cmd/DrawTextureCmd";
import { DrawTexturesCmd } from "./cmd/DrawTexturesCmd";
import { DrawTrianglesCmd } from "./cmd/DrawTrianglesCmd";
import { FillBorderTextCmd } from "./cmd/FillBorderTextCmd";
import { FillBorderWordsCmd } from "./cmd/FillBorderWordsCmd";
import { FillTextCmd } from "./cmd/FillTextCmd";
import { FillTextureCmd } from "./cmd/FillTextureCmd";
import { FillWordsCmd } from "./cmd/FillWordsCmd";
import { RestoreCmd } from "./cmd/RestoreCmd";
import { RotateCmd } from "./cmd/RotateCmd";
import { SaveCmd } from "./cmd/SaveCmd";
import { ScaleCmd } from "./cmd/ScaleCmd";
import { StrokeTextCmd } from "./cmd/StrokeTextCmd";
import { TransformCmd } from "./cmd/TransformCmd";
import { TranslateCmd } from "./cmd/TranslateCmd";
import { Matrix } from "../maths/Matrix";
import { Point } from "../maths/Point";
import { Rectangle } from "../maths/Rectangle";
import { Context } from "../resource/Context";
import { Texture } from "../resource/Texture";
/**
 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
 * @see laya.display.Sprite#graphics
 */
export declare class Graphics {
    /**@private */
    _sp: Sprite;
    /**@private */
    _one: any;
    /**@private */
    _render: Function;
    /**@private */
    private _cmds;
    /**@private */
    protected _vectorgraphArray: any[];
    /**@private */
    private _graphicBounds;
    /**@private */
    autoDestroy: boolean;
    constructor();
    /**@private */
    _createData(): void;
    /**@private */
    _clearData(): void;
    /**@private */
    _destroyData(): void;
    /**
     * <p>销毁此对象。</p>
     */
    destroy(): void;
    /**
     * <p>清空绘制命令。</p>
     * @param recoverCmds 是否回收绘图指令数组，设置为true，则对指令数组进行回收以节省内存开销，建议设置为true进行回收，但如果手动引用了数组，不建议回收
     */
    clear(recoverCmds?: boolean): void;
    /**@private */
    private _clearBoundsCache;
    /**@private */
    private _initGraphicBounds;
    /**
     * @private
     * 重绘此对象。
     */
    _repaint(): void;
    /**@private */
    _isOnlyOne(): boolean;
    /**
     * @private
     * 命令流。存储了所有绘制命令。
     */
    cmds: any[];
    /**
     * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * @return 位置与宽高组成的 一个 Rectangle 对象。
     */
    getBounds(realSize?: boolean): Rectangle;
    /**
     * @private
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * 获取端点列表。
     */
    getBoundPoints(realSize?: boolean): any[];
    /**
     * 绘制单独图片
     * @param texture		纹理。
     * @param x 		（可选）X轴偏移量。
     * @param y 		（可选）Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     */
    drawImage(texture: Texture, x?: number, y?: number, width?: number, height?: number): DrawImageCmd;
    /**
     * 绘制纹理，相比drawImage功能更强大，性能会差一些
     * @param texture		纹理。
     * @param x 		（可选）X轴偏移量。
     * @param y 		（可选）Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     * @param matrix	（可选）矩阵信息。
     * @param alpha		（可选）透明度。
     * @param color		（可选）颜色滤镜。
     * @param blendMode （可选）混合模式。
     */
    drawTexture(texture: Texture, x?: number, y?: number, width?: number, height?: number, matrix?: Matrix, alpha?: number, color?: string, blendMode?: string): DrawTextureCmd;
    /**
     * 批量绘制同样纹理。
     * @param texture 纹理。
     * @param pos 绘制次数和坐标。
     */
    drawTextures(texture: Texture, pos: any[]): DrawTexturesCmd;
    /**
     * 绘制一组三角形
     * @param texture	纹理。
     * @param x			X轴偏移量。
     * @param y			Y轴偏移量。
     * @param vertices  顶点数组。
     * @param indices	顶点索引。
     * @param uvData	UV数据。
     * @param matrix	缩放矩阵。
     * @param alpha		alpha
     * @param color		颜色变换
     * @param blendMode	blend模式
     */
    drawTriangles(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix?: Matrix, alpha?: number, color?: string, blendMode?: string): DrawTrianglesCmd;
    /**
     * 用texture填充。
     * @param texture		纹理。
     * @param x			X轴偏移量。
     * @param y			Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     * @param type		（可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
     * @param offset	（可选）贴图纹理偏移
     *
     */
    fillTexture(texture: Texture, x: number, y: number, width?: number, height?: number, type?: string, offset?: Point): FillTextureCmd;
    /**
     * @private
     * 保存到命令流。
     */
    _saveToCmd(fun: Function, args: any): any;
    /**
     * 设置剪裁区域，超出剪裁区域的坐标不显示。
     * @param x X 轴偏移量。
     * @param y Y 轴偏移量。
     * @param width 宽度。
     * @param height 高度。
     */
    clipRect(x: number, y: number, width: number, height: number): ClipRectCmd;
    /**
     * 在画布上绘制文本。
     * @param text 在画布上输出的文本。
     * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
     * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
     * @param font 定义字号和字体，比如"20px Arial"。
     * @param color 定义文本颜色，比如"#ff0000"。
     * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
     */
    fillText(text: string, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd;
    /**
     * 在画布上绘制“被填充且镶边的”文本。
     * @param text			在画布上输出的文本。
     * @param x				开始绘制文本的 x 坐标位置（相对于画布）。
     * @param y				开始绘制文本的 y 坐标位置（相对于画布）。
     * @param font			定义字体和字号，比如"20px Arial"。
     * @param fillColor		定义文本颜色，比如"#ff0000"。
     * @param borderColor	定义镶边文本颜色。
     * @param lineWidth		镶边线条宽度。
     * @param textAlign		文本对齐方式，可选值："left"，"center"，"right"。
     */
    fillBorderText(text: string, x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number, textAlign: string): FillBorderTextCmd;
    /*** @private */
    fillWords(words: any[], x: number, y: number, font: string, color: string): FillWordsCmd;
    /*** @private */
    fillBorderWords(words: any[], x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number): FillBorderWordsCmd;
    /**
     * 在画布上绘制文本（没有填色）。文本的默认颜色是黑色。
     * @param text		在画布上输出的文本。
     * @param x			开始绘制文本的 x 坐标位置（相对于画布）。
     * @param y			开始绘制文本的 y 坐标位置（相对于画布）。
     * @param font		定义字体和字号，比如"20px Arial"。
     * @param color		定义文本颜色，比如"#ff0000"。
     * @param lineWidth	线条宽度。
     * @param textAlign	文本对齐方式，可选值："left"，"center"，"right"。
     */
    strokeText(text: string, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): StrokeTextCmd;
    /**
     * 设置透明度。
     * @param value 透明度。
     */
    alpha(alpha: number): AlphaCmd;
    /**
     * 替换绘图的当前转换矩阵。
     * @param mat 矩阵。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    transform(matrix: Matrix, pivotX?: number, pivotY?: number): TransformCmd;
    /**
     * 旋转当前绘图。(推荐使用transform，性能更高)
     * @param angle		旋转角度，以弧度计。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    rotate(angle: number, pivotX?: number, pivotY?: number): RotateCmd;
    /**
     * 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
     * @param scaleX	水平方向缩放值。
     * @param scaleY	垂直方向缩放值。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    scale(scaleX: number, scaleY: number, pivotX?: number, pivotY?: number): ScaleCmd;
    /**
     * 重新映射画布上的 (0,0) 位置。
     * @param x 添加到水平坐标（x）上的值。
     * @param y 添加到垂直坐标（y）上的值。
     */
    translate(tx: number, ty: number): TranslateCmd;
    /**
     * 保存当前环境的状态。
     */
    save(): SaveCmd;
    /**
     * 返回之前保存过的路径状态和属性。
     */
    restore(): RestoreCmd;
    /**
     * @private
     * 替换文本内容。
     * @param text 文本内容。
     * @return 替换成功则值为true，否则值为flase。
     */
    replaceText(text: string): boolean;
    /**@private */
    private _isTextCmd;
    /**
     * @private
     * 替换文本颜色。
     * @param color 颜色。
     */
    replaceTextColor(color: string): void;
    /**@private */
    private _setTextCmdColor;
    /**
     * 加载并显示一个图片。
     * @param url		图片地址。
     * @param x			（可选）显示图片的x位置。
     * @param y			（可选）显示图片的y位置。
     * @param width		（可选）显示图片的宽度，设置为0表示使用图片默认宽度。
     * @param height	（可选）显示图片的高度，设置为0表示使用图片默认高度。
     * @param complete	（可选）加载完成回调。
     */
    loadImage(url: string, x?: number, y?: number, width?: number, height?: number, complete?: Function): void;
    /**
     * @private
     */
    _renderEmpty(sprite: Sprite, context: Context, x: number, y: number): void;
    /**
     * @private
     */
    _renderAll(sprite: Sprite, context: Context, x: number, y: number): void;
    /**
     * @private
     */
    _renderOne(sprite: Sprite, context: Context, x: number, y: number): void;
    /**
     * @private
     */
    _renderOneImg(sprite: Sprite, context: Context, x: number, y: number): void;
    /**
     * 绘制一条线。
     * @param fromX		X轴开始位置。
     * @param fromY		Y轴开始位置。
     * @param toX		X轴结束位置。
     * @param toY		Y轴结束位置。
     * @param lineColor	颜色。
     * @param lineWidth	（可选）线条宽度。
     */
    drawLine(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth?: number): DrawLineCmd;
    /**
     * 绘制一系列线段。
     * @param x			开始绘制的X轴位置。
     * @param y			开始绘制的Y轴位置。
     * @param points	线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
     * @param lineColor	线段颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）线段宽度。
     */
    drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth?: number): DrawLinesCmd;
    /**
     * 绘制一系列曲线。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param points	线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
     * @param lineColor	线段颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）线段宽度。
     */
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth?: number): DrawCurvesCmd;
    /**
     * 绘制矩形。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param width		矩形宽度。
     * @param height	矩形高度。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     */
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor?: any, lineWidth?: number): DrawRectCmd;
    /**
     * 绘制圆形。
     * @param x			圆点X 轴位置。
     * @param y			圆点Y 轴位置。
     * @param radius	半径。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     */
    drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor?: any, lineWidth?: number): DrawCircleCmd;
    /**
     * 绘制扇形。
     * @param x				开始绘制的 X 轴位置。
     * @param y				开始绘制的 Y 轴位置。
     * @param radius		扇形半径。
     * @param startAngle	开始角度。
     * @param endAngle		结束角度。
     * @param fillColor		填充颜色，或者填充绘图的渐变对象。
     * @param lineColor		（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth		（可选）边框宽度。
     */
    drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor?: any, lineWidth?: number): DrawPieCmd;
    /**
     * 绘制多边形。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param points	多边形的点集合。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     */
    drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor?: any, lineWidth?: number): DrawPolyCmd;
    /**
     * 绘制路径。
     * @param x		开始绘制的 X 轴位置。
     * @param y		开始绘制的 Y 轴位置。
     * @param paths	路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
     * @param brush	（可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
     * @param pen	（可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
     */
    drawPath(x: number, y: number, paths: any[], brush?: any, pen?: any): DrawPathCmd;
    /**
     * @private
     * 绘制带九宫格的图片
     * @param	texture
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @param	sizeGrid
     */
    draw9Grid(texture: Texture, x?: number, y?: number, width?: number, height?: number, sizeGrid?: any[]): void;
}
