<?php

namespace App\Http\Controllers;

use App\ManagerXlsFile;
use Illuminate\Http\Request;
use App\Docente;
use App\Seccion;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Storage;

use Illuminate\Filesystem\Filesystem;

class SaceUserController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {

        /*
        $year='2019';
        $login_email='01051986004177011';

        $pathDirectory=$year."/".$login_email;
        Storage::deleteDirectory($pathDirectory);
        return 'OK';

        $exists = Storage::disk('local')->exists($year."/".$login_email.'/'.$login_email.'_'.'0'.'.xls');
        
        if($exists){//se verifica el primer archivo
            //recoremos todos los archivos en busqueda de datos
            for($ii=0;$exists;$ii++)
            {
                

                $path=$year."/".$login_email.'/'.$login_email.'_'.$ii.'.xls';

                Storage::delete($path);


                $netArchivo=$ii+1;
                //se verifica la existencia del siguente archivo xls
                $exists = Storage::disk('local')->exists($year."/".$login_email.'/'.$login_email.'_'.$netArchivo.'.xls');
            }
        }else{
            return 'No existe el archivo inicial.';
        }*/
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function sicronizar( Request $request){

        //se busca el
        $docente=Docente::find($request->id);


        if(!is_null($docente) or is_object($docente)){


                $resultado=TRUE;
                $cookie_file_path = storage_path('app/public/cookies/'.$docente->user_sace.'.txt');

                //se crea la instacia para interactuar con el SACE
                $sace=new SaceController();


                //se llenan los datos del doncente
                $sace->set_data_user($docente->user_sace,Crypt::decryptString($docente->password_sace),$cookie_file_path);

                //se pide el formulario para el login  y se valida
                if( $sace->get_from_login()) {
                    //se intenta ser login con los datos del doncente
                    if($sace->get_login_sace()) {

                        //se instancia el objto para trabajar con lor archivos XLS
                        $managerXlsFile=new ManagerXlsFile($docente->user_sace);
                        //se eliminan los archivos XLS antenriores
                        $managerXlsFile->delete_file();

                        //se intenta descargar los nuevos archivos xls del sace
                        $resultado = $sace->get_descargar();

                        $sace->logout();

                        //se valida que se pudo descargar los archivos del sace
                        if ($resultado) {

                            //se vuelcan los datos del los archivos Xls a la  Base de datos
                            $managerXlsFile->setDBLocalFromXls();

                            $secciones = Seccion::join("asignaturas_secciones", "seccions.id", "=", "asignaturas_secciones.seccion_id")
                                ->join("matriculas","seccions.id","=","matriculas.seccion_id")
                                ->select("seccions.id", "seccions.modalidad_id", "seccions.curso", "seccions.seccion", "centro_id", "periodo_id", "seccions.jornada", "seccions.created_at", "seccions.updated_at")
                                ->where('asignaturas_secciones.docente_id', '=', $docente->id)
                                ->where('matriculas.year', '=',date("Y"))
                                ->groupBy("seccions.id")
                                ->get();

                            if (!is_null($secciones) and is_object($secciones)) {

                                //$asistecnias->asistencias;
                                //$alumnos[1]->asistencias;
                                foreach ($secciones as $seccion) {
                                    # code...
                                    $seccion->modalidad;
                                    $seccion->periodo;
                                    $seccion->centro;
                                }
                                //$secciones


                                // $json_asistencias=json_decode($secciones, true);
                                //se envia el json al navegador
                                return response()->json($secciones);

                            }
                        }else{
                            return response()->json( ['Error'=>"500", 'msg'=>'NO SE ENCONTRARON SECCIONES' ], 500 );
                        }
                    }else{
                        return response()->json( ['Error'=>"500", 'msg'=>'EL USUARIO O CONTRASENA DEL SACE NO VALIDO' ], 500 );
                    }
                }else{
                    return response()->json( ['Error'=>"500", 'msg'=>'El SACE NO RESPONDE' ], 500 );
                }

              }else{
                  return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun el docente' ], 500 );
              }
    }
}
