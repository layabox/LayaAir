#define SHADER_NAME PrimitiveVS2D
#include "Sprite2DVertex.glsl";


#ifdef WORLDMAT
	uniform mat4 mmat;
#endif

void main(){
	vertexInfo info;
	getVertexInfo(info);
	
	//Update 
	v_color = info.color;
	v_cliped = info.cliped;
	
	vec4 pos;
	
	getPosition(pos);
	gl_Position = pos;
}