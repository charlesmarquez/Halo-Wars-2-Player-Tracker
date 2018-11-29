import React, {Component} from "react";
import DataTable from './datatable'
import DataTable1 from './reactTable'
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
        this.setState({data: body})
        return body;
    };

    render() {
        return (
            <div className="App" key='p'>
                <strong>Halo Player Tracker</strong>
                            <DataTable1
                                name="DataTable"
                                callApi={this
                                .callApi
                                .bind(this)}
                                data={this.state.data}></DataTable1>
                        </div>
        );
    }
}
export default App;
