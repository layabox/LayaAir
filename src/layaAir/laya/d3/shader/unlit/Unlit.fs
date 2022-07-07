
#define SHADER_NAME UnlitFS

#include "MeshFrag.glsl";

void main()
{
    VertexParams params;
    getMeshVertexParams(params);

    gl_FragColor = u_DiffuseColor;
}