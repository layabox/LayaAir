export enum RenderCapable{
    Element_Index_Uint32,//Index Usage 32
    TextureFormat_R32G32B32A32,//Texturefloat32
    TextureFormat_R16G16B16A16,//TextureFloat16
    Texture_anisotropic,//anisotropic function
    RenderTextureFormat_R16G16B16A16,//Rendertexture Float16
    RenderTextureFormat_Depth,//depthTexture
    RenderTextureFormat_ShadowMap,//shadowMap Texture
    Vertex_VAO,//VAO
    DrawElement_Instance,//Instance
    Shader_TextureLod,//Texture lod sampler
    COMPRESS_TEXTURE_S3TC,//compress Texture
    COMPRESS_TEXTURE_PVRTC,
    COMPRESS_TEXTURE_ETC1,
    COMPRESS_TEXTURE_ETC,
    COMPRESS_TEXTURE_ASTC
}