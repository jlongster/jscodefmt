/* @flow */

type Task <error, value>
  = { chain<tagged>(next:(input:value) => Task<error, tagged>):
          Task<error, tagged>
    }

function id(x: Task<any,any>): Task<any,any> { return x; }
