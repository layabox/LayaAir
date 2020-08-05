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


	get offset(): number {
		return this._offset;
	}

	get elementFormat(): string {
		return this._elementFormat;
	}

	get elementUsage(): number {
		return this._elementUsage;
	}

	constructor(offset: number, elementFormat: string, elementUsage: number) {
		this._offset = offset;
		this._elementFormat = elementFormat;
		this._elementUsage = elementUsage;
		//this.usageIndex = usageIndex;
	}
}

