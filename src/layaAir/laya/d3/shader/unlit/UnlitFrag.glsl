#ifndef UnlitFrag_lib
#define UnlitFrag_lib

#include "DBuffer.glsl";
#include "SceneFog.glsl";

vec3 unlitSurfaceColor(in vec3 color)
{
    applyDBufferColor(color);
    #ifdef FOG
    color = scenUnlitFog(color);
    #endif
    return color;
}

#endif
