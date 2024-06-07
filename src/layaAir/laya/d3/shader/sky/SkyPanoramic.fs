#define SHADER_NAME SkyPanoramicVS

#include "Color.glsl";

varying vec3 v_Texcoord;
varying vec2 v_Image180ScaleAndCutoff;
varying vec4 v_Layout3DScaleAndOffset;
const vec4 c_ColorSpace = vec4(4.59479380, 4.59479380, 4.59479380, 2.0);

vec2 ToRadialCoords(vec3 coords)
{
    vec3 normalizedCoords = normalize(coords);
    float latitude = acos(normalizedCoords.y);
    float longitude = atan(normalizedCoords.z, normalizedCoords.x);
    vec2 sphereCoords = vec2(longitude, latitude) * vec2(0.5 / PI, 1.0 / PI);
    return vec2(0.5, 1.0) - sphereCoords;
}

void main()
{
    vec2 tc = ToRadialCoords(v_Texcoord);
    if (tc.x > v_Image180ScaleAndCutoff.y)
	gl_FragColor = vec4(0, 0, 0, 1);
    tc.x = mod(tc.x * v_Image180ScaleAndCutoff.x, 1.0);
    tc = (tc + v_Layout3DScaleAndOffset.xy) * v_Layout3DScaleAndOffset.zw;

    mediump vec4 tex = texture2D(u_Texture, tc);
#ifdef Gamma_u_Texture
    tex = gammaToLinear(tex);
#endif // Gamma_u_Texture
    mediump vec3 c = tex.xyz;
    c = c * u_TintColor.rgb * c_ColorSpace.rgb;
    c *= pow(u_Exposure, 2.2);
    gl_FragColor = vec4(c, 1.0);

    gl_FragColor = outputTransform(gl_FragColor);
}
