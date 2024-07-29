import { SkinMeshForGraphic } from "./bone/canvasmesh/SkinMeshForGraphic"
import { Matrix } from "../maths/Matrix";
import { Graphics } from "../display/Graphics";
/**
 * @en Graphic animation class.
 * @zh 图形动画类。
 */
export class GraphicsAni extends Graphics {

	/**
	 * @private
	 * @en Draws a custom skinned mesh for graphic animation.
	 * @param skinA The skin mesh object for graphic.
	 * @param alpha The opacity value to apply to the graphic.
	 * @zh 绘制自定义蒙皮动画。
	 * @param skinA 图形的蒙皮网格对象。
	 * @param alpha 要应用于图形的不透明度值。
	 */
	//TODO:coverage
	drawSkin(skinA: SkinMeshForGraphic, alpha: number): void {
		this.drawTriangles(skinA.texture, 0, 0, (<Float32Array>skinA.vertices), (<Float32Array>skinA.uvs), (<Uint16Array>skinA.indexes), skinA.transform || Matrix.EMPTY, alpha);
	}

	private static _caches: any[] = [];
	/**
	 * @en Retrieves an instance of GraphicsAni from the cache or creates a new one if none are available.
	 * @returns An instance of GraphicsAni.
	 * @zh 从缓存中获取一个 GraphicsAni 实例，如果没有可用的实例则创建一个新的。
	 * @returns GraphicsAni 的一个实例。
	 */
	static create(): GraphicsAni {
		var rs: GraphicsAni = GraphicsAni._caches.pop();
		return rs || new GraphicsAni();
	}

	/**
	 * @en Recycles a GraphicsAni instance by clearing its content and adding it to the cache for future use.
	 * @param graphics The GraphicsAni instance to recycle.
	 * @zh 通过清除其内容并将其实例添加到缓存中来回收 GraphicsAni。
	 * @param graphics 要回收的 GraphicsAni 实例。
	 */
	//TODO:coverage
	static recycle(graphics: GraphicsAni): void {
		graphics.clear();
		GraphicsAni._caches.push(graphics);
	}
}


