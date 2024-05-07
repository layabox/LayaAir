varying vec2 vUv;
varying vec4 vColor;
uniform vec2 u_size;
#define SHADER_NAME TextureFastSpineVS2D
#define MAX_VERTEX_COUNT 
// uniform vec3 u_sBone[256];
// uniform vec3 u_NMatrix[2];

vec4 getPos(float fboneId,float weight,vec2 pos){
    int boneId=int(fboneId);
    vec4 up= u_sBone[boneId*2];
    vec4 down=u_sBone[boneId*2+1];
    float x = pos.x*up.x + pos.y*up.y +up.z ;
    float y = pos.x*down.x + pos.y*down.y +down.z;
    pos.x=x*weight;
    pos.y=y*weight;
    return vec4(pos,0.,1.0);
}


void main() {
    vUv = a_texcoord;
    vColor = a_color*u_color;
    vec4 pos=getPos(a_BoneId,a_weight,a_pos)+getPos(a_BoneId2,a_weight2,a_pos2)+getPos(a_BoneId3,a_weight3,a_pos3)+getPos(a_BoneId4,a_weight4,a_pos4);
   // pos=getPos(boneId,a_weight, + getMat(boneId2)*pos2*a_weight2+getMat(boneId3)*pos3*a_weight3;
      vec3 up =u_NMatrix[0];
    vec3 down =u_NMatrix[1];
    float x=up.x*pos.x+up.y*pos.y+up.z;
    float y=down.x*pos.x+down.y*pos.y-down.z;
    pos.x=x;
    pos.y=y;
    vec4 postion = vec4((pos.x/u_size.x-0.5)*2.0,(pos.y/u_size.y+0.5)*2.0 ,0.,1.0);



    gl_Position = postion;
}