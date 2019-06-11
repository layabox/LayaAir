import { Laya } from "Laya";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { BaseCamera } from "laya/d3/core/BaseCamera"
	import { Camera } from "laya/d3/core/Camera"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Shader3D } from "laya/d3/shader/Shader3D"
	import { Laya3D } from "laya/d3/utils/Laya3D"
	import { CubeInfo } from "laya/d3Extend/Cube/CubeInfo"
	import { CubeMaterial } from "laya/d3Extend/Cube/CubeMaterial"
	import { CubeSprite3D } from "laya/d3Extend/Cube/CubeSprite3D"
	import { SubCubeGeometry } from "laya/d3Extend/Cube/SubCubeGeometry"
	import { Stage } from "laya/display/Stage"
	import { Stat } from "laya/utils/Stat"
	/**
	 * ...
	 * @author ...
	 */
	export class CubeMapTest {
		
		constructor(){
			Shader3D.debugMode = true;
			this.laya.d3.utils.Laya3D.init(0, 0);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			Stat.show();
		
			SubCubeGeometry.__init__();
			CubeInfo.Cal24Object();
			CubeMaterial.__init__();
			var scene:Scene3D = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			scene.ambientColor = new Vector3(0.7, 0.7, 0.7);
			
			var camera:Camera = (<Camera>(scene.addChild(new Camera(0, 0.1, 1000))) );
			camera.clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
			camera.clearColor = new Vector4(0,0,0,0);
			camera.transform.translate(new Vector3(0, 5, 10));
			camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			camera.addComponent(CameraMoveScript);
			camera.addComponent(CameraRay);
		}
		
	}





//import flash.filters.ColorMatrixFilter;
import { Script3D } from "laya/d3/component/Script3D"

import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
import { VelocityOverLifetime } from "laya/d3/core/particleShuriKen/module/VelocityOverLifetime"
import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
import { Ray } from "laya/d3/math/Ray"
import { Vector2 } from "laya/d3/math/Vector2"

import { CubeGeometry } from "laya/d3Extend/Cube/CubeGeometry"

import { CubeMap } from "laya/d3Extend/Cube/CubeMap"

import { VoxFileData } from "laya/d3Extend/vox/VoxFileData"
import { lVoxFile } from "laya/d3Extend/vox/lVoxFile"
import { CubeInfoArray } from "laya/d3Extend/worldMaker/CubeInfoArray"
import { Event } from "laya/events/Event"
import { MouseManager } from "laya/events/MouseManager"
import { Loader } from "laya/net/Loader"
import { Button } from "laya/ui/Button"
import { Browser } from "laya/utils/Browser"
import { Byte } from "laya/utils/Byte"
import { Handler } from "laya/utils/Handler"
import { BaseTexture } from "laya/resource/BaseTexture"
import { Texture2D } from "laya/resource/Texture2D"

import { MyPoint3D } from "../zTest/AStar3D/MyPoint3D"

import { NewAStarArithmetic } from "../zTest/AStar3D/NewAStarArithmetic"

class CameraRay extends Script3D
{
	
	private ray:Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
	private camera:Camera;
	private point:Vector2 = new Vector2();
	
	//0是UpDownplane，1是FrontBackplane，2是LeftRightplane
	private PlaneIndex:number = 0;
	private PlanePos:Vector3 = new Vector3();
	private cubeMeshManager:CubeSprite3D;
	
	//button
	private buttonIndex:number = 0;
	private AddRemove:boolean = true;
	private UpdataColor:boolean = false;

     aStar:NewAStarArithmetic;
	//测试
	private cubeInfoArray:CubeInfoArray = new CubeInfoArray();
	//加载Vox
	private voxfile:VoxFileData;
	
	 count:number = 0;
	
	/*override*/  _onAdded():void
	{
		Laya.stage.on(Event.CLICK, this, this.mouseUp);
		this.camera = (<Camera>this.owner );
	}
	 private  cubegeometry:CubeGeometry;
	/*override*/  onStart():void
	{
        this.camera = (<Camera>this.owner );
		
		this.cubeMeshManager = (<CubeSprite3D>this.camera.scene.addChild(new CubeSprite3D()) );
		
		Texture2D.load("Test/sss.jpg",Handler.create(null,function(texture:Texture2D):void{
			((<BlinnPhongMaterial>this.cubeMeshManager._render.sharedMaterial )).albedoTexture = texture;
		}));
        this.cubegeometry = this.cubeMeshManager._cubeGeometry;
        this.aStar=new NewAStarArithmetic(function (x,y,z) {
			var index:number = this.cubegeometry.findCube(x,y,z);
			//console.log(x,y,z,index);
            return index!=-1;
        });
        this.aStar.pointPoolLenght = 100000;
//
		//cubeInfoArray.PositionArray = [0, 0, 0];
		//cubeInfoArray.colorArray =[2958];
////
			
		//cubeMeshManager.AddCube(0, 0, 0, 5463);
		//cubeMeshManager.SelectCube(0, 0, 0);
		//cubeMeshManager.AddCubes(cubeInfoArray);
		//cubeMeshManager.AddCubes(cubeInfoArray);
		//cubeMeshManager.AddCubes(cubeInfoArray);
		//cubeMeshManager.addCube(1, 0, 0, 2958);
		//cubeMeshManager.addCube(2, 0, 0, 2958);
		//
		//cubeMeshManager.addCube(0, 1, 0, 2958);
		//cubeMeshManager.addCube(0, 2, 0, 2958);
		//cubeMeshManager.addCube(0, 3, 0, 2958);
		//cubeMeshManager.addCube(0, 4, 0, 2958);
		//
		//cubeMeshManager.addCube(0, 0, 1, 2958);
		//cubeMeshManager.addCube(0, 0, 2, 2958);
		//cubeMeshManager.addCube(0, 0, 3, 2958);
		//cubeMeshManager.addCube(0, 0, 4, 2958);
		//
		this.Load("Test/boli.vox");
		
		//cubeMeshManager.FindCube(0, 1, 0);
		
	
		//Laya.stage.on(Event.MOUSE_DOWN, null, function():void{
			//
			//
		//});
		
		this.addButton(100, 100, 160, 30, "add", 20, function(e:Event):void
		{
			this.buttonIndex++;
			if(this.buttonIndex%3==0){
				this.AddRemove = true;
				this.UpdataColor = false;
				((<Button>e.target )).label = "add";
			}
			else if (this.buttonIndex % 3 == 1)
			{
				this.AddRemove = false;
				this.UpdataColor = false;
				((<Button>e.target )).label = "remove";
			}
			else if (this.buttonIndex % 3 == 2)
			{
				this.UpdataColor = true;
				((<Button>e.target )).label = "UpdataColor";
			}
		});
		this.addButton(200,200,160,30,"A*",20,function (e:Event) {
	        var start:MyPoint3D=new MyPoint3D();
			var end:MyPoint3D=new MyPoint3D();
			start.setXYZ(9,1,-15);
			end.setXYZ(9,13,-4);
            var vector:MyPoint3D[]= this.aStar.FindeWayAll(start,end);
			debugger;
			for(var i:number=0,len:number= vector.length;i<len;i++)
			{
				var point:MyPoint3D = vector[i];
				//"#ff0009"
                this.cubeMeshManager.AddCube(point.x,point.y,point.z,0xff0009);
            }
        });
	}

	 addcubes():void
	{
		this.cubeMeshManager.RemoveCubes(this.cubeInfoArray);
		for (var i:number = 2; i < this.cubeInfoArray.PositionArray.length; i+=3) {
			this.cubeInfoArray.PositionArray[i] -= 1;
		}
		this.cubeMeshManager.AddCubes(this.cubeInfoArray);
	}
	
	


	
	
	 HJPos:Vector3 = new Vector3();
	protected mouseUp(e:Event)
	{
		
		
			//cubeMeshManaager.LineClear();
			
			//cubeMeshManager.SelectAllCube();
			//var mouseController:MouseController = this.owner.scene.getChildByName("editorCamera").getChildAt(0).getComponent(MouseController);
			
			//mouseController.moveToCenter(HJPos);
		
		//cubeMeshManager.SelectCube(-1,0,0,true,true);
		////if(count===0)
			////cubeMeshManager.addCube(0, 0, 1, 2958);
		////else
			////cubeMeshManager.addCube(0, 0, 2, 2958);
		////count++;
		//if (UpdataColor) {
			//
		//}
			
		if (this.AddRemove) 
		{
	
			//cubeMeshManager.deletNoFaceCube();
			//var cubemap:CubeMap = cubeMeshManager._cubeGeometry.cubeMap;
			//var vec3:Vector3 = cubemap.modolCenter();
			//console.log(cubemap.zMin);
			//var vecvector:Vector.<CubeInfo> = findSurfaceCube(cubemap.xMax, cubemap.xMin, cubemap.yMax, cubemap.yMin, cubemap.zMax, cubemap.zMin);
			//for (var i:int = 0; i < vecvector.length; i++) 
			//{
				//cubeMeshManager.UpdataColor(vecvector[i].x - 1600, vecvector[i].y - 1600, vecvector[i].z - 1600, 32554);
				//
			//}
			
			////
//////		
			var pos:Vector3 = this.AddPos(this.PlanePos, this.PlaneIndex);
			
			this.cubeMeshManager.AddCube(pos.elements[0], pos.elements[1], pos.elements[2],2958,0);

		}
		else 
		{
			//
			//
		  //HJPos.elements[0] = 0;
          //HJPos.elements[1] = 0;
          //HJPos.elements[2] = 0;
		  //ray.origin = camera.transform.position;
          //ray.direction = camera.transform.forward;
		  //
		  //
		  //Vector3.transformCoordinate(ray.origin, matrinvert, rayOrign);
          //Vector3.TransformNormal(ray.direction, matrinvert, rayDirection);
          //PlanePos.elements[0] = 0;
          //PlanePos.elements[1] = 0;
          //PlanePos.elements[2] = 0;
          //CalPointOfHit();
	//
		 //if (PlanePos.x != 0 || PlanePos.y != 0 || PlanePos.z != 0)
		 //{
			//
			//var cubpos:Vector3 = RemovePos(PlanePos, PlaneIndex);
		   //switch(PlaneIndex)
		   //{
				//case 0:	
						//CalFromY1(cubpos.y);
						//HJPos.z = calPointy.z-cubpos.elements[2];
						//HJPos.x = calPointy.x-cubpos.elements[0];
						//HJPos.y = 0;
						//break;
				//case 1:
						////CalFromY1(by);
						////nx = Math.floor(calPointy.x);
						//CalFromZ1(cubpos.z);
						//HJPos.x =calPointz.x-cubpos.elements[0];
						//HJPos.y = calPointz.y-cubpos.elements[1];
						//HJPos.z = 0;
						//break;
				//case 2:
						//CalFromX1(cubpos.x);
						//HJPos.z = calPointx.z - cubpos.elements[2];
						//HJPos.y = calPointx.y - cubpos.elements[1];
						//HJPos.x = 0;
						//break;
						//
			//}
			//console.log(HJPos.elements);
			//cubeMeshManager.LineClear();
		//
			var pos:Vector3 = this.RemovePos(this.PlanePos, this.PlaneIndex);

			console.log(pos);
			this.cubeMeshManager.RemoveCube(pos.elements[0], pos.elements[1], pos.elements[2]);
	
			//
			//cubeMeshManager.SelectCube(pos.elements[0], pos.elements[1], pos.elements[2], true);
			//
			//cubeMeshManager.transform.position = new Vector3(0, 0, 0);
			//
			//cubeMeshManager.transform.translate(new Vector3(-pos.elements[0],pos.elements[1],pos.elements[2]));
			//
			//
		 }
		
		
	
	}
	
	//六个面循环寻找
	 findSurfaceCube(xmax:number,xmin:number,ymax:number,ymin:number,zmax:number,zmin:number):CubeInfo[]
	{
		var cubegeometry:CubeGeometry = this.cubeMeshManager._cubeGeometry;
		
		var cubeinfoVector:CubeInfo[] = [];
		//选中的Cubeinfo
		var cubeinfos:CubeInfo;
		//检测多少
	
		//六个面循环
		
		
		var i:number;
		var j:number;
		var k:number;
		////前面
		for (i= xmin; i <= xmax ; i++) 
		{
			for (j= ymin; j <= ymax ; j++) 
			{
				for (k = zmax; k>=zmin; k--) {
					cubeinfos = cubegeometry.findCubeToCubeInfo(i, j, k);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		////左面
		for (i = ymin; i <= ymax ; i++) 
		{
			for (j = zmin; j <= zmax ; j++) 
			{
				for (k = xmin; k <= xmax ; k++) 
				{
					cubeinfos = cubegeometry.findCubeToCubeInfo(k, i, j);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		
		////上面
		for (i=xmin; i <=xmax ; i++) {
			for (j = zmin; j <=zmax ; j++) {
				for (k= ymax; k>=ymin ; k--) {
					cubeinfos = cubegeometry.findCubeToCubeInfo(i, k, j);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		
		////右面
		for (i=ymin; i <=ymax ; i++) {
			for (j = zmin; j <=zmax ; j++) {
				for (k= xmax; k >=xmin ; k--) {
					cubeinfos = cubegeometry.findCubeToCubeInfo(k, i, j);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		////下面
		for (i=xmin; i <=xmax ; i++) {
			for (j = zmin; j <=zmax ; j++) {
				for (k= ymin; k<=ymax ; k++) {
					cubeinfos = cubegeometry.findCubeToCubeInfo(i, k, j);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		////后面
		for (i= xmin; i <= xmax ; i++) 
		{
			for (j= ymin; j <= ymax ; j++) 
			{
				for (k = zmin; k<=zmax; k++) {
					cubeinfos = cubegeometry.findCubeToCubeInfo(i, j, k);
					if (cubeinfos)
					{
						cubeinfoVector.push(cubeinfos);
						break;
					}
				}
			}
		}
		
		
		return cubeinfoVector;
		
	}
	
	 outFaceSide(cubeinfo:CubeInfo):number
	{
		var cubegeometry:CubeGeometry = this.cubeMeshManager._cubeGeometry;
		//选中的Cubeinfo
		var cubemap:CubeMap = cubegeometry.cubeMap;
		
		var cubeinfos:CubeInfo;
		//前0
		if (cubeinfo.frontVBIndex !=-1)
		{
			for (var i:number = cubeinfos.z+1-1600; i <=cubemap.zMax+1 ; i++) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(cubeinfo.x, cubeinfo.y, i);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.zMax +1)
				{
					return 0;
				}
			}
		}
		//后1
		if (cubeinfo.backVBIndex !=-1)
		{
			for (var i:number = cubeinfos.z-1-1600; i >=cubemap.zMin-1 ; i--) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(cubeinfo.x, cubeinfo.y, i);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.zMin - 1)
				{
					return 1;
				}
			}
		}
		//左2
		if (cubeinfo.leftVBIndex !=-1)
		{
			for (var i:number = cubeinfos.x-1-1600; i >=cubemap.xMin -1 ; i--) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(i, cubeinfo.y, cubeinfo.z);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.xMin - 1)
				{
					return 2;
				}
			}
		}
		//右3
		if (cubeinfo.rightVBIndex !=-1)
		{
			for (var i:number = cubeinfos.x+1-1600; i <=cubemap.xMax+1 ; i++) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(i, cubeinfo.y, cubeinfo.z);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.xMax+1)
				{
					return 3;
				}
			}
		}
		//上4
		if (cubeinfo.topVBIndex !=-1)
		{
			for (var i:number = cubeinfos.y+1-1600; i <=cubemap.yMax+1 ; i++) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(cubeinfo.x, i,cubeinfo.z);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.yMax + 1)
				{
					return 4;
				}
			}
		}
		//下5
		if (cubeinfo.downVBIndex !=-1)
		{
			for (var i:number = cubeinfos.y-1-1600; i >=cubemap.yMin-1 ; i--) {
				cubeinfos = cubegeometry.findCubeToCubeInfo(cubeinfo.x,i,cubeinfo.z);
				if (cubeinfos)
				{
					break;
				}
				if (i == cubemap.yMin-1)
				{
					return 5;
				}
			}
		}
		
		
		return -1;
	}
	
	
	/*override*/  onUpdate():void {
		
		this.point.elements[0] = MouseManager.instance.mouseX;
		this.point.elements[1] = MouseManager.instance.mouseY;
		
		this.cubeMeshManager.transform.worldMatrix.invert(this.matrinvert);
		
		this.camera.viewportPointToRay(this.point, this.ray);
		//ray.origin = camera.transform.position;
		//ray.direction = camera.transform.forward;
		
		Vector3.transformCoordinate(this.ray.origin, this.matrinvert, this.rayOrign);
		Vector3.TransformNormal(this.ray.direction, this.matrinvert, this.rayDirection);
		
		this.rayDirection = this.ray.direction;
		this.rayOrign = this.ray.origin;
		this.CalPointOfHit();
	
	}
	private addButton(x:number, y:number, width:number, height:number, text:string, size:number, clickFun:Function):void {
		Laya.loader.load(["../../../../res/threeDimen/ui/button.png"], Handler.create(null, function():void {
			var changeActionButton:Button = (<Button>Laya.stage.addChild(new Button("../../../../res/threeDimen/ui/button.png", text)) );
			changeActionButton.size(width, height);
			changeActionButton.labelBold = true;
			changeActionButton.labelSize = size;
			changeActionButton.sizeGrid = "4,4,4,4";
			changeActionButton.scale(Browser.pixelRatio, Browser.pixelRatio);
			changeActionButton.pos(x, y);
			changeActionButton.on(Event.RIGHT_CLICK, this, clickFun);
		}));
	}
	
	
	
	
	//绑定射线检测方法
	 rayOrign:Vector3 = new Vector3(0, 0, 0);
	 rayDirection:Vector3 = new Vector3(1, 1, 1);
	 calPointx:Vector3 = new Vector3(0, 0, 0);
	 PointX:Vector3 = new Vector3(0, 0, 0);
	 calPointy:Vector3 = new Vector3(0, 0, 0);
	 PointY:Vector3 = new Vector3(0, 0, 0);
	 calPointz:Vector3 = new Vector3(0, 0, 0);
	 PointZ:Vector3 = new Vector3(0, 0, 0);
	 calPoint:Vector3 = new Vector3(0, 0, 0);
	 DistanceToorige:number = 0;
	 Chengx:number = 1;
	 Chengy:number = 1;
	 Chengz:number = 1;
	 origeInt:number = 0;
	 matrinvert:Matrix4x4 = new Matrix4x4();
	
	 CalFromZ(Z:number):boolean {
		//前后
		//PlaneIndex = 1;
		
		this.PointZ.x = this.rayDirection.x / this.rayDirection.z * (Z - this.rayOrign.z) + this.rayOrign.x;
		this.calPointz.x = Math.floor(this.PointZ.x);
		this.PointZ.y = this.rayDirection.y / this.rayDirection.z * (Z - this.rayOrign.z) + this.rayOrign.y;
		this.calPointz.y = Math.floor(this.PointZ.y);
		this.PointZ.z = Z;
		this.calPointz.z = Z;
		
		if (this.rayDirection.z > 0) {
			return (this.cubeMeshManager.FindCube(this.calPointz.x, this.calPointz.y, this.calPointz.z) != -1);
		} else {
			return (this.cubeMeshManager.FindCube(this.calPointz.x, this.calPointz.y, this.calPointz.z - 1) != -1);
		}
	
	}
	 CalFromZ1(Z:number):void
	{
		//前后
		//PlaneIndex = 1;
		
		this.PointZ.x = this.rayDirection.x / this.rayDirection.z * (Z - this.rayOrign.z) + this.rayOrign.x;
		this.calPointz.x = this.PointZ.x;
		this.PointZ.y = this.rayDirection.y / this.rayDirection.z * (Z - this.rayOrign.z) + this.rayOrign.y;
		this.calPointz.y = this.PointZ.y;
		this.PointZ.z = Z;
		this.calPointz.z = Z;
		
	}
	
	 CalFromY(Y:number):boolean {
		//上下
		//PlaneIndex = 0;
		this.PointY.x = this.rayDirection.x / this.rayDirection.y * (Y - this.rayOrign.y) + this.rayOrign.x;
		this.calPointy.x = Math.floor(this.PointY.x);
		this.PointY.z = this.rayDirection.z / this.rayDirection.y * (Y - this.rayOrign.y) + this.rayOrign.z;
		this.calPointy.z = Math.floor(this.PointY.z);
		this.PointY.y = Y;
		this.calPointy.y = Y;
		
		if (this.rayDirection.y > 0) {
			return (this.cubeMeshManager.FindCube(this.calPointy.x, this.calPointy.y, this.calPointy.z) != -1);
		} else {
			return (this.cubeMeshManager.FindCube(this.calPointy.x, this.calPointy.y - 1, this.calPointy.z) != -1);
		}
	
	}
	 CalFromY1(Y:number):void
	{
		//上下
		//PlaneIndex = 0;
		this.PointY.x = this.rayDirection.x / this.rayDirection.y * (Y - this.rayOrign.y) + this.rayOrign.x;
		this.calPointy.x = this.PointY.x;
		this.PointY.z = this.rayDirection.z / this.rayDirection.y * (Y - this.rayOrign.y) + this.rayOrign.z;
		this.calPointy.z = this.PointY.z;
		this.PointY.y = Y;
		this.calPointy.y = Y;
	}
	
	 CalFromX(X:number):boolean {
		//左右
		this.PointX.y = this.rayDirection.y / this.rayDirection.x * (X - this.rayOrign.x) + this.rayOrign.y;
		this.calPointx.y = Math.floor(this.PointX.y);
		this.PointX.z = this.rayDirection.z / this.rayDirection.x * (X - this.rayOrign.x) + this.rayOrign.z;
		this.calPointx.z = Math.floor(this.PointX.z);
		this.PointX.x = X;
		this.calPointx.x = X;
		if (this.rayDirection.x > 0) {
			return (this.cubeMeshManager.FindCube(this.calPointx.x, this.calPointx.y, this.calPointx.z) != -1);
		} else {
			return (this.cubeMeshManager.FindCube(this.calPointx.x - 1, this.calPointx.y, this.calPointx.z) != -1);
		}
	
	}
	 CalFromX1(X:number):void
	{
		//左右
		this.PointX.y = this.rayDirection.y / this.rayDirection.x * (X - this.rayOrign.x) + this.rayOrign.y;
		this.calPointx.y =this.PointX.y;
		this.PointX.z = this.rayDirection.z / this.rayDirection.x * (X - this.rayOrign.x) + this.rayOrign.z;
		this.calPointx.z =  this.PointX.z;
		this.PointX.x = X;
		this.calPointx.x = X;
	}
		
	
	 CalPointOfHit():void {

		
		this.DistanceToorige = Math.round(Vector3.distance(this.rayOrign, Vector3._ZERO)) + 200;
		
		this.Chengx = this.rayDirection.x > 0 ? 1 : -1;
		this.Chengy = this.rayDirection.y > 0 ? 1 : -1;
		this.Chengz = this.rayDirection.z > 0 ? 1 : -1;
		var disx:number = 0;
		var disy:number = 0;
		var disz:number = 0;
		this.origeInt = Math.round(this.rayOrign.x);
	

		

		for (var i:number = 0; i < this.DistanceToorige; i++) {
			
			if (this.CalFromX(this.origeInt + i * this.Chengx)) {
				disx = Vector3.distance(this.rayOrign, this.PointX);
				break;
			}
			if (i == this.DistanceToorige - 1) {
				disx = 50000;
			}
			
		}
		this.origeInt = Math.round(this.rayOrign.y);
		for (var j:number = 0; j < this.DistanceToorige; j++) {
			if (this.CalFromY(this.origeInt + j * this.Chengy)) {
				disy = Vector3.distance(this.rayOrign, this.PointY);
				break;
				
			}
			if (j == this.DistanceToorige - 1) {
				disy = 50000;
			}
		}
		this.origeInt = Math.round(this.rayOrign.z);
		for (var k:number = 0; k < this.DistanceToorige; k++) {
			if (this.CalFromZ(this.origeInt + k * this.Chengz)) {
				disz = Vector3.distance(this.rayOrign, this.PointZ);
				break;
			}
			if (k == this.DistanceToorige - 1) {
				disz = 50000;
			}
		}
		
		if (disx < disy && disx < disz) {
			this.calPoint = this.calPointx;
			this.PlaneIndex = 2;
			//LeftRightplane.active = true;
			//FrontBackplane.active = false;
			//UpDownplane.active = false;
			this.PlanePos.elements[0] = Math.round(this.calPoint.elements[0]);
			this.PlanePos.elements[1] = Math.floor(this.calPoint.elements[1]) + 0.5;
			this.PlanePos.elements[2] = Math.floor(this.calPoint.elements[2]) + 0.5;
			//LeftRightplane.transform.position = PlanePos;
			
		} else if (disy < disx && disy < disz) {
			this.calPoint = this.calPointy;
			this.PlaneIndex = 0;
			//UpDownplane.active = true;
			//FrontBackplane.active = false;
			//LeftRightplane.active = false;
			
			this.PlanePos.elements[1] = Math.round(this.calPoint.elements[1]);
			this.PlanePos.elements[0] = Math.floor(this.calPoint.elements[0]) + 0.5;
			this.PlanePos.elements[2] = Math.floor(this.calPoint.elements[2]) + 0.5;
			//UpDownplane.transform.position = PlanePos;
		} else if (disz < disx && disz < disy) {
			
			this.calPoint = this.calPointz;
			this.PlaneIndex = 1;
			//FrontBackplane.active = true;
			//UpDownplane.active = false;
			//LeftRightplane.active = false;
			this.PlanePos.elements[2] = Math.round(this.calPoint.elements[2]);
			this.PlanePos.elements[1] = Math.floor(this.calPoint.elements[1]) + 0.5;
			this.PlanePos.elements[0] = Math.floor(this.calPoint.elements[0]) + 0.5;
			//FrontBackplane.transform.position = PlanePos;
		} else {
			//FrontBackplane.active = false;
			//UpDownplane.active = false;
			//LeftRightplane.active = false;
		}
		

	
	}
	
	
	
	
	//添加Cube计算的位置
	 AddPos(RayHitPos:Vector3, PlaneIndex:number):Vector3 {
		
		var normal:Vector3 = this.rayDirection;
		var cubePos:Vector3 = new Vector3();
		switch (PlaneIndex) {
		case 0: 
			if (normal.elements[1] < 0) {
				//y-1
				cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			} else {
				cubePos.elements[1] = Math.floor(RayHitPos.elements[1]) - 1;
			}
			cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			break;
		case 1: 
			if (normal.elements[2] < 0) {
				//z-1
				cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			} else {
				cubePos.elements[2] = Math.floor(RayHitPos.elements[2]) - 1;
			}
			cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			break;
		case 2: 
			if (normal.elements[0] < 0) {
				//x-1
				cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			} else {
				cubePos.elements[0] = Math.floor(RayHitPos.elements[0]) - 1;
			}
			cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			break;
		default: 
			break;
		}
		return cubePos;
	}
	
	//删除Cube的位置
	 RemovePos(RayHitPos:Vector3, PlaneIndex:number):Vector3 {
		var normal:Vector3 = this.rayDirection;
		var cubePos:Vector3 = new Vector3();
		switch (PlaneIndex) {
		case 0: 
			if (normal.elements[1] < 0) {
				//y-1
				cubePos.elements[1] = Math.floor(RayHitPos.elements[1]) - 1;
			} else {
				cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			}
			cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			break;
		case 1: 
			if (normal.elements[2] < 0) {
				//z-1
				cubePos.elements[2] = Math.floor(RayHitPos.elements[2]) - 1;
			} else {
				cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			}
			cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			break;
		case 2: 
			if (normal.elements[0] < 0) {
				//x-1
				cubePos.elements[0] = Math.floor(RayHitPos.elements[0]) - 1;
			} else {
				cubePos.elements[0] = Math.floor(RayHitPos.elements[0]);
			}
			cubePos.elements[1] = Math.floor(RayHitPos.elements[1]);
			cubePos.elements[2] = Math.floor(RayHitPos.elements[2]);
			break;
		default: 
			break;
		}
		return cubePos;
	}
	
	
	
	
	//加载
	 LoadFile(Path:string, returnindexLoad:Handler):void {
		
	Laya.loader.load(Path, Handler.create(null, function(arraybuffer:ArrayBuffer):void {
			
			var bytearray:Byte = new Byte(arraybuffer);
			if (arraybuffer == null) {
				throw "Failed to open file for FileStream";
			}
			var versionString:string = bytearray.readUTFString();
			if (versionString == "LayaBoxVox001") {
				//加载lvox
				returnindexLoad.args = [0];
				returnindexLoad.run();
			} else {
				//加载vox
				returnindexLoad.args = [1];
				returnindexLoad.run();
			}
		}), null, Loader.BUFFER);
	}
	
	 Load(Path:string):void {
		var cubeinfoar:CubeInfoArray;

		//LoadFile(Path, Handler.create(null, function(index:int):void {
		var index:number = 1;
			if (index == 0) {
			
				lVoxFile.LoadlVoxFile(Path, Handler.create(null, function(cubeinfoss:CubeInfoArray):void {
					this.cubeMeshManager.AddCubes(cubeinfoss);
				}));
			} else 
			{
				this.voxfile = new VoxFileData();
				
				this.voxfile.LoadVoxFile(Path,0,Handler.create(null, function(cubeinfoss:CubeInfoArray):void {
					var colorarray:number[] = cubeinfoss.colorArray;
					var length:number = colorarray.length;
					for (var i:number = 0; i < length; i++) 
					{
						var zhuan:number = colorarray[i];
						var r:number = ((zhuan & 0x1f) << 3);
						var g:number = ((zhuan & 0x3e0) >> 2);
						var b:number = ((zhuan >> 10) << 3);
						var a:number = 0;
						
						colorarray[i] = r+(g<<8)+(b<<16)+(a<<24);
						
					}
					
					this.cubeMeshManager.AddCubes(cubeinfoss);
				}));
			}
		//}));
	}
	
	 LoadPixel(Path:string,VoxPath:string):void {
		Laya.loader.create(Path, Handler.create(null, function(tex:Texture2D):void {
			var pixels:Uint8Array = tex.getPixels();
			var width:number = 8;
			var height:number = 32;
			for (var i:number; i < height; i++){
				var heightOffset:number = i*width * 4;
				for (var j:number; j < width; j++){
					var offset:number = heightOffset + j * 4;
					var index:number = i * width + j;
					if (index !== 255)
						VoxFileData.TextureColor[index + 1] = this.getColorIndex(pixels[offset], pixels[offset + 1], pixels[offset + 2]);
				}
			}
				this.Load(VoxPath);
		}), null, null, [0, 0, BaseTexture.FORMAT_R8G8B8A8, true, true]);
		
	
	}
	
	 getColorIndex(r:number,g:number,b:number):number {
		return (r >> 3) + ((g >> 3) << 5) + ((b >> 3) << 10);
	}
}
