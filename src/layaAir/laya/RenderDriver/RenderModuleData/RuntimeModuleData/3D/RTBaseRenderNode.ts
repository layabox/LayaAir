import { IrradianceMode } from "../../../../d3/core/render/BaseRender";
import { RenderContext3D } from "../../../../d3/core/render/RenderContext3D";
import { Bounds } from "../../../../d3/math/Bounds";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IRenderElement3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { IBaseRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { NativeTransform3D } from "./NativeTransform3D";
import { RTLightmapData } from "./RTLightmap";
import { RTReflectionProb } from "./RTReflectionProb";
import { RTVolumetricGI } from "./RTVolumetricGI";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { NativeBounds } from "./NativeBounds";


export class RTBaseRenderNode implements IBaseRenderNode {
    renderelements: IRenderElement3D[];
    private _transform: NativeTransform3D;

    public get transform(): NativeTransform3D {
        return this._transform;
    }

    public set transform(value: NativeTransform3D) {
        this._nativeObj.setTransform(value._nativeObj);
        this._transform = value;
    }

    public get distanceForSort(): number {
        return this._nativeObj.distanceForSort;
    }

    public set distanceForSort(value: number) {
        this._nativeObj.distanceForSort = value;
    }
    public get sortingFudge(): number {
        return this._nativeObj.sortingFudge;
    }
    public set sortingFudge(value: number) {
        this._nativeObj.sortingFudge = value;
    }
    public get castShadow(): boolean {
        return this._nativeObj.castShadow;
    }
    public set castShadow(value: boolean) {
        this._nativeObj.castShadow = value;
    }
    public get enable(): boolean {
        return this._nativeObj.enable;
    }
    public set enable(value: boolean) {
        this._nativeObj.enable = value;
    }
    public get renderbitFlag(): number {
        return this._nativeObj.renderbitFlag;
    }
    public set renderbitFlag(value: number) {
        this._nativeObj.renderbitFlag = value;
    }
    public get layer(): number {
        return this._nativeObj.layer;
    }
    public set layer(value: number) {
        this._nativeObj.layer = value;
    }
    private _bounds: Bounds;
    public get bounds(): Bounds {
        //if(this.boundsChange){
            this._bounds._imp._nativeObj = this._nativeObj._bounds;
        //}
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
        return this._nativeObj.boundsChange;
    }
    public set boundsChange(value: boolean) {
        this._nativeObj.boundsChange = value;
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
        return this._nativeObj.staticMask;
    }
    public set staticMask(value: number) {
        this._nativeObj.staticMask = value;
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
        return this._nativeObj.lightmapIndex;
    }
    public set lightmapIndex(value: number) {
        this._nativeObj.lightmapIndex = value;
    }
    private _lightmap: RTLightmapData;
    public get lightmap(): RTLightmapData {
        return this._lightmap;
    }
    public set lightmap(value: RTLightmapData) {
        this._lightmap = value;
        this._nativeObj.setLightmap(value._nativeObj);
    }
    private _probeReflection: RTReflectionProb;
    public get probeReflection(): RTReflectionProb {
        return this._probeReflection;
    }
    public set probeReflection(value: RTReflectionProb) {
        this._probeReflection = value;
        this._nativeObj.setProbeReflection(value._nativeObj);
    }
    public get probeReflectionUpdateMark(): number {
        return this._nativeObj.probeReflectionUpdateMark;
    }
    public set probeReflectionUpdateMark(value: number) {
        this._nativeObj.probeReflectionUpdateMark = value;
    }
    public get reflectionMode(): number {
        return this._nativeObj.reflectionMode;
    }
    public set reflectionMode(value: number) {
        this._nativeObj.reflectionMode = value;
    }
    private _volumetricGI: RTVolumetricGI;
    public get volumetricGI(): RTVolumetricGI {
        return this._volumetricGI;
    }
    public set volumetricGI(value: RTVolumetricGI) {
        this._volumetricGI = value;
        this._nativeObj.setVolumetricGI(value._nativeObj)
    }
    public get lightProbUpdateMark(): number {
        return this._nativeObj.lightProbUpdateMark;
    }
    public set lightProbUpdateMark(value: number) {
        this._nativeObj.lightProbUpdateMark = value;
    }
    private _irradientMode: IrradianceMode;
    public get irradientMode(): IrradianceMode {
        return this._irradientMode;
    }
    public set irradientMode(value: IrradianceMode) {
        this._irradientMode = value;
        this._nativeObj.irradianceMode = value;
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
    //create runtime Node
    protected _getNativeObj() {
        this._nativeObj = new (window as any).conchRTBaseRenderNode();
    }

    constructor() {
        this._getNativeObj();
        this.renderelements = [];
    }

    public get renderNodeType(): number {
        return this._nativeObj.renderNodeType;
    }

    public set renderNodeType(value: number) {
        this._nativeObj.renderNodeType = value;
    }

    public get receiveShadow(): boolean {
        return this._nativeObj.receiveShadow;
    }

    public set receiveShadow(value: boolean) {
        this._nativeObj.receiveShadow = value;
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

    destroy(): void {
        this._nativeObj.destroy();
    }

}