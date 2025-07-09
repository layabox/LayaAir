/**
description
 实现图像模糊效果的后处理特效类，支持高斯模糊和简单模糊
 */

import { FilterMode } from "laya/RenderEngine/RenderEnum/FilterMode";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Vector4 } from "laya/maths/Vector4";
import { RenderTexture } from "laya/resource/RenderTexture";
import { LayaGL } from "laya/layagl/LayaGL";
import { ShaderDataType, ShaderData } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { PostProcessEffect } from "laya/d3/core/render/postProcessBase/PostProcessEffect";
import { PostProcessRenderContext } from "laya/d3/core/render/postProcessBase/PostProcessRenderContext";
import { CSWrap } from "./CSWrap";
import { Vector3 } from "laya/maths/Vector3";

const downsample=`
struct Uniforms {
    u_MainTex_TexelSize: vec4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
//注意：这里是binding(3) 因为2被引擎绑定 sampler了
@group(0) @binding(3) var u_OutputTex: texture_storage_2d<rgba8unorm, write>;


@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) global_id: vec3<u32>
    //@builtin(workgroup_id) wg_id: vec3<u32>
) {
    let pixelCoord = vec2<i32>(global_id.xy);
    let srcSize = textureDimensions(u_MainTex);
    let dstSize = textureDimensions(u_OutputTex);
    
    let w = i32(srcSize.x/dstSize.x);
    let totalSamples = f32(w * w);  

    // 边界检查
    if (pixelCoord.x >= i32(dstSize.x) || pixelCoord.y >= i32(dstSize.y)) {
        return;
    }
    
    var color = vec4<f32>(0.0,0.0,0.0,0.0);
    for(var y=pixelCoord.y*w;y<pixelCoord.y*w+w;y++){
        for(var x=pixelCoord.x*w; x<pixelCoord.x*w+w; x++){
            color += textureLoad(u_MainTex, vec2<i32>(x,y), 0); 
        }
    }
    
    var result = color/totalSamples;
    
    // 写入输出纹理
    textureStore(u_OutputTex, pixelCoord, result);
}
`



const vblur=`
`

const hblur=`
`
const upsample=`
struct Uniforms {
    u_MainTex_TexelSize: vec4<f32>,
}
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
@group(0) @binding(1) var u_MainTex: texture_2d<f32>;
//注意：这里是binding(3) 因为2被引擎绑定 sampler了
@group(0) @binding(3) var u_OutputTex: texture_storage_2d<rgba8unorm, write>;

fn bilinear_sample(uv: vec2<f32>) -> vec4<f32> {
    let srcSize = vec2<f32>(textureDimensions(u_MainTex));
    let dstSize = textureDimensions(u_OutputTex);
    let coord = uv * srcSize - 0.5;
    let coord_floor = floor(coord);
    let coord_fract = coord - coord_floor;
    
    let x0 = i32(coord_floor.x);
    let y0 = i32(coord_floor.y);
    let x1 = min(x0 + 1, i32(srcSize.x - 1));
    let y1 = min(y0 + 1, i32(srcSize.y - 1));
    
    let x0_clamped = max(0, x0);
    let y0_clamped = max(0, y0);
    
    // 采样四个邻近像素
    let tl = textureLoad(u_MainTex, vec2<i32>(x0_clamped,y0_clamped), 0);
    let tr = textureLoad(u_MainTex, vec2<i32>(x1,y0_clamped), 0);
    let bl = textureLoad(u_MainTex, vec2<i32>(x0_clamped,y1), 0);
    let br = textureLoad(u_MainTex, vec2<i32>(x1,y1), 0);
    
    // 双线性插值
    let top = mix(tl, tr, coord_fract.x);
    let bottom = mix(bl, br, coord_fract.x);
    return mix(top, bottom, coord_fract.y);
}

@compute @workgroup_size(8,8,1)
fn main(
    @builtin(global_invocation_id) global_id: vec3<u32>
) {
    let pixelCoord = vec2<i32>(global_id.xy);
    let dstSize = textureDimensions(u_OutputTex);

    // 边界检查
    if (pixelCoord.x >= i32(dstSize.x) || pixelCoord.y >= i32(dstSize.y)) {
        return;
    }

    let uv = vec2<f32>(vec2<f32>(pixelCoord)+vec2<f32>(0.5,0.5))/vec2<f32>(dstSize);
    
    var result = bilinear_sample(uv);
    
    // 写入输出纹理
    textureStore(u_OutputTex, pixelCoord, result);
}
`

export class BlurEffect_gpu extends PostProcessEffect {

    private _shaderData = LayaGL.renderDeviceFactory.createShaderData(null);
    private _downSampleNum = 1;
    private _blurSpreadSize = 1;
    private _blurIterations = 2;
    private _texSize = new Vector4(1.0, 1.0, 1.0, 1.0);
    private _tempRenderTexture: any[];
    private _blurcs_down=new CSWrap(downsample,'main', new Vector3(8,8,1), {
            "u_MainTex_TexelSize":ShaderDataType.Vector4,
            "u_MainTex":ShaderDataType.Texture2D,
            "u_OutputTex":ShaderDataType.StorageTexture2D
        })
    private _blurcs_up = new CSWrap(upsample, 'main', new Vector3(8,8,1), {
            "u_MainTex_TexelSize": ShaderDataType.Vector4,
            "u_MainTex": ShaderDataType.Texture2D,
            "u_OutputTex": ShaderDataType.StorageTexture2D
        });
    private _downTexture:RenderTexture
    private _upTexture:RenderTexture;

    constructor() {
        super();
    }

    /**
     * @return 强度。
     */
    get downSampleNum(): number {
        return this._downSampleNum;
    }

    /**
     * 降采样,值范围为0-6。
     * @param value 强度。
     */
    set downSampleNum(value: number) {
        this._downSampleNum = Math.min(6, Math.max(value, 0.0));
    }

    /**
     * 采样间隔  过大会失真1-10
     * @return 。
     */
    get blurSpreadSize(): number {
        return this._blurSpreadSize;
    }

    /**
     * @param value 
     */
    set blurSpreadSize(value: number) {
        this._blurSpreadSize = Math.min(10.0, Math.max(value, 1.0));
    }

    /**
     * 迭代次数  越大性能消耗越大 效果越好
     * @return 。
     */
    get blurIterations(): number {
        return this._blurIterations;
    }

    /**
     * @param value。
     */
    set blurIterations(value: number) {
        this._blurIterations = Math.min(Math.max(value, 0.0), 6.0);
    }

    /**
     * @inheritDoc
     * @override
     * @internal
     */
    render(context: PostProcessRenderContext): void {
        var cmd = context.command;

        var viewport = context.camera.viewport;
        var scaleFactor = 1.0 / (1 << Math.floor(this._downSampleNum));
        var tw = Math.floor(viewport.width * scaleFactor);
        var th = Math.floor(viewport.height * scaleFactor);
        this._texSize.setValue(1.0 / tw, 1.0 / th, tw, th);
        
        if(!this._downTexture){
            this._downTexture = new RenderTexture(tw,th,RenderTargetFormat.R8G8B8A8,RenderTargetFormat.None,false,1,false,false,true);
            this._upTexture = new RenderTexture(context.source.width, context.source.height, 
                RenderTargetFormat.R8G8B8A8,RenderTargetFormat.None,false,1,false,false,true);
        }
        var downSampleTexture= this._downTexture;

        let cs = this._blurcs_down;
        let sv = cs.shaderData;
        sv.setVector(cs.uniformVars.u_MainTex_TexelSize, this._texSize)
        sv.setTexture(cs.uniformVars.u_MainTex,context.source);
        sv.setTexture(cs.uniformVars.u_OutputTex,downSampleTexture);
        cs.start();
        cs.dispatch(downSampleTexture.width,downSampleTexture.height);
        cs.end(cmd);


        let cs1 = this._blurcs_up;
        let vars = cs1.uniformVars;
        cs1.shaderData.setVector(vars.u_MainTex_TexelSize, this._texSize);
        cs1.shaderData.setTexture(vars.u_MainTex,downSampleTexture);
        cs1.shaderData.setTexture(vars.u_OutputTex,this._upTexture);
        cs1.start();
        cs1.dispatch(this._upTexture.width,this._upTexture.height);
        cs1.copyTexture(this._upTexture, context.destination);
        cs1.end(cmd);

        //释放渲染纹理
        // for (i = 0; i < maxTexture; i++) {
        //     RenderTexture.recoverToPool(this._tempRenderTexture[i]);
        // }
        //context.deferredReleaseTextures.push(lastDownTexture);        
        return;

        let shader = Shader3D.find("blurEffect");
        //赋值
        //降采样
        downSampleTexture.filterMode = FilterMode.Bilinear;
        this._tempRenderTexture[0] = downSampleTexture;
        var lastDownTexture: RenderTexture = context.source;
        cmd.blitScreenTriangle(lastDownTexture, downSampleTexture, null, shader, this._shaderData, 0);
        lastDownTexture = downSampleTexture;
        //迭代次数
        for (var i = 0; i < this._blurIterations; i++) {
            //vertical
            var blurTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = FilterMode.Bilinear;
            cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, shader, this._shaderData, 1);
            lastDownTexture = blurTexture;
            this._tempRenderTexture[i * 2 + 1] = blurTexture;
            //Horizental
            blurTexture = RenderTexture.createFromPool(tw, th, RenderTargetFormat.R8G8B8, RenderTargetFormat.None, false, 1);
            blurTexture.filterMode = FilterMode.Bilinear;
            cmd.blitScreenTriangle(lastDownTexture, blurTexture, null, shader, this._shaderData, 2);
            lastDownTexture = blurTexture;
            this._tempRenderTexture[i * 2 + 2] = blurTexture;
        }
        context.source = lastDownTexture;
        cmd.blitScreenTriangle(context.source, context.destination);
        var maxTexture = this._blurIterations * 2 + 1;
        //释放渲染纹理
        for (i = 0; i < maxTexture; i++) {
            RenderTexture.recoverToPool(this._tempRenderTexture[i]);
        }
        context.deferredReleaseTextures.push(lastDownTexture);
    }
}


