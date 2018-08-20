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
import { ResetFilters } from "searchkit";
import { SearchkitComponent, RefinementListFilter, InputFilter, CheckboxFilter, RangeFilter } from "searchkit";
import { DateRangeFilter, DateRangeCalendar } from "searchkit-datefilter";
import { store } from "../../../../store";
import "./styles.css";

const Facet = ({id, name, facet}) => {
  if (facet.filterType === "list") {
    const orderKey = facet.filterOrder && facet.filterOrder === "byvalue"? "_term": "_count";
    const operator = facet.exclusiveSelection === false?"OR":"AND";
    const orderDirection = orderKey === "_term"? "asc": "desc";
    if (facet.isChild) {
      return (
        <RefinementListFilter
          id={id}
          field={name+".value.keyword"}
          title={facet.fieldLabel}
          operator={operator}
          size={10}
          orderKey={orderKey}
          orderDirection={orderDirection}
          fieldOptions={{type:"nested", options:{path:facet.path}}} />
      );
    }
    return (
      <RefinementListFilter
        id={id}
        field={name+".value.keyword"}
        title={facet.fieldLabel}
        operator={operator}
        size={10}
        orderKey={orderKey}
        orderDirection={orderDirection}/>
    );
  }
  if (facet.filterType === "input") {
    return (
      <InputFilter
        id={id}
        title={facet.fieldLabel}
        placeholder={"Search "+facet.fieldLabel}
        searchOnChange={true}
        queryFields={[name+".value.keyword"]} />
    );
  }
  if (facet.filterType === "exists"){
    return (
      <CheckboxFilter
        id={id}
        title={facet.fieldLabel}
        label={"Has "+facet.fieldLabel.toLowerCase()}
        filter={{exists:{field:name+".value.keyword"}}} />
    );
  }
  if(facet.filterType === "range"){
    if(facet.fieldType === "date") {
      return (
        <DateRangeFilter
          id={id}
          fromDateField={name+".value"}
          toDateField={name+".value"}
          calendarComponent={DateRangeCalendar}
          title={facet.fieldLabel} />
      );
    }
    return (
      <RangeFilter
        id={id}
        field={name+".value"}
        min={0}
        max={200}
        showHistogram={true}
        title={facet.fieldLabel} />
    );
  }
  return null;
};

const FiltersPanelComponent = ({isVisible, facets}) => {
  return (
    <div className={`kgs-filters ${!isVisible?"is-hidden":""}`}>
      <div className="kgs-filters__header">
        <div className="kgs-filters__title">Filters</div>
        <div className="kgs-filters__reset"><ResetFilters options={{query:false, filter:true, pagination:true}} translations={{"reset.clear_all":"Reset"}}/></div>
      </div>
      <span>
        {facets.map(f => (
          <div className={f.isVisible?null:"hidden"} key={f.id}>
            <Facet id={f.id} name={f.name} facet={f.facet} />
          </div>
        ))}
      </span>
    </div>
  );
};

export class FiltersPanel extends SearchkitComponent {
  constructor(props) {
    super(props);
    this.state = this.getState();
  }
  getState() {
    const globalState = store.getState();
    const facetFields = globalState.definition.facetFields;
    const facets = [];
    const selectedType = this.searchkit && this.searchkit.state && this.searchkit.state.facet_type && this.searchkit.state.facet_type.length > 0 ? this.searchkit.state.facet_type[0]: "";
    Object.entries(facetFields).forEach(([type, typedFacets]) => {
      const isMatchingSelectedType = selectedType === type;
      Object.entries(typedFacets).forEach(([name, facet])=>{
        facets.push({
          id: "facet_" + type + "_" + name,
          name: name,
          facet: facet,
          isVisible: isMatchingSelectedType
        });
      });
    });
    const isVisible = facets.some(f => f.isVisible);
    return {
      type: selectedType,
      show: globalState.definition.isReady && facets.length > 0,
      isVisible: isVisible,
      facets: facets
    };
  }
  handleStateChange() {
    setTimeout(() => {
      const nextState = this.getState();
      this.setState(nextState);
    });
  }
  shouldComponentUpdate(nextProps, nextState) {
    // facets are only inpacted when type change
    return nextState.type !== this.state.type || nextState.show !== this.state.show || nextState.isVisible !== this.state.isVisible;
  }
  componentDidMount() {
    document.addEventListener("state", this.handleStateChange.bind(this), false);
    this.handleStateChange();
  }
  componentWillUnmount() {
    document.removeEventListener("state", this.handleStateChange);
  }
  render() {
    if (!this.state.show) {
      return null;
    }
    return (
      <FiltersPanelComponent isVisible={this.state.isVisible} facets={this.state.facets} />
    );
  }
}