#define SHADER_NAME SequenceFrame2DFS
#if defined(GL_FRAGMENT_PRECISION_HIGH)
precision highp float;
#else
precision mediump float;
#endif

#include "Sprite2DFrag.glsl";

varying vec2 v_texcoord;
varying vec4 v_color;

uniform sampler2D u_baseRender2DTexture;

#ifdef LIGHT2D_ENABLE
varying vec2 v_lightUV;
uniform vec3 u_LightDirection;
uniform vec4 u_LightAndShadow2DAmbient;
uniform sampler2D u_LightAndShadow2D;
#ifdef LIGHT2D_SCENEMODE_ADD
uniform sampler2D u_LightAndShadow2D_AddMode;
#endif
#ifdef LIGHT2D_SCENEMODE_SUB
uniform sampler2D u_LightAndShadow2D_SubMode;
#endif

#ifdef LIGHT2D_NORMAL_PARAM
uniform sampler2D u_normal2DTexture;
uniform float u_normal2DStrength;
#endif

// SequenceFrame2D does not define BASERENDER2D, so it owns the 2D light glue.
void applySequenceFrameLight(inout vec4 color) {
#ifdef LIGHT2D_EMPTY
    color.rgb *= u_LightAndShadow2DAmbient.rgb;
#else
    vec2 uv = v_lightUV;
    vec2 tt = step(vec2(0.0), uv) * step(uv, vec2(1.0));
    float side = tt.x * tt.y;
    vec3 ambient = color.rgb * u_LightAndShadow2DAmbient.rgb;
    color.rgb = color.rgb * texture2D(u_LightAndShadow2D, uv).rgb * side;
    side *= color.a;
#ifdef LIGHT2D_SCENEMODE_ADD
    color.rgb = min(vec3(1.0), color.rgb + texture2D(u_LightAndShadow2D_AddMode, uv).rgb * side);
#endif
#ifdef LIGHT2D_SCENEMODE_SUB
    color.rgb = max(vec3(0.0), color.rgb - texture2D(u_LightAndShadow2D_SubMode, uv).rgb * side);
#endif
#ifdef LIGHT2D_NORMAL_PARAM
    vec3 dr = normalize(u_LightDirection);
    vec3 normal = normalize(texture2D(u_normal2DTexture, v_texcoord).rgb * 2.0 - 1.0);
    color.rgb = color.rgb * ((1.0 - u_normal2DStrength) + abs(dot(dr, normal.rgb)) * u_normal2DStrength);
#endif
    color.rgb = min(vec3(1.0), color.rgb + ambient);
#endif
}
#endif

// Match the BaseRender2D color path: texture sample is converted to the render
// color space first, then the premultiplied vertex tint/global alpha is applied.
void setSequenceFrameColor(in vec4 color) {
    color.a *= v_color.w;

    vec4 transColor = v_color;
#ifndef GAMMASPACE
    transColor = gammaToLinear(v_color);
#endif

    color.rgb *= transColor.rgb;
    gl_FragColor = color;
}

void main() {
    clip();

    vec4 textureColor = texture2D(u_baseRender2DTexture, v_texcoord);
#ifdef LIGHT2D_ENABLE
    applySequenceFrameLight(textureColor);
#endif
    //textureColor = transspaceColor(textureColor);

    setSequenceFrameColor(textureColor);
}
