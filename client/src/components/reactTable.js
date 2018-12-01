import React, {Component} from 'react'
import ReactTable from 'react-table'
import Timer from './timer'
import "react-table/react-table.css";
import matchSorter from 'match-sorter'

const columns = [
    {
        Header: "Player",
        accessor: "Player.Gamertag",
    }, {
        Header: "Last Online",
        accessor: "history.custom.timeAgo.seconds",
        filterMethod: (filter, row) => {
            if (filter.value === "all") {
              return true;
            }
            return row._original.history.custom.timeAgo.seconds < filter.value;
        },
          Filter: ({ filter, onChange }) =>
        <select
          onChange={event => onChange(event.target.value)}
          style={{ width: "40%",
          textAlign: "center" }}
          value={filter ? filter.value : "all"}
        >
          <option value="all">Show All</option>
          <option value="3600">{`< Hour`}</option>
          <option value="86400">{`< Day`}</option>
        </select>,
        Cell: props => <div>{(props.row._original.history.custom.timeAgo.timeago)}</div>
    }, {
        Header: "Match Type",
        accessor: "history.custom.matchPlaylist",
        Filter: ({ filter, onChange }) =>
        <select
          onChange={event => onChange(event.target.value)}
          style={{ width: "40%",
          textAlign: "center" }}
          value={filter ? filter.value : "all"}
        >
          <option value="">Show All</option>
          <option value="1v1">1v1</option>
          <option value="2v2">2v2</option>
          <option value="3v3">3v3</option>
          <option value="N/A">Custom</option>
        </select>,
        Cell: props => <div>{props.value === 'N/A' ? 'Custom' : `${props.value}, MMR: ${typeof props.row._original.mmr[props.value].Mmr.Rating == 'undefined' ? props.row._original.mmr[props.value].Mmr.Rating.toFixed(4) : 'Not Available'}`}</div>
    }
];

const subCompMatch = [
    {
        Header: "Map",
        sortable: false,
        accessor: "history.custom.mapMetadata.View.Title"
    }, {
        Header: "Duration (minutes)",
        sortable: false,
        accessor: "history.custom.timeAgo.duration"
    }, {
        Header: "Outcome",
        sortable: false,
        accessor: "history.PlayerMatchOutcome",
        Cell: props => <div>{(props.value < 2)
                    ? 'WIN'
                    : 'LOSS'}</div>
    }
];
const subCompStats = [
    {
        Header: "1v1",
        accessor: "mmr.1v1.Mmr.Rating",
        sortable: false,
        Cell: props => <div>{(typeof props.value !== 'undefined')
                    ? (props.value).toFixed(4)
                    : 'Not Available'}</div>
    }, {
        Header: "2v2",
        accessor: "mmr.2v2.Mmr.Rating",
        sortable: false,
        Cell: props => <div>{(typeof props.value !== 'undefined')
                    ? (props.value).toFixed(4)
                    : 'Not Available'}</div>
    }, {
        Header: "3v3",
        accessor: "mmr.3v3.Mmr.Rating",
        sortable: false,
        Cell: props => <div>{(typeof props.value !== 'undefined')
                    ? (props.value).toFixed(4)
                    : 'Not Available'}</div>
    }
]

export default class datatable extends Component {
    constructor() {
        super()
        this.state = {
            data: {}
        }
    }

    componentDidMount = () => {
        this.setData()

        setInterval(() => {
            console.log('Refreshing ..')
            this.setData()
        }, 60000);
    }

    componentDidUpdate = (prevState) => {}

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
                <Timer start={Date.now()}></Timer>
                <ReactTable
                    data={Array.from(this.state.data)}
                    columns={columns}
                    filterable
                    defaultFilterMethod={(filter, row) => matchSorter([row[filter.id]], filter.value).length !== 0}
                    defaultSorted={[{
                        id: 'history.custom.timeAgo.seconds',
                        desc: false
                    }
                ]}
                    defaultPageSize={10}
                    collapseOnDataChange={false}
                    className="-darker -highlight"
                    SubComponent={row => {
                    return (
                        <div
                            style={{
                            padding: "10px"
                        }}>
                            <em>
                                {`MMR Distribution`}
                            </em>
                            <ReactTable
                                data={[row.original]}
                                columns={subCompStats}
                                defaultPageSize={1}
                                showPagination={false}/>
                            <br/>
                            <em>
                                {`Latest Match Details | ${row.original.history.MatchId}`}
                            </em>
                            <div className='col-md-12'>
                                <img
                                    className='rounded float-left'
                                    alt={row.original.history.custom.mapMetadata.View.HW2Map.Image.View.Media.MediaUrl}
                                    height={300}
                                    padding={10}
                                    src={row.original.history.custom.mapMetadata.View.HW2Map.Image.View.Media.MediaUrl}/>
                            </div>
                            <ReactTable
                                data={[row.original]}
                                columns={subCompMatch}
                                defaultPageSize={1}
                                showPagination={false}
                                SubComponent={row => {
                                return (
                                    <div
                                        style={{
                                        padding: "20px"
                                    }}>
                                        Match Builds in the future maybe
                                    </div>
                                );
                            }}/>
                        </div>
                    );
                }}/>
                <br/>
            </div>
        );
    }
}
