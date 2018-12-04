import React, {Component} from 'react'

export default class Timer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            elapsed: 0
        }
    }

    componentDidMount = () => {
        setInterval(() => {
        this.tick()    
        }, 1000);
    }

    tick = () => {
        this.setState({
            elapsed: Date.now() - this.props.start
        })
    }

    render() {
        // Calculate elapsed to tenth of a second:
        var elapsed = Math.round(this.state.elapsed / 1000);

        return (
            <div>
                {`Last Updated: ${elapsed} seconds ago.`}
            </div>
        )
    }
}
