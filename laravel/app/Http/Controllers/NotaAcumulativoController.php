<?php

namespace App\Http\Controllers;

use Maatwebsite\Excel\Facades\Excel;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\Request;
use App\Notaacumulativo;
use Illuminate\Support\Facades\Storage;
use PhpOffice\PhpSpreadsheet\Spreadsheet;
use PhpOffice\PhpSpreadsheet\Writer\Xlsx;
use PhpOffice\PhpSpreadsheet\IOFactory;
//use App\Excel;
use Illuminate\Support\Facades\Validator;
use App\Centro;
use App\Docente;
use App\Modalidad;
use App\Asignatura;
use App\Seccion;
use App\Alumno;
use App\Matricula;
use Illuminate\Support\Facades\Crypt;

class NotaAcumulativoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {



            $docente=Docente::where('user_sace',"=","01051986004177011")->first();







            //return  ;

       
                

                
        

                //$login_email = '12011952001270670';
                //$login_pass = 'osojchpj';

                //$login_email = urldecode('12011952001270670');
                //$login_pass = urldecode('osojchpj');

                //$login_email = urldecode('01051986004177011');
                //$login_pass = urldecode('jdmm13061986?');

                //$login_email = urldecode('01051986004177011');
                //$login_pass = urldecode('jdmm13061986?');

                //$login_email = urldecode('01051970002994023');
                //$login_pass = urldecode('dialisydavid');
                //$cookie_file_path =  dirname(__FILE__) . '/'.$login_email.'.txt';

            if(!is_null($docente) or sizeof($docente) != 0){

              

                $cookie_file_path = storage_path('app/public/cookies/'.$docente->user_sace.'.txt');

                //echo $cookie_file_path;
                $sace=new SaceController();

                $sace->set_data_user($docente->user_sace,Crypt::decryptString($docente->password_sace),$cookie_file_path);
                //$sace->login_sace();
                //$sace->get_descargar();
                //$sace->logout();
                $sace->setDataInDB();

                return response()->json( ['Exito'=>true, 'msg'=>'se descargo los archivos con exito' ], 200 );
              }else{
                  return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun el docente' ], 204 );
              }

                





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
        $notaAcumulativo=new Notaacumulativo;

        $notaAcumulativo->alumno_id=$request->alumno_id;
        $notaAcumulativo->acumulativo_id=$request->acumulativo_id;
        $notaAcumulativo->nota=$request->nota;

        $notaAcumulativo->save();

        $notaAcumulativo->id;

        $json=json_decode($notaAcumulativo, true);

        return response()->json($json);

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
        $notaAcumulativo=Notaacumulativo::find($id);
       

        //return response()->json($notaAcumulativo);

        if(!is_null($notaAcumulativo) or sizeof($notaAcumulativo)!= 0){
            $notaAcumulativo->alumno;
            $notaAcumulativo->acumulativo;
            return response()->json($notaAcumulativo);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ninguna nota' ], 204 );
        }
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

    

        $notaAcumulativo=Notaacumulativo::find($id);

        if(!is_null($notaAcumulativo) or sizeof($notaAcumulativo)!= 0){

            $notaAcumulativo->alumno_id=$request->alumno_id;
            $notaAcumulativo->acumulativo_id=$request->acumulativo_id;
            $notaAcumulativo->nota=$request->nota;

            $notaAcumulativo->save();

            $json=json_decode($notaAcumulativo, true);

            return response()->json($notaAcumulativo);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro la nota' ], 204 );
        }

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
         $notaAcumulativo=Notaacumulativo::find($id);

        if(!is_null($notaAcumulativo) or sizeof($notaAcumulativo)!= 0){
            $notaAcumulativo->delete();
            return response()->json( ['success'=>true, 'msg'=>'Se elimino la nota' ], 200);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro la nota' ], 204 );
        }
    }



    public function actualizar(Request $request){

    

        //validar si existe el json para poder porcesarlo
        $validator = \Validator::make($request->all(), ['notas_acumulativos' => 'required']);

        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{




                $notas=$request->input('notas_acumulativos');

            //    if(!is_null($notasnotas) or sizeof($notas)!= 0){

                        //saco el numero de notas
                        $longitud_array = count($notas);

                        $nota;

                        //Recorro todos los elementos y los actualizo
                        for($i=0; $i<$longitud_array; $i++){

                            $nota=Notaacumulativo::find($notas[$i]['id']);

                            $nota->alumno_id=$notas[$i]['alumno_id'];
                            $nota->acumulativo_id=$notas[$i]['acumulativo_id'];
                            $nota->nota=$notas[$i]['nota'];

                            $nota->save();


                        }

                        $json=json_decode($nota, true);

                        return response()->json($json);
            //    }else{
              //              return response()->json( ['error'=>true, 'msg'=>'Se enviaron notas vacias' ], 204 );
               // }

    }

    }


//public function buscar_asignatura()
public function buscar_asignatura(Request $request)
    {
       
/* $notaAcumulativos=DB::table('notaacumulativos')
            ->join('acumulativos', 'notaacumulativos.acumulativo_id', '=', 'acumulativos.id')->where('notaacumulativos.alumno_id','=',$request->alumno_id)->where('acumulativos.seccion_id','=',$request->seccion_id)->where('acumulativos.asignatura_id','=',$request->asignatura_id)->where('acumulativos.parcial','=',$request->parcial)->get();*/


       $notaAcumulativos=Notaacumulativo::where('alumno_id','=',$request->alumno_id)
       ->where('asignatura_id','=',$request->asignatura_id)
        ->where('parcial','=',$request->parcial)
         ->where('seccion_id','=',$request->seccion_id)
       ->join('acumulativos',function($query) use ($request){
            $query->on('notaacumulativos.acumulativo_id','=','acumulativos.id');

        })
       ->select('notaacumulativos.id','notaacumulativos.alumno_id','notaacumulativos.acumulativo_id','notaacumulativos.nota','notaacumulativos.created_at','notaacumulativos.updated_at')
       ->get();

       

        // return response()->json($notaAcumulativos);
/*
         $notaAcumulativos=Notaacumulativo::where('alumno_id','=',$request->alumno_id)->with(['acumulativo'=>function($query) use ($request){
            $query->where('asignatura_id','=',$request->asignatura_id);

            $query->where('parcial','=',$request->parcial);

             $query->where('seccion_id','=',$request->seccion_id);
             //$query->where('alumno_id','=',$request->alumno_id);

        }])->get();*/

    

        if(!is_null($notaAcumulativos) or sizeof($notaAcumulativos)!= 0){

            foreach ($notaAcumulativos as $notaAcumulativo ) {
                # code...
                $notaAcumulativo->alumno;
            }
            foreach ($notaAcumulativos as $notaAcumulativo) {
                # code...

                $notaAcumulativo->acumulativo;
                /* if(!is_null($acumulativo) or sizeof($acumulativo)!= 0){
                    $notaAcumulativo->acumulativo;
                }else{
                 return response()->json( ['error'=>true, 'msg'=>'No se encontro ninguna nota' ], 204 );
                }*/
            }
            
           
            return response()->json($notaAcumulativos);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ninguna nota' ], 422 );
        }

    }
}
