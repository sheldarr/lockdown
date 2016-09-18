'use strict';

import React from 'react';
import config from '../../config/default.json';
import { browserHistory } from 'react-router';

const EntityHistory = React.createClass({
    getInitialState() {
        return {entity: {history: [], name:""}, users: []}
    },

    componentDidMount() {
        this.refreshEntity();
        this.refreshUsers();
    },

    refreshEntity() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/entity/${this.props.params.entityId}`).then((response) => {
            return response.json();
        }).then((entity) => {
            this.setState({entity});
        }).catch((error) => {
            console.log(error);
        });
    },

    refreshUsers() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/user`).then((response) => {
            return response.json();
        }).then((users) => {
            this.setState({users});
        }).catch(() => {
            setTimeout(this.refreshUsers, config.reconnect.timeout);
        });
    },

    getUserNameById(id) {
        const user = this.state.users.find((user) => {
            return user.id === id;
        })

        return user
            ? user.name
            : "";
    },

    render() {
        return (
            <div style={{
                paddingTop: '1%'
            }}>
                <div className="col-sm-10 col-sm-offset-1">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <span className="glyphicon glyphicon-list" aria-hidden="true"></span>{` ${this.state.entity.name} History`}
                        </div>
                        <div className="panel-body">
                            <div>
                                <div className="row">
                                    <table className="table table-condensed table-hover table-striped ">
                                        <thead>
                                            <tr>
                                                <th>User</th>
                                                <th>Date</th>
                                                <th>Action</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {this.state.entity.history.map((historyEntry) => {
                                                return (
                                                    <tr key={historyEntry.id}>
                                                        <td>{this.getUserNameById(historyEntry.userId)}</td>
                                                        <td>{historyEntry.date}</td>
                                                        <td>{historyEntry.action}</td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="row">
                                    <button onClick={browserHistory.push.bind(this, '/')} className="btn btn-xs btn-info" style={{marginLeft: '1em'}}>
                                        <span className="glyphicon glyphicon-arrow-left"/>{'  Go Back'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default EntityHistory;