void main_castShadow()
{
	//gl_FragColor=vec4(v_posViewZ,0.0,0.0,1.0);
	gl_FragColor=packDepth(v_posViewZ);
	#if defined(ALBEDOTEXTURE)&&defined(ALPHATEST)
		float alpha = texture2D(u_AlbedoTexture,v_Texcoord0).w;
		if( alpha < u_AlphaTestValue )
		{
			discard;
		}
	#endif
}