#if !defined(pbrFrag_lib)
    #define pbrFrag_lib

    #include "PBRLighting.glsl";

    #include "PBRCommon.glsl";

void getPixelParams(inout PixelParams params)
{
    params.positionWS = v_PositionWS;
    params.normalWS = normalize(v_NormalWS);
    params.normalTS = vec3(0.0, 0.0, 1.0);
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

    params.viewDir = normalize(u_CameraPos - params.positionWS);
    // todo NoV varying ?
    params.NoV = max(abs(dot(params.normalWS, params.viewDir)), MIN_N_DOT_V);

    #ifdef NEEDTBN
    params.tangentWS = normalize(v_TangentWS);
    params.biNormalWS = normalize(v_BiNormalWS);
    mat3 TBN = mat3(params.tangentWS, params.biNormalWS, params.normalWS);
    params.TBN = TBN;
    
	#ifdef NORMALTEXTURE
    vec3 normalSampler = texture2D(u_NormalTexture, params.uv0).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    params.normalTS = normalSampler;
    params.normalWS = normalize(TBN * normalSampler);
	// params.normalWS = normalize(TBN * normalSampler);
    #endif // NORMALTEXTURE

	#ifdef TANGENTTEXTURE
    vec3 tangentSampler = texture2D(u_TangentTexture, params.uv0).rgb;
    tangentSampler = normalize(tangentSampler * 2.0 - 1.0);
    params.tangentWS = normalize(TBN * tangentSampler);
    params.biNormalWS = normalize(cross(params.normalWS, params.tangentWS));
	#endif // TANGENTTEXTURE

	#ifdef ANISOTROPIC
    params.ToV = dot(params.tangentWS, params.viewDir);
    params.BoV = dot(params.biNormalWS, params.viewDir);
	#endif // ANISOTROPIC

    #endif // NEEDTBN
}

void getPixelInfo(inout PixelInfo info, const in PixelParams pixel)
{
    info.positionWS = pixel.positionWS;
    info.normalWS = pixel.normalWS;
    info.viewDir = pixel.viewDir;
    info.NoV = pixel.NoV;

    #ifdef LIGHTMAP
	#ifdef UV1
    info.lightmapUV = pixel.uv1;
	#endif // UV1
    #endif // LIGHTMAP

    #ifdef NEEDTBN
    info.tangentWS = pixel.tangentWS;
    info.biNormalWS = pixel.biNormalWS;

	#ifdef ANISOTROPIC
    info.ToV = pixel.ToV;
    info.BoV = pixel.BoV;
	#endif // ANISOTROPIC

    #endif // NEEDTBN
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
        if (directionLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(directionLight);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // DIRECTIONLIGHT

    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, pixel.positionWS, gl_FragCoord, u_ProjectionParams);
    #endif // POINTLIGHT || SPOTLIGHT

    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo, pixel.positionWS);
        if (pointLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(pointLight, pixel.normalWS, pixel.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // POINTLIGHT

    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, pixel.positionWS);
        if (spotLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(spotLight, pixel.normalWS, pixel.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // SPOTLIGHT

    vec3 giColor = PBRGI(surface, info);


    return lightColor + giColor;
}

#endif // pbrFrag_lib