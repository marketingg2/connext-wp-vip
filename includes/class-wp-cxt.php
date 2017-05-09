<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       http://marketingg2.com
 * @since      1.0.0
 *
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin.
 *
 * @since      1.0.0
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/includes
 * @author     Marketing G2 <jscanlon@marketingg2.com>
 */
class Wp_Cxt {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      Wp_Cxt_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	private $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	private $plugin_name;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Load the dependencies, define the locale, and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {

		$this->plugin_name = 'wp-cxt';

		$this->load_dependencies();
		$this->set_locale();
		$this->define_admin_hooks();
		$this->define_public_hooks();

	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Wp_Cxt_Loader. Orchestrates the hooks of the plugin.
	 * - Wp_Cxt_i18n. Defines internationalization functionality.
	 * - Wp_Cxt_Admin. Defines all hooks for the admin area.
	 * - Wp_Cxt_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once WP_CXT_PATH . 'includes/class-wp-cxt-loader.php';

		/**
		 * The class responsible for defining internationalization functionality
		 * of the plugin.
		 */
		require_once WP_CXT_PATH . 'includes/class-wp-cxt-i18n.php';

		/**
		 * The classes responsible for managing the plugin settings
		 */
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-settings.php';
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-settings-page.php';
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-settings-section.php';
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-settings-field.php';
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-meta-box.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once WP_CXT_PATH . 'admin/class-wp-cxt-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once WP_CXT_PATH . 'public/class-wp-cxt-public.php';

		$this->loader = new Wp_Cxt_Loader();

	}

	/**
	 * Define the locale for this plugin for internationalization.
	 *
	 * Uses the Wp_Cxt_i18n class in order to set the domain and to register the hook
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function set_locale() {

		$plugin_i18n = new Wp_Cxt_i18n();
		$this->loader->add_action( 'plugins_loaded', $plugin_i18n, 'load_plugin_textdomain' );

	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_admin_hooks() {

		$plugin_admin = new Wp_Cxt_Admin( $this->get_plugin_name() );
		$plugin_settings = new Wp_Cxt_Settings( $this->get_plugin_name() );
		$plugin_meta_box = new Wp_Cxt_Meta_Box( $this->get_plugin_name() );

		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles' );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts' );
		$this->loader->add_action( 'admin_menu', $plugin_settings, 'initialize_settings_page' );
		$this->loader->add_action( 'admin_init', $plugin_settings, 'initialize_settings_fields' );
		$this->loader->add_action( 'add_meta_boxes', $plugin_meta_box, 'initialize_meta_box' );
		$this->loader->add_action( 'save_post', $plugin_meta_box, 'save_meta_box' );

	}

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Wp_Cxt_Public( $this->get_plugin_name() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

	}

	public function create_plugin_settings_page() {
		// Add the menu item and page
		$page_title = 'Connext Settings';
		$menu_title = 'Connext Settings';
		$capability = 'manage_options';
		$slug = 'connext_settings';
		$callback = array( $this, 'plugin_settings_page_content' );
		$icon = 'dashicons-admin-plugins';
		$position = 100;

		add_menu_page( $page_title, $menu_title, $capability, $slug, $callback, $icon, $position );
	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Wp_Cxt_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	public function setup_sections() {
		add_settings_section( 'required_section', 'Required', array( $this, 'section_callback' ), 'connext_settings' );
		add_settings_section( 'optional_section', 'Optional', array( $this, 'section_callback' ), 'connext_settings' );
		add_settings_section( 'callback_section', 'Callbacks', array( $this, 'section_callback' ), 'connext_settings' );

	}

	public function section_callback( $arguments ) {
		switch ( $arguments['id'] ) {
			case 'required_section':
				echo 'These are required fields';
				break;
			case 'optional_section':
				echo 'These are optional fields';
				break;
			case 'callback_section':
				echo 'These are optional callbacks you can use to execute javascript code.';
				break;
		}
	}

	public function plugin_settings_page_content() {
		?>
			<div class="wrap">
				<h2>Connext Settings</h2>
				<form method="post" action="options.php">
				<?php
					settings_fields( 'connext_settings' );
					do_settings_sections( 'connext_settings' );
					submit_button();
				?>
				</form>
				</div>
		<?php
	}

	public function setup_fields() {
		$fields = array(
			array(
				'uid' => 'site_code_field',
				'label' => 'Site Code',
				'section' => 'required_section',
				'type' => 'text',
				'options' => false,
				'placeholder' => 'Site Code',
				'helper' => 'Does this help?',
				'supplemental' => 'This is your site code given by your PM.',
				'default' => '',
			),

			array(
				'uid' => 'config_code_field',
				'label' => 'Config Code',
				'section' => 'required_section',
				'type' => 'text',
				'options' => false,
				'placeholder' => 'Config Code',
				'helper' => 'Help?',
				'supplemental' => 'This is the configuration code you want to use. You can get this from the Connext Admin.',
				'default' => '',
			),
			array(
				'uid' => 'attr_field',
				'label' => 'Attr',
				'section' => 'required_section',
				'type' => 'text',
				'options' => false,
				'placeholder' => 'Attr',
				'helper' => 'Help?',
				'supplemental' => 'This is the attributes.',
				'default' => '',
			),
			array(
				'uid' => 'settings_key_fields',
				'label' => 'Settings Keys',
				'section' => 'required_section',
				'type' => 'text',
				'options' => false,
				'placeholder' => 'Settings Keys',
				'helper' => 'Help?',
				'supplemental' => 'Settings key for multi paper',
				'default' => '',
			),
			array(
				'uid' => 'papercode_key_fields',
				'label' => 'Paper Code',
				'section' => 'optional_section',
				'type' => 'text',
				'options' => false,
				'placeholder' => 'Settings Keys',
				'helper' => 'Help?',
				'supplemental' => 'Paper code.',
				'default' => '',
			),
			array(
				'uid' => 'debug_field',
				'label' => 'Debug Level',
				'section' => 'optional_section',
				'type' => 'select',
				'options' => array(
					'debug' => 'Debug',
					'warn' => 'Warn',
					'info' => 'Info',
					'error' => 'Error',
				),
				'placeholder' => 'Debug Level',
				'helper' => 'Help?',
				'supplemental' => 'Controls how much is written to windows console.',
				'default' => 'debug',
			),
			array(
				'uid' => 'environment_field',
				'label' => 'Environment',
				'section' => 'optional_section',
				'type' => 'select',
				'options' => array(
					'test' => 'Test',
					'stage' => 'Stage',
					'prod' => 'Productin',
				),
				'placeholder' => 'Environment',
				'helper' => 'Help?',
				'supplemental' => 'Environment.',
				'default' => 'test',
			),
			array(
				'uid' => 'onNoConfigSettingFound_key_fields',
				'label' => 'onNoConfigSettingFound',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onNoConfigSettingFound',
				'helper' => 'Help?',
				'supplemental' => 'On No Config Settings Found',
				'default' => '',
			),
			array(
				'uid' => 'onActionShow_key_fields',
				'label' => 'onActionShow',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onActionShow',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onActionHide_key_fields',
				'label' => 'onActionHide',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onActionHide',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onAuthenticateSuccess_key_fields',
				'label' => 'onAuthenticateSuccess',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onAuthenticateSuccess',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onAuthenticateFailure_key_fields',
				'label' => 'onAuthenticateFailure',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onAuthenticateFailure',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onMeterLevelSet_key_fields',
				'label' => 'onMeterLevelSet',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onMeterLevelSet',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'oonHasAccessToken_key_fields',
				'label' => 'onHasAccessToken',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onHasAccessToken',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onHasUserToken_key_fields',
				'label' => 'onHasUserToken',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onHasUserToken',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onUserTokenSuccess_key_fields',
				'label' => 'onUserTokenSuccess',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onUserTokenSuccess',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onUserTokenFailure_key_fields',
				'label' => 'onUserTokenFailure',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onUserTokenFailure',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onAuthorized_key_fields',
				'label' => 'onAuthorized',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onAuthorized',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onNotAuthorized_key_fields',
				'label' => 'onNotAuthorized',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onNotAuthorized',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onCheckAccessFailure_key_fields',
				'label' => 'onCheckAccessFailure',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onCheckAccessFailure',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onCriticalError_key_fields',
				'label' => 'onCriticalError',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onCriticalError',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),
			array(
				'uid' => 'onInit_key_fields',
				'label' => 'onInit',
				'section' => 'callback_section',
				'type' => 'textarea',
				'options' => false,
				'placeholder' => 'onInit',
				'helper' => 'Help?',
				'supplemental' => '',
				'default' => '',
			),

		);
		foreach ( $fields as $field ) {
			add_settings_field( $field['uid'], $field['label'], array( $this, 'field_callback' ), 'connext_settings', $field['section'], $field );
			register_setting( 'connext_settings', $field['uid'] );
		}
	}

	public function field_callback( $arguments ) {
		$value = get_option( $arguments['uid'] ); // Get the current value, if there is one
		if ( ! $value ) { // If no value exists
			$value = $arguments['default']; // Set to our default
		}

		// Check which type of field we want
		switch ( $arguments['type'] ) {
			case 'text': // If it is a text field
				printf( '<input name="%1$s" id="%1$s" type="%2$s" placeholder="%3$s" value="%4$s" />', $arguments['uid'], $arguments['type'], $arguments['placeholder'], $value );
				break;
			case 'textarea': // If it is a textarea
				printf( '<textarea name="%1$s" id="%1$s" placeholder="%2$s" rows="5" cols="50">%3$s</textarea>', $arguments['uid'], $arguments['placeholder'], $value );
				break;
			case 'select': // If it is a select dropdown
				if ( ! empty( $arguments['options'] ) && is_array( $arguments['options'] ) ) {
					$options_markup = '';
					foreach ( $arguments['options'] as $key => $label ) {
						$options_markup .= sprintf( '<option value="%s" %s>%s</option>', $key, selected( $value, $key, false ), $label );
					}
					printf( '<select name="%1$s" id="%1$s">%2$s</select>', $arguments['uid'], $options_markup );
				}
				break;
		}

		// If there is help text
		if ( $helper = $arguments['helper'] ) {
			printf( '<span class="helper"> %s</span>', $helper ); // Show it
		}

		// If there is supplemental text
		if ( $supplimental = $arguments['supplemental'] ) {
			printf( '<p class="description">%s</p>', $supplimental ); // Show it
		}
	}

}
