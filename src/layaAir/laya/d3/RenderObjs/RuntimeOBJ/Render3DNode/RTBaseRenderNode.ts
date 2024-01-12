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
import { NativeTransform3D } from "../../NativeOBJ/NativeTransform3D";

export class RTBaseRenderNode implements IBaseRenderNode {
    protected _BasenativeObj: any;
    private _transform: NativeTransform3D;
    public get transform(): NativeTransform3D {
        return this._transform;
    }
    public set transform(value: NativeTransform3D) {
        this._nativeObj.set_transform(value._nativeObj);
        this._transform = value;
    }
    private _distanceForSort: number;
    public get distanceForSort(): number {
        return this._distanceForSort;
    }
    public set distanceForSort(value: number) {
        this._nativeObj.set_distanceForSort(value);
        this._distanceForSort = value;
    }
    private _sortingFudge: number;
    public get sortingFudge(): number {
        return this._sortingFudge;
    }
    public set sortingFudge(value: number) {
        this._sortingFudge = value;
    }
    private _castShadow: boolean;
    public get castShadow(): boolean {
        return this._castShadow;
    }
    public set castShadow(value: boolean) {
        this._castShadow = value;
    }
    private _enable: boolean;
    public get enable(): boolean {
        return this._enable;
    }
    public set enable(value: boolean) {
        this._enable = value;
    }
    private _renderbitFlag: number;
    public get renderbitFlag(): number {
        return this._renderbitFlag;
    }
    public set renderbitFlag(value: number) {
        this._renderbitFlag = value;
    }
    private _layer: number;
    public get layer(): number {
        return this._layer;
    }
    public set layer(value: number) {
        this._layer = value;
    }
    private _bounds: Bounds;
    public get bounds(): Bounds {
        return this._bounds;
    }
    public set bounds(value: Bounds) {
        this._bounds = value;
    }
    private _baseGeometryBounds: Bounds;
    public get baseGeometryBounds(): Bounds {
        return this._baseGeometryBounds;
    }
    public set baseGeometryBounds(value: Bounds) {
        this._baseGeometryBounds = value;
    }
    private _boundsChange: boolean;
    public get boundsChange(): boolean {
        return this._boundsChange;
    }
    public set boundsChange(value: boolean) {
        this._boundsChange = value;
    }
    private _customCull: boolean;
    public get customCull(): boolean {
        return this._customCull;
    }
    public set customCull(value: boolean) {
        this._customCull = value;
    }
    private _customCullResoult: boolean;
    public get customCullResoult(): boolean {
        return this._customCullResoult;
    }
    public set customCullResoult(value: boolean) {
        this._customCullResoult = value;
    }
    private _staticMask: number;
    public get staticMask(): number {
        return this._staticMask;
    }
    public set staticMask(value: number) {
        this._staticMask = value;
    }
    private _shaderData: ShaderData;
    public get shaderData(): ShaderData {
        return this._shaderData;
    }
    public set shaderData(value: ShaderData) {
        this._shaderData = value;
    }
    private _lightmapIndex: number;
    public get lightmapIndex(): number {
        return this._lightmapIndex;
    }
    public set lightmapIndex(value: number) {
        this._lightmapIndex = value;
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
    private _probeReflectionUpdateMark: number;
    public get probeReflectionUpdateMark(): number {
        return this._probeReflectionUpdateMark;
    }
    public set probeReflectionUpdateMark(value: number) {
        this._probeReflectionUpdateMark = value;
    }
    private _reflectionMode: number;
    public get reflectionMode(): number {
        return this._reflectionMode;
    }
    public set reflectionMode(value: number) {
        this._reflectionMode = value;
    }
    private _volumetricGI: IVolumetricGIData;
    public get volumetricGI(): IVolumetricGIData {
        return this._volumetricGI;
    }
    public set volumetricGI(value: IVolumetricGIData) {
        this._volumetricGI = value;
    }
    private _lightProbUpdateMark: number;
    public get lightProbUpdateMark(): number {
        return this._lightProbUpdateMark;
    }
    public set lightProbUpdateMark(value: number) {
        this._lightProbUpdateMark = value;
    }
    private _irradientMode: IrradianceMode;
    public get irradientMode(): IrradianceMode {
        return this._irradientMode;
    }
    public set irradientMode(value: IrradianceMode) {
        this._irradientMode = value;
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