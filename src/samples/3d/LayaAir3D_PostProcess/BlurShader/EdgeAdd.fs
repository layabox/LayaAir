#define SHADER_NAME EdgeAdd
varying vec2 v_Texcoord0;

void main()
{
    vec2 uv = v_Texcoord0;
    #ifdef BLITSCREEN_INVERTY
    uv.y = 1.0 - uv.y;
    #endif
    vec4 mainColor = texture2D(u_MainTex,uv);
    vec4 sourceColor = texture2D(u_sourceTexture0,uv);
    float factor = step(sourceColor.x+sourceColor.y+sourceColor.z,0.001);
    vec4 color = mix(sourceColor,mainColor,factor);
    gl_FragColor =color;
}