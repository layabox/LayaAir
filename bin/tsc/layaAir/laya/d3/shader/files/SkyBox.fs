#ifdef HIGHPRECISION
precision highp float;
#else
precision mediump float;
#endif

varying vec3 v_Texcoord;

uniform samplerCube u_CubeTexture;
uniform float u_Exposure;
uniform vec4 u_TintColor;


void main()
{	
	vec3 color=textureCube(u_CubeTexture, v_Texcoord).rgb*u_TintColor.rgb*u_Exposure*2.0;
	gl_FragColor=vec4(color,1.0);
}

