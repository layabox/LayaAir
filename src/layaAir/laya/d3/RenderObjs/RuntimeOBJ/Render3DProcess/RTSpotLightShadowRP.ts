import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { ISpotLightShadowRP } from "../../../RenderDriverLayer/Render3DProcess/ISpotLightShadowRP";
import { SpotLightCom } from "../../../core/light/SpotLightCom";
import { RTSpotLight } from "../RenderModuleData/RTSpotLight";

export class RTSpotLightShadowRP implements ISpotLightShadowRP {
    private _light: SpotLightCom;
    
    public get light(): SpotLightCom {
        return this._light;
    }

    public set light(value: SpotLightCom) {
        this._light = value;
        this._nativeObj.setLight((value._dataModule as RTSpotLight)._nativeObj);
    }

    private _destTarget: InternalRenderTarget;

    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
        this._nativeObj.setRenderTarget(value);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTSpotLightShadowRP();
    }
}