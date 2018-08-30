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

export const generateKey = () => {
  let key = "";
  const chars = "ABCDEF0123456789";
  for (let i=0; i<4; i++) {
    if (key !== "") {
      key += "-";
    }
    for (let j=0; j<5; j++) {
      key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
  }
  return key;
};

export const getAuthUrl = (host, clientId, stateKey, nonceKey) => {
  const redirectUri = `${window.location.protocol}//${window.location.host}${window.location.pathname}`;
  return `${host}?response_type=id_token%20token&client_id=${clientId}&redirect_uri=${escape(redirectUri)}&scope=openid%20profile&state=${stateKey}&nonce=${nonceKey}`;
};