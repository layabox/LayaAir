import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera";
import { DirectionLight } from "laya/d3/core/light/DirectionLight";
import { Scene3D } from "laya/d3/core/scene/Scene3D";
import { Vector3 } from "laya/d3/math/Vector3";
import { CubeInfo } from "laya/d3Extend/Cube/CubeInfo";
import { CubeSprite3D } from "laya/d3Extend/Cube/CubeSprite3D";
import { SubCubeGeometry } from "laya/d3Extend/Cube/SubCubeGeometry";
import { ColorQuantization_Mediancut } from "laya/d3Extend/vox/ColorQuantization_Mediancut";
import { lVoxFile } from "laya/d3Extend/vox/lVoxFile";
import { VoxelFmt2 } from "laya/d3Extend/vox/VoxelFmt2";
import { VoxelShadow } from "laya/d3Extend/vox/VoxelShadow";
import { CubeInfoArray } from "laya/d3Extend/worldMaker/CubeInfoArray";
import { SimpleCameraScript } from "laya/d3Extend/worldMaker/SimpleCameraScript";
import { Stage } from "laya/display/Stage";
import { Keyboard } from "laya/events/Keyboard";
import { KeyBoardManager } from "laya/events/KeyBoardManager";
import { Loader } from "laya/net/Loader";
import { Handler } from "laya/utils/Handler";
import { Stat } from "laya/utils/Stat";
import { Laya3D } from "Laya3D";
import { Config3D } from "./Config3D";
import { nit } from "./nit";

export class VoxelLight {
	scene: Scene3D;
	private path: any;
	private fs: any;
	private __dirname: string;
	private cubemesh: CubeSprite3D;
	private voxshadow: VoxelShadow;
	private lightDeg: number = 0;
	private camController: SimpleCameraScript;

	constructor() {
		var node: boolean = !!window.require;
		if (node) {
			this.fs = require('fs');;
			this.path = require('path');;
			this.__dirname = __dirname;;
		}
		var config: Config3D = new Config3D();
		config.defaultPhysicsMemory = 64;
		Laya3D.init(0, 0, config);
		Laya.stage.scaleMode = Stage.SCALE_FULL;
		Laya.stage.screenMode = Stage.SCREEN_NONE;
		Stat.show();
		Laya.timer.loop(1, this, this.onUpdate);

		this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()));
		this.scene.ambientColor = new Vector3(1, 1, 1);

		var camera: Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 5000)));
		camera.transform.translate(new Vector3(0, 20, 40));
		//camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
		this.camController = new SimpleCameraScript(0, 20, 40, 0, 0, 0);
		camera._addComponentInstance(this.camController);

		SubCubeGeometry.__init__();
		CubeInfo.Cal24Object();
		this.testCube();
		/*
		   var f = new VoxelFmt2();
		   f.test();
		 */
	}

	testCube(): void {
		//CubeMeshFilter.__int__();

		//方向光
		var directionLight: DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()));
		directionLight.color = new Vector3(0.3, 0.3, 0.3);
		//设置平行光的方向
		var mat = directionLight.transform.worldMatrix;
		mat.setForward(new Vector3(-1.0, -1.0, 1.0));
		directionLight.transform.worldMatrix = mat;
		//directionLight.transform. = new Vector3();
		this.scene.ambientColor = new Vector3(1, 1, 1);

		this.cubemesh = (<CubeSprite3D>this.scene.addChild(new CubeSprite3D()));
		//cubemesh.AddCube(0, 0, 0, 2958);
		//cubemesh.AddCube(0, -3, 0, 2958);
		//cubemesh.ChangeOneFaceColor(0, 0, 0, 2, 0);
		//cubemesh.ChangeOneFaceColor(0, -3, 0, 2, 0);
		/*
		   var bb:VoxelLightSphere = new VoxelLightSphere(100, 80);
		   bb.rays.forEach(function(r:VoxelLightRay):void {
		   for (var ci:int = 0; ci < r.path.length; ) {
		   cubemesh.AddCube(r.path[ci++], r.path[ci++], r.path[ci++], 2958);
		   }
		   } );
		   return;
		 */

		new ColorQuantization_Mediancut();

		var xsize: number = 0, ysize: nit = 0, zsize: number = 0;
		Laya.loader.load('nv.obj.lvox', Handler.create(null, function (arraybuffer: ArrayBuffer): void {
			var colorpal: Uint8Array = null;
			var fmt2: VoxelFmt2 = new VoxelFmt2(false);
			fmt2.decode(arraybuffer, {
				cb_setPalette: function (pal: Uint8Array): void {
					colorpal = pal;
				}, cb_setSize: function (x: number, y: number, z: number): void {
					console.log('size:', x, y, z);
					xsize = x;
					ysize = y;
					zsize = z;
					this.voxshadow = new VoxelShadow(x + 1, y + 1, z + 1);
				}, cb_addData: function (x: number, y: number, z: number, v: number): void {
					this.voxshadow.setBlock(x, y, z);
					this.cubemesh.AddCube(x, y, z, 0x7fff);
				}
			});
			this.voxshadow.setBlockEnd();
			this.camController.setTarget(xsize / 2, ysize / 2, zsize / 2);
			alert('ok');
		}), null, Loader.BUFFER);
		return;
		lVoxFile.LoadlVoxFile('house1.lh.lvox', Handler.create(null, function (cubeinfoss: CubeInfoArray) {
			this.cubemesh.AddCubes(cubeinfoss);
			//添加地板
			for (var x = 0; x < 200; x++) {
				for (var z = 0; z < 200; z++) {
					//cubemesh.AddCube(x, 0, z, 32766);
				}
			}
			var maxx: number = 0;
			var maxy: number = 0;
			var maxz: number = 0;
			var posInfo: any[] = cubeinfoss.PositionArray;
			var i: number = 0;
			for (var j = 0; j < posInfo.length / 3; j++) {
				maxx = Math.max(posInfo[i++], maxx);
				maxy = Math.max(posInfo[i++], maxy);
				maxz = Math.max(posInfo[i++], maxz);
			}
			console.log('datalen=', posInfo.length, 'size=', maxx, maxy, maxz);
			this.voxshadow = new VoxelShadow(maxx + 1, maxy + 1, maxz + 1);

			i = 0;
			for (var j = 0; j < posInfo.length / 3; j++) {
				this.voxshadow.setBlock(posInfo[i++], posInfo[i++], posInfo[i++]);
			}
			this.voxshadow.setBlockEnd();

			i = 0;
			for (var j = 0; j < this.voxshadow.edgeVoxids.length / 3; j++) {
				var x: number = this.voxshadow.edgeVoxids[i++];
				var y: number = this.voxshadow.edgeVoxids[i++];
				var z: number = this.voxshadow.edgeVoxids[i++];
				//cubemesh.UpdataColor(x, y, z, 32767, false);
				for (var fi = 0; fi < 6; fi++) {
					this.cubemesh.ChangeOneFaceColor(x, y, z, fi, this.voxshadow.getLight(x, y, z, fi), false);
				}
			}
			this.cubemesh.UpColorData();
			//cubemesh.UpdataColor
			/*
			   for (var j = 0; j < cubeinfoss.length; j++) {
			   cubemesh.AddCube(cubeinfoss[j].x,cubeinfoss[j].y,cubeinfoss[j].z,32767);
			   }
			 */
		}));
	}

	onUpdate() {
		if (!this.voxshadow)
			return;
		//light dir from 1,0,0
		if (KeyBoardManager.hasKeyDown(Keyboard.CONTROL)) {
			var deg: number = this.lightDeg * Math.PI / 180;
			this.voxshadow.lightDir = new Vector3(-Math.cos(deg), -Math.sin(deg), 0);
			this.voxshadow.updateLight2(this.cubemesh);
			this.lightDeg++;
			if (this.lightDeg >= 360)
				this.lightDeg = 0;
			this.cubemesh.UpColorData();
		}
	}
}

