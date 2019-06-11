import { Config3D } from "./Config3D";
import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Matrix4x4 } from "./Matrix4x4";
import { subMesh } from "./subMesh";
import { BaseMaterial } from "./BaseMaterial";
import { CameraMoveScript } from "../common/CameraMoveScript"
	import { Camera } from "laya/d3/core/Camera"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { MeshFilter } from "laya/d3/core/MeshFilter"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { RenderState } from "laya/d3/core/material/RenderState"
	import { UnlitMaterial } from "laya/d3/core/material/UnlitMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexElement } from "laya/d3/graphics/VertexElement"
	import { BaseVector } from "laya/d3/math/BaseVector"
	import { Color } from "laya/d3/math/Color"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider"
	import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { PlaneMesh } from "laya/d3/resource/models/PlaneMesh"
	import { CubeInfo } from "laya/d3Extend/Cube/CubeInfo"
	import { CubeSprite3D } from "laya/d3Extend/Cube/CubeSprite3D"
	import { SubCubeGeometry } from "laya/d3Extend/Cube/SubCubeGeometry"
	import { CubeMeshFilter } from "laya/d3Extend/CubeMeshFilter"
	import { OBJLoader_Material } from "laya/d3Extend/vox/OBJLoader_Material"
	import { OBJLoader_mesh } from "laya/d3Extend/vox/OBJLoader_mesh"
	import { VoxData } from "laya/d3Extend/vox/VoxData"
	import { VoxFileData } from "laya/d3Extend/vox/VoxFileData"
	import { VoxelFmt2 } from "laya/d3Extend/vox/VoxelFmt2"
	import { lVoxFile } from "laya/d3Extend/vox/lVoxFile"
	import { VoxDataCompress } from "laya/d3Extend/vox/VoxDataCompress"
	import { CubeInfoArray } from "laya/d3Extend/worldMaker/CubeInfoArray"
	import { SimpleCameraScript } from "laya/d3Extend/worldMaker/SimpleCameraScript"
	import { VisualDebugSprite } from "laya/d3Extend/worldMaker/VisualDebugSprite"
	import { Sprite } from "laya/display/Sprite"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { Texture } from "laya/resource/Texture"
	import { Button } from "laya/ui/Button"
	import { TextInput } from "laya/ui/TextInput"
	import { Byte } from "laya/utils/Byte"
	import { Handler } from "laya/utils/Handler"
	import { Stat } from "laya/utils/Stat"
	import { VertexElementFormat } from "laya/d3/graphics/VertexElementFormat"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { Lh2Voxel } from "laya/d3Extend/worldMaker/Lh2Voxel"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Texture2D } from "laya/resource/Texture2D"
	
	
	export class SpriteMeshToVoxel
	{
		 scene:Scene3D;
		private model:Sprite3D;
		private input_sz:TextInput;
		private input_color:TextInput;
		private require:Function;
		private path:any;
		private fs:any;
		private __dirname:string;
		private cubeMeshSprite3D:CubeSprite3D;
		private cameraCtrl:SimpleCameraScript;
		private selFile:string; 
		//private var dbgsp:VisualDebugSprite;
		constructor(){
			var node:boolean = !!window.require;
			if (node) {
				this.require = require;
				this.fs = require('fs');;
				this.path=require('path');;
				this.__dirname=__dirname;;
			}			
			var config:Config3D = new Config3D();
			config.defaultPhysicsMemory = 64;
			Laya3D.init(0, 0,config);
			Laya.stage.scaleMode = Stage.SCALE_FULL;
			Laya.stage.screenMode = Stage.SCREEN_NONE;
			//Stat.show();
			
			this.scene = (<Scene3D>Laya.stage.addChild(new Scene3D()) );
			this.scene.ambientColor = new Vector3(1, 1, 1);
			
			var camera:Camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 5000)) );
			camera.transform.translate(new Vector3(0, 0.5, 1));
			camera.transform.rotate(new Vector3( -15, 0, 0), true, false);
			this.cameraCtrl = new SimpleCameraScript(0, 0.5, 1, 0, 0, 0);
			camera.addComponentIntance(this.cameraCtrl);
			SubCubeGeometry.__init__();
			CubeInfo.Cal24Object();			
			window.cam = camera;
			
			
			this.testCube();
			
			var bt:Button = new Button();
			bt.width = 100;
			bt.height = 50;
			Laya.stage.addChild(bt);
			bt.pos(100, 100);
			bt.label = '打开文件'
			bt.labelSize = 20;
			bt.skin = "comp/button.png";
			bt.on(Event.CLICK, this, this.openFile);

			var sz:TextInput  = this.input_sz = new TextInput();
			sz.width = 150;
			sz.skin = 'comp/textinput.png';
			sz.height = 45;
			sz.fontSize = 20;
			sz.pos(100, 160);
			sz.text = 3;
			Laya.stage.addChild(sz);

			var col:TextInput  = this.input_color = new TextInput();
			col.width = 150;
			col.skin = 'comp/textinput.png';
			col.height = 45;
			col.fontSize = 20;
			col.pos(100, 200);
			col.text = 256;
			Laya.stage.addChild(col);
			
			var bt:Button = new Button();
			bt.width = 100;
			bt.height = 50;
			Laya.stage.addChild(bt);
			bt.pos(100, 250);
			bt.label = '保存'
			bt.labelSize = 20;
			bt.skin = "comp/button.png";
			bt.on(Event.CLICK, this, this.saveVox);
		
			Laya.timer.loop(1, this, this.onLoop);
			//dbgsp = new VisualDebugSprite(camera);
			//Laya.stage.addChild(dbgsp);
			//__JS__("window.dbg = this.dbgsp;");
		}
		
		 openFile() {
			if (window.require){
				var dlg:any = this.require("electron");
				dlg.remote.dialog.showOpenDialog( { filters: [{name: 'all model file', extensions: ['obj','lvox','lh','vox'] }, 
					//{name: 'lvox2 file', extensions: ['lvox2'] }, 
					{name: 'All Files', extensions: ['*'] }], properties: ["openFile", 'createDirectory'] }, function(p) { 
						if (!p) return;
						this.scene.removeChild(this.cubeMeshSprite3D);
						this.cubeMeshSprite3D = (<CubeSprite3D>this.scene.addChild(new CubeSprite3D()) );
						if (p) {
							var f:string = p[0].replace(/\\/g, '/');
							this.selFile = f;
							switch( this.path.extname(f).toLowerCase()) {
								case '.obj': this.onOpenOBJ(f); break;
								case '.lh':this.onOpenLH(f); break;
								case '.lvox':this.onOpenLVox(f); break;
								case '.vox':this.Loadvox(f); break;
								//case '.lvox2':onOpenLVox2(f); break;
								default: alert('不支持'); break;
							}
						}
					} );
			}
		}
		
		 Loadvox( f:string):void {
			var cubeinfoar:CubeInfoArray;
			var voxfile:VoxFileData = new VoxFileData();
			voxfile.LoadVoxFile(f, 0, Handler.create(null, function(cubeinfoss:CubeInfoArray):void {
				debugger;
				this.cubeMeshSprite3D.AddCubeByArray(cubeinfoss);
			}));
		}		
		
		 onOpenLH(f:string):void {
			Sprite3D.load("file:///" + f, Handler.create(null, function(sprite:Sprite3D):void{
				if ( this.model) {
					this.scene.removeChild(this.model);
				}
				this.model = sprite;
				this.scene.addChild(sprite);
				//debugger;
				var arr:any[] = new Array();
				this.ParseSprite3D(sprite, arr);
				var vertex:any[] = [];
				var index:any[] = [];
				var vnum = 0;
				for ( var vi = 0; vi < arr.length; vi++) {
					vertex = vertex.concat( arr[vi].vertexData);
					var ib:Uint16Array = arr[vi].indexData;
					var tindex:any[] = [];	
					ib.forEach(function(v:number, i:number) { 
						tindex[i] = v + vnum;
					} );
					index = index.concat(tindex);
					vnum += arr[vi].vertexData.length;
				}
				
				this.toVoxel(vertex, index, f);
			}));
		}
		
		/**
		 * 转换obj文件。如果没有材质，就直接白色
		 * @param	f obj文件
		 */
		 convertObjFile(f:string,objmtl:OBJLoader_Material ):void {
			// 加载obj文件
			var objstr = this.fs.readFileSync(f, 'utf8');
			var objmesh:OBJLoader_mesh = new OBJLoader_mesh(objstr, null);
			// 所有的顶点，index，texture
			var vertnum:number = objmesh.vertices.length / 3;
			var uvnum:number = objmesh.textures.length / 2; 
			if (objmtl && uvnum>0 && vertnum != uvnum) console.error( 'pos vertext num!=uv vertex num');
			var mtls:Texture[] = [];
			var vertex:any[] = [];
			for (var vi = 0; vi < vertnum; vi++) {
				var tex:Texture2D = null;
				var mtlid:number = objmesh.vertexMaterialIndices[vi];
				var mtlname:string = objmesh.materialNames[mtlid];
				var mtl:OBJLoader_Material = objmtl && objmtl.materials[mtlname];
				if (mtl) {
					if ( mtl.mapDiffuse && mtl.mapDiffuse.filename){
						tex = Laya.loader.getRes('file:///'+mtl.mapDiffuse.filename);
					}
					else {
						tex = mtl.diffuse;
					}
				}
				vertex.push([objmesh.vertices[vi * 3], objmesh.vertices[vi * 3 + 1], objmesh.vertices[vi * 3 + 2],
					objmesh.textures[vi * 2], 1-objmesh.textures[vi * 2 + 1],
					tex]
				);
			}
			
			this.toVoxel(vertex, objmesh.indices,f);
		}
		
		 onOpenOBJ(f:string):void {
			// 加载mtl文件
			var mtlf:string = f.substring(0, f.length - 4) + '.mtl';
			if (!this.fs.existsSync(mtlf) ){
				//alert('没有材质文件，就是没有贴图，还是算了吧');
				this.convertObjFile(f, null);
				return;
			}
			
			var objmtl:OBJLoader_Material = new OBJLoader_Material('root');
			objmtl.parse( this.fs.readFileSync(mtlf, 'utf8'));
			// 加载所有的贴图
			var allimg:any[] = [];
			// 统计所有的贴图
			for( var mn  in objmtl.materials){
				var cm:OBJLoader_Material = objmtl.materials[mn];
				if (cm.mapDiffuse && cm.mapDiffuse.filename) {
					allimg.push({url:'file:///'+cm.mapDiffuse.filename});
				}
			}
			
			// 这些贴图一起加载
			if (allimg.length == 0) {
				this.convertObjFile(f, objmtl)
			}
			else Laya.loader.create(allimg, Handler.create(this, function() {
				this.convertObjFile(f, objmtl)
			}),null,null,[0,0,BaseTexture.FORMAT_R8G8B8A8,true,true])
		}
		
		 onOpenLVox(f:string):void {
			lVoxFile.LoadlVoxFile(f, Handler.create(null, function(cubeinfoss:CubeInfoArray) {
				this.cubeMeshSprite3D.AddCubes(cubeinfoss);
				this.cameraCtrl.setTarget( cubeinfoss.sizex / 2, cubeinfoss.sizey / 2, cubeinfoss.sizez / 2);
				}));
		}
		
		 toVoxel(verteices:any[], indices:any[], origFile:string):void {
			var lv:Lh2Voxel = new Lh2Voxel();
			lv.setModelData(verteices, indices, 1.0);
			var i:number = 0;
			var sz = parseInt(this.input_sz.text);
			//sz = sz < 10?100:sz;
			//var ret:Array = lv.renderToVoxel(sz, sz, sz, 0.1);
			console.time('tovox总时间');
			//var ret:Array = lv.renderToPalVoxel(sz, parseInt(input_color.text)).palcolor;
			var ret:any[] = lv.renderToVoxel(sz);
			console.timeEnd('tovox总时间');
			//DEBUG
			//output
			var node:boolean = !!window.require;
			if(node){
				var fs = require('fs');;
				var path=require('path');;
				fs.writeFileSync(__dirname+'/'+path.basename(origFile)+'.json',JSON.stringify(ret,null,'\t'));
			}
			//DEBUG
			
			// 显示
			//cubeMeshSprite3D.RemoveAllCube();
			//var cubeinfoArray:Vector.<CubeInfo> = new Vector.<CubeInfo>();
			console.time('add cube');
			for (i = 0; i < ret.length; i++) {
				var o:any = ret[i];
				this.cubeMeshSprite3D.AddCube(o.x, o.y, o.z, Lh2Voxel.colorToU16(o.color),0);
			}
			console.timeEnd('add cube');
			//cubeMeshSprite3D.UpColorData();
			
			// 保存
			/*
			var dt:Byte=lVoxFile.savelvoxfile(cubeMeshSprite3D);
			if (fs) {
				fs.writeFileSync(this.__dirname+'/'+this.path.basename(origFile)+'.lvox',new Uint8Array(dt.buffer));
			}
			*/
			
			var buf:Byte = lVoxFile.savelvox2file(this.cubeMeshSprite3D);
			this.fs.writeFileSync(this.__dirname+'/' + this.path.basename(this.selFile) + '.lvox', new Uint8Array(buf.__getBuffer()));
			
			/*
			// 保存新的格式
			var compress2:VoxelFmt2 =  new VoxelFmt2();
			// 先转成完整数组
			var sz2 = sz * sz;
			var arraydt:Uint8Array = new Uint8Array(sz * sz2);
			for (i = 0; i < ret.length; i++) {
				var o:Object = ret[i];
				arraydt[o.x+o.z*sz+o.y*sz2] = retObj.idx[i];
			}
			var compret:ArrayBuffer = compress2.encode(null, new Uint8Array(retObj.pal), arraydt, sz, sz, sz);
			fs.writeFileSync(this.__dirname+'/'+this.path.basename(origFile)+'.lvox',new Uint8Array(compret));
			*/
			this.cameraCtrl.dist = lv.gridZSize * 2;
			this.cameraCtrl.setTarget(lv.gridXSize / 2, lv.gridYSize / 2, lv.gridZSize / 2);
		}
		
		private _test(buf:any, num, samplenum) {
			var sum = 0;
			console.time("fill");
			for (var s:number = num; s >= 0; s--) {
				buf[s] = 1;
			}
			console.timeEnd('fill');
			
			var tm:any[] = new Array(100);
			for ( var t = 0; t < 100; t++) {
				var st = performance.now();
				for (var i = 0; i < samplenum; i++) {
					var p:number = (Math.random() * num) | 0;
					var sum = sum | buf[p];
					
				}
				tm[t] = (performance.now() - st)|0;
			}
			console.log('sum=', sum, 'tm=',tm);
			
		}
		
		private testPerf() {
			var num1 = 100 * 100 * 100;
			var samplenum = num1;
			var num2 = num1 * 8;
			var num3 = num2 * 8;
			var num1i32 = num1 / 4;
			var num = num3;
			var buf:any;
			console.log('buflen=', num);
			
			buf = new Array(num); 
			console.log('---Array');
			//_test(buf,num, samplenum);
			
			buf = new Uint8Array(num);
			console.log('--uint8');
			this._test(buf,num, samplenum);
			
			buf = { };
			console.log('---object');
			//_test(buf,num, samplenum);
			
		}
		
		private saveVox():void {
			this.testPerf();
			return;
			//DEBUG
			if (true) {
				// 同步
				var buf:Byte = lVoxFile.savelvox2file(this.cubeMeshSprite3D,false);
				this.fs.writeFileSync(this.__dirname+'/' + this.path.basename(this.selFile) + '.test.sync.lvox', new Uint8Array(buf.__getBuffer()));
			}else {
				// 异步
				var _this:any= this;
				var buf:Byte = lVoxFile.savelvox2file(this.cubeMeshSprite3D, false, function(buf:Byte) {
					this.fs.writeFileSync(_this.__dirname+'/' + _this.path.basename(_this.selFile) + '.test.async.lvox', new Uint8Array(buf.__getBuffer()));
				})
			}
			//DEBUG
			
		}
		
		private ParseSprite3D(sprite:Sprite3D, arr:any[]):void{
			if (sprite instanceof MeshSprite3D){
				arr.push(this.ParseMeshSprite3D(sprite));
			}
			var numChildren = sprite.numChildren;
			for (var i = 0; i < numChildren; i++){
				var mp:Sprite3D = (<Sprite3D>sprite.getChildAt(i) );
				this.ParseSprite3D(mp, arr);
			}
		}
		
		private ParseMeshSprite3D(meshsprite:MeshSprite3D):any[]{
			var data:any = {};
			var resultArray:any[] = new Array();
			data.vertexData = resultArray;
			//meshsprite.meshRenderer.sharedMaterials
			var altexture:BaseTexture =(meshsprite.meshRenderer && meshsprite.meshRenderer.sharedMaterial)?(meshsprite.meshRenderer.sharedMaterial).albedoTexture:null;
			
			var mf:MeshFilter = (<MeshFilter>meshsprite.meshFilter );
			var mh:Mesh = (<Mesh>mf.sharedMesh );
			
			
			var mypositions:Vector3[] = mh._getPositions();
			var uvs:Vector2[] = [];
			var colors:Color[] = [];
			var indices:Uint16Array = mh._indexBuffer.getData();
			data.indexData = indices;
			var transformWorldMatrix:Matrix4x4 = meshsprite.transform.worldMatrix;
			
			//得到所有的subMesh
			var subMeshes:subMesh[] = mh._subMeshes;
			//得到所有的材质
			var sharedMaterials:BaseMaterial[] =  meshsprite.meshRenderer.sharedMaterials;
			//得到所有的texture
			var subTextures:any[] = new Array();
			for (var m = 0; m < sharedMaterials.length; m++){
				subTextures.push(((<BlinnPhongMaterial>sharedMaterials[m] )).albedoTexture);
			}
			
			var i:number, j:number, vertexBuffer:VertexBuffer3D, uvElement:VertexElement, colorElement:VertexElement, vertexElements:any[], vertexElement:VertexElement, ofset:number, verticesData:Float32Array;
			var vertexBufferCount:number = mh._vertexBuffers.length;
			
			for (i = 0; i < vertexBufferCount; i++){
				vertexBuffer = mh._vertexBuffers[i];
				vertexElements = vertexBuffer.vertexDeclaration.vertexElements;
				for (j = 0; j < vertexElements.length; j++){
					vertexElement = vertexElements[j];
					if (vertexElement.elementFormat === VertexElementFormat.Vector2 && vertexElement.elementUsage === VertexMesh.MESH_TEXTURECOORDINATE0){
						uvElement = vertexElement;
						break;
					}
					else if (vertexElement.elementFormat === VertexElementFormat.Color && vertexElement.elementUsage === VertexMesh.MESH_COLOR0){
						colorElement = vertexElement;
						break;
					}
				}
				
				verticesData = vertexBuffer.getData();
				for (j = 0; j < verticesData.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4){
					ofset = j + uvElement.offset / 4;
					uvs.push(new Vector3(verticesData[ofset + 0], verticesData[ofset + 1]));
					this.colorofset = j + colorElement.offset / 4;
					colors.push(new Color(verticesData[this.colorofset + 0], verticesData[this.colorofset + 1], verticesData[this.colorofset + 2], verticesData[this.colorofset + 3]));
				}
				
			}
			
			var pointCount:number = mypositions.length;
			for (var k = 0; k < pointCount; k++){
				var resultVector:Vector3 = new Vector3();
				Vector3.transformV3ToV3(mypositions[k], transformWorldMatrix, resultVector);
				resultArray[k] = [resultVector.x, resultVector.y, resultVector.z, uvs[k].x, uvs[k].y, colors[k].r,colors[k].g,colors[k].b, colors[k].a, altexture];
			}
			
			for (var m = 0; m < subMeshes.length; m++) {
				var indexStart:number = subMeshes[m]._indexStart;
				var indexCount:number = subMeshes[m]._indexCount;
				for (var ii:number = 0; ii < indexCount; ii++) {
					resultArray[indices[ii + indexStart]][5] = subTextures[m];
				}
			}
			return data;
		}
		
		 test() {
			var vdc:VoxDataCompress = new VoxDataCompress();
			vdc.addDataU16(2, 10, 10, 0xffff);
			vdc.addDataU16(3, 10, 10, 0xfffe);
			vdc.addDataU16(4, 10, 10, 0xfffe);
			
			vdc.addDataU16(6, 10, 10, 0xfffe);

			vdc.addDataU16(11, 10, 10, 0xfffe);
			
			vdc.addDataU16(1, 10, 11, 0xfffe);
			vdc.addDataU16(8, 10, 11, 0xfffe);
			
			vdc.addDataU16(2, 11, 11, 0xfffe);
			var buf:Uint8Array = vdc.getDataBuffer();
			VoxDataCompress.decodeData(buf, function(x, y, z, dt) { 
				console.log('==', x, y, z, dt.toString(16));
			} );
			var buf1:Uint8Array = vdc.getDataBuffer();
		}
		
		 testCube():void{
			//test();
			//CubeMeshFilter.__int__();
			
			//方向光
			//var directionLight:DirectionLight = scene.addChild(new DirectionLight()) as DirectionLight;
			//directionLight.color = new Vector3(0.3, 0.3, 0.3);
			//directionLight.transform.worldMatrix.setForward(new Vector3(-1.0, -1.0, 1.0));
			//directionLight.transform. = new Vector3();
			//scene.ambientColor = new Vector3(1, 1, 1);
			
			this.cubeMeshSprite3D = (<CubeSprite3D>this.scene.addChild(new CubeSprite3D()) );
		}
	
		private GetSubMeshTextureIndex(subMeshes:subMesh[],index:number):number {
			for (var m = 0; m < subMeshes.length; m++) {
				var indexStart:number = subMeshes[m]._indexStart;
				var indexCount:number = subMeshes[m]._indexCount;
				if (index >= indexStart && index < ( indexStart + indexCount) ){
					return m;
				}
			}
		}
		
		 onLoop() {
			return;
			//dbgsp.clear();
		}
		
	}

