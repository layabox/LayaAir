import { CubeInfo } from "./CubeInfo";
import { CubeSprite3D } from "./CubeSprite3D";
import { SubCubeGeometry } from "./SubCubeGeometry";
	import { AnimationClip } from "laya/d3/animation/AnimationClip"
	import { Animator } from "laya/d3/component/Animator"
	import { Avatar } from "laya/d3/core/Avatar"
	import { BufferState } from "laya/d3/core/BufferState"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { SkinnedMeshSprite3D } from "laya/d3/core/SkinnedMeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Vector4 } from "laya/d3/math/Vector4"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { SubMesh } from "laya/d3/resource/models/SubMesh"
	import { Handler } from "laya/utils/Handler"
	import { WebGLContext } from "laya/webgl/WebGLContext"
	/**
	 * @private
	 * <code>CubeCharacter</code> 类用于将cube信息变成Meshsprite3D模型。
	 */
	export class CubeCharacter {
		
		 static skinMeshSprite:SkinnedMeshSprite3D;
		 static skinmesh:Mesh;
		 static aniClipArray:AnimationClip[] = [];
		 static avatar:Avatar;
		 static animatorName:string[] = [];
		 static Large:number = 1;
		 static CUBECHARACTER_SMALL = 1;
		 static CUBECHARACTER_MEDIUM = 2;
		 static CUBECHARACTER_LARGE = 3;
		private static _vertexDeclaration:VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,COLOR,BLENDWEIGHT,BLENDINDICES");
		 static Test:Sprite3D;
		
		
		private static _vbDatas:Float32Array;
		private static _vbindex:number = 0;
		private _cubeInfo:CubeInfo;
		/*private 左肩范围格子*/
		private static leftArammax:Vector3 = new Vector3( -999, -999,-999);
		private static leftArammin:Vector3 = new Vector3(999, 999,999);
		/*private 右肩范围格子*/
		private static rightArammax:Vector3 = new Vector3( -999, -999,-999);
		private static rightArammin:Vector3 = new Vector3(999, 999,999);
		/*private 左腿范围格子*/
		private static leftlegmax:Vector3 = new Vector3( -999, -999,-999);
		private static leftlegmin:Vector3 = new Vector3(999, 999,999);
		/*private 右腿范围格子*/
		private static rightlegmax:Vector3 = new Vector3( -999, -999,-999);
		private static rightlegmin:Vector3 = new Vector3(999, 999,999);
		
		
		private bkub:BlinnPhongMaterial;
		/**
		 * 这个类用来初始化骨骼
		 */
		 static __init__()
		{
			
			
			Sprite3D.load("Test/guge/stage.lh", Handler.create(null, function(sprite:Sprite3D):void {
				
			
				CubeCharacter.Test = sprite;
				CubeCharacter.findSkin(CubeCharacter.Test,CubeCharacter.skinMeshSprite,CubeCharacter.skinmesh);
				//skinMeshsprti = sprite.getChildByName("snowboy_Skin").getChildByName("snow") as SkinnedMeshSprite3D;
				//skinmesh = skinMeshsprti.meshFilter.sharedMesh as Mesh;
				//animator = sprite.getChildByName("snowboy_Skin").getComponent(Animator) as Animator;
				//animationclip();
				//avatar = Loader.getRes("Test/guge/Assets/card/model/snowboy_Skin-snowboy_Skin-snowboy_SkinAvatar.lav") as Avatar;
				
			}));
		}
		
		 static findSkin(sprite:Sprite3D):void
		{
			var length:number = sprite._children.length;
			for (var i:number = 0; i < length; i++) {
				var childsprite:Sprite3D = sprite.getChildAt(i);
				if (childsprite instanceof SkinnedMeshSprite3D)
				{
					CubeCharacter.skinMeshSprite = childsprite;
					CubeCharacter.skinmesh = ((<SkinnedMeshSprite3D>childsprite ))._meshFilter._sharedMesh;
					return;
				}
				else
				{
					CubeCharacter.findSkin(childsprite);
				}
			}
		}
		
		 static findAnimator(sprite:Sprite3D):Animator
		{
			var animat:Animator = (<Animator>sprite.getComponent(Animator) );
			if (animat)
			{
			
				return animat;
			}
			else
			{
				var length:number = sprite._children.length;
				if (length == 0)
				{
					return null;
				}
				else
				{
					for (var i:number = 0; i < length; i++) {
						animat = CubeCharacter.findAnimator(sprite.getChildAt(i));
						if (animat) return animat;
						
					}
					return null;
				}
				
			}
			
		}
		
		
		
		
		 static num:number = 0;
		 static creatbones(cubesprite3D:CubeSprite3D):void
		{
			
			//身体
			CubeCharacter.creatOneBounes(cubesprite3D, -6 * CubeCharacter.Large, 6 * CubeCharacter.Large-1, 5 * CubeCharacter.Large, 14 * CubeCharacter.Large-1, -5 * CubeCharacter.Large, 5 * CubeCharacter.Large-1, 1358);
			//右肩
			CubeCharacter.creatOneBounes(cubesprite3D, -13 * CubeCharacter.Large, -6 * CubeCharacter.Large-1, 10 * CubeCharacter.Large, 12 * CubeCharacter.Large-1, -1 * CubeCharacter.Large,  CubeCharacter.Large-1, 5885);
			//右手
			CubeCharacter.creatOneBounes(cubesprite3D, -15 * CubeCharacter.Large, -13 * CubeCharacter.Large-1, 10 * CubeCharacter.Large, 12 * CubeCharacter.Large-1, -1 * CubeCharacter.Large, CubeCharacter.Large-1, 16710335);
			//左肩
			CubeCharacter.creatOneBounes(cubesprite3D, 6 * CubeCharacter.Large, 13 * CubeCharacter.Large-1, 10 * CubeCharacter.Large, 12 * CubeCharacter.Large-1, -1 * CubeCharacter.Large,CubeCharacter.Large-1, 5885);
			//左手
			CubeCharacter.creatOneBounes(cubesprite3D, 13 * CubeCharacter.Large, 15* CubeCharacter.Large-1, 10* CubeCharacter.Large, 12 * CubeCharacter.Large-1, -1 * CubeCharacter.Large, 1 * CubeCharacter.Large-1, 16710335);
			//右腿
			CubeCharacter.creatOneBounes(cubesprite3D, -4 * CubeCharacter.Large, -1 * CubeCharacter.Large-1, 2 * CubeCharacter.Large, 5 * CubeCharacter.Large-1, -1 * CubeCharacter.Large, 2 * CubeCharacter.Large-1, 1265425);
			//左腿
			CubeCharacter.creatOneBounes(cubesprite3D, 1 * CubeCharacter.Large, 4 * CubeCharacter.Large-1, 2 * CubeCharacter.Large, 5 * CubeCharacter.Large-1, -1 * CubeCharacter.Large, 2 * CubeCharacter.Large-1,1265425);
			//脖子
			CubeCharacter.creatOneBounes(cubesprite3D, -5 * CubeCharacter.Large, 5 * CubeCharacter.Large-1, 14 * CubeCharacter.Large, 15 * CubeCharacter.Large-1, -4 * CubeCharacter.Large, 4 * CubeCharacter.Large-1, 51358);
			//头
			CubeCharacter.creatOneBounes(cubesprite3D, -7 * CubeCharacter.Large, 7 * CubeCharacter.Large-1, 15 * CubeCharacter.Large, 25 * CubeCharacter.Large-1, -6 * CubeCharacter.Large, 6 * CubeCharacter.Large-1, 51358);
			//右脚
			CubeCharacter.creatOneBounes(cubesprite3D,  -4 * CubeCharacter.Large, -1 * CubeCharacter.Large-1, 0, 2*CubeCharacter.Large-1,-1 * CubeCharacter.Large, 4 * CubeCharacter.Large-1, 51358);
			//左脚
			CubeCharacter.creatOneBounes(cubesprite3D, 1 * CubeCharacter.Large, 4 * CubeCharacter.Large-1, 0, 2 * CubeCharacter.Large-1, -1 * CubeCharacter.Large, 4 * CubeCharacter.Large-1, 51358);
			//console.log(num);
		}
		 static creatOneBounes(cubesprite3D:CubeSprite3D, xmin:number, xmax:number, ymin:number, ymax:number, zmin, zmax,color:number):void
		{
			for (var i:number = xmin; i <=xmax ; i++) {
				for (var j:number = ymin; j <= ymax ; j++) {
					for (var k:number = zmin; k <=zmax ; k++) {
						cubesprite3D.AddCube(i, j, k, color);
						CubeCharacter.num++;
					}
				}
			}
		}
		
		/**
		 * 这个类用来加载所有的骨骼文件
		 */
		 static animationclip():void
		{
		
		}
	
		/**
		 * @private
		 */
		constructor(/*scene:Scene3D,cubesprite3D:CubeSprite3D*/){
			
		}
		
		
		 static init(cubearray:CubeInfo[],sprite:Sprite3D):void
		{
			
			//var anis:Animator = sprite.getComponent(Animator) as Animator;
			//if (!anis)
			//{
				//
				//
				//anis = sprite.addComponent(Animator) as Animator;
				//animator._cloneTo(anis);
			//}
			//else
			//{
				//anis._cloneTo(anis);
			//}
			
			var youjian:CubeInfo[] = [];
			var zuojian:CubeInfo[] = [];
			var youtui:CubeInfo[] = [];
			var zuotui:CubeInfo[] = [];
			
			var leng:number = cubearray.length;
			for (var i:number = 0; i<leng; i++) 
			{
				//右肩
				if (cubearray[i].x-1600 ==-(6*CubeCharacter.Large+1)&&cubearray[i].y-1600<=(14*CubeCharacter.Large-1) &&cubearray[i].y-1600>=5*CubeCharacter.Large)
				{
					youjian.push(cubearray[i]);
				}
				//左肩
				else if (cubearray[i].x-1600 == 6*CubeCharacter.Large && cubearray[i].y-1600<=(14*CubeCharacter.Large-1) &&cubearray[i].y-1600>=5*CubeCharacter.Large)
				{
					zuojian.push(cubearray[i]);
				}
				//右腿
				else if (cubearray[i].y - 1600 == (5*CubeCharacter.Large-1) && cubearray[i].x-1600 <= 0)
				{
					youtui.push(cubearray[i]);
				}
				//左腿
				else if (cubearray[i].y - 1600 == (5*CubeCharacter.Large-1) && cubearray[i].x-1600 >= 0)
				{
					zuotui.push(cubearray[i]);
				}	
			}
			CubeCharacter.calarm(youjian,0);
			CubeCharacter.calarm(zuojian,1);
			CubeCharacter.calleg(youtui,0);
			CubeCharacter.calleg(zuotui,1);
			
			CubeCharacter.parseCubeInfos(sprite,cubearray, CubeCharacter.skinmesh._boneNames, CubeCharacter.skinmesh._inverseBindPoses);
			//_Character.addChild(cubeCharacter);
			//cubeCharacter.skinnedMeshRenderer.material  = bkub;
		}
		
		/**
		 * 此类用来创建绑定AnimationState
		 */
		//public function animatorStateCreat(animator:Animator):void
		//{
			//for (var i:int = 0; i < animatorName.length; i++) {
				//var animatorState:AnimatorState = new AnimatorState();
				//animatorState.name = animatorName[i];
				//animatorState.clip = aniClipArray[i];
				//animator.addState(animatorState, 0);
			//}
		//}
		
		//计算肩膀范围
		 static calarm(cubearray:CubeInfo[], index:number):void
		{
	
			var miny:number = 999;
			var maxy:number = -999;
			var minz:number = 999;
			var maxz:number = -999;
			for (var i:number = 0; i < cubearray.length; i++) {
				if (cubearray[i].y - 1600 > maxy)
				{
					maxy = cubearray[i].y - 1600;
				}
				if (cubearray[i].y - 1600 < miny)
				{
					miny = cubearray[i].y - 1600;
				}
				if (cubearray[i].z - 1600 > maxz)
				{
					maxz = cubearray[i].z - 1600;
				}
				if (cubearray[i].z - 1600 < minz)
				{
					minz = cubearray[i].z - 1600;
				}
			}
			switch(index)
			{
				case 0:
					
					CubeCharacter.rightArammax.y = maxy+1;
					CubeCharacter.rightArammax.z = maxz+1;
					CubeCharacter.rightArammin.y = miny;
					CubeCharacter.rightArammin.z = minz;
					break;
				case 1:
					CubeCharacter.leftArammax.y = maxy+1;
					CubeCharacter.leftArammax.z = maxz+1;
					CubeCharacter.leftArammin.y = miny;
					CubeCharacter.leftArammin.z = minz;
					break;
			}
			
		}
		//计算腿部范围
		 static calleg(cubearray:CubeInfo[],index:number):void
		{
			var minx:number = 999;
			var maxx:number = -999;
			var minz:number = 999;
			var maxz:number = -999;
			for (var i:number = 0; i < cubearray.length; i++) {
				if (cubearray[i].x - 1600 > maxx)
				{
					maxx = cubearray[i].x - 1600;
				}
				if (cubearray[i].x - 1600 < minx)
				{
					minx = cubearray[i].x - 1600;
				}
				if (cubearray[i].z - 1600 > maxz)
				{
					maxz = cubearray[i].z - 1600;
				}
				if (cubearray[i].z - 1600 < minz)
				{
					minz = cubearray[i].z - 1600;
				}
			}
			switch(index)
			{
				case 0:
					CubeCharacter.rightlegmax.x = maxx+1;
					CubeCharacter.rightlegmax.z = maxz+1;
					CubeCharacter.rightlegmin.x = minx;
					CubeCharacter.rightlegmin.z = minz;
					break;
				case 1:
					CubeCharacter.leftlegmax.x = maxx+1;
					CubeCharacter.leftlegmax.z = maxz+1;
					CubeCharacter.leftlegmin.x = minx;
					CubeCharacter.leftlegmin.z = minz;
					break;
			}
			
		}
		
		 static onecubesFace(cubeinfo:CubeInfo):number
		{
			var num:number = 0;
			 num += (cubeinfo.backVBIndex ==-1?0:1);
			 num += (cubeinfo.frontVBIndex ==-1?0:1);
			 num += (cubeinfo.leftVBIndex ==-1?0:1);
			 num += (cubeinfo.rightVBIndex ==-1?0:1);
			 num += (cubeinfo.topVBIndex ==-1?0:1);
			 num += (cubeinfo.downVBIndex ==-1?0:1);
			 return num;
		}
		
		/**
		 * @private cubeinfo数组解析
		 * @param 方块信息数组
		 */
		 static parseCubeInfos(sprite:Sprite3D,CubeinfoArray:CubeInfo[],boneNames:string[],InverseBindPoses:Matrix4x4[])
		{
			//if (_mesh)
				//_mesh.destroy();
			var _mesh:Mesh = new Mesh();
			var maxvertexNum:number = 0;
			CubeCharacter._vbindex = 0;
			var lent:number = CubeinfoArray.length;
			for (var l:number = 0; l < lent; l++) {
				maxvertexNum+=CubeCharacter.onecubesFace(CubeinfoArray[l]);
			}
			
			CubeCharacter._vbDatas = new Float32Array(maxvertexNum*4*18);
			
			debugger;
			//组织VB数据
			for (var i:number = 0; i < lent; i++) {
			
				CubeCharacter.parseCubeinfo(CubeinfoArray[i])
			}
			
	
			
			var vertexBuffer:VertexBuffer3D = new VertexBuffer3D(CubeCharacter._vbDatas.length * 4, WebGLContext.STATIC_DRAW, true);
			vertexBuffer.vertexDeclaration = CubeCharacter._vertexDeclaration;
			vertexBuffer.setData(CubeCharacter._vbDatas);
			_mesh._vertexBuffers.push(vertexBuffer);
			_mesh._vertexCount += vertexBuffer.vertexCount;
			//组织IB数据
		
			var maxfaceNums:number = maxvertexNum;
			
			var ibDatas:Uint16Array = new Uint16Array(maxfaceNums * 6);
			for (var j:number = 0; j <maxfaceNums ; j++) {
				var indexOffset:number = j * 6;
				var pointOffset:number = j * 4;
				ibDatas[indexOffset] = pointOffset;
				ibDatas[indexOffset + 1] = 2 + pointOffset;
				ibDatas[indexOffset + 2] = 1 + pointOffset;
				ibDatas[indexOffset + 3] = pointOffset;
				ibDatas[indexOffset + 4] = 3 + pointOffset;
				ibDatas[indexOffset + 5] = 2 + pointOffset;
			}
		
		
			//为啥要除以2
			var indexBuffer:IndexBuffer3D = new IndexBuffer3D(IndexBuffer3D.INDEXTYPE_USHORT, ibDatas.length, WebGLContext.STATIC_DRAW, true);
			indexBuffer.setData(ibDatas);
			_mesh._indexBuffer = indexBuffer;
			
			var bufferState:BufferState = _mesh._bufferState;
			bufferState.bind();
			bufferState.applyVertexBuffers(_mesh._vertexBuffers);
			bufferState.applyIndexBuffer(indexBuffer);
			bufferState.unBind();
			
			
			
			//接下来就该绑定骨骼数据了
			_mesh._boneNames = boneNames;
			_mesh._inverseBindPoses = InverseBindPoses;
			
			//SubMesh的绑定
			var submeshs:SubMesh[] = [];
			var submesh:SubMesh = new SubMesh(_mesh);
			submesh._indexBuffer = _mesh._indexBuffer;
			submesh._indexStart = 0;
			submesh._indexCount = ibDatas.length;
			submesh._indices = new Uint16Array(_mesh._indexBuffer.getData().buffer, 0, ibDatas.length);
			submesh._vertexBuffer = _mesh._vertexBuffers[0];
			
			//var bufferstate:BufferState = submesh._bufferState;
			//bufferstate.bind();
			//bufferstate.applyVertexBuffer(_mesh._vertexBuffers[0]);
			//bufferstate.applyIndexBuffer(_mesh._indexBuffer);
			//bufferstate.unBind();
			
			var subIndexBufferStart:number[] = submesh._subIndexBufferStart;
			var subIndexBufferCount:number[] = submesh._subIndexBufferCount;
			var boneIndicesList:Uint16Array[] = submesh._boneIndicesList;
			var drawCount:number = 1;
			boneIndicesList.length = drawCount;
			subIndexBufferStart.length = drawCount;
			subIndexBufferCount.length = drawCount;
			
			subIndexBufferStart[0] = 0;
			subIndexBufferCount[0] = ibDatas.length;
			
			var pathMarks:any[][] = _mesh._skinDataPathMarks;
			var bindPoseIndices:number[] = [];
			var subMeshIndex:number = 0;
			
			
			boneIndicesList[0] = new Uint16Array([0, 1, 2, 3, 4, 5, 6, 7, 8, 9,10]);
			var boneIndices:Uint16Array = boneIndicesList[0];
			for (var k:number = 0,m:number = boneIndices.length; k < m; k++) {
				var index:number = boneIndices[k];
				var combineIndex:number = bindPoseIndices.indexOf(index);
				if (combineIndex===-1){
					boneIndices[j]=bindPoseIndices.length;
					bindPoseIndices.push(index);
					pathMarks.push([subMeshIndex,0,k]);
					}else {
					boneIndices[j]=combineIndex;
				}
			}
			submeshs.push(submesh);
			_mesh._bindPoseIndices = new Uint16Array(boneIndices);
			_mesh._setSubMeshes(submeshs);
		
		
			CubeCharacter.findSkin(sprite);
			//var length:int = sprite._children.length;
			//for (var n:int = 0; n < length; n++) {
				//if (sprite.getChildAt(n) is SkinnedMeshSprite3D)
				//{
					//skinmesh = sprite.getChildAt(n);
				//
					//
					//break;
				//}
			//}
			//
			//if (!skinmesh)
			//{
				//skinmesh = new SkinnedMeshSprite3D(_mesh);
				//var mar:BlinnPhongMaterial = new BlinnPhongMaterial();
				//
				//mar.enableVertexColor = true;
				//skinmesh.skinnedMeshRenderer.material  = mar;
				//sprite.addChild(skinmesh);
			//}
	
			CubeCharacter.skinMeshSprite.meshFilter.sharedMesh = _mesh;
			console.log(_mesh._getPositions());
			var material:BlinnPhongMaterial = new BlinnPhongMaterial();
			console.log(material);
			CubeCharacter.skinMeshSprite.skinnedMeshRenderer.material.enableVertexColor = true;
			((<BlinnPhongMaterial>CubeCharacter.skinMeshSprite.skinnedMeshRenderer.material )).specularColor = new Vector4(1, 1, 1, 1);
			console.log(CubeCharacter.skinMeshSprite.skinnedMeshRenderer.material);
			
		
			return;
		}
		
		/**
		 * @private 解析一个方块信息的方法
		 * @param 方块
		 */
		 static parseCubeinfo(cubeInfo:CubeInfo):void
		{
				//var blendIndices:int = calBlendIndices(cubeInfo.cubeProperty);
				var _cubeInfo:CubeInfo = cubeInfo
				var subecubeGeometry:SubCubeGeometry =_cubeInfo.subCube;
				if (_cubeInfo.frontVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.frontVBIndex, subecubeGeometry/*, blendIndices*/);
				}
				if (_cubeInfo.backVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.backVBIndex, subecubeGeometry/*, blendIndices*/);
				}
				if (_cubeInfo.leftVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.leftVBIndex, subecubeGeometry/*, blendIndices*/);
				}
				if (_cubeInfo.rightVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.rightVBIndex, subecubeGeometry/*, blendIndices*/);
				}
				if (_cubeInfo.topVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.topVBIndex, subecubeGeometry/*, blendIndices*/);
				}
				if (_cubeInfo.downVBIndex !=-1)
				{
					CubeCharacter.pushOneFaceData(_cubeInfo.downVBIndex, subecubeGeometry/*, blendIndices*/);
				}
		}
		
		/**
		 * @private 根据方块特殊的属性来计算这个方块的骨骼位置
		 * @param 方块属性
		 */
		//public function calBlendIndices(index:int):int
		//{
			////需要改
			//return index;
		//}
		
		/**
		 * @private 将一个面的数据传入buffer
		 * @param 方块VB位置  顶点数据获得的地方   骨骼索引
		 */
		 static pushOneFaceData(vbindex:number,subecubeGeometry:SubCubeGeometry/*,blendIndices:int*/):void
		{

	
			var vertexArray:Float32Array =subecubeGeometry._vertices[vbindex >> 24];
			var offset:number = vbindex & 0x00ffffff;
			for (var i:number = 0; i < 4; i++) {
				var ss:number = i*10
				for (var j:number = 0; j < 10; j++) {
					if (j <= 2)
					{
						CubeCharacter._vbDatas[CubeCharacter._vbindex] = vertexArray[offset + ss + j]/CubeCharacter.Large;
					}
					else
					{
						CubeCharacter._vbDatas[CubeCharacter._vbindex] = vertexArray[offset + ss + j];
					}
					CubeCharacter._vbindex++;
				}
				var blendIndices:number = CubeCharacter.autoBondIndex(vertexArray[offset + ss + 0], vertexArray[offset + ss + 1],vertexArray[offset+ss+2]);
				//blendIndices = 8;
				CubeCharacter._vbDatas[CubeCharacter._vbindex] = 1;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+1] = 0;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+2] = 0;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+3] = 0;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+4] =blendIndices;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+5] = 0;
				CubeCharacter._vbDatas[CubeCharacter._vbindex+6] = 0;
				CubeCharacter._vbDatas[CubeCharacter._vbindex + 7] = 0;
				CubeCharacter._vbindex += 8;
			}
			
			//_vertexCount += 4;
		}
		
		
		 fenhe:boolean = false;
		
		 static autoBondIndex(x:number,y:number,z:number):number
		{
			this.fenhe = false;
			//head
			if (y > 14*CubeCharacter.Large+0.5)
			{
		
				return 0;
			}
			else
			{
				if (y > 5*CubeCharacter.Large-0.5)
				{
					//右手
					if (x <-13*CubeCharacter.Large-0.5)//-13.5
					{
						return 10;
					}
					else if (x <-6*CubeCharacter.Large-0.5)//-6.5
					{
				
						//右肩
						return 8;
					}
					else if (x < 6*CubeCharacter.Large+0.5)//6.5
					{
						if (x==-6*CubeCharacter.Large&&y <= CubeCharacter.rightArammax.y && z <= CubeCharacter.rightArammax.z && y >= CubeCharacter.rightArammin.y && z >= CubeCharacter.rightArammin.z)
						{
							
							return 8;
						}
						if (x == 6*CubeCharacter.Large && y <= CubeCharacter.leftArammax.y && z <= CubeCharacter.leftArammax.z && y >= CubeCharacter.leftArammin.y && z >= CubeCharacter.leftArammin.z)
						{
							
							return 2;
						}
						if (y == 5*CubeCharacter.Large && x <= CubeCharacter.rightlegmax.x && z <= CubeCharacter.rightlegmax.z && x >= CubeCharacter.rightlegmin.x && z >= CubeCharacter.rightlegmin.z)
						{
							
							return 4;
						}
						if (y == 5*CubeCharacter.Large && x <= CubeCharacter.leftlegmax.x && z <= CubeCharacter.leftlegmax.z && x >= CubeCharacter.leftlegmin.x && z >= CubeCharacter.leftlegmin.z)
						{
							
							return 6;
						}
						//身体
						return 1;
					}
					else if (x < 13*CubeCharacter.Large+0.5)
					{
						//左肩
						return 2;
					}
					else
					{
						//左手
						return 9;
					}
					
				}
				else if(y>2*CubeCharacter.Large+0.5)
				{
					//左腿
					if (x >= 0)
					{
						return 6;
					}
					else
					{
						//右腿
						return 4;
					}
				}
				else
				{
					if (x >= 0)
					{
						//左脚
						return 7;
					}
					else
					{
						//右脚
						return 5;
					}
				}
				
			}
		}
		
		
		
		
		
		
	}


