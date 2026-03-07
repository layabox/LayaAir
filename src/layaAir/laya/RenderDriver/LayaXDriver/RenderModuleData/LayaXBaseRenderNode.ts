import { IrradianceMode } from "../../../d3/core/render/BaseRender";
import { RenderContext3D } from "../../../d3/core/render/RenderContext3D";
import { Bounds } from "../../../d3/math/Bounds";
import { Vector2 } from "../../../maths/Vector2";
import { Vector4 } from "../../../maths/Vector4";
import { Material } from "../../../resource/Material";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { ENodeCustomData, IBaseRenderNode } from "../../RenderModuleData/Design/3D/I3DRenderModuleData";
import { LayaXTransform3D } from "./LayaXTransform3D";
import { LayaXLightmapData } from "./LayaXLightmapData";
import { LayaXReflectionProbe } from "./LayaXReflectionProbe";
import { LayaXVolumetricGI } from "./LayaXVolumetricGI";

/**
 * LayaX BaseRenderNode bridge.
 *
 * Implements `IBaseRenderNode` by delegating all property access to the native
 * `conchLayaXBaseRenderNode` object.  Rendering is driven by the Rust side;
 * this class is a thin data-bridge.
 */
export class LayaXBaseRenderNode implements IBaseRenderNode {

    /** @internal */
    _nativeObj: any;

    /** @internal */
    renderelements: IRenderElement3D[];

    /** @internal */
    _defaultBaseGeometryBounds: Bounds;

    // ------------------------------------------------------------------
    // Transform
    // ------------------------------------------------------------------

    private _transform: LayaXTransform3D;
    public get transform(): LayaXTransform3D { return this._transform; }
    public set transform(value: LayaXTransform3D) {
        this._nativeObj.setTransform(value ? value._nativeObj : null);
        this._transform = value;
    }

    // ------------------------------------------------------------------
    // Simple numeric / boolean delegates
    // ------------------------------------------------------------------

    public get distanceForSort(): number { return this._nativeObj.distanceForSort; }
    public set distanceForSort(value: number) { this._nativeObj.distanceForSort = value; }

    public get sortingFudge(): number { return this._nativeObj.sortingFudge; }
    public set sortingFudge(value: number) { this._nativeObj.sortingFudge = value; }

    public get castShadow(): boolean { return this._nativeObj.castShadow; }
    public set castShadow(value: boolean) { this._nativeObj.castShadow = value; }

    public get receiveShadow(): boolean { return this._nativeObj.receiveShadow; }
    public set receiveShadow(value: boolean) { this._nativeObj.receiveShadow = value; }

    public get enable(): boolean { return this._nativeObj.enable; }
    public set enable(value: boolean) { this._nativeObj.enable = value; }

    public get renderbitFlag(): number { return this._nativeObj.renderbitFlag; }
    public set renderbitFlag(value: number) { this._nativeObj.renderbitFlag = value; }

    public get visibalRangeBit(): number { return this._nativeObj.visibalRangeBit; }
    public set visibalRangeBit(value: number) { this._nativeObj.visibalRangeBit = value; }

    public get visibalMin(): number { return this._nativeObj.visibalMin; }
    public set visibalMin(value: number) { this._nativeObj.visibalMin = value; }

    public get visibalMax(): number { return this._nativeObj.visibalMax; }
    public set visibalMax(value: number) { this._nativeObj.visibalMax = value; }

    public get layer(): number { return this._nativeObj.layer; }
    public set layer(value: number) { this._nativeObj.layer = value; }

    public get renderNodeType(): number { return this._nativeObj.renderNodeType; }
    public set renderNodeType(value: number) { this._nativeObj.renderNodeType = value; }

    public get boundsChange(): boolean { return this._nativeObj.boundsChange; }
    public set boundsChange(value: boolean) { this._nativeObj.boundsChange = value; }

    public get staticMask(): number { return this._nativeObj.staticMask; }
    public set staticMask(value: number) { this._nativeObj.staticMask = value; }

    public get lightmapIndex(): number { return this._nativeObj.lightmapIndex; }
    public set lightmapIndex(value: number) { this._nativeObj.lightmapIndex = value; }

    public get reflectionMode(): number { return this._nativeObj.reflectionMode; }
    public set reflectionMode(value: number) { this._nativeObj.reflectionMode = value; }

    public get lightProbUpdateMark(): number { return this._nativeObj.lightProbUpdateMark; }
    public set lightProbUpdateMark(value: number) { this._nativeObj.lightProbUpdateMark = value; }

    // ------------------------------------------------------------------
    // Bounds
    // ------------------------------------------------------------------

    private _bounds: Bounds;
    public get bounds(): Bounds {
        if (this.boundsChange) {
            this._nativeObj._calculateBoundingBox();
            this.boundsChange = false;
        }
        return this._bounds as Bounds;
    }
    public set bounds(value: Bounds) {
        this._bounds = value;
        // TODO(Q13): LayaX bounds may not have _imp._nativeObj; adapt if Bounds wraps LayaXBounds
        this._nativeObj._bounds = (value._imp as any)._nativeObj;
    }

    private _baseGeometryBounds: Bounds;
    public get baseGeometryBounds(): Bounds { return this._baseGeometryBounds; }
    public set baseGeometryBounds(value: Bounds) {
        this._baseGeometryBounds = value;
        this._nativeObj.setBaseGeometryBounds((value._imp as any)._nativeObj);
    }

    // ------------------------------------------------------------------
    // ShaderData
    // ------------------------------------------------------------------

    private _shaderData: ShaderData;
    public get shaderData(): ShaderData { return this._shaderData; }
    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.setShaderData(value ? (value as any)._nativeObj : null);
    }

    private _additionShaderData: Map<string, ShaderData> = new Map();
    public get additionShaderData(): Map<string, ShaderData> { return this._additionShaderData; }
    public set additionShaderData(value: Map<string, ShaderData>) {
        this._additionShaderData = value;
        this._nativeObj.clearAdditionalMap();
        for (let [key, sd] of this._additionShaderData) {
            this._nativeObj.addOneAddiionalData(key, (sd as any)._nativeObj);
        }
    }

    // ------------------------------------------------------------------
    // Lightmap / Probes
    // ------------------------------------------------------------------

    private _lightmap: LayaXLightmapData;
    public get lightmap(): LayaXLightmapData { return this._lightmap; }
    public set lightmap(value: LayaXLightmapData) {
        this._lightmap = value;
        this._nativeObj.setLightmap(value ? value._nativeObj : null);
    }

    private _probeReflection: LayaXReflectionProbe;
    public get probeReflection(): LayaXReflectionProbe { return this._probeReflection; }
    public set probeReflection(value: LayaXReflectionProbe) {
        this._probeReflection = value;
        this._nativeObj.setProbeReflection(value ? value._nativeObj : null);
    }

    private _volumetricGI: LayaXVolumetricGI;
    public get volumetricGI(): LayaXVolumetricGI { return this._volumetricGI; }
    public set volumetricGI(value: LayaXVolumetricGI) {
        this._volumetricGI = value;
        this._nativeObj.setVolumetricGI(value ? value._nativeObj : null);
    }

    private _irradientMode: IrradianceMode;
    public get irradientMode(): IrradianceMode { return this._irradientMode; }
    public set irradientMode(value: IrradianceMode) {
        this._irradientMode = value;
        this._nativeObj.irradianceMode = value;
    }

    // ------------------------------------------------------------------
    // ismoved
    // ------------------------------------------------------------------

    private _ismoved: Vector2 = new Vector2();
    public get ismoved(): Vector2 {
        let value: any = this._nativeObj.ismoved;
        if (value) {
            this._ismoved.x = value.x;
            this._ismoved.y = value.y;
        }
        return this._ismoved;
    }
    public set ismoved(value: Vector2) {
        this._ismoved = value;
        this._nativeObj.ismoved = value;
    }

    // ------------------------------------------------------------------
    // Callbacks
    // ------------------------------------------------------------------

    private _caculateBoundingBoxbindFun: any;
    private _renderUpdatePrebindFun: any;

    set_renderUpdatePreCall(call: any, fun: any): void {
        this._renderUpdatePrebindFun = fun.bind(call, RenderContext3D._instance._contextOBJ);
        this._nativeObj.setRenderUpdatePre(this._renderUpdatePrebindFun);
    }

    set_caculateBoundingBox(call: any, fun: any): void {
        this._caculateBoundingBoxbindFun = fun.bind(call);
        this._nativeObj.setCalculateBoundingBox(this._caculateBoundingBoxbindFun);
    }

    // ------------------------------------------------------------------
    // Lifecycle
    // ------------------------------------------------------------------

    protected _getNativeObj(): void {
        this._nativeObj = new (window as any).conchLayaXBaseRenderNode();
    }

    constructor() {
        this._getNativeObj();
        this._defaultBaseGeometryBounds = new Bounds();
        this.baseGeometryBounds = this._defaultBaseGeometryBounds;
        this.renderelements = [];
    }

    // ------------------------------------------------------------------
    // Custom data
    // ------------------------------------------------------------------

    private _worldParams: Vector4 = new Vector4();
    setNodeCustomData(dataSlot: ENodeCustomData, data: number): void {
        switch (dataSlot) {
            case 0:
                this._worldParams.y = data;
                break;
            case 1:
                this._worldParams.z = data;
                break;
            case 2:
                this._worldParams.w = data;
                break;
        }
        this._nativeObj.worldParams = this._worldParams;
    }

    // ------------------------------------------------------------------
    // Render elements
    // ------------------------------------------------------------------

    setRenderelements(value: IRenderElement3D[]): void {
        // TODO(Q13): In LayaX, rendering is Rust-driven. Determine whether we pass
        // full native element objects or just handle IDs to the Rust RenderFeature.
        let tempArray: any[] = [];
        this.renderelements.length = 0;
        for (let i = 0; i < value.length; i++) {
            this.renderelements.push(value[i]);
            value[i].owner = this;
            tempArray.push((value[i] as any)._nativeObj);
        }
        this._nativeObj.setRenderElements(tempArray);
    }

    setLightmapScaleOffset(value: Vector4): void {
        this._nativeObj.setLightmapScaleOffset(value);
    }

    setCommonUniformMap(value: string[]): void {
        this._nativeObj.setCommonUniformMap(value);
    }

    setOneMaterial(index: number, mat: Material): void {
        if (!this.renderelements[index])
            return;
        this.renderelements[index].materialShaderData = mat.shaderData;
        this.renderelements[index].materialRenderQueue = mat.renderQueue;
        this.renderelements[index].subShader = mat.shader.getSubShaderAt(0);
    }

    _applyLightProb(): void {
        this._nativeObj._applyLightProb();
    }

    _applyReflection(): void {
        this._nativeObj._applyReflection();
    }

    destroy(): void {
        this._nativeObj.destroy();
        for (let i = 0, n = this.renderelements.length; i < n; i++) {
            this.renderelements[i].destroy();
        }
        this.renderelements.length = 0;
        this._baseGeometryBounds = null;
        this.transform = null;
        this._shaderData && this._shaderData.destroy();
    }
}
