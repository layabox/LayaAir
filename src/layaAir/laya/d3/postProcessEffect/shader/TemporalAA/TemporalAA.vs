#define SHADER_NAME TemporalAAVS

void main()
{
    gl_Position = vec4(u_OffsetScale.x * 2.0 - 1.0 + (a_PositionTexcoord.x + 1.0) * u_OffsetScale.z,
        1.0 - u_OffsetScale.y * 2.0 - (-a_PositionTexcoord.y + 1.0) * u_OffsetScale.w, 0.0, 1.0);
}
