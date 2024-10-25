#if !defined(SpineVertex_lib)
    #define SpineVertex_lib

#ifdef SPINE_SIMPLE
    uniform vec4 u_SimpleAnimatorParams;
    uniform sampler2D u_SimpleAnimatorTexture;
    uniform float u_SimpleAnimatorTextureSize;

    vec4 getBonePosBake(float FramePos, float boneIndices , float weight , vec2 pos , float offset){
        vec2 uv = vec2(0.0,0.0);
        //float 2 * 4
        float PixelPos = FramePos + boneIndices * 2.0;
        float halfOffset = offset * 0.5;
        float uvoffset = PixelPos / u_SimpleAnimatorTextureSize;

        uv.y = floor(uvoffset) * offset + halfOffset;
        uv.x = mod(PixelPos, u_SimpleAnimatorTextureSize) * offset + halfOffset;
        
        vec4 up = texture2D(u_SimpleAnimatorTexture, uv);
        uv.x += offset;
        vec4 down = texture2D(u_SimpleAnimatorTexture, uv);
        // vec4 up = vec4(1.0,1.0 ,1.0 ,0.0 );
        // vec4 down = vec4( 1.0,1.0 ,1.0 ,0.0 );
        float x = pos.x*up.x + pos.y*up.y +up.z;
        float y = pos.x*down.x + pos.y*down.y +down.z;
        pos.x=x*weight;
        pos.y=y*weight;
        return vec4(pos,0.,1.0);
    }
#endif

#if defined(SPINE_FAST) || defined(SPINE_RB)
    uniform vec4 u_sBone[200];
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

uniform vec4 u_clipMatDir;
uniform vec2 u_clipMatPos;// 这个是全局的，不用再应用矩阵了。
uniform vec2 u_size;


// #ifdef GPU_INSTANCE
//     uniform vec3 a_NMatrix[2];
// #else
    uniform vec3 u_NMatrix[2];
// #endif //GPU_INSTANCE
uniform vec4 u_color;

varying vec2 vUv;
varying vec4 vColor;
varying vec2 v_cliped;

vec4 getSpinePos(){

    #ifdef SPINE_SIMPLE
        #ifdef GPU_INSTANCE
            float currentPixelPos = a_SimpleTextureParams.x + a_SimpleTextureParams.y;
	    #else // GPU_INSTANCE
            float currentPixelPos = u_SimpleAnimatorParams.x + u_SimpleAnimatorParams.y;
	    #endif // GPU_INSTANCE

        float offset = 1.0 / u_SimpleAnimatorTextureSize;

        return getBonePosBake(currentPixelPos,a_BoneId,a_weight,a_pos,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy,offset);
    #else
        #ifdef SPINE_FAST
            return getBonePos(a_BoneId,a_weight,a_pos)
            +getBonePos(a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy)
            +getBonePos(a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy)
            +getBonePos(a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy);
        #endif
        
        #ifdef SPINE_RB
            return getBonePos(a_BoneId,1.0,a_pos);
            //return vec4(pos,0.,1.);
        #endif
    #endif // SPINE_SIMPLE
    //spine Texture
    return vec4(a_pos.x,a_pos.y,0.,1.);

}


vec2 getClipedInfo(vec2 screenPos){
    vec2 cliped;
    float clipw = length(u_clipMatDir.xy);
    float cliph = length(u_clipMatDir.zw);
    vec2 clippos = screenPos - u_clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
    if(clipw>20000. && cliph>20000.)
        cliped = vec2(0.5,0.5);
    else {
        //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
        cliped =vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
    }
    return cliped;
}

vec4 getScreenPos(vec4 pos){
    #ifdef GPU_INSTANCE
        vec3 down =a_NMatrix_1;
        vec3 up =a_NMatrix_0;
    #else
        vec3 down =u_NMatrix[1];
        vec3 up =u_NMatrix[0];
    #endif
    float x=up.x*pos.x+up.y*pos.y+up.z;
    float y=down.x*pos.x+down.y*pos.y+down.z;
    v_cliped = getClipedInfo(vec2(x,y));
    return vec4((x/u_size.x-0.5)*2.0,(0.5-y/u_size.y)*2.0,pos.z,1.0);
}


#endif // SpineVertex_lib