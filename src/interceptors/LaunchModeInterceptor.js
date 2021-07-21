/**
 * 启动模式 可选值：singleTask
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 12:46
 */
import WRouter,{allRouteMap, findTargetRouteIndex} from '../WRouter';

/**
 *
 * @param wRouteMeta
 * @param callback
 */
function singleTask(wRouteMeta, callback) {
    let routeDiv = document.getElementById(wRouteMeta.path);
    if(!routeDiv){
        callback.onContinue();
        return;
    }
    let targetIndex = findTargetRouteIndex(wRouteMeta.path);
    if (targetIndex >= 0) {
        WRouter.back({targetRoutePath: wRouteMeta.path});
    } else {
        callback.onContinue();
    }
}

/**
 *
 * @param wRouteMeta
 * @param callback
 */
function standard(wRouteMeta, callback) {
    //
    wRouteMeta.originPath = wRouteMeta.path;
    wRouteMeta.path = `${wRouteMeta.path}@${new Date().getTime()}`;
    if(wRouteMeta.match){
        wRouteMeta.match.standardPath = wRouteMeta.path;
    }
    callback.onContinue();
}

/**
 * 路由配置
 * @param wRouteMeta
 * @param callback
 */
export default function LaunchModeInterceptor(wRouteMeta, callback) {
    let launchMode = wRouteMeta.launchMode;
    if(launchMode){
        switch (launchMode.toUpperCase()){
            case 'SINGLETASK':
                singleTask(wRouteMeta, callback);
                return;
            case 'STANDARD':
                standard(wRouteMeta, callback);
                return;
        }
    }
    callback.onContinue();
}