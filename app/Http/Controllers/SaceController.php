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
	public $login_email="";
    public $login_pass='';
    public $cookie_file_path=""; //= dirname(__FILE__)+'/cookie.txt'; 
    public $LOGINURL = "https://sace.se.gob.hn/cuentas/login";
    public $AUTORIZARURL='https://sace.se.gob.hn/cuentas/usuario/autorizar/acceso';
    public $DESCARGAR_URL='https://sace.se.gob.hn/notas/descargar';
    public $LOGOUT_URL='https://sace.se.gob.hn/cuentas/logout/';
    public $token='';
    public $next='';
    public $user_docente='';


    public function set_data_user($usuario,$pwd,$dir_cookies){

        $this->login_email=$usuario;
        $this->login_pass=$pwd;
        $this->cookie_file_path = $dir_cookies; 

    }
    public function setDataInDB(){


                $periodos=Periodo::where("estado","=","1")->get();
                $year=date("Y");
                $inputFileType = 'Xls';


                //se verifica la existencia de por lo menos un archivo xls
                $exists = Storage::disk('local')->exists($year."/".$this->login_email.'/'.$this->login_email.'_'.'0'.'.xls');

                if($exists){//se verifica el primer archivo

                    $docente=Docente::where('user_sace',"=",$this->login_email)->first();

                    //se eliminan las relaciones que tenia el docente con las secciones y asignaturas anteriores
                    DB::delete("delete a from asignaturas_secciones a JOIN seccions b ON a.seccion_id=b.id  join periodos c on b.periodo_id=c.id where c.estado=1 and a.docente_id=".$docente->id);
            
                    
                    //recoremos todos los archivos en busqueda de datos
                    for($ii=0;$exists;$ii++)
                    {
                        

                        $path='app/'.$year."/".$this->login_email.'/'.$this->login_email.'_'.$ii.'.xls';


         
                        $path = storage_path($path);

                        

                        $seccion=new Seccion;

                        //$seccion->periodo_id=$periodo->id;

                        /**  Create a new Reader of the type defined in $inputFileType  **/
                        $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader($inputFileType);
                        /**  Advise the Reader that we only want to load cell data  **/
                        $reader->setReadDataOnly(true);

                        /**  Load $inputFileName to a Spreadsheet Object  **/
                        $spreadsheet = $reader->load($path);
                        //$sheet=IOFactory::load($path);

                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A1')->getFormattedValue();
                        
                        //Se realiza la validacion y registro del centro
            

                        $codigo_sace = strtok($cellValue, '|');//se extrae el codigo del centro
                        $codigo_sace = str_replace(' ', '', $codigo_sace);//se elimina el espacio del codigo
            

                        $nombre_centro=substr($cellValue, strrpos($cellValue, '|' )+1);//se extrae el nombre del centro
                        
                        //el centro que se asigno en la bd
                        $centroDB=new  Centro; 

                        //se busca el centro por el codigo
                        $centro1=Centro::where('codigo_sace',"=",$codigo_sace)->first();//se busca el centro en la bd
                        //echo $centro1;
                        //se compueba que el resultado
                        if(!is_null($centro1) or sizeof($centro1)!= 0){

                            //se busca si el docente esta asignados al centro
                            $resul=DB::table('centro_docente')->where('docente_id',"=",$docente->id)->where('centro_id','=',$centro1->id)->exists();

                            //echo $centro2;
                            //return 'resultado:'.$resul;

                            //se comprueba el resultado
                            if($resul){
                                
                                 //se agrega el entro a la seccion que se esta construyendo   
                                $seccion->centro_id=$centro1->id;
                                
                            }else{
                                //se asigna el centro al docente
                               // $docente->centros()->attach($centro1->id);
                                DB::table('centro_docente')->insert(['docente_id' => $docente->id , 'centro_id' =>$centro1->id]);
                                $seccion->centro_id=$centro1->id;
                            }

                            $centroDB=$centro1;



                        }else{//sino se encuentra se registra el centro

                               
                                $centro=new Centro;

                                $centro->nombre=$nombre_centro;
                                $centro->codigo_sace=$codigo_sace;
                                $centro->direccion="NA";
                                $centro->telefono="NA";

                                $docente->centros()->save($centro);
                                $centroDB=$centro;
                                $seccion->centro_id=$centro->id;
                                
                                
                                

                        }//fin de la validacion y registto del centro 


                        //comienzo de validacion y registro de la modalidad
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A2')->getFormattedValue();
                        

                        $modalidadNombre=substr($cellValue, strrpos($cellValue, ':' )+1);


                        //se quitamos el primer espacio
                        $modalidadNombre=substr($modalidadNombre,1);

                        //se busca la modalidad por el nombre
                        $modalidad1=Modalidad::where('nombre','like',"%".$modalidadNombre."%")->first();


                        //se consigue el alias de la
                        $alias = ''; 
                        foreach (explode(' ', $modalidadNombre) as $word){
                            if( strlen($word)>2)
                             $alias .= strtoupper($word[0]); 
                            
                             
                         }
                         
                            

                        //se comprueba si se encontro la modalidad
                        if(!is_null($modalidad1) or sizeof($modalidad1)!= 0){

                            //se verifica que exista el registro de la modalidad y centro
                            $resultados=DB::table('centros_modalidades')->where('centro_id',"=",$centroDB->id)->where('modalidad_id','=',$modalidad1->id)->exists();

                                if($resultados){
                                    
                                }else{
                                    DB::table('centros_modalidades')->insert(['modalidad_id' => $modalidad1->id , 'centro_id' =>$centroDB->id]);
                                }

                                $seccion->modalidad_id=$modalidad1->id;
                        }else{//sino se encuentra se registra el modalidad

                            $modalidad= new Modalidad;

                            $modalidad->alias=$alias;
                            $modalidad->nombre=$modalidadNombre;
                            $modalidad->observaciones="NA";

                            //$modalidad->save();
                            $centroDB->modalidades()->save($modalidad);
                            $seccion->modalidad_id=$modalidad->id;

                        }


                        //fin de la modalidad


                        //comienzo de la grado y seccion
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A3')->getFormattedValue();
                        

                        $grado = strtok($cellValue, ' ');
                        $seccion->curso=$grado;



                        //se consigue el alias de la
                        $seccion_grupo = ''; 
                        foreach (explode(' ', $cellValue) as $word){
                            if( strlen($word)<=2)
                             $seccion_grupo= $word; 
                            
                             
                         }
                        

                        $seccion->seccion=$seccion_grupo;

                        

                        //fin del grado y seccion

                        //comienzo de la jornada

                        $jornada = $spreadsheet->getActiveSheet()->getCell('A4')->getFormattedValue();
                        $seccion->jornada=$jornada;

                        //fin de la jornada

                        //seccion guardad en la base de datos
                        $seccionGuardada=new Seccion;
                        

                        $secionBD=Seccion::where('modalidad_id','=',$seccion->modalidad_id)->where('curso','=',$seccion->curso)->where('seccion','=',$seccion->seccion)->where('jornada','=',$seccion->jornada)->where('centro_id','=',$seccion->centro_id)->where('periodo_id','=',$periodos[0]->id)->first();

                                //se comprueba si se encontro la modalidad
                            if(!is_null($secionBD) or sizeof($secionBD)!= 0){

                                //$seccion->periodo_id=$periodos[0]->id;
                                $seccionGuardada=$secionBD;
   
                            }else{


                                $secionBD=Seccion::where('modalidad_id','=',$seccion->modalidad_id)->where('curso','=',$seccion->curso)->where('seccion','=',$seccion->seccion)->where('jornada','=',$seccion->jornada)->where('centro_id','=',$seccion->centro_id)->where('periodo_id','=',$periodos[1]->id)->first();

                                if(!is_null($secionBD) or sizeof($secionBD)!= 0){
                                    $seccionGuardada=$secionBD;
                                }else{

                                    $seccion->periodo_id=$periodos[0]->id;
                                    $seccion->save();
                                    $seccionGuardada=$seccion;

                                }
                                


                                   

                            }

                            

                        

                        

                        /*

                        //se comprueba si se encontro la modalidad
                        if(!is_null($secionBD) or sizeof($secionBD)!= 0){

                            $seccionGuardada=$secionBD;

                              
                        }else{//sino se encuentra se registra el modalidad
                            $seccion->save();
                            $seccionGuardada=$seccion;

                        }
                        */


                        //##comienzo de la asignatura######################################################
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A5')->getFormattedValue();

                        $asignatura_nombre=$cellValue;
                       

                        $asignatura_bd=Asignatura::where('nombre','=',$asignatura_nombre)->first();

                        
                        $asignaturaGuardada=new Asignatura;

                        //se comprueba si se encontro la modalidad
                        if(!is_null($asignatura_bd) or sizeof($asignatura_bd)!= 0){
                                //si existe se asigna al docente
                                $asignaturaGuardada=$asignatura_bd;

                        }else{//sino se encuentra se registra el modalidad


                            $asignatura=new Asignatura;

                            $asignatura->alias="NA";
                            $asignatura->nombre=$asignatura_nombre;
                            $asignatura->tipo=1;

                            $asignatura->save();

                            $asignaturaGuardada=$asignatura;

                

                        }


                        
                       //se verifica que exista el registro de la  asignatura y docente
                        $resultados=DB::table('asignaturas_secciones')->where('asignatura_id',"=",$asignaturaGuardada->id)->where('seccion_id','=',$seccionGuardada->id)->exists();
                        

                        //se comprueba si se encontro la registro
                        if($resultados){
                            //si se encontro solo se actualizar el docente que imparte la asignatura
                            DB::table('asignaturas_secciones')->where('asignatura_id',"=",$asignaturaGuardada->id)->where('seccion_id','=',$seccionGuardada->id)->update(['docente_id'=>$docente->id]);

                        }else{
                            //sino se encontro se crea un registro desde cero
                            DB::table('asignaturas_secciones')->insert(['asignatura_id' => $asignaturaGuardada->id , 'seccion_id' => $seccionGuardada->id,'docente_id'=>$docente->id]);

                        }

                        //fin de la clase

                        /* encabezados del la table en el xls
                        echo "<br>";
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A6')->getFormattedValue();
                        echo $cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('B6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('C6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('D6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('E6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('F6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('G6')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('H6')->getFormattedValue();
                        echo " - ".$cellValue;
                        echo "<br>";
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('A7')->getFormattedValue();
                        echo $cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('B7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('C7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('D7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('E7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('F7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('G7')->getFormattedValue();
                        echo " - ".$cellValue;
                        $cellValue = $spreadsheet->getActiveSheet()->getCell('H7')->getFormattedValue();
                        echo " - ".$cellValue;
                        echo "<br>";
                        */

                        //se comienza a volvar los alumnos a la bd
                        $rneXls = $spreadsheet->getActiveSheet()->getCell('B8')->getFormattedValue();
                        $docXls = $spreadsheet->getActiveSheet()->getCell('A8')->getFormattedValue();
                        $i=8;
                        
                        do
                        {
                            $nombreCeldaRne="B".$i;
                            $nombreCeldaNombre="C".$i;
                            

                            $rneXls = $spreadsheet->getActiveSheet()->getCell($nombreCeldaRne)->getFormattedValue();
                            $nombreXls = $spreadsheet->getActiveSheet()->getCell($nombreCeldaNombre)->getFormattedValue();



                            $tokens = explode(' ', trim($nombreXls));
                              /* arreglo donde se guardan las "palabras" del nombre */
                              $names = array();
                              /* palabras de apellidos (y nombres) compuetos */
                              $special_tokens = array('da', 'de', 'del', 'la', 'las', 'los', 'mac', 'mc', 'van', 'von', 'y', 'i', 'san', 'santa');
                              
                              $prev = "";
                              foreach($tokens as $token) {
                                  $_token = strtolower($token);
                                  if(in_array($_token, $special_tokens)) {
                                      $prev .= "$token ";
                                  } else {
                                      $names[] = $prev. $token;
                                      $prev = "";
                                  }
                              }
                              
                              $num_nombres = count($names);
                              $nombres = $apellidos = "";
                              switch ($num_nombres) {
                                  case 0:
                                      $nombres = '';
                                      break;
                                  case 1: 
                                      $nombres = $names[0];
                                      break;
                                  case 2:
                                      $nombres    = $names[0];
                                      $apellidos  = $names[1];
                                      break;
                                  case 3:
                                      $nombres = $names[0] . ' ' . $names[1];
                                        $apellidos = $names[2];
                                  default:
                                       $nombres = $names[0] . ' ' . $names[1];
                                        unset($names[0]);
                                        unset($names[1]);

                                        $apellidos = implode(' ', $names);
                                      break;
                              }
                              
                              $nombres    = mb_convert_case($nombres, MB_CASE_TITLE, 'UTF-8');
                              $apellidos  = mb_convert_case($apellidos, MB_CASE_TITLE, 'UTF-8');
                            
                              $alumno=Alumno::where('rne','=',$rneXls)->first();

                         //se comprueba si se encontro la modalidad
                             if(!is_null($alumno) or sizeof($alumno)!= 0){

                             }else{
                                $alumno=new Alumno;
                                $alumno->rne=$rneXls;
                                $alumno->username=$rneXls;
                                $alumno->nombre=$nombres;
                                $alumno->apellido=$apellidos;
                                $alumno->password=$rneXls;
                                $alumno->genero=1;
                                $alumno->email='NA';
                                $alumno->save();

                             }

                            /*    
                            //se busca una matricula anterior diferente a la del xls
                             $matriculaAnterio=Matricula::where('alumno_id','=',$alumno->id)->where('seccion_id','<>',$seccionGuardada->id)->first();

                            // se verifica si se encontro la matricula
                            if(!is_null($matriculaAnterio) or sizeof($matriculaAnterio)!= 0){
                                $matriculaAnterio->delete();//se elimina la matricula
                                 
                            }*/
                    
                            $resulMatricula=FALSE;

                                //se busca la existencia de una matricula igual a la del xls 
                             $resulMatricula=Matricula::where('alumno_id','=',$alumno->id)->where('seccion_id','=',$seccionGuardada->id)->exists();

                           
                            


                             // se verifica si se encontro la matricula
                             if($resulMatricula){

                                    $matricula=Matricula::where('year','=',$year)->where('alumno_id','=',$alumno->id)->where('seccion_id','=',$seccionGuardada->id)->first();


                             }else{//sino se encontro se realiza la matricula
                                    $matricula=new Matricula;

                                    $matricula->alumno_id=$alumno->id;
                                    $matricula->seccion_id=$seccionGuardada->id;
                                    $matricula->year=$year;
                                    $matricula->save();

                                     
                                }

                            
                             $i++;
                             $nombreCeldaDoc="A".$i;
                             $docXls = $spreadsheet->getActiveSheet()->getCell($nombreCeldaDoc)->getFormattedValue();
                        }while(!stristr($docXls, " "));

                    //rename file xls to seccion_id and asignatura_id
                    $pathOld=$year."/".$this->login_email.'/'.$this->login_email.'_'.$ii.'.xls';

                    $pathNew=$year."/".$this->login_email.'/'.$seccionGuardada->id.'_'.$asignaturaGuardada->id.'.xls';

                    Storage::move($pathOld, $pathNew);


                    $netArchivo=$ii+1;
                        //se verifica la existencia del siguente archivo xls
                    $exists = Storage::disk('local')->exists($year."/".$this->login_email.'/'.$this->login_email.'_'.$netArchivo.'.xls');

                    }//fin del for que recoremos todos los xls


                    }//fin de la validacion de la existencia del primer archivo xls

    }
    //
    public function login_sace(){

    	$this->get_from_login();
    	$this->get_login_sace();

    }

    public function get_from_login(){

    	$ch = curl_init();
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
        curl_setopt($ch, CURLOPT_URL, $this->LOGINURL);
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
        curl_close($ch);


        $hidden1;
        $hidden2;
        preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $content, $hidden1);

        preg_match_all('<input type="hidden" name="next" value="(.*)" />', $content, $hidden2);

        if(!is_null($hidden1[1]) and sizeof($hidden1[1])!= 0)
        {
        	$this->token=$hidden1[1][0];
        	$this->next=$hidden2[1][0];
        }
    }
    public function get_login_sace(){

    		//parametros para el login
    			$postValues = array(
                         'usuario' => $this->login_email,
                            'clave' => $this->login_pass,
                            'csrfmiddlewaretoken'=>$this->token,
                            'next'=>$this->next
                        );

               

    			// se realiza el login del uausio 
                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $this->LOGINURL);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGINURL);
                curl_setopt($ch, CURLOPT_POST, count($postValues));
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

                //echo $output;

		        $hidden1;

                
                $preg_match="#<td style=\"text-align:center; vertical-align:middle;\">\s*DOCENTE\s*</td>\s*<td>\s*\s*<form action=\"/cuentas/usuario/autorizar/acceso\" method=\"post\">\s*<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />\s*<input type=\"hidden\" value=\"(.*)\" name=\"usuario\"/>#siU";

                     //   return $preg_match;

                preg_match_all($preg_match, $output, $hidden1);


                //echo $hidden1[1];
                

                //sino se consiguen el token se porque no se pudo hacer logout hacer validadcion aqui
                //se recoge el token
                $this->token=$hidden1[1][0];

                //se recoge el usuario docente
                $this->user_docente= $hidden1[2][0];


                $postValues = array(
                         'usuario' => $this->user_docente,
                            'csrfmiddlewaretoken'=>$this->token
                            
                        );

                //se selecciona las opciones de docenten el el login
                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $this->AUTORIZARURL);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGINURL);
                curl_setopt($ch, CURLOPT_POST, count($postValues));
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

    }
    public function delete_file(){

        $year=date("Y");

        $pathDirectory=$year."/".$this->login_email;
       


        if(Storage::exists($pathDirectory)) {

                 Storage::deleteDirectory($pathDirectory);

        }


        /*

        $exists = Storage::disk('local')->exists($year."/".$this->login_email.'/'.$this->login_email.'_'.'0'.'.xls');


        
        if($exists){//se verifica el primer archivo
            //recoremos todos los archivos en busqueda de datos
            for($ii=0;$exists;$ii++)
            {
                

                $path=$year."/".$this->login_email.'/'.$this->login_email.'_'.$ii.'.xls';

                Storage::delete($path);


                $netArchivo=$ii+1;
                //se verifica la existencia del siguente archivo xls
                $exists = Storage::disk('local')->exists($year."/".$login_email.'/'.$login_email.'_'.$netArchivo.'.xls');
            }
        }*/

    }
    public function get_from_descarga(){

    }
    public function get_descargar(){

    			
                $year=date("Y");

                //se verifica la existencia del directorios general para los archivos xls
                $exists = Storage::disk('local')->exists($year);

                if(!$exists){
                    //sino existe se crea el directorio 
                    Storage::disk('local')->makeDirectory($year);

                }

                //se verifica la existencia del directorio del docente
                $exists = Storage::disk('local')->exists($year."/".$this->login_email);

                if(!$exists){
                    //sino existe se crea el directorio 
                    Storage::disk('local')->makeDirectory($year."/".$this->login_email);
                    

                }


    			$ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $this->DESCARGAR_URL);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGINURL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

               
                $hidden1;
                $hidden2;
                preg_match_all('#<button type="submit" class="descargar btn btn-info btn-small" data-cs="(.*)"><i class="icon-download-alt icon-white"></i></button>#', $output, $hidden1);

                preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $output, $hidden2);


                
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
                    curl_setopt($ch, CURLOPT_REFERER,$this->LOGINURL);
                    curl_setopt($ch, CURLOPT_POST, count($postValues));
                    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                    //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                    curl_setopt($ch, CURLOPT_COOKIEJAR,$this->cookie_file_path);
                    curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                    curl_setopt($ch,CURLINFO_HEADER_OUT,true);
                    $output = curl_exec($ch);
                    curl_close($ch);
                    Storage::disk('local')->put($year."/".$this->login_email.'/'.$this->login_email.'_'.$x.'.xls', $output);
                }
                return TRUE;

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
                curl_setopt($ch, CURLOPT_REFERER, $this->LOGINURL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $this->cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

    }
}
