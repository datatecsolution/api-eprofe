<?php


namespace App;
use App\Alumno;
use App\Asignatura;
use App\Docente;
use App\Matricula;
use App\Modalidad;
use App\Seccion;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Centro;
use App\Periodo;


class ManagerXlsFile
{

    private static $cellCentroAndCodigo ='A1';
    private static $cellModalidad ='A2';
    private static $cellGradoAndSeccion ='A3';
    private static $cellJornada ='A4';
    private static $cellAsignatura ='A5';
    private static $columnAlumnosRNE ='B';
    private static $columnAlumnosNombre ='C';
    private static $romDataStart=8;
    private $docente;
    private $seccion;
    private $centro;
    private $periodos;
    private $asignatura;
    private $celllAlumnoNombre;
    private $celllAlumnoRNE;

    private $path;
    private $numFileXls=0;
    private $reader;
    private $spreadsheet;
    private $year;


    public function __construct($docenteUserSace)
    {
        if(!is_null($docenteUserSace)){
            $this->seccion=new Seccion;
            $this->centro=new Centro;
            $this->asignatura=new Asignatura();
            $this->docente=Docente::where('user_sace',"=",$docenteUserSace)->first();
            $this->periodos=Periodo::where("estado","=","1")->get();
            $this->year=date("Y");
        }


    }

    public function setDBLocalFromXls(){

        //control de errores al cargar los archivos
        $numErrorFile=0;

        //se estable el inicio de los archivos en 0 y se actualiza el path del archivo
        $this->setPath();
        //se verifica la existencia de por lo menos un archivo xls
        $exists = Storage::disk('local')->exists($this->year."/".$this->docente->user_sace.'/'.$this->docente->user_sace.'_'.$this->numFileXls.'.xls');

        if($exists){

            //se eliminan las relaciones que tenia el docente con las secciones y asignaturas anteriores
            DB::delete("delete a from asignaturas_secciones a JOIN seccions b ON a.seccion_id=b.id  join periodos c on b.periodo_id=c.id where c.estado=1 and a.docente_id=".$this->docente->id);

           // $postion=$this->numFileXls;
            while($exists){
                if($this->loadFileXsl()){
                    $this->setCentro();
                    $this->setModalidad();
                    $this->setGradoJornada();
                    $this->setSeccion();
                    $this->setAsignatura();
                    $this->setAlumnos();

                    //rename file xls to seccion_id and asignatura_id
                    $pathOld=$this->year."/".$this->docente->user_sace.'/'.$this->docente->user_sace.'_'.$this->numFileXls.'.xls';
                    $pathNew=$this->year."/".$this->docente->user_sace.'/'.$this->seccion->id.'_'.$this->asignatura->id.'.xls';

                    Storage::move($pathOld, $pathNew);

                }else{
                    $this->numFileXls=$this->numFileXls+1;
                }


                //se pasa a la posicion del siguiente archivo
                $this->numFileXls=$this->numFileXls+1;

                //se actualiza el path para el nuevo archivo
                $this->setPath();

                //se verifica la existencia del siguente archivo xls
                $exists = Storage::disk('local')->exists($this->year."/".$this->docente->user_sace.'/'.$this->docente->user_sace.'_'.$this->numFileXls.'.xls');


            }

            //comprobacion que todos los archivos guardados fueron procesados
            if($this->numFileXls==$numErrorFile){
                return false;
            }else{
                return true;
            }

        }else{
            return false;
        }

    }


    private function loadFileXsl(){
        try {

            /**  Create a new Reader of the type defined in $inputFileType  **/
            $this->reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader('Xls');
            /**  Advise the Reader that we only want to load cell data  **/
            $this->reader->setReadDataOnly(true);

            /**  Load $inputFileName to a Spreadsheet Object  **/
            $this->spreadsheet = $this->reader->load($this->path);
            return true;

        } catch(\PhpOffice\PhpSpreadsheet\Reader\Exception $e) {
            //die('Error loading file: '.$e->getMessage());
            return false;
        }
}
    private function setCentro(){

        //se procesa el centro
        $cellValue = $this->spreadsheet->getActiveSheet()->getCell(self::$cellCentroAndCodigo)->getFormattedValue();

        //Se realiza la validacion y registro del centro

        //se extrae el codigo del centro
        $codigo_sace = strtok($cellValue, '|');
        //se elimina el espacio del codigo
        $codigo_sace = str_replace(' ', '', $codigo_sace);

        //se extrae el nombre del centro
        $nombre_centro=substr($cellValue, strrpos($cellValue, '|' )+1);//se extrae el nombre del centro


        //se busca el centro por el codigo
        $centroBusqueda=Centro::where('codigo_sace',"=",$codigo_sace)->first();//se busca el centro en la bd

        //se compueba que el resultado que el objeto no sea nullo o que no sea un objeto
        if(is_null($centroBusqueda) or !is_object($centroBusqueda)){

            //sino se encuentra se registra el centro

            $centro=new Centro;

            $centro->nombre=$nombre_centro;
            $centro->codigo_sace=$codigo_sace;
            $centro->direccion="NA";
            $centro->telefono="NA";

            //se guarda el centro atraves del docente para que se guarde tambien la relacion
            $this->docente->centros()->save($centro);

            $this->centro=$centro;

            //se registra el id del centro a la seccion de la clase
            $this->seccion->centro_id=$centro->id;



        }else{

            //se busca si el docente esta asignados al centro
            $resul=DB::table('centro_docente')->where('docente_id',"=",$this->docente->id)
                                            ->where('centro_id','=',$centroBusqueda->id)->exists();

            //se comprueba el resultado
            if($resul){
                //se guarda el centro atraves del docente para que se guarde tambien la relacion
                $this->seccion->centro_id=$centroBusqueda->id;

            }else{
                //se asigna el centro al docente
                DB::table('centro_docente')->insert(['docente_id' => $this->docente->id , 'centro_id' =>$centroBusqueda->id]);
                //se guarda el centro atraves del docente para que se guarde tambien la relacion
                $this->seccion->centro_id=$centroBusqueda->id;
            }

            $this->centro=$centroBusqueda;


        }//fin de la validacion y registto del centro

    }
    private function setModalidad(){
        //comienzo de validacion y registro de la modalidad
        $cellValue = $this->spreadsheet->getActiveSheet()->getCell(self::$cellModalidad)->getFormattedValue();


        $modalidadNombre=substr($cellValue, strrpos($cellValue, ':' )+1);

        //se quitamos el primer espacio
        $modalidadNombre=substr($modalidadNombre,1);


        //se forma el alias de la modalidad
        $alias = '';
        foreach (explode(' ', $modalidadNombre) as $word){
            if( strlen($word)>2)
                $alias .= strtoupper($word[0]);


        }

        //se busca la modalidad por el nombre
        $modalidad1=Modalidad::where('nombre','like',"%".$modalidadNombre."%")->first();

        //se comprueba si se encontro la modalidad
        if(is_null($modalidad1) or !is_object($modalidad1)){
            //sino se encuentra se registra el modalidad
            $modalidad= new Modalidad;

            $modalidad->alias=$alias;
            $modalidad->nombre=$modalidadNombre;
            $modalidad->observaciones="NA";
            //se registra la modalidad atraves del centro para que se registre la relacion
            $this->centro->modalidades()->save($modalidad);
            //se asigna la modalida asignada a la seccion de la clase
            $this->seccion->modalidad_id=$modalidad->id;

        }else{

            //se verifica que exista la relacion del la modalidad y el centro
            $resultados=DB::table('centros_modalidades')->where('centro_id',"=",$this->centro->id)
                                                        ->where('modalidad_id','=',$modalidad1->id)->exists();
            //si es falso
            if(!$resultados){
                //se registra la relacion entre modalidad y centro
                DB::table('centros_modalidades')->insert(['modalidad_id' => $modalidad1->id , 'centro_id' =>$this->centro->id]);
            }
            //se registra la modalida a la seccion de la clase
            $this->seccion->modalidad_id=$modalidad1->id;
        }
        //fin de la modalidad

    }
    private function setGradoJornada(){

        //comienzo de la grado y seccion
        $cellValue = $this->spreadsheet->getActiveSheet()->getCell(self::$cellGradoAndSeccion)->getFormattedValue();

        //se extrae el grado del Xls
        $grado = strtok($cellValue, ' ');

        //se asigna el grado a la seccion de la clase
        $this->seccion->curso=$grado;

        //se extre el grupo del Xls
        $grupo = '';
        foreach (explode(' ', $cellValue) as $word){
            if( strlen($word)<=2)
                $grupo= $word;


        }
        //se asigna el grado a la seccion de la clase
        $this->seccion->seccion=$grupo;

        //comienzo de la jornada
        $jornada = $this->spreadsheet->getActiveSheet()->getCell(self::$cellJornada)->getFormattedValue();
        $this->seccion->jornada=$jornada;

        //fin del grado y seccion



    }
    private function setSeccion(){

        //seccion guardad en la base de datos
        $seccionGuardada=new Seccion;

        //se busca la seccion con los datos recogidos del XLS para el posible periodo 1{puede existir 2 periodos activos}
        $secionBD=Seccion::where('modalidad_id','=',$this->seccion->modalidad_id)
            ->where('curso','=',$this->seccion->curso)
            ->where('seccion','=',$this->seccion->seccion)
            ->where('jornada','=',$this->seccion->jornada)
            ->where('centro_id','=',$this->seccion->centro_id)
            ->where('periodo_id','=',$this->periodos[0]->id)->first();

        //se comprueba si se encontro la seccion
        if(!is_null($secionBD) or is_object($secionBD)){
            //se ser verdadro se asigna la seccion de la busqueda 1 a la seccion de la clase
            $this->seccion=$secionBD;

        }else{//si la busqueda no encontro la seccion

            //se busca la seccion con los datos recogidos del XLS para el posible periodo 2{puede existir 2 periodos activos}
            $secionBD=Seccion::where('modalidad_id','=',$this->seccion->modalidad_id)
                ->where('curso','=',$this->seccion->curso)
                ->where('seccion','=',$this->seccion->seccion)
                ->where('jornada','=',$this->seccion->jornada)
                ->where('centro_id','=',$this->seccion->centro_id)
                ->where('periodo_id','=',$this->periodos[1]->id)->first();
            //se verifica que la busqueda devolvio algo
            if(!is_null($secionBD) or is_object($secionBD)){
                //se ser verdadro se asigna la seccion de la busqueda 2 a la seccion de la clase
                $this->seccion=$secionBD;
            }else{
                //de no ser asi se crea una nueva seccion
                $this->seccion->periodo_id=$this->periodos[0]->id;
                $this->seccion->save();
                //$se=$this->seccion;

            }





        }
    }
    private function setAsignatura(){

        //se extrae el nombre de la asignatura del Xls
        $cellValue = $this->spreadsheet->getActiveSheet()->getCell(self::$cellAsignatura)->getFormattedValue();

        $asignatura_nombre=$cellValue;

        //se busca por nombre del asignatura
        $asignaturaBusqueda=Asignatura::where('nombre','=',$asignatura_nombre)->first();


        //se comprueba si se encontro la modalidad
        if(!is_null($asignaturaBusqueda) or is_object($asignaturaBusqueda)){
            //si existe se asigna al docente
            $this->asignatura=$asignaturaBusqueda;

        }else{//sino se encuentra se registra el modalidad


            $asignatura=new Asignatura;

            $asignatura->alias="NA";
            $asignatura->nombre=$asignatura_nombre;
            $asignatura->tipo=1;

            $asignatura->save();

            $this->asignatura=$asignatura;


        }


        //se verifica que exista la relacion entre  asignatura y seccion
        $resultados=DB::table('asignaturas_secciones')->where('asignatura_id',"=",$this->asignatura->id)
                                                        ->where('seccion_id','=',$this->seccion->id)->exists();


        //se comprueba si se encontro la registro
        if($resultados){
            //si se encontro solo se actualizar el docente que imparte la asignatura
            DB::table('asignaturas_secciones')->where('asignatura_id',"=",$this->asignatura->id)
                                                ->where('seccion_id','=',$this->seccion->id)->update(['docente_id'=>$this->docente->id]);

        }else{
            //sino se encontro la relacion se crea
            DB::table('asignaturas_secciones')->insert(['asignatura_id' => $this->asignatura->id , 'seccion_id' => $this->seccion->id,'docente_id'=>$this->docente->id]);

        }

        //fin de la asignatura

    }
    private function setAlumnos(){

        $position=self::$romDataStart;

        do
        {
            //se crea el nombre de la celdas del RNE y ALUMNO dependiendo del la columnas y filas
            $this->celllAlumnoRNE=self::$columnAlumnosRNE.$position;
            $this->celllAlumnoNombre=self::$columnAlumnosNombre.$position;

            $rneXls = $this->spreadsheet->getActiveSheet()->getCell($this->celllAlumnoRNE)->getFormattedValue();
            $nombreXls = $this->spreadsheet->getActiveSheet()->getCell($this->celllAlumnoNombre)->getFormattedValue();



            $tokens = explode(' ', trim($nombreXls));
            /* arreglo donde se guardan las "palabras" del nombre */
            $names = array();
            /* palabras de apellidos (y nombres) compuetos */
            $special_tokens = array('da', 'de', 'del', 'la', 'las', 'los', 'mac', 'mc', 'van', 'von', 'y', 'position', 'san', 'santa');

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



            //se comprueba si se encontro al alumno
            if(is_null($alumno) and !is_object($alumno)){
                    $alumnoNew=new Alumno;
                    $alumnoNew->rne=$rneXls;
                    $alumnoNew->username=$rneXls;
                    $alumnoNew->nombre=$nombres;
                    $alumnoNew->apellido=$apellidos;
                    $alumnoNew->password=$rneXls;
                    $alumnoNew->genero=1;
                    $alumnoNew->email='NA';
                    $alumnoNew->save();
                    $this->setMatricula($alumnoNew);

            }else{
                $this->setMatricula($alumno);
            }




            $position++;
            $nombreCeldaDoc="A".$position;
            $docXls = $this->spreadsheet->getActiveSheet()->getCell($nombreCeldaDoc)->getFormattedValue();
        }while(!stristr($docXls, " "));

    }
    private function setMatricula($alumno){

        //se busca una matricula anterior diferente a la del xls
        $matriculaAnterio=Matricula::where('alumno_id','=',$alumno->id)
            ->where('year','=',$this->year)
            ->where('seccion_id','<>',$this->seccion->id)->first();

        // se verifica si se encontro la matricula
        if(!is_null($matriculaAnterio) or is_object($matriculaAnterio)){
            //si se encontro una matricula se elimina
            $matriculaAnterio->delete();//se elimina la matricula
        }

        $resulMatricula=FALSE;

        //se busca la existencia de una matricula igual a la del xls
        $resulMatricula=Matricula::where('alumno_id','=',$alumno->id)
                                    ->where('year','=',$this->year)
                                    ->where('seccion_id','=',$this->seccion->id)->exists();

        // se verifica si se encontro la matricula
        if(!$resulMatricula){
            //sino se encontro se realiza la matricula
            $matricula=new Matricula;

            $matricula->alumno_id=$alumno->id;
            $matricula->seccion_id=$this->seccion->id;
            $matricula->year=$this->year;
            $matricula->save();


        }
    }

    public function delete_file(){

        $pathDirectory=$this->year."/".$this->docente->user_sace;



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

    /**
     * @return path file
     */
    public function getPath()
    {
        return $this->path;
    }

    /**
     * @param file $path
     */
    public function setPath(): void
    {
        //$year=date("Y");
        $this->path = 'app/'.$this->year."/".$this->docente->user_sace.'/'.$this->docente->user_sace.'_'.$this->numFileXls.'.xls';
        $this->path = storage_path($this->path);
    }



    /*
  public function setDataInDB(){


              $periodos=Periodo::where("estado","=","1")->get();
              $year=date("Y");
              $inputFileType = 'Xls';


              //se verifica la existencia de por lo menos un archivo xls
              $exists = Storage::disk('local')->exists($year."/".$this->user_sace.'/'.$this->user_sace.'_'.'1'.'.xls');



              if($exists){//se verifica el primer archivo

                  $docente=Docente::where('user_sace',"=",$this->user_sace)->first();

                  //se eliminan las relaciones que tenia el docente con las secciones y asignaturas anteriores
                  DB::delete("delete a from asignaturas_secciones a JOIN seccions b ON a.seccion_id=b.id  join periodos c on b.periodo_id=c.id where c.estado=1 and a.docente_id=".$docente->id);

                  $ii=1;
                  //recoremos todos los archivos en busqueda de datos
                  while($exists)
                  {



                      $path='app/'.$year."/".$this->user_sace.'/'.$this->user_sace.'_'.$ii.'.xls';



                      $path = storage_path($path);



                      $seccion=new Seccion;

                      //$seccion->periodo_id=$periodo->id;

                      ///  Create a new Reader of the type defined in $inputFileType  /
                      $reader = \PhpOffice\PhpSpreadsheet\IOFactory::createReader($inputFileType);
                      //  Advise the Reader that we only want to load cell data  /
                      $reader->setReadDataOnly(true);

                      //  Load $inputFileName to a Spreadsheet Object  /
                      $spreadsheet = $reader->load($path);
                      //$sheet=IOFactory::load($path);







                      //se procesa el centro
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

                               //se agrega el centro a la seccion que se esta construyendo
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

                      //fin de la asignatura

                     // $spreadsheet->getActiveSheet()->getCell('H7')->setValue("hre");

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
                            // arreglo donde se guardan las "palabras" del nombre /
                            $names = array();
                            // palabras de apellidos (y nombres) compuetos /
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



                          //se comprueba si se encontro al alumno
                           if(is_null($alumno)){
                               if(!is_object($alumno)){

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

                           }


                          $resulMatricula=FALSE;

                          //se busca la existencia de una matricula igual a la del xls
                           $resulMatricula=Matricula::where('alumno_id','=',$alumno->id)->where('seccion_id','=',$seccionGuardada->id)->exists();

                           // se verifica si se encontro la matricula
                           if($resulMatricula){
                                  $matricula=Matricula::where('year','=',$year)->where('alumno_id','=',$alumno->id)->where('seccion_id','=',$seccionGuardada->id)->first();

                           }else{
                               //sino se encontro se realiza la matricula
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
                  $pathOld=$year."/".$this->user_sace.'/'.$this->user_sace.'_'.$ii.'.xls';
                  $pathNew=$year."/".$this->user_sace.'/'.$seccionGuardada->id.'_'.$asignaturaGuardada->id.'.xls';
                  Storage::move($pathOld, $pathNew);

                  $ii=$ii+1;


                  //$netArchivo=$ii+1;

                  //se verifica la existencia del siguente archivo xls
                  $exists = Storage::disk('local')->exists($year."/".$this->user_sace.'/'.$this->user_sace.'_'.$ii.'.xls');
                  //echo "existencia final".$exists;

                  }//fin del for que recoremos todos los xls


                  }//fin de la validacion de la existencia del primer archivo xls

  }*/


}