#define SHADER_NAME ScallerBlitFS
#define NUM_SAMPLES 50
#include "Color.glsl";

// float u_BlurWidth;
// float u_Intensity;
// vec4 u_Center;

varying vec2 v_Texcoord0;

void main()
{
    vec4 color = vec4(0.0, 0.0, 0.0, 1.0);
    vec2 ray = v_Texcoord0.xy - u_Center.xy;
    for (int i = 0; i < NUM_SAMPLES; i++)
    {
        float scale = 1.0 - u_BlurWidth * (float(i) / 
            float(NUM_SAMPLES - 1));
        color.xyz += texture2D(u_MainTex, (ray * scale) + 
            u_Center.xy).xyz / float(NUM_SAMPLES);
    }
   color = color * u_Intensity*u_scatterColor;

   gl_FragColor.rgb = color.rgb;
}
