<?php
/**
 * Página de galería (/galeria/): vídeo e imágenes que se gestionan en Ajustes → Media Show BCN.
 */

defined( 'ABSPATH' ) || exit;

const MSB_GALERIA_PLANTILLA = 'msb-galeria';

add_action(
	'init',
	function () {
		if ( ! get_page_by_path( 'galeria' ) ) {
			$id = wp_insert_post(
				array(
					'post_type'   => 'page',
					'post_title'  => 'Galería',
					'post_name'   => 'galeria',
					'post_status' => 'publish',
					'post_content' => '',
				)
			);
			if ( $id && ! is_wp_error( $id ) ) {
				update_post_meta( $id, '_wp_page_template', MSB_GALERIA_PLANTILLA );
			}
		}
	}
);

add_filter(
	'theme_page_templates',
	function ( $t ) {
		$t[ MSB_GALERIA_PLANTILLA ] = 'Media Show BCN · Galería';
		return $t;
	}
);

add_filter(
	'template_include',
	function ( $template ) {
		if ( is_singular( 'page' ) && MSB_GALERIA_PLANTILLA === get_page_template_slug( get_queried_object_id() ) ) {
			msb_galeria_pagina();
		}
		return $template;
	},
	97
);

function msb_galeria_pagina() {
	$g = msb_galeria();
	$t = 'Galería · Media Show BCN';
	echo '<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>' . esc_html( $t ) . '</title>';
	echo '<link rel="stylesheet" href="' . esc_url( MSB_URL . 'assets/msb.css?ver=' . MSB_VERSION ) . '"><style>body{background:#0A0A0A;color:#F4F0E8;font-family:"Work Sans",Arial,sans-serif;margin:0;padding:24px}.gal-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:12px;margin-top:18px}.gal-grid img{width:100%;height:auto;border-radius:10px;display:block}a{color:#F07A5A}</style></head><body>';
	echo '<p><a href="' . esc_url( home_url( '/' ) ) . '">← Volver a Media Show BCN</a></p>';
	echo '<h1 style="font-family:\'Bebas Neue\',Impact,sans-serif;font-weight:400;font-size:44px;margin:8px 0">Galería</h1>';
	if ( $g['embed'] ) {
		echo '<div class="galeria-video"><iframe src="' . esc_url( $g['embed'] ) . '" title="Vídeo de Media Show BCN" allowfullscreen loading="lazy"></iframe></div>';
	} elseif ( $g['mp4'] ) {
		echo '<div class="galeria-video"><video controls preload="metadata" src="' . esc_url( $g['video'] ) . '"></video></div>';
	}
	echo '<div class="gal-grid">';
	foreach ( $g['imagenes'] as $img ) {
		echo '<img src="' . esc_url( $img ) . '" alt="Foto de un evento de Media Show BCN" loading="lazy">';
	}
	echo '</div>';
	if ( ! $g['imagenes'] && ! $g['embed'] && ! $g['mp4'] ) {
		echo '<p>Pronto publicaremos nuestra galería.</p>';
	}
	echo '</body></html>';
	exit;
}
