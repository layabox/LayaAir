
import { ReflectionProbeMode } from "../../../../d3/component/Volume/reflectionProbe/ReflectionProbe";
import { RenderableSprite3D } from "../../../../d3/core/RenderableSprite3D";
import { Transform3D } from "../../../../d3/core/Transform3D";
import { IrradianceMode } from "../../../../d3/core/render/BaseRender";
import { BoundFrustum } from "../../../../d3/math/BoundFrustum";
import { Bounds } from "../../../../d3/math/Bounds";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IRenderElement3D, IRenderContext3D } from "../../../DriverDesign/3DRenderPass/I3DRenderPass";
import { ShaderData } from "../../../DriverDesign/RenderDevice/ShaderData";
import { IBaseRenderNode } from "../../Design/3D/I3DRenderModuleData";
import { WebLightmap } from "./WebLightmap";
import { WebReflectionProbe } from "./WebReflectionProb";
import { WebVolumetricGI } from "./WebVolumetricGI";


export class WebBaseRenderNode implements IBaseRenderNode {
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
    probeReflectionUpdateMark: number;
    reflectionMode: number;
    lightProbUpdateMark: number;
    irradientMode: IrradianceMode;
    renderelements: IRenderElement3D[];
    lightmapScaleOffset: Vector4;
    lightmap: WebLightmap;
    probeReflection: WebReflectionProbe;
    volumetricGI: WebVolumetricGI;
    shaderData: ShaderData;
    baseGeometryBounds: Bounds;
    transform: Transform3D;
    _worldParams: Vector4;
    _commonUniformMap: string[];
    private _bounds: Bounds;
    private _caculateBoundingBoxCall: any;
    private _caculateBoundingBoxFun: Function;
    private _renderUpdatePreCall: any;
    private _renderUpdatePreFun: Function;
    private _updateMark: number;

    /**
    * context3D:GLESRenderContext3D
    * @internal
    */
    _renderUpdatePre(context3D: IRenderContext3D): void {
        if (this._updateMark == context3D.cameraUpdateMask)
            return;
        this._renderUpdatePreFun.call(this._renderUpdatePreCall, context3D);
        this._updateMark = context3D.cameraUpdateMask;
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

    constructor() {
        this.renderelements = [];
        this._commonUniformMap = [];
        this._worldParams = new Vector4(1, 0, 0, 0);
        this.lightmapScaleOffset = new Vector4(1, 1, 0, 0);
        this.set_caculateBoundingBox(this, this._ownerCalculateBoundingBox);
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
     * @internal
     * @param value 
     */
    setWorldParams(value: Vector4) {
        value.cloneTo(this._worldParams);
    }

    /**
     * @internal
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
            this.volumetricGI.applyRenderData(this.shaderData);
        }
    }


    /**
     * apply reflection
     * @returns 
     */
    _applyReflection() {
        if (!this.probeReflection || this.reflectionMode == ReflectionProbeMode.off) return;
        if (this.probeReflection.updateMark != this.probeReflectionUpdateMark) {
            this.probeReflectionUpdateMark = this.probeReflection.updateMark;
            this.probeReflection.applyRenderData(this.shaderData);
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
        this._commonUniformMap.length = 0;
        this._commonUniformMap = null;
    }

}