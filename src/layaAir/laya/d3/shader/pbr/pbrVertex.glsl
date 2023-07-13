#if !defined(pbrVertex_lib)
    #define pbrVertex_lib

    #include "ShadingVertex.glsl";

    #ifdef THICKNESS
// xyz: world scale, w: length(xyz)
varying vec4 v_WorldScale;
    #endif // THICKNESS

void initPixelParams(inout PixelParams params, in Vertex vertex)
{
    shadingPixelParams(params, vertex);
    sharePixelParams(params);

    #ifdef THICKNESS
    mat4 worldMat = getWorldMatrix();
    v_WorldScale.x = length(vec3(worldMat[0].xyz));
    v_WorldScale.y = length(vec3(worldMat[1].xyz));
    v_WorldScale.z = length(vec3(worldMat[2].xyz));
    v_WorldScale.w = length(v_WorldScale.xyz);
    #endif // THICKNESS
}

#endif // pbrVertex_lib