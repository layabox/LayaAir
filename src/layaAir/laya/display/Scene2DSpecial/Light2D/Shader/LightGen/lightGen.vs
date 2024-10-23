#define SHADER_NAME FreeformLight_VS
#include "Sprite2DVertex.glsl";

void main() {
	v_texcoord = a_uv;
    gl_Position = vec4((a_position.x / u_baseRenderSize2D.x - 0.5) * 2.0, (a_position.y / u_baseRenderSize2D.y - 0.5) * 2.0, 0.0, 1.0);
    #ifdef INVERTY
        gl_Position.y = -gl_Position.y;
    #endif
}