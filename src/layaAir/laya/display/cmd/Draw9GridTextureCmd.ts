import { Rectangle } from "../../maths/Rectangle";
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

/**
 * @en Draw a texture with nine-grid information
 * @zh 绘制带九宫格信息的图片
 */
export class Draw9GridTextureCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the Draw9GridTextureCmd
     * @zh 绘制带九宫格信息的图片命令的标识符
     */
    static ID: string = "Draw9GridTexture";

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
     * @private
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
        let cmd: Draw9GridTextureCmd = Pool.getItemByClass("Draw9GridTextureCmd", Draw9GridTextureCmd);
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
        Pool.recover("Draw9GridTextureCmd", this);
    }

    /**
     * @private
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
            if (this.percent && runner.sprite) {
                let w = runner.sprite.width;
                let h = runner.sprite.height;
                runner.drawTextureWithSizeGrid(this.texture, this.x * w, this.y * h, this.width * w, this.height * h, sizeGrid, gx, gy, this.color);
            }
            else
                runner.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, sizeGrid, gx, gy, this.color);
        }
    }

    /**
     * @private
     * @en The identifier for the Draw9GridTextureCmd
     * @zh 绘制带九宫格信息的图片命令的标识符
     */
    get cmdID(): string {
        return Draw9GridTextureCmd.ID;
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        let rect = Rectangle.TEMP.setTo(this.x, this.y, this.width, this.height);
        if (this.percent) {
            rect.scale(assembler.width, assembler.height);
            assembler.affectBySize = true;
        }
        rect.getBoundPoints(assembler.points);
    }
}

const EMPTY_SIZE_GRID = [0, 0, 0, 0, 0];
ClassUtils.regClass("Draw9GridTextureCmd", Draw9GridTextureCmd);
