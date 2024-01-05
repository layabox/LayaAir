import { ShaderData } from "../../../../RenderEngine/RenderShader/ShaderData";
import { Vector4 } from "../../../../maths/Vector4";
import { Material } from "../../../../resource/Material";
import { IBaseRenderNode } from "../../../RenderDriverLayer/Render3DNode/IBaseRenderNode";
import { ReflectionProbeMode } from "../../../component/Volume/reflectionProbe/ReflectionProbe";
import { RenderableSprite3D } from "../../../core/RenderableSprite3D";
import { Transform3D } from "../../../core/Transform3D";
import { IrradianceMode } from "../../../core/render/BaseRender";
import { BoundFrustum } from "../../../math/BoundFrustum";
import { Bounds } from "../../../math/Bounds";
import { RenderElementOBJ } from "../../RenderObj/RenderElementOBJ";
import { GLESRenderContext3D } from "../GLESRenderContext3D";
import { GLESLightmap } from "../RenderModuleData/GLESLightmap";
import { GLESReflectionProbe } from "../RenderModuleData/GLESReflectionProb";
import { GLESVolumetricGI } from "../RenderModuleData/GLESVolumetricGI";

export class GLESBaseRenderNode implements IBaseRenderNode {
    baseGeometryBounds: Bounds;
    boundsChange: boolean;

    transform: Transform3D;
    distanceForSort: number;

    sortingFudge: number;
    castShadow: boolean;
    enable: boolean;
    renderbitFlag: number;
    layer: number;
    _bounds: Bounds;
    customCull: boolean;//TODO
    customCullResoult: boolean;//TODO
    staticMask: number;
    shaderData: ShaderData;
    lightmapScaleOffset: Vector4 = new Vector4(1, 1, 0, 0);
    lightmapIndex: number;
    lightmap: GLESLightmap;
    probeReflection: GLESReflectionProbe;
    probeReflectionUpdateMark: number;
    reflectionMode: number;
    volumetricGI: GLESVolumetricGI;
    lightProbUpdateMark: number;
    irradientMode: IrradianceMode;
    //material 设置相关
    renderelements: RenderElementOBJ[];
    _commonUniformMap: string[];
    setWorldParams(value: Vector4) {

    }

    setRenderelements(value: RenderElementOBJ[]): void {

    }

    setOneMaterial(index: number, mat: Material): void {
        if (!this.renderelements[index])
            return;
        this.renderelements[index]._materialShaderData = mat.shaderData;
        this.renderelements[index]._materialRenderQueue;
    }


    setLightmapScaleOffset(value: Vector4) {

    }

    setCommonUniformMap(value: string[]) {
        this._commonUniformMap.length = 0;
        value.forEach(element => {
            this._commonUniformMap.push(element);
        });
    }

    preUpdateRenderData() {
        //update Sprite ShaderData
        //update geometry data(TODO)
    }

    /**
     * @internal
     */
    _renderUpdatePre(context: GLESRenderContext3D): void {

    }

    _needRender(boundFrustum: BoundFrustum): boolean {
        return true;
    }

    shadowCullPass(): boolean {
        return this.castShadow && this.enable && (this.renderbitFlag == 0);
    }

    addOneRenderElement() {

    }


    set bounds(value: Bounds) {
        this._bounds = value;
    }

    get bounds() {
        if (this.boundsChange) {
            this._calculateBoundingBox();
            this.boundsChange = false;
        }
        return this._bounds;
    }

    protected _calculateBoundingBox() {
        this.baseGeometryBounds._tranform(this.transform.worldMatrix, this.bounds)
    }

    /**
     * @internal
     * 全局贴图
     */
    _applyLightMapParams(): void {
        if (!this.lightmap) {
            var lightMap: GLESLightmap = this.lightmap;
            var shaderValues: ShaderData = this.shaderData;
            shaderValues.setVector(RenderableSprite3D.LIGHTMAPSCALEOFFSET, this.lightmapScaleOffset);
            shaderValues.setTexture(RenderableSprite3D.LIGHTMAP, lightMap.lightmapColor);
            shaderValues.addDefine(RenderableSprite3D.SAHDERDEFINE_LIGHTMAP);
            if (lightMap.lightmapDirection) {
                shaderValues.setTexture(RenderableSprite3D.LIGHTMAP_DIRECTION, lightMap.lightmapDirection);
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
            element._destroy();
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