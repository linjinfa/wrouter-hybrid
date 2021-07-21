/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 11:41
 */

import React from 'react';
import ReactDOM from 'react-dom';

import '../Router.css';
import WRouter, {
    getRouteHistoryLength,
    mappingRoutePathComp,
    navigationAimEnd,
    dispatchOnPause,
    createRouteDiv,
    unmountRouteDiv,
    notifyRouteChangeBefore,
    notifyRouteChangeAfter,
} from '../WRouter';
import {navigationAnim} from '../animations/PageAnimation';

/**
 *
 * @type {Array}
 */
const routerWaitQueue = [];

/**
 *
 * @type {boolean}
 * @private
 */
let _isRouteExecuting = false;

/**
 *
 * @private
 */
const _continueRouter = (callback)=>{
    if(routerWaitQueue.length <= 0){
        return;
    }
    let nextWRouteMeta = routerWaitQueue[0];
    if(nextWRouteMeta){
        routerWaitQueue.remove(0);
        GoRouterInterceptor(nextWRouteMeta, callback);
    }
};

/**
 * 路由跳转
 * @param wRouteMeta
 * @param callback
 * @constructor
 */
export default function GoRouterInterceptor(wRouteMeta, callback) {
    console.log("GoRouterInterceptor=======> ", wRouteMeta);
    let realPath = WRouter.getRealRoutePath(wRouteMeta.path);
    let routeInfo = WRouter.getRouteInfo(realPath);
    if(!routeInfo){
        console.error('找不到路由：', realPath);
        return;
    }
    let Component = routeInfo.component;
    if(!Component){
        console.error(`请设置 ${realPath} 的界面组件`);
        return;
    }
    if(_isRouteExecuting){
        routerWaitQueue.push(wRouteMeta);
        return;
    }
    _isRouteExecuting = true;

    //单例
    unmountRouteDiv(realPath);

    //路由变更前
    dispatchOnPause(WRouter.getCurrRoutePath());
    notifyRouteChangeBefore(WRouter.getCurrRoutePath(), wRouteMeta.path);

    let wrapped = WRouter.wrapped;
    if(typeof wrapped === 'function'){
        Component = wrapped(Component, wRouteMeta);
    }

    let routerDiv = createRouteDiv(wRouteMeta, routeInfo);

    let comp = ReactDOM.render(<Component/>, routerDiv, ()=>{
        // console.log('compcomp render=====>');
        // navigationAnim(wRouteMeta);
    });
    if(!comp){
        console.error('[ReactDOM.render] 渲染获取界面实例失败');
    }
    //
    mappingRoutePathComp(wRouteMeta.path, comp);
    //
    navigationAnim(wRouteMeta, ()=>{
        // console.log('navigationAnim callback====>');
        navigationAimEnd();
        _isRouteExecuting = false;
        //
        _continueRouter(callback);
    });

    //路由变更后
    notifyRouteChangeAfter(WRouter.getCurrRoutePath(), WRouter.getLastRoutePath());
};