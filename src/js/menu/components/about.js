import React, { Component } from "react";

import Logo from "../../../images/sporadicLabs-logo-color-64.png";
import Website from "../../../images/sporadicLabs-logo-white-32.png";
import Github from "../../../images/GitHub-Mark-Light-32px.png";
import ButtonWithSfx from "./button-with-sfx";
import Menu from "./menu";

export default class AboutMenu extends Component {
  render() {
    const { onBack, sfxPlayer } = this.props;

    return (
      <div id="about-menu" className="menu">
        <div className="menu-title">About</div>
        <div className="brand">
          <div className="created-by">Created by</div>
          <div className="logo-wrap">
            <img src={Logo} />
            <span className="logo-text">Sporadic Labs</span>
          </div>
        </div>
        <div id="credits-wrap">
          <div id="credits-title">Sporadic Labs is:</div>
          <a
            href="https://github.com/mikewesthad"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            Mike Hadley
          </a>
          <a
            href="https://github.com/retwedt"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            Rex Twedt
          </a>
        </div>
        <div className="links">
          <a
            href="https://github.com/sporadic-labs/the-atomic-incident"
            alt="Github"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Github} />
          </a>
          <a
            href="https://sporadic-labs.github.io/"
            alt="Website"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src={Website} />
          </a>
        </div>

        <ButtonWithSfx sfxPlayer={sfxPlayer} onClick={onBack}>
          Back
        </ButtonWithSfx>
      </div>
    );
  }
}
