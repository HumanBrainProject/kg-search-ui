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
import { connect } from "../store";
import { withTabKeyNavigation } from "../helpers/withTabKeyNavigation";
import { SearchkitProvider } from "searchkit";
import { MasterView } from "./MasterView";
import { DetailView } from "./DetailView";

const MasterDetailBase = ({show, manager}) => {
  if (!show) {
    return null;
  }
  if (!manager || !manager.searchkit) {
    window.console.error("application failed to instanciate searchkit");
    return null;
  }
  //window.console.debug("MasterDetail rendering...");
  return (
    <React.Fragment>
      <SearchkitProvider searchkit={manager.searchkit}>
        <MasterView />
      </SearchkitProvider>
      <DetailView/>
    </React.Fragment>
  );
};

const MasterDetailWithTabKeyNavigation = withTabKeyNavigation(
  "isActive",
  null,
  ".kgs-app"
)(MasterDetailBase);

export const MasterDetail = connect(
  (state, props) => ({
    isActive: !state.hits.currentHit,
    manager: props.manager,
    show: state.application.isReady
  })
)(MasterDetailWithTabKeyNavigation);