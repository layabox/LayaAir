#if !defined(SpineVertexCommon_lib)
    #define SpineVertexCommon_lib


#ifdef SPINE_RB
    uniform vec4 u_sBone0;
    uniform vec4 u_sBone1;
#endif

void transfrom(vec2 pos,vec4 xDir,vec4 yDir,out vec2 outPos){
    outPos.x=xDir.x*pos.x+xDir.y*pos.y +xDir.z;
    outPos.y=yDir.x*pos.x+yDir.y*pos.y +yDir.z;
}

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
        
        vec2 outPos;
        transfrom(pos , up , down , outPos);
        outPos = outPos * weight;
        // float x = pos.x*up.x + pos.y*up.y +up.z;
        // float y = pos.x*down.x + pos.y*down.y +down.z;
        // pos.x=x*weight;
        // pos.y=y*weight;
        return vec4(outPos,0.,1.0);
    }
#endif

#ifdef SPINE_FAST
    uniform vec4 u_sBone[200];
    vec4 getBonePos(float fboneId,float weight,vec2 pos){
        int boneId=int(fboneId);
        vec4 up= u_sBone[boneId*2];
        vec4 down=u_sBone[boneId*2+1];
        vec2 outPos;
        transfrom(pos , up , down , outPos);
        // float x = pos.x*up.x + pos.y*up.y +up.z ;
        // float y = pos.x*down.x + pos.y*down.y +down.z;
        outPos = outPos * weight;
        return vec4(outPos,0.,1.0);
    }
#endif


vec4 getSpinePos(){

    #ifdef SPINE_SIMPLE
        #ifdef GPU_INSTANCE
            float currentPixelPos = a_SimpleTextureParams.x + a_SimpleTextureParams.y;
	    #else // GPU_INSTANCE
            float currentPixelPos = u_SimpleAnimatorParams.x + u_SimpleAnimatorParams.y;
	    #endif // GPU_INSTANCE

        float offset = 1.0 / u_SimpleAnimatorTextureSize;

        return getBonePosBake(currentPixelPos,a_BoneId,a_weight,a_position,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy,offset)
        +getBonePosBake(currentPixelPos,a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy,offset);
    #else
        #ifdef SPINE_FAST
            return getBonePos(a_BoneId,a_weight,a_position)
            +getBonePos(a_PosWeightBoneID_2.w,a_PosWeightBoneID_2.z,a_PosWeightBoneID_2.xy)
            +getBonePos(a_PosWeightBoneID_3.w,a_PosWeightBoneID_3.z,a_PosWeightBoneID_3.xy)
            +getBonePos(a_PosWeightBoneID_4.w,a_PosWeightBoneID_4.z,a_PosWeightBoneID_4.xy);
        #endif
        
        #ifdef SPINE_RB
            vec2 pos;
            transfrom(a_position,u_sBone0,u_sBone1,pos);
            return vec4(pos,0.,1.);
            // return getBonePos(a_BoneId,1.0,a_position);
        #endif
    #endif // SPINE_SIMPLE
    //spine Texture
    return vec4(a_position.x,a_position.y,0.,1.);

}

#endif // SpineVertexCommon_lib