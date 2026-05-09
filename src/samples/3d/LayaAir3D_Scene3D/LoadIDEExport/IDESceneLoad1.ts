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

import { Shader3D } from "laya/RenderEngine/RenderShader/Shader3D";
import { Browser } from "laya/utils/Browser";
import { URL } from "laya/net/URL";
import { ShaderDataType } from "laya/RenderDriver/DriverDesign/RenderDevice/ShaderData";
export class IDESceneLoad1 {
	constructor() {
		var path = URL.basePath;
		URL.basePath += "web/";
		// 加载fileConfig.json配置内容
		Laya.loader.loadPackage("").then(() => {
			// Browser.loadLib("js/index.js");
			// return;

			//初始化引擎
			Laya.init(0, 0).then(() => {
				Stat.show();
				Laya.stage.scaleMode = Stage.SCALE_FULL;
				Laya.stage.screenMode = Stage.SCREEN_NONE;
				Shader3D.debugMode = true;
				//加载场景
				Scene3D.load("scenes/treesDemo.ls", Handler.create(this, function (scene: Scene3D): void {
					(<Scene3D>Laya.stage.addChild(scene));
					URL.basePath = path;
				
				}));
			});
		});

	}
}

Laya.addAfterInitCallback(() => {
	return Browser.loadLib("sample-resource/web/js/sy.3d.ext_3.3.js");
});

Laya.addAfterInitCallback(() => {
	return Browser.loadLib("sample-resource/web/js/bundle.js");
});

  Laya.addAfterInitCallback(() => {
    console.log("add wind!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
    const globalUniformMap = Scene3D.sceneUniformMap;
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("WindDirection"), "WindDirection", ShaderDataType.Vector3);
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("WindStrenghtFloat"), "WindStrenghtFloat", ShaderDataType.Float);
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("WindSpeedFloat"), "WindSpeedFloat", ShaderDataType.Float);
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("WindTurbulenceFloat"), "WindTurbulenceFloat", ShaderDataType.Float);
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("LeavesWiggleFloat"), "LeavesWiggleFloat", ShaderDataType.Float);
    globalUniformMap.addShaderUniform(Shader3D.propertyNameToID("GrassWiggleFloat"), "GrassWiggleFloat", ShaderDataType.Float);
  });

    Laya.addAfterInitCallback(() => {
    console.log("add scene");
    const sceneUniformMap = Scene3D.sceneUniformMap;
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHAr"), "u_SHAr", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHAg"), "u_SHAg", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHAb"), "u_SHAb", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHBr"), "u_SHBr", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHBg"), "u_SHBg", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHBb"), "u_SHBb", ShaderDataType.Vector4);
    sceneUniformMap.addShaderUniform(Shader3D.propertyNameToID("u_SHC"), "u_SHC", ShaderDataType.Vector4);
  });