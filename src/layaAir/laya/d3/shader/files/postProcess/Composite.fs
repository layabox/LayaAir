#define SHADER_NAME CompositeFS

#include "Colors.glsl";
#include "Sampling.glsl";

varying vec2 v_Texcoord0;

void main() {
	mediump float autoExposure = texture2D(u_AutoExposureTex, v_Texcoord0).r;
	mediump vec4 color=vec4(0.0);
	color = texture2D(u_MainTex, v_Texcoord0);
	
	//color = sRGBToLinear(color);
	color.rgb *= autoExposure;
	
	#if defined(BLOOM)||defined(BLOOM_LOW)
		#ifdef BLOOM
			mediump vec4 bloom = upsampleTent(u_BloomTex, v_Texcoord0, u_BloomTex_TexelSize.xy, vec4(u_Bloom_Settings.x));
		#else
			mediump vec4 bloom = upsampleBox(u_BloomTex, v_Texcoord0, u_BloomTex_TexelSize.xy, vec4(u_Bloom_Settings.x));
		#endif

		// UVs should be Distort(uv * u_Bloom_DirtTileOffset.xy + u_Bloom_DirtTileOffset.zw)
		// but considering we use a cover-style scale on the dirt texture the difference
		// isn't massive so we chose to save a few ALUs here instead in case lens distortion
		// is active
		mediump vec4 dirt =vec4(texture2D(u_Bloom_DirtTex, v_Texcoord0 * u_Bloom_DirtTileOffset.xy + u_Bloom_DirtTileOffset.zw).rgb, 0.0);

		// Additive bloom (artist friendly)
		bloom *= u_Bloom_Settings.y;
		dirt *= u_Bloom_Settings.z;
		mediump vec4 bloomColor=vec4(u_Bloom_Color, 1.0);
		color += bloom * bloomColor;
		color += dirt * bloom;
	#endif
	
	mediump vec4 finalColor = color;
	//finalColor = linearToSRGB(finalColor);
	//finalColor.rgb = Dither(finalColor.rgb, v_Texcoord0);//TODO:抖动
	gl_FragColor = finalColor;
}