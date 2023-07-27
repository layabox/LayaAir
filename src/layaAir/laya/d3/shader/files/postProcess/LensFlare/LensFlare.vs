#define SHADER_NAME LENSFLARESVS
//attribute vec4 a_PositionTexcoord;
//attribute vec4 a_DistanceRotationScale;

varying vec2 v_Texcoord0;

vec2 rotateVec2(float rad,vec2 pos){
    float s = sin(rad);
    float c = cos(rad);
    float x = pos.x*c-pos.y*s;
    float y = pos.x*s+c*pos.y;
    return vec2(x,y);
}


void main(){
    vec2 center = u_FlareCenter;
    vec2 deltaPos = -2.0*center;
    vec2 lenFlarePosition =vec2(a_PositionTexcoord.x,a_PositionTexcoord.y);
    //旋转
    // float rad = acos(dot(normalize(center),vec2(0.0,1.0))); 
    lenFlarePosition = rotateVec2(u_rotate,lenFlarePosition);
    //缩放
    //TODO
    //平移
    lenFlarePosition = center + deltaPos+lenFlarePosition;     
    gl_Position = vec4( lenFlarePosition.x*u_aspectRatio,lenFlarePosition.y, 0.0, 1.0);
    v_Texcoord0 = a_PositionTexcoord.zw;
}
