<?php
/**
 * Class to manage the plugin settings
 *
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/admin
 * @author     Jared Cobb <jared@alleyinteractive.com>
 */
class Wp_Cxt_Settings {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The existing settings currently stored
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array    $current_settings
	 */
	private $current_settings;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 */
	public function __construct( $plugin_name ) {
		$this->plugin_name = $plugin_name;
		$this->current_settings = get_option( 'wp_cxt_settings', array() );
	}

	public function initialize_settings_page() {

		$settings_page = new Wp_Cxt_Settings_Page( $this->plugin_name );

		add_submenu_page(
			'options-general.php',
			__( 'Connext Settings', 'wp-cxt' ),
			__( 'Connext Settings', 'wp-cxt' ),
			'manage_options',
			$this->plugin_name,
			array( $settings_page, 'render_page' )
		);
	}

	public function initialize_settings_fields() {

		register_setting( $this->plugin_name, 'wp_cxt_settings', array( $this, 'sanitize_settings' ) );

		foreach ( $this->get_settings_config() as $section_id => $section ) {

			$settings_section = new Wp_Cxt_Settings_Section( $section_id, $section );
			add_settings_section(
				$section_id,
				$section['section_title'],
				array(
					$settings_section,
					'render_section',
				),
				$this->plugin_name
			);

			foreach ( $section['fields'] as $field_id => $field ) {

				$settings_field = new Wp_Cxt_Settings_Field( $field_id, $field );
				add_settings_field(
					$field_id,
					$field['title'],
					array(
						$settings_field,
						'render_field',
					),
					$this->plugin_name,
					$section_id
				);

			}

		}

	}

	/**
	 * Sanitize and validate the settings fields
	 *
	 * @access   public
	 * @since    1.0.0
	 * @param    array $user_input An array of fields to sanitize.
	 * @return   array $sanitized_input
	 */
	public function sanitize_settings( $user_input ) {

		$settings_config = $this->get_settings_config();
		$sanitized_input = array();

		foreach ( $settings_config as $section ) {

			foreach ( $user_input as $field_name => $field_value ) {

				if ( ! empty( $section['fields'][ $field_name ]['validation_type'] ) ) {

					switch ( $section['fields'][ $field_name ]['validation_type'] ) {

						case 'alphanumeric':

							if ( empty( $field_value ) || ctype_alnum( $field_value ) ) {
								$sanitized_input[ $field_name ] = sanitize_text_field( $field_value );
							} else {
								add_settings_error(
									$field_name,
									$field_name,
									sprintf(
										esc_html__(
											'%s can only contain letters and numbers',
											'wp-cxt'
										),
										esc_html( $section['fields'][ $field_name ]['title'] )
									)
								);
							}
							break;

						case 'alphanumeric_array':

							if ( ! empty( $field_value ) && is_array( $field_value ) ) {
								$sanitized_array = array();
								foreach ( $field_value as $single_value ) {
									if ( ctype_alnum( $single_value ) ) {
										$sanitized_array[] = sanitize_text_field( $single_value );
									} else {
										add_settings_error(
											$field_name,
											$field_name,
											sprintf(
												esc_html__(
													'%s can only contain letters and numbers',
													'wp-cxt'
												),
												esc_html( $section['fields'][ $field_name ]['title'] )
											)
										);
									}
								}
								$sanitized_input[ $field_name ] = $sanitized_array;
							}
							break;

						default:
							$sanitized_input[ $field_name ] = sanitize_text_field( $field_value );
							break;

					}

				}

			}

		}
		return $sanitized_input;

	}

	/**
	 * Get the sections and fields for the settings
	 *
	 * @access    private
	 * @since     1.0.0
	 * @return    array
	 */
	private function get_settings_config() {
		$config = array(
			'general_settings' => array(
				'section_title' => esc_html__( 'General Settings', 'wp-cxt' ),
				'section_description' => __( 'Setup the general configuration of the Connext plugin', 'wp-cxt' ),
				'fields' => array(
					'site_code' => array(
						'title' => esc_html__( 'Site Code', 'wp-cxt' ),
						'render_function' => 'render_textfield',
						'placeholder' => __( 'Site Code', 'wp-cxt' ),
						'validation_type' => 'alphanumeric',
						'description' => __( 'This is your site code given by your PM.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'regular-text',
						),
					),
					'config_code' => array(
						'title' => esc_html__( 'Config Code', 'wp-cxt' ),
						'render_function' => 'render_textfield',
						'placeholder' => __( 'Config Code', 'wp-cxt' ),
						'validation_type' => 'alphanumeric',
						'description' => __( 'This is the configuration code you want to use. You can get this from the Connext Admin.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'regular-text',
						),
					),
					'attributes' => array(
						'title' => esc_html__( 'Attr', 'wp-cxt' ),
						'render_function' => 'render_textfield',
						'placeholder' => __( 'Attr', 'wp-cxt' ),
						'validation_type' => 'alphanumeric',
						'description' => __( 'This is the attributes.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'regular-text',
						),
					),
					'settings_key' => array(
						'title' => esc_html__( 'Settings Key', 'wp-cxt' ),
						'render_function' => 'render_textfield',
						'placeholder' => __( 'Settings Key', 'wp-cxt' ),
						'validation_type' => 'alphanumeric',
						'description' => __( 'Settings key for multi paper.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'regular-text',
						),
					),
					'papercode_key' => array(
						'title' => esc_html__( 'Paper Code', 'wp-cxt' ),
						'render_function' => 'render_textfield',
						'placeholder' => __( 'Paper Code', 'wp-cxt' ),
						'validation_type' => 'alphanumeric',
						'description' => __( 'Paper code.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'regular-text',
						),
					),
					'debug' => array(
						'title' => esc_html__( 'Debug Level', 'wp-cxt' ),
						'render_function' => 'render_chosen_select',
						'options' => array(
							'debug' => __( 'Debug', 'wp-cxt' ),
							'warn' => __( 'Warn', 'wp-cxt' ),
							'info' => __( 'Info', 'wp-cxt' ),
							'error' => __( 'Error', 'wp-cxt' ),
						),
						'default' => 'debug',
						'validation_type' => 'alphanumeric',
						'description' => __( 'Controls how much is written to windows console.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'chosen-select',
						),
					),
					'environment' => array(
						'title' => esc_html__( 'Environment', 'wp-cxt' ),
						'render_function' => 'render_chosen_select',
						'options' => array(
							'test' => __( 'Test', 'wp-cxt' ),
							'stage' => __( 'Stage', 'wp-cxt' ),
							'production' => __( 'Production', 'wp-cxt' ),
						),
						'default' => 'test',
						'validation_type' => 'alphanumeric',
						'attributes' => array(
							'class' => 'chosen-select',
						),
					),
				),
			),
			'display_settings' => array(
				'section_title' => esc_html__( 'Display Settings', 'wp-cxt' ),
				'section_description' => __( 'Choose on which pages the Connext code should render', 'wp-cxt' ),
				'fields' => array(
					'display_home' => array(
						'title' => esc_html__( 'Display on Home Page', 'wp-cxt' ),
						'render_function' => 'render_chosen_select',
						'options' => array(
							'no' => __( 'No', 'wp-cxt' ),
							'yes' => __( 'Yes', 'wp-cxt' ),
						),
						'default' => 'no',
						'validation_type' => 'alphanumeric',
						'description' => __( 'Determined via `is_home()`', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'chosen-select',
						),
					),
					'display_front' => array(
						'title' => esc_html__( 'Display on Front Page', 'wp-cxt' ),
						'render_function' => 'render_chosen_select',
						'options' => array(
							'no' => __( 'No', 'wp-cxt' ),
							'yes' => __( 'Yes', 'wp-cxt' ),
						),
						'default' => 'no',
						'validation_type' => 'alphanumeric',
						'description' => __( 'Determined via `is_front_page()`', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'chosen-select',
						),
					),
				),
			),
		);

		$config = $this->set_taxonomy_config( $config );

		return $config;

	}

	private function set_taxonomy_config( $config ) {

		$taxonomies = get_taxonomies( array(
			'public' => true,
		), 'objects' );

		if ( ! empty( $taxonomies ) ) {
			foreach ( $taxonomies as $tax_name => $tax_object ) {
				$terms = get_terms( array(
					'taxonomy' => $tax_name,
					'hide_empty' => false,
				) );

				if ( ! empty( $terms ) ) {
					$config['display_settings']['fields'][ 'display_' . $tax_name ] = array(
						'title' => sprintf( __( 'Display on %s', 'wp-cxt' ), $tax_object->label ),
						'render_function' => 'render_chosen_select',
						'options' => array(
							'no' => sprintf( __( 'No %s', 'wp-cxt' ), $tax_object->label ),
							'all' => sprintf( __( 'All %s', 'wp-cxt' ), $tax_object->label ),
							'some' => sprintf( __( 'Some %s', 'wp-cxt' ), $tax_object->label ),
						),
						'default' => 'no',
						'validation_type' => 'alphanumeric',
						'description' => sprintf( __( 'Should the Connext code render on No, All, or Some %s?', 'wp-cxt' ), $tax_object->label ),
						'attributes' => array(
							'class' => 'chosen-select display-terms-parent',
							'data-term-selector' => 'display-' . $tax_name . '-terms',
						),
					);

					$config['display_settings']['fields'][ 'display_' . $tax_name . '_terms' ] = array(
						'title' => sprintf( __( 'Display on some %s', 'wp-cxt' ), $tax_object->label ),
						'render_function' => 'render_chosen_multiselect',
						'options' => $this->build_terms_options( $terms ),
						'validation_type' => 'alphanumeric_array',
						'description' => __( 'Choose one or more terms.', 'wp-cxt' ),
						'attributes' => array(
							'class' => 'chosen-select display-' . $tax_name . '-terms',
							'data-placeholder' => __( 'Choose one or more terms.', 'wp-cxt' ),
						),
					);
				}
			}
		}

		return $config;
	}

	private function build_terms_options( $terms ) {
		$term_options = array();
		foreach ( $terms as $term ) {
			$term_options[ $term->term_id ] = $term->name;
		}
		return $term_options;
	}

}
