import React, {Component} from 'react'
import AnimateOnChange from 'react-animate-on-change'
import PlayerForm from "./PlayerForm";
import uuidv4 from 'uuid/v4'

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
                <PlayerForm></PlayerForm>
                <br/>
                <button onClick={this.setData} className="btn btn-info btn-block">Refresh</button>
                <table className="display">
                    <thead className="">
                    <tr>
                        <th>Player</th>
                        <th>Time Ago</th>
                        <th>Match Type</th>
                        <th>Player</th>
                        <th>Time Ago</th>
                        <th>Match Type</th>
                    </tr>
                    </thead>
                    <tbody>
                    {Array
                        .from(this.state.data)
                        .map(row => (
                            <AnimateOnChange
                                baseClassName={(row.history.custom.timeAgo.seconds < 3600)
                                ? "online"
                                : ""}
                                key = {uuidv4()}
                                animationClassName='fadeinRow'
                                customTag="tr"
                                animate={true}
                                >
                                    
                                <td className="cell">{row.Player.Gamertag}</td>
                                <td className="cell">{row.history.custom.timeAgo.timeago}</td>
                                <td className="cell">{row.history.custom.matchType}</td>
                                <td className="cell">{row.Player.Gamertag}</td>
                                <td className="cell">{row.history.custom.timeAgo.timeago}</td>
                                <td className="cell">{row.history.custom.matchType}</td>
                               
                            </AnimateOnChange>
                        ))}
                    </tbody>
                </table>
            </div>
        )
    }
}
