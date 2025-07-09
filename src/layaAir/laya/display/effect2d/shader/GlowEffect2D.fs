#define SHADER_NAME glow2D

#include "OutputTransform.glsl";

varying vec2 v_Texcoord0;

void main()
{
    const float c_IterationTime = 10.0;
    float floatIterationTotalTime = c_IterationTime * c_IterationTime;
    vec4 vec4Color = vec4(0.0, 0.0, 0.0, 0.0);
    vec2 vec2FilterDir = vec2(-u_blurInfo1.z / u_blurInfo2.x, -u_blurInfo1.w / u_blurInfo2.y);
    vec2 vec2FilterOff = vec2(u_blurInfo1.x / u_blurInfo2.x / c_IterationTime * 2.0, u_blurInfo1.y / u_blurInfo2.y / c_IterationTime * 2.0);
    float maxNum = u_blurInfo1.x * u_blurInfo1.y;
    vec2 vec2Off = vec2(0.0, 0.0);
    float floatOff = c_IterationTime / 2.0;
    for (float i = 0.0; i <= c_IterationTime; ++i){
        for (float j = 0.0; j <= c_IterationTime; ++j){
            vec2Off = vec2(vec2FilterOff.x * (i - floatOff), vec2FilterOff.y * (j - floatOff));
            vec4Color += texture2D(u_MainTex, v_Texcoord0.xy + vec2FilterDir + vec2Off);
        }
    }
    vec4Color /= floatIterationTotalTime;
    gl_FragColor = vec4(u_color.rgb, vec4Color.a * u_blurInfo2.z);
    gl_FragColor.rgb *= gl_FragColor.a;
}