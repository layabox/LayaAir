#define SHADER_NAME TextureVS2D
#include "Sprite2DVertex.glsl";

void main() {
	vec4 pos;
	//先计算位置，再做裁剪
	getPosition(pos);
	vertexInfo info;
	getVertexInfo(info);

	v_cliped = info.cliped;
	v_texcoordAlpha = info.texcoordAlpha;
	v_useTex = info.useTex;
	v_color = info.color;

	gl_Position = pos;

}
