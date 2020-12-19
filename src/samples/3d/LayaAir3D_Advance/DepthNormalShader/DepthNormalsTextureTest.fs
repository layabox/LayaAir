#if defined(GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

#include "DepthNormalUtil.glsl";
/*camera 传入的Texture*/
uniform sampler2D u_CameraDepthNormalsTexture;

varying vec2 v_Texcoord0;

void main(){
    vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);
    vec4 col = texture2D(u_CameraDepthNormalsTexture,uv);//Linear01Depth(texture2D(u_CameraDepthTexture,v_Texcoord0).r,u_ZBufferParams);
    vec3 normals;
    float depth;
    DecodeDepthNormal(col,depth,normals);
    col = vec4(normals.x,normals.y,-normals.z,1.0);
    gl_FragColor = col;
}