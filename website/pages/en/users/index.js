"use strict";

const React = require("react");
const { Container } = require("../../../core/CompLibrary.js");

const siteConfig = require(process.cwd() + "/siteConfig.js");

class Users extends React.Component {
  render() {
    const showcase = siteConfig.users.map((user, i) => {
      return (
        <a key={i} href={user.infoLink}>
          <img src={user.image} title={user.caption} />
        </a>
      );
    });

    return (
      <div>
        <div className="mainContainer">
          <Container padding={["bottom", "top"]}>
            <div className="showcaseSection">
              <div className="prose">
                <h1>
                  Who
                  {"'"}s Using This?
                </h1>
                <p>
                  A few of the{" "}
                  <a href="https://www.npmjs.com/browse/depended/prettier">
                    many projects
                  </a>{" "}
                  using Prettier
                </p>
              </div>
              <div className="logos">{showcase}</div>
              <div className="prose">
                <p>Are you using this project?</p>
              </div>
              <a
                href={`${siteConfig.githubUrl}/edit/master/website/data/users.yml`}
                className="button"
              >
                Add your company
              </a>
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

Users.defaultProps = {
  language: "en",
};

Users.title = "Who's using Prettier?";

module.exports = Users;
