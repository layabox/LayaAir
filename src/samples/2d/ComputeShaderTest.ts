/**
description
 在Laya框架中，展示两种加载图片的方式：loadImage和drawTexture
 */
import { Laya } from "Laya";
import { Sprite } from "laya/display/Sprite";
import { Stage } from "laya/display/Stage";
import { Loader } from "laya/net/Loader";
import { Texture } from "laya/resource/Texture";
import { Browser } from "laya/utils/Browser";
import { Main } from "./../Main";
import { UniformProperty } from "laya/RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader"
import { LayaGL } from "laya/layagl/LayaGL";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer"
import { Vector3 } from "laya/maths/Vector3";
import { WebGPUShaderCompiler } from "laya/RenderDriver/WebGPUDriver/RenderDevice/ShaderCompiler/WebGPUShaderCompiler";
export class Sprite_DisplayImage {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            this.showApe();

            if(false){
                this.testComputeShader1();
            }
        //   let shaderCompiler = new WebGPUShaderCompiler();
        //    shaderCompiler.init().then(()=>{
        //     console.log("compelete")
        //    });
        });

    }

    private showApe(): void {
        // 方法1：使用loadImage
        var ape: Sprite = new Sprite();
        this.Main.box2D.addChild(ape);
        ape.loadImage("res/apes/monkey3.png");

        // 方法2：使用drawTexture
        Laya.loader.load("res/apes/monkey2.png", Loader.IMAGE).then(() => {
            var t: Texture = Laya.loader.getRes("res/apes/monkey2.png");
            var ape: Sprite = new Sprite();
            ape.graphics.drawTexture(t, 0, 0);
            this.Main.box2D.addChild(ape);
            ape.pos(200, 0);
        });
    }


    //computeShader用来把数据*2
    private testComputeShader1() {
        //创建ComputeShader
        let code = `
            @group(0) @binding(0) var<storage,read_write> data:array<f32>;
            @compute @workgroup_size(1) fn computeDoubleMulData(
                @builtin(global_invocation_id) id: vec3u
            ){
                let i = id.x;
                data[i] = data[i] * 2.0;
            }`

        let uniformCommandMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("changeArray");
        let propertyID = Shader3D.propertyNameToID("data");
        uniformCommandMap.addShaderUniform(propertyID, "data", ShaderDataType.DeviceBuffer);

        let computeshader = ComputeShader.createComputeShader("changeArray", code, [uniformCommandMap]);
        let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();

        //创建ShaderData和StorageBuffer
        let shaderData = LayaGL.renderDeviceFactory.createShaderData();
        let strotageBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(0);

        let array = new Float32Array([1, 3, 5]);
        strotageBuffer.setDataLength(array.byteLength);
        strotageBuffer.setData(array, 0, 0, array.byteLength);
        shaderData.setDeviceBuffer(propertyID, strotageBuffer);

        let readStrotageBuffer = LayaGL.renderDeviceFactory.createDeviceBuffer(1);
        readStrotageBuffer.setDataLength(array.byteLength);

        //创建ComputeCommandBuffer
        let commands = new ComputeCommandBuffer();



        let dispatchParams = new Vector3(array.length, 1, 1);
        commands.addDispatchCommand(computeshader, "computeDoubleMulData", shaderDefine, [shaderData], dispatchParams);
        commands.addBufferToBufferCommand(strotageBuffer, readStrotageBuffer, 0, 0, array.byteLength);
        commands.executeCMDs();

        readStrotageBuffer.readData(array.buffer, 0, 0, array.byteLength).then(() => {
            console.log(array);
        })
    }



    //用computeShader实现双调排序
    private testComputeShader2() {

    }
}

