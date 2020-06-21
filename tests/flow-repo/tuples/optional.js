// @flow

([0, undefined]: [number, ?string]); // Ok, correct arity
([0]: [number, ?string]); // Error, arity is enforced

([]: [?number, string]); // error, since second element is not marked optional
