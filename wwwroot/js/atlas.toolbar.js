$(function () {

    let signInPopUp = $(".atlas-signin-popup").dxPopup({
        showCloseButton: true,
        width: '30%',
        height: '39%',
        title: 'ورود',
        toolbarItems: [
            {
                widget: 'dxButton',
                toolbar: 'bottom',
                location: 'after',
                options: {
                    text: 'انصراف',
                    onClick: function () {
                    }
                },
            },
            {
                widget: 'dxButton',
                toolbar: 'bottom',
                location: 'after',
                options: {
                    text: 'ورود',
                    onClick: function (e) {
                        e.component.option('disabled', true);

                        makePostCall("/Account/SignIn/", {
                            userName: localStorage.getItem('UserName'),
                            passWord: localStorage.getItem('Password')
                        }, (e) => {
                            e.component.option('disabled', false);
                            signInPopUp.hide();
                        }, () => {
                            e.component.option('disabled', false);
                        })
                    }
                },
            }
        ],
        contentTemplate: (contentElement) => {
            return $("<div/>").dxForm(
                {
                    items: [{
                        label: {
                            text: 'نام کاربری'
                        },
                        editorType: 'dxTextBox',
                        editorOptions: {
                            onValueChanged: function (e) {
                                localStorage.setItem("UserName", e.value);
                            }
                        }
                    },
                        {
                            label: {
                                text: 'رمز عبور'
                            },
                            editorType: 'dxTextBox',
                            editorOptions: {
                                onValueChanged: function (e) {
                                    localStorage.setItem("Password", e.value);
                                }
                            }
                        },

                    ],
                })
        }
    }).dxPopup('instance');

    $(".atlas-toolbar").dxToolbar({
        items: [{
            widget: 'dxMenu',
            location: 'before',
            options:
                {
                    items: [
                        {
                            text: 'اطلس',
                            onClick() {
                                document.location.href = "/"
                            }
                        },
                        {
                            text: 'مدیریت',
                            icon: 'spindown',
                            items: [
                                {
                                    text: 'محصولات',
                                    onClick: () => {
                                        document.location.href = "/Products/Index"
                                    }
                                },
                                {
                                    text: 'محققین',
                                    onClick: () => {
                                        document.location.href = "/Researchers/Index"
                                    }

                                },
                                {
                                    text: 'موسسات',
                                    onClick: () => {
                                        document.location.href = "/Institutes/Index"
                                    }
                                },
                                {
                                    text: 'شرکت ها',
                                    onClick: () => {
                                        document.location.href = "/Companies/Index"
                                    }
                                },
                                {
                                    text: 'کاربران',
                                    onClick: () => {
                                        document.location.href = "/Users/Index"
                                    }
                                },
                                {
                                    text: 'زیر ساخت',
                                    items: [
                                        {
                                            text: 'استان',
                                            onClick: () => {
                                                document.location.href = "/Provinces/Index"
                                            }
                                        },
                                        {
                                            text: 'حوزه همکاری',
                                            onClick: () => {
                                                document.location.href = "/Domains/Index"
                                            }
                                        },
                                        {
                                            text: 'نوع قرار داد',
                                            onClick: () => {
                                                document.location.href = "/ContractTypes/Index"
                                            }
                                        }
                                    ]
                                }
                            ]
                        },
                        {
                            text: 'درباره ما',
                        }
                    ],
                    width: "100%",
                    cssClass: 'atlas-menu-content'
                }
        },
            {
                widget: 'dxButton',
                location: 'before',
                options: {
                    icon: 'login',
                    text: 'ورود',
                    onClick: () => {
                        signInPopUp.show();
                    }
                }
            },
            {
                widget: 'dxSwitch',
                location: "after",
                options: {
                    value: false,
                }
            },
        ]
    });

})