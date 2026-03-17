import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const municipios = await prisma.municipio.findMany({
    where: { ativa: true },
    select: { estado: true, slug: true, updatedAt: true },
  });

  const cidades: MetadataRoute.Sitemap = municipios.map((m) => ({
    url: `https://solardados.com.br/energia-solar/${m.estado.toLowerCase()}/${m.slug}`,
    lastModified: m.updatedAt,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: "https://solardados.com.br",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1.0,
    },
    ...cidades,
  ];
}
