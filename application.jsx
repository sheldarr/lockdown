'use strict';

import React from 'react';
import ReactDOM from 'react-dom';
import config from './config/default.json';
import moment from 'moment';

toastr.options.closeButton = true;
toastr.options.closeDuration = 5000;
toastr.options.progressBar = true;

const Application = React.createClass({
    getInitialState() {
        const currentUserId = Number(localStorage.getItem('currentUserId'));

        return {currentUserId: currentUserId, devices: [], lastSync: "", socket: undefined, users: []}
    },

    componentDidMount() {
        this.refreshDevices();
        this.refreshUsers();

        const socket = io.connect(`http://${config.socket.hostname}:${config.socket.port}`);

        socket.on('release', (data) => {
            console.log(data)
            toastr.success(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.deviceType} ${data.deviceId} released by ${data.modifiedBy}`)
            this.refreshDevices();
        });

        socket.on('reservation', (data) => {
            console.log(data)
            toastr.error(`${moment(data.modificationDate).format('HH:mm:ss')} ${data.deviceType} ${data.deviceId} reserved by ${data.modifiedBy}`)
            this.refreshDevices();
        });

        this.setState({socket});
    },

    refreshDevices() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/device`).then((response) => {
            return response.json();
        }).then((devices) => {
            this.setState({devices, lastSync: moment().format()});
        }).catch((error) => {
            console.log(`Device fetch error: ${error}`);
        });
    },

    refreshUsers() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/user`).then((response) => {
            return response.json();
        }).then((users) => {
            users.sort(function(a, b){
                if(a.name < b.name) {
                    return -1;
                }
                if(a.name > b.name) {
                    return 1;
                }

                return 0;
            })
            this.setState({users});
        }).catch((error) => {
            console.log(`User fetch error: ${error}`);
        });
    },

    setCurrentUser(event) {
        const userId = Number(event.target.value);

        localStorage.setItem('currentUserId', userId);
        this.setState({currentUserId: userId});
    },

    toggleDeviceReservation(deviceId) {
        const currentUser = this.state.users.find((user) => {
            return user.id === this.state.currentUserId;
        })

        const lastModifiedBy = currentUser.name;
        const lastModificationDate = moment().format();

        fetch(`/api/device/${deviceId}`, {
            method: 'PUT',
            body: JSON.stringify({
                lastModifiedBy,
                lastModificationDate
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(() => {
            this.refreshDevices();
        }).catch((error) => {
            console.log(`Device update error: ${error}`);
        });
    },

    render() {
        return (
            <div className="row" style={{
                paddingTop: '5%'
            }}>
                <div className="col-sm-10 col-sm-offset-1">
                    <div className="panel panel-primary">
                        <div className="panel-heading">{'Device Reservation'}</div>
                        <div className="panel-body">
                            <div className="row">
                                <div className="col-sm-9">
                                    {` Last sync: ${this.state.lastSync}`}
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
                                <table className="table table-striped table-hover">
                                    <thead>
                                        <tr>
                                            <th>{'Device'}</th>
                                            <th>{'IP'}</th>
                                            <th>{'Last Modification Date'}</th>
                                            <th>{'Last Modified By'}</th>
                                            <th>{'Status'}</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.devices.map((device) => {
                                            return (
                                                <tr key={device.id}>
                                                    <td>{device.type} {device.id}</td>
                                                    <td></td>
                                                    <td>{device.lastModificationDate}</td>
                                                    <td>{device.lastModifiedBy}</td>
                                                    <td>{device.reserved ? <span className="label label-danger">{'Reserved'}</span>
                                                        : <span className="label label-success">{'Available'}</span>}
                                                    </td>
                                                    <td>
                                                        <button className="btn btn-info" disabled={this.state.currentUserId == 0} onClick={this.toggleDeviceReservation.bind(this, device.id)} type="button" >
                                                            {device.reserved ? 'Release' : 'Reserve'}
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

ReactDOM.render((<Application/>), document.getElementById('root'));
