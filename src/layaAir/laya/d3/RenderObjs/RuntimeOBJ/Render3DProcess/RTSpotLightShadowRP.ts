import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { ISpotLightShadowRP } from "../../../RenderDriverLayer/Render3DProcess/ISpotLightShadowRP";
import { SpotLightCom } from "../../../core/light/SpotLightCom";

export class RTSpotLightShadowRP implements ISpotLightShadowRP {
    private _light: SpotLightCom;
    public get light(): SpotLightCom {
        return this._light;
    }
    public set light(value: SpotLightCom) {
        this._light = value;
    }
    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
    }
}