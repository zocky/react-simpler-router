import React from 'react';
import PropTypes from 'prop-types';
import { Router } from './Router';

export class Link extends React.Component {
  realTo(props,context) {
    const {route} = context;
    const {to} = props;
    if (route && route.url && !to.startsWith('/')) return route.url+'/'+to;
    else return to;
  }
  render() {
    const realTo = this.realTo(this.props,this.context);
    const events = {};
    if (this.props.fast) {
      events.onClick = (e) => { 
        e.preventDefault();
        e.stopPropagation(); 
      };
      events.onMouseDown = (e) => {
        if (e.button===0) Router.go(realTo);
      };
    } else {
      events.onClick = (e) => { 
        Router.go(realTo);
        e.preventDefault();
        e.stopPropagation(); 
      };
    }
    return(
      <a href={realTo} 
        className={this.props.className}
        role={this.props.role}
        style={this.props.style||{}}
        {...events}
        >{this.props.text || this.props.children|| realTo}</a>
    );
  }
}

Link.contextTypes = {
  route: PropTypes.shape({
    url:PropTypes.string,
  })
};

Link.propTypes = {
  to: PropTypes.string.isRequired,
  exact: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  children:PropTypes.node,
  role:PropTypes.string,
  style:PropTypes.object,
  fast:PropTypes.bool
};
