#if !defined(SkyCommon_lib)
    #define SkyCommon_lib

uniform vec3 u_SunLight_direction;
uniform vec4 u_SunLight_color;
uniform mat4 u_SkyViewMat;
uniform mat4 u_SkyProjectionMat;
uniform mat4 u_SkyProjectionViewMat;

vec4 remapSkyPositionZ(in vec4 position)
{
    position.z = position.w;
    #ifdef BLITSCREEN_INVERTY
    position.y = -position.y;
    #endif
    return position;
}

const float c_deg2ang = 3.141593 / 180.0;
vec4 rotateAroundYInDegrees(vec4 vertex, float deg)
{
    float angle = deg * c_deg2ang;
    float sina = sin(angle);
    float cosa = cos(angle);
    mat2 m = mat2(cosa, -sina, sina, cosa);
    return vec4(m * vertex.xz, vertex.yw).xzyw;
}


#endif // SkyCommon_lib