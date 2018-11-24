import React, { Component } from "react";
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
  
  componentDidMount() {
    this.callApi().then(res => {
      this.setState({
        data: res
      })
    })
    .catch(err => {
      console.log(err);
    })
  }

  callApi = async () => {
    const response = await fetch("/api/players");
    const body = await response.json();
    if (response.status !== 200) throw Error(body.message);
    await this.setState({
      data: body
    })
    return body;
  };

  render() {
    return (
      <div className="App">
        <strong>Halo Player Tracker</strong>
        <button onClick={this.callApi}>Refresh</button>
        <DataTable name="DataTable" callApi={this.callApi.bind(this)} data={this.state.data}></DataTable>
        </div>
    );
  }
}
export default App;
