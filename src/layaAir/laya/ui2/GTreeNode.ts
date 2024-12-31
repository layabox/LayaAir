import { Event } from "../events/Event";
import type { Controller } from "./Controller";
import type { GWidget } from "./GWidget";
import type { GTree } from "./GTree";
import type { TreeSelection } from "./selection/TreeSelection";
import { GButton } from "./GButton";
import { UIEventType } from "./UIEvent";

export class GTreeNode {
    public data: any;

    private _parent: GTreeNode;
    private _children: Array<GTreeNode>;
    private _expanded: boolean = false;
    private _level: number = 0;
    private _indentLevel: number = 0;
    private _addIndent: number = 0;
    private _tree: GTree;
    private _cell: GWidget;
    private _indentObj: GWidget;
    private _resURL: string;
    private _leafController: Controller;
    private _isFolder: boolean;
    private _expandCtrler: Controller;

    public onExpanded?: (expand: boolean) => void;

    /** @internal */
    public _cellFromPool: boolean;

    constructor(isFolder?: boolean, resURL?: string, addIndent?: number) {
        this._isFolder = isFolder;
        if (resURL)
            this._resURL = resURL;
        if (addIndent)
            this._addIndent = addIndent;
        this._children = [];
    }

    public set expanded(value: boolean) {
        this._setExpanded(value);
    }

    public _setExpanded(value: boolean, byEvent?: boolean) {
        if (this._expanded != value) {
            this._expanded = value;

            if (this._tree && this.isFolder) {
                if (this._expanded)
                    this._tree._afterExpanded(this, byEvent);
                else
                    this._tree._afterCollapsed(this, byEvent);
            }

            if (this._expandCtrler)
                this._expandCtrler.selectedIndex = this.expanded ? 1 : 0;
        }
    }

    public get expanded(): boolean {
        return this._expanded;
    }

    public get isFolder(): boolean {
        return this._isFolder || this._children.length > 0;
    }

    public set isFolder(value: boolean) {
        if (this._isFolder != value) {
            this._isFolder = value;
            if (this._leafController)
                this._leafController.selectedIndex = this.isFolder ? 0 : 1;
        }
    }

    public get addIndent(): number {
        return this._addIndent;
    }

    public set addIndent(value: number) {
        this._addIndent = value;
    }

    public get parent(): GTreeNode {
        return this._parent;
    }

    public get text(): string {
        if (this._cell)
            return this._cell.text;
        else
            return null;
    }

    public set text(value: string) {
        if (this._cell)
            this._cell.text = value;
    }

    public get icon(): string {
        if (this._cell)
            return this._cell.icon;
        else
            return null;
    }

    public set icon(value: string) {
        if (this._cell)
            this._cell.icon = value;
    }

    public get cell(): GWidget {
        return this._cell;
    }

    public set cell(value: GWidget) {
        if (this._cell) {
            this._cell._treeNode = null;
            this._indentObj = null;
            this._leafController = null;

            if (this._expandCtrler)
                this._expandCtrler.off(UIEventType.changed, this, this._expandedStateChanged);

            let btn = this._cell.findChild("expandButton");
            if (btn)
                btn.off(Event.CLICK, this, this._clickExpandButton);

            this._cell.off(Event.MOUSE_DOWN, this, this._cellMouseDown);
        }

        this._cell = value;
        this._cellFromPool = false;

        if (this._cell) {
            this._cell._treeNode = this;

            this._indentObj = this._cell.findChild("indent");
            if (this._tree && this._indentObj)
                this._indentObj.width = Math.max(this._indentLevel - 1, 0) * this._tree.indent;

            this._expandCtrler = this._cell.getController("expanded");
            if (this._expandCtrler) {
                this._expandCtrler.on(UIEventType.changed, this, this._expandedStateChanged);
                this._expandCtrler.selectedIndex = this.expanded ? 1 : 0;
            }

            let btn = this._cell.findChild("expandButton");
            if (btn)
                btn.on(Event.CLICK, this, this._clickExpandButton);

            this._leafController = this._cell.getController("leaf");
            if (this._leafController)
                this._leafController.selectedIndex = this.isFolder ? 0 : 1;

            this._cell.on(Event.MOUSE_DOWN, this, this._cellMouseDown);
        }
    }

    public createCell(tree?: GTree) {
        if (this._cell)
            return;

        let child = (this._tree || tree).itemPool.getObject(this._resURL ? this._resURL : "");
        if (!child)
            throw new Error("cannot create tree node object.");
        if (child instanceof GButton)
            child.selected = false;

        this.cell = child;
        this._cellFromPool = true;
    }

    public get level(): number {
        return this._level;
    }

    public addChild(child: GTreeNode): GTreeNode {
        this.addChildAt(child, this._children.length);
        return child;
    }

    public addChildAt(child: GTreeNode, index: number): GTreeNode {
        if (!child)
            throw new Error("child is null");

        let numChildren = this._children.length;

        if (index >= 0 && index <= numChildren) {
            if (child._parent == this) {
                this.setChildIndex(child, index);
            }
            else {
                if (child._parent)
                    child._parent.removeChild(child);

                if (index == numChildren)
                    this._children.push(child);
                else
                    this._children.splice(index, 0, child);

                if (this.isFolder && this._leafController)
                    this._leafController.selectedIndex = 0;

                child._parent = this;
                child._level = this._level + 1;
                child._indentLevel = this._indentLevel + 1 + child._addIndent;
                child._setTree(this._tree);
                if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded)
                    this._tree._afterInserted(child);
            }

            return child;
        }
        else {
            throw new Error(`Invalid child index ${index}`);
        }
    }

    public removeChild(child: GTreeNode): GTreeNode {
        let childIndex = this._children.indexOf(child);
        if (childIndex != -1) {
            this.removeChildAt(childIndex);
        }
        return child;
    }

    public removeChildAt(index: number): GTreeNode {
        if (index >= 0 && index < this.numChildren) {
            let child = this._children[index];
            this._children.splice(index, 1);

            if (!this.isFolder && this._leafController)
                this._leafController.selectedIndex = 1;

            child._parent = null;
            if (this._tree) {
                child._setTree(null);
                this._tree._afterRemoved(child);
            }

            return child;
        }
        else {
            throw new Error(`Invalid child index ${index}`);
        }
    }

    public removeChildren(beginIndex?: number, endIndex?: number): void {
        beginIndex = beginIndex || 0;
        if (endIndex == null) endIndex = -1;
        if (endIndex < 0 || endIndex >= this.numChildren)
            endIndex = this.numChildren - 1;

        for (let i = beginIndex; i <= endIndex; ++i)
            this.removeChildAt(beginIndex);
    }

    public getChildAt(index: number): GTreeNode {
        if (index >= 0 && index < this.numChildren)
            return this._children[index];
        else
            throw new Error(`Invalid child index ${index}`);
    }

    public getChildIndex(child: GTreeNode): number {
        return this._children.indexOf(child);
    }

    public getPrevSibling(): GTreeNode {
        if (this._parent == null)
            return null;

        let i = this._parent._children.indexOf(this);
        if (i <= 0)
            return null;

        return this._parent._children[i - 1];
    }

    public getNextSibling(): GTreeNode {
        if (this._parent == null)
            return null;

        let i = this._parent._children.indexOf(this);
        if (i < 0 || i >= this._parent._children.length - 1)
            return null;

        return this._parent._children[i + 1];
    }

    public getLastVisibleDecendant(): GTreeNode {
        let ret = this.findLastVisibleChild(this);
        return ret === this ? null : ret;
    }

    private findLastVisibleChild(parentNode: GTreeNode): GTreeNode {
        for (let i = parentNode.children.length - 1; i >= 0; i--) {
            let node = parentNode.children[i];
            if (node.cell?.parent && node.cell.visible)
                return this.findLastVisibleChild(node) || node;
            else if (node.children.length > 0 && node.expanded) {
                let ret = this.findLastVisibleChild(node);
                if (ret)
                    return ret;
            }
        }
        return null;
    }

    public setChildIndex(child: GTreeNode, index: number): void {
        let oldIndex = this._children.indexOf(child);
        if (oldIndex == -1)
            throw new Error("Not a child of this container");

        let cnt = this._children.length;
        if (index < 0)
            index = 0;
        else if (index > cnt)
            index = cnt;

        if (oldIndex == index)
            return;

        this._children.splice(oldIndex, 1);
        this._children.splice(index, 0, child);
        if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded)
            this._tree._afterMoved(child);
    }

    public swapChildren(child1: GTreeNode, child2: GTreeNode): void {
        let index1 = this._children.indexOf(child1);
        let index2 = this._children.indexOf(child2);
        if (index1 == -1 || index2 == -1)
            throw new Error("Not a child of this container");
        this.swapChildrenAt(index1, index2);
    }

    public swapChildrenAt(index1: number, index2: number): void {
        let child1 = this._children[index1];
        let child2 = this._children[index2];
        this._children[index1] = child2;
        this._children[index2] = child1;

        if (this._tree && this == this._tree.rootNode || this._cell && this._cell.parent && this._expanded) {
            if (index1 < index2) {
                this._tree._afterMoved(child2);
                this._tree._afterMoved(child1);
            }
            else {
                this._tree._afterMoved(child1);
                this._tree._afterMoved(child2);
            }
        }
    }

    public get numChildren(): number {
        return this._children.length;
    }

    public get children(): ReadonlyArray<GTreeNode> {
        return this._children;
    }

    public expandToRoot(): void {
        let p: GTreeNode = this;
        while (p) {
            p.expanded = true;
            p = p.parent;
        }
    }

    public get tree(): GTree {
        return this._tree;
    }

    public _setTree(value: GTree): void {
        this._tree = value;

        if (this._tree && this._indentObj)
            this._indentObj.width = Math.max(this._indentLevel - 1, 0) * this._tree.indent;

        if (this._tree && this._tree.treeNodeWillExpand && this._expanded)
            this._tree.treeNodeWillExpand(this, true);

        let cnt = this._children.length;
        for (let i = 0; i < cnt; i++) {
            let node = this._children[i];
            node._level = this._level + 1;
            node._indentLevel = this._indentLevel + 1 + node._addIndent;
            node._setTree(value);
        }
    }

    private _expandedStateChanged(evt: Event): void {
        let cc = <Controller>evt.target;
        this._setExpanded(cc.selectedIndex == 1, true);
    }

    private _cellMouseDown(evt: Event): void {
        if (this._tree && this.isFolder)
            (<TreeSelection>this._tree.selection)._expandedStatusInEvt = this._expanded;
    }

    private _clickExpandButton(evt: Event): void {
        //dont set selection if click on the expand button
        evt.stopPropagation();
    }
}
