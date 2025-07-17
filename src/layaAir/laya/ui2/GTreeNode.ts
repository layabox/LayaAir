import { Event } from "../events/Event";
import type { Controller } from "./Controller";
import type { GWidget } from "./GWidget";
import type { GTree } from "./GTree";
import type { TreeSelection } from "./selection/TreeSelection";
import { GButton } from "./GButton";
import { Mutable } from "../../ILaya";
import { HideFlags } from "../Const";

/**
 * @en Represents a node in a tree structure.
 * @zh 表示树结构中的一个节点。
 */
export class GTreeNode {
    /**
     * @en The data associated with this tree node.
     * @zh 与此树节点关联的数据。
     */
    data: any;

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

    /**
     * @en The function called when the node is expanded or collapsed.
     * @zh 当节点被展开或折叠时调用的函数。
     */
    onExpanded?: (expand: boolean) => void;

    /** @internal */
    _cellFromPool: boolean;

    constructor(isFolder?: boolean, resURL?: string, addIndent?: number) {
        this._isFolder = isFolder;
        if (resURL)
            this._resURL = resURL;
        if (addIndent)
            this._addIndent = addIndent;
        this._children = [];
    }

    /**
     * @en The expanded state of the node.
     * @zh 节点的展开状态。
     */
    get expanded(): boolean {
        return this._expanded;
    }

    set expanded(value: boolean) {
        this._setExpanded(value);
    }

    /** @internal */
    _setExpanded(value: boolean, byEvent?: boolean) {
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

    /**
     * @en Indicates whether this node is a folder.
     * @zh 指示此节点是否为文件夹。
     */
    get isFolder(): boolean {
        return this._isFolder || this._children.length > 0;
    }

    set isFolder(value: boolean) {
        if (this._isFolder != value) {
            this._isFolder = value;
            if (this._leafController)
                this._leafController.selectedIndex = this.isFolder ? 0 : 1;
        }
    }

    /**
     * @en Additional indentation level for this node.
     * @zh 此节点的额外缩进级别。
     */
    get addIndent(): number {
        return this._addIndent;
    }

    set addIndent(value: number) {
        this._addIndent = value;
    }

    /**
     * @en The parent node of this tree node.
     * @zh 此树节点的父节点。
     */
    get parent(): GTreeNode {
        return this._parent;
    }

    /**
     * @en The text content of the tree node.
     * @zh 树节点的文本内容。
     */
    get text(): string {
        if (this._cell)
            return this._cell.text;
        else
            return null;
    }

    set text(value: string) {
        if (this._cell)
            this._cell.text = value;
    }

    /**
     * @en The icon associated with the tree node.
     * @zh 与树节点关联的图标。
     */
    get icon(): string {
        if (this._cell)
            return this._cell.icon;
        else
            return null;
    }

    set icon(value: string) {
        if (this._cell)
            this._cell.icon = value;
    }

    /**
     * @en The display widget for this tree node.
     * @zh 此树节点的显示小部件。
     */
    get cell(): GWidget {
        return this._cell;
    }

    set cell(value: GWidget) {
        if (this._cell) {
            (this._cell as Mutable<GWidget>).treeNode = null;
            this._indentObj = null;
            this._leafController = null;

            if (this._expandCtrler)
                this._expandCtrler.off(Event.CHANGED, this, this._expandedStateChanged);

            let btn = this._cell.findChild("expandButton");
            if (btn)
                btn.off(Event.CLICK, this, this._clickExpandButton);

            this._cell.off(Event.MOUSE_DOWN, this, this._cellMouseDown);
        }

        this._cell = value;
        this._cellFromPool = false;

        if (this._cell) {
            (this._cell as Mutable<GWidget>).treeNode = this;

            this._indentObj = this._cell.findChild("indent");
            if (this._tree && this._indentObj)
                this._indentObj.width = Math.max(this._indentLevel - 1, 0) * this._tree.indent;

            this._expandCtrler = this._cell.getController("expanded");
            if (this._expandCtrler) {
                this._expandCtrler.on(Event.CHANGED, this, this._expandedStateChanged);
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

    /**
     * @en Create a widget for this tree node.
     * @param tree If the tree node is not yet part of a tree, you can pass the tree instance to create the widget.
     * @zh 为此树节点创建一个小部件。
     * @param tree 如果树节点尚未属于任何树，可以传递树实例来创建小部件。
     */
    createCell(tree?: GTree) {
        if (this._cell)
            return;

        let child = (this._tree || tree).itemPool.take(this._resURL ? this._resURL : "");
        if (!child)
            throw new Error("cannot create tree node object.");
        child.hideFlags |= HideFlags.HideAndDontSave;
        if (child instanceof GButton)
            child.selected = false;

        this.cell = child;
        this._cellFromPool = true;
    }

    /**
     * @en The level of this tree node in the tree hierarchy.
     * @zh 此树节点在树层次结构中的级别。
     */
    get level(): number {
        return this._level;
    }

    /**
     * @en Add a child node to this tree node.
     * @param child The child node to add.
     * @returns The added child node.
     * @zh 向此树节点添加一个子节点。
     * @param child 要添加的子节点。
     * @returns 添加的子节点。 
     */
    addChild(child: GTreeNode): GTreeNode {
        this.addChildAt(child, this._children.length);
        return child;
    }

    /**
     * @en Add a child node at a specific index.
     * @param child The child node to add. 
     * @param index The index at which to add the child node. If the index is equal to the number of children, the child will be added at the end. 
     * @returns The added child node. 
     * @zh 在特定索引处添加一个子节点。
     * @param child 要添加的子节点。
     * @param index 要添加子节点的索引。如果索引等于子节点的数量，则子节点将被添加到末尾。
     * @returns 添加的子节点
     */
    addChildAt(child: GTreeNode, index: number): GTreeNode {
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

    /**
     * @en Remove a specific child node from this tree node.
     * @param child The child node to remove. 
     * @returns The removed child node.
     * @zh 从此树节点中移除特定的子节点。
     * @param child 要移除的子节点。
     * @returns 被移除的子节点。 
     */
    removeChild(child: GTreeNode): GTreeNode {
        let childIndex = this._children.indexOf(child);
        if (childIndex != -1) {
            this.removeChildAt(childIndex);
        }
        return child;
    }

    /**
     * @en Remove a child node at a specific index.
     * @param index The index of the child node to remove.
     * @returns The removed child node.
     * @zh 从此树节点中移除指定索引处的子节点。
     * @param index 要移除的子节点的索引。 
     * @returns 被移除的子节点。 
     */
    removeChildAt(index: number): GTreeNode {
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

    /**
     * @en Remove a range of children from this tree node.
     * @param beginIndex The starting index of the range to remove. Defaults to 0
     * @param endIndex The ending index of the range to remove. If not provided, it will remove all children from the beginning index to the end of the list.
     * @zh 从此树节点中移除一系列子节点。
     * @param beginIndex 要移除的范围的起始索引。默认为0。 
     * @param endIndex 要移除的范围的结束索引。如果未提供，将从起始索引移除到列表末尾的所有子节点。 
     */
    removeChildren(beginIndex?: number, endIndex?: number): void {
        beginIndex = beginIndex || 0;
        if (endIndex == null) endIndex = -1;
        if (endIndex < 0 || endIndex >= this.numChildren)
            endIndex = this.numChildren - 1;

        for (let i = beginIndex; i <= endIndex; ++i)
            this.removeChildAt(beginIndex);
    }

    /**
     * @en Get the child node at a specific index.
     * @param index The index of the child node to retrieve.
     * @returns The child node at the specified index.
     * @zh 获取指定索引处的子节点。
     * @param index 要检索的子节点的索引。 
     * @returns 指定索引处的子节点。 
     */
    getChildAt(index: number): GTreeNode {
        if (index >= 0 && index < this.numChildren)
            return this._children[index];
        else
            throw new Error(`Invalid child index ${index}`);
    }

    /**
     * @en Get the index of a specific child node.
     * @param child The child node to find the index of.
     * @returns The index of the specified child node, or -1 if not found.
     * @param child 要查找索引的子节点。 
     * @returns 指定子节点的索引，如果未找到则返回-1。 
     */
    getChildIndex(child: GTreeNode): number {
        return this._children.indexOf(child);
    }

    /**
     * @en Get the previous sibling node of this tree node.
     * @returns The previous sibling node, or null if this is the first child or has no parent.
     * @zh 获取此树节点的前一个兄弟节点。
     * @returns 前一个兄弟节点，如果这是第一个子节点或没有父节点，则返回null。 
     */
    getPrevSibling(): GTreeNode | null {
        if (this._parent == null)
            return null;

        let i = this._parent._children.indexOf(this);
        if (i <= 0)
            return null;

        return this._parent._children[i - 1];
    }

    /**
     * @en Get the next sibling node of this tree node.
     * @returns The next sibling node, or null if this is the last child or has no parent.
     * @zh 获取此树节点的下一个兄弟节点。
     * @returns 下一个兄弟节点，如果这是最后一个子节点或没有父节点，则返回null。 
     */
    getNextSibling(): GTreeNode | null {
        if (this._parent == null)
            return null;

        let i = this._parent._children.indexOf(this);
        if (i < 0 || i >= this._parent._children.length - 1)
            return null;

        return this._parent._children[i + 1];
    }

    /**
     * @en Get the last visible descendant node of this tree node.
     * @returns The last visible descendant node, or null if there are no visible descendants.
     * @zh 获取此树节点的最后一个可见子孙节点。
     * @returns 最后一个可见子孙节点，如果没有可见子孙节点，则返回null。 
     */
    getLastVisibleDecendant(): GTreeNode | null {
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

    /**
     * @en Set the index of a child node within this tree node.
     * @param child The child node whose index is to be set. 
     * @param index The new index for the child node. If the index is less than 0, it will be set to 0; if greater than the number of children, it will be set to the number of children. 
     * @zh 设置此树节点中子节点的索引。
     * @param child 要设置索引的子节点。
     * @param index 子节点的新索引。如果索引小于0，则设置为0；如果大于子节点数量，则设置为子节点数量。 
     */
    setChildIndex(child: GTreeNode, index: number): void {
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

    /**
     * @en Swap the positions of two child nodes within this tree node.
     * @param child1 The first child node to swap.
     * @param child2 The second child node to swap.
     * @zh 在此树节点中交换两个子节点的位置。
     * @param child1 第一个要交换的子节点。 
     * @param child2 第二个要交换的子节点。 
     */
    swapChildren(child1: GTreeNode, child2: GTreeNode): void {
        let index1 = this._children.indexOf(child1);
        let index2 = this._children.indexOf(child2);
        if (index1 == -1 || index2 == -1)
            throw new Error("Not a child of this container");
        this.swapChildrenAt(index1, index2);
    }

    /**
     * @en Swap the positions of two child nodes at specific indices within this tree node.
     * @param index1 The index of the first child node to swap.
     * @param index2 The index of the second child node to swap.
     * @zh 在此树节点中交换两个子节点在特定索引处的位置。
     * @param index1 第一个要交换的子节点的索引。 
     * @param index2 第二个要交换的子节点的索引。 
     */
    swapChildrenAt(index1: number, index2: number): void {
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

    /**
     * @en The number of child nodes under this tree node.
     * @zh 此树节点下的子节点数量。
     */
    get numChildren(): number {
        return this._children.length;
    }

    /**
     * @en The list of child nodes under this tree node.
     * @returns A read-only array of child nodes.
     * @zh 此树节点下的子节点列表。
     * @returns 一个只读的子节点数组。
     */
    get children(): ReadonlyArray<GTreeNode> {
        return this._children;
    }

    /**
     * @en Expand this tree node and all its parent nodes up to the root.
     * @zh 展开此树节点及其所有父节点直到根节点。
     */
    expandToRoot(): void {
        let p: GTreeNode = this;
        while (p) {
            p.expanded = true;
            p = p.parent;
        }
    }

    /**
     * @en The tree that this node belongs to.
     * @zh 此节点所属的树。
     */
    get tree(): GTree {
        return this._tree;
    }

    /** @internal */
    _setTree(value: GTree): void {
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

    private _expandedStateChanged(): void {
        this._setExpanded(this._expandCtrler.selectedIndex == 1, true);
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
