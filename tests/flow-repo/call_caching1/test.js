// @flow

const Immutable = require('immutable');

const tasksPerStatusMap = new Map(
  [].map(taskStatus => [taskStatus, new Map()]),
);
for (let [taskStatus, tasksMap] of tasksPerStatusMap) {
  tasksPerStatusMap.set(taskStatus, Immutable.Map(tasksMap));
}
