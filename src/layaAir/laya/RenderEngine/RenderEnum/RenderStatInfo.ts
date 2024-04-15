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
    RC_ALLTexture,  //TODO
    RC_Texture2D,
    RC_TextureCube,
    RC_Texture3D,
    RC_Texture2DArray,
    M_ALLRenderTexture,
    RC_ALLRenderTexture,
    Count
}
