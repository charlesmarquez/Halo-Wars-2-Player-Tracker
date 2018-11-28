import React, {Component} from 'react'
import AnimateOnChange from 'react-animate-on-change'
import PlayerForm from "./PlayerForm";
import uuidv4 from 'uuid/v4'

export default class datatable extends Component {
    constructor() {
        super()

        this.state = {
            data: {
                player: 'Loading ...',
                time: {
                    timeago: '...',
                    seconds: '...',
                    matchType: '...'
                }
            }
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
                <div className="table">
                    <div className="row header">
                        <div className="cell">Player</div>
                        <div className="cell">Time Ago</div>
                        <div className="cell">Match Type</div>
                    </div>
                    {Array
                        .from(this.state.data)
                        .map(row => (
                            <AnimateOnChange
                                baseClassName={(row.time.seconds < 3600)
                                ? "row online"
                                : "row"}
                                key = {uuidv4()}
                                animationClassName='fadeinRow'
                                customTag="div"
                                animate={true}
                                >
                                <div className="cell">{row.player}</div>
                                <div className="cell">{row.time.timeago}</div>
                                <div className="cell">{row.time.matchType}</div>
                            </AnimateOnChange>
                        ))}
                </div>
            </div>
        )
    }
}
