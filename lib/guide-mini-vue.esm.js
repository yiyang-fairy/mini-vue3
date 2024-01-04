var extend = Object.assign;
var isObject = function (val) {
    return val !== null && typeof val === "object";
};
var hasChanged = function (value, newValue) {
    return !Object.is(value, newValue);
};
var hasOwn = function (val, key) {
    return Object.prototype.hasOwnProperty.call(val, key);
};
var capitalize = function (str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
};
var toHandlerKey = function (str) {
    return str ? "on" + capitalize(str) : "";
};
var camelize = function (str) {
    return str.replace(/-(\w)/g, function (_, c) { return (c ? c.toUpperCase() : ""); });
};
var EMPTY_OBJ = {};

var activeEffect;
var shouldTrack;
var ReactiveEffect = /** @class */ (function () {
    function ReactiveEffect(fn, scheduler) {
        this.scheduler = scheduler;
        this.deps = [];
        this.active = true;
        this._fn = fn;
        this.scheduler = scheduler;
    }
    ReactiveEffect.prototype.run = function () {
        activeEffect = this;
        if (!this.active) {
            return this._fn();
        }
        shouldTrack = true;
        activeEffect = this;
        var result = this._fn();
        shouldTrack = false;
        return result;
    };
    ReactiveEffect.prototype.stop = function () {
        if (this.active) {
            cleanupEffect(this);
            if (this.onStop) {
                this.onStop();
            }
            this.active = false;
        }
    };
    return ReactiveEffect;
}());
function cleanupEffect(effect) {
    effect.deps.forEach(function (dep) {
        dep.delete(effect);
    });
}
var targetMap = new Map();
function track(target, key) {
    if (!isTracking())
        return;
    var depsMap = targetMap.get(target);
    if (!depsMap) {
        depsMap = new Map();
        targetMap.set(target, depsMap);
    }
    // key 不能重复, 用set存
    var dep = depsMap.get(key);
    if (!dep) {
        dep = new Set();
        depsMap.set(key, dep);
    }
    trackEffects(dep);
}
function trackEffects(dep) {
    if (dep.has(activeEffect))
        return;
    dep.add(activeEffect);
    activeEffect.deps.push(dep);
}
function isTracking() {
    return shouldTrack && activeEffect !== undefined;
}
function trigger(target, key) {
    var depsMap = targetMap.get(target);
    var dep = depsMap.get(key);
    triggerEffects(dep);
}
function triggerEffects(dep) {
    var arr = Array.from(dep);
    for (var _i = 0, arr_1 = arr; _i < arr_1.length; _i++) {
        var effect_1 = arr_1[_i];
        if (effect_1.scheduler) {
            effect_1.scheduler();
        }
        else {
            effect_1.run();
        }
    }
}
function effect(fn, options) {
    if (options === void 0) { options = {}; }
    var _effect = new ReactiveEffect(fn, options.scheduler);
    extend(_effect, options);
    _effect.run();
    var runner = _effect.run.bind(_effect);
    runner.effect = _effect;
    return runner;
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
        if (!isReadonly) {
            track(target, key);
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

var RefImpl = /** @class */ (function () {
    function RefImpl(value) {
        this.__v_isRef = true;
        // 如果value是对象， 要用reactive包裹
        this._value = convert(value);
        this._rawValue = value;
        this.dep = new Set();
    }
    Object.defineProperty(RefImpl.prototype, "value", {
        get: function () {
            trackRefValue(this);
            return this._value;
        },
        set: function (newValue) {
            if (!hasChanged(this._rawValue, newValue))
                return;
            this._rawValue = newValue;
            this._value = convert(newValue);
            triggerEffects(this.dep);
        },
        enumerable: false,
        configurable: true
    });
    return RefImpl;
}());
function ref(value) {
    return new RefImpl(value);
}
function isRef(ref) {
    return !!ref.__v_isRef;
}
function unRef(ref) {
    return isRef(ref) ? ref.value : ref;
}
function proxyRefs(objectWithRefs) {
    return new Proxy(objectWithRefs, {
        get: function (target, key) {
            return unRef(Reflect.get(target, key));
        },
        set: function (target, key, value) {
            if (isRef(target[key]) && !isRef(value)) {
                return (target[key].value = value);
            }
            else {
                return Reflect.set(target, key, value);
            }
        },
    });
}
function trackRefValue(ref) {
    if (isTracking()) {
        trackEffects(ref.dep);
    }
}
function convert(value) {
    return isObject(value) ? reactive(value) : value;
}

function getShapeFlag(type) {
    return typeof type === "string"
        ? 1 /* ShapeFlags.ElEMENT */
        : 2 /* ShapeFlags.STATEFUL_COMPONENT */;
}

var Fragment = Symbol("Fragment");
var Text = Symbol("Text");
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
    if (vnode.shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
        if (typeof children === "object") {
            vnode.shapeFlag = vnode.shapeFlag | 16 /* ShapeFlags.SLOT_CHILDREN */;
        }
    }
    return vnode;
}
function createTextVNode(text) {
    return createVNode(Text, {}, text);
}

function createAppAPI(render) {
    return function createApp(rootComponent) {
        return {
            //返回一个APP对象
            mount: function (rootContainer) {
                //先转换成虚拟节点
                //后续的逻辑操作都是根据虚拟节点做处理
                var vnode = createVNode(rootComponent);
                render(vnode, rootContainer);
            },
        };
    };
}

function h(type, props, children) {
    return createVNode(type, props, children);
}

function renderSlots(slots, name, props) {
    var slot = slots[name];
    if (slot) {
        if (typeof slot === "function") {
            return createVNode(Fragment, {}, slot(props));
        }
    }
}

function emit(instance, event) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    var props = instance.props;
    var handlerName = toHandlerKey(camelize(event));
    var handler = props[handlerName];
    handler && handler.apply(void 0, args);
}

function initProps(instance, rawProps) {
    instance.props = rawProps || {};
}

var publicPropertiesMap = {
    $el: function (i) { return i.vnode.el; },
    $slot: function (i) { return i.slots; },
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

function initSlots(instance, children) {
    var vnode = instance.vnode;
    if (vnode.shapeFlag & 16 /* ShapeFlags.SLOT_CHILDREN */) {
        normalizeObjectSlots(instance.slots, children);
    }
}
function normalizeObjectSlots(slots, children) {
    var _loop_1 = function (key) {
        var value = children[key];
        slots[key] = function (props) { return normalizeValue(value(props)); };
    };
    for (var key in children) {
        _loop_1(key);
    }
}
function normalizeValue(value) {
    return Array.isArray(value) ? value : [value];
}

function createComponentInstance(vnode, parent) {
    var component = {
        vnode: vnode,
        type: vnode.type,
        setupState: {},
        props: {},
        slots: {},
        provides: parent ? parent.provides : {},
        parent: parent,
        isMounted: false,
        emit: function () { },
    };
    component.emit = emit.bind(null, component);
    return component;
}
function setupComponent(instance) {
    initProps(instance, instance.vnode.props); // 处理props
    initSlots(instance, instance.vnode.children); // 处理插槽
    setupStatefulComponent(instance);
}
function setupStatefulComponent(instance) {
    var component = instance.type;
    instance.proxy = new Proxy({ _: instance }, PublicInstanceProxyHandlers);
    var setup = component.setup;
    if (setup) {
        setCurrentInstance(instance);
        var setupResult = setup(shallowReadonly(instance.props), {
            emit: instance.emit,
        });
        setCurrentInstance(null);
        handleSetupResult(instance, setupResult);
    }
}
function handleSetupResult(instance, setupResult) {
    // setupResult 可能时 function 或者 obj
    // 如果是function 就是组件的render函数
    // 如果是 obj 就添加到组件的上下文中
    if (typeof setupResult === "object") {
        instance.setupState = proxyRefs(setupResult);
    }
    finishComponentSetup(instance);
}
function finishComponentSetup(instance) {
    var component = instance.type;
    instance.render = component.render;
}
var currentInstance = null;
function getCurrentInstance() {
    return currentInstance;
}
function setCurrentInstance(instance) {
    currentInstance = instance;
}

function provide(key, value) {
    var _a;
    // 存
    var currentInstance = getCurrentInstance();
    if (!currentInstance)
        return;
    var provides = currentInstance.provides;
    var parentProvides = (_a = currentInstance.parent) === null || _a === void 0 ? void 0 : _a.provides;
    if (provides === parentProvides) {
        provides = currentInstance.provides = Object.create(parentProvides);
    }
    provides[key] = value;
}
function inject(key, defaultValue) {
    // 取
    var currentInstance = getCurrentInstance();
    if (!currentInstance)
        return;
    var parentProvides = currentInstance.parent.provides;
    if (key in parentProvides) {
        return parentProvides[key];
    }
    else if (defaultValue) {
        if (typeof defaultValue === "function") {
            return defaultValue();
        }
        return defaultValue;
    }
}

function createRenderer(options) {
    var hostCreateElement = options.createElement, hostInsert = options.insert, hostPatchProp = options.patchProp;
    function render(vnode, container) {
        //调用patch 方法, 方便后续递归调用
        patch(null, vnode, container, null);
    }
    // n1 代表之前的虚拟节点， n2 代表现在的虚拟节点
    // n1 不存在表示是初始化， n1 存在表示是更新
    function patch(n1, n2, container, parentComponent) {
        //处理组件
        //判断vnode是不是element类型
        // fragment 类型只渲染 children
        var shapeFlag = n2.shapeFlag, type = n2.type;
        switch (type) {
            case Fragment:
                processFragment(n1, n2, container, parentComponent);
                break;
            case Text:
                processText(n1, n2, container);
                break;
            default:
                if (shapeFlag & 1 /* ShapeFlags.ElEMENT */) {
                    processElement(n1, n2, container, parentComponent);
                }
                else if (shapeFlag & 2 /* ShapeFlags.STATEFUL_COMPONENT */) {
                    processComponent(n1, n2, container, parentComponent);
                }
        }
    }
    function processComponent(n1, n2, container, parentComponent) {
        //挂载组件
        mountComponent(n2, container, parentComponent);
    }
    function mountComponent(initialVNode, container, parentComponent) {
        var instance = createComponentInstance(initialVNode, parentComponent);
        setupComponent(instance);
        setupRenderEffect(instance, initialVNode, container);
    }
    function setupRenderEffect(instance, initialVNode, container) {
        effect(function () {
            if (!instance.isMounted) {
                // 初始化
                var proxy = instance.proxy;
                var subTree = (instance.subTree = instance.render.call(proxy));
                patch(null, subTree, container, instance);
                //所有 subTree 初始化之后，将根节点的 el 赋值给组件的 el
                initialVNode.el = subTree.el;
                instance.isMounted = true;
            }
            else {
                //更新
                var proxy = instance.proxy;
                var subTree = instance.render.call(proxy);
                var precSubTree = instance.subTree;
                instance.subTree = subTree;
                patch(precSubTree, subTree, container, instance);
            }
        });
    }
    function processElement(n1, n2, container, parentComponent) {
        if (!n1) {
            mountElement(n2, container, parentComponent);
        }
        else {
            // updateElement(vnode, container);
            patchElement(n1, n2);
        }
    }
    function patchElement(n1, n2, container) {
        var el = (n2.el = n1.el);
        // 对比 props
        var oldProps = n1.props || EMPTY_OBJ;
        var newProps = n2.props || EMPTY_OBJ;
        patchProps(oldProps, newProps, el);
        // 对比 children
    }
    function patchProps(oldProps, newProps, el) {
        for (var key in newProps) {
            var prevPorp = oldProps[key];
            var nextProp = newProps[key];
            if (prevPorp !== nextProp) {
                hostPatchProp(el, key, prevPorp, nextProp);
            }
        }
        if (oldProps !== EMPTY_OBJ) {
            for (var key in oldProps) {
                if (!(key in newProps)) {
                    hostPatchProp(el, key, oldProps[key], null);
                }
            }
        }
    }
    function mountElement(vnode, container, parentComponent) {
        var type = vnode.type, props = vnode.props, children = vnode.children, shapeFlag = vnode.shapeFlag;
        vnode.el = hostCreateElement(type);
        var el = vnode.el;
        if (shapeFlag & 4 /* ShapeFlags.TEXT_CHILDREN */) {
            el.textContent = children;
        }
        else if (shapeFlag & 8 /* ShapeFlags.ARRAY_CHILDREN */) {
            mountChildren(vnode, el, parentComponent);
        }
        for (var key in props) {
            var val = props[key];
            hostPatchProp(el, key, null, val);
        }
        hostInsert(el, container);
    }
    function mountChildren(vnode, container, parentComponent) {
        vnode.children.forEach(function (v) {
            patch(null, v, container, parentComponent);
        });
    }
    function processFragment(n1, n2, container, parentComponent) {
        mountChildren(n2, container, parentComponent);
    }
    function processText(n1, n2, container) {
        var children = n2.children;
        var textNode = (n2.el = document.createTextNode(children));
        container.append(textNode);
    }
    return {
        createApp: createAppAPI(render),
    };
}

function createElement(type) {
    return document.createElement(type);
}
function patchProp(el, key, prevVal, nextVal) {
    var isOn = function (key) { return /^on[A-Z]/.test(key); };
    if (isOn(key)) {
        var event_1 = key.slice(2).toLowerCase();
        el.addEventListener(event_1, nextVal);
    }
    else {
        if (nextVal === undefined || nextVal === null) {
            el.removeAttribute(key);
        }
        else {
            el.setAttribute(key, nextVal);
        }
    }
}
function insert(el, parent) {
    parent.append(el);
}
var renderer = createRenderer({
    createElement: createElement,
    patchProp: patchProp,
    insert: insert,
});
function createApp() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return renderer.createApp.apply(renderer, args);
}

export { createApp, createAppAPI, createElement, createRenderer, createTextVNode, getCurrentInstance, h, inject, provide, proxyRefs, ref, renderSlots };
