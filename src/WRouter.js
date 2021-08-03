/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/14
 * Time: 10:55
 */
import WRouterInterceptorChain from './interceptors/WRouterInterceptorChain';
import {backAnim, pageTouch, pageDisableTouch} from './animations/PageAnimation';
import ReactDOM from 'react-dom';

/**
 * 路由拦截器
 * @type {Array}
 */
const routeCustomInterceptors = [];

/**
 * 路由变更监听
 * @type {Array}
 */
const routeChangeListeners = [];

/**
 * 路由栈
 * @type {Array}
 */
const routeStackList = [];

/**
 *
 * @type {{}}
 */
export const allRouteMap = {};

/**
 * 是否启用界面切换动画
 * @type {boolean}
 * @private
 */
let _enableRouterAnim = true;

/**
 *
 * @type {null}
 * @private
 */
let _wrapped = null;

let rootDiv;

function getRootDiv() {
    if(!rootDiv){
        rootDiv = document.getElementById('root');
    }
    return rootDiv;
}

/**
 * 拼接路由路径
 * @param parentPath
 * @param childPath
 * @returns {*}
 */
function getRoutePath(parentPath, childPath) {
    if (childPath[0] !== '/') {
        childPath = '/' + childPath;
    }
    return parentPath + childPath;
}

/**
 * 加入路由
 */
export function pushRouteHistory(path){
    routeStackList.push({path});
    // window.location.hash = `#${WRouter.getCurrRoutePath()}`;
    // console.log('pushRouteHistory=====>', routeStackList);
};

/**
 * 弹出最后一个路由
 */
export function popRouteHistory(path){
    let index = routeStackList.length - 1;
    if(path){
        index = findTargetRouteIndex(path);
    }
    if(index > -1){
        routeStackList.splice(index, 1);
    }
    // console.log('popRouteHistory=====>', routeStackList);
    // window.location.hash = `#${WRouter.getCurrRoutePath()}`;
};

/**
 *
 */
export function getRouteRecordByPath(path) {
    for (let routeRecord of routeStackList) {
        if(routeRecord.path === path){
            return routeRecord;
        }
    }
}

/**
 *
 * @param path
 * @param comp
 */
export function mappingRoutePathComp(path, comp) {
    if(path && comp){
        let routeRecord = getRouteRecordByPath(path);
        if(routeRecord){
            routeRecord.comp = comp;
        }
    }
};

/**
 *
 */
export function navigationAimEnd() {
    dispatchComponentDidMountAnimEnd(WRouter.getCurrRoutePath());
    dispatchOnResume(WRouter.getCurrRoutePath());
};

/**
 *
 */
const dispatchComponentDidMountAnimEnd = (path)=>{
    let routeRecord = getRouteRecordByPath(path);
    if(routeRecord){
        let comp = routeRecord.comp;
        comp && comp.componentDidMountAnimEnd && comp.componentDidMountAnimEnd();
    }
};

/**
 *
 */
const dispatchOnResume = (path)=>{
    let routeRecord = getRouteRecordByPath(path);
    if(routeRecord){
        let comp = routeRecord.comp;
        comp && comp.onResume && comp.onResume();
    }
};

/**
 *
 */
export function dispatchOnPause(path){
    let routeRecord = getRouteRecordByPath(path);
    if(routeRecord){
        let comp = routeRecord.comp;
        comp && comp.onPause && comp.onPause();
    }
};


/**
 * 通知路由变更之前
 * @param currRoutePath 当前路由
 * @param nextRoutePath 即将进入的路由
 */
export function notifyRouteChangeBefore(currRoutePath, nextRoutePath, extOption){
    // console.log('notifyRouteChangeBefore====> currRoutePath: ', currRoutePath, '  nextRoutePath: ', nextRoutePath);
    for(let listener of routeChangeListeners){
        let routeChangeBefore = listener.routeChangeBefore;
        if(typeof routeChangeBefore === 'function'){
            routeChangeBefore(currRoutePath, nextRoutePath, extOption);
        }
    }
}

/**
 * 通知路由变更之后
 * @param currRoutePath 当前路由
 * @param lastRoutePath 上一个路由
 */
export function notifyRouteChangeAfter(currRoutePath, lastRoutePath, extOption){
    // console.log('notifyRouteChangeAfter====> currRoutePath: ', currRoutePath, '  lastRoutePath: ', lastRoutePath);
    let length = getRouteHistoryLength();
    if(length === 1){
        rightSlideSwitch(true);
    }else{
        rightSlideSwitch(false);
    }

    for(let listener of routeChangeListeners){
        let routeChangeAfter = listener.routeChangeAfter;
        if(typeof routeChangeAfter === 'function'){
            routeChangeAfter(currRoutePath, lastRoutePath, extOption);
        }
    }
}

/**
 * 右滑开关
 */
function rightSlideSwitch(enable) {
    if(isiOS()){
        window.mapi.actions('native-interactive-pop',{
            data:{
                enable:enable
            }
        });
    }
}

/**
 *
 * @returns {Number}
 */
export function getRouteHistoryLength() {
    return routeStackList.length;
}

/**
 *
 */
export function createRouteDiv(wRouteMeta, originRouteInfo){
    let path = wRouteMeta.path;
    let swipeRight = originRouteInfo.swipeRight;
    if(swipeRight === undefined || swipeRight === null){    //默认开启
        swipeRight = true;
    }

    let rootDiv = getRootDiv();
    let routerDiv = document.createElement('div');
    routerDiv.setAttribute('tabindex', '-1');
    routerDiv.className = 'route-container';
    routerDiv.id = path;
    rootDiv.appendChild(routerDiv);
    routerDiv.focus();
    pushRouteHistory(path);

    if(swipeRight && getRouteHistoryLength() > 1 && isiOS()){
        pageTouch(routerDiv, path, WRouter.getLastRoutePath());
    }

    return routerDiv;
}

/**
 *
 * @returns {boolean}
 */
function isiOS() {
    let u = navigator.userAgent;
    let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/); //ios终端
    return isiOS;
}

/**
 *
 * @param unmountRoutePath
 */
export function unmountRouteDiv(unmountRoutePath){
    let unmountRouteDiv = document.getElementById(unmountRoutePath);
    if(unmountRouteDiv){
        let root = getRootDiv();
        root.removeChild(unmountRouteDiv);
        ReactDOM.unmountComponentAtNode(unmountRouteDiv);
        popRouteHistory(unmountRoutePath);
    }
}

/**
 * 加载路由配置
 */
const loadRouteConfig = (routeConfig, wrapped)=>{
    _wrapped = wrapped;
    for(let routeInfo of routeConfig){
        for(let routeItemInfo of routeInfo.children){
            let realItemRoutePath = getRoutePath(routeInfo.path, routeItemInfo.path);
            routeItemInfo.path = realItemRoutePath;
            allRouteMap[`${realItemRoutePath}`] = routeItemInfo;
        }
    }
    console.log("loadRouteConfig222=======>", allRouteMap);
};

/**
 * 处理hash变化
 */
const handleHashChange = (event) =>{
    console.log("当前hash值：", window.location.hash);
    WRouter.navigation({
        path:window.location.hash
    });
};

/**
 * 查找路由index
 * @param routePath
 */
export function findTargetRouteIndex(targetRoutePath){
    for (let index = 0; index < routeStackList.length; index++) {
        let route = routeStackList[index];
        if(route.path === targetRoutePath){
            return index;
        }
    }
    return -1;
};

const WRouter = {

    /**
     *
     */
    init: function (routeConfig, wrapped) {
        loadRouteConfig(routeConfig, wrapped);
        handleHashChange();
    },

    /**
     * 是否启用界面切换动画
     * @param enableRouterAnim
     */
    set enableRouterAnim(enableRouterAnim){
        _enableRouterAnim = enableRouterAnim;
    },

    /**
     * 获取界面切换动画是否启用
     * @returns {*}
     */
    get enableRouterAnim(){
        return _enableRouterAnim;
    },

    /**
     *
     * @returns {null}
     */
    get wrapped(){
        return _wrapped;
    },

    /**
     * 路由拦截器
     * @returns {Array}
     */
    get routeCustomInterceptors(){
        return routeCustomInterceptors;
    },
    /**
     * 注册路由拦截器
     */
    registerRouteInterceptor: function (listener) {
        if(listener){
            let index = routeCustomInterceptors.indexOf(listener);
            if(index === -1){
                routeCustomInterceptors.push(listener);
            }
        }
    },
    /**
     * 注册路由变更监听
     */
    registerRouteChangeListener: function (listener) {
        if(listener){
            let index = routeChangeListeners.indexOf(listener);
            if(index === -1){
                routeChangeListeners.push(listener);
            }
        }
    },
    /**
     * 反注册路由变更监听
     */
    unRegisterRouteChangeListener: function (listener) {
        if(listener){
            let index = routeChangeListeners.indexOf(listener);
            if(index > -1){
                routeChangeListeners.splice(index, 1);
            }
        }
    },
    /**
     * 根据路径获取路由信息
     * @param path
     * @returns {*}
     */
    getRouteInfo:function(path){
        return allRouteMap[path];
    },
    /**
     *
     */
    getRealRoutePath:function (path) {
        if(path && path.indexOf('@') >= 0){
            return path.substring(0, path.indexOf('@'));
        }
        return path;
    },
    /**
     * 获取当前路由路径
     * @param path
     * @returns {*}
     */
    getCurrRoutePath:function(){
        let route = routeStackList[routeStackList.length - 1];
        if(route){
            return route.path;
        }
    },
    /**
     * 获取上一个路由路径
     * @param path
     * @returns {*}
     */
    getLastRoutePath:function(){
        let route = routeStackList[routeStackList.length - 2];
        if(route){
            return route.path;
        }
    },
    /**
     * 获取路由路径
     * @param path
     * @returns {*}
     */
    getRoutePath:function(index){
        let route = routeStackList[index];
        if(route){
            return route.path;
        }
    },
    /**
     * 跳转
     * @param routeInfo
     */
    navigation: function (wRouteMeta, timeout = false) {
        if(timeout){
            setTimeout(()=>{
                new WRouterInterceptorChain().run(wRouteMeta);
            }, 0);
        }else{
            new WRouterInterceptorChain().run(wRouteMeta);
        }
    },
    /**
     * 根据路由结束页面 无动画
     */
    finishNoAnim: function (routePathList = []) {
        if(routePathList && routePathList.length > 0){
            //路由变更前
            notifyRouteChangeBefore(WRouter.getCurrRoutePath(), null);

            for(let path of routePathList){
                unmountRouteDiv(path);
            }

            //路由变更后
            let currRoutePath = WRouter.getCurrRoutePath();
            notifyRouteChangeAfter(currRoutePath, null);
            if(getRouteHistoryLength() === 1){
                let routeDiv = document.getElementById(currRoutePath);
                pageDisableTouch(routeDiv, currRoutePath);
            }
        }
    },
    /**
     * 返回
     */
    back: function (option = {n:1, targetRoutePath:undefined, requestCode:undefined, data:undefined, enterAnim:undefined, exitAnim:undefined}) {
        if(option.targetRoutePath){
            let index = findTargetRouteIndex(option.targetRoutePath);
            // console.log('option=====>', routeStackList, '  ', option.targetRoutePath, '  ', index);
            if(index >= 0){
                option.n = routeStackList.length - (index + 1)
            }else{
                option.n = 1;
            }
        }
        if(option.n === undefined || option.n <= 0){
            option.n = 1;
        }
        //
        window.dismissKeyboardDialog && window.dismissKeyboardDialog(false);

        if(routeStackList.length > 1){
            //
            let extOption = {back:true, requestCode:option.requestCode, data:option.data};

            //回退动画开始
            let animationStartCallback = (currRoutePath, currRouteDiv, targetRoutePath, targetRouteDiv, closePaths)=>{
                targetRouteDiv.focus();

                //路由变更之前
                dispatchOnPause(currRoutePath);
                notifyRouteChangeBefore(currRoutePath, targetRoutePath, extOption);
            };

            //回退动画结束
            let animationEndCallback = (currRoutePath, currRouteDiv, targetRoutePath, targetRouteDiv, closePaths)=>{
                for(let path of closePaths){
                    unmountRouteDiv(path);
                }

                //路由变更之后
                dispatchOnResume(targetRoutePath);
                notifyRouteChangeAfter(targetRoutePath, currRoutePath, extOption);
            };
            backAnim(option, animationStartCallback, animationEndCallback);
            return true;
        }
        return false;
    },
};

export default WRouter;