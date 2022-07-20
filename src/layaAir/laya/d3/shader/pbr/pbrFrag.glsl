#if !defined(pbrFrag_lib)
    #define pbrFrag_lib

    #include "Math.glsl";
    #include "Lighting.glsl";

    #include "PBRCommon.glsl";
    #include "BRDF.glsl";

struct Surface {
    vec3 diffuseColor;
    float alpha;
    vec3 f0;
    float roughness;
    float perceptualRoughness;
    float occlusion;
};

void getPixelParams(inout PixelParams params)
{
    params.positionWS = v_PositionWS;
    params.normalWS = normalize(v_NormalWS);

    #ifdef UV
    params.uv0 = v_Texcoord0;
    #endif // UV

    #ifdef UV1
	#ifdef LIGHTMAP
    params.uv1 = v_Texcoord1;
	#endif // LIGHTMAP
    #endif // UV1

    #ifdef COLOR
    params.vertexColor = v_VertexColor;
    #endif // COLOR

    params.viewDir = normalize(v_ViewDir);
    // todo NoV varying ?
    params.NoV = max(dot(params.normalWS, params.viewDir), MIN_N_DOT_V);

    #ifdef TANGENT
	#ifdef NEEDTBN
    params.tangentWS = normalize(v_TangentWS);
    params.biNormalWS = normalize(v_BiNormalWS);
    mat3 TBN = mat3(params.tangentWS, params.biNormalWS, params.normalWS);
	#endif // NEEDTBN
    #endif // TANGENT

    #ifdef NORMALTEXTURE
    vec3 normalSampler = texture2D(u_NormalTexture, params.uv0).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    params.normalWS = normalize(TBN * normalSampler);
    // normalSampler.y *= -1.0;
    // params.normalWS = normalize(TBN * normalSampler);
    #endif // NORMALTEXTURE
}

    #if defined(LIGHTING)

struct LightParams {
    vec3 h;
    float NoL;
    float NoH;
    float LoH;
};

void initLightParams(inout LightParams params, const in PixelParams pixel, const in Light light)
{
    vec3 l = normalize(-light.dir);
    vec3 v = pixel.viewDir;
    vec3 n = pixel.normalWS;

    vec3 h = SafeNormalize(v + l);
    params.h = h;
    params.NoL = saturate(dot(n, l));
    params.NoH = saturate(dot(n, h));
    params.LoH = saturate(dot(l, h));
}

vec3 diffuseLobe(in Surface surface)
{
    return surface.diffuseColor * diffuse();
}

vec3 specularLobe(const in Surface surface, const in PixelParams pixel, const in LightParams lightParams)
{
    float roughness = surface.roughness;
    float D = distribution(roughness, lightParams.NoH, lightParams.h, pixel.normalWS);
    float V = visibility(roughness, pixel.NoV, lightParams.NoL);
    vec3 F = fresnel(surface.f0, lightParams.LoH);

    return (D * V) * F;
}

vec3 PBRLighting(const in Surface surface, const in PixelParams pixel, const in Light light)
{
    LightParams lightParams;
    initLightParams(lightParams, pixel, light);

    vec3 Fd = diffuseLobe(surface);

    vec3 Fr = specularLobe(surface, pixel, lightParams);

    return (Fd + Fr) * light.color * lightParams.NoL;
}

vec3 PBRLighting(const in Surface surface, const in PixelParams pixel)
{
    vec3 lightColor = vec3(0.0);
	#ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount)
		break;
	    DirectionLight directionLight = getDirectionLight(i, pixel.positionWS);
	    Light light = getLight(directionLight);
	    lightColor += PBRLighting(surface, pixel, light) * light.attenuation;
	}
	#endif // DIRECTIONLIGHT

	#if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, v, gl_FragCoord, u_ProjectionParams);
	#endif // POINTLIGHT || SPOTLIGHT

	#ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo, positionWS);
	    Light light = getLight(pointLight, surface.normalWS, positionWS);
	    lightColor += PBRLighting(surface, pixel, light) * light.attenuation;
	}
	#endif // POINTLIGHT

	#ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, positionWS);
	    Light light = getLight(spotLight, surface.normalWS, positionWS);
	    lightColor += PBRLighting(surface, pixel, light) * light.attenuation;
	}
	#endif // SPOTLIGHT

    return lightColor;
}
    #endif // LIGHTING

#endif // pbrFrag_lib