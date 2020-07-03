<style jsx>{`
  div {
  display: ${expr};
    color: ${expr};
    ${expr};
    ${expr};
    background: red;
  animation: ${expr} 10s ease-out;
  }
  @media (${expr}) {
   div.${expr} {
    color: red;
   }
  ${expr} {
    color: red;
  }
  }
  @media (min-width: ${expr}) {
   div.${expr} {
    color: red;
   }
  ${expr} {
    color: red;
  }
  }
  @font-face {
    ${expr}
  }
`}</style>;

<style jsx>{`
  div {
  animation: linear ${seconds}s ease-out;
  }
`}</style>;

<style jsx>{`
  div {
  animation: 3s ease-in 1s ${foo => foo.getIterations()} reverse both paused slidein;
  }
`}</style>;

// need fix bellow

// expression in tag
<style jsx>{`
foo${exp}bar {}
`}</style>;

// expression in id
<style jsx>{`
 foo${exp}bar {}
`}</style>;

// expression in attribute name
<style jsx>{`
[foo${exp}bar] {}
`}</style>;

// expression in attribute value
<style jsx>{`
[a^=foo${exp}bar] {}
`}</style>;
   
// expression in class selector
<style jsx>{`
.foo${exp}bar {}
`}</style>;

// FIXME:
// expression in expression in decl prop
<style jsx>{`
div {
foo${exp}bar: 1;
foo${exp}: 1;
${exp}bar: 1;
}
`}</style>;

// FIXME: only working for prefix
// expression in expression in decl value
<style jsx>{`
div {
a: foo${exp}bar;
b: ${exp}bar;
b: foo${exp};
}
`}</style>;
     

