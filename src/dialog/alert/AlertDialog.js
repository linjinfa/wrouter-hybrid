/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/2/12
 * Time: 22:26
 */
import React, {Component} from "react";
import PropTypes from 'prop-types'
import '../Dialog';
import './AlertDialog.css';

import ICON_POP_CLOSE from '../assets/icon_pop_close.svg';

/**
 *
 */
class AlertDialog extends Component {

    static propTypes = {
        //是否显示关闭
        showClose: PropTypes.bool,
        //标题
        title: PropTypes.string,
        //子标题
        subTitle: PropTypes.string,
        //左边按钮文案
        leftBtnTxt: PropTypes.string,
        //左边按钮样式
        leftBtnStyle: PropTypes.object,
        //左边按钮点击
        leftClick: PropTypes.func,
        //右边按钮文案
        rightBtnTxt: PropTypes.string,
        //右边按钮样式
        rightBtnStyle: PropTypes.object,
        //右边按钮点击
        rightClick: PropTypes.func,
    };

    static defaultProps = {
        showClose:false,
        title:'温馨提示',
        leftBtnTxt:'取消',
        rightBtnTxt:'确定',
    };

    constructor(props){
        super(props);
        this.state = {...this.props};
    }

    /**
     *
     * @private
     */
    _leftClick = (e)=>{
        let { leftClick, dialogInfo } = this.props;
        leftClick && leftClick(dialogInfo);
    };

    /**
     *
     * @private
     */
    _rightClick = (e)=>{
        let { rightClick, dialogInfo } = this.props;
        rightClick && rightClick(dialogInfo);
    };

    /**
     * 底部按钮
     * @private
     */
    _renderButton = ()=>{
        let {leftBtnTxt, leftBtnStyle, rightBtnTxt, rightBtnStyle} = this.state;

        let btns = [];
        if(leftBtnTxt){
            if(!rightBtnTxt){
                if(!leftBtnStyle){
                    leftBtnStyle = {}
                }
                leftBtnStyle.marginRight = 0
            }
            btns.push(<span key={'alert-dialog-bottom-left-button'}
                            className='alert-dialog-bottom-button alert-dialog-bottom-left-button'
                            style={leftBtnStyle}
                            onClick={this._leftClick}>{leftBtnTxt}</span>);
        }
        if(rightBtnTxt){
            btns.push(<span key={'alert-dialog-bottom-right-button'}
                            className='alert-dialog-bottom-button alert-dialog-bottom-right-button'
                            style={rightBtnStyle}
                            onClick={this._rightClick}>{rightBtnTxt}</span>);
        }
        return btns;
    };

    /**
     *
     * @returns {XML}
     * @private
     */
    _renderTitle = ()=>{
        let {title, subTitle} = this.state;
        if(title){
            return (
                <span className='alert-dialog-title'>{title}</span>
            );
        }
    };

    /**
     *
     * @returns {XML}
     * @private
     */
    _renderSubTitle = ()=>{
        let {title, subTitle,isCheckCommon} = this.state;
        if(subTitle){
            if((subTitle.indexOf('<') >= 0 && subTitle.indexOf('</') >= 0) || subTitle.indexOf('<br/>') >= 0){
                if (isCheckCommon === true){
                    return (
                        <div
                            className="alert-dialog-subtitle-container"
                        >
                            <div className='alert-dialog-subtitle-xiong'>
                                <span dangerouslySetInnerHTML={{__html: subTitle}}></span>
                            </div>
                        </div>
                    );
                }
                return (
                    <div className='alert-dialog-subtitle'>
                        <span dangerouslySetInnerHTML={{__html: subTitle}}></span>
                    </div>
                );
            }
            return (
                <span className='alert-dialog-subtitle'>{subTitle}</span>
            );
        }
    };

    /**
     *
     * @private
     */
    _renderContent = ()=>{
        let {renderContent} = this.state;
        if(renderContent){
            return (
                <div className='alert-dialog-content-container'>
                    {renderContent()}
                </div>
            );
        }
    };

    /**
     *
     * @private
     */
    _renderClose = ()=>{
        let {showClose} = this.state;
        if(showClose){
            return (
                <img
                    className='alert-dialog-close-img'
                    src={ICON_POP_CLOSE}
                    alt=" "
                    onClick={()=>{
                        this._dismiss();
                        let { closeClick } = this.props;
                        closeClick && closeClick();
                    }}
                />
            );
        }
    };

    /**
     *
     * @private
     */
    _dismiss = ()=>{
        let { dialogInfo } = this.props;
        window.dismissDialog(dialogInfo);
    };

    render(){
        return (
            <div className='alert-dialog-container'>
                {this._renderTitle()}
                {this._renderClose()}
                {this._renderSubTitle()}
                {this._renderContent()}
                <div className='alert-dialog-bottom-container'>
                    {this._renderButton()}
                </div>
            </div>
        );
    }

}

(function(global){
    if(!global.alertDialog){
        global.alertDialog = (option, that)=>{
            let dialogOption = {
                doMasAnim:true, //执行遮罩动画
                fitNavigationBar:false,
                canceledOnTouchOutside:option.canceledOnTouchOutside,
                dismissListener:option.dismissListener,
                data:{...option}
            };
            if(option.native === true){
                window.nativeAlertDialog && window.nativeAlertDialog(option);
                return;
            }
            return window.showDialog(AlertDialog, dialogOption, that);
        };
        global.AlertDialogStyle = {
            //默认背景灰色
            BUTTON_STYLE_BG_GREY:{
                backgroundColor:'#F1F4FF',
                color:'#AAAAAA'
            },
            //默认背景红色
            BUTTON_STYLE_BG_RED:{
                backgroundColor:'#FFF8F9',
                color:'#FF4266'
            },
            //默认背景蓝色
            BUTTON_STYLE_BG_BLUE:{
                backgroundColor:'#4F7AFD',
                color:'#FFFFFF'
            },
        };
    }
}(window));
