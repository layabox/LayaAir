#ifdef GL_FRAGMENT_PRECISION_HIGH
	precision highp float;
	precision highp int;
#else
	precision mediump float;
	precision mediump int;
#endif

#include "ShadowCasterFS.glsl"

void main()
{
	gl_FragColor=shadowCasterFragment();
}