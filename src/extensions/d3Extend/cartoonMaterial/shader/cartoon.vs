attribute vec4 a_Position;
attribute vec3 a_Normal;
attribute vec2 a_Texcoord0;

uniform mat4 u_MvpMatrix;
uniform mat4 u_WorldMat;
uniform vec3 u_CameraPos;

varying vec2 v_Texcoord0;
varying vec3 v_Normal;
varying vec3 v_PositionWorld;
varying vec3 v_ViewDir;

void main()
{
	gl_Position = u_MvpMatrix * a_Position;
	
	mat3 worldMat = mat3(u_WorldMat);
	v_PositionWorld = (u_WorldMat * a_Position).xyz;
	v_Normal = worldMat * a_Normal;
	v_Texcoord0 = a_Texcoord0;
	
	v_ViewDir = u_CameraPos - v_PositionWorld;
}