#define SHADER_NAME SpineStandardFS

varying vec4 v_color2;

#include "SpineFragment.glsl";


void main(){
    clip();
    gl_FragColor = getColor();

  
    #ifdef LIGHT2D_ENABLE
        lightAndShadow(gl_FragColor);
    #endif

    // gl_FragColor.r = 1.0;
    // gl_FragColor.g = 0.0;
    // gl_FragColor.b = 0.0;
    // gl_FragColor.a = 1.0;
}