import { Rectangle } from "../../maths/Rectangle";
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"
import { IGraphicsBoundsAssembler, IGraphicsCmd } from "../IGraphics";
import { GraphicsRunner } from "../Scene2DSpecial/GraphicsRunner";

/**
 * @en Draw multiple textures based on coordinate sets
 * @zh 根据坐标集合绘制多个贴图
 */
export class DrawTexturesCmd implements IGraphicsCmd {
    /**
     * @en Identifier for the DrawTexturesCmd
     * @zh 根据坐标集合绘制多个贴图命令的标识符
     */
    static ID: string = "DrawTextures";

    /**
     * @en The texture to be drawn.
     * @zh 要绘制的纹理。
     */
    texture: Texture;
    /**
     * @en Drawing times and coordinates.
     * @zh 绘制次数和坐标。
     */
    pos: ArrayLike<number>;

    /**
     * @en Additional vertex colors.
     * @zh 附加顶点色。
     */
    colors: number[];

    /**
     * @en Create a DrawTexturesCmd instance
     * @param texture The texture to be drawn
     * @param pos Drawing times and coordinates
     * @param colors Additional vertex colors
     * @returns DrawTexturesCmd instance
     * @zh 创建一个根据坐标集合绘制多个贴图实例
     * @param texture 要绘制的纹理
     * @param pos 绘制次数和坐标
     * @param colors 附加顶点色
     * @returns DrawTexturesCmd实例
     */
    static create(texture: Texture, pos: number[], colors: number[]): DrawTexturesCmd {
        var cmd: DrawTexturesCmd = Pool.getItemByClass("DrawTexturesCmd", DrawTexturesCmd);
        cmd.texture = texture;
        texture._addReference();
        cmd.pos = pos;
        cmd.colors = colors || [];
        return cmd;
    }

    /**
     * @en Recycle to the object pool
     * @zh 回收到对象池
     */
    recover(): void {
        this.texture._removeReference();
        this.texture = null;
        this.pos = null;
        Pool.recover("DrawTexturesCmd", this);
    }

    /**
     * @en Execute the drawing textures command
     * @param runner The rendering context
     * @param gx Global X offset
     * @param gy Global Y offset
     * @zh 执行绘制多个纹理命令
     * @param runner 渲染上下文
     * @param gx 全局X偏移
     * @param gy 全局Y偏移
     */
    run(runner: GraphicsRunner, gx: number, gy: number): void {
        runner.drawTextures(this.texture, this.pos, gx, gy, this.colors);
    }

    /**
     * @ignore
     */
    getBounds(assembler: IGraphicsBoundsAssembler): void {
        if (this.texture) {
            let w = this.texture.width;
            let h = this.texture.height;

            for (let i = 0, n = this.pos.length; i < n; i += 2) {
                let x = this.pos[i];
                let y = this.pos[i + 1];
                Rectangle.TEMP.setTo(x, y, w, h).getBoundPoints(assembler.points);
            }
        }
    }

    /**
     * @en The identifier for the DrawTexturesCmd
     * @zh 根据坐标集合绘制多个贴图命令的标识符
     */
    get cmdID(): string {
        return DrawTexturesCmd.ID;
    }
}

