#if !defined(BlinnPhongFrag_lib)
    #define BlinnPhongFrag_lib

    #include "Lighting.glsl";

    #include "BlinnPhongCommon.glsl";

void getBinnPhongSurfaceParams(inout BlinnPhongSurface surface, in VertexParams params)
{
    surface.positionWS = params.positionWS;
    // todo normal map
    surface.normalWS = params.normalWS;
    surface.viewDirectionWS = normalize(v_ViewDir);

    // todo uniform
    surface.diffuseColor = vec3(1.0, 1.0, 1.0);
    surface.specularColor = vec3(1.0, 1.0, 1.0);
    surface.shininess = 0.078125;
    surface.gloss = vec3(1.0, 1.0, 1.0);
    surface.alpha = 1.0;
    surface.alphaClip = 1.0;
}

    #if defined(LIGHTING)

vec3 BlinnPhongLighting(in BlinnPhongSurface surface, in Light light, in vec3 v)
{
    vec3 l = normalize(-light.dir);

    vec3 diffuseColor = surface.diffuseColor;
    vec3 normalWS = surface.normalWS;
    float shininess = surface.shininess;
    vec3 specularColor = surface.specularColor;
    vec3 gloss = surface.gloss;

    // difffuse
    float ndl = max(0.0, dot(normalWS, l));
    vec3 lightDiffuse = light.color * diffuseColor * ndl;

    // specular
    mediump vec3 h = normalize(v + l);
    lowp float ndh = max(0.0, dot(h, normalWS));
    float specularIntensity = pow(ndh, shininess * 128.0);
    vec3 lightSpecular = light.color * specularColor * specularIntensity * gloss;

    return lightDiffuse + lightSpecular;
}

vec3 BlinnPhongLighting(in BlinnPhongSurface surface)
{
    vec3 v = surface.viewDirectionWS;

    vec3 lightColor = vec3(0.0, 0.0, 0.0);

	#ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount)
		break;
	    DirectionLight directionLight = getDirectionLight(i, surface.positionWS);
	    Light light = getLight(directionLight);
	    lightColor += BlinnPhongLighting(surface, light, v);
	}
	#endif // DIRECTIONLIGHT

	#if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, v, gl_FragCoord, u_ProjectionParams);

	    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo, surface.positionWS);
	    Light light = getLight(pointLight, surface.normalWS, surface.positionWS);
	    lightColor += BlinnPhongLighting(surface, light, v);
	}
	    #endif // POINTLIGHT

	    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, surface.positionWS);
	    Light light = getLight(spotLight, surface.normalWS, surface.positionWS);
	    lightColor += BlinnPhongLighting(surface, light, v);
	}
	    #endif // SPOTLIGHT

	#endif // POINTLIGHT || SPOTLIGHT

    return lightColor;
}

    #endif // LIGHTING

#endif // BlinnPhongFrag_lib