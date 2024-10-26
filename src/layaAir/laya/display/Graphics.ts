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
import { Context, IGraphicCMD } from "../renders/Context"
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
import { ShaderData, ShaderDataType } from "../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { DrawGeoCmd } from "./cmd/DrawGeoCmd";
import { IRenderGeometryElement } from "../RenderDriver/DriverDesign/RenderDevice/IRenderGeometryElement";
import { DrawGeosCmd } from "./cmd/DrawGeosCmd";

/**
 * @en The Graphics class is used to create drawing display objects. Graphics can draw multiple bitmaps or vector graphics simultaneously, and can also combine instructions such as save, restore, transform, scale, rotate, translate, alpha, etc. to change the drawing effect.
 * Graphics is stored as a command stream and can be accessed through the cmds property. Graphics is a lighter object than Sprite, and proper use can improve application performance (for example, changing a large number of node drawings to a collection of Graphics commands of one node can reduce the consumption of creating a large number of nodes).
 * @zh Graphics 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
 */
export class Graphics {

    /**
     * @en Add global Uniform Data Map
     * @param propertyID The ID of the property
     * @param propertyKey The key of the property
     * @param uniformtype The type of the uniform
     * @zh 添加全局Uniform数据映射
     * @param propertyID 属性ID
     * @param propertyKey 属性键
     * @param uniformtype Uniform类型
     */
    static add2DGlobalUniformData(propertyID: number, propertyKey: string, uniformtype: ShaderDataType) {
        let sceneUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal");
        sceneUniformMap.addShaderUniform(propertyID, propertyKey, uniformtype);
    }

    /**
     * @en Global shaderData
     * @zh 全局着色器数据
     */
    static get globalShaderData() : ShaderData {
        return Value2D.globalShaderData;
    }

    /**@internal */
    _sp: Sprite | null = null;
    /**@internal */
    _render: (sprite: Sprite, context: Context, x: number, y: number) => void = this._renderEmpty;
    private _cmds: IGraphicCMD[] = [];
    protected _vectorgraphArray: any[] | null = null;
    private _graphicBounds: GraphicsBounds | null = null;
    private _material: Material;

    /**@ignore */
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
     * @en Destroy this object.
     * @zh 销毁此对象。
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
     * @en Clear drawing commands.
     * @param recoverCmds Whether to recycle the drawing instruction array. If set to true, the instruction array will be recycled to save memory. It is recommended to set it to true for recycling, but if you manually reference the array, recycling is not recommended.
     * @zh 清空绘制命令。
     * @param recoverCmds 是否回收绘图指令数组。设置为true，则对指令数组进行回收以节省内存开销。建议设置为true进行回收，但如果手动引用了数组，不建议回收。
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

    /** @ignore */
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
     * @en Redraw this object.
     * @zh 重绘此对象。
     */
    _repaint(): void {
        this._clearBoundsCache();
        this._sp && this._sp.repaint();
    }

    /**@internal */
    _isOnlyOne(): boolean {
        return this._cmds.length === 1;
    }

    /**
     * @en Command flow. All drawing commands are stored.
     * @zh 命令流。存储了所有绘制命令。
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
     * @en Save to the command stream.
     * @zh 添加到命令流。
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

    /**
     * @en Remove a specific command from the command list.
     * @param cmd The command to be removed.
     * @zh 从命令列表中移除特定的命令。
     * @param cmd 要移除的命令。
     */
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
     * @en Get the position and size information matrix (CPU-intensive, frequent use may cause lag, use sparingly).
     * @param realSize (Optional) Use the real size of the image, default is false.
     * @returns A Rectangle object composed of position and size.
     * @zh 获取位置及宽高信息矩阵(比较耗CPU，频繁使用会造成卡顿，尽量少用)。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @returns 位置与宽高组成的一个 Rectangle 对象。
     */
    getBounds(realSize: boolean = false): Rectangle {
        this._initGraphicBounds();
        return this._graphicBounds!.getBounds(realSize);
    }

    /**
     * @en Get the list of endpoints.
     * @param realSize (Optional) Use the real size of the image, default is false.
     * @returns An array of endpoint coordinates.
     * @zh 获取端点列表。
     * @param realSize （可选）使用图片的真实大小，默认为false。
     * @returns 端点坐标的数组。
     */
    getBoundPoints(realSize: boolean = false): any[] {
        this._initGraphicBounds();
        return this._graphicBounds!.getBoundPoints(realSize);
    }

    /**
     * @en The material of the graphics object.
     * @zh 图形对象的材质。
     */
    get material() {
        return this._material;
    }

    set material(value: Material) {
        if (this._material == value)
            return;
        this._material && this._material._removeReference();
        this._material = value;
        if (value != null)
            value._addReference();
    }

    /**
     * @en Draw a single image
     * @param texture The texture to draw
     * @param x (Optional) X-axis offset. Default is 0.
     * @param y (Optional) Y-axis offset. Default is 0.
     * @param width (Optional) Width of the image. Default is null.
     * @param height (Optional) Height of the image. Default is null.
     * @param color (Optional) Color of the image. Default is null.
     * @zh 绘制单独图片
     * @param texture 要绘制的纹理
     * @param x （可选）X轴偏移量。默认为0。
     * @param y （可选）Y轴偏移量。默认为0。
     * @param width （可选）图片宽度。默认为null。
     * @param height （可选）图片高度。默认为null。
     * @param color （可选）图片颜色。默认为null。
     */
    drawImage(texture: Texture, x: number = 0, y: number = 0, width: number = null, height: number = null, color: string = null): DrawImageCmd | null {
        if (!texture) return null;
        if (!texture.bitmap) return null;
        return this.addCmd(DrawImageCmd.create(texture, x, y, width, height, color));
    }

    /**
     * @en Draw a texture. More powerful than drawImage but less performant.
     * @param texture The texture to draw
     * @param x (Optional) X-axis offset. Default is 0.
     * @param y (Optional) Y-axis offset. Default is 0.
     * @param width (Optional) Width of the texture. Default is null.
     * @param height (Optional) Height of the texture. Default is null.
     * @param matrix (Optional) Matrix information. Default is null.
     * @param alpha (Optional) Transparency. Default is 1.
     * @param color (Optional) Color filter. Default is null.
     * @param blendMode (Optional) Blend mode. Default is null.
     * @param uv (Optional) UV coordinates. Default is undefined.
     * @zh 绘制纹理，相比drawImage功能更强大，性能会差一些
     * @param texture 要绘制的纹理
     * @param x （可选）X轴偏移量。默认为0。
     * @param y （可选）Y轴偏移量。默认为0。
     * @param width （可选）纹理宽度。默认为null。
     * @param height （可选）纹理高度。默认为null。
     * @param matrix （可选）矩阵信息。默认为null。
     * @param alpha （可选）透明度。默认为1。
     * @param color （可选）颜色滤镜。默认为null。
     * @param blendMode （可选）混合模式。默认为null。
     * @param uv （可选）UV坐标。默认为undefined。
     */
    drawTexture(texture: Texture | null, x: number = 0, y: number = 0, width: number = null, height: number = null, matrix: Matrix | null = null, alpha: number = 1, color: string | null = null, blendMode: string | null = null, uv?: number[]): DrawTextureCmd | null {
        if (!texture || alpha < 0.01) return null;
        if (!texture.bitmap) return null;
        return this.addCmd(DrawTextureCmd.create(texture, x, y, width, height, matrix, alpha, color, blendMode, uv));
    }

    /**
     * @en Batch draw the same texture multiple times.
     * @param texture The texture to draw
     * @param pos Array of positions for each draw
     * @param colors (Optional) Array of colors for each draw
     * @zh 批量绘制同样纹理
     * @param texture 要绘制的纹理
     * @param pos 绘制次数和坐标数组
     * @param colors （可选）图片颜色数组
     */
    drawTextures(texture: Texture, pos: any[], colors?: number[]): DrawTexturesCmd | null {
        if (!texture) return null;
        return this.addCmd(DrawTexturesCmd.create(texture, pos, colors));
    }
    /**
     * @en Draw geometry
     * @param geo Render geometry element
     * @param material Material to use for rendering
     * @zh 绘制几何体
     * @param geo 渲染几何元素
     * @param material 用于渲染的材质
     */
    drawGeo(geo: IRenderGeometryElement, material: Material) {
        return this.addCmd(DrawGeoCmd.create(geo, material));
    }

    /**
     * @en Draw multiple geometries
     * @param geo Render geometry element
     * @param elements Array of [Material, startIndex, count] tuples
     * @zh 绘制多个几何体
     * @param geo 渲染几何元素
     * @param elements [材质, 起始索引, 数量] 元组数组
     */
    drawGeos(geo: IRenderGeometryElement, elements: [Material, number, number][]) {
        return this.addCmd(DrawGeosCmd.create(geo, elements));
    }

    /**
     * @en Draw a group of triangles
     * @param texture The texture to use
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param vertices Vertex array
     * @param uvs UV data. Note that the UV coordinates are used directly. If the texture is from an atlas, these UVs are also from the atlas and don't need conversion.
     * @param indices Vertex indices
     * @param matrix (Optional) Scale matrix. Default is null.
     * @param alpha (Optional) Alpha value. Default is 1.
     * @param color (Optional) Color transformation. Default is null.
     * @param blendMode (Optional) Blend mode. Default is null.
     * @zh 绘制一组三角形
     * @param texture 要使用的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param vertices 顶点数组
     * @param uvs UV数据。注意这里的uv是直接使用的，如果texture是图集中的资源，这里的uv也是图集中的，即不需要转换直接用。
     * @param indices 顶点索引
     * @param matrix （可选）缩放矩阵。默认为null。
     * @param alpha （可选）alpha值。默认为1。
     * @param color （可选）颜色变换。默认为null。
     * @param blendMode （可选）混合模式。默认为null。
     */
    drawTriangles(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix | null = null,
        alpha: number = 1, color: string | number = null, blendMode: string | null = null): DrawTrianglesCmd {
        return this.addCmd(DrawTrianglesCmd.create(texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode));
    }

    /**
     * @en Fill with texture
     * @param texture The texture to use for filling
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width (Optional) Width. Default is 0.
     * @param height (Optional) Height. Default is 0.
     * @param type (Optional) Fill type: 'repeat', 'repeat-x', 'repeat-y', or 'no-repeat'. Default is 'repeat'.
     * @param offset (Optional) Texture offset. Default is null.
     * @param color (Optional) Color. Default is null.
     * @zh 用纹理填充
     * @param texture 用于填充的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width （可选）宽度。默认为0。
     * @param height （可选）高度。默认为0。
     * @param type （可选）填充类型：'repeat'、'repeat-x'、'repeat-y'或'no-repeat'。默认为'repeat'。
     * @param offset （可选）贴图纹理偏移。默认为null。
     * @param color （可选）颜色。默认为null。
     */
    fillTexture(texture: Texture, x: number, y: number, width: number = 0, height: number = 0, type: string = "repeat", offset: Point | null = null, color: string = null): FillTextureCmd | null {
        if (texture && texture.bitmap)
            return this.addCmd(FillTextureCmd.create(texture, x, y, width, height, type, offset || Point.EMPTY, color));
        else
            return null;
    }

    /**
     * @en Set the clipping area. Coordinates outside the clipping area will not be displayed.
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the clipping area
     * @param height Height of the clipping area
     * @zh 设置剪裁区域，超出剪裁区域的坐标不显示。
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 剪裁区域的宽度
     * @param height 剪裁区域的高度
     */
    clipRect(x: number, y: number, width: number, height: number): ClipRectCmd {
        return this.addCmd(ClipRectCmd.create(x, y, width, height));
    }

    /**
     * @en Draw text on the canvas
     * @param text The text to output on the canvas
     * @param x The x-coordinate where to start drawing the text (relative to the canvas)
     * @param y The y-coordinate where to start drawing the text (relative to the canvas)
     * @param font Defines the font size and family, e.g., "20px Arial"
     * @param color Defines the text color, e.g., "#ff0000"
     * @param textAlign Text alignment. Possible values: "left", "center", "right"
     * @zh 在画布上绘制文本
     * @param text 在画布上输出的文本
     * @param x 开始绘制文本的x坐标位置（相对于画布）
     * @param y 开始绘制文本的y坐标位置（相对于画布）
     * @param font 定义字号和字体，例如"20px Arial"
     * @param color 定义文本颜色，例如"#ff0000"
     * @param textAlign 文本对齐方式。可选值："left"、"center"、"right"
     */
    fillText(text: string | WordText, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, color, textAlign, 0, ""));
    }

    /**
     * @en Draw filled and stroked text on the canvas.
     * @param text The text to output on the canvas
     * @param x The x-coordinate where to start drawing the text (relative to the canvas)
     * @param y The y-coordinate where to start drawing the text (relative to the canvas)
     * @param font Defines the font and size, e.g., "20px Arial"
     * @param fillColor Defines the text color, e.g., "#ff0000"
     * @param textAlign Text alignment. Possible values: "left", "center", "right"
     * @param lineWidth Width of the stroke line
     * @param borderColor Defines the color of the text stroke
     * @zh 在画布上绘制"被填充且镶边的"文本。
     * @param text 在画布上输出的文本
     * @param x 开始绘制文本的x坐标位置（相对于画布）
     * @param y 开始绘制文本的y坐标位置（相对于画布）
     * @param font 定义字体和字号，例如"20px Arial"
     * @param fillColor 定义文本颜色，例如"#ff0000"
     * @param textAlign 文本对齐方式。可选值："left"、"center"、"right"
     * @param lineWidth 镶边线条宽度
     * @param borderColor 定义镶边文本颜色
     */
    fillBorderText(text: string | WordText, x: number, y: number, font: string, fillColor: string, textAlign: string, lineWidth: number, borderColor: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, fillColor, textAlign, lineWidth, borderColor));
    }

    /**
     * @en Draw text on the canvas (without fill). The default color of the text is black.
     * @param text The text to output on the canvas
     * @param x The x-coordinate where to start drawing the text (relative to the canvas)
     * @param y The y-coordinate where to start drawing the text (relative to the canvas)
     * @param font Defines the font and size, e.g., "20px Arial"
     * @param color Defines the text color, e.g., "#ff0000"
     * @param lineWidth Width of the line
     * @param textAlign Text alignment. Possible values: "left", "center", "right"
     * @zh 在画布上绘制文本（没有填色）。文本的默认颜色是黑色。
     * @param text 在画布上输出的文本
     * @param x 开始绘制文本的x坐标位置（相对于画布）
     * @param y 开始绘制文本的y坐标位置（相对于画布）
     * @param font 定义字体和字号，例如"20px Arial"
     * @param color 定义文本颜色，例如"#ff0000"
     * @param lineWidth 线条宽度
     * @param textAlign 文本对齐方式。可选值："left"、"center"、"right"
     */
    strokeText(text: string | WordText, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): FillTextCmd {
        return this.addCmd(FillTextCmd.create(text, x, y, font, null, textAlign, lineWidth, color));
    }

    /**
     * @en Set the transparency.
     * @param alpha The transparency value
     * @zh 设置透明度。
     * @param alpha 透明度值
     */
    alpha(alpha: number): AlphaCmd {
        return this.addCmd(AlphaCmd.create(alpha));
    }

    /**
     * @en Replace the current transformation matrix for drawing.
     * @param matrix The matrix
     * @param pivotX (Optional) X-coordinate of the pivot point. Default is 0.
     * @param pivotY (Optional) Y-coordinate of the pivot point. Default is 0.
     * @zh 替换绘图的当前转换矩阵。
     * @param matrix 矩阵
     * @param pivotX （可选）水平方向轴心点坐标。默认为0。
     * @param pivotY （可选）垂直方向轴心点坐标。默认为0。
     */
    transform(matrix: Matrix, pivotX: number = 0, pivotY: number = 0): TransformCmd {
        return this.addCmd(TransformCmd.create(matrix, pivotX, pivotY));
    }

    /**
     * @en Rotate the current drawing. (It's recommended to use transform for better performance)
     * @param angle The rotation angle in radians
     * @param pivotX (Optional) X-coordinate of the pivot point. Default is 0.
     * @param pivotY (Optional) Y-coordinate of the pivot point. Default is 0.
     * @zh 旋转当前绘图。(推荐使用transform，性能更高)
     * @param angle 旋转角度，以弧度计
     * @param pivotX （可选）水平方向轴心点坐标。默认为0。
     * @param pivotY （可选）垂直方向轴心点坐标。默认为0。
     */
    rotate(angle: number, pivotX: number = 0, pivotY: number = 0): RotateCmd {
        return this.addCmd(RotateCmd.create(angle, pivotX, pivotY));
    }

    /**
     * @en Scale the current drawing to a larger or smaller size. (It's recommended to use transform for better performance)
     * @param scaleX Horizontal scaling value
     * @param scaleY Vertical scaling value
     * @param pivotX (Optional) X-coordinate of the pivot point. Default is 0.
     * @param pivotY (Optional) Y-coordinate of the pivot point. Default is 0.
     * @zh 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
     * @param scaleX 水平方向缩放值
     * @param scaleY 垂直方向缩放值
     * @param pivotX （可选）水平方向轴心点坐标。默认为0。
     * @param pivotY （可选）垂直方向轴心点坐标。默认为0。
     */
    scale(scaleX: number, scaleY: number, pivotX: number = 0, pivotY: number = 0): ScaleCmd {
        return this.addCmd(ScaleCmd.create(scaleX, scaleY, pivotX, pivotY));
    }

    /**
     * @en Remap the (0,0) position on the canvas.
     * @param tx The value to add to the horizontal coordinate (x)
     * @param ty The value to add to the vertical coordinate (y)
     * @zh 重新映射画布上的 (0,0) 位置。
     * @param tx 添加到水平坐标（x）上的值
     * @param ty 添加到垂直坐标（y）上的值
     */
    translate(tx: number, ty: number): TranslateCmd {
        return this.addCmd(TranslateCmd.create(tx, ty));
    }

    /**
     * @en Save the current state of the environment.
     * @zh 保存当前环境的状态。
     */
    save(): SaveCmd {
        return this.addCmd(SaveCmd.create());
    }

    /**
     * @en Return the previously saved path state and properties.
     * @zh 返回之前保存过的路径状态和属性。
     */
    restore(): RestoreCmd {
        return this.addCmd(RestoreCmd.create());
    }

    /**
     * @en Replace text color.
     * @param color The new color
     * @zh 替换文本颜色。
     * @param color 新的颜色
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
     * @en Load and display an image.
     * @param url The URL of the image
     * @param x (Optional) The x-coordinate where the image will be displayed. Default is 0.
     * @param y (Optional) The y-coordinate where the image will be displayed. Default is 0.
     * @param width (Optional) The width to display the image. Set to 0 to use the default image width. Default is null.
     * @param height (Optional) The height to display the image. Set to 0 to use the default image height. Default is null.
     * @param complete (Optional) The callback function to be called when the image is loaded
     * @zh 加载并显示一个图片。
     * @param url 图片地址
     * @param x （可选）显示图片的x位置。默认为0。
     * @param y （可选）显示图片的y位置。默认为0。
     * @param width （可选）显示图片的宽度，设置为0表示使用图片默认宽度。默认为null。
     * @param height （可选）显示图片的高度，设置为0表示使用图片默认高度。默认为null。
     * @param complete （可选）加载完成回调
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
        context._material = this._material;
        var cmds = this._cmds!;
        for (let i = 0, n = cmds.length; i < n; i++) {
            cmds[i].run(context, x, y);
        }
        context._material = null;
    }

    /**
     * @internal
     */
    _renderOne(sprite: Sprite, context: Context, x: number, y: number): void {
        context.sprite = sprite;
        context._material = this._material;
        this._cmds[0].run(context, x, y);
        context._material = null;
    }

    /**
     * @en Draw a line.
     * @param fromX X-axis starting position
     * @param fromY Y-axis starting position
     * @param toX X-axis ending position
     * @param toY Y-axis ending position
     * @param lineColor Color of the line
     * @param lineWidth (Optional) Width of the line. Default is 1.
     * @zh 绘制一条线。
     * @param fromX X轴开始位置
     * @param fromY Y轴开始位置
     * @param toX X轴结束位置
     * @param toY Y轴结束位置
     * @param lineColor 线条颜色
     * @param lineWidth （可选）线条宽度。默认为1。
     */
    drawLine(fromX: number, fromY: number, toX: number, toY: number, lineColor: string, lineWidth: number = 1): DrawLineCmd {
        return this.addCmd(DrawLineCmd.create(fromX, fromY, toX, toY, lineColor, lineWidth));
    }

    /**
     * @en Draw a series of line segments.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param points Collection of points for line segments. Format: [x1,y1,x2,y2,x3,y3...]
     * @param lineColor Color of the line segments, or gradient object for filling the drawing
     * @param lineWidth (Optional) Width of the line segments. Default is 1.
     * @zh 绘制一系列线段。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param points 线段的点集合。格式：[x1,y1,x2,y2,x3,y3...]
     * @param lineColor 线段颜色，或者填充绘图的渐变对象
     * @param lineWidth （可选）线段宽度。默认为1。
     */
    drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number = 1): DrawLinesCmd | null {
        if (!points || points.length < 4) return null;
        return this.addCmd(DrawLinesCmd.create(x, y, points, lineColor, lineWidth));
    }

    /**
     * @en Draw a series of curves.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param points Collection of points for curves. Format: [controlX, controlY, anchorX, anchorY...]
     * @param lineColor Color of the curves, or gradient object for filling the drawing
     * @param lineWidth (Optional) Width of the curves. Default is 1.
     * @zh 绘制一系列曲线。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param points 曲线的点集合，格式：[controlX, controlY, anchorX, anchorY...]
     * @param lineColor 曲线颜色，或者填充绘图的渐变对象
     * @param lineWidth （可选）曲线宽度。默认为1。
     */
    drawCurves(x: number, y: number, points: any[], lineColor: any, lineWidth: number = 1): DrawCurvesCmd {
        return this.addCmd(DrawCurvesCmd.create(x, y, points, lineColor, lineWidth));
    }

    /**
     * @en Draw a rectangle.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param width Width of the rectangle
     * @param height Height of the rectangle
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing. Default is null.
     * @param lineWidth (Optional) Border width. Default is 1.
     * @param percent Whether the position and size are percentage values
     * @returns DrawRectCmd object
     * @zh 绘制矩形。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param width 矩形宽度
     * @param height 矩形高度
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。默认为null。
     * @param lineWidth （可选）边框宽度。默认为1。
     * @param percent 位置和大小是否是百分比值
     * @returns DrawRectCmd对象
     */
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any = null, lineWidth: number = 1, percent?: boolean): DrawRectCmd {
        return this.addCmd(DrawRectCmd.create(x, y, width, height, fillColor, lineColor, lineWidth, percent));
    }

    /**
     * @en Draw a rounded rectangle.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param width Width of the rounded rectangle
     * @param height Height of the rounded rectangle
     * @param lt Left-top corner radius
     * @param rt Right-top corner radius
     * @param lb Left-bottom corner radius
     * @param rb Right-bottom corner radius
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing. Default is null.
     * @param lineWidth (Optional) Border width. Default is 1.
     * @param percent (Optional) Whether the position and size are percentage values
     * @zh 绘制圆角矩形。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param width 圆角矩形宽度
     * @param height 圆角矩形高度
     * @param lt 左上圆角
     * @param rt 右上圆角
     * @param lb 左下圆角
     * @param rb 右下圆角
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。默认为null。
     * @param lineWidth （可选）边框宽度。默认为1。
     * @param percent （可选）位置和大小是否是百分比值
     */
    drawRoundRect(x: number, y: number, width: number, height: number, lt: number, rt: number, lb: number, rb: number, fillColor: any, lineColor: any = null, lineWidth: number = 1, percent?: boolean) {
        return this.addCmd(DrawRoundRectCmd.create(x, y, width, height, lt, rt, lb, rb, fillColor, lineColor, lineWidth, percent));
    }

    /**
     * @en Draw a circle.
     * @param x X-axis position of the circle center
     * @param y Y-axis position of the circle center
     * @param radius Radius of the circle
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing. Default is null.
     * @param lineWidth (Optional) Border width. Default is 1.
     * @zh 绘制圆形。
     * @param x 圆点X轴位置
     * @param y 圆点Y轴位置
     * @param radius 半径
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。默认为null。
     * @param lineWidth （可选）边框宽度。默认为1。
     */
    drawCircle(x: number, y: number, radius: number, fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawCircleCmd {
        return this.addCmd(DrawCircleCmd.create(x, y, radius, fillColor, lineColor, lineWidth));
    }

    /**
     * @en Draw an ellipse.
     * @param x X-axis position of the ellipse center
     * @param y Y-axis position of the ellipse center
     * @param width Horizontal radius
     * @param height Vertical radius
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing
     * @param lineWidth (Optional) Border width
     * @param percent (Optional) Whether the position and size are percentage values
     * @zh 绘制椭圆形。
     * @param x 圆点X轴位置
     * @param y 圆点Y轴位置
     * @param width 横向半径
     * @param height 纵向半径
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象
     * @param lineWidth （可选）边框宽度
     * @param percent （可选）位置和大小是否是百分比值
     */
    drawEllipse(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any, lineWidth: number, percent?: boolean): DrawEllipseCmd {
        return this.addCmd(DrawEllipseCmd.create(x, y, width, height, fillColor, lineColor, lineWidth, percent));
    }

    /**
     * @en Draw a pie.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param radius Radius of the pie
     * @param startAngle Start angle
     * @param endAngle End angle
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing. Default is null.
     * @param lineWidth (Optional) Border width. Default is 1.
     * @zh 绘制扇形。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param radius 扇形半径
     * @param startAngle 开始角度
     * @param endAngle 结束角度
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。默认为null。
     * @param lineWidth （可选）边框宽度。默认为1。
     */
    drawPie(x: number, y: number, radius: number, startAngle: number, endAngle: number, fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawPieCmd {
        return this.addCmd(DrawPieCmd.create(x, y, radius, Utils.toRadian(startAngle), Utils.toRadian(endAngle), fillColor, lineColor, lineWidth));
    }

    /**
     * @en Draw a polygon.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param points Collection of points for the polygon
     * @param fillColor Fill color, or gradient object for filling the drawing
     * @param lineColor (Optional) Border color, or gradient object for filling the drawing. Default is null.
     * @param lineWidth (Optional) Border width. Default is 1.
     * @zh 绘制多边形。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param points 多边形的点集合
     * @param fillColor 填充颜色，或者填充绘图的渐变对象
     * @param lineColor （可选）边框颜色，或者填充绘图的渐变对象。默认为null。
     * @param lineWidth （可选）边框宽度。默认为1。
     */
    drawPoly(x: number, y: number, points: any[], fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawPolyCmd {
        return this.addCmd(DrawPolyCmd.create(x, y, points, fillColor, lineColor, lineWidth));
    }

    /**
     * @en Draw a path.
     * @param x X-axis position to start drawing
     * @param y Y-axis position to start drawing
     * @param paths Collection of paths. Paths support the following format: [["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]
     * @param brush (Optional) Brush definition, supports the following settings: {fillStyle:"#FF0000"}
     * @param pen (Optional) Pen definition, supports the following settings: {strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}
     * @zh 绘制路径。
     * @param x 开始绘制的X轴位置
     * @param y 开始绘制的Y轴位置
     * @param paths 路径集合，路径支持以下格式：[["moveTo",x,y],["lineTo",x,y],["arcTo",x1,y1,x2,y2,r],["closePath"]]
     * @param brush （可选）刷子定义，支持以下设置：{fillStyle:"#FF0000"}
     * @param pen （可选）画笔定义，支持以下设置：{strokeStyle,lineWidth,lineJoin:"bevel|round|miter",lineCap:"butt|round|square",miterLimit}
     */
    drawPath(x: number, y: number, paths: any[], brush: any = null, pen: any = null): DrawPathCmd {
        return this.addCmd(DrawPathCmd.create(x, y, paths, brush, pen));
    }

    /**
     * @en Draw an image with nine-grid
     * @param texture The texture to draw
     * @param x (Optional) X-axis position. Default is 0.
     * @param y (Optional) Y-axis position. Default is 0.
     * @param width (Optional) Width of the image. Default is 0.
     * @param height (Optional) Height of the image. Default is 0.
     * @param sizeGrid Nine-grid information
     * @param color (Optional) Color to tint the image
     * @zh 绘制带九宫格的图片
     * @param texture 要绘制的纹理
     * @param x （可选）X轴位置。默认为0。
     * @param y （可选）Y轴位置。默认为0。
     * @param width （可选）图片宽度。默认为0。
     * @param height （可选）图片高度。默认为0。
     * @param sizeGrid 九宫格信息
     * @param color （可选）图片的着色颜色
     */
    draw9Grid(texture: Texture, x: number = 0, y: number = 0, width: number = 0, height: number = 0, sizeGrid: any[], color?: string): void {
        this.addCmd(Draw9GridTextureCmd.create(texture, x, y, width, height, sizeGrid, false, color));
    }
}
