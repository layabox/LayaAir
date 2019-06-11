attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_Texcoord0;

uniform mat4 u_MvpMatrix;
uniform float u_OutlineWidth;

varying vec2 v_Texcoord0;

void main()
{
	v_Texcoord0 = a_Texcoord0;
	
	vec4 position = vec4(a_Position.xyz + a_Normal * u_OutlineWidth, 1.0);
	gl_Position = u_MvpMatrix * position;
}