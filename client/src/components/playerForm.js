import React, {Component} from 'react';

export default class PlayerForm extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };

        this.handleChange = this
            .handleChange
            .bind(this);
        this.handleSubmit = this
            .handleSubmit
            .bind(this);
    }

    handleChange(event) {
        this.setState({value: event.target.value});
    }

    handleSubmit(event) {
        alert('A name was submitted: ' + this.state.value);
        event.preventDefault();
    }

    render() {
        return (
            <form className='form-horizontal' onSubmit={this.handleSubmit}>
                <div className='form-group'>
                    <label>
                        Add Player to Database
                        <input type="text" value={this.state.value} onChange={this.handleChange}/>
                    </label>
                </div>
            </form>
        );
    }
}