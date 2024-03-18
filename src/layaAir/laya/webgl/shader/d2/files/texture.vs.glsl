#define SHADER_NAME TextureVS2D
#include "Sprite2DVertex.glsl";

void main() {
	vertexInfo info;
	getVertexInfo(info);

	v_cliped = info.cliped;
	v_texcoordAlpha = info.texcoordAlpha;
	v_useTex = info.useTex;
	v_color = info.color;

	vec4 pos;
	getPosition(pos);
	gl_Position = pos;

}
