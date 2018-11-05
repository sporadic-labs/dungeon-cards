import React, { PureComponent } from "react";
import classNames from "classnames";
import style from "./index.module.scss";

/**
 * @export
 * @class Link
 * @extends {PureComponent}
 */
export default class Link extends PureComponent {
  render() {
    const { className, children, ...otherProps } = this.props;
    return <a className={classNames(style.link, className)}>{children}</a>;
  }
}
