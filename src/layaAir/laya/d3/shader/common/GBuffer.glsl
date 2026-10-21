#if !defined(GBuffer_lib)
    #define GBuffer_lib

    #define GBUFFER_NORMAL_LOCATION 1
    #define GBUFFER_ALBEDO_LOCATION 2
    #define GBUFFER_SURFACE_LOCATION 3
    #define GBUFFER_CUSTOM_START 4

    #ifdef LAYA_MRT

        #if !defined(LAYA_MRT_TARGET_1) && !defined(LAYA_MRT_TARGET_2) && !defined(LAYA_MRT_TARGET_3) && !defined(LAYA_MRT_TARGET_4)
            #define GBUFFER_CUSTOM_OUTPUTS
        #endif

// 颜色 0 为主颜色，1～3 为固定内置数据，开发者的自定义输出从 4 开始。
// 功能宏选择数据，目标数量限制可写槽位；未开启的输出由通用 MRT 适配补零。
        #if defined(GBUFFER_NORMAL) && !defined(LAYA_MRT_TARGET_1)
layout(location = GBUFFER_NORMAL_LOCATION) out highp vec4 laya_GBufferNormal;
        #endif
        #if defined(GBUFFER_ALBEDO) && !defined(LAYA_MRT_TARGET_1) && !defined(LAYA_MRT_TARGET_2)
layout(location = GBUFFER_ALBEDO_LOCATION) out highp vec4 laya_GBufferAlbedo;
        #endif
        #if defined(GBUFFER_SURFACE) && !defined(LAYA_MRT_TARGET_1) && !defined(LAYA_MRT_TARGET_2) && !defined(LAYA_MRT_TARGET_3)
layout(location = GBUFFER_SURFACE_LOCATION) out highp vec4 laya_GBufferSurface;
        #endif

// 参数由调用方的着色模型提供，不依赖 PBR 类型；A 为几何覆盖标记，背景应清为 0。
void writeGBuffer(vec3 normalWS, vec3 baseColor, float metallic, float perceptualRoughness, float occlusion)
{
        #if defined(GBUFFER_NORMAL) && !defined(LAYA_MRT_TARGET_1)
    laya_GBufferNormal = vec4(normalize(normalWS) * 0.5 + 0.5, 1.0);
        #endif
        #if defined(GBUFFER_ALBEDO) && !defined(LAYA_MRT_TARGET_1) && !defined(LAYA_MRT_TARGET_2)
    laya_GBufferAlbedo = vec4(baseColor, 1.0);
        #endif
        #if defined(GBUFFER_SURFACE) && !defined(LAYA_MRT_TARGET_1) && !defined(LAYA_MRT_TARGET_2) && !defined(LAYA_MRT_TARGET_3)
    // R 金属度，G 感知粗糙度，B 遮蔽系数；保持线性，不经过雾和颜色输出变换。
    laya_GBufferSurface = vec4(clamp(vec3(metallic, perceptualRoughness, occlusion), 0.0, 1.0), 1.0);
        #endif
}

    #endif // LAYA_MRT
#endif // GBuffer_lib
