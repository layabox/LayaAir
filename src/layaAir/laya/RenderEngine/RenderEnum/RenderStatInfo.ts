/**
 * 渲染统计数据
 */
export enum GPUEngineStatisticsInfo {
    C_UniformBufferUploadCount,
    //buffer change count
    C_GeometryBufferUploadCount,
    //triangle count
    C_TriangleCount,
    //drawCall
    C_SetRenderPassCount,
    C_DrawCallCount,
    C_Instancing_DrawCallCount,
    //shader compile
    C_ShaderCompile,
    T_ShaderCompile,

    FrameClearCount,//frame clear flag 需要每帧统计的数据写道上面
    //Memory
    M_GPUMemory,
    M_GPUBuffer,
    M_VertexBuffer,
    M_IndexBuffer,
    M_UniformBlockBuffer,//Webgl TODO
    RC_GPUBuffer,
    RC_VertexBuffer,
    RC_IndexBuffer,
    RC_UniformBlockBuffer,
    //Texture
    M_ALLTexture,
    M_Texture2D,
    M_TextureCube,
    M_Texture3D,
    M_Texture2DArray,
    RC_ALLTexture,
    RC_Texture2D,
    RC_TextureCube,
    RC_Texture3D,
    RC_Texture2DArray,
    M_ALLRenderTexture,
    RC_ALLRenderTexture,
    Count
}


/**
 * 渲染流程统计数据
 */
export enum RenderPassStatisticsInfo {
    T_CameraRender,
    T_Render_OpaqueRender,
    T_Render_TransparentRender,
    T_Render_PostProcess,
    T_Render_CameraEventCMD,
    T_Render_ShadowPassMode,
    T_Render_CameraOtherDest,
    T_RenderPreUpdate,
    T_OtherRender,//除了meshrender,skinRender，T_OnlyShurikenParticleRender
    T_OnlyMeshRender,
    T_OnlySkinnedMeshRender,
    T_OnlyShurikenParticleRender,
    T_CameraMainCull,
    T_ShadowMapCull,
    RenderPassStatisticCount
}