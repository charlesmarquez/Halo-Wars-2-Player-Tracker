import React, {Component} from 'react'
import AnimateOnChange from 'react-animate-on-change'
import PlayerForm from "./PlayerForm";
import uuidv4 from 'uuid/v4'
import ReactTable from 'react-table'
import "react-table/react-table.css";

const columns = [
        {
          Header: "Player",
          accessor: "Player.Gamertag"
        },
        {
          Header: "Last Online (s)",
          accessor: "history.custom.timeAgo.seconds",
        },
        {
          Header: "Match Type",
          accessor: "history.custom.matchType"
        }
  ];

const subComp = [
  {
    Header: "Gamertag",
    accessor: "Player.Gamertag"
  },
  {
    Header: "Gamertag",
    accessor: "Player.Gamertag"
  },
  {
    Header: "Gamertag",
    accessor: "Player.Gamertag"
  },
  {
    Header: "Gamertag",
    accessor: "Player.Gamertag"
  },
  {
    Header: "Gamertag",
    accessor: "Player.Gamertag"
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
                SubComponent={row => {console.log([row.original])
                  return (
                    <div style={{ padding: "10px" }}>
                      <em>
                        Latest Match Details
                      </em>
                      <ReactTable
                        data={[row.original]}
                        columns={subComp}
                        defaultPageSize={1}
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
