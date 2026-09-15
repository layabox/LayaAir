import { Laya3D } from "../../../../Laya3D";
import { EPhysicsCapable } from "../../../Physics3D/physicsEnum/EPhycisCapable";
import { ICompoundColliderShape } from "../../../Physics3D/interface/Shape/ICompoundColliderShape";
import { Matrix4x4 } from "../../../maths/Matrix4x4";
import { Quaternion } from "../../../maths/Quaternion";
import { Vector3 } from "../../../maths/Vector3";
import { MeshFilter } from "../../core/MeshFilter";
import { Sprite3D } from "../../core/Sprite3D";
import { Mesh } from "../../resource/models/Mesh";
import { PhysicsColliderComponent } from "../PhysicsColliderComponent";
import { Rigidbody3D } from "../Rigidbody3D";
import { MeshColliderShape } from "./MeshColliderShape";
import { Physics3DColliderShape } from "./Physics3DColliderShape";

interface AutoColliderSource {
    node: Sprite3D;
    mesh: Mesh;
}

interface AutoColliderChild {
    shape: MeshColliderShape;
    position: Vector3;
    rotation: Quaternion;
    scale: Vector3;
}

/**
 * @en Used to create a compound collider.
 * @zh 用于创建组合碰撞器。
 */
export class CompoundColliderShape extends Physics3DColliderShape {
    /** @internal */
    _shape: ICompoundColliderShape;

    /** @internal */
    private _childColliderShapes: Physics3DColliderShape[] = [];

    /** @internal */
    private _autoChildColliderShapes: Set<Physics3DColliderShape> = new Set();

    /** @internal */
    private _autoDetectChildShapes: boolean = false;

    /**
     * @en Whether to create mesh collider shapes from the owner's descendant meshes.
     * @zh 是否根据所属节点的后代网格自动创建网格组合碰撞子形状。
     */
    get autoDetectChildShapes(): boolean {
        return this._autoDetectChildShapes;
    }

    set autoDetectChildShapes(value: boolean) {
        if (this._autoDetectChildShapes === value)
            return;
        this._autoDetectChildShapes = value;
        if (value && this.physicsComponent)
            this.rebuildAutoDetectedChildShapes();
        else if (!value)
            this._clearAutoDetectedChildShapes();
    }

    get physicsComponent(): PhysicsColliderComponent {
        return super.physicsComponent;
    }

    set physicsComponent(value: PhysicsColliderComponent) {
        if (super.physicsComponent === value)
            return;
        super.physicsComponent = value;
        if (value && this._autoDetectChildShapes)
            this.rebuildAutoDetectedChildShapes();
    }

    /** @ignore */
    constructor() {
        super();
    }

    protected _createShape(): void {
        if (Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_CompoundColliderShape))
            this._shape = Laya3D.PhysicsCreateUtil.createCompoundShape();
        else
            console.error("CompoundColliderShape: cannot enable CompoundColliderShape");
    }

    /**
     * @en Sets the explicitly configured child shapes.
     * @zh 设置显式配置的子形状。
     */
    set shapes(value: Physics3DColliderShape[]) {
        this.clearChildShape();
        for (let i = 0, n = value.length; i < n; i++)
            this.addChildShape(value[i]);
        if (this._autoDetectChildShapes && this.physicsComponent)
            this.rebuildAutoDetectedChildShapes();
    }

    get shapes(): Physics3DColliderShape[] {
        return this._childColliderShapes;
    }

    /**
     * @en Adds a child collider shape.
     * @param shape The shape to add.
     * @zh 添加子碰撞器形状。
     * @param shape 要添加的形状。
     */
    addChildShape(shape: Physics3DColliderShape): void {
        if (shape instanceof CompoundColliderShape) {
            console.warn("CompoundColliderShape: cannot add a CompoundColliderShape as a child shape.");
            return;
        }
        this._shape?.setShapeData?.(this.physicsComponent);
        this._shape?.addChildShape(shape.shape);
        this._childColliderShapes.push(shape);
    }

    /**
     * @en Removes a child collider shape.
     * @param shape The shape to remove.
     * @zh 移除子碰撞器形状。
     * @param shape 要移除的形状。
     */
    removeChildShape(shape: Physics3DColliderShape): void {
        const index = this._childColliderShapes.indexOf(shape);
        if (index !== -1)
            this._removeChildShapeAt(index);
    }

    /**
     * @en Clears all child collider shapes.
     * @zh 清空所有子碰撞器形状。
     */
    clearChildShape(): void {
        while (this._childColliderShapes.length > 0)
            this._removeChildShapeAt(0);
    }

    private _removeChildShapeAt(index: number): void {
        const shape = this._childColliderShapes[index];
        this._shape?.removeChildShape(shape.shape, index);
        this._childColliderShapes.splice(index, 1);
        if (this._autoChildColliderShapes.delete(shape))
            shape.destroy();
    }

    /**
     * @en Gets the number of child shapes.
     * @zh 获取子形状数量。
     */
    getChildShapeCount(): number {
        return this._childColliderShapes.length;
    }

    /**
     * @en Rebuilds mesh collider shapes from the owner's current descendant meshes.
     * @returns Whether at least one child shape was generated.
     * @zh 根据所属节点当前的后代网格重新生成网格碰撞子形状。
     * @returns 是否生成了至少一个子形状。
     */
    rebuildAutoDetectedChildShapes(): boolean {
        const root = this.physicsComponent?.owner;
        if (!this._shape || !root) {
            console.warn("CompoundColliderShape: automatic detection requires a valid shape and owner node.");
            return false;
        }
        if (!Laya3D.PhysicsCreateUtil.getPhysicsCapable(EPhysicsCapable.Physics_MeshColliderShape)) {
            console.warn("CompoundColliderShape: MeshColliderShape is not supported by the current physics backend.");
            return false;
        }
        if (!this._shape.addChildShapeWithTransform) {
            console.warn("CompoundColliderShape: automatic detection is not supported by the current physics backend.");
            return false;
        }

        const sources: AutoColliderSource[] = [];
        this._collectAutoColliderSources(root, sources, true);
        if (sources.length === 0) {
            this._clearAutoDetectedChildShapes();
            console.warn("CompoundColliderShape: the owner hierarchy contains no valid child MeshFilter.");
            return false;
        }

        const rootInverse = new Matrix4x4();
        root.transform.worldMatrix.invert(rootInverse);
        const children: AutoColliderChild[] = [];
        try {
            for (let i = 0, n = sources.length; i < n; i++)
                children.push(this._createAutoColliderChild(sources[i], rootInverse));
        } catch (error) {
            children.forEach(child => child.shape.destroy());
            console.error("CompoundColliderShape: failed to create automatically detected child shapes.", error);
            return false;
        }

        this._clearAutoDetectedChildShapes();
        children.forEach(child => this._addAutoDetectedChildShape(child));
        return true;
    }

    private _addAutoDetectedChildShape(child: AutoColliderChild): void {
        this._shape.addChildShapeWithTransform!(child.shape.shape, child.position, child.rotation, child.scale);
        this._childColliderShapes.push(child.shape);
        this._autoChildColliderShapes.add(child.shape);
    }

    private _clearAutoDetectedChildShapes(): void {
        for (let i = this._childColliderShapes.length - 1; i >= 0; i--) {
            if (this._autoChildColliderShapes.has(this._childColliderShapes[i]))
                this._removeChildShapeAt(i);
        }
    }

    private _collectAutoColliderSources(node: Sprite3D, output: AutoColliderSource[], isRoot: boolean): void {
        if (!isRoot) {
            if (!node.active || node.getComponent(PhysicsColliderComponent))
                return;
            const mesh = node.getComponent(MeshFilter)?.sharedMesh;
            if (mesh)
                output.push({ node, mesh });
        }
        for (let i = 0, n = node.numChildren; i < n; i++) {
            const child = node.getChildAt(i);
            if (child instanceof Sprite3D)
                this._collectAutoColliderSources(child, output, false);
        }
    }

    private _createAutoColliderChild(source: AutoColliderSource, rootInverse: Matrix4x4): AutoColliderChild {
        const relativeMatrix = new Matrix4x4();
        Matrix4x4.multiply(rootInverse, source.node.transform.worldMatrix, relativeMatrix);

        const position = new Vector3();
        const rotation = new Quaternion();
        const scale = new Vector3();
        if (!relativeMatrix.decomposeTransRotScale(position, rotation, scale))
            throw new Error(`${this._getNodePath(source.node)}: relative transform cannot be decomposed.`);
        if (scale.x <= 0 || scale.y <= 0 || scale.z <= 0)
            throw new Error(`${this._getNodePath(source.node)}: zero or negative scale is not supported.`);

        const shape = new MeshColliderShape();
        shape.convex = this.physicsComponent instanceof Rigidbody3D;
        shape.mesh = source.mesh;
        if (!shape.shape?.getPhysicsShape()) {
            shape.destroy();
            throw new Error(`${this._getNodePath(source.node)}: failed to create a mesh collider shape.`);
        }
        return { shape, position, rotation, scale };
    }

    private _getNodePath(node: Sprite3D): string {
        const names: string[] = [];
        const root = this.physicsComponent?.owner;
        let current: Sprite3D = node;
        while (current) {
            names.push(current.name || "<unnamed>");
            if (current === root)
                break;
            current = current.parent instanceof Sprite3D ? current.parent : null;
        }
        return names.reverse().join("/");
    }

    /** @inheritDoc */
    cloneTo(destObject: CompoundColliderShape): void {
        destObject.clearChildShape();
        for (let i = 0, n = this._childColliderShapes.length; i < n; i++) {
            const child = this._childColliderShapes[i];
            if (!this._autoChildColliderShapes.has(child))
                destObject.addChildShape(child.clone());
        }
        destObject._autoDetectChildShapes = this._autoDetectChildShapes;
        super.cloneTo(destObject);
    }

    /** @inheritDoc */
    clone(): CompoundColliderShape {
        const dest = new CompoundColliderShape();
        this.cloneTo(dest);
        return dest;
    }

    /** @inheritDoc */
    destroy(): void {
        super.destroy();
        this._childColliderShapes.forEach(shape => shape.destroy());
        this._childColliderShapes.length = 0;
        this._autoChildColliderShapes.clear();
    }
}
