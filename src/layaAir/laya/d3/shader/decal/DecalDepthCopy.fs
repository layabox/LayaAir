#define SHADER_NAME DecalDepthCopyFS

// Camera-owned depth keeps its explicit precision outside material uniform generation.
// 相机级深度参数保留显式精度，不经过材质 uniform 声明生成。
uniform highp sampler2D u_DecalDepthTexture;

varying vec2 v_Texcoord0;

void main()
{
    float depth = clamp(texture2D(u_DecalDepthTexture, v_Texcoord0).r, 0.0, 1.0);
    // Base-255 packing preserves depth precision on devices without float color targets.
    // Exact 1 is a far-plane sentinel. Decode with min(dot(rgba, inverseWeights), 1).
    // 使用 255 进制打包，在不支持浮点颜色目标的设备上保留深度精度。
    // 精确的 1 作为远面标记，解码公式为 min(dot(rgba, inverseWeights), 1)。
    vec4 packedDepth = fract(depth * vec4(1.0, 255.0, 65025.0, 16581375.0));
    packedDepth -= packedDepth.yzww * vec4(1.0 / 255.0, 1.0 / 255.0, 1.0 / 255.0, 0.0);
    gl_FragColor = depth >= 1.0 ? vec4(1.0) : packedDepth;
}
