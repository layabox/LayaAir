import { LayaGL } from "../layagl/LayaGL";

export class CommandUniformMap {

	/**@internal */
	_idata: { [key: number]: string } = {};
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
	 * 增加一个UniformMap
	 * @internal
	 * @param propertyID 
	 * @param propertyKey 
	 */
	addShaderUniform(propertyID: number, propertyKey: string): void {
		this._idata[propertyID] = propertyKey;
	}

}