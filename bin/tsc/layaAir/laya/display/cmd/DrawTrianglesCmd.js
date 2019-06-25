import { ColorFilter } from "../../filters/ColorFilter";
import { ColorUtils } from "../../utils/ColorUtils";
import { Pool } from "../../utils/Pool";
/**
 * 绘制三角形命令
 */
export class DrawTrianglesCmd {
    /**@private */
    static create(texture, x, y, vertices, uvs, indices, matrix, alpha, color, blendMode) {
        var cmd = Pool.getItemByClass("DrawTrianglesCmd", DrawTrianglesCmd);
        cmd.texture = texture;
        cmd.x = x;
        cmd.y = y;
        cmd.vertices = vertices;
        cmd.uvs = uvs;
        cmd.indices = indices;
        cmd.matrix = matrix;
        cmd.alpha = alpha;
        if (color) {
            cmd.color = new ColorFilter();
            var c = ColorUtils.create(color).arrColor;
            cmd.color.color(c[0] * 255, c[1] * 255, c[2] * 255, c[3] * 255); //TODO 这个好像设置的是加色，这样并不合理
        }
        cmd.blendMode = blendMode;
        return cmd;
    }
    /**
     * 回收到对象池
     */
    recover() {
        this.texture = null;
        this.vertices = null;
        this.uvs = null;
        this.indices = null;
        this.matrix = null;
        Pool.recover("DrawTrianglesCmd", this);
    }
    /**@private */
    run(context, gx, gy) {
        context.drawTriangles(this.texture, this.x + gx, this.y + gy, this.vertices, this.uvs, this.indices, this.matrix, this.alpha, this.color, this.blendMode);
    }
    /**@private */
    get cmdID() {
        return DrawTrianglesCmd.ID;
    }
}
DrawTrianglesCmd.ID = "DrawTriangles";
