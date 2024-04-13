varying vec2 vUv;
varying vec4 vColor;
uniform vec2 u_size;
#define SHADER_NAME SpineNormalVS2D

uniform vec3 u_NMatrix[2];
void main() {
    vUv = a_texcoord;
    vColor = a_color;
    vec4 pos = vec4(a_pos.x,a_pos.y,0.,1.);
    vec3 up =u_NMatrix[0];
    vec3 down =u_NMatrix[1];
    float x=up.x*pos.x+up.y*pos.y+up.z;
    float y=down.x*pos.x+down.y*pos.y-down.z;
    pos.x=x;
    pos.y=y;
    gl_Position =  vec4((pos.x/u_size.x-0.5)*2.0,(pos.y/u_size.y+0.5)*2.0,pos.z,1.0);;
}