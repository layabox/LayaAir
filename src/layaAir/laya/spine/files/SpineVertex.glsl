#if !defined(SpineVertex_lib)
    #define SpineVertex_lib

#ifdef SIMPLEBONE
    uniform vec4 u_SimpleAnimatorParams;
    uniform sampler2D u_SimpleAnimatorTexture;
    uniform float u_SimpleAnimatorTextureSize;

    vec3 loadBakedMatMatrix(float FramePos, float boneIndices, float offset)
    {
        vec2 uv;
        float PixelPos = FramePos + boneIndices * 4.0;
        float halfOffset = offset * 0.5;
        float uvoffset = PixelPos / u_SimpleAnimatorTextureSize;

        uv.y = floor(uvoffset) * offset + halfOffset;
        uv.x = mod(float(PixelPos), u_SimpleAnimatorTextureSize) * offset + halfOffset;
        
        vec4 mat0row = texture2D(u_SimpleAnimatorTexture, uv);
        uv.x += offset;
        vec4 mat1row = texture2D(u_SimpleAnimatorTexture, uv);
        
        mat3 m = mat3(
            mat0row.x, mat0row.y, mat0row.z,
            mat1row.x, mat1row.y, mat1row.z,
            0.0, 0.0, 0.0,
        );
        return m;
    }

    vec4 getBonePosBake(float FramePos, float fboneId,float weight , vec2 pos , float offset){
        int boneId=int(fboneId);

        mat3 bakeMatrix = loadBakedMatMatrix(FramePos , fboneId , offset);
        vec3 transVec3 = bakeMatrix * vec3( pos , 1.0 );
        // float x = pos.x*up.x + pos.y*up.y +up.z ;
        // float y = pos.x*down.x + pos.y*down.y +down.z;
        pos.x=transVec3.x * weight;
        pos.y=transVec3.y * weight;
        
        return vec4(pos,0.,1.0);
    }
#endif

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
    #endif

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