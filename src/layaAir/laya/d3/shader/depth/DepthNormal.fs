#define SHADER_NAME DepthNormalFS


#include "DepthNormalUtil.glsl";

varying vec4 depthNormals;

void main()
{
	gl_FragColor=depthNormalsFragment(depthNormals);
}