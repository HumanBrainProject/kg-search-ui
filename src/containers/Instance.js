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
import { connect } from "react-redux";

import * as actions from "../actions";
import { history } from "../store";
import { ImagePreviews } from "./ImagePreviews";
import { ImagePopup } from "./ImagePopup";
import { TermsShortNotice } from "./TermsShortNotice";
import { mapStateToProps } from "../helpers/InstanceHelper";
import { InstanceContainer } from "./InstanceContainer";

export const Instance = connect(
  (state, props) => {
    const instanceProps = state.instances.currentInstance?
      {
        ...mapStateToProps(state, {
          data: state.instances.currentInstance
        }),
        path: "/instances/",
        defaultGroup: state.groups.defaultGroup,
        ImagePreviewsComponent: ImagePreviews,
        ImagePopupComponent: ImagePopup,
        TermsShortNoticeComponent: TermsShortNotice
      }
      :
      null;
    return {
      instanceProps: instanceProps,
      showInstance: state.instances.currentInstance && !state.instances.isLoading,
      definitionIsReady: state.definition.isReady,
      definitionIsLoading: state.definition.isLoading,
      isGroupsReady: state.groups.isReady,
      isGroupLoading: state.groups.isLoading,
      shouldLoadGroups: !!state.auth.accessToken,
      instanceIsLoading: state.instances.isLoading,
      shouldLoadInstance: !state.instances.currentInstance || state.instances.currentInstance._type !==  props.match.params.type || state.instances.currentInstance._id !==  props.match.params.id,
      instanceError: state.instances.error,
      currentInstance: state.instances.currentInstance,
      previousInstance: state.instances.previousInstances.length?state.instances.previousInstances[state.instances.previousInstances.length-1]:null,
      group: state.groups.group,
      defaultGroup: state.groups.defaultGroup,
      id: props.match.params.id,
      type: props.match.params.type,
      location: state.router.location
    };
  },
  dispatch => ({
    setInitialGroup: group => dispatch(actions.setInitialGroup(group)),
    loadDefinition: () => dispatch(actions.loadDefinition()),
    loadGroups: () => dispatch(actions.loadGroups()),
    fetch: (type, id) => dispatch(actions.loadInstance(type, id)),
    setPreviousInstance: () => dispatch(actions.setPreviousInstance())
  })
)(InstanceContainer);