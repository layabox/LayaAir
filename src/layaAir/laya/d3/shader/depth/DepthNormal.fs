#define SHADER_NAME DepthNormalFS

#include "DepthNormalUtil.glsl";

varying vec4 v_depthNormals;

void main()
{
    gl_FragColor = depthNormalsFragment(v_depthNormals);
}