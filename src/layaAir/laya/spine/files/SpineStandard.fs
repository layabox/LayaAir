#define SHADER_NAME SpineStandardFS
#include "SpineFragment.glsl"

void main(){
    clip();
    gl_FragColor = getColor();
}