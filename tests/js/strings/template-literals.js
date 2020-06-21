foo(`a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 } with expr`);

const x = `a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + ( function() {return 3 })() + 3 + 2 + 3 + 2 + 3 } with expr`;

foo(`a long string ${ 1 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + 3 + 2 + ( function() {
  const x = 5;

  return x;
 })() + 3 + 2 + 3 + 2 + 3 } with expr`);

pipe.write(
  `\n  ${chalk.dim(`\u203A and ${more} more ${more} more ${more} more ${more}`)}`,
);

// https://github.com/prettier/prettier/issues/1662#issue-230406820
const content = `
const env = ${ JSON.stringify({
	assetsRootUrl: env.assetsRootUrl,
	env: env.env,
	role: "client",
	adsfafa: "sdfsdff",
	asdfasff: "wefwefw",
  	fefef: "sf sdfs fdsfdsf s dfsfds"
}, null, "\t") });
`;

// https://github.com/prettier/prettier/issues/821#issue-210557749
f(`${{
  a: 4,
  b: 9,
}}`);

// https://github.com/prettier/prettier/issues/1183#issue-220863505
const makeBody = (store, assets, html) =>
  `<!doctype html>${
    ReactDOMServer.renderToStaticMarkup(
      <Html
        headScripts={compact([ assets.javascript.head ])}
        headStyles={compact([ assets.styles.body, assets.styles.head ])}
        bodyScripts={compact([ assets.javascript.body ])}
        bodyStyles={[]}
        stringScripts={[
          `window.__INITIAL_STATE__ = ${
            JSON.stringify(store.getState(), null, 2)
          };`,
        ]}
        content={[
          { id: 'app-container', dangerouslySetInnerHTML: { __html: html } },
        ]}
      />
    )
  }`

// https://github.com/prettier/prettier/issues/1626#issue-229655106
const Bar = styled.div`
  color: ${props => (props.highlight.length > 0 ? palette(['text', 'dark', 'tertiary'])(props) : palette(['text', 'dark', 'primary'])(props))} !important;
`
