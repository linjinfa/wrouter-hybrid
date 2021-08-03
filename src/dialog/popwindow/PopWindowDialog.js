/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/3/30
 * Time: 14:58
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';

import './PopWindowDialog.css';

import {
    StatusBar,
    Platform,
} from 'components-hybrid';

class PopWindowDialog extends Component{

    /**
     *
     * @type {null}
     * @private
     */
    childComp = null;

    /**
     *
     * @type {null}
     * @private
     */
    _topDiv = null;

    // 构造
    constructor(props) {
        super(props);
        // 初始状态
        this.state = {
            ...props
        };
    }

    /**
     *
     */
    onShow = ()=>{
        if(this.childComp){
            let onShow = this.childComp.onShow;
            onShow && onShow();
        }
    };

    /**
     *
     */
    onDismiss = ()=>{
        if(this.childComp){
            let onDismiss = this.childComp.onDismiss;
            onDismiss && onDismiss();
        }
    };

    // /**
    //  *
    //  */
    // onShowBefore = ()=>{
    //     this._addCloneTopDiv();
    // };
    //
    // /**
    //  *
    //  */
    // onShowAnimEnd = ()=>{
    //     this._removeCloneTopDiv();
    // };
    //
    // /**
    //  *
    //  */
    // onDismissAnimStart = ()=>{
    //     this._addCloneTopDiv();
    // };
    //
    // /**
    //  *
    //  */
    // onDismissAnimEnd = ()=>{
    //     this._removeCloneTopDiv();
    // };
    //
    // /**
    //  *
    //  * @private
    //  */
    // _addCloneTopDiv = ()=>{
    //     const{dialogInfo} = this.props;
    //
    //     this._topDiv = createCloneTopDiv(this.props);
    //     if(this._topDiv){
    //         dialogInfo.dialogDiv.appendChild(this._topDiv);
    //     }
    // };
    //
    // /**
    //  *
    //  * @private
    //  */
    // _removeCloneTopDiv = ()=>{
    //     removeCloneTopDiv(this.props, this._topDiv);
    //     this._topDiv = null;
    // };

    /**
     *
     * @param comp
     * @private
     */
    _setComp = (comp)=>{
        this.childComp = comp;
    };

    render(){
        const {component, topDiv, ...otherProps} = this.props;
        let Comp = component;

        return (
            <Comp ref={this._setComp} {...otherProps}/>
        );
    }

}

/**
 *
 * @private
 */
const createCloneTopDiv = (option)=>{
    let topDiv;

    const{routeComp, anchorContainerRect, offsetX, offsetY, anim} = option;
    if(anim !== 'translate'){
        return null;
    }

    if(routeComp && routeComp.props && routeComp.props.match){
        let routePath = routeComp.props.match.routePath;
        let routeDiv = document.getElementById(routePath);
        if(routeDiv){
            let cloneRouteDiv = routeDiv.cloneNode(true);

            topDiv = document.createElement('div');
            topDiv.className = 'pop-window-dialog-clone-container';
            if(Platform.isIOS){
                topDiv.style.height = `${anchorContainerRect.bottom+offsetY}px`;
            }else{
                // topDiv.style.top = `${StatusBar.statusBarHeight}px`;
                topDiv.style.height = `${anchorContainerRect.bottom+offsetY}px`;

                cloneRouteDiv.style.top = `${StatusBar.statusBarHeight}px`;

                let statusBarDiv = document.createElement('div');
                statusBarDiv.style.cssText = `width:100%;height:${StatusBar.statusBarHeight}px;background-color:white;`;
                topDiv.appendChild(statusBarDiv);
            }
            topDiv.appendChild(cloneRouteDiv);
        }
    }
    return topDiv;
};

/**
 *
 * @private
 */
const removeCloneTopDiv = (option, topDiv)=>{
    const{dialogInfo, routeComp} = option;
    if(topDiv){
        dialogInfo.dialogDiv.removeChild(topDiv);
    }
};

(function(global){
    if(!global.popWindowDialog){
        //
        global.popWindowDialog = (Component, option, that, isDestroy = true)=>{
            let {
                anchorContainer,
                offsetX = 0,
                offsetY = 0,
                containerStyle,
                contentStyle,
                canceledOnTouchOutside,
                showAnimStartListener,
                showAnimEndListener,
                dismissListener,
                dismissAnimStartListener,
                dismissAnimEndListener,
                fitNavigationBar = true,
                ...otherOption
            } = option;
            let rect = anchorContainer.getBoundingClientRect();

            let showMask = true;
            if(option.showMask === false){
                showMask = false;
            }
            //
            let showAnim = 'popwindow-up-pop-in';
            let dismissAnim = 'popwindow-up-pop-out';

            let dialogOption = {
                doMasAnim:true, //执行遮罩动画
                showMask:showMask,
                showAnim: showAnim,
                dismissAnim: dismissAnim,
                animChild:true,
                fitNavigationBar:fitNavigationBar,
                maskStyle:{
                    marginTop:`${rect.bottom+offsetY}px`,
                },
                containerStyle:containerStyle,
                contentStyle:{
                    ...contentStyle,
                    justifyContent:'flex-start',
                    alignItems:'flex-start',
                    left:`${rect.left+offsetX}px`,
                    top:`${rect.bottom+offsetY}px`,
                },
                showAnimStartListener:showAnimStartListener,
                showAnimEndListener:showAnimEndListener,
                dismissListener:dismissListener,
                dismissAnimStartListener:dismissAnimStartListener,
                dismissAnimEndListener:dismissAnimEndListener,
                canceledOnTouchOutside:canceledOnTouchOutside,
                showImmediately:option.showImmediately,
                isDestroy:isDestroy,
                data:{
                    ...otherOption,
                    anchorContainerRect:rect,
                    offsetX,
                    offsetY,
                    component:Component,
                    routeComp:that,
                }
            };
            return window.showDialog(PopWindowDialog, dialogOption, that);
        };
    }
}(window));