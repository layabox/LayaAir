import { CommandUniformMap, UniformData } from "../../../RenderEngine/CommandUniformMap";

export class NativeCommandUniformMap extends CommandUniformMap {

	private _nativeObj: any;

	constructor(_nativeObj: any, stateName: string) {
		super(stateName);
		this._nativeObj = _nativeObj;
	}
	hasPtrID(propertyID: number): boolean {
		return this._nativeObj.hasPtrID(propertyID);
	}

	getMap(): Record<number, UniformData> {
		return this._idata;
	}

	/**
	 * 增加一个UniformMap
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string): void {
		//this._idata[propertyID] = propertyKey;
		this._nativeObj.addShaderUniform(propertyID, propertyKey);
	}
}