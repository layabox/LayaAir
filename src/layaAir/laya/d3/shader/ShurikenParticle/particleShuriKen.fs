#define SHADER_NAME ParticleFS

#include "Scene.glsl";
#include "SceneFog.glsl";
#include "Color.glsl";

const vec4 c_ColorSpace = vec4(4.59479380, 4.59479380, 4.59479380, 2.0);

varying vec4 v_Color;
varying vec2 v_TextureCoordinate;
// uniform sampler2D u_texture;
// uniform vec4 u_Tintcolor;

#ifdef RENDERMODE_MESH
varying vec4 v_MeshColor;
#endif

void main()
{
    vec4 color;
#ifdef RENDERMODE_MESH
    color = v_MeshColor;
#else
    color = vec4(1.0);
#endif

#ifdef DIFFUSEMAP
    vec4 colorT = texture2D(u_texture, v_TextureCoordinate);
    #ifdef Gamma_u_texture
        colorT = gammaToLinear(colorT);
    #endif // Gamma_u_SpecularTexture
    #ifdef TINTCOLOR
    color *= colorT * u_Tintcolor * c_ColorSpace * v_Color;
    #else
    color *= colorT * v_Color;
    #endif // TINTCOLORd
#else
    #ifdef TINTCOLOR
    color *= u_Tintcolor * c_ColorSpace * v_Color;
    #else
    color *= v_Color;
    #endif // TINTCOLOR
#endif

#ifdef ALPHATEST
    if (color.a < u_AlphaTestValue)
	{
	    discard;
	}
#endif // ALPHATEST


#ifdef FOG
    color.rgb = scenUnlitFog(color.rgb);
#endif // FOG
    gl_FragColor = color;

}