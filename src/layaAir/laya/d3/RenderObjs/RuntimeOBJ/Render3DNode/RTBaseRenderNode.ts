import { NativeShaderData } from "../../../../RenderEngine/RenderEngine/NativeGLEngine/NativeShaderData";
import { IRenderElement } from "../../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IRenderContext3D } from "../../../RenderDriverLayer/IRenderContext3D";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { ILightMapData } from "../../../RenderDriverLayer/RenderModuleData/ILightMapData";
import { IReflectionProbeData } from "../../../RenderDriverLayer/RenderModuleData/IReflectionProbeData";
import { IVolumetricGIData } from "../../../RenderDriverLayer/RenderModuleData/IVolumetricGIData";
import { IrradianceMode } from "../../../core/render/BaseRender";
import { Bounds } from "../../../math/Bounds";
import { NativeBounds } from "../../NativeOBJ/NativeBounds";
import { NativeTransform3D } from "../../NativeOBJ/NativeTransform3D";

export class RTBaseRenderNode implements IBaseRenderNode {
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._nativeObj.set_transform(value._nativeObj);
        this._transform = value;
    }
    public get distanceForSort(): number {
        return this._nativeObj._distanceForSort;
    }
    public set distanceForSort(value: number) {
        this._nativeObj._distanceForSort = value;
    }
    public get sortingFudge(): number {
        return this._nativeObj._sortingFudge;
    }
    public set sortingFudge(value: number) {
        this._nativeObj._sortingFudge = value;
    }
    public get castShadow(): boolean {
        return this._nativeObj._castShadow;
    }
    public set castShadow(value: boolean) {
        this._nativeObj._castShadow = value;
    }
    public get enable(): boolean {
        return this._nativeObj._enable;
    }
    public set enable(value: boolean) {
        this._nativeObj._enable = value;
    }
    public get renderbitFlag(): number {
        return this._nativeObj._renderbitFlag;
    }
    public set renderbitFlag(value: number) {
        this._nativeObj._renderbitFlag = value;
    }
    public get layer(): number {
        return this._nativeObj._layer;
    }
    public set layer(value: number) {
        this._nativeObj._layer = value;
    }
    private _bounds: NativeBounds;
    public get bounds(): Bounds {
        return this._bounds as unknown as Bounds;
    }
    public set bounds(value: NativeBounds) {
        this._bounds = value;
        this._nativeObj._bounds = value._nativeObj;
    }
    private _baseGeometryBounds: NativeBounds;
    public get baseGeometryBounds(): Bounds {
        return this._baseGeometryBounds as unknown as Bounds;
    }
    public set baseGeometryBounds(value: NativeBounds) {
        this._baseGeometryBounds = value;
        this._nativeObj.set_baseGeometryBounds(value._nativeObj);
    }
    public get boundsChange(): boolean {
        return this._nativeObj._boundsChange;
    }
    public set boundsChange(value: boolean) {
        this._nativeObj._boundsChange = value;
    }
    public get customCull(): boolean {
        return this._nativeObj._customCull;
    }
    public set customCull(value: boolean) {
        this._nativeObj._customCull = value;
    }
    public get customCullResoult(): boolean {
        return this._nativeObj._customCullResoult;
    }
    public set customCullResoult(value: boolean) {
        this._nativeObj._customCullResoult = value;
    }
    public get staticMask(): number {
        return this._nativeObj._staticMask;
    }
    public set staticMask(value: number) {
        this._nativeObj._staticMask = value;
    }
    private _shaderData: NativeShaderData;
    public get shaderData(): ShaderData {
        return this._shaderData;
    }
    public set shaderData(value: NativeShaderData) {
        this._shaderData = value;
        this._nativeObj.set_shaderData(value._nativeObj);
    }
    public get lightmapIndex(): number {
        return this._nativeObj._lightmapIndex;
    }
    public set lightmapIndex(value: number) {
        this._nativeObj._lightmapIndex = value;
    }
    private _lightmap: ILightMapData;
    public get lightmap(): ILightMapData {
        return this._lightmap;
    }
    public set lightmap(value: ILightMapData) {
        this._lightmap = value;
    }
    private _probeReflection: IReflectionProbeData;
    public get probeReflection(): IReflectionProbeData {
        return this._probeReflection;
    }
    public set probeReflection(value: IReflectionProbeData) {
        this._probeReflection = value;
    }
    public get probeReflectionUpdateMark(): number {
        return this._nativeObj._probeReflectionUpdateMark;
    }
    public set probeReflectionUpdateMark(value: number) {
        this._nativeObj._probeReflectionUpdateMark = value;
    }
    public get reflectionMode(): number {
        return this._nativeObj._reflectionMode;
    }
    public set reflectionMode(value: number) {
        this._nativeObj._reflectionMode = value;
    }
    private _volumetricGI: IVolumetricGIData;
    public get volumetricGI(): IVolumetricGIData {
        return this._volumetricGI;
    }
    public set volumetricGI(value: IVolumetricGIData) {
        this._volumetricGI = value;
    }
    public get lightProbUpdateMark(): number {
        return this._nativeObj._lightProbUpdateMark;
    }
    public set lightProbUpdateMark(value: number) {
        this._nativeObj._lightProbUpdateMark = value;
    }
    private _irradientMode: IrradianceMode;
    public get irradientMode(): IrradianceMode {
        return this._irradientMode;
    }
    public set irradientMode(value: IrradianceMode) {
        this._irradientMode = value;
        this._nativeObj._irradientMode = value;
    }

    _renderUpdatePre: (context3D: IRenderContext3D) => void;
    _calculateBoundingBox: () => void;

    private _nativeObj: any;
    //create runtime Node
    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTBaseRenderNode();
    }

    constructor() {
        this._nativeObj = this._getNativeObj();
    }


    setRenderelements(value: IRenderElement[]): void {

    }

    setWorldParams(value: Vector4): void {

    }

    setLightmapScaleOffset(value: Vector4): void {

    }

    setCommonUniformMap(value: string[]): void {

    }

    setOneMaterial(index: number, mat: Material): void {

    }

    destroy(): void {
        //destroy runtime node
    }

}