import { XMLIterator, XMLTagType } from "./XMLIterator";
import { XMLUtils } from "./XMLUtils";

export class XML {
    public name: string;
    public text: string;

    private _attrs: Record<string, string>;
    private _children: Array<XML>;

    public constructor(XmlString?: string) {
        if (XmlString)
            this.parse(XmlString);
    }

    public get attributes(): Record<string, string> {
        if (!this._attrs)
            this._attrs = {};
        return this._attrs;
    }

    public getAttrString(attrName: string, defValue?: string) {
        return XMLUtils.getString(this._attrs, attrName, defValue);
    }

    public getAttrInt(attrName: string, defValue?: number): number {
        return XMLUtils.getInt(this._attrs, attrName, defValue);
    }

    public getAttrFloat(attrName: string, defValue?: number): number {
        return XMLUtils.getFloat(this._attrs, attrName, defValue);
    }

    public getAttrBool(attrName: string, defValue?: boolean): boolean {
        return XMLUtils.getBool(this._attrs, attrName, defValue);
    }

    public setAttribute(attrName: string, attrValue: string) {
        if (!this._attrs)
            this._attrs = {};

        this._attrs[attrName] = attrValue;
    }

    public getNode(selector: string): XML {
        if (!this._children)
            return null;
        else
            return this._children.find(value => {
                return value.name == selector;
            });
    }

    public elements(selector?: string): Array<XML> {
        if (!this._children)
            this._children = new Array<XML>();
        if (selector)
            return this._children.filter(value => {
                return value.name == selector;
            });
        else
            return this._children;
    }

    public parse(aSource: string) {
        this.reset();

        let lastOpenNode: XML;
        let nodeStack: Array<XML> = new Array<XML>();

        XMLIterator.begin(aSource);
        while (XMLIterator.nextTag()) {
            if (XMLIterator.tagType == XMLTagType.Start || XMLIterator.tagType == XMLTagType.Void) {
                let childNode: XML;
                if (lastOpenNode)
                    childNode = new XML();
                else {
                    if (this.name != null) {
                        this.reset();
                        throw new Error("Invalid xml format - no root node.");
                    }
                    childNode = this;
                }

                childNode.name = XMLIterator.tagName;
                childNode._attrs = Object.assign({}, XMLIterator.attributes);

                if (lastOpenNode) {
                    if (XMLIterator.tagType != XMLTagType.Void)
                        nodeStack.push(lastOpenNode);
                    if (lastOpenNode._children == null)
                        lastOpenNode._children = new Array<XML>();
                    lastOpenNode._children.push(childNode);
                }
                if (XMLIterator.tagType != XMLTagType.Void)
                    lastOpenNode = childNode;
            }
            else if (XMLIterator.tagType == XMLTagType.End) {
                if (lastOpenNode == null || lastOpenNode.name != XMLIterator.tagName) {
                    this.reset();
                    throw new Error("Invalid xml format - <" + XMLIterator.tagName + "> dismatched.");
                }

                if (lastOpenNode._children == null || lastOpenNode._children.length == 0) {
                    lastOpenNode.text = XMLIterator.getText();
                }

                if (nodeStack.length > 0)
                    lastOpenNode = nodeStack.pop();
                else
                    lastOpenNode = null;
            }
        }
    }

    public reset() {
        this._attrs = null;
        if (this._children != null)
            this._children.length == 0;
        this.text = null;
    }
}