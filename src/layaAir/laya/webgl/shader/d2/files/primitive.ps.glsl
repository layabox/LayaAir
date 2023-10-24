#define SHADER_NAME 2DPrimitiveFS
precision mediump float;

#include "Sprite2DFrag.glsl";

void main(){
	clip();
	gl_FragColor = getGlColor(v_color);
	gl_FragColor.rgb*=gl_FragColor.a;
}