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
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

const config = {
  searchApiHost: "https://kg.humanbrainproject.org",
  searchApiPath: "/search/",
  searchApiConfigIndex: "kg_labels",
  searchApiDataIndex: "kg", 
  hitsPerPage: 20,
  searchOnLoad: true,
  queryTweaking: {
    wildcard: {
      maxNbOfTerms: 2, // -1 = apply on all terms, 0 = do not apply, positive number n = apply on first n terms
      minNbOfChars: 3 // nb of character under which wildcard is not applied
    },
    fuzzySearch: {
      maxNbOfTerms: 3, // -1 = apply on all terms, 0 = do not apply, positive number n = apply on first n terms
      minNbOfChars: 4 // nb of character under which fuzzy search is not applied
    },
    maxNbOfTermsTrigger: 4, // maximum number of terms before tweaking is turned off
  },
  searchThrottleTime: 500 // nb of ms after which a request to elasticsearch will only be invoked
};

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(<App config={config} />, div);
});
