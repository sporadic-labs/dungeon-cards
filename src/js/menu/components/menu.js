import React, { Component } from "react";
import scrollBgSrc from "../../../images/scroll-menu.png";
import Image from "./image";

export default class Menu extends Component {
  render() {
    const { title, children, ...otherProps } = this.props;

    return (
      <div className="menu" {...otherProps}>
        <Image src={scrollBgSrc} className="menu-scroll" />
        <div className="menu-title">{title}</div>
        {children}
      </div>
    );
  }
}
