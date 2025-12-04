#define SHADER_NAME PhysicsLineFS

#include "Sprite2DFrag.glsl"

varying vec2 v_position;
varying vec4 v_linePionts;
varying float v_lineLength;
varying vec2 v_linedir;
varying float v_lineWidth;



vec2 dotToline(in vec2 a, vec2 b,in vec2 p){
    vec2 pa = p-a, ba = b-a;
    float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return ba*h + a;
}



void main(){
    vec2 p = dotToline(v_linePionts.xy, v_linePionts.zw, v_position);
    float d = v_lineWidth*0.5 - length(p - v_position);
    
    vec2 left =  v_linePionts.xy - v_linedir;
    vec2 p1 = dotToline(left, v_linePionts.zw+v_linedir, v_position);
    // 移除虚线计算，直接使用距离值
    vec2 uv =  transformUV(v_texcoord.xy,u_TilingOffset);
    vec4 textureColor = texture2D(u_baseRender2DTexture, fract(uv));
    textureColor = transspaceColor(textureColor*u_baseRenderColor);

    gl_FragColor = vec4(u_baseRenderColor.rgb,textureColor.a*smoothstep(0.0,2.0,d));


    //gl_FragColor = vec4(fract(uv.x) ,fract(uv.y),0.0,textureColor.a*smoothstep(0.0,2.0,d));
}