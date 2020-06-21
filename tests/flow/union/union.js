interface RelayProps {
  articles: Array<{
    __id: string,
  } | null> | null | void | 1,
}

interface RelayProps2 {
  articles: Array<{
    __id: string,
  } | null> | null | void,
}

export function aPrettyLongFunction(aRatherLongParamName: string | null): string {}

export function aPrettyLongFunctionA(aRatherLongParameterName: {} | null): string[] {}
export function aPrettyLongFunctionB(aRatherLongParameterName: Function | null): string[] {}
export interface MyInterface {}
export function aPrettyLongFunctionC(aRatherLongParameterName: MyInterface | null): string[] {}
export type MyType = MyInterface
export function aPrettyLongFunctionD(aRatherLongParameterName: MyType | null): string[] {}

export function aShortFn(aShortParmName: MyType | null): string[] {}

export function aPrettyLongFunctionE(aRatherLongParameterName: Array<{
  __id: string,
} | null> | null | void): string[] {}
