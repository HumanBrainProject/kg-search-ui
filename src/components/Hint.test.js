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
import renderer from "react-test-renderer";
import Enzyme, { render } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import Hint from "./Hint";

Enzyme.configure({ adapter: new Adapter() });

test('Hint component renders initially', () => {
    const component = renderer.create(
        <Hint className="test" show={true} value="some text" />
    );
  
    expect(component.toJSON()).toMatchSnapshot();
});

test('Hint test show false"', () => {
    const component = renderer.create(
        <Hint className="test" show={false} value="some text" />
    );
    expect(component.toJSON()).toBe(null);
});
  
test('Hint test value', () => {
    const component = render(
        <Hint className="test" show={true} value="some text" />
    );
    expect(component.find("span").text()).toEqual('some text');
});