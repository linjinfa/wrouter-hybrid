/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/2/13
 * Time: 09:23
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';
import '../Dialog';
import './OptionListDialog.css';

class OptionListDialog extends Component {

    static propTypes = {
        //标题
        title: PropTypes.string,
        //子标题
        subTitle: PropTypes.string,
        /**
         * 标题右边按钮
         */
        titleRight:PropTypes.object,
        /**
         * option Container样式
         */
        optionContainerStyle:PropTypes.object,
        //选项
        options: PropTypes.array,
        //选项点击
        itemClick: PropTypes.func,
        //底部取消
        cancel: PropTypes.object,
    };

    static defaultProps = {
        cancel:{
            txt:'取消'
        },
    };

    constructor(props){
        super(props);
        this.state = {
            ...this.props,
        };
    }

    /**
     *
     * @returns {*}
     * @private
     */
    _calSubTitleMarginTop = ()=>{
        let {title, subTitle} = this.state;
        let subTitleMarginTop = null;
        if(!title || !subTitle){
            subTitleMarginTop = 0;
        }
        return subTitleMarginTop;
    };

    /**
     * 渲染title
     * @private
     */
    _renderTitleContainer = ()=>{
        let {title, subTitle} = this.state;
        if(!title && !subTitle){
            return null;
        }
        let titles = [];
        if(title){
            titles.push(<span key={'option-list-dialog-title'} className='option-list-dialog-title'>{title}</span>);
        }
        if(subTitle){
            titles.push(<span key={'option-list-dialog-subtitle'} className='option-list-dialog-subtitle' style={{marginTop:this._calSubTitleMarginTop()}}>{subTitle}</span>);
        }
        return (
            <div className='option-list-dialog-title-container'>
                {titles}
            </div>
        );
    };

    /**
     * 渲染标题两边按钮
     * @private
     */
    _renderTitleBtn = ()=>{
        let btns = [];
        let {titleRight, dialogInfo} = this.props;
        if(titleRight && titleRight.txt){
            let _itemClick = ()=>{
                titleRight.click && titleRight.click(dialogInfo);
            };
            btns.push(<div key={'titleRight'} onClick={_itemClick} className='option-list-dialog-title-btn-container option-list-dialog-title-right-btn-container' style={titleRight.style}>{titleRight.txt}</div>);
        }
        return btns;
    };

    /**
     * 渲染选项
     * @private
     */
    _renderOption = ()=>{
        let {title, subTitle, options} = this.state;
        let {renderItem, itemClick, dialogInfo,lineStyle} = this.props;
        if(options && options.length > 0){
            let items = [];
            for(let index = 0; index < options.length; index++){
                let option = options[index];
                option.style = option.style||{};
                if(index === 0){
                    if(!title && !subTitle){
                        option.style.marginTop = 10;
                    }
                }
                let _itemClick = ()=>{
                    if(itemClick){
                        itemClick(dialogInfo, index, option, options);
                        this.setState({options:Object.clone(options)});
                    }
                };

                if(!renderItem){
                    if(!option.style.height){
                        option.style.height = 55;
                    }
                }
                let _itemDiv = (
                    <div key={`option-list-dialog-option-item-${index+1}`}
                         className='option-list-dialog-option-item'
                         style={option.style}
                         onClick={_itemClick}>
                        {renderItem ? renderItem(dialogInfo, index, option) : option.txt}
                    </div>
                );
                items.push(_itemDiv);

                if(index !== options.length - 1){
                    let lineDiv = (
                        <div key={`option-list-dialog-horizontal-line-item-${index+1}`}
                             style={lineStyle}
                             className='option-list-dialog-horizontal-line'>
                        </div>
                    );
                    items.push(lineDiv);
                }
            }
            return items;
        }
    };

    /**
     * 底部取消按钮
     * @private
     */
    _renderCancel = ()=>{
        let {cancel} = this.state;
        let {dialogInfo} = this.props;
        if(cancel && cancel.txt){
            let click = ()=>{
                if(cancel.click){
                    cancel.click(dialogInfo);
                }else{
                    window.dismissDialog(dialogInfo);
                }
            };
            return (
                <div className='option-list-dialog-cancel' style={cancel.style} onClick={click}>{cancel.txt}</div>
            );
        }
    };

    render(){
        const {optionContainerStyle} = this.props;
        return (
            <div className='option-list-dialog-container'>
                <div className='option-list-dialog-top-container'>
                    {this._renderTitleContainer()}
                    <div className='option-list-dialog-option-container' style={{...optionContainerStyle}}>
                        {this._renderOption()}
                    </div>
                    {this._renderTitleBtn()}
                </div>

                {this._renderCancel()}
            </div>
        );
    }

}

(function(global){
    if(!global.optionListDialog){
        global.optionListDialog = (option, that, isDestroy = true)=>{
            let{dismissListener, ...otherOption} = option;
            let dialogOption = {
                doMasAnim:true, //执行遮罩动画
                showAnim:'dialog-bottom-pop-in',
                dismissAnim:'dialog-bottom-pop-out',
                gravity:'flex-end',
                dismissListener:dismissListener,
                isDestroy:isDestroy,
                data:{...otherOption}
            };
            return window.showDialog(OptionListDialog, dialogOption, that);
        };
    }
}(window));
