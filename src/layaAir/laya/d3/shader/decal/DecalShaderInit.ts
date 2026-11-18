import { RenderState } from "../../../RenderDriver/RenderModuleData/Design/RenderState";
import { ShaderDataItem, ShaderDataType } from "../../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import type { ShaderDefine } from "../../../RenderDriver/RenderModuleData/Design/ShaderDefine";
import { Shader3D, ShaderFeatureType } from "../../../RenderEngine/RenderShader/Shader3D";
import { SubShader } from "../../../RenderEngine/RenderShader/SubShader";
import { Color } from "../../../maths/Color";
import { Vector4 } from "../../../maths/Vector4";
import { LayaGL } from "../../../layagl/LayaGL";
import { BaseCamera } from "../../core/BaseCamera";
import DecalVS from "./Decal.vs";
import DecalFS from "./Decal.fs";

/**
 * @en Optional decal surface shader extension. Projection and texture gradients remain shared.
 * @zh 可选的贴花表面 Shader 扩展，复用投射与纹理梯度计算。
 */
export interface DecalShaderExtension {
    uniforms?: Record<string, ShaderDataType>;
    defaults?: Record<string, ShaderDataItem>;
    /**
     * @en Define DECAL_SURFACE_MODIFIER and provide decalModifySurface().
     * @zh 定义 DECAL_SURFACE_MODIFIER 并提供 decalModifySurface()。
     */
    fragmentPrelude?: string;
}

/**
 * @en Creates projector shaders using the shared Laya PBR lighting and command-buffer drivers.
 * @zh 创建复用 Laya PBR 光照与命令缓冲驱动的投射器 Shader。
 */
export class DecalShaderInit {
    /**
     * @en Fixed projector pass layout, also used by loaded generic Materials.
     * @zh 固定的投射器 Pass 布局，加载的通用 Material 也使用此布局。
     * @internal
     */
    static readonly SCREENSPACE_SUBSHADER = 0;
    static readonly DBUFFER_SUBSHADER = 1;
    static readonly EMISSION_SUBSHADER = 2;

    /** @internal */
    static dbufferDefine: ShaderDefine;
    /** @internal */
    static emissionDefine: ShaderDefine;
    /** @internal */
    static dbufferTextures: number[];
    /** @internal */
    static dbufferScreenParams: number;
    /** @internal */
    static inverseViewProjection: number;
    /** @internal */
    static projectorScreenParams: number;
    /** @internal */
    static depthParams: number;
    /** @internal */
    static depthTexture: number;
    /** @internal */
    static instanceUV: number;
    /** @internal */
    static instanceParams: number;

    /** @internal */
    static initUniforms(): void {
        this.dbufferDefine = Shader3D.getDefineByName("LAYA_DBUFFER");
        const cameraUniform = (name: string, type: ShaderDataType): number => {
            const id = Shader3D.propertyNameToID(name);
            BaseCamera.cameraUniformMap.addShaderUniform(id, name, type);
            return id;
        };
        this.dbufferTextures = [0, 1, 2].map(i => cameraUniform("u_DBufferTexture" + i, ShaderDataType.Texture2D));
        this.dbufferScreenParams = cameraUniform("u_DBufferScreenParams", ShaderDataType.Vector4);
        this.inverseViewProjection = cameraUniform("u_DecalInverseViewProjection", ShaderDataType.Matrix4x4);
        this.projectorScreenParams = cameraUniform("u_DecalScreenParams", ShaderDataType.Vector4);
        this.depthParams = cameraUniform("u_DecalDepthParams", ShaderDataType.Vector4);
        this.depthTexture = cameraUniform("u_DecalDepthTexture", ShaderDataType.Texture2D);
        const sprite = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite3D");
        this.instanceUV = Shader3D.propertyNameToID("u_DecalUVTransform");
        this.instanceParams = Shader3D.propertyNameToID("u_DecalParams");
        sprite.addShaderUniform(this.instanceUV, "u_DecalUVTransform", ShaderDataType.Vector4);
        sprite.addShaderUniform(this.instanceParams, "u_DecalParams", ShaderDataType.Vector4);
        this.emissionDefine = Shader3D.getDefineByName("EMISSION");
    }

    /**
     * @en Fail at the component boundary instead of submitting a missing pass.
     * @zh 在组件入口校验失败并报错，避免提交缺失的 Pass。
     * @internal
     */
    static validate(shader: Shader3D): void {
        if (shader?.shaderType !== ShaderFeatureType.Decal)
            throw new TypeError("DecalProjector.material requires a shader with ShaderFeatureType.Decal.");
        if (!shader.getSubShaderAt(0) || !shader.getSubShaderAt(1) || !shader.getSubShaderAt(2))
            throw new TypeError("A Decal shader requires ScreenSpace, DBuffer and Emission subshaders. Use DecalShaderInit.createShader().");
    }
    /** @internal */
    static init(): void {
        this.createShader("Decal");
    }

    /**
     * @en Creates a named decal surface variant with the built-in projection passes. Reuses an existing Decal shader with the same name.
     * @zh 使用内置投射 Pass 创建指定名称的贴花表面变体，同名贴花 Shader 已存在时直接复用。
     */
    static createShader(name: string, extension: DecalShaderExtension = {}): Shader3D {
        const existing = Shader3D.find(name);
        if (existing) {
            this.validate(existing);
            return existing;
        }
        const shader = Shader3D.add(name, true, true);
        shader.shaderType = ShaderFeatureType.Decal;
        shader._supportVolumetricGI = true;
        const attributes = Object.assign({}, SubShader.DefaultAttributeMap, {
            a_DecalUVTransform: [12, ShaderDataType.Vector4] as [number, ShaderDataType],
            a_DecalParams: [13, ShaderDataType.Vector4] as [number, ShaderDataType]
        });
        // These built-in aliases also occupy 12/13. Projector cubes do not use
        // skinning or lightmap instances; retain handedness at location 14.
        // 这些内置属性也占用 12/13；投射器立方体不使用蒙皮或光照贴图实例属性，
        // 保留位置 14 的手性属性。
        delete attributes.a_SimpleTextureParams;
        delete attributes.a_LightmapScaleOffset;
        const uniforms = Object.assign({
            u_AlbedoColor: ShaderDataType.Color,
            u_AlbedoTexture: ShaderDataType.Texture2D,
            u_TilingOffset: ShaderDataType.Vector4,
            u_NormalTexture: ShaderDataType.Texture2D,
            u_NormalScale: ShaderDataType.Float,
            u_MetallicGlossTexture: ShaderDataType.Texture2D,
            u_Metallic: ShaderDataType.Float,
            u_Smoothness: ShaderDataType.Float,
            u_OcclusionTexture: ShaderDataType.Texture2D,
            u_OcclusionStrength: ShaderDataType.Float,
            u_EmissionTexture: ShaderDataType.Texture2D,
            u_EmissionColor: ShaderDataType.Color,
            u_EmissionIntensity: ShaderDataType.Float,
            u_DecalChannelWeights: ShaderDataType.Vector4,
            u_DecalMipBias: ShaderDataType.Float
        }, extension.uniforms);
        const defaults = Object.assign({
            u_AlbedoColor: Color.WHITE,
            u_TilingOffset: new Vector4(1, 1, 0, 0),
            u_NormalScale: 1,
            u_Metallic: 0,
            u_Smoothness: 0.5,
            u_OcclusionStrength: 1,
            u_EmissionColor: Color.WHITE,
            u_EmissionIntensity: 1,
            u_DecalChannelWeights: new Vector4(1, 0, 0, 0),
            u_DecalMipBias: 0
        }, extension.defaults);
        const prefixes = ["#define DECAL_SCREENSPACE\n", "#define DECAL_DBUFFER\n", "#define DECAL_EMISSION\n"];
        for (let i = 0; i < prefixes.length; i++) {
            const subShader = new SubShader(attributes, uniforms, defaults);
            shader.addSubShader(subShader);
            const pass = subShader.addShaderPass(DecalVS, prefixes[i] + (extension.fragmentPrelude || "") + DecalFS, "Forward");
            pass.statefirst = true;
            const state = pass.renderState;
            state.cull = RenderState.CULL_FRONT;
            state.depthWrite = false;
            state.depthTest = RenderState.DEPTHTEST_ALWAYS;
            state.blend = i === 1 ? RenderState.BLEND_ENABLE_SEPERATE : RenderState.BLEND_ENABLE_ALL;
            state.srcBlend = RenderState.BLENDPARAM_SRC_ALPHA;
            state.dstBlend = i === 2 ? RenderState.BLENDPARAM_ONE : RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            state.srcBlendRGB = RenderState.BLENDPARAM_SRC_ALPHA;
            state.dstBlendRGB = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            state.srcBlendAlpha = RenderState.BLENDPARAM_ZERO;
            state.dstBlendAlpha = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
        }
        return shader;
    }
}
