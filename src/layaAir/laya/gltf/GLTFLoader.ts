
import { Laya } from "../../Laya";
import { Handler } from "../utils/Handler";
import { Loader } from "../net/Loader";
import { URL } from "../net/URL";
import { Sprite3D } from "../d3/core/Sprite3D";
import { URLItem, GLTF, GLTFNode, GLTFScene, GLTFMesh, GLTFPrimitive, GLTFAttributes, GLTFAccessor, GLTFBufferView, GLTFAccessorType, GLTFBuffer, GLTFComponentType, GLTFSubMesh, GLTFMaterial, GLTFPbrMetallicRoughness, GLTFTexture, GLTFTextureInfo, GLTFSampler, GLTFImage, GLTFSkin, GLTFAnimation, GLTFChannel, GLTFTarget, GLTFAnimationSampler, GLTFMorphTarget, GLTFClipNode, GLTFSkinData } from "./GLTFInterfaces";
import { Matrix4x4 } from "../d3/math/Matrix4x4";
import { Vector3 } from "../d3/math/Vector3";
import { Quaternion } from "../d3/math/Quaternion";
import { MeshSprite3D } from "../d3/core/MeshSprite3D";
import { Mesh, skinnedMatrixCache } from "../d3/resource/models/Mesh";
import { VertexDeclaration } from "../d3/graphics/VertexDeclaration";
import { VertexMesh } from "../d3/graphics/Vertex/VertexMesh";
import { Texture2D } from "../resource/Texture2D";
import { FilterMode } from "../resource/FilterMode";
import { VertexBuffer3D } from "../d3/graphics/VertexBuffer3D";
import { IndexBuffer3D } from "../d3/graphics/IndexBuffer3D";
import { IndexFormat } from "../d3/graphics/IndexFormat";
import { SubMesh } from "../d3/resource/models/SubMesh";
import { PBRStandardMaterial } from "../d3/core/material/PBRStandardMaterial";
import { MeshRenderer } from "../d3/core/MeshRenderer";
import { Material } from "../d3/core/material/Material";
import { Vector4 } from "../d3/math/Vector4";
import { TextureFormat } from "../resource/TextureFormat";
import { WarpMode } from "../resource/WrapMode";
import { PBRRenderMode } from "../d3/core/material/PBRMaterial";
import { RenderState } from "../d3/core/material/RenderState";
import { SkinnedMeshSprite3D } from "../d3/core/SkinnedMeshSprite3D";
import { SkinnedMeshRenderer } from "../d3/core/SkinnedMeshRenderer";
import { Animator } from "../d3/component/Animator";
import { Scene3D } from "../d3/core/scene/Scene3D";
import { AnimatorControllerLayer } from "../d3/component/AnimatorControllerLayer";
import { AnimatorState } from "../d3/component/AnimatorState";
import { AnimationClip } from "../d3/animation/AnimationClip";
import { KeyframeNodeList } from "../d3/animation/KeyframeNodeList";
import { KeyframeNode } from "../d3/animation/KeyframeNode";
import { Vector3Keyframe } from "../d3/core/Vector3Keyframe";
import { QuaternionKeyframe } from "../d3/core/QuaternionKeyframe";
import { GLTFBase64Tool } from "./GLTFBase64Tool";
import { Utils } from "../utils/Utils";
import { LayaGL } from "../layagl/LayaGL";

/**
 * <code>GLTFLoader</code> 类可用来加载 gltf 文件
 * 支持 gltf 2.0 非二进制文件 非 相机， 灯光 节点解析
 */
export class GLTFLoader {

    /**@internal 单次提交最大骨骼数量*/
    static maxSubBoneCount: number = 24;
    /** temp root name */
    /**@internal */
    static ROOTNAME: string = "GLTF_Root";
    /**@internal */
    static GLTFIMAGETYPE: string = "nativeimage";

    static loadedMap: { [key: string]: any } = {};
    static textureMap: { [key: string]: any } = {};


    /**@internal */
    static gltfAttributeOrder: string[] = ["POSITION", "NORMAL", "COLOR_0", "TEXCOORD_0", "TEXCOORD_1", "WEIGHTS_0", "JOINTS_0", "TANGENT", "JOINTS_1", "WEIGHTS_1"];
    /**@internal */
    static layaAttributeOrder: string[] = ["POSITION", "NORMAL", "COLOR", "UV", "UV1", "BLENDWEIGHT", "BLENDINDICES", "TANGENT", "JOINTS_1", "WEIGHTS_1"];

    /**@internal */
    private _gltf: GLTF;
    /**@internal */
    private gltfBuffers: ArrayBuffer[];
    /**@internal */
    private gltfImages: any[];

    private _onLoaded: Handler;

    /**@internal */
    public gltfRoot: Sprite3D;

    /**@internal */
    _spriteNodes: Sprite3D[];

    /** 设置默认材质，节点材质会设置位此材质的克隆 支持解析 PBR 相关参数 */
    public static defaultMatrial: Material;

    /** 扩展解析函数对象 */
    public extraFunc: any = {
        meshExtras: undefined,
        materialExtras: undefined
    };

    constructor() {
        this.gltfBuffers = [];
        this.gltfImages = [];
        GLTFLoader.defaultMatrial || (GLTFLoader.defaultMatrial = new PBRStandardMaterial());
    }

    /**
     * @internal
     * 清空当前加载数据
     */
    clearData() {
        this._gltf = null;
        // this._onLoaded = null;
        this.gltfRoot = null;

        this._spriteNodes = [];
        this.gltfBuffers = [];
        this.gltfImages = [];
    }
    /**
     * @internal
     * 销毁对象
     */
    destroy() {
        this._gltf = null;
        this._onLoaded = null;

        this.gltfRoot = null;

        this._spriteNodes = null;
        this.gltfBuffers = null;
        this.gltfImages = null;

    }

    /**
     * 加载 gltf 资源
     * @param url 资源地址或数组 | {url: string, type: JSON}
     * @param complate 加载回调函数
     */
    loadGLTF(url:Array<{[key:string]:string}>, complate?: Handler) {
        this._onLoaded = complate;

        // todo 
        if (!(url instanceof Array)) {
            url = [url];
        }

        // 过滤 url
        var gltfItems: any[] = [];
        var otherItems: any[] = [];
        url.forEach(value => {

            if (!value)
               return true;

            var urlStr: string;
            if (typeof (value) == 'string') {
                urlStr = value;
            }
            else {
                urlStr = value.url;
            }
            var fileType: string = Utils.getFileExtension(urlStr);
            if (fileType == "gltf") {
                gltfItems.push(value);
            }
            else {
                otherItems.push(value);
            }
            return true;
        });

        var allScuess = true;
        var itemCount = gltfItems.length;
        var loadedCount = 0;
        var loadedFlags = new Array<boolean>(itemCount).fill(false);

        gltfItems.forEach((item, gltfIndex) => {
            var base: string = URL.getPath(item.url);

            var completehandler = Handler.create(this, (item: any, content: any = null)=> {
                loadedCount++;
                var gltfContext = {
                    urlItem: item,
                    base: base,
                    loadedCount: loadedCount,
                    itemCount: itemCount,
                    loadedFlags: loadedFlags
                };
                var loadItems: any[] = [];
                //只代表gltf文件是否加载成功
                content || (allScuess = false);
                var gltfObject = Loader.getRes(gltfContext.urlItem.url) as GLTF;
                // buffers
                if (gltfObject.buffers) {
                    gltfObject.buffers.forEach((buffer) => {
                        if (!GLTFBase64Tool.isBase64String(buffer.uri)) {
                            loadItems.push({ url: base + buffer.uri, type: Loader.BUFFER });
                        }
                    });
                }
                // image
                if (gltfObject.images) {
                    gltfObject.images.forEach(image => {
                        if (GLTFBase64Tool.isBase64String(image.uri)) {
                            loadItems.push({ url: image.uri, type: GLTFLoader.GLTFIMAGETYPE });
                        }
                        else {
                            loadItems.push({ url: base + image.uri, type: GLTFLoader.GLTFIMAGETYPE });
                        }
                    });
                }
                // other assets
                if (gltfIndex == 0) {
                    loadItems.push(...otherItems);
                }

                // load all assets
                if (loadItems.length) {
                    var extraCompletehandler = Handler.create(this, (item: any, success: boolean)=> {
                        success || (allScuess = false);
                        this.collectionLoadItems(gltfContext, allScuess, success);
                    }, [item]);
                    Laya.loader.create(loadItems, extraCompletehandler);
                }
                else {
                    this.collectionLoadItems(gltfContext, allScuess, true);
                }

            }, [item]);



            Laya.loader.create([item], completehandler);
        },this);

        // 不存在gltf资源， 加载普通资源并回调
        if (gltfItems.length == 0) {
            Laya.loader.create(otherItems, complate);
        }

    }

    /**
     * @intrenal
     * @param gltfContext 
     * @param allScuess 
     * @param succeed 
     */
    collectionLoadItems(gltfContext: any, allScuess: boolean, succeed: boolean) {

        this.onLoaded(gltfContext, allScuess, succeed);
    }

    /**
     * @intrenal
     */
    onLoaded(gltfContext: any, allScuess: boolean, succeed: boolean) {
        var urlItem: URLItem = gltfContext.urlItem;
        var loadedCount: number = gltfContext.loadedCount;
        var itemCount: number = gltfContext.itemCount;
        var base: string = gltfContext.base;
        var loadedFlags: boolean[] = gltfContext.loadedFlags;
        loadedFlags[loadedCount - 1] = true;
        var allLoaded: boolean = true;
        loadedFlags.forEach(value => {
            allLoaded = allLoaded && value;
        });

        if (!succeed) {
            // todo  加载失败
            console.warn("[error]Failed to parse:", urlItem.url);
        }
        else if (GLTFLoader.loadedMap[URL.formatURL(urlItem.url)]) {
            // 已经存在 避免重复加载

        }
        else {

            this._gltf = Loader.getRes(urlItem.url);
            var version: string = this._gltf.asset.version;

            if (version !== "2.0") {
                console.warn("only support gltf 2.0!");
                succeed = false;
            }
            else {
                // buffer
                if (this._gltf.buffers) {
                    this._gltf.buffers.forEach((buffer: GLTFBuffer, index: number) => {
                        if (!GLTFBase64Tool.isBase64String(buffer.uri)) {
                            this.gltfBuffers[index] = Loader.getRes(base + buffer.uri);
                        }
                        else {
                            // 去除 base64 头
                            var base64 = buffer.uri.replace(GLTFBase64Tool.reghead, "");
                            this.gltfBuffers[index] = GLTFBase64Tool.decode(base64);
                        }
                    })
                }
                // image
                if (this._gltf.images) {
                    this._gltf.images.forEach((image, index) => {
                        var imageUrl: string;
                        if (GLTFBase64Tool.isBase64String(image.uri)) {
                            imageUrl = image.uri;
                        }
                        else {
                            imageUrl = base + image.uri;
                        }
                        this.gltfImages[index] = Loader.getRes(imageUrl);
                    });
                }

                var rootName: string = URL.getFileName(urlItem.url);
                this.gltfParse(rootName);
                // console.log(`gltf done: ${rootName}`);

                // 解析 根节点 添加到 loadmap 中
                GLTFLoader.loadedMap[URL.formatURL(urlItem.url)] = this.gltfRoot;
            }
        }

        // 清除暂存数据
        this.clearData();
        gltfContext = null;

        if (allLoaded) {
            this._onLoaded && this._onLoaded.runWith([succeed && allScuess]);
        }
    }

    /**
     * 获取指定资源地址的资源或纹理。
	 * @param	url 资源地址。
	 * @return	返回资源。
     */
    static getRes(url: string): any {
        // todo image map
        return GLTFLoader.loadedMap[URL.formatURL(url)];
    }

    /**
     * 清理指定资源地址的缓存。 
     * @param url 资源地址。
     */
    static clearRes(url: string): void {
        var formatUrl = URL.formatURL(url);
        var res = GLTFLoader.loadedMap[formatUrl];
        (res) && (delete GLTFLoader.loadedMap[formatUrl]);

        Loader.clearRes(url);
    }

    /**
     * @internal
     * 解析 gltf 对象
     */
    gltfParse(rootName: string) {

        // node
        if (this._gltf.nodes) {
            var nodes: GLTFNode[] = this._gltf.nodes;
            var spriteNodes: Sprite3D[] = new Array<Sprite3D>(nodes.length);
            this._spriteNodes = spriteNodes;
            nodes.forEach((node: GLTFNode, index: number) => {
                var spriteNode: Sprite3D = this.gltfParseNode(node, spriteNodes, index);
                // spriteNodes[index] = spriteNode;

                // todo 节点子父级关系表示， 将parent 属性转换为children属性, 方便构建层次 
            });
        }

        // todo  多scene
        if (this._gltf.scenes) {
            // todo  scene  根节点
            var sceneIndex: number = this._gltf.scene || 0;
            var gltfScene: GLTFScene = this._gltf.scenes[sceneIndex];
            var sceneName: string = rootName;
            // todo 临时创建根节点， 代替场景管理nodes
            this.gltfRoot = new Sprite3D(sceneName);
            this.gltfParseScene(gltfScene, this.gltfRoot);
        }

        // 组织完节点树后 计算 SkinnedMeshSprite3D render localBounds
        this._spriteNodes.forEach(sprite => {
            if (sprite instanceof SkinnedMeshSprite3D) {
                GLTFLoader.calSkinnedSpriteLocalBounds(sprite);
            }
        });

        // Animator
        if (this._gltf.animations) {
            var aniamtions: GLTFAnimation[] = this._gltf.animations;
            aniamtions.forEach((animation: GLTFAnimation, index: number) => {
                this.gltfParseAniamtion(animation, index);
            });
        }
    }

    /**
     * @internal
     * 解析 gltf scene 节点
     * @param gltfScene 
     * @param sceneRoot 
     */
    gltfParseScene(gltfScene: GLTFScene, sceneRoot: Sprite3D) {
        var sceneNodesIndex: number[] = gltfScene.nodes;
        var nodes: GLTFNode[] = this._gltf.nodes;
        if (sceneNodesIndex || nodes) {
            sceneNodesIndex.forEach(index => {
                var node: GLTFNode = nodes[index];
                var sprite: Sprite3D = this._spriteNodes[index];
                //  todo 构建树形结构, 子父级节点关系
                sceneRoot.addChild(sprite);
                this.buildHierarchy(node, sprite, 1);
            });
        }
    }

    /**
     * @internal
     * 解析 animation 节点
     * @param animation 
     * @param index 
     */
    gltfParseAniamtion(animation: GLTFAnimation, index: number): void {
        var channels: GLTFChannel[] = animation.channels;
        var samplers: GLTFAnimationSampler[] = animation.samplers;

        // todo  root 确定
        var animatorRoot: Sprite3D = this.getAnimationRoot(channels);

        var duration: number = 0;
        // parse gltf channel 
        var clipNodes: GLTFClipNode[] = new Array<GLTFClipNode>(channels.length);
        channels.forEach((channel: GLTFChannel, index: number) => {
            var clipNode: GLTFClipNode = clipNodes[index] = <GLTFClipNode>{};
            // target
            var target: GLTFTarget = channel.target;
            var spriteNode: GLTFNode = this._gltf.nodes[target.node];
            var sprite: Sprite3D = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);

            // var fullpath: string = this.getAniamtionPath(animatorRoot, sprite);

            // sampler
            var sampler: GLTFAnimationSampler = samplers[channel.sampler];
            var samplerInAccessor: GLTFAccessor = this._gltf.accessors[sampler.input];
            var samplerOutAccessor: GLTFAccessor = this._gltf.accessors[sampler.output];
            // in 计时器buffer， 每个数据是一个时间点
            var timeBuffer: ArrayBuffer = this.getAccessorBuffer(samplerInAccessor);
            // out 对应时间点的数据
            var outBuffer: ArrayBuffer = this.getAccessorBuffer(samplerOutAccessor);

            clipNode.paths = this.getAniamtionPath(animatorRoot, sprite);
            clipNode.propertyOwner = "transform";
            clipNode.propertyLength = 1;
            clipNode.propertise = [];
            switch (target.path) {
                case "translation":
                    clipNode.propertise.push("localPosition");
                    clipNode.type = 1;
                    break;
                case "rotation":
                    clipNode.propertise.push("localRotation");
                    clipNode.type = 2;
                    break;
                case "scale":
                    clipNode.propertise.push("localScale");
                    clipNode.type = 3;
                    break;
            }
            clipNode.timeArray = new Float32Array(timeBuffer);
            clipNode.valueArray = new Float32Array(outBuffer);

            clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
            duration = Math.max(duration, clipNode.duration);
        });


        var animator: Animator = <Animator>animatorRoot.addComponent(Animator);
        var layerName: string = animation.name ? animation.name : "Aniamtor" + index;
        var animatorLayer: AnimatorControllerLayer = new AnimatorControllerLayer(layerName);


        // todo  new clip
        var clip: AnimationClip = new AnimationClip();
        // todo clip name
        clip.name = "clip name";
        // todo
        clip._duration = duration;
        clip.islooping = true;
        clip._frameRate = 30;
        var nodeCount: number = clipNodes.length;
        var nodes: KeyframeNodeList = clip._nodes;
        nodes.count = nodeCount;
        var nodesMap: any = clip._nodesMap = {};
        var nodesDic: any = clip._nodesDic = {};
        for (var i: number = 0; i < nodeCount; i++) {
            var node: KeyframeNode = new KeyframeNode();

            var gLTFClipNode: GLTFClipNode = clipNodes[i];

            nodes.setNodeByIndex(i, node);
            node._indexInList = i;
            // todo type
            var type: number = node.type = gLTFClipNode.type;
            var pathLength: number = gLTFClipNode.paths.length;
            node._setOwnerPathCount(pathLength);
            // todo
            var tempPath: string[] = gLTFClipNode.paths;
            for (var j: number = 0; j < pathLength; j++) {
                node._setOwnerPathByIndex(j, tempPath[j]);
            }
            var nodePath: string = node._joinOwnerPath("/");
            var mapArray: KeyframeNode[] = nodesMap[nodePath];
            (mapArray) || (nodesMap[nodePath] = mapArray = []);
            mapArray.push(node);
            node.propertyOwner = gLTFClipNode.propertyOwner;
            var propertyLength: number = gLTFClipNode.propertyLength;
            node._setPropertyCount(propertyLength);
            for (var j: number = 0; j < propertyLength; j++) {
                node._setPropertyByIndex(j, gLTFClipNode.propertise[j]);
            }
            var fullPath: string = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
            nodesDic[fullPath] = fullPath;
            node.fullPath = fullPath;

            var keyframeCount: number = gLTFClipNode.timeArray.length;

            // laya animation version "LAYAANIMATION:04"
            for (var j: number = 0; j < keyframeCount; j++) {
                switch (type) {
                    case 0:
                        break;
                    case 1: // local position
                    case 3: // local scale
                    case 4: // local euler angler raw
                        var floatArrayKeyframe: Vector3Keyframe = new Vector3Keyframe();
                        node._setKeyframeByIndex(j, floatArrayKeyframe);
                        var startTime: number = floatArrayKeyframe.time = gLTFClipNode.timeArray[j];
                        var inTangent: Vector3 = floatArrayKeyframe.inTangent;
                        var outTangent: Vector3 = floatArrayKeyframe.outTangent;
                        var value: Vector3 = floatArrayKeyframe.value;
                        // todo tangent
                        inTangent.setValue(0, 0, 0);
                        outTangent.setValue(0, 0, 0);
                        value.setValue(gLTFClipNode.valueArray[3 * j], gLTFClipNode.valueArray[3 * j + 1], gLTFClipNode.valueArray[3 * j + 2]);
                        break;
                    case 2: // local rotation
                        var quaternionKeyframe: QuaternionKeyframe = new QuaternionKeyframe();
                        node._setKeyframeByIndex(j, quaternionKeyframe);
                        var startTime: number = quaternionKeyframe.time = gLTFClipNode.timeArray[j];
                        var inTangentQua: Vector4 = quaternionKeyframe.inTangent;
                        var outTangentQua: Vector4 = quaternionKeyframe.outTangent;
                        var valueQua: Quaternion = quaternionKeyframe.value;
                        // todo tangent
                        inTangentQua.setValue(0, 0, 0, 0);
                        outTangentQua.setValue(0, 0, 0, 0);
                        valueQua.x = gLTFClipNode.valueArray[4 * j];
                        valueQua.y = gLTFClipNode.valueArray[4 * j + 1];
                        valueQua.z = gLTFClipNode.valueArray[4 * j + 2];
                        valueQua.w = gLTFClipNode.valueArray[4 * j + 3];
                        break;
                }
            }
        }

        // todo event 无


        var animatorState: AnimatorState = new AnimatorState();
        // todo  state name
        animatorState.name = "state name";
        animatorState.clip = clip;
        animatorLayer.addState(animatorState);
        animatorLayer.defaultState = animatorState;
        animatorLayer.playOnWake = true;
        // todo  culling Mdoe
        // animator.cullingMode = ;

        animator.addControllerLayer(animatorLayer);
        animatorLayer.defaultWeight = 1.0;
        return;
    }

    /**
     * @internal
     * 获取 动画 根节点
     */
    getAnimationRoot(channels: GLTFChannel[]): Sprite3D {
        var curDepth: number = Number.MAX_VALUE;
        var topSprites: Sprite3D[] = [];
        channels.forEach((channel: GLTFChannel, index: number) => {
            var target: GLTFTarget = channel.target;
            var spriteNode: GLTFNode = this._gltf.nodes[target.node];
            if (spriteNode.hierarchyDepth < curDepth) {
                curDepth = spriteNode.hierarchyDepth;
                var sprite: Sprite3D = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);
                topSprites = [sprite];
            }
            else if (spriteNode.hierarchyDepth == curDepth) {
                var sprite: Sprite3D = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);
                topSprites.push(sprite);
            }
        });

        if (topSprites.length == 1) {
            return <Sprite3D>topSprites[0];
        }
        // todo 临时 使用根节点作为 Animation root
        return this.gltfRoot;
    }

    /**
     * @internal
     * 获取 动画路径信息
     * @param root 
     * @param curSprite 
     */
    getAniamtionPath(root: Sprite3D, curSprite: Sprite3D): string[] {
        var paths: string[] = [];
        if (root == curSprite)
            return paths;

        var sprite: Sprite3D = curSprite;
        while (sprite.parent != root || sprite.parent instanceof Scene3D) {
            sprite = <Sprite3D>sprite.parent;
            // path = sprite.name + "/" + path;
            paths.push(sprite.name);
        }
        paths = paths.reverse();
        paths.push(curSprite.name);
        return paths;
    }

    /**
     * @internal
     * 构建节点父子关系
     */
    buildHierarchy(node: GLTFNode, sprite: Sprite3D, hierarchyDepth: number) {
        if (node.children !== undefined) {
            node.children.forEach(element => {
                var childNode: GLTFNode = this._gltf.nodes[element];
                childNode.hierarchyDepth = hierarchyDepth;
                var childSprite: Sprite3D = this._spriteNodes[element];
                sprite.addChild(childSprite);
                this.buildHierarchy(childNode, childSprite, hierarchyDepth + 1);
            });
        }
    }

    /**
     * @internal
     * 解析节点信息
     */
    gltfParseNode(node: GLTFNode, spriteNodes: Sprite3D[], index: number): Sprite3D {
        // 若已经加载， 跳过解析
        if (spriteNodes[index]) {
            return spriteNodes[index];
        }

        if (!node) {
            return null;
        }

        /**
         * node.mesh && node.skin --- skinned mesh render
         * node.mesh 
         */
        var res: Sprite3D;
        var name: string = node.name;
        if (node.mesh !== undefined && node.skin !== undefined) {
            // skinned mesh sprite
            // todo
            var skin: GLTFSkin = this._gltf.skins[node.skin];
            var skinData: GLTFSkinData = this.gltfParseSkins(skin);

            var materials: Material[] = [];
            var mesh: Mesh = this.gltfParseMesh(this._gltf.meshes[node.mesh], materials, skinData);

            // mesh apply skin data
            this.meshApplySkinData(mesh, skinData);
            res = new SkinnedMeshSprite3D(mesh, name);
            var skinMeshRender: SkinnedMeshRenderer = (<SkinnedMeshSprite3D>res).skinnedMeshRenderer;

            var rootBone: Sprite3D = skinData.rootBone;
            var bones: Sprite3D[] = skinData.bones;
            skinMeshRender.rootBone = rootBone;
            skinMeshRender.bones.push(...bones);

            skinMeshRender.sharedMaterials = materials;
        }
        else if (node.mesh !== undefined) {
            // mesh sprite
            var materials: Material[] = [];
            var mesh: Mesh = this.gltfParseMesh(this._gltf.meshes[node.mesh], materials);

            res = new MeshSprite3D(mesh, name);
            var meshRender: MeshRenderer = (<MeshSprite3D>res).meshRenderer;
            meshRender.sharedMaterials = materials;
        }
        else {
            // sprite
            res = new Sprite3D(name);
        }

        // apply transform
        if (node.matrix) {
            var localMatrix: Matrix4x4 = res.transform.localMatrix;
            localMatrix.elements.set(node.matrix);
            res.transform.localMatrix = localMatrix;
        }
        else {
            var localPosition: Vector3 = res.transform.localPosition;
            var localRotation: Quaternion = res.transform.localRotation;
            var localScale: Vector3 = res.transform.localScale;
            node.translation && localPosition.fromArray(node.translation);
            node.rotation && localRotation.fromArray(node.rotation);
            node.scale && localScale.fromArray(node.scale);
            res.transform.localPosition = localPosition;
            res.transform.localRotation = localRotation;
            res.transform.localScale = localScale;
        }

        spriteNodes[index] = res;
        return res;
    }

    /**
     * @internal
     * 解析蒙皮信息
     */
    gltfParseSkins(skin: GLTFSkin): GLTFSkinData {
        var accessor: GLTFAccessor = this._gltf.accessors[skin.inverseBindMatrices];
        // todo new FloatArray(accessor.buffer) 清除格式差异 ？
        var inverseBindMatricesArray: Float32Array = <Float32Array>this.getAccessorBuffer(accessor);
        var skeletonNodeIndex: number = skin.skeleton;
        var skeletonNode: GLTFNode = this._gltf.nodes[skeletonNodeIndex];
        // 根骨骼
        var skeletonSprite: Sprite3D = this.gltfParseNode(skeletonNode, this._spriteNodes, skeletonNodeIndex);

        // 骨骼节点列表
        var jointsNodeIndex: number[] = skin.joints;
        // 骨骼数量
        var bonesCount: number = jointsNodeIndex.length;
        var boneNames: string[] = new Array<string>(bonesCount);
        var boneSprites: Sprite3D[] = [];
        jointsNodeIndex.forEach((value, index) => {
            // todo 没有name的node？
            var node: GLTFNode = this._gltf.nodes[value];
            boneNames[index] = node.name;
            boneSprites[index] = this.gltfParseNode(node, this._spriteNodes, value);
        });

        var skinData: GLTFSkinData = <GLTFSkinData>{};
        skinData.boneNames = boneNames;
        skinData.bones = boneSprites;
        skinData.boneCount = skinData.bones.length;
        skinData.rootBone = skeletonSprite ? skeletonSprite : boneSprites[0];
        skinData.inverseBindMatricesArray = inverseBindMatricesArray;

        return skinData;
    }

    /**
     * @internal
     * mesh 应用蒙皮信息
     */
    meshApplySkinData(mesh: Mesh, skinData: GLTFSkinData) {
        mesh._boneNames = skinData.boneNames;
        mesh._inverseBindPoses = [];
        mesh._inverseBindPosesBuffer = skinData.inverseBindMatricesArray.buffer;
        mesh._setInstanceBuffer(Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL);
        var bonesCount: number = skinData.boneNames.length;
        for (var i: number = 0; i < bonesCount; i++) {
            var bindPosesArrayOffset: number = 16 * i;
            var matElement: Float32Array = skinData.inverseBindMatricesArray.slice(bindPosesArrayOffset, bindPosesArrayOffset + 16);
            mesh._inverseBindPoses[i] = new Matrix4x4(
                matElement[0], matElement[1], matElement[2], matElement[3],
                matElement[4], matElement[5], matElement[6], matElement[7],
                matElement[8], matElement[9], matElement[10], matElement[11],
                matElement[12], matElement[13], matElement[14], matElement[15],
                matElement
            );
        }

        var subCount: number = mesh.subMeshCount;

        for (var subIndex: number = 0; subIndex < subCount; subIndex++) {
            var submesh: SubMesh = mesh.getSubMesh(subIndex);
            var skinnedCache: skinnedMatrixCache[] = mesh._skinnedMatrixCaches;
            skinnedCache.length = mesh._inverseBindPoses.length;
            var drawCount: number = submesh._subIndexBufferStart.length;
            for (var drawIndex: number = 0; drawIndex < drawCount; drawIndex++) {
                var boneIndices: Uint16Array = submesh._boneIndicesList[drawIndex];
                for (var bni: number = 0; bni < boneIndices.length; bni++) {
                    var bn: number = boneIndices[bni];
                    skinnedCache[bn] || (skinnedCache[bn] = new skinnedMatrixCache(subIndex, drawIndex, bni));
                }
            }
        }

        for (var p: number = 0; p < skinnedCache.length; p++) {
            if (!skinnedCache[p]) {
                skinnedCache[p] = new skinnedMatrixCache(0, 0, 0);
            }
        }

    }

    /**
     * @internal
     * 计算 SkinnedMeshSprite3D local bounds
     * @param skinned SkinnedMeshSprite3D
     */
    static calSkinnedSpriteLocalBounds(skinned: SkinnedMeshSprite3D) {
        var render: SkinnedMeshRenderer = skinned.skinnedMeshRenderer;
        var mesh: Mesh = skinned.meshFilter.sharedMesh;
        var rootBone: Sprite3D = render.rootBone;

        var oriRootMatrix: Matrix4x4 = rootBone.transform.worldMatrix;
        var invertRootMatrix: Matrix4x4 = new Matrix4x4();
        oriRootMatrix.invert(invertRootMatrix);

        var indices = mesh.getIndices();

        var positions: Vector3[] = [];
        var boneIndices: Vector4[] = [];
        var boneWeights: Vector4[] = [];
        mesh.getPositions(positions);
        mesh.getBoneIndices(boneIndices);
        mesh.getBoneWeights(boneWeights);

        var oriBoneIndeices: Vector4[] = [];
        // 还原 bone index
        mesh._subMeshes.forEach((subMesh: SubMesh, index: number) => {
            var bonelists: Uint16Array[] = subMesh._boneIndicesList;
            bonelists.forEach((bonelist: Uint16Array, listIndex: number) => {
                var start: number = subMesh._subIndexBufferStart[listIndex];
                var count: number = subMesh._subIndexBufferCount[listIndex];
                var endIndex: number = count + start;
                for (let iindex = start; iindex < endIndex; iindex++) {
                    var ii: number = indices[iindex];
                    var boneIndex: Vector4 = boneIndices[ii];
                    var x: number = bonelist[boneIndex.x];
                    var y: number = bonelist[boneIndex.y];
                    var z: number = bonelist[boneIndex.z];
                    var w: number = bonelist[boneIndex.w];
                    oriBoneIndeices[ii] = new Vector4(x, y, z, w);
                }
            });
        });


        var inverseBindPoses: Matrix4x4[] = mesh._inverseBindPoses;
        var bones: Sprite3D[] = render.bones;
        var ubones: Matrix4x4[] = [];
        var tempMat: Matrix4x4 = new Matrix4x4();
        bones.forEach((bone, index) => {
            ubones[index] = new Matrix4x4();
            Matrix4x4.multiply(invertRootMatrix, bone.transform.worldMatrix, tempMat);
            Matrix4x4.multiply(tempMat, inverseBindPoses[index], ubones[index]);
        });

        var skinTransform: Matrix4x4 = new Matrix4x4;
        var resPos: Vector3 = new Vector3();
        var min: Vector3 = new Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
        var max: Vector3 = new Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);

        positions.forEach((pos: Vector3, index: number) => {
            var boneIndex: Vector4 = oriBoneIndeices[index];
            var boneWeight: Vector4 = boneWeights[index];

            for (let ei = 0; ei < 16; ei++) {
                skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
                skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
                skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
                skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
            }
            Vector3.transformV3ToV3(pos, skinTransform, resPos);
            Vector3.min(min, resPos, min);
            Vector3.max(max, resPos, max);
        });

        positions = null;
        boneIndices = boneWeights = oriBoneIndeices = null;
        indices = null;
        ubones = null;

        render.localBounds.setMin(min);
        render.localBounds.setMax(max);
    }

    /**
     * @internal
     * 生成 mesh
     * materials
     * @param gltfmesh 
     * @param materials                            
     */
    gltfParseMesh(gltfmesh: GLTFMesh, materials: Material[], skinData?: GLTFSkinData): Mesh {


        if (gltfmesh.extras && this.extraFunc && this.extraFunc.meshExtras) {
            this.extraFunc.meshExtras(gltfmesh)();
        }

        // // todo extras
        // if (gltfmesh.extras && gltfmesh.extras.targetNames) {
        //     var targetNames: string[] = gltfmesh.extras.targetNames;
        //     // todo 附加 参数对象
        //     var faceCfg: any = Loader.getRes("res/self/gltfMode/gltfBin/face.1.json");
        //     for (const key in faceCfg.blendshape) {
        //         var wi: number = targetNames.indexOf(key);
        //         gltfmesh.weights[wi] = faceCfg.blendshape[key];
        //     }
        // }

        var primitives: GLTFPrimitive[] = gltfmesh.primitives;
        var gltfSubMeshs: GLTFSubMesh[] = new Array<GLTFSubMesh>(primitives.length);

        var meshVertexArrLength: number = 0;
        var meshIndexArrLength: number = 0;

        var shapeWeights: number[] = gltfmesh.weights;

        primitives.forEach((primitive, index) => {
            /**
             * primitives 结构 转换成 submesh
             * 1. 提取 primitives 中 attributes buffer， 每个 primitive 合并成一个 buffer
             *  - 对 attributes 排序， 保证 primitives buffer 顺序一致
             * 2. 合并所有 primitive buffer, 为 laya mesh buffer(考虑indexbuffer, 一同合并)
             */
            /**
             * todo
             * 构建结构，分析 primitive, 记录 submesh 需要属性
             *  - attribute buffer / vertexbuffer
             *  - vertex count 顶点个数
             *  - 
             */

            var gltfSubMesh: GLTFSubMesh = <GLTFSubMesh>{};


            // render mode
            // todo 处理非默认 渲染模式 数据
            gltfSubMesh.renderMode = primitive.mode;
            /**
             * 为了方便 laya 渲染， 若不存在 indexbuffer, 创建一个新的 顺序 buffer
             * todo 处理 render mode 可以重排 index ?
             */
            var primitiveIndexBuffer: Uint32Array;
            if (primitive.indices !== undefined) {
                primitiveIndexBuffer = this.gltfPrimitiveIndexBuffer(primitive);
            }
            else {
                primitiveIndexBuffer = new Uint32Array(gltfSubMesh.vertexCount);
                for (var i: number = 0; i < gltfSubMesh.vertexCount; i++) {
                    primitiveIndexBuffer[i] = i;
                }
            }
            // todo 反转ib
            gltfSubMesh.indexArray = primitiveIndexBuffer.reverse();


            // todo targets Morph 变形
            var targets: GLTFMorphTarget[] = primitive.targets;
            var targetCount: number = targets ? targets.length : 0;
            var morphtargets: Array<Map<string, Float32Array>> = new Array(targetCount);

            // todo mesh extras 定义 morph target weight
            var targetNames: string[] = gltfmesh.extras ? gltfmesh.extras.targetNames : null;
            targets && targets.forEach((target: GLTFMorphTarget, index: number) => {
                morphtargets[index] = new Map<string, Float32Array>();
                // todo blend shape 名字
                var targetName: string = targetNames ? targetNames[index] : "target " + index;
                for (const key in target) {
                    var targetAccessor: GLTFAccessor = this._gltf.accessors[(target as any)[key]];
                    var buffer: ArrayBuffer = this.getAccessorBuffer(targetAccessor);
                    var targetArray: Float32Array = new Float32Array(buffer);
                    // todo 支持的三个attribute string gltf与laya 一致， 省略转换
                    morphtargets[index].set(key, targetArray);
                }
            });

            // submesh
            this.gltfPrimitiveSubMesh(gltfSubMesh, primitive, morphtargets, shapeWeights, skinData);
            gltfSubMeshs[index] = gltfSubMesh;

            // todo 清理 morphtargets 数组
            morphtargets = null;

            // todo material exten
            if (primitive.material !== undefined) {
                gltfSubMesh.gltfMaterial = this._gltf.materials[primitive.material];
            }

            // 统计 mesh vb ib 长度
            meshVertexArrLength += gltfSubMesh.vertexArray.length;
            meshIndexArrLength += gltfSubMesh.indexArray.length;
        });

        // todo material 层次
        var resMesh: Mesh = this.generatMesh(gltfSubMeshs, meshVertexArrLength, meshIndexArrLength, gltfmesh.name);
        this.getMaterials(gltfSubMeshs, materials);

        return resMesh;
    }

    /**
     * @internal
     * 应用 Morph target 形变
     * @param gltfSubMesh 
     * @param morphtargets 
     * @param weights 
     */
    applyMorphtargets(gltfSubMesh: Map<string, Float32Array>, morphtargets: Array<Map<string, Float32Array>>, weights: number[]) {
        morphtargets.forEach((morphtarget: Map<string, Float32Array>, index: number) => {
            morphtarget.forEach((array: Float32Array, key: string) => {
                if (gltfSubMesh.has(key)) {
                    var oriArray: Float32Array = gltfSubMesh.get(key);
                    var weight: number = weights[index];
                    for (var i: number = 0, n: number = oriArray.length; i < n; i++) {
                        oriArray[i] += weight * array[i];
                    }
                }
            });
        });
    }

    /**
     * @internal
     * 获取 mesh 上材质列表
     * @param gltfSubMeshs 
     * @param materials 
     */
    getMaterials(gltfSubMeshs: GLTFSubMesh[], materials: Material[]) {
        materials.length = gltfSubMeshs.length;
        gltfSubMeshs.forEach((gltfSubMesh, index) => {
            // 无材质节点会赋值 默认材质
            if (gltfSubMesh.gltfMaterial == undefined) {
                materials[index] = GLTFLoader.defaultMatrial;
            }
            else {
                materials[index] = this.gltfParseMaterial(gltfSubMesh.gltfMaterial);
            }
        });
    }

    /**
     * @internal
     * 解析 material
     */
    gltfParseMaterial(gltfMaterial: GLTFMaterial): Material {
        var mat: Material;

        // todo  处理 extensions 定义材质类型
        // 普通节点材质 按照 pbr 解析
        mat = GLTFLoader.defaultMatrial.clone();
        var material: PBRStandardMaterial = <PBRStandardMaterial>mat;
        for (const key in gltfMaterial) {
            switch (key) {
                case "pbrMetallicRoughness":
                    this.gltfParsePbrMetallicRoughness(gltfMaterial.pbrMetallicRoughness, material);
                    break;
                case "normalTexture":
                    var textureInfo: GLTFTextureInfo = gltfMaterial[key];
                    var normalTexture: Texture2D = this.gltfGetTextureWithInfo(textureInfo);
                    material.normalTexture = normalTexture;
                    (textureInfo.scale !== undefined) && (material.normalTextureScale = textureInfo.scale);
                    break;
                case "occlusionTexture":
                    var textureInfo: GLTFTextureInfo = gltfMaterial[key];
                    var occlusionTexture: Texture2D = this.gltfGetTextureWithInfo(textureInfo);
                    material.occlusionTexture = occlusionTexture;
                    (textureInfo.strength !== undefined) && (material.occlusionTextureStrength = textureInfo.strength);
                    break;
                case "emissiveTexture":
                    var textureInfo: GLTFTextureInfo = gltfMaterial[key];
                    var emissionTexture: Texture2D = this.gltfGetTextureWithInfo(textureInfo);
                    material.emissionTexture = emissionTexture;
                    break;
                case "emissiveFactor":
                    var emissive: Vector4 = material.emissionColor;
                    emissive.fromArray(gltfMaterial[key]);
                    material.emissionColor = emissive;
                    break;
                case "alphaMode":
                    var renderMode: PBRRenderMode;
                    switch (gltfMaterial.alphaMode) {
                        case "OPAQUE":
                            renderMode = PBRRenderMode.Opaque;
                            break;
                        case "MASK":
                            renderMode = PBRRenderMode.Cutout;
                            break;
                        case "BLEND":
                            renderMode = PBRRenderMode.Transparent;
                            break;
                    }
                    material.renderMode = renderMode;
                    break;
                case "alphaCutoff":
                    material.alphaTestValue = gltfMaterial.alphaCutoff;
                    break;
                case "doubleSided":
                    if (gltfMaterial.doubleSided) {
                        material.cull = RenderState.CULL_NONE;
                    }
                    break;
            }
        }
        mat.name = gltfMaterial.name;

        if (gltfMaterial.extras && this.extraFunc && this.extraFunc.materialExtras) {
            this.extraFunc.materialExtras(this, gltfMaterial, mat)();
        }

        return mat;
    }

    /**
     * @internal
     * 解析 金属流 pbr 参数
     */
    gltfParsePbrMetallicRoughness(pbrMetallicRoughness: GLTFPbrMetallicRoughness, material: PBRStandardMaterial) {
        for (const key in pbrMetallicRoughness) {
            switch (key) {
                case "baseColorFactor":
                    var baseColor: Vector4 = material.albedoColor;
                    baseColor.fromArray(pbrMetallicRoughness.baseColorFactor);
                    material.albedoColor = baseColor;
                    break;
                case "baseColorTexture":
                    var textureInfo: GLTFTextureInfo = pbrMetallicRoughness.baseColorTexture;
                    var colorTex: Texture2D = this.gltfGetTextureWithInfo(textureInfo);
                    material.albedoTexture = colorTex;
                    break;
                case "metallicFactor":
                    var metallic: number = pbrMetallicRoughness.metallicFactor;
                    material.metallic = metallic;
                    break;
                case "roughnessFactor":
                    var roughness: number = pbrMetallicRoughness.roughnessFactor;
                    material.smoothness = 1.0 - roughness;
                    break;
                case "metallicRoughnessTexture":
                    var textureInfo: GLTFTextureInfo = pbrMetallicRoughness.metallicRoughnessTexture;
                    var metallicGlossTexture: Texture2D = this.gltfGetTextureWithInfo(textureInfo);
                    material.metallicGlossTexture = metallicGlossTexture;
                    break;
            }
        }
    }

    /**
     * @internal
     * 获取 texture 信息
     */
    gltfGetTextureWithInfo(textureInfo: GLTFTextureInfo): Texture2D {
        if (!textureInfo)
            return null;
        var gltfTex: GLTFTexture = this._gltf.textures[textureInfo.index];
        var texture: Texture2D = this.gltfParseTexture(gltfTex);
        return texture;
    }

    /**
     * @internal
     * 解析 textuer
     */
    gltfParseTexture(gltfTexture: GLTFTexture): Texture2D {
        var image: any = this.gltfImages[gltfTexture.source];
        if (!image) {
            var gltfImage: GLTFImage = this._gltf.images[gltfTexture.source];
            image = this.gltfParseImageFromBufferView(gltfImage);
        }

        // 是否需要 mipmap
        if (gltfTexture.sampler != undefined) {
            var sampler: GLTFSampler = this._gltf.samplers[gltfTexture.sampler];
        }
        else {
            var sampler: GLTFSampler = {};
        }

        var magFilter: number = sampler.magFilter;
        var minFilter: number = sampler.minFilter;

        var texWdith: number = image["width"];
        var texHeight: number = image["height"];
        var mipmap: boolean = this.needMipMap(magFilter, minFilter);
        var filterMode: FilterMode = this.getFilterMode(magFilter, minFilter, mipmap);
        // todo texture format 控制?
        var tex: Texture2D = new Texture2D(texWdith, texHeight, TextureFormat.R8G8B8A8, mipmap);
        tex.loadImageSource(image);
        // filterMode
        tex.filterMode = filterMode;
        // warp mode
        var warpV: WarpMode = this.getWarpMode(sampler.wrapT);
        var warpU: WarpMode = this.getWarpMode(sampler.wrapS);
        tex.wrapModeV = warpV;
        tex.wrapModeU = warpU;

        GLTFLoader.textureMap[image.src] = tex;
        return tex;
    }

    /**
     * @internal
     * 根据 filter 判断是否需要 mipmap
     * @param magFilter 
     * @param minFilter 
     */
    needMipMap(magFilter: number, minFilter: number): boolean {
        if (magFilter && minFilter) {

        }
        return true;
    }

    /**
     * @internal
     * 获取 flitermode
     */
    getFilterMode(magFilter: number, minFilter: number, mipmap: boolean): FilterMode {
        var gl: WebGLRenderingContext = LayaGL.instance;
        // todo 判断方法
        if (magFilter == gl.NEAREST) {
            return FilterMode.Point;
        }
        else if (magFilter == gl.LINEAR) {
            if (mipmap && minFilter == gl.LINEAR_MIPMAP_LINEAR) {
                return FilterMode.Trilinear;
            }
            else {
                return FilterMode.Bilinear;
            }
        }
        return FilterMode.Point;
    }

    /**
     * @internal
     * 获取 WarpMode
     */
    getWarpMode(value: number): WarpMode {
        var gl: WebGLRenderingContext = LayaGL.instance;
        switch (value) {
            case gl.REPEAT:
                return WarpMode.Repeat;
                break;
            case gl.CLAMP_TO_EDGE:
                return WarpMode.Repeat;
                break;
            case gl.MIRRORED_REPEAT:
            default:
                return WarpMode.Repeat;
                break;
        }
    }

    /**
     * @internal
     * 根据 bufferView解析图片
     */
    gltfParseImageFromBufferView(gltfImage: GLTFImage): any {

        // todo 从bufferview 创建图片
        if (gltfImage.bufferView !== undefined) {
            // todo buffer 读取 图片
            gltfImage.mimeType;
            console.warn("warning: don't support bufferView image!");
        }
    }

    /**
     * @internal
     * 获取 primitive (as submesh) GLTFSubMesh
     * @param primitive 
     */
    gltfPrimitiveSubMesh(gltfSubMesh: GLTFSubMesh, primitive: GLTFPrimitive, morphtargets: Array<Map<string, Float32Array>>, shapeWeights: number[], skinData?: GLTFSkinData): GLTFSubMesh {

        var attributes: GLTFAttributes = primitive.attributes;
        var attributeMap: Map<string, Float32Array> = new Map();

        // 按照数组顺序定义 attribute
        var gltfOrder: string[] = GLTFLoader.gltfAttributeOrder;
        var layaOrder: string[] = GLTFLoader.layaAttributeOrder;

        var declarStr: string = "";
        var splitFlag: boolean = false;
        var count: number = 0;
        var floatArrayLength: number = 0;
        gltfOrder.forEach((key: string, index: number) => {
            if (key in attributes) {
                var accessor: GLTFAccessor = this._gltf.accessors[(attributes as any)[key]];
                // 特殊 处理 color， 与  Morph Target 形变 数据 (POSITION, NORMAL, and TANGENT)
                count = accessor.count;
                var buffer = this.getAccessorBuffer(accessor);
                // 数组类型转换
                var floatArray: Float32Array = new Float32Array(buffer);

                // 此属性拼接vb中所占数据长度 Float32Array
                var fl: number = floatArray.length;
                // bone index 特殊处理 ? 兼容?
                if (key == "JOINTS_0") {
                    fl /= 4;
                }

                floatArrayLength += fl;

                var layaAttribute: string = layaOrder[index];
                attributeMap.set(layaAttribute, floatArray);
                if (splitFlag)
                    declarStr += ",";
                else
                    splitFlag = true;
                declarStr += layaAttribute;
            }
        });

        // 在合并之前 添加 morph targets
        this.applyMorphtargets(attributeMap, morphtargets, shapeWeights);


        // boneIndices list
        var boneIndicesList: Array<Uint16Array> = gltfSubMesh.boneIndicesList = new Array<Uint16Array>();
        var subIndexStartArray: number[] = gltfSubMesh.subIndexStartArray = [];
        var subIndexCountArray: number[] = gltfSubMesh.subIndexCountArray = [];

        if (attributeMap.has("BLENDINDICES")) {

            if (skinData.boneCount <= GLTFLoader.maxSubBoneCount) {
                // 小于 24 块  赋固定值
                subIndexStartArray[0] = 0;
                subIndexCountArray[0] = gltfSubMesh.indexArray.length;
                boneIndicesList[0] = new Uint16Array(skinData.boneCount);
                for (var bi: number = 0; bi < skinData.boneCount; bi++) {
                    boneIndicesList[0][bi] = bi;
                }
            }
            else {
                // 大于24块 处理submesh与vb
                this.splitSubMeshByBonesCount(attributeMap, gltfSubMesh.indexArray, skinData, boneIndicesList, subIndexStartArray, subIndexCountArray);

                // 有可能增添顶点 从新计算大小
                count = attributeMap.get("BLENDINDICES").length / 4;
                floatArrayLength = 0;
                attributeMap.forEach((value: Float32Array, key: string) => {
                    var fl: number = value.length;
                    if (key == "BLENDINDICES") {
                        fl /= 4;
                    }
                    floatArrayLength += fl;
                });
            }

            // 将float32array 数据 压入 uint8array
            var biuint8Array: Uint8Array = new Uint8Array(attributeMap.get("BLENDINDICES"));
            attributeMap.set("BLENDINDICES", new Float32Array(biuint8Array.buffer));
        }
        else {
            subIndexStartArray[0] = 0;
            subIndexCountArray[0] = gltfSubMesh.indexArray.length;
        }

        var vertexArray: Float32Array = this.mergeOnePrimitiveArray(floatArrayLength, count, attributeMap);

        // todo 清理 attributeMap 中 buffer
        attributeMap.clear();

        gltfSubMesh.vertexArray = vertexArray;
        gltfSubMesh.vertexCount = count;
        gltfSubMesh.vertexDeclarationStr = declarStr;

        // 返回 declarStr 与 vertexbuffer， 对应关系， 检查同 mesh 不同 submesh 顶点结构
        return gltfSubMesh;
    }

    /**
     * @internal
     * todo 临时 展开ib, 转换成无重复点 vb
     */
    gltfTempParseVB(gltfSubMesh: GLTFSubMesh, attributeMap: Map<string, Float32Array>) {
        var oldIndexArray: Uint32Array = gltfSubMesh.indexArray;
        var count: number = oldIndexArray.length;
        var newIndexArray: Uint32Array = new Uint32Array(count);
        for (let index = 0; index < oldIndexArray.length; index++) {
            // ib
            newIndexArray[index] = index;
        }
        gltfSubMesh.indexArray = newIndexArray;

        attributeMap.forEach((value: Float32Array, key: string) => {
            let attOffset: number = 0;
            switch (key) {
                case "POSITION":
                    attOffset = 3;
                    break;
                case "NORMAL":
                    attOffset = 3;
                    break;
                case "COLOR":
                    attOffset = 4;
                    break;
                case "UV":
                    attOffset = 2;
                    break;
                case "UV1":
                    attOffset = 2;
                    break;
                case "BLENDWEIGHT":
                    attOffset = 4;
                    break;
                case "BLENDINDICES":
                    // tdoo ? 兼容 4 / 1
                    attOffset = 4;
                    break;
                case "TANGENT":
                    attOffset = 4;
                    break;
                default:
                    // todo 
                    break;
            }
            let oldAttributeArray: Float32Array = value;
            let newAttributeArray: Float32Array = new Float32Array(attOffset * count);
            for (let index = 0; index < count; index++) {
                let oi: number = oldIndexArray[index];
                let voffset: number = index * attOffset;
                let oldVOffset: number = oi * attOffset;
                for (let i2 = 0; i2 < attOffset; i2++) {
                    newAttributeArray[voffset + i2] = oldAttributeArray[oldVOffset + i2];
                }
            }
            attributeMap.set(key, newAttributeArray);
            oldAttributeArray = null;
        });

    }



    /**
     * @internal
     * 根据单次提交骨骼数量 重写mesh 信息
     * @param attributeMap in
     * @param indexArray in
     * @param skinData in
     * @param boneIndicesList out
     * @param subIndexStartArray out
     * @param subIndexCountArray out
     */
    splitSubMeshByBonesCount(attributeMap: Map<string, Float32Array>, indexArray: Uint32Array, skinData: GLTFSkinData, boneIndicesList: Array<Uint16Array>, subIndexStartArray: number[], subIndexCountArray: number[]) {
        //  每次 提交 最大骨骼数量
        let maxSubBoneCount: number = GLTFLoader.maxSubBoneCount;

        let start: number = 0;
        let subIndexSet: Set<number> = new Set();
        let boneIndexArray: Float32Array = attributeMap.get("BLENDINDICES");

        let vertexCount: number = boneIndexArray.length / 4;

        let resArray: Float32Array = new Float32Array(boneIndexArray.length).fill(9999);

        let flagArray: Array<boolean> = new Array(vertexCount).fill(false);

        // 遍历 ib
        for (let i: number = 0, n: number = indexArray.length; i < n; i += 3) {

            // 每三个顶点 一个三角形 一起判断
            // 三个顶点 ，12 个 bone index
            let triangleSet: Set<number> = new Set();
            // let curboneIndexToChange: number[] = [];
            for (let j: number = i; j < i + 3; j++) {
                let ibIndex: number = indexArray[j];
                let boneIndexOffset: number = ibIndex * 4;
                for (let k: number = 0; k < 4; k++) {
                    triangleSet.add(boneIndexArray[boneIndexOffset + k]);
                    // curboneIndexToChange.push(boneIndexOffset);
                }
            }

            // 判断当前
            let tempSet: Set<number> = new Set([...subIndexSet, ...triangleSet]);
            if (tempSet.size > maxSubBoneCount) {
                // 当前批次不能加 添加 下一三角形
                // 保存当前数据
                let count: number = i - start;
                subIndexStartArray.push(start);
                subIndexCountArray.push(count);

                let curBoneList: number[] = Array.from(subIndexSet);
                boneIndicesList.push(new Uint16Array(curBoneList));
                // 更新 起始位置
                start = i;
                // 新建数据集， 添加未能添加到上一个节点的数据
                subIndexSet = new Set(triangleSet);
            }
            else {
                // 添加数据 到当前数据集
                subIndexSet = tempSet;
            }

            // 结尾 添加剩余数据
            if (i == n - 3) {
                let count: number = i - start + 3;
                subIndexStartArray.push(start);
                subIndexCountArray.push(count);
                start = i;
                let curBoneList: number[] = Array.from(subIndexSet);
                boneIndicesList.push(new Uint16Array(curBoneList));
            }
        }

        //根据分离出的范围 更改 biarray
        let drawCount: number = boneIndicesList.length;
        let e: boolean = (subIndexCountArray.length == subIndexStartArray.length) && (subIndexStartArray.length == drawCount);
        // console.log("all equle: " + e);

        let newAttributeMap: Map<string, Array<number>> = new Map();
        attributeMap.forEach((value, key) => {
            let array: Array<number> = new Array();
            newAttributeMap.set(key, array);
        });

        var curMaxIndex: number = vertexCount - 1;
        for (let d: number = 0; d < drawCount; d++) {
            let k: number = subIndexStartArray[d];
            let l: number = subIndexCountArray[d];
            let bl: Uint16Array = boneIndicesList[d];

            let batchFlag: Array<boolean> = new Array(vertexCount).fill(false);
            let batchMap: Map<number, number> = new Map();
            for (let area: number = 0; area < l; area++) {
                let ci: number = indexArray[area + k];
                let biStart: number = 4 * ci;
                for (let cbi: number = biStart; cbi < biStart + 4; cbi++) {
                    let oldBoneIndex: number = boneIndexArray[cbi];
                    let newBoneIndex: number = bl.indexOf(oldBoneIndex);
                    newBoneIndex = newBoneIndex == -1 ? 0 : newBoneIndex;

                    // 其他batch 出现， 此batch 未出现 新增点数据
                    if (flagArray[ci] && !batchFlag[ci]) {
                        newAttributeMap.get("BLENDINDICES").push(newBoneIndex);
                    }
                    // 其他batch 出现， 此batch 出现, 修改过 跳过
                    else if (flagArray[ci] && batchFlag[ci]) {

                    }
                    else {
                        resArray[cbi] = newBoneIndex;
                    }
                }

                // 其他batch 未出现， 此batch 未出现 不处理
                if (!flagArray[ci] && !batchFlag[ci]) {
                    batchFlag[ci] = true;
                    batchMap.set(ci, ci);
                }
                // 其他btach 未出现， 此batch 已经出现 index 改为上次更新index
                else if (!flagArray[ci] && batchFlag[ci]) {
                    indexArray[area + k] = batchMap.get(ci);
                }
                //其他batch 出现， 此batch 未出现 新增点数据  更新index
                else if (flagArray[ci] && !batchFlag[ci]) {
                    batchFlag[ci] = true;
                    curMaxIndex++;
                    batchMap.set(ci, curMaxIndex);
                    indexArray[area + k] = curMaxIndex;
                    newAttributeMap.forEach((value: number[], key: string) => {
                        let attOffset: number = 0;
                        switch (key) {
                            case "POSITION":
                                attOffset = 3;
                                break;
                            case "NORMAL":
                                attOffset = 3;
                                break;
                            case "COLOR":
                                attOffset = 4;
                                break;
                            case "UV":
                                attOffset = 2;
                                break;
                            case "UV1":
                                attOffset = 2;
                                break;
                            case "BLENDWEIGHT":
                                attOffset = 4;
                                break;
                            case "BLENDINDICES":
                                // tdoo ? 兼容 4 / 1
                                attOffset = 4;
                                break;
                            case "TANGENT":
                                attOffset = 4;
                                break;
                            default:
                                // todo 
                                break;
                        }
                        let oldArray: Float32Array = attributeMap.get(key);
                        if (key !== "BLENDINDICES") {
                            for (let index = 0; index < attOffset; index++) {
                                value.push(oldArray[index + ci * attOffset]);
                            }
                        }
                    });
                }
                //其他batch 出现， 此batch 出现
                else if (flagArray[ci] && batchFlag[ci]) {
                    indexArray[area + k] = batchMap.get(ci);
                }
            }


            // 将此batch 出现的index更新到flagarray
            batchFlag.forEach((value, index) => {
                flagArray[index] = value || flagArray[index];
            });
        }

        newAttributeMap.forEach((value: number[], key: string) => {
            let oldFloatArray: Float32Array = attributeMap.get(key);
            if (key == "BLENDINDICES") {
                oldFloatArray = resArray;
            }
            let newLength: number = oldFloatArray.length + value.length;
            let newFloatArray: Float32Array = new Float32Array(newLength);
            newFloatArray.set(oldFloatArray, 0);
            newFloatArray.set(value, oldFloatArray.length);
            attributeMap.set(key, newFloatArray);
        });

        boneIndexArray = null;
    }

    /**
     * @internal
     * primitive 存在 index 时 获取 indexbuffer
     * @param primitive 
     */
    gltfPrimitiveIndexBuffer(primitive: GLTFPrimitive): Uint32Array {
        var indexAccessor: GLTFAccessor = this._gltf.accessors[primitive.indices];
        var buffer: Uint32Array = <Uint32Array>this.getAccessorBuffer(indexAccessor);
        var indexBuffer: Uint32Array = new Uint32Array(buffer.length);
        indexBuffer.set(buffer);
        buffer = null;
        return indexBuffer;
    }

    /**
     * @internal
     * 获取 accessor 访问buffer数组
     * @param accessor 
     */
    getAccessorBuffer(accessor: GLTFAccessor): ArrayBuffer {

        var accessorByteOffset: number = 0;
        if (accessor.byteOffset !== undefined) {
            accessorByteOffset = accessor.byteOffset;
        }

        var bufferView: GLTFBufferView = this._gltf.bufferViews[accessor.bufferView];
        var gltfBuffer: GLTFBuffer = this._gltf.buffers[bufferView.buffer];

        var buffer: ArrayBuffer = this.gltfBuffers[bufferView.buffer];

        var accessorStride: number;
        switch (accessor.type) {
            case GLTFAccessorType.SCALAR:
                accessorStride = 1;
                break;
            case GLTFAccessorType.VEC2:
                accessorStride = 2;
                break;
            case GLTFAccessorType.VEC3:
                accessorStride = 3;
                break;
            case GLTFAccessorType.VEC4:
                accessorStride = 4;
                break;
            case GLTFAccessorType.MAT2:
                accessorStride = 4;
                break;
            case GLTFAccessorType.MAT3:
                accessorStride = 9;
                break;
            case GLTFAccessorType.MAT4:
                accessorStride = 16;
                break;
        }

        var componentStride: number;
        var bufferByteLength: number;

        var arrayBuffer: ArrayBuffer;

        // todo  类型 字节数 与对应 数组类型
        // check
        switch (accessor.componentType) {
            case GLTFComponentType.BYTE:
                componentStride = 1;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Int8Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
            case GLTFComponentType.UNSIGNED_BYTE:
                componentStride = 1;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Uint8Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
            case GLTFComponentType.SHORT:
                componentStride = 2;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Int16Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
            case GLTFComponentType.UNSIGNED_SHORT:
                componentStride = 2;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Uint16Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
            case GLTFComponentType.UNSIGNED_INT:
                componentStride = 4;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Uint32Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
            case GLTFComponentType.FLOAT:
                // checked
                componentStride = 4;
                bufferByteLength = accessor.count * accessorStride;
                arrayBuffer = new Float32Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
                break;
        }

        // todo accessor.normalized
        // 处理 数据是否需要 normalized
        return arrayBuffer;
    }

    /**
     * @internal
     * 合并 buffer 
     */
    mergeOnePrimitiveArray(floatArrayLength: number, vertexCount: number, attributeMap: Map<string, Float32Array>): Float32Array {
        var vertexbufferArray: Float32Array = new Float32Array(floatArrayLength);
        var stride: number = floatArrayLength / vertexCount;
        var attributeOffset: number = 0;
        attributeMap.forEach((value: Float32Array, key: string) => {
            // todo  color 可能为vec3, 补全为vec4
            // todo  attribute  offset
            var attOffset: number;
            switch (key) {
                case "POSITION":
                    attOffset = 3;
                    break;
                case "NORMAL":
                    attOffset = 3;
                    break;
                case "COLOR":
                    attOffset = 4;
                    break;
                case "UV":
                    attOffset = 2;
                    break;
                case "UV1":
                    attOffset = 2;
                    break;
                case "BLENDWEIGHT":
                    attOffset = 4;
                    break;
                case "BLENDINDICES":
                    // tdoo ? 兼容 4 / 1
                    attOffset = 1;
                    break;
                case "TANGENT":
                    attOffset = 4;
                    break;
                default:
                    // todo 
                    break;
            }
            for (var vertexNum: number = 0; vertexNum < vertexCount; vertexNum++) {
                var arroffset: number = vertexNum * stride + attributeOffset;
                var attBufferOffset: number = vertexNum * attOffset;
                for (var attCount: number = attBufferOffset; attCount < attOffset + attBufferOffset; attCount++) {
                    vertexbufferArray[arroffset++] = value[attCount];
                }
            }
            attributeOffset += attOffset;
        });

        return vertexbufferArray;
    }

    /**
     * @internal
     * 构建 mesh
     * @param mesh 
     * @param gltfSubMeshs 
     */
    generatMesh(gltfSubMeshs: GLTFSubMesh[], meshVertexArrLength: number, meshIndexArrLength: number, meshName?: string): Mesh {
        var mesh: Mesh = new Mesh();
        mesh.name = meshName;
        var vertexArray: Float32Array = new Float32Array(meshVertexArrLength);
        var oriIndexArray: Uint32Array = new Uint32Array(meshIndexArrLength);
        var declarStr: string = this.mergeSubMeshArray(gltfSubMeshs, vertexArray, oriIndexArray);
        // indexArray = indexArray.reverse();
        var vertexDeclaration: VertexDeclaration = VertexMesh.getVertexDeclaration(declarStr, false);

        var gl: WebGLRenderingContext = LayaGL.instance;
        // vertexBuffer
        var vertexBuffer: VertexBuffer3D = new VertexBuffer3D(meshVertexArrLength * 4, gl.STATIC_DRAW, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexArray.buffer);
        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
        var ibFormat: IndexFormat = IndexFormat.UInt32;
        var indexArray: Uint16Array | Uint32Array = oriIndexArray;
        if (mesh._vertexCount < 65536) {
            ibFormat = IndexFormat.UInt16;
            indexArray = new Uint16Array(oriIndexArray);
            oriIndexArray = null;
        }

        // indexBuffer
        var indexBuffer: IndexBuffer3D = new IndexBuffer3D(ibFormat, meshIndexArrLength, gl.STATIC_DRAW, true);
        indexBuffer.setData(indexArray);
        // mesh buffer
        mesh._indexFormat = ibFormat;
        mesh._vertexBuffer = vertexBuffer;
        mesh._indexBuffer = indexBuffer;
        mesh._setBuffer(vertexBuffer, indexBuffer);
        mesh._setInstanceBuffer(mesh._instanceBufferStateType);

        // submesh
        var subMeshCount: number = gltfSubMeshs.length;
        var subMeshs: SubMesh[] = new Array<SubMesh>(subMeshCount);
        var subMeshOffset: number = 0;
        // gltf 中读取的 Primitive (submesh) 结构，每个对象有独立的vb，ib buffer， 组成mesh时直接拼接buffer
        for (var subCount: number = 0; subCount < subMeshCount; subCount++) {
            var gltfSubMesh: GLTFSubMesh = gltfSubMeshs[subCount];
            var subMesh: SubMesh = new SubMesh(mesh);
            subMeshs[subCount] = subMesh;

            subMesh._vertexBuffer = vertexBuffer;
            subMesh._indexBuffer = indexBuffer;
            // todo range
            var subIndexStart: number = subMeshOffset;
            subMeshOffset += gltfSubMesh.indexArray.length;
            var subIndexCount: number = gltfSubMesh.indexArray.length;
            subMesh._setIndexRange(subIndexStart, subIndexCount, ibFormat);

            subMesh._boneIndicesList = gltfSubMesh.boneIndicesList;
            subMesh._subIndexBufferStart = gltfSubMesh.subIndexStartArray;
            subMesh._subIndexBufferCount = gltfSubMesh.subIndexCountArray;
            // 根据 submesh 在 mesh 中的indexoffset 偏移 subIndexbufferStart 数据
            for (var subIndex: number = 0; subIndex < subMesh._subIndexBufferStart.length; subIndex++) {
                subMesh._subIndexBufferStart[subIndex] += subIndexStart;
            }
        }

        mesh._setSubMeshes(subMeshs);
        mesh.calculateBounds();

        // 资源面板
        var memorySize: number = vertexBuffer._byteLength + indexBuffer._byteLength;
        mesh._setCPUMemory(memorySize);
        mesh._setGPUMemory(memorySize);

        return mesh;
    }

    /**
     * @internal
     * @param gltfSubMeshs 
     * @param vertexArray 
     * @param indexArray 
     */
    mergeSubMeshArray(gltfSubMeshs: GLTFSubMesh[], vertexArray: Float32Array, indexArray: Uint32Array): string {
        // todo 清理 合并前的buffer

        // todo 检查 sunmesh 合法性 ?
        // render mode
        // vertex attribute
        var declartStr: string;
        var vertexOffset: number = 0;
        var indexOffset: number = 0;
        var subIndexOffset: number = 0;
        gltfSubMeshs.forEach((gltfSubMesh: GLTFSubMesh, index: number) => {
            declartStr = gltfSubMesh.vertexDeclarationStr;
            vertexArray.set(gltfSubMesh.vertexArray, vertexOffset);

            // 偏移 indexArray
            // gltfSubMesh.indexArray.forEach(value => { value += gltfSubMesh.vertexCount; });
            for (var i: number = 0; i < gltfSubMesh.indexArray.length; i++) {
                gltfSubMesh.indexArray[i] += subIndexOffset;
            }
            indexArray.set(gltfSubMesh.indexArray, indexOffset);

            vertexOffset += gltfSubMesh.vertexArray.length;
            indexOffset += gltfSubMesh.indexArray.length;
            subIndexOffset += gltfSubMesh.vertexCount;
        });

        return declartStr;
    }

}

