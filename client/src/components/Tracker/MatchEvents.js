import React, {Component} from 'react'

export default class MatchEvents extends Component {
    constructor() {
        super()
        this.state = {};
    }

    componentDidMount = () => {
        this.setData()
    }

    /**
     * @todo
     * use Victory library to create visualizations
     */

    setData = async() => {
        this
            .callMatchEvents()
            .then(res => {
                this.setState({data: res});
            })
    }

    callMatchEvents = async() => {
        const response = await fetch(`api/matchevents`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({post: this.props})
        })
        const body = await response.json();
        // console.log(body);
        if (response.status !== 200) 
            throw Error(body.message);
        this.setState({data: body})
        return body;
    };

    render() {
        return (
            <div>
                Match Events
                {/* {console.log(this.props)} */}
            </div>
        )
    }
}
