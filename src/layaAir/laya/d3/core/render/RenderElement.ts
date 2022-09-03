import { BaseRender } from "./BaseRender"
import { RenderContext3D } from "./RenderContext3D"
import { Camera } from "../Camera"
import { GeometryElement } from "../GeometryElement"
import { Transform3D } from "../Transform3D"
import { Material } from "../material/Material"
import { SubShader } from "../../shader/SubShader"
import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement"
import { Scene3D } from "../scene/Scene3D"
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
import { ShaderPass } from "../../shader/ShaderPass"
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas"
import { ShaderInstance } from "../../shader/ShaderInstance"
import { LayaGL } from "../../../layagl/LayaGL"
import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D"

/**
 * <code>RenderElement</code> 类用于实现渲染元素。
 */
export class RenderElement {
    /** @internal */
    static RENDERTYPE_NORMAL: number = 0;
    /** @internal */
    static RENDERTYPE_STATICBATCH: number = 1;
    /** @internal */
    static RENDERTYPE_INSTANCEBATCH: number = 2;
    /** @internal */
    static RENDERTYPE_VERTEXBATCH: number = 3;

    /** @internal */
    static _compileDefine: DefineDatas = new DefineDatas();

    /**
     * 可提交底层的渲染节点
     */
    _renderElementOBJ: IRenderElement;
    /** @internal */
    _geometry: GeometryElement;
    /**@internal */
    _canBatch: boolean = false;
    /** @internal */
    protected _material: Material;//可能为空
    /** @internal */
    protected _baseRender: BaseRender;
    /**@internal */
    protected _subShader: SubShader;
    /**@internal */
    _subShaderIndex:number = 0;



    /** @internal */
    set transform(value: Transform3D) {
        this._renderElementOBJ._transform = value;
    }

    /**@internal */
    get transform(): Transform3D {
        return this._renderElementOBJ._transform;
    }

    /**@internal */
    set material(value: Material) {
        // todo debug 临时
        if (value) {
            this._material = value;
            this._renderElementOBJ._materialShaderData = value.shaderData;
        }

    }

    /**@internal */
    get material(): Material {
        return this._material;
    }

    /**@internal */
    set renderSubShader(value: SubShader) {
        this._subShader = value;
    }

    /**@internal */
    get renderSubShader(): SubShader {
        return this._subShader;
    }
    /**@internal */
    set render(value: BaseRender) {
        this._baseRender = value;
        this._renderElementOBJ._renderShaderData = value._shaderValues;
    }

    get render(): BaseRender {
        return this._baseRender;
    }



    /** @internal */
    staticBatch: GeometryElement;
    /** @internal */
    renderType: number = RenderElement.RENDERTYPE_NORMAL;
    /**
     * 创建一个 <code>RenderElement</code> 实例。
     */
    constructor() {
        this._createRenderElementOBJ();
    }

    protected _createRenderElementOBJ() {
        this._renderElementOBJ = LayaGL.renderOBJCreate.createRenderElement();
    }

    /**
     * @internal
     */
    getInvertFront(): boolean {
        return this.transform._isFrontFaceInvert;
    }

    /**
     * @internal
     */
    setTransform(transform: Transform3D): void {
        this.transform = transform;
    }

    /**
     * @internal
     */
    setGeometry(geometry: GeometryElement): void {
        this._geometry = geometry;
        this._renderElementOBJ._geometry = geometry._geometryElementOBj;
    }

    // /**
    //  * @internal
    //  */
    // addToOpaqueRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
    // 	queue.elements.add(this);
    // }

    // /**
    //  * @internal
    //  */
    // addToTransparentRenderQueue(context: RenderContext3D, queue: RenderQueue): void {
    // 	queue.elements.add(this);
    // }

    compileShader(context: IRenderContext3D) {
        var passes: ShaderPass[] = this._subShader._passes;
        this._renderElementOBJ._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass._pipelineMode !== context.pipelineMode)
                continue;

            var comDef: DefineDatas = RenderElement._compileDefine;
            
            if(context.sceneShaderData){
                context.sceneShaderData._defineDatas.cloneTo(comDef);
            }else{
                Scene3D._configDefineValues.cloneTo(comDef);
            }
            context.cameraShaderData && comDef.addDefineDatas(context.cameraShaderData._defineDatas);
            this.render && comDef.addDefineDatas(this.render._shaderValues._defineDatas);

            comDef.addDefineDatas(this._renderElementOBJ._materialShaderData._defineDatas);
            var shaderIns: ShaderInstance = pass.withCompile(comDef);
            this._renderElementOBJ._addShaderInstance(shaderIns);
        }
    }


    _convertSubShader(customShader: Shader3D, replacementTag: string, subshaderIndex: number = 0) {
        var subShader: SubShader = this.material._shader.getSubShaderAt(this._subShaderIndex);//TODO:
        this.renderSubShader = null;
        if (customShader) {
            if (replacementTag) {
                var oriTag: string = subShader.getFlag(replacementTag);
                if (oriTag) {
                    var customSubShaders: SubShader[] = customShader._subShaders;
                    for (var k: number = 0, p: number = customSubShaders.length; k < p; k++) {
                        var customSubShader: SubShader = customSubShaders[k];
                        if (oriTag === customSubShader.getFlag(replacementTag)) {
                            this.renderSubShader = customSubShader;
                            break;
                        }
                    }
                    if (!this.renderSubShader)
                        return;
                } else {
                    return;
                }
            } else {
                this.renderSubShader = customShader.getSubShaderAt(subshaderIndex);//TODO:
            }
        } else {
            this.renderSubShader = subShader;
        }
    }

    /**
     * @internal
     */
    _update(scene: Scene3D, context: RenderContext3D, customShader: Shader3D, replacementTag: string, subshaderIndex: number = 0): void {
        if (this.material) {//材质可能为空
            this._convertSubShader(customShader, replacementTag, subshaderIndex);

            var renderQueue = scene._getRenderQueue(this.material.renderQueue);
            if (renderQueue._isTransparent)
                renderQueue.addRenderElement(this);
            else
                renderQueue.addRenderElement(this);
        }
    }

    _renderUpdatePre(context: RenderContext3D) {

        var sceneMark: number = Scene3D._updateMark;
        var transform: Transform3D = this.transform;
        context.renderElement = this;
        //model local
        var modelDataRender: boolean = (!!this.render) ? (sceneMark !== this.render._sceneUpdateMark || this.renderType !== this.render._updateRenderType) : false;
        if (modelDataRender) {
            this.render._renderUpdate(context, transform);
            this.render._sceneUpdateMark = sceneMark;
        }
        //camera
        var updateMark: number = Camera._updateMark;
        var updateRender: boolean = (!!this.render) ? (updateMark !== this.render._updateMark || this.renderType !== this.render._updateRenderType) : false;
        if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
            this.render._renderUpdateWithCamera(context, transform);
            this.render._updateMark = updateMark;
            this.render._updateRenderType = this.renderType;
        }

        const subUbo = (!!this.render) ? this.render._subUniformBufferData : false;
        if (subUbo) {
            subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
        }
        //context.shader = this._renderElementOBJ._subShader;
        this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
        this._geometry._updateRenderParams(context);
        this.compileShader(context._contextOBJ);
    }

    /**
     * @internal
     */
    _render(context: IRenderContext3D): void {
        this._renderElementOBJ._render(context);
    }

    /**
     * @internal
     */
    destroy(): void {
        this._renderElementOBJ._destroy();
        this._renderElementOBJ = null;
        this._geometry = null;
        this._baseRender = null;
        this._material = null
        this._baseRender = null;
        this._subShader = null;
    }
}

