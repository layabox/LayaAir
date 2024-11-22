#define SHADER_NAME 2DLineFS

#include "Sprite2DFrag.glsl"

varying vec2 v_position;
varying vec4 v_linePionts;
varying float v_lineLength;
varying vec2 v_linedir;

uniform float u_lineWidth;
uniform vec3 u_dashed;
uniform vec4 u_TilingOffset;


vec2 dotToline(in vec2 a, vec2 b,in vec2 p){
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return ba*h + a;
}

vec2 transformUV(in vec2 texcoord, in vec4 tilingOffset)
{
    vec2 uv = texcoord * tilingOffset.zw + tilingOffset.xy;
    return uv;
}


void main(){
    vec2 p = dotToline(v_linePionts.xy, v_linePionts.zw, v_position);
    float d = u_lineWidth*0.5 - length(p - v_position);
    vec2 left =  v_linePionts.xy - v_linedir;
    vec2 p1 = dotToline(left, v_linePionts.zw+v_linedir, v_position);
    float t = v_lineLength + length(left- p1)-u_dashed.z;
    d *= step(fract(t/u_dashed.x), u_dashed.y);
    vec2 uv =  transformUV(vec2(t,v_texcoord.y),u_TilingOffset);
    vec4 textureColor = texture2D(u_baseRender2DTexture, fract(uv));
    textureColor = transspaceColor(textureColor*u_baseRenderColor);

    gl_FragColor = vec4(textureColor.rgb,textureColor.a*smoothstep(0.0,2.0,d));
}