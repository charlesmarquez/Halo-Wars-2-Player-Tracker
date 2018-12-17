import React, {Component} from 'react'
import ReactTable from 'react-table'
import Timer from './timer'
import MatchEvents from './MatchEvents.js'
import "react-table/react-table.css";
import matchSorter from 'match-sorter'

const columns = [
    {
        Header: "Player",
        accessor: "player",
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
        Cell: props => <div>{props.value === 'N/A' ? 'Custom' : `${props.value}, MMR: ${props.row._original.history.RatingProgress.UpdatedMmr.Rating.toFixed(4)}`}</div>
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

export default class HaloTable extends Component {
    constructor() {
        super()
        this.state = {
            data: {}
        }
    }
    
    componentDidMount = () => {
        this.setData()
        setInterval(() => {
                console.time('this.setData');
                this.setData()
                console.timeEnd('this.setData');
            }, 60000);
    }

    setData = async() => {
        this
            .callApi()
            .then(res => {
                this.setState({data: res})
            })
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
                                <a style={{cursor: 'pointer'}} href={`https://www.halowaypoint.com/en-us/games/halo-wars-2/game-history/players/${row.original.player}?gameModeFilter=All&start=0&count=10`} target="_blank" rel='noopener noreferrer'>Latest Match Details</a>
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
                                    <MatchEvents row={row}></MatchEvents>
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
