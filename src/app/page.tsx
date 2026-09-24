import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Programs } from "@/components/landing/programs";
import { Features } from "@/components/landing/features";
import { Materi } from "@/components/landing/materi";
import { CtaBanner } from "@/components/landing/cta-banner";
import { Footer } from "@/components/landing/footer";
import { FloatingWhatsApp } from "@/components/landing/floating-whatsapp";
import { AdminDialog } from "@/components/admin/admin-dialog";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Programs />
        <Features />
        <Materi />
        <CtaBanner />
      </main>
      <Footer />
      <FloatingWhatsApp />
      <AdminDialog />
    </div>
  );
}
