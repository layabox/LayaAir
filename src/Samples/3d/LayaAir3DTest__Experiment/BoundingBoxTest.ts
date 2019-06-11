import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Tool } from "../common/Tool"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { BoundBox } from "laya/d3/math/BoundBox"
	import { Color } from "laya/d3/math/Color"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { Shader3D } from "laya/d3/shader/Shader3D"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Button } from "laya/ui/Button"
	import { Browser } from "laya/utils/Browser"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	
	/**
	 * ...
	 * @author
	 */
	export class BoundingBoxTest {
		
		private sprite3D:Sprite3D;
		private lineSprite3D:Sprite3D;
		
		constructor(){
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 100)) );
			camera.transform.translate(new Vector3(0, 2, 5));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			camera.clearColor = new Vector4(0.2, 0.2, 0.2, 1.0);
			
			var directionLight:DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()) );
			//设置平行光的方向
			var mat = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix=mat;
			
			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()) );
			this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()) );
			
			//正方体
			var box:MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))) );
			box.transform.position = new Vector3(2.0, 0.75, 0.6);
			box.transform.rotate(new Vector3(0, 45, 0), false, false);
			var boundingBox:BoundBox = box.meshRenderer.bounds._boundBox;
			debugger;
			var corners:Vector3[] = [];
			boundingBox.getCorners(corners);
		
			//为正方体添加像素线渲染精灵,包围盒模式
			var boxLineSprite3D:PixelLineSprite3D = (<PixelLineSprite3D>scene.addChild(new PixelLineSprite3D(12)) );
			Tool.DrawBoundingBox(box, this.sprite3D, Color.RED);
			
		/*	var length:Number = Math.abs(corners[0].x - corners[1].x);
			var cylinder:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.004, length, 8))) as MeshSprite3D;
			cylinder.transform.rotate(new Vector3(0, 0, 90), false, false);
			var cylPos:Vector3 = cylinder.transform.position;
			var x:Number = corners[0].x + corners[1].x; 
			var y:Number = corners[0].y + corners[1].y;
			var z:Number = corners[0].z + corners[1].z;
			cylPos.setValue(x / 2, y / 2, z / 2);
			cylinder.transform.position = cylPos;
			cylinder.transform.rotate(new Vector3(0, 0, 0), false, false);
			//cylinder.transform.position = new Vector3(0, 0.5, 0.6);*/
			
			
			
			/*lineSprite3D.addLine(corners[0], corners[1], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[1], corners[2], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[2], corners[3], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[3], corners[0], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[4], corners[5], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[5], corners[6], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[6], corners[7], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[7], corners[4], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[0], corners[4], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[1], corners[5], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[2], corners[6], Color.RED, Color.RED);
			lineSprite3D.addLine(corners[3], corners[7], Color.RED, Color.RED);*/
			
			/*boxLineSprite3D.addLine(corners[0], corners[1], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[1], corners[2], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[2], corners[3], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[3], corners[4], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[4], corners[5], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[5], corners[6], Color.RED, Color.RED);
			boxLineSprite3D.addLine(corners[6], corners[7], Color.RED, Color.RED);*/
			//boxLineSprite3D.transform.position = new Vector3(2.0, 0.75, 0.6);
			//设置像素线渲染精灵线模式
			//Tool.linearModel(box, boxLineSprite3D, Color.GREEN);
			
			
			
			
			
		
			
			//lineSprite3D.active = false;
			//loadUI();
		}
		
		private curStateIndex:number = 0;
		
		private loadUI():void {
			
			Laya.loader.load(["../../../../res/threeDimen/ui/button.png"], Handler.create(null, function():void {
				
				var changeActionButton:Button = (<Button>Laya.stage.addChild(new Button("../../../../res/threeDimen/ui/button.png", "正常模式")) );
				changeActionButton.size(160, 40);
				changeActionButton.labelBold = true;
				changeActionButton.labelSize = 30;
				changeActionButton.sizeGrid = "4,4,4,4";
				changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				changeActionButton.on(Event.CLICK, this, function():void {
					if (++this.curStateIndex % 2 == 1) {
						//sprite3D.active = false;
						//lineSprite3D.active = true;
						changeActionButton.label = "网格模式";
						var cylinder:MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.005, 1, 5))) );
						cylinder.transform.position = new Vector3(0, 0.5, 0.6);
						var cylinderLineSprite3D:PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(1000)) );
					} else {
						//sprite3D.active = true;
						//lineSprite3D.active = false;
						changeActionButton.label = "正常模式";
					}
				});
			}));
		}
	}

