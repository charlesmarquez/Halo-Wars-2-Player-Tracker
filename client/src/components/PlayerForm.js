import React, {Component} from 'react'

export default class PlayerForm extends Component {
    constructor() {
        super()

        this.state = {
            inputValue: 'mike beaston',
            postResponse: ' '
        }
    }

    updateInputValue(evt) {
        this.setState({inputValue: evt.target.value})
    }

    addPlayer = async(e) => {
        e.preventDefault();
        console.log(`Submitting: ${this.state.inputValue}`);
        const response = await fetch(`api/addplayer`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({post: this.state.inputValue})
        })
        const body = await response.text()
        console.log(body);
        this.setState({postResponse: body})
    }

    handleSubmit = async e => {
        e.preventDefault();
        const response = await fetch('/api/world', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({post: this.state.post})
        });
        const body = await response.text();
        this.setState({responseToPost: body});
    };

    render() {
        return (
            <div className='form-horizontal' autoComplete='off'>
                <div className="form-group">
                    <input
                        type="text"
                        className="form-control"
                        value={this.state.inputValue}
                        onChange={evt => this.updateInputValue(evt)}
                        maxLength='15'
                        style={{
                        textAlign: 'center'
                    }}></input>
                    <button
                        className="btn btn-info btn-block"
                        onClick={this
                        .addPlayer
                        .bind(this)}>Add Player</button>
                    <label>{this.state.postResponse}</label>
                </div>
            </div>
        )
    }
}
