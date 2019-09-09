#ifdef HIGHPRECISION
precision highp float;
#else
precision mediump float;
#endif

#include "Lighting.glsl";

varying vec2 v_Texcoord;
uniform sampler2D u_texture;
uniform vec3 u_marginalColor;

varying vec3 v_Normal;

#if defined(DIRECTIONLIGHT)
	#ifdef LEGACYSINGLELIGHTING
		uniform DirectionLight u_DirectionLight;
	#else
		uniform int u_DirationLightCount;
		uniform sampler2D u_LightBuffer;
	#endif
uniform vec3 u_CameraPos;
varying vec3 v_PositionWorld;
#endif

vec3 getDirectionLightColor()
{
	#ifndef LEGACYSINGLELIGHTING
		#ifdef DIRECTIONLIGHT
			for (int i = 0; i < MAX_LIGHT_COUNT; i++) 
			{
				if(i >= u_DirationLightCount)
					break;
				DirectionLight directionLight = getDirectionLight(u_LightBuffer,i);
				return directionLight.color;
			}
		#endif
		
	#endif
}

void main()
{

	
	gl_FragColor=texture2D(u_texture,v_Texcoord);
	
	vec3 normal=normalize(v_Normal);
	vec3 toEyeDir = normalize(u_CameraPos-v_PositionWorld);
	float Rim = 1.0 - max(0.0,dot(toEyeDir, normal));

	vec3 lightColor;
	#ifdef LEGACYSINGLELIGHTING
		lightColor = u_DirectionLight.color;
	#else 
		lightColor = getDirectionLightColor();
	#endif
 
	vec3 Emissive = 2.0 * lightColor * u_marginalColor * pow(Rim,3.0);  
	
	gl_FragColor = texture2D(u_texture, v_Texcoord) + vec4(Emissive,1.0);
}

