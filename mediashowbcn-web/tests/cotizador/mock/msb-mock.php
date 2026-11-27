<?php
// Solo pruebas: catálogo de ejemplo (sin WooCommerce en este entorno). Los id coinciden con la web real.
add_filter('msb_catalog', function($c){
  if ($c['packs']) return $c;
  $L = 'http://localhost:8099/?p=1';
  $pk = function($id,$n,$pr,$min,$max,$pre,$from,$buy){ return array('id'=>$id,'name'=>$n,'price'=>$pr,'from'=>$from,'min'=>$min,'max'=>$max,'preset'=>$pre,'link'=>'http://localhost:8099/?p=1','buy'=>$buy,'desc'=>'','img'=>''); };
  $ex = function($id,$n,$pr,$max,$m){ return array('id'=>$id,'name'=>$n,'price'=>$pr,'max'=>$max,'model'=>$m,'desc'=>'','img'=>'','photo'=>''); };
  return array(
    'packs' => array($pk(24,'Starter',385,30,60,'starter',false,true),$pk(25,'Corporate',875,60,120,'corporate',false,true),$pk(26,'Premium',1790,120,200,'premium',false,true),$pk(27,'Producción integral',2600,200,null,'integral',true,false)),
    'extras' => array(
      $ex(90,'Mesa alta de cóctel',null,20,'mesa_alta'),$ex(91,'Silla',null,200,'silla'),$ex(28,'Pantalla LED Kit S · 2 × 1,5 m (3 m²)',900,1,'led_s'),$ex(29,'Pantalla LED Kit M · 3 × 2 m (6 m²)',null,1,'led_m'),$ex(30,'Pantalla LED Kit L · 4 × 2,5 m (10 m²)',null,1,'led_l'),
      $ex(31,'Tótem LED Digital 55"',280,50,'totem'),$ex(32,'Pantalla 55" con pie',null,50,'screen55'),$ex(33,'Pack 6 Cabezas Móviles',250,8,'heads'),
      $ex(34,'Pack 4 Barras LED',140,6,'bars'),$ex(35,'Truss de escenario 6 × 4 m',null,1,'truss'),$ex(36,'Cabina DJ (DJ booth)',null,1,'booth'),
      $ex(37,'DJ profesional',null,1,'dj'),$ex(38,'Micrófono inalámbrico adicional',null,20,'mic'),$ex(39,'Atril con micrófono',null,1,'lectern'),
      $ex(40,'Streaming multicámara',600,1,'stream'),$ex(41,'Técnico adicional',150,3,''),$ex(42,'Fotografía del evento',350,1,''),
      $ex(43,'Humo / fuego frío',120,1,'smoke'),$ex(61,'Tarima de escenario (por m²)',25,200,'tarima'),$ex(65,'Altavoz adicional Alto TRX315',null,20,'trx_extra'),
      $ex(66,'Torre de truss con cabeza móvil',null,20,'tower'),$ex(58,'Altavoz adicional RCF EVOX 12',null,20,'spk'),$ex(59,'Render 3D de tu evento en 4K',49,1,'')
    ),
    'equipos' => array(),
    'models3d' => array(),
  );
});
