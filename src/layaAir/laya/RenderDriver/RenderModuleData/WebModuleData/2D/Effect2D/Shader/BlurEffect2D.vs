
#define SHADER_NAME blurEffect2D

varying vec2 v_Texcoord0;

void main()
{
    gl_Position = vec4((a_PositionTexcoord.x) * u_centerScale.x, (a_PositionTexcoord.y) * u_centerScale.y, 0.0, 1.0);

    v_Texcoord0 = a_PositionTexcoord.zw;

    #ifdef INVERTY
    gl_Position.y = -gl_Position.y;
    #endif
}