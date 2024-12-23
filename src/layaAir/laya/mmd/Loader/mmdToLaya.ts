import { AnimationClip } from "../../d3/animation/AnimationClip";
import { KeyframeNode } from "../../d3/animation/KeyframeNode";
import { KeyframeNodeList } from "../../d3/animation/KeyframeNodeList";
import { KeyFrameValueType } from "../../d3/component/Animator/KeyframeNodeOwner";
import { MeshSprite3D } from "../../d3/core/MeshSprite3D";
import { Sprite3D } from "../../d3/core/Sprite3D";
import { IndexBuffer3D } from "../../d3/graphics/IndexBuffer3D";
import { VertexBuffer3D } from "../../d3/graphics/VertexBuffer3D";
import { Bounds } from "../../d3/math/Bounds";
import { Mesh } from "../../d3/resource/models/Mesh";
import { SubMesh } from "../../d3/resource/models/SubMesh";
import { rotationTo } from "../../IK/IK_Utils";
import { Keyframe } from "../../maths/Keyframe";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Vector3Keyframe } from "../../maths/Vector3Keyframe";
import { BufferUsage } from "../../RenderEngine/RenderEnum/BufferTargetType";
import { IndexFormat } from "../../RenderEngine/RenderEnum/IndexFormat";
import { VertexMesh } from "../../RenderEngine/RenderShader/VertexMesh";
import { MmdAnimation } from "./Animation/mmdAnimation";
import { PmxObject } from "./Parser/pmxObject";

var Z = new Vector3(0,0,1);

export function mmdToMesh(info: PmxObject): Mesh {
    var mesh: Mesh = new Mesh();
    let subMeshes = mesh._subMeshes;
    //创建mesh
    //vertex buffer
    {
        let vertices = info.vertices;
        let vertexCount = vertices.length;
        const vertexSize = 12 + 12 + 8 + //pos+norm+uv
            + 16 + 16; //  boneIndices(4) + boneWeights(4)
        const vertexData = new ArrayBuffer(vertexCount * vertexSize);
        const floatArray = new Float32Array(vertexData);
        const floatStride = vertexSize/4;
        let minx = 10000, miny = 10000, minz = 10000;
        let maxx = -10000, maxy = -10000, maxz = -10000;

        let curFloat = 0;
        for (let i = 0; i < vertexCount; i++,curFloat+=floatStride) {
            // 读取位置
            let curVert = vertices[i];
            let x = curVert.position[0];
            let y = curVert.position[1];
            let z = curVert.position[2];
            if (x < minx) minx = x; if (x > maxx) maxx = x;
            if (y < miny) miny = y; if (y > maxy) maxy = y;
            if (z < minz) minz = z; if (z > maxz) maxz = z;

            //pos
            floatArray[curFloat] = x;
            floatArray[curFloat+1] = y;
            floatArray[curFloat+2] = z;

            // 读取法线
            floatArray[curFloat+3] = curVert.normal[0];
            floatArray[curFloat+4] = curVert.normal[1];
            floatArray[curFloat+5] = curVert.normal[2];

            // 读取UV
            floatArray[curFloat+6] = curVert.uv[0];
            floatArray[curFloat+7] = 1 - curVert.uv[1]; // 修改：PMX的UV坐标系与常见3D坐标系不同，需要翻转Y轴

            // 读取骨骼权重类型
            const weightType = curVert.weightType;
            // 修改：重写骨骼权重读取逻辑
            let boneInfoPos = curFloat+8;
            switch (weightType) {
                case 0: // BDEF1
                    let boneweight0 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    //boneIndicesArray[i * 4] = boneweight0.boneIndices;//TODO 根据 this._modelInfo.boneIndexSize
                    //boneWeightsArray[i * 4] = 1.0;
                    floatArray[boneInfoPos] = boneweight0.boneIndices;
                    floatArray[boneInfoPos+1] = boneweight0.boneIndices;
                    floatArray[boneInfoPos+2] = boneweight0.boneIndices;
                    floatArray[boneInfoPos+3] = boneweight0.boneIndices;
                    floatArray[boneInfoPos+4] = 1.0;
                    floatArray[boneInfoPos+5] = 0.0;
                    floatArray[boneInfoPos+6] = 0.0;
                    floatArray[boneInfoPos+7] = 0.0;
                    break;
                case 1: // BDEF2
                    let boneweight1 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    floatArray[boneInfoPos] = boneweight1.boneIndices[0];
                    floatArray[boneInfoPos+1] = boneweight1.boneIndices[1];
                    floatArray[boneInfoPos+2] = 0;
                    floatArray[boneInfoPos+3] = 0;
                    floatArray[boneInfoPos+4] = boneweight1.boneWeights;;
                    floatArray[boneInfoPos+5] = 1-boneweight1.boneWeights;;
                    floatArray[boneInfoPos+6] = 0.0;
                    floatArray[boneInfoPos+7] = 0.0;                    
                    break;
                case 2: // BDEF4
                    let boneweight2 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    for (let j = 0; j < 4; j++) {
                        floatArray[boneInfoPos + j] = boneweight2.boneIndices[j];
                    }
                    //这种情况下权重和不保证=1
                    for (let j = 0; j < 4; j++) {
                        floatArray[boneInfoPos + 4 + j] = boneweight2.boneWeights[j];
                    }
                    break;
                case 3: // SDEF
                    let boneweight3 = curVert.boneWeight as PmxObject.Vertex.BoneWeight<typeof weightType>;
                    console.log("SDEF weight type not fully supported");
                    // 简化处理SDEF，仅读取必要数据
                    // for (let j = 0; j < 2; j++) {
                    //     boneIndicesArray[i * 4 + j] = boneweight3.boneIndices[j];
                    // }
                    // boneWeightsArray[i * 4] = boneweight3.boneWeights.boneWeight0;
                    // boneWeightsArray[i * 4 + 1] = 1 - boneWeightsArray[i * 4];
                    // boneweight3.boneWeights.c;
                    // boneweight3.boneWeights.r0;
                    // boneweight3.boneWeights.r1;
                    break;
                case 4://QDEF
                    throw '2'
                    break;
                default:
                    throw '3'
                    console.error("Unknown weight type:", weightType);
                    break;
            }

            // 读取边缘放大率
            const edgeScale = curVert.edgeScale;
        }

        const vertexDeclaration = VertexMesh.getVertexDeclaration("POSITION,NORMAL,UV,BLENDWEIGHT,BLENDINDICES");
        const vertexBuffer = new VertexBuffer3D(vertexData.byteLength, BufferUsage.Static, true);
        vertexBuffer.vertexDeclaration = vertexDeclaration;
        vertexBuffer.setData(vertexData);

        mesh._vertexBuffer = vertexBuffer;
        mesh._vertexCount = vertexCount;
        mesh.bounds = new Bounds(new Vector3(minx, miny, minz), new Vector3(maxx, maxy, maxz));
    }
    //index buffer
    const indexCount = info.indices.length;
    const indexData = new Uint16Array(indexCount);
    const indices = info.indices;
    for (let i = 0; i < indexCount; i+=3) {
        indexData[i] = indices[i];
        indexData[i+1] = indices[i+2];
        indexData[i+2] = indices[i+1];
    }

    const indexBuffer = new IndexBuffer3D(IndexFormat.UInt16, indexCount, BufferUsage.Static, true);
    indexBuffer.setData(indexData);

    mesh._indexBuffer = indexBuffer;
    mesh._indexFormat = IndexFormat.UInt16;
    mesh._setBuffer(mesh._vertexBuffer, indexBuffer);

    //创建submesh
    const subMesh = new SubMesh(mesh);
    subMesh._indexBuffer = mesh._indexBuffer;
    subMesh._vertexBuffer = mesh._vertexBuffer;
    subMesh._setIndexRange(0, indexCount);
    //subMesh.material = material;
    subMeshes.push(subMesh);

    mesh._setSubMeshes(subMeshes);

    return mesh;

    //material
    mesh.calculateBounds();
    return mesh;
}

class MyVector3Keyframe extends Vector3Keyframe{
    constructor(tm:number, value:Vector3, inTangent?:Vector3, outTangent?:Vector3){
        super();
        this.time = tm;
        value.cloneTo(this.value);
        if(inTangent) inTangent.cloneTo(this.inTangent);
        if(outTangent) outTangent.cloneTo(this.outTangent);
    }
}

class MyKeyFrameNode extends KeyframeNode{
    constructor(type:KeyFrameValueType){
        super();
        this.type = type;
    }

    setProp(owner:string[]|null,prop:string[]){
        if(owner){
            this._setOwnerPathCount(owner.length);
            for(let i=0,n=owner.length;i<n; i++){
                this._setOwnerPathByIndex(i,owner[i]);
            }
        }else{
            this._setOwnerPathCount(0);
        }
        this.propertyOwner = prop[0];
        let propLen = prop.length-1;
        if(propLen>0){
            this._setPropertyCount(propLen);
            for(let i=0;i<propLen; i++){
                this._setPropertyByIndex(i,prop[i+1]);
            }
        }
        let nodePath = this._joinOwnerPath('/');
        var fullPath = nodePath + "." + this.propertyOwner + "." + this._joinProperty(".");
        this.fullPath = fullPath;
        this.nodePath = nodePath;
    }

    setKeyframes(keys:Keyframe[]){
        this._setKeyframeCount(keys.length);
        for(let i=0,n=keys.length;i<n; i++){
            this._setKeyframeByIndex(i,keys[i]);
        }
    }
}

class MyKeyframeNodeList extends KeyframeNodeList{
    setNodes(nodes:MyKeyFrameNode[]){
        let cnt = nodes.length;
        this.count = cnt;
        for(let i=0;i<cnt; i++){
            this.setNodeByIndex(i,nodes[i]);
            nodes[i]._indexInList = i;
        }
    }
}

export function vmdToLayaClip1(vmddata:MmdAnimation){
    let boneTracks = vmddata.boneTracks;
    let b0 = boneTracks[0];
    b0.frameNumbers;    //时间
    b0.rotations;   //帧数*4   Q:x,y,z,w
    b0.rotationInterpolations;//x1,x2,y1,y2

    //动画示例
    let clip = new AnimationClip();
    clip.name='test';
    clip._frameRate=30;
    clip._duration = 10;
    var nodes = clip._nodes = new MyKeyframeNodeList();

    let node = new MyKeyFrameNode(KeyFrameValueType.Vector3);
    node.setProp(null,['transform','localPosition']);

    let keys = [
        new MyVector3Keyframe(0,new Vector3()),
        new MyVector3Keyframe(5,new Vector3(10,0,0)),
        new MyVector3Keyframe(10,new Vector3()),
    ]
    node.setKeyframes(keys);

    nodes.setNodes([node]);
    
    return clip;
}

export class MMDSkeleton {
    root:Sprite3D;
    sprites:Sprite3D[]=[];
}

export class MMDSprite extends Sprite3D{
    renderSprite:MeshSprite3D;
    skeleton:MMDSkeleton;
    parsePmxObj(data:PmxObject){
        let mesh =  mmdToMesh(data);
        let meshSprite = new MeshSprite3D(mesh);
        this.renderSprite = meshSprite;
        this.addChild(meshSprite);
        let bones = mmdToSkeleton(data);
        this.skeleton = bones;
        this.addChild(bones.root);
    }
}


export function mmdToSkeleton(data:PmxObject){
    let bones = data.bones;
    let boneCnt = bones.length;

    let ske = new MMDSkeleton();
    let sps = ske.sprites;
    //记录一个全局的位置信息。由于sprite3D的会受到父子关系的影响，所以单独记录
    let spTrans:{pos:Vector3,rot:Quaternion}[] = new Array(boneCnt);
    let myPos = new Vector3();
    let tailPos = new Vector3();
    let dPos = new Vector3();
    let dQuat = new Quaternion();
    for(let i=0;i<boneCnt; i++){
        let hasTailPos=true;
        let bone = bones[i];
        let spTran = spTrans[i] = {pos:new Vector3, rot:new Quaternion};
        //根据tailPosition计算全局朝向
        myPos.fromArray(bone.position);
        switch(typeof bone.tailPosition){
            case 'number':{
                let tailid = bone.tailPosition;
                if(tailid>=0){
                    tailPos.fromArray(bones[tailid].position);
                }else{
                    //-1的话，一般是末端骨骼
                    hasTailPos = false;
                }
            }
            break;
            default:
                if((bone.tailPosition as number[]).length==3){
                    tailPos.fromArray(bone.tailPosition as number[]);
                    //假设[0,0,0]也是无效的
                    if(tailPos.length()==0)
                        hasTailPos=false;
                }
        }

        let sp = new Sprite3D(bone.name);
        sps.push(sp);
        let pos = sp.transform.position;
        myPos.cloneTo(pos);
        sp.transform.position = pos;
        pos.cloneTo(spTran.pos);
        console.log('iii',myPos, pos)

        //计算全局朝向
        if(hasTailPos){
            tailPos.vsub(myPos,dPos);
            let length = dPos.length();
            (sp as any).boneLength = length;
            dPos.normalize();
            rotationTo(Z,dPos,spTran.rot);
        }else{
            (sp as any).boneLength = 0.01;
        }
    }

    //设置实际的父子关系
    for(let i=0;i<boneCnt; i++){
        let bone = bones[i];
        let spParent=null;
        if(bone.parentBoneIndex>0&&bone.parentBoneIndex<boneCnt){
            spParent = sps[bone.parentBoneIndex];
            spParent.addChild(sps[i]);
        }
    }

    //根据父子关系，计算相对位置和朝向，这时候所有的对象的全局位置和朝向都设置了
    let invParentRot = new Quaternion();
    for(let i=0;i<boneCnt; i++){
        let bone = bones[i];
        let cur = sps[i];
        let myPos = spTrans[i].pos;
        let myQuat = spTrans[i].rot;
        if(bone.parentBoneIndex>0&&bone.parentBoneIndex<boneCnt){
            let transParent = spTrans[bone.parentBoneIndex];
            let parPos = transParent.pos;
            let parQuat = transParent.rot;
            myPos.vsub(parPos,dPos);
            parQuat.invert(invParentRot);
            //计算相对位移
            Vector3.transformQuat(dPos,invParentRot,dPos);
            //计算相对旋转
            Quaternion.multiply(invParentRot, myQuat, dQuat);

            let mycurPos = cur.transform.localPosition;
            dPos.cloneTo(mycurPos);
            cur.transform.localPosition = mycurPos;
            
            let mycurRot = cur.transform.localRotation;
            dQuat.cloneTo(mycurRot);
            cur.transform.localRotation=mycurRot;
        }else{
            cur.transform.localRotation=myQuat;
            cur.transform.localPosition = myPos;
        }
    }

    //找到所有的根节点
    let root = new Sprite3D("ske root");
    for(let i=0;i<boneCnt; i++){
        let sp = sps[i];
        if(!sp.parent){
            root.addChild(sp);
        }
    }
    ske.root = root;

    return ske;
}

export function vmdToLayaClip(vmddata:MmdAnimation){
    let boneTracks = vmddata.boneTracks;
    let posTracks = vmddata.movableBoneTracks;

    let b0 = boneTracks[0];
    b0.frameNumbers;    //时间
    b0.rotations;   //帧数*4   Q:x,y,z,w
    b0.rotationInterpolations;//x1,x2,y1,y2

    //动画示例
    let clip = new AnimationClip();
    clip.name='test';
    clip._frameRate=30;
    clip._duration = 10;
    var nodes = clip._nodes = new MyKeyframeNodeList();

    let node = new MyKeyFrameNode(KeyFrameValueType.Vector3);
    node.setProp(null,['transform','localPosition']);

    let keys = [
        new MyVector3Keyframe(0,new Vector3()),
        new MyVector3Keyframe(5,new Vector3(10,0,0)),
        new MyVector3Keyframe(10,new Vector3()),
    ]
    node.setKeyframes(keys);

    nodes.setNodes([node]);
    
    return clip;
}