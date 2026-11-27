<?php
/**
 * Asistente de Flow con ChatGPT (OpenAI). La clave se guarda en el servidor: el navegador nunca la ve.
 */

defined( 'ABSPATH' ) || exit;

function msb_openai_clave() {
	if ( defined( 'MSB_OPENAI_KEY' ) && MSB_OPENAI_KEY ) {
		return (string) MSB_OPENAI_KEY;
	}
	return (string) get_option( 'msb_openai_key', '' );
}

add_action(
	'rest_api_init',
	function () {
		register_rest_route(
			'msb/v1',
			'/gestion/ia',
			array(
				'methods'             => 'POST',
				'permission_callback' => 'msb_gestion_permiso',
				'callback'            => function ( $req ) {
					$clave = msb_openai_clave();
					if ( '' === $clave ) {
						return new WP_Error( 'msb_ia', 'El asistente no está configurado: falta la clave de OpenAI en Ajustes.', array( 'status' => 503 ) );
					}
					$prompt = mb_substr( (string) $req->get_param( 'prompt' ), 0, 12000 );
					$r      = wp_remote_post(
						'https://api.openai.com/v1/chat/completions',
						array(
							'timeout' => 60,
							'headers' => array( 'Authorization' => 'Bearer ' . $clave, 'Content-Type' => 'application/json' ),
							'body'    => wp_json_encode(
								array(
									'model'    => 'gpt-4o-mini',
									'messages' => array(
										array( 'role' => 'system', 'content' => 'Eres el asistente de Media Show Flow, la herramienta de gestión de Media Show BCN (productora de sonido, luz y eventos en Barcelona). Responde en español, claro y breve.' ),
										array( 'role' => 'user', 'content' => $prompt ),
									),
								)
							),
						)
					);
					if ( is_wp_error( $r ) ) {
						return new WP_Error( 'msb_ia', 'No se ha podido contactar con el asistente.', array( 'status' => 502 ) );
					}
					$j = json_decode( wp_remote_retrieve_body( $r ), true );
					$t = $j['choices'][0]['message']['content'] ?? '';
					if ( '' === $t ) {
						return new WP_Error( 'msb_ia', 'El asistente no ha devuelto respuesta.', array( 'status' => 502 ) );
					}
					return array( 'text' => $t );
				},
			)
		);
	}
);
