#define SHADER_NAME CompositeFS

#include "Color.glsl";

varying vec2 v_Texcoord0;

void main()
{

    vec3 baseColor = texture2D(u_MainTex, v_Texcoord0).rgb;
#ifdef Gamma_u_MainTex
    baseColor = gammaToLinear(baseColor);
#endif // Gamma_u_MainTex

    vec4 samplevalue = texture2D(u_BlurCoCTex, v_Texcoord0);
    vec3 farColor = samplevalue.rgb;
    float coc = texture2D(u_FullCoCTex, v_Texcoord0).r;

    vec3 dstColor = vec3(0.0);
    float dstAlpha = 1.0;

    float blend = sqrt(coc * 3.14 * 2.0);
    dstColor = farColor * clamp(blend, 0.0, 1.0);
    dstAlpha = clamp(1.0 - blend, 0.0, 1.0);

    gl_FragColor = vec4(baseColor * dstAlpha + dstColor, 1.0);

    gl_FragColor = outputTransform(gl_FragColor);
}