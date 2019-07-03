import { Matrix } from "../maths/Matrix";
import { Graphics } from "../display/Graphics";
export class GraphicsAni extends Graphics {
    /**
     * @private
     * 画自定义蒙皮动画
     * @param	skin
     */
    //TODO:coverage
    drawSkin(skinA, alpha) {
        this.drawTriangles(skinA.texture, 0, 0, skinA.vertices, skinA.uvs, skinA.indexes, skinA.transform || Matrix.EMPTY, alpha);
    }
    //TODO:coverage
    static create() {
        var rs = GraphicsAni._caches.pop();
        return rs || new GraphicsAni();
    }
    //TODO:coverage
    static recycle(graphics) {
        graphics.clear();
        GraphicsAni._caches.push(graphics);
    }
}
GraphicsAni._caches = [];
