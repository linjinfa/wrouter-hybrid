/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/4/24
 * Time: 17:37
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import WRouter from '../../WRouter';

import './KeyboardDialog.css';

import {
    Keyboard,
} from '@components-hybrid/components';

/**
 *
 * @type {null}
 */
let _keyboardDialog = null;

/**
 *
 * @type {null}
 * @private
 */
let _keyboardDismissTimeId = null;

/**
 * 清除
 */
const clearKeyboardTimeout = ()=>{
    if(_keyboardDismissTimeId){
        clearTimeout(_keyboardDismissTimeId);
    }
    _keyboardDismissTimeId = null;
};

/**
 * 延迟关闭软键盘
 */
const keyboardDismissDelay = (timeout = true)=>{
    clearKeyboardTimeout();
    let dismiss = ()=>{
        if(_keyboardDialog){
            _keyboardDialog.dismiss();
        }
        _keyboardDialog = null;
    };
    if(timeout){
        _keyboardDismissTimeId = setTimeout(dismiss, 700);
    }else{
        dismiss();
    }
};

//软键盘
WRouter.registerRouteChangeListener({
    routeChangeBefore:()=>{
        window.dismissKeyboardDialog(false);
    }
});

/**
 *
 */
class KeyboardDialog extends Component{

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
    }

    componentWillUnmount() {
        _keyboardDialog = null;
    }

    /**
     *
     */
    onShow = ()=>{
        let keyboardDialogContainerDiv = this.refs.keyboardDialogContainerDiv;
        if(keyboardDialogContainerDiv){
            let param = {
                type:'H5Keyboard',
                isShowing: true,
                keyboardHeight: keyboardDialogContainerDiv.clientHeight,
            };
            window.mapi.onKeyboardEvent(param);
        }
    };

    /**
     *
     */
    onDismiss = ()=>{
        let keyboardDialogContainerDiv = this.refs.keyboardDialogContainerDiv;
        if(keyboardDialogContainerDiv){
            let param = {
                type:'H5Keyboard',
                isShowing: false,
                keyboardHeight: keyboardDialogContainerDiv.clientHeight,
            };
            window.mapi.onKeyboardEvent(param);
        }
    };

    /**
     *
     * @private
     */
    _onKeyUp = (ev, value)=>{
        if(_keyboardDialog){
            let onKeyUp = _keyboardDialog.onKeyUp;
            onKeyUp && onKeyUp(ev, value);
        }
    };

    /**
     *
     * @private
     */
    _completeOnClick = ()=>{
        keyboardDismissDelay(false);
    };

    render(){
        return (
            <div ref={'keyboardDialogContainerDiv'} className='keyboard-dialog-container'>
                <Keyboard
                    onKeyUp={this._onKeyUp}
                    completeOnClick={this._completeOnClick}
                />
            </div>
        );
    }

}

(function(global){
    if(!global.showKeyboardDialog){
        //
        global.showKeyboardDialog = (option = {})=>{
            let{dismissListener, onKeyUp, ...otherOption} = option;
            if(_keyboardDialog){
                _keyboardDialog.onKeyUp = onKeyUp;
                clearKeyboardTimeout();
                return;
            }
            //
            let showAnim = 'keyboard-dialog-down-pop-in';
            let dismissAnim = 'keyboard-dialog-down-pop-out';

            let dialogOption = {
                type:2,
                targetElement:document.body,
                showAnim: showAnim,
                dismissAnim: dismissAnim,
                gravity:'flex-end',
                dismissListener:dismissListener,
                showMask:false,
                containerStyle:{
                    position:'static',
                },
                contentStyle:{
                    top:'auto',
                },
                data:{
                    ...otherOption,
                }
            };
            _keyboardDialog = window.showDialog(KeyboardDialog, dialogOption);
            _keyboardDialog.onKeyUp = onKeyUp;
        };
        //
        global.dismissKeyboardDialog = (timeout = true)=>{
            keyboardDismissDelay(timeout);
        };
    }
}(window));