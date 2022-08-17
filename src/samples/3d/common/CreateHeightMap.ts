import { Camera } from "laya/d3/core/Camera";
import { HeightMap } from "laya/d3/core/HeightMap";
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
import { Sprite3D } from "laya/d3/core/Sprite3D";
import { Vector2 } from "laya/d3/math/Vector2";
import { Mesh } from "laya/d3/resource/models/Mesh";
import { Stage } from "laya/display/Stage";
import { Browser } from "laya/utils/Browser";
import { Laya } from "Laya";
import { Laya3D } from "Laya3D";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Handler } from "laya/utils/Handler";

/**
 * ...
 * @author asanwu
 */
export class CreateHeightMap {
	//生成高度图的宽度
	width: number = 64;
	//生成高度图的高度
	height: number = 64;

	constructor() {
		Laya3D.init(0, 0);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_HORIZONTAL;
		var scene: Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()));

		(<Camera>(scene.addChild(new Camera(0, 0.1, 2000))));


		Sprite3D.load("maze/maze.lh", Handler.create(null, (sceneSprite3d: Sprite3D) => {
			var v2: Vector2 = new Vector2();
			//获取3d场景中需要采集高度数据的网格精灵,这里需要美术根据场景中可行走区域建模型
			var meshSprite3D: MeshSprite3D = (<MeshSprite3D>sceneSprite3d.getChildAt(0));
			var heightMap: HeightMap = HeightMap.creatFromMesh((<Mesh>meshSprite3D.meshFilter.sharedMesh), this.width, this.height, v2);
			var maxHeight: number = heightMap.maxHeight;
			var minHeight: number = heightMap.minHeight;
			//获取最大高度和最小高度,使用高度图时需要此数据
			console.log("-----------------------------");
			console.log(maxHeight, minHeight);
			console.log("-----------------------------");
			var compressionRatio: number = (maxHeight - minHeight) / 254;
			//把高度数据画到canvas画布上,并保存为png图片
			this.pringScreen(this.width, this.height, compressionRatio, minHeight, heightMap);
		}));
	}

	private pringScreen(tWidth: number, tHeight: number, cr: number, min: number, th: HeightMap): void {
		var pixel: any = Laya.stage.drawToCanvas(tWidth, tHeight, 0, 0);

		var tRed: number, tGreed: number, tBlue: number, tAlpha: number;
		tRed = tGreed = tBlue = tAlpha = 0xFF;
		var tStr: string = "";

		var ncanvas: any = Browser.createElement('canvas');
		ncanvas.setAttribute('width', tWidth.toString());
		ncanvas.setAttribute('height', tHeight.toString());

		var ctx: any = ncanvas.getContext("2d");

		var tI: number = 0;
		for (var i: number = 0; i < tHeight; i++) {
			for (var j: number = 0; j < tWidth; j++) {
				var oriHeight: number = th.getHeight(i, j);
				if (isNaN(oriHeight)) {
					tRed = 255;
					tGreed = 255;
					tBlue = 255;
				}
				else {
					var height: number = Math.round((oriHeight - min) / cr);
					tRed = height;
					tGreed = height;
					tBlue = height;
				}
				tAlpha = 1;

				tStr = "rgba(" + tRed.toString() + "," + tGreed.toString() + "," + tBlue.toString() + "," + tAlpha.toString() + ")";
				ctx.fillStyle = tStr;
				ctx.fillRect(j, i, 1, 1);

			}
		}
		var image = ncanvas.toDataURL("image/png").replace("image/png", "image/octet-stream;Content-Disposition: attachment;filename=foobar.png");
		window.location.href = image;
	}
}

