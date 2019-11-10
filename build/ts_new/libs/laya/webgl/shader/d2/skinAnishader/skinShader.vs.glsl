attribute vec2 position;
attribute vec2 texcoord;
attribute vec4 color;
uniform vec2 size;
uniform float offsetX;
uniform float offsetY;
uniform mat4 mmat;
uniform mat4 u_mmat2;
varying vec2 v_texcoord;
varying vec4 v_color;
void main() {
  vec4 pos=mmat*u_mmat2*vec4(offsetX+position.x,offsetY+position.y,0,1 );
  gl_Position = vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,pos.z,1.0);
  v_color = color;
  v_color.rgb *= v_color.a;
  v_texcoord = texcoord;  
}