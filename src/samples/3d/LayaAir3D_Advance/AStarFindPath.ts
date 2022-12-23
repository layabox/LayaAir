// import { Laya } from "Laya";
// import { Camera } from "laya/d3/core/Camera";
// import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial";
// import { MeshSprite3D } from "laya/d3/core/MeshSprite3D";
// import { Scene3D } from "laya/d3/core/scene/Scene3D";
// import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D";
// import { Sprite3D } from "laya/d3/core/Sprite3D";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Mesh } from "laya/d3/resource/models/Mesh";
// import { Stage } from "laya/display/Stage";
// import { Event } from "laya/events/Event";
// import { ILoadURL, Loader } from "laya/net/Loader";
// import { Texture2D } from "laya/resource/Texture2D";
// import { Handler } from "laya/utils/Handler";
// import { Stat } from "laya/utils/Stat";
// import { Tween } from "laya/utils/Tween";
// import { Laya3D } from "Laya3D";
// import { CameraMoveScript } from "../common/CameraMoveScript";
// import { Vector2 } from "laya/d3/math/Vector2";
// import { Animator } from "laya/d3/component/Animator/Animator";
// import { AnimatorState } from "laya/d3/component/Animator/AnimatorState";

// /**
//  * Based upon https://github.com/bgrins/javascript-astar
//  */
// export class AStarFindPath {

//     private terrainSprite: MeshTerrainSprite3D;
//     private layaMonkey: Sprite3D;
//     private path: Vector3[];
//     private _everyPath: any[];
//     private _position: Vector3 = new Vector3(0, 0, 0);
//     private _upVector3: Vector3 = new Vector3(0, 1, 0);
//     private _tarPosition: Vector3 = new Vector3(0, 0, 0);
//     private _finalPosition: Vector3 = new Vector3(0, 0, 0);
//     private _rotation: Vector3 = new Vector3(-45, 180, 0);
//     private _rotation2: Vector3 = new Vector3(0, 180, 0);
//     private index: number = 0;
//     private curPathIndex: number = 0;
//     private nextPathIndex: number = 1;
//     private moveSprite3D: Sprite3D;
//     private pointCount: number = 10;
//     private scene: Scene3D;

//     //寻路使用的变量
//     private aStarMap: any;
//     private graph: any;
//     private opts: any;
//     private resPath: Array<Vector2> = new Array<Vector2>();
//     private resPathLength: number;

//     private startPoint: Vector2;
//     private endPoint: Vector2;
//     constructor() {
//         //初始化引擎
//         Laya3D.init(0, 0);
//         Laya.stage.scaleMode = Stage.SCALE_FULL;
//         Laya.stage.screenMode = Stage.SCREEN_NONE;
//         //显示性能面板
//         Stat.show();

//         this.path = [];
//         this.startPoint = new Vector2();
//         this.endPoint = new Vector2();
//         for (var i: number = 0; i < 20; ++i) {
//             var newVec: Vector2 = new Vector2();
//             this.resPath.push(newVec);
//         }

//         //预加载所有资源
//         var resource: ILoadURL[] = [{ url: "res/threeDimen/scene/TerrainScene/XunLongShi.ls", priority: 1 },
//         { url: "res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh", priority: 1 },
//         { url: "res/threeDimen/scene/TerrainScene/Assets/HeightMap.png", priority: 1, constructParams: [1024, 1024, 1, false, true] },
//         { url: "res/threeDimen/scene/TerrainScene/Assets/AStarMap.png", priority: 1, constructParams: [64, 64, 1, false, true] }
//         ];

//         Laya.loader.load(resource, Handler.create(this, this.onLoadFinish));
//     }

//     private onLoadFinish(): void {
//         //初始化3D场景
//         this.scene = (<Scene3D>Laya.stage.addChild(Loader.createNodes("res/threeDimen/scene/TerrainScene/XunLongShi.ls")));

//         //根据场景中方块生成路径点
//         this.initPath(this.scene);

//         //获取可行走区域模型
//         var meshSprite3D: MeshSprite3D = (<MeshSprite3D>this.scene.getChildByName('Scenes').getChildByName('HeightMap'));
//         //使可行走区域模型隐藏
//         meshSprite3D.active = false;
//         var heightMap = Loader.getTexture2D("res/threeDimen/scene/TerrainScene/Assets/HeightMap.png");
//         //初始化MeshTerrainSprite3D
//         this.terrainSprite = MeshTerrainSprite3D.createFromMeshAndHeightMap((<Mesh>meshSprite3D.meshFilter.sharedMesh), heightMap, 6.574996471405029, 10.000000953674316);
//         //更新terrainSprite世界矩阵(为可行走区域世界矩阵)
//         this.terrainSprite.transform.worldMatrix = meshSprite3D.transform.worldMatrix;

//         //读取墙壁的数据
//         this.aStarMap = Loader.getTexture2D("res/threeDimen/scene/TerrainScene/Assets/AStarMap.png");

//         //使用astar组织数据
//         var aStarArr = this.createGridFromAStarMap(this.aStarMap);
//         this.graph = new (window as any).Graph(aStarArr);
//         this.opts = [];
//         this.opts.closest = true;
//         this.opts.heuristic = (window as any).astar.heuristics.diagonal;

//         //初始化移动单元
//         this.moveSprite3D = (<Sprite3D>this.scene.addChild(new Sprite3D()));
//         this.moveSprite3D.transform.position = this.path[0];


//         //初始化小猴子
//         this.layaMonkey = (<Sprite3D>this.moveSprite3D.addChild(Loader.createNodes("res/threeDimen/skinModel/LayaMonkey/LayaMonkey.lh")));

//         var tmpLocalScale: Vector3 = this.layaMonkey.transform.localScale;
//         tmpLocalScale.setValue(0.5, 0.5, 0.5);
//         var aniSprite3d: Sprite3D = (<Sprite3D>this.layaMonkey.getChildAt(0));

//         //获取动画组件
//         var animator: Animator = (<Animator>aniSprite3d.getComponent(Animator));
//         //创建动作状态
//         var state: AnimatorState = new AnimatorState();
//         //动作名称
//         state.name = "run";
//         //动作播放起始时间
//         state.clipStart = 40 / 150;
//         //动作播放结束时间
//         state.clipEnd = 70 / 150;
//         //设置动作
//         state.clip = animator.getDefaultState().clip;
//         //为动画组件添加一个动作状态
//         animator.getControllerLayer(0).addState(state);
//         //播放动画
//         animator.play("run");

//         //创建BlinnPhong材质
//         var mat: BlinnPhongMaterial = (<BlinnPhongMaterial>((<SkinnedMeshSprite3D>this.layaMonkey.getChildAt(0).getChildAt(0))).skinnedMeshRenderer.sharedMaterial);
//         //设置反照率强度
//         mat.albedoIntensity = 8;
//         //设置猴子精灵的位置
//         this.layaMonkey.transform.position.cloneTo(this._finalPosition);

//         //初始化相机
//         var moveCamera: Camera = (<Camera>this.moveSprite3D.addChild(new Camera()));
//         var tmpLocalPosition: Vector3 = moveCamera.transform.localPosition;
//         tmpLocalPosition.setValue(-1.912066, 10.07926, -10.11014);
//         moveCamera.transform.localPosition = tmpLocalPosition;
//         moveCamera.transform.rotate(this._rotation, true, false);
//         moveCamera.addComponent(CameraMoveScript);

//         //设置鼠标弹起事件响应
//         Laya.stage.on(Event.MOUSE_UP, this, function (): void {
//             this.index = 0;
//             //获取每次生成路径
//             this.getGridIndex(this.path[this.curPathIndex % this.pointCount].x, this.path[this.curPathIndex++ % this.pointCount].z, this.startPoint);
//             this.getGridIndex(this.path[this.nextPathIndex % this.pointCount].x, this.path[this.nextPathIndex++ % this.pointCount].z, this.endPoint);
//             var start = this.graph.grid[this.startPoint.x][this.startPoint.y];
//             var end = this.graph.grid[this.endPoint.x][this.endPoint.y];

//             this._everyPath = (window as any).astar.search(this.graph, start, end, {
//                 closest: this.opts.closest
//             });
//             if (this._everyPath && this._everyPath.length > 0) {
//                 this.getRealPosition(start, this._everyPath);
//             }
//         });
//         //开启定时重复执行
//         Laya.timer.loop(40, this, this.loopfun);
//     }

//     private loopfun(): void {
//         if (this.resPath && this.index < this.resPathLength) {
//             //AStar寻路位置
//             this._position.x = this.resPath[this.index].x;
//             this._position.z = this.resPath[this.index++].y;
//             //HeightMap获取高度数据
//             this._position.y = this.terrainSprite.getHeight(this._position.x, this._position.z);
//             if (isNaN(this._position.y)) {
//                 this._position.y = this.moveSprite3D.transform.position.y;
//             }

//             this._tarPosition.x = this._position.x;
//             this._tarPosition.z = this._position.z;
//             this._tarPosition.y = this.moveSprite3D.transform.position.y;

//             //调整方向
//             this.layaMonkey.transform.lookAt(this._tarPosition, this._upVector3, false);
//             //因为资源规格,这里需要旋转180度
//             this.layaMonkey.transform.rotate(this._rotation2, false, false);
//             //调整位置
//             Tween.to(this._finalPosition, { x: this._position.x, y: this._position.y, z: this._position.z }, 40);
//             this.moveSprite3D.transform.position = this._finalPosition;
//         }
//     }

//     private initPath(scene: Scene3D): void {
//         for (var i: number = 0; i < this.pointCount; i++) {
//             var str: string = "path" + i;
//             this.path.push(((<MeshSprite3D>scene.getChildByName('Scenes').getChildByName('Area').getChildByName(str))).transform.localPosition);
//         }
//     }

//     /**
//     * 得到整数的网格索引
//     */
//     private getGridIndex(x: number, z: number, out: Vector2) {
//         var minX = this.terrainSprite.minX;
//         var minZ = this.terrainSprite.minZ;
//         var cellX = this.terrainSprite.width / this.aStarMap.width;
//         var cellZ = this.terrainSprite.depth / this.aStarMap.height;
//         var gridX = Math.floor((x - minX) / cellX);
//         var gridZ = Math.floor((z - minZ) / cellZ);
//         var boundWidth = this.aStarMap.width - 1;
//         var boundHeight = this.aStarMap.height - 1;
//         (gridX > boundWidth) && (gridX = boundWidth);
//         (gridZ > boundHeight) && (gridZ = boundHeight);
//         (gridX < 0) && (gridX = 0);
//         (gridZ < 0) && (gridZ = 0);
//         out.x = gridX;
//         out.y = gridZ;
//     }

//     /**
//      * 得到世界坐标系下的真实坐标
//      */
//     private getRealPosition(start, path): any {
//         this.resPathLength = path.length;
//         var minX = this.terrainSprite.minX;
//         var minZ = this.terrainSprite.minZ;
//         var cellX = this.terrainSprite.width / this.aStarMap.width;
//         var cellZ = this.terrainSprite.depth / this.aStarMap.height;
//         var halfCellX = cellX / 2;
//         var halfCellZ = cellZ / 2;

//         this.resPath[0].x = start.x * cellX + halfCellX + minX;
//         this.resPath[0].y = start.y * cellZ + halfCellZ + minZ;

//         if (this.resPath.length < path.length) {
//             var diff: number = path.length - this.resPath.length;
//             for (var j: number = 0; j < diff; ++j) {
//                 var newPoint: Vector2 = new Vector2();
//                 this.resPath.push(newPoint);
//             }

//         }

//         for (var i = 1; i < path.length; i++) {
//             var gridPos = path[i];
//             this.resPath[i].x = gridPos.x * cellX + halfCellX + minX;
//             this.resPath[i].y = gridPos.y * cellZ + halfCellZ + minZ;
//         }
//         return 0;
//     }

//     /**
//      * 通过图片数据计算得到AStart网格
//      */
//     private createGridFromAStarMap(texture): any {
//         var textureWidth = texture.width;
//         var textureHeight = texture.height;
//         var pixelsInfo = texture.getPixels();
//         var aStarArr = [];
//         var index = 0;
//         for (var w = 0; w < textureWidth; w++) {
//             var colaStarArr = aStarArr[w] = [];
//             for (var h = 0; h < textureHeight; h++) {
//                 var r = pixelsInfo[index++];
//                 var g = pixelsInfo[index++];
//                 var b = pixelsInfo[index++];
//                 var a = pixelsInfo[index++];
//                 if (r == 255 && g == 255 && b == 255 && a == 255)
//                     colaStarArr[h] = 1;
//                 else {
//                     colaStarArr[h] = 0;
//                 }
//             }
//         };
//         return aStarArr;
//     }
// }