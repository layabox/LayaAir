import { InternalRenderTarget } from "../../../../RenderEngine/RenderInterface/InternalRenderTarget";
import { IDirectLightShadowRP } from "../../../RenderDriverLayer/Render3DProcess/IDirectLightShadowRP";
import { IDirectLightData } from "../../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { ICameraNodeData } from "../../../RenderDriverLayer/RenderModuleData/IModuleData";



export class RTDirectLightShadowCastRP implements IDirectLightShadowRP {
    private _light: IDirectLightData;
    public get light(): IDirectLightData {
        return this._light;
    }
    public set light(value: IDirectLightData) {
        this._light = value;
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
    }
    private _nativeObj: any;
    constructor(){
        this._nativeObj = new (window as any).conchRTDirectLightShadowCastRP();
    }
}