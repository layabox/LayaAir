export enum RenderCapable {
    Element_Index_Uint32,//Index Usage 32
    Element_Index_Uint8,
    TextureFormat_R32G32B32A32,//Texturefloat32
    TextureFormat_R16G16B16A16,//TextureFloat16
    Texture_anisotropic,//anisotropic function
    RenderTextureFormat_R16G16B16A16,//Rendertexture Float16
    RenderTextureFormat_R32G32B32A32, // rendertexture float32
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
    StorageBuffer,
    ComputeShader,
    IndirectDraw,
    /**
     * @en The backend supports non-power-of-two textures with Repeat/Mirrored wrapping and mipmaps. Engine paths enable these features separately.
     * @zh 后端支持非二次幂纹理的重复/镜像寻址和 mipmap，引擎各路径分别接入这些能力。
     */
    Texture_NPOTFull,
}
