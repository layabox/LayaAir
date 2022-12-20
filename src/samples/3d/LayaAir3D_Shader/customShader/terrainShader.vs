#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
precision highp float;
#else
precision mediump float;
#endif
#include "Lighting.glsl";
#include "VertexCommon.glsl";
#include "Scene.glsl";
#include "Camera.glsl";
#include "Sprite3DVertex.glsl";
// attribute vec4 a_Position;
// attribute vec2 a_Texcoord0;
// attribute vec3 a_Normal;

// uniform mat4 u_MvpMatrix;
varying vec2 v_Texcoord0;

void main()
{
  Vertex vertex;
  getVertexParams(vertex);
  // gl_Position = u_MvpMatrix * a_Position;
  v_Texcoord0 = vertex.texCoord0;;
  mat4 worldMat = getWorldMatrix();
  vec3 positionWS = (worldMat * vec4(vertex.positionOS, 1.0)).xyz;
  gl_Position = getPositionCS(positionWS);
  gl_Position=remapPositionZ(gl_Position);
}