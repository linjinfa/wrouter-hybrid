/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 12:46
 */
import WRouter,{allRouteMap} from '../WRouter';

/**
 * 路由配置
 * @param wRouteMeta
 * @param callback
 */
export default function RouteConfigInterceptor(wRouteMeta, callback) {
    let routeInfo = WRouter.getRouteInfo(wRouteMeta.path);
    if(!routeInfo){
        console.error('找不到路由：', wRouteMeta.path);
        return;
    }

    //
    wRouteMeta.navigationBarConfig = routeInfo.navigationBarConfig;
    wRouteMeta.statusBarConfig= routeInfo.statusBarConfig;
    wRouteMeta.bottomNavigationBarConfig= routeInfo.bottomNavigationBarConfig;
    wRouteMeta.minVersion= routeInfo.minVersion;
    wRouteMeta.launchMode = routeInfo.launchMode;

    callback.onContinue();
}