import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Mesh } from "./Mesh";
import { BrushTextureScript } from "../common/BrushTextureScript"
	import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { MeshFilter } from "laya/d3/core/MeshFilter"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration"
	import { Color } from "laya/d3/math/Color"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Ray } from "laya/d3/math/Ray"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { HitResult } from "laya/d3/physics/HitResult"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Loader } from "laya/net/Loader"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	import { Texture2D } from "laya/resource/Texture2D"
	/**
	 * ...
	 * @author ZhengQixv
	 */
	export class PickTexture 
	{
		private _scene:Scene3D;
		private _camera:Camera;
		private _ray:Ray; 
		private _newTexture:Texture2D = null;
		private _xiaocaoTex:Texture2D = null;
		private _xiaocaoTex32:Texture2D = null;
		private _oldTexture:Texture2D = null;
		private static _oldPixs:Uint8Array;
		private static _newPixs:Uint8Array;
		private static _grassPixs05_15:Uint8Array;
		private static _grassPixs0500:Uint8Array;
		private static _grassPixs0515:Uint8Array;
		private static _grassPixs1_15:Uint8Array;
		private static _grassPixs100:Uint8Array;
		private static _grassPixs115:Uint8Array;

		private static _newPix:Uint8Array = new Uint8Array(4);
		private static _oldTexWidth:number;
		private static _oldTexHeight:number;
		private static _newTexWidth:number;
		private static _newTexHeight:number;
		
		//笔刷的模式
		private static BRUSH_MODE;//0表示线刷，1表示刷纹理图片 
		//笔刷颜色
		private static _brushColor:Color = new Color(1.0, 0.0, 0.0, 1.0);
		private static _brushColorR:number = PickTexture._brushColor.r * 255;
		private static _brushColorG:number = PickTexture._brushColor.g * 255;
		private static _brushColorB:number = PickTexture._brushColor.b * 255;
		private static _brushColorA:number = PickTexture._brushColor.r * 255;
		
		
		//鼠标点击的屏幕点
		private _point:Vector2 = new Vector2();
		//鼠标转换的局部坐标
		private static _locaPoint:Vector3 = new Vector3;
		//进行射线检测使用的三个顶点
		private static _vertex1UV:Vector2 = new Vector2;
		private static _vertex2UV:Vector2 = new Vector2;
		private static _vertex3UV:Vector2 = new Vector2;
		//鼠标是否在移动
		private  _isMoving:boolean = false;
		//当前选中的精灵
		private static _curMeshSprite:MeshSprite3D;
		//当前选中的精灵的顶点数据
		private static _vertexBuffers:VertexBuffer3D[];
		//当前选中的精灵的顶点索引
		private static _indexBuffer:Uint16Array;
		//当前选中的精灵的世界矩阵的逆矩阵
		private static _inervesWorldMat:Matrix4x4 = new Matrix4x4;
		
		 width:number = 20;
		private _isClick:boolean = false;
		 _outHitResult:HitResult = new HitResult();
		private _lastUV:any = null;
		
		//存储已经填充的像素点
		private  vecAllP:any[] = new Array();
		//生成的随机位置
		private static _ranPoint:any = new Object(); 
		
		
		private static _tempVector30:Vector3 = new Vector3();
		private static _tempVector31:Vector3 = new Vector3();
		private static _tempVector32:Vector3 = new Vector3();
		private static _tempVector33:Vector3 = new Vector3();
		private static _tempVector34:Vector3 = new Vector3();
		private static _tempVector35:Vector3 = new Vector3();
		private static _tempVector36:Vector3 = new Vector3();
		private static _tempVector37:Vector3 = new Vector3();
	
		//当前点的uv坐标
		private static _u:number = 0.0;
		private static _v:number = 0.0;
		//在一次移动过程中绘制的第一个圆
		private static _firstCirPos:Vector2[];
		//在一次移动过程中绘制的第一个圆的左边
		private static _firstCirLeft:Vector2[];
		//在一次移动过程中绘制的第一个圆的右边
		private static _firstCirRight:Vector2[];
		//在一次移动过程中绘制的第一个圆的上边
		private static _firstCirUp:Vector2[];
		//在一次移动过程中绘制的第一个圆的上边
		private static _firstCirDown:Vector2[];
		//在一次移动过程中绘制的第一个圆的左上边
		private static _firstCirLeftUp:Vector2[];
		//在一次移动过程中绘制的第一个圆的右下边
		private static _firstCirRightDown:Vector2[];
		//在一次移动过程中绘制的第一个圆的右上边
		private static _firstCirRightUp:Vector2[];
		//在一次移动过程中绘制的第一个圆的左下边
		private static _firstCirLeftDown:Vector2[];
	

		constructor(){
			Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
			//预加载所有资源
			var resource:any[] = [{url: "../../../../res/threeDimen/scene/Conventional/monk.ls", clas: Scene3D, priority: 1},  
			{url: "../../../../res/threeDimen/texture/test13.png", clas: Texture2D, priority: 1, constructParams: [512, 512, 1, true, true]},
			{url: "../../../../res/threeDimen/texture/grass_64.png", clas: Texture2D, priority: 1, constructParams: [64, 64, 1, true, true]},
			{url: "../../../../res/threeDimen/texture/grass_32.png", clas: Texture2D, priority: 1, constructParams: [32, 32, 1, true, true]},
			{url: "../../../../res/threeDimen/texture/earth1024512.png", clas: Texture2D, priority: 1, constructParams: [1024, 512, 1, true, true]},
			{url: "../../../../res/threeDimen/texture/white32_1024512.png", clas: Texture2D, priority: 1, constructParams: [1024, 512, 1, true, true]},
			{url: "../../../../res/threeDimen/texture/white32.png", clas: Texture2D, priority: 1, constructParams: [512, 512, 1, true, true]}];
			Laya.loader.create(resource, Handler.create(this, this.onLoadFinish));		
		}
		
		private onLoadFinish():void {
			//初始化3D场景
			this._scene = (<Scene3D>Laya.stage.addChild(Loader.getRes("../../../../res/threeDimen/scene/Conventional/monk.ls")) );
			//加载新的纹理
			this._newTexture = (<Texture2D>Loader.getRes("../../../../res/threeDimen/texture/earth1024512.png") );
			PickTexture._newPixs = this._newTexture.getPixels();
			this._xiaocaoTex = (<Texture2D>Loader.getRes("../../../../res/threeDimen/texture/grass_64.png") );
			this._xiaocaoTex32 = (<Texture2D>Loader.getRes("../../../../res/threeDimen/texture/grass_32.png") );
			//测试取像素值
			var onePix:Uint8Array = new Uint8Array(PickTexture._newPixs, 0, 4);
			//手动贴了一张纹理（RGBA）
			var cubemesh:MeshSprite3D = (<MeshSprite3D>this._scene.getChildByName("Cube") );
			var material:BlinnPhongMaterial = new BlinnPhongMaterial();
			var texture:Texture2D = (<Texture2D>Loader.getRes("../../../../res/threeDimen/texture/white32.png") );
			material.albedoTexture = texture;
			cubemesh.meshRenderer.material = material;
			
			this._camera = (<Camera>this._scene.getChildByName("Main Camera") );
			this._camera.transform.translate(new Vector3(0, 3, 3));
			this._camera.transform.rotate(new Vector3( -30, 0, 0), true, false);
			this._camera.clearColor = null;
			this._camera.addComponent(CameraMoveScript);
			BrushTextureScript.setPick(this);
			this._camera.addComponent(BrushTextureScript);
			
			var directionLight:DirectionLight = (<DirectionLight>this._scene.addChild(new DirectionLight()) );
			directionLight.color = new Vector3(1, 1, 1);
			directionLight.transform.rotate(new Vector3( -3.14 / 3, 0, 0));
			//灯光开启阴影
			directionLight.shadow = true;
			//可见阴影距离
			directionLight.shadowDistance = 3;
			//生成阴影贴图尺寸
			directionLight.shadowResolution = 2048;
			//生成阴影贴图数量
			directionLight.shadowPSSMCount = 1;
			//模糊等级,越大越高,更耗性能
			directionLight.shadowPCFType = 3;
			//射线初始化（必须初始化）
			this._ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
			
			var pixsSrc:Uint8Array = this._xiaocaoTex.getPixels();
			var brushTexWidth:number = this._xiaocaoTex.width;
			var brushTexHeight:number = this._xiaocaoTex.height;
			var k1:number = 0.5;
			var theta1:number = ( -15) / 180 * Math.PI;
			var theta2:number = (15) / 180 * Math.PI;
			var fsin1:number = Math.sin(theta1);
			var fcos1:number = Math.cos(theta1);
			var newHeight1:number = Math.ceil(Math.abs(brushTexHeight * fcos1) + Math.abs(brushTexWidth * fsin1));
			var newWidth1:number = Math.ceil(Math.abs(brushTexWidth * fcos1) + Math.abs(brushTexHeight * fsin1));
			var fsin2:number = Math.sin(theta2);
			var fcos2:number = Math.cos(theta2);
			var newHeight2:number = Math.ceil(Math.abs(brushTexHeight * fcos2) + Math.abs(brushTexWidth * fsin2));
			var newWidth2:number = Math.ceil(Math.abs(brushTexWidth * fcos2) + Math.abs(brushTexHeight * fsin2));
			
			PickTexture._grassPixs1_15 = this.normalRoate(pixsSrc, brushTexWidth, brushTexHeight, theta1);
			PickTexture._grassPixs05_15 = this.PicZoom(PickTexture._grassPixs1_15,  newWidth1, newHeight1, k1);
			PickTexture._grassPixs115 =  this.normalRoate(pixsSrc, brushTexWidth, brushTexHeight, theta2);
			PickTexture._grassPixs0515 = this.PicZoom(PickTexture._grassPixs115,  newWidth2, newHeight2, k1);
			PickTexture._grassPixs0500 = this.PicZoom(pixsSrc,  brushTexWidth, brushTexHeight, k1);
			
			this.addMouseEvent();
		}
		
		private addMouseEvent():void{
			Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
			Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMove);
			Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
		}
		
		 onMouseDown():void{
			this._isClick = true;
			this._hitPix();
			if(!this._isMoving){
				this.brushTexture();
			}
		}
		
		 onMouseMove():void {
			if (this._isClick === true){
				this._isMoving = true;
				this.brushTexture();
				this._oldTexture.generateMipmap();
			}
			return;	
		}
		 onMouseUp():void{
			if(this._isMoving){
				this._oldTexture.generateMipmap();
				this._isMoving = false;
			}
			this._isClick = false;
			this._lastUV = null;
			return;
		}
		 submitData():void{
			if(this._oldTexture !== null){
				this._oldTexture.setPixels(PickTexture._oldPixs, 0);
			}				
		}
		
		private _hitPix():void{
			this._point.elements[0] = Laya.stage.mouseX;
			this._point.elements[1] = Laya.stage.mouseY;
			//碰撞检测
			this._camera.viewportPointToRay(this._point, this._ray);
			this._scene.physicsSimulation.rayCast(this._ray,this._outHitResult);
			if (this._outHitResult.succeeded)
			{
				PickTexture._curMeshSprite = (<MeshSprite3D>this._outHitResult.collider.owner );
				var meshFliter:MeshFilter = PickTexture._curMeshSprite.meshFilter;
				var mh:Mesh = (<Mesh>meshFliter.sharedMesh );
				PickTexture._vertexBuffers = mh._vertexBuffers;
				PickTexture._indexBuffer = mh._indexBuffer.getData();
				var worldMat:Matrix4x4 = PickTexture._curMeshSprite.transform.worldMatrix;
				worldMat.invert(PickTexture._inervesWorldMat);
				
				//获取原纹理
				var material:BlinnPhongMaterial = PickTexture._curMeshSprite.meshRenderer.material;
				this._oldTexture = (<Texture2D>material.albedoTexture );
				PickTexture._oldPixs = this._oldTexture.getPixels();	
				PickTexture._oldTexWidth = this._oldTexture.width;
				PickTexture._oldTexHeight = this._oldTexture.height;
				PickTexture._newTexWidth = this._newTexture.width;
				PickTexture._newTexHeight = this._newTexture.height;
			}
		}
		
		private brushTexture():void {
			this._point.elements[0] = Laya.stage.mouseX;
			this._point.elements[1] = Laya.stage.mouseY;
			//构造射线
			this._camera.viewportPointToRay(this._point, this._ray);
			//计算选中点的uv
			for (var t:number = 0; t < PickTexture._vertexBuffers.length; t++ ){
				var vertexBuffer:VertexBuffer3D = PickTexture._vertexBuffers[t];
				//射线的起点的局部坐标
				Vector3.transformCoordinate(this._ray.origin, PickTexture._inervesWorldMat, this._ray.origin);
				Vector3.TransformNormal(this._ray.direction, PickTexture._inervesWorldMat, this._ray.direction);
					
				var resultObj:any = this._rayIntersectsPositionsAndIndices(this._ray, vertexBuffer.getData(), vertexBuffer._vertexDeclaration, PickTexture._indexBuffer);
				if(!isNaN(resultObj.distance) ){
					var vertexDatas:Float32Array = vertexBuffer.getData();
					//第一个点的uv坐标
					PickTexture._vertex1UV.x = vertexDatas[resultObj.vertex1Index + 6];
					PickTexture._vertex1UV.y = vertexDatas[resultObj.vertex1Index + 7];
					PickTexture._vertex2UV.x = vertexDatas[resultObj.vertex2Index + 6];
					PickTexture._vertex2UV.y = vertexDatas[resultObj.vertex2Index + 7];
					PickTexture._vertex3UV.x = vertexDatas[resultObj.vertex3Index + 6];
					PickTexture._vertex3UV.y = vertexDatas[resultObj.vertex3Index + 7];
					var ru:number = resultObj.u;
					var rv:number = resultObj.v;
					var rw:number = 1.0 - ru - rv;
					PickTexture._u = rw * PickTexture._vertex1UV.x + ru * PickTexture._vertex2UV.x + rv * PickTexture._vertex3UV.x;
					PickTexture._v = rw * PickTexture._vertex1UV.y + ru * PickTexture._vertex2UV.y + rv * PickTexture._vertex3UV.y;
				}
				
			}
			//临时颜色
			var lineColor:Color = new Color(1.0, 0.0, 0.0, 0.0);
			PickTexture.BRUSH_MODE = 1;
			switch(PickTexture.BRUSH_MODE){
				case 0:{//线刷
					this._brushLineTex(PickTexture._u, PickTexture._v, lineColor);
					break;
				}
				case 1:{//刷纹理图片
					this._brushPicTex(PickTexture._u, PickTexture._v);
					break;
				}
			}
		}
		/**
		 * bresenham 绘制直线
		 * @param	array
		 * @param	p
		 * @param	i
		 * @param	length
		 * @param	dx
		 * @param	dy
		 */
		private bresenham(array:number[], p:number, i:number, length:number, dx:number, dy:number) {
			if(i === length-1)
				return;
			var pnext:number = 0;
			if(p <= 0) {
				array[i + 1] = array[i];
				pnext = p + 2 * dy;
			}
			else {
				array[i + 1] = array[i] + 1;
				pnext = p + 2 * dy - 2 * dx;
			}
			this.bresenham(array, pnext, i + 1, length, dx, dy);
		}
		private lineInterpolation(xStart:number, yStart:number, xEnd:number, yEnd:number, k:number):Vector2[] {
			var length:number = 0;
			var xarray:number[] = []; 
			var yarray:number[] = [];
			var dx:number = 0;
			var dy:number = 0;
				//正上方或者正下方
				if(xStart === xEnd) {
					if(yStart > yEnd) {
						var tempy:number = yStart;
						yStart = yEnd;
						yEnd = tempy;
					}
					length = yEnd - yStart + 1;
					for(var i:number = 0; i < length; i++) {
						xarray[i] = xStart;
						yarray[i] = yStart + i;
					}
				} 
				else {
					//|m|<=1,let point 1 be on the right of point 0
					var m:number = (yEnd - yStart) / (xEnd - xStart);
					if(Math.abs(m) <= 1 && xStart > xEnd) {
						var tempx:number = xStart;
						var tempy:number = yStart;
						xStart = xEnd;
						yStart = yEnd;
						xEnd = tempx;
						yEnd = tempy;
					}
					//|m|>1, let point 1 be on the top of point 0
					if(Math.abs(m) > 1 && yStart > yEnd) {
						var tempy:number = yStart;
						var tempx:number = xStart;
						yStart = yEnd;
						xStart = xEnd;
						yEnd = tempy;
						xEnd =tempx;
					}
					dx = xEnd - xStart;
					dy = yEnd - yStart;
					m = (dy)/(dx);
        
					if(Math.abs(m) <= 1) {
						length = xEnd - xStart + 1;
						for(var j:number=0; j < length; j++)
							xarray[j]= xStart + j;
						//0<m<=1
						if(dy >= 0) {
							yarray[0]= yStart;
							yarray[length-1] = yEnd;
							var p0:number = 2*dy - dx;
							this.bresenham(yarray,p0, 0, length,dx,dy);
						} else {
							//-1<=m<0
							yarray[0] = -yStart;
							yarray[length-1]= -yEnd;
							var p0:number = 2*(-dy)-dx;
							this.bresenham(yarray,p0,0,length,dx,-dy);
							for(var k:number =0; k <length; k++)
								yarray[k]=-yarray[k];
						}
					} 
					else {
						length = yEnd - yStart + 1;
						for(var ii:number = 0; ii < length; ii++)
							yarray[ii] = yStart + ii;
						if(dx >= 0) {
							//m>1
							xarray[0] = xStart ;
							xarray[length-1] = xEnd;
							var p0:number = 2*dx - dy;
							this.bresenham(xarray, p0, 0, length, dy, dx);
						} else {
							//m<-1
							xarray[0] = -xStart;
							xarray[length-1] = -xEnd;
							var p0:number  = 2 * (-dx) - dy;
							this.bresenham(xarray, p0, 0, length, dy, -dx);
							for(var n = 0; n < length; n++)
								xarray[n] = -xarray[n];
						}
					}
				}
			var poss:Vector2[] = [];
			var count:number = yarray.length;
			for(var index:number = 0; index < count; index++){
				var uv:Vector2 = new Vector2(xarray[index], yarray[index]);
				poss.push(uv);
			}
			return poss;
		}
		/**
		 * @param	x 种子x坐标
		 * @param	y 种子y坐标
		 * @param	vecFilled(已经填充好的像素)
		 */
		private seedFill(seedX:number, seedY:number, vecFilled:boolean[] ):Vector2[] {
			var newPoints:Vector2[] = [];
			var xl:number = 0;
			var xr:number = 0;
			var x:number = parseInt(seedX); 
			var y:number = parseInt(seedY); 
			var scanNeedFill:boolean = false;
			var firstSeed:Vector2 = new Vector2(x, y);
			//建立栈
			var pointStack:any[] = new Array();
			pointStack.push(firstSeed);
			while (pointStack.length != 0) {
				//出栈
				var pt:Vector2 = pointStack.pop();
				y = pt.y;
				x = pt.x;
				var key:number = x  + (y << 16); 
				var rightPoint:Vector2 = null;
				rightPoint = vecFilled[key];
				while (!rightPoint) {   //向右填充
					var oldKey:number = x  + (y << 16); 
					vecFilled[oldKey] = true;
					var newPoint:Vector2 = new Vector2(x, y);
					newPoints.push(newPoint);
					x++;
					var newKey:number = x  + (y << 16); 
					rightPoint = vecFilled[newKey];
				}
				
				xr = x;
				x = pt.x - 1;
				var leftKey:number = x  + (y << 16); 
				var leftPoint:Vector2 = null;
				leftPoint = vecFilled[leftKey];
				while (!leftPoint) {   //向左填充
					var oldKey:number = x  + (y << 16); 
					vecFilled[oldKey] = true;
					var newPoint:Vector2 = new Vector2(x, y);
					newPoints.push(newPoint);
					x--;
					var newKey:number = x  + (y << 16); 
					leftPoint = vecFilled[newKey]; 
				}
				
				xl = x + 1;
				//处理上面一条扫描线，确立上一条扫描线的种子，也许没有，也许有1个或者多个
				x = xl;
				y = y + 1;
				while (x < xr) {
					scanNeedFill = false;
					var upKey:number = x  + (y << 16);
					var upPoint:Vector2 = null;
					upPoint = vecFilled[upKey];
					while (!upPoint) {
						scanNeedFill = true;
						x++;
						var newKey:number = x  + (y << 16);
						upPoint = vecFilled[newKey];
					}

					if (scanNeedFill) {
						//将最右边的点作为种子点
						var newZZ:Vector2 = new Vector2;
						newZZ.x = x - 1;
						newZZ.y = y;
						pointStack.push(newZZ);
						scanNeedFill = false;
					}
					//这是考虑向右遇到了间断点
					var upRightKey:number = x  + (y << 16);
					var upRightPoint:Vector2 = null;
					upRightPoint = vecFilled[upRightKey];
					while (upRightPoint && x < xr){
						x++;
						var newKey:number = x  + (y << 16);
						upRightPoint = vecFilled[newKey];	
					}
				}

				//处理下面一条扫描线
				x = xl;
				y = y - 2;
				while (x < xr) {
					scanNeedFill = false;
					var downKey:number = x  + (y << 16);
					var downPoint:Vector2 = null;
					downPoint = vecFilled[downKey];
					while (!downPoint) {
						scanNeedFill = true;
						x++;
						var newKey:number = x  + (y << 16);
						downPoint = vecFilled[newKey];
					}

					if (scanNeedFill) {
						var newZZ:Vector2 = new Vector2;
						newZZ.x = x - 1;
						newZZ.y = y;
						pointStack.push(newZZ);
						scanNeedFill = false;
					}
					var downRightKey:number = x  + (y << 16);
					var downRightPoint:Vector2 = null;
					downRightPoint = vecFilled[downRightKey];
					while (downRightPoint && x < xr){
						x++;
						var newKey:number = x  + (y << 16);
						downRightPoint = vecFilled[newKey];	
					}
				}
			}
			return newPoints;
			
		}


		private _Circle(xc:number, yc:number , r:number):Vector2[] {
			var resPoints:Vector2[] = [];
			var x:number = 0;
			var y:number = r;
			var d:number = 1 - r;
			this._CirclePlot(xc , yc , x , y, resPoints);
			while(x < y){
				x++;
				if (d < 0){
					d = d + 2 * x + 1;
				}
				else{
					y--;
					d = d + 2 * ( x - y ) + 1;
				}
				this._CirclePlot(xc , yc , x , y, resPoints);
			}
			return resPoints;
		}
		/**
		 * 移动像素坐标，但是不绘制
		 * @param	cirPoints
		 * @param	transX
		 * @param	transY
		 */
		private _TranslateCircle(cirPoints:Vector2[], transX:number, transY:number):void {
			var poCount:number = cirPoints.length;
			for (var i = 0; i < poCount; i++ ){
				var cirX:number = cirPoints[i].x + transX;
				var cirY:number = cirPoints[i].y + transY;
				cirPoints[i].x = cirX;
				cirPoints[i].y = cirY;
			}
		}
		/**
		 * 移动像素坐标并绘制
		 * @param	cirPoints
		 * @param	transX
		 * @param	transY
		 */
		private _TranslateCircleD(cirPoints:Vector2[], transX:number, transY:number):void {
			var poCount:number = cirPoints.length;
			for (var i = 0; i < poCount; i++ ){
				var cirX:number = cirPoints[i].x + transX;
				var cirY:number = cirPoints[i].y + transY;
				cirPoints[i].x = cirX;
				cirPoints[i].y = cirY;
				//避免越界绘制
				if (cirX < 0 || cirX > PickTexture._oldTexWidth || cirY < 0 || cirY > PickTexture._oldTexHeight){
					continue;
				}
				 
				var key:number  = cirX + (cirY << 16);
				if (this.vecAllP[key] == null || this.vecAllP[key] === 0 ){
					this.vecAllP[key] = 1;
					var pixIndex:number = (cirY * PickTexture._oldTexWidth + cirX) * 4;
					PickTexture._oldPixs[pixIndex++]  = PickTexture._brushColorR;
					PickTexture._oldPixs[pixIndex++]  = PickTexture._brushColorG;
					PickTexture._oldPixs[pixIndex++]  = PickTexture._brushColorB;
					PickTexture._oldPixs[pixIndex++]  = PickTexture._brushColorA;
					
				}	
			}	
		}
		
		private _CirclePlot(xc:number, yc:number, x:number, y:number, resPoints:Vector2[]):void{	
			var point1:Vector2 = new Vector2(x + xc, y + yc);
			var point2:Vector2 = new Vector2(y + xc, x + yc);
			var point3:Vector2 = new Vector2(y + xc, -x + yc);
			var point4:Vector2 = new Vector2(x + xc, -y + yc);
			var point5:Vector2 = new Vector2( -x + xc, -y + yc);
			var point6:Vector2 = new Vector2( -y + xc, -x + yc);
			var point7:Vector2 = new Vector2( -x + xc, y + yc);
			var point8:Vector2 = new Vector2( -y + xc, x + yc);
			resPoints.push(point1);
			resPoints.push(point2);
			resPoints.push(point3);
			resPoints.push(point4);
			resPoints.push(point5);
			resPoints.push(point6); 
			resPoints.push(point7);
			resPoints.push(point8);	
		}
		private _IsClosed(points:Vector2[], vecFilled:boolean[]) :boolean{
			//检测是四边形是否闭合
			var isClose:boolean = true;
			var length:number = points.length;
			for (var icIndex:number = 0; icIndex < length; icIndex++ ){
				var testPoint:Vector2 = points[icIndex];
				var x:number = testPoint.x;
				var y:number = testPoint.y;
				var nextCount:number = 0;
				var key0:string = (x - 1) + ',' + (y);
				var key1:string = (x + 1) + ',' + (y);
				var key2:string = (x) + ',' + (y + 1);
				var key3:string = (x - 1) + ',' + (y + 1);
				var key4:string = (x + 1) + ',' + (y + 1);
				var key5:string = (x) + ',' + (y - 1);
				var key6:string = (x - 1) + ',' + (y - 1);
				var key7:string = (x + 1) + ',' + (y - 1);
				(vecFilled[key0]) && (nextCount++);
				(vecFilled[key1]) && (nextCount++);
				(vecFilled[key2]) && (nextCount++);
				(vecFilled[key3]) && (nextCount++);
				(vecFilled[key4]) && (nextCount++);
				(vecFilled[key5]) && (nextCount++);
				(vecFilled[key6]) && (nextCount++);
				(vecFilled[key7]) && (nextCount++);
				if (nextCount < 2){
					isClose = false;
					return isClose;
				}	
			}
			return isClose;
		}
		/**
		 * 自定义实现射线检测
		 * @param	ray
		 * @param	vertexDatas
		 * @param	vertexDeclaration
		 * @param	indices
		 * @param	outHitInfo
		 * @return
		 */
		private _rayIntersectsPositionsAndIndices(ray:Ray, vertexDatas:Float32Array, vertexDeclaration:VertexDeclaration, indices:Uint16Array):any {
			var vertexStrideFloatCount:number = vertexDeclaration.vertexStride / 4;
			var positionVertexElementOffset:number = vertexDeclaration.getVertexElementByUsage(VertexMesh.MESH_POSITION0).offset / 4;
			var closestIntersection:number = Number.MAX_VALUE;
			var result:any = new Object;
			var tmpResult:any = new Object;
			for (var j:number = 0; j < indices.length; j += 3) {
				//取出三个顶点
				var vertex1:Vector3 = PickTexture._tempVector35;
				var vertex1E:Float32Array = vertex1.elements;
				var vertex1Index:number = indices[j] * vertexStrideFloatCount;
				var vertex1PositionIndex:number = vertex1Index + positionVertexElementOffset;
				vertex1E[0] = vertexDatas[vertex1PositionIndex];
				vertex1E[1] = vertexDatas[vertex1PositionIndex + 1];
				vertex1E[2] = vertexDatas[vertex1PositionIndex + 2];
				
				var vertex2:Vector3 = PickTexture._tempVector36;
				var vertex2E:Float32Array = vertex2.elements;
				var vertex2Index:number = indices[j + 1] * vertexStrideFloatCount;
				var vertex2PositionIndex:number = vertex2Index + positionVertexElementOffset;
				vertex2E[0] = vertexDatas[vertex2PositionIndex];
				vertex2E[1] = vertexDatas[vertex2PositionIndex + 1];
				vertex2E[2] = vertexDatas[vertex2PositionIndex + 2];
				var vertex3:Vector3 = PickTexture._tempVector37;
				var vertex3E:Float32Array = vertex3.elements;
				var vertex3Index:number = indices[j + 2] * vertexStrideFloatCount;
				var vertex3PositionIndex:number = vertex3Index + positionVertexElementOffset;
				vertex3E[0] = vertexDatas[vertex3PositionIndex];
				vertex3E[1] = vertexDatas[vertex3PositionIndex + 1];
				vertex3E[2] = vertexDatas[vertex3PositionIndex + 2];
				//检测三角形是否和射线碰撞
				tmpResult = PickTexture.rayIntersectsTriangle(ray, vertex1, vertex2, vertex3);
				var intersection:number = tmpResult.distance;
				
				if (!isNaN(intersection) && intersection < closestIntersection) {
					closestIntersection = intersection;
					result.u = tmpResult.u;
					result.v = tmpResult.v;
					result.vertex1Index = vertex1Index;
					result.vertex2Index = vertex2Index;
					result.vertex3Index = vertex3Index;
					result.distance = tmpResult.distance;
				}
			}
			return result;

		}
		
		/**
		 * 计算射线和三角形碰撞并返回碰撞距离。
		 * @param	ray 射线。
		 * @param	vertex1 顶点1。
		 * @param	vertex2 顶点2。
		 * @param	vertex3 顶点3。
		 * @return   射线距离三角形的距离，返回Number.NaN则不相交。
		 */
		 static rayIntersectsTriangle(ray:Ray, vertex1:Vector3, vertex2:Vector3, vertex3:Vector3):any {
			/*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
			var result:any = new Object;
			// Compute vectors along two edges of the triangle.
			var edge1:Vector3 = PickTexture._tempVector30;
			var edge2:Vector3 = PickTexture._tempVector31;
			
			Vector3.subtract(vertex2, vertex1, edge1);
			Vector3.subtract(vertex3, vertex1, edge2);
			
			// Compute the determinant.
			var directionCrossEdge2:Vector3 = PickTexture._tempVector32;
			Vector3.cross(ray.direction, edge2, directionCrossEdge2);
			
			var determinant:number;
			determinant = Vector3.dot(edge1, directionCrossEdge2);
			
			// If the ray is parallel to the triangle plane, there is no collision.
			if (determinant > -Number.MIN_VALUE && determinant < Number.MIN_VALUE) {
				//result = Number.NaN;
				result.distance = Number.NaN;
				return result;
			}
			
			var inverseDeterminant:number = 1.0 / determinant;
			
			// Calculate the U parameter of the intersection point.
			var distanceVector:Vector3 = PickTexture._tempVector33;
			Vector3.subtract(ray.origin, vertex1, distanceVector);
			
			var triangleU:number;
			triangleU = Vector3.dot(distanceVector, directionCrossEdge2);
			triangleU *= inverseDeterminant;
			
			// Make sure it is inside the triangle.
			if (triangleU < 0 || triangleU > 1) {
				//result = Number.NaN;
				result.distance = Number.NaN;
				return result;
			}
			
			// Calculate the V parameter of the intersection point.
			var distanceCrossEdge1:Vector3 = PickTexture._tempVector34;
			Vector3.cross(distanceVector, edge1, distanceCrossEdge1);
			
			var triangleV:number;
			triangleV = Vector3.dot(ray.direction, distanceCrossEdge1);
			triangleV *= inverseDeterminant;
			
			// Make sure it is inside the triangle.
			if (triangleV < 0 || triangleU + triangleV > 1) {
				//result = Number.NaN;
				result.distance = Number.NaN;
				return result;
			}
			
			// Compute the distance along the ray to the triangle.
			var rayDistance:number;
			rayDistance = Vector3.dot(edge2, distanceCrossEdge1);
			rayDistance *= inverseDeterminant;
			
			// Is the triangle behind the ray origin?
			if (rayDistance < 0) {
				//result = Number.NaN;
				result.distance = Number.NaN;
				return result;
			}
			result.distance = rayDistance;
			result.u = triangleU;
			result.v = triangleV;
			return result;
		}
		/**
		 * 双线性插值实现图片的缩放
		 * @param	k 缩放比例
		 */
		private PicZoom(pixs:Uint8Array,oWidth:number, oHeight:number, k:number):Uint8Array{
			var scale:number =  k;
			var newWidth:number =  Math.ceil(oWidth * scale);
			var newHeight:number =  Math.ceil(oHeight * scale);
			var newPixs:Uint8Array = new Uint8Array(newWidth * newHeight * 4)
			var newPix:Uint8Array = new Uint8Array(4);
			newPix[0] = 0;
			newPix[1] = 0;
			newPix[2] = 0;
			newPix[3] = 0;
			//新的像素值在newPixs中的偏移
			var newOffset:number;
			for (var y:number = 0; y < newHeight; y++ ){
				var oldY:number = y / scale ;
				for (var x:number = 0; x < newWidth; x++ ){
					var oldX:number = x / scale ;
					var intCol:number = Math.floor(oldX);
					var intRow:number = Math.floor(oldY);
					var u:number = oldX - intCol; 
				    var v:number = oldY - intRow;
					this._bicubicInterpolation(intCol, intRow, u, v, oWidth, oHeight, pixs, newPix);
					newOffset = (x + newWidth * y) * 4;
					newPixs[newOffset + 0] = newPix[0];
					newPixs[newOffset + 1] = newPix[1];
					newPixs[newOffset + 2] = newPix[2];
					newPixs[newOffset + 3] = newPix[3];
				}
			}
			return newPixs;
		} 
		
		private BilinearInterpolation(oPixs:Uint8Array, owidth:number, a:number, b:number, newPix:Uint8Array ):void{
			//四个系数
			var f0:number;
			var f1:number;
			var f2:number;
			var f3:number;
			//四个点在像素集合中的偏移
			var offset0:number;
			var offset1:number;
			var offset2:number;
			var offset3:number;
			
			var x:number = parseInt(a);
			var y:number = parseInt(b);
			//其他三个点的坐标值
			var x1:number = x + 1;
			var y1:number = y;
					
			var x2:number = x;
			var y2:number = y + 1;
					
			var x3:number = x + 1;
			var y3:number = y + 1;
			
			offset0 = parseInt((x + owidth * y) * 4);
			offset1 = parseInt((x1 + owidth * y1) * 4);
			offset2 = parseInt((x2 + owidth * y2) * 4);
			offset3 = parseInt((x3 + owidth * y3) * 4);
			//四个系数
			f0 = (x3 - a) * (y3 - b);
			f1 = (x3 - a) * (b - y);
			f2 = (a - x) * (y3 - b);
			f3 = (a - x) * (b - y);

			//根据四个点的像素值分别计算新点的RGBA
			newPix[0] = oPixs[offset0] * f0 + oPixs[offset1] * f1 + oPixs[offset2] * f2 + oPixs[offset3] * f3;
			newPix[1] = oPixs[offset0 + 1] * f0 + oPixs[offset1 + 1] * f1 + oPixs[offset2 + 1] * f2 + oPixs[offset3 + 1] * f3;
			newPix[2] = oPixs[offset0 + 2] * f0 + oPixs[offset1 + 2] * f1 + oPixs[offset2 + 2] * f2 + oPixs[offset3 + 2] * f3;
			newPix[3] = oPixs[offset0 + 3] * f0 + oPixs[offset1 + 3] * f1 + oPixs[offset2 + 3] * f2 + oPixs[offset3 + 3] * f3 ;
			
		} 
		/**
		 * 原始的反向映射算法，进行图像旋转
		 * @param	oldPixs
		 * @param	oldW
		 * @param	oldH
		 * @param	theta
		 */
		private normalRoate(oldPixs:Uint8Array, oldW:number, oldH:number, theta:number):Uint8Array {
			var fsin:number = Math.sin(theta);
			var fcos:number = Math.cos(theta);
			var c1:number;
			var c2:number;
			var fx:number;
			var fy:number;
			var ex:number;
			var ey:number;
			
			var xx:number;
			var yy:number;
			var newHeight:number = Math.ceil(Math.abs(oldH * fcos) + Math.abs(oldW * fsin));
			var newWidth:number = Math.ceil(Math.abs(oldW * fcos) + Math.abs(oldH * fsin));
			var newPixs:Uint8Array = new Uint8Array(newWidth * newHeight * 4);
			
			c1 = (oldW - newWidth * fcos - newHeight * fsin) / 2;
			c2 = (oldH + newWidth * fsin - newHeight * fcos) / 2;
			// 计算反向坐标并计算插值
			//新的像素值在newPixs中的偏移
			var newOffset:number;
			var newPix:Uint8Array = new Uint8Array(4);
			for (var y:number = 0; y < newHeight; y++ ){
				var yIndex:number = newWidth * y;
				for (var x:number = 0; x < newWidth; x++ ){
					//计算后向映射点的精确位置 每个点都使用原始公式计算
					fx = x * fcos + y * fsin + c1; //四次浮点乘法和四次浮点加法
					fy = y * fcos - x * fsin + c2;
					(fx < 0) && ( fx = 0.0);
					(fx > newWidth) && ( fx = newWidth);
					(fy < 0) && ( fy = 0);
					(fy > newHeight) && ( fy = newHeight);
					//使用双线性插值求像素值
					var intCol:number = Math.floor(fx);
					var intRow:number = Math.floor(fy);
					var u:number = fx - intCol; 
				    var v:number = fy - intRow;
					this._bicubicInterpolation(intCol, intRow, u, v, oldW, oldH, oldPixs, newPix);
					newOffset = (x + yIndex) * 4;
					newPixs[newOffset + 0] = newPix[0];
					newPixs[newOffset + 1] = newPix[1];
					newPixs[newOffset + 2] = newPix[2];
					newPixs[newOffset + 3] = newPix[3];
				}
			}
			
			return newPixs;
			
		}
		
		private _brushPicTex(u:number, v:number):void {
			if(this._lastUV === null){
				this._lastUV = new Object();
				var curX:number = u * PickTexture._oldTexWidth;
				var curY:number = v * PickTexture._oldTexHeight;
				for (var i:number = 0; i < 3; i++ ){
					//生成随机数
					this._generateRandomPS(curX, curY);
					var ranX:number = PickTexture._ranPoint.x;
					var ranY:number = PickTexture._ranPoint.y;
					this._brushGrassTex(ranX, ranY);
				}
			}
			else{
				var curX:number = u * PickTexture._oldTexWidth;
				var curY:number = v * PickTexture._oldTexHeight;
				var oldX:number = this._lastUV.u * PickTexture._oldTexWidth;
				var oldY:number = this._lastUV.v * PickTexture._oldTexHeight;
				var dis:number = Math.sqrt(Math.pow((curX - oldX), 2), Math.pow((curY - oldY), 2));
				if(Math.abs((curX-oldX)) > 10 || Math.abs((curY-oldY)) > 10){
				//if(dis > 15){
					for (var i:number = 0; i < 3; i++ ){
						//生成随机数
						this._generateRandomPS(curX, curY);
						var ranX:number = PickTexture._ranPoint.x;
						var ranY:number = PickTexture._ranPoint.y;
						this._brushGrassTex(ranX, ranY);
					}
				}
			}
			this._lastUV.u = u;
			this._lastUV.v = v;

		}
		/**
		 * 
		 * @param	curX当前点坐标
		 * @param	curY
		 */
		private _brushGrassTex(curX:number, curY:number):void {
			
			var leftX:number = parseInt(curX - 32);
			var leftY:number = parseInt(curY - 32);
			var brushTexWidth:number = this._xiaocaoTex.width ;
			var brushTexHeight:number = this._xiaocaoTex.height;
			var pixs:Uint8Array;
			var k:number = PickTexture._ranPoint.size;
			var theta:number = PickTexture._ranPoint.angle;
			var theta1:number = theta / 180 * Math.PI;
			var fsin1:number = Math.sin(theta1);
			var fcos1:number = Math.cos(theta1);
			var newHeight:number = Math.ceil(Math.abs(brushTexHeight * fcos1) + Math.abs(brushTexWidth * fsin1)) ;
			var newWidth:number = Math.ceil(Math.abs(brushTexWidth * fcos1) + Math.abs(brushTexHeight * fsin1)) ;
			newHeight = Math.ceil(newHeight * k);
			newWidth = Math.ceil(newWidth * k);
		
			var index:number = PickTexture._ranPoint.index;
			switch(index){
				case 0:{
					pixs = PickTexture._grassPixs05_15;
					break;
				}
				case 1:{
					pixs = PickTexture._grassPixs0500;
					break;
				}
				case 2:{
					pixs = PickTexture._grassPixs0515;
					break;
				}
				case 3:{
					pixs = PickTexture._grassPixs1_15;
					break;
				}
				case 4:{
					pixs = this._xiaocaoTex.getPixels();
					break;
				}
				case 5:{
					pixs = PickTexture._grassPixs115;
					break;
				}
			}
			
			for (var h:number = 0; h <  newHeight; h++ ){
				var hIndex:number = (h + leftY) * PickTexture._oldTexWidth;
				var hNewIndex:number = h * newWidth;
				for (var w:number = 0; w < newWidth; w++ ){
					var oldIndex:number = (w + leftX + hIndex) * 4;
					var newIndex:number = (w + hNewIndex) * 4;
					var newA:number = pixs[newIndex + 3] / 255;
					var oldA:number = 1.0 - newA;
					//每次更新一个像素，效率最高
					var oldIndex1:number = oldIndex + 1;
					var oldIndex2:number = oldIndex + 2;
					var oldIndex3:number = oldIndex + 3;
					PickTexture._oldPixs[oldIndex] = parseInt(PickTexture._oldPixs[oldIndex] * oldA + pixs[newIndex] * newA);
					PickTexture._oldPixs[oldIndex1] = parseInt(PickTexture._oldPixs[oldIndex1] * oldA + pixs[newIndex + 1] * newA);
					PickTexture._oldPixs[oldIndex2] = parseInt(PickTexture._oldPixs[oldIndex2] * oldA + pixs[newIndex + 2] * newA);
					PickTexture._oldPixs[oldIndex3] = parseInt(PickTexture._oldPixs[oldIndex3] * oldA + pixs[newIndex + 3] * newA);
					
				}
			}
		}
		
		private _brushLineTex(u:number, v:number, color:Color):void {
			var lineColorR:number = parseInt(color.r * 255);
			var lineColorG:number = parseInt(color.g * 255);
			var lineColorB:number = parseInt(color.b * 255);
			var lineColorA:number = parseInt(color.a * 255);
			if (this._lastUV === null){
				this._lastUV = new Object();
				this._lastUV.u = PickTexture._u;
				this._lastUV.v = PickTexture._v;
				//计算得到第一个圆
				var firstCenterX:number = parseInt(PickTexture._u * PickTexture._oldTexWidth);
				var firstCenterY:number = parseInt(PickTexture._v * PickTexture._oldTexHeight);
				
				PickTexture._firstCirPos = this._Circle(firstCenterX, firstCenterY, this.width / 2 , false, false);
				PickTexture._firstCirLeft = [];
				PickTexture._firstCirRight = [];
				PickTexture._firstCirUp =  [];
				PickTexture._firstCirDown = [];
				PickTexture._firstCirLeftUp = [];
				PickTexture._firstCirRightDown = [];
				PickTexture._firstCirRightUp = [];
				PickTexture._firstCirLeftDown = [];
				
				var firstLength:number = PickTexture._firstCirPos.length;
				for (var c1:number = 0; c1 < firstLength; c1++ ){
					var point1:Vector2 = PickTexture._firstCirPos[c1];
					var cx:number = point1.x;
					var cy:number = point1.y;
					if(cx < firstCenterX){//左边半圆
						PickTexture._firstCirLeft.push(point1);
					}
					else{                 //右边半圆
						PickTexture._firstCirRight.push(point1);
					}
					if(cy < firstCenterY){//下边半圆
						PickTexture._firstCirDown.push(point1);
					}
					else{                 //上边半圆
						PickTexture._firstCirUp.push(point1)
					}
					//平移到原点
					cx = cx - firstCenterX;
					cy = cy - firstCenterY;
					if (cx < cy){           //左上边半圆
						PickTexture._firstCirLeftUp.push(point1);
					}
					else{                   //右下边半圆
						PickTexture._firstCirRightDown.push(point1);
					}
					//直线斜率为-1，进行切割
					//cx不变
					var lineY:number = -cx;
					if(cy > lineY){        //右上边半圆
						PickTexture._firstCirRightUp.push(point1);
					}
					else{                  //坐下边半圆
						PickTexture._firstCirLeftDown.push(point1);
					}
					
				}

				var firstCirPointCount:number = PickTexture._firstCirPos.length;
				//复制一份上面的圆
				var copyCir:Vector2[] = [];
				//用作种子填充的边界数据(非测试数据，勿删)
				var testForSeedFill:boolean[] = [];
				for(var si:number = 0; si < firstCirPointCount; si++){
					var key:number  = PickTexture._firstCirPos[si].x  + (PickTexture._firstCirPos[si].y << 16);
					if (this.vecAllP[key] === null || this.vecAllP[key] === 0){
						this.vecAllP[key] = 1;
					}	
					copyCir.push(PickTexture._firstCirPos[si]);
					testForSeedFill[key] = true;
				}
				//对圆形进行填充
				var fillPoints:Vector2[] = this.seedFill(firstCenterX, firstCenterY, testForSeedFill );
				var fillLength:number = fillPoints.length;
				for (var f:number = 0; f < fillLength; f++ ){
					var cirPoint:Vector2 = new Vector2(fillPoints[f].x , fillPoints[f].y);
					var key:number  = cirPoint.x  + (cirPoint.y << 16);
					if (this.vecAllP[key] == null ){
						this.vecAllP[key] = true;
					}	
					copyCir.push(cirPoint);	
				}
				
				//第二个圆
				var secondCirPos:Vector2[] = this._Circle(firstCenterX, firstCenterY, (this.width - 2) / 2 );
				var secondLenth:number = secondCirPos.length;
				for (var c2:number = 0; c2 < secondLenth; c2++ ){
					var point2:Vector2 = secondCirPos[c2];
					PickTexture._firstCirPos.push(point2);
					var cx:number = point2.x;
					var cy:number = point2.y;
					if(cx < firstCenterX){//左边半圆
						PickTexture._firstCirLeft.push(point2);
					}
					else{                 //右边半圆
						PickTexture._firstCirRight.push(point2);
					}
					if(cy < firstCenterY){//下边半圆
						PickTexture._firstCirDown.push(point2);
					}
					else{                 //上边半圆
						PickTexture._firstCirUp.push(point2)
					}
					//平移到原点
					cx = cx - firstCenterX;
					cy = cy - firstCenterY;
					if (cx < cy){         //左上边半圆
						PickTexture._firstCirLeftUp.push(point2);
					}
					else{                 //右下边半圆
						PickTexture._firstCirRightDown.push(point2);
					}
					//直线斜率为-1，进行切割
					//cx不变
					var lineY:number = -cx;
					if(cy > lineY){        //右上边半圆
						PickTexture._firstCirRightUp.push(point2);
					}
					else{                  //坐下边半圆
						PickTexture._firstCirLeftDown.push(point2);
					}
				}
				//第三个圆
				var thirdCirPos:Vector2[] = this._Circle(firstCenterX, firstCenterY, (this.width - 4) / 2 );
				var thirdLength:number = thirdCirPos.length;
				for (var c3:number = 0; c3 < thirdLength; c3++ ){
					var point3:Vector2 = thirdCirPos[c3];
					PickTexture._firstCirPos.push(point3);
					var cx:number = point3.x;
					var cy:number = point3.y;
					if(cx < firstCenterX){//左边半圆
						PickTexture._firstCirLeft.push(point3);
					}
					else{                 //右边半圆
						PickTexture._firstCirRight.push(point3);
					}
					if(cy < firstCenterY){//下边半圆
						PickTexture._firstCirDown.push(point3);
					}
					else{                 //上边半圆
						PickTexture._firstCirUp.push(point3)
					}
					//平移到原点
					cx = cx - firstCenterX;
					cy = cy - firstCenterY;
					if (cx < cy){         //左上边半圆
						PickTexture._firstCirLeftUp.push(point3);
					}
					else{                 //右下边半圆
						PickTexture._firstCirRightDown.push(point3);
					}
					//直线斜率为-1，进行切割
					//cx不变
					var lineY:number = -cx;
					if(cy > lineY){        //右上边半圆
						PickTexture._firstCirRightUp.push(point3);
					}
					else{                  //坐下边半圆
						PickTexture._firstCirLeftDown.push(point3);
					}
					
				}
					
				if (copyCir.length != 0 ){
					var copyCirLength:number = copyCir.length;
					for (var cir2:number = 0; cir2 < copyCirLength; cir2++ ){
						var cir2X:number = copyCir[cir2].x;
						var cir2Y:number = copyCir[cir2].y;
						//避免越界
						if (cir2X <= 0 || cir2Y <= 0 || cir2X > PickTexture._oldTexWidth || cir2Y > PickTexture._oldTexHeight){
							continue;
						}
						//var pIndex:int = (cir2Y *  _oldTexWidth + cir2X) * 4;
						//_newPix[0] = _newPixs[pIndex++];
						//_newPix[1] = _newPixs[pIndex++];
						//_newPix[2] = _newPixs[pIndex++];
						//_newPix[3] = _newPixs[pIndex];
						//计算在像素map中的索引
						var pixIndex:number = (cir2Y *  PickTexture._oldTexWidth + cir2X) * 4;
						PickTexture._oldPixs[pixIndex++] = PickTexture._brushColorR;
						PickTexture._oldPixs[pixIndex++] = PickTexture._brushColorG;
						PickTexture._oldPixs[pixIndex++] = PickTexture._brushColorB;
						PickTexture._oldPixs[pixIndex++] = PickTexture._brushColorA;
					}
				}				
			}
			//和上一个_lastUV进行插值计算
			else{
				if (this.width > 0){
					//避免跨界绘制
					if(this._lastUV.u < 0.1 && PickTexture._u > 0.9){
						PickTexture._u = 0.0;
					}
					if(this._lastUV.u > 0.9 && PickTexture._u < 0.1){
						PickTexture._u = 1.0;
					}
					var firstPointX:number = parseInt(this._lastUV.u * PickTexture._oldTexWidth);
					var firstPointY:number = parseInt(this._lastUV.v * PickTexture._oldTexHeight);
					var linePositions:Vector2[] = this.lineInterpolation(firstPointX, firstPointY, parseInt(PickTexture._u * PickTexture._oldTexWidth), parseInt(PickTexture._v * PickTexture._oldTexHeight));
					var cirPLength:number = linePositions.length;
					var resverPositions:Vector2[] = [];
					var iCount:number = 0;
					if(firstPointX === linePositions[0].x && firstPointY === linePositions[0].y){
							
					}
					else{
						for (var cpi:number = cirPLength; cpi > 0; cpi-- ){
							resverPositions[iCount] = linePositions[cpi-1];
							iCount++;
						}
						linePositions = resverPositions;	
					}
					this._lastUV.u = PickTexture._u;
					this._lastUV.v = PickTexture._v;
					for (var cpi:number = 0; cpi < cirPLength; cpi++){
						if(cpi === 0){
							var lastCenterX:number = linePositions[0].x;
							var lastCenterY:number = linePositions[0].y;
						}
						else {
							var newCenterX:number = linePositions[cpi].x;
							var newCenterY:number = linePositions[cpi].y;
							var transX:number = newCenterX - lastCenterX; 
							var transY:number = newCenterY - lastCenterY; 
							lastCenterX = newCenterX;
							lastCenterY = newCenterY;
							//原地不动
							if (transX === 0 && transY === 0){
								
							}
							//向左向右移动
							else if (transY === 0){
								if (transX === 1){
									//移动右边的并绘制
									this._TranslateCircleD(PickTexture._firstCirRight, 1, 0);	
									//移动左边的不绘制
									this._TranslateCircle(PickTexture._firstCirLeft, 1, 0);
								}
								else if (transX === -1){
									//移动左边的并绘制
									this._TranslateCircleD(PickTexture._firstCirLeft, -1, 0);	
									//移动右边的不绘制
									this._TranslateCircle(PickTexture._firstCirRight, -1, 0);
								}	
							}
							//向上向下移动
							else if(transX === 0){
								if (transY === 1){
									//移动上边的并绘制
									this._TranslateCircleD(PickTexture._firstCirUp, 0, 1);
									//移动下边的不绘制
									this._TranslateCircle(PickTexture._firstCirDown, 0, 1);
								}
								else if (transY === -1){
									//移动下边的并绘制
									this._TranslateCircleD(PickTexture._firstCirDown, 0, -1);
									//移动上边的不绘制
									this._TranslateCircle(PickTexture._firstCirUp, 0, -1);
								}
							}
							//向左上角移动
							else if(transX === -1 && transY === 1){
								//移动左上边的并绘制
								this._TranslateCircleD(PickTexture._firstCirLeftUp, -1, 1);
								//移动右下边的不绘制
								this._TranslateCircle(PickTexture._firstCirRightDown, -1, 1);
							}
							//向右下角移动
							else if(transX === 1 && transY === -1){
								//移动右下边的并绘制
								this._TranslateCircleD(PickTexture._firstCirRightDown, 1, -1);
								//移动左上边的不绘制
								this._TranslateCircle(PickTexture._firstCirLeftUp, 1, -1);
							}
							//向右上角移动
							else if (transX === 1 && transY === 1){
								//移动右上边的并绘制
								this._TranslateCircleD(PickTexture._firstCirRightUp, 1, 1);
								//移动左下边的不绘制
								this._TranslateCircle(PickTexture._firstCirLeftDown, 1, 1);
							}
							//向左下角移动
							else if(transX === -1 && transY === -1){
								//移动左下边的并绘制
								this._TranslateCircleD(PickTexture._firstCirLeftDown, -1, -1);
								//移动右上边的不绘制
								this._TranslateCircle(PickTexture._firstCirRightUp, -1, -1);
							}
						}	
					}		
				}
				else{
						
				}
			}
		}
		/**
		 * bicubic插值的系数计算
		 * @param	x
		 * @return
		 */
		private _bicubicWeight(x:number):number{
			/**
			* 采样公式的常数A取值,调整锐化与模糊
			* -0.5 三次Hermite样条
			* -0.75 常用值之一
			* -1 逼近y = sin(x*PI)/(x*PI)
			* -2 常用值之一
			*/
			const A:number = -0.75;
			var absX:number = Math.abs(x);
			var x2:number = x * x;
			var x3:number = absX * x2;
			
			if (absX <= 1) {
				return (1 - (A + 3) * x2 + (A + 2) * x3);
			} else if (absX <= 2) {
				return (-4 * A + 8 * A * absX - 5 * A * x2 + A * x3);
			}
			return 0;
		}
		/**
		 * 双立方插值
		 * @param	intCol 原图中像素点的x坐标整数
		 * @param	intRow 原图中像素点的y坐标整数 
		 * @param	srcU 原图中像素点的x坐标小数部分
		 * @param	srcV 原图中像素点的y坐标小数部分
		 */
		private _bicubicInterpolation(intCol:number, intRow:number, u:number, v:number, srcWidth:number,srcHeight:number, srcPixs:Uint8Array,reslutPix:Uint8Array):void {
			var onePix:Uint8Array = new Uint8Array(4);
			/**
			* 根据数学推导，16个点的f1*f2加起来是趋近于1的（可能会有浮点误差）
			* 因此就不再单独先加权值，再除了
			* 16个邻近点
			 */
			var r:number = 0;
			var g:number = 0;
			var b:number = 0;
			var a:number = 0;
			for (var m:number = -1; m <= 2; m++) {
				for (var n:number = -1; n <= 2; n++) {
					//分别得到像素点的值
					var newRow:number = intRow + m;
					var newCol:number = intCol + n;
					if(newRow >= srcHeight || newRow < 0 || newCol >= srcWidth || newCol < 0){
						continue;
					}
					var index:number = (newCol + newRow * srcWidth) * 4;
					onePix[0] = srcPixs[index + 0];
					onePix[1] = srcPixs[index + 1];
					onePix[2] = srcPixs[index + 2];
					onePix[3] = srcPixs[index + 3];
					// 一定要正确区分 m,n和u,v对应的关系，否则会造成图像严重偏差（譬如出现噪点等）
					// F(row + m, col + n)S(m - v)S(n - u)
					var f1:number = this._bicubicWeight(m - v);
					var f2:number = this._bicubicWeight(n - u);
					var weight:number = f1 * f2;

					r += onePix[0] * weight;
					g += onePix[1] * weight;
					b += onePix[2] * weight;
					a += onePix[3] * weight;
				}
			}
			reslutPix[0] = parseInt(this._getPixelValue(r));
			reslutPix[1] = parseInt(this._getPixelValue(g));
			reslutPix[2] = parseInt(this._getPixelValue(b));
			reslutPix[3] = parseInt(this._getPixelValue(a));
			
		}
		//获取像素值
		private _getPixelValue(pixelValue:number):number  {
			var newPixelValue:number = pixelValue;
			newPixelValue = Math.min(255, newPixelValue);
			newPixelValue = Math.max(0, newPixelValue);
			return newPixelValue;
		}
		/**
		 *
		 * @param	x当前点坐标
		 * @param	y
		 */
		private _generateRandomPS(x:number, y:number):any {
			//随机生成位置
			var ranX:number = Math.random();
			(ranX < 0.5) && (ranX = -ranX);
			(ranX >= 0.5) && (ranX = ranX - 0.5);
			ranX *= 30;
			var ranY:number = Math.random();
			(ranY < 0.5) && (ranY = -ranY);
			(ranY >= 0.5) && (ranY = ranY - 0.5);
			ranY *= 30;
			PickTexture._ranPoint.x = ranX + x;
			PickTexture._ranPoint.y = ranY + y;
			
			//随机生成大小
			var resSize:number = 1;
			var ran:number = Math.random();
			(ran < 0.5) && (resSize = 0.5);
			PickTexture._ranPoint.size = resSize;
			
			//随机生成旋转角度
			var angle:number = 0;
			var ranA:number = Math.random();
			if(ranA > 0 && ranA < 0.3){
				angle = -15;
			}
			else if(ranA > 0.3 && ranA < 0.6){
				angle = 15;
			}
			else if(ranA > 0.6 && ranA < 1){
				angle = 0;
			}
			PickTexture._ranPoint.angle = angle;
			var index:number = 0;
			(resSize === 0.5 && angle === -15) && (index = 0);
			(resSize === 0.5 && angle === 0) && (index = 1);
			(resSize === 0.5 && angle === 15) && (index = 2);
			(resSize === 1 && angle === -15) && (index = 3);
			(resSize === 1 && angle === 0) && (index = 4);
			(resSize === 1 && angle === 15) && (index = 5);
			PickTexture._ranPoint.index = index;
			return PickTexture._ranPoint;	
		}
	}

