#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"


void main() {
    vec4 textureColor = getTextureColor(v_texcoord);
    vec4 finalColor = textureColor*v_color;

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(finalColor);
    #endif
    
    gl_FragColor = finalColor;
}