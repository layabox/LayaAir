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
import { EDeviceBufferUsage } from "laya/RenderDriver/DriverDesign/RenderDevice/IDeviceBuffer";
export class ComputeShaderTest {
    Main: typeof Main = null;
    constructor(maincls: typeof Main) {
        this.Main = maincls;

        Laya.init(Browser.clientWidth, Browser.clientHeight).then(() => {
            Laya.stage.alignV = Stage.ALIGN_MIDDLE;
            Laya.stage.alignH = Stage.ALIGN_CENTER;

            Laya.stage.scaleMode = "showall";
            Laya.stage.bgColor = "#232628";

            // this.showApe();

            if (true) {
                this.testComputeShader2();
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



    private testComputeShader2() {
        let computeShader = GCA_CullComputeShader.computeshaderCodeInit();
        let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();


        const InstanceCount = 1024;
        const blockElementCount = 4;
        const blockCount = (InstanceCount / blockElementCount) | 0;
        let shaderData = LayaGL.renderDeviceFactory.createShaderData();
        {
            shaderData
            let planes = new Float32Array(4 * 6);//从camear来
            shaderData.setBuffer(Shader3D.propertyNameToID("cullPlanes"), planes);
            //TODO cull data
            shaderData.setInt(Shader3D.propertyNameToID("blockCount"), blockElementCount);
            shaderData.setInt(Shader3D.propertyNameToID("cullBlockCount"), blockCount);
        }
        let shaderData1 = LayaGL.renderDeviceFactory.createShaderData();
        {
            let aabbs = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC);
            aabbs.setDataLength((InstanceCount * 6) * 4); // 假设有6个AABB，每个AABB需要4个float

            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("aabbs"), aabbs);

            let culled = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC);
            culled.setDataLength((blockCount * (blockElementCount + 2)) * 4); // 假设每个实例需要4个float

            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("culled"), culled);

            let indirectArgs = LayaGL.renderDeviceFactory.createDeviceBuffer(EDeviceBufferUsage.STORAGE | EDeviceBufferUsage.COPY_DST | EDeviceBufferUsage.COPY_SRC);
            indirectArgs.setDataLength(blockCount * 5 * 4); // 假设每个实例需要4个float

            shaderData1.setDeviceBuffer(Shader3D.propertyNameToID("indirectArgs"), indirectArgs);
        }

        {
            //创建ComputeCommandBuffer
            let commands = new ComputeCommandBuffer();
            let dispatchParams = new Vector3(1, 1, 1);

            commands.addDispatchCommand(computeShader, "computeMain", shaderDefine, [shaderData, shaderData1], dispatchParams);

            Laya.timer.frameLoop(1, this, () => {

                commands.executeCMDs();
            });

        }
    }


    private getCullPlane() {
        const planes = new Float32Array(24);
        const size = 10;
        // 前平面 (z = 10)
        planes[0] = 0;   // normal.x
        planes[1] = 0;   // normal.y
        planes[2] = 1;   // normal.z
        planes[3] = -size; // distance

        // 后平面 (z = 0)
        planes[4] = 0;   // normal.x
        planes[5] = 0;   // normal.y
        planes[6] = -1;  // normal.z
        planes[7] = 0;   // distance

        // 左平面 (x = 0)
        planes[8] = -1;  // normal.x
        planes[9] = 0;   // normal.y
        planes[size] = 0;  // normal.z
        planes[11] = 0;  // distance

        // 右平面 (x = size)
        planes[12] = 1;  // normal.x
        planes[13] = 0;  // normal.y
        planes[14] = 0;  // normal.z
        planes[15] = -size;// distance

        // 上平面 (y = size)
        planes[16] = 0;  // normal.x
        planes[17] = 1;  // normal.y
        planes[18] = 0;  // normal.z
        planes[19] = -size;// distance

        // 下平面 (y = 0)
        planes[20] = 0;  // normal.x
        planes[21] = -1; // normal.y
        planes[22] = 0;  // normal.z
        planes[23] = 0;  // distance

        return planes;
    }


    private getOneBlockAABB(blockIndex: number) {

    }
}

