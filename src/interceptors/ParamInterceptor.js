/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 12:46
 */
import WRouter,{allRouteMap} from '../WRouter';
import matchPath from '../matchPath';

/**
 * 路由参数
 * @param wRouteMeta
 * @param callback
 */
export default function ParamInterceptor(wRouteMeta, callback) {
    let routePaths = Object.keys(allRouteMap);
    let match;
    for(let routePath of routePaths){
        match = matchPath(wRouteMeta.path, {path:`${routePath}/:data?`, exact:true, strict:false, sensitive:true}); //sensitive: 是否区分大小写
        if(match){
            wRouteMeta.paramPath = wRouteMeta.path;
            wRouteMeta.path = routePath;
            match.routePath = routePath;
            console.log('ParamInterceptor match ===> ', match);
            break;
        }
    }
    if(match){
        wRouteMeta.match = match;
        wRouteMeta.routeData = {};
        if(match.params && match.params.data){
            try {
                let data = JSON.parse(decodeURIComponent(match.params.data));
                wRouteMeta.routeData = data || {};
            } catch (e) {
                console.log('路由参数解析失败====>', e);
            }
        }
        callback.onContinue();
        return;
    }
    console.log('ParamInterceptor 找不到匹配的路由: ', wRouteMeta.path);
}