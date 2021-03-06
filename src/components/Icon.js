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
import PropTypes from "prop-types";

export const Icon = ({className, title, url, inline}) => {
  if (url) {
    return (
      <img className={className?className:null} src={url} alt={title} width="100%" height="100%" />
    );
  }
  if (inline) {
    return (
      <div className={className?className:null} dangerouslySetInnerHTML={{__html: inline}} width="100%" height="100%" />
    );
  }
  return (
    <i className={`fa fa-tag ${className?className:null}`} />
  );
};

Icon.propTypes = {
  className: PropTypes.string,
  title: PropTypes.string,
  url: PropTypes.string,
  inline: PropTypes.string
};

export default Icon;