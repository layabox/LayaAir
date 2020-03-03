// #ifdef ALPHATEST
// 	uniform float u_AlphaTestValue;
// #endif

// #ifdef DIFFUSEMAP
// 	uniform sampler2D u_DiffuseTexture;
// #endif

// #if defined(DIFFUSEMAP)||((defined(DIRECTIONLIGHT)||defined(POINTLIGHT)||defined(SPOTLIGHT))&&(defined(SPECULARMAP)||defined(NORMALMAP)))
// 	varying vec2 v_Texcoord0;
// #endif

vec4 shadowCasterFragment()
{
    return vec4(0.0);
    // #if defined(DIFFUSEMAP)&&defined(ALPHATEST)
	// 	float alpha = texture2D(u_DiffuseTexture,v_Texcoord0).w;
	// 	if( alpha < u_AlphaTestValue )
	// 	{
	// 		discard;
	// 	}
	// #endif
}
