'use strict';

import React from 'react';
import config from '../../config/default.json';
import moment from 'moment';

toastr.options.closeButton = true;
toastr.options.closeDuration = 300;
toastr.options.extendedTimeOut = 1000
toastr.options.progressBar = true;
toastr.options.timout = 5000;

const sortAlphabetically = (alpha, beta) => {
    if (alpha.name < beta.name) {
        return -1;
    }
    if (alpha.name > beta.name) {
        return 1;
    }

    return 0;
};

const Lockdown = React.createClass({
    getInitialState() {
        const currentUserId = Number(localStorage.getItem('currentUserId'));

        return {
            currentUserId: currentUserId,
            desync: false,
            entities: [],
            lastSync: "",
            socket: undefined,
            users: []
        }
    },

    componentDidMount() {
        this.refreshUsers();
        this.refreshEntities();

        const socket = io.connect(`http://${config.socket.hostname}:${config.socket.port}`);

        socket.on('connect', () => {
            this.setState({desync: false});
        })

        socket.on('create', (data) => {
            toastr.info(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.entityName} created`)
            this.refreshEntities();
        });

        socket.on('delete', (data) => {
            toastr.info(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.entityName} deleted`)
            this.refreshEntities();
        });

        socket.on('unlock-all', (data) => {
            toastr.info(`${moment(data.modificationDate).format('HH:mm:ss')} All entities unlocked`)
            this.refreshEntities();
        });

        socket.on('unlock', (data) => {
            toastr.success(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.entityName} unlocked by ${this.getUserNameById(data.modifiedById)}`)
            this.refreshEntities();
        });

        socket.on('lock', (data) => {
            toastr.error(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.entityName} locked by ${this.getUserNameById(data.modifiedById)}`)
            this.refreshEntities();
        });

        socket.on('disconnect', this.desync);

        this.setState({socket});
    },

    desync(error) {
        this.setState({desync: true});
        console.log(error);
    },

    refreshEntities() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/entity`).then((response) => {
            return response.json();
        }).then((entities) => {
            entities.sort(sortAlphabetically);
            this.setState({entities, desync: false, lastSync: moment().format()});
        }).catch((error) => {
            this.desync(error);
            setTimeout(this.refreshEntities, config.reconnect.timeout);
        });
    },

    refreshUsers() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/user`).then((response) => {
            return response.json();
        }).then((users) => {
            users.sort(sortAlphabetically);
            this.setState({users, desync: false, lastSync: moment().format()});
        }).catch((error) => {
            this.desync(error);
            setTimeout(this.refreshUsers, config.reconnect.timeout);
        });
    },

    setCurrentUser(event) {
        const userId = Number(event.target.value);

        localStorage.setItem('currentUserId', userId);
        this.setState({currentUserId: userId});
    },

    toggleEntity(entityId) {
        const currentUser = this.state.users.find((user) => {
            return user.id === this.state.currentUserId;
        })

        const lastModifiedById = currentUser.id;
        const lastModificationDate = moment().format();

        fetch(`/api/entity/${entityId}`, {
            method: 'PUT',
            body: JSON.stringify({lastModifiedById, lastModificationDate}),
            headers: {
                'Content-Type': 'application/json'
            }
        }).catch(this.desync);
    },

    getUserNameById(id) {
        const user = this.state.users.find((user) => {
            return user.id === id;
        })

        return user ? user.name : "";
    },

    render() {
        return (
            <div style={{
                paddingTop: '1%'
            }}>
                <div className="col-sm-10 col-sm-offset-1">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <span className="glyphicon glyphicon-lock" aria-hidden="true"></span>{' Lockdown'}</div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-sm-9">
                                    {this.state.desync
                                        ? <span className="label label-warning" style={{fontSize: '1em'}}>{'Desync'}</span>
                                        : <span>{` Last sync: ${this.state.lastSync}`}</span>
                                    }
                                </div>
                                <div className="col-sm-3">
                                    <select className="form-control" onChange={this.setCurrentUser} value={this.state.currentUserId}>
                                        {this.state.users.map(user => {
                                            return (
                                                <option key={user.id} value={user.id}>{user.name}</option>
                                            );
                                        })}
                                    </select>
                                </div>
                            </div>
                            <div className="row">
                                <table className="table table-condensed table-hover table-striped ">
                                    <thead>
                                        <tr>
                                            <th>{'Entity'}</th>
                                            <th>{'Last Modification Date'}</th>
                                            <th>{'Last Modified By'}</th>
                                            <th>{'Status'}</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.entities.map((entity) => {
                                            return (
                                                <tr key={entity.id}>
                                                    <td>{entity.name}</td>
                                                    <td>{entity.lastModificationDate}</td>
                                                    <td>{this.getUserNameById(entity.lastModifiedById)}</td>
                                                    <td>{entity.locked
                                                            ? <span className="label label-danger">{'Locked'}</span>
                                                            : <span className="label label-success">{'Unlocked'}</span>}
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-xs btn-info" disabled={this.state.currentUserId === 0 || (entity.locked && this.state.currentUserId !== entity.lastModifiedById)} onClick={this.toggleEntity.bind(this, entity.id)} type="button">
                                                            {entity.locked
                                                                ? 'Unlock'
                                                                : 'Lock'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
});

export default Lockdown;