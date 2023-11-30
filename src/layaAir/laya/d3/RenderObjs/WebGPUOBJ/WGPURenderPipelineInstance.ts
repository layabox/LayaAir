import { WGPUShaderVariable } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WGPUShaderVariable";
import { WebGPUEngine } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUEngine";
import { WebGPUInternalRT } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUInternalRT";
import { WebGPURenderCommandEncoder } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPURenderCommandEncoder";
import { WebGPUShaderInstance } from "../../../RenderEngine/RenderEngine/WebGPUEngine/WebGPUShaderInstance";
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";
import { IndexFormat } from "../../../RenderEngine/RenderEnum/IndexFormat";
import { MeshTopology } from "../../../RenderEngine/RenderEnum/RenderPologyMode";
import { RenderState } from "../../../RenderEngine/RenderShader/RenderState";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderData, ShaderDataType } from "../../../RenderEngine/RenderShader/ShaderData";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { UniformMapType } from "../../../RenderEngine/RenderShader/SubShader";
import { VertexAttributeLayout } from "../../../RenderEngine/VertexAttributeLayout";
import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { LayaGL } from "../../../layagl/LayaGL";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { WGPUShaderData } from "./WGPUShaderData";
import { WGPUBlendState, WGPUDepthStencilState, WGPUPrimitiveState, WGPURenderPipeline, WGPUVertexBufferLayouts } from "./WebGPURenderPipelineHelper";

export class WGPURenderPipelineInstance {
    cachePool: any;//cache renderpipeline
    engine: WebGPUEngine;
    /**@internal */
    private _shaderPass: ShaderCompileDefineBase | ShaderPass;
    /**@internal Shader Module */
    private _shaderInstance: WebGPUShaderInstance;
    /**@internal */
    _sceneUniformParamsMap: CommandEncoder = new CommandEncoder();
    /**@internal */
    _cameraUniformParamsMap: CommandEncoder = new CommandEncoder();
    /**@internal */
    _spriteUniformParamsMap: CommandEncoder = new CommandEncoder();
    /**@internal */
    _materialUniformParamsMap: CommandEncoder = new CommandEncoder();

    /**@internal */
    _uploadMark: number = -1;
    /**@internal */
    _uploadMaterial: ShaderData;
    /**@internal RenderIDTODO*/
    _uploadRender: any;
    /** @internal */
    _uploadRenderType: number = -1;
    /**@internal CamneraTOD*/
    _uploadCameraShaderValue: ShaderData;
    /**@internal SceneIDTODO*/
    _uploadScene: any;


    /**
     * 创建一个 <code>ShaderInstance</code> 实例。
     */
    constructor(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderCompileDefineBase) {
        this.engine = LayaGL.renderEngine as WebGPUEngine;
        this._shaderInstance = new WebGPUShaderInstance(this.engine);
        this._shaderInstance._WGSLShaderLanguageProcess3D(shaderProcessInfo.vs, shaderProcessInfo.ps);
        //temp test
        if (true) {
            this.testCreateSceneCommandEncoder();
            this.testCreateCameraCommandEncoder();
            this.testCreateSpriteCommandEncoder();
            this.testMaterialUniformParamsMap(shaderProcessInfo.uniformMap);
        }

        this._shaderPass = shaderPass;
        this.cachePool = {};
    }

    get complete(): boolean {
        //return this._renderShaderInstance._complete;
        return true
    }

    /**
     * @inheritDoc
     * @override
     */
    protected _disposeResource(): void {
        //TODO Destroy

    }

    /**
     * @internal
     */
    private _getRenderState(shaderDatas: any, stateIndex: number): any {
        //var stateID: any = SubShader.StateParamsMap[stateIndex];
        //return shaderDatas[stateID];
    }

    private _getData(key: number, data: any) {
        if (!data[key]) {
            data[key] = {};
        }
        return data[key];
    }

    bind() {
        return true; //return this._renderShaderInstance.bind();
    }

    getBlendState(shaderDatas: ShaderData): WGPUBlendState {
        var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
        var datas: any = shaderDatas.getData();
        var blend: any = this._getRenderState(datas, Shader3D.BLEND);
        renderState.blend != null ? blend = renderState.blend : 0;
        if ((<ShaderPass>this._shaderPass).statefirst) {
            renderState.blend != null ? blend = renderState.blend : 0;
        }
        else {
            blend = blend ?? renderState.blend;
        }
        blend = blend ?? RenderState.Default.blend;
        let blenstate: WGPUBlendState;
        //blend
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                blenstate = WGPUBlendState.getBlendState(blend);
                break;
            case RenderState.BLEND_ENABLE_ALL:
                var blendEquation: any = this._getRenderState(datas, Shader3D.BLEND_EQUATION);
                var srcBlend: any = this._getRenderState(datas, Shader3D.BLEND_SRC);
                var dstBlend: any = this._getRenderState(datas, Shader3D.BLEND_DST);
                if ((<ShaderPass>this._shaderPass).statefirst) {
                    renderState.blendEquation != null ? blendEquation = renderState.blendEquation : 0;
                    renderState.srcBlend != null ? srcBlend = renderState.srcBlend : 0;
                    renderState.dstBlend != null ? dstBlend = renderState.dstBlend : 0;
                }
                else {
                    blendEquation = blendEquation ?? renderState.blendEquation;
                    srcBlend = srcBlend ?? renderState.srcBlend;
                    dstBlend = dstBlend ?? renderState.dstBlend;
                }
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;
                blenstate = WGPUBlendState.getBlendState(blend, blendEquation, srcBlend, dstBlend, blendEquation, srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                var blendEquationRGB: any = this._getRenderState(datas, Shader3D.BLEND_EQUATION_RGB);
                var blendEquationAlpha: any = this._getRenderState(datas, Shader3D.BLEND_EQUATION_ALPHA);
                var srcRGB: any = this._getRenderState(datas, Shader3D.BLEND_SRC_RGB);
                var dstRGB: any = this._getRenderState(datas, Shader3D.BLEND_DST_RGB);
                var srcAlpha: any = this._getRenderState(datas, Shader3D.BLEND_SRC_ALPHA);
                var dstAlpha: any = this._getRenderState(datas, Shader3D.BLEND_DST_ALPHA);
                if ((<ShaderPass>this._shaderPass).statefirst) {
                    renderState.blendEquationRGB != null ? blendEquationRGB = renderState.blendEquationRGB : 0;
                    renderState.blendEquationAlpha != null ? blendEquationAlpha = renderState.blendEquationAlpha : 0;
                    renderState.srcBlendRGB != null ? srcRGB = renderState.srcBlendRGB : 0;
                    renderState.dstBlendRGB != null ? dstRGB = renderState.dstBlendRGB : 0;
                    renderState.srcBlendAlpha != null ? srcAlpha = renderState.srcBlendAlpha : 0;
                    renderState.dstBlendAlpha != null ? dstAlpha = renderState.dstBlendAlpha : 0;
                }
                else {
                    blendEquationRGB = blendEquationRGB ?? renderState.blendEquationRGB;
                    blendEquationAlpha = blendEquationAlpha ?? renderState.blendEquationAlpha;
                    srcRGB = srcRGB ?? renderState.srcBlendRGB;
                    dstRGB = dstRGB ?? renderState.dstBlendRGB;
                    srcAlpha = srcAlpha ?? renderState.srcBlendAlpha;
                    dstAlpha = dstAlpha ?? renderState.dstBlendAlpha;
                }

                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;
                blenstate = WGPUBlendState.getBlendState(blend, blendEquationRGB, srcRGB, dstRGB, blendEquationAlpha, srcAlpha, dstAlpha);
                break;
        }
        return blenstate;
    }

    /**
     * Blend depthStencil
     * @internal
     */
    getDepthStencilState(shaderDatas: ShaderData, depthTexture: WebGPUInternalRT): WGPUDepthStencilState {
        var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
        var datas: any = shaderDatas.getData();
        var depthWrite: any = this._getRenderState(datas, Shader3D.DEPTH_WRITE);
        var depthTest: any = this._getRenderState(datas, Shader3D.DEPTH_TEST);
        //var blend: any = this._getRenderState(datas, Shader3D.RENDER_STATE_BLEND);
        var stencilRef: any = this._getRenderState(datas, Shader3D.STENCIL_Ref);
        var stencilTest: any = this._getRenderState(datas, Shader3D.STENCIL_TEST);
        var stencilWrite: any = this._getRenderState(datas, Shader3D.STENCIL_WRITE);
        var stencilOp: any = this._getRenderState(datas, Shader3D.STENCIL_Op);
        if ((<ShaderPass>this._shaderPass).statefirst) {
            renderState.depthWrite != null ? depthWrite = renderState.depthWrite : 0;
            renderState.depthTest != null ? depthTest = renderState.depthTest : 0;
            //renderState.blend != null ? blend = renderState.blend : 0;
            renderState.stencilRef != null ? stencilRef = renderState.stencilRef : 0;
            renderState.stencilTest != null ? stencilTest = renderState.stencilTest : 0;
            renderState.stencilWrite != null ? stencilWrite = renderState.stencilWrite : 0;
            renderState.stencilOp != null ? stencilOp = renderState.stencilOp : 0;
        }
        else {
            depthWrite = depthWrite ?? renderState.depthWrite;
            depthTest = depthTest ?? renderState.depthTest;
            //blend = blend ?? renderState.blend;
            stencilRef = stencilRef ?? renderState.stencilRef;
            stencilTest = stencilTest ?? renderState.stencilTest;
            stencilWrite = stencilWrite ?? renderState.stencilWrite;
            stencilOp = stencilOp ?? renderState.stencilOp;
        }

        depthWrite = depthWrite ?? RenderState.Default.depthWrite;
        depthTest = depthTest ?? RenderState.Default.depthTest;
        //blend = blend ?? RenderState.Default.blend;
        stencilRef = stencilRef ?? RenderState.Default.stencilRef;
        stencilTest = stencilTest ?? RenderState.Default.stencilTest;
        stencilWrite = stencilWrite ?? RenderState.Default.stencilWrite;
        stencilOp = stencilOp ?? RenderState.Default.stencilOp;
        return WGPUDepthStencilState.getDepthStencilState(depthTexture.depthStencilFormat, depthTest === RenderState.DEPTHTEST_OFF, depthTest);
    }

    /**
     * Primitive State
     * @internal
     */
    getPrimitiveState(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean, mode: MeshTopology, indexformat: IndexFormat): WGPUPrimitiveState {
        var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
        var datas: any = shaderDatas.getData();
        var cull: any = this._getRenderState(datas, Shader3D.CULL);
        if ((<ShaderPass>this._shaderPass).statefirst) {
            cull = renderState.cull ?? cull;
        }
        cull = cull ?? RenderState.Default.cull;

        var forntFace: CullMode = CullMode.Off;
        switch (cull) {
            case RenderState.CULL_NONE:
                forntFace = CullMode.Off;
                break;
            case RenderState.CULL_FRONT:
                if (isTarget == invertFront)
                    forntFace = CullMode.Front;//gl.CCW
                else
                    forntFace = CullMode.Back;
                break;
            case RenderState.CULL_BACK:
                if (isTarget != invertFront)
                    forntFace = CullMode.Front;//gl.CCW
                else
                    forntFace = CullMode.Back;
                break;
        }
        return WGPUPrimitiveState.getPrimitiveState(mode, indexformat, forntFace, false);
    }

    /**
     * WGPU VertexBuffer Layouts
     * @param vertexLayout 
     * @returns 
     */
    getVertexAttributeLayout(vertexLayout: VertexAttributeLayout): WGPUVertexBufferLayouts {
        return WGPUVertexBufferLayouts.getVertexBufferLayouts(vertexLayout);
    }

    /**
     * Render Pipeline 
     * @param blendState 
     * @param depthStencilState 
     * @param primitiveState 
     * @param vertexBufferLayouts 
     * @param destTexture 
     * @returns 
     */
    getGPURenderPipeline(blendState: WGPUBlendState, depthStencilState: WGPUDepthStencilState, primitiveState: WGPUPrimitiveState, vertexBufferLayouts: WGPUVertexBufferLayouts, destTexture: WebGPUInternalRT): WGPURenderPipeline {
        //相同shader代码，接受不同渲染状态，产生不同RenderPipeline
        let data = this._getData(blendState.mapId, this.cachePool);
        data = this._getData(depthStencilState.mapId, data);
        data = this._getData(primitiveState.mapId, data);
        data = this._getData(vertexBufferLayouts.mapID, data);
        let pipline = data[destTexture.colorFormat];
        if (!pipline) {
            //engine TODO
            pipline = data[destTexture.colorFormat] = new WGPURenderPipeline(this.engine,
                this._shaderInstance.getWGPUPipelineLayout(),
                this._shaderInstance.getVertexModule(),
                this._shaderInstance.getFragmentModule(),
                vertexBufferLayouts, destTexture, blendState, depthStencilState, primitiveState);
        }
        return pipline;
    }

    /**
     * update Uniform Data
     * @param WGPURenderCommand 
     */
    uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: WGPUShaderData, renderEncoder: WebGPURenderCommandEncoder) {
        var shaderUniforms: WGPUShaderVariable[] = shaderUniform.getArrayData() as WGPUShaderVariable[];
        shaderDatas.updateBindGroup();
        for (var i: number = 0, n: number = shaderUniforms.length; i < n; i++) {
            let shaderVariable = shaderUniforms[i];
            renderEncoder.setBindGroup(shaderVariable.location, shaderDatas.getBindGroup(shaderVariable));//TODO 需要优化
        }
    }










    //test Create Scene CommandEncoder
    private testCreateSceneCommandEncoder() {
        let uniformmap = LayaGL.renderOBJCreate.createGlobalUniformMap("testScene");
        //uniformmap.addShaderUniform(Shader3D.propertyNameToID("u_Time"), "u_Time", ShaderDataType.Float);
        this._shaderInstance.applyBindGroupLayout(uniformmap, this._sceneUniformParamsMap);
    }

    private testCreateCameraCommandEncoder() {
        let uniformmap = LayaGL.renderOBJCreate.createGlobalUniformMap("testCamera");
        uniformmap.addShaderUniform(Shader3D.propertyNameToID("u_ViewProjection"), "u_ViewProjection", ShaderDataType.Matrix4x4);
        this._shaderInstance.applyBindGroupLayout(uniformmap, this._cameraUniformParamsMap);
    }

    private testCreateSpriteCommandEncoder() {
        let uniformmap = LayaGL.renderOBJCreate.createGlobalUniformMap("testSprite3D");
        uniformmap.addShaderUniform(Shader3D.propertyNameToID("u_WorldMat"), "u_WorldMat", ShaderDataType.Matrix4x4);
        this._shaderInstance.applyBindGroupLayout(uniformmap, this._spriteUniformParamsMap);
    }

    private testMaterialUniformParamsMap(uniformMap: UniformMapType) {
        let destuniformMap: { [name: string]: ShaderDataType } = {};
        for (const key in uniformMap) {
            if (typeof uniformMap[key] == "object") {
                let block = <{ [uniformName: string]: ShaderDataType }>(uniformMap[key]);
                //let blockUniformMap = new Map<string, UniformBufferParamsType>();
                for (const uniformName in block) {
                    destuniformMap[uniformName] = block[uniformName];
                }
            }
            else {
                let unifromType = <ShaderDataType>uniformMap[key];
                destuniformMap[key] = unifromType;
            }
        }
        this._shaderInstance.applyBindGroupLayoutByUniformMap(destuniformMap, this._materialUniformParamsMap);
    }
}