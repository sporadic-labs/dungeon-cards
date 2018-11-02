import React, { PureComponent } from "react";
import classNames from "classnames";
import ButtonWithSfx from "../button-with-sfx";
import style from "./index.module.scss";
import PauseSvg from "../../../../images/fa-pause-solid.svg";
import PlaySvg from "../../../../images/fa-pause-solid.svg";

export default class PauseButton extends PureComponent {
  render() {
    const { className, isPaused, onPause, sfxPlayer } = this.props;

    return (
      <ButtonWithSfx
        className={classNames(style.pause, className)}
        sfxPlayer={sfxPlayer}
        onClick={isPaused ? null : onPause}
      >
        <PauseSvg />
      </ButtonWithSfx>
    );
  }
}
