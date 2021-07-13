#include "Lighting.glsl";

#define SHADER_NAME vertex:LensFlaresScreen

attribute vec4 a_PositionTexcoord;

varying vec2 v_UV;

void main() {
    v_UV = a_PositionTexcoord.zw;
    gl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);
    gl_Position = remapGLPositionZ(gl_Position);
}