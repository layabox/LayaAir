import { SkinMeshForGraphic } from "./bone/canvasmesh/SkinMeshForGraphic"
import { Matrix } from "../maths/Matrix";
import { Graphics } from "../display/Graphics";
/**
 * 动画
 */
export class GraphicsAni extends Graphics {

	/**
	 * @private
	 * 画自定义蒙皮动画
	 * @param	skin
	 */
	//TODO:coverage
	drawSkin(skinA: SkinMeshForGraphic, alpha: number): void {
		this.drawTriangles(skinA.texture, 0, 0, (<Float32Array>skinA.vertices), (<Float32Array>skinA.uvs), (<Uint16Array>skinA.indexes), skinA.transform || Matrix.EMPTY, alpha);
	}

	private static _caches: any[] = [];
	//TODO:coverage
	static create(): GraphicsAni {
		var rs: GraphicsAni = GraphicsAni._caches.pop();
		return rs || new GraphicsAni();
	}

	/**
	 * 回收清理
	 * @param graphics 
	 */
	//TODO:coverage
	static recycle(graphics: GraphicsAni): void {
		graphics.clear();
		GraphicsAni._caches.push(graphics);
	}
}


