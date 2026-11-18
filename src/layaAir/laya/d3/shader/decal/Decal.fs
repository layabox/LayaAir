#define SHADER_NAME DecalFS
#define DECAL_PROJECTOR

#include "Color.glsl";
#include "Math.glsl";
#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DCommon.glsl";
#if defined(DECAL_SCREENSPACE)
#include "PBRMetallicFrag.glsl";
#endif

uniform vec4 u_AlbedoColor;
uniform sampler2D u_AlbedoTexture;
uniform vec4 u_TilingOffset;
uniform sampler2D u_NormalTexture;
uniform float u_NormalScale;
uniform sampler2D u_MetallicGlossTexture;
uniform float u_Metallic;
uniform float u_Smoothness;
uniform sampler2D u_OcclusionTexture;
uniform float u_OcclusionStrength;
uniform sampler2D u_EmissionTexture;
uniform vec4 u_EmissionColor;
uniform float u_EmissionIntensity;
uniform vec4 u_DecalChannelWeights;
uniform float u_DecalMipBias;
uniform mat4 u_DecalInverseViewProjection;
uniform vec4 u_DecalScreenParams;
uniform vec4 u_DecalDepthParams;
uniform highp sampler2D u_DecalDepthTexture;

varying vec4 v_DecalInverseX;
varying vec4 v_DecalInverseY;
varying vec4 v_DecalInverseZ;
varying vec4 v_DecalUVTransform;
varying vec4 v_DecalParams;

// These aliases are supplied by all GLES3/Vulkan shader generators. Legacy
// WebGL1 keeps its implicit sampler when explicit gradients are unavailable.
// GLES3/Vulkan Shader 生成器均提供这些别名；旧 WebGL1 无显式梯度时，
// 保留隐式纹理采样。
#if defined(GRAPHICS_API_GLES3) || defined(GL_EXT_shader_texture_lod)
    #define DECAL_SAMPLE(textureName, coordinates, gradientX, gradientY) texture2DGradEXT(textureName, coordinates, gradientX, gradientY)
#else
    #define DECAL_SAMPLE(textureName, coordinates, gradientX, gradientY) texture2D(textureName, coordinates, u_DecalMipBias)
#endif

#if defined(DECAL_DBUFFER)
layout(location = 1) out highp vec4 laya_DecalNormal;
layout(location = 2) out highp vec4 laya_DecalSurface;
#endif

float decalRawDepth(vec2 uv)
{
    // Depth has no mip chain and must not inherit the projector UV footprint.
    // 深度纹理没有 mip 链，采样不能沿用投射器 UV 的采样足迹。
    vec4 sampleDepth = texture2DLodEXT(u_DecalDepthTexture, uv, 0.0);
    if (u_DecalDepthParams.z > 0.5)
        return min(dot(sampleDepth, vec4(1.0, 1.0 / 255.0, 1.0 / 65025.0, 1.0 / 16581375.0)), 1.0);
    return sampleDepth.r;
}

vec4 decalPositionH(vec2 uv, float depth)
{
    vec2 ndc = uv * 2.0 - 1.0;
    ndc.y *= u_DecalDepthParams.w;
    return u_DecalInverseViewProjection * vec4(ndc, depth * u_DecalDepthParams.x + u_DecalDepthParams.y, 1.0);
}

float decalDepthValid(vec2 uv, float depth)
{
    vec2 halfTexel = u_DecalScreenParams.zw * 0.5;
    return all(greaterThanEqual(uv, halfTexel)) && all(lessThanEqual(uv, vec2(1.0) - halfTexel))
        && depth >= 0.0 && depth < 0.9999999 ? 1.0 : 0.0;
}

// x/y = negative/positive one-pixel depth; z/w = the two-pixel samples.
// Hardware depth is affine across a projected plane, including perspective.
// Second-order agreement therefore selects the same surface at silhouettes
// without preferring the nearer side of an otherwise continuous sloped plane.
// x/y 是负向/正向一个像素的深度，z/w 是两个像素处的深度。
// 包括透视投影在内，平面的硬件深度在屏幕空间呈仿射变化；
// 比较二阶误差可在轮廓处选中同一表面，避免连续斜面始终偏向较近一侧。
vec2 decalDepthSlope(float center, vec4 depth, vec4 valid, float fallbackSlope)
{
    bool negative = valid.x > 0.5;
    bool positive = valid.y > 0.5;
    bool negativePair = negative && valid.z > 0.5;
    bool positivePair = positive && valid.w > 0.5;
    if (negativePair && positivePair)
    {
        float negativeError = abs(2.0 * depth.x - depth.z - center);
        float positiveError = abs(2.0 * depth.y - depth.w - center);
        return vec2(negativeError <= positiveError ? center - depth.x : depth.y - center, 1.0);
    }
    if (negativePair) return vec2(center - depth.x, 1.0);
    if (positivePair) return vec2(depth.y - center, 1.0);
    if (negative && positive)
        return vec2(abs(center - depth.x) <= abs(depth.y - center) ? center - depth.x : depth.y - center, 1.0);
    if (negative) return vec2(center - depth.x, 1.0);
    if (positive) return vec2(depth.y - center, 1.0);
    // At a sub-pixel primitive or viewport boundary there may be no same-view
    // neighbor. Preserve a conservative implicit footprint instead of Mip 0.
    // 亚像素图元或视口边缘可能没有有效邻点，保留较保守的隐式采样足迹，
    // 避免直接回退到 Mip 0。
    return vec2(fallbackSlope, 0.0);
}

vec3 decalWorldGradient(vec4 positionH, vec4 deltaH)
{
    // The quotient rule gives the exact center derivative on a plane. A finite
    // difference in world space would instead depend on the selected side.
    // 商法则可求出平面中心的精确导数；直接对世界坐标作有限差分，
    // 结果会受所选邻点方向影响。
    return (deltaH.xyz - positionH.xyz * (deltaH.w / positionH.w)) / positionH.w;
}

vec2 decalUVGradient(vec3 worldGradient)
{
    return vec2(dot(v_DecalInverseX.xyz, worldGradient), dot(v_DecalInverseY.xyz, worldGradient))
        * v_DecalUVTransform.xy * u_TilingOffset.xy;
}

vec3 decalReceiverNormal(vec3 positionWS, vec3 gradientX, vec3 gradientY, float reliable)
{
    vec3 normal = cross(gradientX, gradientY);
    float len = dot(normal, normal);
    normal = reliable > 0.5 && len > 1e-16 ? normal * inversesqrt(len) : -normalize(v_DecalInverseZ.xyz);
    return dot(normal, u_CameraPos - positionWS) < 0.0 ? -normal : normal;
}

#if defined(FOG) && !defined(DECAL_DBUFFER)
float decalFogFactor(vec3 positionWS)
{
    // Evaluate fog at the reconstructed receiver using the same clip Z as FogHandle.
    // 在深度重建的接收表面上计算雾，裁剪空间 Z 与 FogHandle 一致。
    float depth = remapPositionZ(getPositionCS(positionWS)).z;
    #ifdef FOG_EXP
    float factor = exp2(-depth * (u_FogParams.z / log(2.0)));
    #elif defined(FOG_EXP2)
    float value = depth * (u_FogParams.z / sqrt(log(2.0)));
    if (int(u_FogParams.w + 0.5) == 3) value *= value;
    float factor = exp2(-value);
    #else
    float range = u_FogParams.y - u_FogParams.x;
    float factor = -depth / range + u_FogParams.y / range;
    #endif
    return clamp(factor, 0.0, 1.0);
}
#endif

void main()
{
    vec2 depthUV = (gl_FragCoord.xy + u_DecalScreenParams.xy) * u_DecalScreenParams.zw;
    float rawDepth = decalRawDepth(depthUV);
    vec4 positionH = decalPositionH(depthUV, rawDepth);
    // Infinite-far projections can reconstruct a background sample with w=0.
    // It will be discarded below, but must stay finite while helper pixels
    // participate in fallback derivatives for adjacent visible fragments.
    // 无限远投影可能将背景重建为 w=0；该片元虽随后被裁剪，
    // 作为辅助片元参与相邻可见片元的回退导数计算时，数值仍须保持有限。
    positionH.w = abs(positionH.w) >= 1e-8 ? positionH.w : (positionH.w < 0.0 ? -1e-8 : 1e-8);
    vec3 positionWS = positionH.xyz / positionH.w;
    vec4 position = vec4(positionWS, 1.0);
    vec3 local = vec3(dot(v_DecalInverseX, position), dot(v_DecalInverseY, position), dot(v_DecalInverseZ, position));
    vec2 uv = transformUV((local.xy + 0.5) * v_DecalUVTransform.xy + v_DecalUVTransform.zw, u_TilingOffset);

    // Evaluate all fallback derivatives before any discard or varying branch.
    // 所有回退导数须在 discard 或非一致分支之前求值。
    vec2 implicitGradientX = dFdx(uv), implicitGradientY = dFdy(uv);
    vec2 implicitDepthSlope = vec2(dFdx(rawDepth), dFdy(rawDepth));
    vec2 texelX = vec2(u_DecalScreenParams.z, 0.0);
    vec2 texelY = vec2(0.0, u_DecalScreenParams.w);
    vec4 depthsX = vec4(decalRawDepth(depthUV - texelX), decalRawDepth(depthUV + texelX),
        decalRawDepth(depthUV - texelX * 2.0), decalRawDepth(depthUV + texelX * 2.0));
    vec4 depthsY = vec4(decalRawDepth(depthUV - texelY), decalRawDepth(depthUV + texelY),
        decalRawDepth(depthUV - texelY * 2.0), decalRawDepth(depthUV + texelY * 2.0));
    vec4 validX = vec4(decalDepthValid(depthUV - texelX, depthsX.x), decalDepthValid(depthUV + texelX, depthsX.y),
        decalDepthValid(depthUV - texelX * 2.0, depthsX.z), decalDepthValid(depthUV + texelX * 2.0, depthsX.w));
    vec4 validY = vec4(decalDepthValid(depthUV - texelY, depthsY.x), decalDepthValid(depthUV + texelY, depthsY.y),
        decalDepthValid(depthUV - texelY * 2.0, depthsY.z), decalDepthValid(depthUV + texelY * 2.0, depthsY.w));
    vec2 slopeX = decalDepthSlope(rawDepth, depthsX, validX, implicitDepthSlope.x);
    vec2 slopeY = decalDepthSlope(rawDepth, depthsY, validY, implicitDepthSlope.y);
    vec4 deltaHX = u_DecalInverseViewProjection * vec4(2.0 * texelX.x, 0.0, slopeX.x * u_DecalDepthParams.x, 0.0);
    vec4 deltaHY = u_DecalInverseViewProjection * vec4(0.0, 2.0 * texelY.y * u_DecalDepthParams.w, slopeY.x * u_DecalDepthParams.x, 0.0);
    vec3 worldGradientX = decalWorldGradient(positionH, deltaHX);
    vec3 worldGradientY = decalWorldGradient(positionH, deltaHY);
    vec2 gradientX = decalUVGradient(worldGradientX), gradientY = decalUVGradient(worldGradientY);
    if (slopeX.y < 0.5 && dot(implicitGradientX, implicitGradientX) > dot(gradientX, gradientX)) gradientX = implicitGradientX;
    if (slopeY.y < 0.5 && dot(implicitGradientY, implicitGradientY) > dot(gradientY, gradientY)) gradientY = implicitGradientY;
    // Scale the sampling footprint, keeping its anisotropy and direction.
    // This offsets mip selection without replacing it with a fixed LOD.
    // 缩放采样足迹时保留各向异性和方向，仅偏移 mip 选择，
    // 不将其替换为固定 LOD。
    float mipScale = exp2(u_DecalMipBias);
    gradientX *= mipScale;
    gradientY *= mipScale;
    vec3 receiverNormal = decalReceiverNormal(positionWS, worldGradientX, worldGradientY, slopeX.y * slopeY.y);

    vec4 albedo = u_AlbedoColor;
    float albedoTextureAlpha = 1.0;
#ifdef ALBEDOTEXTURE
    vec4 sampleAlbedo = DECAL_SAMPLE(u_AlbedoTexture, uv, gradientX, gradientY);
    #ifdef Gamma_u_AlbedoTexture
    sampleAlbedo = gammaToLinear(sampleAlbedo);
    #endif
    albedoTextureAlpha = sampleAlbedo.a;
    albedo *= sampleAlbedo;
#endif
    float metallic = u_Metallic;
    float smoothness = u_Smoothness;
#ifdef METALLICGLOSSTEXTURE
    vec4 metallicGloss = DECAL_SAMPLE(u_MetallicGlossTexture, uv, gradientX, gradientY);
    #ifdef Gamma_u_MetallicGlossTexture
    metallicGloss = gammaToLinear(metallicGloss);
    #endif
    metallic = metallicGloss.r;
    #ifdef SMOOTHNESSSOURCE_ALBEDOTEXTURE_ALPHA
    // Use the texture alpha before applying opacity and fading.
    // 使用乘入材质透明度和淡出系数之前的纹理 Alpha。
    smoothness *= albedoTextureAlpha;
    #else
    smoothness *= metallicGloss.a;
    #endif
#endif
    float occlusion = 1.0;
#ifdef OCCLUSIONTEXTURE
    vec4 occlusionSample = DECAL_SAMPLE(u_OcclusionTexture, uv, gradientX, gradientY);
    #ifdef Gamma_u_OcclusionTexture
    occlusionSample = gammaToLinear(occlusionSample);
    #endif
    occlusion = (1.0 - u_OcclusionStrength) + occlusionSample.g * u_OcclusionStrength;
#endif
    vec3 normalTS = vec3(0.0, 0.0, 1.0);
#ifdef NORMALTEXTURE
    vec3 normalSample = DECAL_SAMPLE(u_NormalTexture, uv, gradientX, gradientY).rgb;
    normalSample = normalize(normalSample * 2.0 - 1.0);
    normalSample.y *= -1.0;
    normalTS = normalScale(normalSample, u_NormalScale);
#endif
    vec3 axisX = normalize(v_DecalInverseX.xyz);
    vec3 axisY = normalize(v_DecalInverseY.xyz);
    vec3 axisZ = normalize(v_DecalInverseZ.xyz);
    vec3 emissive = vec3(0.0);
#ifdef EMISSION
    emissive = u_EmissionColor.rgb * u_EmissionIntensity;
    #ifdef EMISSIONTEXTURE
    vec4 emissionSample = DECAL_SAMPLE(u_EmissionTexture, uv, gradientX, gradientY);
    #ifdef Gamma_u_EmissionTexture
    emissionSample = gammaToLinear(emissionSample);
    #endif
    emissive *= emissionSample.rgb;
    #endif
#endif
#if defined(DECAL_SURFACE_MODIFIER)
    // Optional material variants operate on the sampled surface only. Keep
    // the current-depth projection, stable gradients and all pass states shared.
    // 可选材质变体只修改采样后的表面，继续复用当前帧深度投射、
    // 稳定梯度和所有 Pass 状态。
    decalModifySurface(uv, gradientX, gradientY, albedo, normalTS, metallic, smoothness, occlusion, emissive);
#endif
    vec3 decalNormal = normalize(axisX * normalTS.x - axisY * normalTS.y - axisZ * normalTS.z);
    float angleFade = 1.0;
    if (v_DecalParams.y > -0.9999)
        angleFade = clamp((dot(receiverNormal, -axisZ) - v_DecalParams.z) / max(v_DecalParams.y - v_DecalParams.z, 1e-5), 0.0, 1.0);
    float opacity = clamp(albedo.a * v_DecalParams.x * angleFade, 0.0, 1.0);
    if (rawDepth >= 0.9999999 || any(greaterThan(abs(local), vec3(0.5))) || opacity <= 0.0)
        discard;

#if defined(DECAL_DBUFFER)
    gl_FragColor = vec4(albedo.rgb, opacity * u_DecalChannelWeights.x);
    laya_DecalNormal = vec4(decalNormal * 0.5 + 0.5, opacity * u_DecalChannelWeights.y);
    laya_DecalSurface = vec4(metallic, occlusion, smoothness, opacity * u_DecalChannelWeights.z);
#elif defined(DECAL_EMISSION)
    #ifdef FOG
    emissive *= decalFogFactor(positionWS);
    #endif
    gl_FragColor = outputTransform(vec4(emissive, opacity));
#else
    PixelParams pixel;
    pixel.positionWS = positionWS;
    pixel.normalWS = normalize(mix(receiverNormal, decalNormal, u_DecalChannelWeights.y));
    pixel.tangentWS = axisX;
    pixel.biNormalWS = -axisY;
    pixel.TBN = mat3(vec3(1.0, 0.0, 0.0), vec3(0.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0));
    #ifdef UV
    pixel.uv0 = uv;
    #endif
    #ifdef UV1
        #ifdef LIGHTMAP
    pixel.uv1 = vec2(0.0);
        #endif
    #endif
    #ifdef COLOR
    pixel.vertexColor = vec4(1.0);
    #endif
    SurfaceInputs inputs;
    inputs.diffuseColor = albedo.rgb;
    inputs.alpha = opacity * u_DecalChannelWeights.x;
    inputs.alphaTest = 0.0;
    inputs.metallic = metallic;
    inputs.smoothness = smoothness;
    inputs.occlusion = occlusion;
    inputs.emissionColor = emissive;
    inputs.normalTS = pixel.normalWS;
    #ifdef CLEARCOAT
    inputs.clearCoat = 0.0;
    inputs.clearCoatRoughness = 0.0;
        #ifdef CLEARCOAT_NORMAL
    inputs.clearCoatNormalTS = pixel.normalWS;
        #endif
    #endif
    #ifdef ANISOTROPIC
    inputs.anisotropy = 0.0;
    inputs.anisotropyDirection = vec2(1.0, 0.0);
    #endif
    vec4 color = PBR_Metallic_Flow(inputs, pixel);
    #ifdef FOG
    color.rgb = mix(u_FogColor.rgb, color.rgb, decalFogFactor(positionWS));
    #endif
    gl_FragColor = outputTransform(color);
#endif
}
