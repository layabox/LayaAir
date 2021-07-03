#define SAMPLE_DEPTH_TEXTURE(textureName,coord2) (texture2D(textureName,coord2).r)
//此方法库用来压缩解析深度贴图，法线深度贴图

/*camera 传入的Texture以及*/
uniform sampler2D u_CameraDepthTexture;
uniform vec4 u_ZBufferParams;
uniform sampler2D u_CameraDepthNormalsTexture;

// Encoding/decoding view space normals into 2D 0..1 vector
vec2 EncodeViewNormalStereo( vec3 n )
{
    n.z = abs(n.z);
    float kScale = 1.7777;
    vec2 enc;
    enc = n.xy / (n.z+1.0);
    enc /= kScale;
    enc = enc*0.5+0.5;
    return enc;
}

vec3 DecodeViewNormalStereo( vec4 enc4 )
{
    float kScale = 1.7777;
    vec3 nn = enc4.xyz*vec3(2.0*kScale,2.0*kScale,0.0) + vec3(-kScale,-kScale,1.0);
    float g = 2.0 / dot(nn.xyz,nn.xyz);
    vec3 n;
    n.xy = g*nn.xy;
    n.z = g-1.0;
    return n;
}


// Encoding/decoding [0..1) floats into 8 bit/channel RG. Note that 1.0 will not be encoded properly.
vec2 EncodeFloatRG( float v )
{
    vec2 kEncodeMul = vec2(1.0, 255.0);
    float kEncodeBit = 1.0/255.0;
    vec2 enc = kEncodeMul * v;
    enc = fract(enc);
    enc.x -= enc.y * kEncodeBit;
    return enc;
}



float DecodeFloatRG( vec2 enc )
{
    vec2 kDecodeDot = vec2(1.0, 1.0/255.0);
    return dot( enc, kDecodeDot );
}

vec4 EncodeDepthNormal(float depth,vec3 normals){
	vec4 encode;
	encode.xy = EncodeViewNormalStereo(normals);
	encode.zw = EncodeFloatRG(depth);
    return encode;
}

void DecodeDepthNormal( vec4 enc, out float depth, out vec3 normal )
{
    depth = DecodeFloatRG (enc.zw);
    normal = DecodeViewNormalStereo (enc);
}



vec4 depthNormalsFragment(vec4 depthNormal)
{
    return EncodeDepthNormal(depthNormal.w,depthNormal.xyz);
}


// Z buffer to linear 0..1 depth
float Linear01Depth(float z,vec4 zbufferParams)
{
    return 1.0 / (zbufferParams.x * z + zbufferParams.y);
}
// Z buffer to linear depth
float LinearEyeDepth(float z,vec4 zbufferParams)
{
    return 1.0 / (zbufferParams.z * z + zbufferParams.w);
}
