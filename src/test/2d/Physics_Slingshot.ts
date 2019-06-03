import { Laya } from "Laya";
import { Main } from "./../Main";
import { Sprite } from "laya/display/Sprite"
	import { Stage } from "laya/display/Stage"
	import { Render } from "laya/renders/Render"
	import { Browser } from "laya/utils/Browser"
	import { WebGL } from "laya/webgl/WebGL"
	
	export class Physics_Slingshot
	{
		private stageWidth:number = 800;
		private stageHeight:number = 600;
		
		private Matter:any = Browser.window.Matter;
		private LayaRender:any = Browser.window.LayaRender;
		
		private mouseConstraint:any;
		private engine:any;
		
		        Main:typeof Main = null;
        constructor(maincls:typeof Main){
            this.Main=maincls;

			Laya.init(this.stageWidth, this.stageHeight);
			
			Laya.stage.alignV = Stage.ALIGN_MIDDLE;
			Laya.stage.alignH = Stage.ALIGN_CENTER;
			
			Laya.stage.scaleMode = "showall";
			
			this.setup();
		}
		
		private setup():void
		{
			this.initMatter();
			this.initWorld();
			
			Laya.stage.on("resize", this, this.onResize);
		}
		
		private initMatter():void
		{
			var gameWorld:Sprite = new Sprite();
			this.Main.box2D.addChild(gameWorld);
			
			// 初始化物理引擎
			this.engine = this.Matter.Engine.create({enableSleeping: true});
			this.Matter.Engine.run(this.engine);
			
			var render = this.LayaRender.create({engine: this.engine, width: 800, height: 600, options: {background: 'res/physics/img/background.png', wireframes: false}});
			this.LayaRender.run(render);
			
			this.mouseConstraint = this.Matter.MouseConstraint.create(this.engine, {constraint: {angularStiffness: 0.1, stiffness: 2}, element: Render.canvas});
			this.Matter.World.add(this.engine.world, this.mouseConstraint);
			render.mouse = this.mouseConstraint.mouse;
		}
		
		private initWorld():void
		{
			var ground:any = this.Matter.Bodies.rectangle(395, 600, 815, 50, {isStatic: true, render: {visible: false}}), rockOptions:any = {density: 0.004, render: {sprite: {texture: 'res/physics/img/rock.png', xOffset: 23.5, yOffset: 23.5}}}, rock:any = this.Matter.Bodies.polygon(170, 450, 8, 20, rockOptions), anchor:any = {x: 170, y: 450}, elastic:any = this.Matter.Constraint.create({pointA: anchor, bodyB: rock, stiffness: 0.05, render: {lineWidth: 5, strokeStyle: '#dfa417'}});
			
			var pyramid:any = this.Matter.Composites.pyramid(500, 300, 9, 10, 0, 0, function(x, y, column):any
			{
				var texture:any = column % 2 === 0 ? 'res/physics/img/block.png' : 'res/physics/img/block-2.png';
				return this.Matter.Bodies.rectangle(x, y, 25, 40, {render: {sprite: {texture: texture, xOffset: 20.5, yOffset: 28}}});
			});
			
			var ground2:any = this.Matter.Bodies.rectangle(610, 250, 200, 20, {isStatic: true, render: {fillStyle: '#edc51e', strokeStyle: '#b5a91c'}});
			
			var pyramid2:any = this.Matter.Composites.pyramid(550, 0, 5, 10, 0, 0, function(x, y, column):any
			{
				var texture:any = column % 2 === 0 ? 'res/physics/img/block.png' : 'res/physics/img/block-2.png';
				return this.Matter.Bodies.rectangle(x, y, 25, 40, {render: {sprite: {texture: texture, xOffset: 20.5, yOffset: 28}}});
			});
			
			this.Matter.World.add(this.engine.world, [this.mouseConstraint, ground, pyramid, ground2, pyramid2, rock, elastic]);
			
			this.Matter.Events.on(this.engine, 'afterUpdate', function():any
			{
				if (this.mouseConstraint.mouse.button === -1 && (rock.position.x > 190 || rock.position.y < 430))
				{
					rock = this.Matter.Bodies.polygon(170, 450, 7, 20, rockOptions);
					this.Matter.World.add(this.engine.world, rock);
					elastic.bodyB = rock;
				}
			});
		}
		
		private onResize():void
		{
			// 设置鼠标的坐标缩放
			// Laya.stage.clientScaleX代表舞台缩放
			// Laya.stage._canvasTransform代表画布缩放
			this.Matter.Mouse.setScale(this.mouseConstraint.mouse, {x: 1 / (Laya.stage.clientScaleX * Laya.stage._canvasTransform.a), y: 1 / (Laya.stage.clientScaleY * Laya.stage._canvasTransform.d)});
		}
	}


