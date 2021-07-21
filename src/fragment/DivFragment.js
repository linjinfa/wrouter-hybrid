/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/3/5
 * Time: 17:12
 */

import React, {Component} from "react";
import ReactDOM from 'react-dom';
import './DivFragment.css';
import '../animations/Page-Anim.css';

const OPTION = {
    /**
     *
     */
    showAnim:'right-in',
    /**
     *
     */
    dismissAnim:'',
    /**
     * 自定义参数
     */
    data:{},
};

/**
 *
 * @type {string}
 */
const DURATION = '.2s';

/**
 * 执行动画
 * @param div
 * @param anim
 * @private
 */
const _execAnim = (div, anim)=>{
    if(anim){
        div.style.webkitAnimation = `${anim} ${DURATION} forwards`;
    }else{
        div.style.webkitAnimation = '';
    }
};

/**
 *
 */
const createFragmentDiv = (containerDiv, option)=>{
    let fragmentInfo;
    let fragmentDiv = document.createElement('div');
    fragmentDiv.setAttribute('tabindex', '-1');
    fragmentDiv.className = 'div-fragment-container';
    fragmentDiv.id = `div-fragment-${new Date().getTime()}`;
    fragmentDiv.focus();

    containerDiv.appendChild(fragmentDiv);

    fragmentInfo = {
        containerDiv,
        fragmentDiv,
        option,
    };

    return fragmentInfo;
};

/**
 *
 * @private
 */
const _showFragment = (containerDiv, Component, option = OPTION, that)=>{
    option = Object.assign({...OPTION}, option);
    let fragmentInfo = createFragmentDiv(containerDiv, option);

    let comp = ReactDOM.render(<Component {...option.data} fragmentInfo={fragmentInfo}/>, fragmentInfo.fragmentDiv, ()=>{
        if(containerDiv.childNodes.length > 1){
            //执行动画 只有新的页面执行动画 当前页面不做左边滑出动画  后续需要当前页面需要动画 再迭代开发
            _execAnim(fragmentInfo.fragmentDiv, option.showAnim);
        }
    });
};

(function(global){
    if(!global.showFragment){
        global.showFragment = _showFragment
    }
}(window));