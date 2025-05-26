import { GTreeNode } from "./GTreeNode";
import { ITreeSelection } from "./selection/ITreeSelection";
import { TreeSelection } from "./selection/TreeSelection";
import { WidgetPool } from "./WidgetPool";
import { LayoutType, SelectionMode, TreeClickToExpandType } from "./Const";
import { GPanel } from "./GPanel";
import { Prefab } from "../resource/HierarchyResource";
import { GWidget } from "./GWidget";

/**
 * @blueprintInheritable
 */
export class GTree extends GPanel {

    public treeNodeRender: (node: GTreeNode, obj: any) => void;
    public treeNodeWillExpand: (node: GTreeNode, expanded: boolean) => void;

    public readonly rootNode: GTreeNode;
    public indent: number;
    public scrollToViewOnExpand: boolean = false;

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

    public get selection(): ITreeSelection {
        return this._selection;
    }

    public get clickToExpand(): TreeClickToExpandType {
        return this._selection.clickToExpand;
    }

    public set clickToExpand(value: TreeClickToExpandType) {
        this._selection.clickToExpand = value;
    }

    public get itemTemplate(): Prefab {
        return this._pool.defaultRes;
    }

    public set itemTemplate(value: Prefab) {
        this._pool.defaultRes = value;
    }

    public get itemPool(): WidgetPool {
        return this._pool;
    }

    public expandAll(folderNode?: GTreeNode): void {
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

    public collapseAll(folderNode?: GTreeNode): void {
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
    public _afterInserted(node: GTreeNode): void {
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
            let testNode = (<GWidget>this.getChildAt(i))._treeNode;
            if (testNode.level <= myLevel)
                break;

            insertIndex++;
        }

        return insertIndex;
    }

    /** @internal */
    public _afterRemoved(node: GTreeNode): void {
        this.removeNode(node);
    }

    /** @internal */
    public _afterExpanded(node: GTreeNode, byEvent?: boolean): void {
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
    public _afterCollapsed(node: GTreeNode, byEvent?: boolean): void {
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
    public _afterMoved(node: GTreeNode): void {
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
                let obj = this.getChildAt(startIndex + i);
                this._setChildIndex(obj, startIndex + i, insertIndex + i);
            }
        }
        else {
            for (let i = 0; i < cnt; i++) {
                let obj = this.getChildAt(startIndex);
                this._setChildIndex(obj, startIndex, insertIndex - 1);
            }
        }
    }

    private getFolderEndIndex(startIndex: number, level: number): number {
        let cnt = this.numChildren;
        for (let i = startIndex + 1; i < cnt; i++) {
            let node = (<GWidget>this.getChildAt(i))._treeNode;
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
                this._pool.returnObject(node.cell);
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
}