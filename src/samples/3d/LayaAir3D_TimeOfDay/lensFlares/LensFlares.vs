#include "Lighting.glsl";

#define SHADER_NAME vertex:LensFlares

// attribute vec4 a_PositionTexcoord;
attribute vec4 a_Position;
attribute vec2 a_Texcoord0;

uniform mat4 u_ViewportMatrix;
uniform float u_Rotation;

varying vec2 v_UV;

const vec2 madd = vec2(0.5, 0.5);

mat3 createFromRotation(float rad) {

    float s = sin(rad);
    float c = cos(rad);

    mat3 mat = mat3(c, s, 0, -s, c, 0, 0, 0, 1);
    return mat;
}

void main() {
    mat3 rotationMatrix = createFromRotation(u_Rotation);
    vec3 vertexPos = rotationMatrix * vec3(a_Position.xy, 1.0);

    vec2 pos = (vertexPos.xy); 

    v_UV = a_Texcoord0;
    vec4 position = u_ViewportMatrix * vec4(pos, 0.0, 1.0);
    gl_Position = vec4(position.xy, 0.0, 1.0);
    gl_Position = remapGLPositionZ(gl_Position);
}