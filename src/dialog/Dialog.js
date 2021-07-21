/**
 * Created with IntelliJ IDEA.
 * User: aaronlin
 * Date: 2020/2/12
 * Time: 19:13
 */
import ReactDOM from 'react-dom';
import WRouter from '../WRouter';
import './Dialog.css';
import {
    StatusBar,
    Platform,
} from 'components-hybrid';

/**
 *
 * @type {{NORMAL: number, FLOAT_DRAG: number}}
 */
const TYPE_DIALOG = {
    /**
     * 普通弹框
     */
    NORMAL:0,
    /**
     * 悬浮拖拽弹框
     */
    FLOAT_DRAG:1,
    /**
     * 软键盘
     */
    KEYBOARD:2,
    /**
     * 软键盘
     */
    LOADING:3,
    /**
     * 引导
     */
    GUIDE:4,
};

const OPTION = {
    /**
     * 0：普通弹框  1：FloatDragDialog(悬浮拖拽弹框)
     */
    type:0,
    /**
     *
     */
    targetElement:null,
    /**
     *
     */
    showAnim:'dialog-scale-in',
    /**
     *
     */
    dismissAnim:'',
    /**
     * 是否立马显示Dialog
     */
    showImmediately:true,
    /**
     * 点击外部区域是否自动消失
     */
    canceledOnTouchOutside:{
        enable:true,
        canDispatch:()=>false,
    },
    /**
     * android的物理返回键
     */
    cancelable:true,
    /**
     * 弹框位置 同 justify-content 属性值
     * center、flex-start、flex-end
     */
    gravity:'center',
    /**
     * 适配导航栏
     */
    fitNavigationBar:true,
    /**
     * 由哪个div执行动画 默认 false：contentDiv  true: 由自定义的子div执行动画
     */
    animChild:false,
    /**
     * 执行遮罩动画
     */
    doMasAnim:true,
    /**
     * 是否显示遮罩
     */
    showMask:true,
    /**
     * 遮罩div的style
     */
    maskStyle:null,
    /**
     * Dialog最外层div的style
     */
    containerStyle:null,
    /**
     * Dialog内容div的style
     */
    contentStyle: null,
    /**
     *
     */
    showBeforeListener:null,
    /**
     *
     */
    dismissListener:null,
    /**
     * 是否需要销毁
     */
    isDestroy:true,
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
 *
 * @type {Array}
 */
const routeDialogStackMap = {};

/**
 *
 * @param dialogInfo
 */
const pushDialog = (dialogInfo)=>{
    if(!_needBindRoute(dialogInfo)){
        return;
    }
    let dialogList = routeDialogStackMap[dialogInfo.routePath];
    if(!dialogList){
        dialogList = [];
        routeDialogStackMap[dialogInfo.routePath] = dialogList;
    }
    dialogList.push(dialogInfo);
};

/**
 *
 */
const popDialog = (dialogInfo)=>{
    let dialogList = routeDialogStackMap[dialogInfo.routePath];
    if(dialogList){
        let pos = dialogList.indexOf(dialogInfo);
        if(pos > -1){
            dialogList.splice(pos, 1);
        }
    }
};

/**
 *
 * @param routePath
 */
export const popAllDialogByRoute = (routePath)=>{
    let dialogList = routeDialogStackMap[routePath];
    if(dialogList){
        dialogList = [];
        routeDialogStackMap[routePath] = dialogList;
    }
};

/**
 * 获取当前界面的弹框
 * @param that
 * @private
 */
const _getCurrDialogInfo = ()=>{
    let currRoutePath = WRouter.getCurrRoutePath();
    let dialogList = routeDialogStackMap[currRoutePath];
    if(dialogList && dialogList.length > 0){
        return dialogList[dialogList.length - 1];
    }
};

/**
 *
 * @param div
 * @param style
 */
const mergeStyle = (div, style)=>{
    if(style){
        for(let key in style){
            div.style[key] = style[key];
        }
    }
};

/**
 *
 */
const createDialogDiv = (option, routePath)=>{
    let dialogInfo;
    let dialogDiv = document.createElement('div');
    dialogDiv.setAttribute('tabindex', '-1');
    dialogDiv.className = 'dialog-container';
    //
    mergeStyle(dialogDiv, option.containerStyle);
    if(option.type === TYPE_DIALOG.KEYBOARD){
        dialogDiv.id = `dialog-keyboard`;
    }else{
        dialogDiv.id = `dialog-${routePath}-${new Date().getTime()}`;
    }
    dialogDiv.focus();

    //遮罩
    let maskDiv = document.createElement('div');
    maskDiv.className = 'dialog-mask';
    //
    mergeStyle(maskDiv, option.maskStyle);
    //是否显示遮罩
    if(!option.showMask){
        maskDiv.style.display = 'none';
    }

    dialogDiv.appendChild(maskDiv);

    //内容
    let contentDiv = document.createElement('div');
    contentDiv.className = 'dialog-content';
    if(option.gravity){
        contentDiv.style.justifyContent = option.gravity;
    }
    //
    mergeStyle(contentDiv, option.contentStyle);

    dialogDiv.addEventListener('click', (e)=>{
        let canceledOnTouchOutside = option.canceledOnTouchOutside;
        if(canceledOnTouchOutside && canceledOnTouchOutside.enable){  //点击外部区域
            let childDiv = contentDiv.children[0];
            let rect = childDiv.getBoundingClientRect();
            let childLeft = rect.left;
            let childRight = rect.right;
            let childTop = rect.top + document.documentElement.scrollTop;
            let childBottom = rect.bottom + document.documentElement.scrollTop;

            let x = e.pageX;
            let y = e.pageY;
            if(x >= childLeft
                && x <= childRight
                && y >= childTop
                && y <= childBottom){   //点击在子div区域内
                return;
            }

            let _canDispatch = false;
            let canDispatch = canceledOnTouchOutside.canDispatch;
            if(canDispatch){
                _canDispatch = !!canDispatch(e);
            }
            if(!_canDispatch){ //不分发 执行默认操作
                e.stopPropagation();
                e.preventDefault();

                let isDestroy = dialogInfo.option.isDestroy;
                if(isDestroy === undefined
                    || isDestroy === null){
                    isDestroy = true
                }
                _dismiss(dialogInfo, isDestroy);
            }
        }
    }, true);
    dialogDiv.appendChild(contentDiv);

    console.log('optionoption====>', option);
    let routeDiv = option.targetElement || document.getElementById(routePath);
    if(routeDiv){
        routeDiv.appendChild(dialogDiv);
    }

    dialogInfo = {
        routeDiv,
        dialogDiv,
        maskDiv,
        contentDiv,
        routePath,
        option,
    };

    return dialogInfo;
};

/**
 * 获取路由
 * @param that
 * @private
 */
const _getRoutePath = (that, option)=>{
    if(option.type != TYPE_DIALOG.KEYBOARD){
        if(that && that.props && that.props.match){
            return that.props.match.standardPath || that.props.match.routePath;
        }else{
            console.error('[Dialog]没有绑定路由 建议传入界面的实例对象');
        }
        return WRouter.getCurrRoutePath();
    }
};

/**
 * 显示动画
 * @param dialogInfo
 * @private
 */
const _showAnim = (dialogInfo, timeout = false)=>{
    //
    notifyDialogOnShowAnimStart(dialogInfo, timeout);

    let option = dialogInfo.option;
    let animDiv = _getAnimDiv(dialogInfo);
    _execAnim(animDiv, option.showAnim, ()=>{
        //
        notifyDialogOnShowAnimEnd(dialogInfo);
    });

    //遮罩动画
    if(option.doMasAnim && option.showMask && dialogInfo.maskDiv){
        _execAnim(dialogInfo.maskDiv, 'dialog-mask-in');
    }
};

/**
 * 隐藏动画
 * @private
 */
const _dismissAnim = (dialogInfo)=>{
    //
    notifyDialogOnDismissAnimStart(dialogInfo);

    let option = dialogInfo.option;
    let animDiv = _getAnimDiv(dialogInfo);
    _execAnim(animDiv, option.dismissAnim, ()=>{
        //
        notifyDialogOnDismissAnimEnd(dialogInfo);
    });
    //遮罩动画
    if(option.doMasAnim && option.showMask && dialogInfo.maskDiv){
        _execAnim(dialogInfo.maskDiv, 'dialog-mask-out');
    }
};

/**
 * 执行动画
 * @param div
 * @param anim
 * @private
 */
const _execAnim = (div, anim, webkitAnimationEndCallback)=>{
    if(anim){
        let webkitAnimationEnd = ()=>{
            div.removeEventListener('webkitAnimationEnd', webkitAnimationEnd);
            webkitAnimationEndCallback && webkitAnimationEndCallback();
        };
        div.addEventListener('webkitAnimationEnd', webkitAnimationEnd);
        div.style.webkitAnimation = `${anim} ${DURATION}`;
    }else{
        div.style.webkitAnimation = '';
        webkitAnimationEndCallback && webkitAnimationEndCallback();
    }
};

/**
 *
 * @param dialogInfo
 * @returns {*}
 * @private
 */
const _getAnimDiv = (dialogInfo)=>{
    let option = dialogInfo.option;
    let animDiv = option.animChild ? dialogInfo.contentDiv.children[0] : dialogInfo.contentDiv;
    animDiv.style.webkitAnimation = '';
    return animDiv;
};

/**
 * 销毁Dialog
 * @param dialogInfo
 * @private
 */
const _unmountDialog = (dialogInfo, isDestroy = true, callDismiss = true)=>{
    // try {
    popDialog(dialogInfo);

    //
    if(callDismiss){
        notifyDialogOnDismiss(dialogInfo);
    }

    if(isDestroy){
        try {
            dialogInfo.routeDiv.removeChild(dialogInfo.dialogDiv);
            ReactDOM.unmountComponentAtNode(dialogInfo.contentDiv);
        } catch (e) {
            // console.error(e);
        }
    }else{
        dialogInfo.dialogDiv.style.display = 'none';
    }
    // } catch (e) {
    //     console.error(e);
    // }
};

/**
 *
 */
const _dismiss = (dialogInfo, isDestroy, callDismiss = true)=>{
    if(!dialogInfo){
        dialogInfo = _getCurrDialogInfo();
    }
    if (dialogInfo) {
        if(isDestroy === undefined){
            if(dialogInfo.option.isDestroy !== undefined){
                isDestroy = dialogInfo.option.isDestroy;
            }else{
                isDestroy = true;
            }
        }
        if(dialogInfo.option.type === TYPE_DIALOG.FLOAT_DRAG && !isDestroy){
            let doFloatDragDismiss = dialogInfo.dialog.doFloatDragDismiss;
            doFloatDragDismiss && doFloatDragDismiss();
            return true;
        }
        if(dialogInfo.dialogDiv.style.display === 'none'){  //已经隐藏  直接销毁
            _unmountDialog(dialogInfo, isDestroy, callDismiss);
            return false;
        }
        if(dialogInfo.option && dialogInfo.option.dismissAnim){
            let animDiv = _getAnimDiv(dialogInfo);
            const animEndFunc = ()=>{
                animDiv.removeEventListener('webkitAnimationEnd', animEndFunc);
                _unmountDialog(dialogInfo, isDestroy, callDismiss);
            };
            animDiv.addEventListener('webkitAnimationEnd', animEndFunc);
            _dismissAnim(dialogInfo);
        }else{
            _unmountDialog(dialogInfo, isDestroy, callDismiss);
        }
        return true;
    }
    return false;
};

/**
 * 是否需要绑定路由
 * @private
 */
const _needBindRoute = (dialogInfo)=>{
    if(dialogInfo.option.type === TYPE_DIALOG.FLOAT_DRAG
        || dialogInfo.option.type === TYPE_DIALOG.GUIDE
        || dialogInfo.option.type === TYPE_DIALOG.KEYBOARD
        || dialogInfo.option.type === TYPE_DIALOG.LOADING){  //拖拽悬浮/软键盘/Loading 不需要绑定路由
        return false;
    }
    return true;
};

/**
 *
 * @private
 */
const _initOption = (option)=>{
    let _option = Object.assign({...OPTION}, option);
    let canceledOnTouchOutside = Object.assign(Object.clone(OPTION.canceledOnTouchOutside), option.canceledOnTouchOutside);
    _option.canceledOnTouchOutside = canceledOnTouchOutside;
    return _option;
};

/**
 * 适配底部导航栏
 * @private
 */
const _fitNavigationBar = (option, dialogInfo)=>{
    if(!option.fitNavigationBar){
        return;
    }
    let childDiv = dialogInfo.contentDiv.children[0];
    if(childDiv){
        let paddingBottom = parseFloat(childDiv.style.paddingBottom) || 0;
        childDiv.style.paddingBottom = (paddingBottom + StatusBar.navigationBarShowHeight)+'px';
    }
};

/**
 *
 * @param element
 */
const _showDialog = (Component, option = OPTION, that)=>{
    let routePath = _getRoutePath(that, option);
    option = _initOption(option);
    let dialogInfo = createDialogDiv(option, routePath);
    console.log('dialogInfodialogInfo====>', dialogInfo);
    if(!dialogInfo.routeDiv){
        return;
    }

    //
    notifyDialogShowBeforeListener(dialogInfo);

    let comp = ReactDOM.render(<Component {...option.data} dialogInfo={dialogInfo}/>, dialogInfo.contentDiv, ()=>{
        //遮罩
        dialogInfo.dialogDiv.classList.add('dialog-toggle-mask');
        if(option.isDestroy === false && option.showImmediately == false){
            //适配底部导航栏
            _fitNavigationBar(option, dialogInfo);

            //
            _unmountDialog(dialogInfo, !!dialogInfo.option.isDestroy, true);
        }else{
            //
            _showAnim(dialogInfo, true);

            //适配底部导航栏
            _fitNavigationBar(option, dialogInfo);

            //
            notifyDialogOnShow(dialogInfo, true);
        }
    });
    dialogInfo.dialog = comp;

    pushDialog(dialogInfo);

    return {
        //dialog组件实例
        dialog:comp,
        //重新显示
        show:()=>{
            if(dialogInfo.option.type === TYPE_DIALOG.FLOAT_DRAG){  //悬浮拖拽
                let doFloatDragShow = dialogInfo.dialog.doFloatDragShow;
                doFloatDragShow && doFloatDragShow();
            }else{
                //
                notifyDialogShowBeforeListener(dialogInfo);

                dialogInfo.dialogDiv.style.display = 'block';
                dialogInfo.dialogDiv.focus();
                pushDialog(dialogInfo);

                _showAnim(dialogInfo);
                //
                notifyDialogOnShow(dialogInfo);
            }
        },
        //消失
        dismiss:(isDestroy = !!dialogInfo.option.isDestroy, callDismiss = true)=>{
            _dismiss(dialogInfo, isDestroy, callDismiss);
        },
        //是否正在显示
        isShowing:()=>{
            if(dialogInfo.option.type === TYPE_DIALOG.FLOAT_DRAG){  //悬浮拖拽

            }else{
                let dialogDiv = document.getElementById(dialogInfo.dialogDiv.id);
                if(dialogDiv && dialogDiv.style.display){
                    return dialogDiv.style.display === 'block';
                }
            }
            return true;
        },
    }
};

/**
 *
 */
const notifyDialogShowBeforeListener = (dialogInfo)=>{
    let showBeforeListener = dialogInfo.option.showBeforeListener;
    if(showBeforeListener){
        showBeforeListener(dialogInfo)
    }else{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onShowBefore){
            dialog.onShowBefore();
        }
    }
};


/**
 *
 */
const notifyDialogOnShowAnimStart = (dialogInfo, timeout = false)=>{
    let execOnShowAnim = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onShowAnimStart){
            dialog.onShowAnimStart();
        }
    };
    if(timeout){
        setTimeout(execOnShowAnim, 0);
    }else{
        execOnShowAnim();
    }
};

/**
 *
 */
const notifyDialogOnShowAnimEnd = (dialogInfo, timeout = false)=>{
    let execOnShowAnimEnd = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onShowAnimEnd){
            dialog.onShowAnimEnd();
        }
    };
    if(timeout){
        setTimeout(execOnShowAnimEnd, 0);
    }else{
        execOnShowAnimEnd();
    }
};

/**
 *
 */
const notifyDialogOnDismissAnimStart = (dialogInfo, timeout = false)=>{
    let execOnDismissAnim = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onDismissAnimStart){
            dialog.onDismissAnimStart();
        }
        let dismissAnimStartListener = dialogInfo.option.dismissAnimStartListener;
        dismissAnimStartListener && dismissAnimStartListener();
    };
    if(timeout){
        setTimeout(execOnDismissAnim, 0);
    }else{
        execOnDismissAnim();
    }
};

/**
 *
 */
const notifyDialogOnDismissAnimEnd = (dialogInfo, timeout = false)=>{
    let execOnDismissAnimEnd = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onDismissAnimEnd){
            dialog.onDismissAnimEnd();
        }
        let dismissAnimEndListener = dialogInfo.option.dismissAnimEndListener;
        dismissAnimEndListener && dismissAnimEndListener();
    };
    if(timeout){
        setTimeout(execOnDismissAnimEnd, 0);
    }else{
        execOnDismissAnimEnd();
    }
};

/**
 *
 */
const notifyDialogOnShow = (dialogInfo, timeout = false)=>{
    let execOnShow = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onShow){
            dialog.onShow();
        }
    };
    if(timeout){
        setTimeout(execOnShow, 0);
    }else{
        execOnShow();
    }
};

/**
 *
 */
const notifyDialogOnDismiss = (dialogInfo, timeout = false)=>{
    let execOnDismiss = ()=>{
        let dialog = dialogInfo.dialog;
        if(dialog && dialog.onDismiss){
            dialog.onDismiss();
        }
        let dismissListener = dialogInfo.option.dismissListener;

        dismissListener && dismissListener();
    };
    if(timeout){
        setTimeout(execOnDismiss, 0);
    }else{
        execOnDismiss();
    }
};

(function(global){
    if(!global.showDialog){
        global.showDialog = _showDialog
    }
    if(!global.dismissDialog){
        global.dismissDialog = _dismiss
    }
    global.TypeDialog = TYPE_DIALOG;
}(window));