import { Vector3 } from "../../../../maths/Vector3";
import { IDirectLightData } from "../../../RenderDriverLayer/RenderModuleData/IDirectLightData";
import { Transform3D } from "../../../core/Transform3D";
import { ShadowCascadesMode } from "../../../core/light/ShadowCascadesMode";
import { ShadowMode } from "../../../core/light/ShadowMode";
import { NativeTransform3D } from "../../NativeOBJ/NativeTransform3D";

export class RTDirectLight implements IDirectLightData {
    private _shadowNearPlane: number;
    public get shadowNearPlane(): number {
        return this._shadowNearPlane;
    }
    public set shadowNearPlane(value: number) {
        this._shadowNearPlane = value;
    }
    private _shadowCascadesMode: ShadowCascadesMode;
    public get shadowCascadesMode(): ShadowCascadesMode {
        return this._shadowCascadesMode;
    }
    public set shadowCascadesMode(value: ShadowCascadesMode) {
        this._shadowCascadesMode = value;
    }
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._transform = value;
    }
    private _shadowResolution: number;
    public get shadowResolution(): number {
        return this._shadowResolution;
    }
    public set shadowResolution(value: number) {
        this._shadowResolution = value;
    }
    private _shadowDistance: number;
    public get shadowDistance(): number {
        return this._shadowDistance;
    }
    public set shadowDistance(value: number) {
        this._shadowDistance = value;
    }
    private _shadowMode: ShadowMode;
    public get shadowMode(): ShadowMode {
        return this._shadowMode;
    }
    public set shadowMode(value: ShadowMode) {
        this._shadowMode = value;
    }
    private _shadowStrength: number;
    public get shadowStrength(): number {
        return this._shadowStrength;
    }
    public set shadowStrength(value: number) {
        this._shadowStrength = value;
    }
    private _shadowDepthBias: number;
    public get shadowDepthBias(): number {
        return this._shadowDepthBias;
    }
    public set shadowDepthBias(value: number) {
        this._shadowDepthBias = value;
    }
    private _shadowNormalBias: number;
    public get shadowNormalBias(): number {
        return this._shadowNormalBias;
    }
    public set shadowNormalBias(value: number) {
        this._shadowNormalBias = value;
    }
    private _shadowTwoCascadeSplits: number;
    public get shadowTwoCascadeSplits(): number {
        return this._shadowTwoCascadeSplits;
    }
    public set shadowTwoCascadeSplits(value: number) {
        this._shadowTwoCascadeSplits = value;
    }

    setShadowFourCascadeSplits(value: Vector3): void {
        throw new Error("Method not implemented.");
    }

    setDirection(value: Vector3): void {
        throw new Error("Method not implemented.");
    }

    private _nativeObj: any;

    constructor() {
        this._nativeObj = new (window as any).conchRTDirectLight();
    }

}