import { ReflectionProbeMode } from "../../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { IrradianceMode } from "../../../../d3/core/render/BaseRender";
import { BoundFrustum } from "../../../../d3/math/BoundFrustum";
import { Bounds } from "../../../../d3/math/Bounds";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IRenderContext3D, IRenderElement3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { BaseRenderType, ENodeCustomData, IBaseRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebLightmap } from "./WebLightmap";
import { WebReflectionProbe } from "./WebReflectionProb";
import { WebVolumetricGI } from "./WebVolumetricGI";
import { Vector2 } from "../../../../maths/Vector2";
import { WebDefineDatas } from "../WebDefineDatas";

interface DynamicBaseRenderClass {
    new(): WebBaseRenderNode;
    readonly prototype: WebBaseRenderNode
}

export class WebBaseRenderNode implements IBaseRenderNode {
    static BaseRenderNodeClass: DynamicBaseRenderClass;
    renderNodeType: BaseRenderType;
    boundsChange: boolean;
    distanceForSort: number;
    sortingFudge: number;
    castShadow: boolean;
    receiveShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    layer: number;
    customCull: boolean;//TODO
    customCullResoult: boolean;//TODO
    staticMask: number;
    lightmapIndex: number;
    lightmapDirtyFlag: number;
    reflectionMode: number;
    lightProbUpdateMark: number;
    irradientMode: IrradianceMode;
    renderelements: IRenderElement3D[];
    lightmapScaleOffset: Vector4;
    lightmap: WebLightmap;
    probeReflection: WebReflectionProbe;
    volumetricGI: WebVolumetricGI;
    visibalRangeBit: number;
    visibalMin: number;
    visibalMax: number;
    baseGeometryBounds: Bounds;
    transform: Transform3D;
    _worldParams: Vector4;
    _commonUniformMap: string[];
    _additionShaderDataKeys: string[];
    ismoved: Vector2 = new Vector2();

    defineDataChangeFlag: Vector2 = new Vector2();
    private _bounds: Bounds;
    private _caculateBoundingBoxCall: any;
    private _caculateBoundingBoxFun: Function;
    private _renderUpdatePreCall: any;
    private _renderUpdatePreFun: Function;
    private _updateMark: number;
    /**
     * @en If true, _renderUpdatePre is called once per camera; otherwise once per frame.
     * @zh 为 true 时 _renderUpdatePre 逐相机调用，否则逐帧调用。
     */
    perCameraUpdate: boolean = false;

    protected _additionShaderData: Map<string, ShaderData>;

    protected _shaderData: ShaderData;

    public get shaderData() {
        return this._shaderData;
    }

    public set shaderData(value) {
        if (this._shaderData != value) {
            let oldCommandMap = this._commonUniformMap.slice();
            if (this._shaderData) {
                //移除之前的资源绑定
                this.setCommonUniformMap([]);
            }
            this._shaderData = value;
            this.setCommonUniformMap(oldCommandMap);
        }
    }


    /**
     * context3D:GLESRenderContext3D
     * @internal
     */
    _renderUpdatePre(context3D: IRenderContext3D): void {
        const mask = this.perCameraUpdate
            ? context3D.cameraUpdateMask
            : context3D.sceneUpdateMask;
        if (this._updateMark == mask)
            return;
        this._renderUpdatePreFun.call(this._renderUpdatePreCall, context3D);
        this._updateMark = mask;
    }

    _calculateBoundingBox() {
        this._caculateBoundingBoxFun.call(this._caculateBoundingBoxCall);
    }

    /**
     * get bounds
     */
    get bounds() {
        if (this.boundsChange) {
            this._calculateBoundingBox();
            this.boundsChange = false;
        }
        return this._bounds;
    }

    set bounds(value: Bounds) {
        this._bounds = value;
    }

    public get additionShaderData(): Map<string, ShaderData> {
        return this._additionShaderData;
    }

    public set additionShaderData(value: Map<string, ShaderData>) {
        if (this._additionShaderData && this._additionShaderData.size > 0) {
            if (!value)
                for (var [key, date] of this._additionShaderData) {//全删
                    (date.getDefineData() as WebDefineDatas).removeChangeFlagInfo(this.defineDataChangeFlag);
                }
            else {
                for (var [key, date] of this._additionShaderData) {//删部分
                    if (!value.has(key)) {
                        (date.getDefineData() as WebDefineDatas).removeChangeFlagInfo(this.defineDataChangeFlag);
                    }
                }
            }
        }
        this._additionShaderData = value;
        if (value && value.size > 0) {
            this._additionShaderDataKeys = Array.from(this._additionShaderData.keys());
            for (var [key, shaderdate] of value) {
                (shaderdate.getDefineData() as WebDefineDatas).addChangeFlagInfo(this.defineDataChangeFlag);
            }
        }
        else {
            this._additionShaderDataKeys = [];
        }
    }

    constructor() {
        this.renderelements = [];
        this._commonUniformMap = [];
        this._worldParams = new Vector4(1, 0, 0, 0);
        this.lightmapDirtyFlag = -1;
        this.lightmapScaleOffset = new Vector4(1, 1, 0, 0);
        this.set_caculateBoundingBox(this, this._ownerCalculateBoundingBox);
        this._additionShaderData = new Map();
    }


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
    }



    /**
     * 设置更新数据
     * @param call 
     * @param fun 
     */
    set_renderUpdatePreCall(call: any, fun: any): void {
        this._renderUpdatePreCall = call;
        this._renderUpdatePreFun = fun;
    }

    /**
     * 设置更新包围盒方法
     * @param call 
     * @param fun 
     */
    set_caculateBoundingBox(call: any, fun: any): void {
        this._caculateBoundingBoxCall = call;
        this._caculateBoundingBoxFun = fun;
    }

    /**
     * 视锥检测包围盒
     * @param boundFrustum 
     * @returns 
     */
    _needRender(boundFrustum: BoundFrustum): boolean {
        if (boundFrustum)
            return boundFrustum.intersects(this.bounds);
        else
            return true;
    }



    /**
     * @param value :RenderElementObj
     */
    setRenderelements(value: IRenderElement3D[]): void {
        this.renderelements.length = 0;
        for (var i = 0; i < value.length; i++) {
            this.renderelements.push(value[i]);
            value[i].owner = this;
        }
    }

    /**
     * @internal
     * @param index 
     * @param mat 
     * @returns 
     */
    setOneMaterial(index: number, mat: Material): void {
        if (!this.renderelements[index])
            return;
        this.renderelements[index].materialShaderData = mat.shaderData;
        this.renderelements[index].materialRenderQueue = mat.renderQueue;
        this.renderelements[index].subShader = mat.shader.getSubShaderAt(0);
        this.renderelements[index].materialId = mat._id;
    }

    /**
     * @internal
     * @param value 
     */
    setLightmapScaleOffset(value: Vector4) {
        value && value.cloneTo(this.lightmapScaleOffset);
    }

    /**@internal */
    setCommonUniformMap(value: string[]) {
        this._commonUniformMap.length = 0;
        value.forEach(element => {
            this._commonUniformMap.push(element);
        });
        this._shaderData && (this._shaderData.getDefineData() as WebDefineDatas)?.addChangeFlagInfo(this.defineDataChangeFlag);
    }

    /**
     * @internal
     * @returns 
     */
    shadowCullPass(): boolean {
        return this.castShadow && this.enable && (this.renderbitFlag == 0);
    }

    /**
     * @internal
     */
    _ownerCalculateBoundingBox() {
        this.baseGeometryBounds._tranform(this.transform.worldMatrix, this._bounds)
    }

    /**
     * @internal
     * 全局贴图
     */
    _applyLightMapParams(): void {
        let shaderValues = this.shaderData;
        if (this.lightmap) {
            let lightMap = this.lightmap;
            shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, this.lightmapScaleOffset);
            shaderValues._setInternalTexture(RenderableSprite3D.LIGHTMAP, lightMap.lightmapColor);
            shaderValues.addDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            if (lightMap.lightmapDirection) {
                shaderValues._setInternalTexture(RenderableSprite3D.LIGHTMAP_DIRECTION, lightMap.lightmapDirection);
                shaderValues.addDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
            }
            else {
                shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
            }
        } else {
            shaderValues.removeDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            shaderValues.removeDefine(RenderableSprite3D.SHADERDEFINE_LIGHTMAP_DIRECTIONAL);
        }
    }

    /**
    * apply lightProb
    * @returns 
    */
    _applyLightProb() {
        if (this.lightmapIndex >= 0 || !this.volumetricGI) return;
        if (this.volumetricGI.updateMark != this.lightProbUpdateMark) {
            this.lightProbUpdateMark = this.volumetricGI.updateMark;
            this.volumetricGI.applyRenderData();
        }
    }


    /**
     * apply reflection
     * @returns 
     */
    _applyReflection() {
        if (!this.probeReflection || this.reflectionMode == ReflectionProbeMode.off)
            return;
        if (!this.probeReflection.shaderData)
            return;
        if (this.probeReflection.needUpdate()) {
            this.probeReflection.applyRenderData();
        }
    }

    /**
     * destroy
     */
    destroy() {
        this.renderelements.forEach(element => {
            element.destroy();
        });
        this.baseGeometryBounds = null;
        this.transform = null;
        this.lightmapScaleOffset = null;
        this.lightmap = null;
        this.probeReflection = null;
        this.volumetricGI = null;
        this.renderelements.length = 0;
        this.renderelements = null;
        this.shaderData && this.shaderData.destroy();
        this.shaderData = null;

        this._commonUniformMap.length = 0;
        this._commonUniformMap = null;

        this.additionShaderData.clear();
        this.additionShaderData = null;
        this._additionShaderDataKeys.length = 0;
        this._additionShaderDataKeys = null;
    }

}