import React, {Component} from 'react'

export default class datatable extends Component {
    constructor(props) {
        super()

        this.state = {
            data: {
                player: 'Loading ...',
                time: {
                    timeago: '...',
                    seconds: '...',
                }
            }
        }
    }

    componentDidMount = () => {
        this.timerID = setTimeout(async() => {
        this.props.callApi().then(res => {
                  this.setState({
                    data: res
                  })
                  console.log(this.state)
                })
        }, 5000);
    }

    setData = async () => {
      this.props.callApi().then(res => {
        this.setState({
          data: res
        })
      })
    }

    render() {
        return (
            <div>                    <button onClick={this.setData}>Refresh</button>
                <table className="table">
                        <div className="row header">
                            <th className="cell">Player</th>
                            <th className="cell">TimeAgo</th>
                            <th className="cell">Seconds</th>
                        </div>
                        <tbody>
                        {Array
                            .from(this.state.data)
                            .map(row => (
                                <tr className="row">
                                    <td className="cell">{row.player}</td>
                                    <td className="cell">{row.time.timeago}</td>
                                    <td className="cell">{row.time.seconds}</td>
                                </tr>
                            ))}
                        </tbody>
                </table>
            </div>
        )
    }
}
