import React, {Component} from "react";
import DataTable from './datatable'
import "../styles/App.css";
import "react-table/react-table.css"

class App extends Component {
    constructor() {
        super()
        this.state = {
            data: []
        }
    }

    callApi = async() => {
        const response = await fetch("/api/players");
        const body = await response.json();
        if (response.status !== 200) 
            throw Error(body.message);
        await this.setState({data: body})
        console.log(body)
        return body;
    };

    render() {
        return (
            <div className="App">
                <strong>Halo Player Tracker</strong>
                <div className="limiter">
                    <div className="container-table100">
                        <div className="wrap-table100">
                            <DataTable
                                name="DataTable"
                                callApi={this
                                .callApi
                                .bind(this)}
                                data={this.state.data}></DataTable>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
export default App;
