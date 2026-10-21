import { GBufferLocation } from "laya/d3/core/render/GBuffer";
import { Color } from "laya/maths/Color";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { RenderState } from "laya/RenderDriver/RenderModuleData/Design/RenderState";
import { Shader3D, ShaderFeatureType } from "laya/RenderEngine/RenderShader/Shader3D";
import { SubShader } from "laya/RenderEngine/RenderShader/SubShader";
import { Material } from "laya/resource/Material";

/** 本示例的固定输出位置；GLSL 中的 location 4 与 CustomData 保持一致。 */
export enum MRTCustomLocation {
    Color = GBufferLocation.Color,
    CustomData = GBufferLocation.CustomStart
}

/** 相机附件的查询名称，不参与底层 MRT 的判断。 */
export enum MRTCustomAttachment {
    UVHeight = "demoUVHeight"
}

enum MRTCustomShader {
    UVHeight = "Sample.MRT.CustomUVHeight"
}

enum MRTCustomUniform {
    Color = "u_DemoColor"
}

const vertexShader = `
#define SHADER_NAME MRTCustomDataVS
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";
#include "VertexCommon.glsl";

varying vec2 v_DemoUV;
varying float v_DemoHeight;

void main() {
    Vertex vertex;
    getVertexParams(vertex);
    vec3 positionWS = (getWorldMatrix() * vec4(vertex.positionOS, 1.0)).xyz;
#ifdef UV
    v_DemoUV = vertex.texCoord0;
#else
    v_DemoUV = vec2(0.0);
#endif
    v_DemoHeight = clamp(positionWS.y * 0.5 + 0.25, 0.0, 1.0);
    gl_Position = remapPositionZ(getPositionCS(positionWS));
}`;

const fragmentShader = `
#define SHADER_NAME MRTCustomDataFS
#include "Color.glsl";

varying vec2 v_DemoUV;
varying float v_DemoHeight;

// 此示例只使用固定五槽布局；普通 RT 时不会声明或写入自定义输出。
#if defined(LAYA_MRT) && defined(LAYA_MRT_TARGET_5)
layout(location = 4) out highp vec4 demoUVHeight;
#endif

void main() {
    vec2 grid = floor(v_DemoUV * 8.0);
    float checker = mod(grid.x + grid.y, 2.0);
    gl_FragColor = outputTransform(vec4(u_DemoColor.rgb * mix(0.6, 1.0, checker), 1.0));
#if defined(LAYA_MRT) && defined(LAYA_MRT_TARGET_5)
    demoUVHeight = vec4(clamp(v_DemoUV, 0.0, 1.0), v_DemoHeight, 1.0);
#endif
}`;

/** 开发者自定义输出的最小材质示例，不替换或复制引擎的官方 PBR 实现。 */
export class MRTCustomDataMaterial extends Material {
    private static _initialized = false;

    constructor(color: Color) {
        super();
        MRTCustomDataMaterial.initShader();
        this.setShaderName(MRTCustomShader.UVHeight);
        this.setColor(MRTCustomUniform.Color, color);
        this.renderQueue = Material.RENDERQUEUE_OPAQUE;
        this.depthWrite = true;
        this.depthTest = RenderState.DEPTHTEST_LESS;
        this.cull = RenderState.CULL_BACK;
    }

    private static initShader(): void {
        if (this._initialized) return;
        const shader = Shader3D.add(MRTCustomShader.UVHeight);
        shader.shaderType = ShaderFeatureType.D3;
        const subShader = new SubShader(SubShader.DefaultAttributeMap, {
            [MRTCustomUniform.Color]: ShaderDataType.Color
        });
        shader.addSubShader(subShader);
        subShader.addShaderPass(vertexShader, fragmentShader);
        this._initialized = true;
    }
}
