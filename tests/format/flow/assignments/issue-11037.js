const [resolvedHexVersionId, setResolvedHexVersionId] =
  useState<HexVersionId | undefined>();
const [options, setOptions] =
  useState<ParameterOptions | null | undefined>(initialOptions);
const [resolvedSessionEditable, setResolvedSessionEditable] =
  useState<boolean>(false);
