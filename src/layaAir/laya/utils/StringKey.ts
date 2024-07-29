/**
 * @private
 * @en The StringKey class is used to access the number corresponding to a string.
 * @zh StringKey 类用于存取字符串对应的数字。
 */
export class StringKey {

    private _strsToID: any = {};
    private _idToStrs: any[] = [];
    private _length: number = 0;

    /**
     * @en Adds a string.
     * @param str The string to be added as a key which will be associated with a generated number.
     * @returns The numerical identifier associated with the string.
     * @zh 添加一个字符。
     * @param	str 字符，将作为key 存储相应生成的数字。
     * @returns 返回与此字符串对应的数字。
     */
    //TODO:coverage
    add(str: string): number {
        var index: any = this._strsToID[str];
        if (index != null) return index;

        this._idToStrs[this._length] = str;
        return this._strsToID[str] = this._length++;
    }

    /**
     * @en Retrieves the identifier for a specified string.
     * @param str The string for which to get the identifier.
     * @returns The identifier for the string, or -1 if the string does not exist.
     * @zh 根据指定的字符串获取其标识符。
     * @param	str 字符。
     * @return 返回此字符串对应的ID，如果字符串不存在则返回-1。
     */
    //TODO:coverage
    getID(str: string): number {
        var index: any = this._strsToID[str];
        return index == null ? -1 : index;
    }

    /**
     * @en Retrieves a string based on its identifier.
     * @zh 根据指定的ID获取对应的字符串。
     * @param  id ID。
     * @returns The string associated with the identifier, or undefined if no string is associated.
     * @zh 根据指定的ID获取对应的字符串。
     * @param  id ID。
     * @returns 返回与此ID对应的字符串。
     */
    //TODO:coverage
    getName(id: number): string {
        var str: any = this._idToStrs[id];
        return str == null ? undefined : str;
    }
}

