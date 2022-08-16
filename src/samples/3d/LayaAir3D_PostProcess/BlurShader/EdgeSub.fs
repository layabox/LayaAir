#define SHADER_NAME EdgeSub
varying vec2 v_Texcoord0;

void main()
{
    vec2 uv = v_Texcoord0;
    vec4 blurColor = texture2D(u_sourceTexture0,uv);
    vec4 clearColor = texture2D(u_sourceTexture1,uv);
    float factor = step(clearColor.x+clearColor.y+clearColor.z,0.001);
    vec4 color = blurColor*factor;
    color = (1.0-step(color.x+color.y+color.z,0.15))*vec4(1.0,0.0,0.0,1.0);
    gl_FragColor = color;
}