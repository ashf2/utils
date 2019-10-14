import React from 'react'

interface IObjects {
    [propsName: string]: any
}

// tslint:disable-next-line:no-empty-interface
interface IProps {
    title?: string,
    content?: string
}

const Card: React.FC<IProps> = ({ title, content }) => {
  return (<div
    style={{
        width: '100vw',
        height: '100vh',
        backgroundColor: 'skyblue',
        textAlign: 'center',
        fontSize: '30px',
    }}
  >
  <h4>{title}</h4>
  <p>{content}</p>
  </div>)
}
export default Card;