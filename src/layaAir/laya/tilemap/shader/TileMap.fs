#define SHADER_NAME TileMap2DFS
#include "TileMapFragment.glsl"

#ifdef COLOR_FILTER
    uniform vec4 u_colorAlpha;
    uniform mat4 u_colorMat;
#endif

void main() {
    vec4 textureColor = getTextureColor(v_texcoord);
    vec4 finalColor = textureColor*v_color;

    #ifdef COLOR_FILTER
        mat4 alphaMat = u_colorMat;

        alphaMat[0][3] *= finalColor.a;
        alphaMat[1][3] *= finalColor.a;
        alphaMat[2][3] *= finalColor.a;

        finalColor = finalColor * alphaMat;
        finalColor += u_colorAlpha / 255.0 * finalColor.a;
    #endif

    #ifdef LIGHT2D_ENABLE
        lightAndShadow(finalColor);
    #endif
    
    gl_FragColor = finalColor;
}