#if !defined(pbrFrag_lib)
    #define pbrFrag_lib

    #include "PBRLighting.glsl";

    #include "ShadingFrag.glsl";

void getPixelInfo(inout PixelInfo info, const in PixelParams pixel, const in Surface surface)
{
    info.positionWS = pixel.positionWS;
    info.vertexNormalWS = pixel.normalWS;

    #ifdef TANGENT
    info.normalWS = normalize(pixel.TBN * surface.normalTS);
    #else // TANGENT
    info.normalWS = pixel.normalWS;
    #endif // TANGENT

    info.tangentWS = pixel.tangentWS;
    info.biNormalWS = pixel.biNormalWS;

    info.viewDir = normalize(u_CameraPos - info.positionWS);
    info.NoV = min(max(dot(info.normalWS, info.viewDir), MIN_N_DOT_V), 1.0);

    info.dfg = prefilteredDFG_LUT(surface.perceptualRoughness, info.NoV);

    #ifdef CLEARCOAT
	#ifdef CLEARCOAT_NORMAL
    info.clearCoatNormal = normalize(pixel.TBN * surface.clearCoatNormalTS);
	#else // CLEARCOAT_NORMAL
    info.clearCoatNormal = info.vertexNormalWS;
	#endif // CLEARCOAT_NORMAL
    info.clearCoatNoV = min(max(dot(info.clearCoatNormal, info.viewDir), MIN_N_DOT_V), 1.0);
    #endif // CLEARCOAT

    #ifdef ANISOTROPIC
    mat3 anisotripyTBN = mat3(info.tangentWS, info.biNormalWS * -1.0, info.normalWS);
    info.anisotropicT = anisotripyTBN * normalize(vec3(surface.anisotropyDirection, 0.0));
    info.anisotropicB = cross(info.vertexNormalWS, info.anisotropicT);
    info.ToV = dot(info.anisotropicT, info.viewDir);
    info.BoV = dot(info.anisotropicB, info.viewDir);
    info.at = mix(surface.roughness, 1.0, pow2(surface.anisotropy));
    info.ab = surface.roughness;
    #endif // ANISOTROPIC

    #ifdef LIGHTMAP
	#ifdef UV1
    info.lightmapUV = pixel.uv1;
	#endif // UV1
    #endif // LIGHTMAP
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