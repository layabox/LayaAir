/** created by WangCheng on 2021/9/12 17:56 */

import {Texture} from "../../resource/Texture";
import {Pool} from "../../utils/Pool";
import {Context} from "../../resource/Context";

/**
 * 绘制对称填充纹理的图片
 * @internal
 */
export class DrawSymmetricTexture {

    static ID: string = "DrawSymmetricTexture";

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
    /**纹理填充类型, 默认为 0 */
    type: number;



    /**@private */
    static create(texture: Texture, x: number, y: number, width: number, height: number, type:number): DrawSymmetricTexture {
        var cmd: DrawSymmetricTexture = Pool.getItemByClass("DrawSymmetricTexture", DrawSymmetricTexture);
        cmd.texture = texture;
        texture._addReference();
        cmd.x = x;
        cmd.y = y;
        cmd.width = width;
        cmd.height = height;
        cmd.type = type;

        return cmd;
    }

    /**
     * 回收到对象池
     */
    recover(): void {
        this.texture._removeReference();
        Pool.recover("DrawSymmetricTexture", this);
    }

    /**@private */
    run(context: Context, gx: number, gy: number): void {
        context.drawSymmetricTexture(this.texture, this.x, this.y, this.width, this.height, this.type, gx, gy);
    }

    /**@private */
    get cmdID(): string {
        return DrawSymmetricTexture.ID;
    }

}
