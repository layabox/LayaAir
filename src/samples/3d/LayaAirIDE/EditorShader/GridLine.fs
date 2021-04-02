#if defined(GL_FRAGMENT_PRECISION_HIGH)
precision highp float;
#else
precision mediump float;
#endif

#define SHADER_NAME gridlineFS

varying vec4 v_Color;
varying vec4 v_PositionWS;

uniform float u_Step;
uniform vec3 u_CameraPos;

void main()
{
	
	gl_FragColor.xyz = v_Color.xyz;

	float cameradepth = 1.0/gl_FragCoord.w;
	float range = min(50.0 * u_Step, 1000.0);
	float alphaDepth = clamp(cameradepth, 0.0, range);
	float alpha = alphaDepth / range;

	alpha = 1.0 - alpha * alpha;

	vec3 viewRay = normalize(v_PositionWS.xyz - u_CameraPos);

	float t = abs(dot(viewRay, vec3(0, 1, 0)));

	gl_FragColor.a = alpha * t;

}

