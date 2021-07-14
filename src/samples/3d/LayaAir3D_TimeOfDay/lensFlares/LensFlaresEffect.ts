// import { Vector4 } from "laya/d3/math/Vector4";
// import { Texture2D } from "laya/resource/Texture2D";
// import { Matrix4x4 } from "laya/d3/math/Matrix4x4";
// import { PostProcessEffect } from "laya/d3/core/render/PostProcessEffect";
// import { Shader3D } from "laya/d3/shader/Shader3D";
// import { BufferState } from "laya/d3/core/BufferState";
// import { ShaderData } from "laya/d3/shader/ShaderData";
// import { DefineDatas } from "laya/d3/shader/DefineDatas";
// import { Vector3 } from "laya/d3/math/Vector3";
// import { Matrix3x3 } from "laya/d3/math/Matrix3x3";
// import { VertexDeclaration } from "laya/d3/graphics/VertexDeclaration";
// import { VertexMesh } from "laya/d3/graphics/Vertex/VertexMesh";
// import { VertexBuffer3D } from "laya/d3/graphics/VertexBuffer3D";
// import { IndexBuffer3D } from "laya/d3/graphics/IndexBuffer3D";
// import { IndexFormat } from "laya/d3/graphics/IndexFormat";
// import { Viewport } from "laya/d3/math/Viewport";
// import { Camera } from "laya/d3/core/Camera";
// import { PostProcessRenderContext } from "laya/d3/core/render/PostProcessRenderContext";
// import { RenderTexture } from "laya/d3/resource/RenderTexture";
// import { CommandBuffer } from "laya/d3/core/render/command/CommandBuffer";
// import { TextureFormat } from "laya/resource/TextureFormat";
// import { RenderTextureDepthFormat } from "laya/resource/RenderTextureFormat";
// import { ShaderInstance } from "laya/d3/shader/ShaderInstance";
// import { SubShader } from "laya/d3/shader/SubShader";
// import { ShaderPass } from "laya/d3/shader/ShaderPass";
// import { RenderState } from "laya/d3/core/material/RenderState";

// import LensFlaresVS from "./LensFlares.vs";
// import LensFlaresFS from "./LensFlares.fs";

// import LensFlaresScreenVS from "./LensFlaresScreen.vs";
// import LensFlaresScreenFS from "./LensFlaresScreen.fs";
// import { DirectionLight } from "laya/d3/core/light/DirectionLight";
// import { BoundFrustum } from "laya/d3/math/BoundFrustum";
// import { LayaGL } from "laya/layagl/LayaGL";


// export class LensFlare {
//     public color: Vector4;
//     public texture: Texture2D;
//     public size: number;
//     public position: number;
//     public viewportMatrix: Matrix4x4;

//     private _effect: LensFlaresEffect;

//     constructor(size: number, position: number, color: Vector4, texture: Texture2D, effect: LensFlaresEffect) {
//         this.size = size;
//         this.position = position;
//         this.color = color || new Vector4(1, 1, 1);
//         this.texture = texture;
//         this._effect = effect;
//         this.viewportMatrix = new Matrix4x4();
//     }

//     public dispose(): void {
//         // todo
//     }

// }


// /**
//  * ???
//  */
// export class LensFlaresEffect extends PostProcessEffect {

//     /** @internal */
//     static SHADERVALUE_MAINTEX: number = Shader3D.propertyNameToID("u_MainTex");
//     static SHADERVALUE_TIME: number = Shader3D.propertyNameToID("u_time");
//     static SHADERVALUE_FLARETEX: number = Shader3D.propertyNameToID("u_FlareTex");
//     static SHADERVALUE_COLOR: number = Shader3D.propertyNameToID("u_Color");
//     static SHADERVALUE_VIEWPORTMATRIX: number = Shader3D.propertyNameToID("u_ViewportMatrix");
//     static SHADERVALUE_ROTATION: number = Shader3D.propertyNameToID("u_Rotation");

//     _bufferState: BufferState = new BufferState();

//     /**@internal */
//     private _shader: Shader3D = null;

//     /**@internal */
//     private _shaderData: ShaderData = new ShaderData();

//     private shaderDefines: DefineDatas = new DefineDatas();


//     // Flares array
//     public lensFlares = new Array<LensFlare>();

//     private _emitter: DirectionLight;

//     public borderLimit = 30;

//     public viewportBorder = 0;

//     private _positionX: number;
//     private _positionY: number;
//     private _isEnabled = true;

//     private static _tempVector3_1: Vector3 = new Vector3();
//     private static _tempVector3_2: Vector3 = new Vector3();
//     private static _tempVector4: Vector4 = new Vector4();
//     private static _tempMatrix3x3: Matrix3x3 = new Matrix3x3();

//     // todo 判断是否可见 函数
//     // public meshesSelectionPredicate;

//     constructor(emitter: DirectionLight) {
//         super();

//         this._emitter = emitter;

//         this._shader = Shader3D.find("PostProcessLensFlares");

//         var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,UV");

//         var vertices: Float32Array = new Float32Array([
//             1, 1, 0, 1, 1,
//             -1, 1, 0, 0, 1,
//             -1, -1, 0, 0, 0,
//             1, -1, 0, 1, 0
//         ]);
//         var indices: Uint16Array = new Uint16Array([0, 2, 1, 0, 3, 2]);

//         var gl: WebGLRenderingContext = LayaGL.instance;
//         var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(vertices.length * 4, gl.STATIC_DRAW, true);
//         vertexBuffer.vertexDeclaration = vertexDeclaration;
//         vertexBuffer.setData(vertices.buffer);
//         var indexBuffer: IndexBuffer3D = new IndexBuffer3D(IndexFormat.UInt16, indices.length, gl.STATIC_DRAW, true);
//         indexBuffer.setData(indices.buffer);

//         this._bufferState.bind();
//         this._bufferState.applyVertexBuffer(vertexBuffer);
//         this._bufferState.applyIndexBuffer(indexBuffer);
//         this._bufferState.unBind();

//         //todo
//         var memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
//     }

//     public getEmitterPosition(camera: Camera): Vector3 {
//         // return this._emitter.transform.position;
//         camera.transform.getForward(LensFlaresEffect._tempVector3_1);
//         var light: DirectionLight = this._emitter;
//         //@ts-ignore
//         var dir: Vector3 = light._direction;
//         Vector3.scale(dir, -100, LensFlaresEffect._tempVector3_1);
//         Vector3.add(camera.transform.position, LensFlaresEffect._tempVector3_1, LensFlaresEffect._tempVector3_2);
//         return LensFlaresEffect._tempVector3_2;
//     }

//     public computeEffectivePosition(globalViewport: Viewport, camera: Camera): boolean {
//         var position: Vector3 = this.getEmitterPosition(camera);
//         var vpMat: Matrix4x4 = camera.projectionViewMatrix;
//         globalViewport.project(position, vpMat, LensFlaresEffect._tempVector4);

//         // camera.worldToViewportPoint(position, LensFlaresEffect._tempVector4);

//         this._positionX = LensFlaresEffect._tempVector4.x;
//         this._positionY = LensFlaresEffect._tempVector4.y;

//         if (this.viewportBorder > 0) {
//             globalViewport.x -= this.viewportBorder;
//             globalViewport.y -= this.viewportBorder;
//             globalViewport.width += this.viewportBorder * 2;
//             globalViewport.height += this.viewportBorder * 2;
//             position.x += this.viewportBorder;
//             position.y += this.viewportBorder;
//             this._positionX += this.viewportBorder;
//             this._positionY += this.viewportBorder;
//         }

//         if (LensFlaresEffect._tempVector4.z > 0) {
//             if ((this._positionX > globalViewport.x) && (this._positionX < globalViewport.x + globalViewport.width)) {
//                 if ((this._positionY > globalViewport.y) && (this._positionY < globalViewport.y + globalViewport.height)) {
//                     var boundFrustum: BoundFrustum = camera.boundFrustum;
//                     if (boundFrustum.containsPoint(position) == 1) {
//                         return true;
//                     }
//                 }
//             }
//             return false;
//         }

//         return false;
//     }

//     /**
//      * 
//      * @param context 
//      */
//     _isVisible(camera: Camera): boolean {

//         // todo
//         if (!this._isEnabled) {
//             return false;
//         }

//         return true;
//     }


//     /**
// 	 * @inheritDoc
// 	 * @override
// 	 * @internal
// 	 */
//     render(context: PostProcessRenderContext): void {
//         var gl: WebGLRenderingContext = LayaGL.instance;
//         var soruce: RenderTexture = context.source;
//         var cmd: CommandBuffer = context.command;

//         var camera: Camera = context.camera;
//         if (!camera.active) {
//             return;
//         }

//         var renderWidth: number = soruce.width;
//         var renderHeight: number = soruce.height;
//         var cameraViewport: Viewport = camera.normalizedViewport;
//         var globalViewport: Viewport = new Viewport(cameraViewport.x * renderWidth, cameraViewport.y * renderHeight, cameraViewport.width * renderWidth, cameraViewport.height * renderHeight);

//         // position
//         if (!this.computeEffectivePosition(globalViewport, camera)) {
//             return;
//         }

//         // visibility
//         if (!this._isVisible(camera)) {
//             return;
//         }



//         if (this.viewportBorder > 0) {
//             globalViewport.x += this.viewportBorder;
//             globalViewport.y += this.viewportBorder;
//             globalViewport.width -= this.viewportBorder * 2;
//             globalViewport.height -= this.viewportBorder * 2;
//             this._positionX -= this.viewportBorder;
//             this._positionY -= this.viewportBorder;
//         }

//         var renderTexture: RenderTexture = RenderTexture.createFromPool(renderWidth, renderHeight, TextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
//         var renderTexture1: RenderTexture = RenderTexture.createFromPool(renderWidth, renderHeight, TextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTHSTENCIL_NONE);

//         // var renderTexture: RenderTexture = new RenderTexture(renderWidth, renderHeight, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTHSTENCIL_NONE);
//         // var renderTexture1: RenderTexture = new RenderTexture(renderWidth, renderHeight, RenderTextureFormat.R8G8B8A8, RenderTextureDepthFormat.DEPTHSTENCIL_NONE);

//         // 渲染 LensFlares 纹理
//         this.renderLensFlares(context, renderTexture, globalViewport);

//         // 保存 屏幕纹理
//         cmd.blitScreenTriangle(soruce, renderTexture1);
//         // 混合 LensFlares 纹理与 屏幕纹理
//         this._shaderData.setTexture(LensFlaresEffect.SHADERVALUE_FLARETEX, renderTexture);
//         cmd.blitScreenTriangle(renderTexture1, soruce, null, this._shader, this._shaderData, 1);


//         //    cmd.blitScreenTriangle(renderTexture, soruce);

//         RenderTexture.recoverToPool(renderTexture);
//         RenderTexture.recoverToPool(renderTexture1);
//     }

//     /**
//      * @internal
//      */
//     renderLensFlares(context: PostProcessRenderContext, renderTexture: RenderTexture, globalViewport: Viewport): void {
//         var gl: WebGLRenderingContext = LayaGL.instance;
//         var camera: Camera = context.camera;
//         var aspectRatio: number = camera.aspectRatio;

//         var awayX: number;
//         var awayY: number;

//         if (this._positionX < this.borderLimit + globalViewport.x) {
//             awayX = this.borderLimit + globalViewport.x - this._positionX;
//         }
//         else if (this._positionX > globalViewport.x + globalViewport.width - this.borderLimit) {
//             awayX = this._positionX - globalViewport.x - globalViewport.width + this.borderLimit;
//         }
//         else {
//             awayX = 0;
//         }

//         if (this._positionY < this.borderLimit + globalViewport.y) {
//             awayY = this.borderLimit + globalViewport.y - this._positionY;
//         }
//         else if (this._positionY > globalViewport.y + globalViewport.height - this.borderLimit) {
//             awayY = this._positionY - globalViewport.y - globalViewport.height + this.borderLimit;
//         }
//         else {
//             awayY = 0;
//         }

//         var away: number = (awayX > awayY) ? awayX : awayY;
//         away -= this.viewportBorder;

//         if (away > this.borderLimit) {
//             away = this.borderLimit;
//         }

//         // var intensity: number = 1 - Math.min(1, Math.max(0, away / this.borderLimit));
//         var intensity: number = 1 - Math.min(1, Math.max(0, away / this.borderLimit));
//         intensity = 0.15;

//         // Position
//         var centerX = globalViewport.x + globalViewport.width / 2;
//         var centerY = globalViewport.y + globalViewport.height / 2;
//         var distX = centerX - this._positionX;
//         var distY = centerY - this._positionY;
//         //@ts-ignore
//         renderTexture._start();
//         gl.clearColor(0, 0, 0, 1);
//         gl.clear(gl.COLOR_BUFFER_BIT);
//         for (var i: number = 0; i < this.lensFlares.length; i++) {
//             var flare: LensFlare = this.lensFlares[i];

//             var viewportMatrix: Matrix4x4 = flare.viewportMatrix;
//             var x: number = centerX - (distX * flare.position);
//             var y: number = centerY - (distY * flare.position);



//             var cw: number = flare.size;
//             var ch: number = flare.size * aspectRatio;
//             var cx: number = 2 * (x / (globalViewport.width + globalViewport.x * 2)) - 1.0;
//             var cy: number = 1.0 - 2 * (y / (globalViewport.height + globalViewport.y * 2));

//             var elements: Float32Array = flare.viewportMatrix.elements;
//             elements.set([
//                 cw / 2, 0, 0, 0,
//                 0, ch / 2, 0, 0,
//                 0, 0, 1, 0,
//                 cx, cy, 0, 1
//             ]);

//             var angle: number = Math.atan2(cx, cy) * 180 / Math.PI;
//             angle += (135 - 180);
//             angle = (angle < 0) ? angle + 360 : angle;
//             // angle = Math.round(angle);
//             var radians: number = Math.PI / 180 * angle;
//             // Matrix3x3.createFromRotation(angle, LensFlaresEffect._tempMatrix3x3);
//             this._shaderData.setNumber(LensFlaresEffect.SHADERVALUE_ROTATION, -radians);

//             this._shaderData.setMatrix4x4(LensFlaresEffect.SHADERVALUE_VIEWPORTMATRIX, flare.viewportMatrix);
//             this._shaderData.setTexture(LensFlaresEffect.SHADERVALUE_FLARETEX, flare.texture);
//             Vector4.scale(flare.color, intensity, LensFlaresEffect._tempVector4);
//             LensFlaresEffect._tempVector4.w = 1.0;
//             this._shaderData.setVector(LensFlaresEffect.SHADERVALUE_COLOR, LensFlaresEffect._tempVector4);

//             // shader 
//             var comDef: DefineDatas = this.shaderDefines;
//             //@ts-ignore
//             this._shaderData._defineDatas.cloneTo(comDef);
//             //@ts-ignore
//             var shaderPass: ShaderInstance = this._shader.getSubShaderAt(0)._passes[0].withCompile(comDef);
//             //@ts-ignore
//             shaderPass.bind();
//             //@ts-ignore
//             shaderPass.uploadUniforms(shaderPass._materialUniformParamsMap, this._shaderData, true);
//             //@ts-ignore
//             shaderPass.uploadRenderStateBlendDepth(this._shaderData);
//             //@ts-ignore
//             shaderPass.uploadRenderStateFrontFace(this._shaderData, false, null);//TODO: //利用UV翻转,无需设置为true

//             // vb ib
//             this._bufferState.bind();
//             // draw
//             gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);

//         }
//         //@ts-ignore
//         renderTexture._end();
//     }

//     public addFlare(size: number, position: number, color: Vector4, texture: Texture2D) {
//         var lensFlare: LensFlare = new LensFlare(size, position, color, texture, this);
//         // todo 渲染顺序
//         this.lensFlares.push(lensFlare);
//     }

//     public static shaderinit() {
//         //LensFlaresEffect
//         var flareAttributeMap: any = {
//             // 'a_PositionTexcoord': VertexMesh.MESH_POSITION0
//             'a_Position': VertexMesh.MESH_POSITION0,
//             'a_Texcoord0': VertexMesh.MESH_TEXTURECOORDINATE0,
//         }
//         var flareUniformMap: any = {
//             'u_MainTex': Shader3D.PERIOD_MATERIAL,
//             'u_FlareTex': Shader3D.PERIOD_MATERIAL,
//             'u_Color': Shader3D.PERIOD_MATERIAL,
//             'u_ViewportMatrix': Shader3D.PERIOD_MATERIAL,
//             'u_Rotation': Shader3D.PERIOD_MATERIAL
//         }
//         var shader = Shader3D.add("PostProcessLensFlares");
//         var flareSubShader: SubShader = new SubShader(flareAttributeMap, flareUniformMap);
//         shader.addSubShader(flareSubShader);
//         var pass: ShaderPass = flareSubShader.addShaderPass(LensFlaresVS, LensFlaresFS);
//         pass.renderState.blend = RenderState.BLEND_ENABLE_SEPERATE;
//         pass.renderState.dstBlendRGB = RenderState.BLENDPARAM_ONE;
//         pass.renderState.dstBlendAlpha = RenderState.BLENDPARAM_ONE;
//         pass.renderState.srcBlendRGB = RenderState.BLENDPARAM_ONE;
//         pass.renderState.srcBlendAlpha = RenderState.BLENDPARAM_ZERO;
//         pass.renderState.depthTest = RenderState.DEPTHTEST_OFF;

//         var screenAttributeMap: any = {
//             'a_PositionTexcoord': VertexMesh.MESH_POSITION0
//         };
//         var screenUniformMap: any = {
//             'u_MainTex': Shader3D.PERIOD_MATERIAL,
//             'u_FlareTex': Shader3D.PERIOD_MATERIAL
//         };
//         var screenSubShader: SubShader = new SubShader(screenAttributeMap, screenUniformMap);
//         shader.addSubShader(screenSubShader);
//         var screenPass: ShaderPass = screenSubShader.addShaderPass(LensFlaresScreenVS, LensFlaresScreenFS);
//         // screenPass.renderState.blend = RenderState.BLEND_ENABLE_ALL;
//         // pass.renderState.dstBlend = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
//         // pass.renderState.srcBlend = RenderState.BLENDPARAM_ONE;
//     }


// }