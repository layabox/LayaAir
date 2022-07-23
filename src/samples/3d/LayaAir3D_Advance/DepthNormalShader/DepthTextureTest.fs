#define SHADER_NAME DepthTextureTestFS
#include "Camera.glsl";
#include "DepthNormalUtil.glsl";


varying vec2 v_Texcoord0;

void main(){
    vec4 col;
    vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);
    float depth = SAMPLE_DEPTH_TEXTURE(u_CameraDepthTexture,uv);
    depth =Linear01Depth(depth,u_ZBufferParams);
    col = vec4(depth,depth,depth,1.0);
    gl_FragColor = col;
}