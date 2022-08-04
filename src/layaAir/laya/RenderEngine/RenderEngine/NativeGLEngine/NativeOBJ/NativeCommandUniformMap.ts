import { CommandUniformMap } from "../../../CommandUniformMap";

export class NativeCommandUniformMap extends CommandUniformMap {
    constructor(stateName: string){
        super(stateName);
        //native todo
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
        //native obj addUniform TODO
	}
}