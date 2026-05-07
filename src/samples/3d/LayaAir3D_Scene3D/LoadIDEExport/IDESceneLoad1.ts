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