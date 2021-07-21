/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/6/11
 * Time: 18:34
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';

import './OptionDialog.css';

class OptionDialog extends Component{

    /**
     *
     * @type {null}
     * @private
     */
    childComp = null;

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            ...props
        };
    }

    render(){
        const {component, topDiv, ...otherProps} = this.props;
        let Comp = component;
        return (
            <div className='option-dialog-container'>
                <div className='option-dialog-top-container'></div>
                <div className='option-dialog-content-container'>
                    <Comp {...otherProps}/>
                </div>
            </div>
        );
    }

}

(function(global){
    if(!global.optionDialog){
        global.optionDialog = (Component, option = {}, that, isDestroy = true)=>{
            let{dismissListener, ...otherOption} = option;
            let dialogOption = {
                doMasAnim:true, //执行遮罩动画
                showAnim:'dialog-bottom-pop-in',
                dismissAnim:'dialog-bottom-pop-out',
                gravity:'flex-end',
                dismissListener:dismissListener,
                isDestroy:isDestroy,
                data:{
                    ...otherOption,
                    component:Component,
                }
            };
            return window.showDialog(OptionDialog, dialogOption, that);
        };
    }
}(window));