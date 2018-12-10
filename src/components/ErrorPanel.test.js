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
import Enzyme, { shallow, render } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
import ErrorPanel from "./ErrorPanel";

Enzyme.configure({ adapter: new Adapter() });

test('ErrorPanel component renders initially', () => {
    const component = renderer.create(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={() => {}} />
    );
  
    expect(component.toJSON()).toMatchSnapshot();
});

test('ErrorPanel test show false"', () => {
    const component = renderer.create(
        <ErrorPanel show={false} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={() => {}} />
    );
    expect(component.toJSON()).toBe(null);
});
  
test('ErrorPanel test message', () => {
    const component = shallow(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={() => {}} />
    );
    expect(component.find("span.kgs-error-message").text()).toEqual('some message');
});

test('ErrorPanel test retry button label', () => {
    const component = shallow(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={() => {}} />
    );
    expect(component.find("button").at(0).text()).toEqual("retry label");
});

test('ErrorPanel test cancel button label', () => {
    const component = shallow(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={() => {}} />
    );
    expect(component.find("button").at(1).text()).toEqual("cancel label");
});

test('ErrorPanel test retry button click', () => {
    const fn = jest.fn();
    const component = shallow(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={fn} />
    );
    component.find('button').at(0).simulate('click');
    expect(fn.mock.calls[0][0]).toBe("retry action");
});

test('ErrorPanel test cancel button click', () => {
    const fn = jest.fn();
    const component = shallow(
        <ErrorPanel show={true} message="some message" retryLabel="retry label" retryAction="retry action" cancelLabel="cancel label" cancelAction="cancel action" onAction={fn} />
    );
    component.find('button').at(1).simulate('click');
    expect(fn.mock.calls[0][0]).toBe("cancel action");
});