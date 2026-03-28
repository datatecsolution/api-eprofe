<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

use App\Centro;
use App\Docente;
use App\Modalidad;
use App\Asignatura;
use App\Seccion;
use App\Alumno;
use App\Matricula;

use App\Notaacumulativo;
use App\Periodo;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;


class SaceController
{
	private $user_sace="";
    private $sace_pass='';
    private $cookie_file_path=""; //= dirname(__FILE__)+'/cookie.txt';
    private $LOGIN_URL = "https://sace.se.gob.hn/cuentas/login";
    private $AUTORIZAR_URL='https://sace.se.gob.hn/cuentas/usuario/autorizar/acceso';
    private $DESCARGAR_URL='https://sace.se.gob.hn/notas/descargar';
    private $LOGOUT_URL='https://sace.se.gob.hn/cuentas/logout/';
    private $token='';
    private $next='';
    private $user_docente='';


    public function set_data_user($usuario,$pwd,$dir_cookies){

        $this->user_sace=$usuario;
        $this->sace_pass=$pwd;
        $this->cookie_file_path = $dir_cookies; 

    }


    /*
    public function login_sace(){

    	if($this->get_from_login()){
            $this->get_login_sace();
            return true;
        }else{
    	    return false;
        }


    }
    */

    public function get_from_login(){

        $result = false;


    	$ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
        curl_setopt($ch, CURLOPT_URL, $this->LOGIN_URL);
        curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
        curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
        curl_setopt($ch, CURLOPT_COOKIEJAR,$this->cookie_file_path); // Stores cookies in the temp file
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accpet-Languege: es-es,en"));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);

        // execute session to get cookies and required form inputs
        $content = curl_exec($ch);

        // Check if an error occurred
        if(curl_errno($ch)) {
            curl_close($ch);
            return false;
        }



        //$httpCode=curl_getinfo($ch,CURLINFO_EFFECTIVE_URL);
        $httpCode=curl_getinfo($ch,CURLINFO_HTTP_CODE);




        /* Check for 200 (file is found). */
        if($httpCode == 200) {

            $hidden1;
            $hidden2;
            preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $content, $hidden1);

            preg_match_all('<input type="hidden" name="next" value="(.*)" />', $content, $hidden2);

            if (!is_null($hidden1[1]) and sizeof($hidden1[1]) != 0) {
                $this->token = $hidden1[1][0];
                $this->next = $hidden2[1][0];
            }
            $result=true;
        }
        curl_close($ch);
        return $result;
    }
    public function get_login_sace()
    {

        $result = false;

        //parametros para el login
        $postValues = array(
            'usuario' => $this->user_sace,
            'clave' => $this->sace_pass,
            'csrfmiddlewaretoken' => $this->token,
            'next' => $this->next
        );


        // se realiza el login del uausio
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
        curl_setopt($ch, CURLOPT_URL, $this->LOGIN_URL);
        curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, (isset($z['timeout']) ? $z['timeout'] : 5));
        curl_setopt($ch, CURLOPT_REFERER, $this->LOGIN_URL);
        curl_setopt($ch, CURLOPT_POST, count($postValues));
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
        //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
        curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
        curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
        $output = curl_exec($ch);


        //echo $output;

        //$httpCode=curl_getinfo($ch,CURLINFO_EFFECTIVE_URL);
        //$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);

        //echo $httpCode;

        // Check if an error occurred
        if(curl_errno($ch)) {
            curl_close($ch);
            return false;
        }

        curl_close($ch);

        $hidden1;


        $preg_match = "#<td style=\"text-align:center; vertical-align:middle;\">\s*DOCENTE\s*</td>\s*<td>\s*\s*<form action=\"/cuentas/usuario/autorizar/acceso\" method=\"post\">\s*<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />\s*<input type=\"hidden\" value=\"(.*)\" name=\"usuario\"/>#siU";

        //   return $preg_match;

        preg_match_all($preg_match, $output, $hidden1);


        //echo $hidden1[1];

        if (!empty($hidden1[1][0])){


            //sino se consiguen el token es porque no se pudo hacer logout hacer validadcion aqui
            //se recoge el token
            $this->token = $hidden1[1][0];

            //se recoge el usuario docente
            $this->user_docente = $hidden1[2][0];


            $postValues = array(
                'usuario' => $this->user_docente,
                'csrfmiddlewaretoken' => $this->token

            );

            //se selecciona las opciones de docenten el el login
            $ch = curl_init();

            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
            curl_setopt($ch, CURLOPT_URL, $this->AUTORIZAR_URL);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, (isset($z['timeout']) ? $z['timeout'] : 5));
            curl_setopt($ch, CURLOPT_REFERER, $this->LOGIN_URL);
            curl_setopt($ch, CURLOPT_POST, count($postValues));
            curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
            //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
            curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
            curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
            $output = curl_exec($ch);

            // Check if an error occurred
            if(curl_errno($ch)) {
                curl_close($ch);
                return false;
            }

            curl_close($ch);

            $result=true;
    }else{
           $result=false;
        }

        return $result;

    }

    public function get_from_descarga(){

    }
    public function get_descargar(){


                $resultado=false;

    			
                $year=date("Y");

                //se verifica la existencia del directorios general para los archivos xls
                $exists = Storage::disk('local')->exists($year);

                if(!$exists){
                    //sino existe se crea el directorio 
                    Storage::disk('local')->makeDirectory($year);

                }

                //se verifica la existencia del directorio del docente
                $exists = Storage::disk('local')->exists($year."/".$this->user_sace);

                if(!$exists){
                    //sino existe se crea el directorio 
                    Storage::disk('local')->makeDirectory($year."/".$this->user_sace);
                    

                }


    			$ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $this->DESCARGAR_URL);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGIN_URL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);

                // Check if an error occurred
                if(curl_errno($ch)) {
                    curl_close($ch);
                    return false;
                }

                curl_close($ch);


                $hidden1;
                $hidden2;
                preg_match_all('#<button type="submit" class="descargar btn btn-info btn-small" data-cs="(.*)"><i class="icon-download-alt icon-white"></i></button>#', $output, $hidden1);

                preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $output, $hidden2);


                

                //se verifica que existan item para descargar
                if(!empty($hidden2[1][0]) or !empty($hidden1[1])){

                    $this->token= $hidden2[1][0];

                    for($x=0;$x<sizeof($hidden1[1]);$x++)
                    {

                        $postValues = array(
                            'cs' => $hidden1[1][$x],
                            'csrfmiddlewaretoken'=>$this->token

                        );


                        //se descargan los archivos en excel para guardarlos en el server
                        $ch = curl_init();

                        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                        curl_setopt($ch, CURLOPT_URL,$this->DESCARGAR_URL);
                        curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                        curl_setopt($ch, CURLOPT_REFERER,$this->LOGIN_URL);
                        curl_setopt($ch, CURLOPT_POST, count($postValues));
                        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                        //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                        curl_setopt($ch, CURLOPT_COOKIEJAR,$this->cookie_file_path);
                        curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                        curl_setopt($ch,CURLINFO_HEADER_OUT,true);
                        $output = curl_exec($ch);

                        // Check if an error occurred
                        if(curl_errno($ch)) {
                            curl_close($ch);
                            return false;
                        }
                        curl_close($ch);
                        Storage::disk('local')->put($year."/".$this->user_sace.'/'.$this->user_sace.'_'.$x.'.xls', $output);

                    }
                    $resultado=true;


                }else{
                    $resultado=false;
                }


                


                return $resultado;

    }
    public function get_from_subir(){

    }
    public function get_subir(){

    }
    public function logout(){

    			$ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $this->LOGOUT_URL.$this->user_docente);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGIN_URL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

    }
}
