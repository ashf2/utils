import React from 'react'
import { shallow, configure } from 'enzyme'
import Adapter from 'enzyme-adapter-react-16'
import Card from '../../src/component/Card/index'

configure({ adapter: new Adapter() })


const setup = () => {
    // 模拟 props
    const props = {
        title: '测试组件的props传值',
    }
    // 通过 enzyme 提供的 shallow(浅渲染) 创建组件
    const wrapper = shallow(<Card {...props}></Card>)
    return {
        props,
        wrapper,
    }
}

describe('测试demo组件', () => {
    const { wrapper, props } = setup()
    // 通过传递模拟的props,测试组件是否正常渲染
    it('props', () => {
        // 详细用法见 Enzyme 文档 http://airbnb.io/enzyme/docs/api/shallow.html
        expect(wrapper.text()).toEqual('测试组件的props传值')
    })
})
