
#define SHADER_NAME blurEffect2D

varying vec2 v_Texcoord0;

void main()
{
    // 画满扩张后的 dest RT，原图通过 u_centerScale 映射到中心，模糊才能扩散到四周透明区
    gl_Position = vec4(a_PositionTexcoord.x, a_PositionTexcoord.y, 0.0, 1.0);
    v_Texcoord0 = a_PositionTexcoord.zw;

    #ifdef INVERTY
    gl_Position.y = -gl_Position.y;
    #endif
}