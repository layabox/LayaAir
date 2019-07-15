import { LayaGL } from "../../layagl/LayaGL";


/**
 * ...
 * @author ...
 */
export class VertexElementFormat {
	static Single: string = "single";
	static Vector2: string = "vector2";
	static Vector3: string = "vector3";
	static Vector4: string = "vector4";
	static Color: string = "color";
	static Byte4: string = "byte4";
	static Short2: string = "short2";
	static Short4: string = "short4";
	static NormalizedShort2: string = "normalizedshort2";
	static NormalizedShort4: string = "normalizedshort4";
	static HalfVector2: string = "halfvector2";
	static HalfVector4: string = "halfvector4";


	/** @internal [组数量,数据类型,是否归一化:0为false]。*/
	private static _elementInfos: any;
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
	 */
	static getElementInfos(element: string): any[] {
		var info: any[] = VertexElementFormat._elementInfos[element];
		if (info)
			return info;
		else
			throw "VertexElementFormat: this vertexElementFormat is not implement.";
	}
}

