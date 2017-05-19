/* global jQuery Connext WP_CXT */
(function wpCxtInstance($) {
  var wpCxt = {

    initialize() {
      Connext.init({
        siteCode: WP_CXT.siteCode,
        configCode: WP_CXT.configCode,
        debug: WP_CXT.debug,
        settingsKey: WP_CXT.settingsKey,
        environment: WP_CXT.environment,
      });
    }
    
  };
  
  $(function() {
    wpCxt.initialize();
  });
}(jQuery));
