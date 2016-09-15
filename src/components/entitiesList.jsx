'use strict';

import React from 'react';
import config from '../../config/default.json';

const EntitiesList = React.createClass({
    getInitialState() {
        return {entities: []}
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
            console.log(`Entities fetch error: ${error}`);
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
                                    <input type="text" className="form-control" placeholder="Entity name"/>
                                    <span className="input-group-btn">
                                        <button className="btn btn-success" type="button">
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
                                                        <button className="btn btn-xs btn-danger pull-right">
                                                            <span className="glyphicon glyphicon-remove"/>
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

export default EntitiesList;