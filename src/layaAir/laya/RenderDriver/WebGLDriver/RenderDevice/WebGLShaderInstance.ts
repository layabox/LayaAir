
import { CullMode } from "../../../RenderEngine/RenderEnum/CullMode";
import { GLSLCodeGenerator } from "../../../RenderEngine/RenderShader/GLSLCodeGenerator";
import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D";
import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass";
import { ShaderVariable } from "../../../RenderEngine/RenderShader/ShaderVariable";
import { RenderStateContext } from "../../../RenderEngine/RenderStateContext";
import { CommandEncoder } from "../../../layagl/CommandEncoder";
import { LayaGL } from "../../../layagl/LayaGL";
import { Stat } from "../../../utils/Stat";
import { ShaderCompileDefineBase, ShaderProcessInfo } from "../../../webgl/utils/ShaderCompileDefineBase";
import { IShaderInstance } from "../../DriverDesign/RenderDevice/IShaderInstance";
import { RenderState } from "../../RenderModuleData/Design/RenderState";
import { ShaderData } from "../../DriverDesign/RenderDevice/ShaderData";
import { WebGLCommandUniformMap } from "./WebGLCommandUniformMap";
import { WebGLEngine } from "./WebGLEngine";
import { GLShaderInstance } from "./WebGLEngine/GLShaderInstance";
import { WebGLShaderData } from "../../RenderModuleData/WebModuleData/WebGLShaderData";
import { GPUEngineStatisticsInfo } from "../../../RenderEngine/RenderEnum/RenderStatInfo";

/**
 * <code>ShaderInstance</code> 类用于实现ShaderInstance。
 */
export class WebGLShaderInstance implements IShaderInstance {
    /**@internal */
    private _shaderPass: ShaderCompileDefineBase | ShaderPass;

    private _renderShaderInstance: GLShaderInstance;

    /**@internal */
    _sceneUniformParamsMap: CommandEncoder;
    /**@internal */
    _cameraUniformParamsMap: CommandEncoder;
    /**@internal */
    _spriteUniformParamsMap: CommandEncoder;
    /**@internal */
    _materialUniformParamsMap: CommandEncoder;
    /**@internal */
    _sprite2DUniformParamsMap: CommandEncoder;
    /**@internal */
    private _customUniformParamsMap: any[] = [];

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
    _uploadScene: ShaderData;

    /**
     * 创建一个 <code>ShaderInstance</code> 实例。
     */
    constructor() {
    }
    _serializeShader(): ArrayBuffer {
        //TODO
        return null
    }
    _deserialize(buffer: ArrayBuffer): boolean {
        //TODO
        return false;
    }

    /**
     * get complete
     */
    get complete(): boolean {
        return this._renderShaderInstance._complete;
    }

    _create(shaderProcessInfo: ShaderProcessInfo, shaderPass: ShaderPass): void {
        let shaderObj = GLSLCodeGenerator.GLShaderLanguageProcess3D(shaderProcessInfo.defineString, shaderProcessInfo.attributeMap, shaderProcessInfo.uniformMap, shaderProcessInfo.vs, shaderProcessInfo.ps);
        this._renderShaderInstance = WebGLEngine.instance.createShaderInstance(shaderObj.vs, shaderObj.fs, shaderProcessInfo.attributeMap);
        if (this._renderShaderInstance._complete) {
            this._shaderPass = shaderPass;
            shaderProcessInfo.is2D ? this._create2D() : this._create3D();
        }
    }

    /**
     * @internal
     */
    protected _create3D(): void {
        this._sceneUniformParamsMap = new CommandEncoder();
        this._cameraUniformParamsMap = new CommandEncoder();
        this._spriteUniformParamsMap = new CommandEncoder();
        this._materialUniformParamsMap = new CommandEncoder();
        const sceneParams = LayaGL.renderDeviceFactory.createGlobalUniformMap("Scene3D") as WebGLCommandUniformMap;
        //const spriteParms = LayaGL.renderOBJCreate.createGlobalUniformMap("Sprite3D");//分开，根据不同的Render
        const cameraParams = LayaGL.renderDeviceFactory.createGlobalUniformMap("BaseCamera") as WebGLCommandUniformMap;
        const customParams = LayaGL.renderDeviceFactory.createGlobalUniformMap("Custom") as WebGLCommandUniformMap;
        let i, n;
        let data: ShaderVariable[] = this._renderShaderInstance.getUniformMap();
        for (i = 0, n = data.length; i < n; i++) {
            let one: ShaderVariable = data[i];
            if (sceneParams.hasPtrID(one.dataOffset)) {
                this._sceneUniformParamsMap.addShaderUniform(one);
            } else if (cameraParams.hasPtrID(one.dataOffset)) {
                this._cameraUniformParamsMap.addShaderUniform(one);
            } else if (this.hasSpritePtrID(one.dataOffset)) {
                this._spriteUniformParamsMap.addShaderUniform(one);
            } else if (customParams.hasPtrID(one.dataOffset)) {
                this._customUniformParamsMap || (this._customUniformParamsMap = []);
                this._customUniformParamsMap[one.dataOffset] = one;
            } else {
                this._materialUniformParamsMap.addShaderUniform(one);
            }
        }
    }

    /**
     * @internal
     */
    protected _create2D(): void {
        this._sprite2DUniformParamsMap = new CommandEncoder();
        this._materialUniformParamsMap = new CommandEncoder();
        this._sceneUniformParamsMap = new CommandEncoder();
        const scene2DParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("scene2D") as WebGLCommandUniformMap;
        //const sprite2DParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2D") as WebGLCommandUniformMap;//分开，根据不同的Render
        const sceneParms = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite2DGlobal") as WebGLCommandUniformMap;//分开，根据不同的Render
        let i, n;
        let data: ShaderVariable[] = this._renderShaderInstance.getUniformMap();
        for (i = 0, n = data.length; i < n; i++) {
            let one: ShaderVariable = data[i];
            if (scene2DParms.hasPtrID(one.dataOffset)) {
                this._sceneUniformParamsMap.addShaderUniform(one);
            }
            else if (this.hasSpritePtrID(one.dataOffset)) {
                this._sprite2DUniformParamsMap.addShaderUniform(one);
            } else if (sceneParms.hasPtrID(one.dataOffset)) {
                this._sceneUniformParamsMap.addShaderUniform(one);
            }
            else {
                this._materialUniformParamsMap.addShaderUniform(one);
            }
        }
    }

    private hasSpritePtrID(dataOffset: number): boolean {
        let commap = this._shaderPass.nodeCommonMap;
        if (!commap) {
            return false;
        } else {
            for (let i = 0, n = commap.length; i < n; i++) {
                if ((LayaGL.renderDeviceFactory.createGlobalUniformMap(commap[i]) as WebGLCommandUniformMap).hasPtrID(dataOffset))
                    return true;
            }
            return false;
        }
    }

    /**
     * @inheritDoc
     * @override
     */
    _disposeResource(): void {
        this._renderShaderInstance.destroy();
        this._sceneUniformParamsMap = null;
        this._cameraUniformParamsMap = null;
        this._spriteUniformParamsMap = null;
        this._materialUniformParamsMap = null
        this._customUniformParamsMap = null;

        this._uploadMaterial = null;
        this._uploadRender = null;
        this._uploadCameraShaderValue = null;
        this._uploadScene = null;
    }

    /**
     * apply shader programe
     * @returns 
     */
    bind() {
        return this._renderShaderInstance.bind();
    }

    /**
     * upload uniform data
     * @param shaderUniform 
     * @param shaderDatas 
     * @param uploadUnTexture 
     */
    uploadUniforms(shaderUniform: CommandEncoder, shaderDatas: WebGLShaderData, uploadUnTexture: boolean) {
        WebGLEngine.instance._addStatisticsInfo(GPUEngineStatisticsInfo.C_UniformBufferUploadCount, WebGLEngine.instance.uploadUniforms(this._renderShaderInstance, shaderUniform, shaderDatas, uploadUnTexture));
    }

    /**
     * set blend depth stencil RenderState
     * @param shaderDatas 
     */
    uploadRenderStateBlendDepth(shaderDatas: WebGLShaderData): void {
        if ((<ShaderPass>this._shaderPass).statefirst)
            this.uploadRenderStateBlendDepthByShader(shaderDatas);
        else
            this.uploadRenderStateBlendDepthByMaterial(shaderDatas);
    }

    /**
     * set blend depth stencil RenderState frome Shader
     * @param shaderDatas 
     */
    uploadRenderStateBlendDepthByShader(shaderDatas: WebGLShaderData) {
        var datas: any = shaderDatas._data;
        var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
        var depthWrite: any = (renderState.depthWrite ?? datas[Shader3D.DEPTH_WRITE]) ?? RenderState.Default.depthWrite;
        RenderStateContext.setDepthMask(depthWrite);
        var depthTest: any = (renderState.depthTest ?? datas[Shader3D.DEPTH_TEST]) ?? RenderState.Default.depthTest;
        if (depthTest == RenderState.DEPTHTEST_OFF)
            RenderStateContext.setDepthTest(false);
        else {
            RenderStateContext.setDepthTest(true);
            RenderStateContext.setDepthFunc(depthTest);
        }
        //Stencil
        var stencilWrite: any = (renderState.stencilWrite ?? datas[Shader3D.STENCIL_WRITE]) ?? RenderState.Default.stencilWrite;
        var stencilTest: any = (renderState.stencilTest ?? datas[Shader3D.STENCIL_TEST]) ?? RenderState.Default.stencilTest;
        RenderStateContext.setStencilMask(stencilWrite);
        if (stencilWrite) {
            var stencilOp: any = (renderState.stencilOp ?? datas[Shader3D.STENCIL_Op]) ?? RenderState.Default.stencilOp;
            RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        }
        if (stencilTest == RenderState.STENCILTEST_OFF) {
            RenderStateContext.setStencilTest(false);
        }
        else {
            var stencilRef: any = (renderState.stencilRef ?? datas[Shader3D.STENCIL_Ref]) ?? RenderState.Default.stencilRef;
            RenderStateContext.setStencilTest(true);
            RenderStateContext.setStencilFunc(stencilTest, stencilRef);
        }
        //blend
        var blend: any = (renderState.blend ?? datas[Shader3D.BLEND]) ?? RenderState.Default.blend;
        switch (blend) {
            case RenderState.BLEND_DISABLE:
                RenderStateContext.setBlend(false);
                break;
            case RenderState.BLEND_ENABLE_ALL:
                var blendEquation: any = (renderState.blendEquation ?? datas[Shader3D.BLEND_EQUATION]) ?? RenderState.Default.blendEquation;
                var srcBlend: any = (renderState.srcBlend ?? datas[Shader3D.BLEND_SRC]) ?? RenderState.Default.srcBlend;
                var dstBlend: any = (renderState.dstBlend ?? datas[Shader3D.BLEND_DST]) ?? RenderState.Default.dstBlend;
                RenderStateContext.setBlend(true);
                RenderStateContext.setBlendEquation(blendEquation);
                RenderStateContext.setBlendFunc(srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                var blendEquationRGB: any = (renderState.blendEquationRGB ?? datas[Shader3D.BLEND_EQUATION_RGB]) ?? RenderState.Default.blendEquationRGB;
                var blendEquationAlpha: any = (renderState.blendEquationAlpha ?? datas[Shader3D.BLEND_EQUATION_ALPHA]) ?? RenderState.Default.blendEquationAlpha;
                var srcRGB: any = (renderState.srcBlendRGB ?? datas[Shader3D.BLEND_SRC_RGB]) ?? RenderState.Default.srcBlendRGB;
                var dstRGB: any = (renderState.dstBlendRGB ?? datas[Shader3D.BLEND_DST_RGB]) ?? RenderState.Default.dstBlendRGB;
                var srcAlpha: any = (renderState.srcBlendAlpha ?? datas[Shader3D.BLEND_SRC_ALPHA]) ?? RenderState.Default.srcBlendAlpha;
                var dstAlpha: any = (renderState.dstBlendAlpha ?? datas[Shader3D.BLEND_DST_ALPHA]) ?? RenderState.Default.dstBlendAlpha;
                RenderStateContext.setBlend(true);
                RenderStateContext.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
                RenderStateContext.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
                break;
        }
    }

    /**
     * set blend depth stencil RenderState frome Material
     * @param shaderDatas 
     */
    uploadRenderStateBlendDepthByMaterial(shaderDatas: ShaderData) {
        var datas: any = shaderDatas.getData();

        // depth
        var depthWrite: any = datas[Shader3D.DEPTH_WRITE];
        depthWrite = depthWrite ?? RenderState.Default.depthWrite;
        RenderStateContext.setDepthMask(depthWrite);

        var depthTest: any = datas[Shader3D.DEPTH_TEST];
        depthTest = depthTest ?? RenderState.Default.depthTest;
        if (depthTest === RenderState.DEPTHTEST_OFF) {
            RenderStateContext.setDepthTest(false);
        }
        else {
            RenderStateContext.setDepthTest(true);
            RenderStateContext.setDepthFunc(depthTest);
        }

        //Stencil
        var stencilWrite: any = datas[Shader3D.STENCIL_WRITE];
        stencilWrite = stencilWrite ?? RenderState.Default.stencilWrite;
        RenderStateContext.setStencilMask(stencilWrite);
        if (stencilWrite) {
            var stencilOp: any = datas[Shader3D.STENCIL_Op];
            stencilOp = stencilOp ?? RenderState.Default.stencilOp;
            RenderStateContext.setstencilOp(stencilOp.x, stencilOp.y, stencilOp.z);
        }

        var stencilTest: any = datas[Shader3D.STENCIL_TEST];
        stencilTest = stencilTest ?? RenderState.Default.stencilTest;
        if (stencilTest == RenderState.STENCILTEST_OFF) {
            RenderStateContext.setStencilTest(false);
        }
        else {
            var stencilRef: any = datas[Shader3D.STENCIL_Ref];
            stencilRef = stencilRef ?? RenderState.Default.stencilRef;
            RenderStateContext.setStencilTest(true);
            RenderStateContext.setStencilFunc(stencilTest, stencilRef);
        }

        //blend
        var blend: any = datas[Shader3D.BLEND];
        blend = blend ?? RenderState.Default.blend;
        switch (blend) {
            case RenderState.BLEND_ENABLE_ALL:
                var blendEquation: any = datas[Shader3D.BLEND_EQUATION];
                blendEquation = blendEquation ?? RenderState.Default.blendEquation;
                var srcBlend: any = datas[Shader3D.BLEND_SRC];
                srcBlend = srcBlend ?? RenderState.Default.srcBlend;
                var dstBlend: any = datas[Shader3D.BLEND_DST];
                dstBlend = dstBlend ?? RenderState.Default.dstBlend;
                RenderStateContext.setBlend(true);
                RenderStateContext.setBlendEquation(blendEquation);
                RenderStateContext.setBlendFunc(srcBlend, dstBlend);
                break;
            case RenderState.BLEND_ENABLE_SEPERATE:
                var blendEquationRGB: any = datas[Shader3D.BLEND_EQUATION_RGB];
                blendEquationRGB = blendEquationRGB ?? RenderState.Default.blendEquationRGB;

                var blendEquationAlpha: any = datas[Shader3D.BLEND_EQUATION_ALPHA];
                blendEquationAlpha = blendEquationAlpha ?? RenderState.Default.blendEquationAlpha;

                var srcRGB: any = datas[Shader3D.BLEND_SRC_RGB];
                srcRGB = srcRGB ?? RenderState.Default.srcBlendRGB;

                var dstRGB: any = datas[Shader3D.BLEND_DST_RGB];
                dstRGB = dstRGB ?? RenderState.Default.dstBlendRGB;

                var srcAlpha: any = datas[Shader3D.BLEND_SRC_ALPHA];
                srcAlpha = srcAlpha ?? RenderState.Default.srcBlendAlpha;

                var dstAlpha: any = datas[Shader3D.BLEND_DST_ALPHA];
                dstAlpha = dstAlpha ?? RenderState.Default.dstBlendAlpha;

                RenderStateContext.setBlend(true);
                RenderStateContext.setBlendEquationSeparate(blendEquationRGB, blendEquationAlpha);
                RenderStateContext.setBlendFuncSeperate(srcRGB, dstRGB, srcAlpha, dstAlpha);
                break;
            case RenderState.BLEND_DISABLE:
            default:
                RenderStateContext.setBlend(false);
                break;
        }
    }


    /**
     * @internal
     */
    uploadRenderStateFrontFace(shaderDatas: ShaderData, isTarget: boolean, invertFront: boolean): void {
        var renderState: RenderState = (<ShaderPass>this._shaderPass).renderState;
        var datas: any = shaderDatas.getData();
        var cull: any = datas[Shader3D.CULL];
        if ((<ShaderPass>this._shaderPass).statefirst) {
            cull = renderState.cull ?? cull;
        }
        cull = cull ?? RenderState.Default.cull;
        var forntFace: number;
        switch (cull) {
            case RenderState.CULL_NONE:
                RenderStateContext.setCullFace(false);
                if (isTarget != invertFront)
                    forntFace = CullMode.Front;//gl.CCW
                else
                    forntFace = CullMode.Back;
                RenderStateContext.setFrontFace(forntFace);
                break;
            case RenderState.CULL_FRONT:
                RenderStateContext.setCullFace(true);
                if (isTarget == invertFront)
                    forntFace = CullMode.Front;//gl.CCW
                else
                    forntFace = CullMode.Back;
                RenderStateContext.setFrontFace(forntFace);
                break;
            case RenderState.CULL_BACK:
            default:
                RenderStateContext.setCullFace(true);
                if (isTarget != invertFront)
                    forntFace = CullMode.Front;//gl.CCW
                else
                    forntFace = CullMode.Back;
                RenderStateContext.setFrontFace(forntFace);
                break;
        }
    }

    /**
     * @internal
     */
    uploadCustomUniform(index: number, data: any): void {
        WebGLEngine.instance.uploadCustomUniforms(this._renderShaderInstance, this._customUniformParamsMap, index, data);
    }
}

