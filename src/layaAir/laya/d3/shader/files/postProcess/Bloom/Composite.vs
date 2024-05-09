#define SHADER_NAME CompositeVS
varying vec2 v_Texcoord0;
vec4 remapPositionZ(vec4 position)
{
    position.z = position.z * 2.0 - position.w;
    #ifdef BLITSCREEN_INVERTY
    position.y = -position.y;
    #endif
    return position;
}
void main() {
	gl_Position = vec4(a_PositionTexcoord.xy, 0.0, 1.0);
	v_Texcoord0 = a_PositionTexcoord.zw;
	gl_Position = remapPositionZ(gl_Position);
}