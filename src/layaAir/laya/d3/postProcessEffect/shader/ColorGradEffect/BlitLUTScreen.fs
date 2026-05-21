#define SHADER_NAME BlitLUTFS

#include "Color.glsl";

// u_Lut / u_LutParams / u_CustomLut / u_CustomLutParams 已在 blitLUTShader 的
// uniformMap 中注册，由引擎自动生成声明，此处不再声明。

#include "ColorGrading.glsl";
#include "LUT.glsl";

varying vec2 v_Texcoord0;

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
#ifdef Gamma_u_MainTex
    gl_FragColor = gammaToLinear(gl_FragColor);
#endif // Gamma_u_MainTex

    vec3 color = gl_FragColor.rgb;
    // gl_FragColor.rgb = applyLut(color, 1.0, u_Lut, u_LutParams);
    color *= u_LutParams.w;
    color = applyLut(linearToLogC(color), u_LutParams.xyz);

#ifdef CUSTOMLUT

    float contrib = u_CustomLutParams.w;
    vec3 gamma = linearToGamma(color);
    vec3 userLut = applyLut(u_CustomLut, gamma, u_CustomLutParams);
    gamma = mix(gamma, userLut, contrib);
    color = gammaToLinear(gamma);

#endif // CUSTOMLUT

    gl_FragColor.rgb = color;

    gl_FragColor = outputTransform(gl_FragColor);
}
