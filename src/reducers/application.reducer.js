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

import * as types from "../actions.types";

const TermsShortNoticeLocalStorageKey = "hbp.kgs-terms-conditions-consent";

const initialState = {
  isReady: false,
  info: null,
  showTermsShortNotice: typeof Storage === "undefined" || localStorage.getItem(TermsShortNoticeLocalStorageKey) !== "true",
  gridLayoutMode: true
};

const setApplicationReady = (state, action) => {
  return Object.assign({}, state, {
    isReady: action.isReady
  });
};

const agreeTermsShortNotice = state => {
  if (typeof(Storage) !== "undefined") {
    localStorage.setItem(TermsShortNoticeLocalStorageKey, true);
  }
  setTimeout(() => window.dispatchEvent(new Event("resize")), 250);
  return Object.assign({}, state, {
    showTermsShortNotice: false
  });
};

const setLayoutMode = (state, action) => {
  return Object.assign({}, state, {
    gridLayoutMode: action.gridLayoutMode
  });
};

const setInfo = (state, action) => {
  return Object.assign({}, state, {
    info: action.text
  });
};

export function reducer(state = initialState, action = {}) {
  switch (action.type) {
  case types.SET_APPLICATION_READY:
    return setApplicationReady(state, action);
  case types.AGREE_TERMS_SHORT_NOTICE:
    return agreeTermsShortNotice(state, action);
  case types.SET_LAYOUT_MODE:
    return setLayoutMode(state, action);
  case types.SET_INFO:
    return setInfo(state, action);
  case types.LOAD_SEARCH_REQUEST:
  case types.LOAD_HIT_REQUEST:
  case types.CANCEL_HIT_LOADING:
  case types.SET_HIT:
  case types.SET_PREVIOUS_HIT:
  case types.CLEAR_ALL_HITS:
  case types.SET_CURRENT_HIT_FROM_BROWSER_LOCATION:
  default:
    return state;
  }
}