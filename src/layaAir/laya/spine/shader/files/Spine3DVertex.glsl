#if !defined(SpineVertex_lib)
    #define SpineVertex_lib

#include "SpineVertexCommon.glsl";

uniform mat4 u_WorldMat;

uniform vec4 u_WorldInvertFront; // x: invert front face,yzw NodeCustomData

struct Vertex {

    vec3 positionOS;

    vec3 normalOS;

    vec2 texCoord0;

    #ifdef UV1
        vec2 texCoord1;
    #endif // UV1

    vec4 vertexColor;

    #ifdef LIGHTMAP
        vec4 lightmapScaleOffset;
	#endif LIGHTMAP
};

#ifdef LIGHTMAP
    #ifndef GPU_INSTANCE
        uniform vec4 u_LightmapScaleOffset;
    #endif // GPU_INSTANCE

    vec4 getLightmapScaleOffset(){
        
        #ifdef GPU_INSTANCE
            return a_LightmapScaleOffset;
        #else
            return u_LightmapScaleOffset;
        #endif // GPU_INSTANCE
    }
#endif // LIGHTMAP

void getVertexParams(inout Vertex vertex)
{
    vec4 spinePos2D = getSpinePos();
    vertex.positionOS = vec3(spinePos2D.xy, 0.0);
    
    vertex.normalOS = vec3(0.0, 0.0, 1.0);
    vertex.vertexColor = vec4(1.0,1.0,1.0,1.0);

    vertex.vertexColor = a_color;
    #ifdef Gamma_u_spineTexture
        vertex.vertexColor.rgb = pow(vertex.vertexColor.rgb, vec3(2.2));
    #endif
    vertex.vertexColor.rgb *=a_color.a;

    vertex.texCoord0 = a_uv;

    #ifdef LIGHTMAP
        vertex.lightmapScaleOffset = getLightmapScaleOffset();
	#endif LIGHTMAP
}

#endif // SpineVertex_lib