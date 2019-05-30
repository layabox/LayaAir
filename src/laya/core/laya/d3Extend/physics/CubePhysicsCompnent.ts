import { RenderableSprite3D } from "laya/d3/core/RenderableSprite3D"
import { BoundsOctree } from "laya/d3/core/scene/BoundsOctree"
import { BoundsOctreeNode } from "laya/d3/core/scene/BoundsOctreeNode"
import { IOctreeObject } from "laya/d3/core/scene/IOctreeObject"
import { BoundBox } from "laya/d3/math/BoundBox"
import { BoundSphere } from "laya/d3/math/BoundSphere"
import { Vector3 } from "laya/d3/math/Vector3"
import { TriggerManager } from "./triggerEventDistributedModule/D_manager/TriggerManager"
import { GlobalOnlyValueCell } from "./triggerEventDistributedModule/E_function/cell/GlobalOnlyValueCell"
import { Script } from "laya/components/Script"
import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
import { Mesh } from "laya/d3/resource/models/Mesh"
import { Node } from "laya/display/Node"
import { Script3D } from "laya/d3/component/Script3D"
import { Sprite3D } from "laya/d3/core/Sprite3D"
import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
//import laya.maker.plugin.extend.Script3DExtend;

/**
 * ...
 * @author ...
 */
export class CubePhysicsCompnent extends Script implements IOctreeObject{
    /**
     * 该物体是否时静态
     */
     isStatic:boolean;
    /** @private 长方体类型碰撞器*/
     static TYPE_BOX:number = 0;
    /** @private 球类型碰撞器*/
     static TYPE_SPHERE:number = 1;
    /** @private 盒子类型*/
     static TYPE_CUBESPRIT3D:number = 2;

	
	//使用此物理时先给碰撞盒位置
	//更新包围盒
	/** @private 碰撞范围的中心*/
	 static centerSprite:Vector3 = new Vector3(0, 0, 0);
	/** @private 碰撞范围*/
	 static extents:Vector3 = new Vector3(8, 8, 8);
	/** @private 主动碰撞盒*/
	 static boundBox:BoundBox = new BoundBox();
	/** @private 八叉树*/
	 static _octree:BoundsOctree = new BoundsOctree(64, new Vector3(0, 0, 0), 4, 1.25);
	
	/**
     * 该组件的唯一ID
     */
     onlyID:number;
    /** @private 被挂脚本的精灵*/
    protected _sprite3D:Sprite3D;

    /** @private 是否是主动检测物体*/
    private isRigebody:boolean = false;
    /** @private 类型包围盒*/
     type:number;

    /** @private 物体模型的模型矩阵*/
    protected _localmatrix4x4:Matrix4x4;
    /** @private 物体模型的世界矩阵*/
    protected _worldMatrix4x4:Matrix4x4;


	/**@private 碰撞盒*/
	 _boundBox:BoundBox = new BoundBox(new Vector3(0,0,0),new Vector3(0,0,0));
	/**@private 碰撞球*/
	 _boundSpheres:BoundSphere = new BoundSphere(new Vector3(0,0,0),0);
	
	/**@private 临时变量*/
	private static _tempVectormax:Vector3 = new Vector3(0, 0, 0);
	private static _tempVectormin:Vector3 = new Vector3(0, 0, 0);
	/**@private 八叉树节点*/
	 _octreeNode:BoundsOctreeNode;
	/** @private */
	 _indexInOctreeMotionList:number = -1;	
	
    /**
     * 构造函数 准备好数据
     */
    constructor(){super();

		
    }

    /**
     * 静态函数
     * @param 两个需要检测的碰撞物体
     */
     isCollision(other:CubePhysicsCompnent):number {
		return 0;
    }
	
	
	/**
     * 静态函数
     * @param 更新物理包围盒
     */
	 static updataBoundBox():void
	{
		CubePhysicsCompnent.boundBox.setCenterAndExtent(CubePhysicsCompnent.centerSprite, CubePhysicsCompnent.extents);
	}
	
	
	/**
     * 静态函数
     * @param 查找所有Mesh
     */
	 static findAllMesh(sprite:Node,Mesharray:Mesh[],renderspriteArray:RenderableSprite3D[]):void
	{
		var tempMesh:Mesh;
		var childsprite:Node;
		if (!Mesharray) Mesharray= [];
		
		if (sprite instanceof Sprite3D)
		{
			if (sprite instanceof MeshSprite3D)
			{
				tempMesh = ((<MeshSprite3D>sprite )).meshFilter.sharedMesh;
				if (tempMesh) Mesharray.push(tempMesh);
				renderspriteArray.push(sprite);
				if ((sprite).numChildren != 0)
				{
					for (var i:number = 0; i < sprite.numChildren; i++) {
						childsprite = (sprite).getChildAt(i);
						CubePhysicsCompnent.findAllMesh(childsprite, Mesharray,renderspriteArray);
					}
				}
			}
			else if (sprite instanceof SkinnedMeshSprite3D)
			{
				tempMesh = ((<SkinnedMeshSprite3D>sprite )).meshFilter.sharedMesh;
				if (tempMesh) Mesharray.push(tempMesh);
				renderspriteArray.push(sprite);
				if ((sprite).numChildren != 0)
				{
					for (var j:number = 0; j < sprite.numChildren; j++) {
						childsprite = sprite.getChildAt(j);
						CubePhysicsCompnent.findAllMesh(childsprite, Mesharray,renderspriteArray);
					}
				}
			}
			else
			{
				if ((sprite).numChildren != 0)
				{
					for (var k:number = 0; k < sprite.numChildren; k++) {
						childsprite = sprite.getChildAt(k);
						CubePhysicsCompnent.findAllMesh(childsprite, Mesharray,renderspriteArray);
					}
				}
			}
		}
	}
	
	/**
	* @private
	*/
	 _getOctreeNode():BoundsOctreeNode {//[实现IOctreeObject接口]
		return this._octreeNode;
	}
	/**
	 * @private
	 */
	 _setOctreeNode(value:BoundsOctreeNode):void {//[实现IOctreeObject接口]
		this._octreeNode = value;
	}
	
	/**
	 * @private
	 */
	 _getIndexInMotionList():number {//[实现IOctreeObject接口]
		return this._indexInOctreeMotionList;
	}
	
	/**
	 * @private
	 */
	 _setIndexInMotionList(value:number):void {//[实现IOctreeObject接口]
		this._indexInOctreeMotionList = value;
	}
	
	/**
	 * 获取包围球,只读,不允许修改其值。
	 * @return 包围球。
	 */
	 get boundingSphere():BoundSphere {
		return this._boundSpheres;
	}
	
	
	/**
	 * 获取包围盒,只读,不允许修改其值。
	 * @return 包围盒。
	 */
	 get boundingBox():BoundBox {
		
		return this._boundBox;
	}
	
	/**
     * 静态函数 根据八叉树来检测是否检测物理碰撞
     * @param 两个需要检测的碰撞物体
	 * 返回true
     */
	 static isBoundsCollision(Physics1:CubePhysicsCompnent,Physics2:CubePhysicsCompnent):boolean
	{
		if (!Physics1._octreeNode.isCollidingWithBoundBox(CubePhysicsCompnent.boundBox))
		 return false;
		else if (!Physics2._octreeNode.isCollidingWithBoundBox(CubePhysicsCompnent.boundBox))
		return false;
		else
		 return true;
		
	}

	/*override*/  onAwake():void
	{
		super .onAwake();
        this.onlyID = GlobalOnlyValueCell.getOnlyID();
	}

    /*override*/  onEnable():void {
        super.onEnable();
        if (this.isStatic) {
            TriggerManager.instance.addStatic(this);
        }
        else {
         //   TriggerManager.instance.addDY(this);
        }
    }

    /*override*/  onDisable():void {
        super.onDisable();
        if (this.isStatic) {
            TriggerManager.instance.removeStatic(this);
        }
        else {
            TriggerManager.instance.removeDY(this);
        }
    }

    /*override*/  onDestroy():void {
        if (this.isStatic) {
            TriggerManager.instance.removeStatic(this);
        }
        else {
            TriggerManager.instance.removeDY(this);
        }
        super.onDestroy();
    }
	
}



