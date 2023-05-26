export class XMLUtils {
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

    public static encodeString(str: string): string {
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;")
            .replace(/>/g, "&gt;").replace(/'/g, "&apos;").replace(/"/g, "&quot;");
    }

    public static getString(attrs: any, attrName: string, defValue?: string): string {
        if (attrs == null)
            return defValue == null ? null : defValue;

        let ret = attrs[attrName];
        if (ret != null)
            return "" + ret;
        else
            return defValue == null ? null : defValue;
    }

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