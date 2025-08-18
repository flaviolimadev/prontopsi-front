import React from "react";
import { InfiniteMovingCards } from "@/components/ui/infinite-moving-cards";

export default function InfiniteMovingCardsDemo() {
  return (
    <div className="h-[16rem] rounded-md flex flex-col antialiased items-center justify-center relative overflow-hidden">
      <InfiniteMovingCards items={testimonials} direction="right" speed="slow" />
    </div>
  );
}

const testimonials = [
  {
    quote:
      "O ProntuPsi transformou completamente minha rotina como psicóloga. Hoje consigo organizar atendimentos, prontuários e finanças em minutos. Me deu paz para focar no que realmente importa: meus pacientes.",
    name: "Dra. Ana Beatriz Lima",
    title: "Psicóloga Clínica - CRP 06/123456",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote:
      "A plataforma é extremamente intuitiva e segura. Tive facilidade em migrar dos meus antigos arquivos e planilhas, e hoje tudo está no lugar certo, com acesso rápido e protegido.",
    name: "Carlos Mendes",
    title: "Psicoterapeuta Integrativo",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  },
  {
    quote:
      "Economizei mais de 10 horas por semana com os recursos de automação. Os relatórios e recibos prontos me ajudaram até a regularizar pendências com meu contador.",
    name: "Marina Oliveira",
    title: "Terapeuta Cognitivo-Comportamental",
    rating: 5,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
  },
];


