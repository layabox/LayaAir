import { ITreeSelection } from "./ITreeSelection";
import { Selection } from "./Selection";
import { GTree } from "../GTree";
import { GTreeNode } from "../GTreeNode";
import { GButton } from "../GButton";
import { TreeClickToExpandType } from "../Const";
import { GWidget } from "../GWidget";
import { Event } from "../../events/Event";

export class TreeSelection extends Selection implements ITreeSelection {
    declare _owner: GTree;

    private _clickToExpand: TreeClickToExpandType = 0;

    /** @internal */
    _expandedStatusInEvt: boolean;

    get clickToExpand(): TreeClickToExpandType {
        return this._clickToExpand;
    }

    set clickToExpand(value: TreeClickToExpandType) {
        this._clickToExpand = value;
    }

    getSelectedNode(): GTreeNode {
        let i = this.index;
        if (i != -1)
            return (<GWidget>this._owner.getChildAt(i)).treeNode;
        else
            return null;
    }

    getSelectedNodes(out?: Array<GTreeNode>): Array<GTreeNode> {
        if (!out)
            out = [];

        s_list.length = 0;
        this.get(s_list);
        let cnt = s_list.length;
        let ret: Array<GTreeNode> = [];
        for (let i = 0; i < cnt; i++) {
            let node = (<GWidget>this._owner.getChildAt(s_list[i])).treeNode;
            ret.push(node);
        }
        return ret;
    }

    selectNode(node: GTreeNode, scrollItToView?: boolean): void {
        let parentNode = node.parent;
        while (parentNode && parentNode != this._owner.rootNode) {
            parentNode.expanded = true;
            parentNode = parentNode.parent;
        }

        if (!node.cell)
            return;

        this.add(this._owner.getChildIndex(node.cell), scrollItToView);
    }

    unselectNode(node: GTreeNode): void {
        if (!node.cell)
            return;

        this.remove(this._owner.getChildIndex(node.cell));
    }

    handleClick(item: GButton, evt: Event): void {
        let scroller = this._owner.scroller;
        if (scroller?.isDragged)
            return;

        if (evt.button == 2 && !this.allowSelectByRightClick)
            return;

        if (this._clickToExpand != 0) {
            let node = item.treeNode;
            if (node && node.isFolder && this._expandedStatusInEvt == node.expanded) {
                if (this._clickToExpand == 2) {
                    if (evt.isDblClick)
                        node._setExpanded(!node.expanded, true);
                }
                else
                    node._setExpanded(!node.expanded, true);
            }
        }

        super.handleClick(item, evt);
    }

    handleArrowKey(dir: number, evt?: Event): number {
        if (dir == 3 || dir == 7) {
            let i = this.index;
            if (i != -1) {
                let node = (<GWidget>this._owner.getChildAt(i)).treeNode;
                if (node.isFolder) {
                    node.expanded = dir == 3;
                    return i;
                }
            }
        }
        return super.handleArrowKey(dir, evt);
    }
}

var s_list: Array<number> = [];