/**
description
 初始化Laya引擎,加载3D场景,设置相机位置和属性
 */
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Stage } from "laya/display/Stage";
import { Color } from "laya/maths/Color";
import { Vector3 } from "laya/maths/Vector3";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { CameraMoveScript } from "../common/CameraMoveScript";
import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { ComputeCommandBuffer } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeCommandBuffer";
import { RenderTexture } from "laya/resource/RenderTexture";
import { RenderTargetFormat } from "laya/RenderEngine/RenderEnum/RenderTargetFormat";
import { LayaGL } from "laya/layagl/LayaGL";
import { ComputeShader } from "laya/RenderDriver/DriverDesign/RenderDevice/ComputeShader/ComputeShader";
import { MeshRenderer } from "laya/d3/core/MeshRenderer";
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
import { RenderCapable } from "laya/RenderEngine/RenderEnum/RenderCapable";

export class SceneLoad1 {
	constructor() {
		//初始化引擎
		Laya.init(0, 0).then(() => {
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Shader3D.debugMode = true;
			//加载场景
			Scene3D.load("res/threeDimen/scene/LayaScene_dudeScene/Conventional/dudeScene.ls", Handler.create(this, function (scene: Scene3D): void {
				(<Scene3D>Laya.stage.addChild(scene));

				//获取场景中的相机
				var camera: Camera = (<Camera>scene.getChildByName("Camera"));
				//移动摄像机位置
				camera.transform.position = new Vector3(0, 0.81, -1.85);
				//旋转摄像机角度
				camera.transform.rotate(new Vector3(0, 0, 0), true, false);
				//设置摄像机视野范围（角度）
				camera.fieldOfView = 60;
				//设置背景颜色
				camera.clearColor = new Color(0, 0, 0.6, 1);
				//加入摄像机移动控制脚本
				camera.addComponent(CameraMoveScript);

				const testTex = () => {
					Laya.loader.load("./test.computeshader", "COMPUTESHADER").then(res => {
						console.log(res);
						let computeShader: ComputeShader = res;
						{
							let storage = true;
							let storageTex = new RenderTexture(512, 512, RenderTargetFormat.R8G8B8A8, RenderTargetFormat.None, false, 1, false, false, storage);

							let textureWidth = storageTex.width;
							let textureHeight = storageTex.height;

							let workGroupSize = new Vector3(8, 8, 1);

							let dispatchParams = new Vector3(Math.ceil(textureWidth / workGroupSize.x), Math.ceil(textureHeight / workGroupSize.y), 1);

							let shaderData = LayaGL.renderDeviceFactory.createShaderData();

							shaderData.setTexture(Shader3D.propertyNameToID("image"), storageTex);

							let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
							if (LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)) {
								let command = new ComputeCommandBuffer();
								command.addDispatchCommand(computeShader, "main", shaderDefine, [shaderData], dispatchParams);

								Laya.timer.frameLoop(1, this, () => {
									command.executeCMDs();
									let plane = scene.getChildByName("Plane");
									let render = plane.getComponent(MeshRenderer);
									let material = new BlinnPhongMaterial();
									render.sharedMaterial = material;

									material.albedoTexture = storageTex;
								});
							}



						}
					})
				}
				const testCull = () => {
					Laya.loader.load("./cull.computeshader", "COMPUTESHADER").then(res => {
						console.log(res);
						let computeShader: ComputeShader = res;

						let shaderData = LayaGL.renderDeviceFactory.createShaderData();
						let shaderData1 = LayaGL.renderDeviceFactory.createShaderData();

						let dispatchParams = new Vector3(64, 1, 1);

						let shaderDefine = LayaGL.unitRenderModuleDataFactory.createDefineDatas();
						if (LayaGL.renderEngine.getCapable(RenderCapable.ComputeShader)) {
							let command = new ComputeCommandBuffer();
							command.addDispatchCommand(computeShader, "main", shaderDefine, [shaderData, shaderData1], dispatchParams);

							// Laya.timer.frameLoop(1, this, () => {
							// });
							command.executeCMDs();
						}
					});
				} 

				// testTex();
				// testCull();
			}));
		});
	}
}

