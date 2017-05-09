<?php
/**
 * Class to manage the plugin metabox on post types
 *
 * @package    Wp_Cxt
 * @subpackage Wp_Cxt/admin
 * @author     Jared Cobb <jared@alleyinteractive.com>
 */
class Wp_Cxt_Meta_Box {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The available post types for this metabox
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      array    $post_types
	 */
	private $post_types = array();

	/**
	 * Initialize the class and set its properties.
	 *
	 * @param   string $plugin_name The name of the plugin
	 * @return void
	 */
	public function __construct( $plugin_name ) {
		$this->plugin_name = $plugin_name;
		$this->post_types = apply_filters( 'wp_cxt_meta_box_post_types', array( 'post', 'page' ) );
	}

	/**
	 * Setup the meta box for the post types
	 *
	 * @access    public
	 * @since     1.0.0
	 * @return    void
	 */
	public function initialize_meta_box() {
		if ( ! empty( $this->post_types ) ) {
			foreach ( $this->post_types as $post_type ) {
				add_meta_box(
					$this->plugin_name,
					__( 'Connext Settings', 'wp-cxt' ),
					array( $this, 'render_meta_box' ),
					$post_type,
					'side'
				);
			}
		}
	}

	public function render_meta_box( $post ) {
		wp_nonce_field( 'wp_cxt_meta_box_nonce', 'wp_cxt_meta_box_nonce' );
		$value = get_post_meta( $post->ID, 'wp_cxt_display_script', true );

		echo sprintf( '<p>%s</p>', esc_html__( 'Enable Connext', 'wp-cxt' ) );

		echo sprintf(
			'<select name="wp_cxt_display_script">
			<option value>%1$s</option>
			<option value="yes" %2$s>%3$s</option>
			<option value="no" %4$s>%5$s</option>
			</select>',
			esc_html__( 'Default', 'wp-cxt' ),
			selected( $value, 'yes', false ),
			esc_html__( 'Yes', 'wp-cxt' ),
			selected( $value, 'no', false ),
			esc_html__( 'No', 'wp-cxt' )
		);
	}

	public function save_meta_box( $post_id ) {
		if (
			! isset( $_POST['wp_cxt_meta_box_nonce'] ) // Input var okay.
			|| ! isset( $_POST['wp_cxt_display_script'] ) // Input var okay.
			|| ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['wp_cxt_meta_box_nonce'] ) ), 'wp_cxt_meta_box_nonce' ) // Input var okay.
			|| ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE )
		) {
			return;
		}

		if ( 'yes' === sanitize_text_field( wp_unslash( $_POST['wp_cxt_display_script'] ) ) ) { // Input var okay.
			$sanitized_value = 'yes';
		} elseif ( 'no' === sanitize_text_field( wp_unslash( $_POST['wp_cxt_display_script'] ) ) ) { // Input var okay.
			$sanitized_value = 'no';
		} else {
			$sanitized_value = '';
		}

		update_post_meta( $post_id, 'wp_cxt_display_script', $sanitized_value );
	}

}
