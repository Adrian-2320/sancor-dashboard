import { GraficoBarrasHorizontales, GraficoMensualApilado, GraficoTorta } from "@/components/graficos-ventas";
import { Proyeccion } from "@/components/proyeccion";
import { TablaDetalleVentas, TablaGrupos, TablaMensual } from "@/components/tablas-ventas";
import { Aviso, EncabezadoPagina, SinDatos, Tarjeta, TarjetaKpi } from "@/components/ui";
import { moneda, numero } from "@/lib/format";
import {
  agrupar,
  formaPagoBase,
  rangoDeMeses,
  serieMensual,
  serieMensualPor,
  totales,
} from "@/lib/ventas/metricas";
import { mesActualAR } from "@/lib/ventas/mes-actual";
import type { Venta } from "@/lib/ventas/tipos";

const aBarras = (grupos: { nombre: string; capitas: number }[]) => grupos.map((g) => ({ nombre: g.nombre, valor: g.capitas }));

/** Pantalla completa de ventas: se usa para el tablero general y para cada asesor. */
export function VistaVentas({
  ventas,
  titulo,
  descripcion,
  esAsesor,
}: {
  ventas: Venta[];
  titulo: string;
  descripcion: string;
  esAsesor: boolean;
}) {
  if (ventas.length === 0) {
    return (
      <>
        <EncabezadoPagina titulo={titulo} descripcion={descripcion} />
        <Tarjeta>
          <SinDatos mensaje="Todavía no hay ventas registradas." />
        </Tarjeta>
      </>
    );
  }

  const meses = rangoDeMeses(ventas, mesActualAR());
  const t = totales(ventas);
  const serie = serieMensual(ventas, meses);
  const porPrepagaMes = serieMensualPor(ventas, meses, (v) => v.prepaga);
  const porAsesorMes = serieMensualPor(ventas, meses, (v) => v.asesor);
  const mesesConVenta = serie.filter((p) => p.ventas > 0).length;

  const prepagas = agrupar(ventas, (v) => v.prepaga);
  const planes = agrupar(ventas, (v) => (v.plan ? `${v.prepaga} ${v.plan}` : null));
  const pagos = agrupar(ventas, formaPagoBase);
  const modalidades = agrupar(ventas, (v) => v.modalidad);
  const asesores = agrupar(ventas, (v) => v.asesor);
  const conNota = ventas.filter((v) => v.nota);

  return (
    <>
      <EncabezadoPagina titulo={titulo} descripcion={descripcion} />

      {t.ventasSinCapitas > 0 && (
        <Aviso tono="alerta" titulo="Datos incompletos">
          {t.ventasSinCapitas} {t.ventasSinCapitas === 1 ? "venta no tiene" : "ventas no tienen"} cápitas registradas y no
          suman al total de cápitas. {conNota.length > 0 && "Las aclaraciones aparecen en el detalle, debajo del cliente."}
        </Aviso>
      )}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <TarjetaKpi etiqueta="Ventas" valor={numero(t.ventas)} detalle={`${t.aprobadas} aprobadas`} destacada />
        <TarjetaKpi etiqueta="Cápitas" valor={numero(t.capitas)} detalle={`${numero(t.capitas / Math.max(1, t.ventas - t.ventasSinCapitas))} por venta`} />
        <TarjetaKpi etiqueta="Promedio mensual" valor={`${numero(t.capitas / Math.max(1, meses.length))} cáp.`} detalle={`${meses.length} meses · ${mesesConVenta} con ventas`} />
        <TarjetaKpi etiqueta="Comisión" valor={moneda(t.comision)} detalle={`Cuotas: ${moneda(t.cuotaMensual)}/mes`} />
      </div>

      <Tarjeta titulo="Proyección" descripcion="Mové los controles para estirar la proyección hacia adelante." className="mb-5">
        <Proyeccion serie={serie} />
      </Tarjeta>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <Tarjeta titulo="Cápitas por mes y prepaga">
          <GraficoMensualApilado puntos={porPrepagaMes.puntos} categorias={porPrepagaMes.categorias} />
        </Tarjeta>
        {esAsesor ? (
          <Tarjeta titulo="Prepagas vendidas" descripcion="Participación en cápitas">
            <GraficoTorta datos={aBarras(prepagas)} medida="cápitas" />
          </Tarjeta>
        ) : (
          <Tarjeta titulo="Cápitas por mes y asesor">
            <GraficoMensualApilado puntos={porAsesorMes.puntos} categorias={porAsesorMes.categorias} />
          </Tarjeta>
        )}
      </div>

      {!esAsesor && (
        <Tarjeta titulo="Ventas por asesor" descripcion="Tocá un asesor para ver su tablero, gráficos y proyección." className="mb-5">
          <TablaGrupos grupos={asesores} titulo="Asesor" enlaceAsesor />
        </Tarjeta>
      )}

      <div className="mb-5 grid gap-5 lg:grid-cols-3">
        <Tarjeta titulo="Planes vendidos" descripcion="Cápitas por plan">
          <GraficoBarrasHorizontales datos={aBarras(planes)} medida="cápitas" />
        </Tarjeta>
        <Tarjeta titulo="Formas de pago" descripcion="Cápitas por forma de pago">
          <GraficoBarrasHorizontales datos={aBarras(pagos)} medida="cápitas" />
        </Tarjeta>
        <Tarjeta titulo="Modalidad de contratación" descripcion="Cápitas por modalidad">
          <GraficoBarrasHorizontales datos={aBarras(modalidades)} medida="cápitas" />
        </Tarjeta>
      </div>

      <div className="mb-5 grid gap-5 xl:grid-cols-2">
        <Tarjeta titulo="Detalle por prepaga">
          <TablaGrupos grupos={prepagas} titulo="Prepaga" />
        </Tarjeta>
        <Tarjeta titulo={esAsesor ? "Cápitas por mes y prepaga" : "Cápitas por mes y asesor"}>
          <TablaMensual
            puntos={esAsesor ? porPrepagaMes.puntos : porAsesorMes.puntos}
            categorias={esAsesor ? porPrepagaMes.categorias : porAsesorMes.categorias}
            titulo={esAsesor ? "Prepaga" : "Asesor"}
          />
        </Tarjeta>
      </div>

      <Tarjeta titulo="Detalle de ventas" descripcion="Separado por mes, desde la venta más reciente.">
        <TablaDetalleVentas ventas={ventas} mostrarAsesor={!esAsesor} />
      </Tarjeta>
    </>
  );
}
