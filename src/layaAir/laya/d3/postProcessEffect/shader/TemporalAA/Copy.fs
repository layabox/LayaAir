#define SHADER_NAME TemporalAACopyFS

#include "Color.glsl";

void main()
{
    // 历史与混合结果同尺寸，沿用附件的物理方向。
    vec2 uv = gl_FragCoord.xy * u_MainTex_TexelSize.xy;
    gl_FragColor = texture2DLodEXT(u_MainTex, uv, 0.0);
#ifdef Gamma_u_MainTex
    gl_FragColor = gammaToLinear(gl_FragColor);
#endif
    // 历史纹理为线性空间，此处不做输出变换。
}
