PROCEDURE ALBARANESENTRADA_CREAR_MOB(
      p_centcodi in varchar2,
      p_albafec in date,
      p_coddpto in number,
      p_codprov in number,
      p_numalbprov in varchar2,
      p_origen in number,
      p_tipo in number,
      p_razon in varchar2,
      p_distribuido in varchar2,
      p_facturado in varchar2,
      p_monecodi in number,
      p_epigrafe in varchar2,
   --   p_numeroDua in varchar2,
      p_numeroFactura in number,
      P_EXPECODI in number,
      p_albaFact in number,
      p_userid in number,
      p_pedicodi in number,
      newnumseq OUT VARCHAR2
  ) AS
      pconfvalue NUMBER;
      pconfdesc VARCHAR2(100);
      Pip VARCHAR2(15);
      v_monecodi Number;
      v_monecodiloc Number;
      v_monecodiexpe NUMBER;
      v_simecodi Number;
      numfact number;
      totalfact number;
      porcfact number;
      v_expetc number;
      v_exfatc number;
      v_expeimportepend number;
      v_exfatotalloc number;
      v_exfafechafact DATE;
      v_EXFATOTAL number;
      v_sumfact NUMBER;
      v_expeimporte NUMBER;
      v_percent NUMBER;
      expedienteestacodi number;
      v_importepend number;
      v_count number;
      v_cierres sys_refcursor;
      v_dproximocierremercaderias date;
      v_dUltimoCierreMercaderias date;
      v_idiasmercaderias number;
      v_dproximocierreotros date;
      v_iDiasOtros number;
      v_dUltimoCierreOtros DATE;
      V_Proximocierre date;
      v_ultimocierre date;
      v_albafact number;
      v_EXFATOTALDUA NUMBER;
      v_exfanumfacprov VARCHAR2(20);
      v_exfaprvecodiprov NUMBER;
      v_centprecision NUMBER;
      V_Eur number;
      V_Usd number;
      V_Loc number;
  BEGIN
    newnumseq := -1;
    Pconfdesc := 'ALBARANES';

    PCK_SAC_CIERRES.CIERRES_GET_FECHASULTIMOCIERRE(p_centcodi, 1, v_cierres);

    LOOP
        FETCH v_cierres INTO v_dProximoCierreMercaderias, v_iDiasMercaderias, v_dUltimoCierreMercaderias, v_dProximoCierreOtros, v_iDiasOtros, v_dUltimoCierreOtros;
        exit when v_cierres%notfound;
        if p_tipo=1 then
            V_Proximocierre:= V_Dproximocierremercaderias;
            v_ultimocierre:= v_dUltimoCierreMercaderias;
        else
            v_proximocierre:= v_dProximoCierreOtros;
            v_ultimocierre:= v_dUltimoCierreOtros;
        end if;
    END LOOP;

    IF p_albafec <=v_ultimocierre THEN
          raise_application_error(-20001, 'El albarán no puede crear porque el mes ya está cerrado.'); --No saldra este mensage en el clliente
    END IF;

    select monecodi, simecodi, centalbafact, centprecision into v_monecodiloc, v_simecodi, v_albafact, v_centprecision from cpr05.centros  where centcodi=p_centcodi;

    V_Eur := ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', p_albafec, p_monecodi, 1,  1));
    V_Usd := ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', p_albafec, p_monecodi, 2,  1));
    V_Loc := ROUND_TC(EAD.PCK_COTIZACIONES.GET_CONVERSION_ITR('M', p_albafec, p_monecodi, v_monecodiloc,  1));

    IF v_albafact = 1 THEN
        v_albafact := 1;
    ELSE
        v_albafact := p_albafact;
    END IF;
/* 
    -- Entrada
    SELECT count(*) INTO v_count from albaranes where UPPER(albacodialbaprov) = UPPER(p_numalbprov) and ALBAPRVECODIPROV = p_codprov and centcodi = p_centcodi AND estacodi not in (-1,1,7) and trunc(albafecha,'YYYY') =  trunc(p_albafec,'YYYY');
    IF v_count > 0 THEN
      RAISE_APPLICATION_ERROR(-20010, 'Ya existe el número de albarán para el proveedor especificado.');
    END IF;
    --Devolución
    SELECT count(*) into v_count from albaranesdev where UPPER(albacodialbaprov) = UPPER(p_numalbprov) and ALBAPRVECODIPROV = p_codprov AND estacodi not in (-1,0,1) AND CENTCODI = p_centcodi  and trunc(albafecha,'YYYY') =  trunc(p_albafec,'YYYY');
    IF V_COUNT > 0 THEN
        RAISE_APPLICATION_ERROR(-20010, 'Ya existe el número de albarán para el proveedor especificado.');
    end if;
*/ 
    SELECT confvalue INTO pconfvalue
    FROM CONFIGURACION
    WHERE centcodi = p_centcodi AND confdesc = Pconfdesc FOR UPDATE;

    pconfvalue:= pconfvalue + 1;

    /*
    IF  NOT p_numeroFactura IS NULL and NOT p_expecodi IS NULL THEN
        SELECT ef.MONECODIFACT, ef.exfafechafact, ef.EXFATOTALDUA, ef.exfatc, EXFANUMFACPROV, EXFAPRVECODIPROV into v_monecodi, v_exfafechafact, v_EXFATOTALDUA, v_exfatc, v_exfanumfacprov, v_exfaprvecodiprov FROM EXPEDIENTESFACTURAS ef WHERE  ef.CENTCODI= p_centcodi AND ef.EXFALNNUM = p_numeroFactura and ef.EXPECODI=p_expecodi;
        SELECT e.MONECODI,e.expeimporte, e.expetc into v_monecodiexpe, v_expeimporte, v_expetc FROM EXPEDIENTES e WHERE e.CENTCODI = p_centcodi and e.EXPECODI=p_expecodi;
    ELSE
        v_monecodi := p_monecodi;  -- v_monecodi:=15;
    END IF;
    */

    --IF v_monecodi IS NULL THEN
        v_monecodi:= nvl(p_monecodi, v_monecodiloc);
    --END IF;

    INSERT INTO ALBARANES
      (CENTCODI, ALBACODI, SBALCODI,         ALBAPRVECODIPROV,  ALBAPRVECODIDIST,   ALBAPRVECODIFACT,   ALBAFECHA, ALBACODIALBAPROV, ESTACODI, ALBAFECHAULTCAMB, TPGRCODI, EPIGRAFE, TPOPCODI, EXPECODI, EXFACODI, ALBAPEDIDOS, USERID, MONECODILOC, MONECODI, SIMECODI, SIMECODILOC, ALBAFACT)
    VALUES
      (p_centcodi, PCONFVALUE, p_coddpto,   p_codprov,          p_distribuido,      p_facturado,        TRUNC(p_albafec), p_numalbprov, 0, sysdate, p_tipo, p_epigrafe, p_origen, null, null, p_pedicodi, p_userid, v_monecodiloc, v_monecodi, v_simecodi, v_simecodi, nvl(v_albafact, 0));

    -- ACTUALIZAMOS EL VALOR DE LA SECUENCIA --
    UPDATE CONFIGURACION SET 
      confvalue = pconfvalue
     WHERE centcodi = p_centcodi AND confdesc = Pconfdesc;

    newnumseq := pconfvalue;

    -- CREAMOS LÍNEAS
    INSERT INTO ALBARANESLINEAS
          (CENTCODI,ALBACODI,ABLNNUM,ARTICODI,PEDICODI,
          ABLNCANT,ABLNCANTUMB,ABLNCANTINC,ABLNPRBRUTO,
          ABLNPORCDTO,ABLNPORCDTO1,ABLNPORCDTO2,ABLNPORCDTO3,
          ABLNPRNETO,/*ABLNPRINCR,ABLNPRTASA,*/ABLNIMPORTE,
          ABLNFORMATOCOMPRA,ABLNFACTORCONVERSION,
          ABLNFACTORCONVERSIONUMB,ACUEREFPROV,ABLNCOMEN,
          ABLNPRBRUTOCONS,ABLNPRBRUTOUSD,ABLNPRBRUTOLOC,
          ABLNPRNETOCONS,ABLNPRNETOUSD,ABLNPRNETOLOC,
          --ABLNPRINCRCONS,ABLNPRINCRUSD,ABLNPRINCRLOC,
          --ABLNPRTASACONS,ABLNPRTASAUSD,ABLNPRTASALOC,
          ABLNIMPORTECONS,ABLNIMPORTEUSD,ABLNIMPORTELOC,
          PELNNUM,INDICE,ABLNLOTE,ESTACODI,ABLNCANTPEND,
          ABLNCANTPENDUMB,ABLNPRBRUTOUMB,ABLNPRNETOUMB,
          SBALVIRTUAL, ABLNUDSGRATUITAS, ABLNUDSGRATUITASUMB,
          ACUCGRATUDSGRAT, ACUCGRATUDSCOMP, ABLNPRPROMO)
     SELECT
        -- CENTCODI, ALBACODI, ABLNNUM, ARTICODI, PEDICODI
        P.CENTCODI, pconfvalue, ROWNUM, PLN.ARTICODI, P.PEDICODI,
        -- ABLNCANT, ABLNCANTUMB, ABLNCANTINC
        0, 0, 0,
        --0, 0, pln.pelncant,
        -- ABLNPRBRUTO
        ROUND_PRC(PCK_SAC_ALBARANESENTRADA.CALCULAR_BRUTO( pln.pelnprecio,pln.acuedtogeneral,pln.acuedto1,pln.acuedto2,pln.acuedto3) ),
        -- ABLNPORCDTO, ABLNPORCDTO1, ABLNPORCDTO2, ABLNPORCDTO3
        NVL (NVL (pln.acuedtogeneral, pln.acuedtogeneral), 0),
        NVL (NVL (pln.acuedto1, pln.acuedto1 ), 0),
        NVL (NVL (pln.acuedto2, pln.acuedto2 ), 0),
        NVL (NVL (pln.acuedto3, pln.acuedto3), 0),
        -- ABLNPRNETO
        ROUND_PRC(pln.pelnprecio),
        -- ABLNPRINCR
        --NULL,
        -- ABLNPRTASA
        --NULL,
        -- ABLNIMPORTE
        0,
        -- ABLNFORMATOCOMPRA, ABLNFACTORCONVERSION
        pln.fococodi, ROUND_TC(CPR05.PCK_LOCALE.UNMConverter(p.simecodi, ar.FORMCODI, p.simecodiloc, pln.ACUEFACTORCONVER)),
        -- ABLNFACTORCONVERSIONUMB
        ROUND_TC(CPR05.PCK_LOCALE.UNMLOCALTOBASECNT(p_CENTCODI, ar.FORMCODI, pln.ACUEFACTORCONVER)),
        -- ACUEREFPROV, ABLNCOMEN
        pln.acuerefprov, pln.pelncomentario,
        -- ABLNPRBRUTOCONS
        ROUND_PRC(PCK_SAC_ALBARANESENTRADA.CALCULAR_BRUTO( pln.acueprecioumb * v_Eur,pln.acuedtogeneral,pln.acuedto1,pln.acuedto2,pln.acuedto3) ),        
        -- ABLNPRBRUTOUSD
        ROUND_PRC(PCK_SAC_ALBARANESENTRADA.CALCULAR_BRUTO( pln.acueprecioumb * v_Usd,pln.acuedtogeneral,pln.acuedto1,pln.acuedto2,pln.acuedto3) ),                 
        -- ABLNPRBRUTOLOC
        ROUND_PRC(PCK_SAC_ALBARANESENTRADA.CALCULAR_BRUTO( pln.acueprecioumb * v_Loc,pln.acuedtogeneral,pln.acuedto1,pln.acuedto2,pln.acuedto3) ), 
        -- ABLNPRNETOCONS
            ROUND_PRC(pln.acueprecioumb * v_Eur), 
        -- ABLNPRNETOUSD
            ROUND_PRC(pln.acueprecioumb * v_Usd),
        -- ABLNPRNETOLOC 
            ROUND_PRC(pln.acueprecioumb * v_Loc),
        -- ABLNPRINCRCONS,ABLNPRINCRUSD,ABLNPRINCRLOC,
        --NULL, NULL, NULL,
        -- ABLNPRTASACONS,ABLNPRTASAUSD,ABLNPRTASALOC,
        --NULL, NULL, NULL,
        -- ABLNIMPORTECONS
        0,
        -- ABLNIMPORTEUSD
        0,
        -- ABLNIMPORTELOC
        0,
        -- PELNNUM, INDICE, ABLNLOTE, ESTACODI, ABLNCANTPEND,
        PLN.PELNNUM, 0, NULL, 0, NVL (pln.pelncant, 0) - NVL (pln.pelncantserv, 0),
        -- ABLNCANTPENDUMB
        NVL (pln.pelncantumb, 0) - NVL (pln.pelncantservumb, 0),
        -- ABLNPRBRUTOUMB
        ROUND_PRC(PCK_SAC_ALBARANESENTRADA.CALCULAR_BRUTO(pln.acueprecioumb,pln.acuedtogeneral,pln.acuedto1,pln.acuedto2,pln.acuedto3) ),
        -- ABLNPRNETOUMB
        ROUND_PRC(pln.acueprecioumb),
        -- SBALVIRTUAL, ABLNUDSGRATUITAS, ABLNUDSGRATUITASUMB
        pln.sbalvirtual, NULL, NULL,
        -- ACUCGRATUDSGRAT, ACUCGRATUDSCOMP, ABLNPRPROMO
        ACUCGRATUDSGRAT, ACUCGRATUDSCOMP, NULL
    FROM pedidoslineas pln
          INNER JOIN pedidos p ON p.PEDICODI = pln.PEDICODI AND p.CENTCODI = pln.CENTCODI
          INNER JOIN CPR05.centros c ON p.centcodi = c.centcodi
          INNER JOIN CPR05.sac_articulos ar ON  ar.articodi= pln.articodi
    WHERE pln.centcodi = p_centcodi
        AND pln.pedicodi = p_pedicodi
        AND NVL(ABS(pln.pelncantserv), 0) < NVL(ABS(pln.pelncant), 0) 
        AND NVL(pln.estacodi, 0) <> 6   
        AND PCK_SAC_PEDIDOS.LineaPendiente2 (pln.pelncant, pln.pelncantserv, pln.estacodi ) = 1
    ORDER BY pln.PELNNUM ASC;

    UPDATE ALBARANES A SET
        ALBATOTAL = (SELECT SUM(ABLNIMPORTE + ROUND_IMP(NVL(ABLNPRINCR, 0)) + ROUND_IMP(ABLNPRTASA)) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBATOTALLOC = (SELECT SUM(ABLNIMPORTELOC + ROUND_IMP(ABLNPRINCRLOC) + ROUND_IMP(ABLNPRTASALOC)) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBATOTALCONS = (SELECT SUM(ABLNIMPORTECONS + ROUND_IMP(ABLNPRINCRCONS) + ROUND_IMP(ABLNPRTASACONS)) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBATOTALUSD = (SELECT SUM(ABLNIMPORTEUSD + ROUND_IMP(ABLNPRINCRUSD) + ROUND_IMP(ABLNPRTASAUSD)) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBAIMPORTE = (SELECT SUM(ABLNIMPORTE) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBAIMPORTECONS = (SELECT SUM(ABLNIMPORTECONS) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBAIMPORTEUSD = (SELECT SUM(ABLNIMPORTEUSD) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBAIMPORTELOC  = (SELECT SUM(ABLNIMPORTELOC) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBANUMLINPEND = (SELECT COUNT(*) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI),
        ALBAIMPORTEPEND = (SELECT SUM(ABLNIMPORTE) FROM ALBARANESLINEAS AL WHERE AL.ALBACODI = A.ALBACODI AND AL.CENTCODI = A.CENTCODI)
    WHERE CENTCODI = P_CENTCODI AND ALBACODI = PCONFVALUE;
    
    PCK_SAC_ALBARANESENTRADA_MOB.ALBARANES_EVENTOS_ADD(PCONFVALUE, P_CENTCODI, 49, 'CREADO', P_USERID);

  END ALBARANESENTRADA_CREAR_MOB;