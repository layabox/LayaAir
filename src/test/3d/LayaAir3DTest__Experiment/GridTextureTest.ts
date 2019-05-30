import { Config3D } from "./Config3D";
import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { TextureExpandSprite } from "././TextureExpandSprite";
import { PixGridSprite } from "./PixGridSprite"
	import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Color } from "laya/d3/math/Color"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Button } from "laya/ui/Button"
	import { Browser } from "laya/utils/Browser"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	import { PrimitiveMesh } from "laya/d3/resource/models/PrimitiveMesh"
	import { Sprite } from "laya/display/Sprite"
	
	export class GridTextureTest {
		private plane:PixGridSprite;
		private scene:Scene3D;
		private image:any;
		private plane2:MeshSprite3D;
		
		constructor(){
			var c:Config3D = new Config3D();
			//关闭抗锯齿
			c.isAntialias = true;
			Laya3D.init(0, 0,c);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			this.imageShuzi = null;
			var camera:Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 100)) );
			camera.transform.translate(new Vector3(0, 3.5, 7));
			camera.transform.rotate(new Vector3(-30, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			
			//

			
			//平面
			
			
			var url:string = "res/threeDimen/texture/shuzi1.png";
			this.image = new Browser.window.Image();
			this.image.crossOrigin = "";
			this.image.onload = this.onload;
			this.image.src = url;
		
		/*var plane:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(6, 6, 10, 10))) as MeshSprite3D;
		
		   var mat:UnlitMaterial = new UnlitMaterial();
		   mat.renderMode = UnlitMaterial.RENDERMODE_TRANSPARENT;
		   var pixTexture:PixelTexture = new PixelTexture(Color.RED, 20);
		   Texture2D.load("../../../../res/threeDimen/texture/1.png", Handler.create(null, function(texture:Texture2D):void {
		   //设置过滤方式
		   texture.filterMode = BaseTexture.FILTERMODE_TRILINEAR;
		   texture.anisoLevel = 16;
		   texture.wrapModeU = BaseTexture.WARPMODE_CLAMP;
		   texture.wrapModeV = BaseTexture.WARPMODE_CLAMP;
		   //设置反照率贴图
		   mat.albedoTexture = pixTexture;
		   }));
		
		   plane.meshRenderer.material = mat;*/
		   
		 
		   
		   this.loadUI();
		
		}
		
		private loadUI():void {
			
			Laya.loader.load(["res/threeDimen/ui/button.png"], Handler.create(this, function():void {
				
				var changeActionButton:Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "1")) );
				changeActionButton.size(50, 40);
				changeActionButton.labelBold = true;
				changeActionButton.labelSize = 30;
				changeActionButton.sizeGrid = "4,4,4,4";
				changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
				changeActionButton.pos(Laya.stage.width / 2 - changeActionButton.width * Browser.pixelRatio / 2, Laya.stage.height - 100 * Browser.pixelRatio);
				
				changeActionButton.on(Event.CLICK, this, function():void {
					/*plane = scene.addChild(new PixGridSprite(10, 10, Color.RED, 10)) as PixGridSprite;
					//var plane2:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createPlane(10, 10, 10, 10))) as MeshSprite3D;
					var box:MeshSprite3D = scene.addChild(new MeshSprite3D(PrimitiveMesh.createBox(0.5, 0.5, 0.5))) as MeshSprite3D;
					box.transform.translate(new Vector3( -4.75, 0, -4.75));
					//plane.transform.translate(new Vector3( 0.109780439, 0, 0.109780439));
			
					//plane.transform.rotate(new Vector3(90, 0, 0), true, false);
					//plane.setDivide(20);
					plane.paintGridB(5, 5, Color.GREEN, Color.BLUE);
					
					//plane.paintGridFigureImage(4, 4, image);
					//plane.paintGridFigureImage(6, 6, image);
					var figurePixs:Uint8Array = new Uint8Array(50 * 50 * 4);
					for (var i:int = 0; i < 2500; i++ ){
						figurePixs[i * 4 + 0] = 255;
						figurePixs[i * 4 + 1] = 0;
						figurePixs[i * 4 + 2] = 0;
						figurePixs[i * 4 + 3] = 255;
					}
					plane.paintGridFigurePixs(7, 7, figurePixs);
					plane.apply();*/
					
					var canvas:any= Browser.document.createElement("canvas");
					canvas.height = 64;
					canvas.width = 64;
					var context:any=canvas.getContext("2d");
					context.clear();
					context.drawImage(this.image,0,0,this.image.width,this.image.height,0,0,this.image.width,this.image.height);
					this.plane2 = (<MeshSprite3D>this.scene.addChild(new TextureExpandSprite(10,10, canvas, 2 )) );
					
				});
				
				var changeActionButton2:Button = (<Button>Laya.stage.addChild(new Button("res/threeDimen/ui/button.png", "2")) );
				changeActionButton2.size(50, 40);
				changeActionButton2.labelBold = true;
				changeActionButton2.labelSize = 30;
				changeActionButton2.sizeGrid = "4,4,4,4";
				changeActionButton2.scale(Browser.pixelRatio, Browser.pixelRatio);
				changeActionButton2.pos(Laya.stage.width / 2 - changeActionButton2.width * Browser.pixelRatio / 2 - 100, Laya.stage.height - 100 * Browser.pixelRatio);
				
				changeActionButton2.on(Event.CLICK, this, function():void {
					((<TextureExpandSprite>this.plane2 )).repeat = 4;
				});
			
			}));
		}
		
		private onload(image:any):void {
			debugger;
			this._this = image;	
		}
	
	}


