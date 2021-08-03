/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/21
 * Time: 11:04
 */
import WRouter, {getRouteHistoryLength} from '../WRouter';
import {popAllDialogByRoute} from '../dialog/Dialog';
import './Page-Anim.css';

const DURATION = '.4s';

/**
 *
 * @param e
 * @param div
 */
const webkitAnimationEndWrapperFunc = (div, translateX, callback)=>{
    const webkitAnimationEndFunc = (e)=>{
        div.removeEventListener('webkitAnimationEnd', webkitAnimationEndFunc);
        div.style.webkitAnimation = '';
        div.style.webkitTransform = `translateX(${translateX})`;
        callback && callback();
    };
    return webkitAnimationEndFunc;
};

/**
 * 跳转动画
 */
export function navigationAnim(option, callback){
    let count = getRouteHistoryLength();
    if(count <= 1){
        callback && callback();
        return;
    }
    let currRouteDiv;
    let currRoutePath = WRouter.getCurrRoutePath();
    if(currRoutePath){
        currRouteDiv = document.getElementById(currRoutePath);
    }

    let lastRouteDiv;
    let lastRoutePath = WRouter.getLastRoutePath();
    if(lastRoutePath){
        lastRouteDiv = document.getElementById(lastRoutePath);
    }

    let currRouteWebkitAnimationEnd = webkitAnimationEndWrapperFunc(currRouteDiv, '0%', callback);
    let lastRouteWebkitAnimationEnd = webkitAnimationEndWrapperFunc(lastRouteDiv, '-100%');

    if(option){
        let enterAnim = 'right-in';
        let exitAnim = 'left-out';
        if(option.enterAnim !== undefined){
            enterAnim = option.enterAnim;
        }
        if(option.exitAnim !== undefined){
            exitAnim = option.exitAnim;
        }

        if(!window.WRouter.enableRouterAnim){   //禁用动画
            enterAnim = undefined;
            exitAnim = undefined;
        }

        if(enterAnim){
            currRouteDiv.addEventListener('webkitAnimationEnd', currRouteWebkitAnimationEnd);
            currRouteDiv.style.webkitAnimation = `${enterAnim} ${DURATION} 1 both`;
        }else{
            currRouteWebkitAnimationEnd();
        }
        if(exitAnim){
            lastRouteDiv.addEventListener('webkitAnimationEnd', lastRouteWebkitAnimationEnd);
            lastRouteDiv.style.webkitAnimation = `${exitAnim} ${DURATION} 1 both`;
        }else{
            lastRouteWebkitAnimationEnd();
        }
    }else{
        currRouteWebkitAnimationEnd();
        lastRouteWebkitAnimationEnd();
    }
}

/**
 * 删除 keyframes
 * @param name
 */
function deleteCSSKeyframes(name) {
    if(name.lastIndexOf('-route-generate') < 0){
        return;
    }
    let style = document.styleSheets[0];
    let count = style.cssRules.length;
    for(let index = 0; index < count; index++){
        let cssRule = style.cssRules[index];
        if(cssRule.name === name){
            style.deleteRule(index);
            break;
        }
    }
}

/**
 *
 */
function createCSSKeyframes(fromTranslateX, toTranslateX, nameSuffix) {
    let style = document.styleSheets[0];
    let name = `${nameSuffix}-keyframes-route-generate`;
    style.insertRule(createKeyframes(fromTranslateX, toTranslateX, name), 0);
    return name;
}

/**
 *
 * @param fromTranslateX
 * @param toTranslateX
 * @param nameSuffix
 * @returns {string}
 */
function createKeyframes(fromTranslateX, toTranslateX, name) {
    return `@-webkit-keyframes ${name} {0%{transform:translateX(${fromTranslateX});} 100%{transform:translateX(${toTranslateX});}}`;
}

/**
 * 返回动画
 */
export function backAnim(option, animationStartCallback, animationEndCallback){
    let count = getRouteHistoryLength();
    if(count <= 1){
        return;
    }
    let closePaths = [];
    for(let index = count - option.n; index < count; index++){
        let _path = WRouter.getRoutePath(index);
        if(_path){
            closePaths.push(_path);
        }else{
            console.log('backAnim 获取路由路径异常 index: ', index);
            return;
        }
    }
    let currDivCSSName = 'right-out';
    let lastDivCSSName = 'left-in';
    if(option.currRouteDivTranslateX){
        currDivCSSName = createCSSKeyframes(option.currRouteDivTranslateX, '100%', 'right-out');
    }
    if(option.lastRouteDivTranslateX){
        lastDivCSSName = createCSSKeyframes(option.lastRouteDivTranslateX, '0%', 'left-in');
    }

    //当前路由
    let currRouteDiv;
    let currRoutePath = closePaths[closePaths.length - 1];
    if(currRoutePath){
        currRouteDiv = document.getElementById(currRoutePath);
    }

    //目标路由
    let targetRouteDiv;
    let targetRoutePath = WRouter.getRoutePath(count - option.n - 1);
    if(targetRoutePath){
        targetRouteDiv = document.getElementById(targetRoutePath);
    }

    //
    animationStartCallback && animationStartCallback(currRoutePath, currRouteDiv, targetRoutePath, targetRouteDiv, closePaths);

    let currRouteWebkitAnimationEnd = webkitAnimationEndWrapperFunc(currRouteDiv, '100%', ()=>{
        animationEndCallback && animationEndCallback(currRoutePath, currRouteDiv, targetRoutePath, targetRouteDiv, closePaths);
        deleteCSSKeyframes(currDivCSSName);
    });
    let targetRouteWebkitAnimationEnd = webkitAnimationEndWrapperFunc(targetRouteDiv, '0%', ()=>{
        deleteCSSKeyframes(lastDivCSSName);
    });

    //返回 暂时不支持自定义动画
    let enterAnim = currDivCSSName;
    let exitAnim = lastDivCSSName;
    if(option.enterAnim !== undefined){
        enterAnim = option.enterAnim;
    }
    if(option.exitAnim !== undefined){
        exitAnim = option.exitAnim;
    }

    if(!window.WRouter.enableRouterAnim){   //禁用动画
        enterAnim = undefined;
        exitAnim = undefined;
    }

    if(enterAnim){
        currRouteDiv.addEventListener('webkitAnimationEnd', currRouteWebkitAnimationEnd);
        currRouteDiv.style.webkitAnimation = `${currDivCSSName} ${DURATION} 1 both`;
    }else{
        currRouteWebkitAnimationEnd();
    }
    if(exitAnim){
        targetRouteDiv.addEventListener('webkitAnimationEnd', targetRouteWebkitAnimationEnd);
        targetRouteDiv.style.webkitAnimation = `${lastDivCSSName} ${DURATION} 1 both`;
    }else{
        targetRouteWebkitAnimationEnd();
    }
}

/**
 * 右滑返回
 * @param div
 */
export function pageTouch(div, currPath, lastPath) {
    let lastRouteDiv;
    let startX;
    let canMove = false;
    let currRouteDivTranslateX;
    let lastRouteDivTranslateX;
    const handleTouchStart = function(evt) {
        if(evt.touches && evt.touches.length > 1){
            return;
        }
        startX = evt.touches ? evt.touches[0].screenX : evt.screenX;
        if(!lastRouteDiv){
            lastRouteDiv = document.getElementById(lastPath);
        }
    };
    const handleTouchMove = function(evt) {
        if(evt.touches && evt.touches.length > 1){
            return;
        }
        let moveX = evt.touches ? evt.touches[0].screenX : evt.screenX;
        let diffX = moveX - startX;
        // console.log('PageAnimation handleTouchMove=====>', ' startX: ', startX, ' moveX: ', moveX, '  currPath: ', currPath, '  lastPath: ', lastPath);
        if(!canMove){
            if(startX > -1 && startX <= 50 && diffX > 0){
                canMove = true;
            }
        }
        if(canMove){
            Event.stopPropagation(evt);
            currRouteDivTranslateX = `${Math.max(diffX/div.clientWidth * 100, 0)}%`;
            lastRouteDivTranslateX = `-${Math.min((1 - diffX/div.clientWidth) * 100, 100)}%`;
            div.style.webkitTransform = `translateX(${currRouteDivTranslateX})`;
            if(lastRouteDiv){
                lastRouteDiv.style.webkitTransform = `translateX(${lastRouteDivTranslateX})`;
            }
        }
    };
    const handleTouchEnd = function(evt) {
        if(evt.touches && evt.touches.length > 1){
            return;
        }
        if(canMove){
            Event.stopPropagation(evt);
            canMove = false;
            let currRouteDivTranslateXFloat = parseInt(currRouteDivTranslateX);
            if(currRouteDivTranslateXFloat >= 30){  //back
                popAllDialogByRoute(WRouter.getCurrRoutePath());
                WRouter.back({n:1, currRouteDivTranslateX, lastRouteDivTranslateX});
            }else{  //还原
                currRouteDivTranslateX = `0%`;
                lastRouteDivTranslateX = `-100%`;
                div.style.webkitTransform = `translateX(${currRouteDivTranslateX})`;
                if(lastRouteDiv){
                    lastRouteDiv.style.webkitTransform = `translateX(${lastRouteDivTranslateX})`;
                }
            }
        }
        startX = -1;
    };
    div.addEventListener('touchstart', handleTouchStart, { passive : false, capture:true, });
    div.addEventListener('touchmove', handleTouchMove, { passive : false, capture:true, });
    div.addEventListener('touchend', handleTouchEnd, { passive : false, capture:true, });
    div.addEventListener('touchcancel', handleTouchEnd, { passive : false, capture:true, });
    //
    div.pageDisableTouch = ()=>{
        div.removeEventListener('touchstart', handleTouchStart, { passive : false, capture:true, });
        div.removeEventListener('touchmove', handleTouchMove, { passive : false, capture:true, });
        div.removeEventListener('touchend', handleTouchEnd, { passive : false, capture:true, });
        div.removeEventListener('touchcancel', handleTouchEnd, { passive : false, capture:true, });
    };
}

/**
 * 禁用touch
 * @param div
 * @param currPath
 * @param lastPath
 */
export function pageDisableTouch(div, currPath, lastPath) {
    if(div && div.pageDisableTouch){
        div.pageDisableTouch();
    }
}