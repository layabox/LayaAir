#if !defined(pbrFrag_lib)
    #define pbrFrag_lib

    #include "PBRLighting.glsl";

    #include "PBRCommon.glsl";

void getPixelParams(inout PixelParams params)
{
    params.positionWS = v_PositionWS;

    params.normalWS = normalize(v_NormalWS);
    params.tangentWS = normalize(v_TangentWS);
    params.biNormalWS = normalize(v_BiNormalWS);

    params.TBN = mat3(params.tangentWS, params.biNormalWS, params.normalWS);

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
}

void getPixelInfo(inout PixelInfo info, const in PixelParams pixel, const in Surface surface)
{
    info.positionWS = pixel.positionWS;
    info.vertexNormalWS = pixel.normalWS;

    #ifdef TANGENT
    info.normalWS = pixel.TBN * surface.normalTS;
    #else // TANGENT
    info.normalWS = pixel.normalWS;
    #endif // TANGENT

    info.tangentWS = pixel.tangentWS;
    info.biNormalWS = pixel.biNormalWS;

    info.viewDir = normalize(u_CameraPos - info.positionWS);
    info.NoV = min(max(dot(info.normalWS, info.viewDir), MIN_N_DOT_V), 1.0);

    info.dfg = prefilteredDFG_LUT(surface.perceptualRoughness, info.NoV);

    #ifdef LIGHTMAP
	#ifdef UV1
    info.lightmapUV = pixel.uv1;
	#endif // UV1
    #endif // LIGHTMAP

    #ifdef ANISOTROPIC
    info.ToV = dot(info.tangentWS, info.viewDir);
    info.BoV = dot(info.biNormalWS, info.viewDir);
    #endif // ANISOTROPIC
}

vec3 PBRLighting(const in Surface surface, const in PixelParams pixel)
{
    PixelInfo info;
    getPixelInfo(info, pixel, surface);

    vec3 lightColor = vec3(0.0);
    #ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount)
		break;
	    DirectionLight directionLight = getDirectionLight(i, info.positionWS);
	    if (directionLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(directionLight);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // DIRECTIONLIGHT

    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, info.positionWS, gl_FragCoord, u_ProjectionParams);
    #endif // POINTLIGHT || SPOTLIGHT

    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo, info.positionWS);
	    if (pointLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(pointLight, info.normalWS, info.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // POINTLIGHT

    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, info.positionWS);
	    if (spotLight.lightMode == LightMode_Mix)
		{
		    continue;
		}
	    Light light = getLight(spotLight, info.normalWS, info.positionWS);
	    lightColor += PBRLighting(surface, info, light) * light.attenuation;
	}
    #endif // SPOTLIGHT

    vec3 giColor = PBRGI(surface, info);

    return lightColor + giColor;
}

#endif // pbrFrag_lib