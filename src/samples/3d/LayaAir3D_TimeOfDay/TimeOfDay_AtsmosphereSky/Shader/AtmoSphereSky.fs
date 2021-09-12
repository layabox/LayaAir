#if defined(GL_FRAGMENT_PRECISION_HIGH)// 原来的写法会被我们自己的解析流程处理，而我们的解析是不认内置宏的，导致被删掉，所以改成 if defined 了
	precision highp float;
#else
	precision mediump float;
#endif

#include "SkyUtil.glsl";

varying vec3 skyColor;

void main(){
    vec3 vertex = normalize(skyColor);
    vec4 color =  Adjust(outScatteringColor(vertex));
    
    gl_FragColor=vec4(color.xyz,1.0);
}

