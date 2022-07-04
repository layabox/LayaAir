
#define SHADER_NAME UnlitFS

#include "MeshFrag.glsl";

void main()
{
    VertexParams params;
    getMeshVertexParams(params);

    gl_FragColor = vec4(0.5, 0.7, 0.2, 1.0);
}