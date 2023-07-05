#define SHADER_NAME PBRDepthFS

#include "DepthFrag.glsl";
varying vec2 v_Texcoord0;
#ifdef COLOR
    varying vec4 v_VertexColor;
#endif // COLOR
void main()
{
    #ifdef ALPHATEST
        float alpha = u_AlbedoColor.a;    
    #ifdef COLOR
        #ifdef ENABLEVERTEXCOLOR
            alpha *= v_VertexColor.a;
        #endif // ENABLEVERTEXCOLOR
    #endif // COLOR
    
    #ifdef ALBEDOTEXTURE
        alpha *= texture2D(u_AlbedoTexture, v_Texcoord0).a;
    #endif
        if (alpha < u_AlphaTestValue)
            discard;
    #endif // ALPHATEST

    gl_FragColor = getDepthColor();
}