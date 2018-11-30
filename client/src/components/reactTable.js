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
    }, {
        Header: "Last Online (s)",
        accessor: "history.custom.timeAgo.seconds",
        Cell: props => <div>{(props.row._original.history.custom.timeAgo.timeago)}</div>
    }, {
        Header: "Match Type",
        accessor: "history.custom.matchType"
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
        accessor: "x"
    }
];
const subCompStats = [
    {
        Header: "MMR",
        columns: [
            {
                Header: "1v1",
                accessor: "mmr.1v1.Mmr.Rating",
                sortable: false,
                Cell: props => <div>{(typeof props.value !== 'undefined') ? (props.value).toFixed(4) : 'Not Available'}</div>
            }, {
                Header: "2v2",
                accessor: "mmr.2v2.Mmr.Rating",
                sortable: false,
                Cell: props => <div>{(typeof props.value !== 'undefined') ? (props.value).toFixed(4) : 'Not Available'}</div>
            }, {
                Header: "3v3",
                accessor: "mmr.3v3.Mmr.Rating",
                sortable: false,
                Cell: props => <div>{(typeof props.value !== 'undefined') ? (props.value).toFixed(4) : 'Not Available'}</div>
            }
        ]
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
        this
            .props
            .callApi()
            .then(res => {
                this.setState({data: res})
            })
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
                    defaultSorted={[{
                        id: 'history.custom.timeAgo.seconds',
                        desc: false
                    }
                ]}
                    defaultPageSize={10}
                    className="-darker -highlight"
                    SubComponent={row => {
                    return (
                        <div
                            style={{
                            padding: "10px"
                        }}>
                            <ReactTable
                                data={[row.original]}
                                columns={subCompStats}
                                defaultPageSize={1}
                                showPagination={false}/>
                            <br/>
                            <em>
                                Latest Match Details
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
