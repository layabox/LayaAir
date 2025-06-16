import { IElementComponentManager } from "../../components/IScenceComponentManager";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";


export class Scene2DSpecialManager {

    /**@internal */
    _shaderData: ShaderData;


    /** @internal */
    componentElementMap: Map<string, IElementComponentManager> = new Map();
    constructor() {
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    
}