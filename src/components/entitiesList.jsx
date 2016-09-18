'use strict';

import React from 'react';
import config from '../../config/default.json';
import { browserHistory } from 'react-router';

const EntitiesList = React.createClass({
    getInitialState() {
        return {entities: [], entityName: ''}
    },

    componentDidMount() {
        this.refreshEntities();
    },

    refreshEntities() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/entity`).then((response) => {
            return response.json();
        }).then((entities) => {
            this.setState({entities});
        }).catch((error) => {
            console.log(error);
        });
    },

    createEntity() {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/entity`, {
            method: 'POST',
            body: JSON.stringify({
                entityName: this.state.entityName
            }),
            headers: {
                'Content-Type': 'application/json'
            },
        }).then(() => {
            this.setState({entityName: ''});
            this.refreshEntities();
        }).catch((error) => {
            console.log(error);
        });

    },

    removeEntity(entityId) {
        fetch(`http://${config.api.hostname}:${config.api.port}/api/entity/${entityId}`, {
            method: 'DELETE',
        }).then(() => {
            this.refreshEntities();
        }).catch((error) => {
            console.log(error);
        });
    },

    changeEntityName(event) {
        this.setState({
            entityName: event.target.value
        });
    },

    render() {
        return (
            <div style={{
                paddingTop: '1%'
            }}>
                <div className="col-sm-4 col-sm-offset-4">
                    <div className="panel panel-primary">
                        <div className="panel-heading">
                            <span className="glyphicon glyphicon-list" aria-hidden="true"></span>{' Entities'}
                        </div>
                        <div className="panel-body">
                            <div>
                                <div className="input-group">
                                    <input type="text" className="form-control" onChange={this.changeEntityName} placeholder="Entity name" value={this.state.entityName}/>
                                    <span className="input-group-btn">
                                        <button className="btn btn-success" disabled={!this.state.entityName} onClick={this.createEntity} type="button">
                                            <span className="glyphicon glyphicon-plus"/>
                                        </button>
                                    </span>
                                </div>
                            </div>
                            <div className="row">
                                <table className="table table-condensed table-hover table-striped ">
                                    <thead>
                                        <tr>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {this.state.entities.map((entity) => {
                                            return (
                                                <tr key={entity.id}>
                                                    <td>{entity.name}</td>
                                                    <td>
                                                        <button className="btn btn-xs btn-danger pull-right" onClick={this.removeEntity.bind(this, entity.id)}>
                                                            <span className="glyphicon glyphicon-remove"/>
                                                        </button>
                                                    </td>
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
        );
    }
});

export default EntitiesList;