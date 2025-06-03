PROCEDURE GUARDAR_FICHA_ARTICULO(
--------------------------------------PCK_SAC_CPR_ARTICULOS.GUARDAR_FICHA_ARTICULO-------------------------------------
    p_artidesc IN Varchar2,
    p_formcodi IN Number, 
    p_userid IN Number,
    p_unidcodi IN Number DEFAULT NULL,
    p_unidfactor IN Number DEFAULT NULL,
    p_centcodi IN Number,
    p_servcodi IN Number,
    p_result OUT VARCHAR2
    )
    
  AS
    v_articodi Number;
    v_grupcodi Number:= 7; ---ELABOR PROPIA
    v_famicodi Number:= 108; ---Varios Elab Propia
    v_sbfmcodi Number:= 260; ---Varios Elaboración Propia
    v_precioreq Number:=0;
    v_artiSubasta Number:=0;
    v_artipres VARCHAR2(10);
    v_artiprod VARCHAR2(10);
    v_artitipo VARCHAR2(10);
    v_artimarca VARCHAR2(10); 
    v_articant VARCHAR2(10);
    v_global Number:=0; --- Siempre 0
    v_artidota Number:=0; 
    v_artiunid Number;
    v_comp Number;
    v_paiscodi Varchar2(3);
    v_centabrev Varchar2(10);
    v_tipoAmb Number:=6; --- Tipo ambito centro 
    v_ambito Varchar2(10) := p_centcodi;
    v_anfoasignado Number:=1;
    V_ADOTCODI Number;
    v_hasta Date;
    
  BEGIN
  --- Obtener el siguiente ARTICODI disponible.
    SELECT numero
        INTO v_articodi
    FROM (
      SELECT numero         
      FROM cpr05.NUMEROS N
      LEFT JOIN cpr05.SAC_ARTICULOS A ON A.ARTICODI = N.NUMERO
      WHERE A.ARTICODI IS NULL
        AND N.NUMERO >= 800000
      ORDER BY N.NUMERO
    )
    WHERE ROWNUM = 1;
    
  --- Comprobación de que l nombre de artículo no exsiste.
    SELECT COUNT(0)
    INTO v_comp
    FROM cpr05.SAC_ARTICULOS
    WHERE ARTIDESC = p_artidesc;
    
    IF v_comp > 0 THEN
    RAISE_APPLICATION_ERROR(-20001, 'Nombre de artículo ya en uso');
  END IF;
  
        SELECT CENTABREV, fs.PAISCODI, fs.fechafinacuerdos
        INTO v_centabrev, v_paiscodi, v_hasta
        FROM CPR05.CENTROS c
        INNER JOIN CPR05.FECHAS_SAC FS ON FS.PAISCODI = c.PAISCODI
        WHERE CENTCODI = p_centcodi;

        --- estacodi = 3 directamente. ARTIEXCLEUR, ARTIEXCLAME, ARTIEXCLCUB los pasamos con valor 1.
        INSERT INTO cpr05.sac_articulos (articodi, artidesc, grupcodi, famicodi, sbfmcodi, formcodi, precioreq, artipres, artiprod, artitipo, artimarca, articant, artiunid, ARTIEXCLEUR, ARTIEXCLAME, ARTIGLOBAL, ARTIDOTA, UNIDCODI, UNIDFACTOR, USERID, PAISCODI, ESTACODI, ARTIFULTMOD, artisubasta, ARTIEXCLCUB) 
        VALUES (v_articodi, trim(p_artidesc), v_grupcodi, v_famicodi, v_sbfmcodi, p_formcodi, v_precioreq, v_artipres, trim(p_artidesc), trim(v_artitipo), trim(v_artimarca), trim(v_articant), v_artiunid, 0, 0, v_global, v_artidota, p_unidcodi, p_unidfactor, p_userid, v_paiscodi, 3, SYSDATE, v_artisubasta, 1); 
        
        INSERT INTO cpr05.ARTICULOSEVENTOS (ARTICODI, USERID, AREVFECHA, AREVCOMENT, ESTACODIINI, ESTACODIFIN) VALUES
        (v_articodi, p_userid, SYSDATE, 'Alta Ficha Artículo', null, null);  
        
        INSERT INTO cpr05.articulos_reg_mod (
            ARTICODI, ENVIADO, ARTIDESC, GRUPCODI, FAMICODI, SBFMCODI, FORMCODI, PRECIOREQ, ARTIPRES, ARTIPROD, ARTITIPO, ARTIMARCA, ARTICANT, ARTIUNID, ARTIBAJA, ARTIEXCLEUR, ARTIEXCLAME, ARTIGLOBAL, ARTIDOTA, UNIDCODI, UNIDFACTOR, USERID, FECHA)
        VALUES
        (v_articodi, 0, trim(p_artidesc), v_grupcodi, v_famicodi, v_sbfmcodi, p_formcodi, v_precioreq, v_artipres, trim(p_artidesc), trim(v_artitipo), trim(v_artimarca), trim(v_articant), v_artiunid, 0, 0, 1, v_global, v_artidota, p_unidcodi, p_unidfactor, p_userid, SYSDATE);

    
    MERGE INTO EAD.TRAD_TRADUCCIONES t
    USING (SELECT v_articodi AS v_articodi, p_artidesc AS v_artidesc FROM DUAL)
    ON (TABLCODI = 1 AND IDIOCODI = 34 AND TABLPK = v_articodi)
    WHEN MATCHED THEN
        UPDATE SET
            TRADDESC = v_artidesc
    WHEN NOT MATCHED THEN
        INSERT (TABLCODI, TABLPK, IDIOCODI, TRADDESC)
        VALUES (1, v_articodi, 34, v_artidesc);
    
        p_result :='1';
      ------------------------------------------PCK_SAC_CPR_ARTICULOS.GUARDAR_CENTROS_ARTICULO---------------------------------------------------------
     
            INSERT INTO cpr05.ARTICULOSCENTROS(ARTICODI, CENTCODI, DESDE, HASTA, USERID, FMOD)
            VALUES                      (v_articodi, p_centcodi, trunc(SYSDATE), v_hasta, p_userid, SYSDATE);
            
            INSERT INTO cpr05.ARTICULOSEVENTOS (ARTICODI, USERID, AREVFECHA, AREVCOMENT, ESTACODIINI, ESTACODIFIN) VALUES
            (v_articodi, p_userid, SYSDATE, 'Alta Centros Artículo ' || v_centabrev || ' - ' || SYSDATE  || ' - ' || v_hasta, null, null);  
          
      -------------------------------------------PCK_SAC_CPR_ARTICULOS.GUARDA_ART_FORM_ELAB------------------------------------------------------------
   
        UPDATE cpr05.ARTICULOSFORMELAB SET
            ANFOASIGNADO = 0
        WHERE ARTICODI = v_articodi
        AND ANFOASIGNADO = 1;

        INSERT INTO cpr05.ARTICULOSFORMELAB
        (ARTICODI,ANFOASIGNADO,TPAMCODI,AMBICODI,CENTCODI ,UNIDFACTOR, UNIDCODI, ANFOFECULTMOD,ANFOUSRULTMOD)
        VALUES (v_articodi,v_anfoasignado,v_tipoAmb, v_ambito, p_centcodi ,p_unidfactor, p_unidcodi, sysdate, p_userId);
    
      -------------------------------------------INTERT EN MAPEO ARTICULOS CENTRO------------------------------------------------------------
      
        INSERT INTO API_MAPEOARTICENT (CODISAC, CODICENTRO, CENTCODI, FECULTMOD, USRULTMOD, FACTOR)
        VALUES (v_articodi, p_servcodi, p_centcodi, SYSDATE, p_userid, p_unidfactor);
    
    EXCEPTION
    WHEN OTHERS THEN
       p_result := '0:' || SQLERRM;
    RETURN;
    
  END GUARDAR_FICHA_ARTICULO;
  