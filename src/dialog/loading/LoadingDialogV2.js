/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/4/28
 * Time: 10:13
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {
    Platform,
} from 'components-hybrid';

import {
    KeyFramesUtil,
} from 'components-hybrid/components';

import './LoadingDialogV2.css';

/**
 * 
 * @private
 */
const _loadingDialogRouteMap = {};

class LoadingDialogV2 extends Component {

    /**
     *
     * @type {number}
     * @private
     */
    _currTime = 0;

    /**
     *
     * @type {number}
     * @private
     */
    _currIndex = 0;

    /**
     *
     * @type {boolean}
     * @private
     */
    _stop = false;

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
    }

    componentDidMount() {
        // if(Platform.isIOS){
        //     requestAnimationFrame(this._anim);
        // }
    }

    componentWillUnmount() {
        // if(Platform.isIOS){
        //     this._stop = true;
        //     cancelAnimationFrame(this._anim);
        // }
    }

    /**
     *
     * @private
     */
    _anim = ()=>{
        if(this._stop){
            return;
        }
        let now = new Date().getTime();
        if(now - this._currTime > 30){
            this._currTime = now;
            let loadingDialogLoadingBar = this.refs.loadingDialogLoadingBar;
            if(!loadingDialogLoadingBar){
                return;
            }
            let backgroundPosition = (this._currIndex * 50);
            // console.log('backgroundPosition====>', backgroundPosition);
            loadingDialogLoadingBar.style.backgroundPosition = `-${backgroundPosition}px -4px`;

            this._currIndex++;
            if(this._currIndex >= 23){
                this._currIndex = 0;
            }
        }
        requestAnimationFrame(this._anim);
    };

    /**
     *
     * @private
     */
    _click = ()=>{
       const {dialogInfo} = this.props;
       window.dismissDialog(dialogInfo);
    };

    render(){
        let translateY = this.props.offsetY || 0;

        return (
            <div
                className='loading-dialog-container'
                style={{transform:`translateY(${translateY}px)`}}
                onClick={this._click}
            >
                <div ref={'loadingDialogLoadingBar'} className='common-loading loading-dialog-loading-bar-container'></div>
            </div>
        );
    }

}

(function(global){
    if(!global.showProgress){
        //
        global.showProgress = (that, option) => {
            if(!that){
                return;
            }
            let dialog = _loadingDialogRouteMap[that];
            if(!dialog){
                let {targetElement, ...data} = option || {};
                let dialogOption = {
                    type:3,
                    fitNavigationBar:false,
                    showMask:false,
                    isDestroy:true,
                    targetElement:targetElement,
                    data:{
                        ...data,
                    }
                };
                dialog = window.showDialog(LoadingDialogV2, dialogOption, that);
                _loadingDialogRouteMap[that] = dialog;
            }
            return dialog;
        };
        //
        global.dismissProgress = (that) => {
            let dialog = _loadingDialogRouteMap[that];
            if(dialog){
                delete _loadingDialogRouteMap[that];
                dialog.dismiss();
            }
        };
    }
}(window));