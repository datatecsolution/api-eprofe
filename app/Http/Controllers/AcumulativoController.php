<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Acumulativo;
use App\Notaacumulativo;

class AcumulativoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $acumulativos=Acumulativo::orderByDesc('id')->get();

        // se verifica la existencia del alumno
        if(!is_null($acumulativos) and sizeof($acumulativos)!= 0){

                foreach($acumulativos as $acumulativo){
                    $acumulativo->tipoAcumulativo;
                    $acumulativo->asignatura;
                    $acumulativo->seccion->modalidad;
                    $acumulativo->notasAcumulativos;

                    foreach ($acumulativo->notasAcumulativos as $notasAcumulativo) {
                        # code...
                        $notasAcumulativo->alumno;
                    }
                }


            //se envia el json al navegador
            return response()->json($acumulativos);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun acumulativo' ], 422 );
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
        /*
        if ($request->isJson()) {
            $data = $request->json()->all();
        }
        return response()->json($data);

        $tipoAcumulativo=$data->tipo_acumulativo;
        $data=json_decode($tipoAcumulativo);
        return response()->json($data);
        $seccion=$request->Seccion;
        $asignatura=$request->Asignatura;*/

        $acumu=new Acumulativo;

        


        $acumu->seccion_id=$request->seccion_id;
        $acumu->descripcion=$request->descripcion;
        $acumu->tipo_acumulativo_id=$request->tipo_acumulativo_id;
        $acumu->fecha=$request->fecha;
        $acumu->parcial=$request->parcial;
        $acumu->valor=$request->valor;
        $acumu->asignatura_id=$request->asignatura_id;

        //$data=json_decode($acumu);
        //return response()->json($data);

        


        $acumu->save();


        $acumu->id;

        //$data=json_decode($acumu);
        //return response()->json($data);

        //get notas del request
        $notas=$request->notas_acumulativos;

        //saco el numero de notas
        $longitud_array = count($notas);

        //Recorro todos los elementos y los actualizo
        for($i=0; $i<$longitud_array; $i++){
            // $notaAcumulativo=new Notaacumulativo;
            $nota=new Notaacumulativo;

           $nota->alumno_id=$notas[$i]['alumno_id'];
            $nota->acumulativo_id=$acumu->id;
            $nota->nota=$notas[$i]['nota'];

            $nota->save();
        }



        $json=json_decode($acumu, true);

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
        $acumulativo=Acumulativo::find($id);

        // se verifica la existencia del alumno
        if(!is_null($acumulativo) and sizeof($acumulativo)!= 0){

               
                    $acumulativo->tipoAcumulativo;
                    $acumulativo->asignatura;
                    $acumulativo->seccion->modalidad;
                    $acumulativo->notasAcumulativos;

                    foreach ($acumulativo->notasAcumulativos as $notasAcumulativo) {
                        # code...
                        $notasAcumulativo->alumno;
                    }
            


            //se envia el json al navegador
            return response()->json($acumulativo);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun aculativo' ], 204 );
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
       

        //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['notas_acumulativos' => 'required',
                                                          'tipo_acumulativo' => 'required',
                                                          'descripcion' => 'required',
                                                          'parcial' => 'required',
                                                          'valor' => 'required'   ]);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{

                 $acumulativo=Acumulativo::find($id);



                  if(!is_null($acumulativo) or sizeof($acumulativo)!= 0){

                      $tipoAcumulativo=$request->tipo_acumulativo;


                      //$acumulativo->seccion_id=$request->seccion_id;
                      $acumulativo->descripcion=$request->input('descripcion');
                      //$tipoAcumulativo=$request->input('TipoAcumulativo')
                      $acumulativo->tipo_acumulativo_id=$tipoAcumulativo['id'];
                      //$acumulativo->fecha=$request->fecha;
                      $acumulativo->parcial=$request->input('parcial');
                      $acumulativo->valor=$request->input('valor');
                      //$acumulativo->asignatura_id=$request->asignatura_id;

                      //get notas del request
                      $notas=$request->input('notas_acumulativos');

                      //saco el numero de notas
                      $longitud_array = count($notas);

                      //Recorro todos los elementos y los actualizo
                      for($i=0; $i<$longitud_array; $i++){

                          $nota=Notaacumulativo::find($notas[$i]['id']);

                          $nota->alumno_id=$notas[$i]['alumno_id'];
                          $nota->acumulativo_id=$notas[$i]['acumulativo_id'];
                          $nota->nota=$notas[$i]['nota'];

                          $nota->save();


                      }

                      $acumulativo->save();

                      $json=json_decode($acumulativo, true);

                      return response()->json($json);
                  }else{
                        return response()->json( ['error'=>true, 'msg'=>'No se encontro el acumulativo' ], 422 );
                  }
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
        $acumulativo=Acumulativo::find($id);

        if(!is_null($acumulativo) or sizeof($acumulativo)!= 0){
            $acumulativo->delete();
            return response()->json( ['success'=>true, 'msg'=>'Se elimino el acumualtivo' ], 200);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro el acumulativo' ], 422 );
        }
        
    }


    public function docente(Request $request){

      //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['docente_id' => 'required' ]);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{


              $acumulativos=Acumulativo::join("asignaturas_secciones","acumulativos.asignatura_id","=","asignaturas_secciones.asignatura_id")
              ->join("asignaturas", function($join){
                $join->on("asignaturas.id","=","acumulativos.asignatura_id")
                ->on("asignaturas_secciones.seccion_id","=","acumulativos.seccion_id");
              })

              ->where('asignaturas_secciones.docente_id','=',$request->docente_id)

              ->select("acumulativos.id","acumulativos.movil_id","acumulativos.seccion_id","acumulativos.descripcion","acumulativos.tipo_acumulativo_id","acumulativos.fecha","acumulativos.parcial","acumulativos.valor","acumulativos.asignatura_id","acumulativos.created_at","acumulativos.updated_at")

              ->orderByDesc('acumulativos.id')->get();

              // se verifica la existencia del alumno
              if(!is_null($acumulativos) and sizeof($acumulativos)!= 0){

                      foreach($acumulativos as $acumulativo){
                          $acumulativo->tipoAcumulativo;
                          $acumulativo->asignatura;
                          $acumulativo->seccion->modalidad;
                          $acumulativo->notasAcumulativos;

                          foreach ($acumulativo->notasAcumulativos as $notasAcumulativo) {
                              # code...
                              $notasAcumulativo->alumno;
                          }
                      }


                  //se envia el json al navegador
                  return response()->json($acumulativos);

              }else{
                     return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun acumulativo' ], 422 );
              }


        }

    }


    public function docente_seccion(Request $request){

      //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['docente_id' => 'required' ,'seccion_id' => 'required' ]);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{


              $acumulativos=Acumulativo::join("asignaturas_secciones","acumulativos.asignatura_id","=","asignaturas_secciones.asignatura_id")
              ->join("asignaturas", function($join){
                $join->on("asignaturas.id","=","acumulativos.asignatura_id")
                ->on("asignaturas_secciones.seccion_id","=","acumulativos.seccion_id");
              })

               ->where('asignaturas_secciones.docente_id','=',$request->docente_id)
              ->where('asignaturas_secciones.seccion_id','=',$request->seccion_id)

              ->select("acumulativos.id","acumulativos.seccion_id","acumulativos.descripcion","acumulativos.tipo_acumulativo_id","acumulativos.fecha","acumulativos.parcial","acumulativos.valor","acumulativos.asignatura_id","acumulativos.created_at","acumulativos.updated_at")

              ->orderByDesc('acumulativos.id')->get();

              // se verifica la existencia del alumno
              if(!is_null($acumulativos) and sizeof($acumulativos)!= 0){

                      foreach($acumulativos as $acumulativo){
                          $acumulativo->tipoAcumulativo;
                          $acumulativo->asignatura;
                          $acumulativo->seccion->modalidad;
                          $acumulativo->notasAcumulativos;

                         /* foreach ($acumulativo->notasAcumulativos as $notasAcumulativo) {
                              # code...
                              $notasAcumulativo->alumno;
                          }*/
                      }


                  //se envia el json al navegador
                  return response()->json($acumulativos);

              }else{
                     return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun acumulativo' ], 422 );
              }


        }

    }

    public function seccion_parcial(Request $request){

      //se valida que todos los datos del acumulativo esten presentes
         $validator = \Validator::make($request->all(), ['docente_id' => 'required' ,'seccion_id' => 'required','parcial' => 'required' ,'asignatura_id' => 'required']);


         //se realiza la comprobacion
        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{


              $acumulativos=Acumulativo::join("asignaturas_secciones","acumulativos.asignatura_id","=","asignaturas_secciones.asignatura_id")
              ->join("asignaturas", function($join){
                $join->on("asignaturas.id","=","acumulativos.asignatura_id")
                ->on("asignaturas_secciones.seccion_id","=","acumulativos.seccion_id");
              })

              ->where('asignaturas_secciones.docente_id','=',$request->docente_id)
              ->where('acumulativos.seccion_id','=',$request->seccion_id)
              ->where('acumulativos.parcial','=',$request->parcial)
              ->where('asignaturas.id','=',$request->asignatura_id)

              ->select("acumulativos.id","acumulativos.seccion_id","acumulativos.descripcion","acumulativos.tipo_acumulativo_id","acumulativos.fecha","acumulativos.parcial","acumulativos.valor","acumulativos.asignatura_id","acumulativos.created_at","acumulativos.updated_at")

              ->orderByDesc('acumulativos.id')->get();

              // se verifica la existencia del alumno
              if(!is_null($acumulativos) and sizeof($acumulativos)!= 0){

                      foreach($acumulativos as $acumulativo){
                          $acumulativo->tipoAcumulativo;
                          $acumulativo->asignatura;
                          $acumulativo->seccion->modalidad;
                          $acumulativo->notasAcumulativos;

                          foreach ($acumulativo->notasAcumulativos as $notasAcumulativo) {
                              # code...
                              $notasAcumulativo->alumno;
                          }
                      }


                  //se envia el json al navegador
                  return response()->json($acumulativos);

              }else{
                     return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun acumulativo' ], 422 );
              }


        }

    }
}
