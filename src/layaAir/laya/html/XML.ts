import { XMLIterator, XMLTagType } from "./XMLIterator";
import { XMLUtils } from "./XMLUtils";

/**
 * @en The `XML` class represents an XML node with methods to manipulate and parse XML data.
 * @zh `XML` 类表示一个 XML 节点，具有操作和解析 XML 数据的方法。
 */
export class XML {
    /**
     * @en The name of the XML node.
     * @zh XML 节点的名称。
     */
    public name: string;
    /**
     * @en The text content of the XML node.
     * @zh XML 节点的文本内容。
     */
    public text: string;

    private _attrs: Record<string, string>;
    private _children: Array<XML>;

    /**
     * @ignore
     * @en Creates a new instance of the `XML` class.
     * @param XmlString Optional. The XML source string to parse.
     * @zh 创建 `XML` 类的新实例。
     * @param XmlString 可选。要解析的 XML 源字符串。
     */
    public constructor(XmlString?: string) {
        if (XmlString)
            this.parse(XmlString);
    }

    /**
     * @en The attributes of the XML node.
     * @zh XML 节点的属性。
     */
    public get attributes(): Record<string, string> {
        if (!this._attrs)
            this._attrs = {};
        return this._attrs;
    }

    /**
     * @en Retrieves the value of an attribute as a string. If the attribute is not found, the default value is returned.
     * @param attrName The name of the attribute to retrieve.
     * @param defValue The default value to return if the attribute is not found.
     * @returns The attribute value as a string, or the default value if the attribute is not present.
     * @zh 根据属性名称获取对应的字符串。如果未找到属性，则返回默认值。
     * @param attrName 要检索的属性名称。
     * @param defValue 如果未找到属性，则返回的默认值。
     * @returns 属性的字符串，如果属性不存在，则为默认值。
     */
    public getAttrString(attrName: string, defValue?: string) {
        return XMLUtils.getString(this._attrs, attrName, defValue);
    }

    /**
     * @en Retrieve the attribute value from the XML node's attributes based on the attribute name, convert it to an integer, and return the default value if the attribute is not found.
     * @param attrName The name of the attribute to retrieve.
     * @param defValue The default value to return if the attribute is not found or not a number.
     * @returns The integer value of an XML node attribute, or the default value if the attribute value does not exist.
     * @zh 根据属性名称从 XML 节点的属性中检索属性值，将其转换为整数，如果未找到属性，则返回默认值。
     * @param attrName 要检索的属性名称。
     * @param defValue 如果属性未找到或无法转换为整数，则返回的默认整数值。
     * @returns XML 节点属性的整数值，如果属性值不存在，则为默认值。
     */
    public getAttrInt(attrName: string, defValue?: number): number {
        return XMLUtils.getInt(this._attrs, attrName, defValue);
    }

    /**
     * @en Retrieve the attribute value from the XML node's attributes based on the attribute name, convert it to a floating-point number, and return the default value if the attribute is not found.
     * @param attrName The name of the attribute to retrieve.
     * @param defValue The default value to return if the attribute is not found.
     * @returns The floating-point value of an XML node attribute, which is the default value if the attribute value does not exist.
     * @zh 根据属性名称从 XML 节点的属性中检索属性值，将其转换为浮点数，如果未找到属性，则返回默认值。
     * @param attrName 要检索的属性名称。
     * @param defValue 如果属性未找到，则返回的默认浮点数。
     * @returns XML 节点属性的浮点数值，如果属性值不存在，则为默认值。
     */
    public getAttrFloat(attrName: string, defValue?: number): number {
        return XMLUtils.getFloat(this._attrs, attrName, defValue);
    }

    /**
     * @en Retrieve the attribute value from the XML node's attributes based on the attribute name, convert it to a floating-point number, and return the default value if the attribute is not found.
     * @param attrName The name of the attribute to retrieve.
     * @param defValue The default value to return if the attribute is not found or not a number.
     * @returns The floating-point value of an XML node attribute, which is the default value if the attribute value does not exist.
     * @zh 根据属性名称从 XML 节点的属性中检索属性值，将其转换为布尔值，如果未找到属性，则返回默认值。
     * @param attrName 要检索的属性名称。
     * @param defValue 如果属性未找到，则返回的默认布尔值。
     * @returns XML 节点属性的布尔值，如果属性值不存在，则为默认值。
     */
    public getAttrBool(attrName: string, defValue?: boolean): boolean {
        return XMLUtils.getBool(this._attrs, attrName, defValue);
    }

    /**
     * @en Sets an attribute on the XML node to the specified value.
     * @param attrName The name of the attribute to set.
     * @param attrValue The value of the attribute to set.
     * @zh 设置 XML 节点的属性为指定的值。
     * @param attrName 要设置的属性名称。
     * @param attrValue 要设置的属性值。
     */
    public setAttribute(attrName: string, attrValue: string) {
        if (!this._attrs)
            this._attrs = {};

        this._attrs[attrName] = attrValue;
    }

    /**
     * @en Retrieves the first child node with the specified name.
     * @param selector The name of the child node to find.
     * @returns The first child node with the specified name, or null if not found.
     * @zh 检索具有指定名称的第一个子节点。
     * @param selector 要查找的子节点名称。
     * @returns 如果找到具有指定名称的第一个子节点，则返回该节点；如果没有找到，则返回 null。
     */
    public getNode(selector: string): XML {
        if (!this._children)
            return null;
        else
            return this._children.find(value => {
                return value.name == selector;
            });
    }

    /**
     * @en Get child elements of the XML node.
     * @param selector Optional. A string to filter child elements by name.
     * @returns An array of XML objects representing the child elements.
     * @zh 获取XML节点的子元素。
     * @param selector 可选。用于按名称筛选子元素的字符串。
     * @returns 表示子元素的XML对象数组。
     */
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

    /**
     * @en Parses the given XML source string and populates the node and its children according to the XML structure.
     * @param aSource The XML source string to parse.
     * @zh 解析给定的 XML 源字符串，并根据 XML 结构填充节点及其子节点。
     * @param aSource 要解析的 XML 源字符串。
     */
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

    /**
     * @en Resets the attributes and child nodes of the XML node.
     * @zh 重置 XML 节点的属性和子节点。
     */
    public reset() {
        this._attrs = null;
        if (this._children != null)
            this._children.length == 0;
        this.text = null;
    }
}