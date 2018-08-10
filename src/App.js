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

import React, { Component } from "react";
import { store, dispatch } from "./store";
import * as actionTypes from "./actions.types";
import * as actions from "./actions";
import { isMobile, isFirefox, tabAblesSelectors } from "./Helpers/BrowserHelpers";
import { SearchkitManager } from "searchkit";
import { SearchKitHelpers } from "./Helpers/SearchKitHelpers";
import { MasterView } from "./components/MasterView";
import { DetailViewManager } from "./components/DetailViewManager";
import { FetchingPanel } from "./components/FetchingPanel";
import { ErrorPanel } from "./components/ErrorPanel";
import { generateKey} from "./Helpers/OIDCHelpers";

const LOADING_TIMER = 200;

class App extends Component {
  constructor(props) {
    super(props);
    this.state = store.getState();
    this.componentContext = {
      appStarted: false,
      accessToken: null,
      nonce: null,
      initialUrlQueryChecked: false,
      initialHitReference: null,
      hitIssuer: null,
      index: null,
      isEventFiredByBrowserNav: false,
      isEventFiredByAppNav: false,
      tabAbles: []
    };

    const { config } = props;

    const searchKitUrl = config.searchApiHost + "/proxy/kg"; //+ '/api/smartproxy/kg';
    this.searchkit = new SearchkitManager(searchKitUrl, {
      multipleSearchers:false,
      timeout: 10000,
      searchOnLoad: false // keep this to false, initialization takes care of it
    });

 
 
    const header = this.searchkit.transport.axios.defaults.headers.post;
    const componentContext = this.componentContext;
    const onBeforeSearchRequest = () => {
      componentContext.nonce = generateKey();
      header.nonce = componentContext.nonce;
      if (componentContext.accessToken) {
        header.Authorization = "Bearer " + componentContext.accessToken;
        const state = store.getState();
        if (state.search.index != null) {
          header["index-hint"] = state.search.index;
        } else {
          delete header["index-hint"];
        }
      }
      dispatch(actions.loadSearchRequest());
    };
    const onSearchResult = results => {
      //window.console.log("result " + new Date().getTime());
      dispatch(actions.loadSearchResult(results));
    };

    this.searchkit.addResultsListener(onSearchResult);
    const queryProcessorFunction = SearchKitHelpers.getQueryProcessor(this.searchkit, config.queryTweaking, onBeforeSearchRequest);   
    this.searchkit.setQueryProcessor(queryProcessorFunction);

    this.loadConfig = this.loadConfig.bind(this);
    this.loadIndexes = this.loadIndexes.bind(this);
    this.setIndex = this.setIndex.bind(this);
    this.performUserAction = this.performUserAction.bind(this);
    this.onSearchError = this.onSearchError.bind(this);
  }
  loadConfig() {
    const state = store.getState();
    if (!state.configuration.isConfigReady && !state.configuration.isConfigLoading) {
      const {searchApiHost} = this.props.config;
      dispatch(actions.loadConfig({
        accessToken: this.componentContext.accessToken,
        host: searchApiHost
      }));
    }
  }
  loadIndexes() {
    const state = store.getState();
    if (this.componentContext.accessToken && !state.configuration.isIndexesReady && !state.configuration.isIndexesLoading) {
      dispatch(actions.loadIndexes());
    }
  }

  setIndex(newIndex) {
    //window.console.log("new index: " + newIndex);
    dispatch(actions.setIndex(newIndex));
  }
  performUserAction(action) {
    switch (action) {
    case actionTypes.LOAD_CONFIG:
      this.loadConfig();
      break;
    case actionTypes.LOAD_INDEXES:
      this.loadIndexes();
      break;
    case actionTypes.LOAD_SEARCH:
      this.searchkit.reloadSearch();
      break;
    case actionTypes.CANCEL_SEARCH:
      dispatch(actions.cancelSearch());
      break;
    case actionTypes.LOAD_HIT: {
      const state = store.getState();
      if (state.hits.nextHitReference) {
        dispatch(actions.loadHit(state.hits.nextHitReference, state.search.index));
      }
      break;
    }
    case actionTypes.CANCEL_HIT_LOADING:
      dispatch(actions.cancelHitLoading());
      break;
    case actionTypes.AUTHENTICATE:
      window.location.href = this.getOidcUrl();
      break;
    default:
      window.console.log("unkown user action '" + action + "'");
      break;
    }
  }
  onSearchError(status, nonce) {
    if (nonce && this.componentContext.nonce && nonce === this.componentContext.nonce) {
      this.componentContext.nonce = null;
      switch (status) {
      case 401: // Unauthorized
      case 403: // Forbidden
      case 511: // Network Authentication Required
        dispatch(actions.loadSearchSessionFailure(status));
        break;
      default: {
        const state = store.getState();
        dispatch(actions.loadSearchServiceFailure(status, state.search.index));
      }
      }
    }
  }
  setCurrentHitFromBrowserLocation() {
    if (this.componentContext.appStarted) {
      dispatch(actions.setCurrentHitFromBrowserLocation());
    }
  }
  catchBrowserNavigationChange() {
    if (this.componentContext.isEventFiredByAppNav) {
      this.componentContext.isEventFiredByAppNav = false;
    } else {
      //window.console.log(new Date().toLocaleTimeString() + ": nav change");
      this.componentContext.isEventFiredByBrowserNav = true;
      this.setCurrentHitFromBrowserLocation();
    }
  }
  applyStateChange() {
    const nextState = store.getState();

    // Perform app initialization steps
    if (!this.componentContext.appStarted) {

      // check initial hit reference in url
      if (!this.componentContext.initialUrlQueryChecked) {
        this.componentContext.initialUrlQueryChecked = true;
        const m = window.location.href.match(/(.*)#(.*)$/);
        if (m && m.length === 3) {
          if (m[2].indexOf("access_token=") !== -1) {
            const m2 = m[2].match(/^access_token=([^&]+)&.*$/);
            if (m2 && m2.length === 2) {
              this.componentContext.accessToken = m2[1];
            }
          } else {
            this.componentContext.initialHitReference = m[2];
          }
          const historyState = window.history.state;
          window.history.replaceState(historyState, "Knowledge Graph Search", m[1]);
        }
      }
      if (!nextState.configuration.isConfigReady) {

        // load config
        if (!nextState.fetching.active && !nextState.error.message) {
          this.loadConfig();
        }

      } else if (this.componentContext.accessToken && !nextState.configuration.isIndexesReady) {

        if (!nextState.fetching.active && !nextState.error.message) {
          this.loadIndexes();
        }

      }
      if(nextState.configuration.isConfigReady && nextState.configuration.isIndexesReady) {
        this.componentContext.appStarted = true;

        // Initialize the search
        if (this.props.config.searchOnLoad){
          //We force this searchkit option so the initial search is made with URL parameters
          this.searchkit.options.searchOnLoad = true;
          if (this.componentContext.accessToken) {
            this.searchkit.runInitialSearch();
          }
        }
      }

    // Load initial hit if set
    } else if (this.componentContext.initialHitReference) {

      dispatch(actions.loadHit(this.componentContext.initialHitReference, nextState.search.index));
      this.componentContext.initialHitReference = null;

    } else {

      //window.console.log("new index: " + nextState.search.index + ", old index: " + this.state.search.index);
      if (nextState.search.index !== this.state.search.index && nextState.search.index !== this.componentContext.index) {
        this.componentContext.index = nextState.search.index;
        this.searchkit.reloadSearch();
      }

      //Remove the ability to scroll the body when the modal is open
      if (!nextState.hits.currentHit) {
        document.documentElement.style.overflow = "";
        document.body.style.overflow = "";
      } else {
        document.documentElement.style.overflow = "hidden";
        document.body.style.overflow = "hidden";
      }

      // store detail view laucher button in order to set back focus to it when detail popup close
      if (nextState.hits.currentHit && !this.state.hits.currentHit) {
        this.componentContext.hitIssuer = nextState.hits.currentHit;
      }

      // check history todos
      const pauseSearchkitHistoryListening = nextState.hits.currentHit && !this.state.hits.currentHit;
      const resumeSearchkitHistoryListening = !nextState.hits.currentHit && this.state.hits.currentHit;
      const pushHistoryState = (nextState.hits.currentHit && !this.state.hits.currentHit) 
        || nextState.hits.previousHits.length > this.state.hits.previousHits.length;
      const backHistoryCounts = ((componentContext, currentState, nextState) => {
        if (componentContext.isEventFiredByBrowserNav) {
          componentContext.isEventFiredByBrowserNav = false;
          return 0;
        }
        let backs = currentState.hits.previousHits.length - nextState.hits.previousHits.length;
        if (backs < 0) {
          backs = 0;
        }
        if (currentState.hits.currentHit && !nextState.hits.currentHit) {
          backs++;
        }
        return backs<0?0:backs;
      })(this.componentContext, this.state, nextState);

      // apply history todos
      if (pauseSearchkitHistoryListening) {
        this.searchkit.unlistenHistory();
      }
      if (pushHistoryState) {
        //window.console.log(new Date().toLocaleTimeString() + ": new history");
        const historyState = window.history.state;
        window.history.pushState(historyState, "Knowledge Graph Search", window.location.href.replace(/#.*$/,"") + "#" + nextState.hits.currentHit._type + "/" + nextState.hits.currentHit._id);
      }
      if (backHistoryCounts) {
        //window.console.log(new Date().toLocaleTimeString() + ": back history: " + backHistoryCounts);
        this.componentContext.isEventFiredByAppNav = true;
        [...Array(backHistoryCounts)].forEach(() => window.history.back());
      }
      if (resumeSearchkitHistoryListening) {
        setTimeout(() => this.searchkit.listenToHistory(),0);
      }
    }

    // delay apply state to display loading panels longer
    const withDelay = ((nextState.configuration.isConfigReady && !this.state.configuration.isConfigReady)
      || (!nextState.fetching.active && this.state.fetching.active));

    setTimeout(() => {
      this.setState(nextState);
    }, withDelay?LOADING_TIMER:0);

  }
  componentDidMount() {
    if (!isMobile) {
      if (isFirefox) {
        document.body.setAttribute("isFirefox", true);
      }
      const rootNode = document.body.querySelector(".kgs-app");
      this.componentContext.tabAbles = Object.values(document.body.querySelectorAll(tabAblesSelectors.join(",")))
        .filter(e => !rootNode.contains(e))
        .map(node => ({node: node, tabIndex: node.tabIndex}));
    }
    window.addEventListener("hashchange", this.catchBrowserNavigationChange.bind(this), false);
    document.addEventListener("state", this.applyStateChange.bind(this), false);
    this.applyStateChange();
  }
  componentWillUnmount() {
    window.removeEventListener("hashchange", this.catchBrowserNavigationChange);
    document.removeEventListener("state", this.applyStateChange);
  }
  componentDidUpdate(prevProps, prevState) {
    //window.console.log(new Date().toLocaleTimeString() + ": app update");
    if (!isMobile) {
      if (!this.state.hits.currentHit && prevState.hits.currentHit) {
        //window.console.log(new Date().toLocaleTimeString() + ": app enable tabs=" + this.componentContext.tabAbles.length);
        this.componentContext.tabAbles.forEach(e => {
          if (e.tabIndex >= 0) {
            e.node.setAttribute("tabIndex", e.tabIndex);
          } else {
            e.node.removeAttribute("tabIndex");
          }
        });
      } else if (this.state.hits.currentHit && !prevState.hits.currentHit) {
        //window.console.log(new Date().toLocaleTimeString() + ": app disable tabs=" + this.componentContext.tabAbles.length);
        this.componentContext.tabAbles.forEach(e => e.node.setAttribute("tabIndex", -1));
      }
    }

    // on detail popup close put back focus to issuer
    if (!this.state.hits.currentHit && prevState.hits.currentHit && this.componentContext.hitIssuer) {
      const hitIssuer = document.body.querySelector("button[data-type=\"" + this.componentContext.hitIssuer._type + "\"][data-id=\"" + this.componentContext.hitIssuer._id +"\"]");
      if (hitIssuer) {
        hitIssuer.focus();
      }
    }
  }
  render() {
    const { config } = this.props;

    return (
      <div className="kgs-app" data-showDetail={!!this.state.hits.currentHit}>
        {this.state.configuration.isConfigReady && (
          <span>
            <MasterView isActive={!this.state.hits.currentHit} hitCount={(this.state.search.results && this.state.search.results.hits && this.state.search.results.hits.total)?this.state.search.results.hits.total:-1} hitsPerPage={config.hitsPerPage} searchThrottleTime={config.searchThrottleTime} queryFields={this.state.configuration.queryFields} currentIndex={this.state.search.index} indexes={this.state.configuration.indexes} onIndexChange={this.setIndex} searchkit={this.searchkit} onSearchError={this.onSearchError} config={this.props.config} />
            <DetailViewManager />
          </span>)
        }
        <FetchingPanel show={!!this.state.fetching.active} message={this.state.fetching.message} />
        <ErrorPanel show={!!this.state.error.message} message={this.state.error.message} retryLabel={this.state.error.retry && this.state.error.retry.label} onRetry={() => this.performUserAction(this.state.error.retry && this.state.error.retry.action)}  cancelLabel={this.state.error.cancel && this.state.error.cancel.label} onCancel={() => this.performUserAction(this.state.error.cancel && this.state.error.cancel.action)} />
      </div>
    );
  }
}

export default App;