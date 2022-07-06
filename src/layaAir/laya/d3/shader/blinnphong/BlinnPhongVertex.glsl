#if !defined(BlinnPhongVertex_lib)
    #define BlinnPhongVertex_lib

    #include "BlinnPhongCommon.glsl";

void initBlinnPhongSurface(in VertexParams params)
{
    v_ViewDir = u_CameraPos - params.positionWS;
}

#endif // BlinnPhongVertex_lib