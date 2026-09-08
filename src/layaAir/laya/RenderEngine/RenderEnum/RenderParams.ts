export enum RenderParams {
    Max_Active_Texture_Count,//可激活的纹理数量，即shader中的最大纹理数量
    Max_Uniform_Count,//最大Uniform数量
    Max_AnisoLevel_Count,//最大各向异性数量
    MAX_Texture_Size,//Shader中的最大纹理
    MAX_Texture_Image_Uint,//图形设备支持的最大纹理数量。
    SHADER_CAPAILITY_LEVEL,//Shader质量
    FLOAT,
    UNSIGNED_BYTE,
    BYTE,
    UNSIGNED_SHORT,
    MaxComputeElement,//最大并行计算数
    /**
     * @en Maximum simultaneous color outputs, including attachment 0. WebGL2 uses the minimum of MAX_COLOR_ATTACHMENTS and MAX_DRAW_BUFFERS; WebGPU uses device.limits. WebGL1 returns 1; unimplemented backends return 0.
     * @zh 同时输出的颜色附件数上限，包含附件 0。WebGL2 取颜色附件和 draw buffers 上限的较小值；WebGPU 读取 device.limits。WebGL1 返回 1，未适配后端返回 0。
     */
    Max_Color_Attachment_Count,
    /**
     * @en WebGPU color attachment byte budget per sample, across all color outputs. A value of 0 means this limit is not exposed by the backend, not unlimited MRT support.
     * @zh WebGPU 所有颜色附件合计的每采样字节预算；0 表示后端不提供此项限制，不表示 MRT 无限制可用。
     */
    Max_Color_Attachment_Bytes_Per_Sample,
}
