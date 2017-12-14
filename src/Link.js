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
    const onClick = (e) => { 
      Router.go(realTo);
      e.preventDefault();
      e.stopPropagation(); 
    };
    return(
      <a href={realTo} 
        className={this.props.className}
        role={this.props.role}
        style={this.props.style||{}}
        onClick={onClick}
      >{this.props.children||this.props.text}</a>
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
  style:PropTypes.object
};
