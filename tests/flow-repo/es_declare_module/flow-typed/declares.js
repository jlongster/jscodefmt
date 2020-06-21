declare module "CJS_Named" {
  declare var num1: number;
  declare var str1: string;
}

declare module "CJS_Clobbered" {
  declare var num2: number;
  declare type numType = number;
  declare var exports: {
    numExport: number,
  };
}

declare module "ES" {
  declare var strHidden: string;
  declare export {strHidden as str3};
  declare export var num3: number;
  declare export class C {}
  declare export type T = number;
  declare var exports: number;
}
