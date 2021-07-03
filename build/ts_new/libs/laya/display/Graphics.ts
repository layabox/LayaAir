import { Sprite } from "./Sprite";
import { GraphicsBounds } from "./GraphicsBounds";
import { SpriteConst } from "./SpriteConst";
import { AlphaCmd } from "./cmd/AlphaCmd"
import { ClipRectCmd } from "./cmd/ClipRectCmd"
import { Draw9GridTexture } from "./cmd/Draw9GridTexture"
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
import { Event } from "../events/Event"
import { Matrix } from "../maths/Matrix"
import { Point } from "../maths/Point"
import { Rectangle } from "../maths/Rectangle"
import { Render } from "../renders/Render"
import { Context } from "../resource/Context"
import { Texture } from "../resource/Texture"
import { Utils } from "../utils/Utils"
import { VectorGraphManager } from "../utils/VectorGraphManager"
import { ILaya } from "../../ILaya";

/**
 * <code>Graphics</code> 类用于创建绘图显示对象。Graphics可以同时绘制多个位图或者矢量图，还可以结合save，restore，transform，scale，rotate，translate，alpha等指令对绘图效果进行变化。
 * Graphics以命令流方式存储，可以通过cmds属性访问所有命令流。Graphics是比Sprite更轻量级的对象，合理使用能提高应用性能(比如把大量的节点绘图改为一个节点的Graphics命令集合，能减少大量节点创建消耗)。
 * @see laya.display.Sprite#graphics
 */
export class Graphics {
    /**@internal */
    _sp: Sprite|null = null;
    /**@internal */
    _one: any = null;
    /**@internal */
    _render: (sprite: Sprite, context: Context, x: number, y: number)=>void = this._renderEmpty;
    /**@private */
    private _cmds: any[]|null = null;
    /**@private */
    protected _vectorgraphArray: any[]|null = null;
    /**@private */
    private _graphicBounds: GraphicsBounds|null = null;
    /**@private */
    autoDestroy: boolean = false;

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
            this._sp._setRenderType(0);
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
            var tCmd = this._one;
            if (this._cmds) {
                var i: number, len = this._cmds.length;
                for (i = 0; i < len; i++) {
                    tCmd = this._cmds[i];
                    tCmd.recover();
                }
                this._cmds.length = 0;
            } else if (tCmd) {
                tCmd.recover();
            }
        } else {
            this._cmds = null;
        }

        this._one = null;
        this._render = this._renderEmpty;
        this._clearData();
        //_sp && (_sp._renderType &= ~SpriteConst.IMAGE);
        if (this._sp) {
            this._sp._renderType &= ~SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        this._repaint();
        if (this._vectorgraphArray) {
            for (i = 0, len = this._vectorgraphArray.length; i < len; i++) {
                VectorGraphManager.getInstance().deleteShape(this._vectorgraphArray[i]);
            }
            this._vectorgraphArray.length = 0;
        }
    }

    /**@private */
    private _clearBoundsCache(): void {
        if (this._graphicBounds) this._graphicBounds.reset();
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
        return !this._cmds || this._cmds.length === 0;
    }

    /**
     * @private
     * 命令流。存储了所有绘制命令。
     */
    get cmds(): any[] {
        //TODO:单命令不对
        return this._cmds as any[];
    }

    set cmds(value: any[]) {
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        this._cmds = value;
        this._render = this._renderAll;
        this._repaint();
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
     * 绘制单独图片
     * @param texture		纹理。
     * @param x 		（可选）X轴偏移量。
     * @param y 		（可选）Y轴偏移量。
     * @param width		（可选）宽度。
     * @param height	（可选）高度。
     */
    drawImage(texture: Texture, x: number = 0, y: number = 0, width: number = 0, height: number = 0): DrawImageCmd|null {
        if (!texture) return null;
        if (!width) width = texture.sourceWidth;
        if (!height) height = texture.sourceHeight;
        if (texture.getIsReady()) {
            var wRate = width / texture.sourceWidth;
            var hRate = height / texture.sourceHeight;
            width = texture.width * wRate;
            height = texture.height * hRate;
            if (width <= 0 || height <= 0) return null;

            x += texture.offsetX * wRate;
            y += texture.offsetY * hRate;
        }

        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }

        var args = DrawImageCmd.create.call(this, texture, x, y, width, height);

        if (this._one == null) {
            this._one = args;
            this._render = this._renderOneImg;
            //if(_sp)_sp._renderType |= SpriteConst.IMAGE;
        } else {
            this._saveToCmd(null, args);
        }
        //if (!tex.loaded) {
        //tex.once(Event.LOADED, this, _textureLoaded, [tex, args]);
        //}
        this._repaint();
        return args;
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
    drawTexture(texture: Texture|null, x: number = 0, y: number = 0, width: number = 0, height: number = 0, matrix: Matrix|null = null, alpha: number = 1, color: string|null = null, blendMode: string|null = null, uv?: number[]): DrawTextureCmd|null {
        if (!texture || alpha < 0.01) return null;
        if (!texture.getIsReady()) return null;
        if (!width) width = texture.sourceWidth;
        if (!height) height = texture.sourceHeight;
        if (texture.getIsReady()) {
            var wRate = width / texture.sourceWidth;
            var hRate = height / texture.sourceHeight;
            width = texture.width * wRate;
            height = texture.height * hRate;
            if (width <= 0 || height <= 0) return null;

            x += texture.offsetX * wRate;
            y += texture.offsetY * hRate;
        }

        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }

        // canvas 模式不支持
        var args: DrawTextureCmd = DrawTextureCmd.create.call(this, texture, x, y, width, height, matrix, alpha, color, blendMode, uv);
        this._repaint();

        return this._saveToCmd(null, args);
    }

    /**
     * 批量绘制同样纹理。
     * @param texture 纹理。
     * @param pos 绘制次数和坐标。
     */
    drawTextures(texture: Texture, pos: any[]): DrawTexturesCmd|null {
        if (!texture) return null;
        return this._saveToCmd(Render._context.drawTextures, DrawTexturesCmd.create.call(this, texture, pos));
    }

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
	drawTriangles(texture: Texture, x: number, y: number, vertices: Float32Array, uvs: Float32Array, indices: Uint16Array, matrix: Matrix|null = null, 
			alpha: number = 1, color: string|null = null, blendMode: string|null = null, colorNum: number = 0xffffffff): DrawTrianglesCmd {
		return this._saveToCmd(Render._context.drawTriangles, 
			DrawTrianglesCmd.create.call(this, texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode, colorNum));
    }

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
    fillTexture(texture: Texture, x: number, y: number, width: number = 0, height: number = 0, type: string = "repeat", offset: Point|null = null): FillTextureCmd|null {
        if (texture && texture.getIsReady())
            return this._saveToCmd(Render._context._fillTexture, FillTextureCmd.create.call(this, texture, x, y, width, height, type, offset || Point.EMPTY, {}));
        else
            return null;
    }

    /**
     * @internal
     * 保存到命令流。
     */
    _saveToCmd(fun: Function|null, args: any): any {
        if (this._sp) {
            this._sp._renderType |= SpriteConst.GRAPHICS;
            this._sp._setRenderType(this._sp._renderType);
        }
        if (this._one == null) {
            this._one = args;
            this._render = this._renderOne;
        } else {
            //_sp && (_sp._renderType &= ~SpriteConst.IMAGE);
            this._render = this._renderAll;
            (this._cmds || (this._cmds = [])).length === 0 && this._cmds.push(this._one);
            this._cmds.push(args);
        }
        this._repaint();
        return args;
    }

    /**
     * 设置剪裁区域，超出剪裁区域的坐标不显示。
     * @param x X 轴偏移量。
     * @param y Y 轴偏移量。
     * @param width 宽度。
     * @param height 高度。
     */
    clipRect(x: number, y: number, width: number, height: number): ClipRectCmd {
        return this._saveToCmd(Render._context.clipRect, ClipRectCmd.create.call(this, x, y, width, height));
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
    fillText(text: string, x: number, y: number, font: string, color: string, textAlign: string): FillTextCmd {
        return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, text, null, x, y, font || ILaya.Text.defaultFontStr(), color, textAlign, 0, ""));
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

    fillBorderText(text: string, x: number, y: number, font: string, fillColor: string, textAlign: string, lineWidth: number, borderColor: string): FillTextCmd {
        return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, text, null, x, y, font || ILaya.Text.defaultFontStr(), fillColor, textAlign, lineWidth, borderColor));
    }

    /*** @private */
    fillWords(words: any[], x: number, y: number, font: string, color: string): FillTextCmd {
        return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, null, words, x, y, font || ILaya.Text.defaultFontStr(), color,'',0,null));
    }

    /*** @private */
    fillBorderWords(words: any[], x: number, y: number, font: string, fillColor: string, borderColor: string, lineWidth: number): FillTextCmd {
        return this._saveToCmd(Render._context.fillText, FillTextCmd.create.call(this, null, words, x, y, font || ILaya.Text.defaultFontStr(), fillColor, "", lineWidth, borderColor));
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
    strokeText(text: string, x: number, y: number, font: string, color: string, lineWidth: number, textAlign: string): FillTextCmd {
		return this._saveToCmd(Render._context.fillText, 
			FillTextCmd.create.call(this, text, null, x, y, font || ILaya.Text.defaultFontStr(), null, textAlign, lineWidth, color));
    }

    /**
     * 设置透明度。
     * @param value 透明度。
     */
    alpha(alpha: number): AlphaCmd {
        return this._saveToCmd(Render._context.alpha, AlphaCmd.create.call(this, alpha));
    }

    /**
     * 替换绘图的当前转换矩阵。
     * @param mat 矩阵。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    transform(matrix: Matrix, pivotX: number = 0, pivotY: number = 0): TransformCmd {
        return this._saveToCmd(Render._context._transform, TransformCmd.create.call(this, matrix, pivotX, pivotY));
    }

    /**
     * 旋转当前绘图。(推荐使用transform，性能更高)
     * @param angle		旋转角度，以弧度计。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    rotate(angle: number, pivotX: number = 0, pivotY: number = 0): RotateCmd {
        return this._saveToCmd(Render._context._rotate, RotateCmd.create.call(this, angle, pivotX, pivotY));
    }

    /**
     * 缩放当前绘图至更大或更小。(推荐使用transform，性能更高)
     * @param scaleX	水平方向缩放值。
     * @param scaleY	垂直方向缩放值。
     * @param pivotX	（可选）水平方向轴心点坐标。
     * @param pivotY	（可选）垂直方向轴心点坐标。
     */
    scale(scaleX: number, scaleY: number, pivotX: number = 0, pivotY: number = 0): ScaleCmd {
        return this._saveToCmd(Render._context._scale, ScaleCmd.create.call(this, scaleX, scaleY, pivotX, pivotY));
    }

    /**
     * 重新映射画布上的 (0,0) 位置。
     * @param x 添加到水平坐标（x）上的值。
     * @param y 添加到垂直坐标（y）上的值。
     */
    translate(tx: number, ty: number): TranslateCmd {
        return this._saveToCmd(Render._context.translate, TranslateCmd.create.call(this, tx, ty));
    }

    /**
     * 保存当前环境的状态。
     */
    save(): SaveCmd {
        return this._saveToCmd(Render._context._save, SaveCmd.create.call(this));
    }

    /**
     * 返回之前保存过的路径状态和属性。
     */
    restore(): RestoreCmd {
        return this._saveToCmd(Render._context.restore, RestoreCmd.create.call(this));
    }

    /**
     * @private
     * 替换文本内容。
     * @param text 文本内容。
     * @return 替换成功则值为true，否则值为flase。
     */
    replaceText(text: string): boolean {
        this._repaint();
        //todo 该函数现在加速器应该不对
        var cmds = this._cmds;
        if (!cmds) {
            if (this._one && this._isTextCmd(this._one)) {
                this._one.text = text;
                return true;
            }
        } else {
            for (var i = cmds.length - 1; i > -1; i--) {
                if (this._isTextCmd(cmds[i])) {
                    cmds[i].text = text;
                    return true;
                }
            }
        }
        return false;
    }

    /**@private */
    private _isTextCmd(cmd: any): boolean {
        var cmdID: string = cmd.cmdID;
        return cmdID == FillTextCmd.ID;
    }

    /**
     * @private
     * 替换文本颜色。
     * @param color 颜色。
     */
    replaceTextColor(color: string): void {
        this._repaint();
        var cmds = this._cmds;
        if (!cmds) {
            if (this._one && this._isTextCmd(this._one)) {
                this._setTextCmdColor(this._one, color);
            }
        } else {
            for (var i = cmds.length - 1; i > -1; i--) {
                if (this._isTextCmd(cmds[i])) {
                    this._setTextCmdColor(cmds[i], color);
                }
            }
        }
    }

    /**@private */
    private _setTextCmdColor(cmdO: any, color: string): void {
        var cmdID: string = cmdO.cmdID;
        switch (cmdID) {
            case FillTextCmd.ID:
                (cmdO as FillTextCmd).color = color;
                break;
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
    loadImage(url: string, x: number = 0, y: number = 0, width: number = 0, height: number = 0, complete: Function|null = null): void {
        var tex = ILaya.Loader.getRes(url) as Texture;
        if (!tex) {
            tex = new Texture();
            tex.load(url);
            ILaya.Loader.cacheTexture(url, tex);
            tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
        } else {
            if (!tex.getIsReady()) {
                tex.once(Event.READY, this, this.drawImage, [tex, x, y, width, height]);
            } else
                this.drawImage(tex, x, y, width, height);
        }
        if (complete != null) {
            tex.getIsReady() ? complete.call(this._sp) : tex.on(Event.READY, this._sp, complete);
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
        var cmds = this._cmds!;
        for (var i = 0, n = cmds.length; i < n; i++) {
            cmds[i].run(context, x, y);
        }
    }

    /**
     * @internal
     */
    _renderOne(sprite: Sprite, context: Context, x: number, y: number): void {
        context.sprite = sprite;
        this._one.run(context, x, y);
    }

    /**
     * @internal
     */
    _renderOneImg(sprite: Sprite, context: Context, x: number, y: number): void {
        context.sprite = sprite;
        this._one.run(context, x, y);
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
        var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
        return this._saveToCmd(Render._context._drawLine, DrawLineCmd.create.call(this, fromX + offset, fromY + offset, toX + offset, toY + offset, lineColor, lineWidth, 0));
    }

    /**
     * 绘制一系列线段。
     * @param x			开始绘制的X轴位置。
     * @param y			开始绘制的Y轴位置。
     * @param points	线段的点集合。格式:[x1,y1,x2,y2,x3,y3...]。
     * @param lineColor	线段颜色，或者填充绘图的渐变对象。
     * @param lineWidth	（可选）线段宽度。
     */
    drawLines(x: number, y: number, points: any[], lineColor: any, lineWidth: number = 1): DrawLinesCmd|null {
        if (!points || points.length < 4) return null;
        var offset = (lineWidth < 1 || lineWidth % 2 === 0) ? 0 : 0.5;
        //TODO 线段需要缓存
        return this._saveToCmd(Render._context._drawLines, DrawLinesCmd.create.call(this, x + offset, y + offset, points, lineColor, lineWidth, 0));
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
        return this._saveToCmd(Render._context.drawCurves, DrawCurvesCmd.create.call(this, x, y, points, lineColor, lineWidth));
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
     */
    drawRect(x: number, y: number, width: number, height: number, fillColor: any, lineColor: any = null, lineWidth: number = 1): DrawRectCmd {
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        var lineOffset = lineColor ? lineWidth : 0;
        return this._saveToCmd(Render._context.drawRect, DrawRectCmd.create.call(this, x + offset, y + offset, width - lineOffset, height - lineOffset, fillColor, lineColor, lineWidth));
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
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        return this._saveToCmd(Render._context._drawCircle, DrawCircleCmd.create.call(this, x, y, radius - offset, fillColor, lineColor, lineWidth, 0));
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
        var offset = (lineWidth >= 1 && lineColor) ? lineWidth / 2 : 0;
        var lineOffset = lineColor ? lineWidth : 0;

        return this._saveToCmd(Render._context._drawPie, DrawPieCmd.create.call(this, x + offset, y + offset, radius - lineOffset, Utils.toRadian(startAngle), Utils.toRadian(endAngle), fillColor, lineColor, lineWidth, 0));
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
        var tIsConvexPolygon = false;
        //这里加入多加形是否是凸边形
        if (points.length > 6) {
            tIsConvexPolygon = false;
        } else {
            tIsConvexPolygon = true;
        }
        var offset = (lineWidth >= 1 && lineColor) ? (lineWidth % 2 === 0 ? 0 : 0.5) : 0;
        //TODO 非凸多边形需要缓存
        return this._saveToCmd(Render._context._drawPoly, DrawPolyCmd.create.call(this, x + offset, y + offset, points, fillColor, lineColor, lineWidth, tIsConvexPolygon, 0));
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
        return this._saveToCmd(Render._context._drawPath, DrawPathCmd.create.call(this, x, y, paths, brush, pen));
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
     */
    draw9Grid(texture: Texture, x: number = 0, y: number = 0, width: number = 0, height: number = 0, sizeGrid: any[]): void {
        this._saveToCmd(null, Draw9GridTexture.create(texture, x, y, width, height, sizeGrid));
    }
}