<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Alumno;

class AlumnoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $alumnos=Alumno::all();
        // se verifica la existencia del alumno
        if(!is_null($alumnos) and sizeof($alumnos)!= 0){



            //se envia el json al navegador
            return response()->json($alumnos);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro el alumno' ], 204 );
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
        $alumno=new Alumno;
        $alumno->rne=$request->rne;
        $alumno->username=$request->rne;
        $alumno->nombre=$request->nombre;
        $alumno->apellido=$request->apellido;
        $alumno->email=$request->email;
        $alumno->password=$request->rne;

        $alumno->save();
        return response()->json( ['success'=>true, 'msg'=>'Se guardo el alumno' ], 200);


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
        //se busca el articulo por el codigo de barra
        $alumno=Alumno::where('rne',"=",$id)->first();


        // se verifica la existencia del alumno
        if(!is_null($alumno) or sizeof($alumno)!= 0){



            //se envia el json al navegador
            return response()->json($alumno);

        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro el alumno' ], 204 );
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
        $validator = \Validator::make($request->all(), ['nombre' => 'required','apellido' => 'required','genero' => 'required']);

        if ($validator->fails()){

            return response()->json($validator->errors(), 422);

        }else{

                $alumno=Alumno::find($id);

                // se verifica la existencia del alumno
                if(!is_null($alumno) or sizeof($alumno)!= 0){

                    //$alumno->rne=$request->rne;
                   // $alumno->username=$request->rne;
                    $alumno->nombre=$request->nombre;
                    $alumno->apellido=$request->apellido;
                    $alumno->genero=$request->genero;

                    if(!is_null($request->emai) or sizeof($request->emai)!= 0 or !empty($request->emai))
                         $alumno->email=$request->email;
                    if(!is_null($request->telefono) or sizeof($request->telefono)!= 0 or !empty($request->telefono))
                        $alumno->telefono=$request->telefono;

                    $alumno->save();


                    return response()->json( ['success'=>true, 'msg'=>'Se actualizo el alumno' ], 200);

                }else{
                       return response()->json( ['error'=>true, 'msg'=>'No se encontro el alumno' ], 204 );
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
        $alumno=Alumno::where('rne',"=",$id)->first();

        // se verifica la existencia del alumno
        if(!is_null($alumno) or sizeof($alumno)!= 0){
            $alumno->delete();
             return response()->json( ['success'=>true, 'msg'=>'Se elimino el alumno' ], 200);
        }else{
              return response()->json( ['error'=>true, 'msg'=>'No se encontro el alumno' ], 204 );
        }

    }
}
