#define SHADER_NAME TextureVS2D

#ifdef CAMERA2D
uniform mat3 u_view2D;
#endif

#ifdef SPRITE2DGLOBAL
#endif // SPRITE2DGLOBAL

#ifdef RENDERTEXTURE
uniform vec3 u_InvertMat_0;
uniform vec3 u_InvertMat_1;
#endif

#ifdef VERTEX_SIZE
uniform vec4 u_vertexSize;
uniform vec3 u_NMatrix_0;
uniform vec3 u_NMatrix_1;
#endif

#ifdef UNIFORMCLIP
    uniform vec2 u_clipOffset;
#endif

uniform vec2 u_size;
#ifndef VERTEXALPHA
uniform float u_VertAlpha;
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
#endif

void main() {
	vec4 color = a_attribColor;
	#ifdef VERTEXALPHA
		color.a *= a_attribFlags.z;
	#else
		color.a *= u_VertAlpha;
	#endif
	color.rgb *= color.a;

	v_texcoordAlpha = vec4(a_posuv.zw, 0.0, 0.0);
	v_color = color;
	v_useTex = a_attribFlags.r;

	#ifdef UV_CLIP_GPU
		v_useClip = a_attribFlags.g;
		v_customs = a_customs;
	#endif

	#ifdef USE_TEX_ARRAY
		v_texLayer = a_attribFlags.w;
	#endif

	#ifdef VERTEX_SIZE
		vec2 localPos = a_posuv.xy * u_vertexSize.zw + u_vertexSize.xy;
		vec2 globalPos = vec2(
			u_NMatrix_0.x * localPos.x + u_NMatrix_0.y * localPos.y + u_NMatrix_0.z,
			u_NMatrix_1.x * localPos.x + u_NMatrix_1.y * localPos.y + u_NMatrix_1.z
		);
	#else
		vec2 globalPos = a_posuv.xy;
	#endif

	#ifdef UNIFORMCLIP
		globalPos += u_clipOffset;
	#endif

	#ifdef RENDERTEXTURE
		vec2 viewSource = vec2(
			u_InvertMat_0.x * globalPos.x + u_InvertMat_0.y * globalPos.y + u_InvertMat_0.z,
			u_InvertMat_1.x * globalPos.x + u_InvertMat_1.y * globalPos.y + u_InvertMat_1.z
		);
	#else
		vec2 viewSource = globalPos;
	#endif

	#ifdef CAMERA2D
		vec2 viewPos = (u_view2D * vec3(viewSource, 1.0)).xy + u_size / 2.0;
	#else
		vec2 viewPos = viewSource;
	#endif

	vec4 pos = vec4((viewPos.x / u_size.x - 0.5) * 2.0, (0.5 - viewPos.y / u_size.y) * 2.0, 0.0, 1.0);
	#ifdef INVERTY
		pos.y = -pos.y;
	#endif

	gl_Position = pos;
}
