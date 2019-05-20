	
    import { Rectangle } from '../core/laya/maths/Rectangle';
    import {Laya} from "../core/Laya"
import { Stat } from '../core/laya/utils/Stat';
import { Stage } from '../core/laya/display/Stage';
import { Handler } from '../core/laya/utils/Handler';
import { Sprite } from '../core/laya/display/Sprite';
import { Browser } from '../core/laya/utils/Browser';
import { Texture } from '../core/laya/resource/Texture';


class Maggot extends Sprite {
    direction:number;
    turningSpeed:number;
    speed:number;
    offset:number;
}

    export class PerformanceTest_Maggots
	{
		private texturePath = "res/tinyMaggot.png";
		private texturePath1 = "res/tinyMaggot1.png";
		
		private padding = 100;
		private maggotAmount = 15000;

		private tick = 0;
        private maggots:Maggot[] = [];
		private wrapBounds:Rectangle;
		private maggotTexture:Texture;
		private maggotTexture1:Texture;
		constructor(){
			Laya.init(Browser.clientWidth,Browser.clientHeight);
			//Laya.stage.bgColor = "#000000";
			Stat.show();
			Laya.stage.scaleMode = Stage.SCALE_FIXED_WIDTH;
			//URL.rootPath = URL.basePath = "http://10.10.20.29:13999/";
			
			this.wrapBounds = new Rectangle(-this.padding, -this.padding, Laya.stage.width + this.padding * 2, Laya.stage.height + this.padding * 2);
			
			Laya.loader.load(this.texturePath, Handler.create(this, this.onTextureLoaded));
			//Laya.loader.load(texturePath1, Handler.create(this, onTextureLoaded1));
		}
		
		private onTextureLoaded(e:any=null):void
		{
			this.maggotTexture = Laya.loader.getRes(this.texturePath);
			//if (maggotTexture1)
			//{
				this.initMaggots();
				Laya.timer.frameLoop(1, this, this.animate);
			//}
		}
		
		private initMaggots():void 
		{
			var maggotContainer:Sprite;
			for (var i:number = 0; i < this.maggotAmount; i++)
			{
				if (i % 16000 == 0)
					maggotContainer = this.createNewContainer();

				var maggot = this.newMaggot(i);
				maggotContainer.addChild(maggot);
				this.maggots.push(maggot);
			}
		}

		private createNewContainer():Sprite
		{
			var container = new Sprite();
			container.size(Browser.clientWidth,Browser.clientHeight);
			Laya.stage.addChild(container);
			return container;
		}
		
		private newMaggot(index:number):Maggot
		{
			var maggot = new Maggot();
			if (index % 50 == 0&&0){
				maggot.texture = this.maggotTexture1;
				//maggot.graphics.drawTexture(maggotTexture1, 0, 0);
			}
			else
			{
				maggot.texture = this.maggotTexture;
				//maggot.graphics.drawTexture(maggotTexture, 0, 0);
			}

			maggot.pivot(16.5, 35);

			var rndScale = 0.8 + Math.random() * 0.3;
			maggot.scale(rndScale, rndScale);
			maggot.rotation = 1;
			maggot.x = Math.random() * Laya.stage.width;
			maggot.y = Math.random() * Laya.stage.height;
			
			maggot.direction = Math.random() * Math.PI;
			maggot.turningSpeed = (Math.random() - 0.8)*0.01;
			maggot.speed = (2 + Math.random() * 2) * 0.2;
			maggot.offset = Math.random() * 100;

			return maggot;
        }
        
		private animate():void{
			var wb:Rectangle = this.wrapBounds;
			var angleUnit:number = 180 / Math.PI;
			var dir:any, x:number = 0.0, y:number = 0.0;
			for (var i:number = 0; i < this.maggotAmount; i++){
				let maggot = this.maggots[i];
				
				var sy:number = 0.90 + Math.sin(this.tick + maggot.offset) * 0.1;
				
				maggot.direction += maggot.turningSpeed;
				dir = maggot.direction;
				x = maggot._x;
				y = maggot._y;

				x += Math.sin(dir) * (maggot.speed * sy);
				y += Math.cos(dir) * (maggot.speed * sy);
				
				if (x < wb.x)
					x += wb.width;
				else if (x > wb.x + wb.width)
					x -= wb.width;
				if (y < wb.y)
					y += wb.height;
				else if (y > wb.y + wb.height)
					y -= wb.height;
				
				//maggot.scaleY = sy;
				//maggot.rotation = (-dir + Math.PI) * angleUnit;
				//maggot.pos(x, y, true);
				maggot._setX(x);
				maggot._setY(y);
				maggot._setScaleY(sy);
				maggot._setRotation( ( -dir + Math.PI) * angleUnit );
				maggot._setTranformChange();
			}
			this.tick += 0.1;
		}
	}

new PerformanceTest_Maggots();