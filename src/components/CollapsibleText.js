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

import React, { PureComponent } from "react";
import { Text } from "./Text";
import "./CollapsibleText.css";

export class CollapsibleText extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: true,
    };
    this.handleClick = this.handleClick.bind(this);
  }
  handleClick() {
    this.setState(state => ({ collapsed: !state.collapsed }));
  }

  render() {
    const {content, isMarkdown} = this.props;

    if (!content) {
      return null;
    }

    const className = `collapse ${this.state.collapsed?"":"in"}`;
    return (
      <span className="field-text collapsible">
        <span className={className}>
          <Text content={content} isMarkdown={isMarkdown} />
        </span>
        {this.state.collapsed && (
          <button onClick={this.handleClick}>more...</button>
        )}
      </span>
    );
  }
}

export default CollapsibleText;