import { Event } from "../../events/Event";
import { SkinnedMeshRenderer } from "./SkinnedMeshRenderer";
import { RenderContext3D } from "./render/RenderContext3D";
import { Transform3D } from "./Transform3D";
import { SubMeshRenderElement } from "./render/SubMeshRenderElement";
import { Sprite3D } from "./Sprite3D";
import { RenderElement } from "./render/RenderElement";
import { Animator } from "../component/Animator";
import { SkinnedMeshSprite3DShaderDeclaration } from "./SkinnedMeshSprite3DShaderDeclaration";
import { RenderableSprite3D } from "./RenderableSprite3D";
import { Matrix4x4 } from "../math/Matrix4x4";
import { Mesh } from "../resource/models/Mesh";
import { Texture2D } from "../../resource/Texture2D";
import { Vector4 } from "../math/Vector4";
import { Vector2 } from "../math/Vector2";
import { SubMeshInstanceBatch } from "../graphics/SubMeshInstanceBatch";
import { SingletonList } from "../component/SingletonList";
import { VertexBuffer3D } from "../graphics/VertexBuffer3D";
import { MeshSprite3DShaderDeclaration } from "./MeshSprite3DShaderDeclaration";
import { Utils3D } from "../utils/Utils3D";

export class SimpleSkinnedMeshRenderer extends SkinnedMeshRenderer{
    /**@internal 解决循环引用 */
    static SIMPLE_SIMPLEANIMATORTEXTURE:number;
    /**@internal 解决循环引用*/
    static SIMPLE_SIMPLEANIMATORPARAMS:number;
    /**@internal 解决循环引用*/
    static SIMPLE_SIMPLEANIMATORTEXTURESIZE:number;
    
    /**@internal */
    private _simpleAnimatorTexture:Texture2D;
    /**@internal */
    private _simpleAnimatorParams:Vector4;
    /**@internal */
    private _simpleAnimatorTextureSize:number;
    /**@internal  x simpleAnimation offset,y simpleFrameOffset*/
    private _simpleAnimatorOffset:Vector2;
    /**@internal */
    _bonesNums:number;
    
    /**
     * @internal
	 * 设置动画帧贴图
	 */
    get simpleAnimatorTexture():Texture2D{
        return this._simpleAnimatorTexture;
    }

    /**
     * @internal
     */
    set simpleAnimatorTexture(value:Texture2D){
        this._simpleAnimatorTexture = value;
        this._simpleAnimatorTextureSize = value.width;
        this._shaderValues.setTexture(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURE,value);
        value._addReference();
        this._shaderValues.setNumber(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORTEXTURESIZE,this._simpleAnimatorTextureSize);
    }

    /**
     * @internal
     * 设置动画帧数参数
     */
    get simpleAnimatorOffset():Vector2{
        return this._simpleAnimatorOffset;
    }
    
    /**
     * @internal
     */
    set simpleAnimatorOffset(value:Vector2){
        value.cloneTo(this._simpleAnimatorOffset);
    }

    
    /**
	 * 创建一个 <code>SkinnedMeshRender</code> 实例。
	 */
	constructor(owner: RenderableSprite3D) {
        super(owner);
        this._simpleAnimatorParams = new Vector4();
        this._simpleAnimatorOffset = new Vector2();
        //TODO:
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_SIMPLEBONE);
        this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_BONE);
    }

    /**
	 * @internal
	 */
	private _computeAnimatorParamsData(): void {
        if(this._cacheMesh){
            this._simpleAnimatorParams.x = this._simpleAnimatorOffset.x;
            this._simpleAnimatorParams.y =Math.round(this._simpleAnimatorOffset.y)*this._bonesNums*4;
        }
    }

    /**
	 *@inheritDoc
	 *@override
	 *@internal
	 */
	_createRenderElement(): SubMeshRenderElement {
		return new SubMeshRenderElement();
    }
    /**
	 * @internal
	 */
	_setCacheAnimator(animator: Animator): void {
		this._cacheAnimator = animator;
		this._shaderValues.addDefine(SkinnedMeshSprite3DShaderDeclaration.SHADERDEFINE_SIMPLEBONE);
    }
    
    /**
	*@inheritDoc
	*@override
	*@internal
	*/
	_onMeshChange(value: Mesh): void {
        super._onMeshChange(value);
        this._cacheMesh = (<Mesh>value);
        //TODO:
    }
    /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdate(context: RenderContext3D, transform: Transform3D): void {
        var element: SubMeshRenderElement = <SubMeshRenderElement>context.renderElement;
        switch (element.renderType) {
            case RenderElement.RENDERTYPE_NORMAL:
                if(this._cacheAnimator){
                    var worldMat:Matrix4x4 = (this._cacheAnimator.owner as Sprite3D).transform.worldMatrix;
                    this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, worldMat);
                }else{
                    this._shaderValues.setMatrix4x4(Sprite3D.WORLDMATRIX, transform.worldMatrix);
                }
                this._computeAnimatorParamsData();
                this._shaderValues.setVector(SimpleSkinnedMeshRenderer.SIMPLE_SIMPLEANIMATORPARAMS,this._simpleAnimatorParams);
                break;
            case RenderElement.RENDERTYPE_INSTANCEBATCH:
                var worldMatrixData: Float32Array = SubMeshInstanceBatch.instance.instanceWorldMatrixData;
				var insBatches: SingletonList<SubMeshRenderElement> = element.instanceBatchElementList;
				var elements: SubMeshRenderElement[] = insBatches.elements;
                var count: number = insBatches.length;
                if(this._cacheAnimator){
                    for (var i: number = 0; i < count; i++){
                        var mat:Matrix4x4 = (((elements[i].render) as SimpleSkinnedMeshRenderer)._cacheAnimator.owner as Sprite3D)._transform.worldMatrix;
                        worldMatrixData.set(mat.elements, i * 16);
                    }
                }
                else{
                    for (var i: number = 0; i < count; i++)
                        worldMatrixData.set(elements[i]._transform.worldMatrix.elements, i * 16);
                }
				var worldBuffer: VertexBuffer3D = SubMeshInstanceBatch.instance.instanceWorldMatrixBuffer;
				worldBuffer.orphanStorage();// prphan the memory block to avoid sync problem.can improve performance in HUAWEI P10.   TODO:"WebGL's bufferData(target, size, usage) call is guaranteed to initialize the buffer to 0"
				worldBuffer.setData(worldMatrixData.buffer, 0, 0, count * 16 * 4);
                this._shaderValues.addDefine(MeshSprite3DShaderDeclaration.SHADERDEFINE_GPU_INSTANCE);
                //TODO:new Instance
               
                var simpleAnimatorData:Float32Array = SubMeshInstanceBatch.instance.instanceSimpleAnimatorData;
                if(this._cacheAnimator){
                    for (var i: number = 0; i < count; i++){
                        var render:SimpleSkinnedMeshRenderer = (elements[i].render) as SimpleSkinnedMeshRenderer;
                        render._computeAnimatorParamsData();
                        var simpleAnimatorParams:Vector4 = render._simpleAnimatorParams;
                        var offset:number = i*4;
                        simpleAnimatorData[offset] = simpleAnimatorParams.x;
                        simpleAnimatorData[offset+1] = simpleAnimatorParams.y;
                    }
                }
                else{
                    for (var i: number = 0; i < count; i++){
                        simpleAnimatorData[offset] =0;
                        simpleAnimatorData[offset+1] = 0;
                    }
                }
                var simpleAnimatorBuffer:VertexBuffer3D = SubMeshInstanceBatch.instance.instanceSimpleAnimatorBuffer;
                simpleAnimatorBuffer.orphanStorage();
                simpleAnimatorBuffer.setData(simpleAnimatorData.buffer, 0, 0, count * 4 * 4);
                break;
        }
    }
    /**
	 * @inheritDoc
	 * @override
	 * @internal
	 */
	_renderUpdateWithCamera(context: RenderContext3D, transform: Transform3D): void {
        var projectionView: Matrix4x4 = context.projectionViewMatrix;
        if (projectionView) {
            var element: SubMeshRenderElement = (<SubMeshRenderElement>context.renderElement);
            switch (element.renderType) {
                case RenderElement.RENDERTYPE_NORMAL:
                    if(this._cacheAnimator){
                        var mat:Matrix4x4 = (this._cacheAnimator.owner as Sprite3D)._transform.worldMatrix;
                        Matrix4x4.multiply(projectionView, mat, this._projectionViewWorldMatrix);
                        this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
                    }else{
                        Matrix4x4.multiply(projectionView, transform.worldMatrix, this._projectionViewWorldMatrix);
			            this._shaderValues.setMatrix4x4(Sprite3D.MVPMATRIX, this._projectionViewWorldMatrix);
                    }
                    break;
            }
        }
    }

    /**
     * 删除节点
     */
    _destroy():void{
        if (this._cacheRootBone)
        (!this._cacheRootBone.destroyed) && (this._cacheRootBone.transform.off(Event.TRANSFORM_CHANGED, this, this._onWorldMatNeedChange));
        (this._simpleAnimatorTexture)&&this._simpleAnimatorTexture._removeReference();
        this._simpleAnimatorTexture = null;
       
        
    }

}