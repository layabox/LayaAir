import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class WebGLCommandUniformMap extends CommandUniformMap {

	/**@internal */
	_idata: {
		[key: number]: {
			block: string,
			propertyName: string,
			uniformtype: ShaderDataType,
			blockProperty: UniformProperty[]//block property,if not in block  lenth = 0
		}
	} = {};
	_stateName: string;

	constructor(stateName: string) {
		super(stateName);
		this._stateName = stateName;
	}

	hasPtrID(propertyID: number): boolean {
		return !!(this._idata[propertyID] != null);
	}

	/**
	 * 增加一个Uniform参数
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = null): void {
		this._idata[propertyID] = { uniformtype: uniformtype, propertyName: propertyKey, block: block, blockProperty: null, };
	}

	/**
	 * 增加一个Uniform
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
		this._idata[propertyID] = { propertyName: blockname, blockProperty: blockProperty, uniformtype: ShaderDataType.None, block: "" };
		blockProperty.forEach(element => {
			this.addShaderUniform(element.id, element.propertyName, element.uniformtype, blockname);
		});
	}

}