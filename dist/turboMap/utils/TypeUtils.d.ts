export type PrimitiveKey = string | number | boolean | null | undefined | symbol | bigint;
export type ObjectKey = object | Function | Date | RegExp | Error;
export type MapKey = PrimitiveKey | ObjectKey;
export declare class TypeUtils {
    static isPrimitive(value: unknown): value is PrimitiveKey;
    static isSimpleObject(value: unknown): boolean;
    static getObjectSignature(obj: unknown): string;
    static safeAccess<T>(obj: unknown, accessor: () => T, fallback: T): T;
    static isSerializable(obj: unknown, visited?: WeakSet<object>): boolean;
}
//# sourceMappingURL=TypeUtils.d.ts.map