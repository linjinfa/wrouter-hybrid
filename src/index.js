/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/1/14
 * Time: 10:55
 */
import WRouter from './WRouter';
import './fragment';
import './dialog';

(function(global){
    if(!global.WRouter){
        global.WRouter = WRouter
    }
}(window));