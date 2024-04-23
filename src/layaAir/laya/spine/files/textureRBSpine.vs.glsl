varying vec2 vUv;
varying vec4 vColor;
uniform vec2 u_size;
#define SHADER_NAME SpineRigidBodyVS2D

//uniform vec3 u_NMatrix[2];
vec4 getPos(float fboneId,vec2 pos){
    int boneId=int(fboneId);
    vec4 up= u_sBone[boneId*2];
    vec4 down=u_sBone[boneId*2+1];
    float x = pos.x*up.x + pos.y*up.y +up.z ;
    float y = pos.x*down.x + pos.y*down.y +down.z;
    pos.x=x;
    pos.y=y;
    return vec4(pos,0.,1.0);
}

void main() {
    vUv = a_texcoord;
    vColor = a_color;
    vec4 pos = getPos(a_boneId,a_pos);//
    vec3 up =u_NMatrix[0];
    vec3 down =u_NMatrix[1];
    float x=up.x*pos.x+up.y*pos.y+up.z;
    float y=down.x*pos.x+down.y*pos.y-down.z;
    pos.x=x;
    pos.y=y;
    gl_Position =  vec4((pos.x/u_size.x-0.5)*2.0,(pos.y/u_size.y+0.5)*2.0,pos.z,1.0);;
}