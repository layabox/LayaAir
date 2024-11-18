#define SHADER_NAME 2DLineFS

#include "Sprite2DFrag.glsl"

varying vec2 v_position;
varying vec4 v_linePionts;
varying float v_lineLength;

uniform float u_lineWidth;
uniform vec3 u_dashed;

vec2 dotToline(in vec2 a, vec2 b,in vec2 p){
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return ba*h + a;
}

void main(){
    vec2 p = dotToline(v_linePionts.xy, v_linePionts.zw, v_position);
    float d = u_lineWidth*0.5 - length(p - v_position);
    #ifdef USE_DASHED
        float t = v_lineLength + length(v_linePionts.xy- p)-u_dashed.z;
        t = mod(t, u_dashed.x)/u_dashed.x;
        d *= step(t, u_dashed.y);
    #endif
    gl_FragColor = vec4(u_baseRenderColor.rgb,smoothstep(0.0,2.0,d));
}