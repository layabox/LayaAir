#define SHADER_NAME TextureFS2D

#if defined(GL_FRAGMENT_PRECISION_HIGH)
precision highp float;
#else
precision mediump float;
#endif

varying vec4 v_texcoordAlpha;
varying vec4 v_color;
varying float v_useTex;

#ifdef UV_CLIP_GPU
varying float v_useClip;
varying vec4 v_customs;
#endif

#ifdef USE_TEX_ARRAY
varying float v_texLayer;
uniform sampler2DArray u_spriteTextureArray;
#else
uniform sampler2D u_spriteTexture;
#endif

#ifdef FILLTEXTURE
uniform vec4 u_TexRange;
#endif

void main()
{

	#ifdef FILLTEXTURE
		vec2 uv = fract(v_texcoordAlpha.xy) * u_TexRange.zw + u_TexRange.xy;
	#else
		vec2 uv = v_texcoordAlpha.xy;
	#endif

	#ifdef USE_TEX_ARRAY
		vec4 color = texture(u_spriteTextureArray, vec3(uv, v_texLayer));
	#else
		vec4 color = texture2D(u_spriteTexture, uv);
	#endif

	#ifndef GAMMATEXTURE
		#ifdef GAMMASPACE
			color.rgb = pow(color.rgb, vec3(1.0 / 2.2));
		#endif
	#else
		#ifndef GAMMASPACE
			color.rgb = pow(color.rgb, vec3(2.2));
		#endif
	#endif

	float useTex = step(1.0, v_useTex);
	color = color * useTex + (1.0 - useTex);

	#ifdef UV_CLIP_GPU
		if (v_useClip >= 1.0) {
			vec2 srcUV = v_texcoordAlpha.xy;
			vec4 clipRect = v_customs;
			if (srcUV.x < clipRect.x || srcUV.x > clipRect.x + clipRect.z || srcUV.y < clipRect.y || srcUV.y > clipRect.y + clipRect.w)
				discard;
		}
	#endif

	color.a *= v_color.w;
	#ifdef GAMMASPACE
		vec4 transColor = v_color;
	#else
		vec4 transColor = vec4(pow(v_color.rgb, vec3(2.2)), v_color.a);
	#endif
	color.rgb *= transColor.rgb;
	gl_FragColor = color;
}
