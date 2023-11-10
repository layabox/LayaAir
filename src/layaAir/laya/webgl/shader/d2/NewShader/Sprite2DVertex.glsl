#include "Sprite2DShaderInfo.glsl";
#if defined(PRIMITIVEMESH)
    // attribute vec4 a_position;
    // attribute vec4 a_attribColor;
    #ifdef WORLDMAT
        uniform mat4 u_mmat;
    #endif//WORLDMAT

    varying vec4 v_color;
    varying vec2 v_cliped;

    uniform vec4 u_clipMatDir;
    uniform vec2 u_clipMatPos;
    uniform vec2 u_size;

    void getVertexInfo(inout vertexInfo info){
        float clipw = length(u_clipMatDir.xy);
        float cliph = length(u_clipMatDir.zw);
        vec2 clippos = a_position.xy - u_clipMatPos.xy;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        if(clipw>20000. && cliph>20000.)
            info.cliped = vec2(0.5,0.5);
        else {
            //clipdir是带缩放的方向，由于上面clippos是在缩放后的空间计算的，所以需要把方向先normalize一下
            info.cliped =vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
        info.color = a_attribColor/255.;
    }

    void getPosition(inout vec4 pos){
        #ifdef WORLDMAT
            vec4 pos = u_mmat*vec4(a_position.xy,0.,1.);
            pos = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,pos.z,1.0);
        #else
            pos = vec4((a_position.x/u_size.x-0.5)*2.0,(0.5-a_position.y/u_size.y)*2.0,a_position.z,1.0);
        #endif
    }

#elif defined(TEXTUREVS)
	//texture和fillrect使用的。
    // attribute vec4 a_posuv;
    // attribute vec4 a_attribColor;
    // attribute vec4 a_attribFlags;

    uniform vec4 u_clipMatDir;
    uniform vec2 u_clipMatPos;		// 这个是全局的，不用再应用矩阵了。

    uniform vec2 u_size;
    uniform vec2 u_clipOff;			// 使用要把clip偏移。cacheas normal用. 只用了[0]
    #ifdef WORLDMAT
        uniform mat4 u_mmat;
    #endif

    #ifdef MVP3D
        uniform mat4 u_MvpMatrix;
    #endif

    varying vec2 v_cliped;
    varying vec4 v_texcoordAlpha;
    varying vec4 v_color;
    varying float v_useTex;

    void getVertexInfo(inout vertexInfo info){
       	//texcoordAlpha
        info.texcoordAlpha.xy = a_posuv.zw;
        //color
        info.color = a_attribColor/255.0;
	    info.color.xyz*= info.color.w;//反正后面也要预乘
        //useTex
        info.useTex = a_attribFlags.r/255.0;

        //clip
    	float clipw = length(u_clipMatDir.xy);
    	float cliph = length(u_clipMatDir.zw);
	    vec2 clpos = u_clipMatPos.xy;
        #ifdef WORLDMAT
            // 如果有mmat，需要修改clipMatPos,因为 这是cacheas normal （如果不是就错了）， clipMatPos被去掉了偏移
            if(u_clipOff[0]>0.0){
                clpos.x+=u_mmat[3].x;	//tx	最简单处理
                clpos.y+=u_mmat[3].y;	//ty
            }
        #endif
        vec2 clippos = a_posuv.xy - clpos;	//pos已经应用矩阵了，为了减的有意义，clip的位置也要缩放
        if(clipw>20000. && cliph>20000.)
            info.cliped = vec2(0.5,0.5);
        else {
            //转成0到1之间。/clipw/clipw 表示clippos与normalize之后的clip朝向点积之后，再除以clipw
            info.cliped = vec2( dot(clippos,u_clipMatDir.xy)/clipw/clipw, dot(clippos,u_clipMatDir.zw)/cliph/cliph);
        }
    }

    void getPosition(inout vec4 glPosition){
        vec4 pos = vec4(a_posuv.xy,0.,1.);
        #ifdef WORLDMAT
            pos= u_mmat * pos;
        #endif
            vec4 pos1 = vec4((pos.x/u_size.x-0.5)*2.0,(0.5-pos.y/u_size.y)*2.0,0.,1.0);
        #ifdef MVP3D
            glPosition = u_MvpMatrix * pos1;
        #else
            glPosition = pos1;
        #endif
        
        #ifdef INVERTY
            glPosition.y = -glPosition.y;
        #endif
    }

#endif