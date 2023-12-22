'use strict';

var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};

var targetMap = new Map();
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    for (var _i = 0, dep_1 = dep; _i < dep_1.length; _i++) {
        var effect_1 = dep_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
}

var get = createGetter();
var set = createSetter();
var readonlyGet = createGetter(true);
var shallowReadonlyGet = createGetter(true, true);
function createGetter(isReadonly, shallow) {
    if (isReadonly === void 0) { isReadonly = false; }
    if (shallow === void 0) { shallow = false; }
    return function get(target, key) {
        if (key === "__v_isReactive" /* ReactiveFlags.IS_REACTIVE */) {
            return !isReadonly;
        }
        else if (key === "__v_isReadonly" /* ReactiveFlags.IS_READONLY */) {
            return isReadonly;
        }
        var res = Reflect.get(target, key);
        if (shallow) {
            return res;
        }
        if (isObject(res)) {
            return isReadonly ? readonly(res) : reactive(res);
        }
        return res;
    };
}
function createSetter() {
    return function set(target, key, value) {
        var res = Reflect.set(target, key, value);
        trigger(target, key);
        return res;
    };
}
var mutableHandlers = {
    get: get,
    set: set,
};
var readonlyHandlers = {
    get: readonlyGet,
    set: function (target, key, value) {
        console.warn("key: ".concat(key, " set \u5931\u8D25\uFF0C \u56E0\u4E3A ").concat(target, " \u662F readonly"), target);
        return true;
    },
};
var shallowReadonlyHandlers = extend({}, readonlyHandlers, {
    get: shallowReadonlyGet,
});

function shallowReadonly(raw) {
    return createActiveObject(raw, shallowReadonlyHandlers);
}
function reactive(raw) {
    return createActiveObject(raw, mutableHandlers);
}
function readonly(raw) {
    return createActiveObject(raw, readonlyHandlers);
}
function createActiveObject(target, baseHandlers) {
    if (!isObject(target)) {
        console.warn("target ".concat(target, " \u5FC5\u987B\u662F\u4E00\u4E2A\u5BF9\u8C61 "));
        return target;
    }
    return new Proxy(target, baseHandlers);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
};
var PublicInstanceProxyHandlers = {
    get: function (_a, key) {
        var instance = _a._;
        var setupState = instance.setupState, props = instance.props;
        if (hasOwn(setupState, key)) {
            return setupState[key];
        }
        else if (hasOwn(props, key)) {
            return props[key];
        }
        var publicGetter = publicPropertiesMap[key];
        if (publicGetter) {
            return publicGetter(instance);
        }
    },
};

function createComponentInstance(vnode) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
    };
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props); // 处理props
    // initSlots() // 处理插槽
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = component.setup;
    if (setup) {
        var setupResult = setup(shallowReadonly(instance.props));
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setupResult 可能时 function 或者 obj
    // 如果是function 就是组件的render函数
    // 如果是 obj 就添加到组件的上下文中
    if (typeof setupResult === "object") {
        instance.setupState = setupResult;
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var component = instance.type;
    instance.render = component.render;
}

function render(vnode, container) {
    //调用patch 方法, 方便后续递归调用
    patch(vnode, container);
}
function patch(vnode, container) {
    //处理组件
    //判断vnode是不是element类型
    var shapeFlag = vnode.shapeFlag;
    if (shapeFlag & 1 /* ShapeFlags.ElEMENT */) {
        processElement(vnode, container);
    }
    else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        processComponent(vnode, container);
    }
}
function processComponent(vnode, container) {
    //挂载组件
    mountComponent(vnode, container);
}
function mountComponent(initialVNode, container) {
    var instance = createComponentInstance(initialVNode);
    setupComponent(instance);
    setupRenderEffect(instance, initialVNode, container);
}
function setupRenderEffect(instance, initialVNode, container) {
    var proxy = instance.proxy;
    var subTree = instance.render.call(proxy);
    patch(subTree, container);
    //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
    initialVNode.el = subTree.el;
}
function processElement(vnode, container) {
    mountElement(vnode, container);
    // updateElement(vnode, container);
}
function mountElement(vnode, container) {
    var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
    vnode.el = document.createElement(type);
    var el = vnode.el;
    if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
        el.textContent = children;
    }
    else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
        mountChildren(vnode, el);
    }
    for (var key in props) {
        var val = props[key];
        var isOn = function (key) { return /^on[A-Z]/.test(key); };
        if (isOn(key)) {
            var event_1 = key.slice(2).toLowerCase();
            el.addEventListener(event_1, val);
        }
        el.setAttribute(key, val);
    }
    container.append(el);
}
function mountChildren(vnode, container) {
    vnode.children.forEach(function (v) {
        patch(v, container);
    });
}

function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ElEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

function createVNode(type, props, children) {
    var vnode = {
        type: type,
        props: props,
        children: children,
        shapeFlag: getShapeFlag(type),
        el: null,
    };
    if (typeof vnode.children === "string") {
        vnode.shapeFlag = vnode.shapeFlag | 4 /* ShapeFlags.TEXT_CHILDREN */;
    }
    else if (Array.isArray(vnode.children)) {
        vnode.shapeFlag = vnode.shapeFlag | 8 /* ShapeFlags.ARRAY_CHILDREN */;
    }
    return vnode;
}

function createApp(rootComponent) {
    return {
        //返回一个APP对象
        mount: function (rootContainer) {
            //先转换成虚拟节点
            //后续的逻辑操作都是根据虚拟节点做处理
            var vnode = createVNode(rootComponent);
            render(vnode, rootContainer);
        },
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

exports.createApp = createApp;
exports.h = h;
