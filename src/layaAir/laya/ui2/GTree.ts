import { GTreeNode } from "./GTreeNode";
import { ITreeSelection } from "./selection/ITreeSelection";
import { TreeSelection } from "./selection/TreeSelection";
import { WidgetPool } from "./WidgetPool";
import { LayoutType, SelectionMode, TreeClickToExpandType } from "./Const";
import { GPanel } from "./GPanel";
import { Prefab } from "../resource/HierarchyResource";
import { GWidget } from "./GWidget";
import { Sprite } from "../display/Sprite";
import { SerializeUtil } from "../loaders/SerializeUtil";
import { LayaEnv } from "../../LayaEnv";
import { GButton } from "./GButton";

/**
 * @en GTree is a widget that displays a hierarchical tree structure, allowing for item rendering and selection.
 * @zh GTree 是一个显示分层树结构的小部件，允许进行项目渲染和选择。
 * @blueprintInheritable
 */
export class GTree extends GPanel {

    /**
     * @en The function used to render each tree node.
     * @zh 用于渲染每个树节点的函数。
     */
    treeNodeRender: (node: GTreeNode, obj: any) => void;
    /**
     * @en The function called when a tree node is about to expand or collapse.
     * @zh 当树节点即将展开或折叠时调用的函数。
     */
    treeNodeWillExpand: (node: GTreeNode, expanded: boolean) => void;

    /**
     * @en The root node of the tree.
     * @zh 树的根节点。
     */
    readonly rootNode: GTreeNode;

    /**
     * @en The indent for each level. As the depth of the tree node increases, it indents to the right by the specified pixel distance. For example, if the indent is 15 pixels and the tree node is at level 3, the total indent will be 15 * 3 = 45 pixels.
     * @zh 每级缩进。树节点的深度每增加一级，向右缩进的像素距离。例如，如果每级缩进是15像素，树节点的层级是3级，那么树节点的缩进是15*3=45像素。
     */
    indent: number;

    /**
     * @en Whether to scroll to the expanded node when it is expanded.
     * @zh 是否在展开节点时滚动到该节点。
     */
    scrollToViewOnExpand: boolean = false;

    private _pool: WidgetPool;
    declare _selection: ITreeSelection;

    constructor() {
        super(null, TreeSelection);

        this.indent = 15;

        this.layout.type = LayoutType.SingleColumn;
        this.selection.mode = SelectionMode.Single;

        this._pool = new WidgetPool();

        this.rootNode = new GTreeNode(true);
        this.rootNode._setTree(this);
        this.rootNode.expanded = true;
    }

    /**
     * @en The selection component used for managing the selection state of items in the tree.
     * @zh 用于管理树中项目选择状态的选择组件。
     */
    get selection(): ITreeSelection {
        return this._selection;
    }

    /**
     * @en Whether to automatically expand or collapse the folder node when clicking on it.
     * @zh 点击文件夹节点时是否自动展开或者折叠这个这个节点。
     */
    get clickToExpand(): TreeClickToExpandType {
        return this._selection.clickToExpand;
    }

    set clickToExpand(value: TreeClickToExpandType) {
        this._selection.clickToExpand = value;
    }

    /**
     * @en The template resource used for items in the tree.
     * @zh 树中项目使用的模板资源。
     */
    get itemTemplate(): Prefab {
        return this._pool.defaultRes;
    }

    set itemTemplate(value: Prefab) {
        this._pool.defaultRes = value;
    }

    /**
     * @en Built-in object pool functionality for GTree.
     * @zh GTree内建对象池功能。
     */
    get itemPool(): WidgetPool {
        return this._pool;
    }

    /**
     * @en Expands all child folder nodes of the specified folder node or the root node if none is specified.
     * @param folderNode The folder node to expand. If not specified, the root node will be used.
     * @zh 展开指定文件夹节点的所有子文件夹节点，如果未指定，则使用根节点。
     */
    expandAll(folderNode?: GTreeNode): void {
        if (!folderNode)
            folderNode = this.rootNode;

        folderNode.expanded = true;
        let cnt = folderNode.numChildren;
        for (let i = 0; i < cnt; i++) {
            let node = folderNode.getChildAt(i);
            if (node.isFolder)
                this.expandAll(node);
        }
    }

    /**
     * @en Collapses all child folder nodes of the specified folder node or the root node if none is specified.
     * @param folderNode The folder node to collapse. If not specified, the root node will be used.
     * @zh 折叠指定文件夹节点的所有子文件夹节点，如果未指定，则使用根节点。
     * @param folderNode 要折叠的文件夹节点。如果未指定，则使用根节点。 
     */
    collapseAll(folderNode?: GTreeNode): void {
        if (!folderNode)
            folderNode = this.rootNode;

        if (folderNode != this.rootNode)
            folderNode.expanded = false;
        let cnt = folderNode.numChildren;
        for (let i = 0; i < cnt; i++) {
            let node = folderNode.getChildAt(i);
            if (node.isFolder)
                this.collapseAll(node);
        }
    }

    private createCell(node: GTreeNode): void {
        node.createCell();

        if (this.treeNodeRender)
            this.treeNodeRender(node, node.cell);
    }

    /** @internal */
    _afterInserted(node: GTreeNode): void {
        if (!node.cell)
            this.createCell(node);

        let index = this.getInsertIndexForNode(node);
        this.addChildAt(node.cell, index);
        if (this.treeNodeRender)
            this.treeNodeRender(node, node.cell);

        if (node.isFolder && node.expanded)
            this.checkChildren(node, index);
    }

    private getInsertIndexForNode(node: GTreeNode): number {
        let prevNode = node.getPrevSibling();
        if (prevNode == null)
            prevNode = node.parent;
        let insertIndex = this.getChildIndex(prevNode.cell) + 1;
        let myLevel = node.level;
        let cnt = this.numChildren;
        for (let i = insertIndex; i < cnt; i++) {
            let testNode = (<GWidget>this.getChildAt(i)).treeNode;
            if (testNode && testNode.level <= myLevel)
                break;

            insertIndex++;
        }

        return insertIndex;
    }

    /** @internal */
    _afterRemoved(node: GTreeNode): void {
        this.removeNode(node);
    }

    /** @internal */
    _afterExpanded(node: GTreeNode, byEvent?: boolean): void {
        if (node == this.rootNode) {
            this.checkChildren(this.rootNode, 0);
            return;
        }

        if (this.treeNodeWillExpand)
            this.treeNodeWillExpand(node, true);

        if (node.onExpanded)
            node.onExpanded(true);

        if (node.cell == null)
            return;

        if (this.treeNodeRender)
            this.treeNodeRender(node, node.cell);

        if (node.cell.parent) {
            this.checkChildren(node, this.getChildIndex(node.cell));

            if (this.scrollToViewOnExpand && this.scroller != null) {
                let scrollTo = node.getLastVisibleDecendant();
                if (scrollTo == null && node.cell.visible)
                    scrollTo = node;
                if (scrollTo)
                    this.scroller.scrollTo(scrollTo.cell, false, node.cell);
            }
        }
    }

    /** @internal */
    _afterCollapsed(node: GTreeNode, byEvent?: boolean): void {
        if (node == this.rootNode) {
            this.checkChildren(this.rootNode, 0);
            return;
        }

        if (this.treeNodeWillExpand)
            this.treeNodeWillExpand(node, false);

        if (node.onExpanded)
            node.onExpanded(false);

        if (node.cell == null)
            return;

        if (this.treeNodeRender)
            this.treeNodeRender(node, node.cell);

        if (node.cell.parent)
            this.hideFolderNode(node);
    }

    /** @internal */
    _afterMoved(node: GTreeNode): void {
        let startIndex = this.getChildIndex(node.cell);
        let endIndex: number;
        if (node.isFolder)
            endIndex = this.getFolderEndIndex(startIndex, node.level);
        else
            endIndex = startIndex + 1;
        let insertIndex = this.getInsertIndexForNode(node);
        if (startIndex == insertIndex || startIndex == insertIndex - 1)
            return;

        let cnt = endIndex - startIndex;
        if (insertIndex < startIndex) {
            for (let i = 0; i < cnt; i++) {
                let obj = this.getChildAt(startIndex + i) as Sprite;
                this._setChildIndex(obj, startIndex + i, insertIndex + i);
            }
        }
        else {
            for (let i = 0; i < cnt; i++) {
                let obj = this.getChildAt(startIndex) as Sprite;
                this._setChildIndex(obj, startIndex, insertIndex - 1);
            }
        }
    }

    private getFolderEndIndex(startIndex: number, level: number): number {
        let cnt = this.numChildren;
        for (let i = startIndex + 1; i < cnt; i++) {
            let node = (<GWidget>this.getChildAt(i)).treeNode;
            if (node.level <= level)
                return i;
        }

        return cnt;
    }

    private checkChildren(folderNode: GTreeNode, index: number): number {
        let cnt = folderNode.numChildren;
        for (let i = 0; i < cnt; i++) {
            index++;
            let node = folderNode.getChildAt(i);
            if (node.cell == null)
                this.createCell(node);

            if (!node.cell.parent)
                this.addChildAt(node.cell, index);

            if (node.isFolder && node.expanded)
                index = this.checkChildren(node, index);
        }

        return index;
    }

    private hideFolderNode(folderNode: GTreeNode): void {
        let cnt = folderNode.numChildren;
        for (let i = 0; i < cnt; i++) {
            let node = folderNode.getChildAt(i);
            if (node.cell)
                this.removeChild(node.cell);
            if (node.isFolder && node.expanded)
                this.hideFolderNode(node);
        }
    }

    private removeNode(node: GTreeNode): void {
        if (node.cell) {
            node.cell.removeSelf();
            if (node._cellFromPool) {
                this._pool.recover(node.cell);
                node.cell = null;
            }
        }

        if (node.isFolder) {
            let cnt = node.numChildren;
            for (let i = 0; i < cnt; i++) {
                let node2 = node.getChildAt(i);
                this.removeNode(node2);
            }
        }
    }

    /** @ignore @blueprintIgnore */
    onAfterDeserialize(): void {
        super.onAfterDeserialize();

        if (SerializeUtil.hasProp("_initItemNum", "_itemData") && (LayaEnv.isPreview || !SerializeUtil._data._isDemo))
            this._buildInitItems();
    }

    /** @internal */
    _buildInitItems() {
        this.rootNode.removeChildren();

        if (this.itemTemplate == null)
            return;

        let itemData: Array<ITreeItemData> = (this as any)._itemData;
        let prevLevel = 0;
        let lastNode: GTreeNode;
        for (let i = 0; i < (this as any)._initItemNum; i++) {
            let m = (itemData && i < itemData.length) ? itemData[i] : null;
            if (m != null) {
                let level = m.level || 0;
                let isFolder = (itemData[i + 1]?.level || 0) > level;
                let node: GTreeNode = new GTreeNode(isFolder, m.res?.url);
                node.expanded = true;
                if (i == 0)
                    this.rootNode.addChild(node);
                else {
                    if (level > prevLevel)
                        lastNode.addChild(node);
                    else if (level < prevLevel) {
                        for (let j = level; j <= prevLevel; j++)
                            lastNode = lastNode.parent;
                        lastNode.addChild(node);
                    }
                    else
                        lastNode.parent.addChild(node);
                }
                lastNode = node;
                prevLevel = level;

                let child = node.cell;
                child.text = m.title;
                if (m.icon)
                    child.icon = m.icon;
                if (child instanceof GButton) {
                    if (m.selectedTitle)
                        child.selectedTitle = m.selectedTitle;
                    if (m.selectedIcon)
                        child.selectedIcon = m.selectedIcon;
                    child.selected = false;
                }
                if (m.name != null)
                    child.name = m.name;
            }
            else {
                let node = new GTreeNode();
                this.rootNode.addChild(node);
                prevLevel = 0;
                lastNode = node;
            }
        }

        this.selection._refresh();
    }
}


interface ITreeItemData {
    res: Prefab;
    name: string;
    title: string;
    selectedTitle: string;
    icon: string;
    selectedIcon: string;
    level: number;
}