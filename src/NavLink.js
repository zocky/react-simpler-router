import React from 'react';
import PropTypes from 'prop-types';
import { Router } from './Router';

export class NavLink extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = { active:false };
    this.onRouter = ({active}) => {
      if(this.state.active!==active) this.setState({ active });
    };
  }

  componentWillMount() {
    this.setup(this.props,this.context);
  }
  componentWillUnmount() {
    Router.unregister(this);
  }
  componentWillReceiveProps(props,context) {
    this.setup(props,context);
  }

  realTo(props,context) {
    const {route} = context;
    const {to} = props;
    if (route && route.url && !to.startsWith('/')) return route.url+'/'+to;
    else return to;
  }

  setup(props,context) {
    Router.registerLink(this, this.realTo(props,context), props.exact);
  }
  render() {
    const realTo = this.realTo(this.props,this.context);
    const onClick = (e) => { 
      Router.go(realTo);
      e.preventDefault();
      e.stopPropagation(); 
    };
    const className = 
      this.state.active 
        ? (this.props.className ? this.props.className + ' ' : '') + this.props.activeClassName 
        : this.props.className;
    return(
      <a href={realTo} 
        data-href={realTo}
        className={className}
        role={this.props.role}
        style={this.props.style}
        onClick={onClick}
      >{this.props.children||this.props.text||realTo}</a>
    );
  }
}

NavLink.contextTypes = {
  route: PropTypes.shape({
    url:PropTypes.string,
  })
};
NavLink.defaultProps = {
  className: '',
  activeClassName: 'active',
  style: {},
};
NavLink.propTypes = {
  to: PropTypes.string.isRequired,
  exact: PropTypes.bool,
  text: PropTypes.string,
  className: PropTypes.string,
  activeClassName: PropTypes.string,
  children:PropTypes.node,
  role:PropTypes.string,
  style:PropTypes.object
};
