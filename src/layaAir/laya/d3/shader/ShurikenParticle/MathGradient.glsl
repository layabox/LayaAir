vec2 getVec2ValueByIndexFromeVec4Array(in vec4 gradientNumbers[2],in int vec2Index){
	int v4Index = int(floor(float(vec2Index)/2.0));
	int offset =(vec2Index- v4Index*2)*2;
	return vec2(gradientNumbers[v4Index][offset],gradientNumbers[v4Index][offset+1]);
}

vec2 getVec2ValueByIndexFromeVec4Array_COLORCOUNT(in vec4 gradientNumbers[COLORCOUNT_HALF],in int vec2Index){
	int v4Index = int(floor(float(vec2Index)/2.0));
	int offset =(vec2Index- v4Index*2)*2;
	vec4 v4Value = gradientNumbers[v4Index];
	return vec2(v4Value[offset],v4Value[offset+1]);
}


float getCurValueFromGradientFloat(in vec4 gradientNumbers[2], in float normalizedAge)
{
    float curValue;
    for (int i = 1; i < 4; i++)
	{
	    vec2 gradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i);
	    float key = gradientNumber.x;
		curValue = gradientNumber.y;
	    if (key >= normalizedAge)
		{
		    vec2 lastGradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i - 1);
		    float lastKey = lastGradientNumber.x;
		    float age = max((normalizedAge - lastKey), 0.0) / (key - lastKey);
		    curValue = mix(lastGradientNumber.y, gradientNumber.y, age);
		    break;
		}
	}
    return curValue;
}

float getTotalValueFromGradientFloat(in vec4 gradientNumbers[2],
    in float normalizedAge)
{
	float keyTime = min(normalizedAge,getVec2ValueByIndexFromeVec4Array(gradientNumbers,0).x);
    float totalValue = keyTime * getVec2ValueByIndexFromeVec4Array(gradientNumbers,0).y;
	float lastSpeed = 0.;
    for (int i = 1; i < 4; i++)
	{
	    vec2 gradientNumber = getVec2ValueByIndexFromeVec4Array(gradientNumbers,i);
	    float key = gradientNumber.x;
	    vec2 lastGradientNumber =getVec2ValueByIndexFromeVec4Array(gradientNumbers,i - 1);
	    float lastValue = lastGradientNumber.y;

	    if (key >= normalizedAge)
		{
		    float lastKey = lastGradientNumber.x;
			float time =  max((normalizedAge - lastKey), 0.);
			float age = time / (key-lastKey);
			lastSpeed = mix(lastValue, gradientNumber.y,age);
		    totalValue += (lastValue + mix(lastValue, gradientNumber.y, age)) / 2.0 * a_ShapePositionStartLifeTime.w * time;
		    keyTime = normalizedAge;
			break;
		}
	    else if(key > keyTime)
		{
		    totalValue += (lastValue + gradientNumber.y) / 2.0 * a_ShapePositionStartLifeTime.w * (key - lastGradientNumber.x);
			keyTime = key;
			lastSpeed = gradientNumber.y;
		}
	}
    return totalValue + max(normalizedAge-keyTime, 0.) * lastSpeed * a_ShapePositionStartLifeTime.w;
}

vec4 getColorFromGradient(in vec4 gradientAlphas[COLORCOUNT_HALF],
    in vec4 gradientColors[COLORCOUNT],
    in float normalizedAge, in vec4 keyRanges)
{
    float alphaAge = clamp(normalizedAge, keyRanges.z, keyRanges.w);
    vec4 overTimeColor;
    for (int i = 1; i < COLORCOUNT; i++)
	{
	    vec2 gradientAlpha = getVec2ValueByIndexFromeVec4Array_COLORCOUNT(gradientAlphas,i);
	    float alphaKey = gradientAlpha.x;
	    if (alphaKey >= alphaAge)
		{
		    vec2 lastGradientAlpha =getVec2ValueByIndexFromeVec4Array_COLORCOUNT(gradientAlphas,i - 1);
		    float lastAlphaKey = lastGradientAlpha.x;
		    float age = clamp((alphaAge - lastAlphaKey) / (alphaKey - lastAlphaKey), 0.0, 1.0);
		    overTimeColor.a = mix(lastGradientAlpha.y, gradientAlpha.y, age);
		    break;
		}
	}

    float colorAge = clamp(normalizedAge, keyRanges.x, keyRanges.y);
    for (int i = 1; i < COLORCOUNT; i++)
	{
	    vec4 gradientColor = gradientColors[i];
	    float colorKey = gradientColor.x;
	    if (colorKey >= colorAge)
		{
		    vec4 lastGradientColor = gradientColors[i - 1];
		    float lastColorKey = lastGradientColor.x;
		    float age = (colorAge - lastColorKey) / (colorKey - lastColorKey);
		    overTimeColor.rgb = mix(gradientColors[i - 1].yzw, gradientColor.yzw, age);
		    break;
		}
	}
    return overTimeColor;
}

float getFrameFromGradient(in vec4 gradientFrames[2], in float normalizedAge)
{
    float overTimeFrame;
    for (int i = 1; i < 4; i++)
	{
	    vec2 gradientFrame = getVec2ValueByIndexFromeVec4Array(gradientFrames,i);
	    float key = gradientFrame.x;
		overTimeFrame = gradientFrame.y;
	    if (key >= normalizedAge)
		{
		    vec2 lastGradientFrame = getVec2ValueByIndexFromeVec4Array(gradientFrames,i-1);
		    float lastKey = lastGradientFrame.x;
			float age = max((normalizedAge-lastKey), 0.)/(key-lastKey);
		    overTimeFrame = mix(lastGradientFrame.y, gradientFrame.y, age);
		    break;
		}
	}
    return floor(overTimeFrame);
}
