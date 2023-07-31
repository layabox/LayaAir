#define SHADER_NAME LENSFLARESVS
//attribute vec4 a_PositionTexcoord;
// x: startPosition y: rotation zw: scale
// attribute vec4 a_DistanceRotationScale;

varying vec2 v_Texcoord0;

vec2 rotateVec2(float rad,vec2 pos){
    float s = sin(rad);
    float c = cos(rad);
    float x = pos.x*c-pos.y*s;
    float y = pos.x*s+c*pos.y;
    return vec2(x,y);
}

vec2 scaleVec2(vec2 scale,vec2 pos){
    float x = scale.x * pos.x;
    float y = scale.y * pos.y;
    return vec2(x,y);
}

vec2 transVec2(vec2 trans,vec2 pos){
    float x = pos.x + trans.x;
    float y = pos.y + trans.y;
    return vec2(x,y);
}


void main(){
    vec2 center = u_FlareCenter;
    vec2 deltaPos = -2.0 * center;
    vec2 lenFlarePosition = vec2(a_PositionTexcoord.x, a_PositionTexcoord.y);
    //旋转
    // float rad = acos(dot(normalize(center),vec2(0.0,1.0)));
    #ifdef LENSFLAREAUTOROTATE
        lenFlarePosition = rotateVec2(u_rotate, lenFlarePosition);
        float texRotate = a_DistanceRotationScale.y;
        lenFlarePosition = rotateVec2(texRotate, lenFlarePosition);
    #endif
    //缩放
    vec2 scale = vec2(a_DistanceRotationScale.z, a_DistanceRotationScale.w);
    lenFlarePosition = scaleVec2(scale,lenFlarePosition);
    // aspectRadio scale
    vec2 aspectRadio = vec2(u_aspectRatio, 1.0);
    lenFlarePosition = scaleVec2(aspectRadio,lenFlarePosition);
    //平移
    lenFlarePosition = center + deltaPos * a_DistanceRotationScale.x + lenFlarePosition;
    gl_Position = vec4(lenFlarePosition.x, lenFlarePosition.y, 0.0, 1.0);
    v_Texcoord0 = a_PositionTexcoord.zw;
}
