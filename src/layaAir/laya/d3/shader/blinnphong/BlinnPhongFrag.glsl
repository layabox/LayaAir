#if !defined(BlinnPhongFrag_lib)
    #define BlinnPhongFrag_lib

    #include "Lighting.glsl";

    #include "BlinnPhongCommon.glsl";

struct Surface {
    vec3 diffuseColor;
    vec3 specularColor;
    float shininess;
    vec3 gloss;
    float alpha;
    float alphaClip;
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

    #ifdef NEEDTBN
    params.tangentWS = normalize(v_TangentWS);
    params.biNormalWS = normalize(v_BiNormalWS);
    mat3 TBN = mat3(params.tangentWS, params.biNormalWS, params.normalWS);
    #endif // NEEDTBN

    #ifdef NORMALMAP
    vec3 normalSampler = texture2D(u_NormalTexture, params.uv0).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    params.normalWS = normalize(TBN * normalSampler);
    #endif // NORMALMAP
}

    #if defined(LIGHTING)

vec3 BlinnPhongLighting(in Surface surface, in Light light, in PixelParams pixel)
{
    vec3 l = normalize(-light.dir);
    vec3 v = pixel.viewDir;

    vec3 normalWS = pixel.normalWS;

    vec3 diffuseColor = surface.diffuseColor;
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

vec3 BlinnPhongLighting(const in Surface surface, const in PixelParams pixel)
{
    vec3 positionWS = pixel.positionWS;

    vec3 lightColor = vec3(0.0, 0.0, 0.0);

	#ifdef DIRECTIONLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= DirectionCount)
		break;
	    DirectionLight directionLight = getDirectionLight(i, positionWS);
	    Light light = getLight(directionLight);
	    lightColor += BlinnPhongLighting(surface, light, pixel);
	}
	#endif // DIRECTIONLIGHT

	#if defined(POINTLIGHT) || defined(SPOTLIGHT)
    ivec4 clusterInfo = getClusterInfo(u_View, u_Viewport, v, gl_FragCoord, u_ProjectionParams);

	    #ifdef POINTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.x)
		break;
	    PointLight pointLight = getPointLight(i, clusterInfo, positionWS);
	    Light light = getLight(pointLight, surface.normalWS, positionWS);
	    lightColor += BlinnPhongLighting(surface, light, pixel);
	}
	    #endif // POINTLIGHT

	    #ifdef SPOTLIGHT
    for (int i = 0; i < CalculateLightCount; i++)
	{
	    if (i >= clusterInfo.y)
		break;
	    SpotLight spotLight = getSpotLight(i, clusterInfo, positionWS);
	    Light light = getLight(spotLight, surface.normalWS, positionWS);
	    lightColor += BlinnPhongLighting(surface, light, pixel);
	}
	    #endif // SPOTLIGHT

	#endif // POINTLIGHT || SPOTLIGHT

    return lightColor;
}

    #endif // LIGHTING

// GI
vec3 BlinnPhongGI(const in Surface surface, in PixelParams pixel)
{
    vec3 color = vec3(0.0);
    #ifdef LIGHTMAP
        #ifdef UV1
        vec2 lightmapUV = pixel.uv1;
        vec3 bakedColor = getBakedLightmapColor(lightmapUV);
        color = bakedColor;
        #endif // UV1
    #else 
        #ifdef GI_AMBIENT_SH
            vec3 n = pixel.normalWS;
            vec3 indirectDiffuse = max(diffuseIrradiance(n), 0.0) / PI;
            color = indirectDiffuse;
        #else
            color = u_AmbientColor*surface.diffuseColor;
        #endif
    #endif // LIGHTMAP

    return color * surface;
}

#endif // BlinnPhongFrag_lib