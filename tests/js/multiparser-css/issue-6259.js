export const Group = styled.div`
  margin: 0;

  .input {
    margin: 0;
  }

  ${StyledInput}:not(:first-child) {
    margin: 0;
  }

  & > :not(.${inputWrap}):not(${Button}) {
    display: flex;
  }
`

const yesFrame = (
    ...args: Interpolation<ThemedStyledProps<{}, Theme>>[]
) => css`
    ${ChatRoot}[data-frame="yes"] & {
        ${css({}, ...args)}
    }
`
