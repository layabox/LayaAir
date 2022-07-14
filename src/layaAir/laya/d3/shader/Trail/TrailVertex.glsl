// attribute vec3 a_Position;
// attribute vec3 a_OffsetVector;
// attribute vec4 a_Color;
// attribute float a_Texcoord0X;
// attribute float a_Texcoord0Y;
// attribute float a_BirthTime;

uniform float u_CurTime;
uniform float u_LifeTime;
uniform vec4 u_WidthCurve[10];
uniform int u_WidthCurveKeyLength;


float hermiteInterpolate(float t, float outTangent, float inTangent, float duration, float value1, float value2)
{
	float t2 = t * t;
	float t3 = t2 * t;
	float a = 2.0 * t3 - 3.0 * t2 + 1.0;
	float b = t3 - 2.0 * t2 + t;
	float c = t3 - t2;
	float d = -2.0 * t3 + 3.0 * t2;
	return a * value1 + b * outTangent * duration + c * inTangent * duration + d * value2;
}

float getCurWidth(in float normalizeTime)
{
	float width;
	if(normalizeTime == 0.0){
		width=u_WidthCurve[0].w;
	}
	else if(normalizeTime >= 1.0){
		width=u_WidthCurve[u_WidthCurveKeyLength - 1].w;
	}
	else{
		for(int i = 0; i < 10; i ++ )
		{
			if(normalizeTime == u_WidthCurve[i].x){
				width=u_WidthCurve[i].w;
				break;
			}
			
			vec4 lastFrame = u_WidthCurve[i];
			vec4 nextFrame = u_WidthCurve[i + 1];
			if(normalizeTime > lastFrame.x && normalizeTime < nextFrame.x)
			{
				float duration = nextFrame.x - lastFrame.x;
				float t = (normalizeTime - lastFrame.x) / duration;
				float outTangent = lastFrame.z;
				float inTangent = nextFrame.y;
				float value1 = lastFrame.w;
				float value2 = nextFrame.w;
				width=hermiteInterpolate(t, outTangent, inTangent, duration, value1, value2);
				break;
			}
		}
	}
	return width;
}	