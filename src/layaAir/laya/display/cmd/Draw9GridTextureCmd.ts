import { Rectangle } from "../../maths/Rectangle";
import { Texture } from "../../resource/Texture"
import { genSliceMesh } from "../mesh/MeshFactory";
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool"
import { VertexStream } from "../../utils/VertexStream";
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

const className = "Draw9GridTextureCmd";

/**
 * @en Draw a texture with nine-grid information
 * @zh 绘制带九宫格信息的图片
 */
export class Draw9GridTextureCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the Draw9GridTextureCmd
     * @zh 绘制带九宫格信息的图片命令的标识符
     */
    static readonly ID: string = className;

    /**
     * @en The texture to be drawn
     * @zh 要绘制的纹理
     */
    texture: Texture;
    /**
     * @en (Optional) X-axis offset
     * @zh （可选）X轴偏移量
     */
    x: number = 0;
    /**
     * @en (Optional) Y-axis offset
     * @zh （可选）Y轴偏移量
     */
    y: number = 0;
    /**
     * @en (Optional) Width of the drawn texture
     * @zh （可选）绘制纹理的宽度
     */
    width: number = 1;
    /**
     * @en (Optional) Height of the drawn texture
     * @zh （可选）绘制纹理的高度
     */
    height: number = 1;

    /**
     * @en The size grid of the texture.
     * The size grid is a 3x3 division of the texture, allowing it to be scaled without distorting the corners and edges. 
     * The array contains five values representing the top, right, bottom, and left margins, and whether to repeat the fill (0: no repeat, 1: repeat). 
     * The values are separated by commas. For example: "6,6,6,6,1".
     * @zh 纹理的九宫格数据。
     * 九宫格是一种将纹理分成3x3格的方式，使得纹理缩放时保持角和边缘不失真。
     * 数组包含五个值，分别代表上边距、右边距、下边距、左边距以及是否重复填充（0：不重复填充，1：重复填充）。
     * 值以逗号分隔。例如："6,6,6,6,1"。
     */
    sizeGrid: number[];

    /**
     * @en Color tint for the texture (default: 0xffffffff)
     * @zh 纹理的颜色色调（默认值：0xffffffff）
     */
    color: number = 0xffffffff;

    /**
     * @en Whether the position and size are percentages
     * @zh 位置和大小是否是百分比
     */
    percent: boolean = true;

    /**
     * @en Creates or retrieves a Draw9GridTextureCmd instance from the object pool and initializes it with the specified parameters.
     * @param texture The texture to be drawn
     * @param x X-axis offset
     * @param y Y-axis offset
     * @param width Width of the drawn texture
     * @param height Height of the drawn texture
     * @param sizeGrid Nine-grid information
     * @param percent Whether the position and size are percentages (default: false)
     * @param color Color tint for the texture (default: null)
     * @returns A Draw9GridTextureCmd instance initialized with the given parameters
     * @zh 从对象池创建或获取一个 Draw9GridTextureCmd 实例，并使用指定的参数进行初始化。
     * @param texture 要绘制的纹理
     * @param x X轴偏移量
     * @param y Y轴偏移量
     * @param width 绘制纹理的宽度
     * @param height 绘制纹理的高度
     * @param sizeGrid 九宫格信息
     * @param percent 位置和大小是否是百分比（默认值：false）
     * @param color 纹理的颜色色调（默认值：null）
     * @returns 一个已用给定参数初始化的 Draw9GridTextureCmd 实例
     */
    static create(texture: Texture, x: number, y: number, width: number, height: number, sizeGrid: number[], percent?: boolean, color?: string): Draw9GridTextureCmd {
        let cmd: Draw9GridTextureCmd = Pool.getItemByClass(className, Draw9GridTextureCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.sizeGrid = sizeGrid;
        cmd.percent = percent;
        cmd.color = color != null ? ColorUtils.create(color).numColor : 0xffffffff;
        return cmd;
    }

    /**
     * @en Recycle the instance to the object pool
     * @zh 将实例回收到对象池
     */
    recover(): void {
        this.texture?._removeReference();
        this.texture = null;
        Pool.recover(className, this);
    }

    /**
     * @en Execute the draw nine-grid texture command in the given context
     * @param runner The rendering context
     * @param gx The global x coordinate
     * @param gy The global y coordinate
     * @zh 在给定的上下文中执行绘制九宫格纹理命令
     * @param runner 渲染上下文
     * @param gx 全局 x 坐标
     * @param gy 全局 y 坐标
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        if (this.texture) {
            let sizeGrid = this.sizeGrid || this.texture._sizeGrid || EMPTY_SIZE_GRID;
            let x = this.x;
            let y = this.y;

            let w = this.width;
            let h = this.height;

            if (this.percent && runner.sprite) {
                x *= runner.sprite.width;
                y *= runner.sprite.height;
                w *= runner.sprite.width;
                h *= runner.sprite.height;
            }

            let vb = VertexStream.pool.take(this.texture);
            vb.contentRect.setTo(0, 0, w, h);
            if (this.color)
                vb.color.setABGR(this.color);

            let gridRect = Rectangle.create();
            let sourceWidth = vb.mainTex.sourceWidth;
            let sourceHeight = vb.mainTex.sourceHeight;
            gridRect.setTo(sizeGrid[3], sizeGrid[0],
                sourceWidth - sizeGrid[1] - sizeGrid[3],
                sourceHeight - sizeGrid[0] - sizeGrid[2]);

            genSliceMesh(vb, vb.contentRect, vb.uvRect, gridRect, sizeGrid[4] === 1 ? 0xff : 0);

            runner.drawTriangles(this.texture, x + gx, y + gy, vb.getVertices(), vb.getUVs(), vb.getIndices(),
                null, 1, null, null, vb.getColors(), this.texture.uvrect);

            VertexStream.pool.recover(vb);
        }
    }

    /**
     * @en The identifier for the Draw9GridTextureCmd
     * @zh 绘制带九宫格信息的图片命令的标识符
     */
    get cmdID(): string {
        return Draw9GridTextureCmd.ID;
    }

    /**
     * @ignore @blueprintIgnore
     */
    needsLayoutRepaint(): number {
        return this.percent ? 1 : 0;
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
}

const EMPTY_SIZE_GRID = [0, 0, 0, 0, 0];
ClassUtils.regClass(className, Draw9GridTextureCmd);
