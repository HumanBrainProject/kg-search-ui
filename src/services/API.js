const endpoints = {
  "definition": (host) => `${host}/proxy/kg_labels/labels/labels`,
  "indexes": (host) => `${host}/auth/groups`,
  "search": (host) => `${host}/proxy/search/kg`,
  "instance": (host, id) => `${host}/proxy/default/kg/${id}`
};

class API{
  get endpoints(){
    return endpoints;
  }
  fetch(url, options) {
    return fetch(url, options)
      .then(response => {
        if (!response.ok) {
          try {
            const data = response.json();
            return data;
          } catch (e) {
            throw response.statusText;
          }
        }
        return response.json();
      })
      .catch(error => {
        if (Array.isArray(error)) {
          error.forEach(e => window.console.error(e));
        } else {
          window.console.error(error);
        }
        throw error;
      });
  }
}

export default new API();