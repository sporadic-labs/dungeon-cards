import React, { PureComponent } from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group";
import style from "./index.module.scss";
import { MENU_STATES } from "../../menu-states";

const timeouts = {
  enter: parseInt(style.delayDurationMs, 10) + parseInt(style.transitionDurationMs, 10),
  exit: parseInt(style.transitionDurationMs, 10)
};

const classNameMap = {
  appear: style.enter,
  enter: style.enter,
  exit: style.exit
};

/**
 * Apply a CSS animation when the menu is opening or closing, using react-transition-group.
 *
 * @export
 * @class MenuTransition
 * @extends {PureComponent}
 */
export default class MenuTransition extends PureComponent {
  // TransitionGroup re-mounts unmounted components so that they can be transitioned out. We need to
  // change props on these unmounted components, and the only way to do that is with the
  // childFactory property. We can use this to ensure components only run the enter/exit transition
  // when the menu is closing or opening.
  childFactory = child => {
    if (!child) return child; // Empty menu, nothing to do

    const { gameStore } = this.props;
    const shouldTransitionIn =
      gameStore.lastMenuState === null || gameStore.lastMenuState === MENU_STATES.GAME_ON;
    const shouldTransitionOut =
      gameStore.menuState === null || gameStore.menuState === MENU_STATES.GAME_ON;

    return React.cloneElement(child, {
      appear: shouldTransitionIn,
      enter: shouldTransitionIn,
      exit: shouldTransitionOut
    });
  };

  render() {
    const { gameStore, children } = this.props;

    // Default to a non-animated CSSTransition, and flip on the animations in childFactory
    return (
      <TransitionGroup childFactory={this.childFactory} component={null}>
        <CSSTransition
          timeout={timeouts}
          key={gameStore.menuState}
          appear={false}
          enter={false}
          exit={false}
          classNames={classNameMap}
        >
          <div>{children}</div>
        </CSSTransition>
      </TransitionGroup>
    );
  }
}
