/* @flow */

declare interface IDataBase {
  id: string,
  name: string,
}

declare interface IUserData extends IDataBase {
  kind: "user",
}

declare interface ISystemData extends IDataBase {
  kind: "system",
}

declare type IData = IUserData | ISystemData;

const data: IData = {
  id: "",
  name: "",
  kind: "system",
}

if (data.kind === "user") {
  (data: ISystemData);
}
