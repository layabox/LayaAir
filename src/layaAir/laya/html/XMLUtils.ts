/**
 * @en Utility class for XML operations.
 * @zh XML操作的工具类。
 */
export class XMLUtils {
    /**
     * @en Decodes a string that contains HTML entities into a displayable form.
     * @param aSource The string to decode.
     * @returns The decoded string.
     * @zh 对包含HTML实体的字符串进行解码，转换为可显示的格式。
     * @param aSource 需要解码的字符串。
     * @returns 返回解码后的字符串。
     */
    public static decodeString(aSource: string): string {
        let len = aSource.length;
        let sb: string = "";
        let pos1 = 0, pos2 = 0;

        while (true) {
            pos2 = aSource.indexOf('&', pos1);
            if (pos2 == -1) {
                sb += aSource.substring(pos1);
                break;
            }
            sb += aSource.substring(pos1, pos2);

            pos1 = pos2 + 1;
            pos2 = pos1;
            let end = Math.min(len, pos2 + 10);
            for (; pos2 < end; pos2++) {
                if (aSource[pos2] == ';')
                    break;
            }
            if (pos2 < end && pos2 > pos1) {
                let entity: string = aSource.substring(pos1, pos2);
                let u = 0;
                if (entity[0] == '#') {
                    if (entity.length > 1) {
                        if (entity[1] == 'x')
                            u = parseInt(entity.substring(2), 16);
                        else
                            u = parseInt(entity.substring(1));
                        sb += String.fromCharCode(u);
                        pos1 = pos2 + 1;
                    }
                    else
                        sb += '&';
                }
                else {
                    switch (entity) {
                        case "amp":
                            u = 38;
                            break;

                        case "apos":
                            u = 39;
                            break;

                        case "gt":
                            u = 62;
                            break;

                        case "lt":
                            u = 60;
                            break;

                        case "nbsp":
                            u = 32;
                            break;

                        case "quot":
                            u = 34;
                            break;
                    }
                    if (u > 0) {
                        sb += String.fromCharCode(u);
                        pos1 = pos2 + 1;
                    }
                    else
                        sb += '&';
                }
            }
            else {
                sb += '&';
            }
        }

        return sb;
    }

    /**
     * @en Encodes special characters in a string to their corresponding HTML entities.
     * @param str The string that contains special characters to be encoded.
     * @returns The encoded string with HTML entities.
     * @zh 将字符串中的特殊字符转换为对应的HTML实体。
     * @param str 包含待编码特殊字符的字符串。
     * @returns 包含HTML实体的编码后的字符串。
     */
    public static encodeString(str: string): string {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    }

    /**
     * @en Retrieves an attribute value from an object, and converts it to a string. If the attribute or object does not exist, the default value is used.
     * @param attrs The object that contains the attribute.
     * @param attrName The name of the attribute to retrieve.
     * @param defValue The default value if the attribute is not found or is null.
     * @returns The retrieved attribute value, or the default if the attribute is not present.
     * @zh 从一个对象中检索一个属性值，并将此属性转化为字符串，如果属性不存在或对象不存在，则使用默认值。
     * @param attrs 包含待检索属性的对象。
     * @param attrName 需要检索的属性名称。
     * @param defValue 如果属性不存在或为null时的默认值。
     * @returns 检索到的属性值的字符串，如果属性不存在或对象不存在，则返回默认值。
     */
    public static getString(attrs: any, attrName: string, defValue?: string): string {
        if (attrs == null)
            return defValue == null ? null : defValue;

        let ret = attrs[attrName];
        if (ret != null)
            return "" + ret;
        else
            return defValue == null ? null : defValue;
    }

    /**
     * @en Retrieve the attribute values in the object based on the attribute name and convert them to integers. If the attribute does not exist, use the default value.
     * @param attrs The object containing the attribute.
     * @param attrName The name of the attribute.
     * @param defValue The default value if the attribute is not found.
     * @returns If the attribute is a valid integer, return the parsed integer value; otherwise, return the default value.
     * @zh 根据属性名检索对象中的属性值，并将其转换为整数，如果属性不存在，则使用默认值。
     * @param attrs 包含属性的对象。
     * @param attrName 属性的名称。
     * @param defValue 如果属性未找到，则使用的默认值。
     * @returns 如果属性是有效的整数，则返回解析后的整数值，否则返回默认值。
     */
    public static getInt(attrs: any, attrName: string, defValue?: number): number {
        let value: string = this.getString(attrs, attrName);
        if (value != null && value.length > 0) {
            if (value[value.length - 1] == '%') {
                let ret = parseInt(value.substring(0, value.length - 1));
                if (!isNaN(ret))
                    return Math.ceil(ret / 100.0 * defValue);
            }
            else {
                let ret = parseInt(value);
                if (!isNaN(ret))
                    return ret;
            }
        }

        return defValue == null ? 0 : defValue;
    }

    /**
     * @en Retrieve the attribute value from the object based on the attribute name and convert it to a floating-point number. If the attribute does not exist, use the default value.
     * @param attrs The object containing the attribute.
     * @param attrName The name of the attribute.
     * @param defValue The default value if the attribute is not found.
     * @returns If the attribute is a valid floating-point number, return the parsed floating-point number; otherwise, return the default value.
     * @zh 根据属性名检索对象中的属性值，并将其转换为浮点数，如果属性不存在，则使用默认值。
     * @param attrs 包含属性的对象。
     * @param attrName 属性的名称。
     * @param defValue 如果属性未找到，则使用的默认值。
     * @returns 如果属性是有效的浮点数，则返回解析后的浮点数，否则返回默认值。
     */
    public static getFloat(attrs: any, attrName: string, defValue?: number): number {
        let value: string = this.getString(attrs, attrName);
        if (value == null || value.length == 0)
            return defValue == null ? 0 : defValue;

        let ret = parseFloat(value);
        if (isNaN(ret))
            return defValue == null ? 0 : defValue;
        else
            return ret;
    }

    /**
     * @en Retrieve the attribute values in the object based on the attribute name and convert them to Boolean values. If the attribute does not exist, use the default value.
     * @param attrs The object containing the attribute.
     * @param attrName The name of the attribute.
     * @param defValue The default value if the attribute is not found.
     * @returns If the attribute is a valid Boolean values, return the parsed Boolean values; otherwise, return the default value.
     * @zh 根据属性名检索对象中的属性值，并将其转换为布尔值，如果属性不存在，则使用默认值。
     * @param attrs 包含属性的对象。
     * @param attrName 属性的名称。
     * @param defValue 如果属性未找到，则使用的默认值。
     * @returns 如果属性是有效的布尔值，则返回解析后的布尔值，否则返回默认值。
     */
    public static getBool(attrs: any, attrName: string, defValue?: boolean): boolean {
        let value: string = this.getString(attrs, attrName);
        if (value == null || value.length == 0)
            return defValue == null ? false : defValue;

        if (value == "true" || value == "1")
            return true;
        else if (value == "false" || value == "0")
            return false;
        else
            return defValue == null ? false : defValue;
    }
}