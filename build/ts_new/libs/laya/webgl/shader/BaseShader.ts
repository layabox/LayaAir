import { Resource } from "../../resource/Resource"

/**
 * ...
 * @author ...
 */
export class BaseShader extends Resource {
    static activeShader: BaseShader|null;			//等于bindShader或者null
    static bindShader: BaseShader;			//当前绑定的shader

    constructor() {
        super();


    }

}


