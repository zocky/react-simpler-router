import React from 'react';
import PropTypes from 'prop-types';
import { Router } from './Router';

export class Route extends React.Component {
  constructor(props,context) {
    super(props,context);
    this.state = {params:null,url:null};
    this.onRouter = ({params,url}) => {
      if (this.state.url!==url) {
        this.setState({params,url});
      }
    };
  }
  realPath(props,context) {
    const {route} = context;
    const {path,merge} = props;
    var res = path;
    if (route && route.path && !path.startsWith('/')) {
      if (merge) res = route.path + '/' + path;
      else res = route.url+'/'+path;
    }
    return res;
  }
  getChildContext() {
    return {
      route: {
        url: this.state.url,
        params: this.state.params,
        path: this.realPath(this.props,this.context),
      }
    };
  }
  componentWillMount() {
    this.setupRoute(this.props,this.context);
  }
  componentWillReceiveProps(props,context) {
    this.setupRoute(props,context);
  }
  setupRoute(props,context) {
    Router.unregister(this);
    Router.registerRoute(this, this.realPath(props,context), props.exact);
  }
  componentWillUnmount() {
    Router.unregister(this);
  }
  render() {

    const {merge,path,children,render,component} = this.props;
    const {url,params} = this.state;
    if (!url) return null;
    if (render) {
      if (children) {
        console.warn('Route '+path+' contains both prop render and children content. Children will be ignored.');
      }
      if (component) {
        console.warn('Route '+path+' contains both prop render and prop component. Prop component will be ignored.');
      }
      return <ErrorBoundary>{this.props.render(params)}</ErrorBoundary>;
    }
    if (component) {
      if (children) {
        console.warn('Route '+path+' contains both prop component and children content. Children will be ignored.');
      }
      return <ErrorBoundary>{React.createElement(component,this.state.params)}</ErrorBoundary>;
    }
    if (!children ) return null;
    const nodes = React.Children.toArray(children);
    return <ErrorBoundary>{nodes.map( child=>{
        if (typeof child.type!='function') return child;
        return React.cloneElement(child,this.state.params);
      }
    )}</ErrorBoundary>;
  }
}

Route.propTypes = {
  path:PropTypes.string.isRequired,
  exact:PropTypes.bool,
  merge:PropTypes.bool,
  render:PropTypes.func,
  component:PropTypes.func,
  children:PropTypes.node
};

Route.contextTypes = {
  route: PropTypes.shape({
    path: PropTypes.string,
    url: PropTypes.string,
    params: PropTypes.object,    
  })
};

Route.childContextTypes = {
  route: PropTypes.object.isRequired
};

export function IndexRoute(props) {
  var passProps = Object.assign({},props);
  delete passProps.exact;
  delete passProps.path;
  return <Route exact path="" {...passProps}>{props.children}</Route>;
}
IndexRoute.propTypes = {
  children:PropTypes.node
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }
  
  componentDidCatch(error, errorInfo) {
    // Catch errors in any components below and re-render with error message
    this.setState({
      error: error,
      errorInfo: errorInfo
    })
    // You can also log error messages to an error reporting service here
  }
  
  render() {
    if (this.state.errorInfo) {
      // Error path
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      );
    }
    // Normally, just render children
    return this.props.children;
  }  
}