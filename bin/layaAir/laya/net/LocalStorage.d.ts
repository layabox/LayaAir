/**
     * <p> <code>LocalStorage</code> 类用于没有时间限制的数据存储。</p>
     */
export declare class LocalStorage {
    static _baseClass: typeof Storage;
    /**
     *  数据列表。
     */
    static items: any;
    /**
     * 表示是否支持  <code>LocalStorage</code>。
     */
    static support: boolean;
    static __init__(): boolean;
    /**
     * 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void;
    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key: string): string;
    /**
     * 存储指定键名及其对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void;
    /**
     * 获取指定键名对应的 <code>Object</code> 类型值。
     * @param key 键名。
     * @return <code>Object</code> 类型值
     */
    static getJSON(key: string): any;
    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void;
    /**
     * 清除本地存储信息。
     */
    static clear(): void;
}
declare class Storage {
    /**
     *  数据列表。
     */
    static items: any;
    /**
     * 表示是否支持  <code>LocalStorage</code>。
     */
    static support: boolean;
    static init(): void;
    /**
     * 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void;
    /**
     * 获取指定键名的值。
     * @param key 键名。
     * @return 字符串型值。
     */
    static getItem(key: string): string;
    /**
     * 存储指定键名和它的 <code>Object</code> 类型值。
     * @param key 键名。
     * @param value 键值。是 <code>Object</code> 类型，此致会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void;
    /**
     * 获取指定键名的 <code>Object</code> 类型值。
     * @param key 键名。
     * @return <code>Object</code> 类型值
     */
    static getJSON(key: string): any;
    /**
     * 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void;
    /**
     * 清除本地存储信息。
     */
    static clear(): void;
}
export {};
