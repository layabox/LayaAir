#define SHADER_NAME DecalInspectorPreviewFS

#include "Math.glsl";
#include "Color.glsl";

varying vec2 v_PreviewUV;
uniform float u_PreviewChannel;
uniform vec4 u_PreviewAlbedo;

// Encoded data channels should retain their numeric display color after the
// standard 2D linear-RT-to-sRGB presentation step.
// 编码后的数据通道在经过标准 2D 线性 RT 到 sRGB 的显示转换后，
// 应保留与数值对应的显示颜色。
vec3 previewDataToLinear(vec3 value)
{
    return mix(pow((value + 0.055) / 1.055, vec3(2.4)), value / 12.92,
        vec3(lessThanEqual(value, vec3(0.04045))));
}

void main()
{
    vec2 uv = v_PreviewUV;
    vec2 gradientX = dFdx(uv), gradientY = dFdy(uv);
    vec4 albedo = u_PreviewAlbedo;
    vec3 normalTS = vec3(0.0, 0.0, 1.0);
    float metallic = 0.0, smoothness = 0.5, occlusion = 1.0;
    vec3 emission = vec3(0.0);
    // The exact function used by the projected material, including its
    // footprint filtering. This is a GPU material preview, not a source map.
    // 使用投射材质实际调用的函数及其采样覆盖过滤，
    // 展示 GPU 材质效果，而非原始贴图。
    decalModifySurface(uv, gradientX, gradientY, albedo, normalTS,
        metallic, smoothness, occlusion, emission);

    // This RT is linear and stores straight alpha. Its Sprite performs the
    // single display conversion and uses source-alpha blending on the checker.
    // 该 RT 为线性空间，存储非预乘 alpha；Sprite 只做一次显示转换，
    // 并使用源 alpha 混合叠加到棋盘背景上。
    vec4 result = albedo;
    if (u_PreviewChannel > 0.5 && u_PreviewChannel < 1.5)
        result = vec4(previewDataToLinear(normalTS * 0.5 + 0.5), albedo.a);
    if (u_PreviewChannel > 1.5)
        // Match the sample's packed map: R metallic, G AO, A smoothness.
        // 对应示例的打包贴图：R 为金属度，G 为 AO，A 为光滑度。
        result = vec4(previewDataToLinear(vec3(metallic, occlusion, 0.0)), smoothness);
    gl_FragColor = result;
}
