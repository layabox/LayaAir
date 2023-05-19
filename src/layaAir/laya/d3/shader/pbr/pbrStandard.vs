#define SHADER_NAME PBRStandardVS

#include "Math.glsl";

#include "Scene.glsl";
#include "SceneFogInput.glsl"

#include "Camera.glsl";
#include "Sprite3DVertex.glsl";

#include "ShadingVertex.glsl";

#if defined(DETAILTEXTURE) || defined(DETAILNORMAL)
varying vec2 v_DetailUV;
#endif

void main()
{
    Vertex vertex;
    getVertexParams(vertex);

    PixelParams pixel;
    initPixelParams(pixel, vertex);

#if defined(DETAILTEXTURE) || defined(DETAILNORMAL)
    #ifdef UV
    v_DetailUV = transformUV(vertex.texCoord0, u_DetailTillingOffset);
    #else // UV
    v_DetailUV = vec2(0.0);
    #endif
#endif

    gl_Position = getPositionCS(pixel.positionWS);

    gl_Position = remapPositionZ(gl_Position);

#ifdef FOG
    FogHandle(gl_Position.z);
#endif
}