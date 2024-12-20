#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"

void main() {
    vec4 textureColor = getTextureColor(v_texcoord);

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(textureColor);
    #endif
    
    gl_FragColor = textureColor*v_color;
}