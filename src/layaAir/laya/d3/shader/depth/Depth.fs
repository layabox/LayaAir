#define SHADER_NAME DepthFS

#include "DepthFrag.glsl";

void main()
{
    gl_FragColor = getDepthColor();
}