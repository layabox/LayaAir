#define SHADER_NAME DepthNormalTextureTestFS
#include "Camera.glsl";
#include "DepthNormalUtil.glsl";


varying vec2 v_Texcoord0;

void main()
{
	vec2 uv = vec2(v_Texcoord0.x,1.0-v_Texcoord0.y);
    vec4 col = texture2D(u_CameraDepthNormalsTexture,uv);
    vec3 normals;
    float depth;
    DecodeDepthNormal(col,depth,normals);
    col = vec4(normals,1.0);
    gl_FragColor = col;
}