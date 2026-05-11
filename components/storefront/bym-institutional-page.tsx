import type { ReactNode } from "react";
import {
  Award,
  Building2,
  CheckCircle2,
  Clock,
  MapPin,
  RefreshCw,
  Sparkles,
  Target,
  Truck,
  Wrench,
} from "lucide-react";

import type { InstitutionalPageData } from "@/app/(storefront)/_lib/institutional-page-data";

export type BymInstitutionalPath =
  | "/sobre-nosotros"
  | "/envios-y-entregas"
  | "/cambios-y-devoluciones";

type BymInstitutionalPageProps = {
  data: InstitutionalPageData;
  pathname: BymInstitutionalPath;
  title: string;
};

type InfoCardProps = {
  children: ReactNode;
  title: string;
};

type SectionProps = {
  children: ReactNode;
  eyebrow?: string;
  icon?: ReactNode;
  title: string;
};

const bymInstitutionalPaths = new Set<string>([
  "/sobre-nosotros",
  "/envios-y-entregas",
  "/cambios-y-devoluciones",
]);

export function isBymInstitutionalPath(pathname: string): pathname is BymInstitutionalPath {
  return bymInstitutionalPaths.has(pathname);
}

function resolveWhatsappHref(data: InstitutionalPageData): string | undefined {
  const whatsapp = data.bootstrap?.contact?.whatsapp;
  if (!whatsapp) return undefined;
  if (whatsapp.startsWith("http")) return whatsapp;
  return `https://wa.me/${whatsapp.replace(/\D/g, "")}`;
}

function BymInstitutionalHero({
  data,
  eyebrow,
  title,
  description,
}: {
  data: InstitutionalPageData;
  eyebrow: string;
  title: string;
  description: string;
}) {
  const whatsappHref = resolveWhatsappHref(data);

  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#070707] px-4 pb-12 pt-[calc(var(--bym-shell-header-height)+56px)] text-white sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_18%_20%,rgba(244,197,66,0.24),transparent_34%),radial-gradient(circle_at_78%_8%,rgba(255,255,255,0.13),transparent_24%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-8 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-end">
        <div className="max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#f4c542]">
            {eyebrow}
          </p>
          <h1 className="mt-5 max-w-4xl text-5xl font-black leading-[0.92] tracking-tight sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
            {description}
          </p>
        </div>

        <aside className="grid gap-3 border border-white/12 bg-white/[0.04] p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/42">
            Atención comercial
          </p>
          {data.contactEntries.map((entry) => (
            <div key={`${entry.label}:${entry.value}`} className="grid gap-1 text-sm">
              <span className="text-white/44">{entry.label}</span>
              {entry.href ? (
                <a className="font-semibold text-white hover:text-[#f4c542]" href={entry.href}>
                  {entry.value}
                </a>
              ) : (
                <span className="font-semibold text-white">{entry.value}</span>
              )}
            </div>
          ))}
          {whatsappHref ? (
            <a
              className="mt-3 inline-flex min-h-11 items-center justify-center border border-[#f4c542] px-4 text-xs font-black uppercase tracking-[0.18em] text-[#f4c542] transition hover:bg-[#f4c542] hover:text-black"
              href={whatsappHref}
            >
              Escribir por WhatsApp
            </a>
          ) : null}
        </aside>
      </div>
    </section>
  );
}

function BymInstitutionalSection({ children, eyebrow, icon, title }: SectionProps) {
  return (
    <section className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:px-8 lg:py-16">
      <div className="space-y-4">
        {icon ? <div className="text-[#f4c542]">{icon}</div> : null}
        {eyebrow ? (
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#f4c542]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="text-3xl font-black leading-tight text-white sm:text-4xl">{title}</h2>
      </div>
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function InfoCard({ children, title }: InfoCardProps) {
  return (
    <article className="border border-white/12 bg-white/[0.04] p-6 text-white">
      <h3 className="text-xl font-black">{title}</h3>
      <div className="mt-3 text-sm leading-7 text-white/66">{children}</div>
    </article>
  );
}

function CheckList({ items }: { items: string[] }) {
  return (
    <ul className="grid gap-2">
      {items.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#f4c542]" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function SobreNosotrosContent() {
  return (
    <>
      <BymInstitutionalSection
        eyebrow="Nuestra historia"
        icon={<Building2 className="h-9 w-9" />}
        title="De lubricentro familiar a solución integral para el vehículo"
      >
        <div className="grid gap-5 lg:grid-cols-3">
          <InfoCard title="El comienzo">
            BYM nació hace más de 25 años como un lavadero de vehículos impulsado por Cesar
            Badino y Ariel Monti. La cercanía con el rubro y el trabajo cotidiano fueron
            marcando el crecimiento.
          </InfoCard>
          <InfoCard title="Crecimiento gradual">
            Primero llegaron los lubricantes y filtros. Después se sumaron repuestos,
            tren delantero, mecánica, gomería y neumáticos para completar una atención más
            amplia.
          </InfoCard>
          <InfoCard title="Hoy">
            La empresa continúa con una segunda generación dentro del equipo, manteniendo
            la misma idea de origen: trabajo inteligente, trabajo duro y orden.
          </InfoCard>
        </div>
        <div className="border-l-4 border-[#f4c542] bg-[#f4c542]/10 p-6 text-sm leading-7 text-white/72">
          <strong className="text-white">BYM significa Badino Y Monti.</strong> El nombre
          representa la sociedad, la amistad y el compromiso familiar que sostienen a la
          empresa desde sus inicios.
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Servicios"
        icon={<Wrench className="h-9 w-9" />}
        title="Todo lo importante para mantener el vehículo en movimiento"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Lubricentro">
            <CheckList items={["Cambio de aceite", "Filtros", "Servicio completo"]} />
          </InfoCard>
          <InfoCard title="Gomería">
            <CheckList items={["Instalación de neumáticos", "Balanceo y alineación", "Reparación de pinchaduras"]} />
          </InfoCard>
          <InfoCard title="Mecánica">
            <CheckList items={["Mecánica liviana", "Mecánica pesada", "Tren delantero"]} />
          </InfoCard>
          <InfoCard title="Diagnóstico y ECUs">
            <CheckList items={["Diagnóstico electrónico", "Reprogramaciones", "Optimización de unidades de control"]} />
          </InfoCard>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Reconocimiento"
        icon={<Award className="h-9 w-9" />}
        title="TOP 5 HANKOOK ARGENTINA 2025"
      >
        <div className="border border-[#f4c542]/35 bg-[#f4c542]/10 p-7">
          <p className="max-w-3xl text-lg leading-8 text-white/76">
            BYM fue reconocido como uno de los distribuidores destacados de Hankook en
            Argentina. Ese logro resume años de inversión en herramientas, atención y
            especialización en neumáticos.
          </p>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Valores"
        icon={<Target className="h-9 w-9" />}
        title="La forma de trabajar"
      >
        <div className="grid gap-5 md:grid-cols-3">
          <InfoCard title="Trabajo inteligente">
            Procesos claros, tecnología y decisiones pensadas para resolver más rápido.
          </InfoCard>
          <InfoCard title="Trabajo duro">
            Dedicación diaria para sostener calidad, stock y respuesta comercial.
          </InfoCard>
          <InfoCard title="Orden">
            Organización en cada detalle para que la compra y el servicio sean confiables.
          </InfoCard>
        </div>
      </BymInstitutionalSection>
    </>
  );
}

function EnviosContent({ data }: { data: InstitutionalPageData }) {
  return (
    <>
      <BymInstitutionalSection
        eyebrow="Cobertura"
        icon={<MapPin className="h-9 w-9" />}
        title="Despachos a todo el país"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Transportes">
            Trabajamos despachos con Andreani y Vía Cargo para productos seleccionados,
            según disponibilidad, zona y condiciones comerciales vigentes.
          </InfoCard>
          <InfoCard title="Retiro en sucursal">
            {data.bootstrap?.contact?.address
              ? `También podés coordinar retiro en ${data.bootstrap.contact.address}.`
              : "También podés coordinar retiro en sucursal por los canales publicados."}
          </InfoCard>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Tiempos"
        icon={<Clock className="h-9 w-9" />}
        title="Preparación y seguimiento"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Preparación del pedido">
            El despacho se coordina una vez confirmado el pago y validada la disponibilidad
            del producto. En productos con entrega desde proveedor, el plazo puede variar.
          </InfoCard>
          <InfoCard title="Seguimiento">
            Cuando el pedido sea despachado, se informa el canal de seguimiento o la
            referencia necesaria para consultar el estado del envío.
          </InfoCard>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Antes de comprar"
        icon={<Truck className="h-9 w-9" />}
        title="Qué revisar"
      >
        <InfoCard title="Condiciones importantes">
          <CheckList
            items={[
              "Confirmar disponibilidad del producto y zona de entrega.",
              "Revisar costos de envío antes de finalizar la compra.",
              "Conservar el comprobante de pago y los datos del pedido.",
              "Coordinar por WhatsApp si necesitás entrega especial o retiro.",
            ]}
          />
        </InfoCard>
      </BymInstitutionalSection>
    </>
  );
}

function ReturnsContent() {
  return (
    <>
      <BymInstitutionalSection
        eyebrow="Condiciones"
        icon={<RefreshCw className="h-9 w-9" />}
        title="Cambios y devoluciones"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <InfoCard title="Para solicitar un cambio">
            Contactanos indicando el número de pedido, el producto comprado y el motivo de
            la solicitud. El equipo revisará el caso y te indicará los pasos a seguir.
          </InfoCard>
          <InfoCard title="Conservá el comprobante">
            Conservá el comprobante de compra, embalaje y accesorios. El producto debe
            encontrarse en condiciones aptas para poder evaluar el cambio o devolución.
          </InfoCard>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Proceso"
        icon={<CheckCircle2 className="h-9 w-9" />}
        title="Paso a paso"
      >
        <div className="grid gap-5 md:grid-cols-4">
          <InfoCard title="1. Contacto">
            Escribinos con el detalle de la compra y el motivo del cambio o devolución.
          </InfoCard>
          <InfoCard title="2. Revisión">
            Evaluamos la solicitud y verificamos las condiciones del producto.
          </InfoCard>
          <InfoCard title="3. Coordinación">
            Te indicamos si corresponde acercarlo, enviarlo o coordinar otra alternativa.
          </InfoCard>
          <InfoCard title="4. Resolución">
            Una vez recibido y revisado, se procesa el cambio o la devolución acordada.
          </InfoCard>
        </div>
      </BymInstitutionalSection>

      <BymInstitutionalSection
        eyebrow="Recomendaciones"
        icon={<Sparkles className="h-9 w-9" />}
        title="Antes de iniciar la solicitud"
      >
        <InfoCard title="Datos útiles">
          <CheckList
            items={[
              "Número de pedido o comprobante.",
              "Fotos del producto y del embalaje si hubo inconvenientes en la entrega.",
              "Medio de contacto para coordinar la resolución.",
              "Detalle claro del motivo de la solicitud.",
            ]}
          />
        </InfoCard>
      </BymInstitutionalSection>
    </>
  );
}

export function BymInstitutionalPage({ data, pathname, title }: BymInstitutionalPageProps) {
  const content = {
    "/sobre-nosotros": {
      description:
        "Una empresa familiar dedicada a neumáticos, lubricentro, gomería, mecánica y soluciones para que cada cliente compre y mantenga su vehículo con confianza.",
      eyebrow: "BYM SRL",
      node: <SobreNosotrosContent />,
      title: "Más de 25 años atendiendo vehículos",
    },
    "/envios-y-entregas": {
      description:
        "Coordinamos envíos, despachos y retiros para que cada compra llegue con información clara y seguimiento.",
      eyebrow: "Logística",
      node: <EnviosContent data={data} />,
      title,
    },
    "/cambios-y-devoluciones": {
      description:
        "Te acompañamos en la revisión de cada solicitud para resolver cambios o devoluciones con un proceso claro.",
      eyebrow: "Postventa",
      node: <ReturnsContent />,
      title,
    },
  } satisfies Record<BymInstitutionalPath, {
    description: string;
    eyebrow: string;
    node: ReactNode;
    title: string;
  }>;

  const page = content[pathname];

  return (
    <div data-bym-fullbleed="true" className="bg-[#070707] text-white">
      <BymInstitutionalHero
        data={data}
        description={page.description}
        eyebrow={page.eyebrow}
        title={page.title}
      />
      {page.node}
    </div>
  );
}
