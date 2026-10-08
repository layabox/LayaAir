import { LayaGL } from "../layagl/LayaGL";
import { StatElement } from "../layagl/StatisticsContext";
import { Component } from "./Component";

// Set membership and observable order are unchanged. The hot dispatch walks
// an array; removals leave holes until no outer dispatch can hold an index.
class ComponentCallbacks extends Set<Component> {
    private _items: (Component | null)[] = [];
    private _depth: number = 0;
    private _dirty: boolean = false;

    add(component: Component): this {
        if (!this.has(component)) {
            super.add(component);
            this._items.push(component);
        }
        return this;
    }

    delete(component: Component): boolean {
        if (!super.delete(component)) return false;
        // ponytail: removal is O(n); add an index only if membership churn is hot.
        this._items[this._items.indexOf(component)] = null;
        this._dirty = true;
        return true;
    }

    clear(): void {
        super.clear();
        if (this._depth) { this._items.fill(null); this._dirty = true; }
        else { this._items.length = 0; this._dirty = false; }
    }

    begin(): (Component | null)[] {
        if (this._depth === 0 && this._dirty) {
            let count = 0;
            for (const item of this._items) if (item) this._items[count++] = item;
            this._items.length = count;
            this._dirty = false;
        }
        this._depth++;
        return this._items;
    }

    end(): void { this._depth--; }
}

/**
 * @en Core classes for managing and driving the lifecycle of components
 * @zh 用于管理和驱动组件生命周期的核心类
 */
export class ComponentDriver {
    private _onUpdates = new ComponentCallbacks();
    private _onLateUpdates = new ComponentCallbacks();
    private _onAfterSceneUpdates = new ComponentCallbacks();
    private _onPreRenders = new ComponentCallbacks();
    private _onPostRenders = new ComponentCallbacks();

    private _toStarts: Set<Component> = new Set();
    readonly _toDestroys: Set<Component> = new Set();

    /**
     * @internal
     * @en Calling component Onstart
     * @zh 调用组件Onstart
     */
    callStart() {
        for (let ele of this._toStarts) {
            if (ele._status == 2) {
                ele._status = 3;

                try {
                    ele.onStart();
                }
                catch (err: any) {
                    this.onError(err);
                }
            }
        }
        this._toStarts.clear();
    }
    /**
     * @internal
     * @en Calling component OnUpdate
     * @zh 调用组件OnUpdate
     */
    callUpdate() {
        let t = performance.now();
        const items = this._onUpdates.begin();
        try {
            for (let index = 0; index < items.length; index++) {
                const ele = items[index];
                if (ele && ele._status == 3) {
                    try {
                        ele.onUpdate();
                    }
                    catch (err: any) {
                        this.onError(err);
                    }
                }
            }
        } finally { this._onUpdates.end(); }
        LayaGL.statAgent.recordTimeData(StatElement.T_ScriptUpdateTime, performance.now() - t);
    }

    /**
     * @internal
     * @en Calling component LayeUpdate
     * @zh 调用组件LayeUpdate
     */
    callLateUpdate() {
        let t = performance.now();
        const items = this._onLateUpdates.begin();
        try {
            for (let index = 0; index < items.length; index++) {
                const ele = items[index];
                if (ele && ele._status == 3) {
                    try {
                        ele.onLateUpdate();
                    }
                    catch (err: any) {
                        this.onError(err);
                    }
                }
            }
        } finally { this._onLateUpdates.end(); }
        LayaGL.statAgent.recordTimeData(StatElement.T_ScriptLateUpdateTime, performance.now() - t);
    }

    /**
     * @internal
     * @en Calling component onAfterSceneUpdate
     * @zh 调用组件 onAfterSceneUpdate
     */
    callAfterSceneUpdate() {
        const items = this._onAfterSceneUpdates.begin();
        try {
            for (let index = 0; index < items.length; index++) {
                const ele = items[index];
                if (ele && ele._status == 3) {
                    try {
                        ele.onAfterSceneUpdate();
                    }
                    catch (err: any) {
                        this.onError(err);
                    }
                }
            }
        } finally { this._onAfterSceneUpdates.end(); }
    }

    /**
     * @internal
     * @en Calling component onPreRender
     * @zh 调用组件onPreRender
     */
    callPreRender() {
        const items = this._onPreRenders.begin();
        try {
            for (let index = 0; index < items.length; index++) {
                const ele = items[index];
                if (ele && ele._status == 3) {
                    try {
                        ele.onPreRender();
                    }
                    catch (err: any) {
                        this.onError(err);
                    }
                }
            }
        } finally { this._onPreRenders.end(); }
    }

    /**
     * @internal
     * @en Calling component onPostRender
     * @zh 调用组件onPostRender
     */
    callPostRender() {
        const items = this._onPostRenders.begin();
        try {
            for (let index = 0; index < items.length; index++) {
                const ele = items[index];
                if (ele && ele._status == 3) {
                    try {
                        ele.onPostRender();
                    }
                    catch (err: any) {
                        this.onError(err);
                    }
                }
            }
        } finally { this._onPostRenders.end(); }
    }

    /**
     * @internal
     * @en Calling destroy
     * @zh 调用销毁
     */
    callDestroy(): void {
        for (let ele of this._toDestroys) {
            try {
                ele._destroy(true);
            }
            catch (err: any) {
                this.onError(err);
            }
        }
        this._toDestroys.clear();
    }

    /**
     * @internal
     * @en Adds a component.
     * @param comp The component to be added.
     * @zh 添加一个组件。
     * @param comp 要添加的组件。
     */
    add(comp: Component) {
        if (comp._status == 1) {
            if (comp.onStart) {
                comp._status = 2;
                this._toStarts.add(comp);
            }
            else
                comp._status = 3;
        }

        if (comp.onUpdate)
            this._onUpdates.add(comp);
        if (comp.onLateUpdate)
            this._onLateUpdates.add(comp);
        if (comp.onAfterSceneUpdate)
            this._onAfterSceneUpdates.add(comp);

        if (comp.onPreRender)
            this._onPreRenders.add(comp);
        if (comp.onPostRender)
            this._onPostRenders.add(comp);
    }

    /**
     * @internal
     * @en Removes a component.
     * @param comp The component to be removed.
     * @zh 移除一个组件。
     * @param comp 要移除的组件。
     */
    remove(comp: Component) {
        if (comp._status == 2) //starting
            comp._status = 1; //cancel start

        if (comp.onUpdate)
            this._onUpdates.delete(comp);
        if (comp.onLateUpdate)
            this._onLateUpdates.delete(comp);
        if (comp.onAfterSceneUpdate)
            this._onAfterSceneUpdates.delete(comp);

        if (comp.onPreRender)
            this._onPreRenders.delete(comp);
        if (comp.onPostRender)
            this._onPostRenders.delete(comp);
    }

    /**
     * @internal
     * 删除组件Driver
     */
    destroy() {
        //TODO:
    }

    /**
     * @en Error handling.
     * @zh 错误处理。
     */
    onError(err: any) {
        console.error(err);
    }
}
