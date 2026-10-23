#define SHADER_NAME TemporalAAFS

#include "Color.glsl";

// 对齐 Unity URP 17.3 TemporalAA.hlsl 的质量分级与混合公式。
// 当前帧与历史在线性空间采样，历史保存锐化前结果。
// 纹理仅一级 mip；显式 LOD 0 避免 WebGPU 的非一致导数限制。

vec2 taaClampUv(vec2 uv)
{
    vec2 halfTexel = 0.5 * u_MainTex_TexelSize.xy;
    return clamp(uv, halfTexel, vec2(1.0) - halfTexel);
}

vec4 taaSampleCurrent(vec2 uv, vec2 offset)
{
    vec4 color = texture2DLodEXT(u_MainTex, taaClampUv(uv + u_MainTex_TexelSize.xy * offset), 0.0);
#ifdef Gamma_u_MainTex
    color = gammaToLinear(color);
#endif
    return color;
}

vec4 taaSceneToWorking(vec4 color)
{
#ifdef TAA_USE_RGB
    return color;
#else
    const float chromaBias = 128.0 / 255.0;
    return vec4(dot(color.rgb, vec3(0.25, 0.5, 0.25)),
        dot(color.rgb, vec3(0.5, 0.0, -0.5)) + chromaBias,
        dot(color.rgb, vec3(-0.25, 0.5, -0.25)) + chromaBias, color.a);
#endif
}

vec4 taaWorkingToScene(vec4 color)
{
#ifdef TAA_USE_RGB
    return color;
#else
    const float chromaBias = 128.0 / 255.0;
    float co = color.y - chromaBias;
    float cg = color.z - chromaBias;
    return vec4(color.x + co - cg, color.x + cg, color.x - co - cg, color.a);
#endif
}

float taaLuma(vec3 color)
{
#ifdef TAA_USE_RGB
    // Unity 在线性空间使用 Rec.709 亮度。
    return dot(color, vec3(0.2126729, 0.7151522, 0.0721750));
#else
    return color.x;
#endif
}

vec4 taaPerceptualBlend(vec4 history, vec4 current, float currentInfluence)
{
    vec4 perceptualHistory = history / (taaLuma(history.rgb) + 1.0);
    vec4 perceptualCurrent = current / (taaLuma(current.rgb) + 1.0);
    vec4 perceptualResult = mix(perceptualHistory, perceptualCurrent, currentInfluence);
    return perceptualResult / (1.0 - taaLuma(perceptualResult.rgb));
}

void taaAdjustColorBox(inout vec4 boxMin, inout vec4 boxMax, inout vec4 moment1,
    inout vec4 moment2, vec2 uv, vec2 offset)
{
    vec4 color = taaSceneToWorking(taaSampleCurrent(uv, offset));
    boxMin = min(color, boxMin);
    boxMax = max(color, boxMax);
    moment1 += color;
    moment2 += color * color;
}

vec4 taaFilterCurrent(vec2 uv)
{
    vec4 color = taaSampleCurrent(uv, vec2(0.0)) * u_TaaFilterWeights0.x;
    color += taaSampleCurrent(uv, vec2(0.0, 1.0)) * u_TaaFilterWeights0.y;
    color += taaSampleCurrent(uv, vec2(1.0, 0.0)) * u_TaaFilterWeights0.z;
    color += taaSampleCurrent(uv, vec2(-1.0, 0.0)) * u_TaaFilterWeights0.w;
    color += taaSampleCurrent(uv, vec2(0.0, -1.0)) * u_TaaFilterWeights1.x;
    color += taaSampleCurrent(uv, vec2(-1.0, 1.0)) * u_TaaFilterWeights1.y;
    color += taaSampleCurrent(uv, vec2(1.0, -1.0)) * u_TaaFilterWeights1.z;
    color += taaSampleCurrent(uv, vec2(1.0, 1.0)) * u_TaaFilterWeights1.w;
    color += taaSampleCurrent(uv, vec2(-1.0, -1.0)) * u_TaaFilterWeights2.x;
    return taaSceneToWorking(color);
}

vec4 taaSampleHistory(vec2 uv)
{
    return taaSceneToWorking(texture2DLodEXT(u_TaaHistoryTex, taaClampUv(uv), 0.0));
}

vec4 taaSampleHistoryBicubic(vec2 uv)
{
    // 5 次双线性采样实现 Catmull-Rom，与 Unity 一致。
    vec2 samplePos = uv * u_MainTex_TexelSize.zw;
    vec2 tc1 = floor(samplePos - 0.5) + 0.5;
    vec2 f = samplePos - tc1;
    vec2 f2 = f * f;
    vec2 f3 = f * f2;
    vec2 w0 = -0.5 * f3 + f2 - 0.5 * f;
    vec2 w1 = 1.5 * f3 - 2.5 * f2 + 1.0;
    vec2 w2 = -1.5 * f3 + 2.0 * f2 + 0.5 * f;
    vec2 w3 = 0.5 * f3 - 0.5 * f2;
    vec2 w12 = w1 + w2;
    vec2 tc0 = u_MainTex_TexelSize.xy * (tc1 - 1.0);
    vec2 tc3 = u_MainTex_TexelSize.xy * (tc1 + 2.0);
    vec2 tc12 = u_MainTex_TexelSize.xy * (tc1 + w2 / w12);
    float cw0 = w12.x * w0.y;
    float cw1 = w0.x * w12.y;
    float cw2 = w12.x * w12.y;
    float cw3 = w3.x * w12.y;
    float cw4 = w12.x * w3.y;
    vec4 result = taaSampleHistory(vec2(tc12.x, tc0.y)) * cw0;
    result += taaSampleHistory(vec2(tc0.x, tc12.y)) * cw1;
    result += taaSampleHistory(vec2(tc12.x, tc12.y)) * cw2;
    result += taaSampleHistory(vec2(tc3.x, tc12.y)) * cw3;
    result += taaSampleHistory(vec2(tc12.x, tc3.y)) * cw4;
    return result / (cw0 + cw1 + cw2 + cw3 + cw4);
}

vec4 taaClipToAabbCenter(vec4 history, vec4 boxMin, vec4 boxMax)
{
    vec4 center = 0.5 * (boxMax + boxMin);
    // 与 Unity 的 HALF_MIN 一致。
    vec4 extents = max(0.5 * (boxMax - boxMin), vec4(0.00006103515625));
    vec4 offset = history - center;
    vec3 unit = abs(offset.rgb / extents.rgb);
    float maxUnit = max(max(unit.x, unit.y), unit.z);
    return maxUnit > 1.0 ? center + offset / maxUnit : history;
}

void taaAdjustBestDepth(inout float bestDepth, inout vec2 bestOffset, vec2 uv, vec2 offset)
{
    float depth = texture2DLodEXT(u_TaaDepthTex, taaClampUv(uv + u_MainTex_TexelSize.xy * offset), 0.0).r;
    if (depth < bestDepth) {
        bestDepth = depth;
        bestOffset = offset;
    }
}

vec2 taaGetVelocity(vec2 uv, vec2 depthOffset)
{
    if (u_TaaParams.z < 0.5)
        return vec2(0.0);
    vec2 sampleUv = taaClampUv(uv + u_MainTex_TexelSize.xy * depthOffset);
    vec4 motion = texture2DLodEXT(u_TaaMotionTex, sampleUv, 0.0);
    vec2 velocity = motion.xy;
    // 未写入矢量的像素用相机矩阵重建运动。
    if (motion.a < 0.5) {
        float depth = texture2DLodEXT(u_TaaDepthTex, sampleUv, 0.0).r;
        vec2 clipXY = (sampleUv * 2.0 - 1.0) * vec2(1.0, u_TaaScreenYSign);
        vec4 world = u_TaaResolveInvViewProjection * vec4(clipXY, depth, 1.0);
        if (abs(world.w) < 0.0000001)
            return vec2(0.0);
        world /= world.w;
        vec4 currentClip = u_TaaResolveViewProjection * world;
        vec4 previousClip = u_TaaResolvePreviousViewProjection * world;
        if (abs(currentClip.w) < 0.0000001 || previousClip.w <= 0.0000001)
            return vec2(2.0);
        velocity = (currentClip.xy / currentClip.w - previousClip.xy / previousClip.w) *
            vec2(0.5, 0.5 * u_TaaScreenYSign);
    }
    // MRT 存储当前减上一帧的 UV 位移，此处反向。
    return -velocity;
}

vec4 taaResolve(vec2 uv, int clampQuality, int motionQuality, int historyQuality, int centralFiltering)
{
    vec4 colorCenter = centralFiltering >= 1 ? taaFilterCurrent(uv) : taaSceneToWorking(taaSampleCurrent(uv, vec2(0.0)));
    // 首帧不采样无效历史，NaN 乘零仍会污染结果。
    if (u_TaaParams.w < 0.5)
        return max(taaWorkingToScene(colorCenter), vec4(0.0));

    vec4 boxMin = colorCenter;
    vec4 boxMax = colorCenter;
    vec4 moment1 = colorCenter;
    vec4 moment2 = colorCenter * colorCenter;
    taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(0.0, -1.0));
    taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(-1.0, 0.0));
    taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(1.0, 0.0));
    taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(0.0, 1.0));
    if (clampQuality >= 1) {
        taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(-1.0, -1.0));
        taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(1.0, -1.0));
        taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(-1.0, 1.0));
        taaAdjustColorBox(boxMin, boxMax, moment1, moment2, uv, vec2(1.0, 1.0));
    }
    if (clampQuality >= 2) {
        vec4 mean = moment1 / 9.0;
        vec4 stdDev = sqrt(abs(moment2 / 9.0 - mean * mean));
        boxMin = max(boxMin, mean - u_TaaParams.y * stdDev);
        boxMax = min(boxMax, mean + u_TaaParams.y * stdDev);
    }
    vec2 bestOffset = vec2(0.0);
    float bestDepth = 1.0;
    if (motionQuality >= 1) {
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(0.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(1.0, 0.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(0.0, -1.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(-1.0, 0.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(0.0, 1.0));
    }
    if (motionQuality >= 2) {
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(-1.0, -1.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(1.0, -1.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(-1.0, 1.0));
        taaAdjustBestDepth(bestDepth, bestOffset, uv, vec2(1.0, 1.0));
    }
    vec2 velocity = taaGetVelocity(uv, bestOffset);
    vec2 historyUv = uv + velocity;
    if (any(greaterThan(abs(historyUv - 0.5), vec2(0.5))))
        return max(taaWorkingToScene(colorCenter), vec4(0.0));
    vec4 history = historyQuality >= 2 ? taaSampleHistoryBicubic(historyUv) : taaSampleHistory(historyUv);
    vec4 clampedHistory = clampQuality >= 3 ? taaClipToAabbCenter(history, boxMin, boxMax) : clamp(history, boxMin, boxMax);
    float influence = u_TaaParams.x;
    return max(taaWorkingToScene(taaPerceptualBlend(clampedHistory, colorCenter, influence)), vec4(0.0));
}

void main()
{
    // 物理像素坐标与 MRT、深度及 GPU 矩阵保持一致。
    vec2 uv = gl_FragCoord.xy * u_MainTex_TexelSize.xy;
    #error TAA_RESOLVE_NOT_SPECIALIZED
    gl_FragColor = outputTransform(gl_FragColor);
}
