#define SHADER_NAME glow2D

#include "OutputTransform.glsl";

varying vec2 v_Texcoord0;

void main()
{
    const float c_BlurRadius = 12.0;
    const float c_PairedRadius = 6.0;
    const float c_KernelWeight = 25.0 * 25.0;
    // The legacy shader accumulated 11x11 samples but divided by 10x10.
    // Preserve its 121/100 perceived intensity with a dense single-pass kernel.
    const float c_LegacyIntensity = 1.21;
    vec2 textureSize = u_blurInfo2.xy;
    vec2 filterOffset = -u_blurInfo1.zw / textureSize;
    vec2 filterScale = u_blurInfo1.xy / textureSize / c_BlurRadius;
    float alpha = 0.0;
    for (float y = -c_PairedRadius; y <= c_PairedRadius; ++y) {
        float sampleY = y == 0.0 ? 0.0 : sign(y) * (abs(y) * 2.0 - 0.5);
        float weightY = y == 0.0 ? 1.0 : 2.0;
        for (float x = -c_PairedRadius; x <= c_PairedRadius; ++x) {
            float sampleX = x == 0.0 ? 0.0 : sign(x) * (abs(x) * 2.0 - 0.5);
            float weightX = x == 0.0 ? 1.0 : 2.0;
            vec2 sampleOffset = vec2(sampleX, sampleY) * filterScale;
            alpha += texture2D(u_MainTex, v_Texcoord0.xy + filterOffset + sampleOffset).a * weightX * weightY;
        }
    }
    alpha = alpha / c_KernelWeight * u_blurInfo2.z * c_LegacyIntensity;
    gl_FragColor = vec4(u_color.rgb, alpha);
    gl_FragColor.rgb *= gl_FragColor.a;
}
