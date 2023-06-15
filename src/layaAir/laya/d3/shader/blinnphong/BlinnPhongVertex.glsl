#if !defined(BlinnPhongVertex_lib)
    #define BlinnPhongVertex_lib

    #include "ShadingVertex.glsl";

void initPixelParams(inout PixelParams params, in Vertex vertex)
{
    shadingPixelParams(params, vertex);
    sharePixelParams(params);
}

#endif // BlinnPhongVertex_lib