                
                //50
                
                case "ProcesarDescargosDesdeWidget":
                    parametros = new[] { "p_cnx;N","p_userid;N", "p_centcodi;V2", "p_reprocesar_descargos;N", "p_reprocesar_lotes;N","p_fechdesde;DT" , "p_fechasta;DT" };
                    constantes = new[] { "", this.User.UserId.ToString(),"" , "", "", "", "" };
                    resultado = this.EjecutaSPString(ESQUE + "PCK_SAC_DESCARGOS.GENERAR_DESCARGOS_VENTAS_TPV", parametros, constantes);
                    ISFJSONParser.SerializaString(resultado, "RESULTADO");
                    break;
                case "GetEstadoProceso":
                    parametros = new[] { "p_centcodi;V2" };
                    constantes = new[] { ""};
                    this.EjecutaSPToJSON(ESQUE + "PCK_SAC_DESCARGOS.GET_ISPROCESANDO", parametros, constantes, "RESULTESTADO", EnumTipoDato.Cursor);
                    break;

                



                //140
                  context.Response.Write(", ");

                    parametros = new[] { "p_centcodi;V2" };
                    constantes = new[] { "" };
                    this.EjecutaSPToJSON(ESQUE + "PCK_SAC_MAESTROS.GET_PANEL_DESCPROCES", parametros, constantes, "DESCPROCES", EnumTipoDato.Cursor);
                    

                
                