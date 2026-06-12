#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"


void main() {
    clip();
    vec4 textureColor = getTextureColor(v_texcoord);
    textureColor = transspaceColor(textureColor);

    vec4 transV = v_color;
    #ifndef GAMMASPACE
        transV = gammaToLinear(v_color);
    #endif
    vec4 finalColor = textureColor * transV;

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(finalColor);
    #endif

    gl_FragColor = finalColor;
}