SELECT 'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) DESCORIGEN, COUNT(*) NUM
FROM DESCARGOS D
WHERE D.ESTACODI = 0 AND D.CENTCODI = '303'
GROUP BY D.DESCTIPO
UNION ALL
SELECT 'Ventas ' || E.VENTA_ESTADO_DESC TIPO, COUNT(*) NUM
FROM TPV_VENTAS V
INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
WHERE V.VENTA_ESTADO_ID IN (1,3) AND L.CENTCODI = '303'
GROUP BY E.VENTA_ESTADO_DESC






VAR rc REFCURSOR;
EXEC PCK_SAC_MAESTROS.GET_PANEL_DESCPROCES(p_centcodi => '302', p_result => :rc);
PRINT rc;






DESC TPV_VENTAS;



 SELECT 
          CASE D.DESCTIPO
            WHEN 1 THEN 16
            WHEN 2 THEN 17
            WHEN 3 THEN 18
          END AS ABREV,
          'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) AS DESCR,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 90) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM DESCARGOS D
        WHERE D.DESCTOTALLOC > 0
          AND D.ESTACODI IN (2, 9)
        GROUP BY D.DESCTIPO
    
        UNION ALL
    
        -- Ventas por estado con fecha desde TPV_VENTAS_LOTES.FECHA
        SELECT 
          CASE V.VENTA_ESTADO_ID
            WHEN 1 THEN 19
            WHEN 3 THEN 20
          END AS ABREV,
          'Ventas ' || E.VENTA_ESTADO_DESC AS DESCR,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(L.FECHA) BETWEEN TRUNC(SYSDATE - 90) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM TPV_VENTAS V
        INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
        INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
        WHERE V.VENTA_ESTADO_ID IN (1,3)
        GROUP BY V.VENTA_ESTADO_ID, E.VENTA_ESTADO_DESC;
        
        
        
        
        
        
 SELECT 
          CASE D.DESCTIPO
            WHEN 1 THEN 16
            WHEN 2 THEN 17
            WHEN 3 THEN 18
          END AS ABREV,
          'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) AS DESCR,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 3000) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM DESCARGOS D
        WHERE D.DESCTOTALLOC > 0
       -- AND D.ESTACODI IN (1,2,3,0,4)
        AND D.CENTCODI = 14
        GROUP BY D.DESCTIPO
        
        
        
        SELECT 
          CASE D.DESCTIPO
            WHEN 1 THEN 16
            WHEN 2 THEN 17
            WHEN 3 THEN 18
          END AS ABREV,
          'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) AS DESCR,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 3000) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM DESCARGOS D
        WHERE D.DESCTOTALLOC > 0
       AND D.ESTACODI IN (0)
      --  AND D.CENTCODI = p_centcodi
        GROUP BY D.DESCTIPO
    
        UNION ALL
    
        -- Ventas por estado con fecha desde TPV_VENTAS_LOTES.FECHA
        SELECT 
          CASE V.VENTA_ESTADO_ID
            WHEN 1 THEN 19
            WHEN 3 THEN 20
          END AS ABREV,
          'Ventas ' || E.VENTA_ESTADO_DESC AS DESCR,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(L.FECHA) BETWEEN TRUNC(SYSDATE - 90) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM TPV_VENTAS V
        INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
        INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
        WHERE V.VENTA_ESTADO_ID IN (1,3)
        --  AND L.CENTCODI = p_centcodi
        GROUP BY V.VENTA_ESTADO_ID, E.VENTA_ESTADO_DESC;
      
        
        
        
        
        
        
        
        
        
        
        
        
        
        SELECT 'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) DESCORIGEN, COUNT(*) NUM
FROM DESCARGOS D
WHERE D.ESTACODI = 0 AND D.CENTCODI = '303'
GROUP BY D.DESCTIPO
UNION ALL
SELECT 'Ventas ' || E.VENTA_ESTADO_DESC TIPO, COUNT(*) NUM
FROM TPV_VENTAS V
INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
WHERE V.VENTA_ESTADO_ID IN (1,3) AND L.CENTCODI = '303'
GROUP BY E.VENTA_ESTADO_DESC
        
        
        
        OPEN p_result FOR
-- Emular todos los tipos posibles
WITH TIPOS_DESCARGOS AS (
    SELECT 1 AS DESCTIPO FROM DUAL
    UNION ALL
    SELECT 2 FROM DUAL
    UNION ALL
    SELECT 3 FROM DUAL
),
TIPOS_VENTAS AS (
    SELECT 1 AS VENTA_ESTADO_ID FROM DUAL
    UNION ALL
    SELECT 3 FROM DUAL
)

-- Descargos por tipo
SELECT 
    CASE TD.DESCTIPO 
        WHEN 1 THEN 16 
        WHEN 2 THEN 17 
        WHEN 3 THEN 18 
    END AS ABREV,
    'Descargos ' || DECODE(TD.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé') AS DESCR,
    COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
    COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
    COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 3000) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
FROM TIPOS_DESCARGOS TD
LEFT JOIN DESCARGOS D
  ON D.DESCTIPO = TD.DESCTIPO
  AND D.ESTACODI = 0
  AND D.CENTCODI = 14
GROUP BY TD.DESCTIPO

UNION ALL

-- Ventas por estado
SELECT 
    CASE TV.VENTA_ESTADO_ID 
        WHEN 1 THEN 19 
        WHEN 3 THEN 20 
    END AS ABREV,
    'Ventas ' || DECODE(TV.VENTA_ESTADO_ID, 1, 'Nueva', 3, 'Error') AS DESCR,
    COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
    COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
    COUNT(CASE WHEN TRUNC(L.FECHA) BETWEEN TRUNC(SYSDATE - 900) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
FROM TIPOS_VENTAS TV
LEFT JOIN TPV_VENTAS V ON V.VENTA_ESTADO_ID = TV.VENTA_ESTADO_ID
LEFT JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID AND L.CENTCODI = 14
GROUP BY TV.VENTA_ESTADO_ID;

        
        
        
        
        
        
        
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
       -- AND v.ACTIVO = 1
        
        --AND (p_centcodi IS NULL OR l.CENTCODI = p_centcodi)
        --AND l.LOTE_ID = 5522
        /*AND l.FECHA = '26/03/2025'
        AND l.CENTCODI = '302'*/
        ORDER BY l.CENTCODI, l.LOTE_ID;
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        OPEN p_result FOR
    WITH TIPOS_DESCARGOS AS (
        SELECT 1 AS DESCTIPO FROM DUAL
        UNION ALL
        SELECT 2 FROM DUAL
        UNION ALL
        SELECT 3 FROM DUAL
    ),
    TIPOS_VENTAS AS (
        SELECT 1 AS VENTA_ESTADO_ID FROM DUAL
        UNION ALL
        SELECT 3 FROM DUAL
    )
    
    -- Descargos por tipo
    SELECT 
        CASE TD.DESCTIPO 
            WHEN 1 THEN 16 
            WHEN 2 THEN 17 
            WHEN 3 THEN 18 
        END AS ABREV,
        'Descargos ' || DECODE(TD.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé') AS DESCR,
        COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
        COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
        COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 3000) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
    FROM TIPOS_DESCARGOS TD
    LEFT JOIN DESCARGOS D
      ON D.DESCTIPO = TD.DESCTIPO
      AND D.CENTCODI = 14
    GROUP BY TD.DESCTIPO
    
    UNION ALL
    
    -- Ventas por estado
    SELECT 
        CASE TV.VENTA_ESTADO_ID 
            WHEN 1 THEN 19 
            WHEN 3 THEN 20 
        END AS ABREV,
        'Ventas ' || DECODE(TV.VENTA_ESTADO_ID, 1, 'Nueva', 3, 'Error') AS DESCR,
        COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
        COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
        COUNT(CASE WHEN TRUNC(L.FECHA) BETWEEN TRUNC(SYSDATE - 900) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
    FROM TIPOS_VENTAS TV    
    LEFT JOIN TPV_VENTAS V ON V.VENTA_ESTADO_ID = TV.VENTA_ESTADO_ID
    LEFT JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID AND L.CENTCODI = 14
    WHERE V.VENTA_ESTADO_ID IN (1,3)
    AND L.CENTCODI = 14

    GROUP BY TV.VENTA_ESTADO_ID;






    DESC TPV_VENTAS;
SELECT 
          CASE D.DESCTIPO
            WHEN 1 THEN 16
            WHEN 2 THEN 17
            WHEN 3 THEN 18
          END AS ABREV,
          'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) AS DESCR,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(D.DESCFECHAVALIDACION) BETWEEN TRUNC(SYSDATE - 90) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM DESCARGOS D
        WHERE D.DESCTOTALLOC >= 0
          AND D.ESTACODI IN (2, 9)
        GROUP BY D.DESCTIPO
    
        UNION ALL
    
        -- Ventas por estado con fecha desde TPV_VENTAS_LOTES.FECHA
        SELECT 
          CASE V.VENTA_ESTADO_ID
            WHEN 1 THEN 19
            WHEN 3 THEN 20
          END AS ABREV,
          'Ventas ' || E.VENTA_ESTADO_DESC AS DESCR,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE) THEN 1 END) AS HOY,
          COUNT(CASE WHEN TRUNC(L.FECHA) = TRUNC(SYSDATE - 1) THEN 1 END) AS AYER,
          COUNT(CASE WHEN TRUNC(L.FECHA) BETWEEN TRUNC(SYSDATE - 90) AND TRUNC(SYSDATE - 2) THEN 1 END) AS ANTIGUO
        FROM TPV_VENTAS V
        INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
        INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
        WHERE V.VENTA_ESTADO_ID IN (1,3)
        GROUP BY V.VENTA_ESTADO_ID, E.VENTA_ESTADO_DESC;
        
        
        
        
        
        
        
        
        
                SELECT 'Descargos ' || DECODE(D.DESCTIPO, 1, 'Elaboración', 2, 'Venta', 3, 'Relevé', NULL) DESCORIGEN, COUNT(*) NUM
FROM DESCARGOS D
WHERE D.ESTACODI = 0 AND D.CENTCODI = '303'
GROUP BY D.DESCTIPO
UNION ALL
SELECT 'Ventas ' || E.VENTA_ESTADO_DESC TIPO, COUNT(*) NUM
FROM TPV_VENTAS V
INNER JOIN TPV_VENTAS_LOTES L ON L.LOTE_ID = V.LOTE_ID
INNER JOIN TPV_VENTAS_ESTADOS E ON E.VENTA_ESTADO_ID = V.VENTA_ESTADO_ID
WHERE V.VENTA_ESTADO_ID IN (1,3) AND L.CENTCODI = '303'
GROUP BY E.VENTA_ESTADO_DESC
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
        
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
      --  AND p_reprocesar_lotes = 1
       -- AND (p_centcodi IS NULL OR l.CENTCODI = 302)
        --AND l.LOTE_ID = 5522
        /*AND l.FECHA = '26/03/2025'
        AND l.CENTCODI = '302'*/
        ORDER BY l.CENTCODI, l.LOTE_ID;












app/view/extractionvoucher maincontroller.js

         loadGetAll: function (data) maincontroller.js extractionvoucher

          loadGetAll: function (data) {
     var obj = Ext.decode(data.responseText);
     var grid = this.lookup('grid');
     var store = grid.getStore();

     store.clearFilter();
     store.removeAll();

     if (obj.datos.VALESEXT && obj.datos.VALESEXT.length > 0) {
         //pdte autor = 3       prc.srv = 8       pendiente=0       servido=6
         let filteredData = obj.datos.VALESEXT.filter(record => record.ESTACODI !== 0 && record.ESTACODI !== 6 && record.ESTACODI !== 3);
         store.loadData(filteredData);
     }
 },



list.js en modern/src/view/extractionVoucherDetail/list.js
{
    xtype: 'gridcolumn',
    dataIndex: 'GRUPDESC',
    reference: 'groupcolumn',
    hidden: true,
    localized: {
        text: '{extractionVoucherDetail.form.group}'
    },
    width: 150
},
{
    xtype: 'gridcolumn',
    dataIndex: 'FAMIDESC',
    reference: 'familycolumn',
    hidden: true,
    localized: {
        text: '{extractionVoucherDetail.form.family}'
    },
    width: 120
},
{
    xtype: 'gridcolumn',
    dataIndex: 'SBFMDESC',
    reference: 'subfamilycolumn',
    hidden: true,
    localized: {
        text: '{extractionVoucherDetail.form.subfamily}'
    },
    width: 120
},


app/view/intersectionOfflineFilter maincontrolle.js
    // Vouchers from the selected subwarehouse and with status != 0
    var vouchergrid = me.lookup('vouchergrid');
    var voucherStore = vouchergrid.getStore();

    voucherStore.clearFilter();
    voucherStore.removeAll();

    if (obj.datos.VALESEXTRACCION && obj.datos.VALESEXTRACCION.length > 0) {
        voucherStore.loadData(obj.datos.VALESEXTRACCION);
        voucherStore.filter(function (record) {
            return (record.get('VALDPTO') === subwarehouse || record.get('SOLIA') === subwarehouse) &&
                record.get('ESTACODI') !== 0 && record.get('ESTACODI') !== 6 && record.get('ESTACODI') !== 3;
            
        });
    }

