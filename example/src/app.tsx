import React from 'react';
import Card from '../../src/component/Card/index'

// tslint:disable-next-line:no-empty-interface
interface IProps {}

// tslint:disable-next-line:no-empty-interface
interface IStates {}
class App extends React.Component<IProps, IStates> {
    render() {
        return (
            <React.Fragment>
                <Card title={"card title"} content="card content"/>
            </React.Fragment>
        )
    }
}

export default App
