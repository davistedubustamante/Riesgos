import { Navigation } from '@/components/landing/navigation';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesSection } from '@/components/landing/features-section';
import { HowItWorksSection } from '@/components/landing/how-it-works-section';
import { MetricsSection } from '@/components/landing/metrics-section';
import { IntegrationsSection } from '@/components/landing/integrations-section';
import { SecuritySection } from '@/components/landing/security-section';
import { TestimonialsSection } from '@/components/landing/testimonials-section';
import { CaseStudySection } from '@/components/landing/case-study-section';
import { CtaSection } from '@/components/landing/cta-section';
import { FooterSection } from '@/components/landing/footer-section';

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-x-hidden" style={{ background: '#070910' }}>
      <Navigation />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <MetricsSection />
      <IntegrationsSection />
      <SecuritySection />
      <TestimonialsSection />
      <CaseStudySection />
      <CtaSection />
      <FooterSection />
    </main>
  );
}
