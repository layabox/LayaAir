attribute vec4 a_CornerTextureCoordinate;
attribute vec3 a_Position;
attribute vec3 a_Velocity;
attribute vec4 a_StartColor;
attribute vec4 a_EndColor;
attribute vec3 a_SizeRotation;
attribute vec2 a_Radius;
attribute vec4 a_Radian;
attribute float a_AgeAddScale;
attribute float a_Time;

varying vec4 v_Color;
varying vec2 v_TextureCoordinate;

uniform float u_CurrentTime;
uniform float u_Duration;
uniform float u_EndVelocity;
uniform vec3 u_Gravity;

uniform vec2 size;
uniform mat4 u_mmat;

vec4 ComputeParticlePosition(in vec3 position, in vec3 velocity,in float age,in float normalizedAge)
{

   float startVelocity = length(velocity);//起始标量速度
   float endVelocity = startVelocity * u_EndVelocity;//结束标量速度

   float velocityIntegral = startVelocity * normalizedAge +(endVelocity - startVelocity) * normalizedAge *normalizedAge/2.0;//计算当前速度的标量（单位空间），vt=v0*t+(1/2)*a*(t^2)
   
   vec3 addPosition = normalize(velocity) * velocityIntegral * u_Duration;//计算受自身速度影响的位置，转换标量到矢量    
   addPosition += u_Gravity * age * normalizedAge;//计算受重力影响的位置
   
   float radius=mix(a_Radius.x, a_Radius.y, normalizedAge); //计算粒子受半径和角度影响（无需计算角度和半径时，可用宏定义优化屏蔽此计算）
   float radianHorizontal =mix(a_Radian.x,a_Radian.z,normalizedAge);
   float radianVertical =mix(a_Radian.y,a_Radian.w,normalizedAge);
   
   float r =cos(radianVertical)* radius;
   addPosition.y += sin(radianVertical) * radius;
	
   addPosition.x += cos(radianHorizontal) *r;
   addPosition.z += sin(radianHorizontal) *r;
  
   addPosition.y=-addPosition.y;//2D粒子位置更新需要取负，2D粒子坐标系Y轴正向朝上
   position+=addPosition;
   return  vec4(position,1.0);
}

float ComputeParticleSize(in float startSize,in float endSize, in float normalizedAge)
{    
    float size = mix(startSize, endSize, normalizedAge);
    return size;
}

mat2 ComputeParticleRotation(in float rot,in float age)
{    
    float rotation =rot * age;
    //计算2x2旋转矩阵.
    float c = cos(rotation);
    float s = sin(rotation);
    return mat2(c, -s, s, c);
}

vec4 ComputeParticleColor(in vec4 startColor,in vec4 endColor,in float normalizedAge)
{
	vec4 color=mix(startColor,endColor,normalizedAge);
    //硬编码设置，使粒子淡入很快，淡出很慢,6.7的缩放因子把置归一在0到1之间，可以谷歌x*(1-x)*(1-x)*6.7的制图表
    color.a *= normalizedAge * (1.0-normalizedAge) * (1.0-normalizedAge) * 6.7;
   
    return color;
}

void main()
{
   float age = u_CurrentTime - a_Time;
   age *= 1.0 + a_AgeAddScale;
   float normalizedAge = clamp(age / u_Duration,0.0,1.0);
   gl_Position = ComputeParticlePosition(a_Position, a_Velocity, age, normalizedAge);//计算粒子位置
   float pSize = ComputeParticleSize(a_SizeRotation.x,a_SizeRotation.y, normalizedAge);
   mat2 rotation = ComputeParticleRotation(a_SizeRotation.z, age);
	
    mat4 mat=u_mmat;
    gl_Position=vec4((mat*gl_Position).xy,0.0,1.0);
    gl_Position.xy += (rotation*a_CornerTextureCoordinate.xy) * pSize*vec2(mat[0][0],mat[1][1]);
    gl_Position=vec4((gl_Position.x/size.x-0.5)*2.0,(0.5-gl_Position.y/size.y)*2.0,0.0,1.0);
   
   v_Color = ComputeParticleColor(a_StartColor,a_EndColor, normalizedAge);
   v_TextureCoordinate =a_CornerTextureCoordinate.zw;
}

