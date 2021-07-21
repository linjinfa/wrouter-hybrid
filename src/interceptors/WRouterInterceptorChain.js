/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 11:19
 */
import GoRouterInterceptor from './GoRouterInterceptor';
import CheckPathInterceptor from './CheckPathInterceptor';
import ParamInterceptor from './ParamInterceptor';
import RouteConfigInterceptor from './RouteConfigInterceptor';
import LaunchModeInterceptor from './LaunchModeInterceptor';
import WRouter from '../WRouter';

/**
 * 拦截器链
 */
export default class WRouterInterceptorChain {

    /**
     *
     * @type {Array}
     * @private
     */
    _resultRouterInterceptors = [
        CheckPathInterceptor,
        ParamInterceptor,
        RouteConfigInterceptor,
        ...WRouter.routeCustomInterceptors,
        LaunchModeInterceptor,
        GoRouterInterceptor,
    ];

    constructor(){
    }

    /**
     * 执行
     */
    run = (wRouteMeta)=>{
        this._excuseInterceptor(0, wRouteMeta);
    };

    /**
     * 执行拦截器
     * @param index
     * @param wRouteMeta
     * @private
     */
    _excuseInterceptor = (index, wRouteMeta)=>{
        if(index < this._resultRouterInterceptors.length){
            let routerInterceptor = this._resultRouterInterceptors[index];
            routerInterceptor(wRouteMeta, {
                onContinue: ()=>{
                    this._excuseInterceptor(index + 1, wRouteMeta);
                }
            });
        }
    };

}