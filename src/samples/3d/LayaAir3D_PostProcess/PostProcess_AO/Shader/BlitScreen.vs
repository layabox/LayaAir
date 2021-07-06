#if defined(GL_FRAGMENT_PRECISION_HIGH)
	precision highp float;
#else
	precision mediump float;
#endif

#include "Lighting.glsl";

#define SHADER_NAME ScalableAO:VS

attribute vec4 a_PositionTexcoord;
uniform vec4 u_OffsetScale;
varying vec2 v_Texcoord0;

uniform mat4 u_Projection;
uniform mat4 u_View;

varying mat4 v_inverseView;
varying mat4 v_inverseProj;

void main() {	
	gl_Position = vec4(u_OffsetScale.x*2.0-1.0+(a_PositionTexcoord.x+1.0)*u_OffsetScale.z,(1.0-((u_OffsetScale.y*2.0-1.0+(-a_PositionTexcoord.y+1.0)*u_OffsetScale.w)+1.0)/2.0)*2.0-1.0, 0.0, 1.0);	
	v_Texcoord0 = a_PositionTexcoord.zw;
	gl_Position = remapGLPositionZ(gl_Position);

	v_inverseView = INVERSE_MAT(u_View);
	v_inverseProj = INVERSE_MAT(u_Projection);
}