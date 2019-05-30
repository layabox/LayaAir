import { Laya3D } from "Laya3D"
import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Tool } from "../common/Tool"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Color } from "laya/d3/math/Color"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
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
	import { Quaternion } from "laya/d3/math/Quaternion"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { SimpleCameraScript } from "../worldMaker/SimpleCameraScript"
	
	
	/**
	 * ...
	 * @author
	 */
	export class CustomMesh {
		
		private sprite3D:Sprite3D;
		private lineSprite3D:Sprite3D;
		private _testSprite3D:PixelLineSprite3D;
		
		private generateRegularPolygon(length:number, edges:number, outVertex:any[]):void{
			var tmpQuat:Quaternion = new Quaternion();
			//使用弧度制表示
			var centreAngle:number = 2 * Math.PI / edges;
			var startPoint:Vector3 = new Vector3(0.0, length, 0.0);
			var index:number = 0;
			outVertex[index++] = startPoint.x;
			outVertex[index++] = startPoint.y;
			Quaternion.createFromYawPitchRoll(0.0, 0.0, centreAngle , tmpQuat);
			for (var i:number = 1; i < edges; i++ ){
				Vector3.transformQuat(startPoint, tmpQuat, startPoint);
				outVertex[index++] = startPoint.x;
				outVertex[index++] = startPoint.y;	
			}
		}
		private generateCirclePolygon(slices:number = 32,outVertex:any[]):void{
			var vertexArray:any[] = outVertex;
			var point1:Vector3 = new Vector3();
			var point2:Vector3 = new Vector3();
			var radius:number = 0.2;
			var index:number = 0;
			var sliceAngle:number = (Math.PI * 2.0) / slices;
			for (var i:number = 0; i < slices; i ++ ){
				var x:number = radius * Math.cos(i * sliceAngle);
				var y:number = radius * Math.sin(i * sliceAngle);
				vertexArray[index++] = x;
				vertexArray[index++] = y;	
			}
			
		}
		private generateStarPolygon(starCount:number, long:number, outVertex:any[]):void {
			var tmpQuat:Quaternion = new Quaternion();
			//使用弧度制表示
			var centreAngle:number = Math.PI / starCount;
			var startPoint:Vector3 = new Vector3(0.0, long, 0.0);
			var index:number = 0;
			outVertex[index++] = startPoint.x;
			outVertex[index++] = startPoint.y;
			Quaternion.createFromYawPitchRoll(0.0, 0.0, centreAngle , tmpQuat);
			for (var i:number = 1; i < 2 * starCount; i++ ){
				if(i % 2 === 1){
					Vector3.transformQuat(startPoint, tmpQuat, startPoint);
					Vector3.normalize(startPoint, startPoint);
					Vector3.scale(startPoint, long * 0.4, startPoint);
					Vector3.scalarLength(startPoint);
					
				}
				else{
					Vector3.transformQuat(startPoint, tmpQuat, startPoint);
					Vector3.normalize(startPoint, startPoint);
					Vector3.scale(startPoint, long, startPoint);
				}
				outVertex[index++] = startPoint.x;
				outVertex[index++] = startPoint.y;	
			}
		}
		private generateCircleProfileLine(startHeight:number, endHeight:number,radius:number,stacks:number, outVertex:any[] ):void{
			//求解开始高度对应的角度值
			var startHeightCos:number;
			var startHeightAngle:number;
			startHeightCos = (radius - startHeight) / radius;
			startHeightAngle = Math.acos(startHeightCos);
			//求解结束高度对应的角度值
			var endHeightCos:number;
			var endHeightAngle:number;
			endHeightCos = (endHeight - radius) / radius;
			endHeightAngle = Math.acos(endHeightCos);
			
			var stackAngle:number = (Math.PI - endHeightAngle - startHeightAngle) / stacks;
			
			var index:number = 0;
			outVertex[index++] = 0.0;
			outVertex[index++] = startHeight;
			var angle:number;
			var x:number;
			var y:number;
			var factor:number = 1 / radius;
			for (var i:number = 0; i < (stacks + 1); i++ ){
				angle = i * stackAngle + startHeightAngle;
				x = radius * Math.sin(angle);
				y = radius * Math.cos(angle);
				outVertex[index++] = x * factor;
				outVertex[index++] = radius - y;
			}
			outVertex[index++] = 0.0;
			outVertex[index++] = endHeight;
		}
		
		constructor(){
			
			Shader3D.debugMode = true;
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			
			var camera:Camera = (<Camera>scene.addChild(new Camera(0, 0.1, 10000)) );
			camera.transform.translate(new Vector3(0, 0, 5));
			//camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera._addComponentInstance( new SimpleCameraScript(0, 0, 10, 0, 0, 0));
			//camera.addComponent(CameraMoveScript);
			//camera.clearColor = new Vector4(0.2, 0.2, 0.2, 1.0);
			
			var directionLight:DirectionLight = (<DirectionLight>scene.addChild(new DirectionLight()) );
			//设置平行光的方向
			var mat:Matrix4x4 = directionLight.transform.worldMatrix;
			mat.setForward(new Vector3(-1.0, -1.0, -1.0));
			directionLight.transform.worldMatrix=mat;
			
			this.sprite3D = (<Sprite3D>scene.addChild(new Sprite3D()) );
			this.lineSprite3D = (<Sprite3D>scene.addChild(new Sprite3D()) );
			 
			//var testCrossSection:Array = [ -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5];
			//var testCrossSection:Array = [ -0.5, -0.5, 0, -1.0, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5];
			var testCrossSection:any[] = new Array();
			//generateCirclePolygon(64, testCrossSection);
			//var testProfileLine:Array = new Array();
			//generateCircleProfileLine(0.2, 0.3, 0.2, 16, testProfileLine);
			//generateStarPolygon(8, 1.0, testCrossSection);
			this.generateRegularPolygon(1.0, 11, testCrossSection);
			//var testProfileLine:Array = [0.05, 0.1, 1, 0 , 0.01, 0.3];//0.97, 0.1, 1, 0.1, 1, 4.0 ,0.97, 4.0
			//var testProfileLine:Array = [0.05, 0.1, 0.5, 0 , 0.75, 0, 1.0, 0, 1.0, 0.5, 0.00, 0.5];
			//var testProfileLine:Array = [0.2, 0, 1.0, 0, 1.0, 0.5];
			//var testProfileLine:Array = [0.01, 0, 0.5, 0, 1.0, 0, 1.0, 0.5, 0.5, 1.0, 0.25, 1.0, 0.01, 1.0];
			var testProfileLine:any[] = [0.0, 0.1, 1, 0.1, 1, 0.5, 0.1, 0.6, 0, 0.1];
			//var testProfileLine:Array = [0.5, 0, 1.0, 0];
			var sphere:MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createToothed(16,this.toothedUpWidththis.:Number = 0.015, this.toothedDownWidththis.:Number = 0.02, this.toothedHeigththis.:Number = 0.03,this.innerRadiusthis.:Number = 0.025,this.thicknessthis.:Number = 0.02))) );
			sphere.transform.position = new Vector3(1.0, 0, 0.6);
			var sphereLineSprite3D:PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(9500)) );
			var blinMat:BlinnPhongMaterial = new BlinnPhongMaterial();
			
			//blinMat.albedoColor = new Vector4(0.0, 1.0, 0.0, 1.0);
			blinMat.albedoColor = new Vector4(220/255, 230/255, 240/255, 1.0);
			sphere.meshRenderer.material = blinMat;
			Tool.linearModel(sphere, sphereLineSprite3D, Color.GREEN);

			
			/*var sphere2:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createSphere(0.60, 32, 32))) as MeshSprite3D;
			sphere2.transform.position = new Vector3(1.0, 0.25, 0.6);
			var sphereLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(35000)) as PixelLineSprite3D;
			Tool.linearModel(sphere2, sphereLineSprite3D, Color.GREEN);
			var sphere2materail:BlinnPhongMaterial = new BlinnPhongMaterial();
			sphere2materail.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
			sphere2.meshRenderer.material = sphere2materail;*/
			
			/*var box2:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))) as MeshSprite3D;
			box2.transform.position = new Vector3(2.0, 0.25, 0.6);
			box2.transform.rotate(new Vector3(0, 45, 0), false, false);
			//为正方体添加像素线渲染精灵
			var boxLineSprite3D2:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(100)) as PixelLineSprite3D;
			//设置像素线渲染精灵线模式
			var blinMat2:BlinnPhongMaterial = new BlinnPhongMaterial();
			blinMat2.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
			box2.meshRenderer.material = blinMat2;
			Tool.linearModel(box2, boxLineSprite3D2, Color.GREEN);*/
			
			
			for (var i:number = 0; i < 0; i++ ){
				//正方体
				var box:MeshSprite3D = (<MeshSprite3D>this.sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.generateToothed())) );
				box.transform.position = new Vector3(-10.0 + i * 0.20, 0.025 , 0.6);
				//box.transform.rotate(new Vector3(0, 45, 0), false, false);
				//为正方体添加像素线渲染精灵
				var boxLineSprite3D:PixelLineSprite3D = (<PixelLineSprite3D>this.lineSprite3D.addChild(new PixelLineSprite3D(3000)) );
				//设置像素线渲染精灵线模式
				Tool.linearModel(box, boxLineSprite3D, Color.GREEN);
				var unlit:BlinnPhongMaterial = new BlinnPhongMaterial();
				//unlit.cull = RenderState.CULL_NONE;
				box.meshRenderer.material = unlit;
			}

			
			//球体
			/*var sphere:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createSphere2(0.20, 0.05, 0.0 ,32, 32))) as MeshSprite3D;
			sphere.transform.position = new Vector3(1.0, 0.25, 0.6);
			var sphereLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(35000)) as PixelLineSprite3D;
			Tool.linearModel(sphere, sphereLineSprite3D, Color.GREEN);
			var materail:BlinnPhongMaterial = new BlinnPhongMaterial();
			materail.albedoColor = new Vector4(1.0, 0.0, 0.0, 1.0);
			sphere.meshRenderer.material = materail;
			//_testSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(100)) as PixelLineSprite3D;
			//generateStarPolygon(7, 2.0);
			//generateCirclePolygon();*/
			/*//正方体
			var box:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))) as MeshSprite3D;
			box.transform.position = new Vector3(2.0, 0.25, 0.6);
			box.transform.rotate(new Vector3(0, 45, 0), false, false);
			//为正方体添加像素线渲染精灵
			var boxLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(100)) as PixelLineSprite3D;
			//设置像素线渲染精灵线模式
			Tool.linearModel(box, boxLineSprite3D, Color.GREEN);
			
			//球体
			
			
			
			
			
			//圆柱体
			var cylinder:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCylinder(0.25, 1, 20))) as MeshSprite3D;
			cylinder.transform.position = new Vector3(0, 0.5, 0.6);
			var cylinderLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(1000)) as PixelLineSprite3D;
			Tool.linearModel(cylinder, cylinderLineSprite3D, Color.GREEN);
			
			//胶囊体
			var capsule:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCapsule(0.25, 1, 10, 20))) as MeshSprite3D;
			capsule.transform.position = new Vector3(-1.0, 0.5, 0.6);
			var capsuleLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(3000)) as PixelLineSprite3D;
			Tool.linearModel(capsule, capsuleLineSprite3D, Color.GREEN);
			
			//圆锥体
			var cone:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createCone(0.25, 0.75))) as MeshSprite3D;
			cone.transform.position = new Vector3(-2.0, 0.375, 0.6);
			var coneLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(500)) as PixelLineSprite3D;
			Tool.linearModel(cone, coneLineSprite3D, Color.GREEN);*/
			
			//平面
			//var plane:MeshSprite3D = sprite3D.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))) as MeshSprite3D;
			//var planeLineSprite3D:PixelLineSprite3D = lineSprite3D.addChild(new PixelLineSprite3D(1000)) as PixelLineSprite3D;
			//Tool.linearModel(plane, planeLineSprite3D, Color.GRAY);
			
			this.lineSprite3D.active = false;
			this.loadUI();
		}
		
		/*private function generateStarPolygon(starCount:int, long:Number):void {
			var vertexArray:Float64Array = new Float64Array(6 * starCount);
			var tmpQuat:Quaternion = new Quaternion();
			//使用弧度制表示
			var centreAngle:Number = Math.PI / starCount;
			var startPoint:Vector3 = new Vector3(0.0, long, 0.0);
			var index:int = 0;
			vertexArray[index++] = startPoint.x;
			vertexArray[index++] = startPoint.y;
			vertexArray[index++] = startPoint.z;
			Quaternion.createFromYawPitchRoll(0.0, 0.0, centreAngle , tmpQuat);
			for (var i:int = 1; i < 2 * starCount; i++ ){
				if(i % 2 === 1){
					Vector3.transformQuat(startPoint, tmpQuat, startPoint);
					Vector3.normalize(startPoint, startPoint);
					Vector3.scale(startPoint, long * 0.4, startPoint);
					Vector3.scalarLength(startPoint);
					
				}
				else{
					Vector3.transformQuat(startPoint, tmpQuat, startPoint);
					Vector3.normalize(startPoint, startPoint);
					Vector3.scale(startPoint, long, startPoint);
				}
				vertexArray[index++] = startPoint.x;
				vertexArray[index++] = startPoint.y;
				vertexArray[index++] = startPoint.z;
				
			}
			var point1:Vector3 = new Vector3();
			var point2:Vector3 = new Vector3();
			for (var j:int = 1; j < starCount * 2; j++){
				var offset:int = j * 3;
				point1.x = vertexArray[offset - 3];
				point1.y = vertexArray[offset - 2];
				point1.z = vertexArray[offset - 1];
				point2.x = vertexArray[offset + 0];
				point2.y = vertexArray[offset + 1];
				point2.z = vertexArray[offset + 2];
				
				_testSprite3D.addLine(point1, point2, Color.RED, Color.RED);
			}
			offset = 6 * starCount;
			point1.x = vertexArray[offset - 3];
			point1.y = vertexArray[offset - 2];
			point1.z = vertexArray[offset - 1];
			point2.x = vertexArray[0];
			point2.y = vertexArray[1];
			point2.z = vertexArray[2];
			_testSprite3D.addLine(point1, point2, Color.RED, Color.RED);
			
			point1.x = 0.0;
			point1.y = 0.0;
			point1.z = 0.0;
			for (var k:int = 0; k < starCount * 2; k++){
				var offset:int = k * 3;
				point2.x = vertexArray[offset + 0];
				point2.y = vertexArray[offset + 1];
				point2.z = vertexArray[offset + 2];
				
				_testSprite3D.addLine(point1, point2, Color.RED, Color.RED);
			}
			
		}*/
		
		/*private function generateCirclePolygon():void{
			var slices:int = 32;
			var vertexArray:Float64Array = new Float64Array(3 * slices);
			var point1:Vector3 = new Vector3();
			var point2:Vector3 = new Vector3();
			var radius:Number = 2.0;
			var index:int = 0;
			var sliceAngle:Number = (Math.PI * 2.0) / slices;
			for (var i:int = 0; i < slices; i ++ ){
				var x:Number = radius * Math.cos(i * sliceAngle);
				var y:Number = radius * Math.sin(i * sliceAngle);
				vertexArray[index++] = x;
				vertexArray[index++] = y;
				vertexArray[index++] = 0;
				if (i !== 0){
					point1.x = vertexArray[index - 6];
					point1.y = vertexArray[index - 5];
					point1.z = vertexArray[index - 4];
					point2.x = vertexArray[index - 3];
					point2.y = vertexArray[index - 2];
					point2.z = vertexArray[index - 1];
					_testSprite3D.addLine(point1, point2, Color.RED, Color.RED);
				}
				
			}
			
			point1.x = vertexArray[index - 3];
			point1.y = vertexArray[index - 2];
			point1.z = vertexArray[index - 1];
			point2.x = vertexArray[0];
			point2.y = vertexArray[1];
			point2.z = vertexArray[2];
			_testSprite3D.addLine(point1, point2, Color.RED, Color.RED);
		}*/
		
		private curStateIndex:number = 0;
		
		private loadUI():void {
			
			Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function():void {
				
				var changeActionButton:Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "正常模式")) );
				changeActionButton.size(160, 40);
				changeActionButton.labelBold = true;
				changeActionButton.labelSize = 30;
				changeActionButton.sizeGrid = "4,4,4,4";
				changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				changeActionButton.on(Event.CLICK, this, function():void {
					if (++this.curStateIndex % 2 == 1) {
						this.sprite3D.active = false;
						this.lineSprite3D.active = true;
						changeActionButton.label = "网格模式";
					} else {
						this.sprite3D.active = true;
						this.lineSprite3D.active = false;
						changeActionButton.label = "正常模式";
					}
				});
			}));
		}
	}

