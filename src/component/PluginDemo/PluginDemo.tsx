import React from 'react'

interface IObjects {
    [propsName: string]: any
}

// tslint:disable-next-line:no-empty-interface
interface IProps {
    title?: string
}

interface IStates {
    name?: string
}
const PluginDemo: React.FC<IProps> = ({ title }) => {
  return (<div
    style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'skyblue',
        textAlign: 'center',
        fontSize: '30px',
    }}
  >
  {title}
  </div>)
}
export default PluginDemo