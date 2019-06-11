import { Config3D } from "./Config3D";
import { Laya3D } from "Laya3D";
import { Laya } from "Laya";
import { Camera } from "laya/d3/core/Camera"
	import { MeshFilter } from "laya/d3/core/MeshFilter"
	import { MeshSprite3D } from "laya/d3/core/MeshSprite3D"
	import { Sprite3D } from "laya/d3/core/Sprite3D"
	import { DirectionLight } from "laya/d3/core/light/DirectionLight"
	import { BaseMaterial } from "laya/d3/core/material/BaseMaterial"
	import { BlinnPhongMaterial } from "laya/d3/core/material/BlinnPhongMaterial"
	import { Scene3D } from "laya/d3/core/scene/Scene3D"
	import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh"
	import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D"
	import { VertexElement } from "laya/d3/graphics/VertexElement"
	import { VertexElementFormat } from "laya/d3/graphics/VertexElementFormat"
	import { Matrix4x4 } from "laya/d3/math/Matrix4x4"
	import { Vector2 } from "laya/d3/math/Vector2"
	import { Vector3 } from "laya/d3/math/Vector3"
	import { Mesh } from "laya/d3/resource/models/Mesh"
	import { SubMesh } from "laya/d3/resource/models/SubMesh"
	import { Graphics } from "laya/display/Graphics"
	import { Sprite } from "laya/display/Sprite"
	import { Stage } from "laya/display/Stage"
	import { Event } from "laya/events/Event"
	import { BaseTexture } from "laya/resource/BaseTexture"
	import { Button } from "laya/ui/Button"
	import { TextInput } from "laya/ui/TextInput"
	import { Handler } from "laya/utils/Handler"
	import { Editor_3dController } from "../worldMaker/Editor_3dController"
	import { SimpleCameraScript } from "../worldMaker/SimpleCameraScript"
	import { SimpleShapeSprite3D } from "../worldMaker/SimpleShapeSprite3D"
	
	export class SimpleShapeEditorDemo{
		 scene:Scene3D;
		private model:Sprite3D;
		private input_sz:TextInput;
		private path:any;
		private fs:any;
		private __dirname:string;
		private camera:Camera;
		private mousePoint:Vector2 = new Vector2();
		private ed_ctrl_2DRender:Sprite;
		private ed_ctrl_Obj:Editor_3dController;
		
		
		constructor(){
			var node:boolean = !!window.require;
			if(node){
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
			this.scene.ambientColor = new Vector3(.1, .1, .1);
			
			this.camera = (<Camera>this.scene.addChild(new Camera(0, 0.1, 1000)) );
			this.camera.transform.translate(new Vector3(0, 0, 10));
			//camera.transform.rotate(new Vector3(-15, 0, 0), true, false);
			this.camera._addComponentInstance( new SimpleCameraScript(0, 0, 10, 0, 0, 0));
			//camera.addComponent(EditerCameraScript);
			/*
			   Sprite3D.load("file:///F:/work/LayaAir3DSamples/as/3d/bin/h5/res/threeDimen/staticModel/lizard/lizard.lh", Handler.create(null, function(sprite:Sprite3D):void{
				   scene.addChild(sprite);
				   debugger;
				   var arr:Array = new Array();
				   ParseSprite3D(sprite, arr);
				   var lv:Lh2Voxel = new Lh2Voxel();
				   lv.setModelData(arr[1].vertexData,arr[1].indexData,1.0);
				
				   var ret:Array = lv.renderToVoxel(110, 110, 110, 0.1);
				   debugger;
			   }));
			 */
			
			//方向光
			var directionLight:DirectionLight = (<DirectionLight>this.scene.addChild(new DirectionLight()) );
			directionLight.color = new Vector3(0.3, 0.3, 0.3);
			directionLight.transform.worldMatrix.setForward(new Vector3(-1.0, -1.0, 1.0));
			//directionLight.transform. = new Vector3();
			 
			this.ed_ctrl_Obj = new Editor_3dController(this.camera);
			//setTimeout(function() { ed_ctrl_Obj.selectObj(smp); }, 1000);
			
			var smp:SimpleShapeSprite3D =  new SimpleShapeSprite3D(null);
			this.scene.addChild(smp);
			this.ed_ctrl_Obj.objs.push(smp);
			/*
			var smp1:SimpleShapeSprite3D =  new SimpleShapeSprite3D(null);
			smp1.transform.rotationEuler = new Vector3(0, 40, 0);
			smp1.transform.position = new Vector3(1, 1, 1);
			smp1.transform.scale = new Vector3(3, 1, 2);
			scene.addChild(smp1);
			ed_ctrl_Obj.objs.push(smp1);
			*/
			
			Laya.timer.loop(1, this, this.onLoop);
			 
			var sz:TextInput  = this.input_sz = new TextInput();
			sz.width = 150;
			sz.skin = 'comp/textinput.png';
			sz.height = 45;
			sz.fontSize = 20;
			sz.pos(100, 160);
			sz.text = '100';
			Laya.stage.addChild(sz);
			
			var bt:Button = new Button();
			bt.width = 100;
			bt.height = 50;
			Laya.stage.addChild(bt);
			bt.pos(100, 100);
			bt.label = '打开文件'
			bt.labelSize = 20;
			bt.skin = "comp/button.png";
			bt.on(Event.CLICK, this, function(){
				if (window.require){
					var dlg:any = require("electron");
					dlg.remote.dialog.showOpenDialog({filters: [{name: 'lh file', extensions: ['lh']}, {name: 'All Files', extensions: ['*']}], properties: ["openFile", 'createDirectory']}, function(p){
						if (p){
							var f:string = p[0].replace(/\\/g, '/');
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
							}));
						}
					});
				}
			});
		
			this.ed_ctrl_2DRender = new Sprite();
			Laya.stage.addChild( this.ed_ctrl_2DRender);
			
			//var ctrlpoint:Editor_2DControlPoint =  new Editor_2DControlPoint();
			//Laya.stage.addChild(ctrlpoint);
			
			Laya.stage.on(Event.MOUSE_DOWN, this, this.onMouseDown);
			Laya.stage.on(Event.MOUSE_UP, this, this.onMouseUp);
			Laya.stage.on(Event.MOUSE_MOVE, this, this.onMouseMov);
			Laya.stage.on(Event.DOUBLE_CLICK, this, this.onDbClick);
			Laya.stage.on(Event.KEY_DOWN, this, this.onKeyDown);
			Laya.stage.on(Event.KEY_UP, this, this.onKeyUp);
		}
		
		private ParseSprite3D(sprite:Sprite3D, arr:any[]):void{
			if (sprite instanceof MeshSprite3D){
				arr.push(this.ParseMeshSprite3D((<MeshSprite3D>sprite )));
			}
			var numChildren = sprite.numChildren;
			for (var i = 0; i < numChildren; i++){
				var mp:Sprite3D = (<Sprite3D>sprite.getChildAt(i) );
				this.ParseSprite3D(mp, arr);
			}
		}
		
		private ParseMeshSprite3D(meshsprite:MeshSprite3D):any{
			var data:any = {};
			var resultArray:any[] = new Array();
			data.vertexData = resultArray;
			//meshsprite.meshRenderer.sharedMaterials
			var altexture:BaseTexture = ((<BlinnPhongMaterial>meshsprite.meshRenderer.sharedMaterial )).albedoTexture;
			var mf:MeshFilter = (<MeshFilter>meshsprite.meshFilter );
			var mh:Mesh = (<Mesh>mf.sharedMesh );
			
			
			var mypositions:Vector3[] = mh._getPositions();
			var uvs:Vector2[] = [];
			var indices:Uint16Array = mh._indexBuffer.getData();
			data.indexData = indices;
			var transformWorldMatrix:Matrix4x4 = meshsprite.transform.worldMatrix;
			
			//得到所有的subMesh
			var subMeshes:SubMesh[] = mh._subMeshes;
			//得到所有的材质
			var sharedMaterials:BaseMaterial[] =  meshsprite.meshRenderer.sharedMaterials;
			//得到所有的texture
			var subTextures:any[] = new Array();
			for (var m = 0; m < sharedMaterials.length; m++){
				subTextures.push(((<BlinnPhongMaterial>sharedMaterials[m] )).albedoTexture);
			}
			
			var i:number, j:number, vertexBuffer:VertexBuffer3D, uvElement:VertexElement, vertexElements:any[], vertexElement:VertexElement, ofset:number, verticesData:Float32Array;
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
				}
				
				verticesData = vertexBuffer.getData();
				for (j = 0; j < verticesData.length; j += vertexBuffer.vertexDeclaration.vertexStride / 4){
					ofset = j + uvElement.offset / 4;
					uvs.push(new Vector3(verticesData[ofset + 0], verticesData[ofset + 1]));
				}
				
			}
			
			var pointCount:number = mypositions.length;
			for (var k = 0; k < pointCount; k++){
				var resultVector:Vector3 = new Vector3();
				Vector3.transformV3ToV3(mypositions[k], transformWorldMatrix, resultVector);
				resultArray[k] = [resultVector.x, resultVector.y, resultVector.z, uvs[k].x, uvs[k].y, altexture];
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
		
		 onMouseMov(e:Event):void {
			this.ed_ctrl_Obj.onMouseMov(e);
			/*
			var ray:Ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 0));
			//private var _outHitResult:HitResult = new HitResult();
			mousePoint.elements[0] = e.stageX;
			mousePoint.elements[1] = e.stageY;
			camera.viewportPointToRay(mousePoint, ray);
			//owner.scene.physicsSimulation.rayCast(ray, _outHitResult);
			
			//var opos:Vector3 = new Vector3();
			//ed_ctrl_Obj.scrToXZ(e.stageX, e.stageY, opos);
			//console.log(opos.x, opos.y, opos.z);
			console.log("mousemov", e.stageX, e.stageX);
			*/
		}
		
		 onMouseDown(e:Event):void {
			//console.log("mousedown", e.stageX, e.stageX);
			this.ed_ctrl_Obj.onMouseDown(e);
		}
		 onMouseUp(e:Event):void {		
			//console.log("mouseup", e.stageX, e.stageX);
			this.ed_ctrl_Obj.onMouseUp(e);
		}
		
		 onDbClick(e:Event):void {
			//console.log("mousedbclick", e.stageX, e.stageX);
			this.ed_ctrl_Obj.onDbClick(e);
		}
		
		 onKeyDown(e:Event):void {
			this.ed_ctrl_Obj.onKeyDown(e);
		}
		 onKeyUp(e:Event):void {
			this.ed_ctrl_Obj.onKeyUp(e);
		}
		
		 onLoop() {
			this.ed_ctrl_Obj.onCameraChange();	//TODO 先强制每帧都更新2d点
			var g:Graphics = this.ed_ctrl_2DRender.graphics;
			this.ed_ctrl_Obj.renderVisualData(g);
		}
	}

