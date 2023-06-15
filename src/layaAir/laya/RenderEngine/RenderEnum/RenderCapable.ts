export enum RenderCapable {
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
    COMPRESS_TEXTURE_S3TC,//compress Texture dds
    COMPRESS_TEXTURE_S3TC_SRGB,//Compress Texture dds srgb
    COMPRESS_TEXTURE_PVRTC,//Compress Texture PVR
    COMPRESS_TEXTURE_ETC1,//Compress Texture ktx
    COMPRESS_TEXTURE_ETC,//Compress Texture ktx
    COMPRESS_TEXTURE_ASTC,//Compress Texture astc
    Texture_SRGB,//Textrue srgb   
    MSAA,//MSAA
    UnifromBufferObject,
    Texture3D,
    Texture_FloatLinearFiltering,
    Texture_HalfFloatLinearFiltering,
}