(function (window, $) {
    var unfoldHtml = "",
        cardImgHoverTimer,
        facedbData = [],
        labelsData = []; // 档案信息标签数据;
    // var	isInitMoreFlag = true;
    var staticDropBut = 0,
        dynamicDropBut = 1,
        staticIDDropBut = 0;

    var cacheArr = [], //缓存数组
        itemCache = '';  //当前缓存的图片序号 

    // 折半按钮
    $('.searchDisplayStatue').on('click', '.switch', function (e) {
        if (!$(this).hasClass('on')) {
            staticDropBut = 1;
            dynamicDropBut = 1;
            staticIDDropBut = 1;
            $('#collapseStatic').find('.panel-body').css({
                'height': 'calc(25vh - 3rem)'
            })
            $('#collapseDynamic').find('.panel-body').css({
                'height': 'calc(50vh - 3rem)'
            })
            $('#collapseStaticID').find('.panel-body').css({
                'height': 'calc(25vh - 3rem)'
            })

            $('#staticTitleContainer').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(-180deg)'
            });
            $('#dynamicTitleContainer').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(-180deg)'
            });
            $('#staticTitleContainerID').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(-180deg)'
            });

            $('#collapseStatic').collapse('show');
            $('#collapseDynamic').collapse('show');
            $('#collapseStaticID').collapse('show');
        } else {
            staticDropBut = 0;
            dynamicDropBut = 1;
            staticIDDropBut = 0;

            $('#staticTitleContainer').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(0)'
            });
            $('#dynamicTitleContainer').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(-180deg)'
            });
            $('#staticTitleContainerID').find('.aui-icon-drop-down-2').css({
                'transform': 'rotate(0)'
            });

            $('#collapseStatic').collapse('hide');
            $('#collapseDynamic').collapse('show');
            $('#collapseStaticID').collapse('hide');

            $('#searchMergeContent').find('.panel-body').css({
                'height': 'calc(100vh - 9rem)'
            });
        }
    })
    // 静态收缩按钮
    $('#staticTitleContainer').on('click', '.aui-icon-drop-down-2', function () {
        let that = this;
        if ($(that).attr('disabled') == 'disabled') {
            return;
        }
        $(that).attr('disabled', 'disabled');
        setTimeout(function () {
            $(that).removeAttr('disabled');
        }, 400);
        var $statueBut = $('.searchDisplayStatue').find('.switch');
        if ($statueBut.hasClass('on')) {
            $statueBut.removeClass('on');
        }
        if (staticDropBut == 0) {
            staticDropBut = 1;
            $(this).css({
                'transform': 'rotate(-180deg)'
            });
            if (dynamicDropBut == 0 && staticIDDropBut == 0) {
                if ($("#staticIDCount").hasClass("hide")) {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(100vh - 7rem)'
                    })
                } else {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                }
                $('#collapseDynamic').collapse('hide');
                $('#collapseStaticID').collapse('hide');
            } else if (dynamicDropBut == 1 && staticIDDropBut == 0) {
                if ($("#staticIDCount").hasClass("hide")) {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(50vh - 4rem)'
                    })
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(50vh - 3rem)'
                    })
                } else {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(50vh - 6rem)'
                    })
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(50vh - 3rem)'
                    })
                }
                $('#collapseDynamic').collapse('show');
                $('#collapseStaticID').collapse('hide');
            } else if (dynamicDropBut == 0 && staticIDDropBut == 1) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseDynamic').collapse('hide');
                $('#collapseStaticID').collapse('show');
            } else if (dynamicDropBut == 1 && staticIDDropBut == 1) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseDynamic').collapse('show');
                $('#collapseStaticID').collapse('show');
            }
            $('#collapseStatic').collapse('show');
        } else {
            staticDropBut = 0;
            $(this).css({
                'transform': 'rotate(0)'
            });
            $('#collapseStatic').collapse('hide');
            if ((dynamicDropBut == 0 && staticIDDropBut == 0) || (dynamicDropBut == 1 && staticIDDropBut == 0)) {
                $('#collapseDynamic').collapse('show');
                $('#collapseStaticID').collapse('hide');
                $('#dynamicTitleContainer').find('.aui-icon-drop-down-2').css({
                    'transform': 'rotate(-180deg)'
                });
                if ($("#staticIDCount").hasClass("hide")) {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 7rem)'
                    })
                } else {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                }
            } else if (dynamicDropBut == 0 && staticIDDropBut == 1) {
                $('#collapseDynamic').collapse('hide');
                $('#collapseStaticID').collapse('show');
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })
            } else if (dynamicDropBut == 1 && staticIDDropBut == 1) {
                $('#collapseDynamic').collapse('show');
                $('#collapseStaticID').collapse('show');
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
            }
        }
    });
    // 动态收缩按钮
    $('#dynamicTitleContainer').on('click', '.aui-icon-drop-down-2', function (e) {
        var $statueBut = $('.searchDisplayStatue').find('.switch');
        if ($statueBut.hasClass('on')) {
            $statueBut.removeClass('on');
        }
        if (dynamicDropBut == 0) {
            dynamicDropBut = 1;
            $(this).css({
                'transform': 'rotate(-180deg)'
            });
            $('#collapseDynamic').collapse('show');
            if (staticDropBut == 0 && staticIDDropBut == 0) {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })
                $('#collapseStatic').collapse('hide');
                $('#collapseStaticID').collapse('hide');
            } else if (staticDropBut == 1 && staticIDDropBut == 0) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStatic').collapse('show');
                $('#collapseStaticID').collapse('hide');
            } else if (staticDropBut == 0 && staticIDDropBut == 1) {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStatic').collapse('hide');
                $('#collapseStaticID').collapse('show');
            } else if (staticDropBut == 1 && staticIDDropBut == 1) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStatic').collapse('show');
                $('#collapseStaticID').collapse('show');
            }
        } else {
            if (staticDropBut == 0 && staticIDDropBut == 0) {
                dynamicDropBut = 1;
                $(this).css({
                    'transform': 'rotate(180)'
                });
                $('#collapseDynamic').collapse('show');
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })
                $('#collapseStatic').collapse('hide');
                $('#collapseStaticID').collapse('hide');
            } else {
                dynamicDropBut = 0;
                $(this).css({
                    'transform': 'rotate(0)'
                });
                $('#collapseDynamic').collapse('hide');
                if (staticDropBut == 1 && staticIDDropBut == 0) {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                    $('#collapseStatic').collapse('show');
                    $('#collapseStaticID').collapse('hide');
                } else if (staticDropBut == 0 && staticIDDropBut == 1) {
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                    $('#collapseStatic').collapse('hide');
                    $('#collapseStaticID').collapse('show');
                } else if (staticDropBut == 1 && staticIDDropBut == 1) {
                    $('#collapseStatic').find('.panel-body').css({
                        'height': 'calc(50vh - 3rem)'
                    })
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(50vh - 6rem)'
                    })
                    $('#collapseStatic').collapse('show');
                    $('#collapseStaticID').collapse('show');
                }
            }
        }
    })

    // 静态全量收缩按钮
    $('#staticTitleContainerID').on('click', '.aui-icon-drop-down-2', function () {
        var $statueBut = $('.searchDisplayStatue').find('.switch');
        if ($statueBut.hasClass('on')) {
            $statueBut.removeClass('on');
        }
        if (staticIDDropBut == 0) {
            staticIDDropBut = 1;
            $(this).css({
                'transform': 'rotate(-180deg)'
            });
            $('#collapseStaticID').collapse('show');
            if (staticDropBut == 0 && dynamicDropBut == 0) {
                if ($("#allCount").hasClass("hide")) {
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(100vh - 7rem)'
                    })
                } else {
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                }
                $('#collapseStatic').collapse('hide');
                $('#collapseDynamic').collapse('hide');
            } else if (staticDropBut == 1 && dynamicDropBut == 0) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseDynamic').collapse('hide');
                $('#collapseStatic').collapse('show');
            } else if (staticDropBut == 0 && dynamicDropBut == 1) {
                if ($("#allCount").hasClass("hide")) {
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(50vh - 4rem)'
                    })
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(50vh - 3rem)'
                    })
                } else {
                    $('#collapseStaticID').find('.panel-body').css({
                        'height': 'calc(50vh - 6rem)'
                    })
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(50vh - 3rem)'
                    })
                }
                $('#collapseStatic').collapse('hide');
                $('#collapseDynamic').collapse('show');
            } else if (staticDropBut == 1 && staticIDDropBut == 1) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStatic').collapse('show');
                $('#collapseDynamic').collapse('show');
            }
        } else {
            staticIDDropBut = 0;
            $(this).css({
                'transform': 'rotate(0)'
            });
            $('#collapseStaticID').collapse('hide');
            if (staticDropBut == 0 && dynamicDropBut == 0) {
                if ($("#allCount").hasClass("hide")) {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 7rem)'
                    })
                } else {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                }
                $('#collapseStatic').collapse('hide');
                $('#collapseDynamic').collapse('show');
            } else if (staticDropBut == 1 && dynamicDropBut == 0) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })
                $('#collapseDynamic').collapse('hide');
                $('#collapseStatic').collapse('show');
            } else if (staticDropBut == 0 && dynamicDropBut == 1) {
                if ($("#allCount").hasClass("hide")) {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 7rem)'
                    })
                } else {
                    $('#collapseDynamic').find('.panel-body').css({
                        'height': 'calc(100vh - 9rem)'
                    })
                }
                $('#collapseStatic').collapse('hide');
                $('#collapseDynamic').collapse('show');
            } else if (staticDropBut == 1 && dynamicDropBut == 1) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 6rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStatic').collapse('show');
                $('#collapseDynamic').collapse('show');
            }
        }
    });

    // 小横条收缩按钮静态
    $('#staticTitleContainer').on('click', '.aui-icon-drop-down', function () {
        var $staticHead = $('#collapseStatic'),
            $staticIDHead = $('#collapseStaticID'),
            $dynamicHead = $('#collapseDynamic');
        if ($staticHead.hasClass('colsePanel')) {
            $(this).css({
                'transform': 'rotate(-180deg)'
            });
            if ($staticIDHead.hasClass("colsePanel")) {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 4rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 5rem)'
                })

                $('#collapseStaticID').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.removeClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.addClass("colsePanel");
            } else {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })

                $staticHead.removeClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.removeClass("colsePanel");
            }
        } else {
            $(this).css({
                'transform': 'rotate(0)'
            });
            if ($staticIDHead.hasClass("colsePanel")) {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })

                $('#collapseStaticID').find('.panel-body').css({
                    'height': '0'
                })

                $('#collapseStatic').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.addClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.addClass("colsePanel");
            } else {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 5rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 4rem)'
                })

                $('#collapseStatic').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.addClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.removeClass("colsePanel");
            }
        }
    });

    // 小横条收缩按钮静态全量
    $('#staticTitleContainerID').on('click', '.aui-icon-drop-down', function () {
        var $staticHead = $('#collapseStatic'),
            $staticIDHead = $('#collapseStaticID'),
            $dynamicHead = $('#collapseDynamic');
        if ($staticIDHead.hasClass('colsePanel')) {
            $(this).css({
                'transform': 'rotate(0)'
            });

            if ($staticHead.hasClass("colsePanel")) {
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(50vh - 4rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 5rem)'
                })
                $('#collapseStatic').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.addClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.removeClass("colsePanel");
            } else {
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 3rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': 'calc(25vh - 3rem)'
                })

                $staticHead.removeClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.removeClass("colsePanel");
            }
        } else {
            $(this).css({
                'transform': 'rotate(-180deg)'
            });
            if ($staticHead.hasClass("colsePanel")) {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(100vh - 9rem)'
                })
                $('#collapseStatic').find('.panel-body').css({
                    'height': '0'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.addClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.addClass("colsePanel");
            } else {
                $('#collapseDynamic').find('.panel-body').css({
                    'height': 'calc(50vh - 5rem)'
                })
                $('#collapseStatic').find('.panel-body').css({
                    'height': 'calc(50vh - 4rem)'
                })
                $('#collapseStaticID').find('.panel-body').css({
                    'height': '0'
                })

                $staticHead.removeClass("colsePanel");
                $dynamicHead.removeClass("colsePanel");
                $staticIDHead.addClass("colsePanel");
            }
        }
    });

    //静态库双击全屏
    $("#staticTitleContainer").on("dblclick", function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        if ($(e.target).hasClass("aui-icon-drop-down")) {
            return;
        }
        var $staticHead = $('#staticTitleContainer').closest('.panel-heading');
        $(this).find(".aui-icon-drop-down").css({
            'transform': 'rotate(-180deg)'
        });
        $("#staticTitleContainerID").find(".aui-icon-drop-down").css({
            'transform': 'rotate(-180deg)'
        });
        $('#collapseDynamic').find('.panel-body').css({
            'height': '0'
        })
        $('#collapseStatic').find('.panel-body').css({
            'height': 'calc(100vh - 9rem)'
        })
        $('#collapseStaticID').find('.panel-body').css({
            'height': '0'
        })

        $('#collapseStatic').removeClass("colsePanel");
        $('#collapseDynamic').removeClass("colsePanel");
        $('#collapseStaticID').addClass("colsePanel");
    });

    //动态态全量库双击全屏
    $("#dynamicTitleContainer").on("dblclick", function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        var $dynamicHead = $('#dynamicTitleContainer').closest('.panel-heading');
        $("#staticTitleContainer").find(".aui-icon-drop-down").css({
            'transform': 'rotate(0)'
        });
        $("#staticTitleContainerID").find(".aui-icon-drop-down").css({
            'transform': 'rotate(-180deg)'
        });
        $('#collapseDynamic').find('.panel-body').css({
            'height': 'calc(100vh - 9rem)'
        })
        $('#collapseStatic').find('.panel-body').css({
            'height': '0'
        })
        $('#collapseStaticID').find('.panel-body').css({
            'height': '0'
        })

        $('#collapseStatic').addClass("colsePanel");
        $('#collapseDynamic').removeClass("colsePanel");
        $('#collapseStaticID').addClass("colsePanel");
    });

    //静态全量库双击全屏
    $("#staticTitleContainerID").on("dblclick", function (e) {
        e.stopPropagation();
        e.preventDefault();
        window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
        if ($(e.target).hasClass("aui-icon-drop-down")) {
            return;
        }

        var $staticIDHead = $('#staticTitleContainerID').closest('.panel-heading');
        $("#staticTitleContainer").find(".aui-icon-drop-down").css({
            'transform': 'rotate(0)'
        });
        $(this).find(".aui-icon-drop-down").css({
            'transform': 'rotate(0)'
        });
        $('#collapseDynamic').find('.panel-body').css({
            'height': '0'
        })
        $('#collapseStatic').find('.panel-body').css({
            'height': '0'
        })
        $('#collapseStaticID').find('.panel-body').css({
            'height': 'calc(100vh - 9rem)'
        })

        $('#collapseStatic').addClass("colsePanel");
        $('#collapseDynamic').removeClass("colsePanel");
        $('#collapseStaticID').removeClass("colsePanel");
    });

    //静态全量向上拖拽
    $("#staticTitleContainerID").on("mousedown", function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var collapseStaticIDHeight = $('#collapseStaticID').find('.panel-body').height(),
            collapseDynamicHeight = $('#collapseDynamic').find('.panel-body').height(),
            offsetY = $("#staticTitleContainerID").offset().top;
        $(this).data('movePositionY', evt.clientY);
        $(document).on('mousemove.searchMergeOnly', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var mousedownHeight = offsetY - e.pageY,
                dynamicHeight = collapseDynamicHeight - mousedownHeight,
                staticIDHeight = collapseStaticIDHeight + mousedownHeight,
                posY = Math.abs(e.clientY - $("#staticTitleContainerID").data("movePositionY"));
            if (posY > 10) {
                if (dynamicHeight > 0) {
                    if (staticIDHeight > 0) {
                        $("#collapseDynamic").find('.panel-body').css({
                            'height': dynamicHeight
                        });
                        $("#collapseStaticID").find(".panel-body").css({
                            'height': staticIDHeight
                        });
                        if ($('#collapseStaticID').hasClass("colsePanel")) {
                            $("#staticTitleContainerID").find(".aui-icon-drop-down").css({
                                'transform': 'rotate(0)'
                            });
                            $('#collapseStaticID').removeClass('colsePanel');
                        }
                    } else {
                        if (!$('#collapseStaticID').hasClass("colsePanel")) {
                            $("#staticTitleContainerID").find(".aui-icon-drop-down").css({
                                'transform': 'rotate(-180deg)'
                            });
                            $('#collapseStaticID').addClass('colsePanel');
                        }

                        $("#collapseDynamic").find('.panel-body').css({
                            'height': collapseDynamicHeight + collapseStaticIDHeight + $("#dynamicTitleContainer").height() - $("#staticTitleContainerID").height()
                        });
                        $("#collapseStaticID").find(".panel-body").css({
                            'height': 0
                        });
                    }
                } else {
                    $("#collapseDynamic").find('.panel-body').css({
                        'height': 0
                    });
                    $("#collapseStaticID").find(".panel-body").css({
                        'height': collapseDynamicHeight + collapseStaticIDHeight
                    });
                }
            }
        });
        // 绑定全局鼠标恢复事件
        $(document).on('mouseup.dropSelect', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(document).off('mousemove.searchMergeOnly mouseup.dropSelect');

        });
    });

    //动态库向上拖拽
    $("#dynamicTitleContainer").on("mousedown", function (evt) {
        evt.stopPropagation();
        evt.preventDefault();
        var collapseStaticHeight = $('#collapseStatic').find('.panel-body').height(),
            collapseDynamicHeight = $('#collapseDynamic').find('.panel-body').height(),
            offsetY = $("#dynamicTitleContainer").offset().top;
        $(this).data('movePositionY', evt.clientY);
        $(document).on('mousemove.searchMergeOnly', function (e) {
            e.stopPropagation();
            e.preventDefault();
            var mousedownHeight = offsetY - e.pageY,
                dynamicHeight = collapseDynamicHeight + mousedownHeight,
                staticHeight = collapseStaticHeight - mousedownHeight,
                posY = Math.abs(e.clientY - $("#dynamicTitleContainer").data("movePositionY"));
            if (posY > 10) {
                if (dynamicHeight > 0) {
                    if (staticHeight > 0) {
                        $("#collapseDynamic").find('.panel-body').css({
                            'height': dynamicHeight
                        });
                        $("#collapseStatic").find(".panel-body").css({
                            'height': staticHeight
                        });

                        if ($('#collapseStatic').hasClass("colsePanel")) {
                            $("#staticTitleContainer").find(".aui-icon-drop-down").css({
                                'transform': 'rotate(-180deg)'
                            });
                            $('#collapseStatic').removeClass("colsePanel");
                        }
                    } else {
                        if (!$('#collapseStatic').hasClass("colsePanel")) {
                            $("#staticTitleContainer").find(".aui-icon-drop-down").css({
                                'transform': 'rotate(0)'
                            });
                            $('#collapseStatic').addClass("colsePanel");
                        }

                        $("#collapseStatic").find(".panel-body").css({
                            'height': 0
                        });

                        $("#collapseDynamic").find('.panel-body').css({
                            'height': collapseDynamicHeight + collapseStaticHeight + $("#dynamicTitleContainer").height() - $("#staticTitleContainer").height()
                        });
                    }
                } else {
                    $("#collapseDynamic").find('.panel-body').css({
                        'height': 0
                    });
                    $("#collapseStatic").find(".panel-body").css({
                        'height': collapseDynamicHeight + collapseStaticHeight
                    });
                }
            }
        });
        // 绑定全局鼠标恢复事件
        $(document).on('mouseup.dropSelect', function (e) {
            e.stopPropagation();
            e.preventDefault();
            $(document).off('mousemove.searchMergeOnly mouseup.dropSelect');

        });
    });

    // 动静结合页面 初始化 页面图片列表 加载空页面
    function initPage() {
        // var $searchInfo = $('#search-info'),
        //     $sortByTimeWrapper = $('#sortByTimeWrapper'),
        //     $timeTogetherWrapper = $('#timeTogetherWrapper'),
        //     $positionTogetherWrapper = $('#positionTogetherWrapper');
        // loadEmpty($searchInfo); // 动态检索 按相似度排序 加载空页面
        // loadEmpty($sortByTimeWrapper); // 动态检索 按时间序 加载空页面
        // loadEmpty($timeTogetherWrapper); // 动态检索 按时间聚合 加载空页面
        // loadEmpty($positionTogetherWrapper); // 动态检索 按地点聚合 加载空页面
        loadEmpty($('#staticSearchResult')); // 静态检索 加载空页面
        loadEmpty($('#staticSearchResultID')); // 静态全量检索 加载空页面
        var $imageCacheDynamicList = $('#imageCacheMergeList');
        loadEmpty($imageCacheDynamicList); // 动态检索 按地点聚合 加载空页面
        $("#staticTitleContainer").find(".centerBut .aui-icon-drop-down").click();
        $('#collapseStatic').collapse('show');
        $('#collapseDynamic').collapse('show');
        $('#collapseStaticID').collapse('show');
        $("#current-page").find(".idcardSelect").selectmenu();
    }

    // 动静结合页面 左侧图片 初始化
    window.initImg = function (inseartImg) {
        var img = $("#imgBase64").val(),
            camera = $("#imgBase64").data('carema'),
            html = '';
        if (inseartImg) {
            img = inseartImg;
        }
        if ($("#imgBase64").data('base64')) {
            img = $("#imgBase64").data('base64');
        }
        showLoading($('#cameraList').parent());
        // 判断是否有摄像机数据
        if (camera) {
            hideLoading($('#cameraList').parent());
            $('#cameraList').val('已选' + camera + '台摄像机');
        }
        // 绑定摄像机删除按钮事件
        $('#cameraList').siblings().on('click', function () {
            $('#cameraList').val('');
            var $data = $('#cameraList').data('cameraList');
            if ($data) {
                $('#cameraList').data({
                    'cameraList': []
                })
            }
        });
        if (!isEmpty(img)) {
            $("#imgBase64").removeData('base64');
            html = createAddImageItem(img);
            $("#usearchImg").find('.add-image-item').removeClass('active');
            $("#usearchImg .add-image-icon").before(html);
            if ($("#imgBase64").data('searchImmedia')) {
                $("#imgBase64").removeData('searchImmedia')
                imgDom(img, $('#mergeSearch'), $("#usearchImg"));
            } else {
                imgDom(img, $('#mergeSearch'), $("#usearchImg"), true);
            }
            $("#imgBase64")[0].value = '';
            $('#usearchImg').removeClass('center');
            $('#usearchImg').find('.add-image-icon').removeClass('add-image-new');
            $('#usearchImg').find('.add-image-box-text').addClass('hide');
        } else {
            $('#usearchImg').addClass('center');
        }

        getSelectComments($("#commentSelectMerge"));
    }

    // 动静结合页面 图片上传
    $('#usearchImg').find('.uploadFile').on('change.searchMerge', function () {
        if ($("#mergeSearch").hasClass("hide") && $("#mergeSearch").attr("type") != '624') {
            this.value = '';
            $(this).attr("title", "");
            warningTip.say("该事件暂无检索权限，请切换事件或点击申请检索按钮发起检索申请");
            return;
        }
        if (this.value != '') {
            var _this = $(this),
                html = '',
                fileNameArr = this.value.split('\\'), // 文件名路径数组
                fileName = fileNameArr[fileNameArr.length - 1], // 获取文件名字
                fileSize = this.files[0].size,
                fileNameTypeArr = fileName.split('.'),
                fileType = fileNameTypeArr[fileNameTypeArr.length - 1].toLowerCase(),
                typeArr = ['bmp', 'jpg', 'jpeg', 'png', 'dib', 'webp', 'svgz', 'gif', 'ico', 'svg', 'tif', 'xbm', 'jfif', 'pjpeg', 'pjp', 'tiff'];
            if (typeArr.indexOf(fileType) < 0) {
                this.value = '';
                warningTip.say('格式不正确,请上传图片格式');
                return;
            }
            // 判断文件大小是否超过1M 
            if (fileSize > 10 * 1024 * 1024) {
                warningTip.say('上传文件过大,请上传不大于10M的文件');
                this.value = '';
                return;
            }
            var reader = new FileReader();
            reader.onload = function (e) {
                var addimg = reader.result;
                html = createAddImageItem(addimg);
                _this.closest('.add-image-icon').before(html);
                $('#usearchImg').find('.uploadFile')[0].value = '';
                var $imgItem = $('#usearchImg').find('.add-image-item');
                if ($imgItem.length > 5) {
                    $('#usearchImg').removeClass('scroll');
                    var clientH = $('#usearchImg')[0].clientHeight;
                    $('#usearchImg').addClass('scroll');
                    $('#usearchImg').animate({
                        'scrollTop': clientH
                    }, 500);
                }
                imgDom(addimg, $('#mergeSearch'), $("#usearchImg"), true);
                $("#mergeSearch").removeClass("hide");
                $("#mergeApply").addClass("hide");
                $("#resetBtn").removeClass("hide");
            };
            reader.readAsDataURL(this.files[0]);
            $('#usearchImg').removeClass('center');
            $('#usearchImg').find('.add-image-icon').removeClass('add-image-new');
            $('#usearchImg').find('.add-image-box-text').addClass('hide');
            $("#usearchImg .add-image-icon").siblings('.add-image-item').removeClass('active');
        }
    });

    //切换图片反显搜索条件
    function showSearchLimitMerge($data) {
        $("#ageStart").val($data.agegroup ? $data.agegroup.split("-")[0] : '');
        $("#ageEnd").val($data.agegroup ? $data.agegroup.split("-")[1] : '');
        $("#sex").find(`input[name=radio-1][value=${$data.sex || '-1'}]`).next().click();
        //全部人脸库
        if (($data.libids && facedbData.length == $data.libids.length) || !$data.libids) {
            $("#facedb .facedb-box-title .ui-checkboxradio-label").addClass('ui-checkboxradio-checked');
        } else {
            $("#facedb .facedb-box-title .ui-checkboxradio-label").removeClass('ui-checkboxradio-checked');
            let libOtherArr = facedbData.filter(element => {
                return $data.libids.indexOf(element.libId) < 0;
            })
            libOtherArr.forEach(element => {
                $("#facedbContent").find(`.ui-checkboxradio-label[value=${element.libId}]`).next().removeAttr('checked');
            });
        }
        if ($data.libids) {
            $data.libids.forEach(element => {
                $("#facedbContent").find(`.ui-checkboxradio-label[value=${element}]`).next().prop('checked', true);
            });
        } else {
            facedbData.forEach(element => {
                $("#facedbContent").find(`.ui-checkboxradio-label[value=${element.libId}]`).next().prop('checked', true);
            });
        }

        //厂家
        if ($data.platformId) {
            let platformOtherArr = $('#sf').data("cjData").filter(element => {
                return $data.platformId.indexOf(element.platformId) < 0;
            })
            platformOtherArr.forEach(element => {
                $("#sf").find(`.ui-checkboxradio-label[cjid=${element.platformId}]`).next().removeAttr('checked');
            });
            $data.platformId.forEach(element => {
                $("#sf").find(`.ui-checkboxradio-label[cjid=${element}]`).next().prop('checked', true);
            });
        } else {
            $('#sf').data("cjData").forEach(element => {
                $("#sf").find(`.ui-checkboxradio-label[cjid=${element.platformId}]`).next().prop('checked', true);
            });
        }

        //结果数
        $("#top").find(`input[name=top-1][value=${$data.limit || 20}]`).next().click();
        checkboxFunc();
        radioFunc();

        //动态
        $("#timeStart").val($data.startTime || sureSelectTime(-30).date);
        $("#timeEnd").val($data.endTime || sureSelectTime().now);

        $('#searchMerge_Time').find('.datepicker-input').eq(0).blur();
        $('#searchMerge_Time').find('.datepicker-input').eq(1).blur();

        $("#sliderInput").val($data.threshold || '90');
        $("#slider1").slider("value", $data.threshold || '90');

        $("#dynamicTitleContainer").find(`input[name='cjMergeType'][value=${$data.nodeType}]`).prev().click().attr("isclick", "0");
        $("#dynamicTitleContainer").find(`input[name='cjMergeType'][value=${$data.nodeType}]`).prev().removeAttr("isclick");

        if ($data.nodeType == 1 || !$data.nodeType) {  //市局总中心
            $("#timeTogether").removeClass('text-disabled');
            $("#timeTogether").prev().removeClass('text-disabled');
            $("#placeTogether").removeClass('text-disabled');
            $("#placeTogether").prev().removeClass('text-disabled');
        } else {   //龙岗分中心
            $("#timeTogether").addClass('text-disabled');
            $("#timeTogether").prev().addClass('text-disabled');
            $("#placeTogether").addClass('text-disabled');
            $("#placeTogether").prev().addClass('text-disabled');
        }


        //区域选择
        if ($data.videoGroups && $data.videoGroups.length > 0) {
            //类点
            if ($data.type == "") {
                //$(`input[name='mergeCameraType']`).eq(0).click();
                $(`input[name='mergeCameraType']`).eq(1).click();
            } else {
                $(`input[name='mergeCameraType'][value=${$data.type}]`).click();
            }

            $("#selMergeCameraID .searchArea").show();
            $("#selMergeCameraID .searchMap").hide();
            $("#searchSelect").addClass("btn-primary");
            $("#searchMap").removeClass("btn-primary");
            $("#sidebarOrgSelect").prop('disabled', false); // 非不可选
            $("#sidebarOrgSelect").val($data.orgId);
            $("#sidebarOrgSelect").selectpicker("refresh");

            $("#sidebarPoliceSelect").prop('disabled', "disabled"); // 非不可选
            $("#sidebarPoliceSelect").val("");
            $("#sidebarPoliceSelect").selectpicker("refresh");

            $("#sidebarCameraSelect").prop('disabled', "disabled"); // 非不可选
            $("#sidebarCameraSelect").val("");
            $("#sidebarCameraSelect").selectpicker("refresh");

            if ($data.orgId != '10') {
                $("#sidebarPoliceSelect").prop('disabled', false); // 非不可选
                loadSearchOrgInfo($("#sidebarPoliceSelect"), $data.orgId, false, $data.policeDataOb); //通过机构请求派出所
            } else {
                $("#sidebarPoliceSelect").prop('disabled', "disabled"); // 非不可选
            }

            if ($data.policeDataOb.length > 0) {
                $("#sidebarCameraSelect").prop('disabled', false); // 非不可选
                loadSearchCameraInfo($("#sidebarCameraSelect"), $data.policeDataOb, $data.areaDataObj); //通过请求派出所
            } else {
                $("#sidebarCameraSelect").prop('disabled', "disabled"); // 非不可选
            }
        } else if (!$data.videoGroups) {
            //类点
            //$(`input[name='mergeCameraType']`).eq(0).click();
            $(`input[name='mergeCameraType']`).eq(1).click();
            $("#selMergeCameraID .searchArea").show();
            $("#selMergeCameraID .searchMap").hide();
            $("#searchSelect").addClass("btn-primary");
            $("#searchMap").removeClass("btn-primary");
            $("#sidebarOrgSelect").prop('disabled', false); // 非不可选
            $("#sidebarOrgSelect").val("10");
            $("#sidebarOrgSelect").selectpicker("refresh");

            $("#sidebarPoliceSelect").prop('disabled', "disabled"); // 非不可选
            $("#sidebarPoliceSelect").val("");
            $("#sidebarPoliceSelect").selectpicker("refresh");

            $("#sidebarCameraSelect").prop('disabled', "disabled"); // 非不可选
            $("#sidebarCameraSelect").val("");
            $("#sidebarCameraSelect").selectpicker("refresh");
        } else if ($data.saveData) { //地图选择
            $("#selMergeCameraID .searchArea").hide();
            $("#selMergeCameraID .searchMap").show();
            $("#searchSelect").removeClass("btn-primary");
            $("#searchMap").addClass("btn-primary");
            $("#selMergeCameraID").find(".js-remove-all").click();
            let mapDataArr = $data.saveData;
            mapDataArr.forEach(item => {
                renderNodePage(item.arr, item.listArr, true, $('#saveNodeSearch'));
            })
        }
    };

    //动态厂家选择
    $("#cjMergeOne,#cjMergeTwo").on("click", function () {
        if ($(this).prev().attr("isclick")) {
            return;
        }
        if ($(this).attr("id") == "cjMergeTwo") {
            selectType = 2;
        }
        window.isOnlyFresh = true;
        $('#mergeSearch').click(); // 搜索
    });

    // 动静结合页面 左侧图片点击事件 左侧有多个图片时 切换图片选中状态
    $('#usearchImg').on('click', '.add-image-item', function () {
        $(this).addClass('active').siblings('.add-image-item').removeClass('active');
        var $addImgBox = $(this).find('.add-image-img');
        if (!$addImgBox.attr('picId') || $addImgBox.attr('picstatus') != '1') {
            getPicId($addImgBox.attr('src'), $(this).attr('value'), $('#usearchImg')); // 获取图片的唯一picId
        } else {
            //切换的图片是缓存图片的话显示缓存图片对应的div
            if ($addImgBox.attr("cache") != undefined) {
                itemCache = $addImgBox.attr("cache");
                $("#allCount").html('(' + ($("#staticContentContainer").find(`#factoryData${$addImgBox.attr("cache")}`).attr("allCountS") || 0) + ')');
                $("#staticContentContainer").find(`#factoryData${$addImgBox.attr("cache")}`).removeClass("hide").siblings().addClass("hide");
                showSearchLimitMerge($(this).find(".add-image-img").data());

                $("#factoryData" + itemCache).find(".tab-pane.active .image-new-list .image-new-wrap").eq(0).click();

                $("#imageCacheMergeList").find(`#image-merge-list-${$addImgBox.attr("cache")}`).removeClass("hide").siblings().addClass("hide");
                $('#usearchImg').data("maskImg", $addImgBox.attr("src"));
                sortList = $("#image-merge-list-" + itemCache).data("sortListDynamic") && $("#image-merge-list-" + itemCache).data("sortListDynamic").length > 0 ? $("#image-merge-list-" + itemCache).data("sortListDynamic") : [];
                sortTimeList = $("#image-merge-list-" + itemCache).data("sortTimeListDynamic") && $("#image-merge-list-" + itemCache).data("sortTimeListDynamic").length > 0 ? $("#image-merge-list-" + itemCache).data("sortTimeListDynamic") : [];
                timeTogetherList = $("#image-merge-list-" + itemCache).data('timeTogetherListDynamic') && $("#image-merge-list-" + itemCache).data('timeTogetherListDynamic').length > 0 ? $("#image-merge-list-" + itemCache).data('timeTogetherListDynamic') : [];
                positionTogetherList = $("#image-merge-list-" + itemCache).data('positionTogetherListDynamic') && $("#image-merge-list-" + itemCache).data('positionTogetherListDynamic').length > 0 ? $("#image-merge-list-" + itemCache).data('positionTogetherListDynamic') : [];
                $("#courseAnalyse").addClass("disabled");
                if ($("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0) {
                    $("#courseAnalyse").removeClass("disabled");
                }

                //显示总数
                $('#sortTotal').html($("#search-info" + itemCache).attr("sorttotal") ? `(${$("#search-info" + itemCache).attr("sorttotal")})` : '');
                $('#sortByTimeTotal').html($("#sortByTimeWrapper" + itemCache).attr("sortbytimetotal") ? `(${$("#sortByTimeWrapper" + itemCache).attr("sortbytimetotal")})` : '');
                $('#timeTogetherTotal').html($("#timeTogetherWrapper" + itemCache).attr("timetogether") ? `(${$("#timeTogetherWrapper" + itemCache).attr("timetogether")})` : '');
                $('#positionTogetherTotal').html($("#positionTogetherWrapper" + itemCache).attr("positiontogether") ? `(${$("#positionTogetherWrapper" + itemCache).attr("positiontogether")})` : '');

                //排序方式
                if ($("#imageCacheMergeList").find(`#image-merge-list-${$addImgBox.attr("cache")}`).attr("sort") == 1) {  //相识度
                    $("#sortByScore").click();
                } else if ($("#imageCacheMergeList").find(`#image-merge-list-${$addImgBox.attr("cache")}`).attr("sort") == 2) {  //时间排序
                    $("#sortByTime").click();
                } else if ($("#imageCacheMergeList").find(`#image-merge-list-${$addImgBox.attr("cache")}`).attr("sort") == 3) {  //时间聚合
                    $("#timeTogether").click();
                } else if ($("#imageCacheMergeList").find(`#image-merge-list-${$addImgBox.attr("cache")}`).attr("sort") == 4) {  //地点聚合
                    $("#placeTogether").click();
                }
            }
            getPowerUse('3', $("#commentSelectMerge").find(".selectpicker").val(), $addImgBox.attr('picId'));
        }
    }).on('dblclick', '.add-image-item', function (e) {
        var $targetImg = $('#usearchImg'),
            base64Img = $(this).find('img').attr('src');
        cutOutImage(base64Img, $targetImg);
    })

    // 左侧图片 删除事件
    $('#usearchImg').on('click', '.aui-icon-delete-line', function (e) {
        e.stopPropagation();
        var father = $(this).closest('.add-image-item');
        var index = father.find(".add-image-img").attr("cache");
        $("#image-merge-list-" + index).remove();
        //把对应的图片缓存删除
        cacheArr.forEach((val, index) => {
            if (father.find(".add-image-img").hasClass("cache" + val)) {
                cacheArr.splice(index, 1);
                $("#staticContentContainer").find(`#factoryData${val}`).remove();
            }
        })
        $('#current-page').find(".card-img-hover").remove();
        father.remove();
        var $imgItem = $('#usearchImg').find('.add-image-item');
        if (!$('#usearchImg').find('.add-image-item.active').length) {
            $imgItem.eq(-1).addClass('active');
        }
        if ($imgItem.length < 6) {
            $('#usearchImg').removeClass('scroll');
        }
        if ($imgItem.length === 0) {
            $('#usearchImg').addClass('center');
            $('#usearchImg').find('.add-image-icon').addClass('add-image-new');
            $('#usearchImg').find('.add-image-box-text').removeClass('hide');
        }
        if (!$("#staticSearchResult").find(".factoryData").length) {
            $("#staticSearchResult").find(".flex-column-wrap.empty-wrap").removeClass("hide");
            $("#allCount").html("");
            loadEmpty($('#staticSearchResultID')); // 静态全量检索 加载空页面
        }

        if (!$("#imageCacheMergeList").find(".image-card-list.no-bottom-border").length) {
            $("#imageCacheMergeList").find(".flex-column-wrap.empty-wrap").removeClass("hide");
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $("#courseAnalyse").addClass("disabled");
            $("#sortTotal").html("");
            $("#sortByTimeTotal").html("");
            $("#timeTogetherTotal").html("");
            $("#positionTogetherTotal").html("");
            sortList = [];
            sortTimeList = [];
            timeTogetherList = [];
            positionTogetherList = [];
            allSelectedCardList = []; // 动态库 所有被选中的图片
        }
        $('#usearchImg').find('.add-image-item.active').click();
    })

    // 时间控件构建,以及相关事件
    $('.btn-group.btn-group-capsule').find('button').on('click', function () {
        var date = $(this).data().date;
        window.initDatePicker1($('#searchMerge_Time'), -date, true);
        $(this).addClass('btn-primary').siblings().removeClass('btn-primary');
    });

    // 动静结合页面 左侧 动态库 点击区域/地图中的区域按钮
    $("#searchSelect").on("click", function () {
        $("#selMergeCameraID .searchArea").show();
        $("#selMergeCameraID .searchMap").hide();
        $("#searchSelect").addClass("btn-primary");
        $("#searchMap").removeClass("btn-primary");
        if ($("#searchResultFlex").find("i").attr("class") === "aui-icon-drop-right") {
            $("#searchResultFlex").find("i").attr("class", "aui-icon-drop-left");
        }
        $('#searchMergeContent').animate({
            "width": "98%"
        }, 200);
        $('#searchResultFlex').animate({
            "left": "98%"
        }, 200);
    });

    // 动静结合页面 左侧 动态库 点击区域/地图中的地图按钮
    $("#searchMap").on("click", function () {
        $("#selMergeCameraID .searchArea").hide();
        $("#selMergeCameraID .searchMap").show();
        $("#searchSelect").removeClass("btn-primary");
        $("#searchMap").addClass("btn-primary");
        if ($("#searchResultFlex").find("i").attr("class") === "aui-icon-drop-left") {
            $("#searchResultFlex").find("i").attr("class", "aui-icon-drop-right");
        }
        $('#searchMergeContent').animate({
            "width": "0"
        }, 200);
        $('#searchResultFlex').animate({
            "left": "0"
        }, 200);
    });

    $('#headingOne').on('click', 'label', function () {
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            $(this).addClass('ui-checkboxradio-checked');
            if ($(this).attr("authority") != '1' && $("#mergeSearch").attr("type") != '624') { //没有权限
                $("#mergeSearch").addClass("hide");
                $("#resetBtn").addClass("hide");
                $("#mergeApply").removeClass("hide");
            }
        } else {
            $(this).removeClass('ui-checkboxradio-checked');
            if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").attr('authority') == '1' && $("#mergeSearch").attr("type") != '624') {
                $("#mergeSearch").removeClass("hide");
                $("#resetBtn").removeClass("hide");
                $("#mergeApply").addClass("hide");
            }
        }
    });

    $('#headingTwo').on('click', 'label', function (e) {
        e.preventDefault();
        e.stopPropagation();
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            $(this).addClass('ui-checkboxradio-checked');
            if ($(this).attr("authority") != '1' && $("#mergeSearch").attr("type") != '624') { //没有权限
                $("#mergeSearch").addClass("hide");
                $("#resetBtn").addClass("hide");
                $("#mergeApply").removeClass("hide");
            }
        } else {
            $(this).removeClass('ui-checkboxradio-checked');
            if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").attr('authority') == '1' && $("#mergeSearch").attr("type") != '624') {
                $("#mergeSearch").removeClass("hide");
                $("#resetBtn").removeClass("hide");
                $("#mergeApply").addClass("hide");
            }
        }
    });

    //每次搜索都记录上一次的排序类型
    function saveSortTypeMerge() {
        //搜索图片的时候加入缓存
        if ($('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache") == undefined) {
            //判断是否缓存是否超过，不超过依次存入,超过顶掉最前面的那个
            if (cacheArr.length >= cacheSortArr.length) {
                itemCache = cacheArr.shift();
                $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).remove();
                $('#usearchImg').find('.add-image-img.cache' + itemCache).removeClass("cache" + itemCache).removeAttr("cache");
            } else if (cacheArr.length == 0) {
                itemCache = 0;
            } else {
                for (let i = 0; i < cacheSortArr.length; i++) {
                    if (cacheArr.indexOf(cacheSortArr[i]) < 0) {
                        itemCache = cacheSortArr[i];
                        break;
                    }
                }
            }
            cacheArr.push(itemCache);
            $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').addClass("cache" + itemCache).attr("cache", itemCache);
        } else {
            itemCache = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache");
            $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).remove();
        }
        var html = `<div class="image-card-list no-bottom-border" id="image-merge-list-${itemCache}">
                    <ul class="image-card-list-wrap showBigImg wrap-empty-center merge cacheItem" id="search-info${itemCache}"></ul>
                    <ul class="image-card-list-wrap display-none showBigImg wrap-empty-center cacheItem" id="sortByTimeWrapper${itemCache}"></ul>
                    <div class="display-none showBigImg wrap-empty-center cacheItem" id="timeTogetherWrapper${itemCache}"></div>
                    <div class="display-none showBigImg wrap-empty-center cacheItem" id="positionTogetherWrapper${itemCache}"></div>
                </div>`;
        $("#imageCacheMergeList").append(html);
        $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).siblings().addClass("hide");
        $("#imageCacheMergeList").find('#image-merge-list').remove();  //如果有无图检索清空
        $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data(dynamicData);
        for (let i = 0; i < $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").length; i++) {
            let cacheIndex = $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).attr("sort");
            if (cacheIndex == 1) { //相似度
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
            } else if (cacheIndex == 2) {   //时间
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
            } else if (cacheIndex == 3) { //时间聚合
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("positionTogetherListDynamic");
            } else if (cacheIndex == 4) { //地点聚合
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("sortTimeListDynamic");
                $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).removeData("timeTogetherListDynamic");
            }
            $("#imageCacheMergeList").find(".image-card-list.no-bottom-border").eq(i).find(".cacheItem").each((index, item) => {
                if (index != parseInt(cacheIndex) - 1) {
                    $(item).empty();
                }
            })
        }
        //最后一个检索结果的标志
        for (let i = 0; i < $('#usearchImg').find('.add-image-item').length; i++) {
            $('#usearchImg').find('.add-image-item').eq(i).find('.add-image-img').data({
                isAll: 0
            })
        }
        $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data({
            isAll: 1
        })
        if (selectType == 2) { //按相似度
            $("#sortByScore").click();
        } else if (selectType == 1) { //按时间
            $('#sortByTime').click();
        } else if (selectType == 3) { //按时间聚合
            $("#timeTogether").click();
        } else if (selectType == 4) { //按地点聚合
            $("#placeTogether").click();
        }
        $('#aui-icon-import').removeClass('text-disabled');
    }

    // 动静结合页面 点击搜索 加载右侧内容区域照片
    $('#mergeSearch').click(function () {
        if ($("#usearchImg").find(".add-image-item").length > 0 && $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picStatus") == '0') {
            return;
        }

        // 防止暴力点击 点击一次之后 1s后才能第二次点击
        $('#mergeSearch').attr('disabled', 'disabled');
        setTimeout(function () {
            $('#mergeSearch').removeAttr('disabled');
        }, 1000);

        // 判断是静态搜索，动态搜索，动静态搜索
        var headLabel1 = $('#headingOne label').hasClass('ui-checkboxradio-checked'),
            headLabel2 = $('#headingTwo label').hasClass('ui-checkboxradio-checked'),
            currentSrc = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('src');
        $('#usearchImg').data('currentSrc', currentSrc); // 绑定当前检索的图片

        if (headLabel1 && !headLabel2) { // 静态搜索
            //静态检索是非白名单并没有选中任何事件的时候
            if ($('#headingOne label').attr("iswhite") == '0' && !$("#commentSelectMerge").closest('.form-group').hasClass('hide') && $("#commentSelectMerge").find(".selectpicker").val() == '' && $('#headingOne label').attr("isverify") == '1') {
                $("#commentSelectMerge").next().removeClass("hide");
                return;
            } else {
                $("#commentSelectMerge").next().addClass("hide");
                staticSearch();
            }
        } else if (headLabel1 && headLabel2 || !headLabel1 && headLabel2) {
            if (headLabel1 && headLabel2) { // 动静态搜索
                //静态检索或动态检索是非白名单并没有选中任何事件的时候
                if (($('#headingOne label').attr("iswhite") == '0' || $('#headingTwo label').attr("iswhite") == '0') && !$("#commentSelectMerge").closest('.form-group').hasClass('hide') && $("#commentSelectMerge").find(".selectpicker").val() == '' && $('#headingOne label').attr("authority") == '1' && $("#usearchImg").find(".add-image-item.active .add-image-img").attr("zt") != '1') {
                    $("#commentSelectMerge").next().removeClass("hide");
                    return;
                } else {
                    $("#commentSelectMerge").next().addClass("hide");
                    if ($("#usearchImg").find(".add-image-item.active .add-image-img").attr("picReason") != '1' && currentSrc) {
                        staticSearch();
                    } else {
                        staticSearch();
                        dynamicSearch();
                    }
                }
            } else if (!headLabel1 && headLabel2) { // 动态搜索
                //动态检索是非白名单并没有选中任何事件的时候
                if ($('#headingTwo label').attr("iswhite") == '0' && !$("#commentSelectMerge").closest('.form-group').hasClass('hide') && $("#commentSelectMerge").find(".selectpicker").val() == '' && $("#usearchImg").find(".add-image-item.active .add-image-img").attr("zt") != '1') {
                    $("#commentSelectMerge").next().removeClass("hide");
                    return;
                } else {
                    $("#commentSelectMerge").next().addClass("hide");
                    dynamicSearch();
                }
            }
        } else {
            warningTip.say("请选择搜索库");
            return;
        }

        $('#staticIDContentContainer #staticSearchResultID').empty()
        // 如果检索结果内容区不显示 显示内容区域
        if ($('#searchMergeContent').width() === 0) { // 点击检索之后 默认展开 如果检索图片结果容器收缩
            if ($("#searchResultFlex").find("i").attr("class") === "aui-icon-drop-right") { // 如果展开控制框箭头向右
                $("#searchResultFlex").find("i").attr("class", "aui-icon-drop-left"); // 展开控制框箭头向左
            }
            // 检索结果内容区展开
            $('#searchMergeContent').animate({
                "width": "95%"
            }, 200);
            // 展开收缩控制框右移
            $('#searchResultFlex').animate({
                "left": "95%"
            }, 200);
        }

        function staticSearch() {
            // 关闭静态单击图框
            $('#collapseStatic').find('.panel-contrast-img').addClass('hide');
            // $('#collapseStatic').find('.panel-body-box').css({
            // 	'height': '100%'
            // })
            var staticData = getSearchData().static;
            // 如果不是只进行动态检索 刷新静态库（第一次进入页面 isOnlyFresh为undefined）
            if (!window.isOnlyFresh) { // isOnlyFresh为false 刷新静态库
                $("#staticContentContainer").find("#allCount").text("（0）");
                if ($("#usearchImg").find(".add-image-item.active .add-image-img").attr("picReason") != '1' && headLabel1 && currentSrc) { //判断是否是第一次请求
                    // 给图片绑定静态id
                    var picBase64 = staticData.base64;

                    if (picBase64.indexOf("http") == 0) { //url
                        var picIdPortData = {
                            url: picBase64,
                            staticId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                        };
                    } else { //base64
                        var picIdPortData = {
                            base64: picBase64,
                            staticId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                        };
                    }

                    var picIdPort = 'v2/faceRecog/uploadImage',
                        picIdSuccessFunc = function (data) {
                            if (data.code == '200') {
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picId", data.staticId);
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picReason", "1");
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr('picStatus', '1');

                                var typesArr = [];
                                if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                    typesArr.push('1');
                                }

                                if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                    typesArr.push('2');
                                }
                                var searchPort = 'v3/myApplication/getIncidentInfo',
                                    searchData = {
                                        "types": typesArr,
                                        "incidentId": $("#commentSelectMerge").find(".selectpicker").val(),
                                        "staticId": $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                                    },
                                    searchSuccessFunc = function (data) {
                                        if (data.code === '200') {
                                            var data = data.data;
                                            data.forEach((val) => {
                                                var html = `<span class="limitTitle ${val.startUseDate ? '' : 'hide'}">可使用日期:</span>
															<span class="${val.startUseDate ? '' : 'hide'}">${val.startUseDate}~${val.endUseDate}</span>
															<span class="limitTitle ${val.startUseTime ? '' : 'hide'}">可使用时间段:</span>
															<span class="${val.startUseTime ? '' : 'hide'}">${val.startUseTime}~${val.endUseTime}</span>
															<span class="limitTitle ${val.limitCount ? '' : 'hide'}">使用总次数:</span>
															<span class="${val.limitCount ? '' : 'hide'}">${val.useCount || 0}/${val.limitCount}</span>
															<span class="limitTitle ${val.dayLimitCount ? '' : 'hide'}">今日使用情况:</span>
                                							<span class="${val.dayLimitCount ? '' : 'hide'}">${val.dayUseCount || 0}/${val.dayLimitCount}</span>`;
                                                if (val.type == '1') { //静态
                                                    if (val.authority) { //有权限
                                                        $("#staticMergeSearchPower").html(html);
                                                        $("#headingOne").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                                                    } else {
                                                        $("#staticMergeSearchPower").html(html);
                                                        $("#headingOne").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                                                    }

                                                    if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isverify") == '0') {
                                                        $("#staticMergeSearchPower").html("");
                                                    }
                                                } else if (val.type == '2') { //动态
                                                    if (val.authority || $("#usearchImg").find(".add-image-item.active .add-image-img").attr("zt") == '1') { //有权限
                                                        $("#dynamicMergeSearchPower").html(html);
                                                        $("#headingTwo").find(".ui-checkboxradio-checkbox-label").addClass("ui-checkboxradio-checked").attr("authority", '1');
                                                    } else {
                                                        $("#dynamicMergeSearchPower").html(html);
                                                        $("#headingTwo").find(".ui-checkboxradio-checkbox-label").removeClass("ui-checkboxradio-checked").attr("authority", '0');
                                                    }

                                                    if ($("#commentSelectMerge").find(".selectpicker").val() == '') {
                                                        $("#dynamicMergeSearchPower").html("");
                                                    }
                                                }
                                            })

                                            if (!$("#headingOne").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked") && !$("#headingTwo").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                                $("#mergeSearch").addClass("hide");
                                                $("#resetBtn").addClass("hide");
                                                $("#mergeApply").removeClass("hide");
                                            } else {
                                                $("#mergeSearch").removeClass("hide");
                                                $("#resetBtn").removeClass("hide");
                                                $("#mergeApply").addClass("hide");
                                            }

                                            $("#mergeSearch").attr("type", "");
                                            refreshContainer(staticData, $('#staticContentContainer'), true);
                                            if (headLabel1 && headLabel2 && ((!$("#commentSelectMerge").closest('.form-group').hasClass('hide') && $("#commentSelectMerge").find(".selectpicker").val() != '') || $("#commentSelectMerge").closest('.form-group').hasClass('hide') || $("#usearchImg").find(".add-image-item.active .add-image-img").attr("zt") == '1')) {
                                                dynamicSearch();
                                            }
                                        } else if (data.code === '624') { //特殊人员
                                            $("#mergeSearch").addClass("hide");
                                            $("#resetBtn").addClass("hide");
                                            $("#mergeApply").removeClass("hide");
                                            //type为624代表是特殊人员上传图片等不影响
                                            $("#mergeSearch").attr("type", "624");
                                            //warningTip.say('该人员为特殊人员，请申请特殊人员权限审批通过后检索');
                                            warningTip.say(data.message);
                                        } else if (data.code === '601') {
                                            $("#mergeSearch").attr("type", "");
                                            warningTip.say("获取检索权限失败,请选择检索事件");
                                        } else {
                                            $("#mergeSearch").attr("type", "");
                                            warningTip.say("获取检索权限失败,请稍后再试");
                                        }
                                    }
                                loadData(searchPort, true, searchData, searchSuccessFunc);
                            } else {
                                warningTip.say(data.message);
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picStatus", '0');
                            }
                        };
                    loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                } else {
                    refreshContainer(staticData, $('#staticContentContainer'), true);
                }
                // isInitMoreFlag = true;
            }
            window.isOnlyFresh = false;
        };

        function dynamicSearch() {
            for (let i in $("#mergeTime").find(".btn")) {
                if ($("#mergeTime").find(".btn").eq(i).hasClass("btn-primary")) {
                    searchRealTime($("#searchMerge_Time"), i);
                }
            }
            selectType = selectType ? selectType : 2; // 按相似度检索
            mergeSearch = [];
            var typeSearch = $("#selMergeCameraID .searchArea").css("display") === 'none' ? 'map' : 'area'; // 判断是地图还是区域
            dynamicData = getSearchData(typeSearch).dynamic;
            sortList = [];
            sortTimeList = [];
            timeTogetherList = [];
            positionTogetherList = [];
            allSelectedCardList = []; // 动态库 所有被选中的图片
            // 动态库 轨迹分析按钮赋值
            $('#courseAnalyse').addClass('disabled').data({
                'trakData': []
            });
            $('#sortTotal').text(''); // 按相似度排序 检索总数为空
            $('#sortByTimeTotal').text(''); // 按时间排序 检索总数为空

            // 清除查看大图节点
            var $maskDom = $('body').find('.mask-container-fixed').not('.modal-control');
            if ($maskDom.length > 0) {
                $maskDom.remove();
            }

            // 清空检索结果
            // $('#search-info').empty();
            // $('#sortByTimeWrapper').empty();
            // $('#timeTogetherWrapper').empty();
            // $('#positionTogetherWrapper').empty();
            // 存在上传图片 进行按相似度排序检索
            if (dynamicData.base64Img) {
                $('#sortByScore').removeClass('text-disabled').siblings().removeClass('text-disabled');
                $('#selectAllSnapping .ui-checkboxradio-label').removeClass('text-disabled');
                if ($("#usearchImg").find(".add-image-item.active .add-image-img").attr("picReason") != '1' && headLabel2 && !headLabel1) { //判断是否是第一次请求
                    // 给图片绑定静态id
                    var picBase64 = dynamicData.base64Img;

                    if (picBase64.indexOf("http") == 0) { //url
                        var picIdPortData = {
                            url: picBase64,
                            staticId: dynamicData.selectImgId,
                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                            opType: $("#usearchImg").find(".add-image-item.active .add-image-img").data("opType"),
                            //searchComments: $("#usearchImg").find(".add-image-item.active .add-image-img").data("searchComments")
                        };
                    } else { //base64
                        var picIdPortData = {
                            base64: picBase64,
                            staticId: dynamicData.selectImgId,
                            moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id"),
                            opType: $("#usearchImg").find(".add-image-item.active .add-image-img").data("opType"),
                            //searchComments: $("#usearchImg").find(".add-image-item.active .add-image-img").data("searchComments")
                        };
                    }

                    var picIdPort = 'v2/faceRecog/uploadImage',
                        picIdSuccessFunc = function (data) {
                            if (data.code == '200') {
                                dynamicData.selectImgId = data.staticId;
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picId", data.staticId);
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr('picStatus', '1'); //图片类型1.成功2.小图抠图
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picReason", "1");

                                var typesArr = [];
                                if ($("#headingOne").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                    typesArr.push('1');
                                }

                                if ($("#headingTwo").find(".ui-checkboxradio-checkbox-label").hasClass("ui-checkboxradio-checked")) {
                                    typesArr.push('2');
                                }

                                var searchPort = 'v3/myApplication/getIncidentInfo',
                                    searchData = {
                                        "types": typesArr,
                                        "incidentId": $("#commentSelectMerge").find(".selectpicker").val(),
                                        "staticId": $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId')
                                    },
                                    searchSuccessFunc = function (data) {
                                        if (data.code === '200') {
                                            saveSortTypeMerge();
                                            $("#mergeSearch").attr("type", "");
                                        } else if (data.code === '624') { //特殊人员
                                            $("#mergeSearch").addClass("hide");
                                            $("#resetBtn").addClass("hide");
                                            $("#mergeApply").removeClass("hide");
                                            //type为624代表是特殊人员上传图片等不影响
                                            $("#mergeSearch").attr("type", "624");
                                            warningTip.say('该人员为敏感人员，请申请敏感人员查询权限审批通过后检索');
                                        } else if (data.code === '601') {
                                            $("#mergeSearch").attr("type", "");
                                            warningTip.say("获取检索权限失败,请选择检索事件");
                                        } else {
                                            $("#mergeSearch").attr("type", "");
                                            warningTip.say("获取检索权限失败,请稍后再试");
                                        }
                                    }
                                loadData(searchPort, true, searchData, searchSuccessFunc);
                            } else {
                                warningTip.say(data.message);
                                $("#usearchImg").find(".add-image-item.active .add-image-img").attr("picStatus", '0');
                            }
                        };
                    loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                } else {
                    saveSortTypeMerge();
                }

                if (dynamicData.nodeType == '2') {
                    $("#timeTogether").addClass('text-disabled');
                    $("#timeTogether").prev().addClass('text-disabled');
                    $("#placeTogether").addClass('text-disabled');
                    $("#placeTogether").prev().addClass('text-disabled');
                } else {
                    $("#timeTogether").removeClass('text-disabled');
                    $("#timeTogether").prev().removeClass('text-disabled');
                    $("#placeTogether").removeClass('text-disabled');
                    $("#placeTogether").prev().removeClass('text-disabled');
                }
            } else { // 没有上传图片 动态库按时间排序检索
                itemCache = '';
                selectType = 1;
                var html = `<div class="image-card-list no-bottom-border" id="image-merge-list">
                                <ul class="image-card-list-wrap display-none showBigImg wrap-empty-center cacheItem" id="sortByTimeWrapper"></ul>
                            </div>`;
                $("#imageCacheMergeList").find("#image-merge-list").remove();
                $("#imageCacheMergeList").append(html);
                $("#imageCacheMergeList").find("#image-merge-list").siblings().addClass("hide");
                // peopleSnappingSearchTime(dynamicData); // 按时间排序
                // $('#sortList').text('按时间排序'); // 功能区显示 按时间排序
                $('#sortByTime').addClass('active').siblings().removeClass('active').addClass('text-disabled'); // 下拉框 选中按时间排序
                $('#sortByTimeWrapper' + itemCache).removeClass('display-none').siblings('.wrap-empty-center').addClass('display-none'); // 检索图片容器 显示按时间排序内容
                $('#sortByTime').prev().removeClass('text-disabled');
                $('#aui-icon-import').addClass('text-disabled'); // 导出按钮 可用
                $('#sortByTime').click();
            }
        }
    });

    /** 
     * 静态检索 右侧内容请求
     * @param {Object} $data 左侧查询条件 静态查询条件
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {Boolean} isMerge 是否为动静结合页面
     */
    function refreshContainer($data, container, isMerge) {
        var uploadImageVal = $data.base64, // 上传图片的src
            cjs = $data.platformId; // 已选算法厂家id
        showLoading($('#staticSearchResult')); // 加载过度动画
        container.data('base64', uploadImageVal); // 把发起请求的图片src值 挂载到节点容器上
        // 如果没有上传图片 或者没有选择算法厂家 清除加载动画并加载空页面
        if ($('#usearchImg').find('.add-image-item.active').length === 0 || cjs.length === 0 || $data.libids.length === 0) {
            hideLoading($('#staticSearchResult'));
            loadEmpty($('#staticSearchResult'));
            if (cjs.length === 0 || $data.libids.length === 0) {
                warningTip.say('请选择人脸库或算法厂家！');
            }
            return false;
        }

        //搜索图片的时候加入缓存
        if ($('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache") == undefined) {
            //判断是否缓存是否超过10个，不超过10个依次存入,超过10个顶掉最前面的那个
            var item = '';
            if (cacheArr.length >= cacheSortArr.length) {
                item = cacheArr.shift();
                $("#staticContentContainer").find(`#factoryData${item}`).remove();
                $('#usearchImg').find('.add-image-img.cache' + item).removeClass("cache" + item).removeAttr("cache");
            } else if (cacheArr.length == 0) {
                item = 0;
            } else {
                for (let i = 0; i < cacheSortArr.length; i++) {
                    if (cacheArr.indexOf(cacheSortArr[i]) < 0) {
                        item = cacheSortArr[i];
                        break;
                    }
                }
            }
            cacheArr.push(item);
            $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').addClass("cache" + item).attr("cache", item);
        } else {
            var item = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache");
            $("#staticContentContainer").find(`#factoryData${item}`).remove();
        }
        $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data($data);
        //最后一个检索结果的标志
        for (let i = 0; i < $('#usearchImg').find('.add-image-item').length; i++) {
            $('#usearchImg').find('.add-image-item').eq(i).find('.add-image-img').data({
                isAll: 0
            })
        }
        $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data({
            isAll: 1
        })

        var _picId = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId');
        var picStatus = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picStatus');
        $('#usearchImg').data({
            staticId: _picId,
            src: uploadImageVal
        })
        if ($data.libids.length > 0) {
            if (_picId && picStatus !== '2') {
                refreshSearchStaticData($data, container, isMerge, _picId, item);
            } else {
                var imgValue = $('#usearchImg').find('.add-image-item').filter('.active').attr('value');
                if (uploadImageVal.indexOf("http") == 0) { //url
                    var picIdPortData = {
                        url: uploadImageVal,
                        staticId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                    };
                } else { //base64
                    var picIdPortData = {
                        base64: uploadImageVal,
                        staticId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                    };
                }

                var picIdPort = 'v2/faceRecog/uploadImage',
                    picIdSuccessFunc = function (data) {
                        if (data.code == '200') {
                            $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                if ($(ele).attr('value') == imgValue) {
                                    // 给当前选中的图片绑定id
                                    $(ele).find('.add-image-img').attr('picId', data.staticId);
                                    $(ele).find('.add-image-img').attr('picStatus', '1');
                                }
                            })
                            refreshSearchStaticData($data, container, isMerge, data.staticId, item);
                        } else {
                            hideLoading($('#staticSearchResult'));
                            warningTip.say(data.message);
                            $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                if ($(ele).attr('value') == imgValue) {
                                    $(ele).find('.add-image-img').attr('picStatus', '0');
                                }
                            })
                        }
                    };
                loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
            }
        }
    }

    /** 静态检索 各种类型 右侧内容刷新
     * @param {Object} $data 左侧查询条件 静态查询条件
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {Boolean} isMerge 是否为动静结合页面
     * @param {String} _picId 目标查询图片id
     * @param {number} item 与上传图片区域对应的缓存编号
     * @param {number} count 请求次数
     */
    function refreshSearchStaticData($data, container, isMerge, _picId, item, count) {
        var ageVal = $data.agegroup, // 年龄
            sexVal = $data.sex, // 性别
            faceVal = String($data.libids), //人脸库查询值
            countVal = $data.limit, // 结果数
            cjs = $data.platformId, // 已选算法厂家id数组
            cjsSuccess = [], //把已选算法厂家进行深拷贝，每个厂家循环请求时如果有厂家异常把当前厂家从厂家id数组中删除，cjsSuccess的个数和返回的成功个数比对
            cjsObj = $data.platformObj, // 已选算法厂家id和name数组
            mergeNumArr = [], // 前端计算算法 把返回的数据存在数组中
            ronghe = [], // 融合算法 融合数组
            isRongheCompared = false, // 融合算法 是否已命中标志
            alreadyInRongheFlag = false, // 融合算法 是否已在融合数组中标志
            isLoad = false, //是否超时
            allCount = 0; // 静态库 搜索总数

        hideLoading(container); // 数据加载成功取消loading加载动画

        // 加载静态页面框架
        if (cjs.length > 0) {
            loadstaticFrame(cjs, container, item);
        }

        for (var i = 0; i < cjs.length; i++) {
            showLoading(container.find('#factoryData-' + item + "-" + cjs[i]));
        }
        // 清空之前的厂家数据加载状态 比中使用
        $('#sf').data("cjData" + item, '');

        // 根据选择厂家数循环请求数据 赋值节点数据
        for (var i = 0; i < cjs.length; i++) {
            (function (i) {
                var port1 = 'v2/faceRecog/face1VN';
                var data1 = {
                    staticId: _picId,
                    ageGroup: ageVal,
                    sex: sexVal,
                    libIds: faceVal,
                    platformId: cjs[i],
                    platformIds: cjs,
                    idcard: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('idcard'),
                    incidentId: $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
                    top: countVal
                },
                    successFunc1 = function (data) {
                        hideLoading(container.find('#factoryData-' + item + "-" + cjs[i]));
                        $('#mergeSearch').removeAttr('disabled'); //防止检索暴力点击
                        cjsSuccess.push(data);
                        if (cjsSuccess.length === cjs.length) {
                            isLoadAll = true;
                        } else {
                            isLoadAll = false;
                        }
                        if (cjsSuccess.length == 1 && $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite") != '1' && $("#commentSelectMerge").find(".selectpicker").val() != '') {
                            getPowerUse(3, $("#commentSelectMerge").find(".selectpicker").val());
                        }
                        if (data.code === '200') {
                            // // 圆点标志，绿色表示数据请求完成
                            // $('#showMoreChangShang').find('span[cjid="' + cjs[i] + '"]').closest('.inline-block').removeClass('marker').addClass('marker-success');
                            var result = data.data || false;
                            // 当只选一家厂家 整页铺开
                            if (cjs.length === 1) { // 纯静态 或动静结合检索
                                // 添加厂家ID，比中使用数据
                                result.forEach(function (el, index) {
                                    el.platformId = $data.platformObj[0].cjid;
                                    el.platformName = $data.platformObj[0].cjname;
                                })
                                if (result && result.length === 0) {
                                    hideLoading($('#staticSearchResult'));
                                    loadEmpty($('#staticSearchResult'));
                                } else {
                                    // refreshStaticCj1Container(container, result, isMerge);
                                    var _html = '';
                                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                                    container.find("#factoryData" + item + " [cjid=" + cjs[i] + "] .control-total").text(result.length); // 当前算法厂家 加载搜索结果总数
                                    container.find("#factoryData-" + item + '-' + cjs[i]).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                                    bindDataToImgItem(container, "#factoryData-" + item + '-' + cjs[i], result); // 将图片绑上身份证数据 用以后面二次检索使用
                                    // bindStaticPicData(container, result, "#factoryData-" + cjs[i]); // 列表图片节点 赋值
                                    allCount += result.length; // 静态库 累加搜索结果数
                                    // 点击静态库第一个图片 获取静态全量数据
                                    $('#staticContentContainer').find('#staticSearchResult .tab-content').eq(0).find('.image-new-wrap').eq(0).click();
                                }

                                var $fuseAlgResult = container.find(`#fuseData${item} .image-new-list`);
                                loadEmpty($fuseAlgResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                            } else { // 当选择厂家数 >1
                                if (result && result.length > 0) { // 静态检索 有返回值
                                    var _html = '';
                                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                                    container.find("#factoryData" + item + " [cjid=" + cjs[i] + "] .control-total").text(result.length); // 当前算法厂家 加载搜索结果总数
                                    container.find("#factoryData-" + item + '-' + cjs[i]).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                                    bindDataToImgItem(container, "#factoryData-" + item + '-' + cjs[i], result); // 将图片绑上身份证数据 用以后面二次检索使用
                                    // bindStaticPicData(container, result, "#factoryData-" + cjs[i]); // 列表图片节点 赋值
                                    allCount += result.length; // 静态库 累加搜索结果数
                                    // 点击静态库当前显示的厂家第一个图片点击 获取静态全量数据
                                    if (i === 0) {
                                        $('#staticContentContainer').find('#staticSearchResult .tab-content').eq(0).find('.image-new-wrap').eq(0).click();
                                    }
                                } else {
                                    var $fuseDataResult = container.find("#factoryData-" + item + '-' + cjs[i]).find('.image-new-list');
                                    loadEmpty($fuseDataResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                                }

                                //为防止后台返回数据中有重复的picid的值，将result进行深拷贝然后去重
                                var resultOnly = JSON.parse(JSON.stringify(result));
                                for (var resulti = 0; resulti < resultOnly.length; resulti++) {
                                    for (var resulty = resulti + 1; resulty < resultOnly.length; resulty++) {
                                        if (resultOnly[resulti].picId == resultOnly[resulty].picId) {
                                            resultOnly.splice(resulty, 1);
                                        }
                                    }
                                }

                                // 融合算法开始 根据各厂家返回值 构造融合数据
                                mergeNumArr.push(result); // 各厂家全部返回值
                                // 获取所有命中多次的融合数组
                                for (var resultIndex = 0; resultIndex < resultOnly.length; resultIndex++) { // 循环当前厂家返回值
                                    //for(var resultIndex = 0; resultIndex < result.length; resultIndex++){  // 循环当前厂家返回值
                                    isRongheCompared = false; // 默认当前值没有命中
                                    alreadyInRongheFlag = false; // 默认当前值不在融合数组中
                                    resultOnly[resultIndex].CJCounts = 1; // 当前厂家返回数据 命中次数为1
                                    //result[resultIndex].CJCounts = 1;  // 当前厂家返回数据 命中次数为1
                                    cjsObj.forEach(function (val) { // 获取当前厂家名称
                                        if (val.cjid === cjs[i]) {
                                            resultOnly[resultIndex].platformName = val.cjname; // 给当前返回数据 赋值平台名称
                                            resultOnly[resultIndex].platformId = val.cjid;
                                            result[resultIndex].platformName = val.cjname; // 给原数据添加厂家name和id
                                            result[resultIndex].platformId = val.cjid;
                                        }
                                    });

                                    var rhObj1 = {};
                                    rhObj1.platformName = resultOnly[resultIndex].platformName; //赋值厂家名称
                                    rhObj1.platformId = resultOnly[resultIndex].platformId; //赋值厂家名称
                                    rhObj1.similarity = resultOnly[resultIndex].similarity; //赋值相似度 动静融合页面使用
                                    rhObj1.index = resultIndex + 1;
                                    resultOnly[resultIndex].rhInfo = [rhObj1];

                                    if (mergeNumArr.length > 1) { // 如果厂家数 > 1
                                        for (var beforeCjIndex = 0; beforeCjIndex < mergeNumArr.length - 1; beforeCjIndex++) { // 循环当前厂家之前的所有厂家
                                            for (var comparedIndex = 0; comparedIndex < mergeNumArr[beforeCjIndex].length; comparedIndex++) { // 被循环厂家中的值
                                                if (resultOnly[resultIndex].picId === mergeNumArr[beforeCjIndex][comparedIndex].picId) { // 如果命中 picId相同为同一个人
                                                    //if(result[resultIndex].picId === mergeNumArr[beforeCjIndex][comparedIndex].picId){ // 如果命中 picId相同为同一个人
                                                    isRongheCompared = true;
                                                    for (var rongheIndex = 0; rongheIndex < ronghe.length; rongheIndex++) { // 循环融合数组 判断数组中是否已存在比中值
                                                        if (resultOnly[resultIndex].picId === ronghe[rongheIndex].picId) {
                                                            //if(result[resultIndex].picId === ronghe[rongheIndex].picId){
                                                            alreadyInRongheFlag = true; // 融合数组中已存在比中值
                                                            break;
                                                        }
                                                    }
                                                }
                                                if (isRongheCompared) {
                                                    break;
                                                }
                                            }
                                            if (isRongheCompared) {
                                                break;
                                            }
                                        }
                                        // 融合数组赋值
                                        if (alreadyInRongheFlag) { // 如果融合数组中 已存在picId相同的图片
                                            ronghe[rongheIndex].CJCounts++;
                                            var rhObj = {};
                                            rhObj.platformName = resultOnly[resultIndex].platformName; //赋值厂家名称
                                            rhObj.platformId = resultOnly[resultIndex].platformId; //赋值厂家名称
                                            rhObj.similarity = resultOnly[resultIndex].similarity; //赋值相似度 动静融合页面使用
                                            rhObj.index = resultIndex + 1;
                                            ronghe[rongheIndex].rhInfo.push(rhObj); // 融合数据 命中的所有图片的信息
                                            ronghe[rongheIndex].rhInfo.sort(sortRongheCJ('platformId', cjs));
                                        } else {
                                            if (isRongheCompared) {
                                                ronghe.push(resultOnly[resultIndex]);
                                                //ronghe.push(result[resultIndex]);
                                                ronghe[ronghe.length - 1].CJCounts++;
                                                var rhObj = {};
                                                rhObj.platformName = mergeNumArr[beforeCjIndex][comparedIndex].platformName; //赋值厂家名称
                                                rhObj.platformId = mergeNumArr[beforeCjIndex][comparedIndex].platformId; //赋值厂家名称
                                                rhObj.similarity = mergeNumArr[beforeCjIndex][comparedIndex].similarity; //赋值相似度 动静融合页面使用
                                                rhObj.index = comparedIndex + 1;
                                                ronghe[ronghe.length - 1].rhInfo.push(rhObj); // 融合数据 命中的所有图片的信息
                                                ronghe[rongheIndex].rhInfo.sort(sortRongheCJ('platformId', cjs));
                                            }
                                        }
                                        ronghe.sort(sortRonghe('CJCounts')); // 融合数组 按照命中家数 从大到小排序
                                    }
                                }
                                // 构造融合算法页面元素
                                var rh_html = '';
                                if (ronghe.length === 0) {
                                    rh_html = createEmptyImgItem(rh_html); // 融合数为0时 构造空融合算法
                                    container.find("#factoryData" + item + " .fuseDataNum").text('0'); // 融合搜索结果数
                                    var $fuseAlgResult = container.find(`#fuseData${item} .image-new-list`);
                                    loadEmpty($fuseAlgResult, '暂无数据', '', true); // 厂家返回空数据 加载空页面
                                } else {
                                    rh_html = createStaticImgItem(ronghe, rh_html, true); // 构造融合算法图片
                                    container.find("#factoryData" + item + " .fuseDataNum").text(ronghe.length); // 融合搜索结果数
                                    container.find(`#fuseData${item} .image-new-list`).html(rh_html); // 融合搜索的图片内容
                                    $('#fuseData' + item).data('listData', ronghe);
                                    bindDataToImgItem(container, `#fuseData${item} .image-new-list`, ronghe); // 将融合图片 绑上身份证数据 用以后面二次检索使用
                                    bindStaticRongheData(container, ronghe, item); // 融合结果数据挂载
                                }
                            }
                            container.find("#factoryData" + item).attr("allCountS", allCount);
                            container.find('#allCount').text("(" + allCount + ")"); // 加载人脸库搜索总结果数
                            // onDeleteMoreSearch()

                            // 判断是否显示档案信息
                            if (cjsSuccess.length == cjs.length) { // 数据全部加载完成后
                                $("#factoryData" + item).find(".card-info-list.tab-pane.active .image-new-wrap").eq(0).click();
                                for (var k = 0; k < cjs.length; k++) {
                                    $("#factoryData-" + item + '-' + cjs[k]).find(".image-new-wrap").each((index, ele) => {
                                        var $this = $(ele),
                                            listData = $this.data('listData'),
                                            libNames = '';
                                        listData.libInfos.map(function (el, index) {
                                            if (index === 0) {
                                                libNames = el.libName;
                                            } else {
                                                libNames = libNames + ',' + el.libName;
                                            }
                                        });
                                        if (libNames.indexOf('涉港一人一档库') > -1) {
                                            var portBasics = 'v2/memberFiles/basics';
                                            var portDataBasics = {
                                                name: listData.name,
                                                idcard: listData.idcard,
                                                page: 1,
                                                size: 1,
                                                randomNub: Math.random() // 非后端需要数据，防止请求被终止
                                            },
                                                successFuncBasics = function (data) {
                                                    if (data.code === '200' && data.data.list.length > 0) {
                                                        var list = data.data.list,
                                                            rxId = list[0].rxId,
                                                            rxUrl = list[0].url;
                                                        $this.data({
                                                            rxId: rxId,
                                                            rxUrl: rxUrl
                                                        })
                                                        $this.find('.basicsBut').removeClass('hide');
                                                    }
                                                }
                                            loadData(portBasics, true, portDataBasics, successFuncBasics);
                                        }
                                    })
                                }
                                $(`#fuseData${item}`).find(".image-new-wrap").each(function (index, ele) {
                                    var $this = $(ele),
                                        listData = $this.data('listData'),
                                        libNames = '';
                                    listData.libInfos.map(function (el, index) {
                                        if (index === 0) {
                                            libNames = el.libName;
                                        } else {
                                            libNames = libNames + ',' + el.libName;
                                        }
                                    });
                                    if (libNames.indexOf('涉港一人一档库') > -1) {
                                        var portBasics = 'v2/memberFiles/basics';
                                        var portDataBasics = {
                                            name: listData.name,
                                            idcard: listData.idcard,
                                            page: 1,
                                            size: 1
                                        },
                                            successFuncBasics = function (data) {
                                                if (data.code === '200' && data.data.list.length > 0) {
                                                    var list = data.data.list,
                                                        rxId = list[0].rxId,
                                                        rxUrl = list[0].url;
                                                    $this.data({
                                                        rxId: rxId,
                                                        rxUrl: rxUrl
                                                    })
                                                    $this.find('.basicsBut').removeClass('hide');
                                                }
                                            }
                                        loadData(portBasics, false, portDataBasics, successFuncBasics);
                                    }
                                })
                            }

                            if (result.length == 0) {
                                if ($('#sf').data("cjData" + item)) {
                                    var cjData = $('#sf').data("cjData" + item);
                                } else {
                                    var cjData = $('#sf').data("cjData");
                                }
                                cjData.forEach((val, index) => {
                                    if (val.platformId == cjs[i]) {
                                        val.dataState = 'nodata';
                                    }
                                });
                                // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                                $('#sf').data("cjData" + item, cjData)
                            }
                        } else if (data.code === '616') {
                            isLoad = true;
                            var sxCount = count ? count : 1;
                            if (cjsSuccess.length === cjs.length && isLoad && sxCount < 4) {
                                // 给图片绑定静态id
                                var picBase64 = $('#usearchImg').data('src'),
                                    staticId = $('#usearchImg').data('staticId');
                                if (picBase64.indexOf("http") == 0) { //url
                                    var picIdPortData = {
                                        url: picBase64,
                                        staticId: staticId,
                                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                    };
                                } else { //base64
                                    var picIdPortData = {
                                        base64: picBase64,
                                        staticId: staticId,
                                        moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                    };
                                }
                                var picIdPort = 'v2/faceRecog/uploadImage',
                                    picIdSuccessFunc = function (data) {
                                        if (data.code == '200') {
                                            $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                    // 给当前选中的图片绑定id
                                                    $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                    $(ele).find('.add-image-img').attr('picStatus', '1');
                                                }
                                            })
                                            $('#usearchImg').data('staticId', data.staticId);
                                            sxCount += sxCount;
                                            refreshSearchStaticData($data, container, isMerge, data.staticId, item, sxCount);
                                        } else {
                                            warningTip.say(data.message);
                                            $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                                if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                    $(ele).find('.add-image-img').attr('picStatus', '0');
                                                }
                                            })
                                        }
                                    };
                                loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                            }

                            if (sxCount > 3) {
                                warningTip.say('图片已失效，请重新上传图片');
                            }
                        } else if (data.code === '500') {
                            loadEmpty(container.find('#factoryData-' + item + '-' + cjs[i] + ' .image-new-list'), '算法获取异常', "", true);
                            if ($('#sf').data("cjData" + item)) {
                                var cjData = $('#sf').data("cjData" + item);
                            } else {
                                var cjData = $('#sf').data("cjData");
                            }
                            cjData.forEach((val, index) => {
                                if (val.platformId == cjs[i]) {
                                    val.dataState = 'error';
                                }
                            });
                            // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                            $('#sf').data("cjData" + item, cjData)
                        } else if (data.code === '613') {
                            loadEmpty(container.find('#factoryData-' + item + '-' + cjs[i] + ' .image-new-list'), '算法厂家升级中', "", true);
                            if ($('#sf').data("cjData" + item)) {
                                var cjData = $('#sf').data("cjData" + item);
                            } else {
                                var cjData = $('#sf').data("cjData");
                            }
                            cjData.forEach((val, index) => {
                                if (val.platformId == cjs[i]) {
                                    val.dataState = '613';
                                }
                            });
                            // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                            $('#sf').data("cjData" + item, cjData)
                        }
                    };
                loadData(port1, true, data1, successFunc1, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
            })(i);
        }
    }

    // 档案基本信息图标
    $('#staticSearchResult').on('click', '.aui-icon-idcard2', function () {
        $('#basicsEditModal').modal('show');
        setTimeout(() => {
            $('#basicsEditModal .modal-body').scrollTop(0);
        }, 300);
        var $this = $(this);
        var rxId = $this.closest('.image-new-wrap').data('rxId'),
            rxUrl = $this.closest('.image-new-wrap').data('rxUrl');
        if (rxId && rxUrl) {
            showDetailInfo(rxUrl, rxId);
        }
    })

    /**
     * 静态检索 加载框架
     * @param {Array} cjs 已选中的算法厂家id数组
     * @param {Object} container 需要刷新的节点容器 静态库容器
     * @param {number} item 缓存对应编号
     */
    function loadstaticFrame(cjs, container, item) {
        var html = '';
        html += `<div id="factoryData${item}"  class="factoryData">
					<div class="card-approve-title">
						<ul class="nav nav-tabs pd0" role="tablist">`;
        for (var i = 0; i <= cjs.length; i++) {
            if (i == cjs.length) {
                html += `<li class="nav-item">
							<a class="nav-link" data-toggle="tab" href="#fuseData${item}" role="tab" aria-controls="fuseData" aria-selected="false">
								融合<span id="fuseDataNum" class="control-total fuseDataNum">0</span>
							</a>
						</li>`;
            } else {
                html += `<li class="nav-item">
							<a class="nav-link ${i == 0 ? 'active' : ''}" cjid="${cjs[i]}" data-toggle="tab" href="#factoryData-${item}-${cjs[i]}" role="tab" aria-controls="factoryData-${item}-${cjs[i]}" aria-selected="${i == 0 ? 'true' : 'false'}">
								${$("[cjid=" + cjs[i] + "]").attr('cjname')}
								<span class="control-total">0</span>
							</a>
						</li>`;
            }
        }
        html += `</ul>
			</div>
			<div class="tab-content">`;

        for (var i = 0; i <= cjs.length; i++) {
            if (i == cjs.length) {
                html += `<div class="tab-pane" id="fuseData${item}" role="tabpanel" aria-labelledby="fuseData${item}-tab">
							<ul class="image-new-list">
							</ul>
						</div>`;
            } else {
                html += `<div class="card-info-list tab-pane ${i == 0 ? 'active' : ''}" id="factoryData-${item}-${cjs[i]}" role="tabpanel" aria-labelledby="factoryData-${item}-${cjs[i]}-tab">
							<ul class="image-new-list">
							</ul>
						</div>`;
            }
        }
        html += `</div>
        </div>`;
        //$("#staticSearchResult").find('.card-content .fuseData' + item + '.flex-column-wrap').addClass("hide");
        $('#staticSearchResult').append(html).find(".flex-column-wrap").addClass("hide");
        $("#staticSearchResult").find(`#factoryData${item}`).data({
            currentStaticId: $('#usearchImg').data('currentStaticId'),
            currentSrc: $('#usearchImg').data('currentSrc')
        }).siblings().addClass("hide");
        //别的图片缓存的div清除除了选中厂家的其他项
        for (let i = 0; i < $("#staticContentContainer").find(".factoryData.hide").length; i++) {
            $("#staticContentContainer").find(".factoryData.hide").eq(i).find(".tab-pane").not(".active").find(".image-new-list").empty();
        }
    }


    // // 动静结合 静态库 查看全部厂家的切换事件
    // $("#staticContentContainer").on("click", ".show-more-algorigtm-list", function () {
    // 	var foldHtml = `<div class="more-box"><button type="button" class="btn btn-link"><i class="aui-icon-drop-up-2"></i>收起查看全部</button></div>`,
    // 		$showMoreContainer = $("#showMoreChangShang");
    // 	if (isInitMoreFlag) { // 刷新静态库之后 值为true
    // 		unfoldHtml = $showMoreContainer.html(); // 静态库功能区 查看全部厂家
    // 		isInitMoreFlag = false;
    // 	}
    // 	$("#otherShow>[class*=aui-col]").each(function (index) {
    // 		$(this).toggleClass("display-none"); // 静态库 显示所有厂家图片
    // 	});
    // 	// 切换 查看全部厂家 收起查看全部
    // 	$showMoreContainer.toggleClass("text-center");
    // 	if ($showMoreContainer.hasClass("text-center")) {
    // 		$showMoreContainer.html(foldHtml);
    // 	} else {
    // 		$showMoreContainer.html(unfoldHtml);
    // 	}
    // });

    // 按时间排序
    $(document).on('click', '#sortByTime', function () {
        selectType = 1;
        if (!$('#usearchImg').find('.add-image-item.active').length && !$('#usearchImg').find('.add-image-item.active .add-image-img').attr("cache")) {
            peopleSnappingSearchTime(dynamicData, ''); // 按时间排序
        } else {
            $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).attr("sort", 2);
            let dynamicData = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data();
            //if ($('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').length == 0) {
            if (!$("#image-merge-list-" + itemCache).data("sortTimeListDynamic") && !$("#image-merge-list-" + itemCache).find("#sortByTimeWrapper" + itemCache).hasClass("loading-position")) {
                if (dynamicData) {
                    peopleSnappingSearchTime(dynamicData, itemCache); // 按时间排序
                } else if (itemCache == '') {
                    peopleSnappingSearchTime(dynamicData, itemCache); // 按时间排序
                }
            }
            $('#search-info' + itemCache).addClass('display-none');
            $('#sortByTimeWrapper' + itemCache).removeClass('display-none');
            $('#timeTogetherWrapper' + itemCache).addClass('display-none');
            $('#positionTogetherWrapper' + itemCache).addClass('display-none');
            //移除卡片选中转态
            $('#current-page .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#paginationTimeWrap' + itemCache).removeClass('display-none');
            $('#paginationScoreWrap' + itemCache).addClass('display-none');
            var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
            allSelectedCardList.forEach(function (item) {
                sortTimeList.forEach(function (v, n) {
                    if (v.picId === item.picId) {
                        $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                    }
                })
            });
            judgeSelectePageAll($('#sortByTimeWrapper' + itemCache));
            $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
            $('#sortByTimeTotal').removeClass('hide');
            $('#sortTotal').addClass('hide');
            $('#timeTogetherTotal').addClass('hide');
            $('#positionTogetherTotal').addClass('hide');

            //当前是缓存图片清除掉别的排序结果
            if (dynamicData && !dynamicData.isAll) {
                $('#search-info' + itemCache).empty();
                $('#timeTogetherWrapper' + itemCache).empty();
                $('#positionTogetherWrapper' + itemCache).empty();

                $("#image-merge-list-" + itemCache).removeData("sortListDynamic");
                $("#image-merge-list-" + itemCache).removeData("timeTogetherListDynamic");
                $("#image-merge-list-" + itemCache).removeData("positionTogetherListDynamic");
            }
        }
    });

    // 按相似度排序
    $(document).on('click', '#sortByScore', function () {
        //记录要缓存哪种排序
        $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).attr("sort", 1);
        let dynamicData = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data();
        //if ($('#imageCacheMergeList').find(`#search-info${itemCache} .image-card-wrap`).length == 0) {
        if (!$("#image-merge-list-" + itemCache).data('sortListDynamic') && !$("#image-merge-list-" + itemCache).find("#search-info" + itemCache).hasClass("loading-position")) {
            if (dynamicData) {
                peopleSnappingSearch(dynamicData, itemCache); // 按时间排序
            }
        }

        $('#search-info' + itemCache).removeClass('display-none');
        $('#sortByTimeWrapper' + itemCache).addClass('display-none');
        $('#timeTogetherWrapper' + itemCache).addClass('display-none');
        $('#positionTogetherWrapper' + itemCache).addClass('display-none');
        $(this).closest('.operate-item').siblings('.operate-item').find('.text-link').removeClass('active');
        selectType = 2;
        $('#current-page .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
        $('#paginationTimeWrap' + itemCache).addClass('display-none');
        $('#paginationScoreWrap' + itemCache).removeClass('display-none');
        var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
        allSelectedCardList.forEach(function (item) {
            sortList.forEach(function (v, n) {
                if (v.picId === item.picId) {
                    $('#search-info' + itemCache).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
        });
        judgeSelectePageAll($('#search-info' + itemCache));
        judgeSelecteAll($(this));
        $('#sortByTimeTotal').addClass('hide');
        $('#sortTotal').removeClass('hide');
        $('#timeTogetherTotal').addClass('hide');
        $('#positionTogetherTotal').addClass('hide');

        //当前是缓存图片清除掉别的排序结果
        if (!dynamicData.isAll) {
            $('#sortByTimeWrapper' + itemCache).empty();
            $('#timeTogetherWrapper' + itemCache).empty();
            $('#positionTogetherWrapper' + itemCache).empty();

            $("#image-merge-list-" + itemCache).removeData("sortTimeListDynamic");
            $("#image-merge-list-" + itemCache).removeData("timeTogetherListDynamic");
            $("#image-merge-list-" + itemCache).removeData("positionTogetherListDynamic");
        }
    });

    // 按时间聚合
    $(document).on('click', '#timeTogether', function () {
        $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).attr("sort", 3);
        let dynamicData = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data();
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            //if ($('#timeTogetherWrapper' + itemCache).find('.image-card-list').length == 0) {
            if (!$("#image-merge-list-" + itemCache).data('timeTogetherListDynamic') && !$("#image-merge-list-" + itemCache).find("#timeTogetherWrapper" + itemCache).hasClass("loading-position")) {
                if (dynamicData) {
                    togetherSearch(dynamicData, itemCache, 1); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                timeTogetherList.forEach(function (el, index) {
                    allSelectedCardList.forEach(function (item) {
                        el.list.forEach(function (v, n) {
                            if (v.picId === item.picId) {
                                $('#timeTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                            }
                        })
                    })
                });
                judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
                $('#timeTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-info' + itemCache).addClass('display-none');
            $('#sortByTimeWrapper' + itemCache).addClass('display-none');
            $('#timeTogetherWrapper' + itemCache).removeClass('display-none').show();
            $('#positionTogetherWrapper' + itemCache).addClass('display-none');
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            selectType = 3;
            $('#paginationTimeWrap' + itemCache).addClass('display-none');
            $('#paginationScoreWrap' + itemCache).addClass('display-none');
            pageMergeType = 1;
            $('#sortByTimeTotal').addClass('hide');
            $('#sortTotal').addClass('hide');
            $('#timeTogetherTotal').removeClass('hide');
            $('#positionTogetherTotal').addClass('hide');
        }
    });

    // 按地点聚合
    $(document).on('click', '#placeTogether', function () {
        $("#imageCacheMergeList").find(`#image-merge-list-${itemCache}`).attr("sort", 4);
        let dynamicData = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data();
        if (!$(this).hasClass('text-disabled')) {
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            $('#current-page .image-card-wrap.active').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            //if ($('#positionTogetherWrapper' + itemCache).find('.image-card-list').length == 0) {
            if (!$("#image-merge-list-" + itemCache).data('positionTogetherListDynamic') && !$("#image-merge-list-" + itemCache).find("#positionTogetherWrapper" + itemCache).hasClass("loading-position")) {
                if (dynamicData) {
                    togetherSearch(dynamicData, itemCache, 2); // 获取聚合数据 渲染聚合页面 时间聚合+地点聚合
                }
            } else {
                var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
                positionTogetherList.forEach(function (el, index) {
                    allSelectedCardList.forEach(function (item) {
                        el.list.forEach(function (v, n) {
                            if (v.picId === item.picId) {
                                $('#positionTogetherWrapper' + itemCache).find('.image-card-list').eq(index).find('.image-card-wrap').eq(n).addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                            }
                        })
                    })
                });
                judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
                $('#positionTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                    judgeSelecteAll($(el));
                });
            }

            var $this = $(this),
                $operateItem = $this.closest('.operate-item').siblings('.operate-item');
            $('#search-info' + itemCache).addClass('display-none');
            $('#timeTogetherWrapper' + itemCache).addClass('display-none');
            $('#sortByTimeWrapper' + itemCache).addClass('display-none');
            $('#positionTogetherWrapper' + itemCache).removeClass('display-none').show();
            $this.addClass('active');
            $this.siblings('.text-link').removeClass('active');
            $operateItem.find('.nav-link').removeClass('active');
            selectType = 4;
            $('#paginationTimeWrap').addClass('display-none');
            $('#paginationScoreWrap').addClass('display-none');
            pageMergeType = 2;
            $('#sortByTimeTotal').addClass('hide');
            $('#sortTotal').addClass('hide');
            $('#timeTogetherTotal').addClass('hide');
            $('#positionTogetherTotal').removeClass('hide');
        }
    });

    // 动态库 点击展开大图
    $('#content-box').on('click', '.showBigImg .image-card-img', function (e) {
        $('.layer .aui-icon-not-through').click();
        var $this = $(this), // 图片
            $showBigImgDom = $this.closest('.showBigImg'), // 当前检索类型的容器
            showBigImgId = $showBigImgDom.attr('id'), // 各检索类型容器id
            thisIndex = $this.closest('.image-card-wrap').index(); // 图片索引
        $targetImg = $('#usearchImg'); // 上传图片容器
        // 判断是否为聚合弹窗
        if (showBigImgId === 'timeTogetherWrapper' + itemCache || showBigImgId === 'positionTogetherWrapper' + itemCache) {
            var $imgWrap = $showBigImgDom.find('.image-card-list-wrap'), // 所有分组的列表
                $showMore = $this.closest('.loadSpread'), // 当前分组的查看更多
                showMoreIndex = $showMore.index(), // 当前分组的索引
                $el = $imgWrap.eq(showMoreIndex), // 当前分组的图片列表
                eleId = $el.attr('id'); // 当前分组列表的元素id
            showBigImgId = eleId;
            setTimeout(() => {
                createBigImgMask($el, eleId, thisIndex, $targetImg, e); // 聚合展开大图
            }, 300);
        } else {
            setTimeout(() => {
                createBigImgMask($showBigImgDom, showBigImgId, thisIndex, $targetImg, e); // 动态 非聚合 展开大图
            }, 300);
        }
    });

    // 动态检索 点击图片上的多选
    $("#content-box").on('click', '#current-page .image-card-list .image-card-box .image-checkbox-wrap', function () {
        var $this = $(this).find('.ui-checkboxradio-label'), // 多选框
            index = $this.closest('.image-card-wrap').index(), // 当前图片索引
            allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
        // 取消选中
        if ($this.hasClass('ui-checkboxradio-checked')) {
            // 聚合分组 去掉自身 + 标题中的全选
            $this.removeClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            // 动态库 去掉功能区全选
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
            // 本身去掉选中状态
            $this.closest('.image-card-wrap').removeClass('active');
            // 在所有选中图片中 去掉此图片
            if (selectType === 1) { // 按时间排序
                allSelectedCardList.map(function (e, n) {
                    if (e.picId === sortTimeList[index].picId) {
                        allSelectedCardList.splice(n, 1);
                    }
                })
            } else if (selectType === 2) { // 按相似度排序
                allSelectedCardList.map(function (e, n) {
                    if (e.picId === sortList[index].picId) {
                        allSelectedCardList.splice(n, 1);
                    }
                })
            } else if (selectType === 3) { // 按时间聚合
                var rowIndex = $this.closest('.image-card-list').index(); // 时间聚合 分组的索引
                allSelectedCardList.map(function (e, n) {
                    if (e.picId === timeTogetherList[rowIndex].list[index].picId) {
                        allSelectedCardList.splice(n, 1);
                    }
                })
            } else if (selectType == 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index(); // 地点聚合 分组的索引
                allSelectedCardList.map(function (e, n) {
                    if (e.picId === positionTogetherList[rowIndex].list[index].picId) {
                        allSelectedCardList.splice(n, 1);
                    }
                })
            }
        } else { // 选中
            $this.addClass('ui-checkboxradio-checked').closest('.image-card-wrap').addClass('active'); // 多选框选中状态
            // 全选数据赋值 判断功能区是否需全选 判断聚合分组标题是否需全选
            if (selectType === 1) { // 按时间排序
                allSelectedCardList.push(sortTimeList[index]);
                judgeSelectePageAll($('#sortByTimeWrapper' + itemCache));
            } else if (selectType === 2) { // 按相似度排序
                allSelectedCardList.push(sortList[index]);
                judgeSelectePageAll($('#search-info' + itemCache));
            } else if (selectType === 3) { // 按时间聚合
                var rowIndex = $this.closest('.image-card-list').index();
                allSelectedCardList.push(timeTogetherList[rowIndex].list[index]);
                judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
                judgeSelecteAll($this.closest('.image-card-list'));
            } else if (selectType === 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index();
                allSelectedCardList.push(positionTogetherList[rowIndex].list[index]);
                judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
                judgeSelecteAll($this.closest('.image-card-list'));
            }
        }
        // 所有选中数据 去重
        allSelectedCardList = unique(allSelectedCardList);
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyse').removeClass('disabled');
        } else {
            $('#courseAnalyse').addClass('disabled');
        }
        // 将所有选中的图片数据 绑定在轨迹分析按钮上
        $("#image-merge-list-" + itemCache).data({
            'trakData': allSelectedCardList
        });
    });

    // 聚合 点击分组标题前的全选
    $('#content-box').on('click', '#current-page .image-card-list .image-card-list-title .image-checkbox-wrap', function () {
        var $this = $(this).find('.ui-checkboxradio-label'), // 当前多选框
            allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : []; // 被选中的所有数据
        // 取消全选
        if ($this.hasClass('ui-checkboxradio-checked')) {
            $('#selectAllSnapping').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 去掉功能区全选
            // 去掉分组下 所有图片激活状态和选中状态
            $this.removeClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-wrap').each(function (n, e) {
                var $e = $(e);
                if ($e.hasClass('active')) {
                    $e.removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked');
                }
            });
            // 全选数据中 去掉点击的数据
            if (selectType === 3) { // 按时间聚合
                var rowIndex = $this.closest('.image-card-list').index();
                timeTogetherList[rowIndex].list.forEach(function (e) {
                    allSelectedCardList.forEach(function (item, idx) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(idx, 1);
                        }
                    })
                });
            } else if (selectType === 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index();
                positionTogetherList[rowIndex].list.forEach(function (e) {
                    allSelectedCardList.forEach(function (item, idx) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(idx, 1);
                        }
                    })
                });
            }
        } else { // 全选
            // 聚合 此分组下的图片增加选中状态
            $this.addClass('ui-checkboxradio-checked').closest('.image-card-list').find('.image-card-wrap').each(function (n, e) {
                var $e = $(e);
                if (!$e.hasClass('active')) {
                    $e.addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked');
                }
            })
            // 给全部选中的数据增加值 判断功能区是否需要全选
            if (selectType === 3) { // 按时间聚合
                var rowIndex = $this.closest('.image-card-list').index();
                timeTogetherList[rowIndex].list.forEach(function (e) {
                    allSelectedCardList.push(e);
                });
                judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
            } else if (selectType === 4) { // 按地点聚合
                var rowIndex = $this.closest('.image-card-list').index();
                positionTogetherList[rowIndex].list.forEach(function (e) {
                    allSelectedCardList.push(e);
                });
                judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
            }
            // 所有选中的数据去重
            allSelectedCardList = unique(allSelectedCardList);
        }
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyse').removeClass('disabled');
        } else {
            $('#courseAnalyse').addClass('disabled');
        }
        $("#image-merge-list-" + itemCache).data({
            'trakData': allSelectedCardList
        });
    })

    // 动态库 功能区 点击全选
    $(document).on('click', '#selectAllSnapping', function () {
        var $this = $(this).find('.ui-checkboxradio-label'), // 当前点击的全选框
            dynamicData = getSearchData().dynamic; // 左侧 动态搜索条件数据
        allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : []; // 所有被选中的数据
        // if (!dynamicData.base64Img) { // 没有上传图片 此时仍然可以点击全选
        //     return;
        // }
        if ($(this).find(".ui-checkboxradio-checkbox-label").hasClass("text-disabled")) {
            return;
        }
        // 全选
        if (!$this.hasClass('ui-checkboxradio-checked')) {
            $this.addClass('ui-checkboxradio-checked'); // 增加全选状态
            // 给全部被选中的数据赋值
            if (selectType === 1) { // 按时间排序
                $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                sortTimeList.map(function (e) {
                    allSelectedCardList.push(e);
                });
            } else if (selectType === 2) { // 按相似度排序
                $('#search-info' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                sortList.map(function (e) {
                    allSelectedCardList.push(e);
                });
            } else if (selectType === 3) { // 按时间聚合
                $('#timeTogetherWrapper' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                $('#timeTogetherWrapper' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
                timeTogetherList.map(function (e) {
                    e.list.map(function (item) {
                        allSelectedCardList.push(item);
                    });
                });
            } else if (selectType === 4) { // 按地点聚合 
                $('#positionTogetherWrapper' + itemCache).find('.image-card-wrap').addClass('active').find('.ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 图片选中
                $('#positionTogetherWrapper' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').addClass('ui-checkboxradio-checked'); // 聚合分组 标题显示全选
                positionTogetherList.map(function (e) {
                    e.list.map(function (item) {
                        allSelectedCardList.push(item);
                    });
                });
            }
            allSelectedCardList = unique(allSelectedCardList); // 全部被选中的数据去重
        } else { // 取消全选
            $this.removeClass('ui-checkboxradio-checked'); // 功能区 取消全选
            // 去掉图片选中 去掉聚合标题全选 所有被选中的数据赋值
            if (selectType === 1) { // 按时间排序
                $('#sortByTimeWrapper' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                sortTimeList.map(function (e, n) {
                    allSelectedCardList.map(function (item, index) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                });
            } else if (selectType === 2) { // 按相似度排序
                $('#search-info' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                sortList.map(function (e, n) {
                    allSelectedCardList.map(function (item, index) {
                        if (e.picId === item.picId) {
                            allSelectedCardList.splice(index, 1);
                        }
                    })
                });
            } else if (selectType === 3) { // 按时间聚合
                $('#timeTogetherWrapper' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                $('#timeTogetherWrapper' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
                timeTogetherList.map(function (e, n) {
                    e.list.map(function (v, idx) {
                        allSelectedCardList.map(function (item, index) {
                            if (v.picId === item.picId) {
                                allSelectedCardList.splice(index, 1);
                            }
                        })
                    })
                });
            } else if (selectType === 4) { // 按地点聚合
                $('#positionTogetherWrapper' + itemCache).find('.image-card-wrap').removeClass('active').find('.ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 图片去掉选中
                $('#positionTogetherWrapper' + itemCache).find('.image-card-list-title .ui-checkboxradio-label').removeClass('ui-checkboxradio-checked'); // 聚合分组 标题去掉全选
                positionTogetherList.map(function (e, n) {
                    e.list.map(function (v, idx) {
                        allSelectedCardList.map(function (item, index) {
                            if (v.picId === item.picId) {
                                allSelectedCardList.splice(index, 1);
                            }
                        })
                    })
                });
            }
        }
        // 轨迹分析按钮 是否可用
        if (allSelectedCardList.length > 0) {
            $('#courseAnalyse').removeClass('disabled');
        } else {
            $('#courseAnalyse').addClass('disabled');
        }
        // 轨迹分析按钮 赋值
        $("#image-merge-list-" + itemCache).data({
            'trakData': allSelectedCardList
        });
    })

    //在逃人员点击事件
    // $(document).on('click', '#idcardSelectMerge', function () {
    //     var $this = $(this).find('.ui-checkboxradio-label'); // 当前点击的全选框
    //     // 选中
    //     if (!$this.hasClass('ui-checkboxradio-checked')) {
    //         $this.addClass('ui-checkboxradio-checked'); // 增加全选状态
    //     } else { // 取消全选
    //         $this.removeClass('ui-checkboxradio-checked'); // 功能区 取消全选
    //     }
    // })

    // 动静结合 静态库标题点击事件
    $("#staticTitleContainer").on("click", function () {
        $("#showMoreChangShang").click();
    });

    // 动静结合 静态库 点击图片详情浮层之后 点击二次检索功能
    $('#repeatSearch').on('click', function () {
        var $targetImg = $(".change-detail-box>.image-flex-list").children().eq(1).children('.img'),
            $searchImg = $('#usearchImg');
        repeatSearch($searchImg, $targetImg, true); // 调用common里的方法
    });

    // 动静结合页面 静态库 点击详情快速布控 跳转到新建布控页面
    $("#bottom-sidebar").on("click", "#quitControl", function () {
        var url = "./facePlatform/control-new.html?dynamic=" + Global.dynamic,
            controlData = $("#bottom-sidebar").data('controlData');
        $('.control-new-popup').addClass('show').data('controlData', controlData);
        loadPage($('.control-new-popup'), url);
        $('.control-new-popup').removeClass('hide');
    });

    // 动静结合页面 静态库 键盘左右切换详情事件
    var portraitListID = 'mergeOneList'
    $('body').off('keyup.' + portraitListID).on('keyup.' + portraitListID, function (evt) {
        if (!isLoadAll) { //厂家算法如果没有全部返回则键盘事件无效
            return;
        } else if ($('body').find('.mask-container-fixed.show').length < 1) {
            var $childLen = $('#' + portraitListID + ' .image-card-item').length;
            if ($childLen > 0) {
                // 如果图片为展开状态
                if ($(this).find('#' + portraitListID + ' .image-card-item.active').parent().hasClass('showMore')) {
                    if (evt.keyCode === 37) {
                        $(this).find('#' + portraitListID + ' .image-card-item.active').prev().click();
                    }
                    if (evt.keyCode === 39) {
                        $(this).find('#' + portraitListID + ' .image-card-item.active').next().click();
                    }
                } else {
                    // 如果图片为收起状态，前5张有右键事件
                    if ($(this).find('#' + portraitListID + ' .image-card-item.active').index() < 5) {
                        if (evt.keyCode === 39) {
                            $(this).find('#' + portraitListID + ' .image-card-item.active').next().click();
                        }
                    }
                    // 如果图片为收起状态，前6张有左键事件
                    if ($(this).find('#' + portraitListID + ' .image-card-item.active').index() < 6) {
                        if (evt.keyCode === 37) {
                            $(this).find('#' + portraitListID + ' .image-card-item.active').prev().click();
                        }
                    }
                }
            }
        }
    });

    // 动静结合页面 点击动态库刷新按钮
    $('#refreshBtn').on('click', function () {
        window.isOnlyFresh = true;
        $('#mergeSearch').click(); // 搜索
    });

    //动态检索点击图文切换图表
    $("#dynamicContentContainer").on("click", "#showCardSearch", function () { //小图
        if (!$("#timeTogetherWrapper" + itemCache).hasClass("display-none")) {
            for (var i = 0; i < $("#timeTogetherWrapper" + itemCache).find(".image-card-list").length; i++) {
                if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                    if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`<button class="btn btn-link" type="button">${$("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button>`);
                    }
                } else {
                    if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        if (!$("#positionTogetherWrapper" + itemCache).hasClass("display-none")) {
            for (var i = 0; i < $("#positionTogetherWrapper" + itemCache).find(".image-card-list").length; i++) {
                if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 8) {
                    if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`<button class="btn btn-link" type="button">${$("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button>`);
                    }
                } else {
                    if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        togetherShowMore();
        $("#dynamicContentContainer").find("li.image-card-wrap").css({
            width: 'calc(12.5% - .625rem)'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-box").css({
            width: '100%'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-message-box").css({
            width: 'auto'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-info").addClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    }).on("click", "#showListSearch", function () {
        if (!$("#timeTogetherWrapper" + itemCache).hasClass("display-none")) {
            for (var i = 0; i < $("#timeTogetherWrapper" + itemCache).find(".image-card-list").length; i++) {
                if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                    if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`<button class="btn btn-link" type="button">${$("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button>`);
                    }
                } else {
                    if ($("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#timeTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        if (!$("#positionTogetherWrapper" + itemCache).hasClass("display-none")) {
            for (var i = 0; i < $("#positionTogetherWrapper" + itemCache).find(".image-card-list").length; i++) {
                if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-wrap.type-5").length > 4) {
                    if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length == 0) {
                        $("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title").append(`<button class="btn btn-link" type="button">${$("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).hasClass("showMore") ? '查看更多' : '收起'}</button>`);
                    }
                } else {
                    if ($("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").length > 0) {
                        $("#positionTogetherWrapper" + itemCache).find(".image-card-list").eq(i).find(".image-card-list-title button").remove();
                    }
                }
            }
        }
        togetherShowMore();
        $("#dynamicContentContainer").find("li.image-card-wrap").css({
            width: 'calc(25% - .625rem)'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-box").css({
            width: '35%'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-message-box").css({
            width: 'calc(35% - .1rem)'
        });
        $("#dynamicContentContainer").find("li.image-card-wrap>.image-card-info").removeClass("hide");
        $(this).addClass("btn-primary").siblings().removeClass("btn-primary");
    });

    // 点击轨迹分析按钮
    $('#courseAnalyse').on('click', function () {
        var data = $("#image-merge-list-" + itemCache).data('trakData');
        if (!dynamicData.base64Img || $('#courseAnalyse').hasClass('disabled')) {
            return;
        }
        if (data.length === 0) {
            warningTip.say('请选择图片')
        } else {
            initTimeLine(data, $('#auiTimeLine'));
            $('#current-page').addClass('display-none');
            $('#currentPagePath').removeClass('display-none');
        }
    })

    // 点击 轨迹分析页面返回按钮
    $('#backToSearch').on("click", function () {
        // if ($('#auiTimeLine .aui-timeline-box.active').length > 0) {
        // 	$('#auiTimeLine .aui-timeline-box.active').removeClass('active');
        // 	$('#auiTimeLine .ui-checkboxradio-checked').removeClass('ui-checkboxradio-checked');
        // 	var data = $('#courseAnalyse').data('trakData');
        // 	createMapFn(data, 'map_iframe_path');
        // } else {
        $('#current-page').removeClass('display-none');
        $('#currentPagePath').addClass('display-none');
        // }
        if (selectType == 1) {
            judgeSelectePageAll($('#sortByTimeWrapper' + itemCache));
        } else if (selectType == 2) {
            judgeSelectePageAll($('#search-info' + itemCache));
        } else if (selectType == 3) {
            judgeSelectePageAll($('#timeTogetherWrapper' + itemCache));
            $('#timeTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                judgeSelecteAll($(el));
            });
        } else if (selectType == 4) {
            judgeSelectePageAll($('#positionTogetherWrapper' + itemCache));
            $('#positionTogetherWrapper' + itemCache).find('.image-card-list').each(function (index, el) {
                judgeSelecteAll($(el));
            });
        }
    });

    // 动静结合页面 动态库 导出 点击事件
    $("#aui-icon-import").on('click', function () {
        showLoading($("#aui-icon-import"))
        var allSelectedCardList = $("#image-merge-list-" + itemCache).data('trakData') && $("#image-merge-list-" + itemCache).data('trakData').length > 0 ? $("#image-merge-list-" + itemCache).data('trakData') : [];
        if (allSelectedCardList.length == 0) {
            hideLoading($("#aui-icon-import"))
            warningTip.say('请选择导出图片！');
            return false;
        }
        if (allSelectedCardList.length > 100) {
            hideLoading($("#aui-icon-import"))
            warningTip.say('不能超过100张！');
            return false;
        }
        //获取选择的图片
        var _datas = [],
            _data = {};
        allSelectedCardList.forEach(function (item) {
            _data = {
                picId: item.picId,
                smallPicUrl: item.smallPicUrl,
                name: item.cameraName,
                time: item.captureTime
            };
            _datas.push(_data);
        });
        var datas = {
            dynamicId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            data: _datas
        };
        //第一步，先将图片信息传到后台
        successFunc = function (info) {
            if (info.code === '200') {
                //第二步，导出
                var token = $.cookie('xh_token');
                $("#exportIframe").attr("src", encodeURI(serviceUrl + "/v2/faceDt/exportImages?token=" + token + "&downId=" + info.downId));
            } else { }
            hideLoading($("#aui-icon-import"))
        };
        var port = 'v2/faceDt/exportImagesToCache';
        loadData(port, true, datas, successFunc);
    });

    // 动静结合页面 动态库图片 hover显示中图
    $('#current-page').on('mouseover', '.wrap-empty-center .image-card-wrap', function () {
        var $this = $(this),
            thisCls = $this.hasClass('disabled'),
            thisData = $this.data('listData'),
            imgSrc = $this.find('.image-card-img').attr('src'),
            top = $this.offset().top - 2,
            // left = $this.offset().left + $this.outerWidth() + 4,
            html = `<div class="card-img-hover">
				<img src="${imgSrc}" alt="">
			</div>`;
        if (thisData.base64Img) {
            html = `<div class="card-img-hover">
				<img src="${thisData.base64Img}" alt="">
			</div>`;
        }
        // 判定当前节点是否有禁用样式
        if (thisCls) {
            return;
        }
        cardImgHoverTimer = window.setTimeout(function () {
            $this.closest('.swiper-scroll-view.searchMergeOnly').append(html);
            var docH = document.documentElement.clientHeight,
                //$imgHover = $this.siblings('.card-img-hover'),
                $imgHover = $('.swiper-scroll-view.searchMergeOnly').find('.card-img-hover'),
                hoverImgH = $imgHover.outerHeight(),
                left = $this.offset().left - $(".card-img-hover").outerWidth() - 4;
            if ($this.offset().top + hoverImgH > docH) {
                $imgHover.css({
                    top: $this.offset().top + $this.outerHeight() - hoverImgH,
                    left: left
                })
            } else {
                $imgHover.css({
                    top: top,
                    left: left
                })
            }

            // // 鼠标经过在地图上显示坐标
            // var px = Number($this.attr("px")),
            // 	xMax = 115.07808642803226,
            // 	xMin = 113.32223456772093,
            // 	py = Number($this.attr("py")),
            // 	yMax = 113.32223456772093,
            // 	yMin = 22.190483583642468;
            // if (px > xMin && px < xMax && py > yMin && py < yMax) {
            // 	var targetOrigin = 'http://190.168.17.2:6082/peopleCity.html',
            // 		locationData = {
            // 			x: parseFloat($this.attr("px")),
            // 			y: parseFloat($this.attr("py")),
            // 			offsetValueOfX: 0.002
            // 		},
            // 		data = {
            // 			type: "locationToOffset",
            // 			mydata: locationData
            // 		},
            // 		iframe = document.getElementById('search_map_iframe');
            // 	iframe.contentWindow.postMessage(data, targetOrigin);
            // } else {
            // 	warningTip.say('所选图片坐标有误');
            // }
        }, 500);
    });

    // 动静结合页面 动态库图片 hover显示中图之后 鼠标离开图片
    $('#current-page').on('mouseout', '.wrap-empty-center .image-card-wrap', function () {
        $(this).closest('.swiper-scroll-view.searchMergeOnly').find('.card-img-hover').remove();
        window.clearTimeout(cardImgHoverTimer);
        var highlightOption = {
            type: 'removeHighlightArea'
        };
        var searchMapIframe = document.getElementById('search_map_iframe');
        var targetOrigin = mapUrl + 'peopleCity.html';
        searchMapIframe.contentWindow.postMessage(highlightOption, targetOrigin);
    });

    // 动静结合页面 上传图片区域 hover显示中图
    $('#current-page').on('mouseover', '#usearchImg .add-image-item', function () {
        var $this = $(this),
            imgSrc = $this.find('.add-image-img').attr('src'),
            top = $this.offset().top - 2,
            left = $this.offset().left + $this.outerWidth() + 4,
            html = `<div class="card-img-hover">
						<img src="${imgSrc}" alt="">
					</div>`;
        cardImgHoverTimer = window.setTimeout(function () {
            $this.closest('#myTabContent').append(html);
            var docH = document.documentElement.clientHeight,
                //$imgHover = $this.siblings('.card-img-hover'),
                $imgHover = $('#myTabContent').find('.card-img-hover'),
                hoverImgH = $imgHover.outerHeight();
            if ($this.offset().top + hoverImgH > docH) {
                $imgHover.css({
                    top: $this.offset().top + $this.outerHeight() - hoverImgH,
                    left: left
                })
            } else {
                $imgHover.css({
                    top: top,
                    left: left
                })
            }
        }, 500);
    });

    // 动静结合页面 上传图片区域 hover显示中图之后 鼠标离开图片
    $('#current-page').on('mouseout', '#usearchImg .add-image-item', function () {
        $(this).closest('#myTabContent').find('.card-img-hover').remove();
        window.clearTimeout(cardImgHoverTimer);
    });

    // 动静结合页面 图片检索内容区 点击左右收缩展开按钮
    $("#searchResultFlex").on("click", function () {
        if ($(this).find("i").attr("class") === "aui-icon-drop-left") {
            $(this).find("i").attr("class", "aui-icon-drop-right");
            $('#searchMergeContent').animate({
                "width": "0"
            }, 200);
            $('#searchResultFlex').animate({
                "left": "0"
            }, 200);
            var searchMapIframe = document.getElementById('search_map_iframe');
            var targetOrigin = mapUrl + 'peopleCity.html';
            window.setTimeout(function () {
                searchMapIframe.contentWindow.postMessage({
                    type: 'fullExtent'
                }, targetOrigin);
            }, 600)
        } else {
            $(this).find("i").attr("class", "aui-icon-drop-left");
            $('#searchMergeContent').animate({
                "width": "98%"
            }, 200);
            $('#searchResultFlex').animate({
                "left": "98%"
            }, 200);
        }
    })

    //检索地图初始化 选择摄像机
    window.addEventListener("message", function (ev) {
        var mydata = ev.data;
        if (mydata == 'initMap' || mydata == 'initMap?' || mydata == 'initMap?44031' && $('#search_map_iframe').length > 0) {
            var searchMapIframe = document.getElementById('search_map_iframe');
            var targetOrigin = mapUrl + 'peopleCity.html';
            var mapOperationData = {
                type: "controlVisible",
                mydata: [{
                    name: 'zoom',
                    b: false
                }, {
                    name: 'tools',
                    b: true
                }, {
                    name: 'search',
                    b: true
                }, {
                    name: 'fullExtent',
                    b: true
                }]
            };
            var searchMapData = {
                type: "cluster",
                mydata: []
            };
            window.setTimeout(function () {
                searchMapIframe.contentWindow.postMessage(mapOperationData, targetOrigin);
                searchMapIframe.contentWindow.postMessage(searchMapData, targetOrigin);
                searchMapIframe.contentWindow.postMessage({
                    type: 'fullExtent'
                }, targetOrigin);
            }, 2000);
        }
    });


    // 左侧表单 加载算法厂家
    function loadCjs() {
        var port = 'v2/faceRecog/manufactors',
            successFunc = function (data) {
                hideLoading($('body'));
                if (data.code === '200') {
                    var cjs = data.data, // 算法数据
                        cj_html = '';
                    for (var i = 0; i < cjs.length; i++) {
                        cj_html += `<div class="aui-col-4">
							<label for="checkbox-${i}"  cjid="${cjs[i].platformId}" cjname="${cjs[i].platformName}" class='ui-checkboxradio-tag'>${cjs[i].platformName}</label>
							<input type="checkbox" name="checkbox-3" id="checkbox-${i}" data-role="checkbox-button" checked/>
						</div>`;
                    }
                    $('#sf').data("cjData", cjs);
                    $('#sf').append(cj_html);
                    checkboxFunc();
                    radioFunc();
                } else {
                    warning.say(data.message);
                }
            };
        loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    }
    loadCjs(); // 左侧表单 加载算法厂家


    // 加载库列表
    function getManufactor() {
        var port = 'v2/faceRecog/libs',
            successFunc = function (data) {
                hideLoading($('body'));
                if (data.code == '200') {
                    var dbs = data.data, // 人脸库数据
                        db_html = '';
                    facedbData = dbs;
                    // 插入人脸库数据和节点
                    dbs.forEach(function (v, index) {
                        db_html += `<div class="aui-col-4">
							<label for="checkbox-facedb-${index}" class="ui-checkboxradio-tag" value="${v.libId}" title="${v.libName}">${v.libName}</label>
    						<input type="checkbox" name="checkbox-facedb" id="checkbox-facedb-${index}" data-role="checkbox-button" checked>
						</div>`;
                    });

                    // 插入节点，人脸库数据
                    $('#facedbContent').append(db_html);
                    checkboxFunc();
                    radioFunc();
                    // 数据绑定
                    $('#facedbContent').find(".ui-checkboxradio-tag").each(function (index, el) {
                        $(el).data('listData', dbs[index]);
                    });

                    var selectData = [];
                    var libNameVal = [];
                    dbs.map(function (item) {
                        selectData.push(item);
                        libNameVal.push(item.libName);
                    });
                    $('#facedb').data({
                        'selectData': selectData
                    });
                    $('#facedb').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
                } else {
                    warning.say(data.msg);
                }
            };
        loadData(port, true, {}, successFunc, undefined, 'GET', sourceType == 'ga' ? serviceUrlOther : '');
    };
    getManufactor(); //人脸库选择

    // 静态检索设置弹框打开关闭事件
    $('#mergeConfig').on('click', function () {
        if ($('#mergeConfigBox').hasClass('hide')) {
            $('#mergeConfigBox').removeClass('hide');
        } else {
            $('#mergeConfigBox').addClass('hide');
        }
    })

    $('#mergeConfigBox').on('click', '.aui-icon-not-through', function () {
        $('#mergeConfigBox').addClass('hide');
    })

    // 库列表弹框列表点击功能
    $('#facedbContent').off('click', '.ui-checkboxradio-tag').on('click', '.ui-checkboxradio-tag', function () {
        var rowData = $(this).data('listData'),
            selectedData = $('#facedb').data('selectData') ? $('#facedb').data('selectData') : [];
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            // $(this).next().prop('checked', true);
            selectedData.push(rowData);
            var libNameVal = [];
            selectedData.forEach(function (item) {
                var liNiName = item.libName;
                libNameVal.push(liNiName);
            })
            $('#facedb').data({
                'selectData': selectedData
            });
            $('#facedb').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        } else {
            // $(this).next().removeAttr('checked');
            selectedData.forEach(function (e, n) {
                if (e.libId == rowData.libId) {
                    selectedData.splice(n, 1);
                }
            });
            var libNameVal = [];
            selectedData.forEach(function (item) {
                var liNiName = item.libName;
                libNameVal.push(liNiName);
            })
            $('#facedb').data({
                'selectData': selectedData
            });
            $('#facedb').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        }
        checkboxFunc();
        radioFunc();
        if (selectedData.length == facedbData.length) {
            $('#facedb').find('.facedb-box-title .ui-checkboxradio-checkbox-label').addClass('ui-checkboxradio-checked');
        } else {
            $('#facedb').find('.facedb-box-title .ui-checkboxradio-checkbox-label').removeClass('ui-checkboxradio-checked');
        }
    })

    // 库列表弹框全选功能
    $('#facedb').find('.facedb-box-title').on('click', '.ui-checkboxradio-checkbox-label', function () {
        var $labelItem = $('#facedbContent').find('.ui-checkboxradio-tag');
        if (!$(this).hasClass('ui-checkboxradio-checked')) {
            $(this).addClass('ui-checkboxradio-checked');
            for (var i = 0; i < $labelItem.length; i++) {
                $labelItem.eq(i).next().prop('checked', true);
            }
            var selectData = [];
            var libNameVal = [];
            facedbData.map(function (item) {
                selectData.push(item);
                libNameVal.push(item.libName);
            });
            $('#facedb').data({
                'selectData': selectData
            });
            $('#facedb').val(libNameVal.join(',')).attr('title', libNameVal.join(','));
        } else {
            $(this).removeClass('ui-checkboxradio-checked');
            for (var i = 0; i < $labelItem.length; i++) {
                $labelItem.eq(i).next().removeAttr('checked');
            }
            $('#facedb').data({
                'selectData': ''
            });
            $('#facedb').val('').attr('title', '');
        }
        checkboxFunc();
        radioFunc();
    })

    // // 融合跟厂家一起展示，无效果
    // // 鼠标进入融合算法照片的时候 各家算法身份证相同的照片激活active效果
    // $(document).on('mouseenter', '#staticContentContainer .image-new-wrap', function () {
    // 	var listData = $(this).data('listData'),
    // 		$picId = listData.picId, // 图片id
    // 		$rhInfo = listData.rhInfo, // 所有命中的图片厂家和相似度数组
    // 		$otherList = $('#staticContentContainer').find('#factoryData .image-new-list'), // 所有厂家图片列表
    // 		$otherWrap = $('#staticContentContainer').find('#factoryData .image-new-wrap'); // 所有厂家的图片
    // 	$otherWrap.removeClass('selected');
    // 	if ($rhInfo) { // 如果有融合数据
    // 		$otherList.each(function (i, el) {
    // 			$(el).find('.image-new-wrap').each(function (i, el) { // 循环列表里面的照片
    // 				var $otherPicId = $(el).data("listData").picId;
    // 				if ($picId === $otherPicId) { // 图片与融合匹配
    // 					$(el).addClass("selected"); // picId相同添加选中
    // 				} else {
    // 					$(el).addClass("light"); // picId不同背景变白
    // 				}
    // 			});

    // 			// var html = `<span class="text-light checked-index">当前命中第`,
    // 			// 	sameArr = [];
    // 			// if (sameArr.length > 0) { // 收缩的厂家 标题上显示命中第几个
    // 			// 	sameArr.splice(sameArr.length - 1, 1, sameArr[sameArr.length - 1].split('、').join(""));
    // 			// 	for (var i = 0; i < sameArr.length; i++) {
    // 			// 		html += `${sameArr[i]}`;
    // 			// 	}
    // 			// 	html += `位</span>`;
    // 			// 	$(el).closest('.image-card-list').siblings('.image-card-list-title').find('.btn-link').before(html);
    // 			// }
    // 		})
    // 	}
    // }).on('mouseleave', '#staticContentContainer .image-new-wrap', function () {
    // 	var listData = $(this).data('listData'),
    // 		$picId = listData.picId, // 图片id
    // 		$rhInfo = listData.rhInfo,
    // 		$otherPicId,
    // 		$otherWrap = $('#staticContentContainer').find('#factoryData .image-new-wrap');
    // 	if ($rhInfo) { // 如果有融合数据
    // 		$otherWrap.each(function (i, el) { // 循环所有的厂家图片
    // 			$otherPicId = $(el).data("listData").picId;
    // 			if ($picId === $otherPicId) { // 如果命中
    // 				$(el).removeClass("selected"); // 去掉选中状态
    // 			} else {
    // 				$(el).removeClass("light"); // 去掉背景白色
    // 			}
    // 		})
    // 		// $('#factoryData').find('.checked-index').remove();
    // 	}
    // })

    var timeImageClick = null; //防止双击触发单击事件

    // 静态检索对比弹框双击事件
    $('#staticContentContainer').on('dblclick', '.image-new-wrap', function () {
        clearTimeout(timeImageClick);
        var $contrastModal = $('#contrastEditModal');
        var listData = $(this).data('listData');
        $('#contrastConfirm').data('listData', listData); //比中数据绑定
        $('#quicklyBK').data('url', listData.url); //快速布控数据绑定
        $('#quicklyJSM').data('url', listData.url); //快速检索数据绑定
        $('#mergeOnetooneSearch').data('url', listData.url); //1:1比对
        $contrastModal.modal('show');
        var imgSrc = $('#staticContentContainer .factoryData').not(".hide").data('currentSrc');

        var libNames = '';
        listData.libInfos.map(function (el, index) {
            if (index === 0) {
                libNames = el.libName;
            } else {
                libNames = libNames + ',' + el.libName;
            }
        });

        var factoryVal = '';
        if (listData.rhInfo) {
            listData.rhInfo.map(function (el, index) {
                if (index === 0) {
                    factoryVal = el.index + '-' + el.platformName + ':' + el.similarity;
                } else {
                    factoryVal = factoryVal + ',' + el.index + '-' + el.platformName + ':' + el.similarity;
                }
            });
        } else {
            factoryVal = listData.platformName + ':' + listData.similarity;
        }

        var _html = `<div class="image-box-flex">
						<span class="image-tag hide">检索原图</span>
						<div class="img iviewer_cursor"></div>
					</div>
					<div class="image-box-flex">
						<span class="image-tag hide">人脸库</span>
						<div class="img iviewer_cursor"></div>
					</div>`

        $('#contrastEditModal .image-flex-list').empty().append(_html);

        $contrastModal.find('.image-box-flex .img').eq(0).iviewer({
            src: imgSrc
        });
        $contrastModal.find('.image-box-flex .img').eq(1).iviewer({
            src: listData.url
        });

        // $contrastModal.find('.primary').html(listData.similarity);

        $contrastModal.find('.form-info .form-text').eq(0).html(listData.name);
        $contrastModal.find('.form-info .form-text').eq(1).html(listData.sex);
        $contrastModal.find('.form-info .form-text').eq(2).html(listData.age);
        $contrastModal.find('.form-info .form-text').eq(3).html(listData.idcard);
        $contrastModal.find('.form-info .form-text').eq(4).html(libNames);
        $contrastModal.find('.form-info .form-text').eq(5).html(factoryVal);

        $contrastModal.find('.form-info .form-text').eq(4).attr('title', libNames);
        $contrastModal.find('.form-info .form-text').eq(5).attr('title', factoryVal);

        var memberImgs = $(this).data('memberImgs') ? $(this).data('memberImgs') : [];
        var $imgBaseCS = $contrastModal.find('.imgBaseCS .image-card-list-wrap');
        if (memberImgs.length > 0) {
            var _html = '';
            // 插入数据和节点
            memberImgs.forEach(function (v, index) {
                _html += `<li class="imgBase-card-wrap">
						<div class="image-card-box img-right-event" style="width: 100%;">
							<img class="image-card-img" src="${v.picUrl}">
						</div>
						<div class="imgBaseCS-new">
							<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
							<p class="imgBaseCS-new-text">${v.createtime}</p>
						</div>
					</li>`;
            });

            // 插入节点，人脸库数据
            $imgBaseCS.empty().append(_html);
            // 数据绑定
            $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                $(el).data('listData', memberImgs[index]);
            });
        } else {
            loadEmpty($imgBaseCS, "暂无信息", true, true);
            showLoading($imgBaseCS);
            var port = 'v3/opPersonInfo/searchPersonInfo',
                portData = {
                    libId: '0010',
                    idcard: listData.idcard,
                    page: 1,
                    size: 30
                },
                successFunc = function (data) {
                    hideLoading($imgBaseCS);
                    if (data.code == '200' && data.data.list.length > 0) {
                        var list = data.data.list,
                            _html = '';
                        // 插入数据和节点
                        list.forEach(function (v, index) {
                            _html += `<li class="imgBase-card-wrap">
										<div class="image-card-box img-right-event" style="width: 100%;">
											<img class="image-card-img" src="${v.picUrl}">
										</div>
										<div class="imgBaseCS-new">
											<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
											<p class="imgBaseCS-new-text">${v.createtime || '未知'}</p>
										</div>
									</li>`;
                        });

                        // 插入节点，人脸库数据
                        $imgBaseCS.empty().append(_html);
                        // 数据绑定
                        $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                            $(el).data('listData', list[index]);
                        });

                    } else {
                        loadEmpty($imgBaseCS, "暂无信息", true, true);
                        warning.say(data.message);
                    }
                };
            if (listData.idcard) {
                loadData(port, true, portData, successFunc);
            } else {
                hideLoading($imgBaseCS);
                loadEmpty($imgBaseCS, "无身份证信息！", true, true);
            }
        }
    }).on('click', '.image-new-wrap', function () {
        clearTimeout(timeImageClick);
        timeImageClick = setTimeout(() => {
            $this = $(this);
            var listData = $this.data('listData');
            // $('#collapseStatic').find('.panel-contrast-img').removeClass('hide');
            // $('#collapseStatic').find('.panel-body-box').css({
            // 	'height': 'calc(100% - 12rem)'
            // })

            var $imgBaseCS = $('#staticSearchResultID');
            showLoading($imgBaseCS);
            var port = 'v3/opPersonInfo/searchPersonInfo',
                portData = {
                    libId: '0010',
                    idcard: listData.idcard,
                    page: 1,
                    size: 30
                },
                successFunc = function (data) {
                    hideLoading($imgBaseCS);
                    if (data.code == '200' && data.data.list.length > 0) {
                        var list = data.data.list,
                            _html = '';
                        $this.data('memberImgs', list);

                        _html += `<ul class="image-card-list-wrap aui-mt-sm aui-mb-xs showBigImg">`;
                        // 插入数据和节点
                        list.forEach(function (v, index) {
                            _html += `<li class="imgBase-card-wrap">
									<div class="image-card-box img-right-event" style="width: 100%;">
										<img class="image-card-img" src="${v.picUrl}">
									</div>
									<div class="imgBaseCS-new">
										<p class="imgBaseCS-new-text">${v.libName || '未知'}</p>
										<p class="imgBaseCS-new-text">${v.createtime || '未知'}</p>
									</div>
								</li>`;
                        });
                        _html += `</ul>`;

                        // 插入节点，人脸库数据
                        $imgBaseCS.empty().append(_html);
                        $imgBaseCS.scrollTop(0);
                        // 数据绑定
                        $imgBaseCS.find(".imgBase-card-wrap").each(function (index, el) {
                            $(el).data('listData', list[index]);
                        });
                    } else {
                        loadEmpty($imgBaseCS, "暂无信息", true, true);
                        warning.say(data.message);
                    }
                };
            if (listData.idcard) {
                loadData(port, true, portData, successFunc);
                $this.addClass("active").siblings().removeClass("active");
            } else {
                hideLoading($imgBaseCS);
                loadEmpty($imgBaseCS, "无身份证信息！", true, true);
            }

            $this.siblings().find(".btn").remove();
            if (!$this.find(".btn").length) {
                let html = `<button type="button" class="btn btn-sm btn-primary">比中</button>`;
                $this.append(html);
            }
        }, 300);
    }).on('mouseover', '.image-new-wrap', function () {  //鼠标移入移出事件
        if (!$(this).find(".btn").length) {
            lethtml = '';
            if ($(this).hasClass("1v1")) {
                html = `<button type="button" class="btn btn-sm btn-primary disabled">已比中</button>`;
            } else {
                html = `<button type="button" class="btn btn-sm btn-primary">比中</button>`;
            }
            $(this).append(html);
        }
    }).on('mouseleave', '.image-new-wrap', function () {  //鼠标移入移出事件
        if (!$(this).hasClass("active")) {
            $(this).find(".btn").remove();
        }
    }).on('click', '.image-new-wrap .btn', function () {  //比对按钮点击事件
        if ($(this).hasClass("disabled")) {
            return;
        }
        var $this = $(this),
            currentStaticId = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId'),
            listData = $(this).parent().data('listData'),
            item = $('#staticSearchResult').find('.add-image-item.active').find('img').attr('cache'),
            cjData = $('#sf').data("cjData" + item) ? $('#sf').data("cjData" + item) : $('#sf').data("cjData"), // 各算法产家的数据状态
            data = [];
        cjData.map(cl => {
            var isExist = false
            var imgData = {};
            if (listData.rhInfo && listData.rhInfo.length > 0) {
                listData.rhInfo.map(el => {
                    if (cl.platformId == el.platformId) {
                        isExist = true
                        imgData.platformId = el.platformId;
                        imgData.similarity = el.similarity;
                        imgData.sequence = el.index;
                    }
                })
            }
            if (!isExist) {
                if (listData.platformId == cl.platformId) {
                    var picId = listData.picId;
                    var index = $('#factoryData-' + item + '-' + cl.platformId).find('[picId="' + picId + '"]').index();
                    imgData.platformId = listData.platformId;
                    imgData.similarity = listData.similarity;
                    imgData.sequence = index + 1;
                } else {
                    if (cl.dataState && cl.dataState == '613') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -1;
                    } else if (cl.dataState && cl.dataState == 'error') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -2;
                    } else if (cl.dataState && cl.dataState == 'nodata') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -3;
                    } else {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = 0;
                    }
                }
            }
            data.push(imgData);
        })
        var port = 'v2/faceRecog/comfirm',
            portData = {
                staticId: currentStaticId,
                idcard: listData.idcard,
                data: data
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    $this.parent().addClass("1v1");
                    $this.addClass("disabled").html("已比中");
                    warningTip.say('提交成功！');
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    });

    // 静态检索比中确认事件
    $('#contrastConfirm').on('click', function () {
        var listData = $(this).data('listData');
        var data = [];
        var item = $('#usearchImg').find('.add-image-item.active').find('img').attr('cache');
        var rongheData = $('#fuseData' + item).data('listData'); // 融合所有数据
        // cjData+item 数据存在说明有算法厂家获取数据异常 sequence赋值为-2
        var cjData = $('#sf').data("cjData" + item) ? $('#sf').data("cjData" + item) : $('#sf').data("cjData"); // 各算法产家的数据状态
        if (typeof (listData.rhInfo) == 'undefined' && rongheData) { //不是融合模块 查询对应的融合数据
            rongheData.map(el => {
                if (el.picId == listData.picId) {
                    listData.rhInfo = el.rhInfo
                }
            })
        }
        cjData.map(cl => {
            var isExist = false
            var imgData = {};
            if (listData.rhInfo && listData.rhInfo.length > 0) {
                listData.rhInfo.map(el => {
                    if (cl.platformId == el.platformId) {
                        isExist = true
                        imgData.platformId = el.platformId;
                        imgData.similarity = el.similarity;
                        imgData.sequence = el.index;
                    }
                })
            }
            if (!isExist) {
                if (listData.platformId == cl.platformId) {
                    var picId = listData.picId;
                    var index = $('#factoryData-' + item + '-' + cl.platformId).find('[picId="' + picId + '"]').index();
                    imgData.platformId = listData.platformId;
                    imgData.similarity = listData.similarity;
                    imgData.sequence = index + 1;
                } else {
                    if (cl.dataState && cl.dataState == '613') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -1;
                    } else if (cl.dataState && cl.dataState == 'error') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -2;
                    } else if (cl.dataState && cl.dataState == 'nodata') {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = -3;
                    } else {
                        imgData.platformId = cl.platformId;
                        imgData.similarity = '';
                        imgData.sequence = 0;
                    }
                }
            }
            data.push(imgData);
        })

        var currentStaticId = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picId');
        var port = 'v2/faceRecog/comfirm',
            portData = {
                staticId: currentStaticId,
                idcard: listData.idcard,
                data: data
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    warningTip.say('提交成功！');
                } else {
                    warningTip.say(data.message);
                }
            };
        loadData(port, true, portData, successFunc, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    })

    //静态1:1比对
    $("#mergeOnetooneSearch").on("click", function () {
        var src1 = $('#staticContentContainer .factoryData').not(".hide").data('currentSrc'),
            src2 = $('#mergeOnetooneSearch').data('url');

        commonOnetooneSearch(src1, src2);
    });

    // 静态检索弹框快速布控
    $('#quicklyBK').on('click', function () {
        $('#contrastEditModal').modal('hide');
        $('.modal-backdrop').remove(); // 清除遮罩
        var imgUrl = $(this).data('url');
        var $sideBar = $('#pageSidebarMenu').find('.aui-icon-monitor2'),
            $sideItem = $sideBar.closest('.sidebar-item'),
            sideIndex = $sideItem.index(),
            $contentItem = $('#content-box').find('.content-save-item').eq(sideIndex),
            $contentUserImg = $contentItem.find('#newBukong'),
            url = $sideBar.parent("a").attr("lc") + "?dynamic=" + Global.dynamic;

        if (!$sideBar.parents("li").hasClass("active")) {
            $sideItem.click();
            if ($("#newBukong").length == 0) {
                loadPage($contentItem, url);
            }
        } else {
            // if ($("#backToSearchControl").length > 0 && !$("#currentPageControlPath").hasClass(
            // 		"display-none")) {
            // 	$("#backToSearchControl").click();
            // }
            if ($("#backToControlOverview").length > 0 && !$("#controlDetailPage").hasClass(
                "display-none")) {
                $("#backToControlOverview").click();
            }
        }
        setTimeout(function () {
            $("#newBukong").click();
            $('#selectObject').removeClass('hide');
            $('#selectControl').addClass('hide');

            var html = `<div class="add-image-item">
							<img class="add-image-img" src="${imgUrl}" alt="">
							<i class="aui-icon-delete-line"></i>
						</div>`;
            $('#control_imgList').find('.add-image-icon').before(html);

            $('#control_imgList').removeClass('center');
            $('#control_imgList').find('.add-image-icon').removeClass('add-image-new');
            $('#control_imgList').find('.add-image-box-text').addClass('hide');
            $("#control_imgList .add-image-icon").siblings('.add-image-item').removeClass('active');
            $('#addImgWarning').addClass('hide');
        }, 100);
    })

    //静态检索弹窗快速检索
    $('#quicklyJSM').on('click', function () {
        $('#contrastEditModal').modal('hide');
        var $usearchImg = $('#usearchImg'),
            $mergeSearch = $("#mergeSearch"),
            imgUrl = $(this).data("url");
        var html = createAddImageItem(imgUrl);
        $usearchImg.find('.add-image-item').removeClass('active');
        $usearchImg.find('.add-image-icon').before(html);
        $usearchImg.find('.uploadFile')[0].value = '';
        var $imgItem = $usearchImg.find('.add-image-item');
        if ($imgItem.length > 5) {
            $usearchImg.removeClass('scroll');
            var clientH = $usearchImg[0].clientHeight;
            $usearchImg.addClass('scroll');
            $usearchImg.animate({
                'scrollTop': clientH
            }, 500);
        }
        // 自动搜索图片
        window.setTimeout(function () {
            if ($mergeSearch.length > 0) {
                imgDom(imgUrl, $mergeSearch, $usearchImg);
            }
        }, 100)
    });

    // 静态检索对比弹框数据切换
    $('#contrastEditModal').on('click', '.imgBase-card-wrap', function () {
        var $contrastModal = $('#contrastEditModal');
        var listData = $(this).data('listData');
        $('#quicklyBK').data('url', listData.picUrl); //快速布控数据绑定
        $(this).addClass('active').siblings().removeClass('active');

        var _html = `<span class="image-tag">人脸库</span>
						<div class="img iviewer_cursor"></div>`

        $('#contrastEditModal .image-flex-list .image-box-flex').eq(1).empty().append(_html);
        $contrastModal.find('.image-box-flex .img').eq(1).iviewer({
            src: listData.picUrl
        });
    })

    //静态检索切换tab默认选中第一个
    // $("#staticSearchResult").on("shown.bs.tab", "a[data-toggle='tab']", function () {

    // });

    //区域切换类点
    $("#current-page").on("change", ".cameraTypeSearch input", function () {
        if ($("#sidebarPoliceSelect").val() && $("#selMergeCameraID").attr("link") != '0') {
            loadSearchCameraInfo($("#sidebarCameraSelect"), $("#sidebarPoliceSelect").val());
        }
    });

    window.initDatePicker1($('#searchMerge_Time'), -30); // 初始化 时间控件
    initDynamic($("#sidebarOrgSelect"), $("#sidebarPoliceSelect"), $("#sidebarCameraSelect")); // 左侧 分局和派出所的下拉选择 searchCommon中的方法
    initPage(); // 初始化图片容器
    dropSelect($('#collapseDynamic')); // 动静结合页面 动态库 图片拖拽框选
    loadMapCameraList(); // 地图选择摄像头事件 common中的方法


    /**
     * 档案标签的下拉选择
     */
    function loadLabels() {
        showLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
        var port = 'v2/memberFiles/memberLabels',
            data = {},
            successFunc = function (data) {
                hideLoading($("#portraitTwo_labels").closest('.camera-drop-select'));
                if (data.code == '200') {
                    var result = data.data;
                    labelsData = data.data;
                    //对数组进行排序没有父元素的在最上层
                    if (result && result.length) {
                        var itemHtml = '';
                        for (var i = 0; i < result.length; i++) {
                            itemHtml += `<option class="option-item" orgid="${result[i].labelId}" value="${result[i].labelId}">${result[i].labelName}</option>`;
                        }

                        $("#portraitTwo_labels").empty().append(itemHtml);
                        $("#portraitTwo_labels").selectpicker({
                            allowClear: false
                        });
                        $("#portraitTwo_labels").selectpicker('refresh');
                    } else {
                        $("#portraitTwo_labels").prop('disabled', true);
                        $("#portraitTwo_labels").val(null);
                        $("#portraitTwo_labels").selectpicker('refresh');
                    }
                }
            };
        loadData(port, true, data, successFunc, undefined, 'GET');
    };
    loadLabels()

    /**详情信息展示
     * @param {*} $url 证件照地址
     * @param {*} $id 人员ID
     */
    function showDetailInfo($url, $id) {
        var port = 'v2/memberFiles/memberDetails',
            portData = {
                "rxId": $id
            },
            successFunc = function (data) {
                if (data.code == '200') {
                    var data = data.data;
                    if (data) {
                        $("#breakLowNew").html("");
                        //人员信息
                        // //证件照图片
                        // $("#basicsUrlV").attr("src", $url ? $url : './assets/images/control/person.png');
                        // 姓名
                        $('#detailNameVal').text(data.name ? data.name : '暂无');
                        // 英文名
                        $('#detailEngNameVal').text(data.engName ? data.engName : "暂无");
                        //通行证号码
                        $('#detailPassNoVal').text(data.passNo ? data.passNo : "暂无");
                        // 性别
                        $('#detailGenderVal').text(data.gender ? (data.gender == 1 ? "男" : "女") : "暂无");
                        // 电话号码
                        $('#detailTelNoVal').text(data.telNo ? data.telNo : "暂无");
                        // 身份证
                        $('#detailIdcardVal').text(data.idcard ? data.idcard : "暂无");
                        // 出生年月
                        $('#detailBirthdayVal').text(data.birthday ? data.birthday : "暂无");
                        // 户籍所在地
                        $('#detailRegaddressVal').text(data.regaddress ? data.regaddress : "暂无");
                        // 违法时间
                        $('#detailIllegallyTimeVal').text(data.illegallyTime ? data.illegallyTime : "暂无");
                        // 毕业院校
                        $('#detailSchoolVal').text(data.school ? data.school : "暂无");
                        // 是否抓获
                        if (data.arrested == 1) { //是
                            $('#detailIsArrestVal').text("是" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        } else if (data.arrested == 2) { //否
                            $('#detailIsArrestVal').text("否");
                        } else { //潜逃
                            $('#detailIsArrestVal').text("潜逃" + (data.abscondArea ? '(' + data.abscondArea + ')' : ''));
                        }
                        // 上传人
                        $('#detailUserNameVal').text(data.source == '1' ? (data.userName ? data.userName : "暂无") : (data.realname ? data.realname : "暂无"));
                        // 上传机构
                        $('#detailOrgNameVal').text(data.source == '1' ? (data.orgName ? data.orgName : "暂无") : (data.deptname ? data.deptname : "暂无"));
                        // 上传时间
                        $('#detailCreateTimeVal').text(data.createTime ? data.createTime : "暂无");
                        //背景资料
                        $("#detailBackgroundInfoVal").text(data.backgroundInfo ? data.backgroundInfo : "暂无");
                        // 违法地点
                        $('#detailIllegallyAddVal').text(data.illegallyAdd ? data.illegallyAdd : "暂无");
                        //违法行为
                        $("#detailOnSiteDelictVal").text(data.onSiteDelict ? data.onSiteDelict : "暂无");
                        //涉嫌全国性罪名
                        $("#detailStateChargeVal").text(data.stateCharge ? data.stateCharge : "暂无");
                        //涉嫌香港罪名
                        $("#detailHhkChargeVal").text(data.hhkCharge ? data.hhkCharge : "暂无");
                        //说明
                        $("#detailCommentsVal").text(data.comments ? data.comments : "暂无");
                        // 标签
                        if (data.label) {
                            if (data.labels.length > 0) {
                                $('#detailTagVal').html("");
                                data.labels.forEach(item => {
                                    var htmlLabel = `<span class="detailLabelItem">${getLabelsTypeS(item)}</span>`;
                                    $('#detailTagVal').append(htmlLabel);
                                });
                            } else {
                                $('#detailTagVal').html("暂无");
                            }
                        } else {
                            $('#detailTagVal').html("暂无");
                        }

                        //出入境截图
                        if (data.exitEntryList.length > 0) {
                            $("#detailExitEntry").html(`<a class="photo-link" href="${data.exitEntryList[0].url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                            <img src="${data.exitEntryList[0].url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="出入境截图">
                                                        </a>`);
                        } else {
                            $("#detailExitEntry").html("暂无");
                        }

                        //违法信息
                        data.list.forEach((element, index) => {
                            var htmlActCompareShotList = '',
                                htmlComparisonShotList = '',
                                htmlActScreenshotList = '',
                                htmlSourceVideoList = '',
                                htmlActMapList = '';
                            if (element.actCompareShotList.length > 0) { //现场比对照截图个数
                                element.actCompareShotList.forEach((item) => {
                                    htmlActCompareShotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActCompareShotList = '暂无';
                            }

                            if (element.comparisonShotList.length > 0) { //对比照截图
                                element.comparisonShotList.forEach((item) => {
                                    htmlComparisonShotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlComparisonShotList = '暂无';
                            }

                            if (element.actScreenshotList.length > 0) { //现场照截图
                                element.actScreenshotList.forEach((item) => {
                                    htmlActScreenshotList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                                </a>`
                                });
                            } else {
                                htmlActScreenshotList = '暂无';
                            }

                            if (element.sourceVideoList.length > 0) { //相关视频
                                element.sourceVideoList.forEach((item) => {
                                    htmlSourceVideoList += `<span class="video-link" videoUrl="${item.url}" target="_blank" filename="${item.fileName}" zmurl="${item.zmUrl}">
                                                                <img src="./assets/images/icons/video.bmp" />
                                                            </span>`
                                });
                            } else {
                                htmlSourceVideoList = '暂无';
                            }

                            if (element.actMapList.length > 0) { //现场地图
                                element.actMapList.forEach((item) => {
                                    htmlActMapList += `<a class="photo-link" href="${item.url}" target="_blank" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                            <img src="${item.url}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="现场比对照截图">
                                                        </a>`
                                });
                            } else {
                                htmlActMapList = '暂无';
                            }

                            var html = `<div class="fh-section-item supplement-info">
                                            <div class="card-title-box">
                                                <i class="aui-icon-face card-title-icon"></i>
                                                <span class="card-title">违法信息${index + 1}</span>
                                                <div class="detailBtn ${data.source == 2 ? 'hide' : ''}">
                                                    <div class="btn-group btn-group-icon aui-ml-md" role="group" aria-label="Basic example">
                                                        <div class="hat-content clearfix">
                                                            <div class="float-left btn-gutter-sm">
                                                                <button type="button" class="btn btn-primary btn-sm editDetailCardTwo">编辑</button>
                                                                <button type="button" class="btn btn-primary btn-sm deleteDetailCardTwo">删除</button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="hat-content clearfix">
                                                <div class="detailContent">
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场比对照截图:</label>
                                                            <div class="form-text" id="illegalBBPhoto_${index + 1}">
                                                                ${htmlActCompareShotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">证件照截图:</label>
                                                            <div class="form-text" id="illegalZJPhoto_${index + 1}">
                                                                <a class="photo-link" target="_blank" href="${$url ? $url : './assets/images/control/person.png'}" onerror="this.error=null;this.href='./assets/images/control/person.png'" data-photoswiper="filter" data-touch="false">
                                                                    <img src="${$url ? $url : './assets/images/control/person.png'}" onerror="this.error=null;this.src='./assets/images/control/person.png'" alt="证件照截图">
                                                                </a>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">对比照截图:</label>
                                                            <div class="form-text" id="illegalDBPhoto_${index + 1}">
                                                                ${htmlComparisonShotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场地图:</label>
                                                            <div class="form-text" id="illegalXCMap_${index + 1}">
                                                                ${htmlActMapList}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">现场照截图:</label>
                                                            <div class="form-text" id="illegalXCPhoto_${index + 1}">
                                                                ${htmlActScreenshotList}
                                                            </div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">相关视频:</label>
                                                            <div class="form-text" id="illegalVideo_${index + 1}">
                                                                ${htmlSourceVideoList}
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <div class="form-group">
                                                            <label class="aui-form-label">违法时间:</label>
                                                            <div class="form-text" id="illegalTime_${index + 1}">${element.illegallyTime ? element.illegallyTime : '暂无'}</div>
                                                        </div>
                                                        <div class="form-group">
                                                            <label class="aui-form-label">违法地点:</label>
                                                            <div class="form-text" id="illegalAdd_${index + 1}">${element.illegallyAdd ? element.illegallyAdd : '暂无'}</div>
                                                        </div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">关联事件:</label>
                                                        <div class="form-text" id="illegalEvent_${index + 1}">${element.eventName ? element.eventName : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">关联线索:</label>
                                                        <div class="form-text" id="illegalClue_${index + 1}">${element.clueName ? element.clueName : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">现场违法行为:</label>
                                                        <div class="form-text" id="illegalOnSiteDelict_${index + 1}">${element.onSiteDelict ? element.onSiteDelict : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">信息来源:</label>
                                                        <div class="form-text" id="illegalSourceInfo_${index + 1}">${element.sourceInfo ? element.sourceInfo : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">涉嫌全国性罪名:</label>
                                                        <div class="form-text" id="illegalStateCharge_${index + 1}">${element.stateCharge ? element.stateCharge : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">涉嫌香港罪名:</label>
                                                        <div class="form-text" id="illegalHhkCharge_${index + 1}">${element.hhkCharge ? element.hhkCharge : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">现场人物特征描述:</label>
                                                        <div class="form-text" id="illegalFeature_${index + 1}">${element.actDescription ? element.actDescription : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">比对人:</label>
                                                        <div class="form-text" id="illegalContract_${index + 1}">${element.comparisonor ? element.comparisonor : '暂无'}</div>
                                                    </div>
                                                    <div class="detail-form">
                                                        <label class="aui-form-label">备注:</label>
                                                        <div class="form-text" id="illegalComments_${index + 1}">${element.comments ? element.comments : '暂无'}</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>`;
                            $("#breakLowNew").append(html);
                            $("#breakLowNew").find(".fh-section-item.supplement-info").eq(index).data("allData", element);
                        });
                    } else {
                        warningTip.say('当前人员已经不存在');
                    }
                }
            };
        loadData(port, true, portData, successFunc, undefined, "GET");
    };

    /**详情标签获取
     * @param {*} type 标签id
     */
    function getLabelsTypeS(id) {
        labelsData.forEach(val => {
            if (val.labelId == id) {
                labelName = val.labelName;
            }
        });

        return labelName;
    };

    //切换厂家公用函数
    function tabCjCommon(idName, cjId, $data, count) {
        showLoading($(idName).parents(".factoryData"));
        var ageVal = $data.agegroup, // 年龄
            sexVal = $data.sex, // 性别
            faceVal = String($data.libids), //人脸库查询值
            countVal = $data.limit, // 结果数
            cjs = $data.platformId, // 已选算法厂家id数组			
            allCountS = 0; // 静态库 搜索总数

        var port1 = 'v2/faceRecog/face1VN',
            data1 = {
                staticId: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('picid'),
                ageGroup: ageVal,
                sex: sexVal,
                libIds: faceVal,
                platformId: cjId,
                platformIds: cjs,
                idcard: $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr('idcard'),
                incidentId: $("#headingOne").find(".ui-checkboxradio-checkbox-label").attr("isWhite") == '1' ? '' : $("#commentSelectMerge").find(".selectpicker").val(),
                top: countVal
            },
            successFunc1 = function (data) {
                hideLoading($(idName).parents(".factoryData"));
                if (data.code === '200') {
                    var result = data.data || false;
                    var _html = '';
                    _html = createStaticImgItem(result, _html); // 构造当前厂家图片节点
                    $('#staticContentContainer').find(idName).siblings().find('.image-new-list').html('');
                    $('#staticContentContainer').find(idName).find('.image-new-list').html(_html); // 加载厂家搜索的图片内容
                    bindDataToImgItem($('#staticContentContainer'), idName, result); // 将列表绑上数据

                    $("#staticSearchResult").find(`${idName} .image-new-list .image-new-wrap`).eq(0).click();
                    $(idName).find(".image-new-wrap").each((index, ele) => {
                        var $this = $(ele),
                            listData = $this.data('listData'),
                            libNames = '';
                        listData.libInfos.map(function (el, index) {
                            if (index === 0) {
                                libNames = el.libName;
                            } else {
                                libNames = libNames + ',' + el.libName;
                            }
                        });
                        if (libNames.indexOf('涉港一人一档库') > -1) {
                            var portBasics = 'v2/memberFiles/basics';
                            var portDataBasics = {
                                name: listData.name,
                                idcard: listData.idcard,
                                page: 1,
                                size: 1,
                                randomNub: Math.random() // 非后端需要数据，防止请求被终止
                            },
                                successFuncBasics = function (data) {
                                    if (data.code === '200' && data.data.list.length > 0) {
                                        var list = data.data.list,
                                            rxId = list[0].rxId,
                                            rxUrl = list[0].url;
                                        $this.data({
                                            rxId: rxId,
                                            rxUrl: rxUrl
                                        })
                                        $this.find('.basicsBut').removeClass('hide');
                                    }
                                }
                            loadData(portBasics, true, portDataBasics, successFuncBasics);
                        }
                    })

                    $(`#factoryData${$('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').attr("cache")}`).find(".image-new-wrap").each(function (index, ele) {
                        var $this = $(ele),
                            listData = $this.data('listData'),
                            libNames = '';
                        listData.libInfos.map(function (el, index) {
                            if (index === 0) {
                                libNames = el.libName;
                            } else {
                                libNames = libNames + ',' + el.libName;
                            }
                        });
                        if (libNames.indexOf('涉港一人一档库') > -1) {
                            var portBasics = 'v2/memberFiles/basics';
                            var portDataBasics = {
                                name: listData.name,
                                idcard: listData.idcard,
                                page: 1,
                                size: 1
                            },
                                successFuncBasics = function (data) {
                                    if (data.code === '200' && data.data.list.length > 0) {
                                        var list = data.data.list,
                                            rxId = list[0].rxId,
                                            rxUrl = list[0].url;
                                        $this.data({
                                            rxId: rxId,
                                            rxUrl: rxUrl
                                        })
                                        $this.find('.basicsBut').removeClass('hide');
                                    }
                                }
                            loadData(portBasics, false, portDataBasics, successFuncBasics);
                        }
                    })

                    if (!result.length) {
                        loadEmpty($('#staticContentContainer').find(idName + ' .image-new-list'));
                        var item = $('#usearchImg').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#sf').data("cjData" + item)) {
                            var cjData = $('#sf').data("cjData" + item);
                        } else {
                            var cjData = $('#sf').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = 'nodata';
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#sf').data("cjData" + item, cjData)
                    }
                } else {
                    if (data.code === '616') {
                        isLoad = true;
                        var sxCount = count ? count : 1;
                        if (cjsSuccess.length === cjs.length && isLoad && sxCount < 4) {
                            // 给图片绑定静态id
                            var picBase64 = $('#usearchImg').data('src'),
                                staticId = $('#usearchImg').data('staticId');
                            if (picBase64.indexOf("http") == 0) { //url
                                var picIdPortData = {
                                    url: picBase64,
                                    staticId: staticId,
                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                };
                            } else { //base64
                                var picIdPortData = {
                                    base64: picBase64,
                                    staticId: staticId,
                                    moduleCode: $("#pageSidebarMenu").find(".sidebar-item.active").attr("id")
                                };
                            }
                            var picIdPort = 'v2/faceRecog/uploadImage',
                                picIdSuccessFunc = function (data) {
                                    if (data.code == '200') {
                                        $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                            if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                // 给当前选中的图片绑定id
                                                $(ele).find('.add-image-img').attr('picId', data.staticId);
                                                $(ele).find('.add-image-img').attr('picStatus', '1');
                                            }
                                        })
                                        $('#usearchImg').data('staticId', data.staticId);
                                        sxCount += sxCount;
                                        refreshSearchStaticData($data, container, isMerge, data.staticId, item, sxCount);
                                    } else {
                                        warningTip.say(data.message);
                                        $('#usearchImg').find('.add-image-item').each(function (index, ele) { // 防止接口响应慢时，赋值错误 
                                            if ($(ele).find('.add-image-img').attr('picId') == staticId) {
                                                $(ele).find('.add-image-img').attr('picStatus', '0');
                                            }
                                        })
                                    }
                                };
                            loadData(picIdPort, false, picIdPortData, picIdSuccessFunc);
                        }

                        if (sxCount > 3) {
                            warningTip.say('图片已失效，请重新上传图片');
                        }
                    } else if (data.code === '500') {
                        loadEmpty($('#staticContentContainer').find(idName + ' .image-new-list'), '算法获取异常', "", true);
                        var item = $('#usearchImg').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#sf').data("cjData" + item)) {
                            var cjData = $('#sf').data("cjData" + item);
                        } else {
                            var cjData = $('#sf').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = 'error';
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#sf').data("cjData" + item, cjData)
                    } else if (data.code === '613') {
                        loadEmpty($('#staticContentContainer').find(idName + ' .image-new-list'), '算法厂家升级中', "", true);
                        var item = $('#usearchImg').find('.add-image-item.active').find('img').attr('cache');
                        if ($('#sf').data("cjData" + item)) {
                            var cjData = $('#sf').data("cjData" + item);
                        } else {
                            var cjData = $('#sf').data("cjData");
                        }
                        cjData.forEach((val, index) => {
                            if (val.platformId == cjId) {
                                val.dataState = '613';
                            }
                        });
                        // 有算法产家获取异常 赋新值 由于有缓存 不同照片存储区分开 比中使用
                        $('#sf').data("cjData" + item, cjData)
                    } else {
                        loadEmpty($('#staticContentContainer').find(idName + ' .image-new-list'));
                        warningTip.say(data.message);
                    }
                }
            };
        loadData(port1, true, data1, successFunc1, '', 'POST', sourceType == 'ga' ? serviceUrlOther : '');
    }

    //切换厂家
    $("#staticContentContainer").on("click", ".factoryData .nav-item .nav-link", function () {
        var idName = $(this).attr("href"),
            cjId = $(this).attr("cjid"),
            $data = $('#usearchImg').find('.add-image-item').filter('.active').find('.add-image-img').data();
        $("#staticSearchResult").find(`${idName} .image-new-list .image-new-wrap`).eq(0).click();
        if ($data.isAll != 1) {
            if (!cjId) {
                // loadEmpty($('#staticContentContainer').find(idName + ' .image-new-list'), '融合结果请重新检索查看');
                // return;
                // 展示融合缓存的数据
                var item = $('#usearchImg').find('.add-image-item.active').find('img').attr('cache');
                var rongheLength = $('#fuseData' + item).find('.image-new-wrap').length;
                if (!rongheLength) {
                    var ronghe = $('#fuseData' + item).data('listData');
                    var container = $('#staticContentContainer');
                    var rh_html = '';
                    rh_html = createStaticImgItem(ronghe, rh_html, true); // 构造融合算法图片
                    container.find(`#fuseData${item} .image-new-list`).html(rh_html); // 融合搜索的图片内容
                    bindDataToImgItem(container, `#fuseData${item} .image-new-list`, ronghe); // 将融合图片 绑上身份证数据 用以后面二次检索使用
                    bindStaticRongheData(container, ronghe, item); // 融合结果数据挂载
                    $('#staticContentContainer').find(idName).siblings().find('.image-new-list').html('');
                }
            } else {
                tabCjCommon(idName, cjId, $data);
            }
        } else {
            return;
        }
    })
})(window, window.jQuery)