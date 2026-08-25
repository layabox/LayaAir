import { IrradianceMode } from "../../../../d3/core/render/BaseRender";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { Bounds } from "../../../../d3/math/Bounds";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IRenderElement3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ENodeCustomData, IBaseRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { RTTransform3D } from "./RTTransform3D";
import { RTLightmapData } from "./RTLightmap";
import { RTReflectionProb } from "./RTReflectionProb";
import { RTVolumetricGI } from "./RTVolumetricGI";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { Vector2 } from "../../../../maths/Vector2";
import { NativeMemory } from "../NativeMemory";

/** @internal conchRTBaseRenderNode 共享属性块槽位（与 C++ RTBaseRenderNode::Props 字段顺序严格一致）。 */
const enum RTBaseRenderNodeSlot {
    distanceForSort = 0,
    sortingFudge = 1,
    castShadow = 2,
    receiveShadow = 3,
    enable = 4,
    renderbitFlag = 5,
    visibalRangeBit = 6,
    visibalMin = 7,
    visibalMax = 8,
    layer = 9,
    renderNodeType = 10,
    staticMask = 11,
    lightmapIndex = 12,
    reflectionMode = 13,
    lightProbUpdateMark = 14,
    irradianceMode = 15,
    perCameraUpdate = 16,
    boundsChange = 17,
    ismovedX = 18,
    ismovedY = 19,
    worldParamsX = 20,
    worldParamsY = 21,
    worldParamsZ = 22,
    worldParamsW = 23,
    lightmapScaleOffsetX = 24,
    lightmapScaleOffsetY = 25,
    lightmapScaleOffsetZ = 26,
    lightmapScaleOffsetW = 27,
    customCull = 28,
    customCullResoult = 29,
    Count = 30,
}

export class RTBaseRenderNode implements IBaseRenderNode {
    renderelements: IRenderElement3D[];
    private _transform: RTTransform3D;

    public get transform(): RTTransform3D {
        return this._transform;
    }

    public set transform(value: RTTransform3D) {
        this._nativeObj.setTransform(value ? value._nativeObj : null);
        this._transform = value;
    }

    public get distanceForSort(): number {
        return this._f32[RTBaseRenderNodeSlot.distanceForSort];
    }

    public set distanceForSort(value: number) {
        this._f32[RTBaseRenderNodeSlot.distanceForSort] = value;
    }
    public get sortingFudge(): number {
        return this._f32[RTBaseRenderNodeSlot.sortingFudge];
    }
    public set sortingFudge(value: number) {
        this._f32[RTBaseRenderNodeSlot.sortingFudge] = value;
    }
    public get castShadow(): boolean {
        return this._i32[RTBaseRenderNodeSlot.castShadow] !== 0;
    }
    public set castShadow(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.castShadow] = value ? 1 : 0;
    }
    public get enable(): boolean {
        return this._i32[RTBaseRenderNodeSlot.enable] !== 0;
    }
    public set enable(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.enable] = value ? 1 : 0;
    }
    public get renderbitFlag(): number {
        return this._u32[RTBaseRenderNodeSlot.renderbitFlag];
    }
    public set renderbitFlag(value: number) {
        this._u32[RTBaseRenderNodeSlot.renderbitFlag] = value;
    }
    public get layer(): number {
        return this._u32[RTBaseRenderNodeSlot.layer];
    }
    public set layer(value: number) {
        this._u32[RTBaseRenderNodeSlot.layer] = value;
    }
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
        this._nativeObj._bounds = value._imp._nativeObj;
    }
    private _baseGeometryBounds: Bounds;
    public get baseGeometryBounds(): Bounds {
        return this._baseGeometryBounds;
    }
    public set baseGeometryBounds(value: Bounds) {
        this._baseGeometryBounds = value;
        this._nativeObj.setBaseGeometryBounds((value._imp as any)._nativeObj);
    }
    public get boundsChange(): boolean {
        return this._i32[RTBaseRenderNodeSlot.boundsChange] !== 0;
    }
    public set boundsChange(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.boundsChange] = value ? 1 : 0;
    }
    public get customCull(): boolean {
        return this._i32[RTBaseRenderNodeSlot.customCull] !== 0;
    }
    public set customCull(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.customCull] = value ? 1 : 0;
    }
    public get customCullResoult(): boolean {
        return this._i32[RTBaseRenderNodeSlot.customCullResoult] !== 0;
    }
    public set customCullResoult(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.customCullResoult] = value ? 1 : 0;
    }
    public get staticMask(): number {
        return this._u32[RTBaseRenderNodeSlot.staticMask];
    }
    public set staticMask(value: number) {
        this._u32[RTBaseRenderNodeSlot.staticMask] = value;
    }
    private _shaderData: ShaderData;
    public get shaderData(): ShaderData {
        return this._shaderData;
    }
    public set shaderData(value: ShaderData) {
        this._shaderData = value;
        this._nativeObj.setShaderData((value as any)._nativeObj);
    }
    public get lightmapIndex(): number {
        return this._i32[RTBaseRenderNodeSlot.lightmapIndex];
    }
    public set lightmapIndex(value: number) {
        this._i32[RTBaseRenderNodeSlot.lightmapIndex] = value;
    }
    private _lightmap: RTLightmapData;
    public get lightmap(): RTLightmapData {
        return this._lightmap;
    }
    public set lightmap(value: RTLightmapData) {
        this._lightmap = value;
        this._nativeObj.setLightmap(value ? value._nativeObj : null);
    }
    private _probeReflection: RTReflectionProb;
    public get probeReflection(): RTReflectionProb {
        return this._probeReflection;
    }
    public set probeReflection(value: RTReflectionProb) {
        this._probeReflection = value;
        this._nativeObj.setProbeReflection(value ? value._nativeObj : null);
    }

    public get reflectionMode(): number {
        return this._u32[RTBaseRenderNodeSlot.reflectionMode];
    }
    public set reflectionMode(value: number) {
        this._u32[RTBaseRenderNodeSlot.reflectionMode] = value;
    }
    private _volumetricGI: RTVolumetricGI;
    public get volumetricGI(): RTVolumetricGI {
        return this._volumetricGI;
    }
    public set volumetricGI(value: RTVolumetricGI) {
        this._volumetricGI = value;
        this._nativeObj.setVolumetricGI(value ? value._nativeObj : null);
    }
    public get lightProbUpdateMark(): number {
        return this._i32[RTBaseRenderNodeSlot.lightProbUpdateMark];
    }
    public set lightProbUpdateMark(value: number) {
        this._i32[RTBaseRenderNodeSlot.lightProbUpdateMark] = value;
    }
    private _irradientMode: IrradianceMode;
    public get irradientMode(): IrradianceMode {
        return this._irradientMode;
    }
    public set irradientMode(value: IrradianceMode) {
        this._irradientMode = value;
        this._u32[RTBaseRenderNodeSlot.irradianceMode] = value;
    }


    private _caculateBoundingBoxbindFun: any;

    private _renderUpdatePrebindFun: any;

    /**
     * 设置更新数据
     * @param call 
     * @param fun 
     */
    set_renderUpdatePreCall(call: any, fun: any): void {
        this._renderUpdatePrebindFun = fun.bind(call, RenderContext3D._instance._contextOBJ);
        this._nativeObj.setRenderUpdatePre(this._renderUpdatePrebindFun);
    }

    /**
     * 设置更新包围盒方法
     * @param call 
     * @param fun 
     */
    set_caculateBoundingBox(call: any, fun: any): void {
        this._caculateBoundingBoxbindFun = fun.bind(call);
        this._nativeObj.setCalculateBoundingBox(this._caculateBoundingBoxbindFun);
    }

    _nativeObj: any;
    /**@internal 共享属性块（per-instance，与 C++ m_props 同一块内存） */
    private _mem: NativeMemory;
    private _f32: Float32Array;
    private _i32: Int32Array;
    private _u32: Uint32Array;
    /**@internal */
    _defaultBaseGeometryBounds: Bounds;

    //create runtime Node
    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTBaseRenderNode();
    }


    private _additionShaderData: Map<string, ShaderData> = new Map();//TODO:
    public get additionShaderData(): Map<string, ShaderData> {
        return this._additionShaderData;
    }
    public set additionShaderData(value: Map<string, ShaderData>) {
        this._additionShaderData = value;
        this._nativeObj.clearAdditionalMap();
        for (let [key, value] of this._additionShaderData) {
            this._nativeObj.addOneAddiionalData(key, (value as any)._nativeObj);
        }
    }

    public get perCameraUpdate(): boolean {
        return this._i32[RTBaseRenderNodeSlot.perCameraUpdate] !== 0;
    }
    public set perCameraUpdate(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.perCameraUpdate] = value ? 1 : 0;
    }

    constructor() {
        this._getNativeObj();
        this._initPropertyBuffer();
        this._defaultBaseGeometryBounds = new Bounds();
        this.baseGeometryBounds = this._defaultBaseGeometryBounds;
        this.renderelements = [];
    }

    /** @internal 分配 TS-owned 共享属性块、绑定到 native、写入非零构造默认值（其余槽 ArrayBuffer 零初始化）。 */
    private _initPropertyBuffer(): void {
        this._mem = new NativeMemory(RTBaseRenderNodeSlot.Count * 4, false);
        this._f32 = this._mem.float32Array;
        this._i32 = this._mem.int32Array;
        this._u32 = this._mem.Uint32Array;
        this._nativeObj.bindPropertyBuffer(this._mem._buffer);
        this._i32[RTBaseRenderNodeSlot.lightmapIndex] = -1;
        this._i32[RTBaseRenderNodeSlot.lightProbUpdateMark] = -1;
        this._f32[RTBaseRenderNodeSlot.lightmapScaleOffsetX] = 1;
    }

    public get visibalRangeBit(): number {
        return this._u32[RTBaseRenderNodeSlot.visibalRangeBit];
    }

    public set visibalRangeBit(value: number) {
        this._u32[RTBaseRenderNodeSlot.visibalRangeBit] = value;
    }

    public get visibalMin(): number {
        return this._f32[RTBaseRenderNodeSlot.visibalMin];
    }

    public set visibalMin(value: number) {
        this._f32[RTBaseRenderNodeSlot.visibalMin] = value;
    }

    public get visibalMax(): number {
        return this._f32[RTBaseRenderNodeSlot.visibalMax];
    }

    public set visibalMax(value: number) {
        this._f32[RTBaseRenderNodeSlot.visibalMax] = value;
    }

    public get ismoved(): Vector2 {
        return this._ismoved;
    }

    public set ismoved(value: Vector2) {
        this._ismoved.setValue(value.x, value.y);
        // Unique channel that feeds ismoved into native; C++ _renderUpdate compares it against
        // _cacheMoved to advance WORLDMATRIX. Must keep writing the slots (loopCount / framePassCount).
        this._f32[RTBaseRenderNodeSlot.ismovedX] = value.x;
        this._f32[RTBaseRenderNodeSlot.ismovedY] = value.y;
    }

    private _ismoved: Vector2 = new Vector2();

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
        // Behavior preserved: writes the whole worldParams (x included). C++ _renderUpdate also
        // writes x (frontFace) -- see the worldParams.x dirty-write note reported to the user.
        this._f32[RTBaseRenderNodeSlot.worldParamsX] = this._worldParams.x;
        this._f32[RTBaseRenderNodeSlot.worldParamsY] = this._worldParams.y;
        this._f32[RTBaseRenderNodeSlot.worldParamsZ] = this._worldParams.z;
        this._f32[RTBaseRenderNodeSlot.worldParamsW] = this._worldParams.w;
    }

    public get renderNodeType(): number {
        return this._u32[RTBaseRenderNodeSlot.renderNodeType];
    }

    public set renderNodeType(value: number) {
        this._u32[RTBaseRenderNodeSlot.renderNodeType] = value;
    }

    public get receiveShadow(): boolean {
        return this._i32[RTBaseRenderNodeSlot.receiveShadow] !== 0;
    }

    public set receiveShadow(value: boolean) {
        this._i32[RTBaseRenderNodeSlot.receiveShadow] = value ? 1 : 0;
    }
    _applyLightProb(): void {
        this._nativeObj._applyLightProb();
    }
    _applyReflection(): void {
        this._nativeObj._applyReflection();
    }
    setRenderelements(value: IRenderElement3D[]): void {
        var tempArray: any[] = [];
        this.renderelements.length = 0;
        for (var i = 0; i < value.length; i++) {
            this.renderelements.push(value[i]);
            value[i].owner = this;

            tempArray.push((value[i] as any)._nativeObj);
        }
        this._nativeObj.setRenderElements(tempArray);
    }

    setLightmapScaleOffset(value: Vector4): void {
        this._f32[RTBaseRenderNodeSlot.lightmapScaleOffsetX] = value.x;
        this._f32[RTBaseRenderNodeSlot.lightmapScaleOffsetY] = value.y;
        this._f32[RTBaseRenderNodeSlot.lightmapScaleOffsetZ] = value.z;
        this._f32[RTBaseRenderNodeSlot.lightmapScaleOffsetW] = value.w;
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
