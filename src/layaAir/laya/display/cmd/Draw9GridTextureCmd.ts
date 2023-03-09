import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { ClassUtils } from "../../utils/ClassUtils";
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool"

/**
 * 绘制带九宫格信息的图片
 * @internal
 */
export class Draw9GridTextureCmd {
    static ID: string = "Draw9GridTexture";

    /**
     * 纹理。
     */
    texture: Texture;
    /**
     * （可选）X轴偏移量。
     */
    x: number;
    /**
     * （可选）Y轴偏移量。
     */
    y: number;
    /**
     * （可选）宽度。
     */
    width: number;
    /**
     * （可选）高度。
     */
    height: number;

    sizeGrid: number[];

    color: number = 0xffffffff;

    /**
     * 位置和大小是否是百分比
     */
    percent: boolean;

    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, sizeGrid: number[], percent: boolean = false, color: string | null = null): Draw9GridTextureCmd {
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
     * 回收到对象池
     */
    recover(): void {
        this.texture._removeReference();
        Pool.recover("Draw9GridTextureCmd", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        if (this.texture) {
            let sizeGrid = this.sizeGrid || this.texture._sizeGrid || EMPTY_SIZE_GRID;
            if (this.percent && context.sprite) {
                let w = context.sprite.width;
                let h = context.sprite.height;
                context.drawTextureWithSizeGrid(this.texture, this.x * w, this.y * h, this.width * w, this.height * h, sizeGrid, gx, gy, this.color);
            }
            else
                context.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, sizeGrid, gx, gy, this.color);
        }
    }

    /**@private */
    get cmdID(): string {
        return Draw9GridTextureCmd.ID;
    }

    getBoundPoints(sp?: { width: number, height?: number }): number[] {
        let minx = this.x;
        let miny = this.y;
        let maxx = this.width;
        let maxy = this.height;
        if (this.percent) {
            minx *= sp.width;
            miny *= sp.height;
            maxx *= sp.width;
            maxy *= sp.height;
        }

        return [minx, miny, maxx, miny, maxx, maxy, minx, maxy];
    }
}

const EMPTY_SIZE_GRID = [0, 0, 0, 0, 0];
ClassUtils.regClass("Draw9GridTextureCmd", Draw9GridTextureCmd);
