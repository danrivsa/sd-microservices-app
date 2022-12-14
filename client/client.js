//importe de servicios o paquetes de funciones helpers
const file = require("./services/file");
const httpHandler = require('./services/handler');
const encryption = require('./services/encryption');
//URL de conexion con el servidor proxy
const proxy_server_URL = "http://proxy-server:8081";

class Client {

    //metodo de inicializacion del cliente
    static async Start(){
        //limpia la consola y escribe menu
        console.clear();
        console.log("SISTEMA DE OPERACIONES - PROYECTO DE DISTRIBUIDOS POR DANIEL RIVERO Y JOSE FLORES");
        console.log("En el sistema se pueden ejecutar las siguientes operaciones: \n");
        console.log("1- FIRMAR");
        console.log("2- AUTENTICAR");
        console.log("3- INTEGRIDAD\n");
        console.log("El sistema buscará leer un archivo en la carpeta 'in', llamado input.txt, el cual detectará la operación a realizar y los datos provistos en el archivo.\n");
        //inicia la lectura del archivo
        console.log("LEYENDO ARCHIVO input.txt ...\n");
        let userData;
        //manejo de errores
        try{
            userData = file.Read("in/input.txt");
        }catch(err){
            console.clear();
            throw new Error('Hubo un error al leer el archivo "input.txt", por favor verifique la existencia del mismo en la carpeta "in" en la raiz del proyecto. y vuelva a ejecutar');
        }
        //obtener la operacion de entrada
        let op = userData[0];
        console.log(`Operación a ejecutar es "${op}"\n`);
        //ejecutar segun la operacion obtenida
        switch (op) {
            case 'FIRMAR': //FIRMAR
                //envia peticion de firma al servidor proxy y se ataja el resultado de la llave
                const key = await httpHandler.Post(`${proxy_server_URL}/sign`,{
                    username: userData[1],
                    messagetext: userData[2],
                });
                //se obtiene el hash del mensaje en el input
                const messageHash = encryption.Encrypt(userData[2]);
                //se encripta el ,esaje de hash junto con la llave para firmar
                const signature = encryption.Encrypt(messageHash + key);
                //se exporta el resultado de la operacion
                file.Write("out/sign.txt",key,signature);
                console.log("SE HA FIRMADO ELECTRONICAMENTE EL DOCUMENTO.......");
                console.log("-----------FILE OUTPUT---------------------");
                console.log("LINE 1: " + key);
                console.log("LINE 2: " + signature);
                console.log('Puede revisar la salida en el archivo "out/sign.txt"');
                break;
            case 'AUTENTICAR': //'AUTENTICAR'
            //envia peticion de autenticar con la data requerida
                const result = await httpHandler.Post(`${proxy_server_URL}/authenticate`,
                {
                    user: userData[2],
                    user_key:userData[1] 
                });
                //escribe resultado de la operacion
                if(result){
                    file.Write("out/authenticate.txt",'VÁLIDO');
                    console.log("SE HA VERIFICADO LA IDENTIDAD DEL USUARIO Y CLAVE INGRESADO.......")
                    console.log("-----------FILE OUTPUT---------------------");
                    console.log("LINE 1: VÁLIDO");
                }else{
                    file.Write("out/authenticate.txt",'INVÁLIDO');
                    console.log("SE HA VERIFICADO LA IDENTIDAD DEL USUARIO Y CLAVE INGRESADO.......")
                    console.log("-----------FILE OUTPUT---------------------");
                    console.log("LINE 1: INVÁLIDO");
                }
                console.log('Puede revisar la salida en el archivo "out/authenticate.txt"');
            break;
            case 'INTEGRIDAD': //'INTEGRIDAD'
            //se encripta el texto de la firma y la clave del usuario para obtener la firma
            const signatureB1 = encryption.Encrypt(encryption.Encrypt(userData[2]) + userData[1]);
            //se obtiene la firma ingresada en el input
            const signatureB2 = userData[3];
            //se comparan ambas firmas y se devuelve un resultado
            if (signatureB1 == signatureB2) {
                file.Write("out/integrity.txt",'INTEGRO');
                console.log("SE HA VERIFICADO LA INTEGRIDAD DEL MENSAJE.......")
                console.log("-----------FILE OUTPUT---------------------");
                console.log("LINE 1: INTEGRO");
            } else {
                file.Write("out/integrity.txt",'NO INTEGRO');
                console.log("SE HA VERIFICADO LA INTEGRIDAD DEL MENSAJE.......")
                console.log("-----------FILE OUTPUT---------------------");
                console.log("LINE 1: NO INTEGRO");
            }
            console.log('Puede revisar la salida en el archivo "out/integrity.txt"');

                break;
            default: //en otro caso se termina el switch
                break;
        }

    }


}

Client.Start();
