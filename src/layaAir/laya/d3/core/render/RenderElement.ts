// import { BaseRender } from "./BaseRender"
// import { RenderContext3D } from "./RenderContext3D"
// import { Camera } from "../Camera"
// import { GeometryElement } from "../GeometryElement"
// import { Transform3D } from "../Transform3D"
// import { Material } from "../../../resource/Material"
// import { IRenderElement } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderElement"
// import { Shader3D } from "../../../RenderEngine/RenderShader/Shader3D"
// import { DefineDatas } from "../../../RenderEngine/RenderShader/DefineDatas"
// import { IRenderContext3D } from "../../../RenderEngine/RenderInterface/RenderPipelineInterface/IRenderContext3D"
// import { ILaya3D } from "../../../../ILaya3D"
// import { ShaderInstance } from "../../../RenderEngine/RenderShader/ShaderInstance"
// import { ShaderPass } from "../../../RenderEngine/RenderShader/ShaderPass"
// import { SubShader } from "../../../RenderEngine/RenderShader/SubShader"
// import { Laya3DRender } from "../../RenderObjs/Laya3DRender"

// /**
//  * <code>RenderElement</code> 类用于实现渲染元素。
//  */
// export class RenderElement {
//     /** @internal */
//     static RENDERTYPE_NORMAL: number = 0;
//     /** @internal */
//     static RENDERTYPE_STATICBATCH: number = 1;
//     /** @internal */
//     static RENDERTYPE_INSTANCEBATCH: number = 2;
//     /** @internal */
//     static RENDERTYPE_VERTEXBATCH: number = 3;

//     /** @internal */
//     static _compileDefine: DefineDatas = new DefineDatas();

//     /**
//      * 可提交底层的渲染节点
//      */
//     _renderElementOBJ: IRenderElement;
//     /** @internal */
//     _geometry: GeometryElement;
//     /**@internal */
//     _canBatch: boolean = false;
//     /** @internal */
//     _material: Material;//可能为空
//     /** @internal */
//     _baseRender: BaseRender;
//     /**@internal */
//     _subShader: SubShader;
//     /**@internal */
//     _subShaderIndex: number = 0;
//     _batchElement: RenderElement;
//     _transform: Transform3D;

//     /** @internal */
//     set transform(value: Transform3D) {
//         this._transform = value;
//         this._renderElementOBJ._transform = value;
//     }

//     /**@internal */
//     get transform(): Transform3D {
//         return this._renderElementOBJ._transform;
//     }

//     /**
//      * set RenderElement Material/Shaderdata
//      */
//     set material(value: Material) {
//         // todo debug 临时
//         if (value) {
//             this._material = value;
//             this._renderElementOBJ._materialShaderData = value.shaderData;
//         }
//     }

//     /**@internal */
//     get material(): Material {
//         return this._material;
//     }

//     /**
//      * 设置 SubShader
//      */
//     set renderSubShader(value: SubShader) {
//         this._subShader = value;
//     }

//     get renderSubShader(): SubShader {
//         return this._subShader;
//     }

//     set subShaderIndex(value: number) {
//         this._subShaderIndex = value;
//     }

//     get subShaderIndex() {
//         return this._subShaderIndex;
//     }
//     /**@internal */
//     set render(value: BaseRender) {
//         this._baseRender = value;
//         this._renderElementOBJ._renderShaderData = value._shaderValues;
//     }

//     get render(): BaseRender {
//         return this._baseRender;
//     }



//     /** @internal */
//     staticBatch: GeometryElement;
//     /** @internal */
//     renderType: number = RenderElement.RENDERTYPE_NORMAL;
//     /**
//      * 创建一个 <code>RenderElement</code> 实例。
//      */
//     constructor() {
//         this._createRenderElementOBJ();
//     }

//     protected _createRenderElementOBJ() {
//         this._renderElementOBJ = Laya3DRender.renderOBJCreate.createRenderElement();
//     }

//     /**
//      * @internal
//      */
//     getInvertFront(): boolean {
//         return this.transform ? this.transform._isFrontFaceInvert : false;
//     }

//     /**
//      * 设置位置
//      */
//     setTransform(transform: Transform3D): void {
//         this.transform = transform;
//     }

//     /**
//      * 设置渲染几何信息
//      */
//     setGeometry(geometry: GeometryElement): void {
//         this._geometry = geometry;
//         this._renderElementOBJ._geometry = geometry._geometryElementOBj;
//     }

//     /**
//      * 编译shader
//      * @param context 
//      */
//     compileShader(context: IRenderContext3D) {
//         var passes: ShaderPass[] = this._subShader._passes;
//         this._renderElementOBJ._clearShaderInstance();
//         for (var j: number = 0, m: number = passes.length; j < m; j++) {
//             var pass: ShaderPass = passes[j];
//             //NOTE:this will cause maybe a shader not render but do prepare before，but the developer can avoide this manual,for example shaderCaster=false.
//             if (pass._pipelineMode !== context.pipelineMode)
//                 continue;

//             var comDef: DefineDatas = RenderElement._compileDefine;

//             // context.configShaderData._defineDatas.cloneTo(comDef);

//             if (context.sceneShaderData) {
//                 context.sceneShaderData._defineDatas.cloneTo(comDef);
//             } else {
//                 Shader3D._configDefineValues.cloneTo(comDef);
//             }

//             comDef.addDefineDatas(context.configShaderData._defineDatas);

//             context.cameraShaderData && comDef.addDefineDatas(context.cameraShaderData._defineDatas);
//             if (this.render) {
//                 comDef.addDefineDatas(this.render._shaderValues._defineDatas);
//                 pass.nodeCommonMap = this.render._commonUniformMap;
//             } else {
//                 pass.nodeCommonMap = null;
//             }

//             comDef.addDefineDatas(this._renderElementOBJ._materialShaderData._defineDatas);
//             var shaderIns: ShaderInstance = pass.withCompile(comDef);
//             this._renderElementOBJ._addShaderInstance(shaderIns);
//         }
//     }

//     /**
//      * 切换Shader
//      * @param customShader 
//      * @param replacementTag 
//      * @param subshaderIndex 
//      * @returns 
//      */
//     _convertSubShader(customShader: Shader3D, replacementTag: string, subshaderIndex: number = 0) {
//         var subShader: SubShader = this.material._shader.getSubShaderAt(this._subShaderIndex);//TODO:
//         this.renderSubShader = null;
//         if (customShader) {
//             if (replacementTag) {
//                 var oriTag: string = subShader.getFlag(replacementTag);
//                 if (oriTag) {
//                     var customSubShaders: SubShader[] = customShader._subShaders;
//                     for (var k: number = 0, p: number = customSubShaders.length; k < p; k++) {
//                         var customSubShader: SubShader = customSubShaders[k];
//                         if (oriTag === customSubShader.getFlag(replacementTag)) {
//                             this.renderSubShader = customSubShader;
//                             break;
//                         }
//                     }
//                     if (!this.renderSubShader)
//                         return;
//                 } else {
//                     return;
//                 }
//             } else {
//                 this.renderSubShader = customShader.getSubShaderAt(subshaderIndex);//TODO:
//             }
//         } else {
//             this.renderSubShader = subShader;
//         }
//     }

//     /**
//      * @internal
//      */
//     _update(scene: any, context: RenderContext3D, customShader: Shader3D, replacementTag: string, subshaderIndex: number = 0): void {
//         if (this.material) {//材质可能为空
//             this._convertSubShader(customShader, replacementTag, subshaderIndex);
//             if (!this.renderSubShader)
//                 return;
//             var renderQueue = scene._getRenderQueue(this.material.renderQueue);
//             if (renderQueue._isTransparent)
//                 renderQueue.addRenderElement(this);
//             else
//                 renderQueue.addRenderElement(this);
//         }
//     }

//     /**
//      * pre update data
//      * @param context 
//      */
//     _renderUpdatePre(context: RenderContext3D) {
//         var sceneMark: number = ILaya3D.Scene3D._updateMark;
//         var transform: Transform3D = this.transform;
//         context.renderElement = this;
//         //model local
//         var modelDataRender: boolean = (!!this._baseRender) ? (sceneMark !== this._baseRender._sceneUpdateMark || this.renderType !== this._baseRender._updateRenderType) : false;
//         if (modelDataRender) {
//             this._baseRender._renderUpdate(context, transform);
//             this._baseRender._sceneUpdateMark = sceneMark;
//         }
//         //camera
//         var updateMark: number = Camera._updateMark;
//         var updateRender: boolean = (!!this._baseRender) ? (updateMark !== this._baseRender._updateMark || this.renderType !== this._baseRender._updateRenderType) : false;
//         if (updateRender) {//此处处理更新为裁剪和合并后的，可避免浪费
//             this._baseRender._renderUpdateWithCamera(context, transform);
//             this._baseRender._updateMark = updateMark;
//             this._baseRender._updateRenderType = this.renderType;
//         }

//         const subUbo = (!!this._baseRender) ? this._baseRender._subUniformBufferData : false;
//         if (subUbo) {
//             subUbo._needUpdate && BaseRender._transLargeUbO.updateSubData(subUbo);
//         }
//         //context.shader = this._renderElementOBJ._subShader;
//         this._renderElementOBJ._isRender = this._geometry._prepareRender(context);
//         this._geometry._updateRenderParams(context);
//         this.compileShader(context._contextOBJ);
//         this._renderElementOBJ._invertFront = this.getInvertFront();
//     }

//     /**
//      * @internal
//      */
//     _render(context: IRenderContext3D): void {
//         this._renderElementOBJ._render(context);
//     }

//     /**
//      * @internal
//      */
//     destroy(): void {
//         this._renderElementOBJ._destroy();
//         this._renderElementOBJ = null;
//         this._geometry = null;
//         this._baseRender = null;
//         this._material = null
//         this._baseRender = null;
//         this._subShader = null;
//     }
// }

