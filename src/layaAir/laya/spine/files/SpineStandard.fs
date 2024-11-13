#define SHADER_NAME SpineStandardFS
#include "SpineFragment.glsl"

#ifdef COLOR_FILTER
    uniform vec4 u_colorAlpha;
    uniform mat4 u_colorMat;
#endif

void main(){
    clip();
    gl_FragColor = getColor();

    #ifdef COLOR_FILTER
        mat4 alphaMat = u_colorMat;

        alphaMat[0][3] *= gl_FragColor.a;
        alphaMat[1][3] *= gl_FragColor.a;
        alphaMat[2][3] *= gl_FragColor.a;

        gl_FragColor = gl_FragColor * alphaMat;
        gl_FragColor += u_colorAlpha / 255.0 * gl_FragColor.a;
    #endif
}