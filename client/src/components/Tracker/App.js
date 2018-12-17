import React, {Component} from "react";
import HaloTable from './reactTable'
import "../../styles/App.css";
import "react-table/react-table.css"
import pepe from './pepe.png'

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
                        <a href={'https://www.paypal.me/aykonz'} style={{alignContent: 'center'}}>
                        <img
                                    className='rounded float-left'
                                    alt={pepe}
                                    height={300}
                                    padding={10}
                                    src={pepe}
                                    />
                        </a>
                        </div>
        );
    }
}
export default App;
