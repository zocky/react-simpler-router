import React from 'react';
import PropTypes from 'prop-types';
import { Router } from './Router';
import { IndexRoute } from './Route';

export class Redirect extends React.Component {
  constructor(props,context) {
    super(props,context);
  }

  realTo(props,context) {
    const {route} = context;
    var {to} = props;
    if (route && route.url && !to.startsWith('/')) return route.url+'/'+to;
    else return to;
  }

  componentDidMount() {
    Router.redirect(this.realTo(this.props,this.context));
  }
  render() {
    return null;
  }
}
Redirect.propTypes = {
  to: PropTypes.string.isRequired,
};
Redirect.contextTypes = {
  route: PropTypes.shape({
    url:PropTypes.string
  })
};

export function IndexRedirect(props) {
return (<IndexRoute><Redirect to={props.to}/></IndexRoute>);
}
IndexRedirect.propTypes = {
  to:PropTypes.string.isRequired
};