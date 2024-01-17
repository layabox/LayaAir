import { ShaderDataType } from "./RenderInterface/ShaderData";

type UniformProperty = { id: number, propertyName: string, uniformtype?: ShaderDataType }
export class CommandUniformMap {

	/**@internal */
	_idata: { [key: number]: { block?: Object, propertyName: string, uniformtype?: ShaderDataType, blockProperty?: UniformProperty[] } } = {};
	_stateName: string;

	constructor(stateName: string) {
		this._stateName = stateName;
	}

	hasPtrID(propertyID: number): boolean {
		return !!(this._idata[propertyID] != null);
	}

	getMap() {
		return this._idata;
	}

	/**
	 * 增加一个Uniform参数
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = null): void {
		this._idata[propertyID] = { uniformtype: uniformtype, propertyName: propertyKey, block: block };
	}

	/**
	 * 增加一个Uniform
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
		this._idata[propertyID] = { propertyName: blockname, blockProperty: blockProperty }
		blockProperty.forEach(element => {
			this.addShaderUniform(element.id, element.propertyName, element.uniformtype, blockname);
		});
	}



}