#define SHADER_NAME glTFDepthFS

#include "DepthFrag.glsl";

void main()
{
    gl_FragColor = getDepthColor();
}