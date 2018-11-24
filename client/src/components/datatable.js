import React, {Component} from 'react'

export default class datatable extends Component {
    constructor(props) {
        super()

        this.state = {
            data: props.data
        }
    }

    componentDidMount = () => {
        this.timerID = setTimeout(async() => {
        this.props.callApi().then(res => {
                  this.setState({
                    data: res
                  })
                })
        }, 5000);
    }

    render() {
        return (
            <div>
                <table>
                    <thead>
                        <tr>
                            <th>Player</th>
                            <th>TimeAgo</th>
                            <th>Seconds</th>
                            <th>
                                <button>button</button>
                            </th>
                        </tr>
                    </thead>
                        <tbody>
                        {Array
                            .from(this.state.data)
                            .map(row => (
                                <tr>
                                    <td>{row.player}</td>
                                    <td>{row.time.timeago}</td>
                                    <td>{row.time.seconds}</td>
                                </tr>
                            ))}
                        </tbody>
                </table>
            </div>
        )
    }
}
