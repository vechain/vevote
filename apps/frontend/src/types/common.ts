export type Override<T1, T2> = Omit<T1, keyof T2> & T2;
export type MethodName<T> = T extends (nameOrSignature: infer U) => unknown ? U : never;
