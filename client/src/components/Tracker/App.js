import React, {Component} from "react";
import HaloTable from './reactTable'
import "../../styles/App.css";
import "react-table/react-table.css"

class App extends Component {
    constructor() {
        super()
        this.state = {
            data: []
        }
    }


    render() {
        return (
            <div className="App" key='p'>
                <strong>Halo Player Tracker</strong>
                            <HaloTable
                                name="DataTable"
                                data={this.state.data}></HaloTable>
                        </div>
        );
    }
}
export default App;
