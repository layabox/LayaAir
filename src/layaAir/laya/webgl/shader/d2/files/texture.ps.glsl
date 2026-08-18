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
#endif

#if defined(UV_CLIP_GPU) || defined(FILLTEXTURE)
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

vec3 linearToGamma(in vec3 value)
{
    return vec3(mix(pow(value.rgb, vec3(0.41666)) * 1.055 - vec3(0.055), value.rgb * 12.92, vec3(lessThanEqual(value.rgb, vec3(0.0031308)))));
    // return pow(value, vec3(1.0 / 2.2));
    // return pow(value, vec3(0.455));
}

vec4 linearToGamma(in vec4 value)
{
    return vec4(linearToGamma(value.rgb), value.a);
}


vec3 gammaToLinear(in vec3 value)
{
    return pow((value + 0.055) / 1.055, vec3(2.4));
}

vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}

void main()
{

	#ifdef FILLTEXTURE
		vec2 tileUV = fract(v_texcoordAlpha.xy);
		vec4 trimRect = v_customs;
		if (tileUV.x < trimRect.x || tileUV.x > trimRect.x + trimRect.z || tileUV.y < trimRect.y || tileUV.y > trimRect.y + trimRect.w)
			discard;
		vec2 contentUV = (tileUV - trimRect.xy) / trimRect.zw;
		vec2 uv = contentUV * u_TexRange.zw + u_TexRange.xy;
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
			color.rgb = linearToGamma(color.xyz);
		#endif
	#else
		#ifndef GAMMASPACE
			color.rgb = gammaToLinear(color.xyz);
		#endif
	#endif

	float useTex = step(1.0, v_useTex);
	color = color * useTex + (1.0 - useTex);

	#if defined(UV_CLIP_GPU) && !defined(FILLTEXTURE)
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
		vec4 transColor = vec4(gammaToLinear(v_color.rgb), v_color.a);
	#endif
	color.rgb *= transColor.rgb;
	gl_FragColor = color;
}
