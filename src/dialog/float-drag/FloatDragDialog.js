/**
 * 悬浮拖拽弹框
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/4/3
 * Time: 20:41
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';
import '../Dialog';
import './FloatDragDialog.css';
import {
    FloatRoute,
    KeyFramesUtil,
} from 'components-hybrid/components';

import {
    StatusBar,
    Platform,
} from 'components-hybrid';

/**
 *
 * @type {string}
 */
const DURATION = '.2s';

class FloatDragDialog extends Component {

    /**
     *
     * @type {number}
     * @private
     */
    _dialogInitTop = 0;

    /**
     *
     * @type {number}
     * @private
     */
    _dialogDivMaxTranslateY = 0;

    /**
     *
     * @type {number}
     * @private
     */
    _containerDivMinTranslateY = 0;

    /**
     *
     * @private
     */
    _currShow = null;

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
            ...props,
            showTip:true,
        };
    }

    componentDidMount() {
        this._calDialogInitLayout();
        this._dismissLayout();
        this._initTouch();
    }

    /**
     *
     */
    refreshOption = (option)=>{
        this.setState({data:option.data});
    };

    /**
     * 执行显示
     */
    doFloatDragShow = ()=>{
        this._showLayout(true);
    };

    /**
     * 执行隐藏
     */
    doFloatDragDismiss = ()=>{
        this._dismissLayout(true);

        const{dialogInfo, offsetY} = this.props;
        let dismissListener = dialogInfo.option.dismissListener;
        dismissListener && dismissListener();
    };

    /**
     *
     * @private
     */
    _calDialogInitLayout = ()=>{
        const{dialogInfo, offsetY} = this.props;
        this._dialogInitTop = parseFloat(dialogInfo.dialogDiv.style.top) || 0;
    };

    /**
     *
     * @param div
     * @param cssName
     * @private
     */
    _webkitAnimationEndWrapperFunc = (div, cssName, callback)=>{
        const webkitAnimationEndFunc = (e)=>{
            div.removeEventListener('webkitAnimationEnd', webkitAnimationEndFunc);
            div.style.webkitAnimation = '';
            KeyFramesUtil.deleteCSSKeyframes(cssName);
            callback && callback();
        };
        return webkitAnimationEndFunc;
    };

    /**
     * 设置隐藏初始位置
     * @private
     */
    _dismissLayout = (anim = false)=>{
        let containerDiv = this.refs.floatDragDialogContainer;
        if(!containerDiv){
            return;
        }
        const{dialogInfo, offsetY} = this.props;
        let screenHeight = dialogInfo.dialogDiv.clientHeight;
        //
        this._dialogDivMaxTranslateY = screenHeight - offsetY;
        this._containerDivMinTranslateY = -(screenHeight - containerDiv.clientHeight);

        if(this.refs.floatDragDialogTopTipContainer){
            this.refs.floatDragDialogTopTipContainer.style.opacity = 1;
        }
        this.setState({showTip:true});
        /**
         *
         */
        let dialogShowStyle = ()=>{
            dialogInfo.dialogDiv.style.webkitTransform = `translateY(${this._dialogDivMaxTranslateY}px)`;
        };
        /**
         *
         */
        let containerDivShowStyle = ()=>{
            containerDiv.style.webkitTransform = `translateY(${this._containerDivMinTranslateY}px)`;
        };

        if(!anim){
            dialogShowStyle();
            containerDivShowStyle();
            this._notifyFloatDialogOnDismissListener();
            return;
        }

        let dialogShowCssFrame = {
            from:`
                transform:${dialogInfo.dialogDiv.style.webkitTransform || 'translateY(0px)'};
                `,
            to:`
                transform:translateY(${this._dialogDivMaxTranslateY}px);
                `
        };
        let dialogShowCssName = KeyFramesUtil.createCSSKeyframes(dialogShowCssFrame, 'float-drag-dialog');
        dialogInfo.dialogDiv.addEventListener('webkitAnimationEnd', this._webkitAnimationEndWrapperFunc(dialogInfo.dialogDiv, dialogShowCssName, ()=>{
            dialogShowStyle();
        }));

        let containerDivShowCssFrame = {
            from:`
                transform:${containerDiv.style.webkitTransform || 'translateY(0px)'};
            `,
            to:`
                transform:translateY(${this._containerDivMinTranslateY}px);
            `
        };
        let containerDivShowCssName = KeyFramesUtil.createCSSKeyframes(containerDivShowCssFrame, 'float-drag-dialog-container');
        containerDiv.addEventListener('webkitAnimationEnd', this._webkitAnimationEndWrapperFunc(containerDiv, containerDivShowCssName, ()=>{
            containerDivShowStyle();
            this._notifyFloatDialogOnDismissListener();
        }));

        dialogInfo.dialogDiv.style.webkitAnimation = `${dialogShowCssName} ${DURATION} 1 forwards`;
        containerDiv.style.webkitAnimation = `${containerDivShowCssName} ${DURATION} 1 forwards`;
    };

    /**
     * 设置显示位置
     * @private
     */
    _showLayout = (anim = false)=>{
        let containerDiv = this.refs.floatDragDialogContainer;
        if(!containerDiv){
            return;
        }
        const{dialogInfo} = this.props;

        this.setState({showTip:false});

        /**
         *
         */
        let dialogShowStyle = ()=>{
            dialogInfo.dialogDiv.style.webkitTransform = `translateY(0px)`;
        };
        /**
         *
         */
        let containerDivShowStyle = ()=>{
            containerDiv.style.webkitTransform = `translateY(0px)`;
        };

        if(!anim){
            dialogShowStyle();
            containerDivShowStyle();
            this._notifyFloatDialogShowListener();
            return;
        }

        let dialogShowCssFrame = {
            from:`
                transform:${dialogInfo.dialogDiv.style.webkitTransform};
            `,
            to:`
                transform:translateY(0px);
            `
        };
        let dialogShowCssName = KeyFramesUtil.createCSSKeyframes(dialogShowCssFrame, 'float-drag-dialog');
        dialogInfo.dialogDiv.addEventListener('webkitAnimationEnd', this._webkitAnimationEndWrapperFunc(dialogInfo.dialogDiv, dialogShowCssName, ()=>{
            dialogShowStyle();
        }));

        let containerDivShowCssFrame = {
            from:`
                transform:${containerDiv.style.webkitTransform};
            `,
            to:`
                transform:translateY(0px);
            `
        };
        let containerDivShowCssName = KeyFramesUtil.createCSSKeyframes(containerDivShowCssFrame, 'float-drag-dialog-container');
        containerDiv.addEventListener('webkitAnimationEnd', this._webkitAnimationEndWrapperFunc(containerDiv, containerDivShowCssName, ()=>{
            containerDivShowStyle();
            this._notifyFloatDialogShowListener();
        }));

        dialogInfo.dialogDiv.style.webkitAnimation = `${dialogShowCssName} ${DURATION} 1 forwards`;
        containerDiv.style.webkitAnimation = `${containerDivShowCssName} ${DURATION} 1 forwards`;
    };

    /**
     *
     * @private
     */
    _notifyFloatDialogShowListener = ()=>{
        if(this.childComp){
            let onFloatDialogShow = this.childComp.onFloatDialogShow;
            onFloatDialogShow && onFloatDialogShow();
        }
    };

    /**
     *
     * @private
     */
    _notifyFloatDialogOnDismissListener = ()=>{
        if(this.childComp){
            let onFloatDialogDismiss = this.childComp.onFloatDialogDismiss;
            onFloatDialogDismiss && onFloatDialogDismiss();
        }
    };

    /**
     *
     * @private
     */
    _initTouch = ()=>{
        let dragDiv = this.refs.floatDragDialogTopContainer;
        let tipDiv = this.refs.floatDragDialogTopTipContainer;
        this._addTouchEvent(dragDiv);
        this._addTouchEvent(tipDiv, false);
    };

    /**
     *
     * @param div
     * @private
     */
    _addTouchEvent = (div, needBindClick = true)=>{
        const{dialogInfo, offsetY} = this.props;

        let containerDiv = this.refs.floatDragDialogContainer;
        const floatRoute = new FloatRoute();
        let canMove = false;
        //弹框div
        let currDialogDivTranslateY = 0;
        //
        let currContainerDivTranslateY = 0;

        const handleTouchStart = (evt)=> {
            if(evt.touches && evt.touches.length > 1){
                return;
            }

            currDialogDivTranslateY = this._getTranslateY(dialogInfo.dialogDiv);
            currContainerDivTranslateY = this._getTranslateY(containerDiv);
            floatRoute.setDownEvent(evt);
        };
        const handleTouchMove = (evt)=> {
            if(evt.touches && evt.touches.length > 1){
                return;
            }
            floatRoute.setCurrentEvent(evt);

            let diffY = floatRoute.getTotalDeltaY();
            // console.log('FloatDragDialog handleTouchMove=====>', '  ', diffY, '   ', floatRoute.getDeltaY());
            if(!canMove){
                if(Math.abs(diffY) > 2){
                    canMove = true;
                }
            }
            if(canMove){
                Event.stopPropagation(evt);

                let deltaY = floatRoute.getDeltaY();
                currDialogDivTranslateY +=deltaY;
                currContainerDivTranslateY +=deltaY;
                if(this._currShow === null){
                    this._currShow = this.isShow();
                }
                if(this._currShow){
                    if(currContainerDivTranslateY <= 0){
                        currContainerDivTranslateY = 0;
                    }else if(currContainerDivTranslateY >= containerDiv.clientHeight - offsetY){
                        currContainerDivTranslateY = containerDiv.clientHeight - offsetY;
                    }
                    containerDiv.style.webkitTransform = `translateY(${currContainerDivTranslateY}px)`;
                }else{
                    if(currDialogDivTranslateY <= Math.abs(this._containerDivMinTranslateY)){
                        currDialogDivTranslateY = Math.abs(this._containerDivMinTranslateY);
                    }else if(currDialogDivTranslateY >= this._dialogDivMaxTranslateY){
                        currDialogDivTranslateY = this._dialogDivMaxTranslateY;
                    }

                    dialogInfo.dialogDiv.style.webkitTransform = `translateY(${currDialogDivTranslateY}px)`;
                    if(this.refs.floatDragDialogTopTipContainer){
                        this.refs.floatDragDialogTopTipContainer.style.opacity = 0;
                    }
                }
            }
        };
        const handleTouchEnd = (evt)=> {
            if(evt.touches && evt.touches.length > 1){
                return;
            }
            if(canMove){
                canMove = false;

                console.log('floatRoute.getTotalDeltaY()=====>', floatRoute.getTotalDeltaY());
                if(this.isShow()){
                    if(Math.abs(floatRoute.getTotalDeltaY()) >= 40){
                        this._dismissLayout(true);
                    }else{
                        this._showLayout(true);
                    }
                }else{
                    if(Math.abs(floatRoute.getTotalDeltaY()) >= 40){
                        this._showLayout(true);
                    }else{
                        this._dismissLayout(true);
                    }
                }
            }
            floatRoute.reset();
            this._currShow = null;
        };
        const click = (e)=>{
            Event.stopPropagation(e);
            if(this.isShow()){
                this._dismissLayout(true);
            }else{
                this._showLayout(true);
            }
        };
        div.addEventListener('touchstart', handleTouchStart, { passive : false, capture:true, });
        div.addEventListener('touchmove', handleTouchMove, { passive : false, capture:true, });
        div.addEventListener('touchend', handleTouchEnd, { passive : false, capture:true, });
        div.addEventListener('touchcancel', handleTouchEnd, { passive : false, capture:true, });
        if(needBindClick){
            div.addEventListener('click', click);
        }
    };

    /**
     *
     */
    isShow = ()=>{
        const{dialogInfo} = this.props;
        return this._getTranslateY(dialogInfo.dialogDiv) === 0;
    };

    /**
     *
     * @param div
     * @private
     */
    _getTranslateY = (div)=>{
        let style = div.style;
        if(!style){
            return 0;
        }
        let transform = style.webkitTransform;
        if(transform){
            let translateY = transform.replaceAll('translateY', '').replaceAll('[(]', '').replaceAll('[)]', '').replaceAll('px', '');
            let translateYFloat = parseFloat(translateY) || 0;
            return translateYFloat;
        }
        return 0;
    };

    /**
     *
     * @param comp
     * @private
     */
    _setComp = (comp)=>{
        this.childComp = comp;
    };

    render(){
        const {data, showTip} = this.state;
        const {component, renderTip, offsetY} = this.props;
        let Comp = component;

        return(
            <div ref={'floatDragDialogContainer'}
                 className='float-drag-dialog-container'
                 style={{paddingBottom:StatusBar.navigationBarShowHeight}}
            >
                <div ref={'floatDragDialogTopContainer'} className='float-drag-dialog-top-container'></div>
                <div ref={'floatDragDialogContentContainer'}
                     className='float-drag-dialog-content-container'
                >
                    <Comp ref={this._setComp} {...data}/>
                </div>
                <div
                    ref={'floatDragDialogTopTipContainer'}
                    className='float-drag-dialog-top-tip-container'
                    style={{opacity:showTip?1:0, pointerEvents:showTip?'auto':'none', minHeight:showTip?offsetY:0}}>
                    {renderTip && renderTip()}
                </div>
            </div>
        );
    };

}


(function(global){
    if(!global.floatDragDialog){
        //
        global.floatDragDialog = (Component, option, that)=>{
            let{offsetX = 0, offsetY = 50, dismissListener, ...otherOption} = option;
            let dialogOption = {
                type:1,
                showAnim:'',
                dismissAnim:'',
                animChild:false,
                showMask:false,
                fitNavigationBar:false,
                containerStyle:{
                    top:`${StatusBar.statusBarHeight+44}px`,
                },
                contentStyle:{
                    // backgroundColor:'red',
                    justifyContent:'flex-end',
                    alignItems:'flex-end',
                },
                dismissListener:dismissListener,
                isDestroy:false,
                data:{
                    ...otherOption,
                    offsetY:offsetY+(Platform.select({ios:0, android:StatusBar.navigationBarShowHeight/2})),
                    component:Component,
                }
            };
            return window.showDialog(FloatDragDialog, dialogOption, that);
        };
    }
}(window));