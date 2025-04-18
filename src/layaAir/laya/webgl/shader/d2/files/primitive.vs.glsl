#define SHADER_NAME PrimitiveVS2D
#include "Sprite2DVertex.glsl";


#ifdef WORLDMAT
	uniform mat4 mmat;
#endif

void main(){
	//先计算位置，再做裁剪
	vertexInfo info;
	getVertexInfo(info);
	
	//Update 
	v_color = info.color;
	v_cliped = info.cliped;
	
	gl_Position = getPosition(info.pos);
}