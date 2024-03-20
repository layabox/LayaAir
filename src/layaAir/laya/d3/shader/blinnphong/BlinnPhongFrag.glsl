#if !defined(BlinnPhongFrag_lib)
    #define BlinnPhongFrag_lib

    #include "BlinnPhongLighting.glsl";

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

    info.viewDir = normalize(u_CameraPos - info.positionWS);

    #ifdef LIGHTMAP
	#ifdef UV1
    info.lightmapUV = pixel.uv1;
	#endif // UV1
    #endif // LIGHTMAP
}

vec3 BlinnPhongLighting(const in Surface surface, const in PixelParams pixel)
{
    PixelInfo info;
    getPixelInfo(info, pixel, surface);

    vec3 positionWS = info.positionWS;
    vec3 normalWS = info.normalWS;
    vec3 v = info.viewDir;

    vec3 lightColor = vec3(0.0, 0.0, 0.0);

    #ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount) break;
	    DirectionLight directionLight = getDirectionLight(i, positionWS);
	    // if (directionLight.lightMode == LightMode_Mix)
		// {
		//     continue;
		// }
        if (directionLight.lightMode != LightMode_Mix) {
	        Light light = getLight(directionLight);
	        lightColor += BlinnPhongLighting(surface, light, info) * light.attenuation;
        }
	}
    #endif // DIRECTIONLIGHT

    #if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, positionWS, gl_FragCoord, u_ProjectionParams);
    #endif // POINTLIGHT || SPOTLIGHT

    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x) break;
	    PointLight pointLight = getPointLight(i, clusterInfo, positionWS);
	    // if (pointLight.lightMode == LightMode_Mix)
		// {
		//     continue;
		// }
        if (pointLight.lightMode != LightMode_Mix) {
	        Light light = getLight(pointLight, normalWS, positionWS);
	        lightColor += BlinnPhongLighting(surface, light, info) * light.attenuation;
        }
	}
    #endif // POINTLIGHT

    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)	break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, positionWS);
	    // if (spotLight.lightMode == LightMode_Mix)
		// {
		//     continue;
		// }
        if (spotLight.lightMode != LightMode_Mix) {
	        Light light = getLight(spotLight, normalWS, positionWS);
	        lightColor += BlinnPhongLighting(surface, light, info) * light.attenuation;
        }
	}
    #endif // SPOTLIGHT

    vec3 giColor = BlinnPhongGI(surface, info);

    return lightColor + giColor;
}

#endif // BlinnPhongFrag_lib