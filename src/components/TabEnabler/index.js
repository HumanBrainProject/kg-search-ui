/*
*   Copyright (c) 2018, EPFL/Human Brain Project PCO
*
*   Licensed under the Apache License, Version 2.0 (the "License");
*   you may not use this file except in compliance with the License.
*   You may obtain a copy of the License at
*
*       http://www.apache.org/licenses/LICENSE-2.0
*
*   Unless required by applicable law or agreed to in writing, software
*   distributed under the License is distributed on an "AS IS" BASIS,
*   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*   See the License for the specific language governing permissions and
*   limitations under the License.
*/

import React from "react";
import { SearchkitComponent} from "searchkit";
import { isMobile } from "../../Helpers/BrowserHelpers";

export class TabEnablerComponent extends SearchkitComponent {
  _keyUpHandler(event) {
    const {containerSelector} = this.props;
    if (event.keyCode === 13) {
      const container = document.body.querySelector(containerSelector);
      if (container.contains(document.activeElement)) {
        event.preventDefault();
        document.activeElement.click();
      }
    }
  }
  componentDidUpdate() {
    if (!isMobile) {
      const {containerSelector, itemSelector, activeItemSelector, disabledItemSelector} = this.props;
      const container = document.body.querySelector(containerSelector);
      const activeNodes = Object.values(container.querySelectorAll(activeItemSelector));
      const disabledNodes = Object.values(container.querySelectorAll(disabledItemSelector));
      const nodeList = container.querySelectorAll(itemSelector);
      [].forEach.call(nodeList, e => {
        if (activeNodes.some(a => a === e) || disabledNodes.some(d => d === e)) {
          e.removeAttribute("tabIndex");
        } else {
          e.setAttribute("tabIndex", 0);
        }
      });
    }
  }
  render() {
    const {className, children} = this.props;
    const keyUpHandler = (event) => this._keyUpHandler(event);

    if (isMobile) {
      return  (
        <span className={className} >
          {children}
        </span>
      );
    } else {
      return (
        <span className={className} onKeyUp={keyUpHandler}>
          {children}
        </span>
      );
    }
  }
}
