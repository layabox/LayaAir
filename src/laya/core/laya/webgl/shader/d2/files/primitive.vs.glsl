attribute vec4 position;
attribute vec4 attribColor;
//attribute vec4 clipDir;
//attribute vec2 clipRect;
uniform vec4 clipMatDir;
uniform vec2 clipMatPos;
#ifdef WORLDMAT
	uniform mat4 mmat;
#endif
uniform mat4 u_mmat2;
//uniform vec2 u_pos;
uniform vec2 size;
varying vec4 color;
//vec4 dirxy=vec4(0.9,0.1, -0.1,0.9);
//vec4 clip=vec4(100.,30.,300.,600.);
varying vec2 cliped;
void main(){
	
#ifdef WORLDMAT
	vec4 pos=mmat*vec4(position.xy,0.,1.);
	gl_Position =vec4((pos.x/size.x-0.5)*2.0,(0.5-pos.y/size.y)*2.0,pos.z,1.0);
#else
	gl_Position =vec4((position.x/size.x-0.5)*2.0,(0.5-position.y/size.y)*2.0,position.z,1.0);
#endif	
	float clipw = length(clipMatDir.xy);
	float cliph = length(clipMatDir.zw);
	vec2 clippos = position.xy - clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
	if(clipw>20000. && cliph>20000.)
		cliped = vec2(0.5,0.5);
	else {
		//clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
		cliped=vec2( dot(clippos,clipMatDir.xy)/clipw/clipw, dot(clippos,clipMatDir.zw)/cliph/cliph);
	}
  //pos2d.x = dot(clippos,dirx);
  color=attribColor/255.;
}