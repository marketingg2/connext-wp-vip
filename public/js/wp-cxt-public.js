/* global jQuery Connext WP_CXT */
(function wpCxtInstance($) {
  var wpCxt = {

    initialize : function() {
      Connext.init({
        siteCode: WP_CXT.siteCode,
        configCode: WP_CXT.configCode,
        debug: (WP_CXT.debug === 'false') ? false : true,
        settingsKey: WP_CXT.settingsKey,
        environment: WP_CXT.environment,
        attr: WP_CXT.attr,
      });
    }

  };
  $(function() {
    wpCxt.initialize();
  });
}(jQuery));
