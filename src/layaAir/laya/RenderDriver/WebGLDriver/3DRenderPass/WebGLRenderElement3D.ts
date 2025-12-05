import { Config } from "../../../../Config";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Transform3D } from "../../../d3/core/Transform3D";
import { Vector2 } from "../../../maths/Vector2";
import { Stat } from "../../../utils/Stat";
import { IRenderElement3D } from "../../DriverDesign/3DRenderPass/I3DRenderPass";
import { WebBaseRenderNode } from "../../RenderModuleData/WebModuleData/3D/WebBaseRenderNode";
import { WebDefineDatas } from "../../RenderModuleData/WebModuleData/WebDefineDatas";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { WebShaderPass } from "../../RenderModuleData/WebModuleData/WebShaderPass";
import { WebGLEngine } from "../RenderDevice/WebGLEngine";
import { compareCahceFlag, OneDrawPassCacheInfo } from "../RenderDevice/WebGLRenderDeviceFactory";
import { WebGLRenderGeometryElement } from "../RenderDevice/WebGLRenderGeometryElement";
import { WebGLShaderInstance } from "../RenderDevice/WebGLShaderInstance";
import { WebGLRenderContext3D } from "./WebGLRenderContext3D";



export class WebGLRenderElement3D implements IRenderElement3D {
    static _matChangeFlagMap: Map<string, Vector2> = new Map();//根据shaderpass name 来取到Map，根据shaderDataID，拿到三个change变量，1、Bindgroup，2、bindgroupLayout，3defineFlag

    /** @internal */
    static _compileDefine: WebDefineDatas = new WebDefineDatas();

    geometry: WebGLRenderGeometryElement;

    protected _subShader: SubShader;
    public get subShader(): SubShader {
        return this._subShader;
    }
    public set subShader(value: SubShader) {
        this._subShader = value;
    }

    materialId: number;

    canDynamicBatch: boolean;

    _materialShaderData: WebGLShaderData;

    materialRenderQueue: number;

    _renderShaderData: WebGLShaderData;

    transform: Transform3D;

    isRender: boolean;

    owner: WebBaseRenderNode;//GLESRenderNode

    customData: any;//每个RenderElement自带的数据

    public get materialShaderData(): WebGLShaderData {
        return this._materialShaderData;
    }

    public set materialShaderData(value: WebGLShaderData) {
        if (this._materialShaderData != value) {
            this._materialShaderData = value;
            this._matChangeFlag.setValue(Stat.loopCount, WebGLEngine.instance._framePassCount)
        }
    }

    public get renderShaderData(): WebGLShaderData {
        return this._renderShaderData;
    }

    public set renderShaderData(value: WebGLShaderData) {
        if (this._renderShaderData != value) {
            this._renderShaderData = value;
            this._renderNodeChangeFlag.setValue(Stat.loopCount, WebGLEngine.instance._framePassCount);
        }
    }


    protected _invertFront: boolean;

    //cache shader Info
    protected _passRenderInfo: Map<number, OneDrawPassCacheInfo> = new Map();

    protected _curDrawCacheInfo: OneDrawPassCacheInfo;

    //material是否改变
    protected _materialRenderDataChange: boolean = false;
    //spriteRenderNode是否改变
    protected _spriteRenderDataChange: boolean = false;

    protected _matChangeFlag: Vector2 = new Vector2();
    protected _matDefChangeFlag: Vector2;

    protected _renderNodeChangeFlag: Vector2 = new Vector2();

    constructor() {
    }

    _preUpdatePre(context: WebGLRenderContext3D) {
        if (!this._passRenderInfo.has(context._curRenderGlobalKey)) {
            this._curDrawCacheInfo = new OneDrawPassCacheInfo();
            this._passRenderInfo.set(context._curRenderGlobalKey, this._curDrawCacheInfo);
        } else {
            this._curDrawCacheInfo = this._passRenderInfo.get(context._curRenderGlobalKey);
        }

        this._updateMatChangeFlag();
        //shader变了或者宏变了 
        let passDefineChangeFlag = this._curDrawCacheInfo.passDefineCacheFlag;
        if (this._materialRenderDataChange || this._spriteRenderDataChange || //材质是否变化
            !this._matDefChangeFlag ||
            compareCahceFlag(this._matDefChangeFlag, passDefineChangeFlag) ||//material宏是否变化
            (this.owner && compareCahceFlag(this.owner.defineDataChangeFlag, passDefineChangeFlag)) ||//sprite是否宏变化
            compareCahceFlag(context._curDefineChangeFlag, passDefineChangeFlag))//判断场景中的宏是否变化
        {
            passDefineChangeFlag.setValue(Stat.loopCount, WebGLEngine.instance._framePassCount);
            this._compileShader(context);
        }

        if (this._materialRenderDataChange) {
            this._handleMaterialChange();
        }

        // material ubo
        if (this._materialShaderData && Config.matUseUBO) {
            let subShader = this._subShader;
            let materialData = this._materialShaderData;
            let matSubBuffer = materialData.createSubUniformBuffer("Material", subShader._owner.name, subShader._uniformMap);
            if (matSubBuffer) {
                matSubBuffer.upload();
            }
        }

        this._invertFront = this._getInvertFront();
    }

    protected _getInvertFront(): boolean {
        let transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    protected _updateMatChangeFlag() {
        this._materialRenderDataChange = compareCahceFlag(this._matChangeFlag, this._curDrawCacheInfo.matCacheFlag)//MaterialShaderData变动或者shader变动
        if (this._renderShaderData && compareCahceFlag(this._renderNodeChangeFlag, this._curDrawCacheInfo.nodeCacheFlag)) {
            this._curDrawCacheInfo.nodeCacheFlag.setValue(Stat.loopCount, WebGLEngine.instance._framePassCount);
            this._spriteRenderDataChange = true;
        } else {
            this._spriteRenderDataChange = false;
        }
    }

    protected _handleMaterialChange() {
        this._curDrawCacheInfo.matCacheFlag.setValue(Stat.loopCount, WebGLEngine.instance._framePassCount);
        let shadername = this._subShader._owner.name;
        if (!WebGLRenderElement3D._matChangeFlagMap.has(shadername)) {
            let changeFlag = new Vector2(Stat.loopCount, WebGLEngine.instance._framePassCount);
            WebGLRenderElement3D._matChangeFlagMap.set(shadername, changeFlag);
            this._materialShaderData._defineDatas.addChangeFlagInfo(changeFlag);
        }
        this._matDefChangeFlag = WebGLRenderElement3D._matChangeFlagMap.get(shadername);
    }

    /**
     * render RenderElement
     * context:GLESRenderContext3D
     * @param context 
     */
    _render(context: WebGLRenderContext3D): void {
        let forceInvertFace: boolean = context.invertY;
        let updateMark: number = context.cameraUpdateMask;
        let sceneShaderData = context.sceneData as WebGLShaderData;
        let cameraShaderData = context.cameraData as WebGLShaderData;
        if (this.isRender) {
            let passes: WebGLShaderInstance[] = this._curDrawCacheInfo.shaderInss;
            for (let j: number = 0, m: number = passes.length; j < m; j++) {
                const shaderIns: WebGLShaderInstance = passes[j];
                if (!shaderIns.complete)
                    continue;
                let switchShader: boolean = shaderIns.bind();
                let switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                let uploadScene: boolean = (shaderIns._uploadScene !== sceneShaderData) || switchUpdateMark;
                //Scene
                if (uploadScene || switchShader) {
                    if (sceneShaderData) {
                        shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, uploadScene);
                    }

                    shaderIns._uploadScene = sceneShaderData;
                }
                //render
                if (this._renderShaderData) {
                    let uploadSprite3D: boolean = (shaderIns._uploadRender !== this._renderShaderData) || switchUpdateMark;
                    if (uploadSprite3D || switchShader) {
                        shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderData, uploadSprite3D);
                        shaderIns._uploadRender = this._renderShaderData;
                    }
                }

                //additionShaderData
                if (this.owner) {
                    let additionShaderData = this.owner.additionShaderData;

                    for (let [key, encoder] of shaderIns._additionUniformParamsMaps) {
                        let additionData = additionShaderData.get(key);
                        if (additionData) {
                            let needUpload = shaderIns._additionShaderData.get(key) !== additionData || switchUpdateMark;

                            if (needUpload || switchShader) {
                                shaderIns.uploadUniforms(encoder, <WebGLShaderData>additionData, needUpload);
                                shaderIns._additionShaderData.set(key, additionData);
                            }
                        }
                    }
                }

                //camera
                let uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                let uploadMaterial: boolean = (shaderIns._uploadMaterial !== this._materialShaderData) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this._materialShaderData, uploadMaterial);
                    shaderIns._uploadMaterial = this._materialShaderData;
                }
                //renderData update
                //TODO：Renderstate as a Object to less upload
                shaderIns.uploadRenderStateBlendDepth(this._materialShaderData);
                shaderIns.uploadRenderStateFrontFace(this._materialShaderData, forceInvertFace, this._invertFront);
                this.drawGeometry(shaderIns);
            }
        }
    }

    protected _getShaderInstanceDefines(context: WebGLRenderContext3D) {
        let comDef = WebGLRenderElement3D._compileDefine;

        const globalShaderDefines = context._getContextShaderDefines();

        globalShaderDefines.cloneTo(comDef);

        if (this._renderShaderData) {
            comDef.addDefineDatas(this._renderShaderData.getDefineData());
        }

        if (this._materialShaderData) {
            comDef.addDefineDatas(this._materialShaderData._defineDatas);
        }

        if (this.owner) {
            let additionShaderData = this.owner.additionShaderData;
            if (additionShaderData.size > 0) {
                for (let [key, value] of additionShaderData.entries()) {
                    comDef.addDefineDatas(value.getDefineData() as WebDefineDatas);
                }
            }
        }


        return comDef;
    }

    protected _compileShader(context: WebGLRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
        let renderCount = 0;
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            let pass = passes[j];
            let passdata = <WebShaderPass>pass.moduleData;
            if (passdata.pipelineMode !== context.pipelineMode)
                continue;

            if (this._renderShaderData) {
                passdata.nodeCommonMap = this.owner._commonUniformMap;
            } else {
                passdata.nodeCommonMap = null;
            }

            passdata.additionShaderData = null;
            if (this.owner) {
                passdata.additionShaderData = this.owner._additionShaderDataKeys;
            }
            // 每次重新获取comDef，确保每个pass都有完整的宏定义
            let comDef = this._getShaderInstanceDefines(context);
            var shaderIns = pass.withCompile(comDef) as WebGLShaderInstance;
            this._curDrawCacheInfo.shaderInss[renderCount] = shaderIns;
            renderCount++
        }
        this._curDrawCacheInfo.shaderInss.length = renderCount;
    }

    drawGeometry(shaderIns: WebGLShaderInstance) {
        WebGLEngine.instance.getDrawContext().drawGeometryElement(this.geometry);
    }

    destroy() {
        this.geometry = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
        this.isRender = null;
    }
}