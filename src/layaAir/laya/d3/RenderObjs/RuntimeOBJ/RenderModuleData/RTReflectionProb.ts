import { InternalTexture } from "../../../../RenderEngine/RenderInterface/InternalTexture";
import { Color } from "../../../../maths/Color";
import { Vector3 } from "../../../../maths/Vector3";
import { TextureCube } from "../../../../resource/TextureCube";
import { IReflectionProbeData } from "../../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { AmbientMode } from "../../../core/scene/AmbientMode";
import { Bounds } from "../../../math/Bounds";

export class RTReflectionProb implements IReflectionProbeData {
    private _boxProjection: boolean;
    public get boxProjection(): boolean {
        return this._boxProjection;
    }
    public set boxProjection(value: boolean) {
        this._boxProjection = value;
    }
    private _bound: Bounds;
    public get bound(): Bounds {
        return this._bound;
    }
    public set bound(value: Bounds) {
        this._bound = value;
    }
    private _ambientMode: AmbientMode;
    public get ambientMode(): AmbientMode {
        return this._ambientMode;
    }
    public set ambientMode(value: AmbientMode) {
        this._ambientMode = value;
    }
    private _ambientSH: Float32Array;
    public get ambientSH(): Float32Array {
        return this._ambientSH;
    }
    public set ambientSH(value: Float32Array) {
        this._ambientSH = value;
    }
    private _ambientIntensity: number;
    public get ambientIntensity(): number {
        return this._ambientIntensity;
    }
    public set ambientIntensity(value: number) {
        this._ambientIntensity = value;
    }
    private _reflectionIntensity: number;
    public get reflectionIntensity(): number {
        return this._reflectionIntensity;
    }
    public set reflectionIntensity(value: number) {
        this._reflectionIntensity = value;
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
    private _updateMark: number;
    public get updateMark(): number {
        return this._updateMark;
    }
    public set updateMark(value: number) {
        this._updateMark = value;
    }
    private _iblTexRGBD: boolean;
    public get iblTexRGBD(): boolean {
        return this._iblTexRGBD;
    }
    public set iblTexRGBD(value: boolean) {
        this._iblTexRGBD = value;
    }
    setprobePosition(value: Vector3): void {
        throw new Error("Method not implemented.");
    }
    setAmbientColor(value: Color): void {
        throw new Error("Method not implemented.");
    }
    setAmbientSH(value: Float32Array): void {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTReflectionProb();
    }

    destroy(): void {
        //todo
    }

}