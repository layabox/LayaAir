precision mediump float;
varying vec2 v_texcoord;
varying vec4 v_color;
uniform sampler2D texture;
uniform float alpha;

vec4 sampleTexture(sampler2D texture,vec2 uv){
    vec4 color = texture2D(texture,uv);
    #ifdef GAMMASPACE
        color.xyz = color.xyz*color.xyz;
    #endif
    return color;
}

vec3 gammaToLinear(in vec3 value)
{
    // return pow((value + 0.055) / 1.055, vec3(2.4));
    return pow(value, vec3(2.2));
}

vec4 gammaToLinear(in vec4 value)
{
    return vec4(gammaToLinear(value.rgb), value.a);
}

void main() {
    vec4 t_color = sampleTexture(texture, v_texcoord);
    vec4 transColor = v_color;
    #ifndef GAMMASPACE
        transColor = gammaToLinear(v_color);
    #endif
    gl_FragColor = t_color.rgba * transColor;
    gl_FragColor *= alpha;
}