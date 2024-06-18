import { RenderClearFlag } from "../../../RenderEngine/RenderEnum/RenderClearFlag";
import { SpotLightCom } from "../../../d3/core/light/SpotLightCom";
import { RTSpotLight } from "../../RenderModuleData/RuntimeModuleData/3D/RTSpotLight";
import { GLESInternalRT } from "../RenderDevice/GLESInternalRT";


export class GLESSpotLightShadowRP {
    private _light: SpotLightCom;

    public get light(): SpotLightCom {
        return this._light;
    }

    public set light(value: SpotLightCom) {
        this._light = value;
        this._nativeObj.setLight((value._dataModule as RTSpotLight)._nativeObj);
    }

    private _destTarget: GLESInternalRT;

    public get destTarget(): GLESInternalRT {
        return this._destTarget;
    }

    public set destTarget(value: GLESInternalRT) {
        this._destTarget = value;
        this._nativeObj.setRenderTarget(value._nativeObj, RenderClearFlag.Nothing);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchGLESSpotLightShadowRP();
    }
}