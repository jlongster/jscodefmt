/* eslint-disable no-irregular-whitespace */
const { outdent } = require("outdent");

run_spec(
  {
    dirname: __dirname,
    snippets: [
      {
        code: "spaces = <div>]   [</div>",
        output: "spaces = <div>] [</div>;",
      },
      {
        code: "tabs = <div>]  \t    [</div>",
        output: "tabs = <div>] [</div>;",
      },
      {
        code: "slash_n = <div>]\n\n[</div>",
        output: "slash_n = <div>] [</div>;",
      },
      {
        code: "slash_r = <div>]\r\r[</div>",
        output: "slash_r = <div>] [</div>;",
      },
      {
        code: "slash_f = <div>]\f\f[</div>",
        output: "slash_f = <div>]\f\f[</div>;",
      },
      {
        code: "slash_v = <div>]\v\v[</div>",
        output: "slash_v = <div>]\v\v[</div>;",
      },
      {
        code: "non_breaking_spaces = <div>]\u00A0\u00A0[</div>",
        output: "non_breaking_spaces = <div>]\u00A0\u00A0[</div>;",
      },
      {
        code: "em_space = <div>]\u2003\u2003[</div>",
        output: "em_space = <div>]\u2003\u2003[</div>;",
      },
      {
        code: "hair_space = <div>]\u200a\u200a[</div>",
        output: "hair_space = <div>]\u200a\u200a[</div>;",
      },
      {
        code: "zero_width_space = <div>]\u200b\u200b[</div>",
        output: "zero_width_space = <div>]\u200b\u200b[</div>;",
      },
      {
        code: outdent`
          real_world_non_breaking_spaces = <p>
            Supprimer l’objectif «\u00A0{goal.name}\u00A0» ?
          </p>
        `,
        output: outdent`
          real_world_non_breaking_spaces = <p>Supprimer l’objectif «\u00A0{goal.name}\u00A0» ?</p>;
        `,
      },
      {
        code: outdent`
          real_world_non_breaking_spaces2 = <p>
            Supprimer l’objectif padding padding padding padding padding padding «\u00A0{goal.name}\u00A0» ?
          </p>
        `,
        output: outdent`
          real_world_non_breaking_spaces2 = (
            <p>
              Supprimer l’objectif padding padding padding padding padding padding «\u00A0
              {goal.name}\u00A0» ?
            </p>
          );
        `,
      },
    ].map((test) => ({ ...test, output: test.output + "\n" })),
  },
  ["flow", "typescript"]
);
