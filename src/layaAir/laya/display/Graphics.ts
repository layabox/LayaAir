import { Sprite } from "./Sprite";
import { GraphicsBounds } from "./GraphicsBounds";
import { SpriteConst } from "./SpriteConst";
import { AlphaCmd } from "./cmd/AlphaCmd"
import { ClipRectCmd } from "./cmd/ClipRectCmd"
import { Draw9GridTextureCmd } from "./cmd/Draw9GridTextureCmd"
import { DrawCircleCmd } from "./cmd/DrawCircleCmd"
import { DrawCurvesCmd } from "./cmd/DrawCurvesCmd"
import { DrawImageCmd } from "./cmd/DrawImageCmd"
import { DrawLineCmd } from "./cmd/DrawLineCmd"
import { DrawLinesCmd } from "./cmd/DrawLinesCmd"
import { DrawPathCmd } from "./cmd/DrawPathCmd"
import { DrawPieCmd } from "./cmd/DrawPieCmd"
import { DrawPolyCmd } from "./cmd/DrawPolyCmd"
import { DrawRectCmd } from "./cmd/DrawRectCmd"
import { DrawTextureCmd } from "./cmd/DrawTextureCmd"
import { DrawTexturesCmd } from "./cmd/DrawTexturesCmd"
import { DrawTrianglesCmd } from "./cmd/DrawTrianglesCmd"
import { FillTextCmd } from "./cmd/FillTextCmd"
import { FillTextureCmd } from "./cmd/FillTextureCmd"
import { RestoreCmd } from "./cmd/RestoreCmd"
import { RotateCmd } from "./cmd/RotateCmd"
import { SaveCmd } from "./cmd/SaveCmd"
import { ScaleCmd } from "./cmd/ScaleCmd"
import { TransformCmd } from "./cmd/TransformCmd"
import { TranslateCmd } from "./cmd/TranslateCmd"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Context } from "../renders/Context"
import { Texture } from "../resource/Texture"
import { Utils } from "../utils/Utils"
import { VectorGraphManager } from "../utils/VectorGraphManager"
import { ILaya } from "../../ILaya";
import { WordText } from "../utils/WordText";
import { ColorUtils } from "../utils/ColorUtils";
import type { Material } from "../resource/Material";
import { Value2D } from "../webgl/shader/d2/value/Value2D";
import { DrawEllipseCmd } from "./cmd/DrawEllipseCmd";
import { DrawRoundRectCmd } from "./cmd/DrawRoundRectCmd";
import { LayaGL } from "../layagl/LayaGL";
import { ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { DrawGeoCmd } from "./cmd/DrawGeoCmd";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawGeosCmd } from "./cmd/DrawGeosCmd";

/**
 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
 * @see laya.display.Sprite#graphics
 */
export class Graphics {

    /**
     * add global Uniform Data Map
     * @param propertyID 
     * @param propertyKey 
     * @param uniformtype 
     */
    static add2DGlobalUniformData(propertyID: number, propertyKey: string, uniformtype: ShaderDataType) {
        let sceneUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal");
        sceneUniformMap.addShaderUniform(propertyID, propertyKey, uniformtype);
    }

    /**
     * get global shaderData
     */
    static get globalShaderData() {
        return Value2D.globalShaderData;
    }

    /**@internal */
    _sp: Sprite | null = null;
    /**@internal */
    _render: (sprite: Sprite, context: Context, x: number, y: number) => void = this._renderEmpty;
    /**@private */
    private _cmds: any[] = [];
    /**@private */
    protected _vectorgraphArray: any[] | null = null;
    /**@private */
    private _graphicBounds: GraphicsBounds | null = null;

    private _material: Material;

    constructor() {
        this._createData();
    }

    /**@internal */
    _createData(): void {

    }

    /**@internal */
    _clearData(): void {

    }

    /**@internal */
    _destroyData(): void {

    }

    /**
     * <p>销毁此对象。</p>
     */
    destroy(): void {
        this.clear(true);
        if (this._graphicBounds) this._graphicBounds.destroy();
        this._graphicBounds = null;
        this._vectorgraphArray = null;
        if (this._sp) {
            this._sp._renderType = 0;
            this._sp = null;
        }
        this._destroyData();
    }

    /**
     * <p>清空绘制命令。</p>
     * @param recoverCmds 是否回收绘图指令数组，设置为true，则对指令数组进行回收以节省内存开销，建议设置为true进行回收，但如果手动引用了数组，不建议回收
     */
    clear(recoverCmds: boolean = true): void {
        //TODO:内存回收all
        if (recoverCmds) {
            for (let i = 0, len = this._cmds.length; i < len; i++) {
                this._cmds[i].recover();
            }
        }

        this._cmds.length = 0;
        this._render = this._renderEmpty;
        this._clearData();
        if (this._sp) {
            this._sp._renderType &= ~SpriteConst.GRAPHICS;
        }
        this._repaint();
        if (this._vectorgraphArray) {
            for (let i = 0, len = this._vectorgraphArray.length; i < len; i++) {
                VectorGraphManager.getInstance().deleteShape(this._vectorgraphArray[i]);
            }
            this._vectorgraphArray.length = 0;
        }
    }

    /**@private */
    _clearBoundsCache(onSizeChanged?: boolean): void {
        if (this._graphicBounds) {
            if (!onSizeChanged || this._graphicBounds._affectBySize)
                this._graphicBounds.reset();
        }
    }

    /**@private */
    private _initGraphicBounds(): void {
        if (!this._graphicBounds) {
            this._graphicBounds = GraphicsBounds.create();
            this._graphicBounds._graphics = this;
        }
    }

    /**
     * @internal
     * 重绘此对象。
     */
    _repaint(): void {
        this._clearBoundsCache();
        this._sp && this._sp.repaint();
    }

    /**@internal */
    //TODO:coverage
    _isOnlyOne(): boolean {
        return this._cmds.length === 1;
    }

    /**
     * 命令流。存储了所有绘制命令。
     */
    get cmds() {
        return this._cmds;
    }

    set cmds(value) {
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
        }

        this._cmds = value;

        let len = value.length;
        this._render = len === 0 ? this._renderEmpty : (len === 1 ? this._renderOne : this._renderAll);
        this._repaint();
    }

    /**
     * 保存到命令流。
     */
    addCmd(cmd: any): any {
        if (cmd == null) {
            console.warn("null cmd");
            return;
        }

        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
        }
        this._cmds.push(cmd);
        this._render = this._cmds.length === 1 ? this._renderOne : this._renderAll;
        this._repaint();
        return cmd;
    }

    removeCmd(cmd: any) {
        let i = this.cmds.indexOf(cmd);
        if (i != -1) {
            this._cmds.splice(i, 1);

            let len = this._cmds.length;
            this._render = len === 0 ? this._renderEmpty : (len === 1 ? this._renderOne : this._renderAll);
            this._repaint();
        }
    }

    /**
     * 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * @return 位置与宽高组成的 一个 Rectangle 对象。
     */
    getBounds(realSize: boolean = false): Rectangle {
        this._initGraphicBounds();
        return this._graphicBounds!.getBounds(realSize);
    }

    /**
     * @private
     * @param realSize	（可选）使用图片的真实大小，默认为false
     * 获取端点列表。
     */
    getBoundPoints(realSize: boolean = false): any[] {
        this._initGraphicBounds();
        return this._graphicBounds!.getBoundPoints(realSize);
    }

    /**
     * 
     */
    get material() {
        return this._material;
    }

    /**
     * 
     */
    set material(value: Material) {
        if (this._material == value)
            return;
        this._material && this._material._removeReference();
        this._material = value;
        if (value != null)
            value._addReference();
    }

    /**
     * 绘制单独图片
     * @param texture		纹理。
     * @param x 		（可选）X轴偏移量。
     * @param y 		（可选）Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     * @param color	 	 （可选）颜色
     */
    drawImage(texture: Texture, x: number = 0, y: number = 0, width: number = null, height: number = null, color: string = null): DrawImageCmd | null {
        if (!texture) return null;
        if (!texture.bitmap) return null;
        return this.addCmd(DrawImageCmd.create(texture, x, y, width, height, color));
    }

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
    drawTexture(texture: Texture | null, x: number = 0, y: number = 0, width: number = null, height: number = null, matrix: Matrix | null = null, alpha: number = 1, color: string | null = null, blendMode: string | null = null, uv?: number[]): DrawTextureCmd | null {
        if (!texture || alpha < 0.01) return null;
        if (!texture.bitmap) return null;
        return this.addCmd(DrawTextureCmd.create(texture, x, y, width, height, matrix, alpha, color, blendMode, uv));
    }

    /**
     * 批量绘制同样纹理。
     * @param texture 纹理。
     * @param pos 绘制次数和坐标。
     * @param colors 图片颜色数组。
     */
    drawTextures(texture: Texture, pos: any[], colors?: number[]): DrawTexturesCmd | null {
        if (!texture) return null;
        return this.addCmd(DrawTexturesCmd.create(texture, pos, colors));
    }
    /**
     * 
     * @param geo 
     * @param material 
     * @returns 
     */
    drawGeo(geo: IRenderGeometryElement, material:Material){
        return this.addCmd(DrawGeoCmd.create(geo, material));
    }

    drawGeos(geo: IRenderGeometryElement,  elements:[Material,number,number][]){
        return this.addCmd(DrawGeosCmd.create(geo, elements));
    }


    /**
     * 绘制一组三角形
     * @param texture	纹理。
     * @param x			X轴偏移量。
     * @param y			Y轴偏移量。
     * @param vertices  顶点数组。
     * @param indices	顶点索引。
     * @param uvData	UV数据。注意这里的uv是直接使用的，如果texture是图集中的资源，这里的uv也是图集中的，即不需要转换直接用。
     * @param matrix	缩放矩阵。
     * @param alpha		alpha
     * @param color		颜色变换
     * @param blendMode	blend模式
     */
    drawTriangles(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix | null = null,
        alpha: number = 1, color: string | number = null, blendMode: string | null = null): DrawTrianglesCmd {
        return this.addCmd(DrawTrianglesCmd.create(texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode));
    }

    /**
     * 用 texture 填充。
     * @param texture		纹理。
     * @param x			X轴偏移量。
     * @param y			Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     * @param type		（可选）填充类型 repeat|repeat-x|repeat-y|no-repeat
     * @param offset	（可选）贴图纹理偏移
     * @param color	 	 （可选）颜色
     *
     */
    fillTexture(texture: Texture, x: number, y: number, width: number = 0, height: number = 0, type: string = "repeat", offset: Point | null = null, color: string = null): FillTextureCmd | null {
        if (texture && texture.bitmap)
            return this.addCmd(FillTextureCmd.create(texture, x, y, width, height, type, offset || Point.EMPTY, color));
        else
            return null;
    }

    /**
     * 设置剪裁区域，超出剪裁区域的坐标不显示。
     * @param x X 轴偏移量。
     * @param y Y 轴偏移量。
     * @param width 宽度。
     * @param height 高度。
     */
    clipRect(x: number, y: number, width: number, height: number): ClipRectCmd {
        return this.addCmd(ClipRectCmd.create(x, y, width, height));
    }

    /**
     * 在画布上绘制文本。
     * @param text 在画布上输出的文本。
     * @param x 开始绘制文本的 x 坐标位置（相对于画布）。
     * @param y 开始绘制文本的 y 坐标位置（相对于画布）。
     * @param font 定义字号和字体，比如"20px Arial"。
     * @param color 定义文本颜色，比如"#ff0000"。
     * @param textAlign 文本对齐方式，可选值："left"，"center"，"right"。
     */
    fillText(text: string | WordText, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, color, textAlign, 0, ""));
    }

    /**
     * 在画布上绘制“被填充且镶边的”文本。
     * @param text			在画布上输出的文本。
     * @param x				开始绘制文本的 x 坐标位置（相对于画布）。
     * @param y				开始绘制文本的 y 坐标位置（相对于画布）。
     * @param font			定义字体和字号，比如"20px Arial"。
     * @param fillColor		定义文本颜色，比如"#ff0000"。
     * @param textAlign		文本对齐方式，可选值："left"，"center"，"right"。
     * @param lineWidth		镶边线条宽度。
     * @param borderColor	定义镶边文本颜色。
     */
    fillBorderText(text: string | WordText, x: number, y: number, font: string, fillColor: string, textAlign: string, lineWidth: number, borderColor: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, fillColor, textAlign, lineWidth, borderColor));
    }

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
    strokeText(text: string | WordText, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, null, textAlign, lineWidth, color));
    }

    /**
     * 设置透明度。
     * @param value 透明度。
     */
    alpha(alpha: number): AlphaCmd {
        return this.addCmd(AlphaCmd.create(alpha));
    }

    /**
     * 替换绘图的当前转换矩阵。
     * @param mat 矩阵。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    transform(matrix: Matrix, pivotX: number = 0, pivotY: number = 0): TransformCmd {
        return this.addCmd(TransformCmd.create(matrix, pivotX, pivotY));
    }

    /**
     * 旋转当前绘图。(推荐使用transform，性能更高)
     * @param angle		旋转角度，以弧度计。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    rotate(angle: number, pivotX: number = 0, pivotY: number = 0): RotateCmd {
        return this.addCmd(RotateCmd.create(angle, pivotX, pivotY));
    }

    /**
     * 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
     * @param scaleX	水平方向缩放值。
     * @param scaleY	垂直方向缩放值。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    scale(scaleX: number, scaleY: number, pivotX: number = 0, pivotY: number = 0): ScaleCmd {
        return this.addCmd(ScaleCmd.create(scaleX, scaleY, pivotX, pivotY));
    }

    /**
     * 重新映射画布上的 (0,0) 位置。
     * @param x 添加到水平坐标（x）上的值。
     * @param y 添加到垂直坐标（y）上的值。
     */
    translate(tx: number, ty: number): TranslateCmd {
        return this.addCmd(TranslateCmd.create(tx, ty));
    }

    /**
     * 保存当前环境的状态。
     */
    save(): SaveCmd {
        return this.addCmd(SaveCmd.create());
    }

    /**
     * 返回之前保存过的路径状态和属性。
     */
    restore(): RestoreCmd {
        return this.addCmd(RestoreCmd.create());
    }

    /**
     * @private
     * 替换文本颜色。
     * @param color 颜色。
     */
    replaceTextColor(color: string): void {
        this._repaint();
        let cmds = this._cmds;
        for (let i = cmds.length - 1; i > -1; i--) {
            let cmd = cmds[i];
            var cmdID: string = cmd.cmdID;
            switch (cmdID) {
                case FillTextCmd.ID:
                    (cmd as FillTextCmd).color = color;
                    break;
                case DrawImageCmd.ID: //bitmap font
                    (cmd as DrawImageCmd).color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
                    break;
            }
        }
    }

    /**
     * 加载并显示一个图片。
     * @param url		图片地址。
     * @param x			（可选）显示图片的x位置。
     * @param y			（可选）显示图片的y位置。
     * @param width		（可选）显示图片的宽度，设置为0表示使用图片默认宽度。
     * @param height	（可选）显示图片的高度，设置为0表示使用图片默认高度。
     * @param complete	（可选）加载完成回调。
     */
    loadImage(url: string, x: number = 0, y: number = 0, width: number = null, height: number = null, complete: Function | null = null): void {
        let tex: Texture = ILaya.loader.getRes(url);
        if (tex) {
            this.drawImage(tex, x, y, width, height);
            complete && complete.call(this._sp);
        }
        else {
            ILaya.loader.load(url).then((tex: Texture) => {
                this.drawImage(tex, x, y, width, height);
                complete && complete.call(this._sp);
            });
        }
    }

    /**
     * @internal
     */
    _renderEmpty(sprite: Sprite, context: Context, x: number, y: number): void {
    }

    /**
     * @internal
     */
    _renderAll(sprite: Sprite, context: Context, x: number, y: number): void {
        context.sprite = sprite;
        context.material = this._material;
        var cmds = this._cmds!;
        for (let i = 0, n = cmds.length; i < n; i++) {
            cmds[i].run(context, x, y);
        }
        context.material = null;
    }

    /**
     * @internal
     */
    _renderOne(sprite: Sprite, context: Context, x: number, y: number): void {
        context.sprite = sprite;
        context.material = this._material;
        this._cmds[0].run(context, x, y);
        context.material = null;
    }

    /**
     * 绘制一条线。
     * @param fromX		X轴开始位置。
     * @param fromY		Y轴开始位置。
     * @param toX		X轴结束位置。
     * @param toY		Y轴结束位置。
     * @param lineColor	颜色。
     * @param lineWidth	（可选）线条宽度。
     */
    drawLine(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number = 1): DrawLineCmd {
        return this.addCmd(DrawLineCmd.create(fromX, fromY, toX, toY, lineColor, lineWidth));
    }

    /**
     * 绘制一系列线段。
     * @param x			开始绘制的X轴位置。
     * @param y			开始绘制的Y轴位置。
     * @param points	线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
     * @param lineColor	线段颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）线段宽度。
     */
    drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number = 1): DrawLinesCmd | null {
        if (!points || points.length < 4) return null;
        return this.addCmd(DrawLinesCmd.create(x, y, points, lineColor, lineWidth));
    }

    /**
     * 绘制一系列曲线。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param points	线段的点集合，格式[controlX, controlY, anchorX, anchorY...]。
     * @param lineColor	线段颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）线段宽度。
     */
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number = 1): DrawCurvesCmd {
        return this.addCmd(DrawCurvesCmd.create(x, y, points, lineColor, lineWidth));
    }

    /**
     * 绘制矩形。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param width		矩形宽度。
     * @param height	矩形高度。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     * @param percent 位置和大小是否是百分比值。
     */
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any = null, lineWidth: number = 1, percent?: boolean): DrawRectCmd {
        return this.addCmd(DrawRectCmd.create(x, y, width, height, fillColor, lineColor, lineWidth, percent));
    }

    /**
     * 绘制圆角矩形
     * @param x             开始绘制的 X 轴位置。
     * @param y             开始绘制的 Y 轴位置。
     * @param width         圆角矩形宽度。
     * @param height        圆角矩形高度。
     * @param lt            左上圆角
     * @param rt            右上圆角
     * @param lb            左下圆角
     * @param rb            右下圆角
     * @param fillColor     填充颜色，或者填充绘图的渐变对象。
     * @param lineColor     （可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth     （可选）边框宽度。
     * @param percent       （可选）位置和大小是否是百分比值。
     * @returns 
     */
    drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any = null, lineWidth: number = 1, percent?: boolean) {
        return this.addCmd(DrawRoundRectCmd.create(x, y, width, height, lt, rt, lb, rb, fillColor, lineColor, lineWidth, percent));
    }

    /**
     * 绘制圆形。
     * @param x			圆点X 轴位置。
     * @param y			圆点Y 轴位置。
     * @param radius	半径。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     */
    drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawCircleCmd {
        return this.addCmd(DrawCircleCmd.create(x, y, radius, fillColor, lineColor, lineWidth));
    }
    /**
     * 绘制椭圆形
     * @param x         圆点X 轴位置。
     * @param y         圆点Y 轴位置。
     * @param width     横向半径。
     * @param height    纵向半径。
     * @param fillColor 填充颜色，或者填充绘图的渐变对象。
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth （可选）边框宽度。
     * @param percent   （可选）位置和大小是否是百分比值。
     */
    drawEllipse(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawEllipseCmd {
        return this.addCmd(DrawEllipseCmd.create(x, y, width, height, fillColor, lineColor, lineWidth, percent));
    }

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
    drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawPieCmd {
        return this.addCmd(DrawPieCmd.create(x, y, radius, Utils.toRadian(startAngle), Utils.toRadian(endAngle), fillColor, lineColor, lineWidth));
    }

    /**
     * 绘制多边形。
     * @param x			开始绘制的 X 轴位置。
     * @param y			开始绘制的 Y 轴位置。
     * @param points	多边形的点集合。
     * @param fillColor	填充颜色，或者填充绘图的渐变对象。
     * @param lineColor	（可选）边框颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）边框宽度。
     */
    drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawPolyCmd {
        return this.addCmd(DrawPolyCmd.create(x, y, points, fillColor, lineColor, lineWidth));
    }

    /**
     * 绘制路径。
     * @param x		开始绘制的 X 轴位置。
     * @param y		开始绘制的 Y 轴位置。
     * @param paths	路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]。
     * @param brush	（可选）刷子定义，支持以下设置{fillStyle:"#FF0000"}。
     * @param pen	（可选）画笔定义，支持以下设置{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}。
     */
    drawPath(x: number, y: number, paths: any[], brush: any = null, pen: any = null): DrawPathCmd {
        return this.addCmd(DrawPathCmd.create(x, y, paths, brush, pen));
    }

    /**
     * @private
     * 绘制带九宫格的图片
     * @param	texture
     * @param	x
     * @param	y
     * @param	width
     * @param	height
     * @param	sizeGrid
     * @param	color
     */
    draw9Grid(texture: Texture, x: number = 0, y: number = 0, width: number = 0, height: number = 0, sizeGrid: any[], color?: string): void {
        this.addCmd(Draw9GridTextureCmd.create(texture, x, y, width, height, sizeGrid, false, color));
    }
}
