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
import { connect } from "react-redux";
import { getPreviews } from "../../helpers/InstanceHelper";
import { PrintViewField } from "../../components/Field";
import { HitRibbon } from "./HitRibbon";
import { HighlightsField } from "./HighlightsField";
import { formatHitForHighlight } from "../../helpers/HitFormattingHelpers";
import "./Hit.css";

export const HitBase = ({ type, hasNoData, hasUnknownData, ribbon, fields, preview, highlightsField }) => (
  <div className="kgs-hit" data-type={type}>
    <HitRibbon className="kgs-hit__ribbon" {...ribbon} />
    <div className={`kgs-hit__body ${preview? "has-preview":""}`}>
      <div className="kgs-hit__content">
        {insertSearchHightLights(fields, highlightsField)}
      </div>
      {!!preview &&
        <div className="kgs-hit__preview">
          <img src={preview} alt={preview}/>
        </div>
      }
    </div>
    {hasNoData && (
      <div className="kgs-hit__no-data">This data is currently not available.</div>
    )}
    {hasUnknownData && (
      <div className="kgs-hit__no-data">This type of data is currently not supported.</div>
    )}
  </div>
);

const insertSearchHightLights = (fields, highlightsField) => {
  // Removing the project field in the card if there is a Search hit on the project
  const hasProjectHit = highlightsField && highlightsField["fields"] && highlightsField["fields"] instanceof Object && Object.keys(highlightsField["fields"]).includes("component.value");
  const fieldsComponents = fields.filter(({ name }) => !hasProjectHit || name !== "component").map(({ name, data, mapping, group }) =>
    <PrintViewField key={name} name={name} data={data} mapping={mapping} group={group} />
  );
  fieldsComponents.splice(1, 0, <HighlightsField key="highlights" {...highlightsField}></HighlightsField>);
  return fieldsComponents;
};

const markdownEscapedChars = {
  "&#x2F;": "\\",
  "&#x60;": "`",
  "&#x2a;": "*",
  "&#x5f;": "_",
  "&#x7b;": "{",
  "&#x7d;": "}",
  "&#x5b;": "[",
  "&#x5d;": "]",
  "&#x28;": "(",
  "&#x29;": ")",
  "&#x23;": "#",
  "&#x2b;": "+",
  "&#x2d;": "-",
  "&#x2e;": ".",
  "&#x21;": "!"
};

const replaceMarkdownEscapedChars = (str) => {
  Object.entries(markdownEscapedChars).forEach(([key, val]) => {
    str = str.replace(new RegExp(key, "g"), val);
  });
  return formatHitForHighlight(str);
};

const getTitleField = (group, data, highlight, mapping) => {
  let fieldData = data;
  if (highlight && highlight["title.value"] && highlight["title.value"].length > 0) {
    const value = replaceMarkdownEscapedChars(highlight["title.value"][0]);
    fieldData = {
      ...data,
      value: value
    };
  }

  return {
    name: "title",
    data: fieldData,
    mapping: mapping,
    group: group
  };
};

const getDescriptionField = (group, data, highlight, mapping) => {

  const fieldMapping = mapping && {
    ...mapping,
    collapsible: false
  };

  let fieldData = data;

  const value = data && data.value;
  let modifiedValue = value;

  if (highlight && highlight["description.value"] && highlight["description.value"].length > 0) {
    modifiedValue = replaceMarkdownEscapedChars(highlight["description.value"][0]);
    modifiedValue += "...";
  } else if (value && value.length > 220) {
    modifiedValue = value.substring(0, 217) + "...";
  }

  if (modifiedValue !== value) {
    fieldData = {
      ...data,
      value: modifiedValue
    };
  }

  return {
    name: "description",
    data: fieldData,
    mapping: fieldMapping,
    group: group
  };
};

const getComponentField = (group, data, mapping) => {
  let fieldData = data;
  let fieldMapping = mapping;
  if (data && data.value) {
    fieldData = {
      ...data, // assuming value children are values
      value: "From the " + data.value + " project"
    };

  }
  // remove title
  fieldMapping = mapping && { ...mapping };
  fieldMapping && delete fieldMapping.value; // no deep cloning needed as only first level is modified

  return {
    name: "component",
    data: fieldData,
    mapping: fieldMapping,
    group: group
  };
};

const getField = (group, type, name, data, highlight, mapping) => {
  switch (name) {
  case "title":
    return getTitleField(group, data, highlight, mapping);
  case "description":
    return getDescriptionField(group, data, highlight, mapping);
  case "component":
    return getComponentField(group, data, mapping, highlight);
  default:
    return {
      name: name,
      data: data,
      mapping: mapping,
      group: group
    };
  }
};

const getFields = (group, type, data, highlight, mapping) => {
  if (!data || !mapping) {
    return [];
  }
  const primaryFiels = ["title", "description"];
  const fields = Object.entries(mapping.fields || {})
    .filter(([name, mapping]) =>
      mapping
      && (mapping.overview || primaryFiels.includes(name))
      && (mapping.showIfEmpty || (data && data[name]))
    )
    .map(([name, mapping]) => getField(group, type, name, data[name], highlight, mapping));

  return fields;
};

const filterHighlightFields = (data, excludeFieldNames) => {
  if (!data) {
    return null;
  }
  if (!Array.isArray(excludeFieldNames) || excludeFieldNames.length === 0) {
    return data;
  }
  let hasFields = false;
  const fields = Object.entries(data)
    .filter(([name,]) => {
      return !(excludeFieldNames.includes(name));
    })
    .reduce((result, [name, field]) => {
      hasFields = true;
      result[name] = field;
      return result;
    }, {});
  return hasFields ? fields : null;
};

export const Hit = connect(
  (state, { data }) => {

    const indexReg = /^kg_(.*)$/;
    const source = data && !(data.found === false) && data._type && data._source;
    const mapping = source && state.definition && state.definition.typeMappings && state.definition.typeMappings[data._type];
    const group = (data && !(data.found === false) && indexReg.test(data._index))?data._index.match(indexReg)[1]:state.groups.defaultGroup;

    const getPreview = () => {
      const previews = getPreviews(source, { children: mapping.fields });
      if(previews.length && previews[0].staticImageUrl) {
        return previews[0].staticImageUrl;
      }
      return null;
    };

    // source.allfiles = Array.from(Array(10).keys());
    // mapping.ribbon = {
    //   framed: {
    //     dataField: "allfiles",
    //     aggregation: "count",
    //     suffix: {
    //       singular: "file",
    //       plural: "files"
    //     }
    //   }
    // };

    // source.protocol = [
    //   {
    //     "value": "anesthesia"
    //   },
    //   {
    //     "value": "cortex"
    //   },
    //   {
    //     "value": "electrical stimulation"
    //   },
    //   {
    //     "value": "epidural EEG"
    //   },
    //   {
    //     "value": "perturbational complexity index"
    //   },
    //   {
    //     "value": "wakefulness"
    //   }
    // ];

    // source.methods = [
    //   {
    //     "value": "GAT-1 (DAB) staining"
    //   },
    //   {
    //     "value": "measurement of cellullar/subcellular density"
    //   }
    // ];

    // source.owners = {
    //   "reference": "Contributor/baec0381f1f9af275705aeecf62f691c",
    //   "value": "Evans, Alan C."
    // };

    // source.citation = {
    //   "value": "Alessandro, A., &amp; Storm, J. (2019). <i>PCI-like measure in rodents</i> [Data set]. Human Brain Project Neuroinformatics Platform.  [DOI: 10.25493/S0DM-BK5]\n[DOI: 10.25493/S0DM-BK5]: https://doi.org/10.25493%2FS0DM-BK5"
    // };

    // source.zip = {
    //   url: "https://kg.ebrains.eu/proxy/export?container=https://object.cscs.ch/v1/AUTH_6ebec77683fb472f94d352be92b5a577/hbp-00169?prefix=482/R601/",
    //   detail: "###HBP Knowledge Graph Data Platform Citation Requirements",
    //   value: "download all related data as ZIP"
    // };

    const ribbonData = mapping && mapping.ribbon && mapping.ribbon.framed && mapping.ribbon.framed.dataField && source[mapping.ribbon.framed.dataField];
    return {
      type: data && data._type,
      hasNoData: !source,
      hasUnknownData: !mapping,
      ribbon: getField(group, data && data._type, "ribbon", ribbonData, null, mapping && mapping.ribbon),
      fields: getFields(group, data && data._type, source, data && data.highlight, mapping, false),
      preview: getPreview(),
      highlightsField: {
        fields: filterHighlightFields(data && data.highlight, ["title.value", "description.value"]),
        mapping: mapping
      }
    };
  }
)(HitBase);