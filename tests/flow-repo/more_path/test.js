class BaseClass {
  baseProp: string;
}

class ChildClass extends BaseClass {
  childProp: string;
}

function test(obj: BaseClass): string {
  if (obj instanceof ChildClass) {
    return obj.childProp_TYPO; // error (obj: ChildClass)
  }
  return obj.baseProp;
}
