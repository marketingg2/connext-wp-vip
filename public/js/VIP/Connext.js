var ConnextLogger = function ($) {

    var isDebugging = false;

    var collectionLogs = [];

    function getSessionLogs(n) {
        var responseArr = [];
            rest = ((collectionLogs.length - n) <= 0) ? 0 : collectionLogs.length - n;

            responseArr.push(getMetaInfo());

        if (arguments.length === 0) {
            collectionLogs.unshift(getMetaInfo());
            return collectionLogs;
        } else {
            for (var i = rest; i < collectionLogs.length; i += 1) {
                responseArr.push(collectionLogs[i]);
            }
        }
        return responseArr;
    }

    function getMetaInfo() {
        var userMeta = CnnXt.Utils.GetUserMeta();
        var optionsInfo = Connext.GetOptions();
        var objOptions = {};

        for (var key in optionsInfo) {
            if (typeof optionsInfo[key] !== 'object' && typeof optionsInfo[key] !== 'function' && !Array.isArray(optionsInfo[key])) {
                objOptions[key] = optionsInfo[key];
            }
        }
        return 'USER META:' + JSON.stringify(userMeta) + ' || OPTIONS: ' + JSON.stringify(objOptions);

    }

    function log() {
        try {
            var args = Array.prototype.slice.call(arguments[2]);
            var logType = arguments[0];

            var strPreface = arguments[1];
            var argsLen = args.length;

            var arrStrs = [];
            var arrObjs = [];
            if (argsLen > 0) {
                $.each(args, function (k, v) {
                    if (typeof v === "string") {
                        arrStrs.push(v);
                    } else {
                        arrObjs.push(v);
                    }
                });
            }
            var strOutput = strPreface + arrStrs.join(" => ");

            if (arrObjs.length > 0) {
                console[logType](strOutput, arrObjs);
            } else {
                console[logType](strOutput);
            }

        } catch (e) {

        }
    }

    function logCollect() {
        try {
            var args = Array.prototype.slice.call(arguments[1]),
                strPreface = arguments[0],
                argsLen = args.length,

                arrStrs = [],
                arrObjs = [],
                currentTime = new Date().getHours() + ':' + new Date().getMinutes() + ':' + new Date().getSeconds() + '.' + new Date().getMilliseconds(),
                strOutput;

            if (argsLen > 0) {
                $.each(args, function (k, v) {
                    if (typeof v === 'string') {
                        arrStrs.push(v);
                    } else if(Array.isArray(v)) {
                            arrObjs.push('Array(' + v.length + ')');
                    } else if (typeof v === 'object') {
                        var rootProp = {};
                        for (var key in v) {
                            if (typeof v[key] !== 'object' && !Array.isArray(v)) {
                                rootProp[key] = v[key];
                            }
                        }
                        arrObjs.push(rootProp)
                    } else {
                        arrObjs.push(v)
                    }
                });
            }

            strOutput = strPreface + arrStrs.join(' => ');

            if (arrObjs.length > 0) {
                collectionLogs.push(currentTime + ' || ' + strOutput + ', ' + JSON.stringify(arrObjs));
            } else {
                collectionLogs.push(currentTime + ' || ' + strOutput);
            }

        } catch (e) {

        }
    }

    return {
        debug: function () {
            if (isDebugging) {
                log("log", "ConneXt >>>> DEBUG <<<<< ", arguments);
            }
            logCollect("ConneXt >>>> DEBUG <<<<< ", arguments)
        },
        warn: function () {
            log("warn", "ConneXt >>>> WARNING <<<<< ", arguments);
            logCollect("ConneXt >>>> WARNING <<<<< ", arguments);
        },
        exception: function () {
            if (isDebugging) {
                log("error", "ConneXt >>>> EXCEPTION <<<<< ", arguments);
            }
            logCollect("ConneXt >>>> EXCEPTION <<<<< ", arguments);
        },
        setDebug: function (_isDebugging) {
                isDebugging = _isDebugging;
        },
        startTracing: function () {
            $.jStorage.set('cxt_trcng', { isDebugging: true });
            this.setDebug(true);
        },
        stopTracing: function () {
            $.jStorage.set('cxt_trcng', { isDebugging: false });
            this.setDebug(false);
        },
        getSessionLogs: getSessionLogs
    };
}

var ConnextCommon = function () {
    return {
        S3RootUrl: {
            localhost: "https://mg2assetsdev.blob.core.windows.net/connext/dev/",
            dev: "https://mg2assetsdev.blob.core.windows.net/connext/dev/",
            test: "https://mg2assetsdev.blob.core.windows.net/connext/test/",
            demo: "https://prodmg2.blob.core.windows.net/connext/demo/",
            stage: "https://prodmg2.blob.core.windows.net/connext/stage/",
            test20: "https://prodmg2.blob.core.windows.net/connext/test20/",
            prod: "https://prodmg2.blob.core.windows.net/connext/prod/",
            preprod: "https://prodmg2.blob.core.windows.net/connext/preprod/"
           
        },
        S3LastPublishDatePath: "data/last_publish/<%- siteCode %>.json",
        CSSPluginUrl: {
            localhost: "//localhost:20001/plugin/assets/css/themes/",
            dev: "https://mg2assetsdev.blob.core.windows.net/connext/dev/1.13/themes/",
            test: "https://mg2assetsdev.blob.core.windows.net/connext/test/1.13/themes/",
            stage: "https://prodmg2.blob.core.windows.net/connext/stage/1.13/themes/",
            demo: "https://prodmg2.blob.core.windows.net/connext/demo/1.13/themes/",
            test20: 'https://prodmg2.blob.core.windows.net/connext/test20/1.13/themes/',
            prod: "https://cdn.mg2connext.com/prod/1.6/themes/",
            preprod: "https://cdn.mg2connext.com/preprod/1.6/themes/"
        },
        APIUrl: {
            localhost: "https://dev-connext-api.azurewebsites.net/",
            dev: "https://dev-connext-api.azurewebsites.net/",
            test: "https://test-connext-api.azurewebsites.net/",
            stage: 'https://stage-mg2-proxy-connext.azurewebsites.net/',
            test20: 'https://test20-connext-api.azurewebsites.net/',
            demo: 'https://demo-connext-api.azurewebsites.net/',
            preprod: 'https://preprod-connext-api.azurewebsites.net/',
            prod: '{{apiUrl}}'
        },
        APPInsightKeys: {
            localhost: "a57959cf-5e4d-4ab3-8a3e-d17f7e2a8bf8",
            dev: "a57959cf-5e4d-4ab3-8a3e-d17f7e2a8bf8",
            test: "c35138a3-3d28-4543-9a47-b693ce4d744e",
            stage: "17780e8e-a865-44bd-a20d-4f50f5f38ddb",
            test20: "adbc9fed-bb63-4105-8904-61ade12b2006",
            preprod: "34e4d18d-cb50-44e5-88bc-f26520e5d4c3",
            demo: "e336d95f-e0ab-48a9-956e-1d79f6fd5fe8",
            prod: "1819964f-57a2-45c2-b878-c270d7e5d1d9"
        },
        Environments: ['localhost', 'dev', 'test', 'stage', 'demo', 'prod', 'test20'],
        IPInfo: window.location.protocol + '//api-mg2.db-ip.com/v2/p14891b727f063924f0d86d8a8e5063678abd2ac/self',
        StorageKeys: {
            configuration: "Connext_Configuration",
            userToken: "Connext_UserToken",
            janrainUserProfile: "janrainCaptureProfileData",
            accessToken: "Connext_AccessToken",
            viewedArticles: "Connext_ViewedArticles",
            lastPublishDate: "Connext_LastPublishDate",
            conversations: {
                current: "Connext_CurrentConversations",
                previous:
                "Connext_PreviousConversations"
            },
            user: {
                state: "Connext_UserState",
                zipCodes: "Connext_UserZipCodes",
                data: "Connext_userData"

            },
            configurationSiteCode: 'Connext_Configuration_SiteCode',
            configurationConfigCode: 'Connext_Configuration_ConfigCode',
            configurationIsCustom: 'Connext_Configuration_isCustom',
            customZip: 'CustomZip',
            repeatablesInConv: 'repeatablesInConv',
            igmRegID: 'igmRegID',
            igmContent: 'igmContent',
            igmAuth: 'igmAuth',
            connext_user_Id: 'connext_anonymousUserId',
            WhitelistSet: "WhitelistSet",
            WhitelistInfobox: "WhitelistInfobox",
            NeedHidePinTemplate: "NeedHidePinTemplate",
            PinAttempts: "PinAttempts",
            connext_user_profile: "connext_user_profile",
            connext_user_data: "connext_user_data",
            connext_paywallFired: "connext_paywallFired",
            connext_auth_type: 'connext_auth_type',
            connext_viewstructure: 'nxt',
            connext_userLastUpdateDate: 'connext_userLastUpdateDate',
            connext_updateArticleCount: 'nxt_upd_ac',
            connext_domain: 'nxt_dmn',
            connext_root_domain: 'nxt_rt_dmn',
            connext_check_domain_write: 'nxt_ckck_dmn_wrt',
            device_postfix: '_device',
            connext_time_repeatable_actions: 'nxtact',
        },
        MeteredArticleCountObj: {
            active_convo_id: "_acnv",
        },

        ConvoArticleCountObj: {
            article_count: "ac",
            device_article_count: "ac_d",
            start_date: "s"
        },

        TimeRepeatableActionsCS: {
            repeat_after: 'rpt',
            count: 'rtpc'
        },

        MeterLevels: {
            1: "Free",
            2: "Metered",
            3: "Premium"
        },
        ConversationOptionNamesMap: {
            Expiration: {
                2: "Time",
                6: "Register",
                11: "CustomAction",
                27: "UserState",
                32: "JSVar",
                57: "FlittzStatus"
            },
            Activation: {
                38: "Activate"
            },
            Filter: {
                1: 'Geo',
                2: 'Javascript',
                3: 'DeviceType',
                4: 'UserState',
                5: 'AdBlock'
            }
        },
        FlittzStatusesMap: {
            "FlittzLoggedIn": "Logged In",
            "FlittzLoggedOut": "Logged Out"
        },
        ActionOptionMap: {
            Who: [5, 6, 14, 16, 17, 18, 19, 21, 23, 24, 25, 12, 27, 28, 29, 30, 31],
            What: [2, 7, 13, 20, 15, 22, 26],
            When: [8, 9, 10]
        },
        ConversationOptionMap: {
            Expiration: [2],
            Filter: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20],
            Activation: [4],
        },
        WhenClassMap: {
            8: "Time",
            9: "EOS",
            10: "Hover"
        },
        DefaultArticleFormat: "MMM Do, YYYY",
        QualifierMap: {
            "==": "==",
            "=": "==",
            "Equal": "==",
            "Equals": "==",
            "Not Equal": "!=",
            "Not Equals": "!=",
            "More Than": ">",
            "Less Than": "<",
            "More Or Equal Than": ">=",
            "Less Or Equal Than": "<=",
            "Yes": "true",
            "No": "false",
            "More Than Or Equals To": ">=",
            "Less Than Or Equals To": "<="
        },
        ERROR: {
            NO_CONFIG: {
                code: 600,
                message: "No Configuration Found. ",
                custom: true
            },
            NO_CONVO_FOUND: {
                code: 601,
                message: "No Conversation found to process. ",
                custom: true
            },
            NO_SITE_CODE: {
                code: 602,
                message: 'No Site Code. ',
                custom: true
            },
            NO_CONFIG_CODE: {
                code: 603,
                message: 'No Config Code. ',
                custom: true
            },
            NO_JQUERY: {
                code: 604,
                message: 'Jquery not loaded. ',
                custom: true
            },
            NO_METER_LEVEL_SET: {
                code: 605,
                message: 'No meter level set. ',
                custom: true
            },
            NO_CAMPAIGN: {
                code: 606,
                message: 'No campaign data. ',
                custom: true
            },
            NO_AUTH0_LOCK: {
                code: 607,
                message: 'No auth0Lock object in the authSettings! ',
                custom: true
            },
            UNKNOWN_REG_TYPE: {
                code: 608,
                message: 'Unknown registration type. ',
                custom: true
            },
            UNKNOWN_USER_STATE: {
                code: 609,
                message: 'Unknown user state. ',
                custom: true
            },
            NO_USER_DATA: {
                code: 610,
                message: 'No user data result. ',
                custom: true
            },
            NO_JANRAIN_DATA: {
                code: 611,
                message: 'No user data UUID. ',
                custom: true
            },
            CONFIG_HAS_NOT_PUBLISHED: {
                code: 612,
                message: 'Configuration has not published. ',
                custom: true
            },
            S3DATA_IS_INVALID: {
                code: 613,
                message: 's3Data is not an object. ',
                custom: true
            },
            HIDE_CONTENT: {
                code: 614,
                message: 'Cannot hide content! ',
                custom: true
            }

        },
        DownloadConfigReasons: {
            noLocalConfig: "localStorage config not found",
            noLocalPublishDate: "localStorage config found, no publishDate found",
            getPublishFailed: "localStorage config found, error getting server publishFile",
            parsePublishFailed: "localStorage config found, server publishFile downloaded, error parsing",
            noConfigCodeinPublish: "localStorage config found, server publishFile downloaded and parsed, configCode not found",
            oldConfig: "localStorage config found, server publishFile downloaded and parsed, configCode found, local config is old"
        },
        AppInsightEvents: {
            APICall: 'APICall',
            LoadConnext: "LoadConnext"
        },
        RegistrationTypes: {
            1: 'MG2',
            2: 'Janrain',
            3: 'GUP',
            4: 'Auth0',
            5: 'Custom'
        },
        AuthSystem: {
            MG2: 1,
            Janrain: 2,
            GUP: 3,
            Auth0: 4,
            Custom: 5
        },
        DigitalAccessLevels: {
            Premium: 'PREMIUM',
            Upgrade: 'UPGRADE',
            Purchase: 'PURCHASE'
        },
        USER_STATES: {
            NotLoggedIn: "Logged Out",
            LoggedIn: "Logged In",
            NoActiveSubscription: "No Active Subscription",
            SubscribedNotEntitled: "Subscribed Not Entitled",
            Subscribed: "Subscribed"
        },
        ValidationPatterns: {
            email: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
            atLeast1Letter1Number: /(?=.*[a-zA-Z])(?=.*[\d])/,
            atLeast1Letter: /(?=.*[a-zA-Z])/,
            atLeast1CapitalLetter: /(?=.*[a-zA-Z])/,
            atLeast1LowerCaseLetter: /(?=.*[a-z])/,
            atLeast1UpperCaseLetter: /(?=.*[A-Z])/,
            atLeast1SpecialCharacter: /(?=.*[!@#$%^&*])/,
            atLeast1Number: /(?=.*[\d])/
        },
        TimeTypeMap: {
            "s": "seconds",
            "m": "minutes",
            "h": "hours",
            "d": "days",
            "w": "weeks",
            "M": "months",
            "Y": "years"
        },
        DisplayName: 'ConneXt',
        InfinityDate: '9999-01-01',
        CookieExpireDate: '2018-02-28',
        CLOSE_CASES: {
            CloseButton: "closeButton",
            CloseSpan: "closeSpan",
            ClickOutside: "clickOutside",
            EscButton: "escButton"
        }
    }
};

var ConnextEvents = function ($) {
    var NAME = "Events";
    const exludedEvents = ["onDynamicMeterFound", "onCampaignFound", "onHasAccess", "onHasAccessNotEntitled", "onHasNoActiveSubscription", "onAuthorized","onDebugNote"];
    var OPTIONS;

    var LOGGER;
    var MG2ACCOUNTDATA;
    var MeterLevel = null, MeterLevelMethod = null;

    var AUTHSYSTEM;
    var DEFAULT_FUNCTIONS = {
        "onMeterLevelSet": onMeterLevelSet,
        "onDynamicMeterFound": onDynamicMeterFound,
        "onCampaignFound": onCampaignFound,
        "onConversationDetermined": onConversationDetermined,
        "onHasAccess": onHasAccess,
        "onHasAccessNotEntitled": onHasAccessNotEntitled,
        "onHasNoActiveSubscription": onHasNoActiveSubscription,
        "onCriticalError": onCriticalError,
        "onAuthorized": onAuthorized,
        "onLoggedIn": onLoggedIn,
        "onNotAuthorized": onNotAuthorized,
        "onDebugNote": onDebugNote,
        "onActionShown": onActionShown,
        "onActionClosed": onActionClosed,
        "onInit": onInit,
        "onButtonClick": onButtonClick,
        "onRun": onRun,
        "onFinish": onFinish,
        "onLoginShown": onLoginShown,
        "onLoginClosed": onLoginClosed,
        "onLoginSuccess": onLoginSuccess,
        "onLoginError": onLoginError,
        "onAccessTemplateShown": onAccessTemplateShown,
        "onAccessTemplateClosed": onAccessTemplateClosed,
        "onAccessGranted": onAccessGranted,
        "onAccessDenied": onAccessDenied,
        "onFlittzPaywallShown": onFlittzPaywallShown,
        "onFlittzPaywallClosed": onFlittzPaywallClosed,
        "onFlittzButtonClick": onFlittzButtonClick,
        "onActivationFormShown": onActivationFormShown,
        "onActivationLoginStepShown": onActivationLoginStepShown,
        "onActivationLoginStepClosed": onActivationLoginStepClosed, 
        "onActivationLinkStepShown": onActivationLinkStepShown,
        "onActivationLinkStepClosed": onActivationLinkStepClosed,
        "onActivationLinkStepSubmitted": onActivationLinkStepSubmitted,
        "onActivationLinkSuccessStepShown": onActivationLinkSuccessStepShown,
        "onActivationLinkSuccessStepClosed": onActivationLinkSuccessStepClosed,
        "onActivationLinkErrorStepShown": onActivationLinkErrorStepShown,
        "onActivationLinkErrorStepClosed": onActivationLinkErrorStepClosed,
        "onActivationFormClosed": onActivationFormClosed,
        "onNewsdayButtonClick": onNewsdayButtonClick
    };

    var NOTES = [];

    function onDebugNote(note) {
        if (CnnXt.GetOptions().debug) {
            NOTES.push(note);
            $("#ddNote").text(note);
        }
    }

    function onInit(event) {
        LOGGER.debug("Fire Default onInit function.", event);
    }

    function onFlittzPaywallShown(event) {
        event.EventData.conversation = CnnXt.Storage.GetCurrentConversation();
        event.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
        event.EventData.hasFlittz = OPTIONS.integrateFlittz;

        window.CommonFz.PushData("Connext-onFlittzPaywallShown", event);

        LOGGER.debug("Flittz paywall shown", event);
    }

    function onFlittzPaywallClosed(event) {
        event.EventData.conversation = CnnXt.Storage.GetCurrentConversation();
        event.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
        event.EventData.hasFlittz = OPTIONS.integrateFlittz;

        window.CommonFz.PushData("Connext-onFlittzPaywallClosed", event);

        LOGGER.debug("Flittz paywall closed", event);
    }

    function onFlittzButtonClick(event) {
        event.EventData.conversation = CnnXt.Storage.GetCurrentConversation();
        event.EventData.viewCount = CnnXt.Campaign.GetCurrentConversationViewCount();
        event.EventData.hasFlittz = OPTIONS.integrateFlittz;

        window.CommonFz.PushData("Connext-onFlittzButtonClick", event);

        LOGGER.debug("Click on Flittz button", event);
    }

    function onCriticalError(event) {
        if (CnnXt.GetOptions().debug) {
            LOGGER.debug('Fire Default onCriticalError function.', event);
            NOTES.push(event.EventData.message);
            $('#ddNote').text(event.EventData.message);
        }
    }

    function onDynamicMeterFound(event) {
        LOGGER.debug("Fire Default onDynamicMeterFound function.", event);

        if (CnnXt.GetOptions().debug) {
            $("#ddMeterSet").text(event.EventData);
        }
    }

    function onMeterLevelSet(event) {
        if (CnnXt.GetOptions().debug) {
            $('#ddMeterLevel').text(CnnXt.Common.MeterLevels[event.EventData.level] + ' (' + event.EventData.method + ')');
        }

        LOGGER.debug('Fire Default onMeterLevelSet function.', event);

        CnnXt.Storage.SetMeter(event.EventData);
    }

    function onLoggedIn(event) {
        LOGGER.debug('Fire Default onLoggedIn function.', event);

        //onDebugNote(event);
    }

    function onHasAccess(event) {
        LOGGER.debug('Fire Default onHasAccess function.', event);

        onDebugNote("onHasAccess");
    }

    function onHasAccessNotEntitled(event) {
        LOGGER.debug('Fire Default onHasAccessNotEntitled function.', event);

        onDebugNote("onHasAccessNotEntitled");
    }

    function onHasNoActiveSubscription(event) {
        LOGGER.debug('Fire Default onHasNoActiveSubscription function.', event);

        onDebugNote("onHasNoActiveSubscription");
    }

    function onAuthorized(event) {
        LOGGER.debug('Fire Default onAuthorized function.', event);

        onDebugNote("onAuthorized");
    }

    function onNotAuthorized(event) {
        LOGGER.debug('Fire Default onNotAuthorized function.', event);

        onDebugNote("onNotAuthorized");
    }

    function onCampaignFound(event) {
        if (CnnXt.GetOptions().debug) {
            $('#ddCampaign').text(event.EventData.Name);
        }

        LOGGER.debug('Fire Default onCampaignFound function.', event);
    }

    function onConversationDetermined(event) {


        LOGGER.debug('Fire Default onConversationDetermined function.', event);
    }

    function onActionShown(event) {
        LOGGER.debug("Fire Default onActionShown", event);

        if (event && event.EventData && event.EventData.actionDom && $(event.EventData.actionDom).hasClass("flittz") && OPTIONS.integrateFlittz) {
            CnnXt.Event.fire("onFlittzPaywallShown", event.EventData);
        }
        if (event && event.ActionTypeId == 3) {
            CnnXt.Storage.SetConnextPaywallCookie(true);
        }

        CnnXt.Action.actionStartTime = Date.now();
    }

    function onActionClosed(event) {
        if (CnnXt.GetOptions().debug) {
            CnnXt.Action.actionEndTime = Date.now();
            var difference = CnnXt.Action.actionEndTime - CnnXt.Action.actionStartTime;
            $("#ddViewTime")[0].textContent = difference + 'ms';
        }

        LOGGER.debug('Fire Default onActionClosed', event);
    }

    function onButtonClick(event) {
        LOGGER.debug("Fire Default onButtonClick", event);
    }

    function onLoginShown(event) {
        LOGGER.debug("Fire Default onLoginShown", event);
    }

    function onLoginClosed(event) {
        LOGGER.debug("Fire Default onLoginClosed", event);
    }

    function onLoginSuccess(event) {
        LOGGER.debug("Fire Default onLoginSuccess", event);
    }

    function onLoginError(event) {
        LOGGER.debug("Fire Default onLoginError", event);
    }

    function onAccessTemplateShown(event) {
        LOGGER.debug("Fire Default onAccessTemplateShown", event);
    }

    function onAccessTemplateClosed(event) {
        LOGGER.debug("Fire Default onAccessTemplateClosed", event);
    }

    function onAccessGranted(event) {
        LOGGER.debug("Fire Default onAccessGranted", event);
    }

    function onAccessDenied(event) {
        LOGGER.debug("Fire Default onAccessDenied", event);
    }

    function onActivationFormShown(event) {
        LOGGER.debug("Fire Default onActivationFormShown", event);
    }

    function onActivationLoginStepShown(event) {
        LOGGER.debug("Fire Default onActivationLoginStepShown", event);
    }

    function onActivationLoginStepClosed(event) {
        LOGGER.debug("Fire Default onActivationLoginStepClosed", event);
    }

    function onActivationLinkStepShown(event) {
        LOGGER.debug("Fire Default onActivationLinkStepShown", event);
    }

    function onActivationLinkStepClosed(event) {
        LOGGER.debug("Fire Default onActivationLinkStepClosed", event);
    } 

    function onActivationLinkStepSubmitted(event) {
        LOGGER.debug("Fire Default onActivationLinkStepSubmitted", event);
    }

    function onActivationLinkSuccessStepShown(event) {
        LOGGER.debug("Fire Default onActivationLinkSuccessStepShown", event);
    }

    function onActivationLinkSuccessStepClosed(event) {
        LOGGER.debug("Fire Default onActivationLinkSuccessStepClosed", event);
    }

    function onActivationLinkErrorStepShown(event) {
        LOGGER.debug("Fire Default onActivationLinkErrorStepShown", event);
    }

    function onActivationLinkErrorStepClosed(event) {
        LOGGER.debug("Fire Default onActivationLinkErrorStepClosed", event);
    }

    function onActivationFormClosed(event) {
        LOGGER.debug("Fire Default onActivationFormClosed", event);
    }
    function onRun() {
        LOGGER.debug("Fire Default onRun");
    }

    function onFinish() {
        if (CnnXt.GetOptions().debug) {
            var views = CnnXt.Storage.GetCurrentConversationViewCount();
            $('#ddCurrentConversationArticleViews').text(views);
        }
        LOGGER.debug("Fire Default onFinish");
    }

    function onNewsdayButtonClick() {
        LOGGER.debug("Fire Default onNewsdayButtonClick");

        if (window.setDestUrl && __.isFunction(window.setDestUrl)) {
            window.setDestUrl();
        }
    }


    return {
        init: function (options) {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Initializing Events Module...");
            OPTIONS = (options) ? options : { debug: true };
        },
        fire: function (event, data) {
            var fnName = "fire";

            try {
                var eventResult = {
                    EventData: data
                };
                if (event == "onMeterLevelSet") {
                    MeterLevel = data.level;
                    MeterLevelMethod = data.method;
                }

                var registrationTypeId = null;
                var AUTHSYSTEM = null;
                if (CnnXt.Storage && CnnXt.Storage.GetLocalConfiguration()) {
                    registrationTypeId = CnnXt.Storage.GetLocalConfiguration().Site.RegistrationTypeId;
                    AUTHSYSTEM = CnnXt.Common.RegistrationTypes[registrationTypeId];
                }
               
                if (event == 'onLoggedIn') {
                    AUTHSYSTEM = data.AuthSystem ? data.AuthSystem : '';
                    MG2ACCOUNTDATA = data.MG2AccountData ? data.MG2AccountData : '';
                }

                eventResult.AuthSystem = AUTHSYSTEM;
                eventResult.AuthProfile = CnnXt.Storage.GetUserProfile();
                eventResult.MG2AccountData = MG2ACCOUNTDATA;

                var action;

                var currentConversation = CnnXt.Storage.GetCurrentConversation();

                if (currentConversation) {
                    if (data && (data.actionId || data.id)) {
                        action = (data.actionId) ? __.findWhere(currentConversation.Actions, { id: data.actionId })
                                               : __.findWhere(currentConversation.Actions, { id: data.id });
                    }
                    eventResult.Config = CnnXt.Storage.GetLocalConfiguration();
                    eventResult.Action = action;
                    eventResult.Conversation = currentConversation;
                    eventResult.CampaignName = (eventResult.Config) ? eventResult.Config.Campaign.Name : '';
                    eventResult.CampaignId = currentConversation.CampaignId;
                    eventResult.MeterLevel = CnnXt.Common.MeterLevels[MeterLevel];
                    eventResult.MeterLevelId = MeterLevel;
                    eventResult.MeterLevelMethod = MeterLevelMethod;
                }

                if (__.isObject(eventResult.EventData)) {
                    if (event == 'onActionShown' || event == 'onActionClosed') {
                        eventResult.EventData.ArticlesLeft = currentConversation.Props.ArticleLeft;
                        eventResult.EventData.ArticlesViewed = currentConversation.Props.views;
                        eventResult.EventData.ZipCodes = CnnXt.Storage.GetActualZipCodes();
                    }
                    if (event == 'onButtonClick') {
                        var bttnhtml = eventResult.EventData.target ? eventResult.EventData.target.outerHTML : null;
                        var attr = eventResult.EventData.target ? $(eventResult.EventData.target).attr('data-connext-userdefined') : null;
                        eventResult.EventData = {
                            DOMEvent: eventResult.EventData,
                            ButtonHTML:bttnhtml,
                            UserDefinedDataAttr: attr,
                            ZipCodes: CnnXt.Storage.GetActualZipCodes(),
                            ArticlesLeft: (currentConversation) ? currentConversation.Props.ArticleLeft : undefined,
                            ArticlesViewed: (currentConversation) ? currentConversation.Props.views : undefined
                        }
                    }

                    if (data && data.What) {
                        eventResult.EventData.UserDefinedData = (data.What.UserDefinedData) ? data.What.UserDefinedData : null;
                    }
                }

                eventResult.Config = CnnXt.Storage.GetLocalConfiguration();

                if (__.isFunction(DEFAULT_FUNCTIONS[event])) {
                    DEFAULT_FUNCTIONS[event](eventResult);

                    try {
                        if (__.isFunction(OPTIONS[event])) {
                            OPTIONS[event](eventResult);
                        }
                    } catch (ex) {
                        LOGGER.exception(NAME, fnName, 'USER CALLBACK FUNCTION', ex);
                    }
                    var customEvent = new CustomEvent(event, { detail: eventResult });
                    document.dispatchEvent(customEvent);

                    if(exludedEvents.indexOf(event) === -1)
                    {
                        CnnXt.AppInsights.trackEvent(event, eventResult);
                    }

                } else {
                    LOGGER.debug(NAME, fnName, event, 'Event function does not exist');
                }

            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

};

var ConnextUtils = function ($) {

    //region GLOBALS
    var NAME = "Utils"; //base name for logging.

    //create local reference to logger
    var LOGGER;
    var curSite;
    var userMeta = {};
    var device;
    var IP;
    var PROMISES = [];
    //endregion GLOBALS

    //region FUNCTIONS

    var processConfiguration = function (data) {
        var fnName = "processConfiguration";

        try {
            LOGGER.debug(NAME, fnName, "Starting to process configuration...", data);

            curSite = data.Site;
            //create parent config object we will populate.
            var configuration = {};
            var whitelistSets = [];

            //create settings property with only relevant  keys
            configuration["Settings"] = __.pick(data,
                "AccessRules", "Active", "Code", "DefaultMeterLevel",
                "CampaignId", "DynamicMeterId", "Name", "LastPublishDate",
                "Settings", "UseParentDomain", "ActivationTemplate", "DefaultProduct",
                "ReturnUrl", "UseActivationFlow");

            if (data.DynamicMeter) {
                data.DynamicMeter.Rules = __.sortBy(data.DynamicMeter.Rules, function (obj) {
                    return obj.Priority;
                });

                configuration["DynamicMeter"] = processDynamicMeter(data.DynamicMeter);
            }

            //check if we have a LastPublishDate;
            if (configuration.Settings) {
                configuration.Settings = checkForLastPublishDate(configuration.Settings);
                configuration.Settings["LoginModal"] = data.Template ? data.Template.Html : "";
                configuration.Settings["LoginModalName"] = data.Template ? data.Template.Name : "";
                configuration.Settings["LoginModalId"] = data.Template ? data.Template.id : null;
            }
            //set 'Site' specific settings, no need to process, just assign entire Site object.
            configuration["Site"] = data.Site;

            if (data.Campaign) {
                //process the campaign data (group/organize all conversations and conversation actions).
                configuration["Campaign"] = processCampaignData(data.Campaign);
            } else {
                configuration["Campaign"] = {};
            }

            if (data["Configuration_WhitelistSets"]) {
                data["Configuration_WhitelistSets"].forEach(function (value, index) {
                    whitelistSets.push(value.WhitelistSet);
                });
            }

            configuration["WhitelistSets"] = whitelistSets;

            LOGGER.debug(NAME, fnName, "done processing configuration", configuration);

            return configuration;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var checkForLastPublishDate = function (configurationSettings) {
        /// <summary>This checks if we have a LastPublishDate setting. This should always be set (when a new configuration is saved in the Admin this should be populated with the current datetime), but just in case we check it here. If it is null, we set this to today's date. We do this because this field is required when we check if a configuration is old.</summary>
        /// <param name="configurationSettings" type="Object">configuration.Settings object</param>
        /// <returns type="Object">Returns modified or same configuration.Settings</returns>
        var fnName = "checkForLastPublishDate";

        LOGGER.debug(NAME, fnName, configurationSettings);

        try {
            if (!configurationSettings.LastPublishDate) {
                LOGGER.debug(NAME, fnName, "Configuration.Settings.LastPublishDate is null...setting it to todays datetime.");
                configurationSettings.LastPublishDate = new Date().format();
            }

            return configurationSettings;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return configurationSettings; //even if error, return original configurationSettings no matter what.
        }
    };

    var processCampaignData = function (campaign) {
        /// <summary>Takes the Campaign property from a Configuration and processes it.  This will group coversations by MeterLevel, process Action array and add/set any Conversation properties that are determined here.</summary>
        /// <param name="campaign" type="Object">Campaign object</param>
        /// <returns type="Object">Processed Campaign object</returns>
        var fnName = "processCampaignData";

        try {
            //for now, at the Campaign level we are only picking the Name and id keys to return
            var processedCampaign = __.pick(campaign, "id", "Name", "Conversations");

            processedCampaign.Conversations = processConversationData(processedCampaign.Conversations);

            LOGGER.debug(NAME, fnName, "processedCampaign", processedCampaign);

            return processedCampaign;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    //TODO: this should get moved into the API, for time constraints just doing it here in js since its quicker.
    var processConversationData = function (conversations) {
        /// <summary>Takes the conversation object from Configuration.Campaign.Conversations and processes it.  This will group coversations by MeterLevel, process Action array and add/set any Conversation properties that are determined here.</summary>
        /// <param name="conversations" type="Object">Conversation object</param>
        /// <returns type="Object">Processed Conversation object</returns>
        var fnName = "processConversationData";

        try {
            LOGGER.debug(NAME, fnName, "conversations", conversations);

            //create new conversation object we will populate.
            var defaultConversationProps = {
                //views: 0, //current number of views
                paywallLimit: null, //paywall limit (set when we process this conversation actions)
                isExpired: false, //flags this conversation as expired so on next article view we know we need to move this user into another conversation (set below).
                expiredReason: null, //this will be set with the reason this conversation expired (Time, CustomActionName, Registration etc...).
                ////nextConversationId: null, //holds the nextConversation the user should be moved to.  This is populated on page load if it is a Time based expiration or on a 'Custom' action. If it is a custom action we will use this id on next article view.
                Date: { //holds date related info
                    started: null,
                    ended: null,
                    expiration: null //this will be set when the user first enters this conversation. It uses the expiration settings and adds the appropriate amount of time from the current date.
                }
            };

            //loop through conversations and process the conversation options by grouping and renaming properties.

            $.each(conversations, function (conversationKey, conversation) {
                conversation.Options = processConversationOptions(conversation.Options);

                conversation.Props = defaultConversationProps;

                conversation.Actions = processConversationActions(conversation.Actions);
            });

            //group conversations by MeterLevelId
            var groupedConversationsByMeterLevel = __.groupBy(conversations, "MeterLevelId");

            //we grouped by 'MeterLevelId', replace these keys (which are integers) into their string equaliviants (from CnnXt.Common.MeterLevels).
            groupedConversationsByMeterLevel = __.replaceObjKeysByMap(groupedConversationsByMeterLevel, CnnXt.Common.MeterLevels);

            LOGGER.debug(NAME, fnName, "Grouped Conversations By Meter Level", groupedConversationsByMeterLevel);

            return groupedConversationsByMeterLevel;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var processConversationOptions = function (conversationOptions) {
        var fnName = 'processConversationOptions';

        LOGGER.debug(NAME, fnName, conversationOptions);

        var expirationOptions = __.filter(conversationOptions, function (option) {
            return __.contains(CnnXt.Common.ConversationOptionMap.Expiration, option.ConversationOption.ClassId);
        });

        var activationOptions = __.filter(conversationOptions, function (option) {
            return __.contains(CnnXt.Common.ConversationOptionMap.Activation, option.ConversationOption.ClassId);
        });

        var filterOptions = __.filter(conversationOptions, function (option) {
            return __.contains(CnnXt.Common.ConversationOptionMap.Filter, option.ConversationOption.ClassId);
        });

        return {
            Expirations: processExpirationOptions(expirationOptions),
            Activation: processActivationOptions(activationOptions),
            Filter: processFilterOptions(filterOptions),
        };
    }

    var processExpirationOptions = function (expirationOptions) {
        LOGGER.debug(NAME, 'processExpirationOptions', expirationOptions);
        return processOptionsForClass(expirationOptions, 'Expiration');
    }

    var processActivationOptions = function (activationOptions) {
        LOGGER.debug(NAME, 'processActivationOptions', activationOptions);
        return processOptionsForClass(activationOptions, 'Activation');
    }

    var processFilterOptions = function (filterOptions) {
        LOGGER.debug(NAME, 'processFilterOptions', filterOptions);
        return mapOptionsByClassesAndInstances(filterOptions, {
            Entity: 'ConversationOption',
            EntityParentId: 'ParentConversationOptionId',
            Entity_OptionClass: 'Conversation_OptionClass'
        });
    }

    var processOptionsForClass = function (options, optionsClass) {
        var fnName = 'processOptionsForClass';

        try {
            LOGGER.debug(NAME, fnName, arguments);

            var groupedOptions = __.groupBy(options, function (option) {
                return option.ConversationOption.ParentConversationOptionId;
            });

            var result = {};

            $.each(groupedOptions, function (optionsGroupKey, optionsGroup) {
                var mappedOption = {};

                $.each(optionsGroup, function (optionKey, option) {
                    mappedOption[option.ConversationOption.DisplayName] = option.Value;
                });

                result[CnnXt.Common.ConversationOptionNamesMap[optionsClass][optionsGroupKey]] = mappedOption;
            });

            LOGGER.debug(NAME, fnName, 'Processed options', result);

            return result;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return {};
        }
    }

    //TODO: this should get moved into the API, for time constraints just doing it here in js since its quicker.
    var processConversationActions = function (actions) {
        var fnName = "processConversationActions";

        LOGGER.debug(NAME, fnName, actions);

        try {
            //loop through actions to process action option values and group them into 'Who' 'What' and 'When' properties
            $.each(actions, function (key, val) {
                //val is an Action object    
                var exceptions = curSite.Client.Client_ActionOption_Exceptions;

                $.each(exceptions, function (key, value) {
                    val.ActionOptionValues = __.reject(val.ActionOptionValues, function (a) {
                        return a.ActionOptionId == value.ActionOptionId ||
                            a.ActionOption.ActionOptionParentId == value.ActionOptionId;
                    });
                });

                var whoOptions = __.filter(val.ActionOptionValues, function (obj) {
                    return __.contains(CnnXt.Common.ActionOptionMap.Who, obj.ActionOption.ClassId);
                });

                var whatOptions = __.filter(val.ActionOptionValues, function (obj) {
                    return __.contains(CnnXt.Common.ActionOptionMap.What, obj.ActionOption.ClassId);
                });

                var whenOptions = __.filter(val.ActionOptionValues, function (obj) {
                    return __.contains(CnnXt.Common.ActionOptionMap.When, obj.ActionOption.ClassId);
                });

                //process who actions and assign returned object to val.Who property
                val.Who = processWhoOptions(whoOptions);

                //process what actions and assign returned object to val.What property
                val.What = processWhatOptions(whatOptions);

                //process what actions and assign returned object to val.What property
                val.When = processWhenOptions(whenOptions);

                //we are done processing optionValues, so remove this key since the data is no longer needed.
                //referencing actions by key since val is a local object, we want to effect parent actions key since that is what is returned.
                actions[key] = __.omit(val, "ActionOptionValues");

            });

            LOGGER.debug(NAME, fnName, 'Processed actions', actions);

            //actions have been processed so sort them by 'Order' property.
            return __.sortBy(actions, "Order");

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhoOptions = function (options) {
        var fnName = "processWhoOptions";

        LOGGER.debug(NAME, fnName, options);

        try {
            var who = mapOptionsByClassesAndInstances(options, {
                Entity: 'ActionOption',
                EntityParentId: 'ActionOptionParentId',
                Entity_OptionClass: 'Action_OptionClass'
            });

            LOGGER.debug(NAME, fnName, "Processed who options", who);

            return who;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhatOptions = function (options) {
        var fnName = "processWhatOptions";

        LOGGER.debug(NAME, fnName, options);

        try {
            var what = {},
                userDeviceType = CnnXt.Utils.getDeviceType(),
                optionsGroupedByDeviceType = __.groupBy(options, 'CriteriaInstanceNumber'),
                optionsForDeviceType = {},
                commonOptions = [];

            if (!options || !options.length) {
                return what;
            }

            $.each(optionsGroupedByDeviceType, function (instance, deviceTypeOptions) {
                var deviceTypeOption;

                deviceTypeOptions.forEach(function (option) {
                    if (option.ActionOption.Name == 'TemplateDeviceSettings') {
                        deviceTypeOption = option;
                    }

                    if (instance == 1) {//first instance has all necessary actions
                        if (option.ActionOption.Name == 'ActionType') {
                            commonOptions.push(option)
                        }

                        if (option.ActionOption.Name == 'UserDefinedData') {
                            commonOptions.push(option)
                        }
                    }
                });

                if (!deviceTypeOption) {
                    optionsForDeviceType['Default'] = deviceTypeOptions;
                } else {
                    optionsForDeviceType[deviceTypeOption.Value] = deviceTypeOptions;
                }
            });

            if (optionsForDeviceType[userDeviceType]) {
                optionsForDeviceType[userDeviceType].forEach(function (option) {
                    what[option.ActionOption.DisplayName] = option.Value;
                });
            } else {
                optionsForDeviceType['Default'].forEach(function (option) {
                    what[option.ActionOption.DisplayName] = option.Value;
                });
            }

            commonOptions.forEach(function (option) {
                what[option.ActionOption.DisplayName] = option.Value;
            });

            LOGGER.debug(NAME, fnName, "Processed what options", what);

            return what;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    //TODO: This is not efficient and bad logistically, but for time constraints we process it in JS. THIS NEEDS REMOVED so this is all processed in the API, for now just do it here.
    var processWhenOptions = function (options) {
        var fnName = "processWhenOptions";

        LOGGER.debug(NAME, fnName, options);

        try {
            var when = {}; //empty object to assign properties to based on options
            var whenOptions = {};

            if (!options || !options.length) {
                return when;
            }

            $.each(options, function (key, val) {
                //set whenOption property name based on this options Display name and assign it's value on the Value property.
                whenOptions[val.ActionOption.DisplayName] = val.Value;
            });

            //since these when 'options' are all the same 'type' we assign the when object with a property based on the WhenClassMap and the first object in the options array OptionClassId (not ideal, needs updated).
            when[CnnXt.Common.WhenClassMap[options[0].ActionOption.ClassId]] = whenOptions;

            LOGGER.debug(NAME, fnName, "Processed when options", when);

            return when;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var mapOptionsByClassesAndInstances = function (entityOptions, mapSettings) {
        var fnName = "mapOptionsByClassesAndInstances";

        LOGGER.debug(NAME, fnName, arguments);

        try {
            var result = {},
                allCriterias = [];

            var groupedOptions = __.groupBy(entityOptions, function (option) {
                return option[mapSettings.Entity][mapSettings.EntityParentId];
            });

            $.each(groupedOptions, function (key, value) {
                var criteriaInstances = __.groupBy(groupedOptions[key], 'CriteriaInstanceNumber');

                $.each(criteriaInstances, function (instanceNumber) {
                    allCriterias.push(criteriaInstances[instanceNumber]);
                });
            });

            allCriterias.forEach(function (criteria) {
                var criteriaFields = {};
                var criteriaClassName = criteria[0][mapSettings.Entity][mapSettings.Entity_OptionClass].Name;

                criteria.forEach(function (option) {
                    var displayName = option[mapSettings.Entity].DisplayName;
                    displayName = displayName.replace(option[mapSettings.Entity][mapSettings.EntityParentId], '');
                    criteriaFields[displayName] = option.Value;
                });

                if (result[criteriaClassName] && result[criteriaClassName].length) {
                    result[criteriaClassName].push(criteriaFields);
                } else {
                    result[criteriaClassName] = [criteriaFields];
                }
            });

            LOGGER.debug(NAME, fnName, "Maped Options By Classes And Instances", result);

            return result;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var processDynamicMeter = function (dynamicmeter) {
        var fnName = "processDynamicMeter";

        LOGGER.debug(NAME, fnName, dynamicmeter);

        try {
            //loop through rules.
            $.each(dynamicmeter.Rules, function (key, val) {

                $.each(val.Segments, function (k, v) {
                    //loop through this rules segments....this is the main purpose of this function. We want to take each 'Segment' object and process the SegmentOptionValues array so we have a new clean property called 'options', while maintaining the other properties in this object (id, Name, etc...).

                    //this gets the class name for this segment. We use __.find because some properties might not have a ClassId property, so we grab the first one that is not null.
                    var className = __.find(v.SegmentOptionValues, function (obj) { return obj.SegmentOption.ClassId != null; }).SegmentOption.Segment_OptionClass.Name;
                    var segmentOptions = {}; //empty object which we'll populate with key/val based on DisplayName and Value
                    var exceptions = curSite.Client.Client_SegmentOption_Exceptions;
                    var newSegmentOptionValues;

                    $.each(exceptions,
                        function (key, value) {
                            newSegmentOptionValues = __.reject(v.SegmentOptionValues,
                                function (a) {
                                    return a.SegmentOptionId == value.SegmentOptionId ||
                                        a.SegmentOption.SegmentOptionParentId == value.SegmentOptionId;
                                });
                            if (newSegmentOptionValues.length != v.SegmentOptionValues.length) {
                                val.Segments[k] = null;
                            }
                        });
                    if (val.Segments[k] != null) {
                        $.each(v.SegmentOptionValues,
                            function (key, val) {
                                var dn = val.SegmentOption.DisplayName;

                                dn = dn.replace(val.SegmentOption.SegmentOptionParentId, '');
                                segmentOptions[dn] = val.Value;
                            });

                        //create/set new property called Options with newly processed options object
                        v.Options = segmentOptions;

                        //add 'SegmentType' property based on the 'className' we determined.  This will be used when calculating the meter level so we don't have to look into the Options object.
                        v.SegmentType = className;
                        //remove the SegmentOptionValues array (referencing 'val' object by key since 'v' is a local object, we want to effect parent segment key since that is what is returned)
                        val.Segments[k] = __.omit(v, "SegmentOptionValues");
                    }
                });

                val.Segments = __.filter(val.Segments, function (s) { return s != null });
            });

            LOGGER.debug(NAME, fnName, "Processed dynamicmeter", dynamicmeter);

            return dynamicmeter;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var mergeConfiguration = function (newConfig) {
        var fnName = "mergeConfiguration";

        LOGGER.debug(NAME, fnName, newConfig);

        try {
            //We don't really merge the 'configuration' object, we are actually going to replace the current configuration with the new configuration.  
            //This is because the 'configuration' object doesn't hold any user specific data that is stored for each user besides the conversations, but the configuration.Campaign.Conversations array just holds the data that we use to determine FUTURE conversations/actions.  
            //Any current conversations that are happening are stored in the 'conversations.current' local storage object. So this is what we need merge with the new configuration object.

            //save new configuration to local storage.
            CnnXt.Storage.SetLocalConfiguration(newConfig);

            //get the array of current conversations from local storage.
            var currentConversations = CnnXt.Storage.GetCurrentConversations();

            //create empty object to store the new conversations.  
            //we are doing this so we don't have to worry about removing a stored conversation if it no longer exists in the newConfig.Campaign.Conversations array. 
            var newCurrentConversations = {};

            //we now loop through the current (local) conversations and do 2 things A) Check if this conversation still exists in the new configuration, B) update/merge appropriate conversation data based on any changes in the new configuration, but still maintain current 'user related data'.
            $.each(currentConversations, function (key, val) {
                //'key' is the meterlevel name for this conversation (Free, Metered, Premium) and 'val' is the conversation object.

                //this searches the _Newconfig object to see if this conversation still exists. If it does we update this conversation in the _Newconfig object with stored user data (right now, just views).
                //var foundStoredConvo = __.findByKey(newConfig.Campaign.Conversations[MeterLevelsDict[key]], { id: val.id });

                //search the newConfig.Campaign.Conversations.METERLEVEL array on id and val.id. 
                var foundStoredConvo = __.findByKey(newConfig.Campaign.Conversations[key], { id: val.id });

                if (foundStoredConvo) {
                    //this stored conversation still exists in the newConfigration.Campaign.Conversations array
                    //so we need to merge all properties from DB to this locally saved version, but keep the entire 'Props' property from the local conversation, since this holds user specific data (like Start/End Date, 'views' etc...) so we want to preserve those.; 

                    //setting newConversations object with the foundStoredConvo based on this MeterLevel (key).
                    //the below statement would equate to newCurrentConversations[Free] or newCurrentConversations[Metered] etc..
                    newCurrentConversations[key] = $.extend({}, foundStoredConvo); //using $.extend because this creates a new object and not a reference.;

                    //the newCurrentConversations[key] object has all the settings from the newConfig object, now we replace the 'Props' key which holds any user specific data that we need to preserve (views, Date.Start, Date.Expiration etc...).
                    newCurrentConversations[key].Props = val.Props;
                }
            });

            //we now save the 'newCurrentConversations' Object to local storage.  Since we created a new 'current conversation' object and only added conversations from the 'newConfig' object to this new Object we automatically take care of the scenario that a user is in a conversation that is then deleted from the Admin.  
            //Since this conversation doesn't exist in the 'newConfig' object, we will not add it to the 'newConversation' object, therefore if this user was in a conversation that was deleted they will just move into a new conversation (as if this was there first time visiting, so first conversation in this campaign).
            CnnXt.Storage.SetCurrentConversations(newCurrentConversations);

            LOGGER.debug(NAME, fnName, "Done", newCurrentConversations);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var saveConfiguration = function () {
        var siteCode = $("#ConnextSiteCode").val();
        var configCode = $("#ConnextConfigCode").val();
        var isCustomConfiguration = $("#ConnextCustomConfiguration").prop("checked");

        if (isCustomConfiguration) {
            //remove all configuration
            CnnXt.Storage.ClearConfigSettings();

            CnnXt.Storage.SetSiteCode(siteCode);
            CnnXt.Storage.SetConfigCode(configCode.toUpperCase());
            CnnXt.Storage.SetIsCustomConfiguration(isCustomConfiguration);
        }
    };

    var resolveQualifiersFor = function (entity, additionaData) {
        var fnName = "resolveQualifiersFor";

        try {
            var conditionsWerePassed = true;

            LOGGER.debug(NAME, fnName, entity);

            if (!entity) {
                return conditionsWerePassed
            }

            if (entity.HiddenFieldCriteria && conditionsWerePassed) {
                //We have a 'HiddenField' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.HiddenFieldCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking HiddenFieldCriteria: ", criteria);

                        if (CnnXt.Utils.JSEvaluate(
                            CnnXt.Utils.GetHiddenFormFieldValue(criteria.Id),
                            criteria.Qualifier,
                            criteria.Val,
                            "HiddenFormField"
                        )) {
                            //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                        } else {
                            //this failed, so set conditionsWerePassed to false;
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.GeoCriteria && conditionsWerePassed) {
                //We have a 'GeoCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                try {
                    entity.GeoCriteria.forEach(function (criteria) {
                        if (conditionsWerePassed) {
                            LOGGER.debug(NAME, fnName, "Checking GeoCriteria: ", criteria);

                            var userZipCodes = CnnXt.Storage.GetActualZipCodes();

                            if (userZipCodes && criteria.Type !== undefined) {
                                userZipCodes.forEach(function (zipCode) {
                                    if (~criteria.Zip.indexOf(zipCode)) {
                                        conditionsWerePassed = (criteria.Type.toUpperCase() == "IN");
                                    } else if (criteria.Zip.indexOf('*') >= 0) {
                                        var valueItems = criteria.Zip.split(",") || criteria.Zip.split("");
                                        var foundZip = valueItems.filter(function (value) {
                                            var valueItem = value.split("");
                                            var zipItems = zipCode.split("");
                                            return zipItems.length != valueItem.length ? false : valueItem.every(function (item, i) {
                                                return valueItem[i] === "*" ? true : item === zipItems[i];
                                            });
                                        });

                                        if (foundZip.length > 0) {
                                            conditionsWerePassed = (criteria.Type.toUpperCase() == "IN");
                                        } else {
                                            conditionsWerePassed = (criteria.Type.toUpperCase() != "IN");
                                        }
                                    } else {
                                        conditionsWerePassed = (criteria.Type.toUpperCase() != "IN");
                                    }
                                });
                            }

                            LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                        }
                    });

                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                    conditionsWerePassed = false;
                }
            }

            if (entity.JavascriptCriteria && conditionsWerePassed) {
                //We have a 'JavascriptCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                try {
                    entity.JavascriptCriteria.forEach(function (criteria) {
                        if (conditionsWerePassed) {
                            LOGGER.debug(NAME, fnName, "Checking JavascriptCriteria: ", criteria);

                            var varValue = criteria.Eval;
                            var jsValue;

                            try {
                                jsValue = eval(varValue);
                            } catch (ex) {
                                LOGGER.warn(NAME, fnName, ex);
                            }

                            if ($.isArray(jsValue)) {
                                jsValue = jsValue.map(function (item) {
                                    return item.toString().trim().toLowerCase();
                                });

                                if (criteria.Qualifier == "In" || criteria.Qualifier == "NotIn") {
                                    if (jsValue.indexOf(criteria.Val.toLowerCase()) >= 0) {
                                        conditionsWerePassed = (criteria.Qualifier == "In");
                                    } else {
                                        conditionsWerePassed = (criteria.Qualifier == "NotIn");
                                    }
                                } else {
                                    conditionsWerePassed = (criteria.Qualifier == "==");
                                }
                            } else {
                                if (jsValue !== undefined && jsValue !== "") {
                                    jsValue = jsValue.toString().toLowerCase();
                                }

                                if (criteria.Qualifier == "In" || criteria.Qualifier == "NotIn") {
                                    if (jsValue == undefined) {
                                        conditionsWerePassed = (criteria.Qualifier == "NotIn");
                                    } else {
                                        var delimiter = criteria.Delimiter
                                            ? new RegExp(criteria.Delimiter.replace(/space/g, ' '), 'g')
                                            : /[ ,;]/g;
                                        array = jsValue.split(delimiter);

                                        if (array.indexOf(criteria.Val.toLowerCase()) >= 0) {
                                            conditionsWerePassed = (criteria.Qualifier == "In");
                                        } else {
                                            conditionsWerePassed = (criteria.Qualifier == "NotIn");
                                        }
                                    }
                                } else {
                                    if (CnnXt.Utils.JSEvaluate(
                                        jsValue,
                                        criteria.Qualifier,
                                        criteria.Val,
                                        "JavascriptCriteria"
                                    )) {
                                        //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                                    } else {
                                        //this failed, so set conditionsWerePassed to false;
                                        conditionsWerePassed = false;
                                    }
                                }
                            }

                            LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                        }
                    });

                } catch (ex) {
                    LOGGER.exception(NAME, fnName, "Evaluating javascript criteria.", ex);
                    conditionsWerePassed = false; //the eval through an exception so this action doesn't pass.
                }
            }

            if (entity.ScreenSizeCriteria && conditionsWerePassed) {
                //We have a 'ScreenSizeCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.ScreenSizeCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking ScreenSizeCriteria: ", criteria);

                        if (CnnXt.Utils.JSEvaluate(
                            CnnXt.Utils.getDeviceType(),
                            criteria.Qualifier,
                            criteria.Value,
                            "ScreenSizeCriteria"
                        )) {
                            //we don't care if it passed, we only care if a criteria fails, so this is only for debugging.
                        } else {
                            //this failed, so set conditionsWerePassed to false;
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.UrlCriteria && conditionsWerePassed) {
                //We have a 'UrlCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.UrlCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking UrlCriteria", criteria);

                        if (CnnXt.Utils.JSEvaluate(
                            CnnXt.Utils.getUrlParam(criteria.Eval),
                            criteria.Qualifier,
                            criteria.Value,
                            "UrlCriteria"
                        )) {
                            //keep conditionsWerePassed in true state
                        } else {
                            //this failed, so set conditionsWerePassed to false;
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.URLMaskCriteria && conditionsWerePassed) {
                //We have a 'UrlCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.URLMaskCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking UrlCriteria", criteria);

                        var href = window.location.href,
                            hrefFormatted = href.replace(/#$/, ''),
                            hrefLength = hrefFormatted.length,
                            criteriaHrefFormatted = criteria.Value.replace(/\*$/, ''),
                            valLength = criteriaHrefFormatted.length;

                        if (hrefFormatted.indexOf(criteriaHrefFormatted) == 0 && hrefLength > valLength && criteria.Qualifier == '==') {
                            //keep conditionsWerePassed in true state
                        } else if (hrefFormatted.indexOf(criteriaHrefFormatted) != 0 && criteria.Qualifier == '!=') {
                            //keep conditionsWerePassed in true state
                        } else {
                            //this failed, so set conditionsWerePassed to false;
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.SubDomainCriteria && conditionsWerePassed) {
                //We have a 'SubDomainCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.SubDomainCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking SubDomainCriteria", criteria);

                        var searchingVal = criteria.Value.toUpperCase();
                        var sourceVal = window.location.hostname.toUpperCase();
                        // root domain won't be included
                        var qualifier = criteria.Qualifier.toUpperCase();

                        if ((qualifier == "==") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1)) {
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.MetaKeywordCriteria && conditionsWerePassed) {
                //We have a 'MetaKeywordCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.MetaKeywordCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking MetaKeywordCriteria: ", criteria);

                        var metaArray = CnnXt.Utils.getMetaTagsWithKeywords();
                        var evalResult = false;
                        var regExpStr = "\\b" + criteria.Value + "\\b";
                        var regExp = new RegExp(regExpStr);

                        for (var i = 0; i < metaArray.length; i++) {
                            if (regExp.test(metaArray[i].content)) {
                                LOGGER.debug(NAME, fnName, "Found keyword", criteria.Value);
                                evalResult = true;
                                break;
                            }
                        }

                        if (evalResult && criteria.Qualifier == "!=") {
                            conditionsWerePassed = false;
                        }

                        if (!evalResult) {
                            conditionsWerePassed = (criteria.Qualifier == "!=") ? true : false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.UserStateCriteria && conditionsWerePassed) {
                //We have a 'UserStateCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.UserStateCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking UserStateCriteria", criteria);

                        var userState = CnnXt.User.getUserState();

                        if (!userState) {
                            userState = "Logged Out";
                        }

                        if (!CnnXt.Utils.JSEvaluate(
                            userState,
                            criteria.Qualifier,
                            criteria.Value,
                            "UserStateCriteria"
                        )) {
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.AdBlockCriteria && conditionsWerePassed) {
                //We have a 'AdBlockCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.AdBlockCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking AdBlockCriteria", criteria);

                        var hasAdBlock = CnnXt.Utils.detectAdBlock();

                        if (hasAdBlock && criteria.Value == "Detected") {
                            //keep conditionsWerePassed in true state
                        } else if (!hasAdBlock && criteria.Value == "Not Detected") {
                            //keep conditionsWerePassed in true state
                        } else {
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.FlittzStatusCriteria && conditionsWerePassed) {
                //We have a 'FlittzStatusCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                if (CnnXt.GetOptions().integrateFlittz && window.Flittz) {
                    var currentFlittzStatus = window.Flittz.FlittzUserStatus;

                    entity.FlittzStatusCriteria.forEach(function (criteria) {
                        if (conditionsWerePassed) {
                            LOGGER.debug(NAME, fnName, "Checking FlittzStatusCriteria", criteria);

                            if (!CnnXt.Utils.JSEvaluate(
                                CnnXt.Common.FlittzStatusesMap[currentFlittzStatus],
                                criteria.Qualifier,
                                criteria.Value,
                                "FlittzStatusCriteria"
                            )) {
                                conditionsWerePassed = false;
                            }

                            LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                        }
                    });
                } else {
                    conditionsWerePassed = false;
                    LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed. No Flittz integration', entity.FlittzStatusCriteria);
                }
            }

            if (entity.EZPayCriteria && conditionsWerePassed) {
                //We have a 'EZPayCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.EZPayCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking EZPayCriteria", criteria);
                        var userState = CnnXt.User.getUserState(),
                            userData;

                        if (userState !== 'Logged Out') {
                            userData = CnnXt.Storage.GetUserData();
                            if (userData && userData.Subscriptions) {
                                var subscription = userData.Subscriptions[0];
                                if (subscription.IsEZPay.toString() != criteria.Value) {
                                    conditionsWerePassed = false;
                                }
                            } else {
                                conditionsWerePassed = false;
                            }
                        } else {
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.ExpireDateCriteria && conditionsWerePassed) {
                //We have a 'ExpireDateCriteria' criteria(s) and 'conditionsWerePassed' is still true so we need to check this.
                entity.ExpireDateCriteria.forEach(function (criteria) {
                    if (conditionsWerePassed) {
                        LOGGER.debug(NAME, fnName, "Checking ExpireDateCriteria", criteria);
                        var userState = CnnXt.User.getUserState(),
                            userData;

                        if (userState !== 'Logged Out') {
                            userData = CnnXt.Storage.GetUserData();
                            if (userData && userData.Subscriptions) {
                                var subscription = userData.Subscriptions[0];

                                if (subscription.ExpirationDate) {
                                    var diff = CnnXt.Utils.GetTimeByType(subscription.ExpirationDate, criteria["Expire Date Type"]);
                                    if (!CnnXt.Utils.JSEvaluate(
                                        diff,
                                        criteria.Qualifier,
                                        criteria.Value,
                                        "ExpireDateCriteria"
                                    )) {
                                        conditionsWerePassed = false;
                                    }
                                }
                            } else {
                                conditionsWerePassed = false;
                            }
                        } else {
                            conditionsWerePassed = false;
                        }

                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    }
                });
            }

            if (entity.MeterViewsCriteria && conditionsWerePassed) {
                var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
                var articleCount = CnnXt.Common.ConvoArticleCountObj.article_count;
                var articleCookie = CnnXt.Storage.GetCookie(cookieName);

                if (articleCookie) {
                    entity.MeterViewsCriteria.forEach(function (criteria) {
                        if (conditionsWerePassed) {
                            LOGGER.debug(NAME, fnName, "Checking MeterViewsCriteria", criteria);
                            var meterArticleCount;

                            var meterArticleViews = JSON.parse(articleCookie);
                            if (__.isEmpty(meterArticleViews)) {
                                meterArticleCount = 0;
                                if (!CnnXt.Utils.JSEvaluate(
                                    meterArticleCount,
                                    criteria.Qualifier,
                                    criteria.Val,
                                    "MeterViewsCriteria"
                                )) {
                                    conditionsWerePassed = false;
                                }
                            } else {
                                if (meterArticleViews[additionaData.meterId]) {
                                    meterArticleCount = meterArticleViews[additionaData.meterId]['_' + articleCount];

                                    if (!CnnXt.Utils.JSEvaluate(
                                        meterArticleCount,
                                        criteria.Qualifier,
                                        criteria.Val,
                                        "MeterViewsCriteria"
                                    )) {
                                        conditionsWerePassed = false;
                                    }
                                } else {
                                    conditionsWerePassed = false;
                                }
                            }
                        }
                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    });
                } else {
                    conditionsWerePassed = false;
                }
            }

            if (entity.ConversationViewsCriteria && conditionsWerePassed) {
                var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
                var articleCount = CnnXt.Common.ConvoArticleCountObj.article_count;
                var articleCookie = CnnXt.Storage.GetCookie(cookieName);

                if (articleCookie) {
                    entity.ConversationViewsCriteria.forEach(function (criteria) {
                        if (conditionsWerePassed) {
                            LOGGER.debug(NAME, fnName, "Checking ConversationViewsCriteria", criteria);
                            var convoArticleCount;

                            var meterArticleViews = JSON.parse(articleCookie);

                            if (__.isEmpty(meterArticleViews)) {
                                convoArticleCount = 0;
                                if (!CnnXt.Utils.JSEvaluate(
                                    convoArticleCount,
                                    criteria.Qualifier,
                                    criteria.Val,
                                    "MeterViewsCriteria"
                                )) {
                                    conditionsWerePassed = false;
                                }
                            } else {
                                if (meterArticleViews[additionaData.meterId]) {
                                    var viewsCookieConvoId = meterArticleViews[additionaData.meterId][additionaData.conversationId];

                                    if (viewsCookieConvoId) {
                                        convoArticleCount = viewsCookieConvoId[articleCount];
                                        if (!CnnXt.Utils.JSEvaluate(
                                            convoArticleCount,
                                            criteria.Qualifier,
                                            criteria.Val,
                                            "ConversationViewsCriteria"
                                        )) {
                                            conditionsWerePassed = false;
                                        }
                                    } else {
                                        conditionsWerePassed = false;
                                    }
                                } else {
                                    conditionsWerePassed = false;
                                }
                            }
                        }
                        LOGGER.debug(NAME, fnName, 'Criteria was ' + (conditionsWerePassed ? '' : 'not') + ' passed', criteria);
                    });
                } else {
                    conditionsWerePassed = false;
                }
            }

            return conditionsWerePassed;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    }

    var resolvePromiseQualifiers = function (entity, timeout) {
        var fnName = 'resolvePromiseQualifier';
        var promiseCiteriaResult = $.Deferred();
        PROMISES.push(promiseCiteriaResult);
        try {
            if (entity.PromiseCriteria) {

                var promises = [];

                entity.PromiseCriteria.forEach(function (criteria) {
                    promises.push(eval(criteria.Name));
                });

                LOGGER.debug(NAME, fnName, 'Setup "Q all" for promise criterias');

                var timerId = null;
                if (timeout) {
                    timerId = setTimeout(function () {
                        LOGGER.debug(NAME, fnName, 'Criterias rejected on timeout');
                        promiseCiteriaResult.reject();
                    }, timeout);
                }

                $.when.apply($, promises).then(function () {
                    LOGGER.debug(NAME, fnName, '"Q all" results', arguments);

                    var resolvedPromises = arguments;

                    if (!arguments.length) {
                        arguments = [null];
                    }

                    var allCriteriasPassed = Array.prototype.every.call(entity.PromiseCriteria, function (criteria, index) {
                        var promiseResult = resolvedPromises[index],
                            criteriaValue = criteria.Value;

                        if (!CnnXt.Utils.JSEvaluate(
                            promiseResult,
                            criteria.Qualifier,
                            criteriaValue,
                            "Promise"
                        )) {
                            LOGGER.debug(NAME, fnName, 'Criteria ' + criteria.Name + ' not passed');

                            if (timerId) {
                                clearTimeout(timerId);
                            }

                            promiseCiteriaResult.reject();
                            return false;
                        }

                        return true;
                    });

                    if (allCriteriasPassed) {
                        LOGGER.debug(NAME, fnName, 'All criterias passed');
                        if (timerId) {
                            clearTimeout(timerId);
                        }
                        promiseCiteriaResult.resolve();
                    }

                },
                    function () {
                        LOGGER.debug(NAME, fnName, 'Criteria rejected');
                        if (timerId) {
                            clearTimeout(timerId);
                        }
                        promiseCiteriaResult.reject();
                    });
            } else {
                promiseCiteriaResult.resolve();
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            promiseCiteriaResult.reject();
        }

        return promiseCiteriaResult.promise();
    };

    var breakConversationPromises = function () {
        var fnName = 'breakPromise';

        try {
            LOGGER.debug(NAME, fnName, 'Promises ', PROMISES);
            PROMISES.forEach(function (value) {
                if (value.state() === "pending") {
                    value.reject();
                }
            });
            PROMISES = [];
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var handleDebugDetails = function () {
        var fnName = "handleDebugDetails";


        try {
            var cssLink = $('<link href="https://mg2assetsdev.blob.core.windows.net/connext/assets/connext-debug-panels.min.css" type="text/css" rel="stylesheet">');
            $("head").append(cssLink);

            var html = __.template('<div class="debug_details opened" style="left: 0;"><div class="debug_details_icon">&nbsp;</div><div class="debug_details_content"><h4>Debug Details</h4><ul>' +
                '<li class="debug_details_header hide_on_mobile"><label>Meter Level: <strong id="ddMeterLevel">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Meter Set: <strong id="ddMeterSet">...</strong></label><label>Campaign: <strong id="ddCampaign">...</strong></label><label>Conversation: <strong id="ddCurrentConversation">...</strong></label><label>Article Views: <strong id="ddCurrentConversationArticleViews">...</strong></label><label>Articles Left: <strong id="ddCurrentConversationArticleLeft">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>View Time: <strong id="ddViewTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Current Zip: <strong id="ddZipCode">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Auth Time: <strong id="ddAuthTime">...</strong></label><label>Processing Time: <strong id="ddProcessingTime">...</strong></label><label>Total Time: <strong id="ddTotalProcessingTime">...</strong></label></li><li class="debug_details_header hide_on_mobile"><label>Note: <strong id="ddNote">...</strong></label></li><li class="debug_details_header hide_on_mobile"><div id="ConnextCustomConfigurationDiv"><label for="ConnextSiteCode">Site code: </label><input type="text" id="ConnextSiteCode"><label for="ConnextConfigCode">Config code: </label><input type="text" id="ConnextConfigCode"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomConfiguration">Set configuration</a></div><label class="overlay_label check" for="ConnextCustomConfiguration">Use custom configuration: </label> <input type="checkbox" id="ConnextCustomConfiguration"><label class="overlay_label check" for="ConnextCustomConfiguration">Unique Articles Count: </label> <input type="checkbox" id="uniqueArticles"></li>' +
                '<li class="debug_details_header" > <label class="overlay_label check">AnonymousId: </label> <input type="text" id="connext_anonymousId" style="\r\n    width: 47px; */\r\n    padding:;\r\n    padding: 5px 1px;\r\n"><a href="#" class="more highlight margin_top_15" id="connext_anonymousIdApplyBtn" style="\r\n    padding: 4px 13px;\r\n    width: 35px;\r\n    margin-left: 10px;\r\n    display: inline;\r\n">Set</a></li>' +
                '<li class="debug_details_header hide_on_mobile"><label for="ConnextCustomTimeChk" class="overlay_label check">Custom Time: </label> <input type="checkbox" id="ConnextCustomTimeChk"><div id="ConnextCustomTimeDiv"><input type="text" id="ConnextCustomTimeTxt" placeholder="MM/DD/YYYY" value="" name="name" class="text_input hint"><a href="#" class="more highlight margin_top_15" id="ConnextSetCustomTimeBtn">Set</a></div></li><li class="debug_details_header hide_on_mobile"><a href="#" class="more highlight margin_top_15" id="connextClearAllData">Clear All Data</a></li></ul></div></div>');

            $("body").append(html);
            $("#ConnextSetCustomConfiguration").on("click", saveConfiguration);
            $(".debug_details_icon").on("click", handleDebugDetailsDisplayClick);
            $("#connextClearAllData").on("click", clearAllSettings);
            handleCustomTime();
            handleCustomConfiguration();
            if ($.jStorage.get("uniqueArticles")) {
                $("#uniqueArticles").attr("checked", "checked");
            }
            $("#ConnextCustomConfiguration").on("change", function () {
                var $this = $(this);
                if ($this.prop("checked")) {
                    $("#ConnextCustomConfigurationDiv").show();
                }
                else {
                    $("#ConnextCustomConfigurationDiv").hide();
                    CnnXt.Storage.SetIsCustomConfiguration(false);
                }
            });
            $("#ConnextCustomTimeChk").on("change", function () {
                var $this = $(this);
                if ($this.prop("checked")) {
                    $("#ConnextCustomTimeDiv").show();
                } else {
                    $("#ConnextCustomTimeDiv").hide();
                    $.jStorage.deleteKey("CustomTime");
                }
            });

            $("#uniqueArticles").on("change", function () {
                var $this = $(this);
                $.jStorage.set("uniqueArticles", $this.prop("checked"));
            });
            $("#ConnextSetCustomTimeBtn").on("click", function (e) {
                e.preventDefault();
                $.jStorage.set("CustomTime", $("#ConnextCustomTimeTxt").val());
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var handleDebugDetailsDisplayClick = function (e) {
        var fnName = "handleDebugDetailsDisplayClick";

        try {
            e.preventDefault();
            //get debug details div
            var $panel = $(this).parent("div");
            $panel.toggleClass("opened");

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var clearAllSettings = function (e) {
        var fnName = "clearAllSettings";

        try {
            e.preventDefault();
            LOGGER.debug(NAME, fnName, "clearAllSettings");
            if (CnnXt.Storage.GetLocalConfiguration()) {
                CnnXt.API.ServerStorageDeleteViewsByUserId();
                CnnXt.API.ClearServerCache();
                CnnXt.Storage.ResetConversationViews(CnnXt.Storage.GetCurrentConversation(), Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain);
                CnnXt.Storage.SetRegistrationType({});
                CnnXt.Storage.ClearConfigSettings();
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var handleCustomConfiguration = function () {
        if (CnnXt.Storage.GetIsCustomConfiguration()) {
            $("#ConnextCustomConfigurationDiv").show();
        } else {
            $("#ConnextCustomConfigurationDiv").hide();
        }
    }

    var handleCustomTime = function () {
        var fnName = "handleCustomTime";

        try {
            if ($.jStorage.get("CustomTime")) {
                $("#ConnextCustomTimeChk").prop("checked", true);
                $("#ConnextCustomTimeTxt").text($.jStorage.get("CustomTime"));
                $("#ConnextCustomTimeDiv").show();
            } else {
                $("#ConnextCustomTimeChk").prop("checked", false);
                $("#ConnextCustomTimeDiv").hide();
                $("#ConnextCustomTimeTxt").val(new Date());
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var nextLetter = function (s) {
        return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function (a) {
            var c = a.charCodeAt(0);
            switch (c) {
                case 90: return "A";
                case 122: return "a";
                default: return String.fromCharCode(++c);
            }
        });
    }

    var fillUserMeta = function () {
        var find,
            userAgent;

        device = {};

        // The client user agent string.
        // Lowercase, so we can use the more efficient indexOf(), instead of Regex
        userAgent = window.navigator.userAgent.toLowerCase();

        // Main functions
        // --------------

        device.ios = function () {
            return device.iphone() || device.ipod() || device.ipad();
        };

        device.iphone = function () {
            return !device.windows() && find("iphone");
        };

        device.ipod = function () {
            return find("ipod");
        };

        device.ipad = function () {
            return find("ipad");
        };

        device.android = function () {
            return !device.windows() && find("android");
        };

        device.androidPhone = function () {
            return device.android() && find("mobile");
        };

        device.androidTablet = function () {
            return device.android() && !find("mobile");
        };

        device.blackberry = function () {
            return find("blackberry") || find("bb10") || find("rim");
        };

        device.blackberryPhone = function () {
            return device.blackberry() && !find("tablet");
        };

        device.blackberryTablet = function () {
            return device.blackberry() && find("tablet");
        };

        device.windows = function () {
            return find("windows");
        };

        device.windowsPhone = function () {
            return device.windows() && find("phone");
        };

        device.windowsTablet = function () {
            return device.windows() && (find("touch") && !device.windowsPhone());
        };

        device.fxos = function () {
            return (find("(mobile;") || find("(tablet;")) && find("; rv:");
        };

        device.fxosPhone = function () {
            return device.fxos() && find("mobile");
        };

        device.fxosTablet = function () {
            return device.fxos() && find("tablet");
        };

        device.meego = function () {
            return find("meego");
        };

        device.cordova = function () {
            return window.cordova && location.protocol === "file:";
        };

        device.nodeWebkit = function () {
            return typeof window.process === "object";
        };

        device.mobile = function () {
            return device.androidPhone() || device.iphone() || device.ipod() || device.windowsPhone() || device.blackberryPhone() || device.fxosPhone() || device.meego();
        };

        device.tablet = function () {
            return device.ipad() || device.androidTablet() || device.blackberryTablet() || device.windowsTablet() || device.fxosTablet();
        };

        device.desktop = function () {
            return !device.tablet() && !device.mobile();
        };


        // Simple UA string search
        find = function (needle) {
            return userAgent.indexOf(needle) !== -1;
        };


        if (device.mobile()) {
            userMeta.deviceType = "Mobile";
        } else if (device.tablet()) {
            userMeta.deviceType = "Tablet";
        } else if (device.desktop()) {
            userMeta.deviceType = "Desktop";
        }

        if (device.ios()) {
            userMeta.OS = "IOS";
        } else if (device.windows()) {
            userMeta.OS = "windows";
        } else if (device.android()) {
            userMeta.OS = "android";
        } else if (device.blackberry()) {
            userMeta.OS = "blackberry";
        } else if (device.fxos()) {
            userMeta.OS = "fxos";
        }
        if ((navigator.userAgent.indexOf("Opera") || navigator.userAgent.indexOf('OPR')) != -1) {
            userMeta.Browser = "Opera";
        }
        else if (navigator.userAgent.indexOf("Chrome") != -1) {
            userMeta.Browser = "Chrome";
        }
        else if (navigator.userAgent.indexOf("Safari") != -1) {
            userMeta.Browser = "Safari";
        }
        else if (navigator.userAgent.indexOf("Firefox") != -1) {
            userMeta.Browser = "Firefox";
        }
        else if ((navigator.userAgent.indexOf("MSIE") != -1) || (!!document.documentMode == true)) //IF IE > 10
        {
            userMeta.Browser = "IE";
        }
        else {
            userMeta.Browser = "unknown";
        }
        userMeta.URL = window.location.href;
    }

    var checkWriteDomainCookie = function (domain) {
        var cookieKey = CnnXt.Common.StorageKeys.connext_check_domain_write,
            result = false;

        Cookies.set(cookieKey, 'Done!', { domain: domain });

        result = !!Cookies.get(cookieKey);

        Cookies.set(cookieKey, 'null', { domain: domain, expires: -1 });

        return result;
    }

    var prepareValueToCompare = function (value) {
        var fnName = 'prepareValueToCompare';

        try {
            if (__.isNumber(value) || __.isBoolean(value)) {
                return value;
            }

            if (__.isString(value)) {
                if (value === "''") {
                    return '';
                }

                if (value.toLowerCase() === 'true') {
                    return true;
                }

                if (value.toLowerCase() === 'false') {
                    return false;
                }

                if (value.toLowerCase() === 'null') {
                    return null;
                }

                if (value.toLowerCase() === 'undefined') {
                    return undefined;
                }

                var number = Number(value);

                if (__.isNaN(number)) {
                    return value.toLowerCase();
                } else {
                    return number;
                }
            }

            if (__.isObject(value)) {
                return value.toString().toLowerCase();
            }

            return value;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, 'value: ' + value, ex);
        }
    }

    //#endregion HELPERS

    //HELPER FUNCTION FOR CIDR CALCULARION
    function ipToIp32(ip) {
        var ip32 = false;
        if (typeof ip === 'string') {
            var matches = ip.match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)$/);
            if (matches) {
                var ipBytes = [];
                for (var index = 1; index < matches.length; index++) {
                    var ipByte = parseInt(matches[index]);
                    if ((ipByte >= 0) && (ipByte <= 255)) {
                        ipBytes.push(ipByte);
                    }
                }
                if (ipBytes.length === 4) {
                    ip32 = bytesToInt32(ipBytes);
                }
            }
        }
        return ip32;
    }

    function ip32ToIp(ip32) {
        var ip = false;
        if ((typeof ip32 === 'number') && isFinite(ip32)) {
            ip = int32ToBytes(ip32 & 0xFFFFFFFF).join('.');
        }
        return ip;
    }

    function int32ToBytes(int32) {
        return [(int32 >>> 24) & 0xFF, (int32 >>> 16) & 0xFF, (int32 >>> 8) & 0xFF, (int32 >>> 0) & 0xFF];
    }

    function bytesToInt32(bytes) {
        return (((((bytes[0] * 256) + bytes[1]) * 256) + bytes[2]) * 256) + bytes[3];
    }

    function buildMask(size) {
        return size ? -1 << (32 - size) : 0;
    }
    //END FUNCTION FOR CIDR CALCULARION

    function applyMask(ip32, mask) {
        // Unfortunately, cannot simply use:
        // return ip32 & mask;
        // since JavaScript bitwise operations deal with 32-bit *signed* integers...
        var ipBytes = int32ToBytes(ip32);
        var maskBytes = int32ToBytes(mask);
        var maskedBytes = [];
        for (var index = 0; index < ipBytes.length; index++) {
            maskedBytes.push(ipBytes[index] & maskBytes[index]);
        }
        return bytesToInt32(maskedBytes);
    }

    function decodeAuthCookie(data) {
        if (!data) {
            return null;
        }
        return encodeURIComponent(decodeURIComponent(data));
    }

    function newsletterErrorHandler (data, defaultMessage) {
        if (data) {
            var errorData;
            var message = JSON.parse(data.responseText);
            if (message.Message) {
                errorData = {
                    Message: message.Message
                };
            } else {
                errorData = {
                    Message: defaultMessage
                };
            }

            return errorData;
        }
        return {
            Message: defaultMessage
        };

    }

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, 'Initializing Utils Module...');
            fillUserMeta();
            String.prototype.replaceAt = function (index, replacement) {
                return this.substr(0, index) + replacement + this.substr(index + replacement.length);
            }
        },
        Now: function () {
            //this returns the current date/time based on either the current real datetime or a datetime set in the debug panel.
            try {
                if ($.jStorage.get("CustomTime")) {
                    return new Date(Date.parse($.jStorage.get("CustomTime")));
                } else {
                    //no custom time set, so return the current moment object.                  
                    return new Date();
                }
            } catch (ex) {
                LOGGER.exception(NAME, "Now", ex);
            }
        },
        ProcessConfiguration: function (data) { //typically Utils is reserverd for functions that can be used throughout the App, but we have ProcessConfiguration here because it requires alot of other functions and its cleaner to have that all in here instead of in the main 'CnnXt.Core' file.
            return processConfiguration(data);
        },
        MergeConfiguration: function (newConfig) {
            mergeConfiguration(newConfig);
        },
        CreateDebugDetailPanel: function () {
            handleDebugDetails();
        },
        ResolveQualifiersFor: resolveQualifiersFor,
        ResolvePromiseQualifiers: resolvePromiseQualifiers,
        AddParameterToURL: function (_url, param) {
            _url += (_url.split("?")[1] ? "&" : "?") + param;
            return _url;
        },
        GetUrlParam: function (paramName) {
            var searchString = window.location.search.substring(1),
                i,
                val,
                params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        GetQueryStringParams: function (paramsNames) {
            var queryStringSegments = window.location.search.slice(1).split('&'),
                result = {},
                isSerchFromArray = false,
                necessaryParams = {};

            if (__.isArray(paramsNames)) {
                isSerchFromArray = true;

                paramsNames.forEach(function (name) {
                    necessaryParams[name] = true;
                });
            }

            for (var i = queryStringSegments.length - 1; i >= 0; i--) {
                var segment = [];

                if (queryStringSegments[i]) {
                    segment = queryStringSegments[i].split('=');

                    if (isSerchFromArray) {
                        if (necessaryParams[segment[0]]) {
                            try {
                                result[segment[0]] = decodeURIComponent(segment.slice(1).join('='));
                            } catch (e) {
                                result[segment[0]] = '';
                            }
                        }
                    } else {
                        try {
                            result[segment[0]] = decodeURIComponent(segment.slice(1).join('='));
                        } catch (e) {
                            result[segment[0]] = '';
                        }
                    }
                }
            };

            return result;
        },
        GetActivationUrlParams: function () {
            return CnnXt.Utils.GetQueryStringParams(['email', 'productCode', 'returnUrl', 'confirmationNumber', 'accountNumber', 'lastName']);
        },
        GetProductCode: function () {
            var options = CnnXt.GetOptions(),
                configSettings = (CnnXt.Storage.GetLocalConfiguration() || {}).Settings,
                activationUrlParams = CnnXt.Utils.GetActivationUrlParams(),
                productCode = null;

            productCode = activationUrlParams.productCode;

            if (!productCode) {
                productCode = options.productCode;
            }

            if (!productCode) {
                productCode = (configSettings) ? configSettings.DefaultProduct : null;
            }

            LOGGER.debug(NAME, 'GetProductCode', 'Product code: ', productCode);

            return productCode;
        },
        ParseCustomDate: function (input, format) {
            format = format || "dd.mm.yyyy"; // some default format'
            if (!input) return new Date();
            var parts = input.match(/(\d+)/g),
                i = 0,
                fmt = {};
            // extract date-part indexes from the format
            format.replace(/(yyyy|dd|mm)/g, function (part) { fmt[part] = i++; });
            return new Date(parts[fmt["yyyy"]], parts[fmt["mm"]] - 1, parts[fmt["dd"]]);
        },
        ParseCustomDates: function (input) {
            var output = null;

            if (__.isString(input)) {
                output = input.replace(/(\d+)([a-zA-Z,()\\";?]+)/, "$1 ");
                output = Date.parse(output);
            }

            return new Date(output);
        },
        Diff: function (currDate, articleDate) {
            var diff = +currDate - +articleDate;
            diff = parseInt(diff / 86400000);
            return diff;
        },
        GetUrl: function () {
            return location.protocol + "//" + location.host + location.pathname;
        },
        GetHiddenFormFieldValue: function (selector) { //we take any jquery selector, so it can be a class, id, data atrribute etc...
            try {
                var hidValue = $("#" + selector).val();
                LOGGER.debug(NAME, "GetHiddenFormFieldValue", "hidValue", hidValue);
                return hidValue; //$(selector).val();
            } catch (ex) {
                LOGGER.exception(NAME, "GetHiddenFormFieldValue", ex);
                return ""; //we return empty string on error so any checks that call this function can still be evaluated.
            }
        },
        JSEvaluate: function (value1, qualifier, value2) { //this calls JS 'eval' to test a javascript condition. We take 2 values and a qualifier and return the result.
            try {
                var label = (arguments[3]) ? arguments[3] + " ---- " : "";

                var evalString = '';
                var preparedValue1 = prepareValueToCompare(value1);
                var preparedValue2 = prepareValueToCompare(value2);
                var fixedqualifier = CnnXt.Utils.FixQualifier(qualifier);

                evalString += (__.isString(preparedValue1)) ? "'" + preparedValue1 + "'" : preparedValue1;
                evalString += fixedqualifier;
                evalString += (__.isString(preparedValue2)) ? "'" + preparedValue2 + "'" : preparedValue2;

                if (eval(evalString)) {
                    LOGGER.debug(NAME, "JSEvaluate --- <<<<< " + evalString, " >>>>> ---- PASSES");
                    return true;
                } else {
                    LOGGER.debug(NAME, label + "JSEvaluate --- <<<<< " + evalString, " >>>>> ---- FAILS");
                    return false;
                }
            } catch (ex) {
                LOGGER.exception(NAME, "JSEvaluate", ex);
                return false; //if there is an error we return false since we don't know the true determination of this evaluation.
            }

        },
        GetNextLetter: function (a) {
            return nextLetter(a);
        },
        FixQualifier: function (qualifier) {
            try {
                var fixedQualifier = CnnXt.Common.QualifierMap[qualifier];

                if (fixedQualifier) {
                    return fixedQualifier;
                } else {
                    return qualifier; //we don't have a fix for this qualifier, so just return the original.
                }

            } catch (ex) {
                LOGGER.exception(NAME, 'FixQualifier', ex);
                return qualifier; //if we fail, return original qualifier.
            }
        },
        getFileName: function () {
            //gets file name including extension.  If an argument is passed in then we use that otherwise we use the current location.href
            var url = (arguments[0]) ? arguments[0] : window.location.href;
            return url.substring(url.lastIndexOf("/") + 1);
        },
        getCurPageName: function () {
            return location.pathname.substring(1);
        },
        HangleMatherTool: function () {
            var $input = $('#connext_anonymousId');
            var $bttn = $('#connext_anonymousIdApplyBtn');

            if (localStorage._matherAnonId) {
                $input.val(localStorage._matherAnonId);
            }

            $bttn.on('click', function () {
                var id = $input.val();
                if (id) {
                    localStorage._matherAnonId = id;
                }
            });
        },
        getParam: function (paramName) {
            //returns value of param if it exists, if not we return null.
            var searchString = window.location.search.substring(1),
                i,
                val,
                params = searchString.split("&");

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    return unescape(val[1]);
                }
            }
            return null;
        },
        hasParam: function (paramName) {
            //just return true/false depending if we have that param (does not return value).
            var searchString = window.location.search.substring(1),
                i,
                val,
                params = searchString.split("&"),
                test;

            for (i = 0; i < params.length; i++) {
                val = params[i].split("=");
                if (val[0] == paramName) {
                    test = unescape(val[1]);
                    return (test.length > 0 && typeof test == "string") ? true : false;
                }
            }
            return false;
        },
        EncryptAccessToken: function () {
            //TODO: Right now this isn't really encrypting anything. It is just returning a random string, but we set it up with a masterId argument so when we do implement this, we don't need to change any functions that are calling this.
            var len = 64;
            var charSet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            var randomString = "";
            for (var i = 0; i < len; i++) {
                var randomPoz = Math.floor(Math.random() * charSet.length);
                randomString += charSet.substring(randomPoz, randomPoz + 1);
            }
            return randomString;
        },
        getScreenSize: function () {
            var screenWidth = $(window).width();

            if (window.screen) {
                screenWidth = window.screen.width;
            }

            return screenWidth;
        },
        getDeviceType: function () {
            return userMeta.deviceType;
        },
        DetectEnvironment: function () {
            var environment = "prod";

            if (~location.hostname.indexOf("localhost")) {
                environment = "localhost";
            } else if (~location.hostname.indexOf("dev.")) {
                environment = "dev";
            } else if (~location.hostname.indexOf("test.")) {
                environment = "test";
            } else if (~location.hostname.indexOf("test20.")) {
                environment = "test20";
            } else if (~location.hostname.indexOf("demo.")) {
                environment = "demo";
            } else if (~location.hostname.indexOf("stage.")) {
                environment = "stage";
            } else if (~location.hostname.indexOf("preprod.")) {
                environment = "preprod";
            }

            return environment;
        },
        GetViewedArticlesCookiesName: function () {
            var config = CnnXt.Storage.GetLocalConfiguration();
            var name = CnnXt.Common.StorageKeys.connext_viewstructure +
                "_" +
                config.Site.SiteCode.toUpperCase() +
                "_" +
                config.Settings.Code.toUpperCase() +
                "_" +
                CnnXt.GetOptions().environment.toUpperCase();
            if (!config.Settings.UseParentDomain) {
                name = 'sub_' + name;
            }
            return name;
        },
        GetCookieName: function (name) {
            var config = CnnXt.Storage.GetLocalConfiguration();

            if (!config) {
                return name;
            }

            name = name + "_" +
                config.Site.SiteCode.toUpperCase() +
                "_" +
                config.Settings.Code.toUpperCase() +
                "_" +
                CnnXt.GetOptions().environment.toUpperCase();

            if (!config.Settings.UseParentDomain) {
                name = 'sub_' + name;
            }

            return name;
        },
        GetViewedArticlesCookiesOLDName: function () {
            var config = CnnXt.Storage.GetLocalConfiguration();

            var name = CnnXt.Common.StorageKeys.viewedArticles
                + "_site=" + config.Site.SiteCode
                + "_environment=" + CnnXt.GetOptions().environment
                + "_config=" + config.Settings.Code
                + "_conversation=" + conversationId;

            if (config.Settings.UseParentDomain == invert) {
                name = 'sub_' + name;
            }

            return name;
        },
        GetLocalStorageNamePrefix: function () {
            var name = CnnXt.GetOptions().siteCode +
                '_' +
                CnnXt.GetOptions().environment +
                '_' +
                CnnXt.GetOptions().configCode;
            if (CnnXt.GetOptions().attr) {
                name += "_" + CnnXt.GetOptions().attr;
            }
            if (CnnXt.GetOptions().settingsKey) {
                name += "_" + CnnXt.GetOptions().settingsKey;
            }
            return name;
        },
        GetCookieNamePostfix: function () {
            var postfix = '_' +
                CnnXt.GetOptions().siteCode +
                '_' +
                CnnXt.GetOptions().configCode +
                '_' +
                CnnXt.GetOptions().environment;
            return postfix;
        },
        AddParameterToURL: function (url, paramName, param) {
            var segment = paramName + '=' + param;

            url = url.replace(/#$/, '');
            url += (url.split("?")[1] ? "&" : "?") + segment;

            return url;
        },
        AddReturnUrlParamToLink: function (link) {
            if (!~link.indexOf('returnUrl=')) {
                var returnUrl = CnnXt.Utils.GetReturnUrl();

                //add clearUserState parameter to clear user state from cash to get fresh user state after redirect back
                returnUrl = CnnXt.Utils.AddParameterToURL(returnUrl, 'clearUserState', true);

                link = CnnXt.Utils.AddParameterToURL(link, 'returnUrl', returnUrl);
            }

            return link;
        },
        GetReturnUrl: function () {
            var configSettings = (CnnXt.Storage.GetLocalConfiguration() || {}).Settings,
                returnUrl = '';

            if (!returnUrl) {
                returnUrl = CnnXt.Utils.GetQueryStringParams(['returnUrl']).returnUrl;
            }

            if (!returnUrl) {
                returnUrl = configSettings.ReturnUrl;
            }

            if (!returnUrl) {
                returnUrl = window.location.href.split('?')[0];
            }

            return returnUrl;
        },
        getUrlParam: function (urlParam) {
            var paramValue = "";
            var url = document.location.search.substr(1);
            var paramArray = url.split("&");

            paramArray.every(function (elem) {
                var arr = elem.split("=");
                if (arr[0] == urlParam) {
                    paramValue = arr[1];
                    return false;
                } else {
                    return true;
                }
            });

            return paramValue;
        },
        AddQueryParamsToAllLinks: function ($html) {
            var $links = $html.find("[href]:not([data-dismiss])");

            $links.each(function (index, link) {
                var $link = $(link),
                    href = $link.attr("href");

                href = CnnXt.Utils.AddReturnUrlParamToLink(href);

                $link.attr("href", href);
            });
        },
        getSubdomains: function () {
            var array = document.location.origin.split(".");
            //remove domain name .com
            array.pop();
            //domain 
            array.pop();

            if (array.length) {
                var str = array[0].substring(array[0].lastIndexOf("/") + 1);
                if (str === "www") {
                    array.shift();
                } else {
                    array[0] = str;
                }
            }

            return array;
        },
        getMetaTagsWithKeywords: function () {
            return $("meta[name=keywords]");
        },
        detectAdBlock: function () {
            var adBlockEnabled = false;
            var testAd = document.getElementById("TestAdBlock");

            if (testAd.offsetHeight === 0) {
                adBlockEnabled = true;
            }

            var testImg = document.getElementById("06db9294");
            if (testImg.offsetHeight === 0) {
                adBlockEnabled = true;
            }

            var testScript = document.getElementById("295f89b1");
            if (testScript.className !== "adstestloaded") {
                adBlockEnabled = true;
            }

            LOGGER.debug(NAME, 'detectAdBlock', 'detected: ', adBlockEnabled);

            return adBlockEnabled;
        },
        getQueryParamByName: function (name, url) {
            if (!url) {
                url = window.location.href;
            }

            name = name.replace(/[\[\]]/g, "\\$&");

            var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
                results = regex.exec(url);

            if (!results) {
                return null;
            }

            if (!results[2]) {
                return "";
            }

            return decodeURIComponent(results[2].replace(/\+/g, " "));
        },
        GetUserMeta: function () {
            return userMeta;
        },
        GenerateGuid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }

            return s4() +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                '-' +
                s4() +
                s4() +
                s4();
        },
        ConvertObjectKeysToUpperCase: function (obj) {
            $.each(obj,
                function (index, val) {
                    delete obj[index];
                    obj[index.toUpperCase()] = val;
                });
            return obj;
        },
        GetIP: function () {
            if (IP) {
                return IP;
            } else return localStorage.ConnextIP;
        },
        SetIP: function (ip) {
            localStorage.ConnextIP = ip;
            IP = ip;
        },
        ShapeUserData: function (data) {
            if (data && data.DigitalAccess && data.DigitalAccess.AccessLevel && __.isString(data.DigitalAccess.AccessLevel)) {
                data.DigitalAccess.AccessLevel = {
                    IsPremium: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Premium,
                    IsUpgrade: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Upgrade,
                    IsPurchase: data.DigitalAccess.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Purchase
                }
            }

            if (data.EncryptedCustomerRegistrationId) {
                data.IgmRegID = data.EncryptedCustomerRegistrationId;
            }

            if (data.CookieContent && __.isArray(data.CookieContent)) {
                var igmContentCookie = __.findWhere(data.CookieContent, { Name: "igmContent" });
                if (igmContentCookie) {
                    data.IgmContent = igmContentCookie.Content;
                }

                var igmRegIdCookie = __.findWhere(data.CookieContent, { Name: "igmRegId" });
                if (igmRegIdCookie) {
                    data.IgmRegID = igmRegIdCookie.Content;
                }

                var igmAuthCookie = __.findWhere(data.CookieContent, { Name: "igmAuth" });
                if (igmAuthCookie) {
                    data.IgmAuth = igmAuthCookie.Content;
                }
            }

            return data;
        },
        GetUserAuthData: function () {
            var fnName = 'GetUserAuthData';

            try {
                var userData = CnnXt.Storage.GetUserData(),
                    authData = {};

                var customRegId = (userData) ? userData.MasterId : null;

                if (customRegId) {
                    authData = {
                        CustomRegId: customRegId,
                        MasterId: customRegId,
                        Mode: 0
                    }

                    return authData;
                }

                var customRegId = (userData) ? userData.IgmRegID : null;

                if (customRegId) {
                    authData = {
                        CustomRegId: customRegId,
                        MasterId: customRegId,
                        Mode: 1
                    }

                    return authData;
                }

                return authData;
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        GetTimeByType: function (value, type) {
            var now = moment(),
                endDate = new Date(value);
            return moment(endDate).diff(now, CnnXt.Common.TimeTypeMap[type]);
        },
        AddTimeInervalToDate: function (value, type) {
            var milliseconds = 0;

            value = parseInt(value);

            if (!value) {
                return milliseconds;
            }

            switch (type) {
                case 's': milliseconds = value * 1000;
                    break;
                case 'm': milliseconds = value * 60 * 1000;
                    break;
                case 'h': milliseconds = value * 60 * 60 * 1000;
                    break;
                case 'd': milliseconds = value * 24 * 60 * 60 * 1000;
                    break;
                case 'w': milliseconds = value * 7 * 24 * 60 * 60 * 1000;
                    break;
                default: milliseconds = 0;
            }

            var now = new Date();
            var futureDate = new Date(now.valueOf());

            futureDate.setMilliseconds(futureDate.getMilliseconds() + milliseconds);

            return futureDate;
        },
        CalculateDomain: function (isRoot) {
            var domain = null,
                host = window.location.host;

            if (!~host.indexOf('localhost')) {
                if (isRoot) {
                    var segments = host.split('.'),
                        positions = 2;

                    do {
                        domain = '';

                        for (var i = positions; i > 0; i--) {
                            domain += '.' + segments[segments.length - i];
                        }

                        positions++;

                    } while (!checkWriteDomainCookie(domain));

                } else {
                    domain = window.location.host;
                }
            } else {
                domain = 'localhost';
            }

            return domain;
        },
        GetSiteConfigEnvString: function () {
            var options = CnnXt.GetOptions(),
                siteCode = options.siteCode,
                configCode = options.configCode,
                environment = options.environment;
            return '_' + siteCode + '_' + configCode + '_' + environment;
        },
        IPWithinRangeCIDR: function (ip, cidr) {
            var IPsRangeByCIDR = CnnXt.Utils.GetIPsRangeByCIDR(cidr);

            var lowerBound = IPsRangeByCIDR[0],
                upperBound = IPsRangeByCIDR[1];

            // Put all IPs into one array for iterating and split all into their own 
            // array of segments
            var ips = [ip.split('.'), lowerBound.split('.'), upperBound.split('.')];

            // Convert all IPs to ints
            for (var i = 0; i < ips.length; i++) {

                // Typecast all segments of all ips to ints
                for (var j = 0; j < ips[i].length; j++) {
                    ips[i][j] = parseInt(ips[i][j]);
                }

                // Bit shift each segment to make it easier to compare
                ips[i] =
                    (ips[i][0] << 24) +
                    (ips[i][1] << 16) +
                    (ips[i][2] << 8) +
                    (ips[i][3]);
            }

            // Do comparisons
            if (ips[0] >= ips[1] && ips[0] <= ips[2]) return true;

            return false;
        },
        GetIPsRangeByCIDR: function (cidr) {
            var ips = false;

            if (typeof cidr === 'string') {
                var matches = cidr.match(/^(\d+\.\d+\.\d+\.\d+)\/(\d+)$/);

                if (matches) {
                    var ip32 = ipToIp32(matches[1]);
                    var prefixSize = parseInt(matches[2]);

                    if ((typeof ip32 === 'number') && (prefixSize >= 0) && (prefixSize <= 32)) {
                        var mask = buildMask(prefixSize);
                        var start = applyMask(ip32, mask);

                        ips = [ip32ToIp(start), ip32ToIp(start - mask - 1)];
                    }
                }
            }

            return ips;
        },
        GetDynamicMeterIdByKey: function (dynamicMeterKey) {

            if ((typeof (dynamicMeterKey)).toLowerCase() != 'string') {
                return dynamicMeterKey;
            }

            switch (dynamicMeterKey.toLowerCase()) {
                case 'free':
                    return '1';
                case 'metered':
                    return '2';
                case 'premium':
                    return '3';
                default:
                    return dynamicMeterKey;
            }
        },
        GetErrorMessageFromAPIResponse: function (response, defaultMessage) {
            var fnName = "GetErrorMessageFromAPIResponse";
            try {
                if (!response || !response.Message)
                    return defaultMessage;
                var parsedErrorMessage = $.parseJSON(response.Message);
                var errorMessage = defaultMessage;
                if ($.isArray(parsedErrorMessage.Errors)) {
                    errorMessage = '';
                    parsedErrorMessage.Errors.forEach(function (msg) {
                        if (__.isString(msg)) {
                            errorMessage += msg + ' ';
                        } else {
                            errorMessage += msg.Message + ' ';
                        }
                    });
                } else {
                    errorMessage = parsedErrorMessage.Message;
                }
                return errorMessage;
            }
            catch (ex) {
                LOGGER.debug(NAME, fnName, "can't get errorMessage from API response", response);
                return defaultMessage;
            }
        },
        NewsletterErrorHandler : newsletterErrorHandler,
        BreakConversationPromises: breakConversationPromises,
        DecodeAuthCookie: decodeAuthCookie
    };

};

var ConnextStorage = function ($) {
    var NAME = "Storage";
    var LOGGER;

    var METER;

    var getLocalStorage = function (key) {
        var fnName = "getLocalStorage";

        try {
            var storageKey = key;

            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }

            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;

            return $.jStorage.get(fullKey);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);

            if (key == 'configuration') {
                CnnXt.Api.meta.storageException = ex;
            }
        }
    };

    var setLocalStorage = function (key, val) {
        var fnName = "setLocalStorage";

        try {
            var storageKey = key;

            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }

            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;

            return $.jStorage.set(fullKey, val);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var removeLocalStorage = function (key) {
        var fnName = "removeLocalStorage";

        try {
            var storageKey = key;

            if (CnnXt.Common.StorageKeys[key]) {
                storageKey = CnnXt.Common.StorageKeys[key];
            }

            var fullKey = CnnXt.Utils.GetLocalStorageNamePrefix() + storageKey;

            return $.jStorage.deleteKey(fullKey);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getCookie = function (key) {
        var fnName = "getCookie";

        try {
            var cookieKey = CnnXt.Common.StorageKeys[key] || key;

            LOGGER.debug(NAME, fnName, 'cookieKey', cookieKey);

            return Cookies.get(cookieKey);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var storageRegistry = [];
    var listenStorageChange = function (storageName, callback) {
        var fnName = 'listenStorageChange';

        try {
            storageRegistry[storageName] = localStorage.getItem(storageName);
            setInterval(function () {
                try {
                    if (localStorage.getItem(storageName) != storageRegistry[storageName]) {
                        storageRegistry[storageName] = localStorage.getItem(storageName);
                        return callback();
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            }, 1000);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var addEventListners = function () {
        listenStorageChange("janrainCaptureToken",
            function () {
                CnnXt.Storage.SetUserState(null);
                CnnXt.Storage.SetUserZipCodes(null);
                if (CnnXt.Activation.IsActivationFlowRunning()) {
                    CnnXt.User.CheckAccess()
                        .always(function () {
                            CnnXt.Activation.Run({ runAfterSuccessfulLogin: true });
                        });
                } else {
                    CnnXt.Run();
                }
            });
    };

    var setCookie = function (key, data, expiration, useWholeDomain) {
        var fnName = 'setCookie';

        LOGGER.debug(NAME, fnName, arguments);

        try {
            var isRootDomain = !useWholeDomain;
            var curdomain = CnnXt.Storage.GetDomain(isRootDomain);

            if (expiration) {
                LOGGER.debug(NAME, fnName, 'HasExpiration', 'key', key, 'expiration', expiration);

                return Cookies.set(CnnXt.Common.StorageKeys[key] || key, data, { expires: expiration, domain: curdomain });
            } else {
                return Cookies.set(CnnXt.Common.StorageKeys[key] || key, data, { domain: curdomain });
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var removeCookie = function (key) {
        var fnName = "removeCookie";

        try {
            LOGGER.debug(NAME, fnName, key);

            var domain = CnnXt.Storage.GetDomain(),
                rootDomain = CnnXt.Storage.GetDomain(true);

            Cookies.set(CnnXt.Common.StorageKeys[key] || key, 'null', { domain: domain, expires: -1 });
            Cookies.set(CnnXt.Common.StorageKeys[key] || key, 'null', { domain: rootDomain, expires: -1 });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var incrementView = function (conversation) {
        var fnName = 'incrementView';

        try {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);

            var activeConvoId = CnnXt.Common.MeteredArticleCountObj.active_convo_id,
                articleCount = CnnXt.Common.ConvoArticleCountObj.article_count,
                deviceArticleCount = CnnXt.Common.ConvoArticleCountObj.device_article_count,
                startDate = CnnXt.Common.ConvoArticleCountObj.start_date;

            var articleCookie = getCookie(cookieName);

            if (articleCookie) {
                var parserViews = JSON.parse(articleCookie);
                var cookieMeterViews = parserViews[METER.level];

                if (cookieMeterViews) {
                    var cookieConversation = cookieMeterViews[conversation.id];
                    cookieMeterViews[activeConvoId] = conversation.id;
                    cookieMeterViews['_' + articleCount] = cookieMeterViews['_' + articleCount] ? cookieMeterViews['_' + articleCount] + 1 : 1;
                    cookieMeterViews['_' + deviceArticleCount] = cookieMeterViews['_' + deviceArticleCount] ? cookieMeterViews['_' + deviceArticleCount] + 1 : 1;

                    if (cookieConversation) {
                        cookieConversation[articleCount] = cookieConversation[articleCount] + 1;
                        cookieConversation[deviceArticleCount] = cookieConversation[deviceArticleCount] + 1;
                        cookieConversation[startDate] = conversation.Props.Date.started;
                    } else {
                        cookieMeterViews[conversation.id] = {};
                        cookieMeterViews[conversation.id][articleCount] = 1;
                        cookieMeterViews[conversation.id][deviceArticleCount] = 1;
                        cookieMeterViews[conversation.id][startDate] = conversation.Props.Date.started;
                    }
                } else {
                    parserViews[METER.level] = {};
                    parserViews[METER.level]['_' + articleCount] = 1;
                    parserViews[METER.level]['_' + deviceArticleCount] = 1;
                    parserViews[METER.level][activeConvoId] = conversation.id;

                    parserViews[METER.level][conversation.id] = {};
                    parserViews[METER.level][conversation.id][articleCount] = 1;
                    parserViews[METER.level][conversation.id][deviceArticleCount] = 1;
                    parserViews[METER.level][conversation.id][startDate] = conversation.Props.Date.started;
                }

                removeCookie(cookieName);
                setCookie(cookieName, JSON.stringify(parserViews), new Date('9999-01-01'), useCurDomain);

            } else {
                var meteredViews = {},
                    meteredViewsObj = meteredViews[METER.level] = {};

                meteredViewsObj['_' + articleCount] = 1;
                meteredViewsObj['_' + deviceArticleCount] = 1;
                meteredViewsObj[activeConvoId] = conversation.id;

                meteredViewsObj[conversation.id] = {};
                meteredViewsObj[conversation.id][articleCount] = 1;
                meteredViewsObj[conversation.id][deviceArticleCount] = 1;
                meteredViewsObj[conversation.id][startDate] = conversation.Props.Date.started;

                removeCookie(cookieName);
                setCookie(cookieName, JSON.stringify(meteredViews), new Date('9999-01-01'), useCurDomain);
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getViewsData = function () {
        var fnName = 'getViewsData';

        try {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            var articleCookie = getCookie(cookieName);
            var parserViews;
            if (articleCookie) {
                parserViews = JSON.parse(articleCookie);
            }
            var data = {
                parserViews: parserViews,
                cookieName: cookieName,
                useCurDomain: useCurDomain
            };
            return data;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var recalculateDynamicMeterArticleViewCount = function (dynamicMeter) {
        var dynamicMeterViewCount = 0;
        for (var key in dynamicMeter) {
            if (/^(0|[1-9]\d*)$/.test(key) && dynamicMeter[key] != null && (typeof (dynamicMeter[key])).toLowerCase() == 'object') {
                dynamicMeterViewCount += dynamicMeter[key][CnnXt.Common.ConvoArticleCountObj.article_count] ?
                    dynamicMeter[key][CnnXt.Common.ConvoArticleCountObj.article_count] : 0;
            }
        }

        return dynamicMeterViewCount;
    }

    var mapServerStorageViewsToDynamicMeterViews = function (viewsFromStorage, actionData) {
        var fnName = 'mapServerStorageViewsToDynamicMeterViews';
        var dynamicMeterViews = {};

        try {
            dynamicMeterViews['_' + CnnXt.Common.ConvoArticleCountObj.article_count] = viewsFromStorage.ArticleCount;
            dynamicMeterViews['_' + CnnXt.Common.ConvoArticleCountObj.device_article_count] = viewsFromStorage.DeviceArticleCount;
            dynamicMeterViews[CnnXt.Common.MeteredArticleCountObj.active_convo_id] = viewsFromStorage.ActiveConversationId;

            if (viewsFromStorage.Conversations) {
                viewsFromStorage.Conversations.forEach(function (conversation) {
                    dynamicMeterViews[conversation.Id] = {};

                    dynamicMeterViews[conversation.Id][CnnXt.Common.ConvoArticleCountObj.article_count] = conversation.ViewCount;
                    dynamicMeterViews[conversation.Id][CnnXt.Common.ConvoArticleCountObj.device_article_count] = conversation.DeviceViewCount;
                    dynamicMeterViews[conversation.Id][CnnXt.Common.ConvoArticleCountObj.start_date] = conversation.StartDate;

                    if (conversation.Actions && actionData) {
                        var repeatAfterKey = CnnXt.Common.TimeRepeatableActionsCS.repeat_after;
                        var countKey = CnnXt.Common.TimeRepeatableActionsCS.count;
                        actionData[conversation.Id] = {};
                        conversation.Actions.forEach(function(action) {
                            actionData[conversation.Id][action.Id] = {};
                            actionData[conversation.Id][action.Id][repeatAfterKey] = action.RepeatAfter;
                            actionData[conversation.Id][action.Id][countKey] = action.Count;
                        });
                    }
                });
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
        return dynamicMeterViews;
    }

    var processViewData = function (successData) {
        var fnName = 'processViewData';

        try {
            var data = getViewsData();
            if (successData.AllowedIpSet) {
                CnnXt.Storage.SetWhitelistSetIdCookie({ Id: successData.AllowedIpSet.Id, Expiration: successData.AllowedIpSet.Expiration },
                    new Date(successData.AllowedIpSet.Expiration));
            }

            var parserViews = {};
            var actionData = {};

            if (successData.DynamicMeterViews) {
                for (var dynamicMeterKey in successData.DynamicMeterViews) {
                    if (successData.DynamicMeterViews.hasOwnProperty(dynamicMeterKey)) {

                        var dynamicMeterId = CnnXt.Utils.GetDynamicMeterIdByKey(dynamicMeterKey);

                        if (successData.DynamicMeterViews[dynamicMeterKey]) {
                            parserViews[dynamicMeterId] = mapServerStorageViewsToDynamicMeterViews(successData.DynamicMeterViews[dynamicMeterKey], actionData);
                        }
                    }
                }
            }

            if (__.keys(actionData).length) {
                var config = CnnXt.Storage.GetLocalConfiguration();
                var useParentDomain = false;
                var keyName = CnnXt.Common.StorageKeys.connext_time_repeatable_actions;
                if (config && config.Settings) {
                    useParentDomain = config.Settings.UseParentDomain;
                }

                if (useParentDomain) {
	                keyName += CnnXt.Utils.GetCookieNamePostfix();
	                setCookie(keyName, JSON.stringify(actionData), new Date('9999-01-01'), false);
                } else {
	                setLocalStorage(keyName, actionData);
	            }
            }

            setCookie(data.cookieName,
                JSON.stringify(parserViews),
                new Date('9999-01-01'),
                data.useCurDomain);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var processLinkedDevicesViewData = function (successData) {
        var fnName = 'processLinkedDevicesViewData';

        try {
            var data = getViewsData(),
            parserViews = data.parserViews;

            if (successData.DynamicMeterViews) {
                for (var dynamicMeterKey in successData.DynamicMeterViews) {
                    if (successData.DynamicMeterViews.hasOwnProperty(dynamicMeterKey)) {

                        var dynamicMeterId = CnnXt.Utils.GetDynamicMeterIdByKey(dynamicMeterKey);

                        if (successData.DynamicMeterViews[dynamicMeterKey]) {
                            if (parserViews[dynamicMeterId]) {
                                var dynamicMeter = parserViews[dynamicMeterId];
                                var viewsFromStorage = successData.DynamicMeterViews[dynamicMeterKey];
                                if(viewsFromStorage.Conversations) {
                                    viewsFromStorage.Conversations.forEach(function (conversation) {
                                        if (dynamicMeter[conversation.Id]) {
                                            var updatedViewCount = conversation.ViewCount - conversation.DeviceViewCount +
                                                dynamicMeter[conversation.Id][CnnXt.Common.ConvoArticleCountObj.device_article_count];

                                            dynamicMeter[conversation.Id][CnnXt.Common.ConvoArticleCountObj.article_count] =
                                                updatedViewCount > 0 ? updatedViewCount : conversation.ViewCount;
                                        } else {
                                            dynamicMeter[conversation.Id] = {};
                                            dynamicMeter[conversation.Id][CnnXt.Common.ConvoArticleCountObj.article_count] = conversation.ViewCount;
                                            dynamicMeter[conversation.Id][CnnXt.Common.ConvoArticleCountObj.device_article_count] = conversation.DeviceViewCount;
                                            dynamicMeter[conversation.Id][CnnXt.Common.ConvoArticleCountObj.start_date] = conversation.StartDate;
                                        }
                                    });
                                }

                                dynamicMeter['_' + CnnXt.Common.ConvoArticleCountObj.article_count] = recalculateDynamicMeterArticleViewCount(dynamicMeter);

                            } else {
                                parserViews[dynamicMeterId] = mapServerStorageViewsToDynamicMeterViews(successData.DynamicMeterViews[dynamicMeterKey]);
                            }
                        }
                    }
                }
            }

            setCookie(data.cookieName,
                JSON.stringify(parserViews),
                new Date('9999-01-01'),
                data.useCurDomain);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var checkViewCookies = function () {
        var fnName = 'checkViewCookies';

        try {
            var data = getViewsData();
            var parserViews = data.parserViews;
            var deferred = $.Deferred();

            if (!parserViews) {
                CnnXt.API.GetViewData()
                    .done(function (successData) {
                        if (successData) {
                            processViewData(successData);
                        }

                        setUpdateArticleCountCookie();

                        deferred.resolve();
                    })
                    .fail(function (error) {
                        deferred.resolve();
                    });
            } else {
                deferred.resolve();
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }

        return deferred.promise();
    };

    var getUpdateArticleCountCookie = function () {
        return getCookie(CnnXt.Common.StorageKeys.connext_updateArticleCount + CnnXt.Utils.GetCookieNamePostfix());
    };

    var setUpdateArticleCountCookie = function () {
        var expire = new Date();
        expire.setHours(expire.getHours() + CnnXt.GetOptions().ViewsUpdateFromServerPeriod);
        return setCookie(CnnXt.Common.StorageKeys.connext_updateArticleCount + CnnXt.Utils.GetCookieNamePostfix(), 1, expire);
    }

    var getArticleCookie = function (convId) {
        var fnName = 'getArticleCookie';

        try {
            var data = getViewsData();
            var parserViews = data.parserViews;
            for (var meterLevelKey in parserViews) {
                if (parserViews[meterLevelKey] != null && (typeof (parserViews[meterLevelKey])).toLowerCase() == 'object') {
                    for (var key in parserViews[meterLevelKey]) {
                        if (key == convId) {
                            return parserViews[meterLevelKey][key];
                        }
                    }
                }
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getCookies = function () {
        var fnName = 'getCookies';

        try {
            var pairs = document.cookie.split(";");
            var cookies = {};
            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i].split("=");
                cookies[pair[0]] = unescape(pair[1]);
            }
            return cookies;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var resetViews = function () {
        var fnName = 'resetViews';

        try {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            var empty = {};
            setCookie(cookieName, JSON.stringify(empty), new Date('9999-01-01'), useCurDomain);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var clearUserStorage = function () {
        Cookies.remove(CnnXt.Common.StorageKeys.userToken);
        Cookies.remove(CnnXt.Common.StorageKeys.accessToken);
        Cookies.remove("userToken");
        Cookies.remove("userMasterId");
        localStorage.removeItem("janrainCaptureProfileData");
        localStorage.removeItem("janrainCaptureReturnExperienceData");
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.zipCodes);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.state);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.data);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_profile);
        $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_data);
        CnnXt.Storage.SetUserState("Logged Out");
        removeCookie('ExternalUserId');
        removeCookie('connext_user_profile');
        removeCookie('connext_user_data');
    }

    var resetConversationArticleCount = function (conversation) {
        var fnName = 'resetConversationArticleCount';

        try {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            var articleCount = CnnXt.Common.ConvoArticleCountObj.article_count,
                deviceArticleCount = CnnXt.Common.ConvoArticleCountObj.device_article_count;

            var articleCookie = getCookie(cookieName);
            if (articleCookie) {
                var parserViews = JSON.parse(articleCookie),
                    meterView = parserViews[METER.level],
                    convoView = meterView[conversation.id];

                if (meterView) {
                    if (convoView) {
                        meterView['_' + articleCount] = meterView['_' + articleCount] - convoView[articleCount];
                        meterView['_' + deviceArticleCount] = meterView['_' + deviceArticleCount] - convoView[deviceArticleCount];
                        convoView[articleCount] = 0;
                        convoView[deviceArticleCount] = 0;
                    }
                }
                setCookie(cookieName, JSON.stringify(parserViews), new Date('9999-01-01'), useCurDomain);
            }
            CnnXt.Storage.SetViewedArticles([], conversation.id);
            CnnXt.Storage.ResetRepeatablesInConversation(conversation);
            CnnXt.Storage.RemoveTimeRepeatableActionData(conversation.id);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Initializing Storage Module...");
            addEventListners();
        },
        GetLocalConfiguration: function () {
            return getLocalStorage("configuration");
        },
        SetLocalConfiguration: function (data) {
            localStorage.setItem("IsLocalConfig", true);
            return setLocalStorage('configuration', data);
        },
        GetUserState: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.user.state);
        },
        SetUserState: function (state) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.user.state, state);
        },
        GetUserZipCodes: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes);
        },
        SetCalculatedZipCode: function (zipCode) {
            var fnName = 'SetCalculatedZipCode';

            try {
                if (zipCode.split(' ').length == 2) {
                    zipCode = zipCode.split(' ')[0];
                }

                $.jStorage.set(CnnXt.Common.StorageKeys.customZip, zipCode);
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        SetUserZipCodes: function (codes) {
            return setLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes, codes);
        },
        GetActualZipCodes: function () {
            var fnName = 'GetActualZipCodes';

            try {
                var userZipCodes;

                if (CnnXt.User.isUserHasHighState()) {
                    userZipCodes = getLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes) || [];
                } else {
                    userZipCodes = [$.jStorage.get(CnnXt.Common.StorageKeys.customZip)];
                }

                return userZipCodes;
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        GetLastPublishDate: function () {
            return getCookie(CnnXt.Utils.GetCookieName("lastPublishDate"));
        },
        SetLastPublishDate: function (data, expired) {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            return setCookie(CnnXt.Utils.GetCookieName("lastPublishDate"), data, expired, useCurDomain);
        },
        GetCurrentConversations: function () {
            var currentConvos = getLocalStorage(CnnXt.Common.StorageKeys.conversations.current);
            return (currentConvos) ? currentConvos : {};
        },
        SetCurrentConversations: function (curConvos) {
            return setLocalStorage(CnnXt.Common.StorageKeys.conversations.current, curConvos);
        },
        GetCampaignData: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configuration) ? getLocalStorage(CnnXt.Common.StorageKeys.configuration).Campaign : null;
        },
        GetCurrentConversationViewCount: function () {
            var currentConvo = CnnXt.Storage.GetCurrentConversation();

            var convoId = null;
            if (currentConvo) {
                convoId = currentConvo.id;
            } else {
                convoId = CnnXt.Storage.GetActiveConversationId();
            }
            if (!convoId) {
                return 0;
            }

            var meterLevel = METER.level;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            var articleCookie = getCookie(cookieName);
            if (articleCookie) {
                try {
                    var parserViews = JSON.parse(articleCookie);
                    if (parserViews[meterLevel]) {
                        return parserViews[meterLevel][convoId] ? parserViews[meterLevel][convoId][CnnXt.Common.ConvoArticleCountObj.article_count] : 0;
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, 'GetCurrentConversationViewCount', ex);
                    return 0;
                }
            }
            return 0;
        },
        GetCurrenDynamicMeterViewCount: function() {
            var meterLevel = CnnXt.GetOptions().currentMeterLevel;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            var articleCookie = getCookie(cookieName);
            if (articleCookie) {
                try {
                    var parserViews = JSON.parse(articleCookie);
                    if (parserViews[meterLevel]) {
                        return parserViews[meterLevel]['_' + CnnXt.Common.ConvoArticleCountObj.article_count];
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, 'GetCurrenDynamicMeterViewCount', ex);
                    return 0;
                }
            }
            return 0;
        },
        GetViewedArticles: function (conversationId) {
            var key = CnnXt.Common.StorageKeys.viewedArticles;
            var viewsObj = getLocalStorage(key);
            if (viewsObj)
                return viewsObj[conversationId];

        },
        SetViewedArticles: function (articles, conversationId) {
            var key = CnnXt.Common.StorageKeys.viewedArticles;
            var viewsObj = getLocalStorage(key);
            if (viewsObj == null) {
                viewsObj = {};
            }
            viewsObj[conversationId] = articles;
            setLocalStorage(key, viewsObj);
        },
        UpdateViewedArticles: function (conversation) {
            var fnName = 'UpdateViewedArticles';

            try {
                var viewedArticles = CnnXt.Storage.GetViewedArticles(conversation.id),
                    articleUrl = CnnXt.Utils.GetUrl(),
                    options = CnnXt.GetOptions(),
                    articleHash;
                if (viewedArticles == null)
                    viewedArticles = [];
                if (options.articlesCounter && options.articlesCounter.params && options.articlesCounter.params.length) {
                    var params = options.articlesCounter.params,
                        domain = location.hostname,
                        indicatorOfTheArticle = domain + "_";

                    params.forEach(function (param) {
                        var paramValue = CnnXt.Utils.getQueryParamByName(param);

                        if (paramValue) {
                            indicatorOfTheArticle += (param + "=" + paramValue);
                        }
                    });

                    articleHash = MD5(indicatorOfTheArticle);
                } else {
                    articleHash = MD5(articleUrl);
                }
                if (viewedArticles.indexOf(articleHash) > -1) {
                    if (!$.jStorage.get("uniqueArticles") && CnnXt.GetOptions().debug) {
                        incrementView(conversation);
                    }
                } else {
                    viewedArticles.push(articleHash);
                    incrementView(conversation);
                    CnnXt.Storage.SetViewedArticles(viewedArticles, conversation.id);
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        ResetConversationViews: function (conversation, useParentDomain) {
            var fnName = 'ResetConversationViews';

            try {
                if (conversation) {
                    conversation.Props.views = 0;
                    CnnXt.Storage.SetViewedArticles([], conversation.id);
                    resetConversationArticleCount(conversation);
                    CnnXt.API.ServerStorageResetConversationViews(conversation.id);
                } else {
                    setLocalStorage(CnnXt.Common.StorageKeys.viewedArticles, {});
                    resetViews();
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        GetRepeatablesInConv: function (actionId) {
            var fnName = 'GetRepeatablesInConv';

            try {
                if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)) {
                    setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, {});
                }

                var obj = getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);

                if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)[actionId]) {
                    obj[actionId] = 0;
                    setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, obj);
                }

                return getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)[actionId];
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        UpdateRepeatablesInConv: function (actionId) {
            var fnName = 'UpdateRepeatablesInConv';

            try {
                if (!getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv)) {
                    setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, {});
                }
                var obj = getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
                obj[actionId] = obj[actionId] + 1;
                setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, obj);
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        ResetRepeatablesInConversation: function(conversation) {
            var fnName = 'ClearRepeatablesInConversation';
                
            try {
                var repeatables = getLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
                if (repeatables && conversation && conversation.Actions) {
                    conversation.Actions.forEach(function(action) {
                        if (action.id && repeatables[action.id]) {
                            repeatables[action.id] = 0;
                        }
                    });
                    setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, repeatables);
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        ClearRepeatablesData: function() {
            var fnName = 'ResetRepeatablesData';

            try {
                setLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv, {});
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        ClearConfigSettings: function () {
            var fnName = 'ClearConfigSettings';

            try {
                var conversation = CnnXt.Storage.GetCurrentConversation();

                if (conversation){
                    CnnXt.Storage.SetViewedArticles([], conversation.id);
                }
                
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }

            removeLocalStorage(CnnXt.Common.StorageKeys.conversations.current);
            removeLocalStorage(CnnXt.Common.StorageKeys.conversations.previous);
            removeLocalStorage(CnnXt.Common.StorageKeys.viewedArticles);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode);
            removeLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.user.state);
            removeLocalStorage(CnnXt.Common.StorageKeys.user.zipCodes);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_profile);
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.connext_user_data);
            removeLocalStorage(CnnXt.Common.StorageKeys.customZip);
            removeLocalStorage(CnnXt.Common.StorageKeys.repeatablesInConv);
            localStorage.removeItem('_matherAnonId');
            removeLocalStorage(CnnXt.Common.StorageKeys.configuration);
        },
        ClearUser: function () {
            clearUserStorage();
        },
        Logout: function () {
            clearUserStorage();
            removeCookie(CnnXt.Common.StorageKeys.igmRegID);
            removeCookie(CnnXt.Common.StorageKeys.igmContent);
            removeCookie(CnnXt.Common.StorageKeys.igmAuth);
        },
        SetAccessToken: function (token) {
            return setCookie("accessToken", token);
        },
        GetAccessToken: function () {
            LOGGER.debug(NAME, "GetAccessToken", CnnXt.Common.StorageKeys.accessToken);
            return getCookie("accessToken");
        },
        GetCurrentConversation: function () {
            return getLocalStorage("CurrentConversation");
        },
        SetCurrentConversation: function (e) {
            setLocalStorage("CurrentConversation", e);
        },
        SetUserToken: function (token) {
            return setCookie("userToken", token, 365);
        },
        GetUserToken: function () {
            return getCookie("userToken");
        },
        SetigmRegID: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie(CnnXt.Common.StorageKeys.igmRegID, value, expire);
        },
        GetigmRegID: function () {
            return Cookies.get(CnnXt.Common.StorageKeys.igmRegID);
        },
        SetIgmContent: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie(CnnXt.Common.StorageKeys.igmContent, value, expire);
        },
        GetIgmContent: function () {
            return getCookie(CnnXt.Common.StorageKeys.igmContent);
        },
        SetIgmAuth: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 1);
            return setCookie(CnnXt.Common.StorageKeys.igmAuth, value, expire);
        }, 
        GetIgmAuth: function () {
            return getCookie(CnnXt.Common.StorageKeys.igmAuth);
        },
        SetExternalUserId: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 30);
            return setCookie('ExternalUserId', value, expire);
        },
        GetExternalUserId: function () {
            return Cookies.get("ExternalUserId");
        },
        SetUserRegId: function (token) {
            return setCookie("userMasterId", token, 365);
        },
        GetUserRegId: function () {
            return getCookie("userMasterId");
        },
        GetWhitelistInfoboxCookie: function () {
            var fnName = 'GetWhitelistInfoboxCookie';
            try {
                return getCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistInfobox));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        SetWhitelistInfoboxCookie: function (value) {
            var fnName = 'SetWhitelistInfoboxCookie';
            try {
                var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
                var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistInfobox);
                var expire = new Date();

                expire.setDate(expire.getDate() + 30);

                return setCookie(cookieName, value, expire, useCurDomain);
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        RemoveWhitelistInfoboxCookie: function () {
            var fnName = 'RemoveWhitelistInfoboxCookie';
            try {
                return removeCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistInfobox));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        GetNeedHidePinTemplateCookie: function () {
            var fnName = 'GetNeedHidePinTemplateCookie';
            try {
                return getCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.NeedHidePinTemplate));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        SetNeedHidePinTemplateCookie: function (value) {
            var fnName = 'SetNeedHidePinTemplateCookie';
            try {
                var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
                var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.NeedHidePinTemplate);
                var expire = new Date();

                expire.setDate(expire.getDate() + 1);
                return setCookie(cookieName, value, expire, useCurDomain);
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        RemoveNeedHidePinTemplateCookie: function () {
            var fnName = 'RemoveNeedHidePinTemplateCookie';
            try {
                return removeCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.NeedHidePinTemplate));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        GetWhitelistSetIdCookie: function () {
            var fnName = 'GetWhitelistSetIdCookie';
            try {
                return getCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistSet));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        SetWhitelistSetIdCookie: function (value, expiration) {
            var fnName = 'SetWhitelistSetIdCookie';
            try {
                var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
                var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistSet);
                return setCookie(cookieName, value, expiration, useCurDomain);
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        RemoveWhitelistSetIdCookie: function () {
            var fnName = 'RemoveWhitelistSetIdCookie';
            try {
                return removeCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.WhitelistSet));
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },

        GetJanrainUser: function () {
            var profileData = localStorage.getItem(CnnXt.Common.StorageKeys.janrainUserProfile);

            try {
                return JSON.parse(profileData);
            } catch (ex) {
                LOGGER.exception(NAME, 'GetJanrainUser', ex);
                return null;
            }
        },
        SetSiteCode: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode, data);
        },
        GetSiteCode: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationSiteCode);
        },
        SetConfigCode: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode, data);
        },
        GetConfigCode: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationConfigCode);
        },
        SetIsCustomConfiguration: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom, data);
        },
        SetUserLastUpdateDate: function (data) {
            setLocalStorage(CnnXt.Common.StorageKeys.connext_userLastUpdateDate, data);
        },
        GetUserLastUpdateDate: function () {
            return setLocalStorage(CnnXt.Common.StorageKeys.connext_userLastUpdateDate);
        },
        GetIsCustomConfiguration: function () {
            return getLocalStorage(CnnXt.Common.StorageKeys.configurationIsCustom);
        },
        GetGuid: function () {
            return getCookie(CnnXt.Common.StorageKeys.connext_user_Id);
        },
        SetGuid: function (value) {
            return setCookie(CnnXt.Common.StorageKeys.connext_user_Id, value);
        },
        GetUserData: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.connext_user_data);
        },
        SetUserData: function (value) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.connext_user_data, value);
        },
        GetUserProfile: function () {
            var data = $.jStorage.get(CnnXt.Common.StorageKeys.connext_user_profile);
            return data || null;
        },
        SetUserProfile: function (value) {
            return $.jStorage.set(CnnXt.Common.StorageKeys.connext_user_profile, value);
        },
        GetConnextPaywallCookie: function () {
            return getCookie(CnnXt.Common.StorageKeys.connext_paywallFired);
        },
        SetConnextPaywallCookie: function (value) {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            return setCookie(CnnXt.Common.StorageKeys.connext_paywallFired, value, null, useCurDomain);
        },
        SetAccountDataExpirationCookie: function (value) {
            var expire = new Date();
            expire.setDate(expire.getDate() + 1);
            return Cookies.set('Connext_AccountDataExpirationCookie', value, { expires: expire });
        },
        GetAccountDataExpirationCookie: function () {
            return Cookies.get("Connext_AccountDataExpirationCookie");
        },
        WrongPin: function () {
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.PinAttempts);
            var value = CnnXt.Storage.GetPinAttempts();
            if (value) {
                value++;
            } else {
                value = 1;
            }
            var expire = new Date();
            expire.setMinutes(expire.getMinutes() + 15);
            return setCookie(cookieName, value, expire, useCurDomain);
        },
        GetPinAttempts: function () {
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.PinAttempts);
            return getCookie(cookieName);
        },
        ResetPinAttemptsCookie: function () {
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.PinAttempts);
            removeCookie(cookieName);
        },
        SetRegistrationType: function (data) {
            $.jStorage.set(CnnXt.Common.StorageKeys.connext_auth_type, data);
        },
        GetRegistrationType: function () {
            return $.jStorage.get(CnnXt.Common.StorageKeys.connext_auth_type) || {};
        },
        GetDeviceViews: function (convId) {
            var conversationViews = getArticleCookie(convId);
            return conversationViews
                ? conversationViews[CnnXt.Common.ConvoArticleCountObj.device_article_count]
                : undefined;
        },
        GetViews: function (convId) {
            var conversationViews = getArticleCookie(convId);
            return conversationViews
                ? conversationViews[CnnXt.Common.ConvoArticleCountObj.article_count]
                : undefined;
        },
        GetConversationStartDate: function(conversationId) {
            var fnName = 'GetConversationStartDate';

            try {
                var conversationViews = getArticleCookie(conversationId);
                return conversationViews ? conversationViews[CnnXt.Common.ConvoArticleCountObj.start_date] : null;
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
                return null;
            }
        },
        CheckViewCookies: function () {
            return checkViewCookies();
        },
        GetViewsData: function () {
            return getViewsData();
        },
        SetMeter: function (meter) {
            METER = meter;
        },
        GetMeter: function () {
            return METER;
        },
        GetDomain: function (isRoot) {
            var domain = null,
                domainStorageKey = (isRoot) ? CnnXt.Common.StorageKeys.connext_root_domain : CnnXt.Common.StorageKeys.connext_domain;

            domain = getLocalStorage(domainStorageKey);

            if (!domain) {
                domain = CnnXt.Utils.CalculateDomain(isRoot);

                setLocalStorage(domainStorageKey, domain);
            }

            return domain;
        },
        ResetConversationArticleCount: function (conversation) {
            return resetConversationArticleCount(conversation);
        },
        GetActiveConversationId: function (meterLevel) {
            if (!meterLevel)
                meterLevel = METER.level;
            var data = getViewsData();
            if (data.parserViews && data.parserViews[meterLevel] && data.parserViews[meterLevel][CnnXt.Common.MeteredArticleCountObj.active_convo_id]) {
                return data.parserViews[meterLevel][CnnXt.Common.MeteredArticleCountObj.active_convo_id];
            }
            return 0;
        },
        SetActiveConversationId: function (convId, meterLevel) {
            if (!meterLevel)
                meterLevel = METER.level;
            var data = getViewsData();

            var parsedViews = data.parserViews ? data.parserViews : {};
            parsedViews[meterLevel] = parsedViews[meterLevel] ? parsedViews[meterLevel] : {};
            parsedViews[meterLevel][CnnXt.Common.MeteredArticleCountObj.active_convo_id] = convId;
            var useCurDomain = !Connext.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            setCookie(cookieName, JSON.stringify(parsedViews), new Date('9999-01-01'), useCurDomain);
        },
        GetTimeRepeatableActionData: function (action) {
            try {
                var config = CnnXt.Storage.GetLocalConfiguration(),
                    useParentDomain = false,
                    repeatableData = null,
                    result = null,
                    keyName = CnnXt.Common.StorageKeys.connext_time_repeatable_actions;

                if (config && config.Settings) {
                    useParentDomain = config.Settings.UseParentDomain;
                }

                if (useParentDomain) {
                    keyName += CnnXt.Utils.GetCookieNamePostfix();

                    repeatableData = JSON.parse(getCookie(keyName) || '{}');
                } else {
                    repeatableData = getLocalStorage(keyName);
                }

                if (!action) {
                    result = repeatableData;
                } else if (repeatableData && repeatableData[action.ConversationId] && repeatableData[action.ConversationId][action.id]) {
                    result = {
                        date: repeatableData[action.ConversationId][action.id][CnnXt.Common.TimeRepeatableActionsCS.repeat_after],
                        count: repeatableData[action.ConversationId][action.id][CnnXt.Common.TimeRepeatableActionsCS.count]
                    };
                }

                return result;
            } catch (ex) {
                LOGGER.exception(NAME, 'GetTimeRepeatableActionData', ex);
                return null;
            }
        },
        SetTimeRepeatableActionData: function (action) {
            try {
                var config = CnnXt.Storage.GetLocalConfiguration(),
                    useParentDomain = false,
                    actionRepeatableData = null,
                    keyName = CnnXt.Common.StorageKeys.connext_time_repeatable_actions;

                if (config && config.Settings) {
                    useParentDomain = config.Settings.UseParentDomain;
                }

                actionRepeatableData = CnnXt.Storage.GetTimeRepeatableActionData() || {};

                if (!actionRepeatableData[action.ConversationId]) {
                    actionRepeatableData[action.ConversationId] = {}
                }

                if (!actionRepeatableData[action.ConversationId][action.id]) {
                    actionRepeatableData[action.ConversationId][action.id] = {};
                }

                var newActionData = {},
                    count = actionRepeatableData[action.ConversationId][action.id][CnnXt.Common.TimeRepeatableActionsCS.count] || 0,
                    pendingExecutionDate = CnnXt.Utils.AddTimeInervalToDate(action.When.Time.RepeatAfterTime, action.When.Time.RepeatAfterTimeType);

                newActionData[CnnXt.Common.TimeRepeatableActionsCS.repeat_after] = pendingExecutionDate;
                newActionData[CnnXt.Common.TimeRepeatableActionsCS.count] = count + 1;

                actionRepeatableData[action.ConversationId][action.id] = newActionData;

                if (useParentDomain) {
                    keyName += CnnXt.Utils.GetCookieNamePostfix();

                    setCookie(keyName, JSON.stringify(actionRepeatableData), new Date('9999-01-01'), false);
                } else {
                    setLocalStorage(keyName, actionRepeatableData);
                }
            } catch (ex) {
                LOGGER.exception(NAME, 'SetTimeRepeatableActionData', ex);
            }
        },
        RemoveTimeRepeatableActionData: function (conversationId) {
            try {
                var config = CnnXt.Storage.GetLocalConfiguration(),
                    useParentDomain = false,
                    keyName = CnnXt.Common.StorageKeys.connext_time_repeatable_actions,
                    repeatableData = null;

                if (config && config.Settings) {
                    useParentDomain = config.Settings.UseParentDomain;
                }

                if (!conversationId) {
                    removeLocalStorage(keyName);
                    removeCookie(keyName + CnnXt.Utils.GetCookieNamePostfix());
                } else {
                    repeatableData = CnnXt.Storage.GetTimeRepeatableActionData();

                    if (repeatableData) {
                        delete repeatableData[conversationId];
                    }
                   
                    if (useParentDomain) {
                        keyName += CnnXt.Utils.GetCookieNamePostfix();

                        setCookie(keyName, JSON.stringify(repeatableData), new Date('9999-01-01'), false);
                    } else {
                        setLocalStorage(keyName, repeatableData);
                    }
                }
            } catch (ex) {
                LOGGER.exception(NAME, 'RemoveTimeRepeatableActionData', ex);
            }
        },

        UpdateWhitelistSetCookieName: function () {
            var fnName = 'UpdateWhitelistSetCookieName';
            try {
                var oldCookieName = CnnXt.Common.StorageKeys.WhitelistSet;
                var newCookieName = CnnXt.Utils.GetCookieName(oldCookieName);

                if (getCookie(newCookieName) == undefined && getCookie(oldCookieName) != undefined) {
                    var whitelistSet = JSON.parse(getCookie(oldCookieName));
                    if (whitelistSet.Id && whitelistSet.Expiration) {
                        CnnXt.Storage.SetWhitelistSetIdCookie( { Id: whitelistSet.Id, Expiration: whitelistSet.Expiration }, new Date(whitelistSet.Expiration));
                        removeCookie(oldCookieName);
                    }
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        UpdateWhitelistInfoboxCookieName: function () {
            var fnName = 'UpdateWhitelistInfoboxCookieName';
            try {
                var oldCookieName = CnnXt.Common.StorageKeys.WhitelistInfobox;
                var newCookieName = CnnXt.Utils.GetCookieName(oldCookieName);

                if (getCookie(newCookieName) == undefined && getCookie(oldCookieName) != undefined) {
                    CnnXt.Storage.SetWhitelistInfoboxCookie(true);
                    removeCookie(oldCookieName);
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },
        UpdateNeedHidePinTemplateCookieName: function () {
            var fnName = 'UpdateNeedHidePinTemplateCookieName';
            try {
                var oldCookieName = CnnXt.Common.StorageKeys.NeedHidePinTemplate;
                var newCookieName = CnnXt.Utils.GetCookieName(oldCookieName);

                if (getCookie(newCookieName) == undefined && getCookie(oldCookieName) != undefined) {
                    CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
                    removeCookie(oldCookieName);
                }
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
            }
        },

        GetCookie: function (name) {
            return getCookie(name);
        },
        GetLocalViewData: function () {
            var fnName = 'getLocalViewData';

            if (LOGGER) {
                LOGGER.debug(NAME, fnName, "Get local view data");
            }

            try {
                var data = {};
                var viewsCookie = CnnXt.Storage.GetViewsData();
                var repeatableActionsCookie = CnnXt.Storage.GetTimeRepeatableActionData();

                data.AllowedIpSet = CnnXt.Storage.GetWhitelistSetIdCookie()
                    ? JSON.parse(CnnXt.Storage.GetWhitelistSetIdCookie())
                    : undefined;

                data.DynamicMeterViews = {};

                if (viewsCookie != undefined && viewsCookie.parserViews != undefined) {
                    for (var meterLevelId in viewsCookie.parserViews) {
                        var meterLevelKey = CnnXt.Common.MeterLevels[meterLevelId] != undefined ? CnnXt.Common.MeterLevels[meterLevelId] : meterLevelId;

                        var conversations = [];

                        for (var key in viewsCookie.parserViews[meterLevelId]) {
                            if (/^-?(0|[1-9]\d*)$/.test(key) && viewsCookie.parserViews[meterLevelId][key] != null
                                && (typeof (viewsCookie.parserViews[meterLevelId][key])).toLowerCase() == 'object') {

                                var conversationActions = null;
                                if (repeatableActionsCookie && repeatableActionsCookie[key]) {
                                    conversationActions = [];
                                    for (var actionKey in repeatableActionsCookie[key]) {
                                        if (/^(0|[1-9]\d*)$/.test(actionKey) && repeatableActionsCookie[key][actionKey] != null
                                            && (typeof (repeatableActionsCookie[key][actionKey])).toLowerCase() == 'object') {
                                            conversationActions.push({
                                                Id: +actionKey,
                                                RepeatAfter: repeatableActionsCookie[key][actionKey][CnnXt.Common.TimeRepeatableActionsCS.repeat_after],
                                                Count: repeatableActionsCookie[key][actionKey][CnnXt.Common.TimeRepeatableActionsCS.count]
                                            });
                                        }
                                    }
                                }

                                conversations.push({
                                    Id: +key,
                                    ViewCount: viewsCookie.parserViews[meterLevelId][key][CnnXt.Common.ConvoArticleCountObj.device_article_count],
                                    StartDate: viewsCookie.parserViews[meterLevelId][key][CnnXt.Common.ConvoArticleCountObj.start_date],
                                    Actions: conversationActions
                                });
                            }
                        }

                        data.DynamicMeterViews[meterLevelKey] = {
                            ActiveConversationId: viewsCookie.parserViews[meterLevelId][CnnXt.Common.MeteredArticleCountObj.active_convo_id],
                            Conversations: conversations
                        };
                    }
                }
                if (LOGGER) {
                    LOGGER.debug(NAME, fnName, "Local view data is found", data);
                }

                return data;
            } catch (ex) {
                if (LOGGER) {
                    LOGGER.exception(NAME, fnName, ex);
                }
                return {};
            }
        },

        SetCookie: function (key, data, expiration, useWholeDomain) {
            setCookie(key, data, expiration, useWholeDomain);
        },
        GetCookies: function () {
            return getCookies();
        }
    }
};
var CookieMigration = function ($) {

    var NAME = 'CookieMigration',
        LOGGER;

    var migrateDataFromPrevVersionStructure = function () {
        var fnName = 'migrateDataFromPrevVersionStructure';
        try {
            var cookieName = CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure);
            if (CnnXt.Storage.GetCookie(cookieName))
                return;

            cookieName = CnnXt.Utils.GetCookieName("connext_viewstructure");
            var oldCookie = CnnXt.Storage.GetCookie(cookieName);
            if (!oldCookie)
                return;
            var parsedOldCookie = JSON.parse(oldCookie);
            CnnXt.Storage.SetCookie(cookieName, parsedOldCookie, new Date('2018-04-30'));
            if (parsedOldCookie == {})
                return;
            var useCurDomain = !CnnXt.Storage.GetLocalConfiguration().Settings.UseParentDomain;
            var newStructure = {};
            for (var item in parsedOldCookie) {
                var convoId;
                if (item.indexOf("_device") > 0) {
                    convoId = item.split('_')[0];
                } else convoId = item;
                var meterlevelId = findMeterLevelByConversationId(convoId);
                if (meterlevelId != 0) {
                    newStructure[meterlevelId] = newStructure[meterlevelId] ? newStructure[meterlevelId] : {};
                    newStructure[meterlevelId][convoId] = newStructure[meterlevelId][convoId]
                        ? newStructure[meterlevelId][convoId]
                        : {};
                    if (item.indexOf("_device") > 0) {
                        newStructure[meterlevelId][convoId][CnnXt.Common.ConvoArticleCountObj.device_article_count] =
                            parsedOldCookie[item];
                        try {
                            newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.device_article_count] =
                                newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.device_article_count]
                                    ? parseInt(newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.device_article_count])
                                    : parseInt(parsedOldCookie[item]);
                        } catch (ex) {
                            LOGGER.exception(NAME, "cannot parse meterlevel viewsCount", fnName, ex);
                        }
                    } else {
                        newStructure[meterlevelId][convoId][CnnXt.Common.ConvoArticleCountObj.article_count] = parsedOldCookie[item];
                        try {
                            newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.article_count] =
                                newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.article_count]
                                    ? parseInt(newStructure[meterlevelId]['_' + CnnXt.Common.ConvoArticleCountObj.article_count])
                                    : parseInt(parsedOldCookie[item]);
                        } catch (ex) {
                            LOGGER.exception(NAME, "cannot parse meterlevel viewsCount", fnName, ex);
                        }
                    }
                }
            }
            CnnXt.Storage.SetCookie(CnnXt.Utils.GetCookieName(CnnXt.Common.StorageKeys.connext_viewstructure), newStructure, new Date('9999-01-01'), useCurDomain);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var findMeterLevelByConversationId = function (id) {
        var conversationsByMeterLevels = CnnXt.Storage.GetCampaignData().Conversations;
        var currentMeterLevel = 0;
        if (!conversationsByMeterLevels)
            return 0;
        for (var meterLevel in conversationsByMeterLevels) {
            if (conversationsByMeterLevels.hasOwnProperty(meterLevel)) {
                if (conversationsByMeterLevels[meterLevel]) {
                    for (var convo in conversationsByMeterLevels[meterLevel]) {
                        if (conversationsByMeterLevels[meterLevel][convo].id == id) {
                            currentMeterLevel = conversationsByMeterLevels[meterLevel][convo].MeterLevelId;
                            return currentMeterLevel;
                        }
                    }
                }
            }
        }
        return currentMeterLevel;
    };

    var clearOldCookies = function () {
        var fnName = 'clearOldCookies';
        try {
            if (!String.prototype.startsWith) {
                String.prototype.startsWith = function (searchString, position) {
                    position = position || 0;
                    return this.indexOf(searchString, position) === position;
                };
            }

            $.each(CnnXt.Storage.GetCookies(), function (item) {
                var str = item.toString();
                if (str.startsWith(' '))
                { str = str.trim(); }
                str = decodeURIComponent(str);
                if (str.startsWith('Connext_ViewedArticles') || str.startsWith('sub_Connext_ViewedArticles')) {
                    Cookies.remove(str);
                    var domainArr = location.host.split('.');
                    var rootDomain = '.' + domainArr[(domainArr.length - 2)] + '.' + domainArr[(domainArr.length - 1)];
                    Cookies.remove(str, { domain: rootDomain });
                }
            });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var migrate = function () {
        clearOldCookies();
        migrateDataFromPrevVersionStructure();
    };

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Initializing CookieMigration Module...");
        },

        Migrate: migrate
    }
};
var ConnextAPI = function ($) {
    var NAME = "API";
    var LOGGER;

    var OPTIONS;

    var API_URL;
    var BASE_API_ROUTE = "api/";

    var defaultErrorMessage = 'Sorry, there\'s a server problem or a problem with the network. ';


    var ROUTES = {
        GetConfiguration: __.template("configuration/siteCode/<%- siteCode %>/configCode/<%- configCode %>?publishDate=<%- publishDate %>"),
        GetUserByEmailAndPassword: __.template("user/authorize"),
        GetUserByMasterId: __.template("user/masterId/<%- id %>"),
        GetUserByToken: __.template("user/token/<%- token %>"),
        EmailPreferences: "user/emailPreference",
        GetUserLastUpdateDate: __.template("user/getLastUpdateDate?masterId=<%-masterId%>"),
        CheckAccess: __.template("checkAccess/<%- masterId %>"),
        GetUserByEncryptedMasterId: __.template("user/encryptedMasterId?encryptedMasterId=<%- encryptedMasterId %>"),
        ClearServerCache: __.template("clear/siteCode/<%-siteCode%>/configCode/<%-configCode%>"),
        viewsData: "views",
        ServerStorageDeleteViewsByUserId: __.template("views/user/delete?"),
        ServerStorageResetConversationViews: __.template("views/user/delete?"),
        CreateUser: __.template("user/create"),
        ActivateByAccountNumber: __.template("user/ActivateByAccountNumber"),
        ActivateByConfirmationNumber: __.template("user/ActivateByConfirmationNumber"),
        ActivateByZipCodeAndHouseNumber: __.template("user/ActivateByZipCodeAndHouseNumber"),
        ActivateByZipCodeAndPhoneNumber: __.template("user/ActivateByZipCodeAndPhoneNumber"),
        SyncUser: __.template("user/sync"),
        GetDictionaryValue: __.template("dictionary/<%- ValueName %>"),
        CheckDigitalAccess: __.template("user/masterId/<%- masterId %>/DigitalAccess?mode=<%- mode %>"),
        GetClientIpInfo: "utils/ipInfo"
    };

    var Meta = {
        publishFile: {
            url: "",
            responceCode: "",
            publishDate: "",
            ex: ""
        },
        config: {
            isExistsInLocalStorage: "",
            localPublishDate: ""
        },
        clientUrl: "",
        reason: ""
    }

    var Get = function (args) {
        var fnName = "Get";

        try {
            var url = API_URL + ROUTES[args.method](args.options.payload);
            var stringMeta = "";

            LOGGER.debug(NAME, fnName, 'calling...', url, 'args', args);

            if (args.options.meta) {
                stringMeta = JSON.stringify(args.options.meta);
            }

            return $.ajax({
                headers: {
                    'Site-Code': OPTIONS.siteCode,
                    'Paper-Code': CnnXt.GetOptions().paperCode,
                    'Product-Code': CnnXt.Utils.GetProductCode(),
                    'x-test': 'test',
                    'Access-Control-Allow-Origin': '*',
                    'Environment': CnnXt.GetOptions().environment,
                    'settingsKey': CnnXt.GetOptions().settingsKey,
                    'attr': CnnXt.GetOptions().attr,
                    'metaData': stringMeta,
                    'Version': CnnXt.GetVersion(),
                    'Source-System': 'Plugin'
                },
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    if (!data || xhr.status == 204) {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS NULL RESULT >>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onNull)) {
                            args.options.onNull();
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS RESULT>>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onSuccess)) {
                            args.options.onSuccess(data);
                        }
                    }
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);

                    if (__.isFunction(args.options.onError)) {
                        var errorData = JSON.parse(error.responseText);
                        args.options.onError(errorData);
                    }
                },
                complete: function () {
                    if (__.isFunction(args.options.onComplete)) {
                        args.options.onComplete();
                    }
                }
            });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);

            if (__.isFunction(args.options.onError)) {
                args.options.onError();
            }
        }
    };


    var Post = function (args) {
        var fnName = "Post";

        try {
            var url = API_URL + ROUTES[args.method](args.options.payload);
            var stringMeta = "";

            LOGGER.debug(NAME, fnName, 'calling...', url, 'args', args);

            if (args.options.meta) {
                stringMeta = JSON.stringify(args.options.meta);
            }
            return $.ajax({
                headers: {
                    'Site-Code': OPTIONS.siteCode,
                    'Paper-Code': CnnXt.GetOptions().paperCode,
                    'Product-Code': CnnXt.Utils.GetProductCode(),
                    'Config-Code': CnnXt.Storage.GetLocalConfiguration().Settings.Code,
                    'x-test': 'test',
                    'Access-Control-Allow-Origin': '*',
                    'Environment': CnnXt.GetOptions().environment,
                    'settingsKey': CnnXt.GetOptions().settingsKey,
                    'attr': CnnXt.GetOptions().attr,
                    'metaData': stringMeta,
                    'Version': CnnXt.GetVersion(),
                    'Source-System': 'Plugin'
                },
                url: url,
                type: "POST",
                data: args.options.payload,
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    if (!data || xhr.status == 204) {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS NULL RESULT >>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onNull)) {
                            args.options.onNull();
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS RESULT >>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onSuccess)) {
                            args.options.onSuccess(data);
                        }
                    }
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);

                    if (__.isFunction(args.options.onError)) {
                        var errorData = JSON.parse(error.responseText);
                        args.options.onError(errorData);
                    }
                },
                complete: function () {
                    if (__.isFunction(args.options.onComplete)) {
                        args.options.onComplete();
                    }
                }
            });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);

            if (__.isFunction(args.options.onError)) {
                args.options.onError();
            }
        }
    };

    var GetNewsletters = function (args) {
        var fnName = "GetNewsletters";

        try {
            var url = API_URL + ROUTES.EmailPreferences;
            url += "?email=" + args.options.email + "&emailPreferenceId=" + args.options.id;

            LOGGER.debug(NAME, fnName, 'calling...', url, 'args', args);
            return $.ajax({
                headers: {
                    'Site-Code': CnnXt.GetOptions().siteCode,
                    'Access-Control-Allow-Origin': '*',
                    'Environment': CnnXt.GetOptions().environment,
                    'settingsKey': CnnXt.GetOptions().settingsKey,
                    'Version': CnnXt.GetVersion(),
                    'Source-System': 'Plugin'
                },
                url: url,
                type: "GET",
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    if (!data || xhr.status == 204) {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS NULL RESULT >>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onNull)) {
                            args.options.onNull();
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS RESULT >>", "textStatus", textStatus, "data", data);

                        if (__.isFunction(args.options.onSuccess)) {
                            args.options.onSuccess();
                        }
                    }
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);

                    var responseData = CnnXt.Utils.NewsletterErrorHandler(error, defaultErrorMessage);

                    if (__.isFunction(args.options.onError)) {
                        args.options.onError(responseData);
                    }
                },
                complete: function () {
                    if (__.isFunction(args.options.onComplete)) {
                        args.options.onComplete();
                    }
                }
            });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);

            if (__.isFunction(args.options.onError)) {
                args.options.onError();
            }
        }
    };

    var clearServerCache = function () {
        var fnName = 'clearServerCache';
        var payload = {
            siteCode: CnnXt.GetOptions().siteCode,
            configCode: CnnXt.GetOptions().configCode
        };
        var url = API_URL + ROUTES["ClearServerCache"](payload);

        LOGGER.debug(NAME, fnName, 'calling...', url, 'payload', payload);

        return $.ajax({
            headers: { 'attr': CnnXt.GetOptions().attr },
            url: url,
            type: "POST",
            dataType: "json",
            success: function (data, textStatus, xhr) {
                LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data);
            },
            error: function (error) {
                LOGGER.debug(NAME, fnName, "Ajax.Error", error);
            }
        });
    }

    return {
        init: function (options) {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, 'Initializing API Module...');
            OPTIONS = options;
            API_URL = OPTIONS.api + BASE_API_ROUTE;
        },
        GetConfiguration: function (opts) {
            Meta.clientUrl = document.location.href;
            Meta.userAgent = navigator.userAgent;
            Meta.guid = CnnXt.Storage.GetGuid();
            Meta.localConfig = localStorage.getItem("IsLocalConfig");
            opts.meta = Meta;

            return Get({ method: 'GetConfiguration', options: opts });
        },
        GetUserByEmailAndPassword: function (opts) {
            return Post({ method: "GetUserByEmailAndPassword", options: opts });
        },
        ClearServerCache: clearServerCache,
        CheckAccess: function (opts) {
            return Get({ method: "CheckAccess", options: opts });
        },
        GetUserByMasterId: function (opts) {
            return Get({ method: "GetUserByMasterId", options: opts });
        },
        GetUserLastUpdateDate: function (opts) {
            return Get({ method: "GetUserLastUpdateDate", options: opts });
        },
        GetUserByEncryptedMasterId: function (opts) {
            return Get({ method: "GetUserByEncryptedMasterId", options: opts });
        },
        CreateUser: function (opts) {
            return Post({ method: "CreateUser", options: opts });
        },
        ActivateByAccountNumber: function (opts) {
            return Post({ method: "ActivateByAccountNumber", options: opts });
        },
        ActivateByZipCodeAndHouseNumber: function (opts) {
            return Post({ method: "ActivateByZipCodeAndHouseNumber", options: opts });
        },
        ActivateByZipCodeAndPhoneNumber: function (opts) {
            return Post({ method: "ActivateByZipCodeAndPhoneNumber", options: opts });
        },
        ActivateByConfirmationNumber: function (opts) {
            return Post({ method: "ActivateByConfirmationNumber", options: opts });
        },
        SyncUser: function (opts) {
            return Post({ method: "SyncUser", options: opts });
        },
        SendViewData: function (data) {
            var fnName = 'SendViewData';

            var url = API_URL + ROUTES.viewsData;

            LOGGER.debug(NAME, fnName, 'calling...', url, 'data', data);

            return $.ajax({
                url: url,
                headers: {
                    'Environment': CnnXt.GetOptions().environment,
                    'Content-Type': 'application/json'
                },
                type: "POST",
                data: JSON.stringify(data),
                dataType: "json",
                success: function (data, textStatus, xhr) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data);
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);
                }
            });
        },
        GetViewData: function () {
            var fnName = 'GetViewData';

            var data = {
                userId: Fprinting().getDeviceId(),
                configCode: CnnXt.GetOptions().configCode,
                siteCode: CnnXt.GetOptions().siteCode,
                settingsKey: CnnXt.GetOptions().settingsKey
            };

            var url = API_URL + ROUTES.viewsData;

            LOGGER.debug(NAME, fnName, 'calling...', url);

            return $.ajax({
                url: url,
                headers: {
                    'Environment': CnnXt.GetOptions().environment
                },
                type: "GET",
                data: data,
                success: function (data, textStatus, xhr) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data);
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);
                }
            });
        },
        ServerStorageDeleteViewsByUserId: function () {
            var fnName = 'ServerStorageDeleteViewsByUserId';

            var data = {
                userId: CnnXt.GetOptions().deviceId,
                masterId: CnnXt.User.getMasterId(),
                configCode: CnnXt.GetOptions().configCode,
                siteCode: CnnXt.GetOptions().siteCode,
                settingsKey: CnnXt.GetOptions().settingsKey
            };

            var url = API_URL + ROUTES.ServerStorageDeleteViewsByUserId(data);

            LOGGER.debug(NAME, fnName, 'calling...', url, 'data', data);

            return $.ajax({
                url: url,
                headers: {
                    'Environment': CnnXt.GetOptions().environment
                },
                type: "GET",
                data: data
            });
        },
        ServerStorageResetConversationViews: function (conversationId) {
            var fnName = 'ServerStorageResetConversationViews';

            var data = {
                userId: CnnXt.GetOptions().deviceId,
                conversationId: conversationId,
                configCode: CnnXt.GetOptions().configCode,
                siteCode: CnnXt.GetOptions().siteCode,
                settingsKey: CnnXt.GetOptions().settingsKey
            };

            var url = API_URL + ROUTES.ServerStorageResetConversationViews(data);

            LOGGER.debug(NAME, fnName, 'calling...', url, 'data', data);

            return $.ajax({
                url: url,
                headers: {
                    'Environment': CnnXt.GetOptions().environment
                },
                type: "GET",
                data: data,
                success: function (data, textStatus, xhr) {
                    LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data);
                },
                error: function (error) {
                    LOGGER.debug(NAME, fnName, "Ajax.Error", error);
                }
            });
        },
        meta: Meta,
        GetLastPublishDateS3: function () {
            var fnName = "GetLastPublishDateS3";

            try {
                var jsonURL = CnnXt.Common.S3RootUrl[OPTIONS.environment] + 'data/last_publish/' + OPTIONS.siteCode + '.json?_=' + new Date().getTime();

                LOGGER.debug(NAME, fnName, 'jsonURL', jsonURL);

                Meta.publishFile.url = jsonURL;

                return $.ajax({
                    crossDomain: true,
                    contentType: "application/json; charset=utf-8",
                    async: true,
                    url: jsonURL,
                    success: function (data, textStatus) {
                        LOGGER.debug(NAME, fnName, "<< SUCCESS >>", "textStatus", textStatus, "data", data);
                        Meta.publishFile.responceCode = 200;
                    },
                    error: function (error) {
                        LOGGER.debug(NAME, fnName, "Ajax.Error", error);

                        Meta.publishFile.responceCode = a.status;
                        Meta.reason = CnnXt.Common.DownloadConfigReasons.getPublishFailed;
                    }
                });
            } catch (ex) {
                LOGGER.exception(NAME, fnName, ex);
                Meta.reason = CnnXt.Common.DownloadConfigReasons.getPublishFailed;
                Meta.publishFile.ex = ex;
            }
        },
        NewsletterSubscribe: function (opts) {
            return GetNewsletters({ method: "NewsletterSubscribe", options: opts });
        },
        GetProductCode: function () {
            var payload = {
                ValueName: 'productCode'
            }

            return Get({ method: "GetDictionaryValue", options: { payload: payload } });
        },
        CheckDigitalAccess: function (opts) {
            return Get({ method: "CheckDigitalAccess", options: opts });
        },
        GetClientIpInfo: function () {
            var url = CnnXt.Common.APIUrl[CnnXt.GetOptions().environment] + BASE_API_ROUTE + ROUTES.GetClientIpInfo;
            return $.ajax({
                url: url,
                type: "GET"
            });
        }
    }
};

var ConnextUser = function ($) {
    var NAME = "User";
    var LOGGER;
    var OPTIONS;
    var AUTH_TYPE = {};
    var IS_LOGGED_IN = false;
    var AUTH_TIMING = {};// this holds timeing tests for authentication. We set start/end times when we call 3rd party authentications to use in the 'Debug Details' panel.  This let's us show why/if we have long processing times (if they are caused by waiting on the authentication from a 3rd party).
    var FORM_SUBMIT_LOADER, FORM_ALERT;
    var JANRAIN_LOADED;
    var USER_STATES;
    var GUP_SETTINGS;
    var USER_STATE;
    var TIMEOUT;
    var masterId;
    var USER_DATA = {};
    var incorrectCreditsMessage = "UserName or Password invalid. Please try again or click on the Forgot/Reset Password link to update your password, or create an account if you have never registered an email address with us.";

    var NOTIFICATION = {
        show: function (notification) {
            try {
                if (FORM_ALERT) {
                    FORM_ALERT.info(notification).show();
                }
            } catch (ex) {
                LOGGER.exception(NAME, 'NOTIFICATION.show', ex);
            }
        },
        hide: function () {
            try {
                if (FORM_ALERT){
                    FORM_ALERT.hide();
                }
            } catch (ex) {
                LOGGER.exception(NAME, 'NOTIFICATION.hide', ex);
            }
        },
        showAndHide: function (notification, delay) {
            try {
                if (FORM_ALERT) {
                    FORM_ALERT.info(notification);
                    TIMEOUT = setTimeout(function () {
                        FORM_ALERT.find(".alert").remove();
                    }, delay);
                }
            } catch (ex) {
                LOGGER.exception(NAME, 'NOTIFICATION.showAndHide', ex);
            }
        }
    };

    var UI = {
        LoginButton: "[data-mg2-submit=login]:visible",
        LoginAlert: "[data-mg2-alert=login]:visible",
        JanrainLoginBtn: "[data-mg2-submit=janrainLogin]:visible",
        InputUsername: "[data-mg2-alert=login] [data-mg2-input=Email]",
        InputPassword: "[data-mg2-alert=login] [data-mg2-input=Password]",
        ActionShowLogin: "[data-mg2-action=login]",
        LogoutButton: "[data-mg2-action=logout]",
        SubscribeButton: '[data-mg2-action="submit"]',
        SubmitZipCode: '[data-mg2-action="Zipcode"]',
        ConnextRun:'[data-mg2-action="connextRun"]',
        OpenNewsletterWidget: '[data-mg2-action="openNewsletterWidget"]',
        LoginModal: '<div data-mg2-alert="login" data-template-id="23" data-display-type="modal" data-width="400" id="mg2-login-modal"  tabindex="-1" class="Mg2-connext modal fade in"><div class="modal-body picker-bg"><i class="fa fa-times closebtn" data-dismiss="modal" aria-label="Close" aria-hidden="true"></i><form><h1 class="x-editable-text text-center h3">LOGIN</h1><p class="x-editable-text text-center m-b-2" >to save access to articles or get newsletters, allerts or recomendations — all for free</p><label class="textColor4 x-editable-text" >E-mail</label><input type="email" data-mg2-input="Email" class="text" name="email" value=""   data-mg2-input="Email" /><label class="textColor4 x-editable-text">Password</label><input type="password" data-mg2-input="Password" class="text" name="password" value=""  data-mg2-input="Password" /><a href="" data-mg2-submit="login" class="input submit x-editable-text" title="Login">Login</a></form></div></div>',
        CheckAccessPopup: '<div class="Mg2-connext modal fade in" id="CheckAccessPopup" data-display-type="modal" data-width="300" tabindex="-1"><div class="modal-dialog" role="document"><div class="modal-content"><div class="modal-body">We noticed that your access status has changed. Page will be reloaded based on your new access permissions</div><div class="modal-footer text-center"><button type="button" id="ConnextRunBtn" class="btn btn-default" data-dismiss="modal">OK</button></div></div></div></div>'
    }

    var init = function () {
        var fnName = "Init";

        try {
            LOGGER.debug(NAME, "Initializing User Module...");

            UI.LoginModal = OPTIONS.LoginModal;
            setAuthType();
            $("body").on("click", UI.LogoutButton, function (e) {
                e.preventDefault();
                var fnName = UI.LogoutButton + ".CLICK";
                LOGGER.debug(NAME, fnName, e);
                logoutUser();
            });
            $("body").on("click", '[data-dismiss="alert"]', function () {
                FORM_ALERT.find(".alert").remove();
                clearTimeout(TIMEOUT);
            });
            $("body").on("click", UI.SubscribeButton, function (e) {
                e.preventDefault();
                var fnName = UI.SubscribeButton + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    var $this = $(this),
                        href = $this.attr("href"),
                        email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();

                    href = CnnXt.Utils.AddParameterToURL(href, "email", email);
                    $this.attr("href", href);
                    window.location.href = href;

                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });

            $("body").on("click", UI.SubmitZipCode, function (e) {
                e.preventDefault();
                var fnName = UI.SubmitZipCode + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    var $this = $(this),
                        href = $this.attr("href"),
                        zip = $this.parents(".Mg2-connext").find('[data-mg2-input="Zipcode"]').val();

                    href = CnnXt.Utils.AddParameterToURL(href, "zipcode", zip);
                    $this.attr("href", href);
                    if ($this[0].hasAttribute("target")) {
                        window.open(href, "_blank");
                    } else {
                        window.location.href = href;
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });
            $("body").on("click", UI.OpenNewsletterWidget, function (e) {
                e.preventDefault();
                var fnName = UI.OpenNewsletterWidget + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    var $this = $(this);
                    var params = {};

                    if ($this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val() != undefined &&
                        $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val() !== "") {
                        params.email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();
                    }
                    if ($this.data('category-ids-list') != undefined) {
                        params.categoryIdsList = $this.data('category-ids-list').toString()
                            .split(',').map(function (item) {
                                return parseInt(item, 10);
                            });
                    }
                    if ($this.data('newsletter-ids-list') != undefined) {
                        params.newsletterIdsList = $this.data('newsletter-ids-list').toString()
                            .split(',').map(function (item) {
                                return parseInt(item, 10);
                            });
                    }
                    if ($this.data('view-mode') != undefined) {
                        params.viewMode = $this.data('view-mode');
                    }

                    mg2WidgetAPI.openNewsletter(params);
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });

            $("body").on("click", ".Mg2-btn-forgot", function (e) {
                e.preventDefault();
                var fnName = "Forgot password btn" + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    var $this = $(this),
                        href = $this.attr("href"),
                        email = $this.parents(".Mg2-connext").find('[data-mg2-input="Email"]').val();

                    href = CnnXt.Utils.AddReturnUrlParamToLink(href);
                    href = CnnXt.Utils.AddParameterToURL(href, "email", email);
                    $this.attr("href", href);

                    if ($this[0].hasAttribute("target")) {
                        window.open(href, "_blank");
                    } else {
                        window.location.href = href;
                    }

                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });
            $("body").on("click dblclick", UI.LoginButton, function (e) {
                e.preventDefault();
                var fnName = UI.LoginButton + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    FORM_SUBMIT_LOADER = $(UI.LoginButton).loader();
                    FORM_ALERT = $(UI.LoginAlert).jalert();
                    FORM_SUBMIT_LOADER.on();

                    if (AUTH_TYPE.MG2) {
                        var userName = $(UI.InputUsername + ":visible").val();
                        var Password = $(UI.InputPassword + ":visible").val();
                        Mg2Authenticate(userName, Password);
                    } else {
                        JanrainAuthenticate($("[data-mg2-input=Username]:visible").val(), $("[data-mg2-input=Password]:visible").val());
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });

            $("body").on("click", UI.JanrainLoginBtn, function (e) {
                e.preventDefault();
                var fnName = UI.JanrainLoginBtn + ".CLICK";

                LOGGER.debug(NAME, fnName, e);

                try {
                    if (window.janrain) {
                        var email = $("[data-mg2-input=Email]:visible").val(),
                            password = $("[data-mg2-input=Password]:visible").val();

                        janrain.capture.ui.modal.open();
                        $('#capture_signIn_traditionalSignIn_emailAddress').val(email);
                        $('#capture_signIn_traditionalSignIn_password').val(password);
                        $('#capture_signIn_traditionalSignIn_signInButton').click();

                    } else {
                        LOGGER.warn("No janrain global object found!");
                    }

                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });
            $("body").on("click", UI.ActionShowLogin, function (e) {
                e.preventDefault();
                var fnName = UI.ActionShowLogin + ".Click";

                LOGGER.debug(NAME, fnName, "IS_LOGGED_IN", IS_LOGGED_IN);

                try {
                    if (AUTH_TYPE.MG2) {
                        var $loginModal = $(UI.LoginModal);

                        $loginModal.addClass("in");
                        $loginModal.attr("id", "mg2-login-modal");
                        $loginModal.css("display", "block");
                        CnnXt.Utils.AddQueryParamsToAllLinks($loginModal);
                        $loginModal.connextmodal({ backdrop: "true" });
                        $loginModal.resize();

                        var eventData = {
                            LoginModalId: OPTIONS.LoginModalId,
                            LoginModalName: OPTIONS.LoginModalName,
                            LoginModalHtml: OPTIONS.LoginModal,
                            jQueryElement: $loginModal
                        }

                        $loginModal
                            .on('keydown', function (e) {
                                if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                                    eventData.closeEvent = CnnXt.Common.CLOSE_CASES.EscButton;
                                }
                            })
                            .on('hidden.bs.modal', function (e) {
                                if (eventData.closeEvent == null || eventData.closeEvent == undefined) {
                                    eventData.closeEvent = CnnXt.Common.CLOSE_CASES.ClickOutside;
                                }

                                CnnXt.Event.fire("onLoginClosed", eventData);
                            });

                        $loginModal
                            .find("[data-dismiss=banner], [data-dismiss=info-box], [data-dismiss=inline], [data-dismiss=modal]")
                            .on('click', function (e) {
                                eventData.closeEvent = CnnXt.Common.CLOSE_CASES.CloseButton;
                                CnnXt.Event.fire("onButtonClick", eventData);
                            });

                    } else if (AUTH_TYPE.GUP) {
                        executePopupLoginFlow(window);
                    } else if (AUTH_TYPE.Janrain) {
                        if (window.janrain) {
                            janrain.capture.ui.modal.open();
                        } else {
                            LOGGER.warn("No janrain global object found!");
                        }
                    } else if (AUTH_TYPE.Auth0) {
                        if (Auth0Lock) {
                            showAuth0Login();
                        } else {
                            LOGGER.warn("No Auth0 global object found!");
                        }
                    }

                    CnnXt.Event.fire("onLoginShown", eventData);
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, ex);
                }
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var setAuthType = function () {
        var fnName = "setAuthType";

        try {
            LOGGER.debug(NAME, fnName, "Setting auth type...", OPTIONS);

            if (OPTIONS.Site.RegistrationTypeId == 1) {
                LOGGER.debug(NAME, fnName, "Use MG2 auth system");
                AUTH_TYPE["MG2"] = true;
            } else if (OPTIONS.Site.RegistrationTypeId == 2) {
                LOGGER.debug(NAME, fnName, "Use Janrain auth system");
                AUTH_TYPE["Janrain"] = true;
                FORM_SUBMIT_LOADER = $(UI.LoginButton).loader();
                FORM_ALERT = $(UI.LoginAlert).jalert();

            } else if (OPTIONS.Site.RegistrationTypeId == 3) {
                LOGGER.debug(NAME, fnName, "Use GUP auth system");
                AUTH_TYPE["GUP"] = true;

            } else if (OPTIONS.Site.RegistrationTypeId == 4) {
                LOGGER.debug(NAME, fnName, "Use Auth0 auth system");
                AUTH_TYPE["Auth0"] = true;

                var authSettings = CnnXt.GetOptions().authSettings;

                if (!authSettings && !__.isObject(authSettings.auth0Lock)) {
                    throw CnnXt.Common.ERROR.NO_AUTH0_LOCK;
                }

                var lock = authSettings.auth0Lock;

                lock.on("authenticated", function (authResult) {
                    LOGGER.debug(NAME, 'lock.on: authenticated', authResult);
                    lock.getUserInfo(authResult.accessToken, function (error, profile) {
                        if (error) {
                            LOGGER.debug(NAME, 'lock.getUserInfo', error);
                            CnnXt.Storage.SetUserProfile('');
                            CnnXt.Event.fire("onLoginError", { ErrorMessage: (__.isString(error)) ? error : '' });
                            return;
                        }

                        LOGGER.debug(NAME, 'lock.getUserInfo', profile);

                        CnnXt.Storage.SetUserProfile(profile);

                        if (CnnXt.Activation.IsActivationFlowRunning()) {
                            CnnXt.User.CheckAccess()
                                .always(function () {
                                    CnnXt.Activation.Run({ runAfterSuccessfulLogin: true });
                                });
                        } else {
                            CnnXt.Run();
                        }
                    });
                });
            } else if (OPTIONS.Site.RegistrationTypeId == 5) {
                LOGGER.debug(NAME, fnName, "Use Custom auth system");
                AUTH_TYPE[CnnXt.Common.RegistrationTypes[5]] = true;
            } else {
                throw CnnXt.Common.ERROR.UNKNOWN_REG_TYPE;
            }

            registerEventlisteners();

        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

    var checkAccess = function () {
        var fnName = "checkAccess";

   
        var deferred = $.Deferred(),
            lastUpdateDateDeferred = $.Deferred(),
            customAuthTypeDeferred = $.Deferred();

        LOGGER.debug(NAME, fnName, 'Checking user access...');

        if (!AUTH_TYPE.Custom && USER_DATA && USER_DATA.MasterId) {
            CnnXt.API.GetUserLastUpdateDate({
                payload: { masterId: USER_DATA.MasterId },
                onSuccess: function (data) {
                    if (CnnXt.Storage.GetUserLastUpdateDate() == null ||
                        new Date(CnnXt.Storage.GetUserLastUpdateDate()) < new Date(data)) {
                        CnnXt.Storage.SetUserState(null);
                        CnnXt.Storage.SetUserData(null);
                        CnnXt.Storage.SetUserLastUpdateDate(data);
                    }

                    lastUpdateDateDeferred.resolve();
                },
                onNull: function () {
                    lastUpdateDateDeferred.resolve();
                },
                onError: function (error) {
                    lastUpdateDateDeferred.resolve();
                }
            });
        } else {
            lastUpdateDateDeferred.resolve();
        }

        lastUpdateDateDeferred.promise().then(function () {
            clearUserStateIfWasRedirect();

            if (!CnnXt.Storage.GetAccountDataExpirationCookie()) {
                CnnXt.Storage.SetUserState(null);
                CnnXt.Storage.SetUserData(null);
            }

            USER_STATE = CnnXt.Storage.GetUserState();

            if (AUTH_TYPE.MG2) {
                if (CnnXt.Storage.GetigmRegID()) {
                    if (USER_STATE == USER_STATES.NotLoggedIn) {
                        USER_STATE = null;
                    }
                } else {
                    USER_STATE = USER_STATES.NotLoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                }
            }

            if (AUTH_TYPE.Custom) {
                try {
                    Connext.GetOptions().authSettings.CalculateAuthStatusFunc()
                        .done(function (data) {
                            if (__.values(USER_STATES).indexOf(data) == -1) {                             
                                throw CnnXt.Common.ERROR.UNKNOWN_USER_STATE;
                            }

                            USER_STATE = data;

                            CnnXt.Storage.SetUserState(USER_STATE);
                            CnnXt.Storage.SetAccountDataExpirationCookie(true);

                            if (USER_STATE != USER_STATES.NotLoggedIn && !CnnXt.Storage.GetUserProfile()) {
                                Connext.GetOptions().authSettings.GetAuthProfileFunc()
                                    .done(function(authProfile) {
                                        try {
                                            CnnXt.Storage.SetUserProfile(authProfile);

                                            var userDataObj = {};

                                            if (authProfile.MasterId) {
                                                userDataObj.MasterId = authProfile.MasterId;
                                                masterId = authProfile.MasterId;
                                            } else {
                                                LOGGER.debug(NAME, fnName, "authProfile.MasterId is undefined");
                                            }

                                            if (authProfile.DisplayName) {
                                                userDataObj.DisplayName = authProfile.DisplayName;
                                            } else {
                                                LOGGER.debug(NAME, fnName, "authProfile.DisplayName is undefined");
                                            }

                                            if (Object.getOwnPropertyNames(userDataObj).length > 0) {
                                                CnnXt.Storage.SetUserData(userDataObj);
                                            }

                                            customAuthTypeDeferred.resolve();
                                        } catch (ex) {
                                            LOGGER.exception(NAME, fnName, ex);
                                            CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                                            customAuthTypeDeferred.resolve();
                                        }
                                    })
                                    .fail(function (error) {
                                        LOGGER.debug(NAME, fnName, "customAuth.GetAuthProfileFunc.fail", error);
                                        CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                                        customAuthTypeDeferred.resolve();
                                    });
                            } else {
                                customAuthTypeDeferred.resolve();
                            }
                        })
                        .fail(function (error) {
                            LOGGER.debug(NAME, fnName, "customAuth.GetAuthProfileFunc.fail", error);
                            CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                            customAuthTypeDeferred.resolve();
                        });
                } catch (ex) {
                    if (ex.custom) {
                        LOGGER.warn(ex.message);
                    } else {
                        LOGGER.exception(NAME, fnName, ex);
                    }

                    CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                    customAuthTypeDeferred.resolve();
                }
            } else {
                customAuthTypeDeferred.resolve();
            }

            customAuthTypeDeferred.promise().then(function() {
                if (USER_STATE != null && USER_STATE != undefined && !AUTH_TYPE.Auth0) {

                    if (AUTH_TYPE.Janrain) {
                        if (!window.localStorage.getItem("janrainCaptureToken")) {
                            USER_STATE = USER_STATES.NotLoggedIn;
                            CnnXt.Storage.SetUserState(USER_STATE);
                        } else {
                            if (USER_STATE == USER_STATES.NotLoggedIn) {
                                USER_STATE = null;
                            }
                        }
                    }

                    if (USER_STATE == USER_STATES.NotLoggedIn) {
                        CnnXt.Storage.ClearUser();
                        CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
                        deferred.reject("onNotAuthorized");
                    } else {
                        USER_DATA = CnnXt.Storage.GetUserData();
                        $(UI.ActionShowLogin).hide();
                        $(UI.LogoutButton).show();
                        if (USER_STATE == USER_STATES.LoggedIn) {
                            var AuthSystem;

                            if (AUTH_TYPE.Janrain) {
                                AuthSystem = "Janrain";
                            } else if (AUTH_TYPE.MG2) {
                                AuthSystem = "MG2";
                            } else if (AUTH_TYPE.GUP) {
                                AuthSystem = "GUP";
                            } else if (AUTH_TYPE.Custom) {
                                AuthSystem = "Custom";
                            }

                            deferred.reject("onAuthorized");

                        } else if (isUserHasHighState()) {
                            var eventName = getEventNameForHighUserState();
                            deferred.reject(eventName);
                        }
                    }

                    if (USER_STATE != null) {
                        deferred.resolve(true);
                    }
                }

                if (!AUTH_TYPE.Custom && (USER_STATE == null || USER_STATE == undefined || AUTH_TYPE.GUP || AUTH_TYPE.Auth0)) {
                    try {
                        AUTH_TIMING.Start = new Date();
                        USER_STATE = USER_STATES.NotLoggedIn;
                        CnnXt.Storage.SetUserState(USER_STATE);
                        CnnXt.Storage.SetAccountDataExpirationCookie(true);
                        getUserData()
                            .done(function (result) {
                                LOGGER.debug(NAME, fnName, "User data", result);

                                if (!result) {
                                    throw CnnXt.Common.ERROR.NO_USER_DATA;
                                }

                                masterId = result;

                                if (AUTH_TYPE.MG2) {
                                    CnnXt.API.GetUserByEncryptedMasterId({
                                        payload: { encryptedMasterId: result },
                                        onSuccess: function (data) {
                                            if (AUTH_TYPE.Auth0) {
                                                data.AuthSystem = "Auth0";
                                            } else if (AUTH_TYPE.GUP) {
                                                data.AuthSystem = "GUP";
                                            }

                                            processSuccessfulLogin("MasterId", data);
                                            AUTH_TIMING.Done = new Date();
                                            deferred.resolve(true);
                                            $(UI.ActionShowLogin).hide();
                                            $(UI.LogoutButton).show();
                                        },
                                        onNull: function () {
                                            AUTH_TIMING.Done = new Date();
                                            deferred.reject("GetUserByMasterId.onNull");
                                        },
                                        onError: function (error) {
                                            AUTH_TIMING.Done = new Date();
                                            deferred.reject("GetUserMasterId.onError");
                                        }
                                    });
                                } else if (AUTH_TYPE.Janrain) {
                                    CnnXt.API.GetUserByMasterId({
                                        payload: { id: result },
                                        onSuccess: function (data) {
                                            data.AuthSystem = "Janrain";
                                            processSuccessfulLogin("externalId", data);
                                            AUTH_TIMING.Done = new Date();
                                            deferred.resolve(true);
                                        },
                                        onNull: function () {
                                            AUTH_TIMING.Done = new Date();
                                            deferred.reject("GetUserByToken.onNull");
                                        },
                                        onError: function (err) {
                                            AUTH_TIMING.Done = new Date();
                                            deferred.reject("GetUserByToken.onError");
                                        }
                                    });
                                }
                                else if (AUTH_TYPE.Auth0) {
                                    USER_STATE = USER_STATES.LoggedIn;
                                    CnnXt.Storage.SetUserState(USER_STATE);
                                    if (CnnXt.Storage.GetUserData()) {
                                        processSuccessfulLogin("externalId", CnnXt.Storage.GetUserData());
                                        deferred.resolve(true);
                                    } else {
                                        CnnXt.API.GetUserByMasterId({
                                            payload: { id: result },
                                            onSuccess: function (data) {
                                                data.AuthSystem = "Auth0";
                                                processSuccessfulLogin("externalId", data);
                                                AUTH_TIMING.Done = new Date();
                                                deferred.resolve(true);
                                            },
                                            onNull: function () {
                                                AUTH_TIMING.Done = new Date();
                                                deferred.reject("GetUserByExternalId.onNull");
                                            },
                                            onError: function (err) {
                                                AUTH_TIMING.Done = new Date();
                                                deferred.reject("GetUserByExternalId.onError");
                                            }
                                        });
                                    }
                                } else if (AUTH_TYPE.GUP) {
                                    var gupUserHasAccess = AuthenticateGupUser(result);
                                    AUTH_TIMING.Done = new Date();
                                    LOGGER.debug(NAME, fnName, "getUserData.done -- gupUserHasAccess", gupUserHasAccess);
                                    deferred.resolve(true);
                                    LOGGER.debug(NAME, fnName, "getUserData.done", "Has GUP Data", result);
                                } else {
                                    CnnXt.Event.fire("onCriticalError",
                                        { 'function': "getUserData.done", 'error': "Unknown Registration Type" });
                                }
                            })
                            .fail(function (error) {
                                LOGGER.debug(NAME, fnName, "getUserData.fail -- error", error);
                                AUTH_TIMING.Done = new Date();
                                deferred.reject();
                            });
                    } catch (ex) {
                        if (ex.custom) {
                            LOGGER.warn(ex.message);
                        } else {
                            LOGGER.exception(NAME, fnName, ex);
                        }

                        AUTH_TIMING.Done = new Date();
                        deferred.reject();
                    }
                }
            });
        });

        return deferred.promise();
    };

    var processSuccessfulLogin = function (type, data) {
        var fnName = "processSuccessfulLogin";
        LOGGER.debug(NAME, fnName, 'Process successful login', type, data);
        try {
            USER_STATE = USER_STATES.LoggedIn;

            data.IgmAuth = CnnXt.Utils.DecodeAuthCookie(data.IgmAuth) || CnnXt.Storage.GetIgmAuth();
            data.IgmContent = CnnXt.Utils.DecodeAuthCookie(data.IgmContent) || CnnXt.Storage.GetIgmContent();
            data.IgmRegID = CnnXt.Utils.DecodeAuthCookie(data.IgmRegID) || CnnXt.Storage.GetigmRegID();

            USER_DATA = CnnXt.Utils.ShapeUserData(data);

            var localData = CnnXt.Storage.GetUserData();
            if (localData && USER_DATA) {
                USER_DATA.IgmContent = USER_DATA.IgmContent ? USER_DATA.IgmContent : localData.IgmContent;
                USER_DATA.IgmRegID = USER_DATA.IgmRegID ? USER_DATA.IgmRegID : localData.IgmRegID;
                USER_DATA.MasterId = USER_DATA.MasterId ? USER_DATA.MasterId : localData.MasterId;
                USER_DATA.UserToken = USER_DATA.UserToken ? USER_DATA.UserToken : localData.UserToken;
            }
            CnnXt.Storage.SetUserData(USER_DATA);
            CnnXt.Storage.SetAccountDataExpirationCookie(true);

            LOGGER.debug(NAME, fnName, "type", type, "USER_DATA", USER_DATA);

            HandleUiLoggedInStatus(true);

            if (checkNoSubscriptions(USER_DATA)) {
                NOTIFICATION.show("NoSubscriptionData");
            } else {
                if (!__.isObject(USER_DATA.Subscriptions)) {
                    USER_DATA.Subscriptions = JSON.parse(USER_DATA.Subscriptions);
                }
                var zipCodes = null;
                if (USER_DATA.Subscriptions.OwnedSubscriptions) {
                    zipCodes = __.map(USER_DATA.Subscriptions.OwnedSubscriptions, function (subscription) {
                        return (subscription.BillingAddress && subscription.BillingAddress.ZipCode)
                            ? subscription.BillingAddress.ZipCode
                            : subscription.DeliveryAddress ? subscription.DeliveryAddress.ZipCode : null;
                    });
                } else {
                    zipCodes = __.map(USER_DATA.Subscriptions, function (subscription) {
                        return (subscription.BillingAddress && subscription.BillingAddress.ZipCode)
                            ? subscription.BillingAddress.ZipCode
                            : subscription.PostalCode;
                    });
                }
                CnnXt.Storage.SetUserZipCodes(zipCodes);
            }
            if (AUTH_TYPE.MG2) {
                if (USER_DATA.IgmRegID) {
                    CnnXt.Storage.SetigmRegID(USER_DATA.IgmRegID);
                }
                if (USER_DATA.IgmContent) {
                    CnnXt.Storage.SetIgmContent(USER_DATA.IgmContent);
                }
                if (USER_DATA.IgmAuth) {
                    CnnXt.Storage.SetIgmAuth(USER_DATA.IgmAuth);
                }
            } else if (AUTH_TYPE.Janrain) {
            } else if (AUTH_TYPE.GUP) {
            } else if (AUTH_TYPE.Auth0) {
            } else {
                CnnXt.Event.fire("onCriticalError", { 'function': "processAuthentication", 'error': "Unknown Registration Type" });
            }

            defineUserState(USER_DATA);
            $("#ddZipCode").text(CnnXt.Storage.GetActualZipCodes().toString());

            if (isUserHasHighState()) {

                var modalManager = $("body").data("modalmanager");

                if (modalManager) {
                    var openModals = modalManager.getOpenModals();
                    LOGGER.debug(NAME, fnName, "openModals", openModals);

                    if (openModals.length > 0) {
                        if (openModals[0].isShown) {
                            NOTIFICATION.show("AuthSuccess");
                            setTimeout(function () {
                                openModals[0].$element.modal("hide");
                            }, 1500);
                        }
                    }
                }
            }
            var data = {
                UserId: Fprinting().getDeviceId(),
                ConfigCode: CnnXt.GetOptions().configCode,
                SiteCode: CnnXt.GetOptions().siteCode,
                SettingsKey: CnnXt.GetOptions().settingsKey,
                ViewData: CnnXt.Storage.GetLocalViewData()
            };
            if (CnnXt.User.getMasterId()) {
                data.masterId = CnnXt.User.getMasterId();
            }

            CnnXt.Storage.SetUserState(USER_STATE);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var checkNoSubscriptions = function (userData) {
        return !userData.Subscriptions
            || (__.isArray(userData.Subscriptions) && !userData.Subscriptions.length)
            || (__.isObject(userData.Subscriptions) && (!userData.Subscriptions.OwnedSubscriptions || !userData.Subscriptions.OwnedSubscriptions.length));
    }

    var defineUserState = function (data) {
        var fnName = "defineUserState";

        try {
            if (!data.DigitalAccess || !__.isEmpty(data.DigitalAccess.Errors)) {
                USER_STATE = USER_STATES.LoggedIn;
            } else if (!data.Subscriptions || data.Subscriptions.length == 0) {
                USER_STATE = USER_STATES.LoggedIn;
            } else if (data.DigitalAccess.AccessLevel.IsPremium) {
                USER_STATE = USER_STATES.Subscribed;
                $('.Mg2-pin-modal').connextmodal("hide");
                $('.Mg2-pin-infobox').hide();
            } else if (data.DigitalAccess.AccessLevel.IsUpgrade) {
                USER_STATE = USER_STATES.SubscribedNotEntitled;
            } else if (data.DigitalAccess.AccessLevel.IsPurchase) {
                USER_STATE = USER_STATES.NoActiveSubscription;
            }
            LOGGER.debug(NAME, fnName, 'Defined user state', USER_STATE);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var isUserHasHighState = function () {
        var highState = false;

        if (USER_STATES) {
            switch (USER_STATE) {
                case USER_STATES.Subscribed:
                case USER_STATES.SubscribedNotEntitled:
                case USER_STATES.NoActiveSubscription:
                    highState = true;
                    break;
            }
        }
        
        return highState;
    }

    var getEventNameForHighUserState = function () {
        var eventName = 'onNotAuthorized';
        switch (USER_STATE) {
            case USER_STATES.LoggedIn:
                eventName = 'onAuthorized';
                break;
            case USER_STATES.Subscribed:
                eventName = 'onHasAccess';
                break;
            case USER_STATES.SubscribedNotEntitled:
                eventName = 'onHasAccessNotEntitled';
                break;
            case USER_STATES.NoActiveSubscription:
                eventName = 'onHasNoActiveSubscription';
                break;
        }
        return eventName;
    }

    var getUserData = function () {
        var fnName = "getUserData";
        var deferred = $.Deferred();
        try {

            if (AUTH_TYPE.MG2) {
                var encryptedMasterId = CnnXt.Storage.GetigmRegID();

                if (encryptedMasterId) {
                    deferred.resolve(encryptedMasterId);
                } else {
                    deferred.reject("No MG2 UserToken");
                }
            } else if (AUTH_TYPE.Janrain) {
                if (window.JANRAIN) {
                    if (!window.localStorage.getItem("janrainCaptureToken")) {
                        USER_STATE = USER_STATES.NotLoggedIn;
                        CnnXt.Storage.SetUserState(USER_STATE);
                        deferred.reject("Janrain Logged out User");
                    } else {
                        LOGGER.debug(NAME, fnName, "Janrain Loaded");

                        var janrainProfile = getJanrainProfileData();
                        LOGGER.debug(NAME, fnName, "janrainProfile", janrainProfile);

                        if (janrainProfile.uuid) {
                            USER_STATE = USER_STATES.LoggedIn;
                            CnnXt.Storage.SetUserState(USER_STATE);
                            deferred.resolve(janrainProfile.uuid);
                        } else {
                            deferred.reject("No Janrain Profile Data");
                        }
                    }
                }
                else {
                    USER_STATE = USER_STATES.NotLoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    deferred.reject("Janrain object is not exist");
                }

            } else if (AUTH_TYPE.GUP) {

                GetCurrentGupUser().then(function (data) {
                    LOGGER.debug(NAME, fnName, "getCurrentGUPUser.then (data)", data);
                    if (data) {
                        deferred.resolve(data);
                    }

                }).fail(function (error) {
                    LOGGER.debug(NAME, fnName, "getCurrentGUPUser", error);
                    deferred.reject();

                });
            } else if (AUTH_TYPE.Auth0) {
                var authSettings = CnnXt.GetOptions().authSettings;

                if (!authSettings && !__.isObject(authSettings.auth0Lock)) {
                    LOGGER.warn('No auth0Lock object in the authSettings!');
                    USER_STATE = USER_STATES.NotLoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    CnnXt.Storage.ClearUser();
                    deferred.reject(null);
                }
                var lock = authSettings.auth0Lock;
                lock.checkSession({ scope: 'openid profile email', redirect_uri: window.location.origin }, function (error, authResult) {
                    if (!error && authResult && authResult.accessToken) {
                        if (authResult.idTokenPayload && authResult.idTokenPayload.sub) {
                            CnnXt.Storage.SetUserProfile(authResult.idTokenPayload);
                            deferred.resolve(authResult.idTokenPayload.sub);
                        } else {
                            lock.getUserInfo(authResult.accessToken, function (error, profile) {
                                if (!error && profile && profile.sub) {
                                    CnnXt.Storage.SetUserProfile(profile);
                                    LOGGER.debug(NAME, fnName, "CHECK SSO - true", profile);
                                    deferred.resolve(profile.sub);
                                } else {
                                    LOGGER.debug(NAME, fnName, "checkSession - error", error);
                                    USER_STATE = USER_STATES.NotLoggedIn;
                                    CnnXt.Storage.SetUserState(USER_STATE);
                                    CnnXt.Storage.ClearUser();
                                    deferred.reject(null);
                                }
                            });
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, "checkSession - error", error);
                        USER_STATE = USER_STATES.NotLoggedIn;
                        CnnXt.Storage.SetUserState(USER_STATE);
                        CnnXt.Storage.ClearUser();
                        deferred.reject(null);
                    }
                });
            } else {
                CnnXt.Event.fire("onCriticalError", { 'function': "getUserData", 'error': "Unknown Registration Type" });
                deferred.reject("Unknown Registration Type");
                LOGGER.debug(NAME, fnName, 'Unknown Registration Type', AUTH_TYPE);
            }

            return deferred.promise();

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var logoutUser = function () {
        var fnName = "logoutUser";

        try {
            LOGGER.debug(NAME, fnName, 'Logout!');

            HandleUiLoggedInStatus(false);

            CnnXt.Storage.SetUserState(USER_STATES.NotLoggedIn);
            CnnXt.Run();
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getJanrainProfileData = function () {
        var fnName = "getJanrainProfileData";

        try {
            var profileData = window.localStorage.getItem("janrainCaptureProfileData");
            LOGGER.debug(NAME, fnName, 'Get Janrain profile data', profileData);
            if (profileData == null) {
                profileData = window.localStorage.getItem("janrainCaptureReturnExperienceData");
            }

            if (profileData) {
                return JSON.parse(profileData);
            } else {
                return false;
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    };

    var janrainAuthenticationCallback = function (result) {
        var fnName = "janrainAuthenticationCallback";

        try {
            LOGGER.debug(NAME, fnName, result);

            if (!result.userData.uuid) {
                throw CnnXt.Common.ERROR.NO_JANRAIN_DATA;
            }

            CnnXt.API.GetUserByMasterId({
                payload: { id: result.userData.uuid },
                onSuccess: function (data) {
                    data.AuthSystem = 'Janrain';
                    processSuccessfulLogin("Form", data);
                },
                onError: function(err) {
                    LOGGER.exception(NAME, fnName, err);
                }
            });

        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

    var executePopupLoginFlow = function () {
        var popupWidth = 500,
            popupHeight = 600,
            popupPositionLeft = (screen.width / 2) - (popupWidth / 2),
            popupPositionTop = (screen.height / 2) - (popupHeight / 2);
        var loginTab = window.open(
            GUP_SETTINGS.LoginServiceBasePath + "authenticate/?window-mode=popup",
            "_blank",
            "toolbar=no, scrollbars=yes, resizable=no, " +
            "width=" + popupWidth + ", " +
            "height=" + popupHeight + ", " +
            "top=" + popupPositionTop + ", " +
            "left=" + popupPositionLeft
        );
        loginTab.onunload = function (e) {
            LOGGER.debug(NAME, "<< GUP >>", e);
        }
        return;
    };

    var GetCurrentGupUser = function () {
        return $.ajax({
            type: "POST",
            url: GUP_SETTINGS.UserServiceBasePath + "user/?callback=?",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true
        });
    };

    var AuthenticateGupUser = function (data) {
        var fnName = "authenticateGUPUser";

        try {
            LOGGER.debug(NAME, fnName, arguments);

            if (!data.meta.isAnonymous && data.response.user) {
                if (data.response.user.hasMarketAccess) {
                    LOGGER.debug(NAME, fnName, "GUP User <<IS>> LOGGED IN, AND has market access");
                    USER_STATE = USER_STATES.Subscribed;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    $('.Mg2-pin-modal').connextmodal("hide");
                    $('.Mg2-pin-infobox').hide();
                    return true;
                } else {
                    LOGGER.debug(NAME, fnName, "GUP User <<IS>> LOGGED IN, but doesnt have marketAccess");
                    USER_STATE = USER_STATES.LoggedIn;
                    CnnXt.Storage.SetUserState(USER_STATE);
                    return false;
                }
            } else {
                LOGGER.debug(NAME, fnName, "GUP User <<NOT>> LOGGED IN");
                USER_STATE = USER_STATES.NotLoggedIn;
                CnnXt.Storage.SetUserState(USER_STATE);
                return false;
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            USER_STATE = USER_STATES.NotLoggedIn;
            CnnXt.Storage.SetUserState(USER_STATE);
            return false;
        }
    };

    var registerEventlisteners = function () {
        var fnName = "registerEventlisteners";

        try {
            if (AUTH_TYPE.GUP) {
                window.jQuery(window)
                    .on("focus.gup_login_popup",
                    function () {
                        LOGGER.debug("focus.gup_login_popup");
                    });
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var HandleUiLoggedInStatus = function (isLoggedIn) {
        var fnName = "handleUILoggedInStatus";

        try {
            var $el = $(UI.ActionShowLogin);
            IS_LOGGED_IN = isLoggedIn;

            if (isLoggedIn) {
                USER_STATE = USER_STATES.LoggedIn;
            } else {
                USER_STATE = USER_STATES.NotLoggedIn;
            }

            LOGGER.debug(NAME, fnName, "USER_STATE", USER_STATE);

            if (IS_LOGGED_IN) {
                $(UI.LogoutButton).show();
                $(UI.ActionShowLogin).hide();
                $el.text($el.data("mg2-logged-in"));
            } else {
                $el.text($el.data("mg2-logged-out"));
                CnnXt.Storage.ClearUser();
                $(UI.LogoutButton).hide();
                $(UI.ActionShowLogin).show();
                $("#ddZipCode").text(CnnXt.Storage.GetActualZipCodes().toString());
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var Mg2Authenticate = function (email, password) {
        var fnName = "MG2Authenticate";

        try {
            if (!email) {
                FORM_ALERT.find(".alert").remove();
                NOTIFICATION.showAndHide("Please enter email", 10000);
                FORM_SUBMIT_LOADER.off();
                LOGGER.debug(NAME, fnName, 'No email');
                return false;
            }

            if (!password) {
                FORM_ALERT.find(".alert").remove();
                NOTIFICATION.showAndHide("Please enter password", 10000);
                FORM_SUBMIT_LOADER.off();
                LOGGER.debug(NAME, fnName, 'No password');
                return false;
            }

            LOGGER.debug(NAME, fnName, 'Login');

            CnnXt.API.GetUserByEmailAndPassword({
                payload: { Email: email, Password: password },
                onSuccess: function (data) {
                    data.Email = email;
                    data.AuthSystem = 'MG2';
                    processSuccessfulLogin("Form", data);
                    CnnXt.Event.fire("onLoginSuccess", { "MG2AccountData": USER_DATA, "AuthProfile": CnnXt.Storage.GetUserProfile(), "AuthSystem": USER_DATA.AuthSystem });
                    $(UI.ActionShowLogin).hide();
                    $(UI.LogoutButton).show();
                    CnnXt.Run();
                },
                onNull: function () {
                    NOTIFICATION.show("NotAuthenticated");
                },
                onError: function (err) {
                    var errorMessage = getMessageFromErrorResponse(err);

                    CnnXt.Event.fire("onLoginError", { ErrorMessage: errorMessage });

                    FORM_ALERT.find(".alert").remove();
                    NOTIFICATION.showAndHide(errorMessage, 10000);
                },
                onComplete: function () {
                    FORM_SUBMIT_LOADER.off();
                }
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getMessageFromErrorResponse = function (err) {
        var fnName = 'getMessageFromErrorResponse';

        var errorMessage = "GenericAuthFailed";

        if (err && err.Message) {
            try {
                LOGGER.debug(NAME, fnName, "Try parse error message");

                var message = JSON.parse(err.Message);

                errorMessage = message.Message;

                if (errorMessage == "UserName or Password invalid.") {
                    errorMessage = incorrectCreditsMessage;
                }

            } catch (ex) {
                LOGGER.exception(NAME, fnName, "parse response JSON", ex);
                return incorrectCreditsMessage;
            }

            LOGGER.debug(NAME, fnName, 'Error message:', errorMessage);
        }

        return errorMessage;
    }

    var LogoutGupUser = function () {
        return $.ajax({
            type: "POST",
            url: GUP_SETTINGS.UserServiceBasePath +
            "user/logout/?callback=?",
            contentType: "application/json; charset=utf-8",
            dataType: "json",
            async: true
        });
    };

    var showAuth0Login = function () {
        var fnName = 'showAuth0Login';

        try {
            var authSettings = CnnXt.GetOptions().authSettings;

            if (!authSettings && !__.isObject(authSettings.auth0Lock)) {
                throw CnnXt.Common.ERROR.NO_AUTH0_LOCK;
            }

            authSettings.auth0Lock.show();
        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

    var clearUserStateIfWasRedirect = function () {
        var fnName = 'clearUserStateIfWasRedirect';

        try {
            LOGGER.debug(NAME, fnName);

            if (CnnXt.Utils.getUrlParam('clearUserState')) {
                CnnXt.Storage.SetUserData(null);
                CnnXt.Storage.SetUserState(null);
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    return {
        init: function (options) {
            LOGGER = CnnXt.Logger;
            OPTIONS = (options) ? options : {};
            USER_STATES = CnnXt.Common.USER_STATES;
            USER_STATE = USER_STATES.NotLoggedIn;
            init();
            if (OPTIONS.Site.RegistrationTypeId == 3) {
                GUP_SETTINGS = {
                    'UserServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountService : "",
                    'LoginServiceBasePath': OPTIONS.Settings ? OPTIONS.Settings.GUPAccountLoginUrl : ""
                };
            }
        },
        CheckAccess: function () {
            return checkAccess()
                .done(function (data) {
                    LOGGER.debug(NAME, 'CheckAccess', "User.CheckAccess.Done", data);
                })
                .fail(function () {
                    LOGGER.debug(NAME, 'CheckAccess', "User.CheckAccess.Fail");
                })
                .always(function () {
                    var registrationTypeId = Connext.Storage.GetLocalConfiguration().Site.RegistrationTypeId,
                        AUTHSYSTEM = CnnXt.Common.RegistrationTypes[registrationTypeId],
                        eventName = getEventNameForHighUserState(),
                        userState = CnnXt.Storage.GetUserState();

                    if (userState != USER_STATES.NotLoggedIn && userState != null) {
                        CnnXt.Event.fire("onLoggedIn", {
                            AuthSystem: AUTHSYSTEM,
                            AuthProfile: CnnXt.Storage.GetUserProfile(),
                            MG2AccountData: Connext.Storage.GetUserData()
                        });
                    }

                    CnnXt.Event.fire(eventName, {
                        AuthSystem: AUTHSYSTEM,
                        AuthProfile: CnnXt.Storage.GetUserProfile(),
                        MG2AccountData: Connext.Storage.GetUserData()
                    });

                    $("#ddZipCode").text(CnnXt.Storage.GetActualZipCodes().toString());
                });
        },
        GetAuthTiming: function () {
            return AUTH_TIMING;
        },
        JanrainLoaded: function () {
            JANRAIN_LOADED = true;
            LOGGER.debug(NAME, "JanrainLoaded");
        },
        onLoginSuccess: function (result) {
            LOGGER.debug(NAME, "onLoginSuccess", result);
            janrainAuthenticationCallback(result);
        },
        getUserState: function () {
            return CnnXt.Storage.GetUserState();
        },
        onLogout: function () {
            LOGGER.debug(NAME, "onLogout");
            IS_LOGGED_IN = false;
            CnnXt.Storage.ClearUser();
        },
        getMasterId: function () {
            if (CnnXt.Storage.GetUserData())
                return CnnXt.Storage.GetUserData().IgmRegID ? CnnXt.Storage.GetUserData().IgmRegID : CnnXt.Storage.GetUserData().MasterId;
            return null;
        },
        isUserHasHighState: isUserHasHighState,
        processSuccessfulLogin: processSuccessfulLogin,
        showAuth0Login: showAuth0Login,
    };
};

var ConnextMeterCalculation = function ($) {
    var NAME = "MeterCalculation";
    var LOGGER;
    var SEGMENT_TEST_FUNCTIONS = {
        "ArticleAge": evalArticleAge,
        "HiddenField": evalHiddenField,
        "Subdomain": evalSubdomain,
        "Geo": evalGeo,
        "Url": evalUrlParam,
        "JSVar": evalJsVar,
        "Meta": evalMeta,
        "UserState": evalUserState,
        "AdBlock": evalAdBlock,
        "URLMask": evalUrlMask,
        "FlittzStatus": evalFlittzStatus,
    };
    var CACHED_RESULTS = {};
    var PROMISES = [];

    var calculateMeterLevel = function (rules) {
        var fnName = "calculateMeterLevel";
        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "Calculating meter level....", rules);

            $.each(rules, function (key, rule) {
                LOGGER.debug(NAME, fnName, "rules.each", key, rule);
                rule.EvaluationPromise = $.Deferred();
                rule.Passed = false;

                var allSegmentsPass = true;

                $.each(rule.Segments, function (key, segment) {
                    LOGGER.debug(NAME, fnName, "segments.each", key, segment);

                    if (allSegmentsPass) {
                        if (segment.SegmentType != 'Promise') {
                            SEGMENT_TEST_FUNCTIONS[segment.SegmentType](segment)
                                .done(function() {
                                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- PASSED", segment);
                                })
                                .fail(function() {
                                    allSegmentsPass = false;
                                    LOGGER.debug(NAME, fnName, "Segment[" + segment.id + "] --- FAILED", segment);
                                });
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, "Previous Segment Failed, Not processing rest of segments.");
                    }
                });
                if (allSegmentsPass) {

                    var promiseSegments = __.filter(rule.Segments, function(segment) {
                        return segment.SegmentType == 'Promise';
                    });

                    if (promiseSegments && promiseSegments.length) {
                        evaluatePromiseSegments(promiseSegments, CnnXt.GetOptions().DynamicMeterPromiseTimeout)
                            .done(function() {
                                LOGGER.debug(NAME, fnName, "All Segments Passed, Using [" + rule.Name + "] Rule ", rule);
                                rule.Passed = true;
                            })
                            .always(function() {
                                rule.EvaluationPromise.resolve();
                            });
                    } else {
                        LOGGER.debug(NAME, fnName, "All Segments Passed, for [" + rule.Name + "] Rule ", rule);
                        rule.Passed = true;
                        rule.EvaluationPromise.resolve();
                    }
                } else {
                    rule.EvaluationPromise.resolve();
                }
            });

            $.when.apply($, __.map(rules, function (rule) { return rule.EvaluationPromise.promise(); }))
                .done(function() {
                    var passedRules = __.filter(rules, function(rule) {
                        return rule.Passed == true;
                    });

                    if (!passedRules || passedRules.length == 0) {
                        deferred.reject();
                    } else {
                        deferred.resolve(__.sortBy(passedRules, 'Priority')[0]);
                    }
                });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    };

    var breakPromises = function () {
        var fnName = 'breakDMPromise';

        try {
            LOGGER.debug(NAME, fnName, 'DMPromises ', PROMISES);

            PROMISES.forEach(function (value) {
                if (value.state() === "pending") {
                    value.reject();
                }
            });
            PROMISES = [];
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    function evalArticleAge(segment) {
        var fnName = "evalArticleAge";
        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var articleAge = getArticleAge(segment.Options);
            var qualifier = (segment.Options.Qualifier == "=") ? "==" : segment.Options.Qualifier;

            if (eval(articleAge + qualifier + segment.Options.Val)) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject(false);
        }

        return deferred.promise();
    }

    function evalUrlParam(segment) {
        var fnName = "evalUrlParam";
        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);
            var paramValue = CnnXt.Utils.GetUrlParam(segment.Options.ParamName);
            var qualifier = CnnXt.Common.QualifierMap[segment.Options.Qualifier];

            if (paramValue != null) {
                if (eval("'" + paramValue.toUpperCase() + "'" + qualifier + "'" + segment.Options.Val.toUpperCase() + "'")) {
                    deferred.resolve();
                } else {
                    deferred.reject();
                }
            } else {
                if (qualifier == "==") {
                    deferred.reject();
                } else {
                    deferred.resolve();
                }
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalHiddenField(segment) {
        var fnName = "evalHiddenField";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var isPassed = false;
            var $hiddenField = segment.Options.Selector.trim() ? $(segment.Options.Selector + "[type='hidden']") : null;

            if ($hiddenField && $hiddenField.length > 0) {

                var hiddenFieldVal = $($hiddenField[0]).val();
                var qualifier = CnnXt.Common.QualifierMap[segment.Options.Qualifier];

                isPassed = eval("'" + hiddenFieldVal.toUpperCase() + "'" + qualifier + "'" + segment.Options.Val.toUpperCase() + "'");
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject(false);
        }

        return deferred.promise();
    }

    function evalSubdomain(segment) {
        var fnName = "evalSubdomain";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var searchingVal = segment.Options.Val.toUpperCase();
            var sourceVal = window.location.hostname.toUpperCase();
            var qualifier = segment.Options.Qualifier.toUpperCase();

            if (!((qualifier == "IN") ^ (sourceVal.split('.').reverse().indexOf(searchingVal) > 1))) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject(false);
        }

        return deferred.promise();
    }

    function evalGeo(segment) {
        var fnName = 'evalGeo';

        var isPassed = false;

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var userZipCodes = CnnXt.Storage.GetActualZipCodes();

            if (userZipCodes && segment.Options.GeoQalifier !== undefined) {
                userZipCodes.forEach(function (zipCode) {
                    if (~segment.Options.Zipcodes.indexOf(zipCode)) {
                        isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                    } else if (segment.Options.Zipcodes.indexOf('*') >= 0) {
                        var valueItems = segment.Options.Zipcodes.split(",") || segment.Options.Zipcodes.split("");
                        var foundZip = valueItems.filter(function (value) {
                            var valueItem = value.split("");
                            var zipItems = zipCode.split("");
                            return zipItems.length != valueItem.length ? false : valueItem.every(function (item, i) {
                                return valueItem[i] === "*" ? true : item === zipItems[i];
                            });
                        });
                        if (foundZip.length > 0) {
                            isPassed = segment.Options.GeoQalifier.toUpperCase() == "IN";
                        }
                        else isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                    } else {
                        isPassed = segment.Options.GeoQalifier.toUpperCase() != "IN";
                    }
                });
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject(false);
        }

        if (isPassed) {
            deferred.resolve();
        } else {
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalJsVar(segment) {
        var fnName = "evalJSVar";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var isPassed = true;
            var varValue = segment.Options.VarName;

            var jsValue;
            try {
                jsValue = eval(varValue);
            } catch (ex) {
                LOGGER.warn(NAME, fnName, ex);
                deferred.reject();
            }

            if ($.isArray(jsValue)) {
              jsValue = jsValue.map(function (item) {
                return item.toString().trim().toLowerCase();
              });
                if (segment.Options.Qualifier == "Contains" ||
                    segment.Options.Qualifier == "Does Not Contain") {
                    if (jsValue.indexOf(segment.Options.Val.toLowerCase()) >= 0) {
                        isPassed = segment.Options.Qualifier == "Contains";
                    } else {
                        isPassed = segment.Options.Qualifier == "Does Not Contain";
                    }
                } else {
                    isPassed = segment.Options.Qualifier == "Equals";
                }
            } else {
                if (jsValue) {
                    jsValue = jsValue.toString().toLowerCase();
                }

                if (segment.Options.Qualifier == "Contains" ||
                    segment.Options.Qualifier == "Does Not Contain") {
                    if (jsValue == undefined) {
                        isPassed = segment.Options.Qualifier == "Does Not Contain";
                    } else {
                        var delimiter, array;
                        delimiter = segment.Options.Delimiter ? new RegExp(segment.Options.Delimiter.replace(/space/g, ' '), 'g') : /[ ,;]/g;
                        array = jsValue.split(delimiter);

                        if (array.indexOf(segment.Options.Val.toLowerCase()) >= 0) {
                            isPassed = segment.Options.Qualifier == "Contains";
                        } else {
                            isPassed = segment.Options.Qualifier == "Does Not Contain";
                        }
                    }
                } else {
                    if (CnnXt.Utils.JSEvaluate(
                        jsValue,
                        segment.Options.Qualifier,
                        segment.Options.Val,
                        "JavascriptCriteria"
                    )) {
                    } else {
                        isPassed = false;
                    }
                }
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }
        return deferred.promise();
    }

    function evalUserState(segment) {
        var fnName = "evalUserState";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var userState = CnnXt.User.getUserState();

            if (userState == null)
                userState = "Logged Out";
            var isPassed = true;// userState == segment.Options["User State"];

            if (!CnnXt.Utils.JSEvaluate(
                userState,
                segment.Options['Qualifier'],
                segment.Options["User State"],
                "UserStateCriteria"
            )) {
                isPassed = false;
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }
   
        return deferred.promise();
    }

    function evalAdBlock(segment) {
        var fnName = "evalAdBlock";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var adBlockDetected = CnnXt.Utils.detectAdBlock();
            var qualifier = segment.Options["Ad Block"].toUpperCase();

            if (!((qualifier == "DETECTED") ^ adBlockDetected)) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalUrlMask(segment) {
        var fnName = "evalUrlMask";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var isPassed = false,
                hrefFormatted = window.location.href.replace(/#$/, ''),
                criteriaHrefFormatted = segment.Options.Val.replace(/\*$/, '');

            if (~hrefFormatted.indexOf(criteriaHrefFormatted) && segment.Options.Qualifier == 'Equals') {
                isPassed = true;
            } else if (!~hrefFormatted.indexOf(criteriaHrefFormatted) && segment.Options.Qualifier == 'Not Equals') {
                isPassed = true;
            } else {
                isPassed = false;
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalMeta(segment) {
        var fnName = "evalMeta";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var isPassed = false,
                metaArray = CnnXt.Utils.getMetaTagsWithKeywords(),
                regExpStr = "\\b" + segment.Options.Val + "\\b",
                regExp = new RegExp(regExpStr);

            for (var i = 0; i < metaArray.length; i++) {
                if (regExp.test(metaArray[i].content)) {
                    LOGGER.debug(NAME, fnName, "Found keyword", segment.Options.Val);
                    isPassed = true;
                    break;
                }
            }

            if (isPassed && segment.Options.Qualifier == "Not Equal") {
                isPassed = false;
            }

            if (!isPassed && segment.Options.Qualifier == "Not Equal") {
                isPassed = true;
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    function evalFlittzStatus(segment) {
        var fnName = "evalFlittzStatus";

        var deferred = $.Deferred();

        try {
            LOGGER.debug(NAME, fnName, "--- Testing ---", segment);

            var isPassed = true;

            if (CnnXt.GetOptions().integrateFlittz && window.Flittz) {
                var flittzStatus = window.Flittz.FlittzUserStatus;
                if (!CnnXt.Utils.JSEvaluate(
                    CnnXt.Common.FlittzStatusesMap[flittzStatus],
                    segment.Options['Qualifier'],
                    segment.Options["Flittz Status"],
                    "FlittzStatusCriteria"
                )) {
                    isPassed = false;
                }
            } else {
                isPassed = false;
            }

            if (isPassed) {
                deferred.resolve();
            } else {
                deferred.reject();
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    function getArticleAge(options) {
        var fnName = "getArticleAge";

        try {
            LOGGER.debug(NAME, fnName, options);

            if (__.isNumber(CACHED_RESULTS.articleAge) && !isNaN(CACHED_RESULTS.articleAge)) {
                LOGGER.debug(NAME, fnName, "Article Age Already Deterimed...using Cached value");

                return CACHED_RESULTS.articleAge;
            } else {
                var format = (__.isNothing(options.Format) ? CnnXt.Common.DefaultArticleFormat : options.Format);

                LOGGER.debug(NAME, fnName, "Using Format: ", format);

                var articleDateData;
                if (options.Selector.indexOf("$") > -1) {
                    articleDateData = eval(options.Selector);
                } else {
                    articleDateData = $(options.Selector).text();
                }

                LOGGER.debug(NAME, fnName, "articleDateData", articleDateData);

                var articleDate = CnnXt.Utils.ParseCustomDates(articleDateData, format);

                var now = CnnXt.Utils.Now();

                var articleAgeInDays = CnnXt.Utils.Diff(now, articleDate);

                LOGGER.debug(NAME, fnName, "Date Used for Compare: " + articleDateData, "Article Age In Days:: (" + articleAgeInDays + ")");
                CACHED_RESULTS.articleAge = articleAgeInDays;
                return CACHED_RESULTS.articleAge;
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    }

    function evaluatePromiseSegments(segments, timeout) {
        var fnName = 'evalPromise';
        var deferred = $.Deferred();
        try {
            PROMISES.push(deferred);
            var promises = [];

            segments.forEach(function (segment) {
                promises.push(eval(segment.Options.PromiseName));
            });

            LOGGER.debug(NAME, fnName, 'Setup "Q all" for promise segments');

            var timerId = null;
            if (timeout) {
                timerId = setTimeout(function () {
                    LOGGER.debug(NAME, fnName, 'segments rejected on timeout');
                    deferred.reject();
                }, timeout);
            }

            $.when.apply($, promises).then(function () {
                LOGGER.debug(NAME, fnName, '"Q all" results', arguments);

                var resolvedPromises = arguments;

                if (!resolvedPromises.length) {
                    resolvedPromises = [null];
                }

                var allsegmentsPassed = Array.prototype.every.call(segments, function (segment, index) {
                    var promiseResult = resolvedPromises[index],
                        segmentValue = segment.Options.Val;

                    if(promiseResult === null || promiseResult === undefined) {
                        promiseResult = '';
                    }

                    if (!CnnXt.Utils.JSEvaluate(
                        promiseResult,
                        segment.Options.Qualifier,
                        segmentValue,
                        "Promise"
                    )) {
                        LOGGER.debug(NAME, fnName, 'segment ' + segment.Options.Name + ' not passed');

                        if (timerId) {
                            clearTimeout(timerId);
                        }

                        deferred.reject();
                        return false;
                    }

                    return true;
                });

                if (allsegmentsPassed) {
                    LOGGER.debug(NAME, fnName, 'All segments passed');

                    if (timerId) {
                        clearTimeout(timerId);
                    }

                    deferred.resolve();
                }
            },
            function () {
                LOGGER.debug(NAME, fnName, 'segment rejected');
                if (timerId) {
                    clearTimeout(timerId);
                }
                deferred.reject();
            });
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject();
        }

        return deferred.promise();
    }

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Initializing MeterCalculation Module...");
        },
        CalculateMeterLevel: function (rules) {
            return calculateMeterLevel(rules);
        },
        BreakDMPromises: breakPromises
    };
};

var ConnextCampaign = function ($) {
    var NAME = "Campaign";
    var ArticleLeftString = "{{ArticleLeft}}";
    var AFTER_EXPIRE_ACTIONS = {
        GoToSelf: 'Self',
        Recalculate: 'Recalc'
    }
    var NUMBER_OF_CONVERSATION_CALCULATION = 0;

    var LOGGER;

    var CURRENT_CONVERSATION;
    var METER_LEVEL;

    var CONFIG_SETTINGS;

    var processCampaign = function (meterLevel, campaignData) {

        var fnName = "processCampaign";
        try {
            LOGGER.debug(NAME, fnName, 'Starting process campaign...', campaignData, meterLevel);
            if (!meterLevel) {
                throw CnnXt.Common.ERROR.NO_METER_LEVEL_SET;
            }

            if (!campaignData) {
                throw CnnXt.Common.ERROR.NO_CAMPAIGN
            }
            METER_LEVEL = meterLevel;
            getCurrentConversation(meterLevel).done(function(conversation) {
                CURRENT_CONVERSATION = conversation;

                if (!CURRENT_CONVERSATION) {
                    CnnXt.Storage.SetCurrentConversation(null);
                    CnnXt.Storage.SetActiveConversationId(0);
                    processFakeConversation();

                    throw CnnXt.Common.ERROR.NO_CONVO_FOUND;
                } else {
                    LOGGER.debug(NAME, fnName, "Conversation To Process", CURRENT_CONVERSATION);
                    $('#ddCurrentConversation').text(CURRENT_CONVERSATION ? CURRENT_CONVERSATION.Name : '...');
                    processConversation(CURRENT_CONVERSATION);
                }
            });
        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
           
            CnnXt.Event.fire("onCriticalError", ex);
        }
    };

    var processConversation = function (conversation) {
        var fnName = "processConversation";

        try {
            LOGGER.debug(NAME, fnName, 'Starting process conversation...', conversation);
            CnnXt.Storage.UpdateViewedArticles(conversation);
            updateArticleViewCount(conversation, CnnXt.Storage.GetCurrentConversationViewCount(conversation.id));
            CnnXt.Storage.SetCurrentConversation(CURRENT_CONVERSATION);
            var actions = determineConversationActions(conversation),
                validActions = determineConversationActions(conversation, true);

            calculateArticleLeft(conversation, validActions, actions);
            CnnXt.Storage.SetCurrentConversation(conversation);

            updateCurrentConversations(conversation);

            CnnXt.Event.fire("onConversationDetermined", conversation);

            proccessActivationFlow(conversation);

            if (actions.length > 0) {
                LOGGER.debug(NAME, fnName, "ACTIONS DETERMINGED ---> ", actions);

                CnnXt.Action.ProcessActions(actions);

            } else {
                LOGGER.warn("No 'Actions' to execute.");
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var processFakeConversation = function () {
        var fakeConversation = {
            id: -1,
            Props: { Date: { started: null } }
        }
        CnnXt.Storage.UpdateViewedArticles(fakeConversation);
    }

    var proccessActivationFlow = function (convo) {
        var fnName = 'proccessActivationFlow';

        if (!convo || !convo.Options || !convo.Options.Activation || !convo.Options.Activation.Activate) {
            return false;
        }

        var activateSettings = convo.Options.Activation.Activate;

        LOGGER.debug(NAME, fnName, 'Proccess activation flow for conversation', activateSettings);

        CnnXt.Activation.init(activateSettings);
    }

    var calculateArticleLeft = function (conversation, validActions, actions) {
        var lastArticleNumber = 99999;
        var fnName = "calculateArticleLeft";
        var paywalls = __.where(validActions, { ActionTypeId: 3 });
        var paywallViews = [];

        LOGGER.debug(NAME, fnName, "Try to find paywalls");

        if (paywalls.length > 0) {
            LOGGER.debug(NAME, "paywalls found", paywalls);

            $.each(paywalls, function (key, paywall) {
                var paywallView = -1;

                if (paywall.Who.ViewsCriteria) {
                    $.each(paywall.Who.ViewsCriteria, function (key, view) {
                        if (view.Qualifier == "==" || view.Qualifier == ">=") {
                            paywallView = view.Val > paywallView ? view.Val : paywallView;
                        } else if (view.Qualifier == ">") {
                            paywallView = parseInt(view.Val) + 1 > paywallView ? parseInt(view.Val) + 1 : paywallView;
                        }

                        paywallViews.push(paywallView);
                    });
                }

                if (paywall.Who.ConversationViewsCriteria) {
                    $.each(paywall.Who.ConversationViewsCriteria, function (key, view) {
                        if (view.Qualifier === "==" || view.Qualifier === ">=") {
                            paywallView = view.Val > paywallView ? view.Val : paywallView;
                        } else if (view.Qualifier === ">") {
                            paywallView = parseInt(view.Val) + 1 > paywallView ? parseInt(view.Val) + 1 : paywallView;
                        }

                        paywallViews.push(paywallView);
                    });
                }

                if (lastArticleNumber > paywallView) {
                    lastArticleNumber = paywallView;
                }
            });

            if (lastArticleNumber === -1) {
                lastArticleNumber = 99999;
            } else {
                lastArticleNumber = __.min(paywallViews);
            }

            conversation.Props.ArticleLeft = lastArticleNumber === 99999
                ? "unlimited"
                : lastArticleNumber - getCurrentConversationViewCount();

            if (conversation.Props.ArticleLeft < 0) {
                conversation.Props.ArticleLeft = 0;
            }

            $.each(actions, function (key, val) {
                if (val.What.Html) {
                    val.What.Html = val.What.Html.replace(ArticleLeftString, conversation.Props.ArticleLeft);
                }
            });

        } else {
            conversation.Props.ArticleLeft = "unlimited";
        }
        conversation.Props.paywallLimit = lastArticleNumber == 99999 ? Infinity : lastArticleNumber;
        $("#ddCurrentConversationArticleLeft").text(conversation.Props.ArticleLeft);

    };

    var getCurrentConversation = function () {
        var fnName = "getCurrentConversation";
        var deferred = $.Deferred();
        LOGGER.debug(NAME, fnName, 'Get conversation for a processing');

        try {
            var storedConversation = getStoredConversationByMeterLevel(METER_LEVEL);

            NUMBER_OF_CONVERSATION_CALCULATION = 0;

            if (storedConversation && isConversationValid(storedConversation)) {
                LOGGER.debug(NAME, fnName, "Found stored valid conversation", storedConversation);

                deferred.resolve(storedConversation);
            } else {
                LOGGER.debug(NAME, fnName, "Found new valid conversation", storedConversation);

                getConversation(storedConversation).done(function(data) {
                    deferred.resolve(data);
                });
            }

            return deferred.promise();
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return null;
        }
    };

    var isConversationValid = function (conversation) {
        var fnName = "isConversationValid",
            ExpirationsObj = conversation.Options.Expirations;

        LOGGER.debug(NAME, fnName, 'Check conversation expirations', ExpirationsObj);

        try {
            if (conversation.Props.isExpired) {
                LOGGER.debug(NAME, fnName, "Current conversation was previously set to expired.");
                return false;
            } else {
                if (ExpirationsObj.Time) {
                    var now = CnnXt.Utils.Now();
                    var momentConvEndDate = new Date(Date.parse(conversation.Props.Date.expiration));

                    var isExpired = now >= momentConvEndDate;

                    if (isExpired) {
                        LOGGER.debug(NAME, fnName, "Current conversation has expired base on date...");
                        conversation.Props.isExpired = true;
                        conversation.Props.expiredReason = "Time";

                        if (ExpirationsObj.Time['Reset Article Views'] == "Yes") {
                            CnnXt.Storage.ResetConversationArticleCount(conversation);
                        }

                        return false;
                    }
                } else {
                    LOGGER.debug(NAME, fnName, "No expiration time set for this conversation.");
                }

                if (ExpirationsObj.UserState) {
                    var stateExpiration = ExpirationsObj.UserState;
                    if (stateExpiration["User State"] == CnnXt.User.getUserState()) {
                        conversation.Props.isExpired = true;
                        conversation.Props.expiredReason = "UserState";

                        if (ExpirationsObj.UserState['Reset Article Views'] == "Yes") {
                            CnnXt.Storage.ResetConversationArticleCount(conversation);
                        }
                        return false;
                    }
                    if (stateExpiration["User State"] == "Logged In" && CnnXt.User.getUserState() == "Subscribed") {
                        conversation.Props.isExpired = true;
                        conversation.Props.expiredReason = "UserState";

                        if (ExpirationsObj.UserState['Reset Article Views'] == "Yes") {
                            CnnXt.Storage.ResetConversationArticleCount(conversation);
                        }
                        return false;
                    }
                }

                if (ExpirationsObj.Register) {
                    if (CnnXt.GetOptions().integrateFlittz && window.Flittz &&
                        (window.Flittz.FlittzUserStatus == 'FlittzLoggedIn')) {
                        conversation.Props.isExpired = true;
                        conversation.Props.expiredReason = "Register";

                        if (ExpirationsObj.Register['Reset Article Views'] == "Yes") {
                            CnnXt.Storage.ResetConversationArticleCount(conversation);
                        }
                        return false;
                    }
                }

                if (ExpirationsObj.FlittzStatus) {
                    var flittzStatus = ExpirationsObj.FlittzStatus["Flittz Status"];

                    if (CnnXt.GetOptions().integrateFlittz && window.Flittz) {
                        var currentFlittzStatus = CnnXt.Common.FlittzStatusesMap[window.Flittz.FlittzUserStatus];
                        if (flittzStatus == currentFlittzStatus) {
                            conversation.Props.isExpired = true;
                            conversation.Props.expiredReason = "FlittzStatus";

                            if (ExpirationsObj.FlittzStatus['Reset Article Views'] == "Yes") {
                                CnnXt.Storage.ResetConversationArticleCount(conversation);
                            }
                            return false;
                        }
                    }
                }

                if (ExpirationsObj.JSVar) {

                    LOGGER.debug(NAME, fnName, "Checking Javascript Expiration Criteria: ", ExpirationsObj);

                    var varValue = ExpirationsObj.JSVar.JSVarName,
                        jsValue;

                    try {
                        jsValue = eval(varValue);
                    } catch (ex) {
                        LOGGER.warn(NAME, fnName, ex);
                    }

                    if ($.isArray(jsValue)) {
                        jsValue = jsValue.map(function (item) {
                          return item.toString().trim().toLowerCase();
                        });

                        if (ExpirationsObj.JSVar.JSVarQualifier == "In" || ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {
                            if (jsValue.indexOf(ExpirationsObj.JSVar.JSVarValue.toLowerCase()) >= 0) {
                                if (ExpirationsObj.JSVar.JSVarQualifier == "In") {
                                    conversation.Props.isExpired = true;
                                    conversation.Props.expiredReason = "JSVar";

                                    if (ExpirationsObj.JSVar['Reset Article Views'] == "Yes") {
                                        CnnXt.Storage.ResetConversationArticleCount(conversation);
                                    }
                                    return false;
                                }
                            } else {
                                if (ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {
                                    conversation.Props.isExpired = true;
                                    conversation.Props.expiredReason = "JSVar";

                                    if (ExpirationsObj.JSVar['Reset Article Views'] == "Yes") {
                                        CnnXt.Storage.ResetConversationArticleCount(conversation);
                                    }
                                    return false;
                                }
                            }
                        }

                    } else {

                        if (jsValue) {
                            jsValue = jsValue.toString().toLowerCase();
                        }

                        if (ExpirationsObj.JSVar.JSVarQualifier == "In" || ExpirationsObj.JSVar.JSVarQualifier == "NotIn") {

                            var delimiter,
                                array;

                            delimiter = ExpirationsObj.JSVar.JSVarDelimiter ? new RegExp(ExpirationsObj.JSVar.JSVarDelimiter.replace(/space/g, ' '), 'g') : /[ ,;]/g;
                            array = jsValue.split(delimiter);

                            var isContains = false;
                            for (var i = 0; i < array.length; i++) {
                                if (array[i] == ExpirationsObj.JSVar.JSVarValue.toLowerCase()) {
                                    isContains = true;
                                }
                            }

                            if ((ExpirationsObj.JSVar.JSVarQualifier == "In" && isContains) || (ExpirationsObj.JSVar.JSVarQualifier == "NotIn" && !isContains)) {
                                conversation.Props.isExpired = true;
                                conversation.Props.expiredReason = "JSVar";

                                if (ExpirationsObj.JSVar['Reset Article Views'] == "Yes") {
                                    CnnXt.Storage.ResetConversationArticleCount(conversation);
                                }
                                return false;
                            }

                        } else {
                            if (CnnXt.Utils.JSEvaluate(
                                jsValue,
                                ExpirationsObj.JSVar.JSVarQualifier,
                                ExpirationsObj.JSVar.JSVarValue,
                                "JavascriptCriteria"
                            )) {
                                conversation.Props.isExpired = true;
                                conversation.Props.expiredReason = "JSVar";

                                if (ExpirationsObj.JSVar['Reset Article Views'] == "Yes") {
                                    CnnXt.Storage.ResetConversationArticleCount(conversation);
                                }
                                return false;
                            }
                        }
                    }
                }
            }
            return true;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return true;
        }
    };

    var getConversation = function (expiredConversation) {
        var fnName = "getConversation";
        var deferred = $.Deferred();
        var newConversationDeferred = $.Deferred();

        try {
            var expiredReason = null,
                conversationExpiration = {},
                newConversation;

            if (expiredConversation) {
                expiredReason = expiredConversation.Props.expiredReason;
                conversationExpiration = expiredConversation.Options.Expirations[expiredReason];
            }

            if (!expiredConversation || (conversationExpiration && conversationExpiration.nextConversation == AFTER_EXPIRE_ACTIONS.Recalculate)) {
                getFilteredConversation()
                    .done(function(data) {
                        newConversation = data;
                        newConversationDeferred.resolve();
                    })
                    .fail(function() {
                        newConversation = null;
                        newConversationDeferred.resolve();
                    });
            } else if (conversationExpiration && conversationExpiration.nextConversation) {
                newConversation = getNextConversation(conversationExpiration.nextConversation);
                newConversationDeferred.resolve();
            }

            newConversationDeferred.promise().done(function() {
                if (newConversation) {
                    setDefaultConversationProps(newConversation);
                }

                NUMBER_OF_CONVERSATION_CALCULATION++;

                if (!newConversation || (newConversation && isConversationValid(newConversation))) {
                    deferred.resolve(newConversation);
                } else {
                    if (NUMBER_OF_CONVERSATION_CALCULATION > getAllConversationsByMeterLevel(METER_LEVEL).length) {
                        LOGGER.warn('Exceeded the number of calculations of conversation! Please, check your conversations.');
                        deferred.resolve(null);
                    } else {
                        getConversation(newConversation).done(function(data) {
                            deferred.resolve(data);
                        });
                    }
                }
            });

            return deferred.promise();
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getFilteredConversation = function () {
        var fnName = 'getFilteredConversation';
        var deferred = $.Deferred();

        var conversationsOnMeterLevel = getAllConversationsByMeterLevel(METER_LEVEL);

        if (conversationsOnMeterLevel.length) {
            conversationsOnMeterLevel.forEach(function (conversation) {

                conversation.EvaluationDeferred = $.Deferred();
                conversation.Passed = false;
                var additionalData = {
                    conversationId: conversation.id,
                    meterId: conversation.MeterLevelId
                };

                if (CnnXt.Utils.ResolveQualifiersFor(conversation.Options.Filter, additionalData)) {
                    CnnXt.Utils.ResolvePromiseQualifiers(conversation.Options.Filter, CnnXt.GetOptions().ConversationPromiseTimeout)
                        .done(function () {
                            conversation.Passed = true;
                        })
                        .always(function() {
                            conversation.EvaluationDeferred.resolve();
                        });
                } else {
                    conversation.EvaluationDeferred.resolve();
                }
            });

            $.when.apply($, __.map(conversationsOnMeterLevel, function (conversation) { return conversation.EvaluationDeferred.promise(); }))
                .done(function () {
                    var passedConversations = __.filter(conversationsOnMeterLevel, function (conversation) {
                        return conversation.Passed == true;
                    });

                    if (!passedConversations || passedConversations.length == 0) {
                        deferred.reject();
                    } else {
                        var filteredConversation = __.sortBy(passedConversations, 'Order')[0];
                        LOGGER.debug(NAME, fnName, 'Filtered conversation', filteredConversation);
                        deferred.resolve(filteredConversation);
                    }
                });

        } else {
            deferred.reject();
        }

        return deferred.promise();
    }

    var getNextConversation = function (conversationId) {
        var fnName = 'getNextConversation';

        LOGGER.debug(NAME, fnName, 'Go to conversation', conversationId);

        var conversationsOnMeterLevel = getAllConversationsByMeterLevel(METER_LEVEL),
            nextConversation = null;

        if (conversationsOnMeterLevel.length && conversationId) {
            nextConversation = __.findByKey(conversationsOnMeterLevel, { id: conversationId });
        }

        return nextConversation;
    }

    var determineConversationActions = function (conversation, ignoreViewsFlag) {
        var fnName = "determineConversationActions";

        try {
            LOGGER.debug(NAME, fnName, 'Begin determine conversation actions', conversation.Actions);

            var actions = [];
            var paywallActionFound = false;
            var viewCount = getCurrentConversationViewCount();
            var allActions = $.extend(true, [], conversation.Actions);

            if (ignoreViewsFlag) {
                allActions = __.where(allActions, { ActionTypeId: 3 });
            }
            $.each(allActions, function (key, val) {
                LOGGER.debug(NAME, fnName, "Actions.EACH", val);

                if (val.ActionTypeId === 3 && paywallActionFound) {
                } else {
                    var actionPassed = true;

                    try {
                        var who = val.Who;

                        if (who.ViewsCriteria && !ignoreViewsFlag) {
                            if (!__.isArray(who.ViewsCriteria)) {
                                who.ViewsCriteria = [who.ViewsCriteria];
                            }
                            who.ViewsCriteria.forEach(function (criteria) {
                                LOGGER.debug(NAME, fnName, "Checking ViewsCriteria", criteria);

                                if (CnnXt.Utils.JSEvaluate(
                                    parseInt(viewCount),
                                    criteria.Qualifier,
                                    parseInt(criteria.Val),
                                    "ArticleView"
                                )) {
                                } else {
                                    actionPassed = false;
                                }
                            });

                        } else if (who.ViewsCriteria && ignoreViewsFlag) {
                            actionPassed = true;
                        }

                        if (actionPassed) {
                            var additionalData = {
                                conversationId: conversation.id,
                                meterId: conversation.MeterLevelId
                            };

                            if (ignoreViewsFlag) {
                                delete who['ConversationViewsCriteria'];
                            }

                            actionPassed = CnnXt.Utils.ResolveQualifiersFor(who, additionalData);
                        }

                    } catch (ex) {
                        actionPassed = false;
                        LOGGER.exception(NAME, fnName, ex);
                    }
                    if (actionPassed && !CnnXt.Action.ActionInPendingExecutionTime(val) && !CnnXt.Action.ActionLimitIsExceeded(val)) {
                        LOGGER.debug(NAME, fnName, "===== ACTION PASSED =====", val);

                        if (val.ActionTypeId === 3 && !ignoreViewsFlag) {
                            paywallActionFound = true;
                        }

                        if (ignoreViewsFlag) {
                            val = __.findWhere(conversation.Actions, { id: val.id });
                        }

                        actions.push(val);

                    } else {
                        LOGGER.debug(NAME, fnName, "%%%%% ACTION FAILED %%%%%", val);
                    }
                }
            });

            LOGGER.debug(NAME, fnName, 'End determine conversation actions', actions);
            return actions;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getStoredConversationByMeterLevel = function (meterlevel) {
        var fnName = "getStoredConversationByMeterLevel";

        try {
            LOGGER.debug(NAME, fnName, "meterLevel", meterlevel);

            var foundConvo = null;
            var currentConversations = CnnXt.Storage.GetCurrentConversations();

            if (currentConversations) {
                foundConvo = currentConversations[meterlevel];
            } else {
            }

            LOGGER.debug(NAME, fnName, "Found stored conversations for meter level", meterlevel, foundConvo);

            return foundConvo;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    };

    var getAllConversationsByMeterLevel = function (meterlevel) {
        var fnName = "getAllConversationsMeterLevel";

        try {
            LOGGER.debug(NAME, fnName, "meterLevel", meterlevel);
            var conversations = CnnXt.Storage.GetCampaignData().Conversations[meterlevel];

            if (!conversations) {
                LOGGER.debug(NAME, fnName, "No Conversation for " + meterlevel + " meter level");
                conversations = [];
            }

            LOGGER.debug(NAME, fnName, "Found conversations for meter level", meterlevel, conversations);

            return __.sortBy(conversations, 'Order');
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return [];
        }
    };

    var saveCurrentConversation = function (conversation) {
        var fnName = "saveCurrentConversation";

        LOGGER.debug(NAME, fnName, conversation);

        try {
            var allCurrentConversations = CnnXt.Storage.GetCurrentConversations();
            allCurrentConversations[METER_LEVEL] = conversation;
            CnnXt.Storage.SetCurrentConversations(allCurrentConversations);
            CnnXt.Storage.SetActiveConversationId(conversation.id);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var setDefaultConversationProps = function (conversation) {
        var fnName = "setDefaultConversationProps";

        LOGGER.debug(NAME, fnName, conversation);

        try {
            var now = CnnXt.Utils.Now();
            var conversationStartDate = CnnXt.Storage.GetConversationStartDate(conversation.id);
            var currentConversations = CnnXt.Storage.GetCurrentConversations();
            if (conversationStartDate && (!currentConversations || __.isEmpty(currentConversations))) {
                conversation.Props.Date.started = new Date(conversationStartDate);
            } else {
                conversation.Props.Date.started = now;
            }

            if (conversation.Options.Expirations.Time) {
                var startDate = conversation.Props.Date.started;
                conversation.Props.isExpired = false;
                conversation.Props.Date.expiration = new Date(startDate);
                var expireDate = conversation.Props.Date.expiration;

                switch (conversation.Options.Expirations.Time.key) {
                    case "m": expireDate.setMinutes(startDate.getMinutes() + parseInt(conversation.Options.Expirations.Time.val)); break;
                    case "h": expireDate.setHours(startDate.getHours() + parseInt(conversation.Options.Expirations.Time.val)); break;
                    case "d": expireDate.setDate(startDate.getDate() + parseInt(conversation.Options.Expirations.Time.val)); break;
                    case "w": expireDate.setDate(startDate.getDate() + parseInt(conversation.Options.Expirations.Time.val) * 7); break;
                    case "M": expireDate.setMonth(startDate.getMonth() + parseInt(conversation.Options.Expirations.Time.val)); break;
                    case "y": expireDate.setFullYear(startDate.getFullYear() + parseInt(conversation.Options.Expirations.Time.val)); break;
                }
            } else {
                LOGGER.debug(NAME, fnName, "No expiration time set for this conversation.");
            }
            saveCurrentConversation(conversation);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var updateArticleViewCount = function (conversation, count) {
        var fnName = "updateArticleViewCount";

        LOGGER.debug(NAME, fnName);

        try {
            if (__.isNumber(arguments[0])) {
                conversation.Props.views = count;
            } else {
                conversation.Props.views = getCurrentConversationViewCount();
            }
            saveCurrentConversation(conversation);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getCurrentConversationViewCount = function () {
        return CnnXt.Storage.GetCurrentConversationViewCount();
    };

    function updateCurrentConversations (conversation) {
        var allCurrentConversations = CnnXt.Storage.GetCurrentConversations();
        allCurrentConversations[METER_LEVEL] = conversation;
        CnnXt.Storage.SetCurrentConversations(allCurrentConversations);
    }

    return {
        init: function (configSettings) {
            LOGGER = CnnXt.Logger;
            CONFIG_SETTINGS = configSettings;
            LOGGER.debug(NAME, "Initializing Campaign Module...");
        },
        ProcessCampaign: processCampaign,
        GetCurrentConversationProps: function () {
            try {
                return CURRENT_CONVERSATION.Props;
            } catch (ex) {
                LOGGER.exception(NAME, "GetCurrentConversationProps", ex);
                return null;
            }
        },
        GetCurrentConversation: function () {
            return CURRENT_CONVERSATION;
        },
        GetCurrentConversationViewCount: getCurrentConversationViewCount
    };

};

var ConnextAction = function ($) {
    var NAME = "Action";
    var LOGGER;
    var DEFAULT_ACTION_ID = "ConneXt_Action_Id-";
    var CONTENT_SELECTOR, CONTENT_POSITION
    var MASKING_METHOD;
    var ACTION_IS_INITED = false;
    var PROMISES = [];
    var SCHEDULE_ACTIONS = [];
    var CLOSE_CASES = {
        CloseButton: "closeButton",
        CloseSpan: "closeSpan",
        ClickOutside: "clickOutside",
        EscButton: "escButton"
    };
    var FlittzButton = "[data-fz-btn=smartAuth]";
    var ORIGINAL_CONTENT;

    var ACTION_TYPE = {
        Banner: 1,
        Modal: 2,
        Paywall: 3,
        Inline: 4,
        SmallInfoBox: 6,
        JSCall: 7,
        Newsletter: 11,
        Activation: 12
    }

    var processActions = function (actions) {
        var fnName = "processActions";

        LOGGER.debug(NAME, fnName, actions);

        try {
            $.each(actions, function (key, action) {
                LOGGER.debug(NAME, fnName, "Actions.EACH", key, action);

                if (action && action.What && action.What.Html) {
                    if (__.isArray(action.Who.PromiseCriteria)) {
                        LOGGER.debug(NAME, fnName, "Promises array was found");

                        resolvePromiseCriterias(action.Who.PromiseCriteria).then(function () {
                            LOGGER.debug(NAME, fnName, "Promise criterias were resolved");
                            setupAction(action);
                        }, function () {
                            LOGGER.debug(NAME, fnName, "Promise criterias were rejected");
                        });
                    } else {
                        setupAction(action);
                    }
                } else if (action && action.What && action.What.Type == ACTION_TYPE.JSCall) {
                    setupAction(action);
                } else {
                    LOGGER.warn(NAME, fnName, "ACTION has no html", action);
                }
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var resolvePromiseCriterias = function (promiseCriterias) {
        var fnName = 'resolvePromiseCriterias';

        LOGGER.debug(NAME, fnName, promiseCriterias);

        var criteriaResult = $.Deferred();
        PROMISES.push(criteriaResult);
        try {
            var promises = [];

            promiseCriterias.forEach(function (criteria) {
                promises.push(eval(criteria.Name));
            });

            LOGGER.debug(NAME, fnName, 'Setup "Q all" for promise criterias');

            $.when.apply($, promises).then(function () {
                if (!arguments.length) {
                    arguments = [null];
                }

                LOGGER.debug(NAME, fnName, '"Q all" results', arguments);

                Array.prototype.forEach.call(arguments, function (result, index) {
                    var criteria = promiseCriterias[index],
                        promiseValue = result,
                        criteriaValue = criteria.Value;

                    if (!CnnXt.Utils.JSEvaluate(
                        promiseValue,
                        criteria.Qualifier,
                        criteriaValue,
                        "Promise"
                    )) {
                        criteriaResult.reject();
                    }
                });

                criteriaResult.resolve();
            }, function () {
                criteriaResult.reject();
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            criteriaResult.reject();
        }

        return criteriaResult.promise();
    }

    var setupAction = function (action) {
        var fnName = "handleAction";

        LOGGER.debug(NAME, fnName, 'Setup action', action);

        try {
            LOGGER.debug(NAME, fnName, 'Action type', action.What.Type);

            if (action.What.Type != ACTION_TYPE.JSCall) {
                var actionCSS = action.What.CSS,
                    actionHtml = action.What.Html.trim(),
                    $action;

                actionHtml = handleDynamicHtml(actionHtml);

                $action = $(actionHtml);

                $action.prop("id", DEFAULT_ACTION_ID + action.id);
                $action.addClass("hide");
                // that code is applying styles of template from DB. We are doing it dynamically, because we know exactly, do we need that styles on the page or not (will we show template or not), only in this place of code. 
                $action.prepend('<style id="' + action.id + '-mg2style' + '"' + '>' + actionCSS + '</style>');

                if ($("#themeLink").length == 0) {
                    $("body").append($action);
                } else {
                    $("#themeLink").before($action);
                }
            } else {
                LOGGER.debug(NAME, fnName, 'Action type is JS Call');
            }

            action.inProgress = false;
            
            registerActionEvents(action);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var executeAction = function (action) {
        var fnName = "executeAction";

        LOGGER.debug(NAME, fnName, 'Starting executing action...', action);

        try {
            if (action.What.Type == ACTION_TYPE.Paywall) {
                LOGGER.debug(NAME, fnName, 'Action type is paywall. So we hide a content.');

                hideContent(action);
            }
            action.closeEvent = null;
            var $action = $("#" + DEFAULT_ACTION_ID + action.id);

            $action.removeClass("hide");

            LOGGER.debug(NAME, fnName, 'Action type', action.What.Type, action);

            if (action.What.Type == ACTION_TYPE.Banner) {
                var bannerLocation = (action.What.Location) ? action.What.Location : "top";
                var animation = {};

                animation[bannerLocation] = "0px";
                $action.css(bannerLocation, "-2500px").removeClass("hide");

                var height = $action.outerHeight();
                $action.css(bannerLocation, "-" + height + "px").animate(animation, function () {
                });
            }

            if (action.What.Type == ACTION_TYPE.Modal) {
                $action.addClass("in");
                $action.connextmodal({ backdrop: "true" });
                $action.resize();
                $action.css("display", "block");

                if (action.What["Transparent backdrop"] == "True" || action.What["Transparent backdrop"] == "true") {
                    $(".connext-modal-backdrop.fade.in").addClass("transparent");
                } else {
                    $(".connext-modal-backdrop.fade.in").removeClass("transparent");
                }

                $($action).one('keydown', function (e) {
                    if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                        action.closeEvent = CLOSE_CASES.EscButton;
                        
                    }
                })
                    .one("hidden", function (e) {
                        
                            if (action.closeEvent == null || action.closeEvent == undefined) {

                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action[0].innerHTML;
                                CnnXt.Event.fire("onActionClosed", action);
                            } else if (action.closeEvent === CLOSE_CASES.EscButton || action.closeEvent === CLOSE_CASES.CloseButton) {
                                action.actionDom = $action[0].innerHTML;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                      
                    });
            }

            var parentWidth;
            var selectorFragment;

            if (action.What.Type == ACTION_TYPE.Paywall) {
                var displayType = $action.data("display-type");

                LOGGER.debug(NAME, fnName, "Paywall display type", displayType);

                if (displayType == "inline") {
                    CONTENT_SELECTOR = action.What.Selector;
                    CONTENT_POSITION = action.What.Position;
                    if ($(CONTENT_SELECTOR).length == 0) {
                        LOGGER.warn(NAME, fnName, "Not found element by current content selector", CONTENT_SELECTOR);
                        $action.remove();
                        return false;
                    }
                    $action.remove();
                    parentWidth = $(CONTENT_SELECTOR).width();
                    selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00";
                    $action.addClass("Mg2-inline-scale-" + selectorFragment);

                    if ((CONTENT_POSITION) == 'before') {
                        $(CONTENT_SELECTOR).prepend($action);
                    } else {
                        $(CONTENT_SELECTOR).append($action);
                    }

                    $(window, CONTENT_SELECTOR).resize(function () {
                        var parentWidth = $(CONTENT_SELECTOR).width(),
                            selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                            classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");

                        $action.attr("class", classList);
                        $action.addClass("Mg2-inline-scale-" + selectorFragment);
                    });

                } else if (displayType == "modal") {
                    $action.addClass("in");

                    if (action.What["NotClosable_paywall"] == "True" || action.What["NotClosable_paywall"] == "true") {
                        $action.find('.closebtn').attr('data-dismiss', 'notclosablepaywall');//make paywall not closable within closing button
                        $action.connextmodal({ backdrop: "static", keyboard: false });
                    } else {
                        $action.connextmodal({ backdrop: "true" });
                    }

                    if (action.What["Transparent_backdrop_paywall"] == "True" || action.What["Transparent_backdrop_paywall"] == "true") {
                        $(".connext-modal-backdrop.fade.in").addClass("transparent");
                    } else {
                        $(".connext-modal-backdrop.fade.in").removeClass("transparent");
                    }

                    $action.resize();
                    $action.css("display", "block");

                    $($action)
                        .one('keydown', function (e) {
                            if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                                action.closeEvent = CLOSE_CASES.EscButton;
                            }
                        })
                        .one("hidden", function (e) {
                            if (action.closeEvent == null || action.closeEvent == undefined) {
                                if (action.What["NotClosable_paywall"] == "True" || action.What["NotClosable_paywall"] == "true") {
                                    return false;
                                }

                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action;
                                CnnXt.Event.fire("onActionClosed", action);
                            } else if (action.closeEvent === CLOSE_CASES.EscButton || action.closeEvent === CLOSE_CASES.CloseButton) {
                                action.actionDom = $action[0].innerHTML;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                        });
                } else if (displayType == "banner") {
                    var bannerLocation = "bottom";
                    var animation = {};

                    animation[bannerLocation] = "0px";
                    $action.css(bannerLocation, "-2500px").removeClass("hide");

                    var height = $action.outerHeight();
                    $action.css(bannerLocation, "-" + height + "px").animate(animation, function () {
                    });

                } else {
                    LOGGER.debug(NAME, fnName, "Can't determine display type for paywall.");
                }

                $("#ConneXt_Action_Id-" + action.id)
                    .find(FlittzButton)
                    .click(function (e) {
                        action.Conversation = CnnXt.Campaign.GetCurrentConversation();
                        action.Conversation.Campaign = CnnXt.Storage.GetCampaignData();
                        action.ButtonArgs = e;
                        action.ActionDom = $action[0].innerHTML;
                        if (CnnXt.GetOptions().integrateFlittz) {
                            CnnXt.Event.fire("onFlittzButtonClick", action);
                        }
                    });
            }

            if (action.What.Type == ACTION_TYPE.Inline) {
                CONTENT_SELECTOR = action.What.Selector;
                CONTENT_POSITION = action.What.Position;
                if ($(CONTENT_SELECTOR).length == 0) {
                    LOGGER.warn(NAME, fnName, "Not found element by current content selector", CONTENT_SELECTOR);
                    $action.remove();
                    return false;
                }

                parentWidth = $(CONTENT_SELECTOR).width();
                selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00";
                $action.addClass("Mg2-inline-scale-" + selectorFragment);

                if ((CONTENT_POSITION) == 'before') {
                    $(CONTENT_SELECTOR).prepend($action);
                } else {
                    $(CONTENT_SELECTOR).append($action);
                }

                $(window, CONTENT_SELECTOR).resize(function () {
                    var parentWidth = $(CONTENT_SELECTOR).width(),
                        selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                        classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");

                    $action.attr("class", classList);
                    $action.addClass("Mg2-inline-scale-" + selectorFragment);
                });
            }

            if (action.What.Type == ACTION_TYPE.SmallInfoBox) {
                $action.removeClass("hide");
            }

            if (action.What.Type == ACTION_TYPE.JSCall) {
                $("#ConneXt_Action_Id-" + action.id).remove();

                try {
                    if (action.What.Javascript != undefined) {
                        try {
                            eval(action.What.Javascript);
                        } catch (ex) {
                            LOGGER.warn(NAME, fnName, ex);
                        }
                    }
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, "Custom JS Call", ex);
                }
            }

            if (action.What.Type == ACTION_TYPE.Newsletter) {
                displayType = $action.data("display-type");
                LOGGER.debug(NAME, fnName, "Newsletter display type", displayType);

                if (displayType == "inline") {
                    CONTENT_SELECTOR = action.What.Selector;
                    if ($(CONTENT_SELECTOR).length == 0) {
                        LOGGER.warn(NAME, fnName, "Not found element by current content selector", CONTENT_SELECTOR);
                        $action.remove();
                        return false;
                    }

                    parentWidth = $(CONTENT_SELECTOR).width();
                    selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00";
                    $action.addClass("Mg2-inline-scale-" + selectorFragment);

                    $(CONTENT_SELECTOR).append($action);

                    $(window, CONTENT_SELECTOR).resize(function () {
                        var parentWidth = $(CONTENT_SELECTOR).width(),
                            selectorFragment = (String(parentWidth).length < 4) ? String(parentWidth)[0] + "00" : String(parentWidth)[0] + String(parentWidth)[1] + "00",
                            classList = $action.attr("class").replace(/\b\sMg2-inline-scale-\d+\b/g, "");
                        $action.attr("class", classList);
                        $action.addClass("Mg2-inline-scale-" + selectorFragment);
                    });
                } else if (displayType == "modal") {
                    $action.addClass("in");
                    $action.connextmodal({ backdrop: "true" });
                    $action.resize();
                    $action.css("display", "block");

                    $($action)
                        .one('keydown', function (e) {
                            if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                                action.closeEvent = CLOSE_CASES.EscButton;
                            }
                        })
                        .one("hidden", function () {
                            if (action.closeEvent == null || action.closeEvent == undefined) {
                                action.closeEvent = CLOSE_CASES.ClickOutside;
                                action.actionDom = $action[0].innerHTML;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                            else if (action.closeEvent === CLOSE_CASES.EscButton || action.closeEvent === CLOSE_CASES.CloseButton) {
                                action.actionDom = $action[0].innerHTML;
                                CnnXt.Event.fire("onActionClosed", action);
                            }
                        });
                }
            }

            var id = $action.attr("id");

            $("#" + id + " [data-dismiss=banner], #"
                + id + " [data-dismiss=info-box], #"
                + id + " [data-dismiss=inline], #"
                + id + "  [data-dismiss=modal]")
                .one("click", function (e) {
                    e.preventDefault();
                    var $btn = $(this),
                        href = $btn.attr('href');
                    if (href == "#" || !href) {
                        action.closeEvent = CLOSE_CASES.CloseButton;
                        $btn.closest(".Mg2-connext").addClass("hide");
                        action.actionDom = $action[0].innerHTML;
                        LOGGER.debug(NAME, fnName, "Click by link without href", href);
                        if (!$(action.What.Html).hasClass('modal')) {
                            CnnXt.Event.fire("onActionClosed", action);
                        }
                    } else {
                        if ($btn[0].hasAttribute("target")) {
                            LOGGER.debug(NAME, fnName, "Open in a new window", href);
                            window.open(href, "_blank");
                        } else {
                            LOGGER.debug(NAME, fnName, "Open in the current window", href);
                            window.location.href = href;
                        }
                        CnnXt.Event.fire("onButtonClick", action);
                    }
                });

            $("#" + id + " [data-dismiss=notclosablepaywall]").one('click', function (e) {
                e.preventDefault();
                var $btn = $(this),
                    href = $btn.attr('href');
                if (href == "#" || !href) {
                    return false;
                } else {
                    if ($btn[0].hasAttribute("target")) {
                        LOGGER.debug(NAME, fnName, "Open in a new window", href);
                        window.open(href, "_blank");
                    } else {
                        LOGGER.debug(NAME, fnName, "Open in the current window", href);
                        window.location.href = href;
                    }
                    CnnXt.Event.fire("onButtonClick", action);
                }
            });

            if (action.What.Type != ACTION_TYPE.JSCall) {
                action.actionDom = $action[0].innerHTML;
            }

            CnnXt.Event.fire("onActionShown", action);

            if (action.When && action.When.Time) {
                CnnXt.Storage.SetTimeRepeatableActionData(action); 
            }
           
        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

    var targetIsSelf = function (callback) {
        return function (e) {
            if (e && this === e.target) {
                return callback.apply(this, arguments);
            }
            return callback.apply(this, arguments);
        };
    };

    var registerActionEvents = function (action) {
        var fnName = "registerActionEvents";

        LOGGER.debug(NAME, fnName, action);

        try {
            if (!action.When) {
                LOGGER.debug(NAME, fnName, 'Action has no When object. So we set default values');

                action.When = {
                    Time: {
                        Delay: 0
                    }
                };
            }

            if (action.When && action.When.Time) {
                LOGGER.debug(NAME, fnName, 'Action has When.Time object.');

                action.count = 0;
                setTimedAction(action);
            } else if (action.When && action.When.Hover) {
                LOGGER.debug(NAME, fnName, 'Action has When.Hover object.');

                setHoverEvent(action);
            } else if (action.When && action.When.EOS) {
                LOGGER.debug(NAME, fnName, 'Action has When.EOS object.');

                SetEosEvent(action);
            } else {
                LOGGER.warn("No action to register");
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var setTimedAction = function (action, repeat) {
        var fnName = "setTimedAction";

        LOGGER.debug(NAME, fnName, 'Set action start by time', arguments);

        try {
            var timer = setTimeout(function () {
                executeAction(action);
                action.count++;
                CnnXt.Storage.UpdateRepeatablesInConv(action.id);
            }, action.When.Time.Delay);
            SCHEDULE_ACTIONS.push({item: timer, type: 'timer'});

            LOGGER.debug(NAME, fnName, 'Action will be execute after: ', action.When.Time.Delay + 'ms');

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var SetEosEvent = function (action) {
        var fnName = "SetEosEvent";

        LOGGER.debug(NAME, fnName, 'Set action start by EOS', arguments);

        try {
            action.count = 0;

            var actionElem = "#ConneXt_Action_Id-" + action.id;

            var timer = setTimeout(function () {
                var item = $(action.When.EOS.Selector).viewportChecker({
                    offset: 10,
                    classToAdd: "visible-" + action.id,

                    callbackFunctionBeforeAddClass: function (elem) {
                        if (elem.hasClass("visible-" + action.id)) {
                            return;
                        }
                        var repeatable = CnnXt.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).is(":not(:visible)")) {
                            if (action.When.EOS.Repeatable > action.count && action.When.EOS.RepeatableConv > repeatable) {
                                if (!action.inProgress) {
                                    action.inProgress = true;
                                    executeAction(action);
                                    action.count++;
                                    action.inProgress = false;
                                    CnnXt.Storage.UpdateRepeatablesInConv(action.id);

                                }
                            }
                        }
                    },
                    callbackFunction: function (elem) {
                        $(elem).removeClass("visible" + action.id);
                    },
                    repeat: true,
                    scrollHorizontal: false
                });
                SCHEDULE_ACTIONS.push({item: item, type: 'viewportChecker'})
            }, action.When.EOS.Delay);
            SCHEDULE_ACTIONS.push({item: timer, type: 'timer'})
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };
    var setHoverEvent = function (action) {
        var fnName = "setHoverEvent";

        LOGGER.debug(NAME, fnName, 'Set action start by hover', arguments);

        try {
            var delay = (action.When.Hover.Delay) ? (action.When.Hover.Delay) : 0;

            var timer = setTimeout(function () {

                var numShown = 0,
                    actionElem = "#ConneXt_Action_Id-" + action.id;

                $(action.When.Hover.Selector).on("mouseenter", hoverFunc).children().mouseover(function () {
                    if (action.When.Hover.IncludeChildren == "False") {
                        return false;
                    }
                   
                });
                function hoverFunc(e) {
                    e.stopPropagation();
                    if (__.isNumber(parseInt(action.When.Hover.Repeatable)) && __.isNumber(parseInt(action.When.Hover.RepeatableConv))) {
                        var repeatable = CnnXt.Storage.GetRepeatablesInConv(action.id);
                        if ($(actionElem).is(":not(:visible)")) {
                            if (numShown < action.When.Hover.Repeatable && action.When.Hover.RepeatableConv > repeatable) {
                                executeAction(action);
                                numShown++;
                                CnnXt.Storage.UpdateRepeatablesInConv(action.id);
                            }
                        } else {
                            return false;
                        }
                    }
                    return false;
                }
                SCHEDULE_ACTIONS.push({selector: action.When.Hover.Selector, type: 'hover', handler: hoverFunc})
            }, delay);
            SCHEDULE_ACTIONS.push({item: timer, type: 'timer'})
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    function clearActionsSchedule() {
        var fnName = 'clearActionsSchedule';
        try {
            if (ACTION_IS_INITED) {
                LOGGER.debug(NAME, fnName, 'Clear all planned actions', SCHEDULE_ACTIONS);
                SCHEDULE_ACTIONS.forEach(function (value) {
                    switch (value.type) {
                        case ('timer'):
                            clearTimeout(value.item);
                            break;
                        case ('viewportChecker'):
                            value.item.destroy();
                            break;
                        case ('hover'):
                            $(value.selector).off("mouseenter", value.handle);
                            break;
                    }

                });
                SCHEDULE_ACTIONS = [];
                CnnXt.MeterCalculation.BreakDMPromises();
                CnnXt.Utils.BreakConversationPromises();
                breakActionsPromises();
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var hideContent = function (action) {
        var fnName = "hideContent";

        CnnXt.Logger.debug(NAME, fnName, arguments);

        try {
            var regExp = new RegExp(/script|style|meta/i);

            MASKING_METHOD = action.What.Effect;
            CONTENT_SELECTOR = action.What.Selector;
            var TERMINATOR = action.What.Terminator;

            var allowedCharactersCount = action.What.PrevChars;
            var currentCharacterPosition = 0;
            var parent = $(CONTENT_SELECTOR)[0];
            var $originalContent = $(CONTENT_SELECTOR).clone();
            $originalContent.find(".Mg2-connext[data-display-type=inline]").remove();
            $originalContent.find(".Mg2-connext[data-display-type=info-box]").remove();
            $originalContent.find(".Mg2-connext[data-display-type=banner]").remove();
            ORIGINAL_CONTENT = $originalContent[0].innerHTML;
            var childs = parent.childNodes;
            if (MASKING_METHOD) {
                calculateTagText(parent, childs);
            }
            $(".flittz").removeClass("blurry-text");
            $(".flittz").removeClass("trimmed-text");
            $(".trimmed-text").remove();

            function calculateTagText(parent, childs) {
                for (var i = 0; i < childs.length; i++) {
                    var child = childs[i];

                    if (currentCharacterPosition >= allowedCharactersCount) {
                        var span;

                        if (MASKING_METHOD == "blur") {
                            if (!child.classList) {
                                span = document.createElement("span");
                                span.innerHTML = child.textContent;
                                span.classList.add("blurry-text");
                                mixContent(span);

                                child.parentNode.insertBefore(span, child);
                                parent.removeChild(child);
                            } else {
                                child.classList.add("blurry-text");
                                mixContent(child);
                            }
                        } else {
                            if (!child.classList) {
                                span = document.createElement("span");
                                span.innerHTML = child.textContent;
                                span.classList.add("trimmed-text");

                                child.parentNode.insertBefore(span, child);
                                parent.removeChild(child);
                            }
                            else {
                                child.classList.add("trimmed-text");
                            }
                        }
                    } else {

                        if (child.tagName) {

                            if (!regExp.test(child.tagName)) {
                                calculateTagText(child, child.childNodes);
                            }
                        } else {
                            currentCharacterPosition += child.length;

                            if (allowedCharactersCount <= currentCharacterPosition) {

                                var excess = currentCharacterPosition - allowedCharactersCount;
                                var trimmedText = child.textContent.substr(0, child.textContent.length - excess);
                                var cutPosition = Math.min(trimmedText.length, trimmedText.lastIndexOf(" "));
                                var excludedText;
                                if (cutPosition != -1) {
                                    trimmedText = trimmedText.substr(0, cutPosition) + TERMINATOR;
                                    excludedText = child.textContent.substr(cutPosition);
                                } else {
                                    excludedText = child.textContent.substr(trimmedText.length);
                                    trimmedText += TERMINATOR;
                                }
                                child.textContent = trimmedText;
                                var spanWithBlurredText = document.createElement("span");
                                spanWithBlurredText.innerHTML = excludedText;
                                spanWithBlurredText.classList.add(MASKING_METHOD == "blur" ? "blurry-text" : "trimmed-text");
                                mixContent(spanWithBlurredText);
                                parent.insertBefore(spanWithBlurredText, childs[i + 1]);

                                for (var j = i + 1; j < childs.length; j++) {
                                    child = childs[j];
                                    if (child.classList) {
                                        if (!regExp.test(child.tagName)) {
                                            child.classList
                                                .add(MASKING_METHOD == "blur" ? "blurry-text" : "trimmed-text");
                                            mixContent(child);
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

        } catch (ex) {
            throw CnnXt.Logger.exception(CnnXt.Common.ERROR.HIDE_CONTENT);
        }
    };

    var mixContent = function (item) {
        var fnName = 'mixContent';

        try {
            if ($(item).children().length == 0) {
                var txt = $(item).text();

                if (txt) {
                    for (var i = 0; i < txt.length; i++) {
                        txt = txt.replaceAt(i, CnnXt.Utils.GetNextLetter(txt[i]));
                    }
                }

                $(item).text(txt);
            } else {
                $.each($(item).children(), function (key, val) {
                    mixContent(val);
                });
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var integrateProduct = function () {
        var fnName = "showContent";

        try {
            if (LOGGER) {
                LOGGER.debug(NAME, fnName);
            }

            $(CONTENT_SELECTOR).html(ORIGINAL_CONTENT);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var getDaysToExpire = function (currentConv) {
        var fnName = 'getDaysToExpire';

        LOGGER.debug(NAME, fnName, currentConv);

        try {
            var now = CnnXt.Utils.Now(),
                daysToExpire = new Date(currentConv.Props.Date.expiration),
                diff;

            if (currentConv.Options.Expirations.Time.key == "d" || currentConv.Options.Expirations.Time.key == "w" || currentConv.Options.Expirations.Time.key == "m" || currentConv.Options.Expirations.Time.key == "y") {
                diff = parseInt((daysToExpire - now) / 86400000) + 1;
            } else {
                diff = parseInt((daysToExpire - now) / 86400000);
            }

            return (diff <= 0) ? 'less than 1' : diff;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    function getArticleCost ()  {
        var fnName = 'getArticleCost',
            ARTICLE_COST_STORAGE_NAME = 'ArticleCost';

        LOGGER.debug(NAME, fnName);

        return sessionStorage.getItem(ARTICLE_COST_STORAGE_NAME)
    }

    var handleDynamicHtml = function (html) {
        var fnName = "handleDynamicHtml";

        LOGGER.debug(NAME, fnName, arguments);

        try {
            var regEx = /{{(.*?)}}/g;
            var currentConversationProps = CnnXt.Campaign.GetCurrentConversationProps(),
                currentConversation = CnnXt.Campaign.GetCurrentConversation();

            var FixedHtml = html.replace(regEx, function (match) {
                var fnName = "FixedHtml";
                var fallbackName = 'User';
                switch (match) {
                    case "{{FreeViewsLeft}}":
                        var viewsLeft = eval(currentConversationProps.paywallLimit - currentConversationProps.views);
                        if (parseInt(viewsLeft) < 0) {
                            viewsLeft = 0;
                        }
                        LOGGER.debug(NAME, fnName, 'Replace FreeViewsLeft to', viewsLeft);
                        return viewsLeft;
                    case "{{CurrentViewCount}}":
                        LOGGER.debug(NAME, fnName, 'Replace CurrentViewCount to', currentConversationProps.views);
                        return currentConversationProps.views;
                    case "{{ExpireTimeLeft}}":
                        LOGGER.debug(NAME, fnName, 'Replace FreeViewsLeft to', getDaysToExpire(currentConversation));
                        return getDaysToExpire(currentConversation);
                    case "{{ArticleCost}}":
                        LOGGER.debug(NAME, fnName, 'Replace ArticleCost to', getArticleCost());
                        return getArticleCost() ? getArticleCost() : '';
                    case "{{UserFullName}}":
                        try {
                            var state = CnnXt.Storage.GetUserState(),
                                authType = CnnXt.Storage.GetLocalConfiguration().Site.RegistrationTypeId,
                                userData;

                            LOGGER.debug(NAME, fnName, 'Replace UserFullName');

                            if (state) {
                                if (state == 'Logged Out') {
                                    return fallbackName;
                                }

                                if (state !== 'Logged Out') {
                                    if (state !== 'Logged In' && authType === 1) {
                                        userData = CnnXt.Storage.GetUserData();
                                        if (userData) {
                                            var fullName = null;
                                            if (userData.OwnedSubscriptions) {
                                                fullName = userData.OwnedSubscriptions[0].FullName;
                                            } else if (userData.Subscriptions) {
                                                fullName = userData.Subscriptions.OwnedSubscriptions[0].FirstName + ' ' + userData.Subscriptions.OwnedSubscriptions[0].LastName;
                                            }
                                            return fullName || fallbackName;
                                        } else return fallbackName;
                                    } else {
                                        if (authType === 2) {
                                            userData = CnnXt.Storage.GetJanrainUser();
                                            if (userData) {
                                                return userData.displayName || fallbackName;
                                            } else return fallbackName;
                                        }
                                        if (authType === 3) {

                                        }
                                        if (authType === 4) {
                                            userData = CnnXt.Storage.GetUserProfile();
                                            if (userData) {
                                                return userData.name || userData.nickname || fallbackName;
                                            } else return fallbackName;
                                        }
                                        if (authType === 5) {
                                            userData = CnnXt.Storage.GetUserData();
                                            if (userData) {
                                                return userData.DisplayName;
                                            }
                                        }
                                    }
                                }
                            } else return fallbackName;
                        } catch (ex) {
                            LOGGER.exception(NAME, fnName, ex);
                            return fallbackName;
                        }
                }
            });

            var $html = $(FixedHtml);

            CnnXt.Utils.AddQueryParamsToAllLinks($html);

            return $html[0].outerHTML;
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return html;
        }
    };

    var initListeners = function () {
        $('body').on('click', '[data-mg2-action="click"]', commonClickHandler);

        $("body").on('click', '[data-mg2-action="login"], [data-mg2-action="connextRun"], [data-mg2-action="submit"], [data-mg2-action="Zipcode"], [data-mg2-action="openNewsletterWidget"],[data-mg2-action="activation"]',
            function (event) {
                event.preventDefault();

                commonClickHandler(event);
            });

        $('body').on('click', '[data-mg2-action="click-Newsday"]', newsdayClickHadler);
    };

    function commonClickHandler(event) {
        var $target = $(event.target),
            parents = $target.parents('.Mg2-connext'),
            elementId,
            actionId;

        if (parents.length) {
            elementId = $(parents[0]).attr('id');
            if (elementId) {
                actionId = parseInt(elementId.split('-')[1]);
                event.actionId = actionId;
            }
        }

        CnnXt.Event.fire("onButtonClick", event);
    };

    function newsdayClickHadler(event) {
        var $target = $(event.target),
            parents = $target.parents('.Mg2-connext'),
            elementId,
            actionId;

        if (parents.length) {
            elementId = $(parents[0]).attr('id');
            if (elementId) {
                actionId = parseInt(elementId.split('-')[1]);
                event.actionId = actionId;
            }
        }

        CnnXt.Event.fire("onNewsdayButtonClick", event);
        CnnXt.Event.fire("onButtonClick", event);
    };

    function actionInPendingExecutionTime(action) {
        var fnName = 'actionInPendingExecutionTime';

        try {
            var repeatableActionData = CnnXt.Storage.GetTimeRepeatableActionData(action),
                now = new Date(),
                inPendingExecution = false;

            if (repeatableActionData && repeatableActionData.date) {
                inPendingExecution = (now < new Date(repeatableActionData.date));
            }

            return inPendingExecution
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        } 
    }

    function actionLimitIsExceeded(action) {
        var fnName = 'actionLimitIsExceeded';

        try {
            var repeatableActionData = CnnXt.Storage.GetTimeRepeatableActionData(action),
                limitIsExceeded = false;

            if (repeatableActionData && repeatableActionData.count) {
                if (action.When && action.When.Time && action.When.Time.RepeatableConv){
                    limitIsExceeded = (repeatableActionData.count >= action.When.Time.RepeatableConv);
                } else {
                    limitIsExceeded = false;
                }
            }

            return limitIsExceeded;

        } catch (ex){
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    }

    var breakActionsPromises = function () {
        var fnName = 'breakActionsPromises';

        try {
            LOGGER.debug(NAME, fnName, 'ActionPromises ', PROMISES);

            PROMISES.forEach(function (value) {
                if (value.state() === "pending") {
                    value.reject();
                }
            });
            PROMISES = [];
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    return {
        init: function () {
            LOGGER = CnnXt.Logger;
            LOGGER.debug(NAME, "Initializing Action Module...");
            initListeners();
            ACTION_IS_INITED = true;
        },
        ProcessActions: processActions,
        IntegrateProduct: integrateProduct,
        ActionInPendingExecutionTime: actionInPendingExecutionTime,
        ActionLimitIsExceeded: actionLimitIsExceeded,
        ClearActionsSchedule: clearActionsSchedule
    };

};

var ConnextWhitelist = function ($) {

    var NAME = "Whitelist",
        LOGGER,
        USER_IP = '',
        WHITELIST_SET = null;

    var CLOSE_TRIGGER = {
        CloseButton: "closeButton",
        ClickOutside: "clickOutside",
        AccessGranted: "accessGranted",
        EscButton: "escButton"
    };

    var TEMPLATE_CLOSED = true;

    var $tpl;
    var configuration;

    var wrongPinStatus = 100;

    var processSuccessfulIpRequest = function(data, config) {
        if (data && data.ipAddress) {
            USER_IP = data.ipAddress;
            WHITELIST_SET = [];

            if (config && config.WhitelistSets) {
                config.WhitelistSets.forEach(function (set) {
                    if (set && __.isArray(set.IPs)) {
                        set.IPs.forEach(function (allowedIP) {
                            if (compareIPs(USER_IP, allowedIP.IP)) {
                                WHITELIST_SET.push(set);
                            }
                        });
                    }
                });
            }
        }

        if (!WHITELIST_SET.length) {
            determinePinTemplate(WHITELIST_SET);
        } else {
            if (!WHITELIST_SET[0].CodesAreNotRequired) {
                determinePinTemplate(WHITELIST_SET);
            } else {
                CnnXt.Event.fire('onAccessGranted', { message: "Success! Now you have full access", status: 200 });
            }
        }
    };

    var checkClientIp = function (config) {
        var fnName = 'checkClientIp';

        LOGGER.debug(NAME, fnName, 'Check client IP');

        configuration = config;

        return $.ajax({
            url: CnnXt.Common.IPInfo,
            type: "GET",
            success: function (data) {
                LOGGER.debug(NAME, fnName, 'success', data);

                processSuccessfulIpRequest(data, config);
            },
            error: function () {
                LOGGER.debug(NAME, fnName, 'IPInfo call failed. Calling API to get info');

                CnnXt.API.GetClientIpInfo()
                    .done(function (data) {
                        LOGGER.debug(NAME, fnName, 'success', data);

                        processSuccessfulIpRequest(data, config);
                    })
                    .fail(function (data) {
                        LOGGER.debug(NAME, fnName, 'error', data);
                        determinePinTemplate(WHITELIST_SET);
                    });
            }
        });
    };

    function compareIPs(userIP, allowedIP) {
        var fnName = 'compareIPs';

        try {
            var IP_AND_CIDR_REGEX = /^([0-9]{1,3}\.){3}[0-9]{1,3}(\/([0-9]|[1-2][0-9]|3[0-2]))?$/;

            if (!userIP || !allowedIP) {
                return false;
            }

            var isIP = false,
                isCIDR = false;

            if (IP_AND_CIDR_REGEX.test(allowedIP)){
                if (!~allowedIP.indexOf('/')) {
                    isIP = true;
                } else {
                    isCIDR = true;
                }
            } 

            if (isIP) {
                return userIP === allowedIP;
            }

            if (isCIDR) {
                return CnnXt.Utils.IPWithinRangeCIDR(userIP, allowedIP);
            }

            return false;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return false;
        }
    }

    function determinePinTemplate(whiteListSet) {
        var infoboxcookie = CnnXt.Storage.GetWhitelistInfoboxCookie();
        var needHidePinTemplate = CnnXt.Storage.GetNeedHidePinTemplateCookie();

        if (!needHidePinTemplate && whiteListSet && whiteListSet.length) {
            if (whiteListSet[0].InfoBoxHtml && infoboxcookie) {
                $tpl = $('.Mg2-pin-infobox');

                if (!$tpl || !$tpl.length) {
                    $('body').append(whiteListSet[0].InfoBoxHtml);
                    $tpl = $('.Mg2-pin-infobox');
                }

                var someAttemptsLeft = checkPinAttempts();
                if (!someAttemptsLeft) {
                    noPinAttemptsLeft($tpl);
                }

                $tpl.show();
                fireShowEvent();
                TEMPLATE_CLOSED = false;
                CnnXt.ConnextContinueProcessing(configuration);

            } else if (whiteListSet[0].ModalHtml && !infoboxcookie) {
                $tpl = $('.Mg2-pin-modal');

                if (!$tpl || !$tpl.length) {
                    $('body').append(whiteListSet[0].ModalHtml);
                    $tpl = $('.Mg2-pin-modal');
                }

                var someAttemptsLeft = checkPinAttempts();
                if (!someAttemptsLeft) {
                    noPinAttemptsLeft($tpl);
                }

                $tpl.on("show.bs.modal", function (e) {
                    fireShowEvent();
                    TEMPLATE_CLOSED = false;
                });
                $tpl.addClass("in");
                $tpl.connextmodal({ backdrop: "true" });
                $tpl.resize();
            } else {
                CnnXt.ConnextContinueProcessing(configuration);
            }

            setupPinCheckHandlers();
        } else {
            CnnXt.ConnextContinueProcessing(configuration);
        }
    };

    var checkPinAttempts = function () {
        var pinAttempts = CnnXt.Storage.GetPinAttempts();
        var someAttemptsLeft = true;
        if (pinAttempts && pinAttempts >= 5) {
            someAttemptsLeft = false;
        }
        return someAttemptsLeft;
    };

    var noPinAttemptsLeft = function ($tpl) {
        var $messageEl = $tpl.find('.Mg2-pin__message');

        $messageEl
            .text('You exceeded maximum amount of attempts. You will be allowed to try again in 15 minutes.')
            .addClass('Mg2-pin__message_error')
            .show();

        $tpl.find('.Mg2-pin__input').hide();
        $tpl.find('.Mg2-pin__button').hide();
    }

    var setupPinCheckHandlers = function () {
        var $pinModal = $('.Mg2-pin-modal'),
            $pinInfoBox = $('.Mg2-pin-infobox');

        $('.Mg2-pin__button').on('click', function () {
            var $tpl = $(this).parents('.Mg2-pin');
            var someAttemptsLeft = checkPinAttempts();

            if (!someAttemptsLeft) {
                noPinAttemptsLeft($tpl);
                return;
            }

            var $passwordEl = $tpl.find('.Mg2-pin__input[type="password"]');
            var $messageEl = $tpl.find('.Mg2-pin__message');

            $messageEl.hide().removeClass('Mg2-pin__message_error Mg2-pin__message_success');
            $passwordEl.removeClass('Mg2-pin__input_error');

            if ($passwordEl.val().length) {
                checkMg2Pin($passwordEl.val(), $messageEl, $passwordEl);
            } else {
                $passwordEl.addClass('Mg2-pin__input_error');
                $messageEl.text('Please enter code')
                .addClass('Mg2-pin__message_error')
                .show();
            }
        });

        $pinModal
            .on('keydown', function (e) {
                if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                    $pinModal.closeEvent = CLOSE_TRIGGER.EscButton;
                    
                }
            })
            .on("hidden", function (e) {
                CnnXt.Storage.SetWhitelistInfoboxCookie(true);
                if ($pinModal.closeEvent == null || $pinModal.closeEvent == undefined) {
                    fireCloseEvent(CLOSE_TRIGGER.ClickOutside);
                } else if ($pinModal.closeEvent == CLOSE_TRIGGER.EscButton) {
                    fireCloseEvent(CLOSE_TRIGGER.EscButton);
                }

                if (!CnnXt.Storage.GetWhitelistSetIdCookie()) {
                    CnnXt.ConnextContinueProcessing(configuration);
                }
            })
            .on('click', '[data-dismiss]', function (e) {
                if ($(this).hasClass('proceed-without-pin')) {
                    CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
                }
                $pinModal.closeEvent = CLOSE_TRIGGER.CloseButton;
                fireCloseEvent(CLOSE_TRIGGER.CloseButton);
            });

        $pinInfoBox
            .on('click', '[data-dismiss]', function (e) {
                e.preventDefault();
                $pinInfoBox.hide();
                fireCloseEvent(CLOSE_TRIGGER.CloseButton);
            })
            .on('click', '.proceed-without-pin', function (e) {
                CnnXt.Storage.SetNeedHidePinTemplateCookie(true);
            });

        function checkMg2Pin(pin, $messageEl, $passwordEl) {
            var url = CnnXt.GetOptions().api + "api/whitelist/check";

            var Ids = [];

            for (var i = 0; i < WHITELIST_SET.length; i++) {
                Ids.push( WHITELIST_SET[i].id )
            }

            var payload = {
                code: pin,
                SetIds: Ids,
                Ip: USER_IP
            };

            $.ajax({
                method: "POST",
                url: url,
                data: payload
            }).done(function (response) {
                LOGGER.debug(NAME, 'Check PIN', 'Success', response);

                CnnXt.Storage.SetWhitelistSetIdCookie({ Id: response.WhitelistSetId, Expiration: response.expires },
                    new Date(response.expires));
                mg2PinSuccess($messageEl, { message: "Success! Now you have full access", status: 200 });

                var data = {
                    UserId: Fprinting().getDeviceId(),
                    ConfigCode: CnnXt.GetOptions().configCode,
                    SiteCode: CnnXt.GetOptions().siteCode,
                    SettingsKey: CnnXt.GetOptions().settingsKey,
                    ViewData: CnnXt.Storage.GetLocalViewData()
                };

                if (CnnXt.User.getMasterId()) {
                    data.masterId = CnnXt.User.getMasterId();
                }

                CnnXt.API.SendViewData(data);
            }).fail(function (response) {
                var errorMessage = response.responseText ? JSON.parse(response.responseText).Message : response.statusText;
                var errorCode = response.responseText ? JSON.parse(response.responseText).ErrorCode : '';

                LOGGER.debug(NAME, 'Check PIN', 'Success', response);

                mg2PinFail($messageEl, { message: errorMessage, status: errorCode }, $passwordEl);
            });
        }

        function mg2PinSuccess($messageEl, params) {
            $messageEl
                .text(params.message)
                .addClass('Mg2-pin__message_success')
                .show();

            setTimeout(function () {
                $('.Mg2-pin-modal').connextmodal("hide");
                $('.Mg2-pin-infobox').hide();

                CnnXt.CloseTemplates(CnnXt.IntegrateProduct);
            }, 1000);

            CnnXt.Event.fire('onAccessGranted', params);
            fireCloseEvent(CLOSE_TRIGGER.AccessGranted);
        };

        function mg2PinFail($messageEl, params, $passwordEl) {
            if (params.status == wrongPinStatus) {
                CnnXt.Storage.WrongPin();
            }

            $messageEl
                .text(params.message)
                .addClass('Mg2-pin__message_error')
                .show();

            $passwordEl.val('');

            CnnXt.Event.fire('onAccessDenied', params);
        };
    }

    function fireShowEvent() {
        var eventData = getEventData();

        CnnXt.Event.fire("onAccessTemplateShown", eventData);
    }

    function fireCloseEvent(closeTrigger) {
        if (TEMPLATE_CLOSED) {
            return;
        }

        var eventData = getEventData();

        eventData.closeEvent = closeTrigger;

        CnnXt.Event.fire("onAccessTemplateClosed", eventData);

        TEMPLATE_CLOSED = true;
    }

    function getEventData() {
        return {
            WhitelistSets: configuration.WhitelistSets,
            FoundInWhithelistSet: WHITELIST_SET,
            UserIP: USER_IP
        }
    }

    return {
        init: function (options) {
            LOGGER = CnnXt.Logger;
            CnnXt.Storage.UpdateWhitelistSetCookieName();


            CnnXt.Storage.UpdateWhitelistInfoboxCookieName();
            CnnXt.Storage.UpdateNeedHidePinTemplateCookieName();
            LOGGER.debug(NAME, "Initializing Whitelist Module...");
        },
        checkClientIp: checkClientIp
    };
};
var ConnextAppInsights = function ($) {

    var LOGGER = {
        debug: $.noop,
        warn: $.noop,
        exception: $.noop
    };
    var NAME = 'AppInsights';
    var userId = null;
    var init = function (userId, masterId) {
        LOGGER = CnnXt.Logger;

        try {
            LOGGER.debug(NAME, 'Initializing AppInsights Module...');
            var appInsights = window.appInsights || function (config) {
                function i(config) {
                    t[config] = function () {
                        var i = arguments;
                        t.queue = t.queue || [];
                        t.queue.push(function () {
                            t[config].apply(t, i);
                            if (t.context) {
                            }
                        });
                    }
                }
                var t = {
                        config: config
                    },
                    u = document,
                    e = window,
                    o = "script",
                    s = "AuthenticatedUserContext",
                    h = "start",
                    c = "stop",
                    l = "Track",
                    a = l + "Event",
                    v = l + "Page",
                    y = u.createElement(o),
                    r, f;
                y.src = config.url || "https://az416426.vo.msecnd.net/scripts/a/ai.0.js";
                u.getElementsByTagName(o)[0].parentNode.appendChild(y);
                try {
                    t.cookie = u.cookie;
                } catch (p) { }
                for (t.queue = [], t.version = "1.0", r = ["Event", "Exception", "Metric", "PageView", "Trace", "Dependency"]; r.length;) i("track" + r.pop());
                return i("set" + s), i("clear" + s), i(h + a), i(c + a), i(h + v), i(c + v), i("flush"),
                config.disableExceptionTracking ||
                (r = "onerror", i("_" + r), f = e[r], e[r] = function (config, i, u, e, o) {
                    var s = f && f(config, i, u, e, o);
                    return s !== !0 && t["_" + r](config, i, u, e, o), s;
                }), t;
        }({
            instrumentationKey: CnnXt.Common.APPInsightKeys[CnnXt.GetOptions().environment],
            disableExceptionTracking: true,
            appUserId: userId,
            accountId: masterId
        });
        window.appInsights = appInsights;
        if (!appInsights.queue) {
            appInsights.queue = [];
        }
        appInsights.queue.push(function () {
            appInsights.context.addTelemetryInitializer(function (envelope) {
                var telemetryItem = envelope.data.baseData;
                if (envelope.data.baseType === 'RemoteDependencyData') {
                    return telemetryItem.data.indexOf('connext') !== -1
                        || telemetryItem.target.indexOf('auth0') !== -1;
                }
            });
        });
        appInsights.setAuthenticatedUserContext(userId, masterId);

            appInsights.trackPageView();

        }
        catch (e) {
            LOGGER.warn(NAME, 'Error of app insights initialization', e);
        }

    };

    var trackEvent = function (name, data) {
        var fnName = 'trackEvent';

        try {
            var appInsightsData = getEventDataByName(name, data);

            LOGGER.debug(NAME, fnName, 'Event name: ', name, 'App Insights data', appInsightsData);

            appInsights.trackEvent(name, appInsightsData);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex)
        }
    }

    var getAppInsightsData = function (additionalData) {
        var config = CnnXt.Storage.GetLocalConfiguration(),
            conversation = CnnXt.Storage.GetCurrentConversation(),
            metaData = CnnXt.Utils.GetUserMeta(),
            userData = CnnXt.Storage.GetUserData(),
            meter = CnnXt.Storage.GetMeter();

        additionalData = additionalData || {};

        var janrainProfile = CnnXt.Storage.GetJanrainUser();
        var auth0Profile = CnnXt.Storage.GetUserProfile();
        var userProfile = CnnXt.Storage.GetUserData();

        var appInsightsData = {
            cnvid: (conversation) ? conversation.id : null,
            cnvn: (conversation) ? conversation.Name : '',
            mlm: (meter) ? meter.method : '',
            ml: CnnXt.GetOptions().currentMeterLevel,
            artlft: (conversation) ? conversation.Props.ArticleLeft : null,
            artc: CnnXt.Storage.GetCurrentConversationViewCount(),
            cmid: (config && config.Campaign) ? config.Campaign.id : null,
            cmn: (config && config.Campaign) ? config.Campaign.Name : '',
            dmid: (config && config.DynamicMeter) ? config.DynamicMeter.id : null,
            dmn: (config && config.DynamicMeter) ? config.DynamicMeter.Name : '',
            cnfc: (config && config.Settings) ? config.Settings.Code : '',
            cnfn: (config && config.Settings) ? config.Settings.Name : '',
            sc: (config && config.Site) ? config.Site.SiteCode : '',
            at: (config && config.Site) ? CnnXt.Common.RegistrationTypes[config.Site.RegistrationTypeId] : '',
            crid: (userData) ? userData.MasterId : null,
            igmrid: (userData) ? userData.IgmRegID : null,
            us: CnnXt.Storage.GetUserState(),
            em: (auth0Profile) ? auth0Profile.email : (janrainProfile) ? janrainProfile.email : (userProfile) ? userProfile.Email : '',
            ip: CnnXt.Utils.GetIP(),
            zc: CnnXt.Storage.GetActualZipCodes(),
            did: CnnXt.GetOptions().deviceId,
            dt: (metaData) ? metaData.deviceType : '',
            os: (metaData) ? metaData.OS : '',
            brw: (metaData) ? metaData.Browser : '',
            url: (metaData) ? metaData.URL : '',
            attr: CnnXt.GetOptions().attr,
            stk: CnnXt.GetOptions().settingsKey
        }

        return appInsightsData;
    }
    var getEventDataByName = function (name, innerdata) {
        var eventData = innerdata.EventData;
        var config = CnnXt.Storage.GetLocalConfiguration();
        var data = {
            cnfc: (config && config.Settings) ? config.Settings.Code : '',
            sc: (config && config.Site) ? config.Site.SiteCode : '',
            stk: CnnXt.GetOptions().settingsKey
        };
        switch (name) {
            case "onDynamicMeterFound":
                data.dmn = eventData;
                break;
            case "onCampaignFound":
                data.cmn = eventData.Name;
                data.cmid = eventData.id;
                break;
            case "onMeterLevelSet":
                data.mlm = eventData.method;
                data.ml = eventData.level;
                data.rid = eventData.rule ? eventData.rule.id : null;
                data.rn = eventData.rule ? eventData.rule.Name : null;
                break;
            case "onConversationDetermined":
                data.cnvid = eventData.id;
                data.cnvn = eventData.Name;
                data.ml = eventData.MeterLevelId;
                data.vws = eventData.Props.views;
                data.artlft = eventData.Props.ArticleLeft;
                break;
            case "onLoginShown":
                data.lgmdid = (eventData) ? eventData.LoginModalId : null;
                break;
            case "onLoginClosed":
                data.lgmdid = (eventData) ? eventData.LoginModalId: null;
                data.clev = (eventData) ? eventData.closeEvent : null;
                break;
            case "onLoginError":
                data.errmsg = (eventData) ? eventData.ErrorMessage : '';
                break;
            case "onAuthorized":
            case "onHasAccess":
            case "onHasAccessNotEntitled":
            case "onHasNoActiveSubscription":
            case "onLoginSuccess":
                data.crid = eventData.MG2AccountData ? eventData.MG2AccountData.MasterId : null;
                data.igmRegId = eventData.MG2AccountData ? eventData.MG2AccountData.IgmRegID : null;
                data.as = eventData.MG2AccountData ? eventData.MG2AccountData.AuthSystem : null;
                break;
            case "onLoggedIn":
                data.crid = eventData.MG2AccountData ? eventData.MG2AccountData.MasterId : null;
                data.igmRegId = eventData.MG2AccountData ? eventData.MG2AccountData.IgmRegID : null;
                data.as = eventData.MG2AccountData ? eventData.MG2AccountData.AuthSystem : null;
                data.us = CnnXt.Storage.GetUserState();
                break;
            case "onActionShown":
                data.actid = eventData.id
                data.actn = eventData.Name;
                data.actt = eventData.ActionTypeId;
                data.usdfdt = eventData.UserDefinedData;
                data.artc = eventData.ArticlesViewed;
                break;
            case "onActionClosed":
                data.actid = eventData.id
                data.actn = eventData.Name;
                data.actt = eventData.ActionTypeId;
                data.usdfdt = eventData.UserDefinedData;
                data.artc = eventData.ArticlesViewed;
                data.clev = eventData.closeEvent;
                break;
            case "onButtonClick":
                data.udfat = eventData.UserDefinedDataAttr;
                data.actid = innerdata.Action ? innerdata.Action.id : null;
                data.actn = innerdata.Action ? innerdata.Action.Name : null;
                data.actt = innerdata.Action ? innerdata.Action.ActionTypeId : null;
                data.btnhtml = eventData.ButtonHTML || '';
                break;
            case "onFinish":
                data = getAppInsightsData(innerdata);
                break;
        }
        return data;
    }


    return {
        init: init,
        trackEvent: trackEvent,
        getUserId: function () {
            return userId;
        }
    }
}
var ConnextActivation = function ($) {
    var NAME = "Activation",
        LOGGER,
        IsActivationFlowRunning = false,
        $ACTIVATION_MODAL,
        ISUIListenersAdded = false,
        ACTIVATE_SETTINGS = '',
        USER_STATES,
        CLOSE_CASES = {
            CloseButton: "closeButton",
            CloseSpan: "closeSpan",
            ClickOutside: "clickOutside",
            EscButton: "escButton",
            MoveToActivate: "moveToLinkStep",
            MoveToSuccess: "moveToSuccessStep",
            MoveToFail: "moveToErrorStep"
        },
        STEPS = {
            Authenticate: "Authenticate",
            Activate: "Activate",
            Success: "Success",
            Fail: "Fail"
        },
        AUTHSYSTEM,
        CURRENT_STEP,
        UI_SELECTORS = {
            Modal: '[data-connext-dynamic-size]',
            Step: 'data-connext-template-step',
            Steps: {
                Authenticate: '[data-connext-template-step="Authenticate"]',
                Activate: '[data-connext-template-step="Activate"]'
            },
            SubStep: 'data-connext-template-substep',
            SubSteps: {
                Login: '[data-connext-template-substep="Login"]',
                Registration: '[data-connext-template-substep="Registration"]',
                SubscribeLink: '[data-connext-template-substep="SubscribeLink"]',
                UpgradeLink: '[data-connext-template-substep="UpgradeLink"]',
                ActivateForm: '[data-connext-template-substep="ActivateForm"]',
                SuccessActivation: '[data-connext-template-substep="Success"]',
                FailActivation: '[data-connext-template-substep="Fail"]'
            },
            Run: '[data-mg2-action="activation"]',
            Buttons: {
                ConnextRun: '[data-mg2-action="connextRun"]:visible',
                BackStep: '[data-mg2-acton="backStep"]:visible'
            },
            Inputs: {
                common: '[data-connext-input]',
                visible: '[data-connext-input]:visible',
                Email: '[data-connext-input="Email"]:visible',
                AllEmails: '[data-connext-input="Email"]',
                Password: '[data-connext-input="Password"]:visible',
                SearchOptions: '[data-connext-input="SearchOption"]:visible',
                LastName: '[data-connext-input="LastName"]:visible',
                AccountNumber: '[data-connext-input="AccountNumber"]:visible',
                ZipCode: '[data-connext-input="ZipCode"]:visible',
                HouseNumber: '[data-connext-input="HouseNumber"]:visible',
                PhoneNumber: '[data-connext-input="PhoneNumber"]:visible',
                ConfirmationNumber: '[data-connext-input="ConfirmationNumber"]'
            },
            Links: '[redirect="true"]',
            CloseButton: '[data-connext-role="close"]',
            ErrorMessages: {
                LoginSubstep: '[data-connext-template-substep="LoginFormError"]',
                RegistrationSubStep: '[data-connext-template-substep="RegistrationFormError"]',
                Activation: '[data-connext-template-substep="ActivateFormError"]'
            },
            AuthSystems: {
                Janrain: '.janrain-close-modal',
                Auth0: '.auth0-lock-close-button'
            }
        },
        SUCCESS_MESSAGES = {
            Linked: 'Your account has been linked successfully. '
        },
        ERROR_MESSAGES = {
            emailInUse: "There is already an account associated with this email address. Please enter a new email address. ",
            emailAndPassRequired: 'Please enter email and password. ',
            fieldsRequired: 'Please fill out all the required fields. ',
            invalidCredits: "There was an error with your E-Mail/Password combination. Please try again. ",
            generalAjaxError: 'Sorry, there\'s a server problem or a problem with the network. ',
            noSubscriptions: "Subscriptions not found. ",
            requiredEmail: "Email is required. ",
            requiredPassword: "Password is required. ",
            linkingFailed: "I\'m sorry, an error occurred and we can\'t complete this process.  Please contact customer service for assistance. ",
            digitalAccessNeedUpgrade: "I\'m sorry, your subscription does not give you access to this content. Please <a data-connext-link='Upgrade' redirect='true'>upgrade</a> to get access. ",
            digitalAccessNeedPurchase: "I\'m sorry, your subscription does not give you access to this content. Please <a data-connext-link='Subscribe' redirect='true'>subscribe</a> to get access. "
        },
        SEARCHOPTIONS = {
            ActivateByAccountNumber: "ActivateByAccountNumber",
            ActivateByZipCodeAndHouseNumber: "ActivateByZipCodeAndHouseNumber",
            ActivateByZipCodeAndPhoneNumber: "ActivateByZipCodeAndPhoneNumber",
            ActivateBySubscriptionId: "ActivateBySubscriptionId",
            ActivateByConfirmationNumber: "ActivateByConfirmationNumber"
        },
        STEPS_WIDTH = {
            Authenticate: 420,
            Activate: 672
        };
    var run = function (options) {
        var fnName = 'run';

        LOGGER.debug(NAME, fnName, 'Run activation flow');

        if (IsActivationFlowRunning && !(options && options.runAfterSuccessfulLogin)) {
            LOGGER.debug(NAME, fnName, 'Activation flow has already run... Breake!');
            return;
        }

        calculateCurrentStep();

        if (checkAvailabilityToAutoLinking()) {
            syncUser().always(doAutoLinking);
        } else {
            if (CURRENT_STEP == null) {
                return false;
            }

            IsActivationFlowRunning = true;

            hideInactiveSteps();

            if (CURRENT_STEP == STEPS.Activate) {
                syncUser();
            }

            showLinksByUserStatus();

            if (CURRENT_STEP == STEPS.Authenticate) {
                LoginFunctions[AUTHSYSTEM]();
            } else {
                showActivationTemplate();
            }
        }
    }

    var showJanrainLogin = function () {
        if (window.janrain) {
            janrain.capture.ui.modal.open();
        } else {
            LOGGER.warn("No janrain global object found!");
        }
    }

    var showAuth0Login = function () {
        CnnXt.User.showAuth0Login();
    }

    var calculateCurrentStep = function () {
        var fnName = 'calculateCurrentStep';

        var userState = Connext.Storage.GetUserState();

        if (userState == null) {
            userState = USER_STATES.NotLoggedIn;
        }

        if (userState == USER_STATES.NotLoggedIn) {
            CURRENT_STEP = STEPS.Authenticate;
            $ACTIVATION_MODAL.attr('data-width', STEPS_WIDTH.Authenticate);
            $ACTIVATION_MODAL.css('width', STEPS_WIDTH.Authenticate).css("margin-left", "-" + STEPS_WIDTH.Authenticate / 2 + "px");
        } else if (userState == USER_STATES.Subscribed) {
            CURRENT_STEP = null;
            IsActivationFlowRunning = false;
        } else {
            CURRENT_STEP = STEPS.Activate;
            $ACTIVATION_MODAL.attr('data-width', STEPS_WIDTH.Activate);
            $ACTIVATION_MODAL.css('width', STEPS_WIDTH.Activate).css("margin-left", "-" + STEPS_WIDTH.Activate / 2 + "px");
        }

        LOGGER.debug(NAME, fnName, 'current step', CURRENT_STEP);
    }

    var hideInactiveSteps = function () {
        var fnName = 'hideInactiveSteps';

        LOGGER.debug(NAME, fnName);

        var $steps = $ACTIVATION_MODAL.find('[' + UI_SELECTORS.Step + ']');

        $steps.each(function (index, step) {
            var $step = $(step);

            if ($step.attr(UI_SELECTORS.Step) == CURRENT_STEP) {
                $step.show();
            } else {
                $step.hide();
            }
        });
    }

    var checkCurrentStep = function (afterAuth) {
        calculateCurrentStep();

        if (CURRENT_STEP == null && !afterAuth) {
            hideTemplate();
        } else if (CURRENT_STEP == null && afterAuth) {
            CnnXt.Run()
            CnnXt.Event.fire('onActivationLoginStepClosed', { ActivationSettings: ACTIVATE_SETTINGS, closeEvent: CLOSE_CASES.MoveToActivate });
        }

        hideInactiveSteps();

        if (afterAuth && CURRENT_STEP == STEPS.Activate) {
            CnnXt.Event.fire('onActivationLoginStepClosed', { ActivationSettings: ACTIVATE_SETTINGS, closeEvent: CLOSE_CASES.MoveToActivate });

            if (checkAvailabilityToAutoLinking()) {
                hideTemplate();
                syncUser().always(doAutoLinking);
            } else {
                CnnXt.Event.fire('onActivationLinkStepShown', { ActivationSettings: ACTIVATE_SETTINGS });
                syncUser();
            }
        }
    }

    var showLinksByUserStatus = function () {
        var fnName = 'showLinksByUserStatus';

        var $subscribeLink = $ACTIVATION_MODAL.find(UI_SELECTORS.SubSteps.SubscribeLink),
            $upgradeLink = $ACTIVATION_MODAL.find(UI_SELECTORS.SubSteps.UpgradeLink),
            userState = Connext.Storage.GetUserState();

        if (userState == USER_STATES.SubscribedNotEntitled) {
            LOGGER.debug(NAME, fnName, 'Open upgrade link', userState);
            $subscribeLink.hide();
            $upgradeLink.show();
        } else {
            LOGGER.debug(NAME, fnName, 'Open subscribe link', userState);
            $upgradeLink.hide();
            $subscribeLink.show();
        }
    }

    var showActivationTemplate = function () {
        var fnName = 'showActivationTemplate';

        var options = CnnXt.GetOptions(),
            modalOptions;

        LOGGER.debug(NAME, fnName, options)

        if (!options.silentmode && ACTIVATE_SETTINGS.IsActivationOnly) {
            $ACTIVATION_MODAL.find('.connext-actflow-close-wrapper, [data-connext-role="close"]').remove();
            modalOptions = { backdrop: "static", keyboard: false };
        } else {
            modalOptions = { backdrop: "true" };
        }

        $ACTIVATION_MODAL.attr('data-width', STEPS_WIDTH[CURRENT_STEP]).css("margin-left", "-" + STEPS_WIDTH[CURRENT_STEP] / 2 + "px");
        $ACTIVATION_MODAL.addClass("in").show();
        $ACTIVATION_MODAL.connextmodal(modalOptions);
        $ACTIVATION_MODAL.resize();

        CnnXt.Event.fire('onActivationFormShown', { ActivationSettings: ACTIVATE_SETTINGS });

        $ACTIVATION_MODAL.find(UI_SELECTORS.SubSteps.SuccessActivation).hide();
        $ACTIVATION_MODAL.find(UI_SELECTORS.SubSteps.FailActivation).hide();

        if (CURRENT_STEP == STEPS.Authenticate) {
            CnnXt.Event.fire('onActivationLoginStepShown', { ActivationSettings: ACTIVATE_SETTINGS });
        } else if (CURRENT_STEP == STEPS.Activate) {
            $ACTIVATION_MODAL.find(UI_SELECTORS.SubSteps.ActivateForm).show();
            CnnXt.Event.fire('onActivationLinkStepShown', { ActivationSettings: ACTIVATE_SETTINGS });
        }

        processActivationUrlParams();

        $ACTIVATION_MODAL.closeEvent = null;

        $ACTIVATION_MODAL
            .find('[data-connext-role="close"]')
            .on('click', function (e) {
                var $btn = $(this),
                    href = $btn.attr('href');

                if (href && href !== "#") {
                    if ($btn[0].hasAttribute("target")) {
                        window.open(href, "_blank");
                    } else {
                        window.location.href = href;
                    }
                }

                $ACTIVATION_MODAL.closeEvent = CLOSE_CASES.CloseButton;
            });

        $ACTIVATION_MODAL
            .on('keyup', function (e) {
                if ((e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27)) {
                    $ACTIVATION_MODAL.closeEvent = CLOSE_CASES.EscButton;
                    IsActivationFlowRunning = false;
                }
            })
            .one("hidden", function (e) {
                IsActivationFlowRunning = false;

                if (!$ACTIVATION_MODAL.closeEvent) {
                    $ACTIVATION_MODAL.closeEvent = CLOSE_CASES.ClickOutside;
                }

                var eventData = {
                    ActivationSettings: ACTIVATE_SETTINGS,
                    closeEvent: $ACTIVATION_MODAL.closeEvent
                }

                if (CURRENT_STEP == STEPS.Authenticate) {
                    CnnXt.Event.fire('onActivationLoginStepClosed', eventData);
                }

                if (CURRENT_STEP == STEPS.Activate) {
                    CnnXt.Event.fire('onActivationLinkStepClosed', eventData);
                }

                if (CURRENT_STEP == STEPS.Success) {
                    eventData.ActivateStatus = 'success';
                    CnnXt.Event.fire('onActivationLinkSuccessStepClosed', eventData);
                    runAfterLinking();
                }

                if (CURRENT_STEP == STEPS.Fail) {
                    eventData.ActivateStatus = 'error';
                    CnnXt.Event.fire('onActivationLinkErrorStepClosed', eventData);
                }

                CnnXt.Event.fire('onActivationFormClosed', eventData);
            });
    }

    var processActivationUrlParams = function () {
        var fnName = 'processActivationUrlParams';

        var activationUrlParams = CnnXt.Utils.GetActivationUrlParams();

        LOGGER.debug(NAME, fnName, activationUrlParams);

        if (CURRENT_STEP == STEPS.Authenticate) {
            if (activationUrlParams.email) {
                $ACTIVATION_MODAL.find(UI_SELECTORS.Inputs.AllEmails).val(activationUrlParams.email);
            }
        }
        if (activationUrlParams.confirmationNumber) {
            $ACTIVATION_MODAL.find(UI_SELECTORS.Inputs.ConfirmationNumber).val(activationUrlParams.confirmationNumber);
        }

        var $links = $ACTIVATION_MODAL.find(UI_SELECTORS.Links);

        $links.each(function (index, link) {
            var $link = $(link),
                href = $link.attr("href");

            href = CnnXt.Utils.AddReturnUrlParamToLink(href);

            if ($link.attr('data-connext-link') == "Upgrade") {
                var productCode = CnnXt.Utils.GetProductCode();

                if (!productCode) {
                    CnnXt.API.GetProductCode().then(function (responce) {
                        href = CnnXt.Utils.AddParameterToURL(href, 'product', responce);
                        $link.attr("href", href);
                    }, function (error) {
                        $link.attr("href", href);
                    });
                } else {
                    href = CnnXt.Utils.AddParameterToURL(href, 'product', productCode);
                    $link.attr("href", href);
                }
            } else {
                $link.attr("href", href);
            }
        });
    }

    var hideTemplate = function () {
        $ACTIVATION_MODAL.connextmodal('toggle');
    }

    var login = function (formData) {
        var fnName = 'login';

        var payload = {
            Email: formData.Email,
            Password: formData.Password
        }

        showHideErrorMessage(UI_SELECTORS.ErrorMessages.LoginSubstep, false);

        return CnnXt.API.GetUserByEmailAndPassword({
            payload: payload,
            onSuccess: function (data) {
                successLogin(data, 'onSuccess', payload);
            },
            onError: function (error) {
                showHideErrorMessage(UI_SELECTORS.ErrorMessages.LoginSubstep, ERROR_MESSAGES.invalidCredits);
            }
        });
    }

    var register = function (formData) {
        var fnName = 'register';

        var payload = {
            Email: formData.Email,
            Password: formData.Password,
            DisplayName: formData.DisplayName
        }

        return CnnXt.API.CreateUser({
            payload: payload,
            onSuccess: function (data) {
                login(formData);
            },
            onError: function (error) {
                var errorMessage = CnnXt.Utils.GetErrorMessageFromAPIResponse(error, ERROR_MESSAGES.generalAjaxError);
                showHideErrorMessage(UI_SELECTORS.ErrorMessages.RegistrationSubStep, errorMessage);
            }
        });
    }

    var successLogin = function (data, payload) {
        var fnName = 'successLogin';

        try {
            data.Email = payload.email;
            data.AuthSystem = 'MG2';
            CnnXt.User.processSuccessfulLogin("Form", data);
            checkingResize();
            checkCurrentStep(true);
            showLinksByUserStatus();
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var syncUser = function () {
        var fnName = 'syncUser';

        try {
            var config = CnnXt.Storage.GetLocalConfiguration();

            if (config && config.Site.RegistrationTypeId !== CnnXt.Common.AuthSystem.MG2) {
                var payload = {
                    CustomRegId: CnnXt.Utils.GetUserAuthData().CustomRegId
                }

                return CnnXt.API.SyncUser({
                    payload: payload,
                });
            } else {
                return $.Deferred().resolve();
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            return $.Deferred().reject();
        }
    }

    var activate = function (formData) {
        var fnName = 'activate';

        var payload = formData;

        LOGGER.debug(NAME, fnName, payload.SearchOption, payload);

        return linkAccount(payload);
    }

    var checkAvailabilityToAutoLinking = function () {
        var fnName = 'checkAvailabilityToAutoLinking';

        try {
            var activationUrlParams = CnnXt.Utils.GetActivationUrlParams();

            if (CURRENT_STEP != STEPS.Activate) {
                return false;
            }

            if (activationUrlParams.accountNumber && activationUrlParams.lastName) {
                return true;
            }

            if (activationUrlParams.confirmationNumber && activationUrlParams.lastName) {
                return true;
            }

            return false;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var doAutoLinking = function () {
        var fnName = 'doAutoLinking';

        try {
            var activationUrlParams = CnnXt.Utils.GetActivationUrlParams();

            if (activationUrlParams.accountNumber && activationUrlParams.lastName) {
                LOGGER.debug(NAME, fnName, 'We have account number and last name in the url params. So we do auto linking', activationUrlParams);
                autoLinkingByAccountNumber(activationUrlParams.accountNumber, activationUrlParams.lastName);
            } else if (activationUrlParams.confirmationNumber && activationUrlParams.lastName) {
                LOGGER.debug(NAME, fnName, 'We have confirmation number and last name in the url params. So we do auto linking', activationUrlParams);
                autoLinkingByConfirmationNumber(activationUrlParams.confirmationNumber, activationUrlParams.lastName);
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var autoLinkingByConfirmationNumber = function (confirmationNumber, lastName) {
        var fnName = "autoLinkingByConfirmationNumber";

        LOGGER.debug(NAME, fnName, confirmationNumber, lastName);

        var payload = {
            ConfirmationNumber: confirmationNumber,
            LastName: lastName,
            SearchOption: SEARCHOPTIONS.ActivateByConfirmationNumber,
            autoLink: true
        }

        linkAccount(payload);
    }

    var autoLinkingByAccountNumber = function (accountNumber, lastName) {
        var fnName = "autoLinkingByAccountNumber";

        LOGGER.debug(NAME, fnName, accountNumber, lastName);

        var payload = {
            AccountNumber: accountNumber,
            LastName: lastName,
            SearchOption: SEARCHOPTIONS.ActivateByAccountNumber,
            autoLink: true
        }

        linkAccount(payload);
    }

    var linkAccount = function (payload) {
        var fnName = 'linkAccount';

        try {
            var apiName = payload.SearchOption,
                authData = CnnXt.Utils.GetUserAuthData();

            payload.CustomRegId = authData.CustomRegId;
            payload.Mode = authData.Mode;

            CnnXt.Event.fire('onActivationLinkStepSubmitted', {
                ActivationSettings: ACTIVATE_SETTINGS,
                Payload: payload,
                ActivateBy: payload.SearchOption
            });

            LOGGER.debug(NAME, fnName, payload.SearchOption, payload);

            return CnnXt.API[apiName]({
                payload: payload,
                onSuccess: function (response) {
                    checkAccessAfterLinking(response, payload);
                },
                onError: function (error) {
                    errorLinking(error, payload.SearchOption, payload.autoLink);
                }
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var checkAccessAfterLinking = function (response, payload) {
        var fnName = 'checkAccessAfterLinking';

        LOGGER.debug(NAME, fnName, response);

        if (__.isString(response)) {
            try {
                response = JSON.parse(response);
            } catch (ex) {
                errorLinking(response, payload.SearchOption, payload.autoLink);
            }
        }

        if (response.errorCode || !response.Success) {
            errorLinking(response, payload.SearchOption, payload.autoLink);
        } else {
            checkDigitalAccess().then(function () {
                successLinking(response, payload.SearchOption, payload.autoLink);
            }, function (digitalAccessResult) {
                errorLinking(response, payload.SearchOption, payload.autoLink, digitalAccessResult);
            });
        }
    }

    var checkDigitalAccess = function () {
        var fnName = 'checkDigitalAccess';

        var defer = $.Deferred(),
            authData = CnnXt.Utils.GetUserAuthData();

        var payload = {
            masterId: authData.MasterId,
            mode: authData.Mode
        }

        LOGGER.debug(NAME, fnName, 'payload', payload);

        CnnXt.API.CheckDigitalAccess({
            payload: payload,
            onSuccess: function (response) {
                if (response) {
                    if (__.isString(response)) {
                        try {
                            var result = JSON.parse(response);

                            if (result && __.isArray(result.Errors)) {
                                if (__.findWhere(result.Errors, { Code: 400 })) {
                                    defer.reject();
                                }
                            }
                        } catch (ex) {
                            LOGGER.debug(NAME, fnName, 'Parse error', response);
                            defer.reject();
                        }
                    }
                    if (__.isString(response.AccessLevel)) {
                        if (response.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Premium) {
                            defer.resolve();
                        }

                        if (response.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Upgrade) {
                            defer.reject({ needUpgrade: true });
                        }

                        if (response.AccessLevel.toUpperCase() === CnnXt.Common.DigitalAccessLevels.Purchase) {
                            defer.reject({ needPurchase: true });
                        }
                    }
                    if (__.isObject(response.AccessLevel)) {
                        if (response.AccessLevel.IsPremium) {
                            defer.resolve();
                        }

                        if (response.AccessLevel.IsUpgrade) {
                            defer.reject({ needUpgrade: true });
                        }

                        if (response.AccessLevel.IsPurchase) {
                            defer.reject({ needPurchase: true });
                        }
                    }
                }
                defer.reject();
            },
            onNull: function () {
                defer.reject();
            },
            onError: function (error) {
                defer.reject();
            }
        });

        return defer.promise();
    }

    var successLinking = function (response, searchOption, autoLink) {
        IsActivationFlowRunning = false;
        CURRENT_STEP = STEPS.Success;
        if (autoLink) {
            showActivationTemplate();
        }
        $('.connext-actflow-close-wrapper .closebtn').attr('data-mg2-action', 'connextRun');

        $(UI_SELECTORS.SubSteps.ActivateForm).hide();
        $(UI_SELECTORS.Steps.Activate).show();
        $(UI_SELECTORS.Steps.Authenticate).hide();
        $(UI_SELECTORS.SubSteps.SuccessActivation).show();

        CnnXt.Event.fire('onActivationLinkStepClosed', {
            ActivationSettings: ACTIVATE_SETTINGS,
            closeEvent: CLOSE_CASES.MoveToSuccess
        });

        CnnXt.Event.fire('onActivationLinkSuccessStepShown', {
            ActivationSettings: ACTIVATE_SETTINGS,
            Response: response,
            ActivateBy: searchOption
        });

        if (AUTHSYSTEM != 'MG2') {
            CnnXt.Storage.SetUserData(null);
        }
        CnnXt.Storage.SetUserState(null);
    }

    var errorLinking = function (response, searchOption, autoLink, digitalAccess) {
        CURRENT_STEP = STEPS.Fail;

        if (autoLink) {
            showActivationTemplate();
        }

        $(UI_SELECTORS.SubSteps.ActivateForm).hide();
        $(UI_SELECTORS.Steps.Activate).show();
        $(UI_SELECTORS.Steps.Authenticate).hide();
        $(UI_SELECTORS.SubSteps.FailActivation).show();

        var message = '';

        if (digitalAccess && digitalAccess.needUpgrade) {
            message = ERROR_MESSAGES.digitalAccessNeedUpgrade;
        } else if (digitalAccess && digitalAccess.needPurchase) {
            message = ERROR_MESSAGES.digitalAccessNeedPurchase;
        } else {
            message = ERROR_MESSAGES.linkingFailed;
        }
        //that error message may include links, so we cannot use text. we have all kind of messages in const string variables
        $(UI_SELECTORS.SubSteps.FailActivation).find('[data-connext-role="linkingErrorMessage"] span').html(message);

        if (digitalAccess && digitalAccess.needUpgrade) {
            var upgradeLink = $(UI_SELECTORS.SubSteps.UpgradeLink).find('[data-connext-link="Upgrade"]').attr('href');
            var $accessUpgradeLink = $(UI_SELECTORS.SubSteps.FailActivation).find('[data-connext-link="Upgrade"]');

            $accessUpgradeLink.attr('href', upgradeLink);
        }

        if (digitalAccess && digitalAccess.needPurchase) {
            var subscribeLink = $(UI_SELECTORS.SubSteps.SubscribeLink).find('[data-connext-link="Subscribe"]').attr('href');
            var $accessSubscribeLink = $(UI_SELECTORS.SubSteps.FailActivation).find('[data-connext-link="Subscribe"]');

            $accessSubscribeLink.attr('href', subscribeLink);
        }

        CURRENT_STEP = STEPS.Fail;

        CnnXt.Event.fire('onActivationLinkStepClosed', {
            ActivationSettings: ACTIVATE_SETTINGS,
            closeEvent: CLOSE_CASES.MoveToFail
        });

        CnnXt.Event.fire('onActivationLinkErrorStepShown', {
            ActivationSettings: ACTIVATE_SETTINGS,
            Response: response,
            ActivateBy: searchOption
        });
    }

    var showHideErrorMessage = function (selector, errorMessage) {
        var $errorMessageContainer = $(selector);

        if (($errorMessageContainer).length == 0) {
            return false;
        }

        if (errorMessage) {
            //that error message may include links, so we cannot use text. we have all kind of messages in const string variables
            $errorMessageContainer.html(errorMessage);
            $errorMessageContainer.show();
        } else {
            $errorMessageContainer.hide();
        }
    }

    var runAfterLinking = function () {
        if (AUTHSYSTEM != 'MG2') {
            CnnXt.Storage.SetUserData(null);
        }
        CnnXt.Storage.SetUserState(null);
        CnnXt.Run();
    }

    var LoginFunctions = {
        MG2: showActivationTemplate,
        Auth0: showAuth0Login,
        Janrain: showJanrainLogin
    }


    function runActivationFlow(e) {
        e.preventDefault();
        run();
    }

    var AddUiListeners = function () {
        if (ISUIListenersAdded)
            return;
        ISUIListenersAdded = true;
        $("body")
            .off("click", UI_SELECTORS.Buttons.BackStep, backToActivateStep)
            .on("click", UI_SELECTORS.Buttons.BackStep, backToActivateStep);
        $("body")
            .off("click", UI_SELECTORS.AuthSystems.Auth0, closedExternalAuthSystem)
            .on("click", UI_SELECTORS.AuthSystems.Auth0, closedExternalAuthSystem);

        $("body")
            .off("click", UI_SELECTORS.AuthSystems.Janrain, closedExternalAuthSystem)
            .on("click", UI_SELECTORS.AuthSystems.Janrain, closedExternalAuthSystem);
        $("body")
            .off("click", UI_SELECTORS.Buttons.ConnextRun, okGreate)
            .on("click", UI_SELECTORS.Buttons.ConnextRun, okGreate);

        $("body")
            .off("click", UI_SELECTORS.Run, runActivationFlow)
            .on("click", UI_SELECTORS.Run, runActivationFlow);
    }



    function backToActivateStep(e) {
        e.preventDefault();
        $(UI_SELECTORS.SubSteps.FailActivation).hide();
        $(UI_SELECTORS.SubSteps.ActivateForm).show();

        CURRENT_STEP = STEPS.Activate;

        CnnXt.Event.fire('onActivationLinkErrorStepClosed', {
            ActivationSettings: ACTIVATE_SETTINGS,
            closeEvent: CLOSE_CASES.MoveToActivate
        });

        CnnXt.Event.fire('onActivationLinkStepShown', { ActivationSettings: ACTIVATE_SETTINGS });
    }



    function closedExternalAuthSystem(e) {
        IsActivationFlowRunning = false;
    }



    function okGreate() {
        $ACTIVATION_MODAL.closeEvent = CLOSE_CASES.CloseButton;
    }

    function checkingResize() {
        window.addEventListener('resize', function () {
            if (IsActivationFlowRunning) {
                setTimeout(function () {
                    calculateCurrentStep();
                }, 25);
            }
        });
    }


    return {
        init: function (settings) {
            var fnName = 'initialization';
            try {
                LOGGER = CnnXt.Logger;
                ACTIVATE_SETTINGS = settings;
                AddUiListeners();
                USER_STATES = CnnXt.Common.USER_STATES;
                if (ACTIVATE_SETTINGS.ActivationFormHtml && ACTIVATE_SETTINGS.ActivationFormHtml) {
                    ACTIVATE_SETTINGS.ActivationFormHtml = ACTIVATE_SETTINGS.ActivationFormHtml.trim();
                }
                $ACTIVATION_MODAL = $(ACTIVATE_SETTINGS.ActivationFormHtml);

                AUTHSYSTEM =
                    CnnXt.Common.RegistrationTypes[CnnXt.Storage.GetLocalConfiguration().Site.RegistrationTypeId];


                LOGGER.debug(NAME, "Initializing Activation Module...");
                calculateCurrentStep();
            } catch (e) {
                LOGGER.warn(NAME, fnName, 'ERROR OF INITIALIZATION ACTIVATION FLOW', e);
            }
        },
        Run: function (options) {
            if (ACTIVATE_SETTINGS.IsActivationOnly) {
                CnnXt.User.CheckAccess().always(function () {
                    run(options);
                });
            } else {
                run(options);
            }
        },
        Login: login,
        Register: register,
        Activate: activate,
        IsActivationFlowRunning: function () { return IsActivationFlowRunning; }
    };
};
var CnnXt = function ($) {
    var VERSION = '1.14.2';
    var CONFIGURATION = null;
    var NAME = "Core";
    var LOGGER;
    var PROCESSTIME = {};
    var isProcessed = false;
    var OPTIONS;
    var DEFAULT_OPTIONS = {
        debug: false,
        silentmode: false,
        integrateFlittz: false,
        environment: 'prod',
        settingsKey: null,
        configSettings: {
            EnforceUniqueArticles: false
        },
        authSettings: null,
        loadType: "ajax",
        BatchCount: 5,
        ViewsUpdateFromServerPeriod: 24,
        ConversationPromiseTimeout: 5000,
        DynamicMeterPromiseTimeout: 5000
    };
    var IS_CONNEXT_INITIALIZED = false;
    var S3_DATA;
    var RUN_TIMEOUT;
    var FIRST_RUN_EXECUTED = false;
    var defaultRunOffsetTime = 5000;
    var IS_INIT_FINISHED = false;

    var init = function () {
        try {
            var fnName = "init";

            LOGGER = CnnXt.Logger;
            if (!window.jQuery) {
                throw CnnXt.Common.ERROR.NO_JQUERY;
            }

            CnnXt.Logger.setDebug(OPTIONS.debug);

            LOGGER.debug(NAME, "Initializing ConneXt...");
            OPTIONS.configCode = OPTIONS.configCode.toUpperCase();
            if (IS_CONNEXT_INITIALIZED) {
                CnnXt.Run();
            } else {
                PROCESSTIME.PluginStartTime = new Date();
                initAdBlockElement();
                getZipCode(checkRequirements);
                IS_CONNEXT_INITIALIZED = true;
            }
        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
        }
    };

    function initAdBlockElement() {
        var fnName = 'initAdBlockElement';
        LOGGER.debug(NAME, fnName, "Adding html element for check Ad blocker");

        var testAd = document.createElement("div");
        testAd.innerHTML = "&nbsp;";
        testAd.className = "adsbox";
        testAd.id = "TestAdBlock";
        testAd.style.position = "absolute";
        testAd.style.bottom = "0px";
        testAd.style.zIndex = "-1";
        document.body.appendChild(testAd);

        var testImg = document.createElement("IMG");
        var id = "06db9294";
        testImg.id = id;
        testImg.style.width = "100px";
        testImg.style.height = "100px";
        testImg.style.top = "-1000px";
        testImg.style.left = "-1000px";
        testImg.style.position = "absolute";
        document.body.appendChild(testImg);
        var src = "//asset.pagefair.com/adimages/textlink-ads.jpg";
        testImg.src = src;

        var testScript = document.createElement("SCRIPT");
        var d = "295f89b1";
        testScript.id = d;
        testScript.type = "text/javascript";
        document.getElementsByTagName("head")[0].appendChild(testScript);
        var scriptSrc = "//d1wa9546y9kg0n.cloudfront.net/index.js";
        testScript.src = scriptSrc;
        testScript.onload = function () {
            testScript.className = 'adstestloaded';
        };
    }

    var closeAllTemplates = function (callback) {
        var fnName = "closeAllTemplates";

        LOGGER.debug(NAME, fnName, "Close all ConneXt Templates");

        if ($('.Mg2-connext.paywall.flittz:visible').length > 0 && OPTIONS.integrateFlittz) {
            var e = {};
            e.actionDom = $('.Mg2-connext.paywall.flittz:visible')[0];
            CnnXt.Event.fire("onFlittzPaywallClosed", e);
        }

        $(".Mg2-connext[data-display-type=inline]").remove();
        $(".Mg2-connext[data-display-type=info-box]").remove();
        $(".Mg2-connext[data-display-type=banner]").remove();

        var modals = $(".Mg2-connext.modal:visible"),
            listeners = modals.length;

        if (modals.length > 0) {

            modals.each(function (index, element) {
                $(element).on("hidden.bs.modal", function () {
                    $(this).off("hidden.bs.modal");

                    listeners--;

                    if (__.isFunction(callback) && listeners === 0) {
                        callback();
                    }
                });

                $(element).connextmodal("hide");
            });

        } else {
            if (__.isFunction(callback)) {
                callback();
            }
        }

        LOGGER.debug(NAME, fnName, "All ConneXt Templates have been closed.");
    };

    var IntegrateProduct = function () {
        var fnName = "IntegrateProduct";

        LOGGER.debug(NAME, fnName, "Show the article content");

        $(".blurry-text").removeClass("blurry-text");
        $(".trimmed-text").removeClass("trimmed-text");
        CnnXt.Action.IntegrateProduct();
    };

    var proccessSuccessfulZipCodeRequest = function (data, callback) {
        if (data.ipAddress) {
            CnnXt.Utils.SetIP(data.ipAddress);
        }

        if (data.zipCode) {
            CnnXt.Storage.SetCalculatedZipCode(data.zipCode);
        } else {
            CnnXt.Storage.SetCalculatedZipCode("00000");
        }

        if (__.isFunction(callback)) {
            callback();
        }
    }

    var getZipCode = function (callback) {
        var fnName = "getZipCode";

        LOGGER.debug(NAME, fnName, 'Getting a zip code');

        try {
            var storedZipCode = $.jStorage.get(CnnXt.Common.StorageKeys.customZip);

            if (storedZipCode) {
                LOGGER.debug(NAME, fnName, 'We have zip code in the local storage', storedZipCode);

                if (__.isFunction(callback)) {
                    callback();
                }
            } else {
                LOGGER.debug(NAME, fnName, 'Calculate a zip code by IP');

                $.ajax({
                    url: CnnXt.Common.IPInfo,
                    type: "GET",
                    success: function (data) {
                        proccessSuccessfulZipCodeRequest(data, callback);
                    },
                    error: function () {
                        LOGGER.debug(NAME, fnName, "Geolocation call failed. We set zipcode by default as 00000");

                        CnnXt.Storage.SetCalculatedZipCode("00000");

                        if (__.isFunction(callback)) {
                            callback();
                        }
                    }
                });
            }
        } catch (ex) {
            LOGGER.exception(NAME, fnName, 'We set zipcode by default as 00000', ex);

            CnnXt.Storage.SetCalculatedZipCode("00000");

            if (__.isFunction(callback)) {
                callback();
            }
        }
    };

    var checkRequirements = function () {
        var fnName = "checkRequirements";

        LOGGER.debug(NAME, fnName, 'Checking requirements...', OPTIONS);

        try {
            OPTIONS = $.extend(true, DEFAULT_OPTIONS, OPTIONS);

            if (!OPTIONS.siteCode) {
                throw CnnXt.Common.ERROR.NO_SITE_CODE;
            }

            if (!OPTIONS.configCode) {
                throw CnnXt.Common.ERROR.NO_CONFIG_CODE;
            }
            if (OPTIONS.integrateFlittz) {
                OPTIONS.silentmode = true;
            }
            if (OPTIONS.runSettings) {
                LOGGER.debug(NAME, fnName, 'Run settings have been found', OPTIONS.runSettings);

                OPTIONS.silentmode = true;

                LOGGER.debug(NAME, fnName, 'If we have run settings - we set up silent mode in true', OPTIONS);

                if (OPTIONS.runSettings.runPromise && __.isFunction(OPTIONS.runSettings.runPromise.then)) {
                    OPTIONS.runSettings.hasValidPromise = true;

                    if (!__.isFunction(OPTIONS.runSettings.onRunPromiseResolved)) {
                        OPTIONS.runSettings.onRunPromiseResolved = $.noop;
                    }

                    if (!__.isFunction(OPTIONS.runSettings.onRunPromiseRejected)) {
                        OPTIONS.runSettings.onRunPromiseRejected = $.noop;
                    }
                } else {
                    OPTIONS.runSettings.hasValidPromise = false;

                    LOGGER.debug(NAME, fnName, 'No or invalid promise object in the \'runSettings\'');
                }

                if (!__.isNumber(OPTIONS.runSettings.runOffset)) {
                    LOGGER.debug(NAME, fnName, 'We have not run offset, so we set the \'runSettings.runOffset\' by default', defaultRunOffsetTime);
                    OPTIONS.runSettings.runOffset = defaultRunOffsetTime;
                }
            }

            CnnXt.Utils.init();

            var deviceType = CnnXt.Utils.GetUserMeta().deviceType;

            LOGGER.debug(NAME, fnName, 'Device type is', deviceType);

            if (deviceType == 'Mobile') {
                $('body').addClass('mobile');
            } else if (deviceType == 'Tablet') {
                $('body').addClass('tablet');
            }

            if (CnnXt.Utils.GetUserMeta().OS == 'IOS') {
                $('body').addClass('ios-fix-body-styles');
            }

            if (OPTIONS.loadType == "ajax") {
                $("body").find(".mg2-Connext").remove();
                $("body").find(".debug_details").remove();
            }
            if (OPTIONS.debug) {
                LOGGER.debug(NAME, fnName, 'We are working in the debug mode');

                CnnXt.Utils.CreateDebugDetailPanel();

                LOGGER.debug(NAME, fnName, 'Override the options on custom');

                var siteCode = CnnXt.Storage.GetSiteCode();
                var configCode = CnnXt.Storage.GetConfigCode();
                var isCustomConfiguration = CnnXt.Storage.GetIsCustomConfiguration();
                $("#ConnextSiteCode").val(siteCode);
                $("#ConnextConfigCode").val(configCode);
                $("#ConnextCustomConfiguration").prop("checked", isCustomConfiguration);

                if (isCustomConfiguration) {
                    OPTIONS.siteCode = siteCode;
                    OPTIONS.configCode = configCode;
                }
            }

            setDefaults();

            if (OPTIONS.runSettings) {
                setupRunSettings();
            }

        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, 'The settings exception', ex);
            }
        }
    };

    var reInit = function () {
        var fnName = 'reInit';

        LOGGER.debug(NAME, fnName, 'First init: ', !isProcessed);

        CnnXt.CloseTemplates(function () {
            CnnXt.IntegrateProduct();

            if (isProcessed) {
                var configuration = CnnXt.Storage.GetLocalConfiguration();
                if (!configuration.Settings.Site) {
                    configuration.Settings.Site = configuration.Site;
                }
                processConfiguration(configuration);
            } else {
                setDefaults();
            }
        });
    };

    var setDefaults = function () {
        var fnName = "setDefaults";

        LOGGER.debug(NAME, fnName, 'Setup environment and main modules');

        try {
            if (OPTIONS.environment == null) {
                var hostname = location.hostname;

                for (var i = 0; i < CnnXt.Common.Environments.length; i++) {
                    if (hostname.indexOf(CnnXt.Common.Environments[i]) >= 0) {
                        OPTIONS.environment = CnnXt.Common.Environments[i];
                        break;
                    }
                }
            }

            if (OPTIONS.environment == null) {
                OPTIONS.environment = "prod";
            }
            OPTIONS.api = CnnXt.Common.APIUrl[OPTIONS.environment];

            LOGGER.debug(NAME, fnName, 'OPTIONS.API', OPTIONS.api);

            CnnXt.API.init(OPTIONS);
            CnnXt.Storage.init();
            CnnXt.Event.init(OPTIONS);
            CnnXt.Event.fire("onInit", null);

            Fprinting().init()
                .done(function (id) {
                    LOGGER.debug(NAME, fnName, 'Fprinting is done', id);
                    OPTIONS.deviceId = id;
                })
                .always(function () {
                    try {
                        var masterId = CnnXt.Storage.GetUserData()
                            ? (CnnXt.Storage.GetUserData().MasterId
                                ? CnnXt.Storage.GetUserData().MasterId
                                : CnnXt.Storage.GetUserData().IgmRegID)
                            : null;
                        CnnXt.AppInsights.init(OPTIONS.deviceId, masterId);
                    } catch (e) {
                        CnnXt.AppInsights.init();
                        LOGGER.exception(NAME, fnName, e);
                    }


                    defineConfiguration();
                    CnnXt.Utils.HangleMatherTool();
                });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var setupRunSettings = function () {
        var fnName = "setupRunSettings";

        LOGGER.debug(NAME, fnName, "Setup run settings", OPTIONS.runSettings);

        try {
            if (OPTIONS.runSettings.hasValidPromise) {
                LOGGER.debug(NAME, fnName, "Setup run settings promise");

                OPTIONS.runSettings.runPromise.then(function (result) {
                    if (!FIRST_RUN_EXECUTED) {
                        OPTIONS.runSettings.onRunPromiseResolved(result);
                        CnnXt.Run();
                    }

                    clearTimeout(RUN_TIMEOUT);

                    LOGGER.debug(NAME, fnName, "Promise has been resolved", result);

                }, function (result) {
                    if (!FIRST_RUN_EXECUTED) {
                        OPTIONS.runSettings.onRunPromiseRejected(result);
                        CnnXt.Run();
                    }

                    clearTimeout(RUN_TIMEOUT);

                    LOGGER.debug(NAME, fnName, "Promise has been rejected", result);
                });

                LOGGER.debug(NAME, fnName, "Promise has been setup", OPTIONS.runSettings);
            }

            LOGGER.debug(NAME, fnName, "Setup run settings timeout");

            RUN_TIMEOUT = setTimeout(function () {
                if (!FIRST_RUN_EXECUTED) {
                    CnnXt.Run();
                }

                LOGGER.debug(NAME, fnName, "Timeout has been expired");
            }, OPTIONS.runSettings.runOffset);

        } catch (ex) {
            LOGGER.exception(NAME, fnName, 'Setup run settings', ex);
        }
    }

    var defineConfiguration = function () {
        var fnName = "defineConfiguration";

        LOGGER.debug(NAME, fnName, 'Defining ConneXt configuration...');

        CnnXt.API.GetLastPublishDateS3()
            .done(function (data) {
                try {
                    S3_DATA = JSON.parse(data);
                    S3_DATA = CnnXt.Utils.ConvertObjectKeysToUpperCase(S3_DATA);

                    LOGGER.debug(NAME, fnName, 'S3_DATA is parsed', S3_DATA);
                } catch (ex) {
                    LOGGER.exception(NAME, fnName, 'S3_DATA Parse', ex);
                }
                if (S3_DATA[OPTIONS.configCode]) {
                    LOGGER.debug(NAME, fnName, 'Configuration code is found in the publish file');

                    getConfiguration()
                        .done(function (configuration) {
                            try {
                                IS_INIT_FINISHED = true;

                                if (configuration) {
                                    LOGGER.debug(NAME, fnName, "CONFIGURATION WAS FOUND", configuration);
                                    configuration.Settings = $.extend(true, OPTIONS.configSettings, configuration.Settings);
                                    configuration.Settings.Site = configuration.Site;

                                    CONFIGURATION = configuration;

                                    CnnXt.Storage.SetLocalConfiguration(CONFIGURATION);

                                    CnnXt.Event.fire('onDebugNote', 'Init is done!');

                                    if (!OPTIONS.silentmode || configuration.Settings.UseActivationFlow) {
                                        processConfiguration(configuration);
                                    } else {
                                        LOGGER.debug(NAME, fnName, "ConneXt was ranned in the silent mode, so we stop a process here");
                                    }

                                } else {
                                    LOGGER.warn("No Config Settings Found");
                                    CnnXt.Event.fire("onDebugNote", "No Config Settings Found.");
                                }
                            } catch (ex) {
                                LOGGER.exception(NAME, fnName, ex);
                            }
                        })
                        .fail(function (error) {
                            IS_INIT_FINISHED = true;
                            LOGGER.warn("Error getting Config Settings. No Config Settings Found");
                            CnnXt.Event.fire("onDebugNote", "Error getting Config Settings. No Config Settings Found");
                        });

                } else {
                    IS_INIT_FINISHED = true;
                    LOGGER.warn('Configuration code is not found in the publish file');
                    CnnXt.Event.fire("onDebugNote", "Configuration code is not found in the publish file.");
                }
            });
    };

    var getConfiguration = function () {
        var fnName = "getConfiguration";

        LOGGER.debug(NAME, fnName, 'Getting configuration...');

        try {
            var deferred = $.Deferred();
            var configuration = CnnXt.Storage.GetLocalConfiguration();
            var expired = new Date();
            expired.setMonth(expired.getMonth() + 1);
            expired = new Date(expired);

            if (configuration) {
                LOGGER.debug(NAME, fnName, 'Found Local Configuration', configuration);
                CnnXt.API.meta.config.isExistsInLocalStorage = true;
                var storedLastPublishDate = CnnXt.Storage.GetLastPublishDate(),
                    customTime = CnnXt.Utils.ParseCustomDate($.jStorage.get('CustomTime')),
                    normalizedLastPubDate = new Date(storedLastPublishDate);

                CnnXt.API.meta.config.localPublishDate = storedLastPublishDate;
                var s3DataConfigLastPublishDate = S3_DATA[OPTIONS.configCode];
                var isConfigOld = isConfigurationOld(S3_DATA, configuration.Settings.LastPublishDate);

                if (isConfigOld) {
                    CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.oldConfig;

                    LOGGER.debug(NAME, fnName, 'Stored configuration is old', configuration);
                    CnnXt.Event.fire("onDebugNote", "Current config is old.");
                    getConfigurationFromServer(s3DataConfigLastPublishDate)
                        .done(function (newConfiguration) {
                            LOGGER.debug(NAME, fnName, "A new configuration from server", newConfiguration);
                            CnnXt.Utils.MergeConfiguration(newConfiguration);
                            CnnXt.Storage.SetLastPublishDate(newConfiguration.Settings.LastPublishDate, expired);

                            if (__.isObject(s3DataConfigLastPublishDate)) {
                                if (s3DataConfigLastPublishDate.Reset) {
                                    CnnXt.Storage.ResetConversationViews(null, newConfiguration.Settings.UseParentDomain);
                                    CnnXt.Storage.RemoveTimeRepeatableActionData();
                                    CnnXt.Storage.ClearRepeatablesData();
                                    CnnXt.Storage.RemoveWhitelistSetIdCookie();
                                    CnnXt.Storage.RemoveWhitelistInfoboxCookie();
                                    CnnXt.Storage.RemoveNeedHidePinTemplateCookie();
                                    CnnXt.Storage.SetCurrentConversations({});
                                    CnnXt.Storage.SetCurrentConversation(null);
                                    CnnXt.Storage.ResetPinAttemptsCookie();
                                }
                            }

                            deferred.resolve(newConfiguration);

                        }).fail(function (error) {
                            LOGGER.debug(NAME, fnName, "getConfigurationFromServer", error);
                            deferred.reject(error);
                        });

                } else {
                    CnnXt.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);

                    LOGGER.debug(NAME, fnName, "Stored configuration is not old", configuration);
                    deferred.resolve(configuration);
                }
            } else {
                CnnXt.API.meta.config.isExistsInLocalStorage = false;
                CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.noLocalConfig;
                getConfigurationFromServer(S3_DATA[OPTIONS.configCode])
                    .done(function (configuration) {
                        LOGGER.debug(NAME, fnName, "A new configuration from server", configuration);

                        storeConfigurationFromServer(configuration, expired);

                        deferred.resolve(configuration);

                    }).fail(function (error) {
                        LOGGER.debug(NAME, fnName, "getConfigurationFromServer", error);

                        deferred.reject(error);
                    });
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
            deferred.reject(ex);
        }

        return deferred.promise();
    };

    var applyGlobalPublishSettings = function () {
        var s3DataConfigLastPublishDate = S3_DATA[OPTIONS.configCode];
        if (__.isObject(s3DataConfigLastPublishDate)) {
            if (s3DataConfigLastPublishDate.Reset) {
                CnnXt.Storage.ResetConversationViews(null, newConfiguration.Settings.UseParentDomain);
            }
        }
    }

    var storeConfigurationFromServer = function (configuration, expired) {
        var fnName = 'storeConfigurationFromServer';

        LOGGER.debug(NAME, fnName, 'Get configuration from server', arguments);

        try {
            $.jStorage.deleteKey(CnnXt.Common.StorageKeys.conversations.current);

            overrideRegistrationType(configuration);

            CnnXt.Storage.SetLocalConfiguration(configuration);
            CnnXt.Storage.SetLastPublishDate(configuration.Settings.LastPublishDate, expired);
        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var overrideRegistrationType = function (configuration) {
        var fnName = 'overrideRegistrationType';

        var registrationType = CnnXt.Storage.GetRegistrationType();

        if (registrationType && registrationType.Id && registrationType.IsOverride) {
            LOGGER.debug(NAME, fnName, 'Override registration type on', registrationType);

            configuration.Site.RegistrationTypeId = registrationType.Id;
        } else {
            $('#OverrideAuthType').prop('checked', false);
            $('#selAuthType').val(configuration.Site.RegistrationTypeId);
        }
    }

    var processConfiguration = function (configuration) {
        var fnName = "processConfiguration";

        LOGGER.debug(NAME, fnName, arguments);

        try {
            if (configuration.Settings.Active) {
                LOGGER.debug(NAME, fnName, 'Configuration is active');

                if (configuration.Settings.UseActivationFlow) {
                    if (!isProcessed) {
                        CnnXt.User.init(configuration.Settings);

                        var activationOnlySettings = {
                            ActivationFormName: configuration.Settings.ActivationTemplate.Name,
                            ActivationFormHtml: configuration.Settings.ActivationTemplate.Html,
                            IsActivationOnly: true
                        };

                        CnnXt.Activation.init(activationOnlySettings);
                    }

                    processActivationOnlyConfiguration(configuration);
                } else {
                    if (!isProcessed) {
                        CnnXt.MeterCalculation.init();
                        CnnXt.User.init(configuration.Settings);
                        CnnXt.Campaign.init(configuration.Settings);
                        CnnXt.Action.init(configuration.Settings);
                        CnnXt.Whitelist.init();
                    }

                    processUsualConfiguration(configuration);
                }
            } else {
                LOGGER.warn('Configuration is inactive');
                CnnXt.Event.fire("onDebugNote", "Configuration is inactive");
            }

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    };

    var processUsualConfiguration = function (configuration) {
        var fnName = "processUsualConfiguration";

        LOGGER.debug(NAME, fnName, 'Processing usual configuration', arguments);

        try {
            isProcessed = true;

            if (!configuration) {
                configuration = CONFIGURATION;
            }

            PROCESSTIME.StartProcessingTime = new Date();

            appendSiteTheme(configuration.Site);

            CnnXt.Event.fire("onDynamicMeterFound", configuration.DynamicMeter.Name);
            CnnXt.Event.fire("onCampaignFound", configuration.Campaign);

            CnnXt.CookieMigration.init();

            CnnXt.CookieMigration.Migrate();

            $.when(CnnXt.Storage.CheckViewCookies())
                .then(function () {
                    CnnXt.User.CheckAccess()
                        .always(function () {
                            if (!CnnXt.Storage.GetWhitelistSetIdCookie()) {
                                CnnXt.Whitelist.checkClientIp(configuration);
                            }

                            var UserAuthTime = CnnXt.User.GetAuthTiming();

                            LOGGER.debug(NAME, fnName, "User.CheckAccess.Always", "UserAuthTime", UserAuthTime);
                            var EndTime = new Date().getMilliseconds();
                            var ProcessingTime = EndTime - PROCESSTIME.StartProcessingTime.getMilliseconds();
                            var TotalTime = EndTime - PROCESSTIME.PluginStartTime.getMilliseconds();
                            $("#ddProcessingTime").text(ProcessingTime + "ms");
                            $("#ddTotalProcessingTime").text(TotalTime + "ms");
                        });
                });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var processActivationOnlyConfiguration = function (configuration) {
        var fnName = "processActivationOnlyConfiguration";

        LOGGER.debug(NAME, fnName, 'Processing activation only configuration', configuration);

        try {
            if (!OPTIONS.silentmode || isProcessed) {
                CnnXt.Activation.Run();
            }

            isProcessed = true;

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }
    }

    var appendSiteTheme = function (site) {
        var fnName = 'appendSiteTheme';

        LOGGER.debug(NAME, fnName, 'Append site theme', site);

        //code of applying Theme (additional bunch of styles). Plugin is getting url of those styles from configuration dynamically during proccess its flow, so we cannot use static link.
        if (site.SiteTheme.ThemeUrl && (site.SiteTheme.ThemeUrl !== "default")) {
            var env = CnnXt.Common.CSSPluginUrl[OPTIONS.environment];
            if ($("#themeLink").length == 0) {
                if ($("body > link").length == 0)
                    $("body").append('<link href="" id ="themeLink" rel="stylesheet" type="text/css">');
                else {
                    $('<link href="" id ="themeLink" rel="stylesheet" type="text/css">').insertAfter($("body > link").last());
                }
            }
            $("#themeLink").attr("href", env + site.SiteTheme.ThemeUrl);
        } else if (site.SiteTheme.ThemeUrl && site.SiteTheme.ThemeUrl === "default") {
            $("#themeLink").remove();
        }
    }

    var connextContinueProcessing = function (configuration) {
        var fnName = "connextContinueProcessing";

        LOGGER.debug(NAME, fnName, "Continue processing ConneXt...", configuration);

        var meterLevel;

        CnnXt.MeterCalculation.CalculateMeterLevel(configuration.DynamicMeter.Rules)
            .done(function (rule) {
                meterLevel = rule.MeterLevelId;
                LOGGER.debug(NAME, fnName, "Determined meter level", meterLevel, rule);
                CnnXt.Event.fire("onMeterLevelSet", { method: "Dynamic", level: meterLevel, rule: rule });
            })
            .fail(function () {
                meterLevel = configuration.Settings.DefaultMeterLevel;
                LOGGER.debug(NAME, fnName, "Failed to determined Meter Level... using default", meterLevel);
                CnnXt.Event.fire("onMeterLevelSet", { method: "Default", level: meterLevel });
            }).always(function () {
                LOGGER.debug(NAME, fnName, "METER CALCULATION --- ALWAYS CALLED", meterLevel);
                OPTIONS.currentMeterLevel = meterLevel;
                CnnXt.Campaign.ProcessCampaign(CnnXt.Common.MeterLevels[meterLevel], configuration.Campaign);
                connextFinishProcessing();
            });
    }

    var getConfigurationFromServer = function (publishSettings) {
        var fnName = "getConfigurationFromServer";

        LOGGER.debug(NAME, fnName, publishSettings);

        var deferred = $.Deferred();

        var publishDate = publishSettings && publishSettings.Date ? encodeURIComponent(publishSettings.Date) : undefined;

        try {
            CnnXt.API.GetConfiguration({
                payload: { siteCode: OPTIONS.siteCode, configCode: OPTIONS.configCode, publishDate: publishDate },
                onSuccess: function (data) {
                    var processedConfiguration = CnnXt.Utils.ProcessConfiguration(data);
                    deferred.resolve(processedConfiguration);
                },
                onNull: function () {
                    deferred.reject("Configuration is not found");
                },
                onError: function (error) {
                    deferred.reject("Error getting configuration data");
                }
            });

        } catch (ex) {
            LOGGER.exception(NAME, fnName, ex);
        }

        return deferred.promise();
    };

    var isConfigurationOld = function (s3Data, configurationLastPublishDate) {
        var fnName = "isConfigurationOld";

        LOGGER.debug(NAME, fnName, "s3Data", s3Data, "OPTIONS.configCode", OPTIONS.configCode, 'configurationLastPublishDate', configurationLastPublishDate);

        try {
            if (__.isObject(s3Data)) {
                var s3DataConfigLastPublishDate;
                var temp = s3Data[OPTIONS.configCode.toUpperCase()];

                if (temp && temp.Date) {
                    s3DataConfigLastPublishDate = temp.Date;
                } else {
                    s3DataConfigLastPublishDate = temp;
                }

                if (s3DataConfigLastPublishDate) {
                    var serverLastPublishDate,
                        localLastPublishDate;
                    if (__.isObject(s3DataConfigLastPublishDate)) {
                        LOGGER.debug(NAME, fnName, '.json file has a configCode property and its an object', s3DataConfigLastPublishDate);
                        serverLastPublishDate = new Date(Date.parse(s3DataConfigLastPublishDate.Date));
                        CnnXt.API.meta.config.publisfDate = serverLastPublishDate;
                        serverLastPublishDate.setSeconds(serverLastPublishDate.getSeconds() - 10);
                        localLastPublishDate = new Date(Date.parse(configurationLastPublishDate));
                        if (serverLastPublishDate > localLastPublishDate) {
                            LOGGER.debug(NAME, fnName, 'Server date is << AFTER >>');
                            return true;
                        } else {
                            LOGGER.debug(NAME, fnName, 'Server date is << NOT AFTER >>');
                            return false;
                        }
                    } else {
                        LOGGER.debug(NAME, fnName, '.json file has a property same as this configCode', s3DataConfigLastPublishDate);
                        serverLastPublishDate = new Date(Date.parse(s3DataConfigLastPublishDate));
                        serverLastPublishDate.setSeconds(serverLastPublishDate.getSeconds() - 10);
                        localLastPublishDate = new Date(Date.parse(configurationLastPublishDate));
                        if (serverLastPublishDate > localLastPublishDate) {
                            LOGGER.debug(NAME, fnName, 'Server date is << AFTER >>');
                            return true;
                        } else {
                            LOGGER.debug(NAME, fnName, 'Server date is << NOT AFTER >>');
                            return false;
                        }
                    }

                } else {
                    CnnXt.API.meta.config.publisfDate = null;
                    CnnXt.API.meta.config.ex = 's3Data does not have the current configCode as a key ' + OPTIONS.configCode;
                    CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.noConfigCodeinPublish;
                    throw CnnXt.Common.ERROR.CONFIG_HAS_NOT_PUBLISHED;
                }

            } else {
                CnnXt.API.meta.config.publisfDate = null;
                CnnXt.API.meta.config.ex = 's3Data is not an object';
                CnnXt.API.meta.reason = CnnXt.Common.DownloadConfigReasons.parsePublishFailed;
                throw CnnXt.Common.ERROR.S3DATA_IS_INVALID;
            }
        } catch (ex) {
            if (ex.custom) {
                LOGGER.warn(ex.message);
            } else {
                LOGGER.exception(NAME, fnName, ex);
            }
            return true;
        }
    };

    var connextFinishProcessing = function () {
        if (!CnnXt.Storage.GetWhitelistSetIdCookie() && (
            CnnXt.Campaign.GetCurrentConversationViewCount() > 1
            && CnnXt.Campaign.GetCurrentConversationViewCount() % CnnXt.GetOptions().BatchCount === 0
            || CnnXt.Storage.GetCurrenDynamicMeterViewCount() > 1
            && CnnXt.Storage.GetCurrenDynamicMeterViewCount() % CnnXt.GetOptions().BatchCount === 0)) {

            var data = {
                UserId: CnnXt.GetOptions().deviceId,
                ConfigCode: CnnXt.GetOptions().configCode,
                SiteCode: CnnXt.GetOptions().siteCode,
                SettingsKey: CnnXt.GetOptions().settingsKey,
                ViewData: CnnXt.Storage.GetLocalViewData()
            };
            if (CnnXt.User.getMasterId()) {
                var id = CnnXt.User.getMasterId();
                id = decodeURIComponent(id);
                data.masterId = id;
            }
            CnnXt.API.SendViewData(data);
        }
        CnnXt.Event.fire("onFinish");
    };

    var run = function () {

        if (IS_INIT_FINISHED) {
            CnnXt.Action.ClearActionsSchedule();
            CnnXt.CloseTemplates(function () {
                CnnXt.IntegrateProduct();

                FIRST_RUN_EXECUTED = true;
                clearTimeout(RUN_TIMEOUT);
                var configuration = CnnXt.Storage.GetLocalConfiguration();
                if (configuration) {
                    processConfiguration(configuration);
                } else {
                    LOGGER.warn(NAME, "Run", 'configuration is not found!!');
                }
            });
        } else {
            LOGGER.debug(NAME, "Run", 'Connext is not initialized yet, wait 100ms');
            setTimeout(run, 100);
        }
    };

    return {
        init: function (options) {
            OPTIONS = (options) ? options : {};

            init();

            Connext = {
                DisplayName: CnnXt.DisplayName,
                CloseTemplates: CnnXt.CloseTemplates,
                IntegrateProduct: CnnXt.IntegrateProduct,
                Run: CnnXt.Run,
                GetVersion: CnnXt.GetVersion,
                GetCurrentVersion: CnnXt.GetCurrentVersion,
                GetOptions: CnnXt.GetOptions,
                StartTracing: CnnXt.Logger.startTracing.bind(CnnXt.Logger),
                StopTracing: CnnXt.Logger.stopTracing.bind(CnnXt.Logger),
                GetSessionLogs: CnnXt.Logger.getSessionLogs,
                Storage: {
                    GetCurrentConversationViewCount: CnnXt.Storage.GetCurrentConversationViewCount,
                    GetCurrenDynamicMeterViewCount: CnnXt.Storage.GetCurrenDynamicMeterViewCount,
                    GetLastPublishDate: CnnXt.Storage.GetLastPublishDate,
                    GetSiteCode: function () { return CnnXt.Storage.GetLocalConfiguration().Site.SiteCode },
                    GetConfigCode: function () { return CnnXt.Storage.GetLocalConfiguration().Settings.Code },
                    GetLocalConfiguration: CnnXt.Storage.GetLocalConfiguration,
                    GetCurrentConversations: CnnXt.Storage.GetCurrentConversations,
                    GetCurrentConversation: CnnXt.Storage.GetCurrentConversation,
                    GetCurrentMeterLevel: function () { return OPTIONS.currentMeterLevel },
                    GetCampaignData: CnnXt.Storage.GetCampaignData,
                    GetRegistrationType: function () {
                        return CnnXt.Storage.GetLocalConfiguration().Site.RegistrationTypeId;
                    },
                    GetViewedArticles: function () {
                        var conversation = CnnXt.Storage.GetCurrentConversation();

                        if (conversation) {
                            return CnnXt.Storage.GetViewedArticles(conversation.id);
                        } else {
                            return [];
                        }
                    },
                    GetArticlesLeft: function () {
                        var conversation = CnnXt.Storage.GetCurrentConversation();

                        if (conversation) {
                            return conversation.Props.ArticleLeft;
                        } else {
                            return undefined;
                        }
                    },
                    GetUserState: CnnXt.Storage.GetUserState,
                    GetUserZipCodes: CnnXt.Storage.GetUserZipCodes,
                    GetActualZipCodes: CnnXt.Storage.GetActualZipCodes,
                    GetJanrainUser: CnnXt.Storage.GetJanrainUser,
                    GetUserData: CnnXt.Storage.GetUserData,
                    GetUserProfile: CnnXt.Storage.GetUserProfile,
                    GetConnextPaywallCookie: CnnXt.Storage.GetConnextPaywallCookie,
                    ClearUser: CnnXt.Storage.ClearUser
                }
            }

            LOGGER.debug(NAME, 'Init', 'Connext object has been created');

            return Connext;
        },
        Logger: ConnextLogger($),
        Whitelist: ConnextWhitelist($),
        MeterCalculation: ConnextMeterCalculation($),
        Campaign: ConnextCampaign($),
        Action: ConnextAction($),
        Activation: ConnextActivation($),
        Common: ConnextCommon(),
        Utils: ConnextUtils($),
        API: ConnextAPI($),
        Event: ConnextEvents($),
        Storage: ConnextStorage($),
        User: ConnextUser($),
        AppInsights: ConnextAppInsights($),
        CloseTemplates: closeAllTemplates,
        IntegrateProduct: IntegrateProduct,
        Run: function () {
            CnnXt.Event.fire("onRun");

            run();
        },
        ReInit: reInit,
        GetVersion: function () { return VERSION },
        GetCurrentVersion: function () {
            return 'Version: ' + window.connextVersion + ', Build: ' + window.connextBuild;
        },
        GetOptions: function () { return OPTIONS; },
        ShowContent: function () {
            CnnXt.Action.ShowContent();
        },
        ConnextContinueProcessing: connextContinueProcessing,
        DisplayName: ConnextCommon().DisplayName,
        CookieMigration: CookieMigration($)
    };

}(jQuery);

var Connext = {
    init: CnnXt.init
};