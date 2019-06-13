import { Config } from "Config";
import { Config3D } from "Config3D";
import { ILaya3D } from "ILaya3D";
import { Laya } from "Laya";
import { MeshRenderDynamicBatchManager } from "laya/d3/graphics/MeshRenderDynamicBatchManager";
import { MeshRenderStaticBatchManager } from "laya/d3/graphics/MeshRenderStaticBatchManager";
import { SubMeshDynamicBatch } from "laya/d3/graphics/SubMeshDynamicBatch";
import { SubMeshInstanceBatch } from "laya/d3/graphics/SubMeshInstanceBatch";
import { Physics } from "laya/d3/physics/Physics";
import { PhysicsComponent } from "laya/d3/physics/PhysicsComponent";
import { PhysicsSimulation } from "laya/d3/physics/PhysicsSimulation";
import { BoxColliderShape } from "laya/d3/physics/shape/BoxColliderShape";
import { ColliderShape } from "laya/d3/physics/shape/ColliderShape";
import { CompoundColliderShape } from "laya/d3/physics/shape/CompoundColliderShape";
import { CylinderColliderShape } from "laya/d3/physics/shape/CylinderColliderShape";
import { Scene3DUtils } from "laya/d3/utils/Scene3DUtils";
import { Event } from "laya/events/Event";
import { CommandEncoder } from "laya/layagl/CommandEncoder";
import { LayaGL } from "laya/layagl/LayaGL";
import { Loader } from "laya/net/Loader";
import { LoaderManager } from "laya/net/LoaderManager";
import { URL } from "laya/net/URL";
import { Render } from "laya/renders/Render";
import { Texture2D } from "laya/resource/Texture2D";
import { Handler } from "laya/utils/Handler";
import { RunDriver } from "laya/utils/RunDriver";
import { WebGL } from "laya/webgl/WebGL";
import { WebGLContext } from "laya/webgl/WebGLContext";
import { AnimationClip } from "./laya/d3/animation/AnimationClip";
import { PostProcess } from "./laya/d3/component/PostProcess";
import { Avatar } from "./laya/d3/core/Avatar";
import { BaseMaterial } from "./laya/d3/core/material/BaseMaterial";
import { BlinnPhongMaterial } from "./laya/d3/core/material/BlinnPhongMaterial";
import { EffectMaterial } from "./laya/d3/core/material/EffectMaterial";
import { ExtendTerrainMaterial } from "./laya/d3/core/material/ExtendTerrainMaterial";
import { PBRSpecularMaterial } from "./laya/d3/core/material/PBRSpecularMaterial";
import { PBRStandardMaterial } from "./laya/d3/core/material/PBRStandardMaterial";
import { SkyBoxMaterial } from "./laya/d3/core/material/SkyBoxMaterial";
import { SkyProceduralMaterial } from "./laya/d3/core/material/SkyProceduralMaterial";
import { UnlitMaterial } from "./laya/d3/core/material/UnlitMaterial";
import { WaterPrimaryMaterial } from "./laya/d3/core/material/WaterPrimaryMaterial";
import { MeshRenderer } from "./laya/d3/core/MeshRenderer";
import { MeshSprite3D } from "./laya/d3/core/MeshSprite3D";
import { ShuriKenParticle3D } from "./laya/d3/core/particleShuriKen/ShuriKenParticle3D";
import { ShurikenParticleMaterial } from "./laya/d3/core/particleShuriKen/ShurikenParticleMaterial";
import { PixelLineMaterial } from "./laya/d3/core/pixelLine/PixelLineMaterial";
import { RenderContext3D } from "./laya/d3/core/render/RenderContext3D";
import { ScreenQuad } from "./laya/d3/core/render/ScreenQuad";
import { ScreenTriangle } from "./laya/d3/core/render/ScreenTriangle";
import { RenderableSprite3D } from "./laya/d3/core/RenderableSprite3D";
import { Scene3D } from "./laya/d3/core/scene/Scene3D";
import { SkinnedMeshRenderer } from "./laya/d3/core/SkinnedMeshRenderer";
import { SkinnedMeshSprite3D } from "./laya/d3/core/SkinnedMeshSprite3D";
import { Sprite3D } from "./laya/d3/core/Sprite3D";
import { TrailMaterial } from "./laya/d3/core/trail/TrailMaterial";
import { TrailSprite3D } from "./laya/d3/core/trail/TrailSprite3D";
import { FrustumCulling } from "./laya/d3/graphics/FrustumCulling";
import { HalfFloatUtils } from "./laya/d3/math/HalfFloatUtils";
import { PhysicsSettings } from "./laya/d3/physics/PhysicsSettings";
import { Mesh } from "./laya/d3/resource/models/Mesh";
import { SkyBox } from "./laya/d3/resource/models/SkyBox";
import { SkyDome } from "./laya/d3/resource/models/SkyDome";
import { TextureCube } from "./laya/d3/resource/TextureCube";
import { ShaderData } from "./laya/d3/shader/ShaderData";
import { ShaderInit3D } from "./laya/d3/shader/ShaderInit3D";
import { ShaderInstance } from "./laya/d3/shader/ShaderInstance";
import { Utils3D } from "./laya/d3/utils/Utils3D";
import { PhysicsCollider } from "laya/d3/physics/PhysicsCollider";
import { CharacterController } from "laya/d3/physics/CharacterController";
import { Rigidbody3D } from "laya/d3/physics/Rigidbody3D";
import { Animator } from "laya/d3/component/Animator";
import { Command } from "laya/d3/core/render/command/Command";
import { ClassUtils } from "laya/utils/ClassUtils";
/**
 * <code>Laya3D</code> 类用于初始化3D设置。
 */
export class Laya3D {
    /**
     * 创建一个 <code>Laya3D</code> 实例。
     */
    constructor() {
    }
    /**
     * 获取是否可以启用物理。
     * @param 是否启用物理。
     */
    static get enbalePhysics() {
        return Laya3D._enbalePhysics;
    }
    /**
     *@private
     */
    static _cancelLoadByUrl(url) {
        Laya.loader.cancelLoadByUrl(url);
        Laya3D._innerFirstLevelLoaderManager.cancelLoadByUrl(url);
        Laya3D._innerSecondLevelLoaderManager.cancelLoadByUrl(url);
        Laya3D._innerThirdLevelLoaderManager.cancelLoadByUrl(url);
        Laya3D._innerFourthLevelLoaderManager.cancelLoadByUrl(url);
    }
    /**
     *@private
     */
    static _changeWebGLSize(width, height) {
        WebGL.onStageResize(width, height);
        RenderContext3D.clientWidth = width;
        RenderContext3D.clientHeight = height;
    }
    /**
     *@private
     */
    static __init__(width, height, config) {
        Config.isAntialias = config.isAntialias;
        Config.isAlpha = config.isAlpha;
        Config.premultipliedAlpha = config.premultipliedAlpha;
        Config.isStencil = config.isStencil;
        if (!WebGL.enable()) {
            alert("Laya3D init error,must support webGL!");
            return;
        }
        RunDriver.changeWebGLSize = Laya3D._changeWebGLSize;
        Render.is3DMode = true;
        Laya.init(width, height);
        if (!Render.supportWebGLPlusRendering) {
            LayaGL.instance = WebGLContext.mainContext;
            LayaGL.instance.createCommandEncoder = function (reserveSize = 128, adjustSize = 64, isSyncToRenderThread = false) {
                return new CommandEncoder(this, reserveSize, adjustSize, isSyncToRenderThread);
            };
        }
        ILaya3D.Scene3D = Scene3D;
        ILaya3D.MeshRenderStaticBatchManager = MeshRenderStaticBatchManager;
        ILaya3D.MeshRenderDynamicBatchManager = MeshRenderDynamicBatchManager;
        ILaya3D.SubMeshDynamicBatch = SubMeshDynamicBatch;
        ILaya3D.Laya3D = Laya3D;
        //函数里面会有判断isConchApp
        Laya3D.enableNative3D();
        SubMeshInstanceBatch.__init__();
        SubMeshDynamicBatch.__init__();
        Physics._physics3D = window.Physics3D;
        if (Physics._physics3D) {
            ColliderShape.__init__();
            CompoundColliderShape.__init__();
            PhysicsComponent.__init__();
            PhysicsSimulation.__init__();
            BoxColliderShape.__init__();
            CylinderColliderShape.__init__();
            CharacterController.__init__();
            Rigidbody3D.__init__();
        }
        Mesh.__init__();
        Sprite3D.__init__();
        RenderableSprite3D.__init__();
        MeshSprite3D.__init__();
        SkinnedMeshSprite3D.__init__();
        ShuriKenParticle3D.__init__();
        TrailSprite3D.__init__();
        PostProcess.__init__();
        Scene3D.__init__();
        BaseMaterial.__initDefine__();
        BlinnPhongMaterial.__initDefine__();
        PBRStandardMaterial.__initDefine__();
        PBRSpecularMaterial.__initDefine__();
        SkyProceduralMaterial.__initDefine__();
        UnlitMaterial.__initDefine__();
        TrailMaterial.__initDefine__();
        EffectMaterial.__initDefine__();
        WaterPrimaryMaterial.__initDefine__();
        ShurikenParticleMaterial.__initDefine__();
        ExtendTerrainMaterial.__initDefine__();
        PixelLineMaterial.__initDefine__();
        SkyBoxMaterial.__initDefine__();
        ShaderInit3D.__init__();
        Command.__init__();
        //注册类命,解析的时候需要
        ClassUtils.regClass("Laya.BlinnPhongMaterial", BlinnPhongMaterial);
        ClassUtils.regClass("Laya.SkyProceduralMaterial", SkyProceduralMaterial);
        ClassUtils.regClass("Laya.PBRStandardMaterial", PBRStandardMaterial);
        ClassUtils.regClass("Laya.PBRSpecularMaterial", PBRSpecularMaterial);
        ClassUtils.regClass("Laya.SkyBoxMaterial", SkyBoxMaterial);
        ClassUtils.regClass("Laya.WaterPrimaryMaterial", WaterPrimaryMaterial);
        ClassUtils.regClass("Laya.ExtendTerrainMaterial", ExtendTerrainMaterial);
        ClassUtils.regClass("Laya.ShurikenParticleMaterial", ShurikenParticleMaterial);
        ClassUtils.regClass("Laya.TrailMaterial", TrailMaterial);
        ClassUtils.regClass("Laya.PhysicsCollider", PhysicsCollider);
        ClassUtils.regClass("Laya.CharacterController", CharacterController);
        ClassUtils.regClass("Laya.Animator", Animator);
        ClassUtils.regClass("PhysicsCollider", PhysicsCollider); //兼容
        ClassUtils.regClass("CharacterController", CharacterController); //兼容
        ClassUtils.regClass("Animator", Animator); //兼容
        PixelLineMaterial.defaultMaterial = new PixelLineMaterial();
        BlinnPhongMaterial.defaultMaterial = new BlinnPhongMaterial();
        EffectMaterial.defaultMaterial = new EffectMaterial();
        PBRStandardMaterial.defaultMaterial = new PBRStandardMaterial();
        PBRSpecularMaterial.defaultMaterial = new PBRSpecularMaterial();
        UnlitMaterial.defaultMaterial = new UnlitMaterial();
        ShurikenParticleMaterial.defaultMaterial = new ShurikenParticleMaterial();
        TrailMaterial.defaultMaterial = new TrailMaterial();
        SkyProceduralMaterial.defaultMaterial = new SkyProceduralMaterial();
        SkyBoxMaterial.defaultMaterial = new SkyBoxMaterial();
        WaterPrimaryMaterial.defaultMaterial = new WaterPrimaryMaterial();
        PixelLineMaterial.defaultMaterial.lock = true; //todo:
        BlinnPhongMaterial.defaultMaterial.lock = true;
        EffectMaterial.defaultMaterial.lock = true;
        PBRStandardMaterial.defaultMaterial.lock = true;
        PBRSpecularMaterial.defaultMaterial.lock = true;
        UnlitMaterial.defaultMaterial.lock = true;
        ShurikenParticleMaterial.defaultMaterial.lock = true;
        TrailMaterial.defaultMaterial.lock = true;
        SkyProceduralMaterial.defaultMaterial.lock = true;
        SkyBoxMaterial.defaultMaterial.lock = true;
        WaterPrimaryMaterial.defaultMaterial.lock = true;
        Texture2D.__init__();
        TextureCube.__init__();
        SkyBox.__init__();
        SkyDome.__init__();
        ScreenQuad.__init__();
        ScreenTriangle.__init__();
        FrustumCulling.__init__();
        HalfFloatUtils.__init__();
        var createMap = LoaderManager.createMap;
        createMap["lh"] = [Laya3D.HIERARCHY, Scene3DUtils._parse];
        createMap["ls"] = [Laya3D.HIERARCHY, Scene3DUtils._parseScene];
        createMap["lm"] = [Laya3D.MESH, Mesh._parse];
        createMap["lmat"] = [Laya3D.MATERIAL, BaseMaterial._parse];
        createMap["ltc"] = [Laya3D.TEXTURECUBE, TextureCube._parse];
        createMap["jpg"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["jpeg"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["bmp"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["gif"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["png"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["dds"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["ktx"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["pvr"] = [Laya3D.TEXTURE2D, Texture2D._parse];
        createMap["lani"] = [Laya3D.ANIMATIONCLIP, AnimationClip._parse];
        createMap["lav"] = [Laya3D.AVATAR, Avatar._parse];
        var parserMap = Loader.parserMap;
        parserMap[Laya3D.HIERARCHY] = Laya3D._loadHierarchy;
        parserMap[Laya3D.MESH] = Laya3D._loadMesh;
        parserMap[Laya3D.MATERIAL] = Laya3D._loadMaterial;
        parserMap[Laya3D.TEXTURECUBE] = Laya3D._loadTextureCube;
        parserMap[Laya3D.TEXTURE2D] = Laya3D._loadTexture2D;
        parserMap[Laya3D.ANIMATIONCLIP] = Laya3D._loadAnimationClip;
        parserMap[Laya3D.AVATAR] = Laya3D._loadAvatar;
        //parserMap[Laya3D.TERRAINRES] = _loadTerrain;
        //parserMap[Laya3D.TERRAINHEIGHTDATA] = _loadTerrain;
        Laya3D._innerFirstLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
        Laya3D._innerSecondLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
        Laya3D._innerThirdLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
        Laya3D._innerFourthLevelLoaderManager.on(Event.ERROR, null, Laya3D._eventLoadManagerError);
    }
    static enableNative3D() {
        if (Render.isConchApp) {
            //LayaGL = (window as any).LayaGLContext;
            var shaderData = ShaderData;
            var shader3D = ShaderInstance;
            var skinnedMeshRender = SkinnedMeshRenderer;
            var avatar = Avatar;
            var frustumCulling = FrustumCulling;
            var meshRender = MeshRenderer;
            if (Render.supportWebGLPlusRendering) {
                //替换ShaderData的函数
                shaderData.prototype._initData = shaderData.prototype._initDataForNative;
                shaderData.prototype.setBool = shaderData.prototype.setBoolForNative;
                shaderData.prototype.getBool = shaderData.prototype.getBoolForNative;
                shaderData.prototype.setInt = shaderData.prototype.setIntForNative;
                shaderData.prototype.getInt = shaderData.prototype.getIntForNative;
                shaderData.prototype.setNumber = shaderData.prototype.setNumberForNative;
                shaderData.prototype.getNumber = shaderData.prototype.getNumberForNative;
                shaderData.prototype.setVector = shaderData.prototype.setVectorForNative;
                shaderData.prototype.getVector = shaderData.prototype.getVectorForNative;
                shaderData.prototype.setVector2 = shaderData.prototype.setVector2ForNative;
                shaderData.prototype.getVector2 = shaderData.prototype.getVector2ForNative;
                shaderData.prototype.setVector3 = shaderData.prototype.setVector3ForNative;
                shaderData.prototype.getVector3 = shaderData.prototype.getVector3ForNative;
                shaderData.prototype.setQuaternion = shaderData.prototype.setQuaternionForNative;
                shaderData.prototype.getQuaternion = shaderData.prototype.getQuaternionForNative;
                shaderData.prototype.setMatrix4x4 = shaderData.prototype.setMatrix4x4ForNative;
                shaderData.prototype.getMatrix4x4 = shaderData.prototype.getMatrix4x4ForNative;
                shaderData.prototype.setBuffer = shaderData.prototype.setBufferForNative;
                shaderData.prototype.getBuffer = shaderData.prototype.getBufferForNative;
                shaderData.prototype.setTexture = shaderData.prototype.setTextureForNative;
                shaderData.prototype.getTexture = shaderData.prototype.getTextureForNative;
                shaderData.prototype.setAttribute = shaderData.prototype.setAttributeForNative;
                shaderData.prototype.getAttribute = shaderData.prototype.getAttributeForNative;
                shaderData.prototype.cloneTo = shaderData.prototype.cloneToForNative;
                shaderData.prototype.getData = shaderData.prototype.getDataForNative;
                shader3D.prototype._uniformMatrix2fv = shader3D.prototype._uniformMatrix2fvForNative;
                shader3D.prototype._uniformMatrix3fv = shader3D.prototype._uniformMatrix3fvForNative;
                shader3D.prototype._uniformMatrix4fv = shader3D.prototype._uniformMatrix4fvForNative;
                meshRender.prototype._renderUpdateWithCamera = meshRender.prototype._renderUpdateWithCameraForNative;
            }
            //Matrix4x4.multiply = Matrix4x4.multiplyForNative;
            if (Render.supportWebGLPlusCulling) {
                frustumCulling.renderObjectCulling = FrustumCulling.renderObjectCullingNative;
            }
            if (Render.supportWebGLPlusAnimation) {
                avatar.prototype._cloneDatasToAnimator = avatar.prototype._cloneDatasToAnimatorNative;
                // FloatKeyframe = window.conchFloatKeyframe;
                // Vector3Keyframe = window.conchFloatArrayKeyframe;
                // QuaternionKeyframe = window.conchFloatArrayKeyframe;
                // KeyframeNode = window.conchKeyframeNode;
                // KeyframeNodeList = window.conchKeyframeNodeList;
                var animationClip = AnimationClip;
                animationClip.prototype._evaluateClipDatasRealTime = animationClip.prototype._evaluateClipDatasRealTimeForNative;
                skinnedMeshRender.prototype.supportWebGLPlusAnimation = skinnedMeshRender.prototype.supportWebGLPlusAnimationForNative;
            }
        }
        WebGL.shaderHighPrecision = false;
        var precisionFormat = LayaGL.instance.getShaderPrecisionFormat(WebGLContext.FRAGMENT_SHADER, WebGLContext.HIGH_FLOAT);
        precisionFormat.precision ? WebGL.shaderHighPrecision = true : WebGL.shaderHighPrecision = false;
    }
    /**
     *@private
     */
    static formatRelativePath(base, value) {
        var path;
        path = base + value;
        var char1 = value.charAt(0);
        if (char1 === ".") {
            var parts = path.split("/");
            for (var i = 0, len = parts.length; i < len; i++) {
                if (parts[i] == '..') {
                    var index = i - 1;
                    if (index > 0 && parts[index] !== '..') {
                        parts.splice(index, 2);
                        i -= 2;
                    }
                }
            }
            path = parts.join('/');
        }
        return path;
    }
    /**
     * @private
     */
    static _endLoad(loader, content = null, subResous = null) {
        if (subResous) {
            for (var i = 0, n = subResous.length; i < n; i++) {
                var resou = Loader.getRes(subResous[i]);
                (resou) && (resou._removeReference()); //加载失败SubResous为空
            }
        }
        loader.endLoad(content);
    }
    /**
     *@private
     */
    static _eventLoadManagerError(msg) {
        Laya.loader.event(Event.ERROR, msg);
    }
    /**
     *@private
     */
    static _addHierarchyInnerUrls(urls, urlMap, urlVersion, hierarchyBasePath, path, type, constructParams = null, propertyParams = null) {
        var formatUrl = Laya3D.formatRelativePath(hierarchyBasePath, path);
        (urlVersion) && (formatUrl = formatUrl + urlVersion);
        urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
        urlMap.push(formatUrl);
        return formatUrl;
    }
    /**
     *@private
     */
    static _getSprite3DHierarchyInnerUrls(node, firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath) {
        var i, n;
        var props = node.props;
        switch (node.type) {
            case "Scene3D": //TODO:应该自动序列化类型
                var lightmaps = props.lightmaps;
                for (i = 0, n = lightmaps.length; i < n; i++) {
                    var lightMap = lightmaps[i];
                    lightMap.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, lightMap.path, Laya3D.TEXTURE2D, lightMap.constructParams, lightMap.propertyParams);
                }
                var reflectionTextureData = props.reflectionTexture;
                (reflectionTextureData) && (props.reflectionTexture = Laya3D._addHierarchyInnerUrls(thirdLevelUrls, subUrls, urlVersion, hierarchyBasePath, reflectionTextureData, Laya3D.TEXTURECUBE));
                if (props.sky) {
                    var skyboxMaterial = props.sky.material;
                    (skyboxMaterial) && (skyboxMaterial.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMaterial.path, Laya3D.MATERIAL));
                }
                break;
            case "Camera":
                var skyboxMatData = props.skyboxMaterial;
                (skyboxMatData) && (skyboxMatData.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, skyboxMatData.path, Laya3D.MATERIAL));
                break;
            case "TrailSprite3D":
            case "MeshSprite3D":
            case "SkinnedMeshSprite3D":
                var meshPath = props.meshPath;
                (meshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, meshPath, Laya3D.MESH));
                var materials = props.materials;
                if (materials)
                    for (i = 0, n = materials.length; i < n; i++)
                        materials[i].path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, materials[i].path, Laya3D.MATERIAL);
                break;
            case "ShuriKenParticle3D":
                var parMeshPath = props.meshPath;
                (parMeshPath) && (props.meshPath = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, parMeshPath, Laya3D.MESH));
                props.material.path = Laya3D._addHierarchyInnerUrls(secondLevelUrls, subUrls, urlVersion, hierarchyBasePath, props.material.path, Laya3D.MATERIAL);
                break;
            case "Terrain":
                Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, props.dataPath, Laya3D.TERRAINRES);
                break;
        }
        var components = node.components;
        if (components) {
            for (var k = 0, p = components.length; k < p; k++) {
                var component = components[k];
                switch (component.type) {
                    case "Animator":
                        var avatarPath = component.avatarPath;
                        var avatarData = component.avatar;
                        (avatarData) && (avatarData.path = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, avatarData.path, Laya3D.AVATAR));
                        var clipPaths = component.clipPaths;
                        if (!clipPaths) {
                            var layersData = component.layers;
                            for (i = 0; i < layersData.length; i++) {
                                var states = layersData[i].states;
                                for (var j = 0, m = states.length; j < m; j++) {
                                    var clipPath = states[j].clipPath;
                                    (clipPath) && (states[j].clipPath = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPath, Laya3D.ANIMATIONCLIP));
                                }
                            }
                        }
                        else {
                            for (i = 0, n = clipPaths.length; i < n; i++)
                                clipPaths[i] = Laya3D._addHierarchyInnerUrls(fourthLelUrls, subUrls, urlVersion, hierarchyBasePath, clipPaths[i], Laya3D.ANIMATIONCLIP);
                        }
                        break;
                    case "PhysicsCollider":
                    case "Rigidbody3D":
                    case "CharacterController":
                        var shapes = component.shapes;
                        for (i = 0; i < shapes.length; i++) {
                            var shape = shapes[i];
                            if (shape.type === "MeshColliderShape") {
                                var mesh = shape.mesh;
                                (mesh) && (shape.mesh = Laya3D._addHierarchyInnerUrls(firstLevelUrls, subUrls, urlVersion, hierarchyBasePath, mesh, Laya3D.MESH));
                            }
                        }
                        break;
                }
            }
        }
        var children = node.child;
        for (i = 0, n = children.length; i < n; i++)
            Laya3D._getSprite3DHierarchyInnerUrls(children[i], firstLevelUrls, secondLevelUrls, thirdLevelUrls, fourthLelUrls, subUrls, urlVersion, hierarchyBasePath);
    }
    /**
     *@private
     */
    static _loadHierarchy(loader) {
        loader.on(Event.LOADED, null, Laya3D._onHierarchylhLoaded, [loader]);
        loader.load(loader.url, Loader.JSON, false, null, true);
    }
    /**
     *@private
     */
    static _onHierarchylhLoaded(loader, lhData) {
        var url = loader.url;
        var urlVersion = Utils3D.getURLVerion(url);
        var hierarchyBasePath = URL.getPath(url);
        var firstLevUrls = [];
        var secondLevUrls = [];
        var thirdLevUrls = [];
        var forthLevUrls = [];
        var subUrls = [];
        Laya3D._getSprite3DHierarchyInnerUrls(lhData.data, firstLevUrls, secondLevUrls, thirdLevUrls, forthLevUrls, subUrls, urlVersion, hierarchyBasePath);
        var urlCount = firstLevUrls.length + secondLevUrls.length + forthLevUrls.length;
        var totalProcessCount = urlCount + 1;
        var weight = 1 / totalProcessCount;
        Laya3D._onProcessChange(loader, 0, weight, 1.0);
        if (forthLevUrls.length > 0) {
            var processCeil = urlCount / totalProcessCount;
            var processHandler = Handler.create(null, Laya3D._onProcessChange, [loader, weight, processCeil], false);
            Laya3D._innerFourthLevelLoaderManager._create(forthLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerForthLevResouLoaded, [loader, processHandler, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight + processCeil * forthLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
        }
        else {
            Laya3D._onHierarchyInnerForthLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, weight, processCeil);
        }
    }
    /**
     *@private
     */
    static _onHierarchyInnerForthLevResouLoaded(loader, processHandler, lhData, subUrls, firstLevUrls, secondLevUrls, thirdLevUrls, processOffset, processCeil) {
        (processHandler) && (processHandler.recover());
        if (thirdLevUrls.length > 0) {
            var process = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
            Laya3D._innerThirdLevelLoaderManager._create(thirdLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerThirdLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
        }
        else {
            Laya3D._onHierarchyInnerThirdLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset, processCeil);
        }
    }
    /**
     *@private
     */
    static _onHierarchyInnerThirdLevResouLoaded(loader, processHandler, lhData, subUrls, firstLevUrls, secondLevUrls, processOffset, processCeil) {
        (processHandler) && (processHandler.recover());
        if (secondLevUrls.length > 0) {
            var process = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
            Laya3D._innerSecondLevelLoaderManager._create(secondLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerSecondLevResouLoaded, [loader, process, lhData, subUrls, firstLevUrls, processOffset + processCeil * secondLevUrls.length, processCeil]), processHandler, null, null, null, 1, true);
        }
        else {
            Laya3D._onHierarchyInnerSecondLevResouLoaded(loader, null, lhData, subUrls, firstLevUrls, processOffset, processCeil);
        }
    }
    /**
     *@private
     */
    static _onHierarchyInnerSecondLevResouLoaded(loader, processHandler, lhData, subUrls, firstLevUrls, processOffset, processCeil) {
        (processHandler) && (processHandler.recover());
        if (firstLevUrls.length > 0) {
            var process = Handler.create(null, Laya3D._onProcessChange, [loader, processOffset, processCeil], false);
            Laya3D._innerFirstLevelLoaderManager._create(firstLevUrls, false, Handler.create(null, Laya3D._onHierarchyInnerFirstLevResouLoaded, [loader, process, lhData, subUrls]), processHandler, null, null, null, 1, true);
        }
        else {
            Laya3D._onHierarchyInnerFirstLevResouLoaded(loader, null, lhData, subUrls);
        }
    }
    /**
     *@private
     */
    static _onHierarchyInnerFirstLevResouLoaded(loader, processHandler, lhData, subUrls) {
        (processHandler) && (processHandler.recover());
        loader._cache = loader._createCache;
        var item = lhData.data.type === "Scene3D" ? Scene3DUtils._parseScene(lhData, loader._propertyParams, loader._constructParams) : Scene3DUtils._parse(lhData, loader._propertyParams, loader._constructParams);
        Laya3D._endLoad(loader, item, subUrls);
    }
    /**
     *@private
     */
    static _loadMesh(loader) {
        loader.on(Event.LOADED, null, Laya3D._onMeshLmLoaded, [loader]);
        loader.load(loader.url, Loader.BUFFER, false, null, true);
    }
    /**
     *@private
     */
    static _onMeshLmLoaded(loader, lmData) {
        loader._cache = loader._createCache;
        var mesh = Mesh._parse(lmData, loader._propertyParams, loader._constructParams);
        Laya3D._endLoad(loader, mesh);
    }
    /**
     *@private
     */
    static _loadMaterial(loader) {
        loader.on(Event.LOADED, null, Laya3D._onMaterilLmatLoaded, [loader]);
        loader.load(loader.url, Loader.JSON, false, null, true);
    }
    /**
     *@private
     */
    static _onMaterilLmatLoaded(loader, lmatData) {
        var url = loader.url;
        var urlVersion = Utils3D.getURLVerion(url);
        var materialBasePath = URL.getPath(url);
        var urls = [];
        var subUrls = [];
        var customProps = lmatData.customProps;
        var formatSubUrl;
        var version = lmatData.version;
        switch (version) {
            case "LAYAMATERIAL:01":
            case "LAYAMATERIAL:02":
                var i, n;
                var textures = lmatData.props.textures;
                if (textures) {
                    for (i = 0, n = textures.length; i < n; i++) {
                        var tex2D = textures[i];
                        var tex2DPath = tex2D.path;
                        if (tex2DPath) {
                            formatSubUrl = Laya3D.formatRelativePath(materialBasePath, tex2DPath);
                            (urlVersion) && (formatSubUrl = formatSubUrl + urlVersion);
                            urls.push({ url: formatSubUrl, constructParams: tex2D.constructParams, propertyParams: tex2D.propertyParams }); //不指定类型,自动根据后缀判断Texture2D或TextureCube
                            subUrls.push(formatSubUrl);
                            tex2D.path = formatSubUrl;
                        }
                    }
                }
                break;
            default:
                throw new Error("Laya3D:unkonwn version.");
        }
        var urlCount = urls.length;
        var totalProcessCount = urlCount + 1;
        var lmatWeight = 1 / totalProcessCount;
        Laya3D._onProcessChange(loader, 0, lmatWeight, 1.0);
        if (urlCount > 0) {
            var processHandler = Handler.create(null, Laya3D._onProcessChange, [loader, lmatWeight, urlCount / totalProcessCount], false);
            Laya3D._innerFourthLevelLoaderManager._create(urls, false, Handler.create(null, Laya3D._onMateialTexturesLoaded, [loader, processHandler, lmatData, subUrls]), processHandler, null, null, null, 1, true); //TODO:还有可能是TextureCube,使用三级
        }
        else {
            Laya3D._onMateialTexturesLoaded(loader, null, lmatData, null);
        }
    }
    /**
     *@private
     */
    static _onMateialTexturesLoaded(loader, processHandler, lmatData, subUrls) {
        loader._cache = loader._createCache;
        var mat = BaseMaterial._parse(lmatData, loader._propertyParams, loader._constructParams);
        Laya3D._endLoad(loader, mat, subUrls);
        (processHandler) && (processHandler.recover());
    }
    /**
     *@private
     */
    static _loadAvatar(loader) {
        loader.on(Event.LOADED, null, function (data) {
            loader._cache = loader._createCache;
            var avatar = Avatar._parse(data, loader._propertyParams, loader._constructParams);
            Laya3D._endLoad(loader, avatar);
        });
        loader.load(loader.url, Loader.JSON, false, null, true);
    }
    /**
     *@private
     */
    static _loadAnimationClip(loader) {
        loader.on(Event.LOADED, null, function (data) {
            loader._cache = loader._createCache;
            var clip = AnimationClip._parse(data, loader._propertyParams, loader._constructParams);
            Laya3D._endLoad(loader, clip);
        });
        loader.load(loader.url, Loader.BUFFER, false, null, true);
    }
    /**
     *@private
     */
    static _loadTexture2D(loader) {
        var url = loader.url;
        var index = url.lastIndexOf('.') + 1;
        var verIndex = url.indexOf('?');
        var endIndex = verIndex == -1 ? url.length : verIndex;
        var ext = url.substr(index, endIndex - index);
        var type;
        switch (ext) {
            case "jpg":
            case "jpeg":
            case "bmp":
            case "gif":
            case "png":
                type = "nativeimage";
                break;
            case "dds":
            case "ktx":
            case "pvr":
                type = Loader.BUFFER;
                break;
        }
        //需要先注册,否则可能同步加载完成没来得及注册就完成
        loader.on(Event.LOADED, null, function (image) {
            loader._cache = loader._createCache;
            var tex = Texture2D._parse(image, loader._propertyParams, loader._constructParams);
            Laya3D._endLoad(loader, tex);
        });
        loader.load(loader.url, type, false, null, true);
    }
    /**
     *@private
     */
    static _loadTextureCube(loader) {
        loader.on(Event.LOADED, null, Laya3D._onTextureCubeLtcLoaded, [loader]);
        loader.load(loader.url, Loader.JSON, false, null, true);
    }
    /**
     *@private
     */
    static _onTextureCubeLtcLoaded(loader, ltcData) {
        var ltcBasePath = URL.getPath(loader.url);
        var urls = [Laya3D.formatRelativePath(ltcBasePath, ltcData.front), Laya3D.formatRelativePath(ltcBasePath, ltcData.back), Laya3D.formatRelativePath(ltcBasePath, ltcData.left), Laya3D.formatRelativePath(ltcBasePath, ltcData.right), Laya3D.formatRelativePath(ltcBasePath, ltcData.up), Laya3D.formatRelativePath(ltcBasePath, ltcData.down)];
        var ltcWeight = 1.0 / 7.0;
        Laya3D._onProcessChange(loader, 0, ltcWeight, 1.0);
        var processHandler = Handler.create(null, Laya3D._onProcessChange, [loader, ltcWeight, 6 / 7], false);
        Laya3D._innerFourthLevelLoaderManager.load(urls, Handler.create(null, Laya3D._onTextureCubeImagesLoaded, [loader, urls, processHandler]), processHandler, "nativeimage");
    }
    /**
     *@private
     */
    static _onTextureCubeImagesLoaded(loader, urls, processHandler) {
        var images = new Array(6);
        for (var i = 0; i < 6; i++)
            images[i] = Loader.getRes(urls[i]);
        loader._cache = loader._createCache;
        var tex = TextureCube._parse(images, loader._propertyParams, loader._constructParams);
        processHandler.recover();
        for (i = 0; i < 6; i++)
            Loader.clearRes(urls[i]);
        Laya3D._endLoad(loader, tex);
    }
    /**
     *@private
     */
    static _onProcessChange(loader, offset, weight, process) {
        process = offset + process * weight;
        (process < 1.0) && (loader.event(Event.PROGRESS, process));
    }
    /**
     * 初始化Laya3D相关设置。
     * @param	width  3D画布宽度。
     * @param	height 3D画布高度。
     */
    static init(width, height, config = null, compolete = null) {
        if (Laya3D._isInit)
            return;
        Laya3D._isInit = true;
        config = config || Config3D._default;
        config.cloneTo(Laya3D._config);
        FrustumCulling.debugFrustumCulling = config.debugFrustumCulling;
        Laya3D._editerEnvironment = Laya3D._config._editerEnvironment;
        Scene3D._enbalePhysics = Laya3D._enbalePhysics;
        Scene3D.octreeCulling = config.octreeCulling;
        Scene3D.octreeInitialSize = config.octreeInitialSize;
        Scene3D.octreeInitialCenter = config.octreeInitialCenter;
        Scene3D.octreeMinNodeSize = config.octreeMinNodeSize;
        Scene3D.octreeLooseness = config.octreeLooseness;
        var physics3D = window.Physics3D;
        if (physics3D == null) {
            Laya3D._enbalePhysics = Scene3D._enbalePhysics = false;
            Laya3D.__init__(width, height, Laya3D._config);
            compolete && compolete.run();
        }
        else {
            Laya3D._enbalePhysics = Scene3D._enbalePhysics = true;
            physics3D(Laya3D._config.defaultPhysicsMemory * 1024 * 1024).then(function () {
                Laya3D.__init__(width, height, Laya3D._config);
                compolete && compolete.run();
            });
        }
    }
}
/**Hierarchy资源。*/
Laya3D.HIERARCHY = "HIERARCHY"; //兼容
/**Mesh资源。*/
Laya3D.MESH = "MESH"; //兼容
/**Material资源。*/
Laya3D.MATERIAL = "MATERIAL"; //兼容
/**Texture2D资源。*/
Laya3D.TEXTURE2D = "TEXTURE2D"; //兼容
/**TextureCube资源。*/
Laya3D.TEXTURECUBE = "TEXTURECUBE"; //兼容
/**AnimationClip资源。*/
Laya3D.ANIMATIONCLIP = "ANIMATIONCLIP"; //兼容
/**Avatar资源。*/
Laya3D.AVATAR = "AVATAR"; //兼容
/**Terrain资源。*/
Laya3D.TERRAINHEIGHTDATA = "TERRAINHEIGHTDATA";
/**Terrain资源。*/
Laya3D.TERRAINRES = "TERRAIN";
/**@private */
Laya3D._innerFirstLevelLoaderManager = new LoaderManager(); //Mesh 
/**@private */
Laya3D._innerSecondLevelLoaderManager = new LoaderManager(); //Material
/**@private */
Laya3D._innerThirdLevelLoaderManager = new LoaderManager(); //TextureCube、TerrainResou
/**@private */
Laya3D._innerFourthLevelLoaderManager = new LoaderManager(); //Texture2D、Image、Avatar、AnimationClip
/**@private */
Laya3D._isInit = false;
/**@private */
Laya3D._enbalePhysics = false;
/**@private */
Laya3D._editerEnvironment = false;
/**@private */
Laya3D._config = new Config3D();
/**@private */
Laya3D.physicsSettings = new PhysicsSettings(); //TODO:
