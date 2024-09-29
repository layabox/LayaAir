#define SHADER_NAME BaseRender2DVS
#include "Sprite2DVertex.glsl";

varying vec2 v_lightUV[5];

void main() {
	vec4 pos;
	//先计算位置，再做裁剪
	getPosition(pos);
	vertexInfo info;
	getVertexInfo(info);

	v_texcoord = info.uv;
	v_color = info.color;
    v_lightUV = info.lightUV;

	gl_Position = pos;
}
