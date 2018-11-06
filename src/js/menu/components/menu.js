import React, { Component } from "react";
import scrollBgSrc from "../../../images/scroll-menu.png";

export default class Menu extends Component {
  render() {
    const { title, children, ...otherProps } = this.props;

    return (
      <div className="menu" {...otherProps}>
        <img src={scrollBgSrc} className="menu-scroll" />
        <div className="menu-title">{title}</div>
        {children}
      </div>
    );
  }
}
