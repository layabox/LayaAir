import { LayaGL } from "../../layagl/LayaGL";


/**
 * 类用来定义顶点元素格式
 */
export class VertexElementFormat {
	/**单精度浮点数 */
	static Single: string = "single";
	/**vec2 数据*/
	static Vector2: string = "vector2";
	/**vec3 数据*/
	static Vector3: string = "vector3";
	/**vec4 数据 */
	static Vector4: string = "vector4";
	/**颜色 */
	static Color: string = "color";
	/**字节数组4 */
	static Byte4: string = "byte4";
	/**半精度浮点数数组2 */
	static Short2: string = "short2";
	/**半精度浮点数数组4 */
	static Short4: string = "short4";
	/**归一化半精度浮点数组2 */
	static NormalizedShort2: string = "normalizedshort2";
	/**归一化半精度浮点数组4 */
	static NormalizedShort4: string = "normalizedshort4";
	/**@internal */
	static HalfVector2: string = "halfvector2";
	/**@internal */
	static HalfVector4: string = "halfvector4";


	/** @internal [组数量,数据类型,是否归一化:0为false]。*/
	private static _elementInfos: any;
	/**@internal */
	static __init__(): void {
		var gl: WebGLRenderingContext = LayaGL.instance;
		VertexElementFormat._elementInfos = {
			"single": [1, gl.FLOAT, 0],
			"vector2": [2, gl.FLOAT, 0],
			"vector3": [3, gl.FLOAT, 0],
			"vector4": [4, gl.FLOAT, 0],
			"color": [4, gl.FLOAT, 0],
			"byte4": [4, gl.UNSIGNED_BYTE, 0],
			"short2": [2, gl.FLOAT, 0],
			"short4": [4, gl.FLOAT, 0],
			"normalizedshort2": [2, gl.FLOAT, 0],
			"normalizedshort4": [4, gl.FLOAT, 0],
			"halfvector2": [2, gl.FLOAT, 0],
			"halfvector4": [4, gl.FLOAT, 0]
		};

	}

	/**
	 * 获取顶点元素格式信息。
	 * @param element 元素名称
	 * @returns 返回顶点元素信息
	 */
	static getElementInfos(element: string): any[] {
		var info: any[] = VertexElementFormat._elementInfos[element];
		if (info)
			return info;
		else
			throw "VertexElementFormat: this vertexElementFormat is not implement.";
	}
}

