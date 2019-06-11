import { Laya } from "Laya";
import { PhysicsSettings } from "laya/d3/physics/PhysicsSettings";
import { Sprite } from "laya/display/Sprite";
import { LayaGL } from "laya/layagl/LayaGL";
import { Loader } from "laya/net/Loader";
import { URL } from "laya/net/URL";
import { Render } from "laya/renders/Render";
import { BaseTexture } from "laya/resource/BaseTexture";
import { Context } from "laya/resource/Context";
import { SubmitBase } from "laya/webgl/submit/SubmitBase";
import { SubmitKey } from "laya/webgl/submit/SubmitKey";
import { WebGL } from "laya/webgl/WebGL";
import { WebGLContext } from "laya/webgl/WebGLContext";
import { CastShadowList } from "../../CastShadowList";
import { Animator } from "../../component/Animator";
import { SimpleSingletonList } from "../../component/SimpleSingletonList";
import { FrustumCulling } from "../../graphics/FrustumCulling";
import { Input3D } from "../../Input3D";
import { Vector3 } from "../../math/Vector3";
import { PhysicsComponent } from "../../physics/PhysicsComponent";
import { PhysicsSimulation } from "../../physics/PhysicsSimulation";
import { SkyBox } from "../../resource/models/SkyBox";
import { SkyDome } from "../../resource/models/SkyDome";
import { SkyRenderer } from "../../resource/models/SkyRenderer";
import { Shader3D } from "../../shader/Shader3D";
import { ShaderData } from "../../shader/ShaderData";
import { ShaderInit3D } from "../../shader/ShaderInit3D";
import { BaseCamera } from "../BaseCamera";
import { BaseMaterial } from "../material/BaseMaterial";
import { RenderState } from "../material/RenderState";
import { PixelLineMaterial } from "../pixelLine/PixelLineMaterial";
import { PixelLineSprite3D } from "../pixelLine/PixelLineSprite3D";
import { RenderQueue } from "../render/RenderQueue";
import { RenderableSprite3D } from "../RenderableSprite3D";
import { BoundsOctree } from "././BoundsOctree";
import { Scene3DShaderDeclaration } from "./Scene3DShaderDeclaration";
/**
 * <code>Scene3D</code> 类用于实现场景。
 */
export class Scene3D extends Sprite {
    /**
     * 创建一个 <code>Scene3D</code> 实例。
     */
    constructor() {
        /*[DISABLE-ADD-VARIABLE-DEFAULT-VALUE]*/
        super();
        /** @private */
        this._lights = [];
        /** @private */
        this._lightmaps = [];
        /** @private */
        this._skyRenderer = new SkyRenderer();
        /** @private */
        this._reflectionMode = 1;
        /** @private */
        this._enableLightCount = 3;
        /**@private */
        this._input = new Input3D();
        /**@private */
        this._timer = Laya.timer;
        /** @private 只读,不允许修改。*/
        this._collsionTestList = [];
        /** @private */
        this._renders = new SimpleSingletonList();
        /** @private */
        this._opaqueQueue = new RenderQueue(false);
        /** @private */
        this._transparentQueue = new RenderQueue(true);
        /** @private 相机的对象池*/
        this._cameraPool = [];
        /**@private */
        this._animatorPool = new SimpleSingletonList();
        /**@private */
        this._scriptPool = new SimpleSingletonList();
        /** @private */
        this._castShadowRenders = new CastShadowList();
        /** 当前创建精灵所属遮罩层。*/
        this.currentCreationLayer = Math.pow(2, 0);
        /** 是否启用灯光。*/
        this.enableLight = true;
        /**@private */
        this._key = new SubmitKey();
        this._time = 0;
        /**@private [Editer]*/
        this._pickIdToSprite = new Object();
        if (Scene3D._enbalePhysics)
            this._physicsSimulation = new PhysicsSimulation(Scene3D.physicsSettings);
        this._shaderValues = new ShaderData(null);
        this.parallelSplitShadowMaps = [];
        this.enableFog = false;
        this.fogStart = 300;
        this.fogRange = 1000;
        this.fogColor = new Vector3(0.7, 0.7, 0.7);
        this.ambientColor = new Vector3(0.212, 0.227, 0.259);
        this.reflectionIntensity = 1.0;
        (WebGL.shaderHighPrecision) && (this._shaderValues.addDefine(Shader3D.SHADERDEFINE_HIGHPRECISION));
        if (Render.supportWebGLPlusCulling) { //[NATIVE]
            this._cullingBufferIndices = new Int32Array(1024);
            this._cullingBufferResult = new Int32Array(1024);
        }
        this._shaderValues.setTexture(Scene3D.RANGEATTENUATIONTEXTURE, ShaderInit3D._rangeAttenTex);
        //var angleAttenTex:Texture2D = Texture2D.buildTexture2D(64, 64, BaseTexture.FORMAT_Alpha8, TextureGenerator.haloTexture);
        //_shaderValues.setTexture(Scene3D.ANGLEATTENUATIONTEXTURE, angleAttenTex);
        this._scene = this;
        if (Scene3D._enbalePhysics && !PhysicsSimulation.disableSimulation) //不引物理库初始化Input3D会内存泄漏 
            this._input.__init__(Render.canvas, this);
        if (Scene3D.octreeCulling) {
            this._octree = new BoundsOctree(Scene3D.octreeInitialSize, Scene3D.octreeInitialCenter, Scene3D.octreeMinNodeSize, Scene3D.octreeLooseness);
        }
        if (FrustumCulling.debugFrustumCulling) {
            this._debugTool = new PixelLineSprite3D();
            var lineMaterial = new PixelLineMaterial();
            lineMaterial.renderQueue = BaseMaterial.RENDERQUEUE_TRANSPARENT;
            lineMaterial.alphaTest = false;
            lineMaterial.depthWrite = false;
            lineMaterial.cull = RenderState.CULL_BACK;
            lineMaterial.blend = RenderState.BLEND_ENABLE_ALL;
            lineMaterial.blendSrc = RenderState.BLENDPARAM_SRC_ALPHA;
            lineMaterial.blendDst = RenderState.BLENDPARAM_ONE_MINUS_SRC_ALPHA;
            lineMaterial.depthTest = RenderState.DEPTHTEST_LESS;
            this._debugTool.pixelLineRenderer.sharedMaterial = lineMaterial;
        }
    }
    /**
     * @private
     */
    static __init__() {
        Scene3DShaderDeclaration.SHADERDEFINE_FOG = Shader3D.registerPublicDefine("FOG");
        Scene3DShaderDeclaration.SHADERDEFINE_DIRECTIONLIGHT = Shader3D.registerPublicDefine("DIRECTIONLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_POINTLIGHT = Shader3D.registerPublicDefine("POINTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_SPOTLIGHT = Shader3D.registerPublicDefine("SPOTLIGHT");
        Scene3DShaderDeclaration.SHADERDEFINE_CAST_SHADOW = Shader3D.registerPublicDefine("CASTSHADOW");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM1 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM1");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM2 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM2");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PSSM3 = Shader3D.registerPublicDefine("SHADOWMAP_PSSM3");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF_NO = Shader3D.registerPublicDefine("SHADOWMAP_PCF_NO");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF1 = Shader3D.registerPublicDefine("SHADOWMAP_PCF1");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF2 = Shader3D.registerPublicDefine("SHADOWMAP_PCF2");
        Scene3DShaderDeclaration.SHADERDEFINE_SHADOW_PCF3 = Shader3D.registerPublicDefine("SHADOWMAP_PCF3");
        Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP = Shader3D.registerPublicDefine("REFLECTMAP");
    }
    /**
     * 加载场景,注意:不缓存。
     * @param url 模板地址。
     * @param complete 完成回调。
     */
    static load(url, complete) {
        Laya.loader.create(url, complete, null, Scene3D.HIERARCHY);
    }
    /**
     * @private
     * [Editer]
     */
    _allotPickColorByID(id, pickColor) {
        var pickColorR = Math.floor(id / (255 * 255));
        id -= pickColorR * 255 * 255;
        var pickColorG = Math.floor(id / 255);
        id -= pickColorG * 255;
        var pickColorB = id;
        pickColor.x = pickColorR / 255;
        pickColor.y = pickColorG / 255;
        pickColor.z = pickColorB / 255;
        pickColor.w = 1.0;
    }
    /**
     * @private
     * [Editer]
     */
    _searchIDByPickColor(pickColor) {
        var id = pickColor.x * 255 * 255 + pickColor.y * 255 + pickColor.z;
        return id;
    }
    /**
     * 获取资源的URL地址。
     * @return URL地址。
     */
    get url() {
        return this._url;
    }
    /**
     * 获取是否允许雾化。
     * @return 是否允许雾化。
     */
    get enableFog() {
        return this._enableFog;
    }
    /**
     * 设置是否允许雾化。
     * @param value 是否允许雾化。
     */
    set enableFog(value) {
        if (this._enableFog !== value) {
            this._enableFog = value;
            if (value) {
                this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
            }
            else
                this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_FOG);
        }
    }
    /**
     * 获取雾化颜色。
     * @return 雾化颜色。
     */
    get fogColor() {
        return this._shaderValues.getVector3(Scene3D.FOGCOLOR);
    }
    /**
     * 设置雾化颜色。
     * @param value 雾化颜色。
     */
    set fogColor(value) {
        this._shaderValues.setVector3(Scene3D.FOGCOLOR, value);
    }
    /**
     * 获取雾化起始位置。
     * @return 雾化起始位置。
     */
    get fogStart() {
        return this._shaderValues.getNumber(Scene3D.FOGSTART);
    }
    /**
     * 设置雾化起始位置。
     * @param value 雾化起始位置。
     */
    set fogStart(value) {
        this._shaderValues.setNumber(Scene3D.FOGSTART, value);
    }
    /**
     * 获取雾化范围。
     * @return 雾化范围。
     */
    get fogRange() {
        return this._shaderValues.getNumber(Scene3D.FOGRANGE);
    }
    /**
     * 设置雾化范围。
     * @param value 雾化范围。
     */
    set fogRange(value) {
        this._shaderValues.setNumber(Scene3D.FOGRANGE, value);
    }
    /**
     * 获取环境光颜色。
     * @return 环境光颜色。
     */
    get ambientColor() {
        return this._shaderValues.getVector3(Scene3D.AMBIENTCOLOR);
    }
    /**
     * 设置环境光颜色。
     * @param value 环境光颜色。
     */
    set ambientColor(value) {
        this._shaderValues.setVector3(Scene3D.AMBIENTCOLOR, value);
    }
    /**
     * 获取天空渲染器。
     * @return 天空渲染器。
     */
    get skyRenderer() {
        return this._skyRenderer;
    }
    /**
     * 获取反射贴图。
     * @return 反射贴图。
     */
    get customReflection() {
        return this._shaderValues.getTexture(Scene3D.REFLECTIONTEXTURE);
    }
    /**
     * 设置反射贴图。
     * @param 反射贴图。
     */
    set customReflection(value) {
        this._shaderValues.setTexture(Scene3D.REFLECTIONTEXTURE, value);
        if (value)
            this._shaderValues.addDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
        else
            this._shaderValues.removeDefine(Scene3DShaderDeclaration.SHADERDEFINE_REFLECTMAP);
    }
    /**
     * 获取反射强度。
     * @return 反射强度。
     */
    get reflectionIntensity() {
        return this._shaderValues.getNumber(Scene3D.REFLETIONINTENSITY);
    }
    /**
     * 设置反射强度。
     * @param 反射强度。
     */
    set reflectionIntensity(value) {
        value = Math.max(Math.min(value, 1.0), 0.0);
        this._shaderValues.setNumber(Scene3D.REFLETIONINTENSITY, value);
    }
    /**
     * 获取物理模拟器。
     * @return 物理模拟器。
     */
    get physicsSimulation() {
        return this._physicsSimulation;
    }
    /**
     * 获取反射模式。
     * @return 反射模式。
     */
    get reflectionMode() {
        return this._reflectionMode;
    }
    /**
     * 设置反射模式。
     * @param value 反射模式。
     */
    set reflectionMode(value) {
        this._reflectionMode = value;
    }
    /**
     * 获取场景时钟。
     */
    /*override*/ get timer() {
        return this._timer;
    }
    /**
     * 设置场景时钟。
     */
    set timer(value) {
        this._timer = value;
    }
    /**
     *	获取输入。
     * 	@return  输入。
     */
    get input() {
        return this._input;
    }
    /**
     * @private
     */
    _setLightmapToChildNode(sprite) {
        if (sprite instanceof RenderableSprite3D)
            sprite._render._applyLightMapParams();
        var children = sprite._children;
        for (var i = 0, n = children.length; i < n; i++)
            this._setLightmapToChildNode(children[i]);
    }
    /**
     *@private
     */
    _update() {
        var delta = this.timer._delta / 1000;
        this._time += delta;
        this._shaderValues.setNumber(Scene3D.TIME, this._time);
        var simulation = this._physicsSimulation;
        if (Scene3D._enbalePhysics && !PhysicsSimulation.disableSimulation) {
            simulation._updatePhysicsTransformFromRender();
            PhysicsComponent._addUpdateList = false; //物理模拟器会触发_updateTransformComponent函数,不加入更新队列
            //simulate physics
            simulation._simulate(delta);
            //update character sprite3D transforms from physics engine simulation
            simulation._updateCharacters();
            PhysicsComponent._addUpdateList = true;
            //handle frame contacts
            simulation._updateCollisions();
            //send contact events
            simulation._eventScripts();
            this._input._update(); //允许物理才更新
        }
        this._updateScript();
        Animator._update(this);
        this._lateUpdateScript();
    }
    /**
     * @private
     */
    _binarySearchIndexInCameraPool(camera) {
        var start = 0;
        var end = this._cameraPool.length - 1;
        var mid;
        while (start <= end) {
            mid = Math.floor((start + end) / 2);
            var midValue = this._cameraPool[mid]._renderingOrder;
            if (midValue == camera._renderingOrder)
                return mid;
            else if (midValue > camera._renderingOrder)
                end = mid - 1;
            else
                start = mid + 1;
        }
        return start;
    }
    /**
     * @private
     */
    _setCreateURL(url) {
        this._url = URL.formatURL(url);
    }
    /**
     * @private
     */
    _getGroup() {
        return this._group;
    }
    /**
     * @private
     */
    _setGroup(value) {
        this._group = value;
    }
    /**
     * @private
     */
    _updateScript() {
        var pool = this._scriptPool;
        var elements = pool.elements;
        for (var i = 0, n = pool.length; i < n; i++) {
            var script = elements[i];
            (script && script.enabled) && (script.onUpdate());
        }
    }
    /**
     * @private
     */
    _lateUpdateScript() {
        var pool = this._scriptPool;
        var elements = pool.elements;
        for (var i = 0, n = pool.length; i < n; i++) {
            var script = elements[i];
            (script && script.enabled) && (script.onLateUpdate());
        }
    }
    /**
     * @private
     */
    _preRenderScript() {
        var pool = this._scriptPool;
        var elements = pool.elements;
        for (var i = 0, n = pool.length; i < n; i++) {
            var script = elements[i];
            (script && script.enabled) && (script.onPreRender());
        }
    }
    /**
     * @private
     */
    _postRenderScript() {
        var pool = this._scriptPool;
        var elements = pool.elements;
        for (var i = 0, n = pool.length; i < n; i++) {
            var script = elements[i];
            (script && script.enabled) && (script.onPostRender());
        }
    }
    /**
     * @private
     */
    _prepareSceneToRender() {
        var lightCount = this._lights.length;
        if (lightCount > 0) {
            var renderLightCount = 0;
            for (var i = 0; i < lightCount; i++) {
                if (!this._lights[i]._prepareToScene()) //TODO:应该直接移除
                    continue;
                renderLightCount++;
                if (renderLightCount >= this._enableLightCount)
                    break;
            }
        }
    }
    /**
     * @private
     */
    _addCamera(camera) {
        var index = this._binarySearchIndexInCameraPool(camera);
        var order = camera._renderingOrder;
        var count = this._cameraPool.length;
        while (index < count && this._cameraPool[index]._renderingOrder <= order)
            index++;
        this._cameraPool.splice(index, 0, camera);
    }
    /**
     * @private
     */
    _removeCamera(camera) {
        this._cameraPool.splice(this._cameraPool.indexOf(camera), 1);
    }
    /**
     * @private
     */
    _preCulling(context, camera) {
        FrustumCulling.renderObjectCulling(camera, this, context, this._renders);
    }
    /**
     * @private
     */
    _clear(gl, state) {
        var viewport = state.viewport;
        var camera = state.camera;
        var renderTexture = camera._renderTexture;
        var vpW = viewport.width;
        var vpH = viewport.height;
        var vpX = viewport.x;
        var vpY = camera._getCanvasHeight() - viewport.y - vpH;
        gl.viewport(vpX, vpY, vpW, vpH);
        var flag;
        var clearFlag = camera.clearFlag;
        if (clearFlag === BaseCamera.CLEARFLAG_SKY && !(camera.skyRenderer._isAvailable() || this._skyRenderer._isAvailable()))
            clearFlag = BaseCamera.CLEARFLAG_SOLIDCOLOR;
        switch (clearFlag) {
            case BaseCamera.CLEARFLAG_SOLIDCOLOR:
                var clearColor = camera.clearColor;
                gl.enable(WebGLContext.SCISSOR_TEST);
                gl.scissor(vpX, vpY, vpW, vpH);
                if (clearColor)
                    gl.clearColor(clearColor.x, clearColor.y, clearColor.z, clearColor.w);
                else
                    gl.clearColor(0, 0, 0, 0);
                if (renderTexture) {
                    flag = WebGLContext.COLOR_BUFFER_BIT;
                    switch (renderTexture.depthStencilFormat) {
                        case BaseTexture.FORMAT_DEPTH_16:
                            flag |= WebGLContext.DEPTH_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_STENCIL_8:
                            flag |= WebGLContext.STENCIL_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                            flag |= WebGLContext.DEPTH_BUFFER_BIT;
                            flag |= WebGLContext.STENCIL_BUFFER_BIT;
                            break;
                    }
                }
                else {
                    flag = WebGLContext.COLOR_BUFFER_BIT | WebGLContext.DEPTH_BUFFER_BIT;
                }
                WebGLContext.setDepthMask(gl, true);
                gl.clear(flag);
                gl.disable(WebGLContext.SCISSOR_TEST);
                break;
            case BaseCamera.CLEARFLAG_SKY:
            case BaseCamera.CLEARFLAG_DEPTHONLY:
                gl.enable(WebGLContext.SCISSOR_TEST);
                gl.scissor(vpX, vpY, vpW, vpH);
                if (renderTexture) {
                    switch (renderTexture.depthStencilFormat) {
                        case BaseTexture.FORMAT_DEPTH_16:
                            flag = WebGLContext.DEPTH_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_STENCIL_8:
                            flag = WebGLContext.STENCIL_BUFFER_BIT;
                            break;
                        case BaseTexture.FORMAT_DEPTHSTENCIL_16_8:
                            flag = WebGLContext.DEPTH_BUFFER_BIT | WebGLContext.STENCIL_BUFFER_BIT;
                            break;
                    }
                }
                else {
                    flag = WebGLContext.DEPTH_BUFFER_BIT;
                }
                WebGLContext.setDepthMask(gl, true);
                gl.clear(flag);
                gl.disable(WebGLContext.SCISSOR_TEST);
                break;
            case BaseCamera.CLEARFLAG_NONE:
                break;
            default:
                throw new Error("BaseScene:camera clearFlag invalid.");
        }
    }
    /**
     * @private
     */
    _renderScene(gl, state, customShader = null, replacementTag = null) {
        var camera = state.camera;
        var position = camera.transform.position;
        camera._renderTexture ? this._opaqueQueue._render(state, true, customShader, replacementTag) : this._opaqueQueue._render(state, false, customShader, replacementTag); //非透明队列
        if (camera.clearFlag === BaseCamera.CLEARFLAG_SKY) {
            if (camera.skyRenderer._isAvailable())
                camera.skyRenderer._render(state);
            else if (this._skyRenderer._isAvailable())
                this._skyRenderer._render(state);
        }
        camera._renderTexture ? this._transparentQueue._render(state, true, customShader, replacementTag) : this._transparentQueue._render(state, false, customShader, replacementTag); //透明队列
        if (FrustumCulling.debugFrustumCulling) {
            var renderElements = this._debugTool._render._renderElements;
            for (var i = 0, n = renderElements.length; i < n; i++) {
                renderElements[i]._render(state, false, customShader, replacementTag);
            }
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _parse(data, spriteMap) {
        var lightMapsData = data.lightmaps;
        if (lightMapsData) {
            var lightMapCount = lightMapsData.length;
            var lightmaps = [];
            for (var i = 0; i < lightMapCount; i++)
                lightmaps[i] = Loader.getRes(lightMapsData[i].path);
            this.setlightmaps(lightmaps);
        }
        var ambientColorData = data.ambientColor;
        if (ambientColorData) {
            var ambCol = this.ambientColor;
            ambCol.fromArray(ambientColorData);
            this.ambientColor = ambCol;
        }
        var skyData = data.sky;
        if (skyData) {
            this._skyRenderer.material = Loader.getRes(skyData.material.path);
            switch (skyData.mesh) {
                case "SkyBox":
                    this._skyRenderer.mesh = SkyBox.instance;
                    break;
                case "SkyDome":
                    this._skyRenderer.mesh = SkyDome.instance;
                    break;
                default:
                    this.skyRenderer.mesh = SkyBox.instance;
            }
        }
        var reflectionTextureData = data.reflectionTexture;
        reflectionTextureData && (this.customReflection = Loader.getRes(reflectionTextureData));
        this.enableFog = data.enableFog;
        this.fogStart = data.fogStart;
        this.fogRange = data.fogRange;
        var fogColorData = data.fogColor;
        if (fogColorData) {
            var fogCol = this.fogColor;
            fogCol.fromArray(fogColorData);
            this.fogColor = fogCol;
        }
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onActive() {
        super._onActive();
        Laya.stage._scene3Ds.push(this);
    }
    /**
     * @inheritDoc
     */
    /*override*/ _onInActive() {
        super._onInActive();
        var scenes = Laya.stage._scene3Ds;
        scenes.splice(scenes.indexOf(this), 1);
    }
    /**
     * @private
     */
    _addLight(light) {
        if (this._lights.indexOf(light) < 0)
            this._lights.push(light);
    }
    /**
     * @private
     */
    _removeLight(light) {
        var index = this._lights.indexOf(light);
        index >= 0 && (this._lights.splice(index, 1));
    }
    /**
     * @private
     */
    _addRenderObject(render) {
        if (this._octree) {
            this._octree.add(render);
        }
        else {
            this._renders.add(render);
            if (Render.supportWebGLPlusCulling) { //[NATIVE]
                var indexInList = render._getIndexInList();
                var length = this._cullingBufferIndices.length;
                if (indexInList >= length) {
                    var tempIndices = this._cullingBufferIndices;
                    var tempResult = this._cullingBufferResult;
                    this._cullingBufferIndices = new Int32Array(length + 1024);
                    this._cullingBufferResult = new Int32Array(length + 1024);
                    this._cullingBufferIndices.set(tempIndices, 0);
                    this._cullingBufferResult.set(tempResult, 0);
                }
                this._cullingBufferIndices[indexInList] = render._cullingBufferIndex;
            }
        }
    }
    /**
     * @private
     */
    _removeRenderObject(render) {
        if (this._octree) {
            this._octree.remove(render);
        }
        else {
            var endRender;
            if (Render.supportWebGLPlusCulling) { //[NATIVE]
                endRender = this._renders.elements[this._renders.length - 1];
            }
            this._renders.remove(render);
            if (Render.supportWebGLPlusCulling) { //[NATIVE]
                this._cullingBufferIndices[endRender._getIndexInList()] = endRender._cullingBufferIndex;
            }
        }
    }
    /**
     * @private
     */
    _addShadowCastRenderObject(render) {
        if (this._octree) {
            //TODO:
            //addTreeNode(render);
        }
        else {
            this._castShadowRenders.add(render);
        }
    }
    /**
     * @private
     */
    _removeShadowCastRenderObject(render) {
        if (this._octree) {
            //TODO:
            //removeTreeNode(render);
        }
        else {
            this._castShadowRenders.remove(render);
        }
    }
    /**
     * @private
     */
    _getRenderQueue(index) {
        if (index <= 2500) //2500作为队列临界点
            return this._opaqueQueue;
        else
            return this._transparentQueue;
    }
    /**
     * 设置光照贴图。
     * @param value 光照贴图。
     */
    setlightmaps(value) {
        var maps = this._lightmaps;
        for (var i = 0, n = maps.length; i < n; i++)
            maps[i]._removeReference();
        if (value) {
            var count = value.length;
            maps.length = count;
            for (i = 0; i < count; i++) {
                var lightMap = value[i];
                lightMap._addReference();
                maps[i] = lightMap;
            }
        }
        else {
            throw new Error("Scene3D: value value can't be null.");
        }
        for (i = 0, n = this._children.length; i < n; i++)
            this._setLightmapToChildNode(this._children[i]);
    }
    /**
     * 获取光照贴图浅拷贝列表。
     * @return 获取光照贴图浅拷贝列表。
     */
    getlightmaps() {
        return this._lightmaps.slice(); //slice()防止修改数组内容
    }
    /**
     * @inheritDoc
     */
    /*override*/ destroy(destroyChild = true) {
        if (this.destroyed)
            return;
        super.destroy(destroyChild);
        this._skyRenderer.destroy();
        this._skyRenderer = null;
        this._lights = null;
        this._lightmaps = null;
        this._renderTargetTexture = null;
        this._shaderValues = null;
        this._renders = null;
        this._castShadowRenders = null;
        this._cameraPool = null;
        this._octree = null;
        this.parallelSplitShadowMaps = null;
        this._physicsSimulation && this._physicsSimulation._destroy();
        Loader.clearRes(this.url);
    }
    /**
     * @inheritDoc
     */
    /*override*/ render(ctx, x, y) {
        //TODO:外层应该设计为接口调用
        ctx._curSubmit = SubmitBase.RENDERBASE; //打断2D合并的renderKey
        this._children.length > 0 && ctx.addRenderObject(this);
    }
    /**
     * @private
     */
    renderSubmit() {
        var gl = LayaGL.instance;
        this._prepareSceneToRender();
        var i, n, n1;
        for (i = 0, n = this._cameraPool.length, n1 = n - 1; i < n; i++) {
            if (Render.supportWebGLPlusRendering)
                ShaderData.setRuntimeValueMode((i == n1) ? true : false);
            var camera = this._cameraPool[i];
            camera.enableRender && camera.render();
        }
        Context.set2DRenderConfig(); //还原2D配置
        return 1;
    }
    /**
     * @private
     */
    getRenderType() {
        return 0;
    }
    /**
     * @private
     */
    releaseRender() {
    }
    /**
     * @private
     */
    reUse(context, pos) {
        return 0;
    }
}
/**Hierarchy资源。*/
Scene3D.HIERARCHY = "HIERARCHY";
/**@private */
Scene3D._enbalePhysics = false;
/**@private */
Scene3D.physicsSettings = new PhysicsSettings();
/** 是否开启八叉树裁剪。*/
Scene3D.octreeCulling = false;
/** 八叉树初始化尺寸。*/
Scene3D.octreeInitialSize = 64.0;
/** 八叉树初始化中心。*/
Scene3D.octreeInitialCenter = new Vector3(0, 0, 0);
/** 八叉树最小尺寸。*/
Scene3D.octreeMinNodeSize = 2.0;
/** 八叉树松散值。*/
Scene3D.octreeLooseness = 1.25;
/**@private */
Scene3D.REFLECTIONMODE_SKYBOX = 0;
/**@private */
Scene3D.REFLECTIONMODE_CUSTOM = 1;
Scene3D.FOGCOLOR = Shader3D.propertyNameToID("u_FogColor");
Scene3D.FOGSTART = Shader3D.propertyNameToID("u_FogStart");
Scene3D.FOGRANGE = Shader3D.propertyNameToID("u_FogRange");
Scene3D.LIGHTDIRECTION = Shader3D.propertyNameToID("u_DirectionLight.Direction");
Scene3D.LIGHTDIRCOLOR = Shader3D.propertyNameToID("u_DirectionLight.Color");
Scene3D.POINTLIGHTPOS = Shader3D.propertyNameToID("u_PointLight.Position");
Scene3D.POINTLIGHTRANGE = Shader3D.propertyNameToID("u_PointLight.Range");
Scene3D.POINTLIGHTATTENUATION = Shader3D.propertyNameToID("u_PointLight.Attenuation");
Scene3D.POINTLIGHTCOLOR = Shader3D.propertyNameToID("u_PointLight.Color");
Scene3D.SPOTLIGHTPOS = Shader3D.propertyNameToID("u_SpotLight.Position");
Scene3D.SPOTLIGHTDIRECTION = Shader3D.propertyNameToID("u_SpotLight.Direction");
Scene3D.SPOTLIGHTSPOTANGLE = Shader3D.propertyNameToID("u_SpotLight.Spot");
Scene3D.SPOTLIGHTRANGE = Shader3D.propertyNameToID("u_SpotLight.Range");
Scene3D.SPOTLIGHTCOLOR = Shader3D.propertyNameToID("u_SpotLight.Color");
Scene3D.SHADOWDISTANCE = Shader3D.propertyNameToID("u_shadowPSSMDistance");
Scene3D.SHADOWLIGHTVIEWPROJECT = Shader3D.propertyNameToID("u_lightShadowVP");
Scene3D.SHADOWMAPPCFOFFSET = Shader3D.propertyNameToID("u_shadowPCFoffset");
Scene3D.SHADOWMAPTEXTURE1 = Shader3D.propertyNameToID("u_shadowMap1");
Scene3D.SHADOWMAPTEXTURE2 = Shader3D.propertyNameToID("u_shadowMap2");
Scene3D.SHADOWMAPTEXTURE3 = Shader3D.propertyNameToID("u_shadowMap3");
Scene3D.AMBIENTCOLOR = Shader3D.propertyNameToID("u_AmbientColor");
Scene3D.REFLECTIONTEXTURE = Shader3D.propertyNameToID("u_ReflectTexture");
Scene3D.REFLETIONINTENSITY = Shader3D.propertyNameToID("u_ReflectIntensity");
Scene3D.TIME = Shader3D.propertyNameToID("u_Time");
Scene3D.ANGLEATTENUATIONTEXTURE = Shader3D.propertyNameToID("u_AngleTexture");
Scene3D.RANGEATTENUATIONTEXTURE = Shader3D.propertyNameToID("u_RangeTexture");
Scene3D.POINTLIGHTMATRIX = Shader3D.propertyNameToID("u_PointLightMatrix");
Scene3D.SPOTLIGHTMATRIX = Shader3D.propertyNameToID("u_SpotLightMatrix");
