/* @flow */

type DataBase = {
  id: string,
  name: string,
};

type UserData = {
  id: string,
  name: string,
  kind: "user",
}

type SystemData = {
  id: string,
  name: string,
  kind: "system",
}

declare type Data = UserData | SystemData;

const data: Data = {
  id: "",
  name: "",
  kind: "system",
}

if (data.kind === "user") {
  (data: SystemData);
}
