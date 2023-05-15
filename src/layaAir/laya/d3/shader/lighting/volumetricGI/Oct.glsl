#if !defined(Oct_lib)
    #define Oct_lib

float signNotZero(in float k) { return k >= 0.0 ? 1.0 : -1.0; }

vec2 signNotZero(in vec2 v) { return vec2(signNotZero(v.x), signNotZero(v.y)); }

/**
 * v: normalized sample dir
 * @return: oct encode uv [-1, 1]
 */
vec2 octEncode(in vec3 v)
{
    float l1norm = abs(v.x) + abs(v.y) + abs(v.z);
    vec2 result = v.xy * (1.0 / l1norm);
    if (v.z < 0.0)
	{
	    result = (1.0 - abs(result.yx)) * signNotZero(result.xy);
	}

    return result;
}

/**
 * x: u [-1, 1]
 * y: v [-1, 1]
 * @return: normalized sample dir
 */
vec3 finalDecode(float x, float y)
{
    vec3 v = vec3(x, y, 1.0 - abs(x) - abs(y));
    if (v.z < 0.0)
	{
	    v.xy = (1.0 - abs(v.yx)) * signNotZero(v.xy);
	}
    return normalize(v);
}

/**
 * dir: cubemap sample dir
 * outsize: probe size with border (x: probe x, y: probe y, z: 1 / probe x, w: 1
 * / probe y) gridsize: probe grid size (x: probe x index, y: probe y index, z:
 * grid x size, w: grid y size)
 * @return texture coord [0, 1]
 */
vec2 textureCoordFromDirection(in vec3 dir, vec4 outSize, vec4 gridSize)
{
    vec2 uv = (octEncode(normalize(dir))) * 0.5 + 0.5;
    uv = uv * (outSize.xy - vec2(2.0, 2.0)) * outSize.zw + outSize.zw;
    uv = gridSize.xy * (1.0 / gridSize.zw) + uv * (1.0 / gridSize.zw);
    return uv;
}

#endif // Oct_lib