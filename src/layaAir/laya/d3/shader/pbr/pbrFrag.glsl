#if !defined(pbrFrag_lib)
    #define pbrFrag_lib

    #include "PBRLighting.glsl";

    #include "PBRCommon.glsl";

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

void getPixelInfo(inout PixelInfo info, const in PixelParams pixel)
{
    info.normalWS = pixel.normalWS;
    info.viewDir = pixel.viewDir;
    info.NoV = pixel.NoV;

    #ifdef LIGHTMAP
	#ifdef UV1
    info.lightmapUV = pixel.uv1;
	#endif // UV1
    #endif // LIGHTMAP
}

vec3 PBRLighting(const in Surface surface, const in PixelParams pixel)
{

    PixelInfo info;
    getPixelInfo(info, pixel);

    vec3 lightColor = vec3(0.0);
    #ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount)
		break;
	    DirectionLight directionLight = getDirectionLight(i, pixel.positionWS);
	    Light light = getLight(directionLight);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // DIRECTIONLIGHT

    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, info.viewDir, gl_FragCoord, u_ProjectionParams);
    #endif // POINTLIGHT || SPOTLIGHT

    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo,  pixel.positionWS);
	    Light light = getLight(pointLight, pixel.normalWS,  pixel.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // POINTLIGHT

    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo,  pixel.positionWS);
	    Light light = getLight(spotLight, pixel.normalWS,  pixel.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // SPOTLIGHT

    vec3 giColor = PBRGI(surface, info);

    return lightColor + giColor;
}

#endif // pbrFrag_lib