import { Node } from "../../display/Node";
import { Handler } from "../../utils/Handler";
import { Shader3D } from "../../RenderEngine/RenderShader/Shader3D";
import { Stat } from "../../utils/Stat";
import { Prefab } from "../../resource/HierarchyResource";
import { ILaya } from "../../../ILaya";
import { NodeFlags } from "../../Const";
import { Matrix4x4 } from "../../maths/Matrix4x4";
import { Quaternion } from "../../maths/Quaternion";
import { Vector3 } from "../../maths/Vector3";
import { Scene3D } from "./scene/Scene3D";
import { LayaGL } from "../../layagl/LayaGL";
import { Laya3DRender } from "../RenderObjs/Laya3DRender";
import { ShaderDataType } from "../../RenderDriver/DriverDesign/RenderDevice/ShaderData";
import { Transform3D } from "./Transform3D";
import { CommandUniformMap } from "../../RenderDriver/DriverDesign/RenderDevice/CommandUniformMap";
import { Event } from "../../events/Event";
/**
 * @internal
 */
export enum StaticFlag {
    Normal = 1 << 0,
    StaticBatch = 1 << 1,
}

/**
 * @en The `Sprite3D` class is used to implement 3D sprites.
 * @zh `Sprite3D` 类用于实现3D精灵。
 */
export class Sprite3D extends Node {
    /**
     * @internal
     * @en Shader variable name for world matrix.
     * @zh 着色器变量名，世界矩阵。
     */
    static WORLDMATRIX: number;
    /**
     * @en Indicates the front face direction. -1 for inverted back face, 1 for normal situation.
     * @zh -1 表示翻转了背面，1 表示正常情况。
     */
    static WORLDINVERTFRONT: number;
    /**@internal */
    static sprite3DCommandUniformMap: CommandUniformMap;
    /**@internal */
    protected static _uniqueIDCounter: number = 0;

    /**
     * @internal
     */
    static __init__(): void {
        Sprite3D.WORLDMATRIX = Shader3D.propertyNameToID("u_WorldMat");
        Sprite3D.WORLDINVERTFRONT = Shader3D.propertyNameToID("u_WroldInvertFront");
        Sprite3D.sprite3DCommandUniformMap = LayaGL.renderDeviceFactory.createGlobalUniformMap("Sprite3D");
        Sprite3D.sprite3DCommandUniformMap.addShaderUniform(Sprite3D.WORLDMATRIX, "u_WorldMat", ShaderDataType.Matrix4x4);
        Sprite3D.sprite3DCommandUniformMap.addShaderUniform(Sprite3D.WORLDINVERTFRONT, "u_WroldInvertFront", ShaderDataType.Vector4);
    }

    /**
     * @en Create a clone instance of the sprite.
     * @param original The original sprite.
     * @param parent The parent node. Default is null.
     * @param worldPositionStays Whether to maintain its own world transformation. Default is true.
     * @param position World position, effective when worldPositionStays is false. Default is null.
     * @param rotation World rotation, effective when worldPositionStays is false. Default is null.
     * @returns The cloned instance.
     * @zh 创建精灵的克隆实例。
     * @param original 原始精灵。
     * @param parent 父节点。默认为 null。
     * @param worldPositionStays 是否保持自身世界变换。默认为 true。
     * @param position 世界位置，worldPositionStays 为 false 时生效。默认为 null。
     * @param rotation 世界旋转，worldPositionStays 为 false 时生效。默认为 null。
     * @returns 克隆实例。
     */
    static instantiate(original: Sprite3D, parent: Node = null, worldPositionStays: boolean = true, position: Vector3 = null, rotation: Quaternion = null): Sprite3D {
        var destSprite3D: Sprite3D = (<Sprite3D>original.clone());
        (parent) && (parent.addChild(destSprite3D));
        var transform: Transform3D = destSprite3D.transform;
        if (worldPositionStays) {
            var worldMatrix: Matrix4x4 = transform.worldMatrix;
            original.transform.worldMatrix.cloneTo(worldMatrix);
            transform.worldMatrix = worldMatrix;
        } else {
            (position) && (transform.position = position);
            (rotation) && (transform.rotation = rotation);
        }
        return destSprite3D;
    }

    /**
     * @en Load mesh template.
     * @param url The template URL.
     * @param complete The completion callback.
     * @zh 加载网格模板。
     * @param url 模板地址。
     * @param complete 完成回调。
     */
    static load(url: string, complete: Handler): void {
        ILaya.loader.load(url).then((res: Prefab) => {
            complete && complete.runWith([res?.create()]);
        });
    }

    /** @internal */
    private _id: number;

    /** @internal */
    _isStatic: number;
    /** @internal */
    _layer: number;
    /**@internal */
    _transform: Transform3D;
    /**@internal 0表示不是渲染节点*/
    _isRenderNode: number = 0;

    /**
     * @en Unique identifier ID.
     * @zh 唯一标识ID。
     */
    get id(): number {
        return this._id;
    }

    /**
     * @en Mask layer.
     * @zh 蒙版层。
     */
    get layer(): number {
        return this._layer;
    }

    set layer(value: number) {
        if (this._layer !== value) {
            if (value >= 0 && value <= 30) {
                this._layer = value;
                this.event(Event.LAYERCHANGE, value);
            } else {
                throw new Error("Layer value must be 0-30.");
            }
        }
    }

    /**
     * @en Whether the sprite is static.
     * @zh 是否为静态。
     */
    get isStatic(): boolean {
        return !!(this._isStatic >> 1 | 0x0);
    }

    /**@internal IDE only*/
    set isStatic(value: boolean) {
        this._isStatic = value ? StaticFlag.StaticBatch : StaticFlag.Normal;
        this.event(Event.staticMask, this._isStatic);
    }

    /**
     * @en Sprite transformation.
     * @zh 精灵变换。
     */
    get transform(): Transform3D {
        return this._transform;
    }

    /**
     * @en Get the scene to which the sprite belongs.
     * @zh 获取精灵所属的场景。
     */
    get scene(): Scene3D {
        return <Scene3D>this._scene;
    }

    /**
     * @en Creates an instance of the Sprite3D class.
     * @param name Sprite name.
     * @param isStatic Whether it is static.
     * @zh 创建 Sprite3D 类的实例。
     * @param name 精灵名称。
     * @param isStatic 是否为静态。
     */
    constructor(name: string = null, isStatic: boolean = false) {
        super();
        this._id = ++Sprite3D._uniqueIDCounter;
        this._is3D = true;
        this._transform = Laya3DRender.Render3DModuleDataFactory.createTransform(this);
        this._isStatic = isStatic ? StaticFlag.StaticBatch : StaticFlag.Normal;
        this.layer = 0;
        this.name = name ? name : "New Sprite3D";
    }

    /**
    * @internal
    * @protected
    */
    protected _onActive(): void {
        super._onActive();
        Stat.sprite3DCount++;
    }

    /**
     * @internal
     * @protected
     */
    protected _onInActive(): void {
        super._onInActive();
        Stat.sprite3DCount--;
    }


    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onAdded(): void {
        if (this._parent instanceof Sprite3D) {
            var parent3D: Sprite3D = (<Sprite3D>this._parent);
            this.transform._setParent(parent3D.transform);
        }
        else
            this.transform._onWorldTransform();
        super._onAdded();
    }

    /**
     * @internal
     * @inheritDoc
     * @override
     */
    protected _onRemoved(): void {
        super._onRemoved();
        if (this._parent instanceof Sprite3D)
            this.transform._setParent(null);
    }

    /**
     * @internal
     * @protected
     * @param type 
     */
    protected onStartListeningToType(type: string) {
        super.onStartListeningToType(type);
        if (type.startsWith("collision"))
            this._setBit(NodeFlags.PROCESS_COLLISIONS, true);
        else if (type.startsWith("trigger"))
            this._setBit(NodeFlags.PROCESS_TRIGGERS, true);
    }

    /**
     * @override
     * @internal
     * 克隆。
     * @param	destObject 克隆源。
     */
    _cloneTo(destObject: Sprite3D, srcRoot: Node, dstRoot: Node): void {
        if (this._destroyed)
            throw new Error("Sprite3D: Can't be cloned if the Sprite3D has destroyed.");

        var trans: Transform3D = this._transform;
        var destTrans: Transform3D = destObject._transform;

        destObject.name = this.name/* + "(clone)"*/;//TODO:克隆后不能播放刚体动画，找不到名字
        destObject.tag = this.tag;
        destObject._destroyed = this._destroyed;
        destObject.active = this.active;
        destTrans.localPosition = trans.localPosition;
        destTrans.localRotation = trans.localRotation;
        destTrans.localScale = trans.localScale;

        destObject._isStatic = this._isStatic;
        destObject.layer = this.layer;
        super._cloneTo(destObject, srcRoot, dstRoot);
    }

    /**
     * @internal
     */
    private static _createSprite3DInstance(scrSprite: Sprite3D): Node {
        var node: Node = scrSprite._create();
        var children: any[] = scrSprite._children;
        for (var i: number = 0, n: number = children.length; i < n; i++) {
            var child: any = Sprite3D._createSprite3DInstance(children[i])
            node.addChild(child);
        }
        return node;
    }

    /**
     * @internal
     */
    private static _parseSprite3DInstance(srcRoot: Node, dstRoot: Node, scrSprite: Node, dstSprite: Node): void {
        var srcChildren: any[] = scrSprite._children;
        var dstChildren: any[] = dstSprite._children;
        for (var i: number = 0, n: number = srcChildren.length; i < n; i++)
            Sprite3D._parseSprite3DInstance(srcRoot, dstRoot, srcChildren[i], dstChildren[i])
        scrSprite._cloneTo(dstSprite, srcRoot, dstRoot);
    }

    /**
     * @en clone.
     * @returns clone instance.
     * @zh 克隆。
     * @returns	克隆副本。
     */
    clone(): Node {
        var dstSprite3D: Node = Sprite3D._createSprite3DInstance(this);
        Sprite3D._parseSprite3DInstance(this, dstSprite3D, this, dstSprite3D);
        return dstSprite3D;
    }

    /**
     * @inheritDoc
     * @override
     * @en destroy
     * @param dextroychild whether to destroy the child node.
     * @zh 销毁
     * @param destroyChild 是否销毁子节点
     */
    destroy(destroyChild: boolean = true): void {
        if (this._destroyed)
            return;

        super.destroy(destroyChild);
        this._transform = null;
    }

    /**
     * @internal
     */
    protected _create(): Node {
        return new Sprite3D();
    }
}

