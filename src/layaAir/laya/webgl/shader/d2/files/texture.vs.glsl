#define SHADER_NAME TextureVS2D
#include "Sprite2DVertex.glsl";

void main() {
	//先计算位置，再做裁剪
	vertexInfo info;
	getVertexInfo(info);

	v_texcoordAlpha = info.texcoordAlpha;
	v_color = info.color;
	v_useTex = info.useTex;
	v_useClip = info.useClip;
	v_customs = info.customs;

	gl_Position = getPosition(info.pos);

}
