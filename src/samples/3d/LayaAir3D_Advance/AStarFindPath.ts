import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Animator } from "laya/d3/component/Animator"
import { AnimatorState } from "laya/d3/component/AnimatorState"
import { PathFind } from "laya/d3/component/PathFind"
import { Camera } from "laya/d3/core/Camera"
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
import { MeshTerrainSprite3D } from "laya/d3/core/MeshTerrainSprite3D"
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
import { Scene3D } from "laya/d3/core/scene/Scene3D"
import { Quaternion } from "laya/d3/math/Quaternion"
import { Vector3 } from "laya/d3/math/Vector3"
import { Mesh } from "laya/d3/resource/models/Mesh"
import { Stage } from "laya/display/Stage"
import { Event } from "laya/events/Event"
import { Loader } from "laya/net/Loader"
import { Texture2D } from "laya/resource/Texture2D"
import { Handler } from "laya/utils/Handler"
import { Stat } from "laya/utils/Stat"
import { Tween } from "laya/utils/Tween"

	export class AStarFindPath {
		private terrainSprite:MeshTerrainSprite3D;
		private layaMonkey:Sprite3D;
		private path:Vector3[];
		private _everyPath:any[];
		private _position:Vector3 = new Vector3(0, 0, 0);
		private _upVector3:Vector3 = new Vector3(0, 1, 0);
		private _tarPosition:Vector3 = new Vector3(0, 0, 0);
		private _finalPosition:Vector3 = new Vector3(0, 0, 0);
		private _rotation:Vector3 = new Vector3(-45, 180, 0);
		private _rotation2:Vector3 = new Vector3(0, 180, 0);
		private _quaternion:Quaternion = new Quaternion();
		private index:number = 0;
		private curPathIndex:number = 0;
		private nextPathIndex:number = 1;
		private moveSprite3D:Sprite3D;
		private pointCount:number = 10;
		private scene:Scene3D;
		
		constructor(){
			//初始化引擎
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//显示性能面板
			Stat.show();
			
			this.path = [];
			
			//预加载所有资源
			var resource = [{url: "res/threeDimen/scene/TerrainScene/XunLongShi.ls", clas: Scene3D, priority: 1}, 
			{url: "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", clas: Sprite3D, priority: 1},
			{url: "res/threeDimen/scene/TerrainScene/Assets/HeightMap.png", clas: Texture2D, priority: 1, constructParams: [1024, 1024, 1, false, true]}, 
			{url: "res/threeDimen/scene/TerrainScene/Assets/AStarMap.png", clas: Texture2D, priority: 1, constructParams: [64, 64, 1, false, true]}];
			
			Laya.loader.create(resource, Handler.create(this, this.onLoadFinish));
		}
		
		private onLoadFinish():void {
			//初始化3D场景
			this.scene = (<Scene3D>Laya.stage.addChild(Loader.getRes("res/threeDimen/scene/TerrainScene/XunLongShi.ls")) );
			
			//根据场景中方块生成路径点
			this.initPath(this.scene);
			
			//获取可行走区域模型
			var meshSprite3D:MeshSprite3D = (<MeshSprite3D>this.scene.getChildByName('Scenes').getChildByName('HeightMap') );
			//使可行走区域模型隐藏
			meshSprite3D.active = false;
			var heightMap:Texture2D = (<Texture2D>Loader.getRes("res/threeDimen/scene/TerrainScene/Assets/HeightMap.png") );
			//初始化MeshTerrainSprite3D
			this.terrainSprite = MeshTerrainSprite3D.createFromMeshAndHeightMap((<Mesh>meshSprite3D.meshFilter.sharedMesh ), heightMap, 6.574996471405029, 10.000000953674316);
			//更新terrainSprite世界矩阵(为可行走区域世界矩阵)
			this.terrainSprite.transform.worldMatrix = meshSprite3D.transform.worldMatrix;
			
			//给terrainSprite添加PathFind组件
			var pathFingding:PathFind = (<PathFind>this.terrainSprite.addComponent(PathFind) );
			pathFingding.setting = {allowDiagonal: true, dontCrossCorners: false, heuristic: Heuristic.manhattan, weight: 1};
			var aStarMap:Texture2D = (<Texture2D>Loader.getRes("res/threeDimen/scene/TerrainScene/Assets/AStarMap.png") );
			pathFingding.grid = Grid.createGridFromAStarMap(aStarMap);
			
			//初始化移动单元
			this.moveSprite3D = (<Sprite3D>this.scene.addChild(new Sprite3D()) );
			this.moveSprite3D.transform.position = this.path[0];
			
			//初始化小猴子
			this.layaMonkey = (<Sprite3D>this.moveSprite3D.addChild(Loader.getRes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")) );
			
			var tmpLocalScale:Vector3 = this.layaMonkey.transform.localScale;
			tmpLocalScale.setValue(0.5, 0.5, 0.5);
			var aniSprite3d:Sprite3D = (<Sprite3D>this.layaMonkey.getChildAt(0) );
			
			//获取动画组件
			var animator:Animator = (<Animator>aniSprite3d.getComponent(Animator) );
			//创建动作状态
			var state:AnimatorState = new AnimatorState();
			//动作名称
			state.name = "run";
			//动作播放起始时间
			state.clipStart = 40 / 150;
			//动作播放结束时间
			state.clipEnd = 70 / 150;
			//设置动作
			state.clip = animator.getDefaultState().clip;
			//为动画组件添加一个动作状态
			animator.addState(state);
			//播放动画
			animator.play("run");
			
			//创建BlinnPhong材质
			var mat:BlinnPhongMaterial = (<BlinnPhongMaterial>((<SkinnedMeshSprite3D>this.layaMonkey.getChildAt(0).getChildAt(0) )).skinnedMeshRenderer.sharedMaterial );
			//设置反照率强度
			mat.albedoIntensity = 8;
			//设置猴子精灵的位置
			this.layaMonkey.transform.position.cloneTo(this._finalPosition);
			
			//初始化相机
			var moveCamera:Camera = (<Camera>this.moveSprite3D.addChild(new Camera()) );
			var tmpLocalPosition:Vector3 = moveCamera.transform.localPosition;
			tmpLocalPosition.setValue( -1.912066, 10.07926, -10.11014);
			
			//_rotation.setValue( -0.01462472, -0.9652351, -0.2550373);
			moveCamera.transform.rotate(this._rotation, true, false);
			
			//设置鼠标弹起事件响应
			Laya.stage.on(Event.MOUSE_UP, this, function():void {
				this.index = 0;
				//获取每次生成路径
				this._everyPath = pathFingding.findPath(this.path[this.curPathIndex % this.pointCount].x, this.path[this.curPathIndex++ % this.pointCount].z, this.path[this.nextPathIndex % this.pointCount].x, this.path[this.nextPathIndex++ % this.pointCount].z);
			});
			//开启定时重复执行
			Laya.timer.loop(40, this, this.loopfun);
		}
		
		private loopfun():void {
			if (this._everyPath && this.index < this._everyPath.length) {
				//AStar寻路位置
				this._position.x = this._everyPath[this.index][0];
				this._position.z = this._everyPath[this.index++][1];
				//HeightMap获取高度数据
				this._position.y = this.terrainSprite.getHeight(this._position.x, this._position.z);
				if (isNaN(this._position.y)) {
					this._position.y = this.moveSprite3D.transform.position.y;
				}
				
				this._tarPosition.x = this._position.x;
				this._tarPosition.z = this._position.z;
				this._tarPosition.y = this.moveSprite3D.transform.position.y;
				
				//调整方向
				this.layaMonkey.transform.lookAt(this._tarPosition, this._upVector3, false);
				//因为资源规格,这里需要旋转180度
				this.layaMonkey.transform.rotate(this._rotation2, false, false);
				//调整位置
				Tween.to(this._finalPosition, {x: this._position.x, y: this._position.y, z: this._position.z}, 40);
				this.moveSprite3D.transform.position = this._finalPosition;
			}
		}
		
		private initPath(scene:Scene3D):void {
			for (var i:number = 0; i < this.pointCount; i++) {
				var str:string = "path" + i;
				this.path.push(((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('Area').getChildByName(str) )).transform.localPosition);
			}
		}
	}

