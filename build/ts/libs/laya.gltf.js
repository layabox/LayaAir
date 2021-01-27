(function (exports, Laya) {
	'use strict';

	class glTFBase64Tool {
	    constructor() {
	    }
	    static init() {
	        if (glTFBase64Tool.lookup)
	            return;
	        glTFBase64Tool.lookup = new Uint8Array(256);
	        for (var i = 0; i < glTFBase64Tool.chars.length; i++) {
	            glTFBase64Tool.lookup[glTFBase64Tool.chars.charCodeAt(i)] = i;
	        }
	    }
	    static isBase64String(str) {
	        return glTFBase64Tool.reg.test(str);
	    }
	    static encode(arraybuffer) {
	        var bytes = new Uint8Array(arraybuffer), i, len = bytes["length"], base64 = "";
	        for (i = 0; i < len; i += 3) {
	            base64 += glTFBase64Tool.chars[bytes[i] >> 2];
	            base64 += glTFBase64Tool.chars[((bytes[i] & 3) << 4) | (bytes[i + 1] >> 4)];
	            base64 += glTFBase64Tool.chars[((bytes[i + 1] & 15) << 2) | (bytes[i + 2] >> 6)];
	            base64 += glTFBase64Tool.chars[bytes[i + 2] & 63];
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
	        glTFBase64Tool.init();
	        var bufferLength = base64.length * 0.75, len = base64.length, i, p = 0, encoded1, encoded2, encoded3, encoded4;
	        if (base64[base64.length - 1] === "=") {
	            bufferLength--;
	            if (base64[base64.length - 2] === "=") {
	                bufferLength--;
	            }
	        }
	        var arraybuffer = new ArrayBuffer(bufferLength), bytes = new Uint8Array(arraybuffer);
	        for (i = 0; i < len; i += 4) {
	            encoded1 = glTFBase64Tool.lookup[base64.charCodeAt(i)];
	            encoded2 = glTFBase64Tool.lookup[base64.charCodeAt(i + 1)];
	            encoded3 = glTFBase64Tool.lookup[base64.charCodeAt(i + 2)];
	            encoded4 = glTFBase64Tool.lookup[base64.charCodeAt(i + 3)];
	            bytes[p++] = (encoded1 << 2) | (encoded2 >> 4);
	            bytes[p++] = ((encoded2 & 15) << 4) | (encoded3 >> 2);
	            bytes[p++] = ((encoded3 & 3) << 6) | (encoded4 & 63);
	        }
	        return arraybuffer;
	    }
	    ;
	}
	glTFBase64Tool.chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
	glTFBase64Tool.reg = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,([a-z0-9!$&',()*+;=\-._~:@\/?%\s]*?)\s*$/i;
	glTFBase64Tool.reghead = /^\s*data:([a-z]+\/[a-z0-9-+.]+(;[a-z-]+=[a-z0-9-]+)?)?(;base64)?,/i;
	glTFBase64Tool.lookup = null;

	class PrimitiveSubMesh {
	    constructor() {
	    }
	}
	class ClipNode {
	    constructor() {
	    }
	}
	class glTFUtils {
	    static _parse(glTFData, propertyParams = null, constructParams = null) {
	        glTFUtils._initData(glTFData);
	        if (!glTFUtils._checkglTFVersion(this._glTF.asset)) {
	            console.warn("glTF version wrong!");
	            return new Laya.Sprite3D();
	        }
	        glTFUtils._initBufferData(glTFData.buffers);
	        glTFUtils._initTextureData(glTFData.images);
	        glTFUtils._loadMaterials(glTFData.materials);
	        glTFUtils._loadNodes(glTFData.nodes);
	        glTFUtils.buildHierarchy(glTFData.nodes);
	        glTFUtils._loadScenes(glTFData.scenes);
	        glTFUtils._loadAnimations(glTFData.animations);
	        let defaultSceneIndex = (glTFData.scene != undefined) ? glTFData.scene : 0;
	        let defaultScene = glTFUtils._glTFScenes[defaultSceneIndex];
	        glTFUtils._clearData();
	        return defaultScene;
	    }
	    static _initData(glTFData) {
	        glTFUtils._glTF = glTFData;
	        (glTFData.buffers) && (glTFUtils._glTFBuffers.length = glTFData.buffers.length);
	        (glTFData.textures) && (glTFUtils._glTFTextures.length = glTFData.textures.length);
	        (glTFData.materials) && (glTFUtils._glTFMaterials.length = glTFData.materials.length);
	        (glTFData.nodes) && (glTFUtils._glTFNodes.length = glTFData.nodes.length);
	        (glTFData.scenes) && (glTFUtils._glTFScenes.length = glTFData.scenes.length);
	    }
	    static _clearData() {
	        glTFUtils._glTF = null;
	        glTFUtils._glTFBuffers.length = 0;
	        glTFUtils._glTFTextures.length = 0;
	        glTFUtils._glTFMaterials.length = 0;
	        glTFUtils._glTFNodes.length = 0;
	        glTFUtils._glTFScenes.length = 0;
	        glTFUtils.NAMEID = 0;
	    }
	    static _checkglTFVersion(asset) {
	        if (asset.version !== "2.0") {
	            return false;
	        }
	        return true;
	    }
	    static RegisterExtra(context, extraName, handler) {
	        let extra = glTFUtils.Extras[context] || (glTFUtils.Extras[context] = {});
	        extra[extraName] = handler;
	    }
	    static UnRegisterExtra(context, extraName, recoverHandler = true) {
	        let extra = glTFUtils.Extras[context] || (glTFUtils.Extras[context] = {});
	        if (recoverHandler) {
	            let extraHandler = extra[extraName];
	            extraHandler && extraHandler.recover();
	        }
	        delete extra[extraName];
	    }
	    static ExecuteExtras(context, glTFExtra, createHandler, params) {
	        let contextExtra = glTFUtils.Extras[context];
	        let extraRes = null;
	        if (contextExtra) {
	            for (const key in glTFExtra) {
	                let extraHandler = contextExtra[key];
	                extraRes = extraHandler ? extraHandler.runWith([...params, createHandler]) : extraRes;
	            }
	        }
	        extraRes = extraRes || createHandler.runWith(params);
	        createHandler.recover();
	        return extraRes;
	    }
	    static getNodeRandomName(context) {
	        return `${context}_${glTFUtils.NAMEID++}`;
	    }
	    static _initBufferData(buffers) {
	        if (!buffers)
	            return;
	        buffers.forEach((buffer, index) => {
	            glTFUtils._glTFBuffers[index] = Laya.Loader.getRes(buffer.uri);
	        });
	    }
	    static getAccessorComponentsNum(type) {
	        switch (type) {
	            case "SCALAR": return 1;
	            case "VEC2": return 2;
	            case "VEC3": return 3;
	            case "VEC4": return 4;
	            case "MAT2": return 4;
	            case "MAT3": return 9;
	            case "MAT4": return 16;
	            default: return 0;
	        }
	    }
	    static getAttributeNum(attriStr) {
	        switch (attriStr) {
	            case "POSITION": return 3;
	            case "NORMAL": return 3;
	            case "COLOR": return 4;
	            case "UV": return 2;
	            case "UV1": return 2;
	            case "BLENDWEIGHT": return 4;
	            case "BLENDINDICES": return 4;
	            case "TANGENT": return 4;
	            default: return 0;
	        }
	    }
	    static _getTypedArrayConstructor(componentType) {
	        switch (componentType) {
	            case 5120: return Int8Array;
	            case 5121: return Uint8Array;
	            case 5122: return Int16Array;
	            case 5123: return Uint16Array;
	            case 5125: return Uint32Array;
	            case 5126: return Float32Array;
	        }
	    }
	    static getBufferwithAccessorIndex(accessorIndex) {
	        let accessor = glTFUtils._glTF.accessors[accessorIndex];
	        if (!accessor)
	            return null;
	        let bufferView = glTFUtils._glTF.bufferViews[accessor.bufferView];
	        let buffer = glTFUtils._glTFBuffers[bufferView.buffer];
	        let count = accessor.count;
	        let contentStride = glTFUtils.getAccessorComponentsNum(accessor.type);
	        let byteOffset = (bufferView.byteOffset || 0) + (accessor.byteOffset || 0);
	        let byteLength = count * contentStride;
	        const constructor = glTFUtils._getTypedArrayConstructor(accessor.componentType);
	        return new constructor(buffer, byteOffset, byteLength);
	    }
	    static _initTextureData(images) {
	        if (!images)
	            return;
	        images.forEach((image, index) => {
	            if (image.bufferView) {
	                console.warn("glTF Loader: Todo: image bufferView data.");
	            }
	            else {
	                glTFUtils._glTFTextures[index] = Laya.Loader.getRes(image.uri);
	            }
	        });
	    }
	    static getTextureMipmap(glTFSampler) {
	        if (glTFSampler)
	            return glTFSampler.minFilter === 9729 ||
	                glTFSampler.minFilter === 9728;
	        else
	            return true;
	    }
	    static getTextureFormat(glTFImage) {
	        if (glTFImage.mimeType === "image/png") {
	            return 1;
	        }
	        else {
	            return 0;
	        }
	    }
	    static getTextureFilterMode(glTFSampler) {
	        if (!glTFSampler) {
	            return 1;
	        }
	        if (glTFSampler.magFilter === 9728) {
	            return 0;
	        }
	        else if (glTFUtils.getTextureMipmap(glTFSampler)) {
	            if (glTFSampler.minFilter === 9987)
	                return 2;
	            return 1;
	        }
	        return 1;
	    }
	    static getTextureWrapMode(mode) {
	        if (mode === 33071) {
	            return 1;
	        }
	        return 0;
	    }
	    static getTextureConstructParams(glTFImage, glTFSampler) {
	        let constructParams = [];
	        constructParams[0] = 0;
	        constructParams[1] = 0;
	        constructParams[2] = glTFUtils.getTextureFormat(glTFImage);
	        constructParams[3] = glTFUtils.getTextureMipmap(glTFSampler);
	        return constructParams;
	    }
	    static getTexturePropertyParams(glTFSampler) {
	        let propertyParams = {};
	        if (!glTFSampler) {
	            return null;
	        }
	        propertyParams.filterMode = glTFUtils.getTextureFilterMode(glTFSampler);
	        propertyParams.wrapModeU = glTFUtils.getTextureWrapMode(glTFSampler.wrapS);
	        propertyParams.wrapModeV = glTFUtils.getTextureWrapMode(glTFSampler.wrapT);
	        propertyParams.anisoLevel = 16;
	        return propertyParams;
	    }
	    static getTexturewithInfo(glTFTextureInfo) {
	        if (glTFTextureInfo.texCoord) {
	            console.warn("glTF Loader: non 0 uv channel unsupported.");
	        }
	        return glTFUtils._glTFTextures[glTFTextureInfo.index];
	    }
	    static _loadMaterials(glTFMaterials) {
	        if (!glTFMaterials)
	            return;
	        glTFMaterials.forEach((glTFMaterial, index) => {
	            glTFUtils._glTFMaterials[index] = glTFUtils._loadMaterial(glTFMaterial);
	        });
	    }
	    static _loadMaterial(glTFMaterial) {
	        if (glTFMaterial.extras) {
	            let createHandler = Laya.Handler.create(this, glTFUtils._createdefaultMaterial, null, false);
	            return glTFUtils.ExecuteExtras("MATERIAL", glTFMaterial.extras, createHandler, [glTFMaterial]);
	        }
	        return glTFUtils._createdefaultMaterial(glTFMaterial);
	    }
	    static _createdefaultMaterial(glTFMaterial) {
	        let layaPBRMaterial = new Laya.PBRStandardMaterial();
	        layaPBRMaterial.name = glTFMaterial.name ? glTFMaterial.name : "";
	        if (glTFMaterial.pbrMetallicRoughness) {
	            glTFUtils.applyPBRMetallicRoughness(glTFMaterial.pbrMetallicRoughness, layaPBRMaterial);
	        }
	        if (glTFMaterial.normalTexture) {
	            layaPBRMaterial.normalTexture = glTFUtils.getTexturewithInfo(glTFMaterial.normalTexture);
	            if (glTFMaterial.normalTexture.scale != undefined) {
	                layaPBRMaterial.normalTextureScale = glTFMaterial.normalTexture.scale;
	            }
	        }
	        if (glTFMaterial.occlusionTexture) {
	            layaPBRMaterial.occlusionTexture = glTFUtils.getTexturewithInfo(glTFMaterial.occlusionTexture);
	            if (glTFMaterial.occlusionTexture.strength != undefined) {
	                layaPBRMaterial.occlusionTextureStrength = glTFMaterial.occlusionTexture.strength;
	            }
	        }
	        if (glTFMaterial.emissiveTexture) {
	            layaPBRMaterial.emissionTexture = glTFUtils.getTexturewithInfo(glTFMaterial.emissiveTexture);
	            if (layaPBRMaterial.emissionTexture) {
	                layaPBRMaterial.enableEmission = true;
	            }
	        }
	        if (glTFMaterial.emissiveFactor) {
	            layaPBRMaterial.emissionColor.fromArray(glTFMaterial.emissiveFactor);
	            layaPBRMaterial.emissionColor.w = 1.0;
	            layaPBRMaterial.enableEmission = true;
	        }
	        let renderMode = glTFMaterial.alphaMode || "OPAQUE";
	        switch (renderMode) {
	            case "OPAQUE": {
	                layaPBRMaterial.renderMode = Laya.PBRRenderMode.Opaque;
	                break;
	            }
	            case "BLEND": {
	                layaPBRMaterial.renderMode = Laya.PBRRenderMode.Transparent;
	                break;
	            }
	            case "MASK": {
	                layaPBRMaterial.renderMode = Laya.PBRRenderMode.Cutout;
	                break;
	            }
	            default:
	        }
	        if (glTFMaterial.alphaCutoff != undefined) {
	            layaPBRMaterial.alphaTestValue = glTFMaterial.alphaCutoff;
	        }
	        if (glTFMaterial.doubleSided) {
	            layaPBRMaterial.cull = Laya.RenderState.CULL_NONE;
	        }
	        return layaPBRMaterial;
	    }
	    static applyPBRMetallicRoughness(pbrMetallicRoughness, layaPBRMaterial) {
	        if (pbrMetallicRoughness.baseColorFactor) {
	            layaPBRMaterial.albedoColor.fromArray(pbrMetallicRoughness.baseColorFactor);
	        }
	        if (pbrMetallicRoughness.baseColorTexture) {
	            layaPBRMaterial.albedoTexture = glTFUtils.getTexturewithInfo(pbrMetallicRoughness.baseColorTexture);
	        }
	        if (pbrMetallicRoughness.metallicFactor != undefined) {
	            layaPBRMaterial.metallic = pbrMetallicRoughness.metallicFactor;
	        }
	        if (pbrMetallicRoughness.roughnessFactor != undefined) {
	            layaPBRMaterial.smoothness = 1.0 - pbrMetallicRoughness.roughnessFactor;
	        }
	        if (pbrMetallicRoughness.metallicRoughnessTexture) {
	            layaPBRMaterial.metallicGlossTexture = glTFUtils.getTexturewithInfo(pbrMetallicRoughness.metallicRoughnessTexture);
	        }
	    }
	    static pickMeshMaterials(glTFMesh) {
	        let materials = [];
	        glTFMesh.primitives.forEach(primitive => {
	            if (primitive.material != undefined) {
	                let material = glTFUtils._glTFMaterials[primitive.material];
	                materials.push(material);
	            }
	            else {
	                let material = new Laya.PBRStandardMaterial();
	                materials.push(material);
	                glTFUtils._glTFMaterials.push(material);
	                primitive.material = glTFUtils._glTFMaterials.indexOf(material);
	            }
	        });
	        return materials;
	    }
	    static _loadScenes(glTFScenes) {
	        if (!glTFScenes)
	            return;
	        glTFScenes.forEach((glTFScene, index) => {
	            glTFUtils._glTFScenes[index] = glTFUtils._loadScene(glTFScene);
	        });
	    }
	    static _loadScene(glTFScene) {
	        return glTFUtils._createSceneNode(glTFScene);
	    }
	    static _createSceneNode(glTFScene) {
	        let glTFSceneNode = new Laya.Sprite3D(glTFScene.name || "glTF_Scene_node");
	        glTFScene.nodes.forEach(nodeIndex => {
	            let sprite = glTFUtils._glTFNodes[nodeIndex];
	            glTFSceneNode.addChild(sprite);
	        });
	        return glTFSceneNode;
	    }
	    static applyTransform(glTFNode, sprite) {
	        if (glTFNode.matrix) {
	            let localMatrix = sprite.transform.localMatrix;
	            localMatrix.elements.set(glTFNode.matrix);
	            sprite.transform.localMatrix = localMatrix;
	        }
	        else {
	            let localPosition = sprite.transform.localPosition;
	            let localRotation = sprite.transform.localRotation;
	            let localScale = sprite.transform.localScale;
	            glTFNode.translation && localPosition.fromArray(glTFNode.translation);
	            glTFNode.rotation && localRotation.fromArray(glTFNode.rotation);
	            glTFNode.scale && localScale.fromArray(glTFNode.scale);
	            sprite.transform.localPosition = localPosition;
	            sprite.transform.localRotation = localRotation;
	            sprite.transform.localScale = localScale;
	        }
	    }
	    static buildHierarchy(glTFNodes) {
	        glTFNodes.forEach((glTFNode, index) => {
	            let sprite = glTFUtils._glTFNodes[index];
	            if (glTFNode.children) {
	                glTFNode.children.forEach((childIndex) => {
	                    let child = glTFUtils._glTFNodes[childIndex];
	                    sprite.addChild(child);
	                });
	            }
	        });
	        glTFNodes.forEach((glTFNode, index) => {
	            let sprite = glTFUtils._glTFNodes[index];
	            if (sprite instanceof Laya.SkinnedMeshSprite3D) {
	                glTFUtils.fixSkinnedSprite(glTFNode, sprite);
	            }
	        });
	    }
	    static _loadNodes(glTFNodes) {
	        if (!glTFNodes) {
	            return;
	        }
	        glTFNodes.forEach((glTFNode, index) => {
	            glTFNode.name = glTFNode.name || glTFUtils.getNodeRandomName("node");
	        });
	        glTFNodes.forEach((glTFNode, index) => {
	            glTFUtils._glTFNodes[index] = glTFUtils._loadNode(glTFNode);
	        });
	    }
	    static _loadNode(glTFNode) {
	        return glTFUtils._createSprite3D(glTFNode);
	    }
	    static _createSprite3D(glTFNode) {
	        glTFNode.name = glTFNode.name;
	        if (glTFNode.skin != undefined) {
	            let sprite = glTFUtils._createSkinnedMeshSprite3D(glTFNode);
	            glTFUtils.applyTransform(glTFNode, sprite);
	            return sprite;
	        }
	        else if (glTFNode.mesh != undefined) {
	            let sprite = glTFUtils._createMeshSprite3D(glTFNode);
	            glTFUtils.applyTransform(glTFNode, sprite);
	            return sprite;
	        }
	        else {
	            let sprite = new Laya.Sprite3D(glTFNode.name);
	            glTFUtils.applyTransform(glTFNode, sprite);
	            return sprite;
	        }
	    }
	    static _createMeshSprite3D(glTFNode) {
	        let glTFMesh = glTFUtils._glTF.meshes[glTFNode.mesh];
	        let mesh = glTFUtils._loadMesh(glTFMesh);
	        let materials = glTFUtils.pickMeshMaterials(glTFMesh);
	        let sprite = new Laya.MeshSprite3D(mesh, glTFNode.name);
	        sprite.meshRenderer.sharedMaterials = materials;
	        return sprite;
	    }
	    static _createSkinnedMeshSprite3D(glTFNode) {
	        let glTFMesh = glTFUtils._glTF.meshes[glTFNode.mesh];
	        let glTFSkin = glTFUtils._glTF.skins[glTFNode.skin];
	        let mesh = glTFUtils._loadMesh(glTFMesh, glTFSkin);
	        let materials = glTFUtils.pickMeshMaterials(glTFMesh);
	        let sprite = new Laya.SkinnedMeshSprite3D(mesh, glTFNode.name);
	        sprite.skinnedMeshRenderer.sharedMaterials = materials;
	        return sprite;
	    }
	    static getArrributeBuffer(attributeAccessorIndex, layaDeclarStr, attributeMap, vertexDeclarArr) {
	        let attributeBuffer = glTFUtils.getBufferwithAccessorIndex(attributeAccessorIndex);
	        if (!attributeBuffer)
	            return null;
	        vertexDeclarArr.push(layaDeclarStr);
	        let res = attributeBuffer;
	        attributeMap.set(layaDeclarStr, res);
	        return res;
	    }
	    static getIndexBuffer(attributeAccessorIndex, vertexCount) {
	        let indexBuffer = glTFUtils.getBufferwithAccessorIndex(attributeAccessorIndex);
	        if (indexBuffer) {
	            return new Uint32Array(indexBuffer).reverse();
	        }
	        else {
	            let indices = new Uint32Array(vertexCount);
	            for (let i = 0; i < vertexCount; i++) {
	                indices[i] = i;
	            }
	            return indices;
	        }
	    }
	    static parseMeshwithSubMeshData(subDatas, layaMesh) {
	        let vertexCount = 0;
	        let indexCount = 0;
	        let vertexDecler = undefined;
	        subDatas.forEach(subData => {
	            vertexCount += subData.vertexCount;
	            indexCount += subData.indices.length;
	            vertexDecler = vertexDecler || subData.vertexDecler;
	        });
	        let vertexDeclaration = Laya.VertexMesh.getVertexDeclaration(vertexDecler, false);
	        let vertexByteStride = vertexDeclaration.vertexStride;
	        let vertexFloatStride = vertexByteStride / 4;
	        let vertexArray = new Float32Array(vertexFloatStride * vertexCount);
	        let indexArray;
	        let ibFormat = Laya.IndexFormat.UInt32;
	        if (vertexCount < 65536) {
	            indexArray = new Uint16Array(indexCount);
	            ibFormat = Laya.IndexFormat.UInt16;
	        }
	        glTFUtils.fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride);
	        glTFUtils.generatMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh);
	    }
	    static fillMeshBuffers(subDatas, vertexArray, indexArray, vertexFloatStride) {
	        let ibPosOffset = 0;
	        let ibVertexOffset = 0;
	        let vbPosOffset = 0;
	        subDatas.forEach((subData) => {
	            let iAOffset = ibPosOffset;
	            let vertexCount = subData.vertexCount;
	            let subIb = subData.indices;
	            for (let index = 0; index < subIb.length; index++) {
	                indexArray[iAOffset + index] = subIb[index] + ibVertexOffset;
	            }
	            ibPosOffset += subIb.length;
	            ibVertexOffset += vertexCount;
	            const fillAttributeBuffer = (value, attriOffset, attriFloatCount = 0) => {
	                let startOffset = vbPosOffset + attriOffset;
	                for (let index = 0; index < vertexCount; index++) {
	                    for (let ac = 0; ac < attriFloatCount; ac++) {
	                        vertexArray[startOffset + index * vertexFloatStride + ac] = value[index * attriFloatCount + ac];
	                    }
	                }
	            };
	            let attriOffset = 0;
	            let attributeMap = subData.attributeMap;
	            let position = attributeMap.get("POSITION");
	            (position) && (fillAttributeBuffer(position, attriOffset, 3), attriOffset += 3);
	            let normal = attributeMap.get("NORMAL");
	            (normal) && (fillAttributeBuffer(normal, attriOffset, 3), attriOffset += 3);
	            let color = attributeMap.get("COLOR");
	            (color) && (fillAttributeBuffer(color, attriOffset, 4), attriOffset += 4);
	            let uv = attributeMap.get("UV");
	            (uv) && (fillAttributeBuffer(uv, attriOffset, 2), attriOffset += 2);
	            let uv1 = attributeMap.get("UV1");
	            (uv1) && (fillAttributeBuffer(uv1, attriOffset, 2), attriOffset += 2);
	            let blendWeight = attributeMap.get("BLENDWEIGHT");
	            (blendWeight) && (fillAttributeBuffer(blendWeight, attriOffset, 4), attriOffset += 4);
	            let blendIndices = attributeMap.get("BLENDINDICES");
	            if (blendIndices) {
	                let blendIndicesUint8 = new Uint8Array(blendIndices);
	                let blendIndicesFloat32 = new Float32Array(blendIndicesUint8.buffer);
	                fillAttributeBuffer(blendIndicesFloat32, attriOffset, 1), attriOffset += 1;
	            }
	            let tangent = attributeMap.get("TANGENT");
	            (tangent) && (fillAttributeBuffer(tangent, attriOffset, 4), attriOffset += 4);
	            vbPosOffset += vertexCount * vertexFloatStride;
	        });
	    }
	    static splitSubMeshByBonesCount(attributeMap, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray) {
	        let maxSubBoneCount = glTFUtils.maxSubBoneCount;
	        let start = 0;
	        let subIndexSet = new Set();
	        let boneIndexArray = attributeMap.get("BLENDINDICES");
	        let vertexCount = boneIndexArray.length / 4;
	        let resArray = new Float32Array(boneIndexArray.length);
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
	        let newAttributeMap = new Map();
	        attributeMap.forEach((value, key) => {
	            let array = new Array();
	            newAttributeMap.set(key, array);
	        });
	        let curMaxIndex = vertexCount - 1;
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
	                        let attOffset = glTFUtils.getAttributeNum(key);
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
	    static generatMesh(vertexArray, indexArray, vertexDeclaration, ibFormat, subDatas, layaMesh) {
	        let gl = Laya.LayaGL.instance;
	        let vertexBuffer = new Laya.VertexBuffer3D(vertexArray.byteLength, gl.STATIC_DRAW, true);
	        vertexBuffer.vertexDeclaration = vertexDeclaration;
	        vertexBuffer.setData(vertexArray.buffer);
	        let indexBuffer = new Laya.IndexBuffer3D(ibFormat, indexArray.length, gl.STATIC_DRAW, true);
	        indexBuffer.setData(indexArray);
	        layaMesh._indexFormat = ibFormat;
	        layaMesh._indexBuffer = indexBuffer;
	        layaMesh._vertexBuffer = vertexBuffer;
	        layaMesh._setBuffer(vertexBuffer, indexBuffer);
	        layaMesh._vertexCount = vertexBuffer._byteLength / vertexDeclaration.vertexStride;
	        let subMeshOffset = 0;
	        let subMeshCount = subDatas.length;
	        let subMeshes = new Array(subMeshCount);
	        for (let index = 0; index < subMeshCount; index++) {
	            let subData = subDatas[index];
	            let subMesh = new Laya.SubMesh(layaMesh);
	            subMeshes[index] = subMesh;
	            subMesh._vertexBuffer = vertexBuffer;
	            subMesh._indexBuffer = indexBuffer;
	            let subIndexStart = subMeshOffset;
	            subMeshOffset += subData.indices.length;
	            let subIndexCount = subData.indices.length;
	            subMesh._setIndexRange(subIndexStart, subIndexCount, ibFormat);
	            subMesh._boneIndicesList = subData.boneIndicesList;
	            subMesh._subIndexBufferStart = subData.subIndexStartArray;
	            subMesh._subIndexBufferCount = subData.subIndexCountArray;
	            for (let subIndex = 0; subIndex < subMesh._subIndexBufferStart.length; subIndex++) {
	                subMesh._subIndexBufferStart[subIndex] += subIndexStart;
	            }
	        }
	        layaMesh._setSubMeshes(subMeshes);
	        layaMesh.calculateBounds();
	        let memorySize = vertexBuffer._byteLength + indexBuffer._byteLength;
	        layaMesh._setCPUMemory(memorySize);
	        layaMesh._setGPUMemory(memorySize);
	    }
	    static applyglTFSkinData(mesh, subDatas, glTFSkin) {
	        if (!glTFSkin)
	            return;
	        let joints = glTFSkin.joints;
	        let inverseBindMatricesArray = new Float32Array(glTFUtils.getBufferwithAccessorIndex(glTFSkin.inverseBindMatrices));
	        let boneCount = joints.length;
	        let boneNames = mesh._boneNames = [];
	        joints.forEach(nodeIndex => {
	            let node = glTFUtils._glTF.nodes[nodeIndex];
	            boneNames.push(node.name);
	        });
	        mesh._inverseBindPoses = [];
	        mesh._inverseBindPosesBuffer = inverseBindMatricesArray.buffer;
	        mesh._setInstanceBuffer(Laya.Mesh.MESH_INSTANCEBUFFER_TYPE_NORMAL);
	        for (let index = 0; index < boneCount; index++) {
	            let bindPosesArrayOffset = 16 * index;
	            let matElement = inverseBindMatricesArray.slice(bindPosesArrayOffset, bindPosesArrayOffset + 16);
	            mesh._inverseBindPoses[index] = new Laya.Matrix4x4(matElement[0], matElement[1], matElement[2], matElement[3], matElement[4], matElement[5], matElement[6], matElement[7], matElement[8], matElement[9], matElement[10], matElement[11], matElement[12], matElement[13], matElement[14], matElement[15], matElement);
	        }
	        let subCount = subDatas.length;
	        let skinnedCache = mesh._skinnedMatrixCaches;
	        skinnedCache.length = mesh._inverseBindPoses.length;
	        for (let subIndex = 0; subIndex < subCount; subIndex++) {
	            let submesh = mesh.getSubMesh(subIndex);
	            let drawCount = submesh._subIndexBufferStart.length;
	            for (let drawIndex = 0; drawIndex < drawCount; drawIndex++) {
	                let boneIndices = submesh._boneIndicesList[drawIndex];
	                for (let bni = 0; bni < boneIndices.length; bni++) {
	                    let bn = boneIndices[bni];
	                    skinnedCache[bn] || (skinnedCache[bn] = new Laya.skinnedMatrixCache(subIndex, drawIndex, bni));
	                }
	            }
	        }
	        for (let index = 0; index < skinnedCache.length; index++) {
	            if (!skinnedCache[index]) {
	                skinnedCache[index] = new Laya.skinnedMatrixCache(0, 0, 0);
	            }
	        }
	    }
	    static _loadMesh(glTFMesh, glTFSkin) {
	        if (glTFMesh.extras) {
	            let createHandler = Laya.Handler.create(this, glTFUtils._createMesh, null, false);
	            return glTFUtils.ExecuteExtras("MESH", glTFMesh.extras, createHandler, [glTFMesh, glTFSkin]);
	        }
	        let mesh = glTFUtils._createMesh(glTFMesh, glTFSkin);
	        return mesh;
	    }
	    static _createMesh(glTFMesh, glTFSkin) {
	        let layaMesh = new Laya.Mesh();
	        let glTFMeshPrimitives = glTFMesh.primitives;
	        let morphWeights = glTFMesh.weights;
	        let boneCount = (glTFSkin) ? glTFSkin.joints.length : 0;
	        let subDatas = [];
	        glTFMeshPrimitives.forEach((glTFMeshPrimitive) => {
	            let mode = glTFMeshPrimitive.mode;
	            if (mode == undefined)
	                mode = 4;
	            if (4 != mode) {
	                console.warn("glTF Loader: only support gl.TRIANGLES.");
	                debugger;
	            }
	            let vertexDeclarArr = [];
	            let attributeMap = new Map();
	            let attributes = glTFMeshPrimitive.attributes;
	            let position = glTFUtils.getArrributeBuffer(attributes.POSITION, "POSITION", attributeMap, vertexDeclarArr);
	            let normal = glTFUtils.getArrributeBuffer(attributes.NORMAL, "NORMAL", attributeMap, vertexDeclarArr);
	            let color = glTFUtils.getArrributeBuffer(attributes.COLOR_0, "COLOR", attributeMap, vertexDeclarArr);
	            let uv = glTFUtils.getArrributeBuffer(attributes.TEXCOORD_0, "UV", attributeMap, vertexDeclarArr);
	            let uv1 = glTFUtils.getArrributeBuffer(attributes.TEXCOORD_1, "UV1", attributeMap, vertexDeclarArr);
	            let blendWeight = glTFUtils.getArrributeBuffer(attributes.WEIGHTS_0, "BLENDWEIGHT", attributeMap, vertexDeclarArr);
	            let blendIndices = glTFUtils.getArrributeBuffer(attributes.JOINTS_0, "BLENDINDICES", attributeMap, vertexDeclarArr);
	            let tangent = glTFUtils.getArrributeBuffer(attributes.TANGENT, "TANGENT", attributeMap, vertexDeclarArr);
	            let targets = glTFMeshPrimitive.targets;
	            (targets) && targets.forEach((target, index) => {
	                let weight = morphWeights[index];
	                let morphPosition = glTFUtils.getBufferwithAccessorIndex(target.POSITION);
	                let morphNormal = glTFUtils.getBufferwithAccessorIndex(target.NORMAL);
	                let morphTangent = glTFUtils.getBufferwithAccessorIndex(target.TANGENT);
	                (morphPosition) && morphPosition.forEach((value, index) => {
	                    position[index] += value * weight;
	                });
	                (morphNormal) && morphNormal.forEach((value, index) => {
	                    normal[index] += value * weight;
	                });
	                (morphTangent) && morphTangent.forEach((value, index) => {
	                    tangent[index] += value * weight;
	                });
	            });
	            let vertexCount = position.length / 3;
	            let indexArray = glTFUtils.getIndexBuffer(glTFMeshPrimitive.indices, vertexCount);
	            let boneIndicesList = new Array();
	            let subIndexStartArray = [];
	            let subIndexCountArray = [];
	            if (glTFSkin) {
	                if (boneCount > glTFUtils.maxSubBoneCount) {
	                    glTFUtils.splitSubMeshByBonesCount(attributeMap, indexArray, boneIndicesList, subIndexStartArray, subIndexCountArray);
	                    vertexCount = attributeMap.get("POSITION").length / 3;
	                }
	                else {
	                    subIndexStartArray[0] = 0;
	                    subIndexCountArray[0] = indexArray.length;
	                    boneIndicesList[0] = new Uint16Array(boneCount);
	                    for (let bi = 0; bi < boneCount; bi++) {
	                        boneIndicesList[0][bi] = bi;
	                    }
	                }
	            }
	            else {
	                subIndexStartArray[0] = 0;
	                subIndexCountArray[0] = indexArray.length;
	            }
	            let vertexDeclaration = vertexDeclarArr.toString();
	            let subData = new PrimitiveSubMesh();
	            subDatas.push(subData);
	            subData.attributeMap = attributeMap;
	            subData.indices = indexArray;
	            subData.vertexCount = vertexCount;
	            subData.vertexDecler = vertexDeclaration;
	            subData.boneIndicesList = boneIndicesList;
	            subData.subIndexStartArray = subIndexStartArray;
	            subData.subIndexCountArray = subIndexCountArray;
	        });
	        glTFUtils.parseMeshwithSubMeshData(subDatas, layaMesh);
	        glTFUtils.applyglTFSkinData(layaMesh, subDatas, glTFSkin);
	        return layaMesh;
	    }
	    static calSkinnedSpriteLocalBounds(skinned) {
	        let render = skinned.skinnedMeshRenderer;
	        let mesh = skinned.meshFilter.sharedMesh;
	        let rootBone = render.rootBone;
	        let oriRootMatrix = rootBone.transform.worldMatrix;
	        let invertRootMatrix = new Laya.Matrix4x4();
	        oriRootMatrix.invert(invertRootMatrix);
	        let indices = mesh.getIndices();
	        let positions = [];
	        let boneIndices = [];
	        let boneWeights = [];
	        mesh.getPositions(positions);
	        mesh.getBoneIndices(boneIndices);
	        mesh.getBoneWeights(boneWeights);
	        let oriBoneIndeices = [];
	        mesh._subMeshes.forEach((subMesh, index) => {
	            let bonelists = subMesh._boneIndicesList;
	            bonelists.forEach((bonelist, listIndex) => {
	                let start = subMesh._subIndexBufferStart[listIndex];
	                let count = subMesh._subIndexBufferCount[listIndex];
	                let endIndex = count + start;
	                for (let iindex = start; iindex < endIndex; iindex++) {
	                    let ii = indices[iindex];
	                    let boneIndex = boneIndices[ii];
	                    let x = bonelist[boneIndex.x];
	                    let y = bonelist[boneIndex.y];
	                    let z = bonelist[boneIndex.z];
	                    let w = bonelist[boneIndex.w];
	                    oriBoneIndeices[ii] = new Laya.Vector4(x, y, z, w);
	                }
	            });
	        });
	        let inverseBindPoses = mesh._inverseBindPoses;
	        let bones = render.bones;
	        let ubones = [];
	        let tempMat = new Laya.Matrix4x4();
	        bones.forEach((bone, index) => {
	            ubones[index] = new Laya.Matrix4x4();
	            Laya.Matrix4x4.multiply(invertRootMatrix, bone.transform.worldMatrix, tempMat);
	            Laya.Matrix4x4.multiply(tempMat, inverseBindPoses[index], ubones[index]);
	        });
	        let skinTransform = new Laya.Matrix4x4;
	        let resPos = new Laya.Vector3();
	        let min = new Laya.Vector3(Number.MAX_VALUE, Number.MAX_VALUE, Number.MAX_VALUE);
	        let max = new Laya.Vector3(-Number.MAX_VALUE, -Number.MAX_VALUE, -Number.MAX_VALUE);
	        positions.forEach((pos, index) => {
	            let boneIndex = oriBoneIndeices[index];
	            let boneWeight = boneWeights[index];
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
	    static fixSkinnedSprite(glTFNode, skinned) {
	        let skin = glTFUtils._glTF.skins[glTFNode.skin];
	        let skinnedMeshRenderer = skinned.skinnedMeshRenderer;
	        skin.joints.forEach(nodeIndex => {
	            let bone = glTFUtils._glTFNodes[nodeIndex];
	            skinnedMeshRenderer.bones.push(bone);
	        });
	        if (skin.skeleton == undefined) {
	            skin.skeleton = skin.joints[0];
	        }
	        skinnedMeshRenderer.rootBone = glTFUtils._glTFNodes[skin.skeleton];
	        glTFUtils.calSkinnedSpriteLocalBounds(skinned);
	    }
	    static getAnimationRoot(channels) {
	        const isContainNode = (nodeArr, findNodeIndex) => {
	            if (!nodeArr)
	                return false;
	            if (nodeArr.indexOf(findNodeIndex) == -1) {
	                for (let index = 0; index < nodeArr.length; index++) {
	                    let glTFNode = glTFUtils._glTF.nodes[nodeArr[index]];
	                    if (isContainNode(glTFNode.children, findNodeIndex)) {
	                        return true;
	                    }
	                }
	            }
	            return true;
	        };
	        let target = channels[0].target;
	        let spriteIndex = target.node;
	        for (let index = 0; index < glTFUtils._glTF.scenes.length; index++) {
	            let glTFScene = glTFUtils._glTF.scenes[index];
	            if (isContainNode(glTFScene.nodes, spriteIndex)) {
	                return glTFUtils._glTFScenes[index];
	            }
	        }
	        return null;
	    }
	    static getAnimationPath(root, curSprite) {
	        let paths = [];
	        if (root == curSprite)
	            return paths;
	        let sprite = curSprite;
	        while (sprite.parent != root) {
	            sprite = sprite.parent;
	            paths.push(sprite.name);
	        }
	        paths = paths.reverse();
	        paths.push(curSprite.name);
	        return paths;
	    }
	    static _loadAnimations(animations) {
	        if (!animations)
	            return;
	        animations.forEach((animation, index) => {
	            glTFUtils._loadAnimation(animation);
	        });
	    }
	    static _loadAnimation(animation) {
	        return glTFUtils._createAnimator(animation);
	    }
	    static _createAnimator(animation) {
	        let animator = new Laya.Animator();
	        let channels = animation.channels;
	        let samplers = animation.samplers;
	        let animatorRoot = glTFUtils.getAnimationRoot(channels);
	        if (!animatorRoot) {
	            return animator;
	        }
	        animatorRoot.addComponentIntance(animator);
	        let duration = 0;
	        let clipNodes = new Array(channels.length);
	        channels.forEach((channel, index) => {
	            let target = channel.target;
	            let sampler = samplers[channel.sampler];
	            let clipNode = clipNodes[index] = new ClipNode();
	            let sprite = glTFUtils._glTFNodes[target.node];
	            let timeBuffer = glTFUtils.getBufferwithAccessorIndex(sampler.input);
	            let outBuffer = glTFUtils.getBufferwithAccessorIndex(sampler.output);
	            clipNode.timeArray = new Float32Array(timeBuffer);
	            clipNode.valueArray = new Float32Array(outBuffer);
	            clipNode.paths = glTFUtils.getAnimationPath(animatorRoot, sprite);
	            clipNode.propertyOwner = "transform";
	            clipNode.propertyLength = 1;
	            clipNode.propertise = [];
	            let targetPath = target.path;
	            switch (targetPath) {
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
	                default:
	                    break;
	            }
	            clipNode.duration = clipNode.timeArray[clipNode.timeArray.length - 1];
	            duration = Math.max(duration, clipNode.duration);
	        });
	        let layerName = animation.name ? animation.name : "Aniamtor";
	        let animatorLayer = new Laya.AnimatorControllerLayer(layerName);
	        let clip = new Laya.AnimationClip();
	        clip.name = "clip name";
	        clip._duration = duration;
	        clip.islooping = true;
	        clip._frameRate = 30;
	        let nodeCount = clipNodes.length;
	        let nodes = clip._nodes;
	        nodes.count = nodeCount;
	        let nodesMap = clip._nodesMap = {};
	        let nodesDic = clip._nodesDic = {};
	        for (let i = 0; i < nodeCount; i++) {
	            let node = new Laya.KeyframeNode();
	            let gLTFClipNode = clipNodes[i];
	            nodes.setNodeByIndex(i, node);
	            node._indexInList = i;
	            let type = node.type = gLTFClipNode.type;
	            let pathLength = gLTFClipNode.paths.length;
	            node._setOwnerPathCount(pathLength);
	            let tempPath = gLTFClipNode.paths;
	            for (let j = 0; j < pathLength; j++) {
	                node._setOwnerPathByIndex(j, tempPath[j]);
	            }
	            let nodePath = node._joinOwnerPath("/");
	            let mapArray = nodesMap[nodePath];
	            (mapArray) || (nodesMap[nodePath] = mapArray = []);
	            mapArray.push(node);
	            node.propertyOwner = gLTFClipNode.propertyOwner;
	            let propertyLength = gLTFClipNode.propertyLength;
	            node._setPropertyCount(propertyLength);
	            for (let j = 0; j < propertyLength; j++) {
	                node._setPropertyByIndex(j, gLTFClipNode.propertise[j]);
	            }
	            let fullPath = nodePath + "." + node.propertyOwner + "." + node._joinProperty(".");
	            nodesDic[fullPath] = fullPath;
	            node.fullPath = fullPath;
	            let keyframeCount = gLTFClipNode.timeArray.length;
	            for (let j = 0; j < keyframeCount; j++) {
	                switch (type) {
	                    case 0:
	                        break;
	                    case 1:
	                    case 3:
	                    case 4:
	                        let floatArrayKeyframe = new Laya.Vector3Keyframe();
	                        node._setKeyframeByIndex(j, floatArrayKeyframe);
	                        let startTimev3 = floatArrayKeyframe.time = gLTFClipNode.timeArray[j];
	                        let inTangent = floatArrayKeyframe.inTangent;
	                        let outTangent = floatArrayKeyframe.outTangent;
	                        let value = floatArrayKeyframe.value;
	                        inTangent.setValue(0, 0, 0);
	                        outTangent.setValue(0, 0, 0);
	                        value.setValue(gLTFClipNode.valueArray[3 * j], gLTFClipNode.valueArray[3 * j + 1], gLTFClipNode.valueArray[3 * j + 2]);
	                        break;
	                    case 2:
	                        let quaternionKeyframe = new Laya.QuaternionKeyframe();
	                        node._setKeyframeByIndex(j, quaternionKeyframe);
	                        let startTimeQu = quaternionKeyframe.time = gLTFClipNode.timeArray[j];
	                        let inTangentQua = quaternionKeyframe.inTangent;
	                        let outTangentQua = quaternionKeyframe.outTangent;
	                        let valueQua = quaternionKeyframe.value;
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
	        let animatorState = new Laya.AnimatorState();
	        animatorState.name = "state name";
	        animatorState.clip = clip;
	        animatorLayer.addState(animatorState);
	        animatorLayer.defaultState = animatorState;
	        animatorLayer.playOnWake = true;
	        animator.addControllerLayer(animatorLayer);
	        animatorLayer.defaultWeight = 1.0;
	        return animator;
	    }
	}
	glTFUtils.NAMEID = 0;
	glTFUtils.maxSubBoneCount = 24;
	glTFUtils.Extensions = {};
	glTFUtils.Extras = {};
	glTFUtils._glTFBuffers = [];
	glTFUtils._glTFTextures = [];
	glTFUtils._glTFMaterials = [];
	glTFUtils._glTFNodes = [];
	glTFUtils._glTFScenes = [];

	class glTFLoader {
	    static init() {
	        let createMap = Laya.LoaderManager.createMap;
	        createMap["gltf"] = [glTFLoader.GLTF, glTFUtils._parse];
	        let parseMap = Laya.Loader.parserMap;
	        parseMap[glTFLoader.GLTF] = glTFLoader._loadglTF;
	        parseMap[glTFLoader.GLTFBASE64TEX] = glTFLoader._loadBase64Texture;
	        glTFLoader._innerBufferLoaderManager.on(Laya.Event.ERROR, null, glTFLoader._eventLoadManagerError);
	        glTFLoader._innerTextureLoaderManager.on(Laya.Event.ERROR, null, glTFLoader._eventLoadManagerError);
	    }
	    static _loadglTF(loader) {
	        loader._originType = loader.type;
	        loader.on(Laya.Event.LOADED, null, glTFLoader._onglTFLoaded, [loader]);
	        loader.load(loader.url, Laya.Loader.JSON, false, null, true);
	    }
	    static _loadBase64Texture(loader) {
	        let url = loader.url;
	        let type = "nativeimage";
	        loader.on(Laya.Event.LOADED, null, function (image) {
	            loader._cache = loader._createCache;
	            let tex = Laya.Texture2D._parse(image, loader._propertyParams, loader._constructParams);
	            glTFLoader._endLoad(loader, tex);
	        });
	        loader.load(url, type, false, null, true);
	    }
	    static formatRelativePath(base, value) {
	        let path;
	        path = base + value;
	        let char1 = value.charAt(0);
	        if (char1 === ".") {
	            let parts = path.split("/");
	            for (let i = 0, len = parts.length; i < len; i++) {
	                if (parts[i] == '..') {
	                    let index = i - 1;
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
	    static _addglTFInnerUrls(urls, urlMap, urlVersion, glTFBasePath, path, type, constructParams = null, propertyParams = null) {
	        let formatUrl = glTFLoader.formatRelativePath(glTFBasePath, path);
	        (urlVersion) && (formatUrl = formatUrl + urlVersion);
	        urls.push({ url: formatUrl, type: type, constructParams: constructParams, propertyParams: propertyParams });
	        (urlMap) && (urlMap.push(formatUrl));
	        return formatUrl;
	    }
	    static _getglTFInnerUrls(glTFData, bufferUrls, textureUrls, subUrls, urlVersion, glTFBasePath) {
	        if (glTFData.buffers) {
	            glTFData.buffers.forEach(buffer => {
	                if (Laya.glTFBase64Tool.isBase64String(buffer.uri)) {
	                    let bin = Laya.glTFBase64Tool.decode(buffer.uri.replace(Laya.glTFBase64Tool.reghead, ""));
	                    Laya.Loader.cacheRes(buffer.uri, bin);
	                }
	                else {
	                    buffer.uri = glTFLoader._addglTFInnerUrls(bufferUrls, null, urlVersion, glTFBasePath, buffer.uri, Laya.Loader.BUFFER);
	                }
	            });
	        }
	        if (glTFData.textures) {
	            glTFData.textures.forEach(glTFTexture => {
	                let glTFImage = glTFData.images[glTFTexture.source];
	                let glTFSampler = glTFData.samplers ? glTFData.samplers[glTFTexture.sampler] : undefined;
	                let constructParams = glTFUtils.getTextureConstructParams(glTFImage, glTFSampler);
	                let propertyParams = glTFUtils.getTexturePropertyParams(glTFSampler);
	                if (glTFImage.bufferView) ;
	                else if (Laya.glTFBase64Tool.isBase64String(glTFImage.uri)) {
	                    glTFImage.uri = glTFLoader._addglTFInnerUrls(textureUrls, subUrls, urlVersion, "", glTFImage.uri, glTFLoader.GLTFBASE64TEX, constructParams, propertyParams);
	                }
	                else {
	                    glTFImage.uri = glTFLoader._addglTFInnerUrls(textureUrls, subUrls, urlVersion, glTFBasePath, glTFImage.uri, Laya.Loader.TEXTURE2D, constructParams, propertyParams);
	                }
	            });
	        }
	    }
	    static _onglTFLoaded(loader, glTFData) {
	        let url = loader.url;
	        let urlVersion = Laya.Utils3D.getURLVerion(url);
	        let glTFBasePath = Laya.URL.getPath(url);
	        let bufferUrls = [];
	        let textureUrls = [];
	        let subUrls = [];
	        glTFLoader._getglTFInnerUrls(glTFData, bufferUrls, textureUrls, subUrls, urlVersion, glTFBasePath);
	        let urlCount = bufferUrls.length + textureUrls.length;
	        let totalProcessCount = urlCount + 1;
	        let weight = 1 / totalProcessCount;
	        glTFLoader._onProcessChange(loader, 0, weight, 1.0);
	        let processCeil = urlCount / totalProcessCount;
	        if (bufferUrls.length > 0) {
	            let processHandler = Laya.Handler.create(null, glTFLoader._onProcessChange, [loader, weight, processCeil], false);
	            glTFLoader._innerBufferLoaderManager._create(bufferUrls, false, Laya.Handler.create(null, glTFLoader._onglTFBufferResourceLoaded, [loader, processHandler, glTFData, subUrls, textureUrls, weight + processCeil * bufferUrls.length, processCeil]), processHandler, null, null, null, 1, true);
	        }
	        else {
	            glTFLoader._onglTFBufferResourceLoaded(loader, null, glTFData, subUrls, textureUrls, weight, processCeil);
	        }
	    }
	    static _onglTFBufferResourceLoaded(loader, processHandler, glTFData, subUrls, textureUrls, processOffset, processCeil) {
	        (processHandler) && (processHandler.recover());
	        if (textureUrls.length > 0) {
	            let process = Laya.Handler.create(null, glTFLoader._onProcessChange, [loader, processOffset, processCeil], false);
	            glTFLoader._innerTextureLoaderManager._create(textureUrls, false, Laya.Handler.create(null, glTFLoader._onglTFTextureResourceLoaded, [loader, process, glTFData, subUrls]), processHandler, null, null, null, 1, true);
	        }
	        else {
	            glTFLoader._onglTFTextureResourceLoaded(loader, processHandler, glTFData, subUrls);
	        }
	    }
	    static _onglTFTextureResourceLoaded(loader, processHandler, glTFData, subUrls) {
	        (processHandler) && (processHandler.recover());
	        loader._cache = loader._createCache;
	        let item = glTFUtils._parse(glTFData, loader._propertyParams, loader._constructParams);
	        glTFLoader._endLoad(loader, item, subUrls);
	    }
	    static _eventLoadManagerError(msg) {
	        Laya.Laya.loader.event(Laya.Event.ERROR, msg);
	    }
	    static _onProcessChange(loader, offset, weight, process) {
	        process = offset + process * weight;
	        (process < 1.0) && (loader.event(Laya.Event.PROGRESS, process * 2 / 3 + 1 / 3));
	    }
	    static _endLoad(loader, content = null, subResource = null) {
	        if (subResource) {
	            for (let i = 0; i < subResource.length; i++) {
	                let resource = Laya.Loader.getRes(subResource[i]);
	                (resource) && (resource._removeReference());
	            }
	        }
	        loader.endLoad(content);
	    }
	}
	glTFLoader.GLTF = "GLTF";
	glTFLoader.GLTFBASE64TEX = "GLTFBASE64TEX";
	glTFLoader._innerBufferLoaderManager = new Laya.LoaderManager();
	glTFLoader._innerTextureLoaderManager = new Laya.LoaderManager();

	exports.glTFBase64Tool = glTFBase64Tool;
	exports.glTFLoader = glTFLoader;
	exports.glTFUtils = glTFUtils;

}(window.Laya = window.Laya || {}, Laya));
