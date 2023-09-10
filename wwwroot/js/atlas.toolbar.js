$(function () {

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

                                },
                                {
                                    text: 'محققین',

                                },
                                {
                                    text: 'موسسات',

                                },
                                {
                                    text: 'شرکت ها',
                                },
                                {
                                    text: 'کاربران',
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
                            text: 'راهنما'
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