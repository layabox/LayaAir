#define SHADER_NAME BlinnPhongFS

#include "Color.glsl";

#include "Scene.glsl";
#include "SceneFog.glsl";

#include "Camera.glsl";
#include "Sprite3DFrag.glsl";

#include "BlinnPhongFrag.glsl";

void getBinnPhongSurfaceParams(inout Surface surface, in PixelParams pixel)
{
#ifdef UV
    vec2 uv = transformUV(pixel.uv0, u_TilingOffset);
#else // UV
    vec2 uv = vec2(0.0);
#endif // UV

    surface.diffuseColor = u_DiffuseColor.rgb;
    surface.alpha = u_DiffuseColor.a;

#ifdef COLOR
    #ifdef ENABLEVERTEXCOLOR
    surface.diffuseColor *= pixel.vertexColor.xyz;
    surface.alpha *= pixel.vertexColor.a;
    #endif // ENABLEVERTEXCOLOR
#endif // COLOR

#ifdef DIFFUSEMAP
    vec4 diffuseSampler = texture2D(u_DiffuseTexture, uv);
    #ifdef Gamma_u_DiffuseTexture
    diffuseSampler = gammaToLinear(diffuseSampler);
    #endif // Gamma_u_DiffuseTexture
    surface.diffuseColor *= u_DiffuseColor.rgb * diffuseSampler.rgb * u_AlbedoIntensity;
    surface.alpha *= diffuseSampler.a;
#endif // DIFFUSEMAP

    surface.diffuseColor *= u_AlbedoIntensity;

    surface.normalTS = vec3(0.0, 0.0, 1.0);
#ifdef NORMALMAP
    vec3 normalSampler = texture2D(u_NormalTexture, uv).rgb;
    normalSampler = normalize(normalSampler * 2.0 - 1.0);
    normalSampler.y *= -1.0;
    surface.normalTS = normalSampler;
#endif // NORMALMAP

#ifdef SPECULARMAP
    vec4 specularSampler = texture2D(u_SpecularTexture, uv);
    #ifdef Gamma_u_SpecularTexture
    specularSampler = gammaToLinear(specularSampler);
    #endif // Gamma_u_SpecularTexture
    surface.gloss = specularSampler.rgb;
#else // SPECULARMAP
    #ifdef DIFFUSEMAP
    surface.gloss = vec3(diffuseSampler.a);
    #else // DIFFUSEMAP
    surface.gloss = vec3(1.0, 1.0, 1.0);
    #endif // DIFFUSEMAP
#endif // SPECULARMAP
    surface.specularColor = u_MaterialSpecular.rgb;
    surface.shininess = u_Shininess;
}

void main()
{
    PixelParams pixel;
    getPixelParams(pixel);

    Surface surface;
    getBinnPhongSurfaceParams(surface, pixel);

#ifdef ALPHATEST
    if (surface.alpha < u_AlphaTestValue)
	{
	    discard;
	}
#endif // ALPHATEST

    vec3 surfaceColor = vec3(0.0);

    surfaceColor = BlinnPhongLighting(surface, pixel);

#ifdef FOG
    surfaceColor = sceneLitFog(surfaceColor);
#endif // FOG

    gl_FragColor = vec4(surfaceColor, surface.alpha);
}
