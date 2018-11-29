import React, {Component} from 'react'
import AnimateOnChange from 'react-animate-on-change'
import PlayerForm from "./PlayerForm";
import uuidv4 from 'uuid/v4'
import ReactTable from 'react-table'
import "react-table/react-table.css";

const columns = [
    {
      Header: "Name",
      columns: [
        {
          Header: "First Name",
          accessor: "firstName"
        },
        {
          Header: "Last Name",
          id: "lastName",
          accessor: d => d.lastName
        }
      ]
    },
    {
      Header: "Info",
      columns: [
        {
          Header: "Age",
          accessor: "age"
        },
        {
          Header: "Status",
          accessor: "status"
        }
      ]
    },
    {
      Header: "Stats",
      columns: [
        {
          Header: "Visits",
          accessor: "visits"
        }
      ]
    }
  ];


export default class datatable extends Component {
    constructor() {
        super()
        this.state = {
            data: {}
        }
    }

    componentDidMount = () => {
        this.timerID = setTimeout(async() => {
            this
                .props
                .callApi()
                .then(res => {
                    this.setState({data: res})
                })
        }, 1);
    }

    componentDidUpdate = (prevState) => {
        // console.log(prevState.data)
    }

    setData = async() => {
        this
            .props
            .callApi()
            .then(res => {
                this.setState({data: res})
            })

    }

    handleChange = (event) => {
        console.log(`something changed`)
    }

    render() {
        return (
            <div>
              <ReactTable
                data={Array.from(this.state.data)}
                columns={columns}
                defaultPageSize={10}
                className="-striped -highlight"
                SubComponent={row => {
                  return (
                    <div style={{ padding: "20px" }}>
                      <em>
                        You can put any component you want here, even another React
                        Table!
                      </em>
                      <br />
                      <br />
                      <ReactTable
                        data={this.state.data}
                        columns={columns}
                        defaultPageSize={3}
                        showPagination={false}
                        SubComponent={row => {
                          return (
                            <div style={{ padding: "20px" }}>
                              Another Sub Component!
                            </div>
                          );
                        }}
                      />
                    </div>
                  );
                }}
              />
              <br />
            </div>
          );
    }
}
