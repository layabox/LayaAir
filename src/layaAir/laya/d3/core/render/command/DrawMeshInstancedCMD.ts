import { Command } from "./Command";
import { Mesh } from "../../../resource/models/Mesh";
import { Matrix4x4 } from "../../../math/Matrix4x4";
import { Material } from "../../material/Material";
import { ShaderData } from "../../../shader/ShaderData";
import { DefineDatas } from "../../../shader/DefineDatas";
import { CommandBuffer } from "./CommandBuffer";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawMeshInstancedCMD extends Command {
	/**@internal */
	private static _pool: DrawMeshInstancedCMD[] = [];
	/**@internal */
	private static _compileDefine:DefineDatas = new DefineDatas();
	/**
	 * @internal
	 */
	static create(mesh:Mesh,subMeshIndex:number,matrixs:Matrix4x4[],material:Material,subShaderIndex:number,instanceProperty:any,commandBuffer:CommandBuffer):DrawMeshInstancedCMD {
		var cmd: DrawMeshInstancedCMD;
		cmd = DrawMeshInstancedCMD._pool.length > 0 ? DrawMeshInstancedCMD._pool.pop():new DrawMeshInstancedCMD();
		// cmd._mesh = mesh;
		// cmd._matrix = matrix;
		// cmd._material = material;
		// cmd._subMeshIndex = subMeshIndex;
		// cmd._subShaderIndex = _subShaderIndex;
		// cmd._commandBuffer = commandBuffer;
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
	//test
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
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawMeshInstancedCMD._pool.push(this);
		this._renderShaderValue.clearDefine();
		this._renderShaderValue._initData();
	}

}


