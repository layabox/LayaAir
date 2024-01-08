import { Camera } from "../../Camera";
import { Material } from "../../../../resource/Material";
import { BaseRender } from "../BaseRender";
import { RenderContext3D } from "../RenderContext3D";
import { RenderElement } from "../RenderElement";
import { Command } from "./Command";
import { CommandBuffer } from "./CommandBuffer";

export class DrawRenderCMD extends Command {
    /**@internal */
    private static _pool: any[] = [];

    /**
     * @internal
     */
    static create(render: BaseRender, material: Material, subShaderIndex: number, commandBuffer: CommandBuffer): DrawRenderCMD {
        var cmd: DrawRenderCMD;
        cmd = DrawRenderCMD._pool.length > 0 ? DrawRenderCMD._pool.pop() : new DrawRenderCMD();
        cmd._render = render;
        cmd.material = material;
        cmd._subShaderIndex = subShaderIndex;
        cmd._commandBuffer = commandBuffer;
        return cmd;
    }



    /**@internal */
    private _material: Material;
    /**@internal */
    private _render: BaseRender;
    /**@internal */
    private _subShaderIndex: number;


    constructor() {
        super();
    }

    /**
     * @internal
     */
    private _elementRender(renderElement: RenderElement, context: RenderContext3D): void {
        renderElement.renderSubShader = this._material._shader.getSubShaderAt(this._subShaderIndex);//TODO
        renderElement.material = this._material;
        //context.drawRenderElement(renderElement);
    }

    set material(value: Material) {
        this._material && this._material._removeReference(1);
        this._material = value;
        this._material && this._material._addReference(1);
    }

    /**
     * @inheritDoc
     * @override
     */
    run(): void {
        if (!this._material)
            throw "This render command material cannot be empty";
        this.setContext(this._commandBuffer._context);
        var context = this._context;
       // context._contextOBJ.applyContext(Camera._updateMark);
        var renderElements = this._render._renderElements;
        for (var i: number = 0, n = renderElements.length; i < n; i++) {
            var renderelement = renderElements[i];
            //change Material
            let mat = renderelement.material;
            this._elementRender(renderelement, context);
            //Recover Material
            renderelement.material = mat;
        }
    }


    /**
     * @inheritDoc
     * @override
     */
    recover(): void {
        DrawRenderCMD._pool.push(this);
        super.recover();
        this._material && this._material._removeReference(1);
        this._material = null;
    }

    destroy(): void {
        super.destroy();
        this._material && this._material._removeReference(1);
        this._material = null;
    }

}