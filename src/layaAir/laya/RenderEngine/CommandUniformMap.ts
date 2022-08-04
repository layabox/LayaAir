import { LayaGL } from "../layagl/LayaGL";

export class CommandUniformMap {

	static globalBlockMap: any = {};

	static createGlobalUniformMap(blockName: string): CommandUniformMap {
		let comMap = this.globalBlockMap[blockName];
		if (!comMap)
			comMap = this.globalBlockMap[blockName] = LayaGL.renderOBJCreate.createCommandUniformMap(blockName);
		return comMap;
	}

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