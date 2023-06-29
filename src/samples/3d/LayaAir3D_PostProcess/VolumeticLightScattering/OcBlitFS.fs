#define SHADER_NAME OcBlitFS
#include "Color.glsl";

// float u_BlurWidth;
// float u_Intensity;
// vec4 u_Center;

varying vec2 v_Texcoord0;

void main()
{

 vec4 color = texture2D(u_MainTex,v_Texcoord0);
    vec2 sunColor =v_Texcoord0 - u_Center;
    sunColor.x*=u_AspecTratio;
    float dist = length(sunColor);
    float spot = 1.0 - smoothstep(0.0 ,u_sunSize, dist);
    color.rgb*=vec3(spot * spot) ;
    gl_FragColor =vec4(color.rgb,1.0);
}
