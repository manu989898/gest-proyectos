CREATE OR REPLACE PROCEDURE PCK_SAC_CPR_ARTICULOS.GUARDAR_FICHA_ARTICULO(
    p_artidesc    IN VARCHAR2,
    p_formcodi    IN NUMBER, 
    p_userid      IN NUMBER,
    p_unidcodi    IN NUMBER DEFAULT NULL,
    p_unidfactor  IN NUMBER DEFAULT NULL,
    p_centcodi    IN NUMBER,
    p_servcodi    IN NUMBER,
    p_idiocodi    IN NUMBER,
    p_result      OUT SYS_REFCURSOR
)
AS
    v_articodi     NUMBER;
    v_grupcodi     NUMBER := 7;  -- ELABOR PROPIA
    v_famicodi     NUMBER := 108;
    v_sbfmcodi     NUMBER := 260;
    v_precioreq    NUMBER := 0;
    v_artiSubasta  NUMBER := 0;
    v_artipres     VARCHAR2(10);
    v_artiprod     VARCHAR2(10);
    v_artitipo     VARCHAR2(10);
    v_artimarca    VARCHAR2(10); 
    v_articant     VARCHAR2(10);
    v_global       NUMBER := 0;
    v_artidota     NUMBER := 0; 
    v_artiunid     NUMBER;
    v_comp         NUMBER;
    v_paiscodi     VARCHAR2(3);
    v_centabrev    VARCHAR2(10);
    v_tipoAmb      NUMBER := 6;
    v_ambito       VARCHAR2(10) := p_centcodi;
    v_anfoasignado NUMBER := 1;
    v_hasta        DATE;
    v_idiobase     NUMBER := 34;
BEGIN
    -- Obtener siguiente ARTICODI libre
    SELECT numero INTO v_articodi
    FROM (
        SELECT numero
        FROM cpr05.NUMEROS N
        LEFT JOIN cpr05.SAC_ARTICULOS A ON A.ARTICODI = N.NUMERO
        WHERE A.ARTICODI IS NULL AND N.NUMERO >= 800000
        ORDER BY N.NUMERO
    )
    WHERE ROWNUM = 1;

    -- Verificar que no exista descripción duplicada
    SELECT COUNT(0) INTO v_comp
    FROM cpr05.SAC_ARTICULOS
    WHERE ARTIDESC = p_artidesc;

    IF v_comp > 0 THEN
        RAISE_APPLICATION_ERROR(-20001, 'Nombre de artículo ya en uso');
    END IF;

    SELECT CENTABREV, fs.PAISCODI, fs.fechafinacuerdos
    INTO v_centabrev, v_paiscodi, v_hasta
    FROM CPR05.CENTROS c
    INNER JOIN CPR05.FECHAS_SAC fs ON fs.PAISCODI = c.PAISCODI
    WHERE CENTCODI = p_centcodi;

    -- Insertar artículo
    INSERT INTO cpr05.sac_articulos (
        articodi, artidesc, grupcodi, famicodi, sbfmcodi, formcodi, 
        precioreq, artipres, artiprod, artitipo, artimarca, articant, 
        artiunid, ARTIEXCLEUR, ARTIEXCLAME, ARTIGLOBAL, ARTIDOTA, 
        UNIDCODI, UNIDFACTOR, USERID, PAISCODI, ESTACODI, ARTIFULTMOD, 
        artisubasta, ARTIEXCLCUB
    ) VALUES (
        v_articodi, TRIM(p_artidesc), v_grupcodi, v_famicodi, v_sbfmcodi, 
        p_formcodi, v_precioreq, v_artipres, TRIM(p_artidesc), TRIM(v_artitipo), 
        TRIM(v_artimarca), TRIM(v_articant), v_artiunid, 0, 0, v_global, 
        v_artidota, p_unidcodi, p_unidfactor, p_userid, v_paiscodi, 3, 
        SYSDATE, v_artiSubasta, 1
    );

    INSERT INTO cpr05.ARTICULOSEVENTOS (
        ARTICODI, USERID, AREVFECHA, AREVCOMENT, ESTACODIINI, ESTACODIFIN
    ) VALUES (
        v_articodi, p_userid, SYSDATE, 'Alta Ficha Artículo', NULL, NULL
    );

    INSERT INTO cpr05.articulos_reg_mod (
        ARTICODI, ENVIADO, ARTIDESC, GRUPCODI, FAMICODI, SBFMCODI, 
        FORMCODI, PRECIOREQ, ARTIPRES, ARTIPROD, ARTITIPO, ARTIMARCA, 
        ARTICANT, ARTIUNID, ARTIBAJA, ARTIEXCLEUR, ARTIEXCLAME, ARTIGLOBAL, 
        ARTIDOTA, UNIDCODI, UNIDFACTOR, USERID, FECHA
    ) VALUES (
        v_articodi, 0, TRIM(p_artidesc), v_grupcodi, v_famicodi, v_sbfmcodi, 
        p_formcodi, v_precioreq, v_artipres, TRIM(p_artidesc), TRIM(v_artitipo), 
        TRIM(v_artimarca), TRIM(v_articant), v_artiunid, 0, 0, 1, v_global, 
        v_artidota, p_unidcodi, p_unidfactor, p_userid, SYSDATE
    );

    MERGE INTO ead.TRAD_TRADUCCIONES t
    USING (SELECT v_articodi AS v_articodi, p_artidesc AS v_artidesc FROM DUAL)
    ON (TABLCODI = 1 AND IDIOCODI = 34 AND TABLPK = v_articodi)
    WHEN MATCHED THEN
        UPDATE SET TRADDESC = v_artidesc
    WHEN NOT MATCHED THEN
        INSERT (TABLCODI, TABLPK, IDIOCODI, TRADDESC)
        VALUES (1, v_articodi, 34, v_artidesc);

    INSERT INTO cpr05.ARTICULOSCENTROS (
        ARTICODI, CENTCODI, DESDE, HASTA, USERID, FMOD
    ) VALUES (
        v_articodi, p_centcodi, TRUNC(SYSDATE), v_hasta, p_userid, SYSDATE
    );

    INSERT INTO cpr05.ARTICULOSEVENTOS (
        ARTICODI, USERID, AREVFECHA, AREVCOMENT, ESTACODIINI, ESTACODIFIN
    ) VALUES (
        v_articodi, p_userid, SYSDATE, 'Alta Centros Artículo ' || v_centabrev || ' - ' || SYSDATE || ' - ' || v_hasta, NULL, NULL
    );

    UPDATE cpr05.ARTICULOSFORMELAB
    SET ANFOASIGNADO = 0
    WHERE ARTICODI = v_articodi AND ANFOASIGNADO = 1;

    INSERT INTO cpr05.ARTICULOSFORMELAB (
        ARTICODI, ANFOASIGNADO, TPAMCODI, AMBICODI, CENTCODI, UNIDFACTOR, 
        UNIDCODI, ANFOFECULTMOD, ANFOUSRULTMOD
    ) VALUES (
        v_articodi, v_anfoasignado, v_tipoAmb, v_ambito, p_centcodi, 
        p_unidfactor, p_unidcodi, SYSDATE, p_userid
    );

    INSERT INTO API_MAPEOARTICENT (
        CODISAC, CODICENTRO, CENTCODI, FECULTMOD, USRULTMOD, FACTOR
    ) VALUES (
        v_articodi, p_servcodi, p_centcodi, SYSDATE, p_userid, p_unidfactor
    );

    -- ========================================
    -- == DEVOLVER CURSOR CON DATOS DEL ARTICULO ==
    -- ========================================
    OPEN p_result FOR
    SELECT DISTINCT
        ac.articodi, 
        g.grupcodi,
        f.famicodi,
        s.sbfmcodi,
        NVL(DECODE(p_idiocodi, 34, g.grupabrev, NVL(trg.traddesc, NVL(DECODE(v_idiobase, 34, g.grupabrev, trgb.traddesc), trge.traddesc))), g.grupabrev) grupabrev,
        NVL(DECODE(p_idiocodi, 34, f.famidesc, NVL(trf.traddesc, NVL(DECODE(v_idiobase, 34, f.famidesc, trfb.traddesc), trfe.traddesc))), f.famidesc) famidesc,
        NVL(DECODE(p_idiocodi, 34, s.sbfmdesc, NVL(trs.traddesc, NVL(DECODE(v_idiobase, 34, s.sbfmdesc, trsb.traddesc), trse.traddesc))), s.sbfmdesc) sbfmdesc,
        NVL(DECODE(p_idiocodi, 34, a.artidesc, NVL(tra.traddesc, NVL(DECODE(v_idiobase, 34, a.artidesc, trab.traddesc), trae.traddesc))), a.artidesc) artidesc,
        NVL(fl.formcodi, a.formcodi) formcodi,
        GRUP.CUALVALOR TPGRCODI
    FROM (
        SELECT CENTCODI, ARTICODI
        FROM ECONOMATO.ARTICULOSCENTRO
        WHERE CENTCODI = p_centcodi AND ARTICODI = v_articodi
        GROUP BY CENTCODI, ARTICODI
    ) ac
    INNER JOIN CPR05.sac_articulos a ON ac.articodi = a.articodi
    INNER JOIN CPR05.sac_grupos g ON a.grupcodi = g.grupcodi
    INNER JOIN CPR05.sac_subfamilias s ON a.sbfmcodi = s.sbfmcodi
    INNER JOIN CPR05.sac_familias f ON a.famicodi = f.famicodi
    INNER JOIN CPR05.formatos fo ON a.formcodi = fo.formcodi
    INNER JOIN TABLE(CPR05.PCK_CUALIFICADORES.DAME_VALORGRP(p_centcodi, SYSDATE)) GRUP ON GRUP.ARTICODI = ac.articodi
    LEFT JOIN ead.TRAD_TRADUCCIONES tra ON tra.TABLCODI = 1 AND tra.TABLPK = a.articodi AND tra.IDIOCODI = p_idiocodi
    LEFT JOIN ead.TRAD_TRADUCCIONES trab ON trab.TABLCODI = 1 AND trab.TABLPK = a.articodi AND trab.IDIOCODI = v_idiobase
    LEFT JOIN ead.TRAD_TRADUCCIONES trae ON trae.TABLCODI = 1 AND trae.TABLPK = a.articodi AND trae.IDIOCODI = 44
    LEFT JOIN ead.TRAD_TRADUCCIONES trf ON trf.TABLCODI = 92 AND trf.TABLPK = f.famicodi AND trf.IDIOCODI = p_idiocodi
    LEFT JOIN ead.TRAD_TRADUCCIONES trfb ON trfb.TABLCODI = 92 AND trfb.TABLPK = f.famicodi AND trfb.IDIOCODI = v_idiobase
    LEFT JOIN ead.TRAD_TRADUCCIONES trfe ON trfe.TABLCODI = 92 AND trfe.TABLPK = f.famicodi AND trfe.IDIOCODI = 44
    LEFT JOIN ead.TRAD_TRADUCCIONES trg ON trg.TABLCODI = 93 AND trg.TABLPK = g.grupcodi AND trg.IDIOCODI = p_idiocodi
    LEFT JOIN ead.TRAD_TRADUCCIONES trgb ON trgb.TABLCODI = 93 AND trgb.TABLPK = g.grupcodi AND trgb.IDIOCODI = v_idiobase
    LEFT JOIN ead.TRAD_TRADUCCIONES trge ON trge.TABLCODI = 93 AND trge.TABLPK = g.grupcodi AND trge.IDIOCODI = 44
    LEFT JOIN ead.TRAD_TRADUCCIONES trs ON trs.TABLCODI = 99 AND trs.TABLPK = s.sbfmcodi AND trs.IDIOCODI = p_idiocodi
    LEFT JOIN ead.TRAD_TRADUCCIONES trsb ON trsb.TABLCODI = 99 AND trsb.TABLPK = s.sbfmcodi AND trsb.IDIOCODI = v_idiobase
    LEFT JOIN ead.TRAD_TRADUCCIONES trse ON trse.TABLCODI = 99 AND trse.TABLPK = s.sbfmcodi AND trse.IDIOCODI = 44
    LEFT JOIN CPR05.FORMATOS FL ON FL.FORMCODI = CPR05.PCK_LOCALE.FRMBASETOLOCAL(p_centcodi, A.FORMCODI);

EXCEPTION
    WHEN OTHERS THEN
        -- Puedes retornar un cursor vacío o manejar el error de otra forma
        RAISE;
END GUARDAR_FICHA_ARTICULO;
