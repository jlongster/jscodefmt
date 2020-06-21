/* @flow */
import type {Foobar} from "./issue-1455-helper"

function create(content: ?Foobar | String | Array<String>) {
}

function node(content: ?Foobar | String | Array<String>) {
  create(content)
}
