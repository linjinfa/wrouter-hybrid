/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/3/20
 * Time: 16:48
 */
import React, {Component} from "react";
import PropTypes from 'prop-types';

import './PickerDialog.css';
import {
    HPicker,
    HDatePicker,
} from 'components-hybrid/es/components';

/**
 *
 */
class PickerDialog extends Component{

    constructor(props){
        super(props);
    }

    /**
     * Dialog显示时回调
     */
    onShow = ()=>{
        let picker = this.refs.picker;
        picker && picker.restore();
    };

    render(){
        const { datePicker } = this.props;
        let Comp = datePicker ? HDatePicker : HPicker;

        return (
            <div className='picker-dialog-container'>
                <Comp
                    ref={'picker'}
                    {...this.props}
                />
            </div>
        );
    }

}

(function(global){
    if(!global.pickerDialog){
        //
        global.pickerDialog = (option, that, isDestroy = true)=>{
            let dialogOption = {
                showAnim:'dialog-bottom-pop-in',
                dismissAnim:'dialog-bottom-pop-out',
                gravity:'flex-end',
                isDestroy:isDestroy,
                data:{...option}
            };
            return window.showDialog(PickerDialog, dialogOption, that);
        };

        //
        global.datePickerDialog = (option, that, isDestroy = true)=>{
            option.datePicker = true;
            return global.pickerDialog(option, that, isDestroy);
        };
    }
}(window));
