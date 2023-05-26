#if !defined(pbrVertex_lib)
    #define pbrVertex_lib

    #include "ShadingVertex.glsl";

void initPixelParams(inout PixelParams params, in Vertex vertex)
{
    shadingPixelParams(params, vertex);
    sharePixelParams(params);
}

#endif // pbrVertex_lib