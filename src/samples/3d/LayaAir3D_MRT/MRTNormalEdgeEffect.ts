import { CameraOpaqueMRTRequirement } from "laya/d3/core/Camera";
import { GBuffer, GBufferAttachment } from "laya/d3/core/render/GBuffer";
import { PostProcess } from "laya/d3/core/render/postProcessBase/PostProcess";
import { PostProcessEffect } from "laya/d3/core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/postProcessBase/PostProcessRenderContext";
import { ShaderData, ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D, ShaderFeatureType } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { VertexMesh } from "laya/RenderEngine/RenderShader/VertexMesh";
import { LayaGL } from "laya/layagl/LayaGL";
import { Vector4 } from "laya/maths/Vector4";

const vertexShader = `
#define SHADER_NAME MRTNormalEdgeVS
varying vec2 v_Texcoord0;
void main() {
    gl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);
    v_Texcoord0 = a_PositionTexcoord.zw;
}`;

const fragmentShader = `
#define SHADER_NAME MRTNormalEdgeFS
#include "Color.glsl";
varying vec2 v_Texcoord0;

vec3 decodeNormal(vec3 encoded) {
    vec3 value = encoded * 2.0 - 1.0;
    return value * inversesqrt(max(dot(value, value), 0.00001));
}

float normalDiscontinuity(vec4 center, vec2 uv) {
    vec4 neighbor = texture2D(u_MRTNormalTex, clamp(uv, vec2(0.0), vec2(1.0)));
    // 透明黑是没有不透明几何的背景，覆盖率变化给出物体轮廓。
    float coverageEdge = abs(center.a - neighbor.a);
    // 只在两侧都有几何时比较世界法线，完全不使用主颜色判断边缘。
    float normalEdge = 1.0 - clamp(dot(decodeNormal(center.rgb), decodeNormal(neighbor.rgb)), -1.0, 1.0);
    return max(coverageEdge, normalEdge * min(center.a, neighbor.a));
}

void main() {
    vec4 color = texture2D(u_MainTex, v_Texcoord0);
#ifdef Gamma_u_MainTex
    color = gammaToLinear(color);
#endif
    vec4 normal = texture2D(u_MRTNormalTex, v_Texcoord0);
    vec2 stepUV = u_MRTNormalTexelSize.xy * 1.6;
    float difference = 0.0;
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 + vec2(stepUV.x, 0.0)));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 - vec2(stepUV.x, 0.0)));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 + vec2(0.0, stepUV.y)));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 - vec2(0.0, stepUV.y)));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 + stepUV));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 - stepUV));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 + vec2(stepUV.x, -stepUV.y)));
    difference = max(difference, normalDiscontinuity(normal, v_Texcoord0 + vec2(-stepUV.x, stepUV.y)));
    float edge = smoothstep(0.10, 0.28, difference);
    color.rgb = mix(color.rgb, vec3(0.012, 0.020, 0.035), edge * 0.92);
    gl_FragColor = outputTransform(color);
}`;

/** 从不透明队列的真实世界法线附件提取描边，不申请或持有相机的整组资源。 */
export class MRTNormalEdgeEffect extends PostProcessEffect {
    private static readonly _requirements: readonly CameraOpaqueMRTRequirement[] = Object.freeze([
        GBuffer.Normal
    ]);
    private static _shader: Shader3D;
    private static _normalTextureID: number;
    private static _normalTexelSizeID: number;
    private _shaderData: ShaderData;
    private readonly _texelSize = new Vector4();

    constructor() {
        super();
        if (!MRTNormalEdgeEffect._shader) MRTNormalEdgeEffect.initShader();
        this._shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    }

    private static initShader(): void {
        const shader = Shader3D.add("Sample.MRT.NormalEdge");
        shader.shaderType = ShaderFeatureType.PostProcess;
        const subShader = new SubShader({ a_PositionTexcoord: [VertexMesh.MESH_POSITION0, ShaderDataType.Vector4] }, {
            u_MainTex: ShaderDataType.Texture2D,
            u_OffsetScale: ShaderDataType.Vector4,
            u_MainTex_TexelSize: ShaderDataType.Vector4,
            u_MRTNormalTex: ShaderDataType.Texture2D,
            u_MRTNormalTexelSize: ShaderDataType.Vector4
        });
        shader.addSubShader(subShader);
        const pass = subShader.addShaderPass(vertexShader, fragmentShader);
        pass.statefirst = true;
        pass.renderState.depthTest = RenderState.DEPTHTEST_ALWAYS;
        pass.renderState.depthWrite = false;
        pass.renderState.cull = RenderState.CULL_NONE;
        pass.renderState.blend = RenderState.BLEND_DISABLE;
        MRTNormalEdgeEffect._normalTextureID = Shader3D.propertyNameToID("u_MRTNormalTex");
        MRTNormalEdgeEffect._normalTexelSizeID = Shader3D.propertyNameToID("u_MRTNormalTexelSize");
        MRTNormalEdgeEffect._shader = shader;
    }

    /** 纯声明：槽位、名称、格式和背景清除值在实例生命周期内保持一致。 */
    getCameraOpaqueMRTRequirements(): readonly CameraOpaqueMRTRequirement[] {
        return MRTNormalEdgeEffect._requirements;
    }

    render(context: PostProcessRenderContext): void {
        const normalTexture = context.camera.getOpaqueAuxiliaryTexture(GBufferAttachment.Normal);
        const command = context.command;
        if (!normalTexture || !this._shaderData) {
            command.blitScreenTriangle(context.indirectTarget, context.destination);
            return;
        }
        this._texelSize.setValue(1 / normalTexture.width, 1 / normalTexture.height, normalTexture.width, normalTexture.height);
        this._shaderData.setVector(MRTNormalEdgeEffect._normalTexelSizeID, this._texelSize);
        // 绑定与清空都作为命令排在绘制两侧，录制阶段不会把相机附件永久留在 ShaderData 中。
        command.setShaderDataTexture(this._shaderData, MRTNormalEdgeEffect._normalTextureID, normalTexture);
        command.blitScreenTriangle(context.indirectTarget, context.destination, null, MRTNormalEdgeEffect._shader, this._shaderData);
        command.setShaderDataTexture(this._shaderData, MRTNormalEdgeEffect._normalTextureID, null);
    }

    /** 停用、移除或销毁时解除可能由中断绘制留下的纹理引用。 */
    clearBorrowedTextures(): void {
        this._shaderData?.setTexture(MRTNormalEdgeEffect._normalTextureID, null);
    }

    release(_postProcess: PostProcess): void {
        this.clearBorrowedTextures();
    }

    destroy(): void {
        this.active = false;
        this.clearBorrowedTextures();
        this._shaderData?.destroy();
        this._shaderData = null;
    }
}
