import { Matrix } from "../../maths/Matrix"
import { Rectangle } from "../../maths/Rectangle";
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from '../../utils/ColorUtils';
import { Pool } from "../../utils/Pool";
import { GraphicsCommandDependency, type GraphicsCommandInfo, GraphicsCommandLayoutRefresh, IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

const className = "DrawTextureCmd";

/**
 * @en Draw a single texture
 * @zh 绘制单个贴图
 */
export class DrawTextureCmd implements IGraphicsCmd {
    /** @internal */
    _cacheData: any;

    /**
     * @en Identifier for the DrawTextureCmd
     * @zh 绘制单个贴图命令的标识符
     */
    static readonly ID: string = className;

    /** @internal */
    _texture: Texture | null = null;
    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    get texture(): Texture | null {
        return this._texture;
    }
    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    set texture(val: Texture) { //修复场景或预制体加载时没有添加资源引用
        !!val && val._addReference();
        this._texture?._removeReference();
        this._texture = val;
    }

    /**
     * @en (Optional) X-axis offset.
     * @zh （可选）X轴偏移量。
     */
    x: number = 0;
    /**
     * @en (Optional) Y-axis offset.
     * @zh （可选）Y轴偏移量。
     */
    y: number = 0;
    /**
     * @en (Optional) Width of the texture.
     * @zh （可选）纹理的宽度。
     */
    width: number = 1;
    /**
     * @en (Optional) Height of the texture.
     * @zh （可选）纹理的高度。
     */
    height: number = 1;
    /**
     * @en Whether the position and size are percentages
     * @zh 位置和大小是否是百分比
     */
    percent: boolean = true;
    /**
     * @en (Optional) Matrix information for transformation.
     * @zh （可选）矩阵信息，用于变换。
     */
    matrix: Matrix | null;
    /**
     * @en (Optional) Alpha value.
     * @zh （可选）透明度。
     */
    alpha: number = 1;
    /**
     * @en (Optional) Color filter. The format is ABGR.
     * @zh （可选）颜色滤镜。格式是ABGR。
     */
    color: number = 0xffffffff;
    /**
     * @en (Optional) Blend mode.
     * @zh （可选）混合模式。
     */
    blendMode: string | null;

    /**
     * @en (Optional) UV coordinates.
     * @zh （可选）UV坐标。
     */
    uv: number[] | null = null;

    /**
     * @en Create a DrawTextureCmd instance
     * @param texture The texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the texture
     * @param height Height of the texture
     * @param matrix Matrix information for transformation
     * @param alpha Alpha value
     * @param color Color filter
     * @param blendMode Blend mode
     * @param uv UV coordinates
     * @returns DrawTextureCmd instance
     * @zh 创建一个绘制单个贴图实例
     * @param texture 要绘制的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 纹理的宽度
     * @param height 纹理的高度
     * @param matrix 矩阵信息，用于变换
     * @param alpha 透明度
     * @param color 颜色滤镜
     * @param blendMode 混合模式
     * @param uv UV坐标
     * @returns DrawTextureCmd实例
     */
    static create(texture: Texture, x?: number, y?: number, width?: number, height?: number, matrix?: Matrix, alpha?: number, color?: string, blendMode?: string, uv?: number[], percent?: boolean): DrawTextureCmd {
        let cmd: DrawTextureCmd = Pool.getItemByClass(className, DrawTextureCmd);
        cmd.texture = texture;
        cmd.x = x ?? 0;
        cmd.y = y ?? 0;
        cmd.width = width ?? texture.sourceWidth;
        cmd.height = height ?? texture.sourceHeight;
        cmd.percent = percent;
        cmd.matrix = matrix;
        cmd.alpha = alpha ?? 1;
        cmd.blendMode = blendMode;
        cmd.uv = uv;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this._texture && this._texture._removeReference();
        this._texture = null;
        this.matrix = null;
        this._cacheData = null;
        Pool.recover(className, this);
    }

    /**
     * @en Execute the draw texture command.
     * @param runner The rendering context.
     * @param gx Starting X coordinate.
     * @param gy Starting Y coordinate.
     * @zh 执行绘制纹理命令。
     * @param runner 渲染上下文。
     * @param gx 起始 X 坐标。
     * @param gy 起始 Y 坐标。
     */

    run(runner: GraphicsRunner, gx: number, gy: number): void {
        let tex = this._texture;
        if (!tex)
            return;

        let x = this.x, y = this.y, w = this.width, h = this.height;
        if (this.percent && runner.sprite) {
            x *= runner.sprite.width;
            y *= runner.sprite.height;
            w *= runner.sprite.width;
            h *= runner.sprite.height;
        }

        let wRate = w / tex.sourceWidth;
        let hRate = h / tex.sourceHeight;
        w = tex.width * wRate;
        h = tex.height * hRate;

        x += tex.offsetX * wRate;
        y += tex.offsetY * hRate;

        runner.drawTextureWithTransform(this._texture, x, y, w, h, this.matrix, gx, gy, this.alpha, this.blendMode, this.uv, this.color);
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let rect = Rectangle.TEMP.setTo(this.x, this.y, this.width, this.height);
        if (this.percent) {
            rect.scale(assembler.width, assembler.height);
        }
        rect.getBoundPoints(assembler.points);
    }

    /**
     * @en The identifier for the DrawTextureCmd
     * @zh 绘制单个贴图命令的标识符
     */
    get cmdID(): string {
        return DrawTextureCmd.ID;
    }

    /**
     * @ignore @blueprintIgnore
     */
    needsLayoutRepaint(): number {
        return this.percent ? 1 : 0;
    }

    /** @internal */
    getGraphicsCommandInfo(out: GraphicsCommandInfo): GraphicsCommandInfo {
        out.dependency = this.percent ? GraphicsCommandDependency.SizePayload : GraphicsCommandDependency.None;
        out.layoutRefresh = this.percent
            ? (this.matrix ? GraphicsCommandLayoutRefresh.RerunCommand : GraphicsCommandLayoutRefresh.MarkDirty)
            : GraphicsCommandLayoutRefresh.None;
        out.scaleTessellationKey = 0;
        out.isStateCommand = false;
        return out;
    }
}

ClassUtils.regClass(className, DrawTextureCmd);
