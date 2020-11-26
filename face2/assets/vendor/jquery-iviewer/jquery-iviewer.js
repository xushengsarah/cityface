!function ($, undefined) {
    function makeMouseEvent(event) {
        var touch = event.originalEvent.changedTouches[0];
        return $.extend(event, {
            type: mouseEvents[event.type],
            which: 1,
            pageX: touch.pageX,
            pageY: touch.pageY,
            screenX: touch.screenX,
            screenY: touch.screenY,
            clientX: touch.clientX,
            clientY: touch.clientY,
            isTouchEvent: !0
        })
    }
    var mouseEvents =
        {
            touchstart: "mousedown",
            touchmove: "mousemove",
            touchend: "mouseup"
        },
        gesturesSupport = "ongesturestart" in document.createElement("div"),
        mouseProto = $.ui.mouse.prototype,
        _mouseInit = $.ui.mouse.prototype._mouseInit;
    mouseProto._mouseInit = function () {
        var self = this;
        self._touchActive = !1,
            this.element.bind("touchstart." + this.widgetName, function (event) {
                return gesturesSupport && event.originalEvent.touches.length > 1 ? void 0 : (self._touchActive = !0, self._mouseDown(makeMouseEvent(event)))
            }),
            this._mouseMoveDelegate = function (event) {
                return gesturesSupport && event.originalEvent.touches && event.originalEvent.touches.length > 1 ? void 0 : self._touchActive ? self._mouseMove(makeMouseEvent(event)) : void 0
            },
            this._mouseUpDelegate = function (event) {
                return self._touchActive ? (self._touchActive = !1, self._mouseUp(makeMouseEvent(event))) : void 0
            },
            $(document).bind("touchmove." + this.widgetName, this._mouseMoveDelegate).bind("touchend." + this.widgetName, this._mouseUpDelegate),
            _mouseInit.apply(this)
    };
    var setter = function (setter, getter) {
        return function () {
            return 0 === arguments.length ? getter.apply(this) : void setter.apply(this, arguments)
        }
    },
        ieTransforms =
            {
                0: {
                    marginLeft: 0,
                    marginTop: 0,
                    filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, SizingMethod="auto expand")'
                },
                90: {
                    marginLeft: -1,
                    marginTop: 1,
                    filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=0, M12=-1, M21=1, M22=0, SizingMethod="auto expand")'
                },
                180: {
                    marginLeft: 0,
                    marginTop: 0,
                    filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=-1, M12=0, M21=0, M22=-1, SizingMethod="auto expand")'
                },
                270: {
                    marginLeft: -1,
                    marginTop: 1,
                    filter: 'progid:DXImageTransform.Microsoft.Matrix(M11=0, M12=1, M21=-1, M22=0, SizingMethod="auto expand")'
                }
            },
        useIeTransforms = function () {
            for (var modElem = document.createElement("modernizr"), mStyle = modElem.style, omPrefixes = "Webkit Moz O ms", domPrefixes = omPrefixes.toLowerCase().split(" "), props = ("transform " + domPrefixes.join("Transform ") + "Transform").split(" "), i = 0; i < props.length; i++) {
                var prop = props[i];
                if (-1 == prop.indexOf("-") && mStyle[prop] !== undefined) return !1
            }
            return !0
        }();
    $.widget("ui.iviewer", $.ui.mouse, {
        widgetEventPrefix: "iviewer",
        options: {
            zoom: "fit",
            zoom_base: 100,
            zoom_max: 800,
            zoom_min: 5,
            zoom_delta: 1.4,
            zoom_animation: !0,
            ui_disabled: !1,
            mousewheel: !0,
            update_on_resize: !0,
            zoom_on_dblclick: !0,
            fill_container: !1,
            onZoom: jQuery.noop,
            onAfterZoom: jQuery.noop,
            onStartDrag: jQuery.noop,
            onDrag: jQuery.noop,
            onStopDrag: jQuery.noop,
            onMouseMove: jQuery.noop,
            onClick: jQuery.noop,
            onDblClick: null,
            onStartLoad: null,
            onFinishLoad: null,
            onErrorLoad: null
        },
        _create: function () {
            var me = this;
            if (this.dx = 0, this.dy = 0, this.img_object =
                {
                }, this.zoom_object =
                {
                }, this._angle = 0, this.current_zoom = this.options.zoom, null !== this.options.src) {
                if (this.container = this.element, this._updateContainerInfo(), this.container.css("overflow", "hidden"), 1 == this.options.update_on_resize && $(window).resize(function () {
                    me.update()
                }), this.img_object = new $.ui.iviewer.ImageObject(this.options.zoom_animation), this.options.mousewheel && (this.container.bind("mousewheel.iviewer", function (ev) {
                    var delta = (ev.originalEvent.wheelDelta && (ev.originalEvent.wheelDelta > 0 ? 1 : -1)) || (ev.originalEvent.detail && (ev.originalEvent.detail > 0 ? 1 : -1))
                    var zoom = delta > 0 ? 1 : -1,
                        container_offset = me.container.offset(),
                        mouse_pos =
                            {
                                x: (ev.pageX || ev.originalEvent.pageX) - container_offset.left,
                                y: (ev.pageY || ev.originalEvent.pageX) - container_offset.top
                            };
                    return me.zoom_by(zoom, mouse_pos),
                        !1
                }), gesturesSupport)) {
                    var originalScale, originalCenter, gestureThrottle = +new Date;
                    this.img_object.object().bind("touchstart", function (ev) {
                        originalScale = me.current_zoom;
                        var container_offset, touches = ev.originalEvent.touches;
                        2 == touches.length ? (container_offset = me.container.offset(), originalCenter =
                            {
                                x: (touches[0].pageX + touches[1].pageX) / 2 - container_offset.left,
                                y: (touches[0].pageY + touches[1].pageY) / 2 - container_offset.top
                            }) : originalCenter = null
                    }).bind("gesturechange.iviewer", function (ev) {
                        var d = +new Date;
                        if (!(50 > d - gestureThrottle)) {
                            gestureThrottle = d;
                            var zoom = originalScale * ev.originalEvent.scale;
                            me.set_zoom(zoom, originalCenter),
                                ev.preventDefault()
                        }
                    }).bind("gestureend.iviewer", function () {
                        originalCenter = null
                    })
                }
                var useDblClick = !!this.options.onDblClick || this.options.zoom_on_dblclick,
                    dblClickTimer = null,
                    clicksNumber = 0;
                this.img_object.object().prependTo(this.container),
                    useDblClick ? this.img_object.object().click(function (e) {
                        clicksNumber++ ,
                            clearTimeout(dblClickTimer),
                            dblClickTimer = setTimeout(function () {
                                clicksNumber = 0,
                                    me._click(e)
                            }, 300)
                    }).dblclick(function (e) {
                        2 === clicksNumber && (clearTimeout(dblClickTimer), clicksNumber = 0, me._dblclick(e))
                    }) : this.img_object.object().click(function (e) {
                        me._click(e)
                    }),
                    this.container.bind("mousemove.iviewer", function (ev) {
                        me._handleMouseMove(ev)
                    }),
                    this.loadImage(this.options.src),
                    this.options.ui_disabled || this.createui(),
                    this.controls = this.container.find(".iviewer_common") || {
                    },
                    this._mouseInit()
            }
        },
        destroy: function () {
            $.Widget.prototype.destroy.call(this),
                this._mouseDestroy(),
                this.img_object.object().remove(),
                this.controls.remove(),
                this.container.off(".iviewer"),
                this.container.css("overflow", "")
        },
        _updateContainerInfo: function () {
            this.options.height = this.container.height(),
                this.options.width = this.container.width()
        },
        update: function () {
            this._updateContainerInfo(),
                this.setCoords(this.img_object.x(), this.img_object.y())
        },
        loadImage: function (src) {
            this.current_zoom = this.options.zoom;
            var me = this;
            this._trigger("onStartLoad", 0, src),
                this.container.addClass("iviewer_loading"),
                this.img_object.load(src, function () {
                    me._fill_orig_dimensions =
                        {
                            width: me.img_object.orig_width(),
                            height: me.img_object.orig_height()
                        },
                        me._imageLoaded(src)
                }, function () {
                    me._trigger("onErrorLoad", 0, src)
                })
        },
        _imageLoaded: function (src) {
            this.container.removeClass("iviewer_loading"),
                this.container.addClass("iviewer_cursor"),
                "fit" == this.options.zoom ? this.fit(!0) : this.set_zoom(this.options.zoom, !0),
                this._trigger("onFinishLoad", 0, src),
                this.options.fill_container && this.fill_container(!0)
        },
        fit: function (skip_animation) {
            var aspect_ratio = this.img_object.orig_width() / this.img_object.orig_height(),
                window_ratio = this.options.width / this.options.height,
                choose_left = aspect_ratio > window_ratio,
                new_zoom = 0;
            new_zoom = choose_left ? this.options.width / this.img_object.orig_width() * 100 : this.options.height / this.img_object.orig_height() * 100,
                this.set_zoom(new_zoom, skip_animation)
        },
        center: function () {
            this.setCoords(-Math.round((this.img_object.display_width() - this.options.width) / 2), -Math.round((this.img_object.display_height() - this.options.height) / 2))
        },
        moveTo: function (x, y) {
            var dx = x - Math.round(this.options.width / 2),
                dy = y - Math.round(this.options.height / 2),
                new_x = this.img_object.x() - dx,
                new_y = this.img_object.y() - dy;
            this.setCoords(new_x, new_y)
        },
        getContainerOffset: function () {
            return jQuery.extend(
                {
                }, this.container.offset())
        },
        setCoords: function (x, y) {
            if (this.img_object.loaded()) {
                var coords = this._correctCoords(x, y);
                this.img_object.x(coords.x),
                    this.img_object.y(coords.y)
            }
        },
        _correctCoords: function (x, y) {
            return x = parseInt(x, 10),
                y = parseInt(y, 10),
                y > 0 && (y = 0),
                x > 0 && (x = 0),
                y + this.img_object.display_height() < this.options.height && (y = this.options.height - this.img_object.display_height()),
                x + this.img_object.display_width() < this.options.width && (x = this.options.width - this.img_object.display_width()),
                this.img_object.display_width() <= this.options.width && (x = -(this.img_object.display_width() - this.options.width) / 2),
                this.img_object.display_height() <= this.options.height && (y = -(this.img_object.display_height() - this.options.height) / 2),
                {
                    x: x,
                    y: y
                }
        },
        containerToImage: function (x, y) {
            var coords =
                {
                    x: x - this.img_object.x(),
                    y: y - this.img_object.y()
                };
            return coords = this.img_object.toOriginalCoords(coords),
                {
                    x: util.descaleValue(coords.x, this.current_zoom),
                    y: util.descaleValue(coords.y, this.current_zoom)
                }
        },
        imageToContainer: function (x, y) {
            var coords =
                {
                    x: util.scaleValue(x, this.current_zoom),
                    y: util.scaleValue(y, this.current_zoom)
                };
            return this.img_object.toRealCoords(coords)
        },
        _getMouseCoords: function (e) {
            var containerOffset = this.container.offset(),
                coords = this.containerToImage(e.pageX - containerOffset.left, e.pageY - containerOffset.top);
            return coords
        },
        fill_container: function (fill) {
            if (this.options.fill_container = fill, fill) {
                var ratio = this.options.width / this.options.height;
                ratio > 1 ? this.img_object.orig_width(this.img_object.orig_height() * ratio) : this.img_object.orig_height(this.img_object.orig_width() * ratio)
            }
            else this.img_object.orig_width(this._fill_orig_dimensions.width),
                this.img_object.orig_height(this._fill_orig_dimensions.height);
            this.set_zoom(this.current_zoom)
        },
        set_zoom: function (new_zoom, skip_animation, zoom_center) {
            if (0 != this._trigger("onZoom", 0, new_zoom) && this.img_object.loaded()) {
                zoom_center = zoom_center || {
                    x: Math.round(this.options.width / 2),
                    y: Math.round(this.options.height / 2)
                },
                    new_zoom < this.options.zoom_min ? new_zoom = this.options.zoom_min : new_zoom > this.options.zoom_max && (new_zoom = this.options.zoom_max);
                var old_x, old_y;
                "fit" == this.current_zoom ? (old_x = zoom_center.x + Math.round(this.img_object.orig_width() / 2), old_y = zoom_center.y + Math.round(this.img_object.orig_height() / 2), this.current_zoom = 100) : (old_x = -this.img_object.x() + zoom_center.x, old_y = -this.img_object.y() + zoom_center.y);
                var new_width = util.scaleValue(this.img_object.orig_width(), new_zoom),
                    new_height = util.scaleValue(this.img_object.orig_height(), new_zoom),
                    new_x = util.scaleValue(util.descaleValue(old_x, this.current_zoom), new_zoom),
                    new_y = util.scaleValue(util.descaleValue(old_y, this.current_zoom), new_zoom);
                new_x = zoom_center.x - new_x,
                    new_y = zoom_center.y - new_y,
                    new_width = Math.floor(new_width),
                    new_height = Math.floor(new_height),
                    new_x = Math.floor(new_x),
                    new_y = Math.floor(new_y),
                    this.img_object.display_width(new_width),
                    this.img_object.display_height(new_height);
                var coords = this._correctCoords(new_x, new_y),
                    self = this;
                this.img_object.setImageProps(new_width, new_height, coords.x, coords.y, skip_animation, function () {
                    self._trigger("onAfterZoom", 0, new_zoom)
                }),
                    this.current_zoom = new_zoom,
                    this.update_status()
            }
        },
        showControls: function (flag) {
            flag ? this.controls.fadeIn() : this.controls.fadeOut()
        },
        zoom_by: function (delta, zoom_center) {
            var closest_rate = this.find_closest_zoom_rate(this.current_zoom),
                next_rate = closest_rate + delta,
                next_zoom = this.options.zoom_base * Math.pow(this.options.zoom_delta, next_rate);
            delta > 0 && next_zoom < this.current_zoom && (next_zoom *= this.options.zoom_delta),
                0 > delta && next_zoom > this.current_zoom && (next_zoom /= this.options.zoom_delta),
                this.set_zoom(next_zoom, undefined, zoom_center)
        },
        angle: function (deg, abs) {
            return 0 === arguments.length ? this.img_object.angle() : void (-270 > deg || deg > 270 || deg % 90 !== 0 || (abs || (deg += this.img_object.angle()), 0 > deg && (deg += 360), deg >= 360 && (deg -= 360), deg !== this.img_object.angle() && (this.img_object.angle(deg), this.center(), this._trigger("angle", 0, {
                angle: this.img_object.angle()
            }))))
        },
        find_closest_zoom_rate: function (value) {
            function div(val1, val2) {
                return val1 / val2
            }
            function mul(val1, val2) {
                return val1 * val2
            }
            if (value == this.options.zoom_base) return 0;
            for (var func = value > this.options.zoom_base ? mul : div, sgn = value > this.options.zoom_base ? 1 : -1, mltplr = this.options.zoom_delta, rate = 1; Math.abs(func(this.options.zoom_base, Math.pow(mltplr, rate)) - value) > Math.abs(func(this.options.zoom_base, Math.pow(mltplr, rate + 1)) - value);) rate++;
            return sgn * rate
        },
        update_status: function () {
            if (!this.options.ui_disabled) {
                var percent = Math.round(100 * this.img_object.display_height() / this.img_object.orig_height());
                percent && this.zoom_object.html(percent + "%")
            }
        },
        info: function (param, withoutRotation) {
            if (param) switch (param) {
                case "orig_width":
                case "orig_height":
                    return withoutRotation ? this.img_object.angle() % 180 === 0 ? this.img_object[param]() : "orig_width" === param ? this.img_object.orig_height() : this.img_object.orig_width() : this.img_object[param]();
                case "display_width":
                case "display_height":
                case "angle":
                    return this.img_object[param]();
                case "zoom":
                    return this.current_zoom;
                case "options":
                    return this.options;
                case "src":
                    return this.img_object.object().attr("src");
                case "coords":
                    return {
                        x: this.img_object.x(),
                        y: this.img_object.y()
                    }
            }
        },
        _mouseStart: function (e) {
            return $.ui.mouse.prototype._mouseStart.call(this, e),
                this._trigger("onStartDrag", 0, this._getMouseCoords(e)) === !1 ? !1 : (this.container.addClass("iviewer_drag_cursor"), this._dragInitialized = !(e.originalEvent.changedTouches && 1 == e.originalEvent.changedTouches.length), this.dx = e.pageX - this.img_object.x(), this.dy = e.pageY - this.img_object.y(), !0)
        },
        _mouseCapture: function () {
            return !0
        },
        _handleMouseMove: function (e) {
            this._trigger("onMouseMove", e, this._getMouseCoords(e))
        },
        _mouseDrag: function (e) {
            $.ui.mouse.prototype._mouseDrag.call(this, e),
                this._dragInitialized || (this.dx = e.pageX - this.img_object.x(), this.dy = e.pageY - this.img_object.y(), this._dragInitialized = !0);
            var ltop = e.pageY - this.dy,
                lleft = e.pageX - this.dx;
            return this.setCoords(lleft, ltop),
                this._trigger("onDrag", e, this._getMouseCoords(e)),
                !1
        },
        _mouseStop: function (e) {
            $.ui.mouse.prototype._mouseStop.call(this, e),
                this.container.removeClass("iviewer_drag_cursor"),
                this._trigger("onStopDrag", 0, this._getMouseCoords(e))
        },
        _click: function (e) {
            this._trigger("onClick", 0, this._getMouseCoords(e))
        },
        _dblclick: function (ev) {
            if (this.options.onDblClick && this._trigger("onDblClick", 0, this._getMouseCoords(ev)), this.options.zoom_on_dblclick) {
                var container_offset = this.container.offset(),
                    mouse_pos =
                        {
                            x: ev.pageX - container_offset.left,
                            y: ev.pageY - container_offset.top
                        };
                this.zoom_by(1, mouse_pos)
            }
        },
        createui: function () {
            var me = this;
            $("<div>", {
                "class": "iviewer_zoom_in iviewer_common iviewer_button"
            }).bind("mousedown touchstart", function () {
                return me.zoom_by(1),
                    !1
            }).appendTo(this.container),
                $("<div>", {
                    "class": "iviewer_zoom_out iviewer_common iviewer_button"
                }).bind("mousedown touchstart", function () {
                    return me.zoom_by(-1),
                        !1
                }).appendTo(this.container),
                $("<div>", {
                    "class": "iviewer_zoom_zero iviewer_common iviewer_button"
                }).bind("mousedown touchstart", function () {
                    return me.set_zoom(100),
                        !1
                }).appendTo(this.container),
                $("<div>", {
                    "class": "iviewer_zoom_fit iviewer_common iviewer_button"
                }).bind("mousedown touchstart", function () {
                    return me.fit(this),
                        !1
                }).appendTo(this.container),
                this.zoom_object = $("<div>").addClass("iviewer_zoom_status iviewer_common").appendTo(this.container),
                $("<div>", {
                    "class": "iviewer_rotate_left iviewer_common iviewer_button"
                }).bind("mousedown touchstart", function () {
                    return me.angle(-90),
                        !1
                }).appendTo(this.container),
                $("<div>", {
                    "class": "iviewer_rotate_right iviewer_common iviewer_button"
                }).bind("mousedown touchstart", function () {
                    return me.angle(90),
                        !1
                }).appendTo(this.container),
                this.update_status()
        }
    }),
        $.ui.iviewer.ImageObject = function (do_anim) {
            this._img = $("<img>").css(
                {
                    position: "absolute",
                    top: "0px",
                    left: "0px"
                }),
                this._loaded = !1,
                this._swapDimensions = !1,
                this._do_anim = do_anim || !1,
                this.x(0, !0),
                this.y(0, !0),
                this.angle(0)
        },


        function () {
            this._reset = function (w, h) {
                this._angle = 0,
                    this._swapDimensions = !1,
                    this.x(0),
                    this.y(0),
                    this.orig_width(w),
                    this.orig_height(h),
                    this.display_width(w),
                    this.display_height(h)
            },
                this.loaded = function () {
                    return this._loaded
                },
                this.load = function (src, loaded, error) {
                    var self = this;
                    loaded = loaded || jQuery.noop,
                        this._loaded = !1;
                    var img = new Image;
                    img.onload = function () {
                        self._loaded = !0,
                            self._reset(this.width, this.height),
                            self._img.removeAttr("width").removeAttr("height").removeAttr("style").css(
                                {
                                    position: "absolute",
                                    top: "0px",
                                    left: "0px",
                                    maxWidth: "none"
                                }),
                            self._img[0].src = src,
                            loaded()
                    },
                        img.onerror = error,
                        setTimeout(function () {
                            img.src = src
                        }, 0),
                        this.angle(0)
                },
                this._dimension = function (prefix, name) {
                    var horiz = "_" + prefix + "_" + name,
                        vert = "_" + prefix + "_" + ("height" === name ? "width" : "height");
                    return setter(function (val) {
                        this[this._swapDimensions ? horiz : vert] = val
                    }, function () {
                        return this[this._swapDimensions ? horiz : vert]
                    })
                },
                this.display_width = this._dimension("display", "width"),
                this.display_height = this._dimension("display", "height"),
                this.display_diff = function () {
                    return Math.floor(this.display_width() - this.display_height())
                },
                this.orig_width = this._dimension("orig", "width"),
                this.orig_height = this._dimension("orig", "height"),
                this.x = setter(function (val, skipCss) {
                    this._x = val,
                        skipCss || (this._finishAnimation(), this._img.css("left", this._x + (this._swapDimensions ? this.display_diff() / 2 : 0) + "px"))
                }, function () {
                    return this._x
                }),
                this.y = setter(function (val, skipCss) {
                    this._y = val,
                        skipCss || (this._finishAnimation(), this._img.css("top", this._y - (this._swapDimensions ? this.display_diff() / 2 : 0) + "px"))
                }, function () {
                    return this._y
                }),
                this.angle = setter(function (deg) {
                    var prevSwap = this._swapDimensions;
                    if (this._angle = deg, this._swapDimensions = deg % 180 !== 0, prevSwap !== this._swapDimensions) {
                        var verticalMod = this._swapDimensions ? -1 : 1;
                        this.x(this.x() - verticalMod * this.display_diff() / 2, !0),
                            this.y(this.y() + verticalMod * this.display_diff() / 2, !0)
                    }
                    var cssVal = "rotate(" + deg + "deg)",
                        img = this._img;
                    jQuery.each(["", "-webkit-", "-moz-", "-o-", "-ms-"], function (i, prefix) {
                        img.css(prefix + "transform", cssVal)
                    }),
                        useIeTransforms && (jQuery.each(["-ms-", ""], function (i, prefix) {
                            img.css(prefix + "filter", ieTransforms[deg].filter)
                        }), img.css(
                            {
                                marginLeft: ieTransforms[deg].marginLeft * this.display_diff() / 2,
                                marginTop: ieTransforms[deg].marginTop * this.display_diff() / 2
                            }))
                }, function () {
                    return this._angle
                }),
                this.toOriginalCoords = function (point) {
                    switch (this.angle()) {
                        case 0:
                            return {
                                x: point.x,
                                y: point.y
                            };
                        case 90:
                            return {
                                x: point.y,
                                y: this.display_width() - point.x
                            };
                        case 180:
                            return {
                                x: this.display_width() - point.x,
                                y: this.display_height() - point.y
                            };
                        case 270:
                            return {
                                x: this.display_height() - point.y,
                                y: point.x
                            }
                    }
                },
                this.toRealCoords = function (point) {
                    switch (this.angle()) {
                        case 0:
                            return {
                                x: this.x() + point.x,
                                y: this.y() + point.y
                            };
                        case 90:
                            return {
                                x: this.x() + this.display_width() - point.y,
                                y: this.y() + point.x
                            };
                        case 180:
                            return {
                                x: this.x() + this.display_width() - point.x,
                                y: this.y() + this.display_height() - point.y
                            };
                        case 270:
                            return {
                                x: this.x() + point.y,
                                y: this.y() + this.display_height() - point.x
                            }
                    }
                },
                this.object = setter(jQuery.noop, function () {
                    return this._img
                }),
                this.setImageProps = function (disp_w, disp_h, x, y, skip_animation, complete) {
                    complete = complete || jQuery.noop,
                        this.display_width(disp_w),
                        this.display_height(disp_h),
                        this.x(x, !0),
                        this.y(y, !0);
                    var w = this._swapDimensions ? disp_h : disp_w,
                        h = this._swapDimensions ? disp_w : disp_h,
                        params =
                            {
                                width: w,
                                height: h,
                                top: y - (this._swapDimensions ? this.display_diff() / 2 : 0) + "px",
                                left: x + (this._swapDimensions ? this.display_diff() / 2 : 0) + "px"
                            };
                    useIeTransforms && jQuery.extend(params, {
                        marginLeft: ieTransforms[this.angle()].marginLeft * this.display_diff() / 2,
                        marginTop: ieTransforms[this.angle()].marginTop * this.display_diff() / 2
                    });
                    var swapDims = this._swapDimensions,
                        img = this._img;
                    if (useIeTransforms && swapDims) {
                        var ieh = this._img.width(),
                            iew = this._img.height(),
                            iedh = params.height - ieh;
                        iedw = params.width - iew,
                            delete params.width,
                            delete params.height
                    }
                    this._do_anim && !skip_animation ? this._img.stop(!0).animate(params, {
                        duration: 200,
                        complete: complete,
                        step: function (now, fx) {
                            if (useIeTransforms && swapDims && "top" === fx.prop) {
                                var percent = (now - fx.start) / (fx.end - fx.start);
                                img.height(ieh + iedh * percent),
                                    img.width(iew + iedw * percent),
                                    img.css("top", now)
                            }
                        }
                    }) : (this._img.css(params), setTimeout(complete, 0))
                },
                this._finishAnimation = function () {
                    this._img.stop(!0, !0)
                }
        }.apply($.ui.iviewer.ImageObject.prototype);
    var util =
        {
            scaleValue: function (value, toZoom) {
                return value * toZoom / 100
            },
            descaleValue: function (value, fromZoom) {
                return 100 * value / fromZoom
            }
        }
}(jQuery, void 0);