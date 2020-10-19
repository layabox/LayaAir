import { Command } from "./Command";
import { Material } from "../../material/Material";
import { BaseRender } from "../BaseRender";
import { CommandBuffer } from "./CommandBuffer";
import { RenderElement } from "../RenderElement";
import { Scene3D } from "../../scene/Scene3D";


/**
 * @internal
 * <code>SetShaderDataTextureCMD</code> 类用于创建设置渲染目标指令。
 */
export class DrawRenderCMD extends Command {
	/**@internal */
	private static _pool: any[] = [];

	/**
	 * @internal
	 */
	static create(render:BaseRender, material:Material, subShaderIndex:number,commandBuffer:CommandBuffer): DrawRenderCMD {
		var cmd: DrawRenderCMD;
		cmd = DrawRenderCMD._pool.length > 0 ? DrawRenderCMD._pool.pop():new DrawRenderCMD();
		cmd._render = render;
		cmd._material = material;
		cmd._subShaderIndex = subShaderIndex;
		cmd._commandBuffer = commandBuffer;
		return cmd;
	}

	/**@internal */
	private _material:Material;
	/**@internal */
	private _render:BaseRender;
	/**@internal */
	private _subShaderIndex:number;



	/**
	 * @inheritDoc
	 * @override
	 */
	run(): void {
		if(!this._material)
			throw "This render command material cannot be empty";
		this.setContext(this._commandBuffer._context);
		var context = this._context;
		var scene:Scene3D = context.scene;
		var renderElements:RenderElement[] = this._render._renderElements;
		for(var i:number = 0,n = renderElements.length;i<n;i++){
			var renderelement:RenderElement = renderElements[i];
			renderelement._update(scene,context,this._material._shader,null,this._subShaderIndex);
			renderelement._render(context);
		}
	}

	/**
	 * @inheritDoc
	 * @override
	 */
	recover(): void {
		DrawRenderCMD._pool.push(this);
	
	}

}


