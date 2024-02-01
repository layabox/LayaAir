import { CommandUniformMap, UniformProperty } from "../../DriverDesign/RenderDevice/CommandUniformMap";
import { ShaderDataType } from "../../DriverDesign/RenderDevice/ShaderData";

export class GLESCommandUniformMap extends CommandUniformMap{
    _nativeObj:any;
    constructor(stateName: string){
        super(stateName);
        this._nativeObj =  new (window as any).conchGLESCommandUniformMap(stateName);
    }
    	/**
	 * 增加一个Uniform参数
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string, uniformtype: ShaderDataType, block: string = null): void {
        this._nativeObj.addShaderUniform(propertyID,propertyKey,uniformtype,block);
	}

	/**
	 * 增加一个Uniform
	 * @param propertyID 
	 * @param propertyKey
	 */
	addShaderBlockUniform(propertyID: number, blockname: string, blockProperty: UniformProperty[]): void {
        this._nativeObj.addShaderBlockUniform(propertyID,blockname,blockProperty);
	}
}