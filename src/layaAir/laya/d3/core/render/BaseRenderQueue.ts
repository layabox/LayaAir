import { LayaGL } from "../../../layagl/LayaGL";
import { IRenderTarget } from "../../../RenderEngine/RenderInterface/IRenderTarget";
import { IRenderQueue } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderQueue";
import { ISortPass } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/ISortPass";
import { ShaderData } from "../../../RenderEngine/RenderShader/ShaderData";
import { SingletonList } from "../../component/SingletonList";
import { Vector4 } from "../../math/Vector4";
import { Viewport } from "../../math/Viewport";
import { Camera } from "../Camera";
import { QuickSort } from "./quickSort";
import { RenderContext3D } from "./RenderContext3D";
import { RenderElement } from "./RenderElement";

export class BaseRenderQueue implements IRenderQueue {
    /** @interanl */
    _isTransparent: boolean = false;
    /** @internal */
    elements: SingletonList<RenderElement> = new SingletonList<RenderElement>();
    /**sort function*/
    _sortPass: ISortPass;
    /**render Target */
    _destTarget: IRenderTarget;
    /**viewPort */
    _viewPort: Viewport = new Viewport(0,0,0,0);
    /** */
    _scissor:Vector4 = new Vector4;
    /**invert y */
    _invertY: boolean;
    /**render pipeLine */
    _pipeLineMode: string;
    /**camera Shader Data */
    _cameraShaderData: ShaderData;
    /**Scene Shader Data */
    _sceneShaderData: ShaderData;
    /**camera Mark */
    _cameraUpdatreMark:number;
    /**scene ID */
    _sceneID:number;

    set sortPass(value: ISortPass) {
        this._sortPass = value;
        
    }

    set viewPort(value: Viewport) {
        this._viewPort = value;
    }

    get viewPort(): Viewport {
        return this._viewPort;
    }

    set invertY(value: boolean) {
        
        this._invertY = value;
    }

    get invertY(): boolean {
        return this._invertY;
    }

    set pipelineMode(value: string) {
        this._pipeLineMode = value;
    }

    get pipelineMode(): string {
        return this._pipeLineMode;
    }

    set cameraShaderData(value: ShaderData) {
        this._cameraShaderData = value;
    }

    get cameraShaderData(): ShaderData {
        return this._cameraShaderData;
    }

    set sceneShaderData(value: ShaderData) {
        this._sceneShaderData = value;
    }

    get sceneShaderData(): ShaderData {
        return this._sceneShaderData;
    }

    set destTarget(value:IRenderTarget){
        this._destTarget = value;
    }

    get destTarget():IRenderTarget{
        return this._destTarget;
    }

    set sceneID(value:number){
        this._sceneID = value;
    }

    get sceneID():number{
        return this._sceneID;
    }

    set cameraUpdateMark(value:number){
        this._cameraUpdatreMark = value;
    }

    get cameraUpdateMark():number{
        return this._cameraUpdatreMark;
    }

    constructor(isTransparent: boolean) {
        this._isTransparent = isTransparent;
        this.sortPass =new QuickSort();
    }

    changeViewport(x:number,y:number,w:number,h:number){
        this._viewPort.x = x;
        this._viewPort.y = y;
        this._viewPort.width = w;
        this._viewPort.height = h;
    }

    changeScissor(x:number,y:number,w:number,h:number){
        this._scissor.x = x;
        this._scissor.y = y;
        this._scissor.z = w;
        this._scissor.w = h;
    }


    addRenderElement(renderelement: RenderElement) {
        this.elements.add(renderelement);
    }

    clear(): void {
        this.elements.length = 0;
    }

    renderQueue(context:RenderContext3D) {
        this._preRender(context);
        this._destTarget._start();
        this.cameraUpdateMark = Camera._updateMark;
        LayaGL.renderEngine.viewport(this._viewPort.x,this._viewPort.y,this._viewPort.width,this._viewPort.height);
        LayaGL.renderEngine.scissor(this._scissor.x,this._scissor.y,this._scissor.z,this._scissor.w);
        var elements: RenderElement[] = this.elements.elements;
		for (var i: number = 0, n: number = this.elements.length; i < n; i++){
            elements[i]._renderUpdatePre(context);//Update Data
            
        }
			
		// for (var i: number = 0, n: number = this.elements.length; i < n; i++)
		// 	elements[i]._render(context);
        //更新所有大buffer数据
        for (var i: number = 0, n: number = this.elements.length; i < n; i++)
			elements[i]._render(this);//Update Data
        //UpdateRender All
        //UpdateGeometry All
        //RenderRenderElement All
    }

    private _preRender(context: RenderContext3D): void {
        this.invertY = context.invertY;
        this.pipelineMode = context.pipelineMode;
        this.sceneShaderData = context.scene._shaderValues;
        this.cameraShaderData = context.cameraShaderValue;
        this.pipelineMode = context.pipelineMode;
        //batchQueue TODO:
        this._batchQueue();
        //quick sort or material sort
        this._sort();
    }


    private _batchQueue() {
        //static batch
        //instance batch
    }

    private _sort() {
        var count: number = this.elements.length;
        this._sortPass.sort(this.elements, this._isTransparent, 0, count - 1);
    }






}