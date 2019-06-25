/**
     * @private
     * <code>StringKey</code> 类用于存取字符串对应的数字。
     */
export declare class StringKey {
    private _strsToID;
    private _idToStrs;
    private _length;
    /**
     * 添加一个字符。
     * @param	str 字符，将作为key 存储相应生成的数字。
     * @return 此字符对应的数字。
     */
    add(str: string): number;
    /**
     * 获取指定字符对应的ID。
     * @param	str 字符。
     * @return 此字符对应的ID。
     */
    getID(str: string): number;
    /**
     * 根据指定ID获取对应字符。
     * @param  id ID。
     * @return 此id对应的字符。
     */
    getName(id: number): string;
}
