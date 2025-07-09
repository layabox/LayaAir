
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Vector4 } from "laya/maths/Vector4";
import { RenderTexture } from "laya/resource/RenderTexture";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { PostProcessEffect } from "laya/d3/core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/postProcessBase/PostProcessRenderContext";
import { ComputeCommandWrap, CSWrap } from "./CSWrap";
import { Vector3 } from "laya/maths/Vector3";
import { Texture2D } from "laya/resource/Texture2D";
import { Viewport } from "laya/maths/Viewport";
import { LayaGL } from "laya/layagl/LayaGL";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";


const prefilterCode = `
struct ComputeBlurTest {
    u_MainTex_TexelSize: vec4<f32>,
    u_Threshold: f32,
    u_ThresholdKnee: f32,
    u_Scatter: f32,
    u_Saturation: f32,
    u_HighRTCol: vec3<f32>,
    u_LowRTCol: vec3<f32>,
    u_IsBlurH: i32,  // bool as float (0.0/1.0)
}
@group(0) @binding(0) var<uniform> uniforms: ComputeBlurTest;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
@group(0) @binding(2) var u_MainTex_Sampler: sampler;
@group(0) @binding(3) var u_SourceTexLowMip: texture_2d<f32>;
@group(0) @binding(4) var u_SourceTexLowMip_Sampler: sampler;
@group(0) @binding(5) var outputTexture: texture_storage_2d<rgba8unorm, write>;

fn rgb2gray(col: vec3<f32>) -> f32 {
    return dot(col, vec3<f32>(0.2125, 0.7154, 0.0721));
}

@compute @workgroup_size(8, 8, 1)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let coords = vec2<i32>(global_id.xy);
    let texSize = textureDimensions(outputTexture);
    
    // 边界检查
    if (coords.x >= i32(texSize.x) || coords.y >= i32(texSize.y)) {
        return;
    }
        
    // 采样主纹理
    var color = textureLoad(u_MainTex, coords, 0).rgb;
    color = min(vec3<f32>(65472.0), color);
    
    // 计算亮度
    let brightness = max(max(color.r, color.g), color.b);
    
    // 软阈值计算
    let softness = clamp(brightness - uniforms.u_Threshold + uniforms.u_ThresholdKnee, 
                        0.0, 2.0 * uniforms.u_ThresholdKnee);
    
    let softnessSquared = (softness * softness) / (4.0 * uniforms.u_ThresholdKnee + 1e-4);
    
    let multiplier = max(brightness - uniforms.u_Threshold, softnessSquared) / max(brightness, 1e-4);
    
    // 应用乘数
    color *= multiplier;
    
    // 饱和度调整
    color = mix(vec3<f32>(rgb2gray(color)), color, uniforms.u_Saturation);
    
    // 确保颜色非负
    color = max(color, vec3<f32>(0.0));
    
    // 输出到纹理
    textureStore(outputTexture, coords, vec4<f32>(color, 1.0));
}
`;

const blurCode = `
struct ComputeBlurTest {
    u_MainTex_TexelSize: vec4<f32>,
    u_Threshold: f32,
    u_ThresholdKnee: f32,
    u_Scatter: f32,
    u_Saturation: f32,
    u_HighRTCol: vec3<f32>,
    u_LowRTCol: vec3<f32>,
    u_IsBlurH: i32, 
}
@group(0) @binding(0) var<uniform> uniforms: ComputeBlurTest;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
@group(0) @binding(2) var u_MainTex_Sampler: sampler;
@group(0) @binding(3) var u_SourceTexLowMip: texture_2d<f32>;
@group(0) @binding(4) var u_SourceTexLowMip_Sampler: sampler;
@group(0) @binding(5) var outputTexture: texture_storage_2d<rgba8unorm, write>;

// 使用像素坐标进行纹理读取
fn sampleTexture(tex: texture_2d<f32>, coord: vec2<i32>) -> vec3<f32> {
    let texSize = textureDimensions(tex);
    
    // 边界检查和钳制
    let clampedCoord = clamp(coord, vec2<i32>(0), vec2<i32>(texSize) - vec2<i32>(1));
    
    return textureLoad(tex, clampedCoord, 0).rgb;
}

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id: vec3<u32>) {
    let coords = vec2<i32>(global_id.xy);
    let outputSize = textureDimensions(outputTexture);
    
    // 边界检查
    if (coords.x >= i32(outputSize.x) || coords.y >= i32(outputSize.y)) {
        return;
    }
    
    var color = vec3<f32>(0.0);
    
    // 判断是水平模糊还是垂直模糊
    let isBlurH = uniforms.u_IsBlurH > 0;
    
    if (isBlurH) {
        // 水平模糊
        let texelOffset = 2.0;
        
        let c0 = sampleTexture(u_MainTex, coords + vec2<i32>(-i32(texelOffset * 4), 0));
        let c1 = sampleTexture(u_MainTex, coords + vec2<i32>(-i32(texelOffset * 3), 0));
        let c2 = sampleTexture(u_MainTex, coords + vec2<i32>(-i32(texelOffset * 2), 0));
        let c3 = sampleTexture(u_MainTex, coords + vec2<i32>(-i32(texelOffset * 1), 0));
        let c4 = sampleTexture(u_MainTex, coords);
        let c5 = sampleTexture(u_MainTex, coords + vec2<i32>(i32(texelOffset * 1), 0));
        let c6 = sampleTexture(u_MainTex, coords + vec2<i32>(i32(texelOffset * 2), 0));
        let c7 = sampleTexture(u_MainTex, coords + vec2<i32>(i32(texelOffset * 3), 0));
        let c8 = sampleTexture(u_MainTex, coords + vec2<i32>(i32(texelOffset * 4), 0));
        
        color = c0 * 0.01621622 +
                c1 * 0.05405405 +
                c2 * 0.12162162 +
                c3 * 0.19459459 +
                c4 * 0.22702703 +
                c5 * 0.19459459 +
                c6 * 0.12162162 +
                c7 * 0.05405405 +
                c8 * 0.01621622;
    }
    else {
        // 垂直模糊
        let texelOffset0 = 1.0 * 3.23076923;
        let texelOffset1 = 1.0 * 1.38461538;
        
        let c0 = sampleTexture(u_MainTex, coords + vec2<i32>(0, -i32(texelOffset0)));
        let c1 = sampleTexture(u_MainTex, coords + vec2<i32>(0, -i32(texelOffset1)));
        let c2 = sampleTexture(u_MainTex, coords);
        let c3 = sampleTexture(u_MainTex, coords + vec2<i32>(0, i32(texelOffset1)));
        let c4 = sampleTexture(u_MainTex, coords + vec2<i32>(0, i32(texelOffset0)));
        
        color = c0 * 0.07027027 +
                c1 * 0.31621622 +
                c2 * 0.22702703 +
                c3 * 0.31621622 +
                c4 * 0.07027027;
    }
    
    // 输出到纹理
    textureStore(outputTexture, coords, vec4<f32>(color, 1.0));
}

`;


const dowmsampleCode = `
struct ComputeBlurTest {
    u_MainTex_TexelSize: vec4<f32>,
    u_Threshold: f32,
    u_ThresholdKnee: f32,
    u_Scatter: f32,
    u_Saturation: f32,
    u_HighRTCol: vec3<f32>,
    u_LowRTCol: vec3<f32>,
    u_IsBlurH: i32, 
}
@group(0) @binding(0) var<uniform> uniforms: ComputeBlurTest;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
@group(0) @binding(2) var u_MainTex_Sampler: sampler;
@group(0) @binding(3) var u_SourceTexLowMip: texture_2d<f32>;
@group(0) @binding(4) var u_SourceTexLowMip_Sampler: sampler;
@group(0) @binding(5) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let outSize = textureDimensions(outputTexture);
    let outCoord = vec2<i32>(global_id.xy);

    // 边界检查
    if (outCoord.x >= i32(outSize.x) || outCoord.y >= i32(outSize.y)) {
        return;
    }

    let inCoord = outCoord * 2;
    let inSize = textureDimensions(u_MainTex);

    var color = vec3<f32>(0.0);
    var count = 0.0;
    for (var dy = 0; dy < 2; dy = dy + 1) {
        for (var dx = 0; dx < 2; dx = dx + 1) {
            let sampleCoord = clamp(inCoord + vec2<i32>(dx, dy), vec2<i32>(0), vec2<i32>(inSize) - vec2<i32>(1));
            color = color + textureLoad(u_MainTex, sampleCoord, 0).rgb;
            count = count + 1.0;
        }
    }
    color = color / count;

    textureStore(outputTexture, outCoord, vec4<f32>(color, 1.0));
}

`

const upsampleCode = `
struct ComputeBlurTest {
    u_MainTex_TexelSize: vec4<f32>,
    u_Threshold: f32,
    u_ThresholdKnee: f32,
    u_Scatter: f32,
    u_Saturation: f32,
    u_HighRTCol: vec3<f32>,
    u_LowRTCol: vec3<f32>,
    u_IsBlurH: i32, 
}
@group(0) @binding(0) var<uniform> uniforms: ComputeBlurTest;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
@group(0) @binding(2) var u_MainTex_Sampler: sampler;
@group(0) @binding(3) var u_SourceTexLowMip: texture_2d<f32>;
@group(0) @binding(4) var u_SourceTexLowMip_Sampler: sampler;
@group(0) @binding(5) var outputTexture: texture_storage_2d<rgba8unorm, write>;

@compute @workgroup_size(8, 8)
fn main(@builtin(global_invocation_id) global_id : vec3<u32>) {
    let texSize = textureDimensions(outputTexture);
    let coords = vec2<i32>(global_id.xy);

    // 边界检查
    if (coords.x >= i32(texSize.x) || coords.y >= i32(texSize.y)) {
        return;
    }

    // 计算uv
    let uv = (vec2<f32>(coords) + vec2<f32>(0.5, 0.5)) / vec2<f32>(texSize);

    let highTexelSize = vec2<f32>(textureDimensions(u_MainTex));
    let highUV = vec2<i32>(uv * highTexelSize);
    let highMip = textureLoad(u_MainTex, highUV, 0).rgb;

    let lowTexelSize = vec2<f32>(textureDimensions(u_SourceTexLowMip));
    let lowUV = vec2<i32>(uv * lowTexelSize);
    let lowMip = textureLoad(u_SourceTexLowMip, lowUV, 0).rgb;

    //var color = mix(highMip * uniforms.u_HighRTCol, lowMip * uniforms.u_LowRTCol, uniforms.u_Scatter);
    var color = highMip * uniforms.u_HighRTCol + lowMip * uniforms.u_LowRTCol;

    textureStore(outputTexture, coords, vec4<f32>(color, 1.0));
}
`;

let uniformDef = {
    'u_MainTex_TexelSize': ShaderDataType.Vector4,
    'u_Threshold': ShaderDataType.Float, // 亮度阈值
    'u_ThresholdKnee': ShaderDataType.Float, // 软阈值范围
    'u_Scatter': ShaderDataType.Float,// 散射强度
    'u_Saturation': ShaderDataType.Float,// 饱和度调整
    'u_HighRTCol': ShaderDataType.Vector3,// 高分辨率颜色
    'u_LowRTCol': ShaderDataType.Vector3,// 低分辨率颜色
    'u_IsBlurH': ShaderDataType.Int,
    'u_MainTex':ShaderDataType.Texture2D,
    'u_SourceTexLowMip':ShaderDataType.Texture2D,
    'outputTexture':ShaderDataType.StorageTexture2D
};

export class BlurEffect_gpu_4399 extends PostProcessEffect {

    private _compute_commands = new ComputeCommandWrap();
    private _sv = LayaGL.renderDeviceFactory.createShaderData();
    private _vars = this.uniformVars(uniformDef);
    private _cs_prefilter = new CSWrap(prefilterCode, 'main', new Vector3(8, 8, 1), uniformDef, this._sv);
    private _cs_down =new CSWrap(dowmsampleCode,'main', new Vector3(8,8,1), uniformDef, this._sv)
    private _cs_blur = new CSWrap(blurCode, 'main', new Vector3(8, 8, 1), uniformDef, this._sv);
    private _cs_up = new CSWrap(upsampleCode, 'main', new Vector3(8,8,1), uniformDef, this._sv);

    private _allTex:RenderTexture[]=[];

    constructor(){
        super();
        let sv = this._sv;
        let vars = this._vars;
        sv.setNumber(vars.u_Threshold,0.7);
        sv.setNumber(vars.u_ThresholdKnee,0.05);
        sv.setNumber(vars.u_Scatter,0.5);
        sv.setNumber(vars.u_Saturation,1.0);
        sv.setVector3(vars.u_HighRTCol,new Vector3(1.0, 1.0, 1.0));
        sv.setVector3(vars.u_LowRTCol, new Vector3(1,1,1));
        sv.setInt(vars.u_IsBlurH,0);
        sv.setTexture(vars.u_SourceTexLowMip, null);//没用上
    }

    //为自动提示提取成员
    private uniformVars<T  extends Record<string, any>>(uniform_map: { [k in keyof T]: ShaderDataType}) {
        let ret:{[key in keyof T]:number}={} as {[key in keyof T]:number};
        for (let m in uniform_map) {
            let vid = Shader3D.propertyNameToID(m);
            ret[m] = vid;
        }
        return ret;
    }

    private createTexture(w:number,h:number){
        let rt = RenderTexture.createFromPool(w, h, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false,1,false,false,true);
        this._allTex.push(rt);
        return rt;
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    render(context: PostProcessRenderContext): void {
        //半分辨率模糊,性效比较高
        let startInputTex = context.indirectTarget;

        let texWidth = startInputTex.width;
        let texHeight = startInputTex.height;
        let texHalfWidth = Math.floor(texWidth / 2);
        let texHalfHeight = Math.floor(texHeight / 2);

        let computeCmd = this._compute_commands;
        computeCmd.start();

        let vars = this._vars;
        //prefilter
        let curOutput:RenderTexture;
        {
            let inputTexture = context.indirectTarget;
            let outTex = this.createTexture(texWidth,texHeight);
            let cs = this._cs_prefilter;
            computeCmd.setShaderData(cs,vars.u_MainTex,inputTexture);
            computeCmd.setShaderData(cs,vars.outputTexture, outTex);
            computeCmd.setShaderData(cs, vars.u_SourceTexLowMip,null)
            computeCmd.dispatchCS(cs,outTex.width,outTex.height);
            curOutput = outTex;
        }
        //down
        if(true)
        {
            let inputTex = curOutput;
            let outTex = this.createTexture(texHalfWidth, texHalfHeight);
            let cs = this._cs_down;
            computeCmd.setShaderData(cs,vars.u_MainTex,inputTex);
            computeCmd.setShaderData(cs,vars.outputTexture, outTex);
            computeCmd.dispatchCS(cs,outTex.width,outTex.height);
            curOutput = outTex;
        }        

        //blur
        if(true)
        {
            //blur v
            let inputTex = curOutput;
            let outTex = this.createTexture(texHalfWidth,texHalfHeight);;
            let cs = this._cs_blur;
            computeCmd.setShaderData(cs,vars.u_MainTex,inputTex);
            computeCmd.setShaderData(cs,vars.u_IsBlurH,0)
            computeCmd.setShaderData(cs,vars.outputTexture,outTex);
            computeCmd.dispatchCS(cs,outTex.width,outTex.height);
            curOutput = outTex;
        }        
        if(true)
        {
            //blur h
            let inputTex = curOutput;
            let outTex = this.createTexture(texHalfWidth, texHalfHeight);
            let cs = this._cs_blur;
            computeCmd.setShaderData(cs, vars.u_MainTex, inputTex);
            computeCmd.setShaderData(cs, vars.u_SourceTexLowMip,null);
            computeCmd.setShaderData(cs,vars.u_IsBlurH,1);
            computeCmd.setShaderData(cs,vars.outputTexture,outTex);
            computeCmd.dispatchCS(cs,outTex.width,outTex.height);
            curOutput = outTex;
        }

        //up
        if(true)
        {
            let oriTex = startInputTex;
            let blurrTex = curOutput;
            let outTex = this.createTexture(texWidth,texHeight);
            let cs = this._cs_up;
            computeCmd.setShaderData(cs,vars.u_MainTex,oriTex);
            computeCmd.setShaderData(cs,vars.u_SourceTexLowMip, blurrTex);
            computeCmd.setShaderData(cs,vars.outputTexture, outTex);
            computeCmd.dispatchCS(cs,outTex.width,outTex.height);
            curOutput = outTex
        }        
        computeCmd.copyTexture(curOutput,context.destination);
        computeCmd.end(context.command);
        //释放渲染纹理
        this._allTex.forEach(rt=>{
            context.deferredReleaseTextures.push(rt);
        })
    }  
}


