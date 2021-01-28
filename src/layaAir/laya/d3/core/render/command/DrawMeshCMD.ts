import { Command } from "./Command";
import { Mesh } from "../../../resource/models/Mesh";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Material } from "../../material/Material";
import { SubShader } from "../../../shader/SubShader";
import { ShaderData } from "../../../shader/ShaderData";
import { DefineDatas } from "../../../shader/DefineDatas";
import { Sprite3D } from "../../Sprite3D";
import { SubMesh } from "../../../resource/models/SubMesh";
import { ShaderPass } from "../../../shader/ShaderPass";
import { ShaderInstance } from "../../../shader/ShaderInstance";
import { Scene3D } from "../../scene/Scene3D";
import { CommandBuffer } from "./CommandBuffer";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawMeshCMD extends Command {
	/**@internal */
	private static _pool: DrawMeshCMD[] = [];
	/**@internal */
	private static _compileDefine:DefineDatas = new DefineDatas();
	/**
	 * @internal
	 */
	static create(mesh:Mesh,matrix:Matrix4x4,material:Material,subMeshIndex:number,subShaderIndex:number,commandBuffer:CommandBuffer):DrawMeshCMD {
		var cmd: DrawMeshCMD;
		cmd = DrawMeshCMD._pool.length > 0 ? DrawMeshCMD._pool.pop():new DrawMeshCMD();
		cmd._mesh = mesh;
		cmd._matrix = matrix;
		cmd._material = material;
		cmd._subMeshIndex = subMeshIndex;
		cmd._subShaderIndex = subShaderIndex;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}


	/**@internal */
	private _material:Material;
	/**@internal */
	private _matrix:Matrix4x4;
	/**@internal */
	private _subMeshIndex:number;
	/**@internal */
	private _subShaderIndex:number;
	/**@internal */
	private _mesh:Mesh;
	
	/**@internal */
	private _projectionViewWorldMatrix:Matrix4x4 = new Matrix4x4();
	/**@internal */
	private _renderShaderValue:ShaderData = new ShaderData();


	
	/**
	 * 
	 */
	constructor(){
		super();
		this._renderShaderValue = new ShaderData(null);
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		var renderSubShader:SubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);
		this.setContext(this._commandBuffer._context);
		var context = this._context;
		var forceInvertFace: boolean = context.invertY;
		var scene:Scene3D = context.scene;
		var cameraShaderValue: ShaderData = context.cameraShaderValue;
		var projectionView: Matrix4x4 = context.projectionViewMatrix;
		Matrix4x4.multiply(projectionView,this._matrix,this._projectionViewWorldMatrix);
		this._renderShaderValue.setMatrix4x4(Sprite3D.WORLDMATRIX,this._matrix);
		this._renderShaderValue.setMatrix4x4(Sprite3D.MVPMATRIX,this._projectionViewWorldMatrix);
		var currentPipelineMode: string = context.pipelineMode;

		var passes:ShaderPass[] = renderSubShader._passes;
		for (var j: number = 0, m: number = passes.length; j < m; j++) {
			var pass:ShaderPass = passes[j];
			if (pass._pipelineMode !== currentPipelineMode)
				continue;
			var comDef:DefineDatas = DrawMeshCMD._compileDefine;
			scene._shaderValues._defineDatas.cloneTo(comDef);
			comDef.addDefineDatas(this._renderShaderValue._defineDatas);
			comDef.addDefineDatas(this._material._shaderValues._defineDatas);
			var shaderIns: ShaderInstance = context.shader = pass.withCompile(comDef);
			shaderIns.bind();
			//scene
			shaderIns.uploadUniforms(shaderIns._sceneUniformParamsMap, scene._shaderValues,true);
			//sprite
			shaderIns.uploadUniforms(shaderIns._spriteUniformParamsMap, this._renderShaderValue,true);
			//camera
			shaderIns.uploadUniforms(shaderIns._cameraUniformParamsMap, cameraShaderValue, true);
			//material
			var matValues: ShaderData = this._material._shaderValues;
			shaderIns.uploadUniforms(shaderIns._materialUniformParamsMap,matValues,true);
			shaderIns.uploadRenderStateBlendDepth(matValues);
			shaderIns.uploadRenderStateFrontFace(matValues, forceInvertFace, this._matrix.getInvertFront());
		}
		//drawElement
		var subGeometryElement:SubMesh[] = this._mesh._subMeshes;
		var subMeshRender:SubMesh;
		if(this._subMeshIndex == -1){
			for(var i:number = 0,n = subGeometryElement.length;i<n;i++){
				subMeshRender = subGeometryElement[i];
				if(subMeshRender._prepareRender(context)){
					subMeshRender._render(context);
				}
			}
		}
		else{
			var subGeometryElement:SubMesh[] = this._mesh._subMeshes;
			subMeshRender = subGeometryElement[this._subMeshIndex];
			if(subMeshRender._prepareRender(context)){
				subMeshRender._render(context);
			}
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawMeshCMD._pool.push(this);
		this._renderShaderValue.clearDefine();
		this._renderShaderValue._initData();
	}

}


