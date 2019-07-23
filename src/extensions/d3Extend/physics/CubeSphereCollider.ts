import { CubePhysicsCompnent } from "./CubePhysicsCompnent";
import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
import { CubeBoxCollider } from "./CubeBoxCollider";
import { CubeEditCubeCollider } from "./CubeEditCubeCollider";
import { CubeMap } from "../Cube/CubeMap"
import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { PixelLineSprite3D } from "laya/d3/core/pixelLine/PixelLineSprite3D"
import { BoundSphere } from "laya/d3/math/BoundSphere"
import { CollisionUtils } from "laya/d3/math/CollisionUtils"
import { Color } from "laya/d3/math/Color"
import { Vector3 } from "laya/d3/math/Vector3"
import { Mesh } from "laya/d3/resource/models/Mesh"
import { CubeInfo } from "../Cube/CubeInfo"
import { CubeInfoArray } from "../worldMaker/CubeInfoArray"

/**
 * ...
 * @author ...
 */
export class CubeSphereCollider extends CubePhysicsCompnent {
   
    ///** @private 包围球中点*/
     center:Vector3 = new Vector3(0,0,0);
    /** @private 包围球半径*/
     radius:number = 1;
     _boundSphere:BoundSphere = new BoundSphere(new Vector3(0, 0, 0), 0);
	private _primitPosition:Vector3;
	private _disparity:Vector3 = new Vector3();
	private _primitscale:Vector3 = new Vector3();
  	 pixelline: PixelLineSprite3D = new PixelLineSprite3D(320);
	 primitradius:number = 0;
    constructor(){super();



    }

    /*override*/  onAwake():void {
      //  super.onAwake();
		this.type = CubePhysicsCompnent.TYPE_SPHERE;
        this._sprite3D = (<Sprite3D>this.owner );
		
		if (!this.pixelline)
		{
			this.pixelline = new PixelLineSprite3D(320);
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
        BoundSphere.createfromPoints(AllPositions, this._boundSphere);
		var OBBcenter:Vector3 = this._boundSphere.center;
		this._primitPosition = this._sprite3D.transform.position;
		this._primitscale = this._sprite3D.transform.scale;
		this._disparity.setValue(OBBcenter.x - this._primitPosition.x, OBBcenter.y - this._primitPosition.y, OBBcenter.z - this._primitPosition.z);
		this.primitradius = this._boundSphere.radius/Math.max(this._primitscale.x,this._primitscale.y,this._primitscale.z);

		this._boundBox.max.setValue(OBBcenter.x + this.radius, OBBcenter.y + this.radius, OBBcenter.z + this.radius);
		this._boundBox.min.setValue(OBBcenter.x - this.radius, OBBcenter.y - this.radius, OBBcenter.z - this.radius);
		this._boundSpheres.center.setValue(OBBcenter.x, OBBcenter.y, OBBcenter.z);
		this._boundSpheres.radius = this._boundSphere.radius;		
		CubePhysicsCompnent._octree.add(this);
    }

    /*override*/  onUpdate():void
    {
        this.updataBoundSphere();
    }

     updataBoundSphere():void {
			var bei:number = Math.max(this._primitscale.x, this._primitscale.y, this._primitscale.z);
			this._boundSphere.radius = this.primitradius*bei*this.radius;
			
			var spt:Vector3 = this._sprite3D.transform.position;
		
			this._boundSphere.center.setValue((spt.x + this._disparity.x*bei) + this.center.x, (spt.y + this._disparity.y*bei + this.center.y), (spt.z + this._disparity.z*bei + this.center.z));

			var vec:Vector3 = this._boundSphere.center;
			var ra:number = this._boundSphere.radius;
			
			this._boundBox.max.setValue(vec.x + ra, vec.y + ra, vec.z + ra);
			this._boundBox.min.setValue(vec.x - ra, vec.y - ra, vec.z - ra);
			this._boundSpheres.center.setValue(vec.x, vec.y, vec.z);
			this._boundSpheres.radius = ra;
			
    }

    /**
     * 判断是否碰撞
     */
    /*override*/  isCollision(other:CubePhysicsCompnent):number {
        switch (other.type) {
            case 0:
                return this.sphereAndBox((<CubeBoxCollider>other ));
                break;
            case 1:
                return this.sphereAndShpere((<CubeSphereCollider>other ));
                break;
            case 2:
                return this.sphereAndCube((<CubeEditCubeCollider>other ));
                break;
            default:
                return 999;
        }
    }

    ////计算最长距离
    //private var _vector3:Vector3 = new Vector3();

    /**
     * 计算球和球
     */
     sphereAndShpere(other:CubeSphereCollider):number {
   
        return CollisionUtils.sphereContainsSphere(other._boundSphere, this._boundSphere);
    }

    /**
     * 计算球和Box
     */
     sphereAndBox(other:CubeBoxCollider):number {
        return other.boxAndSphere(this);
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
     * 计算球和建筑Cube
     */
     sphereAndCube(other:CubeEditCubeCollider):number {
       
        var cubemap:CubeMap = other.cubeMap;
        //根据中心点和半径来确定一个球网
        var minx:number = Math.floor(this._boundSphere.center.x - this._boundSphere.radius);
        var maxx:number = Math.floor(this._boundSphere.center.x + this._boundSphere.radius);
        var miny:number = Math.floor(this._boundSphere.center.y - this._boundSphere.radius);
        var maxy:number = Math.floor(this._boundSphere.center.y + this._boundSphere.radius);
        var minz:number = Math.floor(this._boundSphere.center.z - this._boundSphere.radius);
        var maxz:number = Math.floor(this._boundSphere.center.z + this._boundSphere.radius);
        var ix:number;
        var iy:number;
        var iz:number;
      
        for (var i:number = minx; i <= maxx; i++) {
            for (var j:number = miny; j <= maxy; j++) {
                for (var k:number = minz; k <= maxz; k++) {
                    if (this.OneCubeIsCollider(other, i, j, k) != 0) return 1;
                }
            }

        }

        return 0;


    }


    private cubePoint:Vector3 = new Vector3();

     OneCubeIsCollider(cubeCollider:CubeEditCubeCollider, x:number, y:number, z:number):number {
        var ii:number = this.cubecollider.find(x + 1600, y + 1600, z + 1600);
		if ( ii!=-1) {
			this.cubecollider.collisionCube.setValue(x, y, z);
			this.cubecollider.cubeProperty = ii;
            this.cubePoint.setValue(x, y, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y + 1, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y + 1, z);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x, y + 1, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
            this.cubePoint.setValue(x + 1, y + 1, z + 1);
            if (CollisionUtils.sphereContainsPoint(this._boundSphere, this.cubePoint) != 0) return 1;
        }
		 return 0;

    }
	
	private vec1:Vector3 = new Vector3();
	private vec2:Vector3 = new Vector3();
	
	 drawBound(color:Color = Color.GREEN):void {
		//if (debugLine.lineCount + 12 > debugLine.maxLineCount)
			//debugLine.maxLineCount += 12;
		
		this.pixelline.clear();
		var lineNums:number  = 100;
		var duan:number = 6.28 / lineNums;
		var sita:number = 0;
		var center:Vector3 = this._boundSphere.center;
		var ra:number = this._boundSphere.radius;
		for (var i:number = 0; i <= lineNums; i++) {
			this.vec1.setValue(Math.cos(sita)*ra + center.x, Math.sin(sita)*ra + center.y, center.z);
			sita = i * duan;
			this.vec2.setValue(Math.cos(sita) * ra + center.x, Math.sin(sita) * ra + center.y, center.z);
			this.pixelline.addLine(this.vec1, this.vec2, color, color);
		}
		for (var i:number = 0; i <= lineNums; i++) {
			this.vec1.setValue( center.x, Math.sin(sita)*ra + center.y, Math.cos(sita)*ra+center.z);
			sita = i * duan;
			this.vec2.setValue(center.x, Math.sin(sita) * ra + center.y,Math.cos(sita)*ra+center.z);
			this.pixelline.addLine(this.vec1, this.vec2, color, color);
		}
		for (var i:number = 0; i <= lineNums; i++) {
			this.vec1.setValue(Math.cos(sita)*ra + center.x,center.y,Math.sin(sita)*ra+ center.z);
			sita = i * duan;
			this.vec2.setValue(Math.cos(sita) * ra + center.x,center.y,Math.sin(sita)*ra+center.z);
			this.pixelline.addLine(this.vec1, this.vec2, color, color);				
		}
		
			
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
        BoundSphere.createfromPoints(AllPositions, this._boundSphere);
		var OBBcenter:Vector3 = this._boundSphere.center;
		this._primitPosition = this._sprite3D.transform.position;
		this._primitscale = this._sprite3D.transform.scale;
		this._disparity.setValue(OBBcenter.x - this._primitPosition.x, OBBcenter.y - this._primitPosition.y, OBBcenter.z - this._primitPosition.z);
		this.primitradius = this._boundSphere.radius;
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


   

}


