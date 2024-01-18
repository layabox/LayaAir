import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { IDirectLightShadowRP } from "../../../RenderDriverLayer/Render3DProcess/IDirectLightShadowRP";
import { ICameraNodeData } from "../../../RenderDriverLayer/RenderModuleData/IModuleData";
import { RTDirectLight } from "../RenderModuleData/RTDirectLight";


export class RTDirectLightShadowCastRP implements IDirectLightShadowRP {
    private _light: RTDirectLight;
    public get light(): RTDirectLight {
        return this._light;
    }
    public set light(value: RTDirectLight) {
        this._light = value;
        this._nativeObj.set_light(value._nativeObj);
    }
    private _camera: ICameraNodeData;
    public get camera(): ICameraNodeData {
        return this._camera;
    }
    public set camera(value: ICameraNodeData) {
        this._camera = value;
    }
    private _destTarget: InternalRenderTarget;
    public get destTarget(): InternalRenderTarget {
        return this._destTarget;
    }
    public set destTarget(value: InternalRenderTarget) {
        this._destTarget = value;
        this._nativeObj.set_destTarget(value);
    }
    _nativeObj: any;
    constructor() {
        this._nativeObj = new (window as any).conchRTDirectLightShadowCastRP();
    }
}