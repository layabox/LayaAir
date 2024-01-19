import { InternalTexture } from "../../../../RenderEngine/RenderInterface/InternalTexture";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { TextureCube } from "../../../../resource/TextureCube";
import { IReflectionProbeData } from "../../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Bounds } from "../../../math/Bounds";

export class RTReflectionProb implements IReflectionProbeData {
    public get boxProjection(): boolean {
        return this._nativeObj._boxProjection;
    }
    public set boxProjection(value: boolean) {
        this._nativeObj._boxProjection = value;
    }
    private _bound: Bounds;
    public get bound(): Bounds {
        return this._bound;
    }
    public set bound(value: Bounds) {
        this._bound = value;
        //TODO:  this._nativeObj.setBounds(value._nativeObj);
    }

    public get ambientMode(): AmbientMode {
        return this._nativeObj._ambientMode;
    }
    public set ambientMode(value: AmbientMode) {
        this._nativeObj._ambientMode = value;
    }

    public get ambientIntensity(): number {
        return this._nativeObj._ambientIntensity;
    }
    public set ambientIntensity(value: number) {
        this._nativeObj._ambientIntensity = value;
    }
    public get reflectionIntensity(): number {
        return this._nativeObj._reflectionIntensity;
    }
    public set reflectionIntensity(value: number) {
        this._nativeObj._reflectionIntensity = value;
    }
    private _reflectionTexture: InternalTexture;
    public get reflectionTexture(): InternalTexture {
        return this._reflectionTexture;
    }
    public set reflectionTexture(value: InternalTexture) {
        this._reflectionTexture = value;
    }
    private _iblTex: InternalTexture;
    public get iblTex(): InternalTexture {
        return this._iblTex;
    }
    public set iblTex(value: InternalTexture) {
        this._iblTex = value;
    }
    public get updateMark(): number {
        return this._nativeObj._updateMark;
    }
    public set updateMark(value: number) {
        this._nativeObj._updateMark = value;
    }
    public get iblTexRGBD(): boolean {
        return this._nativeObj._iblTexRGBD;
    }
    public set iblTexRGBD(value: boolean) {
        this._nativeObj._iblTexRGBD = value;
    }
    setProbePosition(value: Vector3): void {
        value && this._nativeObj.setProbePosition(value);
    }
    setAmbientColor(value: Color): void {
        value &&  this._nativeObj.setAmbientColor(value);
    }
    setAmbientSH(value: Float32Array): void {
        throw new Error("Method not implemented.");
    }

    _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTReflectionProb();
    }

    destroy(): void {
        this._nativeObj.destroy()
    }

}