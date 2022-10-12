#if !defined(BlinnPhongLighting_lib)
    #define BlinnPhongLighting_lib

    #include "Lighting.glsl";
    #include "globalIllumination.glsl";

struct PixelInfo {
    vec3 normalWS;
    vec3 viewDir;

    #ifdef LIGHTMAP
	#ifdef UV1
    vec2 lightmapUV;
	#endif // UV1
    #endif // LIGHTMAP
};

struct Surface {
    vec3 diffuseColor;
    vec3 specularColor;
    float shininess;
    vec3 gloss;
    float alpha;
    float alphaClip;
};

vec3 BlinnPhongLighting(in Surface surface, in Light light, in PixelInfo pixel)
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

vec3 BlinnPhongGI(const in Surface surface, const in PixelInfo info)
{
    vec3 indirect = vec3(0.0);

    #ifdef LIGHTMAP
	#ifdef UV1

    vec2 lightmapUV = info.lightmapUV;
    vec3 bakedColor = getBakedLightmapColor(lightmapUV);
    // todo  surface.diffuseColor ？
    indirect = bakedColor;

	#endif // UV1

    #else // LIGHTMAP

    vec3 n = info.normalWS;
    indirect = diffuseIrradiance(n) * surface.diffuseColor;

    #endif // LIGHTMAP

    return indirect;
}

#endif // BlinnPhongLighting_lib