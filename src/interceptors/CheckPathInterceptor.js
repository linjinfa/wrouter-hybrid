/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/15
 * Time: 12:46
 */

/**
 * 检查路径
 * @param wRouteMeta
 * @param callback
 */
export default function CheckPathInterceptor(wRouteMeta, callback) {
    console.log("CheckPathInterceptor=======> ", wRouteMeta);
    if(!wRouteMeta){
        console.error("wRouteMeta is null");
        return;
    }
    if(!wRouteMeta.path){
        console.error("wRouteMeta.path is null");
        return;
    }
    //去掉#
    wRouteMeta.path = wRouteMeta.path.replace('#', '');
    //去掉'?'
    let markIndex = wRouteMeta.path.indexOf('?');
    if(markIndex !== -1){
        wRouteMeta.path = wRouteMeta.path.substring(0, markIndex);
    }
    //必须 / 开头
    if(wRouteMeta.path.indexOf('/') !== 0){
        wRouteMeta.path = '/'+wRouteMeta.path;
    }
    //去掉 / 结尾的路由
    if(wRouteMeta.path.lastIndexOf('/') === wRouteMeta.path.length - 1){
        wRouteMeta.path = wRouteMeta.path.substring(0, wRouteMeta.path.length - 1);
    }
    if(wRouteMeta.data){
        let path = wRouteMeta.path + '/' + encodeURIComponent(JSON.stringify(wRouteMeta.data));
        wRouteMeta.path = path;
    }
    callback.onContinue();
}