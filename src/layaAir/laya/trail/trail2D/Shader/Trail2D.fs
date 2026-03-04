#define SHADER_NAME Trail2DFS

varying vec2 v_Texcoord0;
varying vec4 v_Color;
#include "Sprite2DFrag.glsl";



void main(){
    vec4 color =  v_Color;
    vec4 textureColor = texture2D(u_baseRender2DTexture, v_Texcoord0);
    textureColor = transspaceColor(textureColor);
    vec4 renderColor = u_baseRenderColor;
    #ifdef GAMMASPACE
        renderColor = linearToGamma(renderColor);
    #endif
    color *= textureColor * renderColor;
    gl_FragColor = color;
}