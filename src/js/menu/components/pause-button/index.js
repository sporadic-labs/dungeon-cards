import React, { PureComponent } from "react";
import classNames from "classnames";
import ButtonWithSfx from "../button-with-sfx";
import style from "./index.module.scss";
import PauseSvg from "../../../../images/fa-pause-solid.svg";
import PlaySvg from "../../../../images/fa-play-solid.svg";

export default class PauseButton extends PureComponent {
  render() {
    const { className, isPaused, onPause, onResume, sfxPlayer } = this.props;

    return (
      <ButtonWithSfx
        className={classNames(style.pause, className)}
        sfxPlayer={sfxPlayer}
        onClick={isPaused ? onResume : onPause}
      >
        {isPaused ? <PlaySvg /> : <PauseSvg />}
      </ButtonWithSfx>
    );
  }
}
