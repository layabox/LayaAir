import { Laya } from "Laya";
import { Camera, CameraEventFlags } from "laya/d3/core/Camera";
import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector4 } from "laya/d3/math/Vector4";
import { Stage } from "laya/display/Stage";
import { FilterMode } from "laya/resource/FilterMode";
import { RenderTextureDepthFormat, RenderTextureFormat } from "laya/resource/RenderTextureFormat";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial";
import { Viewport } from "laya/d3/math/Viewport";
import { RenderTexture } from "laya/d3/resource/RenderTexture";
import { Shader3D } from "laya/d3/shader/Shader3D";
import { Material } from "laya/d3/core/material/Material";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { ShuriKenParticle3D } from "laya/d3/core/particleShuriKen/ShuriKenParticle3D";
import { ShurikenParticleMaterial } from "laya/d3/core/particleShuriKen/ShurikenParticleMaterial";
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
import { BlurEffect, BlurMaterial } from "../../LayaAir3D_PostProcess/BlurShader/BlurEffect";
import { BaseRender } from "laya/d3/core/render/BaseRender";
import { CameraMoveScript } from "../../common/CameraMoveScript";

export class CommandBuffer_Outline {
	//private plane:MeshSprite3D
	constructor() {
		//初始化引擎
		Laya3D.init(0, 0);
		Stat.show();
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		BlurEffect.init();
		var unlitMaterial = new UnlitMaterial();
		unlitMaterial.albedoColor = new Vector4(255,0,0,255);
		var shurikenMaterial:ShurikenParticleMaterial = new ShurikenParticleMaterial();
		shurikenMaterial.color = new Vector4(255,0,0,255);

		Shader3D.debugMode = true;
		//加载场景
		Scene3D.load("res/threeDimen/OutlineEdgeScene/Conventional/OutlineEdgeScene.ls", Handler.create(this, function (scene: Scene3D): void {
			(<Scene3D>Laya.stage.addChild(scene));

			//获取场景中的相机
			var camera: Camera = (<Camera>scene.getChildByName("Main Camera"));

			// //加入摄像机移动控制脚本
			camera.addComponent(CameraMoveScript);
			var renders:BaseRender[]  = [];
			var materials:Material[] = [];
			renders.push((scene.getChildByName("Cube") as MeshSprite3D).meshRenderer);
			materials.push(unlitMaterial);
            renders.push((scene.getChildByName("Particle") as ShuriKenParticle3D).particleRenderer);
			 materials.push(shurikenMaterial);
             renders.push((scene.getChildByName("LayaMonkey").getChildByName("LayaMonkey") as SkinnedMeshSprite3D).skinnedMeshRenderer);
			materials.push(unlitMaterial);

			//this.plane = scene.getChildByName("Plane");

		
			this.createDrawMeshCommandBuffer(camera,CameraEventFlags.BeforeImageEffect,renders,materials);
		}));
	}

	createDrawMeshCommandBuffer(camera:Camera,cameraEventFlag:CameraEventFlags,renders:BaseRender[],materials:Material[]):CommandBuffer{
		var buf:CommandBuffer = new CommandBuffer();
		camera.enableBuiltInRenderTexture = true;
		//TODO：不应该限制在这个地方添加事件

		
		var viewPort:Viewport = camera.viewport;
		var renderTexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
		buf.setRenderTarget(renderTexture);
		buf.clearRenderTarget(true,false,new Vector4(0,0,0,0));
	
		for(var i = 0,n = renders.length;i<n;i++){
			buf.drawRender(renders[i],materials[i],0);
		}

		 var subRendertexture = RenderTexture.createFromPool(viewPort.width,viewPort.height,RenderTextureFormat.R8G8B8A8,RenderTextureDepthFormat.DEPTHSTENCIL_NONE);

		 buf.blitScreenQuad(renderTexture,subRendertexture);

		 var downSampleFactor:number = 2;
		 var downSampleWidth:number = viewPort.width/downSampleFactor;
		 var downSampleheigh:number = viewPort.height/downSampleFactor;
		 //设置模糊材质参数
		var texSize:Vector4 = new Vector4(1.0/viewPort.width,1.0/viewPort.height,viewPort.width,downSampleheigh);

		var blurMaterial:BlurMaterial = new BlurMaterial(texSize,1);
		
		// //创建降采样RenderTexture1
		 var downRenderTexture = RenderTexture.createFromPool(downSampleWidth,downSampleheigh,RenderTextureFormat.R8G8B8,RenderTextureDepthFormat.DEPTHSTENCIL_NONE);

		 buf.blitScreenQuadByMaterial(renderTexture,downRenderTexture,null,blurMaterial,0);

		 //创建降采样RenderTexture2
		var blurTexture:RenderTexture = RenderTexture.createFromPool(downSampleWidth,downSampleheigh,RenderTextureFormat.R8G8B8,RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
		blurTexture.filterMode = FilterMode.Bilinear;

		//Horizontal blur
		buf.blitScreenQuadByMaterial(downRenderTexture,blurTexture,null,blurMaterial,1);
		//vertical blur
		buf.blitScreenQuadByMaterial(blurTexture,downRenderTexture,null,blurMaterial,2);
		//Horizontal blur
		buf.blitScreenQuadByMaterial(downRenderTexture,blurTexture,null,blurMaterial,1);
		//vertical blur
		buf.blitScreenQuadByMaterial(blurTexture,downRenderTexture,null,blurMaterial,2);
		//设置图片
		buf.setShaderDataTexture(blurMaterial._shaderValues,BlurMaterial.SHADERVALUE_SOURCETEXTURE0,downRenderTexture);
		buf.setShaderDataTexture(blurMaterial._shaderValues,BlurMaterial.ShADERVALUE_SOURCETEXTURE1,subRendertexture);
		//caculate edge计算边缘图片
		buf.blitScreenQuadByMaterial(blurTexture,renderTexture,null,blurMaterial,3);
		//重新传入图片
		buf.setShaderDataTexture(blurMaterial._shaderValues,BlurMaterial.SHADERVALUE_SOURCETEXTURE0,renderTexture);
		//
		buf.blitScreenQuadByMaterial(null,subRendertexture,null,blurMaterial,4);
		//这里卡住了呀
        buf.blitScreenQuadByMaterial(subRendertexture,null);
        
        camera.addCommandBuffer(cameraEventFlag,buf);
		return buf;
	}
}

