#include "PBRFSShadow.glsl";

void fragmentShadowCaster()
{
	gl_FragColor=vec4(0.0);
	#if defined(ALBEDOTEXTURE)&&defined(ALPHATEST)
		float alpha = texture2D(u_AlbedoTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}