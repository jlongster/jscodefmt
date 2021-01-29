"use strict";

const React = require("react");
const PropTypes = require("prop-types");
const AnimatedLogo = require("@sandhose/prettier-animated-logo");
const { MarkdownBlock, Container } = require("../../core/CompLibrary.js");

const siteConfig = require(`${process.cwd()}/siteConfig.js`);

const ButtonGroup = (props) => (
  <div className="buttonGroup buttonWrapper">{props.children}</div>
);

ButtonGroup.propTypes = {
  children: PropTypes.node,
};

class Button extends React.Component {
  render() {
    return (
      <div className="pluginWrapper buttonWrapper">
        <a className="button" href={this.props.href} target={this.props.target}>
          {this.props.children}
        </a>
      </div>
    );
  }
}

Button.defaultProps = {
  target: "_self",
};

Button.propTypes = {
  href: PropTypes.string,
  target: PropTypes.string,
  children: PropTypes.any,
};

function Tidelift() {
  return (
    <a className="tidelift" href={siteConfig.tideliftUrl}>
      PRETTIER FOR ENTERPRISE
    </a>
  );
}

const HomeSplash = (props) => (
  <div className="homeContainer">
    <Tidelift />
    <div className="homeSplashFade">
      <div className="wrapper homeWrapper">
        <div className="animatedLogoWrapper">
          <AnimatedLogo version="wide" />
        </div>
        <div className="inner">
          <div className="section promoSection">
            <div className="promoRow">
              <div className="pluginRowBlock">
                <Button href="/playground/">Try It Online</Button>&nbsp;
                <Button href={`/docs/${props.language}/install.html`}>
                  Install Prettier
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

HomeSplash.propTypes = {
  language: PropTypes.string,
};

const TldrSection = ({ language }) => (
  <div className="tldrSection productShowcaseSection lightBackground">
    <Container>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-evenly",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>What is Prettier?</h2>
          <ul style={{ flex: "1" }}>
            <li>An opinionated code formatter</li>
            <li>Supports many languages</li>
            <li>Integrates with most editors</li>
            <li>Has few options</li>
          </ul>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h2>Why?</h2>
          <ul style={{ flex: "1" }}>
            <li>You press save and code is formatted</li>
            <li>No need to discuss style in code review</li>
            <li>Saves you time and energy</li>
            <li>
              <a href={`/docs/${language}/why-prettier.html`}>And more</a>
            </li>
          </ul>
        </div>
      </div>
    </Container>
  </div>
);

TldrSection.propTypes = {
  language: PropTypes.string,
};

const Language = ({ name, nameLink, showName, image, variants }) => (
  <div
    className="languageCategory"
    style={{
      display: "flex",
      alignItems: "flex-start",
      paddingBottom: "1em",
    }}
  >
    <img src={image} style={{ width: "50px", padding: "0 20px" }} />
    <ul>
      {showName && (
        <li className="accented">
          {nameLink ? <a href={nameLink}>{name}</a> : name}
        </li>
      )}
      {variants.map((variant) => (
        <li key={variant}>
          <MarkdownBlock>{variant}</MarkdownBlock>
        </li>
      ))}
    </ul>
  </div>
);

Language.propTypes = {
  name: PropTypes.string,
  nameLink: PropTypes.string,
  showName: PropTypes.bool,
  image: PropTypes.string,
  variants: PropTypes.array,
};

const LanguagesSection = () => {
  const languageChunks = siteConfig.supportedLanguages.reduce(
    (acc, language) => {
      const last = acc[acc.length - 1];
      if (
        last &&
        last.length < 2 &&
        last.reduce((sum, lang) => sum + lang.variants.length, 0) +
          language.variants.length <
          9
      ) {
        last.push(language);
      } else {
        acc.push([language]);
      }
      return acc;
    },
    []
  );

  return (
    <div
      className="languagesSection productShowcaseSection"
      style={{ textAlign: "center" }}
    >
      <Container>
        <h2>Works with the Tools You Use</h2>
        <div
          style={{
            display: "flex",
            flexFlow: "row wrap",
            justifyContent: "space-around",
          }}
        >
          {languageChunks.map((languageChunk, index) => (
            <div key={index} style={{ flex: "1 1 auto" }}>
              {languageChunk.map((language) => (
                <Language key={language.name} {...language} />
              ))}
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
};

const Editor = ({ content = "", image, name }) => (
  <div className="editor">
    <img className="editorImage" src={image} />
    <div className="editorInfo">
      <h3 className="editorName">{name}</h3>
      <MarkdownBlock>{content.replace(/\n/g, "  \n")}</MarkdownBlock>
    </div>
  </div>
);

Editor.propTypes = {
  content: PropTypes.string,
  image: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
};

const EditorSupportSection = () => (
  <div className="editorSupportSection productShowcaseSection lightBackground">
    <Container>
      <h2>Editor Support</h2>
      <div
        style={{
          display: "flex",
          flexFlow: "row wrap",
          justifyContent: "space-around",
        }}
      >
        {siteConfig.editors.map((editor) => (
          <Editor key={editor.name} {...editor} />
        ))}
      </div>
    </Container>

    <div style={{ float: "right" }}>
      <span>Got more? </span>
      <a
        href={`${siteConfig.githubUrl}/edit/main/website/data/editors.yml`}
        className="button"
      >
        Send a PR
      </a>
    </div>
  </div>
);

const UsersSection = ({ language }) => {
  const showcase = siteConfig.users
    .filter((user) => user.pinned)
    .map((user, i) => (
      <a key={i} className="growOnHover alignCenter" href={user.infoLink}>
        <img className="user" src={user.greyImage} title={user.caption} />
      </a>
    ));

  return (
    <div className="usersSection productShowcaseSection">
      <Container>
        <h2>Used By People You Rely On</h2>
        <div style={{ textAlign: "right" }} />
        <div
          style={{
            display: "flex",
            flexFlow: "row wrap",
            justifyContent: "space-around",
          }}
        >
          {showcase}
        </div>
        <div className="more-users">
          <a
            className="button"
            href={`${siteConfig.baseUrl + language}/users/`}
            target="_self"
            style={{ marginRight: "10px" }}
          >
            See Others
          </a>
        </div>

        <h2 className="ecosystemSubHeader">Established in the Ecosystem</h2>
        <div
          className="ecosystemSubSection"
          style={{
            display: "flex",
            justifyContent: "space-around",
            flexFlow: "row wrap",
          }}
        >
          <div style={{ display: "flex", marginTop: "22px" }}>
            <a
              href="https://github.com/prettier/prettier"
              className="growOnHover"
            >
              <img src="/images/github_grey.svg" style={{ height: "100px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "260px" }}>
              <p>
                More than{" "}
                <strong data-placeholder="dependent-github">2.3 million</strong>{" "}
                dependent repositories on GitHub
              </p>
              <Button href="https://github.com/prettier/prettier/network/dependents">
                Check Them Out
              </Button>
            </div>
          </div>

          <div style={{ display: "flex", marginTop: "22px" }}>
            <a
              href="https://npmjs.com/package/prettier"
              className="growOnHover"
            >
              <img src="/images/npm_grey.svg" style={{ height: "100px" }} />
            </a>
            <div style={{ marginLeft: ".7em", width: "260px" }}>
              <p>
                More than <strong data-placeholder="dependent-npm">6000</strong>{" "}
                dependent packages on npm
              </p>
              <Button href="https://www.npmjs.com/browse/depended/prettier">
                See them all
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
};

UsersSection.propTypes = {
  language: PropTypes.string,
};

class Index extends React.Component {
  render() {
    const language = this.props.language || "en";

    return (
      <div>
        <script src="landing.js" />
        <HomeSplash language={language} />
        <div className="mainContainer landingContainer">
          <TldrSection language={language} />
          <LanguagesSection />
          <EditorSupportSection />
          <UsersSection language={language} />
        </div>
      </div>
    );
  }
}

Index.propTypes = {
  language: PropTypes.string,
};

module.exports = Index;
