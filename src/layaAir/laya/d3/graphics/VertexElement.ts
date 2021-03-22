/**
* <code>VertexElement</code> 类用于创建顶点结构分配。
*/
export class VertexElement {
	/**@internal */
	_offset: number;
	/**@internal */
	_elementFormat: string;
	/**@internal */
	_elementUsage: number;
	//usageIndex:int;//TODO:待确定是否添加

	/**
	 * 顶点偏移
	 */
	get offset(): number {
		return this._offset;
	}
	/**
	 * 顶点信息名称
	 */
	get elementFormat(): string {
		return this._elementFormat;
	}

	/**
	 * 顶点宏标记
	 */
	get elementUsage(): number {
		return this._elementUsage;
	}

	/**
	 * 创建顶点结构分配实例
	 * @param offset 顶点偏移
	 * @param elementFormat 顶点数据格式名称
	 * @param elementUsage 顶点宏标记
	 */
	constructor(offset: number, elementFormat: string, elementUsage: number) {
		this._offset = offset;
		this._elementFormat = elementFormat;
		this._elementUsage = elementUsage;
		//this.usageIndex = usageIndex;
	}
}

