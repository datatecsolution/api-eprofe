<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Tipoacumulativo;
use Illuminate\Support\Facades\Storage;
use Maatwebsite\Excel\Facades\Excel;

class TipoAcumulativoController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
        $tipoAcumulativo=Tipoacumulativo::all();

        if(!is_null($tipoAcumulativo) and sizeof($tipoAcumulativo)!= 0){

            return response()->json($tipoAcumulativo);
        }else{
               return response()->json( ['error'=>true, 'msg'=>'No se encontro ningun tipo de acumulativo' ], 204 );
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
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
       // $address=Storage::disk('local')->url('public/01051970002994023_9740125.xls');
        error_reporting(0);
        $address= storage_path('app/public/01051986004177011_9082444.xls');

        //return $address;



        //$address = public_path('assets/panel/excel/test123.xls');
         Excel::load($address, function($reader) {
                $results = $reader->get();
                dd($results);
            });
        /*

        

        

        // options
        //$login_email = '12011952001270670';
        //$login_pass = 'osojchpj';
        //$login_email = '01051986004177011';
        //$login_pass = urldecode('jdmm13061986?');
        $login_email = urldecode('01051970002994023');
        $login_pass = urldecode('dialisydavid');
        $token;
        $user_docente='';
        //Storage::disk('local')->put('public/cookies.txt', '');
        $cookie_file_path = storage_path('app/public/cookies/'.$login_email.'.txt');
       // $cookie_file_path = Storage::url('public/cookies.txt');
        $LOGINURL = "https://sace.se.gob.hn/cuentas/login"; 
        $LOGOUT_URL='https://sace.se.gob.hn/cuentas/logout/';
        $agent = 'Mozilla/4.0 (compatible; MSIE 5.01; Winsdows NT 5.0")';

        //return Storage::url('public');
        // begin script
        $ch = curl_init();

        
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
        curl_setopt($ch, CURLOPT_URL, $LOGINURL);
        curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
        curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
        curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path); // Stores cookies in the temp file
        curl_setopt($ch, CURLOPT_HTTPHEADER, array("Accpet-Languege: es-es,en"));
        curl_setopt($ch, CURLOPT_TIMEOUT, 10);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_HEADER, false);

        // execute session to get cookies and required form inputs
        $content = curl_exec($ch);
        curl_close($ch);

        //return $content;


        $hidden1;
        $hidden2;
        preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $content, $hidden1);

        preg_match_all('<input type="hidden" name="next" value="(.*)" />', $content, $hidden2);



       //return sizeof($hidden2[1]);
        //si la seccion ya fue iniciada
        if(!is_null($hidden1[1]) and sizeof($hidden1[1])!= 0)
        {

                $token=$hidden1[1][0];

                $postValues = array(
                         'usuario' => $login_email,
                            'clave' => $login_pass,
                            'csrfmiddlewaretoken'=>$token,
                            'next'=>$hidden2[1][0]
                        );

               


                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $LOGINURL);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                curl_setopt($ch, CURLOPT_POST, count($postValues));
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

                //return $output;

                $hidden1;

                
                $preg_match="#<td style=\"text-align:center; vertical-align:middle;\">\s*DOCENTE\s*</td>\s*<td>\s*\s*<form action=\"/cuentas/usuario/autorizar/acceso\" method=\"post\">\s*<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />\s*<input type=\"hidden\" value=\"(.*)\" name=\"usuario\"/>#siU";

                //return $preg_match;
                //echo $preg_match;

                preg_match_all($preg_match, $output, $hidden1);

                //return $hidden1;

                //se recoge el token
                $token=$hidden1[1][0];

                //se recoge el usuario docente
                $user_docente= $hidden1[2][0];
        

                echo $token."-".$user_docente;

                $postValues = array(
                         'usuario' => $user_docente,
                            'csrfmiddlewaretoken'=>$token
                            
                        );


                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, 'https://sace.se.gob.hn/cuentas/usuario/autorizar/acceso');
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                curl_setopt($ch, CURLOPT_POST, count($postValues));
                curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);


                //return $output;

           
                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, 'https://sace.se.gob.hn/notas/descargar');
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                //curl_setopt($ch, CURLOPT_POST, count($postValues));
                //curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

                
                $hidden1;
                $hidden2;
                preg_match_all('#<button type="submit" class="descargar btn btn-info btn-small" data-cs="(.*)"><i class="icon-download-alt icon-white"></i></button>#', $output, $hidden1);

                preg_match_all("<input type='hidden' name='csrfmiddlewaretoken' value='(.*)' />", $output, $hidden2);


                
                $token= $hidden2[1][0];

                

                for($x=0;$x<sizeof($hidden1[1]);$x++)
                {

                    $postValues = array(
                         'cs' => $hidden1[1][$x],
                            'csrfmiddlewaretoken'=>$token
                            
                        );


                    //se descargan los archivos en excel para guardarlos en el server
                    $ch = curl_init();

                    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                    curl_setopt($ch, CURLOPT_URL, 'https://sace.se.gob.hn/notas/descargar');
                    curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                    curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                    curl_setopt($ch, CURLOPT_POST, count($postValues));
                    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postValues));
                    //curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path); //Uses cookies from the temp file
                    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                    curl_setopt($ch,CURLINFO_HEADER_OUT,true);
                    $output = curl_exec($ch);
                    curl_close($ch);
                    Storage::disk('local')->put('public/'.$login_email.'_'.$hidden1[1][$x].'.xls', $output);
                }


                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $LOGOUT_URL.$user_docente);
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);
// $header_info = curl_getinfo($ch,CURLINFO_HEADER_OUT);

               // return $header_info;
            }




                $ch = curl_init();

                curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Accepts all CAs
                curl_setopt($ch, CURLOPT_URL, $LOGOUT_URL.'2039391');
                curl_setopt( $ch, CURLOPT_CONNECTTIMEOUT, ( isset($z['timeout']) ? $z['timeout'] : 5 ) );
                curl_setopt($ch, CURLOPT_REFERER, $LOGINURL);
                curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_file_path);
                curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_file_path);
                curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true); // Tells cURL to follow redirects
                $output = curl_exec($ch);
                curl_close($ch);

                die;*/
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


   
}
