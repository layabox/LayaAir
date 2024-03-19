#define SHADER_NAME SkyPanoramicVS

#include "SkyCommon.glsl";


varying vec3 v_Texcoord;
varying vec2 v_Image180ScaleAndCutoff;
varying vec4 v_Layout3DScaleAndOffset;

void main()
{
	vec4 position = rotateAroundYInDegrees(a_Position, u_Rotation);
	

	v_Texcoord=vec3(-a_Position.x,-a_Position.y,a_Position.z);// NOTE: -a_Position.x convert coords system

	// Calculate constant horizontal scale and cutoff for 180 (vs 360) image type
	v_Image180ScaleAndCutoff = vec2(1.0, 1.0);// 360 degree mode

	// Calculate constant scale and offset for 3D layouts
	v_Layout3DScaleAndOffset = vec4(0,0,1,1);
	gl_Position = u_SkyProjectionViewMat*position;
	gl_Position=remapSkyPositionZ(gl_Position);

}
