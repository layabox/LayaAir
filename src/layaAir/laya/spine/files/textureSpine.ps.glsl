#define SHADER_NAME SpineNormalFS2D
uniform sampler2D u_spriteTexture;
varying vec2 vUv;
varying vec4 vColor;

void main(void) { 
    gl_FragColor=texture2D(u_spriteTexture, vUv.xy)*vColor;//vec4(1.0,0.0,0.0,1.0);
}