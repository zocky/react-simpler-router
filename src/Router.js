
export const Router = {
  /**
   * The current url (i.e. pathname) that the Router 
   * is aware of.
   */
  get url() {
    return window.history.state.path;
  },
  /**
   * Go to a new url, push state
   * 
   * @param {String} to - The path to go to 
   */
  go(to) {
    if (routerBusy) {
      console.warn('Router.go called during update. Ignored.');
      return;
    }
    to = cleanPath(to);
    if (to===this.url) return;
    window.history.pushState({path:to},null,to);
    urlChanged();
  },
  /**
   * Redirect to a new url, replace state
   * 
   * @param {String} to - The path to go to 
   */
  redirect(to) {
    if (routerBusy) {
      console.warn('Router.redirect called during update. Ignored.');
      return;
    }
    to = cleanPath(to);
    if (to===this.url) return;
    window.history.replaceState({path:to},null,to);
    urlChanged();
  },
  /**
   * Register a route component. 
   * Components should register on componentWillMount 
   * TODO:check if this is correct advice
   * @param {*} component - The route component that is registering
   * @param {*} path      - The route path, accepts :paramName parts
   * @param {*} exact     - Should the route accept only exact urls, i.e. no child urls
   */
  registerRoute(component,path,exact){
    routerRegistry.set(component,{path, parser: routeParser(path), exact:!!exact});
    checkComponent(component);
  },
  /**
   * Register a link component. 
   * Components should register on componentWillMount. 
   * TODO:check if this is correct advice
   * @param {*} component - The link component that is registering
   * @param {*} url       - The link url
   * @param {*} exact     - Should the link be active only on exact urls, i.e. no child urls
   */
  registerLink(component, url, exact) {
    routerRegistry.set(component, { url, parser: linkParser(url), exact:!!exact });
    checkComponent(component);
  },
  /**
   * Unregister a registered component.
   * Components should unregister on componentWillUnmount 
   */
  unregister(obj) {
    routerRegistry.delete(obj);
  }
};

const cleanPath = (path) => {
  return path.replace(/\/+/g,'/').replace(/(.)\/$/,'$1');
};

/**
 * Cache any function that takes a string
 * @param {function(String)} fn
 */
const cacheStringFn = (fn)=> {
  const cache = {};
  return (str) => {
    if(!cache[str]) {
      cache[str]=fn(str);
    }
    return cache[str];
  };
};

/**
 * Convert a route path to a parser 
 * that can parse exact and inexact paths
 * @param {String} path - Route path 
 */
const routeParser = cacheStringFn((path) => {
  var reExact, reInexact, keys = [];
  path = cleanPath(path);
  if ( path==='') {
    reExact=/^[/]?$/;
    reInexact = /^/;
  } else {
    const src = path.split(/:(\w+)?/).map((p, i, a) => {
      if (!(i % 2)) return p.replace(/(\W)/g, '\\$1');
      keys.push(p);
      return '([^\\/]+)';
    }).join('');
    reExact = new RegExp('^(' + src + ')/?$');
    reInexact = new RegExp('^(' + src + ')(/|$)');
  }
  return (url,exact) => {
    const m = (exact ? reExact : reInexact).exec(url);
    if (!m) return { active:false, params:null, url:null };
    const params = {};
    keys.forEach((k, i) => { params[k] = m[i + 2]; });
    return { active:true, params, url:m[1] };
  };
});
/**
 * is the router currently updating?
 */
var routerBusy = false;


/**
 * Convert a link path to a parser 
 * that can parse exact and inexact paths
 * @param {String} path - Link path 
 */

const linkParser = cacheStringFn((path) => {
  var reExact, reInexact;
  path = cleanPath(path);
  if (path === '') {
    reExact = /^[/]?$/;
    reInexact = /^/;
  } else {
    const src = path.replace(/(\W)/g,'\\$1');
    reExact = new RegExp('^' + src + '/?$');
    reInexact = new RegExp('^' + src + '(/|$)');
  }
  return (url, exact) => {
    const m = (exact ? reExact : reInexact).exec(url);
    return {active:!!m};
  };
});

/**
 * Check if a registered component matches the
 * current path and call its onRouter method
 * with the result.
 * 
 * Registered routes will be called with {active,url,params}
 * Registered links will be called with {active}
 * 
 * @param {React.Component} component 
 */
const checkComponent = (component) => {
  var reg = routerRegistry.get(component);
  var res = reg.parser(Router.url, reg.exact);
  component.onRouter(res);
};

/**
 * Handle URL change, checking all registered components
 */
const urlChanged = () => {
  if (routerBusy) throw 'Router busy. This should never happen.';
  routerBusy = true;
  var reg = Array.from(routerRegistry.keys());
  for (var obj of reg) {
    checkComponent(obj);
  }
  routerBusy = false;
};

/**
 * A Map of registered components
 */
const routerRegistry = new Map();

var routerListening = null;
/**
 * Listen for popstate events, to handle user clicks
 * on back/forward in the browser
 * @param {Event} e 
 */
const routerListener = (e)=>{
  urlChanged();
};
/**
 * Activate router listener and set up
 * the current url
 */
const routerListen = () => {
  if(routerListening) return;
  routerListening = true;
  // This should be the only time that the url is decoded
  // because it's retrieved from window.location
  const path = cleanPath(window.location.pathname).split('/').map(decodeURIComponent).join('/');
  window.history.replaceState({path},null,path);
  urlChanged();
  window.addEventListener('popstate', routerListener);
};
/**
 * De-activate router listener
 * Do we need this? If so, it should be exposed, along with listen
 */
const routerUnlisten = () => {
  if(!routerListening) return;
  window.removeEventListener('popstate', routerListener);
  routerListening = true;
};


routerListen();

export default Router;