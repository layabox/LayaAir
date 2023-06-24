/**
 *  <code>shaderVariable</code> 类用于保存shader变量上传相关信息。
 */
export class ShaderVariable {
	static pointID: number = 0;
	/**@internal */
	name: string;
	/**@internal */
	type: number;
	/**@internal */
	location: number;
	/**@internal */
	isArray: boolean;
	/**@internal */
	textureID: number;
	/**@internal */
	dataOffset: number;

	/**@internal */
	caller: any;
	/**@internal */
	fun: any;
	/**@internal */
	uploadedValue: any[];
	/**@internal */
	onID: number;

	/**
	 * 创建一个 <code>shaderVariable</code> 实例。
	 */
	constructor() {
		this.onID = ShaderVariable.pointID++;
		this.textureID = -1;
	}

}


