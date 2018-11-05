import React, { Component } from "react";

import logo from "../../../images/sporadicLabs-logo-color-64.png";
import WebsiteSvg from "../../../images/sporadic-labs-one-color.svg";
import GithubSvg from "../../../images/github.svg";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";
import Link from "./link/index";

export default class AboutMenu extends Component {
  render() {
    const { onBack, sfxPlayer } = this.props;

    return (
      <Menu id="about-menu" title="About">
        <div className="brand">
          <div className="created-by">Created by</div>
          <div className="logo-wrap">
            <img src={logo} />
            <span className="logo-text">Sporadic Labs</span>
          </div>
        </div>
        <div id="credits-wrap">
          <div id="credits-title">Sporadic Labs is:</div>
          <Link
            href="https://github.com/mikewesthad"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mike Hadley
          </Link>
          <Link
            href="https://github.com/retwedt"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rex Twedt
          </Link>
        </div>
        <div className="links">
          <a
            href="https://github.com/sporadic-labs/the-atomic-incident"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            <GithubSvg className="svg-link" style={{ height: "30px" }} />
          </a>
          <a
            href="https://sporadic-labs.github.io/"
            alt="Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <WebsiteSvg className="svg-link" style={{ height: "30px" }} />
          </a>
        </div>

        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onBack}>
          Back
        </ButtonWithSfx>
      </Menu>
    );
  }
}
