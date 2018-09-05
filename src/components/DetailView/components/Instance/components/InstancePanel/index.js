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
import { FieldIcon } from "../../../../../Field/components/FieldIcon";
import { Field } from "../../../../../Field";
import "./styles.css";

export function InstancePanel({type, hasNoData, hasUnknownData, icon, fields}) {
  return (
    <div className="kgs-instance" data-type={type}>
      <div className="kgs-instance__content">
        <FieldIcon {...icon} />
        {fields.map(({name, data, mapping}) => (
          <Field key={name} name={name} data={data} mapping={mapping} showSmartContent={true} />
        ))}
      </div>
      {hasNoData && (
        <div className="kgs-instance__no-data">This data is currently not available.</div>
      )}
      {hasUnknownData && (
        <div className="kgs-instance__no-data">This type of data is currently not supported.</div>
      )}
    </div>
  );
}