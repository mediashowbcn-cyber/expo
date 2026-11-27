<?php
/**
 * Puente entre la colección «leads» de Flow y las fichas de solicitud de WordPress:
 * una sola lista. Lo que llega por la web aparece en Flow y lo que cambia en Flow queda en WordPress.
 */

defined( 'ABSPATH' ) || exit;

function msb_lead_docid( $post_id ) {
	$fid = get_post_meta( $post_id, '_msb_flow_id', true );
	return $fid ? (string) $fid : 'wp' . $post_id;
}

function msb_lead_post_de_docid( $doc ) {
	if ( preg_match( '/^wp(\d+)$/', (string) $doc, $m ) ) {
		$id = (int) $m[1];
		return 'msb_lead' === get_post_type( $id ) ? $id : 0;
	}
	$ids = get_posts(
		array(
			'post_type'   => 'msb_lead',
			'post_status' => 'any',
			'numberposts' => 1,
			'fields'      => 'ids',
			'meta_key'    => '_msb_flow_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			'meta_value'  => (string) $doc, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		)
	);
	return $ids ? (int) $ids[0] : 0;
}

/** Ficha de WordPress en el formato de lead de Flow. */
function msb_lead_a_flow( $id ) {
	$m    = function ( $k ) use ( $id ) {
		return get_post_meta( $id, '_msb_' . $k, true );
	};
	$tipo = $m( 'tipo_evento' );
	$pos  = get_post_time( 'U', true, $id );
	$doc  = (array) get_post_meta( $id, '_msb_flow_extra', true ); // campos que solo conoce Flow
	$cot  = isset( $doc['cot'] ) && is_array( $doc['cot'] ) ? $doc['cot'] : array();
	if ( '' !== $m( 'importe' ) ) {
		$cot['total'] = (float) $m( 'importe' );
	}
	if ( '' !== $m( 'config' ) ) {
		$cot['config'] = $m( 'config' );
	}
	return array_merge(
		$doc,
		array(
			'id'        => msb_lead_docid( $id ),
			'name'      => get_the_title( $id ),
			'company'   => $m( 'empresa' ),
			'city'      => $m( 'ciudad' ),
			'type'      => MSB_TIPOS_EVENTO[ $tipo ] ?? $tipo,
			'email'     => $m( 'email' ),
			'phone'     => $m( 'telefono' ),
			'guests'    => (int) $m( 'personas' ),
			'date'      => $m( 'fecha_evento' ),
			'msg'       => $m( 'notas' ),
			'status'    => $m( 'estado' ) ?: 'Nuevo',
			'source'    => 'Web',
			'canal'     => $m( 'canal' ),
			'seller'    => $doc['seller'] ?? '',
			'consent'   => true,
			'createdAt' => (int) $pos * 1000,
			'updatedAt' => (int) strtotime( get_post_modified_time( 'c', true, $id ) ) * 1000,
			'cot'       => $cot,
		)
	);
}

/** Aplica un documento de Flow a la ficha (crea la ficha si no existe). Devuelve el ID de la ficha. */
function msb_lead_desde_flow( $doc, $data ) {
	$data = (array) $data;
	$id   = msb_lead_post_de_docid( $doc );
	if ( ! $id ) {
		$email = sanitize_email( $data['email'] ?? '' );
		$id    = $email ? msb_lead_por_email( $email ) : 0; // misma persona: se une a su ficha
		if ( ! $id ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'msb_lead',
					'post_status' => 'publish',
					'post_title'  => sanitize_text_field( $data['name'] ?? 'Cliente' ),
				)
			);
			if ( is_wp_error( $id ) || ! $id ) {
				return 0;
			}
			update_post_meta( $id, '_msb_creado', current_time( 'mysql' ) );
			update_post_meta( $id, '_msb_canal', sanitize_text_field( $data['canal'] ?? 'Flow' ) );
		}
		update_post_meta( $id, '_msb_flow_id', (string) $doc );
	}
	if ( isset( $data['name'] ) && '' !== $data['name'] ) {
		wp_update_post( array( 'ID' => $id, 'post_title' => sanitize_text_field( $data['name'] ) ) );
	}
	$mapa = array(
		'empresa'      => 'company',
		'ciudad'       => 'city',
		'email'        => 'email',
		'telefono'     => 'phone',
		'personas'     => 'guests',
		'fecha_evento' => 'date',
		'notas'        => 'msg',
		'estado'       => 'status',
		'canal'        => 'canal',
	);
	foreach ( $mapa as $meta => $campo ) {
		if ( array_key_exists( $campo, $data ) ) {
			$v = $data[ $campo ];
			update_post_meta( $id, '_msb_' . $meta, is_array( $v ) ? '' : sanitize_text_field( (string) $v ) );
		}
	}
	if ( isset( $data['type'] ) ) {
		$tipo = array_search( $data['type'], MSB_TIPOS_EVENTO, true );
		update_post_meta( $id, '_msb_tipo_evento', false !== $tipo ? $tipo : sanitize_text_field( $data['type'] ) );
	}
	if ( isset( $data['cot']['total'] ) && is_numeric( $data['cot']['total'] ) ) {
		update_post_meta( $id, '_msb_importe', round( (float) $data['cot']['total'], 2 ) );
	}
	if ( isset( $data['cot']['config'] ) ) {
		update_post_meta( $id, '_msb_config', sanitize_textarea_field( (string) $data['cot']['config'] ) );
	}
	// Lo que Flow guarda y WordPress no tiene campo propio (se conserva tal cual).
	$extra = array_diff_key( $data, array_flip( array_values( $mapa ) + array( 'name', 'type', 'id', 'createdAt', 'updatedAt', 'source', 'consent', 'cot' ) ) );
	$extra['cot'] = isset( $data['cot'] ) && is_array( $data['cot'] ) ? array_diff_key( $data['cot'], array( 'total' => 1, 'config' => 1 ) ) : array();
	update_post_meta( $id, '_msb_flow_extra', $extra );
	return $id;
}

function msb_lead_listar_flow() {
	$ids  = get_posts( array( 'post_type' => 'msb_lead', 'post_status' => 'publish', 'numberposts' => 5000, 'fields' => 'ids', 'orderby' => 'ID', 'order' => 'ASC' ) );
	$docs = array();
	foreach ( $ids as $id ) {
		$docs[] = array( 'id' => msb_lead_docid( $id ), 'data' => msb_lead_a_flow( $id ) );
	}
	return $docs;
}

function msb_lead_firma_flow() {
	global $wpdb;
	$r = $wpdb->get_row( "SELECT COUNT(*) AS n, MAX(post_modified_gmt) AS u FROM {$wpdb->posts} WHERE post_type = 'msb_lead' AND post_status = 'publish'", ARRAY_A ); // phpcs:ignore WordPress.DB.PreparedSQL
	return ( $r['n'] ?? 0 ) . '|' . ( $r['u'] ?? '' );
}

function msb_lead_borrar_flow( $doc ) {
	$id = msb_lead_post_de_docid( $doc );
	if ( $id ) {
		wp_trash_post( $id );
	}
}
