if (this.stoDescargosLin.count() > 0) {
            this.vtnDescargosLin.panels.descargosLinGrid.listGrid.tablaHTML.desplazarCursorAbsoluto(0, 1);

            for (var cont = 0; cont < this.stoDescargosLin.count(); cont++) {
                var servcodi = this.stoDescargosLin.data.items[cont].data.SERVCODI;
                var desctipo = this.stoDescargosLin.data.items[cont].data.DESCTIPO;

                // Filtra los artículos para el plato actual (puede afectar visualmente)
                this.filtraArticulosPorPlato(servcodi, desctipo);

                // Filtrar detalles reales del store que correspondan a este SERVCODI
                var detallesFiltrados = [];
                this.stoDescargosLinDet.each(function (rec) {
                    if (rec.get("SERVCODI") == servcodi) {
                        detallesFiltrados.push(rec);
                    }
                });

                // Función auxiliar para sumar un campo
                function sumarCampo(lista, campo) {
                    return lista.reduce(function (total, rec) {
                        return total + (rec.get(campo) || 0);
                    }, 0);
                }

                var importe = Common.redondea(sumarCampo(detallesFiltrados, "DELDIMPORTE"), 2);
                var importeLoc = Common.redondea(sumarCampo(detallesFiltrados, "DELDIMPORTELOC"), 2);
                var importeCons = Common.redondea(sumarCampo(detallesFiltrados, "DELDIMPORTECONS"), 2);
                var importeUsd = Common.redondea(sumarCampo(detallesFiltrados, "DELDIMPORTEUSD"), 2);

                var desclin = this.stoDescargosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                // Asignar importes
                desclin.set("DELNIMPORTE", importe);
                desclin.set("DELNIMPORTELOC", importeLoc);
                desclin.set("DELNIMPORTECONS", importeCons);
                desclin.set("DELNIMPORTEUSD", importeUsd);

                // Evitar divisiones por cero
                desclin.set("DELNPRECIO", Common.redondea(desclin.data.DELNCANT ? importe / desclin.data.DELNCANT : 0, 5));
                desclin.set("DELNPRECIOUMB", Common.redondea(desclin.data.DELNCANTUMB ? importeLoc / desclin.data.DELNCANTUMB : 0, 5));
                desclin.set("DELNPRECIOLOC", Common.redondea(desclin.data.DELNCANTUMB ? importeLoc / desclin.data.DELNCANTUMB : 0, 5));
                desclin.set("DELNPRECIOCONS", Common.redondea(desclin.data.DELNCANTUMB ? importeCons / desclin.data.DELNCANTUMB : 0, 5));
                desclin.set("DELNPRECIOUSD", Common.redondea(desclin.data.DELNCANTUMB ? importeUsd / desclin.data.DELNCANTUMB : 0, 5));
                desclin.commit();

                var descelab = this.stoElaboradosLin.findRecord("SERVCODI", servcodi, null, null, null, false);

                if (descelab != null) {
                    descelab.set("DELEIMPORTE", importe);
                    descelab.set("DELEIMPORTELOC", importeLoc);
                    descelab.set("DELEIMPORTECONS", importeCons);
                    descelab.set("DELEIMPORTEUSD", importeUsd);

                    descelab.set("DELEPRECIO", Common.redondea(descelab.data.DELECANT ? importe / descelab.data.DELECANT : 0, 5));
                    descelab.set("DELEPRECIOUMB", Common.redondea(descelab.data.DELECANTUMB ? importeLoc / descelab.data.DELECANTUMB : 0, 5));
                    descelab.set("DELEPRECIOLOC", Common.redondea(descelab.data.DELECANTUMB ? importeLoc / descelab.data.DELECANTUMB : 0, 5));
                    descelab.set("DELEPRECIOCONS", Common.redondea(descelab.data.DELECANTUMB ? importeCons / descelab.data.DELECANTUMB : 0, 5));
                    descelab.set("DELEPRECIOUSD", Common.redondea(descelab.data.DELECANTUMB ? importeUsd / descelab.data.DELECANTUMB : 0, 5));
                    descelab.commit();
                }
            }

            this.actualizaPrecios();
        }