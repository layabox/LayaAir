
import { Laya } from "../../../Laya";
import { IElementComponentManager } from "../../components/IScenceComponentManager";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Context } from "../../renders/Context";
import { Camera2D } from "./Camera2D";


export class Scene2DSpecialManager {

    /**@internal */
    _shaderData: ShaderData;


    /** @internal */
    componentElementMap: Map<string, IElementComponentManager> = new Map();
    constructor() {
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    
}