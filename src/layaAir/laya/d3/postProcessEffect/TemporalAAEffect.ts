import TemporalAAVS from "./shader/TemporalAA/TemporalAA.vs";
import TemporalAAFS from "./shader/TemporalAA/TemporalAA.fs";
import TemporalAACopyFS from "./shader/TemporalAA/Copy.fs";
import TemporalAASharpenFS from "./shader/TemporalAA/RCAS.fs";
import { Laya } from "../../../Laya";
import { LayaGL } from "../../layagl/LayaGL";
import { Vector2 } from "../../maths/Vector2";
import { Vector4 } from "../../maths/Vector4";
import { ShaderData, ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDefine } from "../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { RenderTargetFormat } from "../../RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D, ShaderFeatureType } from "../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { DepthTextureMode } from "../../resource/RenderTexture";
import { PostProcessEffect } from "../core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "../core/render/postProcessBase/PostProcessRenderContext";

/** 时域抗锯齿质量，对应 Unity URP 17.3。 */
export enum TemporalAAQuality {
    VeryLow,
    Low,
    Medium,
    High,
    VeryHigh
}

/** 相机时域抗锯齿：调色前混合历史，后期处理后执行 RCAS 锐化，锐化结果不进入历史。 */
export class TemporalAAEffect extends PostProcessEffect {
    private static _initialized: boolean = false;
    private static _historyTexture: number;
    private static _motionTexture: number;
    private static _depthTexture: number;
    private static _params: number;
    private static _screenYSign: number;
    private static _inverseViewProjection: number;
    private static _viewProjection: number;
    private static _previousViewProjection: number;
    private static _filterWeights0: number;
    private static _filterWeights1: number;
    private static _filterWeights2: number;
    private static _rcasSharpness: number;
    private static _lowPrecision: ShaderDefine;
    private static readonly _copyPass: number = 5;
    private static readonly _sharpenPass: number = 6;
    private static readonly _filterOffsets: readonly (readonly number[])[] = [
        [0, 0], [0, 1], [1, 0], [-1, 0], [0, -1],
        [-1, 1], [1, -1], [1, 1], [-1, -1]
    ];

    /** @internal */
    static init(): void {
        if (TemporalAAEffect._initialized)
            return;
        TemporalAAEffect._initialized = true;
        TemporalAAEffect._historyTexture = Shader3D.propertyNameToID("u_TaaHistoryTex");
        TemporalAAEffect._motionTexture = Shader3D.propertyNameToID("u_TaaMotionTex");
        TemporalAAEffect._depthTexture = Shader3D.propertyNameToID("u_TaaDepthTex");
        TemporalAAEffect._params = Shader3D.propertyNameToID("u_TaaParams");
        TemporalAAEffect._screenYSign = Shader3D.propertyNameToID("u_TaaScreenYSign");
        TemporalAAEffect._inverseViewProjection = Shader3D.propertyNameToID("u_TaaResolveInvViewProjection");
        TemporalAAEffect._viewProjection = Shader3D.propertyNameToID("u_TaaResolveViewProjection");
        TemporalAAEffect._previousViewProjection = Shader3D.propertyNameToID("u_TaaResolvePreviousViewProjection");
        TemporalAAEffect._filterWeights0 = Shader3D.propertyNameToID("u_TaaFilterWeights0");
        TemporalAAEffect._filterWeights1 = Shader3D.propertyNameToID("u_TaaFilterWeights1");
        TemporalAAEffect._filterWeights2 = Shader3D.propertyNameToID("u_TaaFilterWeights2");
        TemporalAAEffect._rcasSharpness = Shader3D.propertyNameToID("u_TaaRcasSharpness");
        TemporalAAEffect._lowPrecision = Shader3D.getDefineByName("TAA_LOW_PRECISION_SOURCE");

        const attributeMap = {
            a_PositionTexcoord: [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4]
        };
        const uniformMap = {
            u_MainTex: ShaderDataType.Texture2D,
            u_MainTex_TexelSize: ShaderDataType.Vector4,
            u_OffsetScale: ShaderDataType.Vector4,
            u_TaaHistoryTex: ShaderDataType.Texture2D,
            u_TaaMotionTex: ShaderDataType.Texture2D,
            u_TaaDepthTex: ShaderDataType.Texture2D,
            u_TaaParams: ShaderDataType.Vector4,
            u_TaaScreenYSign: ShaderDataType.Float,
            u_TaaResolveInvViewProjection: ShaderDataType.Matrix4x4,
            u_TaaResolveViewProjection: ShaderDataType.Matrix4x4,
            u_TaaResolvePreviousViewProjection: ShaderDataType.Matrix4x4,
            u_TaaFilterWeights0: ShaderDataType.Vector4,
            u_TaaFilterWeights1: ShaderDataType.Vector4,
            u_TaaFilterWeights2: ShaderDataType.Vector4,
            u_TaaRcasSharpness: ShaderDataType.Float
        };
        const shader = Shader3D.add("TemporalAA");
        shader.shaderType = ShaderFeatureType.PostProcess;
        const qualityArguments = ["0, 0, 0, 0", "0, 1, 1, 0", "2, 2, 1, 0", "2, 2, 2, 0"];
        for (let quality = 0; quality <= TemporalAAQuality.VeryHigh; quality++) {
            let resolve: string;
            if (quality === TemporalAAQuality.VeryHigh) {
                resolve = "#ifdef TAA_LOW_PRECISION_SOURCE\n    gl_FragColor = taaResolve(uv, 2, 2, 2, 1);\n#else\n    gl_FragColor = taaResolve(uv, 3, 2, 2, 1);\n#endif";
            } else {
                resolve = "gl_FragColor = taaResolve(uv, " + qualityArguments[quality] + ");";
            }
            const rgbDefine = quality <= TemporalAAQuality.Low ? "#define TAA_USE_RGB\n" : "";
            // 预处理标记用于检测质量分支替换失败。
            TemporalAAEffect._addPass(shader, attributeMap, uniformMap, rgbDefine + TemporalAAFS.replace("#error TAA_RESOLVE_NOT_SPECIALIZED", resolve));
        }
        TemporalAAEffect._addPass(shader, attributeMap, uniformMap, TemporalAACopyFS);
        TemporalAAEffect._addPass(shader, attributeMap, uniformMap, TemporalAASharpenFS);
    }

    private static _addPass(shader: Shader3D, attributeMap: any, uniformMap: any, fragment: string): void {
        const subShader = new SubShader(attributeMap, uniformMap);
        shader.addSubShader(subShader);
        const pass = subShader.addShaderPass(TemporalAAVS, fragment);
        pass.statefirst = true;
        pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        pass.renderState.depthWrite = false;
        pass.renderState.cull = RenderState.CULL_NONE;
        pass.renderState.blend = RenderState.BLEND_DISABLE;
    }

    private _shader: Shader3D;
    private _paramsValue: Vector4 = new Vector4();
    private _weights: number[] = new Array(9);
    private _weights0: Vector4 = new Vector4();
    private _weights1: Vector4 = new Vector4();
    private _weights2: Vector4 = new Vector4();

    getCameraDepthTextureModeFlag(): DepthTextureMode {
        return DepthTextureMode.Depth;
    }

    private _setFilterWeights(shaderData: ShaderData, jitter: Vector2): void {
        let sum = 0;
        for (let i = 0; i < 9; i++) {
            const offset = TemporalAAEffect._filterOffsets[i];
            const x = offset[0] - jitter.x;
            const y = offset[1] - jitter.y;
            const weight = Math.exp((-0.5 / 0.22) * (x * x + y * y));
            this._weights[i] = weight;
            sum += weight;
        }
        for (let i = 0; i < 9; i++)
            this._weights[i] /= sum;
        const weights = this._weights;
        this._weights0.setValue(weights[0], weights[1], weights[2], weights[3]);
        this._weights1.setValue(weights[4], weights[5], weights[6], weights[7]);
        this._weights2.setValue(weights[8], 0, 0, 0);
        shaderData.setVector(TemporalAAEffect._filterWeights0, this._weights0);
        shaderData.setVector(TemporalAAEffect._filterWeights1, this._weights1);
        shaderData.setVector(TemporalAAEffect._filterWeights2, this._weights2);
    }

    /** @internal 混合到目标纹理，并保存未锐化的历史。 */
    _renderTAA(context: PostProcessRenderContext): void {
        const camera = context.camera;
        const cameraData = camera._taa;
        const state = cameraData?.preparedHistory;
        if (!state || !camera.depthTexture || camera.depthTexture.destroyed || !context.indirectTarget || !context.destination)
            return;
        TemporalAAEffect.init();
        this._shader ||= Shader3D.find("TemporalAA");
        const shaderData = state.resolveData;
        const isNewFrame = state.frameIndex !== state.preparedFrameIndex;
        // 同帧重复渲染时，不复用首次渲染写入的历史。
        const useHistory = state.valid && isNewFrame && cameraData.newFrame;
        this._paramsValue.setValue(useHistory ? 0.1 : 1, 0.9, useHistory ? 1 : 0, useHistory ? 1 : 0);
        shaderData.setVector(TemporalAAEffect._params, this._paramsValue);
        shaderData.setNumber(TemporalAAEffect._screenYSign, LayaGL.renderEngine._screenInvertY ? -1 : 1);
        shaderData.setTexture(TemporalAAEffect._historyTexture, state.texture);
        shaderData.setTexture(TemporalAAEffect._motionTexture, camera.getOpaqueAuxiliaryTexture(3));
        shaderData.setTexture(TemporalAAEffect._depthTexture, camera.depthTexture);
        shaderData.setMatrix4x4(TemporalAAEffect._inverseViewProjection, cameraData.invViewProjection);
        shaderData.setMatrix4x4(TemporalAAEffect._viewProjection, cameraData.viewProjection);
        shaderData.setMatrix4x4(TemporalAAEffect._previousViewProjection, cameraData.previousViewProjection);
        if (state.texture.colorFormat === RenderTargetFormat.R8G8B8 || state.texture.colorFormat === RenderTargetFormat.R8G8B8A8)
            shaderData.addDefine(TemporalAAEffect._lowPrecision);
        else
            shaderData.removeDefine(TemporalAAEffect._lowPrecision);
        if (cameraData.quality === TemporalAAQuality.VeryHigh)
            this._setFilterWeights(shaderData, cameraData.jitter);
        context.command.blitScreenTriangle(context.indirectTarget, context.destination, null, this._shader, shaderData, cameraData.quality, true);
        if (isNewFrame || !state.valid) {
            context.command.blitScreenTriangle(context.destination, state.texture, null, this._shader, state.copyData, TemporalAAEffect._copyPass, true);
            state.pendingCopy = true;
        }
    }

    /** @internal 执行最终 RCAS 锐化；源和目标需同尺寸且互不相同。 */
    _renderSharpen(context: PostProcessRenderContext): void {
        const cameraData = context.camera._taa;
        const state = cameraData?.preparedHistory;
        if (!state || !context.indirectTarget || !context.destination)
            return;
        TemporalAAEffect.init();
        this._shader ||= Shader3D.find("TemporalAA");
        // 对齐 Unity 的 0～2.5 档指数映射。
        const sharpening = cameraData.sharpening;
        const sharpness = Math.pow(2, -(1 - sharpening) * 2.5);
        state.sharpenData.setNumber(TemporalAAEffect._rcasSharpness, sharpening > 0 ? sharpness : 0);
        context.command.blitScreenTriangle(context.indirectTarget, context.destination, null, this._shader, state.sharpenData, TemporalAAEffect._sharpenPass, true);
    }

    /** @internal 后期流程分别调度混合与锐化。 */
    render(context: PostProcessRenderContext): void {
        this._renderTAA(context);
    }

}

Laya.addInitCallback(() => TemporalAAEffect.init());
