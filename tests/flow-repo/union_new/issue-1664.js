/* @flow */

type DataBase = {
  id: string,
  name: string,
};

type UserData = DataBase & {
  kind: "user",
};

type SystemData = DataBase & {
  kind: "system",
}

type Data = UserData | SystemData;

const data: Data = {
  id: "",
  name: "",
  kind: "system",
}

if (data.kind === "system") {
  (data: SystemData);
}
