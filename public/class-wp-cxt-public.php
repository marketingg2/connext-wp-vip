<?php

/**
 * The public-facing functionality of the plugin.
 *
 * @link       http://marketingg2.com
 * @since      1.0.0
 *
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/public
 */

/**
 * The public-facing functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/public
 * @author     Marketing G2 <jscanlon@marketingg2.com>
 */
class Wp_Cxt_Public {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of the plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Cxt_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Wp_Cxt_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */
		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/Connext.min.css', array(), $this->version, 'all' );

	}

	/**
	 * Register the JavaScript for the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_scripts() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Wp_Cxt_Loader as all of the hooks are defined
		 * in that particular class.
		 *
         * The Wp_Cxt_Loader will then create the relationship
         * between the defined hooks and the functions defined in this
         * class.
		 */
		wp_register_script( 'connextPlugin', plugin_dir_url( __FILE__ ) . 'js/Connext.min.js',array( 'jquery' ) );
        wp_register_script( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'js/wp-cxt-public.js',array( 'jquery' ) );

        // Localize the script with new data
        $translation_array = $this->localize_vars();
        wp_localize_script( $this->plugin_name, 'cxt', $translation_array );

        // Enqueued script with localized data.
		wp_enqueue_script( 'connextPlugin' );
        wp_enqueue_script( $this->plugin_name );


	}

    function localize_vars() {
        //echo "localized vars";
        $options = array(
            'siteCode' => get_option('site_code_field'),
            'configCode' => get_option('config_code_field'),
			'attr' => get_option('attr_field'),
			'settingsKey' => get_option('settings_key_fields'),
			'environment' => get_option('environment_field'),
			'debug_level' => get_option('debug_field'),
			'paper_code' => get_option('papercode_key_fields'),
			'onNoConfigSettingFound' => get_option('onNoConfigSettingFound_key_fields'),
			'onActionShow' => get_option('onActionShow_key_fields'),
			'onActionHide' => get_option('onActionHide_key_fields'),
			'onAuthenticateSuccess' => get_option('onAuthenticateSuccess_key_fields'),
			'onAuthenticateFailure' => get_option('onAuthenticateFailure_key_fields'),
			'onMeterLevelSet' => get_option('onMeterLevelSet_key_fields'),
			'onHasAccessToken' => get_option('oonHasAccessToken_key_fields'),
			'onHasUserToken' => get_option('onHasUserToken_key_fields'),
			'onUserTokenSuccess' => get_option('onUserTokenSuccess_key_fields'),
			'onUserTokenFailure' => get_option('onUserTokenFailure_key_fields'),
			'onAuthorized' => get_option('onAuthorized_key_fields'),
			'onNotAuthorized' => get_option('onNotAuthorized_key_fields'),
			'onCheckAccessFailure' => get_option('onCheckAccessFailure_key_fields'),
			'onCriticalError' => get_option('onCriticalError_key_fields'),
			'onInit' => get_option('onInit_key_fields')

        );

        return $options;
    }

}
