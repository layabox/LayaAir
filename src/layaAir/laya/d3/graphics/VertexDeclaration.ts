import { VertexElement } from "././VertexElement";
import { VertexElementFormat } from "././VertexElementFormat";
import { ShaderData } from "../shader/ShaderData"

/**
 * @private
 * <code>VertexDeclaration</code> 类用于生成顶点声明。
 */
export class VertexDeclaration {
	/**@private */
	private static _uniqueIDCounter: number = 1;

	/**@private */
	private _id: number;
	/**@private */
	private _vertexStride: number;
	/**@private */
	private _vertexElementsDic: any;
	/**@private */
	_shaderValues: ShaderData;

	/**@private [只读]*/
	vertexElements: any[];

	/**
	 * 获取唯一标识ID(通常用于优化或识别)。
	 * @return 唯一标识ID
	 */
	get id(): number {
		return this._id;
	}

	/**
	 * @private
	 */
	get vertexStride(): number {
		return this._vertexStride;
	}

	/**
	 * 创建一个 <code>VertexDeclaration</code> 实例。
	 * @param	vertexStride 顶点跨度。
	 * @param	vertexElements 顶点元素集合。
	 */
	constructor(vertexStride: number, vertexElements: any[]) {
		this._id = ++VertexDeclaration._uniqueIDCounter;
		this._vertexElementsDic = {};
		this._vertexStride = vertexStride;
		this.vertexElements = vertexElements;
		var count: number = vertexElements.length;
		this._shaderValues = new ShaderData(null);

		for (var j: number = 0; j < count; j++) {
			var vertexElement: VertexElement = vertexElements[j];
			var name: number = vertexElement.elementUsage;
			this._vertexElementsDic[name] = vertexElement;
			var value: Int32Array = new Int32Array(5);
			var elmentInfo: any[] = VertexElementFormat.getElementInfos(vertexElement.elementFormat);
			value[0] = elmentInfo[0];
			value[1] = elmentInfo[1];
			value[2] = elmentInfo[2];
			value[3] = this._vertexStride;
			value[4] = vertexElement.offset;
			this._shaderValues.setAttribute(name, value);
		}
	}

	/**
	 * @private
	 */
	getVertexElementByUsage(usage: number): VertexElement {
		return this._vertexElementsDic[usage];
	}

	/**
	 * @private
	 */
	unBinding(): void {

	}

}


