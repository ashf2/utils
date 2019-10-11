import React from 'react';
import { PluginDemo } from '../../src/component/PluginDemo/index'

// tslint:disable-next-line:no-empty-interface
interface IProps {}

// tslint:disable-next-line:no-empty-interface
interface IStates {}
class App extends React.Component<IProps, IStates> {
    render() {
        return (
            <React.Fragment>
                <PluginDemo title={"hello"}/>
            </React.Fragment>
        )
    }
}

export default App
