/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/4/28
 * Time: 10:13
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';

import './LoadingDialog.css';
import Icon_Loading from '../assets/loading.svg';

import WRouter from '../../WRouter';

/**
 * 
 * @private
 */
const _loadingDialogRouteMap = {};

class LoadingDialog extends Component {

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {};
    }

    componentWillUnmount() {

    }
    
    /**
     *
     * @private
     */
    _renderLoadingItem = ()=>{
        let itemList = [];

        const count = 10;
        for(let index = 0;index< count; index++){
            let clsNameList = ['loading-dialog-loading-item'];
            let deg = index * (360 / count);
            if(deg >= 270 || deg === 0){
                clsNameList.push('loading-dialog-loading-forebar-item');
            }
            
            let itemDiv = (
                <div
                    key={`loading-item-${index}`}
                    className={clsNameList.join(' ')}
                    style={{transform:`rotate(${deg}deg)`}}
                />
            );
            itemList.push(itemDiv);
        }

        return itemList;
    };

    render(){
        return (
            <div className='loading-dialog-container'>
                <div className='loading-dialog-loading-bar-container'>
                    {this._renderLoadingItem()}
                </div>
                <span className='loading-dialog-tip'>加载中...</span>
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
                dialog = window.showDialog(LoadingDialog, dialogOption, that);
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