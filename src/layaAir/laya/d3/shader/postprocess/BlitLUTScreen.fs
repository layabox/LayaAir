#define SHADER_NAME BlitLUTFS

#include "Color.glsl";

#include "ColorGrading.glsl";
#include "LUT.glsl";

uniform sampler2D u_Lut;
uniform vec4 u_LutParams;//w postExposure

    #ifdef CUSTOMLUT
uniform sampler2D u_CustomLut;
uniform vec4 u_CustomLutParams;
    #endif // CUSTOMLUT

varying vec2 v_Texcoord0;

void main()
{
    gl_FragColor = texture2D(u_MainTex, v_Texcoord0);
    vec3 color = gl_FragColor.rgb;
    // gl_FragColor.rgb = applyLut(color, 1.0, u_Lut, u_LutParams);
    color *= u_LutParams.w;
    color = applyLut(u_Lut, linearToLogC(color), u_LutParams.xyz);

    #ifdef CUSTOMLUT

    float contrib = u_CustomLutParams.w;
    vec3 gamma = linearToGamma(color);
    vec3 userLut = applyLut(u_CustomLut, gamma, u_CustomLutParams);
    gamma = mix(gamma, userLut, contrib);
    color = gammaToLinear(gamma);

    #endif // CUSTOMLUT

    gl_FragColor.rgb = color;

    #ifdef GAMMAOUT
        gl_FragColor = linearToGamma(gl_FragColor);
    #endif
}
