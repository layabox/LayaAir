#define SHADER_NAME BaseRender2DVS
#include "Sprite2DVertex.glsl";

void main() {
	vec4 pos;
	//先计算位置，再做裁剪
	getPosition(pos);
	vertexInfo info;
	getVertexInfo(info);

	v_texcoord = info.uv;
	v_color = info.color;

	gl_Position = pos;

}
