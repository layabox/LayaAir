#if defined(GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

#include "DepthNormalUtil.glsl";
/*camera 传入的Texture*/
uniform sampler2D u_CameraDepthTexture;
uniform vec4 u_ZBufferParams;

varying vec2 v_Texcoord0;

void main(){
    vec4 col;
    vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);
    float depth = texture2D(u_CameraDepthTexture,uv).x;//Linear01Depth(texture2D(u_CameraDepthTexture,v_Texcoord0).r,u_ZBufferParams);
    depth =Linear01Depth(depth,u_ZBufferParams);
    col = vec4(depth,depth,depth,1.0);
    gl_FragColor = col;
}