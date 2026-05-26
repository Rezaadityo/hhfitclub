import AboutSection from "../components/AboutSection.jsx";
import CTABanner from "../components/CTABanner.jsx";
import HeroSection from "../components/HeroSection.jsx";
import ProductsPreview from "../components/ProductsPreview.jsx";
import ServicesSection from "../components/ServicesSection.jsx";
import TestimonialsSection from "../components/TestimonialsSection.jsx";

export default function Home() {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProductsPreview />
      <ServicesSection />
      <TestimonialsSection />
      <CTABanner />
    </>
  );
}
