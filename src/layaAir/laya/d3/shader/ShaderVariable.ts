/**
	 * @private
	 *  <code>shaderVariable</code> 类用于保存shader变量上传相关信息。
	 */
export class ShaderVariable {
	/**@private */
	name: string;
	/**@private */
	type: number;
	/**@private */
	location: number;
	/**@private */
	isArray: boolean;
	/**@private */
	textureID: number;
	/**@private */
	dataOffset: number;

	/**@private */
	caller: any;
	/**@private */
	fun: any;
	/**@private */
	uploadedValue: any[];

	/**
	 * 创建一个 <code>shaderVariable</code> 实例。
	 */
	constructor() {
		/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
		this.textureID = -1;
	}

}


