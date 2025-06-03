 PROCEDURE GENERAR_DESCARGOS_VENTAS_TPV (
              p_cnx IN NUMBER,
              p_userid IN NUMBER,
              p_centcodi IN VARCHAR2,
              p_reprocesar_descargos IN NUMBER, --- 0
              p_reprocesar_lotes IN NUMBER, --- 1
              p_fechdesde IN DATE,
              p_fechasta IN DATE,
              p_result OUT CLOB
      ) AS
      
             
      v_venta_estado_id NUMBER;
      v_nventas_errores NUMBER;
      v_desccodi VARCHAR2(9);
      v_sbalorig NUMBER;
      v_sbaldest NUMBER;
      v_sbalorigaux NUMBER;
      v_sbaldestaux NUMBER;
      v_mapeo_dep NUMBER;
      v_nfichas NUMBER;
      v_platoid NUMBER;
      v_raciones NUMBER;
      v_cantidad NUMBER;
      v_cantidad_calculada NUMBER;
      v_result_guardar_descargo CLOB;
      v_result_procesar CLOB;
      v_descorigen NUMBER := 3; --TPV
      v_desctipo NUMBER := 2; --VENTA
      v_ventas_procesadas NUMBER := 0;
      v_result_error_aux CLOB := NULL;
      v_result_descargos_generados CLOB := '';
      v_msg_mapeo VARCHAR2(100);
      v_log_venta VARCHAR2(1000);
      V_NUM_VENTAS_AUX NUMBER;
      v_fechainv date;
      v_fecha date;
      v_procesando Number;
      
      BEGIN
      
        DELETE_TMP(p_cnx);
        
          v_result_procesar := '0';
          v_fecha := trunc(sysdate);
          
          SELECT procesando 
          INTO v_procesando
          FROM TPV_CENTROVENTA
          WHERE CENTCODI = p_centcodi;
          
        IF v_procesando = 0 
        THEN
          
         -- 20250327 SVILA: SE DESCOMENTA ESTE BLOQUE PARA REPROCESO DE DESCARGOS PENDIENTES DE LIMA. EJECUTADA TASK MANUALMENTE DESDE SRCEN92 EL 27/03/2025
         -- 20250331 SVILA: SE COMENTA DE NUEVO PORQUE EL PROCESO SE ESTÁ QUEDANDO CONGELADO DURANTE 4H Y NO HACE NADA. 
         -- 20250402 JR: Restringimos a centros activos con tpv y mes en curso  
         -- /*  
         
         --SI DEBE REPROCESAR DESCARGOS
         IF  p_reprocesar_descargos = 1  AND p_reprocesar_lotes = 0
         THEN
            
            --Si empieza a procesar actualizamos el flag de TPV_CENTROVENTA a 1(procesando)  MANU CUESTA 16/05/2025
            UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 1
            WHERE centcodi = p_centcodi;
            
         DECLARE
             CURSOR CUR_PROCESAR_DESCARGOS_CENTROS IS
             SELECT CENTCODI
             FROM TPV_CENTROVENTA
             WHERE ACTIVO = 1
             AND p_reprocesar_descargos = 1
             AND (p_centcodi IS NULL OR CENTCODI = p_centcodi);      
         
          BEGIN
          
            INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESO. CALL GENERAR_DESCARGOS_VENTAS_TPV');
            INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESADO DESCARGOS PENDIENTES');
             FOR CENTRO IN CUR_PROCESAR_DESCARGOS_CENTROS LOOP
                INSERT INTO TPV_TRAZA(DATA) VALUES ('DESCARGOS CENTRO: ' || CENTRO.CENTCODI);
             
                 --obtenemos la fecha del ultimo inventario
                 SELECT MIN(FECHA) INTO v_fechainv
                 FROM (
                    SELECT MAX(CIERFECHA) FECHA FROM ECONOMATO.CIERRES WHERE CENTCODI= centro.CENTCODI AND ESTACODI>1 AND CIERFECHA < v_fecha AND TPGRCODI = 1
                    UNION 
                    SELECT MAX(CIERFECHA) FECHA FROM ECONOMATO.CIERRES WHERE CENTCODI= centro.CENTCODI AND ESTACODI>1 AND CIERFECHA < v_fecha AND TPGRCODI = 5
                 );         
             
                 DECLARE
                     CURSOR CUR_PROCESAR_DESCARGOS_CREADOS IS
                     SELECT D.CENTCODI, D.DESCCODI
                     FROM DESCARGOS D
                     WHERE D.ESTACODI = 0
                           AND D.DESCORIGEN = 3
                           AND D.DESCTIPO = 2
                           --AND CENTCODI in ('298','302')
                           AND D.CENTCODI = centro.CENTCODI
                           AND (D.DESCSBALORIG, D.DESCSBALDEST) IN (
                            SELECT DESCSBALORIG,DESCSBALDEST
                            FROM TPV_PUNTOVENTA_MAPEO 
                            WHERE ACTIVO = 1
                            )
                            AND D.DESCFECHA BETWEEN v_fechainv + 1 AND ADD_MONTHS(v_fechainv, 1)
                            -- Añadido params para que seleccionen las fechas que desean MANU CUESTA 20/05/2025
                            AND D.DESCFECHA BETWEEN p_fechdesde AND p_fechasta 
                            ORDER BY D.DESCFECHA;
    
                 BEGIN
                     INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESADO DESCARGOS PENDIENTES');
                     FOR DESCARGO IN CUR_PROCESAR_DESCARGOS_CREADOS LOOP
    
    
                        --DESCARGOS_PROCESAR2 (DESCARGO.CENTCODI, TO_NUMBER(DESCARGO.DESCCODI),  v_result_procesar); -- TENER EN CUENTA QUE ESTAMOS LLAMADO A DESCARGOS_PROCESAR2, DONDE ESTE TIENE EL ROLLBACK COMENTADO
                        DESCARGOS_PROCESAR (DESCARGO.CENTCODI, TO_NUMBER(DESCARGO.DESCCODI), 1, v_result_procesar);
    
                        COMMIT;
                     END LOOP;
                     INSERT INTO TPV_TRAZA(DATA) VALUES ('FIN DESCARGOS CENTRO: ' || CENTRO.CENTCODI);
                 END;    
             END LOOP;
          END;
          --*/
          
          INSERT INTO TPV_TRAZA(DATA) VALUES ('FIN PROCESADO DESCARGOS PENDIENTES');
          
          v_result_procesar := '0';
          
          --Si termina de procesar actualizamos el flag de TPV_CENTROVENTA a 0(inactivo)  MANU CUESTA 16/05/2025
            UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 0
            WHERE centcodi = p_centcodi;
          END IF;
          
          
          ---------------------------------------------------------------PROCESAR NUEVOS----------------------
          
        --23012025 JNAVARRO: OBSOLETO, NO SIRVE PARA DESCARTAR EXCEPCIONES DE MÁS DE UN CENTRO...
        -- Actualizamos los datos para que no se nos generen los descargos
        /*UPDATE TPV_VENTAS SET VENTA_ESTADO_ID = 4
        WHERE (NUMVENTAS = 0 AND IMPORTETOTAL = 0) OR
          PLATO_ID IN (SELECT PLATO_ID FROM TPV_VENTAS_EXCEPCIONES)
        AND VENTA_ESTADO_ID <> 4;*/
        
        -- 23012025 JNAVARRO: UNA FORMA DE ACTUALIZAR A 4 LAS EXCEPCIONES, TENIENDO EN CUENTA EN CENTRO DEL LOTE.
        -- DE MOMENTO, NO LA USAMOS Y SPLITAMOS NUMVENTAS A 0 Y EXCEPCIONES.
        /*UPDATE TPV_VENTAS V
        SET VENTA_ESTADO_ID = 4
        WHERE (NUMVENTAS = 0 AND IMPORTETOTAL = 0);
        OR
          (PLATO_ID) IN (    
          SELECT PLATO_ID 
          FROM TPV_VENTAS_EXCEPCIONES VE WHERE VE.CENTCODI IN (SELECT VL.CENTCODI FROM TPV_VENTASLOTES VL WHERE VL.LOTE_ID = V.LOTE_ID)
          )
        AND VENTA_ESTADO_ID <> 4;*/
        
        
        --SI DEBE PROCESAR LOTES
        IF  p_reprocesar_descargos = 0  AND p_reprocesar_lotes = 1
        THEN
        
            --Actualizamos el flag de TPV_CENTROVENTA a 1(procesando)  MANU CUESTA 16/05/2025
            UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 1
            WHERE centcodi = p_centcodi;
        
        INSERT INTO TPV_TRAZA(DATA) VALUES ('MARCAMOS EXCLUSIONES');
        
        -- 28012025 JNAVARRO
        -- Actualizamos los datos para que no se nos generen los descargos
        UPDATE TPV_VENTAS SET VENTA_ESTADO_ID = 4
        WHERE NUMVENTAS = 0 --AND IMPORTETOTAL = 0 --Si las ventas son 0 no pueden procesarse, independientemente del importe (divisor por 0)
        AND VENTA_ESTADO_ID <> 4;
        
        -- Actualizamos los datos para que no se nos generen los descargos de las excepciones de MER
        UPDATE TPV_VENTAS TV SET TV.VENTA_ESTADO_ID = 4
        WHERE TV.PLATO_ID IN (SELECT PLATO_ID FROM TPV_VENTAS_EXCEPCIONES VEX WHERE VEX.CENTCODI = '298')
        AND TV.LOTE_ID IN (SELECT LOTE_ID FROM TPV_VENTAS_LOTES TVL WHERE TVL.CENTCODI = '298')
        AND VENTA_ESTADO_ID <> 4;
        
        -- Actualizamos los datos para que no se nos generen los descargos de las excepciones de LMA
        UPDATE TPV_VENTAS TV SET TV.VENTA_ESTADO_ID = 4
        WHERE (TV.PLATO_ID IN (SELECT PLATO_ID FROM TPV_VENTAS_EXCEPCIONES VEX WHERE VEX.CENTCODI = '302') 
                OR 
                SUBSTR(TV.PLATO_ID, 1, 1) in ('9', '3')
              )
        AND TV.LOTE_ID IN (SELECT LOTE_ID FROM TPV_VENTAS_LOTES TVL WHERE TVL.CENTCODI = '302')
        AND VENTA_ESTADO_ID <> 4;
        
        INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESADO VENTAS PENDIENTES/NUEVOS');
       
        --CURSOR LOTES
        DECLARE CURSOR cur_TPV_VENTAS_LOTES IS
            SELECT l.LOTE_ID,
                   l.CENTCODI,
                   l.CENTNOM,
                   l.FECHA,
                   l.LOTE_ESTADO_ID,
                   v.MONECODI MONECODIVNT,
                   v.SUBRECETA,
                   c.MONECODI MONECODICEN
                   FROM TPV_VENTAS_LOTES l
                   INNER JOIN TPV_CENTROVENTA v ON v.CENTCODI = l.CENTCODI
                   INNER JOIN CPR05.CENTROS c ON c.CENTCODI = l.CENTCODI
            WHERE LOTE_ESTADO_ID IN (1,3)
            --AND l.FECHA > SYSDATE - 45
            --AND l.CENTCODI in ('298','302')
            AND v.ACTIVO = 1
            AND p_reprocesar_lotes = 1
            AND (p_centcodi IS NULL OR l.CENTCODI = p_centcodi)
            --AND l.LOTE_ID = 5522
            /*AND l.FECHA = '26/03/2025'
            AND l.CENTCODI = '302'*/
            ORDER BY l.CENTCODI, l.LOTE_ID;
        BEGIN 
            
           FOR lote IN cur_TPV_VENTAS_LOTES LOOP     
           
            --obtenemos la fecha del ultimo inventario
            SELECT MIN(FECHA) INTO v_fechainv
             FROM (
                SELECT MAX(CIERFECHA) FECHA FROM ECONOMATO.CIERRES WHERE CENTCODI= lote.CENTCODI AND ESTACODI>1 AND CIERFECHA < v_fecha AND TPGRCODI = 1
                UNION 
                SELECT MAX(CIERFECHA) FECHA FROM ECONOMATO.CIERRES WHERE CENTCODI= lote.CENTCODI AND ESTACODI>1 AND CIERFECHA < v_fecha AND TPGRCODI = 5
            ); 
            
            IF v_fechainv >= lote.FECHA THEN
                --actualiza el lote a estado 2
                UPDATE TPV_VENTAS_LOTES l SET l.LOTE_ESTADO_ID = 2 WHERE l.LOTE_ID = lote.LOTE_ID;
                
                UPDATE TPV_VENTAS v SET v.VENTA_ESTADO_ID = 2, v.LOGS = 'EXCLUIDO POR CIERRE DE MES' WHERE v.LOTE_ID = lote.LOTE_ID AND v.VENTA_ESTADO_ID IN (1,3);
        
                INSERT INTO TPV_TRAZA(DATA) VALUES ('EXCLUIDO PROCESADO VENTAS LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI);
                
                COMMIT;
                
                CONTINUE;
                
            END IF;
           
            INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESADO VENTAS LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI);
           
                 --CURSOR VENTAS
                    DECLARE CURSOR cur_TPV_VENTAS IS
                        SELECT  V.VENTA_ID, 
                                V.LOTE_ID, 
                                V.PUNTOVENTA_ID, 
                                V.PUNTOVENTANOM, 
                                V.PLATO_ID, 
                                V.PLATO_DESC, 
                                V.NUMVENTAS, 
                                V.IMPORTETOTAL, 
                                V.IMPORTEDESCUENTO, 
                                V.NUMDEVOLUCIONES, 
                                V.VENTA_ESTADO_ID,
                                V.ORDEN_ID,
                                V.ORDEN_DESC
                               FROM TPV_VENTAS V
                        WHERE LOTE_ID = lote.LOTE_ID
                        AND V.VENTA_ESTADO_ID IN (1,3)
                        ORDER BY V.VENTA_ID;
                    BEGIN
                                          
                       FOR venta IN cur_TPV_VENTAS LOOP
                       v_ventas_procesadas := v_ventas_procesadas + 1;
                             --crear descargo
                             v_venta_estado_id := 2; --procesado
                       v_log_venta := null;
    
                      INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO PROCESADO VENTA LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID);
                      
                      SELECT COUNT(*) INTO v_mapeo_dep
                      FROM TPV_PUNTOVENTA_MAPEO PVM
                      INNER JOIN FYB.FB_FICHAS FIC ON FIC.PMS_ID = VENTA.PLATO_ID AND FIC.TIPOFICHA_ID = PVM.TIPOFICHA_ID AND NVL2(PVM.CLASEFICHA_ID,FIC.OBSERVACIONES,-1) = NVL(PVM.CLASEFICHA_ID, -1)
                      --23012025 JNAVARRO: QUEDABA AÑADIR EL JOIN CON CARTAS PARA COMPROBAR SI EXISTE EL MAPEO DE PUNTO DE VENTA SEGÚN EL TIPO DE FICHA
                      INNER JOIN (
                         SELECT CL.FICHA_ID FROM FYB.FB_CARTAS C
                         INNER JOIN FYB.FB_CARTASLINEAS CL ON CL.CARTA_ID = C.CARTA_ID
                         WHERE C.ESTADO_ID = 6 AND C.ACTIVA = 1 AND C.TPAMCODI = 6 AND C.AMBICODI = LOTE.CENTCODI
                         GROUP BY CL.FICHA_ID
                      ) C ON C.FICHA_ID = FIC.FICHA_ID
                      WHERE PUNTOVENTA_ID = VENTA.PUNTOVENTA_ID AND CENTCODI = LOTE.CENTCODI AND PVM.ACTIVO = 1 AND BAJA = 0;
                             
                      SELECT COUNT(*) INTO v_nfichas
                      FROM FYB.FB_FICHAS F              
                      --23012025 JNAVARRO: SE VA A BUSCAR LA FICHA A TRAVÉS DE LA CARTA: MULTICENTRO.
                      INNER JOIN (
                        SELECT CL.FICHA_ID FROM FYB.FB_CARTAS C
                        INNER JOIN FYB.FB_CARTASLINEAS CL ON CL.CARTA_ID = C.CARTA_ID
                        WHERE C.ESTADO_ID = 6 AND C.ACTIVA = 1 AND C.TPAMCODI = 6 AND C.AMBICODI = LOTE.CENTCODI
                        GROUP BY CL.FICHA_ID
                      ) C ON C.FICHA_ID = F.FICHA_ID
                      WHERE F.PMS_ID = venta.PLATO_ID AND F.FICHA_ID IS NOT NULL AND F.BAJA = 0;
                 
                      IF(v_mapeo_dep = 1 AND v_nfichas = 1) THEN
    
                        SELECT PVM.DESCSBALORIG, NVL(TOM.DESCSBALDEST, PVM.DESCSBALDEST) INTO V_SBALORIG, V_SBALDEST
                        FROM TPV_PUNTOVENTA_MAPEO PVM
                        INNER JOIN FYB.FB_FICHAS FIC ON FIC.PMS_ID = VENTA.PLATO_ID AND FIC.TIPOFICHA_ID = PVM.TIPOFICHA_ID AND NVL2(PVM.CLASEFICHA_ID,FIC.OBSERVACIONES,-1) = NVL(PVM.CLASEFICHA_ID, -1)
                        --23012025 JNAVARRO: SE VA A BUSCAR LA FICHA A TRAVÉS DE LA CARTA: MULTICENTRO.
                        INNER JOIN (
                            SELECT CL.FICHA_ID FROM FYB.FB_CARTAS C
                            INNER JOIN FYB.FB_CARTASLINEAS CL ON CL.CARTA_ID = C.CARTA_ID
                            WHERE C.ESTADO_ID = 6 AND C.ACTIVA = 1 AND C.TPAMCODI = 6 AND C.AMBICODI = LOTE.CENTCODI
                            GROUP BY CL.FICHA_ID
                         ) C ON C.FICHA_ID = FIC.FICHA_ID 
                         --24032025 JR: INCLUIMOS LÓGICA DE DESCARGO POR TIPOS DE ORDEN
                         LEFT JOIN TPV_TIPOORDEN_MAPEO TOM ON TOM.CENTCODI = PVM.CENTCODI AND TOM.ORDEN_ID = VENTA.ORDEN_ID AND TOM.ACTIVO = 1
                         WHERE PVM.PUNTOVENTA_ID = VENTA.PUNTOVENTA_ID AND PVM.CENTCODI = LOTE.CENTCODI AND FIC.BAJA = 0;
                         
                         V_SBALORIGAUX := V_SBALORIG;
                         V_SBALDESTAUX := V_SBALDEST;
                         V_NUM_VENTAS_AUX := VENTA.NUMVENTAS;
                         
                         -- Si tenemos números de ventas en negativo, los departamentos deben invertirse
                         IF VENTA.NUMVENTAS < 0 THEN
                            V_NUM_VENTAS_AUX := ABS(VENTA.NUMVENTAS);
                            V_SBALORIG := V_SBALDESTAUX;
                            V_SBALDEST := V_SBALORIGAUX;
                         END IF;
    
                        INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGO CREAR LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID);
    
                         v_desccodi := '0';
                                 DESCARGOS_CREAR(
                                      lote.CENTCODI,
                                      v_sbalorig,
                                      v_sbaldest,
                                      lote.FECHA,
                                      CASE WHEN venta.ORDEN_DESC IS NULL THEN venta.PLATO_DESC ELSE venta.PLATO_DESC || ' | ' || venta.ORDEN_DESC END,
                                      --venta.PLATO_DESC,
                                      p_userid,
                                      v_descorigen,
                                      v_desctipo,
                                      v_desccodi);
                        
                                    INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGO CREADO  LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID || '      DESCCODI: ' || v_desccodi);             
                                  IF(v_desccodi<>'0') THEN
                                         SELECT F.FICHA_ID, F.RACIONES, F.CANTIDAD 
                                         INTO v_platoid, v_raciones, v_cantidad
                                         FROM FYB.FB_FICHAS F
                                        --23012025 JNAVARRO: SE VA A BUSCAR LA FICHA A TRAVÉS DE LA CARTA: MULTICENTRO.
                                        INNER JOIN 
                                        (SELECT CL.FICHA_ID FROM FYB.FB_CARTAS C
                                        INNER JOIN FYB.FB_CARTASLINEAS CL ON CL.CARTA_ID = C.CARTA_ID
                                        WHERE C.ESTADO_ID = 6 AND C.ACTIVA = 1 AND C.TPAMCODI = 6 AND C.AMBICODI = LOTE.CENTCODI
                                        GROUP BY CL.FICHA_ID) C ON C.FICHA_ID = F.FICHA_ID                                      
                                         WHERE F.PMS_ID = venta.PLATO_ID
                                           AND F.FICHA_ID IS NOT NULL
                                          AND BAJA = 0;
                                         
                                         -- 11/06/2024 ADD JR -- En FYB no es mandatory el total de cantidad  
                                         IF v_cantidad = 0 OR v_cantidad is null THEN
                                            SELECT SUM(cantidad) INTO v_cantidad FROM FYB.FB_COMPOSICION WHERE FICHA_ID = v_platoid;                                     
                                         END IF;
                                          
                                          v_cantidad_calculada:=0;
                                          IF(v_raciones>0) THEN
                                            v_cantidad_calculada:=(V_NUM_VENTAS_AUX * v_cantidad) / v_raciones;
                                          END IF;
                                               
                                          INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGOSLINEAS CREAR LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID || '      DESCCODI: ' || v_desccodi);                  
                                               
                                          DESCARGOS_ANADIR_LINEA_TMP(
                                           p_cnx,
                                           lote.CENTCODI,
                                           v_platoid,
                                           TO_CHAR(V_NUM_VENTAS_AUX),
                                           1, --p_desctipo,
                                           TO_CHAR(v_cantidad_calculada));
                            
                                           v_result_guardar_descargo := '0';
                                           DESCARGOS_GUARDAR_DET(
                                           p_cnx,
                                           lote.CENTCODI,
                                           TO_NUMBER(v_desccodi),
                                           p_userid,
                                           1, --p_soloAnade
                                           1, --p_desctipo
                                           v_result_guardar_descargo);
                       
                                          INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGOSLINEAS CREADO  LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID || '      DESCCODI: ' || v_desccodi);                  
                                          
                                   if(v_result_guardar_descargo = '1') THEN
                                     
                                     UPDATE DESCARGOSLINEAS dl SET
                                        DELNIMPVNT = venta.IMPORTETOTAL,
                                        MONECODIVNT = lote.MONECODIVNT, -- extraer de la nueva tabla de monedas e incluir en el cursor de lote
                                        DELNIMPVNTUSD = venta.IMPORTETOTAL * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, 2,  1)),
                                        DELNIMPVNTCONS = venta.IMPORTETOTAL * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, 1,  1)),
                                        DELNIMPVNTLOC =  venta.IMPORTETOTAL * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, lote.MONECODICEN,  1)),
                                        DELNIMPDTO = venta.IMPORTEDESCUENTO,
                                        DELNIMPDTOUSD = venta.IMPORTEDESCUENTO * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, 2,  1)),
                                        DELNIMPDTOCONS = venta.IMPORTEDESCUENTO * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, 1,  1)),
                                        DELNIMPDTOLOC = venta.IMPORTEDESCUENTO * ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', lote.FECHA, lote.MONECODIVNT, lote.MONECODICEN,  1)),
                                        DELNVENTAID = venta.VENTA_ID,
                                        DELNPLATOID = venta.PLATO_ID,
                                        DELNPLATODESC = venta.PLATO_DESC,
                                        DELNTPVID = venta.PUNTOVENTA_ID,
                                        DELNTPVDESC = venta.PUNTOVENTANOM,
                                        DELNORDENID = venta.ORDEN_ID,
                                        DELNORDENDESC = venta.ORDEN_DESC
                                        WHERE dl.centcodi = lote.CENTCODI and dl.desccodi = v_desccodi;
                                     
                                     COMMIT;
                                     
                                     v_result_procesar := '0';
                                     
                                     --29012025 JNAVARRO: SE AÑADE LA CONDICIÓN DE QUE SOLO PROCESE PARA MER. DE MOMENTO PARA ARB NO DEBE PROCESAR P.O. DE JROSTKOWSKI.
                                     --IF VENTA.NUMVENTAS > 0 AND lote.CENTCODI in ('298','302') THEN
                                     --IF VENTA.NUMVENTAS > 0 AND lote.CENTCODI in ('298') THEN
                                     --IF VENTA.NUMVENTAS > 0 AND lote.CENTCODI in ('302') THEN
                                     IF VENTA.NUMVENTAS > 0 THEN
                                     INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGOS PROCESAR LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID || '      DESCCODI: ' || v_desccodi);                  
                                        DESCARGOS_PROCESAR(
                                           lote.CENTCODI,
                                           TO_NUMBER(v_desccodi),
                                           v_result_procesar);
                                           
                                     INSERT INTO TPV_TRAZA(DATA) VALUES ('INICIO DESCARGOS PROCESADO LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID || '      DESCCODI: ' || v_desccodi);                        
                                     END IF;
              
                                                 if(v_result_procesar <> '1') THEN
                                                        v_result_error_aux := v_result_error_aux
                                                                  || ';VENTA_ID:' || TO_CHAR(venta.VENTA_ID)
                                                                  || ':Error DESCARGOS_PROCESAR():'
                                                                  || v_result_procesar;
                                                                  
                                                       IF INSTR(v_result_procesar, '20010') > 0 THEN
                                                          v_result_procesar := v_result_procesar || ':No hay suficiente stock.';
                                                       END IF;
                                                       IF INSTR(v_result_procesar, '20011') > 0 THEN
                                                          v_result_procesar := v_result_procesar || ':El Descargo no puede procesarse porque el mes ya está cerrado.';
                                                       END IF;
                                                       IF INSTR(v_result_procesar, '20012') > 0 THEN
                                                          v_result_procesar := v_result_procesar || ':Debe cerrar el mes anterior antes de procesar el descargo.';
                                                       END IF;
                                                       IF INSTR(v_result_procesar, '20013') > 0 THEN
                                                          v_result_procesar := v_result_procesar || ':El Descargo no tiene lineas que procesar o todas las cantidades están a 0.';
                                                       END IF;
                                                       IF INSTR(v_result_procesar, '20002') > 0 THEN
                                                          v_result_procesar := v_result_procesar || ':Sin datos suficientes para calcular el próximo cierre.';
                                                       END IF;
                                                       
                                                       v_log_venta := 'DESCARGO GENERADO ID:' || v_desccodi
                                                                 || ':CODIGO CENTRO:' || lote.CENTCODI
                                                                 || ':Error DESCARGOS_PROCESAR():'
                                                                 || v_result_procesar;
                                                     -- el v_venta_estado_id no pone a 3. se considera procesado
                                                     -- independientemente del resultado del DESCARGOS_PROCESAR()
                                                 END IF;									 
                                            ELSE
                                              ROLLBACK;
                                                 v_result_error_aux := v_result_error_aux
                                                                    || ';VENTA_ID:' || TO_CHAR(venta.VENTA_ID)
                                                                    || ':Error DESCARGOS_GUARDAR_DET():'
                                                                    || v_result_guardar_descargo;                      
                                              v_venta_estado_id := 3; --error
                                              v_log_venta := 'Error DESCARGOS_GUARDAR_DET()' || v_result_guardar_descargo; 
                                            END IF;	
                                                            
                                    ELSE
                                          v_result_error_aux := v_result_error_aux 
                                                             || ';VENTA_ID:' || TO_CHAR(venta.VENTA_ID)
                                                             || ':Error DESCARGOS_CREAR()';
                                        v_venta_estado_id := 3; --error
                                        v_log_venta := 'Error DESCARGOS_CREAR()';
                                    END IF;						  
                                  
                             --procesar descargo
                             
                             ELSE
                             
                                 IF(v_mapeo_dep = 0 AND v_nfichas = 0) THEN
                                   v_msg_mapeo:='No mapeado TPV_PUNTOVENTA_MAPEO y FYB.FB_FICHAS';
                                 END IF;
                                 IF(v_mapeo_dep = 1 AND v_nfichas = 0) THEN
                                   v_msg_mapeo:='No mapeado en FYB.FB_FICHAS';
                                 END IF;
    
                                 IF(v_mapeo_dep = 0 AND v_nfichas = 1) THEN
                                   v_msg_mapeo:='No mapeado en TPV_PUNTOVENTA_MAPEO';
                                 END IF;
                             
                                  v_result_error_aux := v_result_error_aux 
                                   || ';LOTE_ID:' || TO_CHAR(lote.LOTE_ID)
                                   || ';VENTA_ID:' || TO_CHAR(venta.VENTA_ID)
                                   || ':PUNTOVENTA_ID:' || TO_CHAR(venta.PUNTOVENTA_ID)
                                   || ':PLATO_ID/PMS_ID:' || TO_CHAR(venta.PLATO_ID)
                                   || v_msg_mapeo;
                                   v_venta_estado_id := 3; --error
                                   v_log_venta := v_msg_mapeo;
                             END IF;
                             
                             DELETE_TMP(p_cnx);
                             
                             IF(v_venta_estado_id = 2) THEN
                               v_result_descargos_generados := v_result_descargos_generados 
                               || ';DESCARGO GENERADO:VENTA_ID:' || TO_CHAR(venta.VENTA_ID)
                               || ':CODIGO DESCARGO:' || v_desccodi
                               || ':CODIGO CENTRO:' || lote.CENTCODI
                               || ':CENTRO:' || lote.CENTNOM;
                               
                               IF v_log_venta IS NULL THEN
                                   v_log_venta := 'DESCARGO GENERADO ID:' || v_desccodi
                                               || ':CODIGO CENTRO:' || lote.CENTCODI
                                               || ':DESCARGO PROCESADO OK';
                               END IF;
                             END IF;
                             
                             INSERT INTO TPV_TRAZA(DATA) VALUES ('FIN PROCESADO VENTA LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI || '      VENTA: ' || venta.VENTA_ID);
                             
                             --actualizar estado
                             UPDATE TPV_VENTAS
                             SET VENTA_ESTADO_ID = v_venta_estado_id
                                ,LOGS = v_log_venta
                             WHERE VENTA_ID = venta.VENTA_ID;
                             COMMIT;
                       END LOOP;		  
                    END;
                 --fin CURSOR VENTAS
    
                 SELECT COUNT(*) INTO v_nventas_errores
                 FROM TPV_VENTAS 
                 WHERE LOTE_ID = lote.LOTE_ID
                   AND VENTA_ESTADO_ID = 3;
                        
                 UPDATE TPV_VENTAS_LOTES
                 SET LOTE_ESTADO_ID = DECODE(v_nventas_errores,0,2,3)
                 WHERE LOTE_ID = lote.LOTE_ID;
                 COMMIT;	
                 
              INSERT INTO TPV_TRAZA(DATA) VALUES ('FIN PROCESADO VENTAS LOTE: ' || lote.LOTE_ID || '      DEL CENTRO:' || lote.CENTCODI);   
           END LOOP;	
           
         END;	   
        --fin CURSOR LOTES
        
        INSERT INTO TPV_TRAZA(DATA) VALUES ('FIN PROCESADO VENTAS PENDIENTES/NUEVOS');
        
        DELETE_TMP(p_cnx);
          
        IF(v_result_error_aux IS NOT NULL) THEN
         p_result := ';Líneas procesadas: ' || TO_CHAR(v_ventas_procesadas); --|| v_result_error_aux || TO_CHAR(v_result_descargos_generados); REVISAR PETE 
         --  p_result := '4';
           UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 0
            WHERE centcodi = p_centcodi;
        ELSE
           --p_result := ';1;Líneas procesadas: '|| TO_CHAR(v_ventas_procesadas) || v_result_descargos_generados;
           p_result := '5';
           UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 0
            WHERE centcodi = p_centcodi;
        END IF;
    
        COMMIT;
            --Si termina de procesar actualizamos el flag de TPV_CENTROVENTA a 0(inactivo)  MANU CUESTA 16/05/2025
           
        END IF; 
        
        ELSE 
         p_result := '3'; --ya hay uno en proceso
        
        END IF;
        EXCEPTION
            WHEN OTHERS
                THEN 
            --Si termina el proceso con excepción actualizamos el flag de TPV_CENTROVENTA a 0(inactivo)  MANU CUESTA 16/05/2025
            UPDATE TPV_CENTROVENTA
            SET PROCESANDO = 0
            WHERE centcodi = p_centcodi;
            p_result := '0: ' || SQLCODE || ': ' || SQLERRM;
            ROLLBACK;
        
     END GENERAR_DESCARGOS_VENTAS_TPV;
 
  