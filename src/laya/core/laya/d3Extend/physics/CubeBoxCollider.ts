import { CubePhysicsCompnent } from "././CubePhysicsCompnent";
import { CubeSphereCollider } from "././CubeSphereCollider";
import { CubeEditCubeCollider } from "././CubeEditCubeCollider";
import { CubeMap } from "../Cube/CubeMap"

import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { Transform3D } from "laya/d3/core/Transform3D"
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D"
import { BoundBox } from "laya/d3/math/BoundBox"
import { BoundSphere } from "laya/d3/math/BoundSphere"
import { Color } from "laya/d3/math/Color"
import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
import { OrientedBoundBox } from "laya/d3/math/OrientedBoundBox"
import { Quaternion } from "laya/d3/math/Quaternion"
import { Vector3 } from "laya/d3/math/Vector3"
import { Mesh } from "laya/d3/resource/models/Mesh"

/**
 * ...
 * @author ...
 */
export class CubeBoxCollider extends CubePhysicsCompnent {

     oriBoundCenter:Vector3 = new Vector3();
    //这些描述包围盒的数据都是物体模型坐标
	 position:Vector3 = new Vector3(0,0, 0);
	 scale:Vector3 = new Vector3(2, 2, 2);
	 privateScale:Vector3 = new Vector3(0, 0, 0);
	 lineActive:boolean = false;
	
	private temp:Vector3 = new Vector3(0, 0, 0);
	//用来记录物体本身的位置盒缩放
	private _vec1:Vector3 = new Vector3();
	private _vec2:Vector3 = new Vector3();
	 scaleMatrix:Matrix4x4 = new Matrix4x4();
    /** @private 世界坐标的左后下角*/
    private W_minx:number = 9999;
    private W_miny:number = 9999;
    private W_minz:number = 9999;
    private W_maxx:number = -9999;
    private W_maxy:number = -9999;
    private W_maxz:number = -9999;
	 pixelline: PixelLineSprite3D = new PixelLineSprite3D(20);

    /** @private 包围盒点*/
     OBBWorldPointList:Vector3[] = [];

    //OBB包围盒
     _orientedBoundBox:OrientedBoundBox = new OrientedBoundBox(new Vector3(), new Matrix4x4());
	//transform
	
	//相当于local position
	private _primitPosition:Vector3 = new Vector3();
	private _disparity:Vector3 = new Vector3();
	private tempVector:Vector3 = new Vector3();
	//用来画线的临时变量

    //用来画线的临时变量

     tempVectorPoints:Vector3[] = [];


    /*override*/  onAwake():void {
       // super.onAwake();
        this.type = CubePhysicsCompnent.TYPE_BOX;


        this._sprite3D = (<Sprite3D>this.owner );
		
		if (!this.pixelline)
		{
			this.pixelline = new PixelLineSprite3D(20);
		}
		this._sprite3D.scene.addChild(this.pixelline);
		var Mesharray:Mesh[] = [];
	
		var spriteArray:RenderableSprite3D[] = [];
		CubePhysicsCompnent.findAllMesh(this._sprite3D, Mesharray,spriteArray);
		
		var AllPositions:Vector3[] = [];
		for (var i:number = 0, n:number = Mesharray.length; i < n; i++) {
			
			var positions:Vector3[] = Mesharray[i]._getPositions();
			var worldmatrix:Matrix4x4 = spriteArray[i].transform.worldMatrix;
			for (var j:number = 0; j < positions.length; j++) {
		
				Vector3.transformCoordinate(positions[j], worldmatrix, positions[j]);
				AllPositions.push(positions[j]);
			}
		}
        var boundbox:BoundBox = new BoundBox(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
		
		BoundBox.createfromPoints(AllPositions, boundbox);
		//Vector3.transformCoordinate(boundbox.max, _sprite3D.transform.worldMatrix, boundbox.max);
		//Vector3.transformCoordinate(boundbox.min, _sprite3D.transform.worldMatrix, boundbox.min);
        OrientedBoundBox.createByBoundBox(boundbox, this._orientedBoundBox);
		var vect:Vector3 = this._orientedBoundBox.extents;
		var SpriteScale:Vector3 = this._sprite3D.transform.scale;
		this.privateScale.setValue(vect.x / SpriteScale.x, vect.y / SpriteScale.y, vect.z / SpriteScale.z);
		//privateScale.setValue(vect.x, vect.y, vect.z);
		var OBBcenter:Vector3 = new Vector3();
		this._orientedBoundBox.getCenter(OBBcenter);
		Vector3.subtract(OBBcenter,this._sprite3D.transform.position,this._primitPosition);
		
		
		
		
		
		//创建包围盒和包围球
		this._boundBox = boundbox;
		//BoundSphere.createfromPoints(AllPositions,_boundSpheres)
		
		//_octree.add(this);
		
		//drawLine
		for (var k:number = 0; k < 8; k++) {
			this.tempVectorPoints.push(new Vector3());
		}
		
		 //创建包围盒和包围球
        this._boundBox = boundbox;
        BoundSphere.createfromPoints(AllPositions, this._boundSpheres)

        CubePhysicsCompnent._octree.add(this);

        //drawLine
        for (var k:number = 0; k < 8; k++) {
            this.tempVectorPoints.push(new Vector3());
        }

		
    }

       
    


    /*override*/  onUpdate():void {
        this.updataObbTranform();
    }

    /*
     * 方法用于更新物体的包围盒,运动的物体要时时刻刻调用
     *
     */
     updataObbTranform():void {
	
		 
		 //_sprite3D.transform.worldMatrix.cloneTo( _orientedBoundBox.transformation);
		 //Vector3.transformCoordinate(_primitPosition, _sprite3D.transform.worldMatrix, tempVector);
		 //
		 //_orientedBoundBox.translate(_primitPosition);
		 ////_orientedBoundBox.Size();
		 
		var obbMat:Matrix4x4 = this._orientedBoundBox.transformation;
		var transform:Transform3D = this._sprite3D.transform;
		var rotation:Quaternion = transform.rotation;
		var scale1:Vector3 = transform.scale;
		
		Vector3.add(this._primitPosition,this.position,this._disparity);
		if (this._disparity.x=== 0.0 && this._disparity.y=== 0.0 && this._disparity.z === 0.0) {
			Matrix4x4.createAffineTransformation(transform.position, rotation, Vector3.ONE, obbMat);
		} else {
			
			Vector3.multiply(this._disparity,scale1, this.tempVector);
			Vector3.transformQuat(this.tempVector, rotation, this.tempVector);
			Vector3.add(transform.position, this.tempVector, this.tempVector);
			Matrix4x4.createAffineTransformation(this.tempVector, rotation, Vector3.ONE, obbMat);
		}
		this._orientedBoundBox.transformation = obbMat;
		
		var extentsE:Vector3 = this._orientedBoundBox.extents;
		var sizeE:Float32Array = this.scale.elements;
		var scaleE:Float32Array = scale1.elements;
		extentsE.x = this.scale.x * 0.5 * scale1.x*this.privateScale.x;
		extentsE.y = this.scale.y * 0.5 * scale1.y*this.privateScale.y;
		extentsE.z = this.scale.z * 0.5 * scale1.z*this.privateScale.z;
		
		 this._orientedBoundBox.extents = extentsE;
		 
		 
		 
		 var extend:Vector3 = this._orientedBoundBox.extents;
		 //更新八叉树的包围盒和包围球
		 this._boundBox.max.setValue(this.oriBoundCenter.x + extend.x, this.oriBoundCenter.y + extend.y, this.oriBoundCenter.z + extend.z);
		 this._boundBox.min.setValue(this.oriBoundCenter.x - extend.x, this.oriBoundCenter.y - extend.y, this.oriBoundCenter.z - extend.z);
		 this._boundSpheres.center = this.oriBoundCenter;
		 
		//_octreeNode.update(this);
		 
    }


    /**
     * 碰撞检测
     */
    /*override*/  isCollision(other:CubePhysicsCompnent):number {
        switch (other.type) {
            case 0:
                return this.boxAndBox((<CubeBoxCollider>other ));
                break;
            case 1:
                return this.boxAndSphere((<CubeSphereCollider>other ));
                break;
            case 2:
                return this.boxAndCube((<CubeEditCubeCollider>other ));
                break;
            default:
                return 999;
        }

    }

	
	 _showline():void
	{
		this.pixelline.active = true;
		this.drawBound();
	}
	 _noShowLine():void
	{
		this.pixelline.active = false;
	}
	
	
	/**
		 * @private
		 */
		 drawBound(color:Color = Color.GREEN):void {
			//if (debugLine.lineCount + 12 > debugLine.maxLineCount)
			
			//debugLine.maxLineCount += 12;
			
			this.pixelline.clear();
			this._orientedBoundBox.getCorners(this.tempVectorPoints);
		
			this.pixelline.addLine(this.tempVectorPoints[0],this.tempVectorPoints[1], color, color);
			this.pixelline.addLine(this.tempVectorPoints[1],this.tempVectorPoints[2], color, color);
			this.pixelline.addLine(this.tempVectorPoints[2],this.tempVectorPoints[3], color, color);
			this.pixelline.addLine(this.tempVectorPoints[3],this.tempVectorPoints[0], color, color);
			this.pixelline.addLine(this.tempVectorPoints[0],this.tempVectorPoints[4], color, color);
			this.pixelline.addLine(this.tempVectorPoints[1],this.tempVectorPoints[5], color, color);
			this.pixelline.addLine(this.tempVectorPoints[2],this.tempVectorPoints[6], color, color);
			this.pixelline.addLine(this.tempVectorPoints[3],this.tempVectorPoints[7], color, color);
			this.pixelline.addLine(this.tempVectorPoints[4],this.tempVectorPoints[5], color, color);
			this.pixelline.addLine(this.tempVectorPoints[5],this.tempVectorPoints[6], color, color);
			this.pixelline.addLine(this.tempVectorPoints[6],this.tempVectorPoints[7], color, color);
			this.pixelline.addLine(this.tempVectorPoints[7],this.tempVectorPoints[4], color, color);
		}

  
    /**
     * 计算盒和球
     */
     boxAndSphere(other:CubeSphereCollider):number {

        return this._orientedBoundBox.containsSphere(other._boundSphere, true);


    }

    /**
     * 计算盒和盒
     */
     boxAndBox(other:CubeBoxCollider):number {
        return this._orientedBoundBox.containsOrientedBoundBox(other._orientedBoundBox);
    }

    /**
     * 计算盒和建筑Cube
     */
     boxAndCube(other:CubeEditCubeCollider):number {
		this.initmaxmin();
        this.updataMinMax();
		this.init2maxmin();
        for (var i:number = this.W_minx; i <= this.W_maxx; i++) {
            for (var j:number = this.W_miny; j <= this.W_maxy; j++) {

                for (var k:number = this.W_minz; k <= this.W_maxz; k++) {
                    if (this.OneCubeIsCollider(other, i, j, k) != 0) {
                        return 1;
                    }
                }
            }
        }

        return 0;

    }


    private OBBpoints:Vector3[] = [];

    /*
     * 计算最大最小的世界空间值
     */
     updataMinMax():void {
        this._orientedBoundBox.getCorners(this.tempVectorPoints);
        for (var i:number = 0; i < this.tempVectorPoints.length; i++) {
            if (this.tempVectorPoints[i].x > this.W_maxx) this.W_maxx = this.tempVectorPoints[i].x;
            if (this.tempVectorPoints[i].x < this.W_minx) this.W_minx = this.tempVectorPoints[i].x;
            if (this.tempVectorPoints[i].y > this.W_maxy) this.W_maxy = this.tempVectorPoints[i].y;
            if (this.tempVectorPoints[i].y < this.W_miny) this.W_miny = this.tempVectorPoints[i].y;
            if (this.tempVectorPoints[i].z > this.W_maxz) this.W_maxz = this.tempVectorPoints[i].z;
            if (this.tempVectorPoints[i].z < this.W_minz) this.W_minz = this.tempVectorPoints[i].z;

        }
    }

	 initmaxmin():void
	{
		this.W_minx = 9999;
		this.W_miny = 9999;
		this.W_minz = 9999;
		this.W_maxx = -9999;
		this.W_maxy = -9999;
		this.W_maxz = -9999;
	}

	 init2maxmin():void
	{
		this.W_minx = Math.floor(this.W_minx);
		this.W_miny = Math.floor(this.W_miny);
		this.W_minz = Math.floor(this.W_minz);
		this.W_maxx = Math.ceil(this.W_maxx);
		this.W_maxy = Math.ceil(this.W_maxy);
		this.W_maxz = Math.ceil(this.W_maxz);
	}
	
     cubePoint:Vector3 = new Vector3();

    /*
     * 判断一个cube是否碰撞了BoxCollider
     */
     OneCubeIsCollider(cubecollider:CubeEditCubeCollider, x:number, y:number, z:number):number {
        var ii:number = cubecollider.find(x + 1600, y + 1600, z + 1600);
		if ( ii!=-1) {
			cubecollider.collisionCube.setValue(x, y, z);
			cubecollider.cubeProperty = ii;
            this.cubePoint.setValue(x, y, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y + 1, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y + 1, z);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y + 1, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y + 1, z + 1);
            if (this._orientedBoundBox.containsPoint(this.cubePoint) != 0) return 1;


        }
        return 0;
    }

	/*override*/  onDestroy():void
	{
		this.clearLine();
		super.onDestroy();
		
	}
	
	/*override*/  onDisable():void
	{
		super.onDisable();
		this.pixelline.active = false;
	}
	
	
	/*override*/  onEnable():void {
		super.onEnable();
		this.pixelline.active = true;
	}
	
	 clearLine():void
	{
		this.pixelline.clear();
		this.pixelline.destroy();
	}
		
	 resizeBound():void
	{
		var Mesharray:Mesh[] = [];
	
		var spriteArray:RenderableSprite3D[] = [];
		CubePhysicsCompnent.findAllMesh(this._sprite3D, Mesharray,spriteArray);
		
		var AllPositions:Vector3[] = [];
		for (var i:number = 0, n:number = Mesharray.length; i < n; i++) {
			
			var positions:Vector3[] = Mesharray[i]._getPositions();
			var worldmatrix:Matrix4x4 = spriteArray[i].transform.worldMatrix;
			for (var j:number = 0; j < positions.length; j++) {
		
				Vector3.transformCoordinate(positions[j], worldmatrix, positions[j]);
				AllPositions.push(positions[j]);
			}
		}
        var boundbox:BoundBox = new BoundBox(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
		BoundBox.createfromPoints(AllPositions, boundbox);
        OrientedBoundBox.createByBoundBox(boundbox, this._orientedBoundBox);
		var vect:Vector3 = this._orientedBoundBox.extents;
		this.privateScale.setValue(vect.x, vect.y, vect.z);
		var OBBcenter:Vector3 = new Vector3();
		this._orientedBoundBox.getCenter(OBBcenter);
		Vector3.subtract(OBBcenter,this._sprite3D.transform.position,this._primitPosition);
		
	}

	
	
}


