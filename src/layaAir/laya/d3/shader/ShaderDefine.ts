/**
 * <code>ShaderDefine</code> 类用于定义宏数据。
 */
export class ShaderDefine {
	/**@internal */
	_index: number;
	/**@internal */
	_value: number;
	/**
	 * 创建一个宏定义的实例
	 * @param index 宏索引
	 * @param value 宏值
	 */
	constructor(index: number, value: number) {
		this._index = index;
		this._value = value;
	}
}






