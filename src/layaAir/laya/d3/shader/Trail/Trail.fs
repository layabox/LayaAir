#define SHADER_NAME TrailFS

#include "Scene.glsl";
#include "SceneFog.glsl";

varying vec2 v_Texcoord0;
varying vec4 v_Color;

void main()
{
    vec4 color = 2.0 * u_MainColor * v_Color;
#ifdef MAINTEXTURE
    vec4 mainTextureColor = texture2D(u_MainTexture, v_Texcoord0);
    color *= mainTextureColor;
#endif

#ifdef FOG
    color.xyz = scenUnlitFog(color.xyz);
#endif // FOG
    gl_FragColor = color;
}
