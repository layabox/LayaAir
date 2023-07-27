#define SHADER_NAME LENSFLARESFS

varying vec2 v_Texcoord0;

void main(){
      gl_FragColor = texture2D(u_FlareTexture, v_Texcoord0)*u_Tint;
}