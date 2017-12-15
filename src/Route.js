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
      return this.props.render(params);
    }
    if (component) {
      if (children) {
        console.warn('Route '+path+' contains both prop component and children content. Children will be ignored.');
      }
      return React.createElement(component,this.state.params);
    }
    if (!children ) return null;
    const nodes = React.Children.toArray(children);
    return nodes.map( child=>{
        if (typeof child.type!='function') return child;
        return React.cloneElement(child,this.state.params);
      }
    );
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