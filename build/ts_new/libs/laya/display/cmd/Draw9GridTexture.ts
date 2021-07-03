import { Context } from "../../resource/Context"
import { Texture } from "../../resource/Texture"
import { Pool } from "../../utils/Pool"
/**
 * 绘制带九宫格信息的图片
 * @internal
 */
export class Draw9GridTexture {
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

    sizeGrid: any[];



    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, sizeGrid: any[]): Draw9GridTexture {
        var cmd: Draw9GridTexture = Pool.getItemByClass("Draw9GridTexture", Draw9GridTexture);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.sizeGrid = sizeGrid;

        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture._removeReference();
        Pool.recover("Draw9GridTexture", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawTextureWithSizeGrid(this.texture, this.x, this.y, this.width, this.height, this.sizeGrid, gx, gy);
    }

    /**@private */
    get cmdID(): string {
        return Draw9GridTexture.ID;
	}
	
    constructor() {
    }

}


