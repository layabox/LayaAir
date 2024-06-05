#if !defined(SpineVertex_lib)
    #define SpineVertex_lib


#if defined(SPINE_FAST) || defined(SPINE_RB)
    uniform vec4 u_sBone[256];
    vec4 getBonePos(float fboneId,float weight,vec2 pos){
        int boneId=int(fboneId);
        vec4 up= u_sBone[boneId*2];
        vec4 down=u_sBone[boneId*2+1];
        float x = pos.x*up.x + pos.y*up.y +up.z ;
        float y = pos.x*down.x + pos.y*down.y +down.z;
        pos.x=x*weight;
        pos.y=y*weight;
        return vec4(pos,0.,1.0);
    }
#endif

uniform vec2 u_size;
uniform vec3 u_NMatrix[2];
uniform vec4 u_color;

varying vec2 vUv;
varying vec4 vColor;

vec4 getSpinePos(){
    #ifdef SPINE_FAST
        return getBonePos(a_BoneId,a_weight,a_pos)+getBonePos(a_BoneId2,a_weight2,a_pos2)+getBonePos(a_BoneId3,a_weight3,a_pos3)+getBonePos(a_BoneId4,a_weight4,a_pos4);
     
    #endif

    #ifdef SPINE_RB
        return getBonePos(a_boneId,1.0,a_pos);
        //return vec4(pos,0.,1.);
    #endif
    //spine Texture
    return vec4(a_pos.x,a_pos.y,0.,1.);

}

vec4 getScreenPos(vec4 pos){
     vec3 up =u_NMatrix[0];
    vec3 down =u_NMatrix[1];
    float x=up.x*pos.x+up.y*pos.y+up.z;
    float y=down.x*pos.x+down.y*pos.y-down.z;
    return vec4((x/u_size.x-0.5)*2.0,(y/u_size.y+0.5)*2.0,pos.z,1.0);
}

#endif // SpineVertex_lib