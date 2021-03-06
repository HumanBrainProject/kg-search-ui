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

import * as actionsDefinition from "../actions/actions.definition";
import * as actionsSearch from "../actions/actions.search";
import { reducer as searchReducer} from "./search.reducer";
describe('search reducer', () => {
    describe('unknown action', () => {
        it('should return same state', () => {
            const state = {a: {c: 1, d: 2}, b: [{e:3}, {e:4}]};
            const action = {type: "ABCDEFGH"};
            const newState = searchReducer(state, action);
            expect(JSON.stringify(newState)).toBe(JSON.stringify(state));
        });
    });
    describe('setup search', () => {
        it('should set current definition', () => {
            const state = undefined;
            const definition = {};
            const action = actionsDefinition.loadDefinitionSuccess(definition);
            const newState = searchReducer(state, action);
            expect(newState.queryFields.length).toBe(0);
        });
    });
    describe('load search result', () => {
        it('should set results', () => {
            const state = undefined;
            const hits = [2123, 1212, 23423];
            const results = {
                hits: {
                    hits: hits
                }
            };
            const action = actionsSearch.loadSearchResult(results);
            const newState = searchReducer(state, action);
            expect(newState.hits).toBe(hits);
        });
    });
});