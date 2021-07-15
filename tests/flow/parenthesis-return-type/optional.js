const fun = (a: number): (?(string => string)) => {
  return a > 0 ? s => `${s}: ${a}` : null;
};
