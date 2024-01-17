import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement";
import { IRenderGeometryElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderGeometryElement";
import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas";
import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { WebShaderData } from "../../../RenderEngine/RenderShader/WebShaderData";
import { LayaGL } from "../../../layagl/LayaGL";
import { SingletonList } from "../../../utils/SingletonList";
import { IRenderContext3D } from "../../RenderDriverLayer/IRenderContext3D";
import { Transform3D } from "../../core/Transform3D";
import { GLESRenderContext3D } from "./GLESRenderContext3D";
import { GLESBaseRenderNode } from "./Render3DNode/GLESBaseRenderNode";


export class GLESRenderElementOBJ implements IRenderElement {
    /** @internal */
    static _compileDefine: DefineDatas = new DefineDatas();

    geometry: IRenderGeometryElement;

    subShader: SubShader;

    shaderInstances: SingletonList<ShaderInstance>;

    materialShaderData: WebShaderData;

    materialRenderQueue: number;

    renderShaderData: WebShaderData;

    transform: Transform3D;

    isRender: boolean;

    owner: GLESBaseRenderNode;//GLESRenderNode

    invertFront: boolean;

    constructor() {
        this.shaderInstances = new SingletonList();
    }

    _addShaderInstance(shader: ShaderInstance) {
        this.shaderInstances.add(shader);
    }

    _clearShaderInstance() {
        this.shaderInstances.length = 0;
    }

    _preUpdatePre(context: GLESRenderContext3D) {
        this._compileShader(context);
        this.invertFront = this._getInvertFront();
    }

    private _getInvertFront(): boolean {
        let transform = this.owner?.transform;
        return transform ? transform._isFrontFaceInvert : false;
    }

    /**
     * render RenderElement
     * context:GLESRenderContext3D
     * @param renderqueue 
     */
    _render(context: IRenderContext3D): void {
        var forceInvertFace: boolean = context.invertY;
        var updateMark: number = context.cameraUpdateMask;
        var sceneShaderData = context.sceneData as WebShaderData;
        var cameraShaderData = context.cameraData as WebShaderData;
        if (this.isRender) {
            var passes: ShaderInstance[] = this.shaderInstances.elements;
            for (var j: number = 0, m: number = this.shaderInstances.length; j < m; j++) {
                const shaderIns: ShaderInstance = passes[j];
                if (!shaderIns.complete)
                    continue;
                var switchShader: boolean = shaderIns.bind();
                var switchUpdateMark: boolean = (updateMark !== shaderIns._uploadMark);
                var uploadScene: boolean = (shaderIns._uploadScene !== sceneShaderData) || switchUpdateMark;
                //Scene
                if (uploadScene || switchShader) {
                    sceneShaderData && shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, sceneShaderData, uploadScene);
                    shaderIns._uploadScene = sceneShaderData;
                }
                //render
                if (this.renderShaderData) {
                    var uploadSprite3D: boolean = (shaderIns._uploadRender !== this.renderShaderData) || switchUpdateMark;
                    if (uploadSprite3D || switchShader) {
                        shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this.renderShaderData, uploadSprite3D);
                        shaderIns._uploadRender = this.renderShaderData;
                    }
                }
                //camera
                var uploadCamera: boolean = shaderIns._uploadCameraShaderValue !== cameraShaderData || switchUpdateMark;
                if (uploadCamera || switchShader) {
                    cameraShaderData && shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderData, uploadCamera);
                    shaderIns._uploadCameraShaderValue = cameraShaderData;
                }
                //material
                var uploadMaterial: boolean = (shaderIns._uploadMaterial !== this.materialShaderData) || switchUpdateMark;
                if (uploadMaterial || switchShader) {
                    shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, this.materialShaderData, uploadMaterial);
                    shaderIns._uploadMaterial = this.materialShaderData;
                    //GlobalData
                    context.globalShaderData && shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap, context.globalShaderData, uploadMaterial);
                }
                //renderData update
                //TODO：Renderstate as a Object to less upload
                shaderIns.uploadRenderStateBlendDepth(this.materialShaderData);
                shaderIns.uploadRenderStateFrontFace(this.materialShaderData, forceInvertFace, this.invertFront);
                this.drawGeometry(shaderIns);
            }
        }
    }

    private _compileShader(context: GLESRenderContext3D) {
        var passes: ShaderPass[] = this.subShader._passes;
        this._clearShaderInstance();
        for (var j: number = 0, m: number = passes.length; j < m; j++) {
            var pass: ShaderPass = passes[j];
            //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
            if (pass._pipelineMode !== context.pipelineMode)
                continue;

            var comDef: DefineDatas = GLESRenderElementOBJ._compileDefine;

            if (context.sceneData) {
                context.sceneData._defineDatas.cloneTo(comDef);
            } else {
                context._globalConfigShaderData.cloneTo(comDef);
            }

            context.cameraData && comDef.addDefineDatas(context.cameraData._defineDatas);
            if (this.renderShaderData) {
                comDef.addDefineDatas(this.renderShaderData.getDefineData());
                pass.nodeCommonMap = this.owner._commonUniformMap;
            } else {
                pass.nodeCommonMap = null;
            }
            comDef.addDefineDatas(this.materialShaderData._defineDatas);
            var shaderIns: ShaderInstance = pass.withCompile(comDef);
            this._addShaderInstance(shaderIns);
        }
    }


    drawGeometry(shaderIns: ShaderInstance) {
        LayaGL.renderDrawContext.drawGeometryElement(this.geometry);
    }

    destroy() {
        this.geometry = null;
        this.shaderInstances = null;
        this.materialShaderData = null;
        this.renderShaderData = null;
        this.transform = null;
        this.isRender = null;
    }
}