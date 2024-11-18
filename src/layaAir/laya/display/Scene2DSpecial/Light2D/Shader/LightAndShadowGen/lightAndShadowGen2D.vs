#define SHADER_NAME LightAndShadowGen2D_VS
#include "Sprite2DVertex.glsl";

varying vec2 v_uv;

//对UV坐标进行旋转和放缩
vec2 rotateAndScaleUV(vec2 uv, float rotation, vec2 scale)
{
    vec2 mid = vec2(0.5);
    float c = cos(rotation);
    float s = sin(rotation);
    vec2 ret = vec2(
      c * (uv.x - mid.x) + s * (uv.y - mid.y) + mid.x,
      c * (uv.y - mid.y) - s * (uv.x - mid.x) + mid.y
    );
    return (ret - mid) * scale + mid;
}

void main() {
    v_uv = a_uv;
    v_texcoord = rotateAndScaleUV(a_uv, u_LightRotation, u_LightScale);
	v_color = u_LightColor * u_LightIntensity;
	gl_Position = vec4((a_position.x / u_baseRenderSize2D.x - 0.5) * 2.0, (0.5 - a_position.y / u_baseRenderSize2D.y) * 2.0, 0.0, 1.0);
    #ifdef INVERTY
        gl_Position.y = -gl_Position.y;
    #endif
}