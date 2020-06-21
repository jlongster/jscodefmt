declare module "declare_module_exports" {
  declare module.exports: number;
}

declare module "declare_m_e_with_other_value_declares" {
  declare module.exports: number;
  declare var str: string;
}

declare module "declare_m_e_with_other_type_declares" {
  declare module.exports: number;
  declare type str2 = string;
}

/**
 * `declare var exports` is deprecated, so we have a grace period where both
 * syntaxes will work.
 */

declare module "DEPRECATED__declare_var_exports" {
  declare var exports: number;
}

/**
 * Ensure that, if both are present, `declare module.exports` wins
 */
declare module "declare_m_e_with_declare_var_e" {
  declare module.exports: number;
  declare var exports: string;
}
