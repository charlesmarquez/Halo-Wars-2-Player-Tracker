import React, {Component} from 'react'
import AnimateOnChange from 'react-animate-on-change'

export default class datatable extends Component {
    constructor() {
        super()

        this.state = {
            data: {
                player: 'Loading ...',
                time: {
                    timeago: '...',
                    seconds: '...'
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
        console.log(prevState)
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
                <form className='form-horizontal'>
                    <div className="form-group">
                        <label>Add Player</label>
                        <input type="email" className="form-control"/>
                    </div>
                </form>
                <br/>
                <button onClick={this.setData} className="btn btn-info btn-block">Refresh</button>
                <div className="table">
                    <div className="row header">
                        <div className="cell">Player</div>
                        <div className="cell">TimeAgo</div>
                        <div className="cell">Seconds</div>
                    </div>
                    {Array
                        .from(this.state.data)
                        .map(row => (
                            <AnimateOnChange baseClassName="row" animationClassName='example' customTag="div" animate={true} onAnimationEnd={() => {
                                console.log('animation end')
                            }}>
                                <div className="cell">{row.player}</div>
                                <div className="cell">{row.time.timeago}</div>
                                <div className="cell" >{row.time.seconds}</div>
                            </AnimateOnChange>
                        ))}
                </div>
            </div>
        )
    }
}
