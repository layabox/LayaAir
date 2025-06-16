import { StorageAdapter } from "../platform/StorageAdapter";
import { PAL } from "../platform/PlatformAdapters";

/**
 * @en The `LocalStorage` class is used for data storage without time limit.
 * @zh `LocalStorage` 类用于没有时间限制的数据存储。
 */
export class LocalStorage {
    static adapter: StorageAdapter;

    /**
     * @en Stores a key-value pair as strings.
     * @param key The key name.
     * @param value The value to store.
     * @zh 存储指定键名和键值，字符串类型。
     * @param key 键名。
     * @param value 键值。
     */
    static setItem(key: string, value: string): void {
        PAL.storage.setItem(key, value);
    }

    /**
     * @en Retrieves the value for the specified key.
     * @param key The key name.
     * @returns The string value associated with the key.
     * @zh 获取指定键名的值。
     * @param key 键名。
     * @returns 与键关联的字符串值。
     */
    static getItem(key: string): string | null {
        return PAL.storage.getItem(key);
    }

    /**
     * @en Stores a key-value pair where the value is an Object.
     * @param key The key name.
     * @param value The value to store. It's an Object type and will be converted to a JSON string for storage.
     * @zh 存储指定键名及其对应的 Object 类型值。
     * @param key 键名。
     * @param value 键值。是 Object 类型，会被转化为 JSON 字符串存储。
     */
    static setJSON(key: string, value: any): void {
        PAL.storage.setItem(key, JSON.stringify(value));
    }

    /**
     * @en Retrieves the Object value for the specified key.
     * @param key The key name.
     * @returns The Object value associated with the key.
     * @zh 获取指定键名对应的 Object 类型值。
     * @param key 键名。
     * @returns 与键关联的 Object 类型值。
     */
    static getJSON(key: string): any {
        return JSON.parse(PAL.storage.getItem(key));
    }

    /**
     * @en Removes the item associated with the specified key.
     * @param key The key name.
     * @zh 删除指定键名的信息。
     * @param key 键名。
     */
    static removeItem(key: string): void {
        PAL.storage.removeItem(key);
    }

    /**
     * @en Clears all locally stored information.
     * @zh 清除所有本地存储的信息。
     */
    static clear(): void {
        PAL.storage.clear();
    }

    /**
     * @en Retrieves the number of items stored in local storage.
     * @returns The number of items.
     * @zh 获取本地存储中存储的项目数量。
     * @returns 存储的项目数量。
     */
    static get count(): number {
        return PAL.storage.getCount();
    }
}


