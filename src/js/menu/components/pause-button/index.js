import React, { PureComponent } from "react";
import classNames from "classnames";
import ButtonWithSfx from "../button-with-sfx";
import style from "./index.module.scss";

export default class PauseButton extends PureComponent {
  render() {
    const { className, isPaused, onPause, sfxPlayer } = this.props;

    return (
      <ButtonWithSfx
        className={classNames(style.pause, className)}
        sfxPlayer={sfxPlayer}
        onClick={isPaused ? null : onPause}
      >
        {<i className="fa fa-pause" />}
      </ButtonWithSfx>
    );
  }
}
