(function (exports, Laya) {
	'use strict';

	class GLTFBase64Tool {
	    constructor() {
	    }
	    static init() {
	        if (GLTFBase64Tool.lookup)
	            return;
	        GLTFBase64Tool.lookup = new Uint8Array(256);
	        for (var i = 0; i < GLTFBase64Tool.chars.length; i++) {
	            GLTFBase64Tool.lookup[GLTFBase64Tool.chars.charCodeAt(i)] = i;
	        }
	    }
	    static isBase64String(str) {
	        return GLTFBase64Tool.reg.test(str);
	    }
	    static encode(arraybuffer) {
	        var bytes = new Uint8Array(arraybuffer), i, len = bytes["length"], base64 = "";
	        for (i = 0; i < len; i += 3) {
	            base64 += GLTFBase64Tool.chars[bytes[i] >> 2];
	            base64 += GLTFBase64Tool.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	            base64 += GLTFBase64Tool.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	            base64 += GLTFBase64Tool.chars[bytes[i + 2] & 63];
	        }
	        if ((len % 3) === 2) {
	            base64 = base64.substring(0, base64.length - 1) + "=";
	        }
	        else if (len % 3 === 1) {
	            base64 = base64.substring(0, base64.length - 2) + "==";
	        }
	        return base64;
	    }
	    static decode(base64) {
	        GLTFBase64Tool.init();
	        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
	        if (base64[base64.length - 1] === "=") {
	            bufferLength--;
	            if (base64[base64.length - 2] === "=") {
	                bufferLength--;
	            }
	        }
	        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
	        for (i = 0; i < len; i += 4) {
	            encoded1 = GLTFBase64Tool.lookup[base64.charCodeAt(i)];
	            encoded2 = GLTFBase64Tool.lookup[base64.charCodeAt(i + 1)];
	            encoded3 = GLTFBase64Tool.lookup[base64.charCodeAt(i + 2)];
	            encoded4 = GLTFBase64Tool.lookup[base64.charCodeAt(i + 3)];
	            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	        }
	        return arraybuffer;
	    }
	    ;
	}
	GLTFBase64Tool.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	GLTFBase64Tool.reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
	GLTFBase64Tool.reghead = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i;
	GLTFBase64Tool.lookup = null;

	(function (GLTFComponentType) {
	    GLTFComponentType[GLTFComponentType["BYTE"] = 5120] = "BYTE";
	    GLTFComponentType[GLTFComponentType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
	    GLTFComponentType[GLTFComponentType["SHORT"] = 5122] = "SHORT";
	    GLTFComponentType[GLTFComponentType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
	    GLTFComponentType[GLTFComponentType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
	    GLTFComponentType[GLTFComponentType["FLOAT"] = 5126] = "FLOAT";
	})(exports.GLTFComponentType || (exports.GLTFComponentType = {}));
	(function (GLTFAccessorType) {
	    GLTFAccessorType["SCALAR"] = "SCALAR";
	    GLTFAccessorType["VEC2"] = "VEC2";
	    GLTFAccessorType["VEC3"] = "VEC3";
	    GLTFAccessorType["VEC4"] = "VEC4";
	    GLTFAccessorType["MAT2"] = "MAT2";
	    GLTFAccessorType["MAT3"] = "MAT3";
	    GLTFAccessorType["MAT4"] = "MAT4";
	})(exports.GLTFAccessorType || (exports.GLTFAccessorType = {}));
	(function (GLTFRenderMode) {
	    GLTFRenderMode[GLTFRenderMode["POINTS"] = 0] = "POINTS";
	    GLTFRenderMode[GLTFRenderMode["LINES"] = 1] = "LINES";
	    GLTFRenderMode[GLTFRenderMode["LINE_LOOP"] = 2] = "LINE_LOOP";
	    GLTFRenderMode[GLTFRenderMode["LINE_STRIP"] = 3] = "LINE_STRIP";
	    GLTFRenderMode[GLTFRenderMode["TRIANGLES"] = 4] = "TRIANGLES";
	    GLTFRenderMode[GLTFRenderMode["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
	    GLTFRenderMode[GLTFRenderMode["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
	})(exports.GLTFRenderMode || (exports.GLTFRenderMode = {}));

	class GLTFLoader {
	    constructor() {
	        this.extraFunc = {
	            meshExtras: undefined,
	            materialExtras: undefined
	        };
	        this.gltfBuffers = [];
	        this.gltfImages = [];
	        GLTFLoader.defaultMatrial || (GLTFLoader.defaultMatrial = new Laya.PBRStandardMaterial());
	    }
	    clearData() {
	        this._gltf = null;
	        this.gltfRoot = null;
	        this._spriteNodes = [];
	        this.gltfBuffers = [];
	        this.gltfImages = [];
	    }
	    destroy() {
	        this._gltf = null;
	        this._onLoaded = null;
	        this.gltfRoot = null;
	        this._spriteNodes = null;
	        this.gltfBuffers = null;
	        this.gltfImages = null;
	    }
	    loadGLTF(url, complate) {
	        this._onLoaded = complate;
	        if (!(url instanceof Array)) {
	            url = [url];
	        }
	        var gltfItems = [];
	        var otherItems = [];
	        url.forEach(value => {
	            if (!value)
	                return true;
	            var urlStr;
	            if (typeof (value) == 'string') {
	                urlStr = value;
	            }
	            else {
	                urlStr = value.url;
	            }
	            var fileType = Laya.Utils.getFileExtension(urlStr);
	            if (fileType == "gltf") {
	                gltfItems.push(value);
	            }
	            else {
	                otherItems.push(value);
	            }
	        });
	        var allScuess = true;
	        var itemCount = gltfItems.length;
	        var loadedCount = 0;
	        var loadedFlags = new Array(itemCount).fill(false);
	        gltfItems.forEach((item, gltfIndex) => {
	            var base = Laya.URL.getPath(item.url);
	            var completehandler = Laya.Handler.create(this, function (item, content = null) {
	                loadedCount++;
	                var gltfContext = {
	                    urlItem: item,
	                    base: base,
	                    loadedCount: loadedCount,
	                    itemCount: itemCount,
	                    loadedFlags: loadedFlags
	                };
	                var loadItems = [];
	                content || (allScuess = false);
	                var gltfObject = Laya.Loader.getRes(gltfContext.urlItem.url);
	                if (gltfObject.buffers) {
	                    gltfObject.buffers.forEach((buffer, bufferIndex) => {
	                        if (!GLTFBase64Tool.isBase64String(buffer.uri)) {
	                            loadItems.push({ url: base + buffer.uri, type: Laya.Loader.BUFFER });
	                        }
	                    });
	                }
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
	                if (gltfIndex == 0) {
	                    loadItems.push(...otherItems);
	                }
	                if (loadItems.length) {
	                    var extraCompletehandler = Laya.Handler.create(this, function (item, success) {
	                        success || (allScuess = false);
	                        this.collectionLoadItems(gltfContext, allScuess, success);
	                    }, [item]);
	                    Laya.Laya.loader.create(loadItems, extraCompletehandler);
	                }
	                else {
	                    this.collectionLoadItems(gltfContext, allScuess, true);
	                }
	            }, [item]);
	            Laya.Laya.loader.create([item], completehandler);
	        });
	        if (gltfItems.length == 0) {
	            Laya.Laya.loader.create(otherItems, complate);
	        }
	    }
	    collectionLoadItems(gltfContext, allScuess, succeed) {
	        this.onLoaded(gltfContext, allScuess, succeed);
	    }
	    onLoaded(gltfContext, allScuess, succeed) {
	        var urlItem = gltfContext.urlItem;
	        var loadedCount = gltfContext.loadedCount;
	        var itemCount = gltfContext.itemCount;
	        var base = gltfContext.base;
	        var loadedFlags = gltfContext.loadedFlags;
	        loadedFlags[loadedCount - 1] = true;
	        var allLoaded = true;
	        loadedFlags.forEach(value => {
	            allLoaded = allLoaded && value;
	        });
	        if (!succeed) {
	            console.warn("[error]Failed to parse:", urlItem.url);
	        }
	        else if (GLTFLoader.loadedMap[Laya.URL.formatURL(urlItem.url)]) ;
	        else {
	            this._gltf = Laya.Loader.getRes(urlItem.url);
	            var version = this._gltf.asset.version;
	            if (version !== "2.0") {
	                console.warn("only support gltf 2.0!");
	                succeed = false;
	            }
	            else {
	                if (this._gltf.buffers) {
	                    this._gltf.buffers.forEach((buffer, index) => {
	                        if (!GLTFBase64Tool.isBase64String(buffer.uri)) {
	                            this.gltfBuffers[index] = Laya.Loader.getRes(base + buffer.uri);
	                        }
	                        else {
	                            var base64 = buffer.uri.replace(GLTFBase64Tool.reghead, "");
	                            this.gltfBuffers[index] = GLTFBase64Tool.decode(base64);
	                        }
	                    });
	                }
	                if (this._gltf.images) {
	                    this._gltf.images.forEach((image, index) => {
	                        var imageUrl;
	                        if (GLTFBase64Tool.isBase64String(image.uri)) {
	                            imageUrl = image.uri;
	                        }
	                        else {
	                            imageUrl = base + image.uri;
	                        }
	                        this.gltfImages[index] = Laya.Loader.getRes(imageUrl);
	                    });
	                }
	                var rootName = Laya.URL.getFileName(urlItem.url);
	                this.gltfParse(rootName);
	                GLTFLoader.loadedMap[Laya.URL.formatURL(urlItem.url)] = this.gltfRoot;
	            }
	        }
	        this.clearData();
	        gltfContext = null;
	        if (allLoaded) {
	            this._onLoaded && this._onLoaded.runWith([succeed && allScuess]);
	        }
	    }
	    static getRes(url) {
	        return GLTFLoader.loadedMap[Laya.URL.formatURL(url)];
	    }
	    static clearRes(url) {
	        var formatUrl = Laya.URL.formatURL(url);
	        var res = GLTFLoader.loadedMap[formatUrl];
	        (res) && (delete GLTFLoader.loadedMap[formatUrl]);
	        Laya.Loader.clearRes(url);
	    }
	    gltfParse(rootName) {
	        if (this._gltf.nodes) {
	            var nodes = this._gltf.nodes;
	            var spriteNodes = new Array(nodes.length);
	            this._spriteNodes = spriteNodes;
	            nodes.forEach((node, index) => {
	                var spriteNode = this.gltfParseNode(node, spriteNodes, index);
	            });
	        }
	        if (this._gltf.scenes) {
	            var sceneIndex = this._gltf.scene || 0;
	            var gltfScene = this._gltf.scenes[sceneIndex];
	            var sceneName = rootName;
	            this.gltfRoot = new Laya.Sprite3D(sceneName);
	            this.gltfParseScene(gltfScene, this.gltfRoot);
	        }
	        this._spriteNodes.forEach(sprite => {
	            if (sprite instanceof Laya.SkinnedMeshSprite3D) {
	                GLTFLoader.calSkinnedSpriteLocalBounds(sprite);
	            }
	        });
	        if (this._gltf.animations) {
	            var aniamtions = this._gltf.animations;
	            aniamtions.forEach((animation, index) => {
	                this.gltfParseAniamtion(animation, index);
	            });
	        }
	    }
	    gltfParseScene(gltfScene, sceneRoot) {
	        var sceneNodesIndex = gltfScene.nodes;
	        var nodes = this._gltf.nodes;
	        if (sceneNodesIndex || nodes) {
	            sceneNodesIndex.forEach(index => {
	                var node = nodes[index];
	                var sprite = this._spriteNodes[index];
	                sceneRoot.addChild(sprite);
	                this.buildHierarchy(node, sprite, 1);
	            });
	        }
	    }
	    gltfParseAniamtion(animation, index) {
	        var channels = animation.channels;
	        var samplers = animation.samplers;
	        var animatorRoot = this.getAnimationRoot(channels);
	        var duration = 0;
	        var clipNodes = new Array(channels.length);
	        channels.forEach((channel, index) => {
	            var clipNode = clipNodes[index] = {};
	            var target = channel.target;
	            var spriteNode = this._gltf.nodes[target.node];
	            var sprite = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);
	            var sampler = samplers[channel.sampler];
	            var samplerInAccessor = this._gltf.accessors[sampler.input];
	            var samplerOutAccessor = this._gltf.accessors[sampler.output];
	            var timeBuffer = this.getAccessorBuffer(samplerInAccessor);
	            var outBuffer = this.getAccessorBuffer(samplerOutAccessor);
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
	        var animator = animatorRoot.addComponent(Laya.Animator);
	        var layerName = animation.name ? animation.name : "Aniamtor" + index;
	        var animatorLayer = new Laya.AnimatorControllerLayer(layerName);
	        var clip = new Laya.AnimationClip();
	        clip.name = "clip name";
	        clip._duration = duration;
	        clip.islooping = true;
	        clip._frameRate = 30;
	        var nodeCount = clipNodes.length;
	        var nodes = clip._nodes;
	        nodes.count = nodeCount;
	        var nodesMap = clip._nodesMap = {};
	        var nodesDic = clip._nodesDic = {};
	        for (var i = 0; i < nodeCount; i++) {
	            var node = new Laya.KeyframeNode();
	            var gLTFClipNode = clipNodes[i];
	            nodes.setNodeByIndex(i, node);
	            node._indexInList = i;
	            var type = node.type = gLTFClipNode.type;
	            var pathLength = gLTFClipNode.paths.length;
	            node._setOwnerPathCount(pathLength);
	            var tempPath = gLTFClipNode.paths;
	            for (var j = 0; j < pathLength; j++) {
	                node._setOwnerPathByIndex(j, tempPath[j]);
	            }
	            var nodePath = node._joinOwnerPath("/");
	            var mapArray = nodesMap[nodePath];
	            (mapArray) || (nodesMap[nodePath] = mapArray = []);
	            mapArray.push(node);
	            node.propertyOwner = gLTFClipNode.propertyOwner;
	            var propertyLength = gLTFClipNode.propertyLength;
	            node._setPropertyCount(propertyLength);
	            for (var j = 0; j < propertyLength; j++) {
	                node._setPropertyByIndex(j, gLTFClipNode.propertise[j]);
	            }
	            var fullPath = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
	            nodesDic[fullPath] = fullPath;
	            node.fullPath = fullPath;
	            var keyframeCount = gLTFClipNode.timeArray.length;
	            for (var j = 0; j < keyframeCount; j++) {
	                switch (type) {
	                    case 0:
	                        break;
	                    case 1:
	                    case 3:
	                    case 4:
	                        var floatArrayKeyframe = new Laya.Vector3Keyframe();
	                        node._setKeyframeByIndex(j, floatArrayKeyframe);
	                        var startTime = floatArrayKeyframe.time = gLTFClipNode.timeArray[j];
	                        var inTangent = floatArrayKeyframe.inTangent;
	                        var outTangent = floatArrayKeyframe.outTangent;
	                        var value = floatArrayKeyframe.value;
	                        inTangent.setValue(0, 0, 0);
	                        outTangent.setValue(0, 0, 0);
	                        value.setValue(gLTFClipNode.valueArray[3 * j], gLTFClipNode.valueArray[3 * j + 1], gLTFClipNode.valueArray[3 * j + 2]);
	                        break;
	                    case 2:
	                        var quaternionKeyframe = new Laya.QuaternionKeyframe();
	                        node._setKeyframeByIndex(j, quaternionKeyframe);
	                        var startTime = quaternionKeyframe.time = gLTFClipNode.timeArray[j];
	                        var inTangentQua = quaternionKeyframe.inTangent;
	                        var outTangentQua = quaternionKeyframe.outTangent;
	                        var valueQua = quaternionKeyframe.value;
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
	        var animatorState = new Laya.AnimatorState();
	        animatorState.name = "state name";
	        animatorState.clip = clip;
	        animatorLayer.addState(animatorState);
	        animatorLayer.defaultState = animatorState;
	        animatorLayer.playOnWake = true;
	        animator.addControllerLayer(animatorLayer);
	        animatorLayer.defaultWeight = 1.0;
	        return;
	    }
	    getAnimationRoot(channels) {
	        var curDepth = Number.MAX_VALUE;
	        var topSprites = [];
	        channels.forEach((channel, index) => {
	            var target = channel.target;
	            var spriteNode = this._gltf.nodes[target.node];
	            if (spriteNode.hierarchyDepth < curDepth) {
	                curDepth = spriteNode.hierarchyDepth;
	                var sprite = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);
	                topSprites = [sprite];
	            }
	            else if (spriteNode.hierarchyDepth == curDepth) {
	                var sprite = this.gltfParseNode(spriteNode, this._spriteNodes, target.node);
	                topSprites.push(sprite);
	            }
	        });
	        if (topSprites.length == 1) {
	            return topSprites[0];
	        }
	        return this.gltfRoot;
	    }
	    getAniamtionPath(root, curSprite) {
	        var paths = [];
	        if (root == curSprite)
	            return paths;
	        var sprite = curSprite;
	        while (sprite.parent != root || sprite.parent instanceof Laya.Scene3D) {
	            sprite = sprite.parent;
	            paths.push(sprite.name);
	        }
	        paths = paths.reverse();
	        paths.push(curSprite.name);
	        return paths;
	    }
	    buildHierarchy(node, sprite, hierarchyDepth) {
	        if (node.children !== undefined) {
	            node.children.forEach(element => {
	                var childNode = this._gltf.nodes[element];
	                childNode.hierarchyDepth = hierarchyDepth;
	                var childSprite = this._spriteNodes[element];
	                sprite.addChild(childSprite);
	                this.buildHierarchy(childNode, childSprite, hierarchyDepth + 1);
	            });
	        }
	    }
	    gltfParseNode(node, spriteNodes, index) {
	        if (spriteNodes[index]) {
	            return spriteNodes[index];
	        }
	        if (!node) {
	            return;
	        }
	        var res;
	        var name = node.name;
	        if (node.mesh !== undefined && node.skin !== undefined) {
	            var skin = this._gltf.skins[node.skin];
	            var skinData = this.gltfParseSkins(skin);
	            var materials = [];
	            var mesh = this.gltfParseMesh(this._gltf.meshes[node.mesh], materials, skinData);
	            this.meshApplySkinData(mesh, skinData);
	            res = new Laya.SkinnedMeshSprite3D(mesh, name);
	            var skinMeshRender = res.skinnedMeshRenderer;
	            var rootBone = skinData.rootBone;
	            var bones = skinData.bones;
	            skinMeshRender.rootBone = rootBone;
	            skinMeshRender.bones.push(...bones);
	            skinMeshRender.sharedMaterials = materials;
	        }
	        else if (node.mesh !== undefined) {
	            var materials = [];
	            var mesh = this.gltfParseMesh(this._gltf.meshes[node.mesh], materials);
	            res = new Laya.MeshSprite3D(mesh, name);
	            var meshRender = res.meshRenderer;
	            meshRender.sharedMaterials = materials;
	        }
	        else {
	            res = new Laya.Sprite3D(name);
	        }
	        if (node.matrix) {
	            var localMatrix = res.transform.localMatrix;
	            localMatrix.elements.set(node.matrix);
	            res.transform.localMatrix = localMatrix;
	        }
	        else {
	            var localPosition = res.transform.localPosition;
	            var localRotation = res.transform.localRotation;
	            var localScale = res.transform.localScale;
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
	    gltfParseSkins(skin) {
	        var accessor = this._gltf.accessors[skin.inverseBindMatrices];
	        var inverseBindMatricesArray = this.getAccessorBuffer(accessor);
	        var skeletonNodeIndex = skin.skeleton;
	        var skeletonNode = this._gltf.nodes[skeletonNodeIndex];
	        var skeletonSprite = this.gltfParseNode(skeletonNode, this._spriteNodes, skeletonNodeIndex);
	        var jointsNodeIndex = skin.joints;
	        var bonesCount = jointsNodeIndex.length;
	        var boneNames = new Array(bonesCount);
	        var boneSprites = [];
	        jointsNodeIndex.forEach((value, index) => {
	            var node = this._gltf.nodes[value];
	            boneNames[index] = node.name;
	            boneSprites[index] = this.gltfParseNode(node, this._spriteNodes, value);
	        });
	        var skinData = {};
	        skinData.boneNames = boneNames;
	        skinData.bones = boneSprites;
	        skinData.boneCount = skinData.bones.length;
	        skinData.rootBone = skeletonSprite ? skeletonSprite : boneSprites[0];
	        skinData.inverseBindMatricesArray = inverseBindMatricesArray;
	        return skinData;
	    }
	    meshApplySkinData(mesh, skinData) {
	        mesh._boneNames = skinData.boneNames;
	        mesh._inverseBindPoses = [];
	        mesh._inverseBindPosesBuffer = skinData.inverseBindMatricesArray.buffer;
	        mesh._setInstanceBuffer(Laya.Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL);
	        var bonesCount = skinData.boneNames.length;
	        for (var i = 0; i < bonesCount; i++) {
	            var bindPosesArrayOffset = 16 * i;
	            var matElement = skinData.inverseBindMatricesArray.slice(bindPosesArrayOffset, bindPosesArrayOffset + 16);
	            mesh._inverseBindPoses[i] = new Laya.Matrix4x4(matElement[0], matElement[1], matElement[2], matElement[3], matElement[4], matElement[5], matElement[6], matElement[7], matElement[8], matElement[9], matElement[10], matElement[11], matElement[12], matElement[13], matElement[14], matElement[15], matElement);
	        }
	        var subCount = mesh.subMeshCount;
	        for (var subIndex = 0; subIndex < subCount; subIndex++) {
	            var submesh = mesh.getSubMesh(subIndex);
	            var skinnedCache = mesh._skinnedMatrixCaches;
	            skinnedCache.length = mesh._inverseBindPoses.length;
	            var drawCount = submesh._subIndexBufferStart.length;
	            for (var drawIndex = 0; drawIndex < drawCount; drawIndex++) {
	                var boneIndices = submesh._boneIndicesList[drawIndex];
	                for (var bni = 0; bni < boneIndices.length; bni++) {
	                    var bn = boneIndices[bni];
	                    skinnedCache[bn] || (skinnedCache[bn] = new Laya.skinnedMatrixCache(subIndex, drawIndex, bni));
	                }
	            }
	        }
	        for (var p = 0; p < skinnedCache.length; p++) {
	            if (!skinnedCache[p]) {
	                skinnedCache[p] = new Laya.skinnedMatrixCache(0, 0, 0);
	            }
	        }
	    }
	    static calSkinnedSpriteLocalBounds(skinned) {
	        var render = skinned.skinnedMeshRenderer;
	        var mesh = skinned.meshFilter.sharedMesh;
	        var rootBone = render.rootBone;
	        var oriRootMatrix = rootBone.transform.worldMatrix;
	        var invertRootMatrix = new Laya.Matrix4x4();
	        oriRootMatrix.invert(invertRootMatrix);
	        var indices = mesh.getIndices();
	        var positions = [];
	        var boneIndices = [];
	        var boneWeights = [];
	        mesh.getPositions(positions);
	        mesh.getBoneIndices(boneIndices);
	        mesh.getBoneWeights(boneWeights);
	        var oriBoneIndeices = [];
	        mesh._subMeshes.forEach((subMesh, index) => {
	            var bonelists = subMesh._boneIndicesList;
	            bonelists.forEach((bonelist, listIndex) => {
	                var start = subMesh._subIndexBufferStart[listIndex];
	                var count = subMesh._subIndexBufferCount[listIndex];
	                var endIndex = count + start;
	                for (let iindex = start; iindex < endIndex; iindex++) {
	                    var ii = indices[iindex];
	                    var boneIndex = boneIndices[ii];
	                    var x = bonelist[boneIndex.x];
	                    var y = bonelist[boneIndex.y];
	                    var z = bonelist[boneIndex.z];
	                    var w = bonelist[boneIndex.w];
	                    oriBoneIndeices[ii] = new Laya.Vector4(x, y, z, w);
	                }
	            });
	        });
	        var inverseBindPoses = mesh._inverseBindPoses;
	        var bones = render.bones;
	        var ubones = [];
	        var tempMat = new Laya.Matrix4x4();
	        bones.forEach((bone, index) => {
	            ubones[index] = new Laya.Matrix4x4();
	            Laya.Matrix4x4.multiply(invertRootMatrix, bone.transform.worldMatrix, tempMat);
	            Laya.Matrix4x4.multiply(tempMat, inverseBindPoses[index], ubones[index]);
	        });
	        var skinTransform = new Laya.Matrix4x4;
	        var resPos = new Laya.Vector3();
	        var min = new Laya.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
	        var max = new Laya.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
	        positions.forEach((pos, index) => {
	            var boneIndex = oriBoneIndeices[index];
	            var boneWeight = boneWeights[index];
	            for (let ei = 0; ei < 16; ei++) {
	                skinTransform.elements[ei] = ubones[boneIndex.x].elements[ei] * boneWeight.x;
	                skinTransform.elements[ei] += ubones[boneIndex.y].elements[ei] * boneWeight.y;
	                skinTransform.elements[ei] += ubones[boneIndex.z].elements[ei] * boneWeight.z;
	                skinTransform.elements[ei] += ubones[boneIndex.w].elements[ei] * boneWeight.w;
	            }
	            Laya.Vector3.transformV3ToV3(pos, skinTransform, resPos);
	            Laya.Vector3.min(min, resPos, min);
	            Laya.Vector3.max(max, resPos, max);
	        });
	        positions = null;
	        boneIndices = boneWeights = oriBoneIndeices = null;
	        indices = null;
	        ubones = null;
	        render.localBounds.setMin(min);
	        render.localBounds.setMax(max);
	    }
	    gltfParseMesh(gltfmesh, materials, skinData) {
	        if (gltfmesh.extras && this.extraFunc && this.extraFunc.meshExtras) {
	            this.extraFunc.meshExtras(gltfmesh)();
	        }
	        var primitives = gltfmesh.primitives;
	        var gltfSubMeshs = new Array(primitives.length);
	        var meshVertexArrLength = 0;
	        var meshIndexArrLength = 0;
	        var shapeWeights = gltfmesh.weights;
	        primitives.forEach((primitive, index) => {
	            var gltfSubMesh = {};
	            gltfSubMesh.renderMode = primitive.mode;
	            var primitiveIndexBuffer;
	            if (primitive.indices !== undefined) {
	                primitiveIndexBuffer = this.gltfPrimitiveIndexBuffer(primitive);
	            }
	            else {
	                primitiveIndexBuffer = new Uint32Array(gltfSubMesh.vertexCount);
	                for (var i = 0; i < gltfSubMesh.vertexCount; i++) {
	                    primitiveIndexBuffer[i] = i;
	                }
	            }
	            gltfSubMesh.indexArray = primitiveIndexBuffer.reverse();
	            var targets = primitive.targets;
	            var targetCount = targets ? targets.length : 0;
	            var morphtargets = new Array(targetCount);
	            var targetNames = gltfmesh.extras ? gltfmesh.extras.targetNames : null;
	            targets && targets.forEach((target, index) => {
	                morphtargets[index] = new Map();
	                var targetName = targetNames ? targetNames[index] : "target " + index;
	                for (const key in target) {
	                    var targetAccessor = this._gltf.accessors[target[key]];
	                    var buffer = this.getAccessorBuffer(targetAccessor);
	                    var targetArray = new Float32Array(buffer);
	                    morphtargets[index].set(key, targetArray);
	                }
	            });
	            this.gltfPrimitiveSubMesh(gltfSubMesh, primitive, morphtargets, shapeWeights, skinData);
	            gltfSubMeshs[index] = gltfSubMesh;
	            morphtargets = null;
	            if (primitive.material !== undefined) {
	                gltfSubMesh.gltfMaterial = this._gltf.materials[primitive.material];
	            }
	            meshVertexArrLength += gltfSubMesh.vertexArray.length;
	            meshIndexArrLength += gltfSubMesh.indexArray.length;
	        });
	        var resMesh = this.generatMesh(gltfSubMeshs, meshVertexArrLength, meshIndexArrLength, gltfmesh.name);
	        this.getMaterials(gltfSubMeshs, materials);
	        return resMesh;
	    }
	    applyMorphtargets(gltfSubMesh, morphtargets, weights) {
	        morphtargets.forEach((morphtarget, index) => {
	            morphtarget.forEach((array, key) => {
	                if (gltfSubMesh.has(key)) {
	                    var oriArray = gltfSubMesh.get(key);
	                    var weight = weights[index];
	                    for (var i = 0, n = oriArray.length; i < n; i++) {
	                        oriArray[i] += weight * array[i];
	                    }
	                }
	            });
	        });
	    }
	    getMaterials(gltfSubMeshs, materials) {
	        materials.length = gltfSubMeshs.length;
	        gltfSubMeshs.forEach((gltfSubMesh, index) => {
	            if (gltfSubMesh.gltfMaterial == undefined) {
	                materials[index] = GLTFLoader.defaultMatrial;
	            }
	            else {
	                materials[index] = this.gltfParseMaterial(gltfSubMesh.gltfMaterial);
	            }
	        });
	    }
	    gltfParseMaterial(gltfMaterial) {
	        var mat;
	        mat = GLTFLoader.defaultMatrial.clone();
	        var material = mat;
	        for (const key in gltfMaterial) {
	            switch (key) {
	                case "pbrMetallicRoughness":
	                    this.gltfParsePbrMetallicRoughness(gltfMaterial.pbrMetallicRoughness, material);
	                    break;
	                case "normalTexture":
	                    var textureInfo = gltfMaterial[key];
	                    var normalTexture = this.gltfGetTextureWithInfo(textureInfo);
	                    material.normalTexture = normalTexture;
	                    (textureInfo.scale !== undefined) && (material.normalTextureScale = textureInfo.scale);
	                    break;
	                case "occlusionTexture":
	                    var textureInfo = gltfMaterial[key];
	                    var occlusionTexture = this.gltfGetTextureWithInfo(textureInfo);
	                    material.occlusionTexture = occlusionTexture;
	                    (textureInfo.strength !== undefined) && (material.occlusionTextureStrength = textureInfo.strength);
	                    break;
	                case "emissiveTexture":
	                    var textureInfo = gltfMaterial[key];
	                    var emissionTexture = this.gltfGetTextureWithInfo(textureInfo);
	                    material.emissionTexture = emissionTexture;
	                    break;
	                case "emissiveFactor":
	                    var emissive = material.emissionColor;
	                    emissive.fromArray(gltfMaterial[key]);
	                    material.emissionColor = emissive;
	                    break;
	                case "alphaMode":
	                    var renderMode;
	                    switch (gltfMaterial.alphaMode) {
	                        case "OPAQUE":
	                            renderMode = Laya.PBRRenderMode.Opaque;
	                            break;
	                        case "MASK":
	                            renderMode = Laya.PBRRenderMode.Cutout;
	                            break;
	                        case "BLEND":
	                            renderMode = Laya.PBRRenderMode.Transparent;
	                            break;
	                    }
	                    material.renderMode = renderMode;
	                    break;
	                case "alphaCutoff":
	                    material.alphaTestValue = gltfMaterial.alphaCutoff;
	                    break;
	                case "doubleSided":
	                    if (gltfMaterial.doubleSided) {
	                        material.cull = Laya.RenderState.CULL_NONE;
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
	    gltfParsePbrMetallicRoughness(pbrMetallicRoughness, material) {
	        for (const key in pbrMetallicRoughness) {
	            switch (key) {
	                case "baseColorFactor":
	                    var baseColor = material.albedoColor;
	                    baseColor.fromArray(pbrMetallicRoughness.baseColorFactor);
	                    material.albedoColor = baseColor;
	                    break;
	                case "baseColorTexture":
	                    var textureInfo = pbrMetallicRoughness.baseColorTexture;
	                    var colorTex = this.gltfGetTextureWithInfo(textureInfo);
	                    material.albedoTexture = colorTex;
	                    break;
	                case "metallicFactor":
	                    var metallic = pbrMetallicRoughness.metallicFactor;
	                    material.metallic = metallic;
	                    break;
	                case "roughnessFactor":
	                    var roughness = pbrMetallicRoughness.roughnessFactor;
	                    material.smoothness = 1.0 - roughness;
	                    break;
	                case "metallicRoughnessTexture":
	                    var textureInfo = pbrMetallicRoughness.metallicRoughnessTexture;
	                    var metallicGlossTexture = this.gltfGetTextureWithInfo(textureInfo);
	                    material.metallicGlossTexture = metallicGlossTexture;
	                    break;
	            }
	        }
	    }
	    gltfGetTextureWithInfo(textureInfo) {
	        if (!textureInfo)
	            return null;
	        var gltfTex = this._gltf.textures[textureInfo.index];
	        var texture = this.gltfParseTexture(gltfTex);
	        return texture;
	    }
	    gltfParseTexture(gltfTexture) {
	        var image = this.gltfImages[gltfTexture.source];
	        if (!image) {
	            var gltfImage = this._gltf.images[gltfTexture.source];
	            image = this.gltfParseImageFromBufferView(gltfImage);
	        }
	        if (gltfTexture.sampler != undefined) {
	            var sampler = this._gltf.samplers[gltfTexture.sampler];
	        }
	        else {
	            var sampler = {};
	        }
	        var magFilter = sampler.magFilter;
	        var minFilter = sampler.minFilter;
	        var texWdith = image["width"];
	        var texHeight = image["height"];
	        var mipmap = this.needMipMap(magFilter, minFilter);
	        var filterMode = this.getFilterMode(magFilter, minFilter, mipmap);
	        var tex = new Laya.Texture2D(texWdith, texHeight, Laya.TextureFormat.R8G8B8A8, mipmap);
	        tex.loadImageSource(image);
	        tex.filterMode = filterMode;
	        var warpV = this.getWarpMode(sampler.wrapT);
	        var warpU = this.getWarpMode(sampler.wrapS);
	        tex.wrapModeV = warpV;
	        tex.wrapModeU = warpU;
	        GLTFLoader.textureMap[image.src] = tex;
	        return tex;
	    }
	    needMipMap(magFilter, minFilter) {
	        return true;
	    }
	    getFilterMode(magFilter, minFilter, mipmap) {
	        var gl = Laya.LayaGL.instance;
	        if (magFilter == gl.NEAREST) {
	            return Laya.FilterMode.Point;
	        }
	        else if (magFilter == gl.LINEAR) {
	            if (mipmap && minFilter == gl.LINEAR_MIPMAP_LINEAR) {
	                return Laya.FilterMode.Trilinear;
	            }
	            else {
	                return Laya.FilterMode.Bilinear;
	            }
	        }
	        return Laya.FilterMode.Point;
	    }
	    getWarpMode(value) {
	        var gl = Laya.LayaGL.instance;
	        switch (value) {
	            case gl.REPEAT:
	                return Laya.WarpMode.Repeat;
	                break;
	            case gl.CLAMP_TO_EDGE:
	                return Laya.WarpMode.Repeat;
	                break;
	            case gl.MIRRORED_REPEAT:
	            default:
	                return Laya.WarpMode.Repeat;
	                break;
	        }
	    }
	    gltfParseImageFromBufferView(gltfImage) {
	        if (gltfImage.bufferView !== undefined) {
	            gltfImage.mimeType;
	            console.warn("warning: don't support bufferView image!");
	        }
	    }
	    gltfPrimitiveSubMesh(gltfSubMesh, primitive, morphtargets, shapeWeights, skinData) {
	        var attributes = primitive.attributes;
	        var attributeMap = new Map();
	        var gltfOrder = GLTFLoader.gltfAttributeOrder;
	        var layaOrder = GLTFLoader.layaAttributeOrder;
	        var declarStr = "";
	        var splitFlag = false;
	        var count = 0;
	        var floatArrayLength = 0;
	        gltfOrder.forEach((key, index) => {
	            if (key in attributes) {
	                var accessor = this._gltf.accessors[attributes[key]];
	                count = accessor.count;
	                var buffer = this.getAccessorBuffer(accessor);
	                var floatArray = new Float32Array(buffer);
	                var fl = floatArray.length;
	                if (key == "JOINTS_0") {
	                    fl /= 4;
	                }
	                floatArrayLength += fl;
	                var layaAttribute = layaOrder[index];
	                attributeMap.set(layaAttribute, floatArray);
	                if (splitFlag)
	                    declarStr += ",";
	                else
	                    splitFlag = true;
	                declarStr += layaAttribute;
	            }
	        });
	        this.applyMorphtargets(attributeMap, morphtargets, shapeWeights);
	        var boneIndicesList = gltfSubMesh.boneIndicesList = new Array();
	        var subIndexStartArray = gltfSubMesh.subIndexStartArray = [];
	        var subIndexCountArray = gltfSubMesh.subIndexCountArray = [];
	        if (attributeMap.has("BLENDINDICES")) {
	            if (skinData.boneCount <= GLTFLoader.maxSubBoneCount) {
	                subIndexStartArray[0] = 0;
	                subIndexCountArray[0] = gltfSubMesh.indexArray.length;
	                boneIndicesList[0] = new Uint16Array(skinData.boneCount);
	                for (var bi = 0; bi < skinData.boneCount; bi++) {
	                    boneIndicesList[0][bi] = bi;
	                }
	            }
	            else {
	                this.splitSubMeshByBonesCount(attributeMap, gltfSubMesh.indexArray, skinData, boneIndicesList, subIndexStartArray, subIndexCountArray);
	                count = attributeMap.get("BLENDINDICES").length / 4;
	                floatArrayLength = 0;
	                attributeMap.forEach((value, key) => {
	                    var fl = value.length;
	                    if (key == "BLENDINDICES") {
	                        fl /= 4;
	                    }
	                    floatArrayLength += fl;
	                });
	            }
	            var biuint8Array = new Uint8Array(attributeMap.get("BLENDINDICES"));
	            attributeMap.set("BLENDINDICES", new Float32Array(biuint8Array.buffer));
	        }
	        else {
	            subIndexStartArray[0] = 0;
	            subIndexCountArray[0] = gltfSubMesh.indexArray.length;
	        }
	        var vertexArray = this.mergeOnePrimitiveArray(floatArrayLength, count, attributeMap);
	        attributeMap.clear();
	        gltfSubMesh.vertexArray = vertexArray;
	        gltfSubMesh.vertexCount = count;
	        gltfSubMesh.vertexDeclarationStr = declarStr;
	        return gltfSubMesh;
	    }
	    gltfTempParseVB(gltfSubMesh, attributeMap) {
	        var oldIndexArray = gltfSubMesh.indexArray;
	        var count = oldIndexArray.length;
	        var newIndexArray = new Uint32Array(count);
	        for (let index = 0; index < oldIndexArray.length; index++) {
	            newIndexArray[index] = index;
	        }
	        gltfSubMesh.indexArray = newIndexArray;
	        attributeMap.forEach((value, key) => {
	            let attOffset = 0;
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
	                    attOffset = 4;
	                    break;
	                case "TANGENT":
	                    attOffset = 4;
	                    break;
	                default:
	                    break;
	            }
	            let oldAttributeArray = value;
	            let newAttributeArray = new Float32Array(attOffset * count);
	            for (let index = 0; index < count; index++) {
	                let oi = oldIndexArray[index];
	                let voffset = index * attOffset;
	                let oldVOffset = oi * attOffset;
	                for (let i2 = 0; i2 < attOffset; i2++) {
	                    newAttributeArray[voffset + i2] = oldAttributeArray[oldVOffset + i2];
	                }
	            }
	            attributeMap.set(key, newAttributeArray);
	            oldAttributeArray = null;
	        });
	    }
	    splitSubMeshByBonesCount(attributeMap, indexArray, skinData, boneIndicesList, subIndexStartArray, subIndexCountArray) {
	        let maxSubBoneCount = GLTFLoader.maxSubBoneCount;
	        let start = 0;
	        let subIndexSet = new Set();
	        let boneIndexArray = attributeMap.get("BLENDINDICES");
	        let vertexCount = boneIndexArray.length / 4;
	        let resArray = new Float32Array(boneIndexArray.length).fill(9999);
	        let flagArray = new Array(vertexCount).fill(false);
	        for (let i = 0, n = indexArray.length; i < n; i += 3) {
	            let triangleSet = new Set();
	            for (let j = i; j < i + 3; j++) {
	                let ibIndex = indexArray[j];
	                let boneIndexOffset = ibIndex * 4;
	                for (let k = 0; k < 4; k++) {
	                    triangleSet.add(boneIndexArray[boneIndexOffset + k]);
	                }
	            }
	            let tempSet = new Set([...subIndexSet, ...triangleSet]);
	            if (tempSet.size > maxSubBoneCount) {
	                let count = i - start;
	                subIndexStartArray.push(start);
	                subIndexCountArray.push(count);
	                let curBoneList = Array.from(subIndexSet);
	                boneIndicesList.push(new Uint16Array(curBoneList));
	                start = i;
	                subIndexSet = new Set(triangleSet);
	            }
	            else {
	                subIndexSet = tempSet;
	            }
	            if (i == n - 3) {
	                let count = i - start + 3;
	                subIndexStartArray.push(start);
	                subIndexCountArray.push(count);
	                start = i;
	                let curBoneList = Array.from(subIndexSet);
	                boneIndicesList.push(new Uint16Array(curBoneList));
	            }
	        }
	        let drawCount = boneIndicesList.length;
	        let e = (subIndexCountArray.length == subIndexStartArray.length) && (subIndexStartArray.length == drawCount);
	        let newAttributeMap = new Map();
	        attributeMap.forEach((value, key) => {
	            let array = new Array();
	            newAttributeMap.set(key, array);
	        });
	        var curMaxIndex = vertexCount - 1;
	        for (let d = 0; d < drawCount; d++) {
	            let k = subIndexStartArray[d];
	            let l = subIndexCountArray[d];
	            let bl = boneIndicesList[d];
	            let batchFlag = new Array(vertexCount).fill(false);
	            let batchMap = new Map();
	            for (let area = 0; area < l; area++) {
	                let ci = indexArray[area + k];
	                let biStart = 4 * ci;
	                for (let cbi = biStart; cbi < biStart + 4; cbi++) {
	                    let oldBoneIndex = boneIndexArray[cbi];
	                    let newBoneIndex = bl.indexOf(oldBoneIndex);
	                    newBoneIndex = newBoneIndex == -1 ? 0 : newBoneIndex;
	                    if (flagArray[ci] && !batchFlag[ci]) {
	                        newAttributeMap.get("BLENDINDICES").push(newBoneIndex);
	                    }
	                    else if (flagArray[ci] && batchFlag[ci]) ;
	                    else {
	                        resArray[cbi] = newBoneIndex;
	                    }
	                }
	                if (!flagArray[ci] && !batchFlag[ci]) {
	                    batchFlag[ci] = true;
	                    batchMap.set(ci, ci);
	                }
	                else if (!flagArray[ci] && batchFlag[ci]) {
	                    indexArray[area + k] = batchMap.get(ci);
	                }
	                else if (flagArray[ci] && !batchFlag[ci]) {
	                    batchFlag[ci] = true;
	                    curMaxIndex++;
	                    batchMap.set(ci, curMaxIndex);
	                    indexArray[area + k] = curMaxIndex;
	                    newAttributeMap.forEach((value, key) => {
	                        let attOffset = 0;
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
	                                attOffset = 4;
	                                break;
	                            case "TANGENT":
	                                attOffset = 4;
	                                break;
	                            default:
	                                break;
	                        }
	                        let oldArray = attributeMap.get(key);
	                        if (key !== "BLENDINDICES") {
	                            for (let index = 0; index < attOffset; index++) {
	                                value.push(oldArray[index + ci * attOffset]);
	                            }
	                        }
	                    });
	                }
	                else if (flagArray[ci] && batchFlag[ci]) {
	                    indexArray[area + k] = batchMap.get(ci);
	                }
	            }
	            batchFlag.forEach((value, index) => {
	                flagArray[index] = value || flagArray[index];
	            });
	        }
	        newAttributeMap.forEach((value, key) => {
	            let oldFloatArray = attributeMap.get(key);
	            if (key == "BLENDINDICES") {
	                oldFloatArray = resArray;
	            }
	            let newLength = oldFloatArray.length + value.length;
	            let newFloatArray = new Float32Array(newLength);
	            newFloatArray.set(oldFloatArray, 0);
	            newFloatArray.set(value, oldFloatArray.length);
	            attributeMap.set(key, newFloatArray);
	        });
	        boneIndexArray = null;
	    }
	    gltfPrimitiveIndexBuffer(primitive) {
	        var indexAccessor = this._gltf.accessors[primitive.indices];
	        var buffer = this.getAccessorBuffer(indexAccessor);
	        var indexBuffer = new Uint32Array(buffer.length);
	        indexBuffer.set(buffer);
	        buffer = null;
	        return indexBuffer;
	    }
	    getAccessorBuffer(accessor) {
	        var accessorByteOffset = 0;
	        if (accessor.byteOffset !== undefined) {
	            accessorByteOffset = accessor.byteOffset;
	        }
	        var bufferView = this._gltf.bufferViews[accessor.bufferView];
	        var gltfBuffer = this._gltf.buffers[bufferView.buffer];
	        var buffer = this.gltfBuffers[bufferView.buffer];
	        var accessorStride;
	        switch (accessor.type) {
	            case exports.GLTFAccessorType.SCALAR:
	                accessorStride = 1;
	                break;
	            case exports.GLTFAccessorType.VEC2:
	                accessorStride = 2;
	                break;
	            case exports.GLTFAccessorType.VEC3:
	                accessorStride = 3;
	                break;
	            case exports.GLTFAccessorType.VEC4:
	                accessorStride = 4;
	                break;
	            case exports.GLTFAccessorType.MAT2:
	                accessorStride = 4;
	                break;
	            case exports.GLTFAccessorType.MAT3:
	                accessorStride = 9;
	                break;
	            case exports.GLTFAccessorType.MAT4:
	                accessorStride = 16;
	                break;
	        }
	        var bufferByteLength;
	        var arrayBuffer;
	        switch (accessor.componentType) {
	            case exports.GLTFComponentType.BYTE:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Int8Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	            case exports.GLTFComponentType.UNSIGNED_BYTE:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Uint8Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	            case exports.GLTFComponentType.SHORT:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Int16Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	            case exports.GLTFComponentType.UNSIGNED_SHORT:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Uint16Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	            case exports.GLTFComponentType.UNSIGNED_INT:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Uint32Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	            case exports.GLTFComponentType.FLOAT:
	                bufferByteLength = accessor.count * accessorStride;
	                arrayBuffer = new Float32Array(buffer, bufferView.byteOffset + accessorByteOffset, bufferByteLength);
	                break;
	        }
	        return arrayBuffer;
	    }
	    mergeOnePrimitiveArray(floatArrayLength, vertexCount, attributeMap) {
	        var vertexbufferArray = new Float32Array(floatArrayLength);
	        var stride = floatArrayLength / vertexCount;
	        var attributeOffset = 0;
	        attributeMap.forEach((value, key) => {
	            var attOffset;
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
	                    attOffset = 1;
	                    break;
	                case "TANGENT":
	                    attOffset = 4;
	                    break;
	                default:
	                    break;
	            }
	            for (var vertexNum = 0; vertexNum < vertexCount; vertexNum++) {
	                var arroffset = vertexNum * stride + attributeOffset;
	                var attBufferOffset = vertexNum * attOffset;
	                for (var attCount = attBufferOffset; attCount < attOffset + attBufferOffset; attCount++) {
	                    vertexbufferArray[arroffset++] = value[attCount];
	                }
	            }
	            attributeOffset += attOffset;
	        });
	        return vertexbufferArray;
	    }
	    generatMesh(gltfSubMeshs, meshVertexArrLength, meshIndexArrLength, meshName) {
	        var mesh = new Laya.Mesh();
	        mesh.name = meshName;
	        var vertexArray = new Float32Array(meshVertexArrLength);
	        var oriIndexArray = new Uint32Array(meshIndexArrLength);
	        var declarStr = this.mergeSubMeshArray(gltfSubMeshs, vertexArray, oriIndexArray);
	        var vertexDeclaration = Laya.VertexMesh.getVertexDeclaration(declarStr, false);
	        var gl = Laya.LayaGL.instance;
	        var vertexBuffer = new Laya.VertexBuffer3D(meshVertexArrLength * 4, gl.STATIC_DRAW, true);
	        vertexBuffer.vertexDeclaration = vertexDeclaration;
	        vertexBuffer.setData(vertexArray.buffer);
	        mesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
	        var ibFormat = Laya.IndexFormat.UInt32;
	        var indexArray = oriIndexArray;
	        if (mesh._vertexCount < 65536) {
	            ibFormat = Laya.IndexFormat.UInt16;
	            indexArray = new Uint16Array(oriIndexArray);
	            oriIndexArray = null;
	        }
	        var indexBuffer = new Laya.IndexBuffer3D(ibFormat, meshIndexArrLength, gl.STATIC_DRAW, true);
	        indexBuffer.setData(indexArray);
	        mesh._indexFormat = ibFormat;
	        mesh._vertexBuffer = vertexBuffer;
	        mesh._indexBuffer = indexBuffer;
	        mesh._setBuffer(vertexBuffer, indexBuffer);
	        mesh._setInstanceBuffer(mesh._instanceBufferStateType);
	        var subMeshCount = gltfSubMeshs.length;
	        var subMeshs = new Array(subMeshCount);
	        var subMeshOffset = 0;
	        for (var subCount = 0; subCount < subMeshCount; subCount++) {
	            var gltfSubMesh = gltfSubMeshs[subCount];
	            var subMesh = new Laya.SubMesh(mesh);
	            subMeshs[subCount] = subMesh;
	            subMesh._vertexBuffer = vertexBuffer;
	            subMesh._indexBuffer = indexBuffer;
	            var subIndexStart = subMeshOffset;
	            subMeshOffset += gltfSubMesh.indexArray.length;
	            var subIndexCount = gltfSubMesh.indexArray.length;
	            subMesh._setIndexRange(subIndexStart, subIndexCount, ibFormat);
	            subMesh._boneIndicesList = gltfSubMesh.boneIndicesList;
	            subMesh._subIndexBufferStart = gltfSubMesh.subIndexStartArray;
	            subMesh._subIndexBufferCount = gltfSubMesh.subIndexCountArray;
	            for (var subIndex = 0; subIndex < subMesh._subIndexBufferStart.length; subIndex++) {
	                subMesh._subIndexBufferStart[subIndex] += subIndexStart;
	            }
	        }
	        mesh._setSubMeshes(subMeshs);
	        mesh.calculateBounds();
	        var memorySize = vertexBuffer._byteLength + indexBuffer._byteLength;
	        mesh._setCPUMemory(memorySize);
	        mesh._setGPUMemory(memorySize);
	        return mesh;
	    }
	    mergeSubMeshArray(gltfSubMeshs, vertexArray, indexArray) {
	        var declartStr;
	        var vertexOffset = 0;
	        var indexOffset = 0;
	        var subIndexOffset = 0;
	        gltfSubMeshs.forEach((gltfSubMesh, index) => {
	            declartStr = gltfSubMesh.vertexDeclarationStr;
	            vertexArray.set(gltfSubMesh.vertexArray, vertexOffset);
	            for (var i = 0; i < gltfSubMesh.indexArray.length; i++) {
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
	GLTFLoader.maxSubBoneCount = 24;
	GLTFLoader.ROOTNAME = "GLTF_Root";
	GLTFLoader.GLTFIMAGETYPE = "nativeimage";
	GLTFLoader.loadedMap = {};
	GLTFLoader.textureMap = {};
	GLTFLoader.gltfAttributeOrder = ["POSITION", "NORMAL", "COLOR_0", "TEXCOORD_0", "TEXCOORD_1", "WEIGHTS_0", "JOINTS_0", "TANGENT", "JOINTS_1", "WEIGHTS_1"];
	GLTFLoader.layaAttributeOrder = ["POSITION", "NORMAL", "COLOR", "UV", "UV1", "BLENDWEIGHT", "BLENDINDICES", "TANGENT", "JOINTS_1", "WEIGHTS_1"];

	exports.GLTFBase64Tool = GLTFBase64Tool;
	exports.GLTFLoader = GLTFLoader;

}(window.Laya = window.Laya || {}, Laya));
