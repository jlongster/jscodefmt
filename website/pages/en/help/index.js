"use strict";

const React = require("react");
const { Container, GridBlock } = require("../../../core/CompLibrary.js");

class Help extends React.Component {
  render() {
    const supportLinks = [
      {
        content:
          "Learn more using the [documentation on this site.](/docs/en/why-prettier.html)\n",
        title: "Browse Docs",
      },
      {
        content: "Ask questions about the documentation and project\n",
        title: "Join the community",
      },
      {
        content: "Find out what's new with this project\n",
        title: "Stay up to date",
      },
    ];

    return (
      <div>
        <div className="docMainWrapper wrapper">
          <Container className="mainContainer documentContainer postContainer">
            <div className="post">
              <header className="postHeader">
                <h2>Need help?</h2>
              </header>
              <p>This project is maintained by a dedicated group of people;</p>
              <GridBlock contents={supportLinks} layout="threeColumn" />
            </div>
          </Container>
        </div>
      </div>
    );
  }
}

Help.defaultProps = {
  language: "en",
};

module.exports = Help;
