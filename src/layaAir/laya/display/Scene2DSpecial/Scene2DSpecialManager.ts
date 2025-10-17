import { IElementComponentManager } from "../../components/IScenceComponentManager";
import { LayaGL } from "../../layagl/LayaGL";
import { ShaderData } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";

export class Scene2DSpecialManager {

    static SPRITE2DGLOBAL: ShaderDefine;

    /**@internal */
    _shaderData: ShaderData;


    /** @internal */
    componentElementMap: Map<string, IElementComponentManager> = new Map();
    constructor() {
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);

        if (!Scene2DSpecialManager.SPRITE2DGLOBAL) {
            Scene2DSpecialManager.SPRITE2DGLOBAL = Shader3D.getDefineByName("SPRITE2DGLOBAL");
        }

        this._shaderData.addDefine(Scene2DSpecialManager.SPRITE2DGLOBAL);
    }


}