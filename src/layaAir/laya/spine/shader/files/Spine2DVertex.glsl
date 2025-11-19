#if !defined(SpineVertex_lib)
    #define SpineVertex_lib

void transfrom_spine(vec2 pos,vec3 xDir,vec3 yDir,out vec2 outPos){
    // outPos.x = xDir.x*pos.x+xDir.y*pos.y + xDir.z;
    // outPos.y = - (yDir.x*pos.x+yDir.y*pos.y -yDir.z);
    outPos.x =  xDir.x * pos.x - yDir.x * pos.y + xDir.z ;
    outPos.y =  xDir.y * pos.x - yDir.y * pos.y + yDir.z;
}

void getGlobalPos(vec4 pos, out vec2 globalPos){
    #ifdef GPU_INSTANCE
        vec3 down =a_NMatrix_1;
        vec3 up =a_NMatrix_0;
    #else
        vec3 down =u_NMatrix_1;
        vec3 up =u_NMatrix_0;
    #endif

    transfrom_spine(pos.xy,up,down,globalPos);
    // float x=up.x*pos.x+up.y*pos.y+up.z;
    // float y=down.x*pos.x+down.y*pos.y-down.z;
    // globalPos = vec2(x,-y);
}


vec4 getScreenPos(vec4 pos){
    vec2 globalPos;
    #ifdef GPU_INSTANCE
        vec3 down =a_NMatrix_1;
        vec3 up =a_NMatrix_0;
    #else
        vec3 down =u_NMatrix_1;
        vec3 up =u_NMatrix_0;
    #endif

    transfrom_spine(pos.xy,up,down,globalPos);
    // float x=up.x*pos.x+up.y*pos.y+up.z;
    // float y= -1.0 * (down.x*pos.x+down.y*pos.y-down.z);
    
    clip(globalPos); //裁剪

    vec2 viewPos;
    getViewPos(globalPos,viewPos);
    vec4 outPos;
    getProjectPos(viewPos,outPos);
    return outPos;
}

void getVertexInfo(vec4 pos, inout vertexInfo info){
    info.pos = pos.xy;
    info.color = vec4(1.0);
    #ifdef COLOR
        info.color = a_color;
    #endif
    info.color *= u_baseRenderColor;

    #ifdef PREMULTIPLYALPHA
        info.color.rgb = info.color.rgb * info.color.a;
    #endif
    
    #ifdef UV
        info.uv = a_uv;
    #endif

    #ifdef LIGHT2D_ENABLE
        vec2 global;
        getGlobalPos(pos, global);
        info.lightUV.x = (global.x - u_LightAndShadow2DParam.x) / u_LightAndShadow2DParam.z;
        info.lightUV.y = 1.0 - (global.y - u_LightAndShadow2DParam.y) / u_LightAndShadow2DParam.w;
    #endif
}

#endif // Spine2DVertex_lib